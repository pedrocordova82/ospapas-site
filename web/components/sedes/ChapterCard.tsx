import Link from "next/link";

/**
 * SECTION: Chapter Card Props
 * Defines minimal data required to render a chapter teaser card in lists.
 */
type ChapterCardProps = {
  name: string;
  city: string;
  href: string;
  imageUrl: string;
  type?: string;
}

/**
 * SECTION: Chapter Card
 * Visual preview card for a chapter, including image background,
 * chapter type label, and direct navigation to chapter details.
 */
export function ChapterCard({ name, city, href, imageUrl, type = "Regional" }: ChapterCardProps) {
  return (
    <Link
      href={href}
      className="group relative block overflow-hidden rounded-xl border border-white/10 bg-[color:var(--color-bg-900)]"
    >
      {/**
       * SECTION: Background Image
       * Uses a cover image as visual context for each chapter location.
       */}
      <div
        className="h-80 w-full bg-cover bg-center transition duration-500 group-hover:scale-105"
        style={{ backgroundImage: `url('${imageUrl}')` }}
      />
      {/**
       * SECTION: Contrast Overlay + Hover Animation
       * Dark gradient improves text readability over photography while
       * the group hover scale adds a subtle cinematic interaction.
       */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(11,11,11,0.18),transparent_45%),linear-gradient(180deg,rgba(11,11,11,0.58)_22%,rgba(11,11,11,0.98)_100%)]" />
      <div className="absolute inset-x-0 bottom-0 p-6">
        {/**
         * SECTION: Chapter Type Label
         * Highlights if the unit is Sede, Regional, or Subsede.
         */}
        <p className="text-xs uppercase tracking-[0.15em] text-[color:var(--color-gold-500)]">
  {type}
</p>    <h3 className="mt-2 font-heading text-4xl uppercase tracking-[0.04em] text-[color:var(--color-text-100)]">{name}</h3>
        <p className="mt-2 text-sm text-white/95">{city}</p>
        <span className="mt-4 inline-flex text-xs font-semibold uppercase tracking-[0.12em] text-white/90">
          Ver Capitulo
        </span>
      </div>
    </Link>
  );
}
