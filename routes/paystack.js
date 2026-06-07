const express = require("express");
const router = express.Router();
const supabase = require("../supabaseClient");
const https = require("https");

const PAYSTACK_SECRET = process.env.PAYSTACK_SECRET_KEY;

const PLANS = {
  streak_starter: {
    name: "Streak Starter",
    amount: 12,
    credits: 40,
    cold_outreach_daily: 2,
  },
  streak_core: {
    name: "Streak Core",
    amount: 25,
    credits: 120,
    cold_outreach_daily: 3,
  },
  streak_pro: {
    name: "Streak Pro",
    amount: 45,
    credits: 400,
    cold_outreach_daily: 5,
  },
};

const verifyToken = async (req, res, next) => {
  const token = req.headers.authorization?.replace("Bearer ", "");
  if (!token) return res.status(401).json({ error: "Unauthorized" });
  const { data, error } = await supabase.auth.getUser(token);
  if (error) return res.status(401).json({ error: "Invalid token" });
  req.user = data.user;
  next();
};

router.post("/initialize", verifyToken, async (req, res) => {
  const { plan } = req.body;
  if (!PLANS[plan]) {
    return res.status(400).json({ error: "Invalid plan selected" });
  }
  const planConfig = PLANS[plan];
  const { data: profile } = await supabase
    .from("users")
    .select("email, full_name")
    .eq("id", req.user.id)
    .single();

  const params = JSON.stringify({
    email: profile.email,
    amount: planConfig.amount * 100,
    currency: "USD",
    metadata: {
      user_id: req.user.id,
      plan: plan,
      full_name: profile.full_name,
    },
    callback_url: `${process.env.APP_URL}/payment/success`,
    channels: ["card"],
  });

  const options = {
    hostname: "api.paystack.co",
    port: 443,
    path: "/transaction/initialize",
    method: "POST",
    headers: {
      Authorization: `Bearer ${PAYSTACK_SECRET}`,
      "Content-Type": "application/json",
    },
  };

  const paystackReq = https.request(options, (paystackRes) => {
    let data = "";
    paystackRes.on("data", (chunk) => (data += chunk));
    paystackRes.on("end", () => {
      const response = JSON.parse(data);
      if (response.status) {
        res.json({
          authorization_url: response.data.authorization_url,
          reference: response.data.reference,
        });
      } else {
        res.status(400).json({ error: response.message });
      }
    });
  });

  paystackReq.on("error", (err) =>
    res.status(500).json({ error: err.message }),
  );
  paystackReq.write(params);
  paystackReq.end();
});

router.get("/verify/:reference", verifyToken, async (req, res) => {
  const { reference } = req.params;

  const options = {
    hostname: "api.paystack.co",
    port: 443,
    path: `/transaction/verify/${reference}`,
    method: "GET",
    headers: {
      Authorization: `Bearer ${PAYSTACK_SECRET}`,
    },
  };

  const paystackReq = https.request(options, (paystackRes) => {
    let data = "";
    paystackRes.on("data", (chunk) => (data += chunk));
    paystackRes.on("end", async () => {
      const response = JSON.parse(data);
      if (response.status && response.data.status === "success") {
        const metadata = response.data.metadata;
        const plan = metadata.plan;
        const planConfig = PLANS[plan];
        const userId = metadata.user_id;
        const resetDate = new Date();
        resetDate.setMonth(resetDate.getMonth() + 1);

        await supabase
          .from("users")
          .update({
            tier: plan,
            subscription_status: "active",
            credit_balance: planConfig.credits,
            monthly_reset_date: resetDate.toISOString(),
            paystack_customer_id: response.data.customer.id.toString(),
          })
          .eq("id", userId);

        await supabase.from("streak_counters").upsert({
          user_id: userId,
          current_streak: 0,
          longest_streak: 0,
          streak_paused: false,
        });

        res.json({
          success: true,
          plan: plan,
          credits: planConfig.credits,
          message: "Payment successful — welcome to RemoteStreak",
        });
      } else {
        res.status(400).json({ error: "Payment verification failed" });
      }
    });
  });

  paystackReq.on("error", (err) =>
    res.status(500).json({ error: err.message }),
  );
  paystackReq.end();
});

router.post(
  "/webhook",
  express.raw({ type: "application/json" }),
  async (req, res) => {
    const crypto = require("crypto");
    const hash = crypto
      .createHmac("sha512", PAYSTACK_SECRET)
      .update(JSON.stringify(req.body))
      .digest("hex");

    if (hash !== req.headers["x-paystack-signature"]) {
      return res.status(401).send("Invalid signature");
    }

    const event = req.body;

    if (event.event === "charge.success") {
      const metadata = event.data.metadata;
      const plan = metadata.plan;
      const planConfig = PLANS[plan];
      const userId = metadata.user_id;

      if (userId && planConfig) {
        const resetDate = new Date();
        resetDate.setMonth(resetDate.getMonth() + 1);

        await supabase
          .from("users")
          .update({
            tier: plan,
            subscription_status: "active",
            credit_balance: planConfig.credits,
            monthly_reset_date: resetDate.toISOString(),
          })
          .eq("id", userId);
      }
    }

    res.sendStatus(200);
  },
);

router.post("/topup", verifyToken, async (req, res) => {
  const { credits } = req.body;

  const { data: profile } = await supabase
    .from("users")
    .select("email, tier")
    .eq("id", req.user.id)
    .single();

  const rates = {
    streak_starter: 0.25,
    streak_core: 0.18,
    streak_pro: 0.12,
  };

  const rate = rates[profile.tier] || 0.25;
  const amount = Math.round(credits * rate);

  const params = JSON.stringify({
    email: profile.email,
    amount: amount * 100,
    currency: "USD",
    metadata: {
      user_id: req.user.id,
      type: "topup",
      credits: credits,
    },
    callback_url: `${process.env.APP_URL}/dashboard?topup=success`,
    channels: ["card"],
  });

  const options = {
    hostname: "api.paystack.co",
    port: 443,
    path: "/transaction/initialize",
    method: "POST",
    headers: {
      Authorization: `Bearer ${PAYSTACK_SECRET}`,
      "Content-Type": "application/json",
    },
  };

  const paystackReq = https.request(options, (paystackRes) => {
    let data = "";
    paystackRes.on("data", (chunk) => (data += chunk));
    paystackRes.on("end", () => {
      const response = JSON.parse(data);
      if (response.status) {
        res.json({ authorization_url: response.data.authorization_url });
      } else {
        res.status(400).json({ error: response.message });
      }
    });
  });

  paystackReq.on("error", (err) =>
    res.status(500).json({ error: err.message }),
  );
  paystackReq.write(params);
  paystackReq.end();
});

module.exports = router;
