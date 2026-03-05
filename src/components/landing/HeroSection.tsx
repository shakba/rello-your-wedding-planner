import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Heart, Sparkles } from "lucide-react";
import heroImage from "@/assets/hero-wedding.jpg";

const HeroSection = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
      {/* Background Image */}
      <div className="absolute inset-0">
        <img
          src={heroImage}
          alt="אווירת חתונה"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/70 via-background/50 to-background" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-center max-w-3xl mx-auto"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="inline-flex items-center gap-2 bg-rose-light text-primary rounded-full px-4 py-2 mb-6 font-body text-sm font-medium"
          >
            <Sparkles size={16} />
            <span>המערכת שתנהל לכם את החתונה</span>
          </motion.div>

          <h1 className="text-4xl sm:text-5xl md:text-7xl font-display font-bold mb-6 leading-tight">
            <span className="text-foreground">החתונה שלכם,</span>
            <br />
            <span className="text-gradient-hero">בלי הבלגן</span>
          </h1>

          <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-xl mx-auto font-body leading-relaxed">
            הפסיקו לנהל אקסלים וקבוצות וואטסאפ. עם Rello תנהלו מוזמנים, תשלחו הזמנות ותעקבו אחרי אישורי הגעה — הכל במקום אחד.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button variant="hero" size="xl" asChild>
              <Link to="/login">
                <Heart size={20} />
                התחילו לתכנן
              </Link>
            </Button>
            <Button variant="outline" size="lg" asChild>
              <a href="#features">גלו עוד</a>
            </Button>
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1, duration: 0.8 }}
            className="mt-12 text-sm text-muted-foreground font-body"
          >
            ✦ ללא מנוי חודשי &nbsp; ✦ &nbsp; ללא עלויות נסתרות &nbsp; ✦ &nbsp; תשלום חד-פעמי
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;
