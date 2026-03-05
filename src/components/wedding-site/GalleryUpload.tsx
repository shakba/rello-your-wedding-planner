import { useRef, useState } from "react";
import { ImagePlus, Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

interface GalleryUploadProps {
  weddingId: string;
  galleryUrls: string[];
  onUpdate: (urls: string[]) => void;
}

const GalleryUpload = ({ weddingId, galleryUrls, onUpdate }: GalleryUploadProps) => {
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    const newUrls: string[] = [];

    try {
      for (const file of Array.from(files)) {
        if (!file.type.startsWith("image/")) {
          toast.error(`${file.name} אינו קובץ תמונה`);
          continue;
        }
        if (file.size > 5 * 1024 * 1024) {
          toast.error(`${file.name} גדול מדי (מקסימום 5MB)`);
          continue;
        }

        const ext = file.name.split(".").pop() ?? "jpg";
        const path = `${weddingId}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

        const { error } = await supabase.storage
          .from("wedding-gallery")
          .upload(path, file, { cacheControl: "3600", upsert: false });

        if (error) {
          toast.error(`שגיאה בהעלאת ${file.name}`);
          console.error("Upload error:", error);
          continue;
        }

        const { data: urlData } = supabase.storage
          .from("wedding-gallery")
          .getPublicUrl(path);

        newUrls.push(urlData.publicUrl);
      }

      if (newUrls.length > 0) {
        const updatedUrls = [...galleryUrls, ...newUrls];
        const { error: updateError } = await supabase
          .from("weddings")
          .update({ gallery_urls: updatedUrls })
          .eq("id", weddingId);

        if (updateError) {
          toast.error("שגיאה בשמירת הגלריה");
          return;
        }

        onUpdate(updatedUrls);
        toast.success(`${newUrls.length} תמונות הועלו בהצלחה`);
      }
    } catch (err) {
      console.error("Upload error:", err);
      toast.error("שגיאה בהעלאת התמונות");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const removeImage = async (urlToRemove: string) => {
    try {
      // Extract path from URL
      const urlObj = new URL(urlToRemove);
      const pathParts = urlObj.pathname.split("/wedding-gallery/");
      if (pathParts[1]) {
        await supabase.storage.from("wedding-gallery").remove([decodeURIComponent(pathParts[1])]);
      }

      const updatedUrls = galleryUrls.filter((u) => u !== urlToRemove);
      const { error } = await supabase
        .from("weddings")
        .update({ gallery_urls: updatedUrls })
        .eq("id", weddingId);

      if (error) {
        toast.error("שגיאה במחיקת התמונה");
        return;
      }

      onUpdate(updatedUrls);
      toast.success("התמונה נמחקה");
    } catch (err) {
      console.error("Remove error:", err);
      toast.error("שגיאה במחיקת התמונה");
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-display font-bold">גלריית תמונות</h3>
        <Button
          variant="outline"
          size="sm"
          onClick={() => fileRef.current?.click()}
          disabled={uploading}
        >
          {uploading ? <Loader2 size={16} className="animate-spin" /> : <ImagePlus size={16} />}
          {uploading ? "מעלה..." : "העלאת תמונות"}
        </Button>
      </div>

      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={handleUpload}
      />

      {galleryUrls.length === 0 ? (
        <button
          onClick={() => fileRef.current?.click()}
          className="flex w-full flex-col items-center gap-3 rounded-xl border-2 border-dashed border-primary/30 bg-primary/5 p-10 transition-colors hover:border-primary/50 hover:bg-primary/10"
        >
          <ImagePlus size={36} className="text-primary/60" />
          <p className="font-body font-medium text-foreground">העלו תמונות לגלריה</p>
          <p className="font-body text-sm text-muted-foreground">JPG, PNG, WEBP · עד 5MB לתמונה</p>
        </button>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {galleryUrls.map((url, i) => (
            <div key={i} className="group relative aspect-square overflow-hidden rounded-xl border border-border">
              <img
                src={url}
                alt={`תמונה ${i + 1}`}
                className="h-full w-full object-cover transition-transform group-hover:scale-105"
                loading="lazy"
              />
              <button
                onClick={() => removeImage(url)}
                className="absolute left-2 top-2 rounded-full bg-background/80 p-1.5 opacity-0 shadow-sm backdrop-blur-sm transition-opacity group-hover:opacity-100 hover:bg-destructive hover:text-destructive-foreground"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}
          {/* Add more button */}
          <button
            onClick={() => fileRef.current?.click()}
            className="flex aspect-square items-center justify-center rounded-xl border-2 border-dashed border-border transition-colors hover:border-primary/50 hover:bg-primary/5"
          >
            <ImagePlus size={24} className="text-muted-foreground" />
          </button>
        </div>
      )}
    </div>
  );
};

export default GalleryUpload;
