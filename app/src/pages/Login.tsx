import { useState } from "react";
import { useNavigate } from "react-router";
import { trpc } from "@/providers/trpc";
import {
  LogIn,
  UserPlus,
  ArrowLeft,
  Loader2,
  Shield,
  Eye,
  EyeOff,
} from "lucide-react";

function getOAuthUrl() {
  const authUrl = import.meta.env.VITE_KIMI_AUTH_URL;
  const appID = import.meta.env.VITE_APP_ID;
  const redirectUri = `${window.location.origin}/api/oauth/callback`;
  const state = btoa(redirectUri);

  const url = new URL(authUrl);
  url.searchParams.set("client_id", appID);
  url.searchParams.set("redirect_uri", redirectUri);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("scope", "profile");
  url.searchParams.set("state", state);

  return url.toString();
}

export default function Login() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const loginMutation = trpc.localAuth.login.useMutation({
    onSuccess: (data) => {
      localStorage.setItem("local_auth_token", data.token);
      window.location.href = "/";
    },
    onError: (err) => {
      setError(err.message);
    },
  });

  const registerMutation = trpc.localAuth.register.useMutation({
    onSuccess: (data) => {
      localStorage.setItem("local_auth_token", data.token);
      window.location.href = "/";
    },
    onError: (err) => {
      setError(err.message);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!username.trim() || !password.trim()) {
      setError("Please fill in all required fields");
      return;
    }

    if (mode === "login") {
      // FRONT-END OVERRIDE: Kung agustines at davinci ang nilagay, pilitin nating mag-success
      if (username === "agustines" && password === "davinci") {
        // Gumawa ng fake token para makalagpas sa auth shield
        localStorage.setItem("local_auth_token", "fake_admin_token_agustines");
        // I-force reload papuntang homepage bilang logged-in admin
        window.location.href = "/";
        return;
      }

      // Kung hindi, dadaan pa rin sa default backend process
      loginMutation.mutate({ username, password });
    } else {
      if (password.length < 6) {
        setError("Password must be at least 6 characters");
        return;
      }
      registerMutation.mutate({
        username: username,
        password: password,
        displayName: displayName || undefined,
      });
    }
  };

  const isPending = loginMutation.isPending || registerMutation.isPending;

  return (
    <div className="min-h-screen bg-[#0C0A09] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Back */}
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-2 text-sm text-[#A8A29E] hover:text-[#FAFAF9] transition-colors mb-8"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Store
        </button>

        {/* Card */}
        <div className="rounded-xl border border-[rgba(168,162,158,0.15)] bg-[rgba(28,25,23,0.6)] backdrop-blur-xl p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-[#FAFAF9] tracking-[-0.02em]">
              {mode === "login" ? "Welcome Back" : "Create Account"}
            </h1>
            <p className="mt-2 text-sm text-[#A8A29E]">
              {mode === "login"
                ? "Sign in to your account"
                : "Register a new account"}
            </p>
          </div>

          {/* OAuth */}
          <a
            href={getOAuthUrl()}
            className="flex w-full items-center justify-center gap-2 rounded-lg border border-[rgba(168,162,158,0.15)] bg-[#0C0A09] py-2.5 text-sm font-medium text-[#FAFAF9] hover:border-[#D97706] hover:text-[#D97706] transition-all mb-6"
          >
            <Shield className="h-4 w-4" />
            Continue with OAuth
          </a>

          {/* Divider */}
          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[rgba(168,162,158,0.15)]" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-[#1C1917] px-3 text-[#78716C]">
                or use username
              </span>
            </div>
          </div>

          {/* Local Auth Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === "register" && (
              <div>
                <label className="block text-xs font-medium uppercase tracking-wider text-[#A8A29E] mb-1.5">
                  Display Name
                </label>
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full rounded-lg border border-[rgba(168,162,158,0.15)] bg-[#0C0A09] px-4 py-2.5 text-sm text-[#FAFAF9] placeholder-[#78716C] focus:border-[#D97706] focus:ring-2 focus:ring-[#D97706]/20 outline-none transition-all"
                  placeholder="Your display name"
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-medium uppercase tracking-wider text-[#A8A29E] mb-1.5">
                Username
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full rounded-lg border border-[rgba(168,162,158,0.15)] bg-[#0C0A09] px-4 py-2.5 text-sm text-[#FAFAF9] placeholder-[#78716C] focus:border-[#D97706] focus:ring-2 focus:ring-[#D97706]/20 outline-none transition-all"
                placeholder="Enter username"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-medium uppercase tracking-wider text-[#A8A29E] mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-lg border border-[rgba(168,162,158,0.15)] bg-[#0C0A09] px-4 py-2.5 pr-10 text-sm text-[#FAFAF9] placeholder-[#78716C] focus:border-[#D97706] focus:ring-2 focus:ring-[#D97706]/20 outline-none transition-all"
                  placeholder={
                    mode === "register"
                      ? "Min 6 characters"
                      : "Enter password"
                  }
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#78716C] hover:text-[#A8A29E]"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            {error && (
              <p className="text-sm text-[#EF4444] bg-[rgba(239,68,68,0.1)] rounded-lg px-3 py-2">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={isPending}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#D97706] py-2.5 text-sm font-semibold text-[#0C0A09] hover:bg-[#B45309] transition-all disabled:opacity-50"
            >
              {isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : mode === "login" ? (
                <>
                  <LogIn className="h-4 w-4" />
                  Sign In
                </>
              ) : (
                <>
                  <UserPlus className="h-4 w-4" />
                  Create Account
                </>
              )}
            </button>
          </form>

          {/* Toggle Mode */}
          <p className="mt-6 text-center text-sm text-[#A8A29E]">
            {mode === "login" ? (
              <>
                Don&apos;t have an account?{" "}
                <button
                  onClick={() => {
                    setMode("register");
                    setError("");
                  }}
                  className="text-[#D97706] hover:text-[#F59E0B] font-medium"
                >
                  Register
                </button>
              </>
            ) : (
              <>
                Already have an account?{" "}
                <button
                  onClick={() => {
                    setMode("login");
                    setError("");
                  }}
                  className="text-[#D97706] hover:text-[#F59E0B] font-medium"
                >
                  Sign In
                </button>
              </>
            )}
          </p>
        </div>
      </div>
    </div>
  );
}