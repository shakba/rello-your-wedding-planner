import { MapPin, Shirt } from "lucide-react";
import { Button } from "@/components/ui/button";

interface WeddingDetailsProps {
  story: string | null;
  venueName: string | null;
  venueAddress: string | null;
  dressCode: string | null;
}

const WeddingDetails = ({ story, venueName, venueAddress, dressCode }: WeddingDetailsProps) => {
  return (
    <div className="space-y-12 py-14">
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
