import Link from "next/link";

type ChapterCardProps = {
  name: string;
  city: string;
  href: string;
  imageUrl: string;
  type?: string;
};

export function ChapterCard({
  name,
  city,
  href,
  imageUrl,
  type = "Regional",
}: ChapterCardProps) {
  return (
    <Link
      href={href}
      className="group relative block overflow-hidden rounded-xl border border-white/10 shadow-xl hover:shadow-2xl transition-shadow duration-500"
    >
      {/* Imagem */}
      <div
        className="h-80 w-full bg-cover bg-center transition duration-700 group-hover:scale-130 group-hover:brightness-120 group-hover:contrast-135"
        style={{ backgroundImage: `url('${imageUrl}')` }}
      />

      {/* Gradiente escuro sobre a imagem */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(11,11,11,0.18),transparent_45%),linear-gradient(180deg,rgba(11,11,11,0.58)_22%,rgba(11,11,11,0.98)_100%)]" />

      {/* Conteúdo do card */}
      <div className="absolute inset-x-0 bottom-0 p-6">
        <p className="text-xs uppercase tracking-[0.15em] text-[color:var(--color-gold-500)]">
          {type}
        </p>

        <h3 className="mt-2 font-heading text-4xl uppercase tracking-[0.04em] text-[color:var(--color-text-100)]">
          {name}
        </h3>

        <p className="mt-2 text-sm text-white/95">{city}</p>

        <span className="mt-4 inline-flex text-xs font-semibold uppercase tracking-[0.12em] text-white/90">
          Ver Capítulo
        </span>
      </div>
    </Link>
  );
}
