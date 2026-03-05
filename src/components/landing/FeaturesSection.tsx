import { motion } from "framer-motion";
import {
  Globe,
  Users,
  MessageSquare,
  Phone,
  LayoutGrid,
  Gift,
} from "lucide-react";

const features = [
  {
    icon: Globe,
    title: "אתר חתונה מעוצב",
    description: "צרו אתר חתונה יפהפה עם כתובת ייחודית, סיפור הזוג, לוח זמנים, גלריה ומידע על המקום.",
  },
  {
    icon: Users,
    title: "ניהול מוזמנים",
    description: "הוסיפו מוזמנים ידנית או דרך CSV, חלקו לקבוצות וסננו לפי כל קריטריון.",
  },
  {
    icon: MessageSquare,
    title: "הזמנות SMS",
    description: "שלחו הזמנות אישיות ב-SMS, עם תזכורות אוטומטיות ומעקב סטטוס בזמן אמת.",
  },
  {
    icon: Phone,
    title: "שיחות AI למעקב",
    description: "המערכת מתקשרת אוטומטית למוזמנים שלא ענו, מקבלת תשובות ומעדכנת את הדשבורד.",
  },
  {
    icon: LayoutGrid,
    title: "תכנון ישיבה בשולחנות",
    description: "סדרו מוזמנים בשולחנות עם גרירה ושחרור, הגדירו קיבולת וזהו בעיות ישיבה.",
  },
  {
    icon: Gift,
    title: "רשימת מתנות",
    description: "הוסיפו רשימת מתנות, תרומות כספיות או חוויות — והמוזמנים יבחרו מתוך האתר.",
  },
];

const container = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.1 },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

const FeaturesSection = () => {
  return (
    <section id="features" className="py-24 bg-background">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="text-primary font-body text-sm font-semibold tracking-wide">פיצ׳רים</span>
          <h2 className="text-3xl md:text-5xl font-display font-bold mt-3 mb-4">
            הכל מה שצריך לחתונה מושלמת
          </h2>
          <p className="text-muted-foreground font-body text-lg max-w-2xl mx-auto">
            מערכת אחת שמחליפה אקסלים, קבוצות וואטסאפ ושיחות מעקב מביכות
          </p>
        </motion.div>

        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {features.map((feature) => (
            <motion.div
              key={feature.title}
              variants={item}
              className="group bg-card rounded-2xl p-8 shadow-card hover:shadow-elevated transition-all duration-300 border border-border/50 hover:border-primary/20"
            >
              <div className="w-12 h-12 rounded-xl bg-rose-light flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300">
                <feature.icon className="text-primary" size={24} />
              </div>
              <h3 className="text-xl font-display font-semibold mb-3">{feature.title}</h3>
              <p className="text-muted-foreground font-body leading-relaxed">{feature.description}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default FeaturesSection;
