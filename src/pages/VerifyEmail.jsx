import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { account } from "../lib/appwrite";

const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [statusMessage, setStatusMessage] = useState("Verifying your email...");
  const [loading, setLoading] = useState(true);

  // Get userId & secret from URL query
  const userId = searchParams.get("userId");
  const secret = searchParams.get("secret");

  useEffect(() => {
    let isMounted = true;

    const verifyEmail = async () => {
      try {
        // Appwrite v20 expects userId + secret
        await account.updateVerification(userId, secret);
        if (isMounted) {
          setStatusMessage("✅ Email verified successfully! Redirecting to login...");
          setLoading(false);
          setTimeout(() => navigate("/login"), 3000);
        }
      } catch (err) {
        if (isMounted) {
          setStatusMessage(
            "❌ Verification failed: " + (err.message || "Invalid or expired link.")
          );
          setLoading(false);
        }
      }
    };

    if (userId && secret) {
      verifyEmail();
    } else {
      setStatusMessage("❌ Invalid verification link.");
      setLoading(false);
    }

    return () => {
      isMounted = false;
    };
  }, [userId, secret, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
      <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-md text-center max-w-md w-full">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          Email Verification
        </h1>

        {loading && (
          <div className="flex justify-center mb-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 dark:border-indigo-400"></div>
          </div>
        )}

        <p className={`text-gray-700 dark:text-gray-300 ${loading ? "mt-2" : ""}`}>
          {statusMessage}
        </p>
      </div>
    </div>
  );
};

export default VerifyEmail;
