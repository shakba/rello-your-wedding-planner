import SidebarLayout from "@/components/SidebarLayout";

interface ComingSoonProps {
  title: string;
  description: string;
  variant: "couple" | "admin";
}

const ComingSoon = ({ title, description, variant }: ComingSoonProps) => {
  return (
    <SidebarLayout variant={variant}>
      <div className="mx-auto max-w-2xl">
        <div className="rounded-3xl border border-border bg-card p-10 text-center shadow-card">
          <p className="text-sm font-body text-muted-foreground">בנייה מחדש בתהליך</p>
          <h1 className="mt-2 text-4xl font-display font-bold">{title}</h1>
          <p className="mt-3 text-base font-body text-muted-foreground">{description}</p>
        </div>
      </div>
    </SidebarLayout>
  );
};

export default ComingSoon;
