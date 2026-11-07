import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate, Link } from "@/lib/router-compat";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Loader2, Lock, Eye, EyeOff, ArrowLeft, LinkIcon } from "lucide-react";

const ResetPasswordPage = () => {
  const navigate = useNavigate();
  const [checking, setChecking] = useState(true);
  const [ready, setReady] = useState(false);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [saving, setSaving] = useState(false);

  // The emailed link carries a recovery session in the URL.
  // supabase-js picks it up and fires PASSWORD_RECOVERY.
  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") {
        setReady(true);
        setChecking(false);
      }
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) setReady(true);
      setChecking(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    if (password !== confirm) {
      toast.error("Passwords do not match");
      return;
    }

    setSaving(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) {
        toast.error(error.message);
        return;
      }
      toast.success("Password updated! You're signed in.");
      navigate("/");
    } catch {
      toast.error("An unexpected error occurred. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background px-4 py-6 sm:px-8">
      <div className="flex items-center justify-between">
        <Link
          to="/auth"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to log in
        </Link>
        <Link to="/" className="text-2xl font-bold">
          roge<span className="text-primary">.</span>
        </Link>
      </div>

      <div className="flex flex-1 items-center justify-center py-8">
        <div className="w-full max-w-md">
          {checking ? (
            <div className="flex justify-center py-16">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : !ready ? (
            <div className="rounded-2xl border border-border bg-card p-8 text-center">
              <span className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10 text-destructive">
                <LinkIcon className="h-6 w-6" />
              </span>
              <h1 className="text-xl font-bold">This link has expired</h1>
              <p className="mt-2 text-sm text-muted-foreground">
                Reset links can only be used once and expire after a while. Request a new one and
                try again.
              </p>
              <Button asChild className="mt-5 rounded-xl">
                <Link to="/auth?mode=forgot">Request a new link</Link>
              </Button>
            </div>
          ) : (
            <>
              <h1 className="text-3xl font-bold tracking-tight">Choose a new password</h1>
              <p className="mt-2 text-muted-foreground">
                Pick something at least 6 characters long.
              </p>

              <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="new-password" className="text-sm">
                    New password
                  </Label>
                  <div className="relative">
                    <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="new-password"
                      type={showPassword ? "text" : "password"}
                      autoComplete="new-password"
                      placeholder="At least 6 characters"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className={cn("h-11 rounded-xl pl-10 pr-11")}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((s) => !s)}
                      aria-label={showPassword ? "Hide password" : "Show password"}
                      className="absolute right-1.5 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="confirm-password" className="text-sm">
                    Confirm new password
                  </Label>
                  <div className="relative">
                    <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="confirm-password"
                      type={showPassword ? "text" : "password"}
                      autoComplete="new-password"
                      placeholder="Repeat your password"
                      value={confirm}
                      onChange={(e) => setConfirm(e.target.value)}
                      className="h-11 rounded-xl pl-10"
                      required
                    />
                  </div>
                </div>

                <Button type="submit" className="h-11 w-full rounded-xl" disabled={saving}>
                  {saving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    "Update password"
                  )}
                </Button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordPage;