import { motion } from "framer-motion";

const steps = [
  {
    number: "01",
    title: "פתחו חשבון",
    description: "בחרו חבילה, שלמו פעם אחת וקבלו גישה מיידית למערכת.",
  },
  {
    number: "02",
    title: "בנו את אתר החתונה",
    description: "עצבו את האתר, הוסיפו תמונות, סיפור ופרטי האירוע.",
  },
  {
    number: "03",
    title: "העלו את המוזמנים",
    description: "הוסיפו ידנית או העלו קובץ CSV — המערכת תסדר הכל.",
  },
  {
    number: "04",
    title: "שלחו הזמנות ועקבו",
    description: "שלחו SMS, קבלו אישורי הגעה ותכננו ישיבה — הכל אוטומטי.",
  },
];

const HowItWorksSection = () => {
  return (
    <section id="how-it-works" className="py-24 bg-gradient-warm">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="text-primary font-body text-sm font-semibold tracking-wide">איך זה עובד</span>
          <h2 className="text-3xl md:text-5xl font-display font-bold mt-3 mb-4">
            ארבעה צעדים לחתונה מסודרת
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-5xl mx-auto">
          {steps.map((step, index) => (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.15, duration: 0.5 }}
              className="text-center"
            >
              <div className="text-5xl font-display font-bold text-gradient-hero mb-4">
                {step.number}
              </div>
              <h3 className="text-lg font-display font-semibold mb-2">{step.title}</h3>
              <p className="text-muted-foreground font-body text-sm leading-relaxed">{step.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
