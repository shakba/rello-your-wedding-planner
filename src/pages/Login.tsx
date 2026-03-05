import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link } from "react-router-dom";
import { Heart } from "lucide-react";

const Login = () => {
  const [isLogin, setIsLogin] = useState(true);

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

        <div className="bg-card rounded-2xl shadow-card border border-border/50 p-8">
          <div className="space-y-4">
            {!isLogin && (
              <div className="space-y-2">
                <Label htmlFor="name" className="font-body">שם מלא</Label>
                <Input id="name" placeholder="שרה וג׳יימס" className="font-body" />
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="email" className="font-body">אימייל</Label>
              <Input id="email" type="email" placeholder="example@email.com" dir="ltr" className="font-body text-left" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="font-body">סיסמה</Label>
              <Input id="password" type="password" placeholder="••••••••" dir="ltr" className="font-body text-left" />
            </div>

            <Button variant="hero" size="lg" className="w-full">
              <Heart size={18} />
              {isLogin ? "התחברות" : "הרשמה"}
            </Button>
          </div>

          <div className="mt-6 text-center">
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="text-sm text-muted-foreground hover:text-primary transition-colors font-body"
            >
              {isLogin ? "אין לכם חשבון? הירשמו כאן" : "יש לכם כבר חשבון? התחברו"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
