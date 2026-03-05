import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import { Link } from "react-router-dom";

const plans = [
  {
    name: "Starter",
    price: "$149",
    description: "לחתונות אינטימיות",
    highlight: false,
    features: [
      "עד 100 מוזמנים",
      "אתר חתונה מעוצב",
      "ניהול מוזמנים מלא",
      "הזמנות SMS",
      "מערכת RSVP",
      "תכנון ישיבה",
      "רשימת מתנות",
    ],
  },
  {
    name: "Grand",
    price: "$249",
    description: "לחתונות גדולות",
    highlight: true,
    features: [
      "מוזמנים ללא הגבלה",
      "אתר חתונה מעוצב",
      "ניהול מוזמנים מלא",
      "הזמנות SMS",
      "מערכת RSVP",
      "תכנון ישיבה",
      "רשימת מתנות",
      "שיחות AI למעקב",
      "תמיכה בעדיפות",
    ],
  },
];

const PricingSection = () => {
  return (
    <section id="pricing" className="py-24 bg-background">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="text-primary font-body text-sm font-semibold tracking-wide">תמחור</span>
          <h2 className="text-3xl md:text-5xl font-display font-bold mt-3 mb-4">
            תשלום חד-פעמי, בלי הפתעות
          </h2>
          <p className="text-muted-foreground font-body text-lg">
            אין מנוי חודשי. שלמו פעם אחת וקבלו גישה לכל הפיצ׳רים.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl mx-auto">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.15 }}
              className={`rounded-2xl p-8 border ${
                plan.highlight
                  ? "bg-gradient-hero text-primary-foreground border-transparent shadow-elevated relative"
                  : "bg-card border-border shadow-card"
              }`}
            >
              {plan.highlight && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-card text-foreground text-xs font-body font-semibold px-4 py-1 rounded-full shadow-soft">
                  הכי פופולרי ⭐
                </div>
              )}
              <h3 className="text-2xl font-display font-bold mb-1">{plan.name}</h3>
              <p className={`text-sm font-body mb-4 ${plan.highlight ? "text-primary-foreground/80" : "text-muted-foreground"}`}>
                {plan.description}
              </p>
              <div className="mb-6">
                <span className="text-4xl font-display font-bold">{plan.price}</span>
                <span className={`text-sm font-body mr-2 ${plan.highlight ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
                  חד-פעמי
                </span>
              </div>
              <ul className="space-y-3 mb-8">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-3 font-body text-sm">
                    <Check size={16} className={plan.highlight ? "text-primary-foreground" : "text-primary"} />
                    {feature}
                  </li>
                ))}
              </ul>
              <Button
                variant={plan.highlight ? "secondary" : "hero"}
                size="lg"
                className="w-full"
                asChild
              >
                <Link to="/login">התחילו עכשיו</Link>
              </Button>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PricingSection;
