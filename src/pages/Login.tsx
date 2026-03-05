import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link, useNavigate } from "react-router-dom";
import { Heart } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

const Login = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { signIn, signUp } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (isLogin) {
        const { error } = await signIn(email, password);
        if (error) {
          toast.error(error.message === "Invalid login credentials" ? "אימייל או סיסמה שגויים" : error.message);
        } else {
          toast.success("התחברת בהצלחה!");
          // Role-based redirect handled by useEffect below
        }
      } else {
        const { error } = await signUp(email, password, fullName);
        if (error) {
          toast.error(error.message);
        } else {
          toast.success("נרשמת בהצלחה! בדקו את האימייל לאימות.");
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-warm flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-block">
            <span className="text-3xl font-display font-bold text-gradient-hero">Rello</span>
          </Link>
          <p className="text-muted-foreground font-body mt-2">
            {isLogin ? "התחברו לחשבון שלכם" : "צרו חשבון חדש"}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="bg-card rounded-2xl shadow-card border border-border/50 p-8">
          <div className="space-y-4">
            {!isLogin && (
              <div className="space-y-2">
                <Label htmlFor="name" className="font-body">שם מלא</Label>
                <Input
                  id="name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="שם מלא"
                  className="font-body"
                  required={!isLogin}
                />
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="email" className="font-body">אימייל</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="example@email.com"
                dir="ltr"
                className="font-body text-left"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="font-body">סיסמה</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                dir="ltr"
                className="font-body text-left"
                required
                minLength={6}
              />
            </div>

            <Button variant="hero" size="lg" className="w-full" type="submit" disabled={isLoading}>
              <Heart size={18} />
              {isLoading ? "רגע..." : isLogin ? "התחברות" : "הרשמה"}
            </Button>
          </div>

          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={() => setIsLogin(!isLogin)}
              className="text-sm text-muted-foreground hover:text-primary transition-colors font-body"
            >
              {isLogin ? "אין לכם חשבון? הירשמו כאן" : "יש לכם כבר חשבון? התחברו"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
