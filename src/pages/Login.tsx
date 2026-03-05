import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Heart } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/useAuth";

const getErrorMessage = (error: unknown) => {
  if (error && typeof error === "object" && "message" in error) {
    return String((error as { message?: string }).message ?? "שגיאה לא צפויה");
  }
  return "שגיאה לא צפויה";
};

const Login = () => {
  const navigate = useNavigate();
  const { signIn, signUp, user, role, loading } = useAuth();

  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && user) {
      navigate(role === "admin" ? "/admin" : "/dashboard", { replace: true });
    }
  }, [loading, user, role, navigate]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);

    try {
      if (isLogin) {
        const { error } = await signIn(email, password);
        if (error) {
          const message = getErrorMessage(error);
          toast.error(message === "Invalid login credentials" ? "אימייל או סיסמה שגויים" : message);
          return;
        }

        toast.success("התחברת בהצלחה!");
        return;
      }

      const { error } = await signUp(email, password, fullName);
      if (error) {
        toast.error(getErrorMessage(error));
        return;
      }

      toast.success("נרשמת בהצלחה! בדקו את המייל לאימות החשבון.");
      setIsLogin(true);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-warm px-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <Link to="/" className="inline-block text-5xl font-display font-bold text-foreground">
            Rello
          </Link>
          <p className="mt-2 font-body text-muted-foreground">
            {isLogin ? "התחברו לחשבון שלכם" : "צרו חשבון חדש"}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="rounded-3xl border border-border bg-card p-8 shadow-card">
          <div className="space-y-4">
            {!isLogin && (
              <div className="space-y-2">
                <Label htmlFor="fullName" className="font-body">
                  שם מלא
                </Label>
                <Input
                  id="fullName"
                  value={fullName}
                  onChange={(event) => setFullName(event.target.value)}
                  className="font-body"
                  required={!isLogin}
                />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email" className="font-body">
                אימייל
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                dir="ltr"
                className="text-left font-body"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="font-body">
                סיסמה
              </Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                dir="ltr"
                className="text-left font-body"
                minLength={6}
                required
              />
            </div>
          </div>

          <Button type="submit" variant="hero" size="lg" className="mt-6 w-full" disabled={submitting || loading}>
            <Heart size={18} />
            {submitting || loading ? "רגע..." : isLogin ? "התחברות" : "הרשמה"}
          </Button>

          <button
            type="button"
            onClick={() => setIsLogin((prev) => !prev)}
            className="mt-5 w-full text-sm font-body text-muted-foreground transition-colors hover:text-primary"
          >
            {isLogin ? "אין לכם חשבון? הירשמו כאן" : "יש לכם כבר חשבון? התחברו"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
