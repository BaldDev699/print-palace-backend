import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate, Link } from "@/lib/router-compat";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
  Loader2,
  Mail,
  Lock,
  User,
  Eye,
  EyeOff,
  ArrowLeft,
  CheckCircle2,
  MailCheck,
} from "lucide-react";

type Mode = "login" | "signup" | "forgot";

/* ---------- Left panel text: edit these freely ---------- */
const panel = {
  headline: "Turn your ideas into",
  highlight: " real products.",
  subtitle:
    "Join the creative community and get your custom prints made by trusted manufacturers.",
  perks: [
    "Design custom apparel right in your browser",
    "Get matched with verified manufacturers",
    "Track every order from review to delivery",
  ],
};

/* Input with a left icon, optional right slot, and optional action next to the label */
type FieldProps = Omit<React.InputHTMLAttributes<HTMLInputElement>, "id"> & {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  right?: React.ReactNode;
  labelAction?: React.ReactNode;
};

const Field: React.FC<FieldProps> = ({ label, icon: Icon, right, labelAction, id, ...props }) => (
  <div className="space-y-1.5">
    <div className="flex items-center justify-between">
      <Label htmlFor={id} className="text-sm">
        {label}
      </Label>
      {labelAction}
    </div>
    <div className="relative">
      <Icon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <Input id={id} className={cn("h-11 rounded-xl pl-10", right && "pr-11")} {...props} />
      {right && <div className="absolute right-1.5 top-1/2 -translate-y-1/2">{right}</div>}
    </div>
  </div>
);

const AuthPage = () => {
  const [mode, setMode] = useState<Mode>("login");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [loginForm, setLoginForm] = useState({ email: "", password: "" });
  const [signupForm, setSignupForm] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    fullName: "",
  });
  const navigate = useNavigate();

  // Send the user where they were headed (manufacturers flow) or home
  const redirectAfterAuth = () => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("redirect") === "manufacturers" && params.get("from") === "manufacturers") {
      navigate("/manufacturers?from=auth");
    } else {
      navigate("/");
    }
  };

  // Already signed in? Skip this page.
  useEffect(() => {
    const checkUser = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session) redirectAfterAuth();
    };
    checkUser();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // /auth?mode=signup or /auth?mode=forgot opens that form directly
  useEffect(() => {
    const m = new URLSearchParams(window.location.search).get("mode");
    if (m === "signup" || m === "forgot") setMode(m);
  }, []);

  const switchMode = (next: Mode) => {
    setMode(next);
    setShowPassword(false);
    setResetSent(false);
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo: window.location.origin },
      });
      if (error) {
        toast.error(error.message);
        setIsLoading(false);
      }
    } catch {
      toast.error("Could not sign in with Google.");
      setIsLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: loginForm.email,
        password: loginForm.password,
      });

      if (error) {
        toast.error(
          error.message.includes("Invalid login credentials")
            ? "Invalid email or password. Please try again."
            : error.message,
        );
        return;
      }

      if (data.user) {
        toast.success("Welcome back!");
        redirectAfterAuth();
      }
    } catch {
      toast.error("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();

    if (signupForm.password !== signupForm.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    if (signupForm.password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email: signupForm.email,
        password: signupForm.password,
        options: { data: { full_name: signupForm.fullName } },
      });

      if (error) {
        toast.error(
          error.message.includes("User already registered")
            ? "This email is already registered. Please log in instead."
            : error.message,
        );
        return;
      }

      if (data.user) {
        if (data.session) {
          toast.success("Account created! You can now start designing.");
          redirectAfterAuth();
        } else {
          toast.success("Account created! Check your email to confirm your account.");
          switchMode("login");
        }
      }
    } catch {
      toast.error("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgot = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(forgotEmail.trim(), {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) {
        toast.error(error.message);
        return;
      }
      setResetSent(true);
    } catch {
      toast.error("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const passwordToggle = (
    <button
      type="button"
      onClick={() => setShowPassword((s) => !s)}
      aria-label={showPassword ? "Hide password" : "Show password"}
      className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:text-foreground"
    >
      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
    </button>
  );

  const passwordType = showPassword ? "text" : "password";

  const titles: Record<Mode, { title: string; subtitle: string }> = {
    login: {
      title: "Welcome back",
      subtitle: "Sign in to access your saved designs and orders.",
    },
    signup: {
      title: "Create your account",
      subtitle: "Join roge to save your designs and place orders.",
    },
    forgot: {
      title: "Reset your password",
      subtitle: "Enter your email and we'll send you a link to choose a new password.",
    },
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-background">
      {/* LEFT: brand panel (desktop only) */}
      <aside className="relative hidden lg:flex flex-col justify-between overflow-hidden bg-neutral-950 p-12 text-white">
        {/* Glow follows your --primary color automatically */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_15%,color-mix(in_srgb,var(--primary)_35%,transparent),transparent_50%)]" />
        <div className="absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-primary/20 blur-3xl" />

        <Link to="/" className="relative text-3xl font-bold">
          roge<span className="text-primary">.</span>
        </Link>

        <div className="relative max-w-md">
          <h2 className="text-4xl font-bold leading-[1.15]">
            {panel.headline}
            <span className="text-primary">{panel.highlight}</span>
          </h2>
          <p className="mt-4 text-white/70">{panel.subtitle}</p>

          <ul className="mt-8 space-y-4">
            {panel.perks.map((perk) => (
              <li key={perk} className="flex items-start gap-3 text-sm text-white/80">
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                {perk}
              </li>
            ))}
          </ul>
        </div>

        <p className="relative text-xs text-white/40">
          &copy; {new Date().getFullYear()} roge. All rights reserved.
        </p>
      </aside>

      {/* RIGHT: form */}
      <main className="flex flex-col px-4 py-6 sm:px-8">
        <div className="flex items-center justify-between">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to home
          </Link>
          <Link to="/" className="text-2xl font-bold lg:hidden">
            roge<span className="text-primary">.</span>
          </Link>
        </div>

        <div className="flex flex-1 items-center justify-center py-8">
          <div className="w-full max-w-md">
            <h1 className="text-3xl font-bold tracking-tight">{titles[mode].title}</h1>
            <p className="mt-2 text-muted-foreground">{titles[mode].subtitle}</p>

            {/* Mode toggle + Google (hidden on the forgot screen) */}
            {mode !== "forgot" && (
              <>
                <div className="mt-6 grid grid-cols-2 rounded-xl bg-muted p-1">
                  {(["login", "signup"] as const).map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => switchMode(m)}
                      className={cn(
                        "rounded-lg py-2 text-sm font-medium transition-all",
                        mode === m
                          ? "bg-background text-foreground shadow-sm"
                          : "text-muted-foreground hover:text-foreground",
                      )}
                    >
                      {m === "login" ? "Log in" : "Sign up"}
                    </button>
                  ))}
                </div>

                <Button
                  type="button"
                  variant="outline"
                  className="mt-6 h-11 w-full gap-2 rounded-xl"
                  onClick={handleGoogleSignIn}
                  disabled={isLoading}
                >
                  <svg className="h-4 w-4" viewBox="0 0 24 24" aria-hidden="true">
                    <path
                      fill="#EA4335"
                      d="M12 10.2v3.9h5.5c-.24 1.4-1.66 4.1-5.5 4.1-3.3 0-6-2.7-6-6.1s2.7-6.1 6-6.1c1.9 0 3.2.8 3.9 1.5l2.7-2.6C16.8 3 14.6 2 12 2 6.9 2 2.8 6.1 2.8 11.2S6.9 20.4 12 20.4c6 0 9.5-4.2 9.5-9.1 0-.6-.07-1.1-.16-1.6H12z"
                    />
                  </svg>
                  Continue with Google
                </Button>

                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-3 text-muted-foreground">
                      or continue with email
                    </span>
                  </div>
                </div>
              </>
            )}

            {/* LOGIN */}
            {mode === "login" && (
              <form onSubmit={handleLogin} className="space-y-4">
                <Field
                  id="login-email"
                  label="Email"
                  icon={Mail}
                  type="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  value={loginForm.email}
                  onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                  required
                />
                <Field
                  id="login-password"
                  label="Password"
                  icon={Lock}
                  type={passwordType}
                  autoComplete="current-password"
                  placeholder="Enter your password"
                  value={loginForm.password}
                  onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                  right={passwordToggle}
                  labelAction={
                    <button
                      type="button"
                      onClick={() => {
                        setForgotEmail(loginForm.email);
                        switchMode("forgot");
                      }}
                      className="text-xs font-medium text-primary hover:underline"
                    >
                      Forgot password?
                    </button>
                  }
                  required
                />

                <Button type="submit" className="h-11 w-full rounded-xl" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Signing in...
                    </>
                  ) : (
                    "Sign in"
                  )}
                </Button>
              </form>
            )}

            {/* SIGN UP */}
            {mode === "signup" && (
              <form onSubmit={handleSignup} className="space-y-4">
                <Field
                  id="signup-name"
                  label="Full name"
                  icon={User}
                  type="text"
                  autoComplete="name"
                  placeholder="Your full name"
                  value={signupForm.fullName}
                  onChange={(e) => setSignupForm({ ...signupForm, fullName: e.target.value })}
                  required
                />
                <Field
                  id="signup-email"
                  label="Email"
                  icon={Mail}
                  type="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  value={signupForm.email}
                  onChange={(e) => setSignupForm({ ...signupForm, email: e.target.value })}
                  required
                />
                <Field
                  id="signup-password"
                  label="Password"
                  icon={Lock}
                  type={passwordType}
                  autoComplete="new-password"
                  placeholder="At least 6 characters"
                  value={signupForm.password}
                  onChange={(e) => setSignupForm({ ...signupForm, password: e.target.value })}
                  right={passwordToggle}
                  required
                />
                <Field
                  id="signup-confirm"
                  label="Confirm password"
                  icon={Lock}
                  type={passwordType}
                  autoComplete="new-password"
                  placeholder="Repeat your password"
                  value={signupForm.confirmPassword}
                  onChange={(e) =>
                    setSignupForm({ ...signupForm, confirmPassword: e.target.value })
                  }
                  required
                />

                <Button type="submit" className="h-11 w-full rounded-xl" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating account...
                    </>
                  ) : (
                    "Create account"
                  )}
                </Button>
              </form>
            )}

            {/* FORGOT PASSWORD */}
            {mode === "forgot" && !resetSent && (
              <form onSubmit={handleForgot} className="mt-6 space-y-4">
                <Field
                  id="forgot-email"
                  label="Email"
                  icon={Mail}
                  type="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  required
                />
                <Button type="submit" className="h-11 w-full rounded-xl" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    "Send reset link"
                  )}
                </Button>
              </form>
            )}

            {mode === "forgot" && resetSent && (
              <div className="mt-6 rounded-2xl border border-border bg-card p-6 text-center">
                <span className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <MailCheck className="h-6 w-6" />
                </span>
                <p className="font-semibold">Check your inbox</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  If an account exists for <b className="text-foreground">{forgotEmail}</b>, we've
                  sent a link to reset your password. It may take a minute, and check spam too.
                </p>
                <Button
                  type="button"
                  variant="outline"
                  className="mt-4 rounded-xl"
                  onClick={() => setResetSent(false)}
                >
                  Use a different email
                </Button>
              </div>
            )}

            {/* Bottom switch link */}
            <p className="mt-6 text-center text-sm text-muted-foreground">
              {mode === "login" && (
                <>
                  Don't have an account?{" "}
                  <button
                    type="button"
                    onClick={() => switchMode("signup")}
                    className="font-semibold text-primary hover:underline"
                  >
                    Sign up
                  </button>
                </>
              )}
              {mode === "signup" && (
                <>
                  Already have an account?{" "}
                  <button
                    type="button"
                    onClick={() => switchMode("login")}
                    className="font-semibold text-primary hover:underline"
                  >
                    Log in
                  </button>
                </>
              )}
              {mode === "forgot" && (
                <>
                  Remembered it?{" "}
                  <button
                    type="button"
                    onClick={() => switchMode("login")}
                    className="font-semibold text-primary hover:underline"
                  >
                    Back to log in
                  </button>
                </>
              )}
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AuthPage;