import { Clock3, MapPin, Shirt, Users } from "lucide-react";
import { Button } from "@/components/ui/button";

interface TimelineItem {
  time: string;
  title: string;
}

interface WeddingDetailsProps {
  story: string | null;
  venueName: string | null;
  venueAddress: string | null;
  dressCode: string | null;
  parent1Parents?: string | null;
  parent2Parents?: string | null;
  eventTime?: string | null;
  schedule?: TimelineItem[];
}

const WeddingDetails = ({
  story,
  venueName,
  venueAddress,
  dressCode,
  parent1Parents,
  parent2Parents,
  eventTime,
  schedule = [],
}: WeddingDetailsProps) => {
  return (
    <div className="space-y-10 bg-background py-14">
      {(parent1Parents || parent2Parents) && (
        <section className="container mx-auto max-w-5xl px-4">
          <div className="grid gap-4 md:grid-cols-2">
            <article className="rounded-3xl border border-border bg-card p-6 shadow-card">
              <h2 className="inline-flex items-center gap-2 text-2xl font-display font-bold text-foreground">
                <Users size={20} className="text-primary" /> הורי החתן
              </h2>
              <p className="mt-3 font-body text-lg text-muted-foreground">{parent1Parents || "יעודכן בקרוב"}</p>
            </article>
            <article className="rounded-3xl border border-border bg-card p-6 shadow-card">
              <h2 className="inline-flex items-center gap-2 text-2xl font-display font-bold text-foreground">
                <Users size={20} className="text-primary" /> הורי הכלה
              </h2>
              <p className="mt-3 font-body text-lg text-muted-foreground">{parent2Parents || "יעודכן בקרוב"}</p>
            </article>
          </div>
        </section>
      )}

      {story && (
        <section className="container mx-auto max-w-3xl px-4 text-center">
          <h2 className="text-3xl font-display font-bold">הסיפור שלנו</h2>
          <p className="mt-4 whitespace-pre-line text-lg font-body leading-relaxed text-muted-foreground">{story}</p>
        </section>
      )}

      {venueName && (
        <section className="container mx-auto max-w-3xl px-4">
          <div className="rounded-3xl border border-border bg-card p-8 text-center shadow-card">
            <h2 className="text-3xl font-display font-bold">מיקום האירוע</h2>
            <p className="mt-4 inline-flex items-center gap-2 text-lg font-body font-semibold">
              <MapPin size={20} className="text-primary" />
              {venueName}
            </p>
            {venueAddress && <p className="mt-2 font-body text-muted-foreground">{venueAddress}</p>}
            {eventTime && (
              <p className="mt-3 inline-flex items-center gap-2 rounded-full bg-secondary px-4 py-1.5 font-body text-sm text-muted-foreground">
                <Clock3 size={14} /> {eventTime}
              </p>
            )}

            {venueAddress && (
              <div className="mt-6 flex flex-wrap justify-center gap-3">
                <Button variant="outline" asChild>
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(venueAddress)}`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Google Maps
                  </a>
                </Button>
                <Button variant="outline" asChild>
                  <a
                    href={`https://www.waze.com/ul?q=${encodeURIComponent(venueAddress)}`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Waze
                  </a>
                </Button>
              </div>
            )}
          </div>
        </section>
      )}

      {schedule.length > 0 && (
        <section className="container mx-auto max-w-3xl px-4">
          <div className="rounded-3xl border border-border bg-card p-8 shadow-card">
            <h2 className="text-center text-3xl font-display font-bold">לוח זמנים</h2>
            <div className="mt-6 space-y-3">
              {schedule.map((item, index) => (
                <div key={`${item.time}-${item.title}-${index}`} className="flex items-center justify-between rounded-2xl border border-border bg-secondary/40 px-4 py-3">
                  <span className="font-body text-muted-foreground">{item.title}</span>
                  <span className="font-display text-lg font-bold text-foreground">{item.time}</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {dressCode && (
        <section className="container mx-auto max-w-2xl px-4 text-center">
          <div className="rounded-3xl border border-border bg-card p-8 shadow-card">
            <h2 className="inline-flex items-center gap-2 text-3xl font-display font-bold">
              <Shirt size={22} className="text-primary" />
              קוד לבוש
            </h2>
            <p className="mt-4 text-lg font-body text-muted-foreground">{dressCode}</p>
          </div>
        </section>
      )}
    </div>
  );
};

export default WeddingDetails;
