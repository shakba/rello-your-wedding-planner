import { Heart } from "lucide-react";

const Footer = () => {
  return (
    <footer className="py-12 bg-foreground text-background">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <span className="text-2xl font-display font-bold">Rello</span>
          </div>
          <p className="text-sm font-body opacity-70 flex items-center gap-1">
            נבנה עם <Heart size={14} className="text-primary" /> עבור זוגות שרוצים חתונה בלי בלגן
          </p>
          <p className="text-sm font-body opacity-50">
            © {new Date().getFullYear()} Rello. כל הזכויות שמורות.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
