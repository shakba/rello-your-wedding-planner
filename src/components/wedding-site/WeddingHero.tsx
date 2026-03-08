import heroWedding from "@/assets/hero-wedding.jpg";

interface WeddingHeroProps {
  coupleNames: string;
  weddingDateLabel: string | null;
  coverImageUrl?: string | null;
}

const WeddingHero = ({ coupleNames, weddingDateLabel, coverImageUrl }: WeddingHeroProps) => {
  const backgroundImage = coverImageUrl || heroWedding;

  return (
    <section className="relative min-h-[72vh] overflow-hidden border-b border-border">
      <img
        src={backgroundImage}
        alt={`תמונת שער - ${coupleNames}`}
        className="absolute inset-0 h-full w-full object-cover"
        loading="eager"
      />
      <div className="absolute inset-0 bg-foreground/45" />

      <div className="relative container mx-auto flex min-h-[72vh] flex-col items-center justify-center px-4 text-center">
        <p className="rounded-full border border-border/40 bg-background/20 px-4 py-1.5 text-sm font-body font-semibold text-primary-foreground backdrop-blur-sm">
          אנחנו מתחתנים
        </p>
        <h1 className="mt-4 text-5xl font-display font-bold leading-tight text-primary-foreground md:text-7xl">{coupleNames}</h1>
        {weddingDateLabel && (
          <p className="mt-5 rounded-full border border-border/40 bg-background/20 px-6 py-2 text-base font-body text-primary-foreground backdrop-blur-sm">
            {weddingDateLabel}
          </p>
        )}
      </div>
    </section>
  );
};

export default WeddingHero;
