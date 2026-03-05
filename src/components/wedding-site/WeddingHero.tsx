import { CalendarDays } from "lucide-react";

interface WeddingHeroProps {
  coupleNames: string;
  weddingDateLabel: string | null;
}

const WeddingHero = ({ coupleNames, weddingDateLabel }: WeddingHeroProps) => {
  return (
    <section className="border-b border-border bg-gradient-warm py-24">
      <div className="container mx-auto px-4 text-center">
        <p className="text-sm font-body font-semibold text-primary">אנחנו מתחתנים</p>
        <h1 className="mt-3 text-5xl font-display font-bold tracking-tight md:text-7xl">{coupleNames}</h1>
        {weddingDateLabel && (
          <p className="mt-6 inline-flex items-center gap-2 rounded-full border border-border bg-card px-5 py-2 text-base font-body text-muted-foreground">
            <CalendarDays size={18} className="text-primary" />
            {weddingDateLabel}
          </p>
        )}
      </div>
    </section>
  );
};

export default WeddingHero;
