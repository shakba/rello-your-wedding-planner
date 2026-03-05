interface WeddingGalleryProps {
  galleryUrls: string[];
}

const WeddingGallery = ({ galleryUrls }: WeddingGalleryProps) => {
  if (!galleryUrls || galleryUrls.length === 0) return null;

  return (
    <section className="border-t border-border py-14">
      <div className="container mx-auto max-w-5xl px-4">
        <h2 className="mb-8 text-center text-3xl font-display font-bold">הגלריה שלנו</h2>
        <div className="columns-2 gap-3 space-y-3 sm:columns-3">
          {galleryUrls.map((url, i) => (
            <div key={i} className="break-inside-avoid overflow-hidden rounded-xl border border-border">
              <img
                src={url}
                alt={`תמונה ${i + 1}`}
                className="w-full object-cover"
                loading="lazy"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WeddingGallery;
