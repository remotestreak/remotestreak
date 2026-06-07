import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import axios from "axios";

export default function PaymentSuccess() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState("verifying");
  const [plan, setPlan] = useState("");

  useEffect(() => {
    const reference = searchParams.get("reference");
    const token = localStorage.getItem("remotestreak_token");

    if (!reference || !token) {
      navigate("/signup");
      return;
    }

    axios
      .get(`/api/paystack/verify/${reference}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        setPlan(res.data.plan);
        setStatus("success");
        setTimeout(() => navigate("/onboarding"), 3000);
      })
      .catch(() => {
        setStatus("failed");
      });
  }, []);

  return (
    <div className="min-h-screen bg-[#0A0F1E] flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        {status === "verifying" && (
          <>
            <div className="w-16 h-16 border-2 border-[#00E5A0] border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
            <h1 className="font-syne font-bold text-2xl mb-2">
              Verifying payment...
            </h1>
            <p className="text-[#8A9BB0]">
              Please wait while we confirm your subscription
            </p>
          </>
        )}
        {status === "success" && (
          <>
            <div className="w-16 h-16 bg-[#00E5A0] rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-[#0A0F1E] text-2xl font-bold">✓</span>
            </div>
            <h1 className="font-syne font-bold text-3xl mb-2">
              Payment confirmed
            </h1>
            <p className="text-[#8A9BB0] mb-4">
              Welcome to RemoteStreak — your agent is ready to be built
            </p>
            <div className="bg-[#111827] border border-[#1E293B] rounded-xl p-4 mb-6">
              <p className="text-[#00E5A0] font-mono text-sm">
                {plan === "streak_starter"
                  ? "Streak Starter — $12/month"
                  : plan === "streak_core"
                    ? "Streak Core — $25/month"
                    : "Streak Pro — $45/month"}
              </p>
            </div>
            <p className="text-[#8A9BB0] text-sm">
              Redirecting to onboarding...
            </p>
          </>
        )}
        {status === "failed" && (
          <>
            <div className="w-16 h-16 bg-red-900 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-red-400 text-2xl">✕</span>
            </div>
            <h1 className="font-syne font-bold text-2xl mb-2">
              Payment failed
            </h1>
            <p className="text-[#8A9BB0] mb-6">
              Something went wrong verifying your payment
            </p>
            <button
              onClick={() => navigate("/signup")}
              className="bg-[#00E5A0] text-[#0A0F1E] px-6 py-3 rounded-xl font-semibold"
            >
              Try Again
            </button>
          </>
        )}
      </div>
    </div>
  );
}
