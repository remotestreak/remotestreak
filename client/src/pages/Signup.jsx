import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export default function Signup() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [selectedPlan, setSelectedPlan] = useState("");
  const [form, setForm] = useState({ full_name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const plans = [
    {
      id: "streak_starter",
      name: "Streak Starter",
      price: "$12/mo",
      features: [
        "40 applications/month",
        "2 cold outreach/day",
        "Agent Strength Score",
      ],
    },
    {
      id: "streak_core",
      name: "Streak Core",
      price: "$25/mo",
      popular: true,
      features: [
        "120 applications/month",
        "3 cold outreach/day",
        "Full Agent Vault",
        "Reply tracking",
      ],
    },
  ];

  const handleSignup = async () => {
    if (!form.full_name || !form.email || !form.password) {
      return setError("Please fill in all fields");
    }
    if (form.password.length < 6) {
      return setError("Password must be at least 6 characters");
    }
    setLoading(true);
    setError("");
    try {
      await axios.post("/api/auth/signup", form);
      const loginRes = await axios.post("/api/auth/login", {
        email: form.email,
        password: form.password,
      });
      localStorage.setItem(
        "remotestreak_token",
        loginRes.data.session.access_token,
      );
      localStorage.setItem(
        "remotestreak_user",
        JSON.stringify(loginRes.data.user),
      );
      setStep(3);
    } catch (err) {
      setError(err.response?.data?.error || "Signup failed");
    }
    setLoading(false);
  };

  const handlePayment = async () => {
    if (!selectedPlan) return setError("Please select a plan");
    setLoading(true);
    setError("");
    try {
      const token = localStorage.getItem("remotestreak_token");
      const res = await axios.post(
        "/api/paystack/initialize",
        { plan: selectedPlan },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      window.location.href = res.data.authorization_url;
    } catch (err) {
      setError(err.response?.data?.error || "Payment initialization failed");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#0A0F1E] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <div
            className="inline-flex items-center gap-2 mb-6 cursor-pointer"
            onClick={() => navigate("/")}
          >
            <div className="w-8 h-8 bg-[#00E5A0] rounded-lg flex items-center justify-center">
              <span className="text-[#0A0F1E] font-bold text-sm font-mono">
                RS
              </span>
            </div>
            <span className="font-syne font-bold text-xl">RemoteStreak</span>
          </div>
          <div className="flex items-center justify-center gap-2 mb-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-2">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-mono ${
                    step >= i
                      ? "bg-[#00E5A0] text-[#0A0F1E] font-bold"
                      : "bg-[#1E293B] text-[#8A9BB0]"
                  }`}
                >
                  {i}
                </div>
                {i < 3 && (
                  <div
                    className={`w-8 h-0.5 ${step > i ? "bg-[#00E5A0]" : "bg-[#1E293B]"}`}
                  ></div>
                )}
              </div>
            ))}
          </div>
          <h1 className="font-syne font-bold text-3xl mb-2">
            {step === 1
              ? "Choose your plan"
              : step === 2
                ? "Create your account"
                : "Complete payment"}
          </h1>
          <p className="text-[#8A9BB0]">
            {step === 1
              ? "Start your remote job streak today"
              : step === 2
                ? "Your agent is almost ready"
                : "Activate your agent"}
          </p>
        </div>

        {error && (
          <div className="bg-red-900 bg-opacity-30 border border-red-500 border-opacity-30 rounded-lg p-3 mb-6">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        {step === 1 && (
          <div className="space-y-4">
            {plans.map((plan) => (
              <div
                key={plan.id}
                onClick={() => setSelectedPlan(plan.id)}
                className={`bg-[#111827] border rounded-2xl p-6 cursor-pointer transition-all ${
                  selectedPlan === plan.id
                    ? "border-[#00E5A0]"
                    : "border-[#1E293B] hover:border-[#8A9BB0]"
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div>
                    {plan.popular && (
                      <span className="text-[#00E5A0] text-xs font-mono block mb-1">
                        MOST POPULAR
                      </span>
                    )}
                    <h3 className="font-syne font-bold text-lg">{plan.name}</h3>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-syne font-bold text-2xl text-[#00E5A0]">
                      {plan.price}
                    </span>
                    <div
                      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                        selectedPlan === plan.id
                          ? "border-[#00E5A0] bg-[#00E5A0]"
                          : "border-[#8A9BB0]"
                      }`}
                    >
                      {selectedPlan === plan.id && (
                        <span className="text-[#0A0F1E] text-xs font-bold">
                          ✓
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  {plan.features.map((f, i) => (
                    <span
                      key={i}
                      className="text-xs text-[#8A9BB0] bg-[#1E293B] px-2 py-1 rounded-lg"
                    >
                      {f}
                    </span>
                  ))}
                </div>
              </div>
            ))}
            <button
              onClick={() => {
                if (!selectedPlan) return setError("Please select a plan");
                setError("");
                setStep(2);
              }}
              className="w-full bg-[#00E5A0] text-[#0A0F1E] py-4 rounded-xl font-semibold text-lg hover:bg-opacity-90 transition-all mt-2"
            >
              Continue →
            </button>
            <p className="text-center text-[#8A9BB0] text-xs">
              Already have an account?{" "}
              <span
                onClick={() => navigate("/login")}
                className="text-[#00E5A0] cursor-pointer hover:underline"
              >
                Login
              </span>
            </p>
          </div>
        )}

        {step === 2 && (
          <div className="bg-[#111827] border border-[#1E293B] rounded-2xl p-8">
            <div className="space-y-4">
              <div>
                <label className="text-sm text-[#8A9BB0] mb-2 block">
                  Full Name
                </label>
                <input
                  type="text"
                  value={form.full_name}
                  onChange={(e) =>
                    setForm({ ...form, full_name: e.target.value })
                  }
                  className="w-full bg-[#0A0F1E] border border-[#1E293B] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#00E5A0] transition-colors"
                  placeholder="Your full name"
                />
              </div>
              <div>
                <label className="text-sm text-[#8A9BB0] mb-2 block">
                  Email
                </label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full bg-[#0A0F1E] border border-[#1E293B] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#00E5A0] transition-colors"
                  placeholder="you@example.com"
                />
              </div>
              <div>
                <label className="text-sm text-[#8A9BB0] mb-2 block">
                  Password
                </label>
                <input
                  type="password"
                  value={form.password}
                  onChange={(e) =>
                    setForm({ ...form, password: e.target.value })
                  }
                  className="w-full bg-[#0A0F1E] border border-[#1E293B] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#00E5A0] transition-colors"
                  placeholder="Min 6 characters"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setStep(1)}
                  className="flex-1 border border-[#1E293B] text-[#8A9BB0] py-3 rounded-xl font-semibold hover:border-[#00E5A0] transition-all"
                >
                  ← Back
                </button>
                <button
                  onClick={handleSignup}
                  disabled={loading}
                  className="flex-grow bg-[#00E5A0] text-[#0A0F1E] py-3 rounded-xl font-semibold hover:bg-opacity-90 transition-all disabled:opacity-50"
                >
                  {loading ? "Creating..." : "Create Account →"}
                </button>
              </div>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="bg-[#111827] border border-[#1E293B] rounded-2xl p-8 text-center">
            <div className="w-16 h-16 bg-[#1E293B] rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-3xl">🚀</span>
            </div>
            <h2 className="font-syne font-bold text-2xl mb-2">
              Account created
            </h2>
            <p className="text-[#8A9BB0] mb-6">
              One last step — activate your agent with payment
            </p>
            <div className="bg-[#0A0F1E] rounded-xl p-4 mb-6 text-left">
              <div className="flex justify-between items-center">
                <span className="text-[#8A9BB0] text-sm">Selected plan</span>
                <span className="text-[#00E5A0] font-mono text-sm">
                  {selectedPlan === "streak_starter"
                    ? "Streak Starter — $12/mo"
                    : "Streak Core — $25/mo"}
                </span>
              </div>
            </div>
            <button
              onClick={handlePayment}
              disabled={loading}
              className="w-full bg-[#00E5A0] text-[#0A0F1E] py-4 rounded-xl font-semibold text-lg hover:bg-opacity-90 transition-all disabled:opacity-50"
            >
              {loading ? "Redirecting to payment..." : "Pay and Launch Agent →"}
            </button>
            <p className="text-[#8A9BB0] text-xs mt-4">
              Secured by Paystack · Cancel anytime
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
