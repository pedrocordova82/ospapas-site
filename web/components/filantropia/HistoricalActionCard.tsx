"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import Lightbox from "@/components/ui/Lightbox";

type HistoricalActionCardProps = {
  action: {
    id: string;
    year: string;
    location: string;
    title: string;
    description: string;
    impact: string;
    image: string;
    alt: string;
  };
};

export function HistoricalActionCard({ action }: HistoricalActionCardProps) {
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const closeLightbox = () => {
    setIsLightboxOpen(false);
    window.requestAnimationFrame(() => triggerRef.current?.focus());
  };

  return (
    <>
      <article className="overflow-hidden rounded-lg border border-white/10 bg-[color:var(--color-bg-900)]">
        <div className="grid gap-0 lg:grid-cols-[minmax(0,18rem)_minmax(0,1fr)]">
          <div className="bg-black/45 p-3 sm:p-4 lg:p-5">
            <button
              ref={triggerRef}
              type="button"
              onClick={() => setIsLightboxOpen(true)}
              aria-label={`Ampliar foto da ação ${action.title} ${action.year}`}
              className="group relative mx-auto aspect-[4/3] w-full overflow-hidden rounded-md bg-black text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--color-gold-500)] focus-visible:ring-offset-2 focus-visible:ring-offset-[color:var(--color-bg-950)] lg:aspect-[5/6] lg:max-h-80"
            >
              <Image
                src={action.image}
                alt={action.alt}
                fill
                className="object-cover object-center transition duration-300 group-hover:scale-[1.03] group-focus-visible:scale-[1.03]"
                sizes="(max-width: 1023px) calc(100vw - 2rem), 288px"
              />
              <span className="absolute inset-x-0 bottom-0 flex items-end bg-gradient-to-t from-black/80 to-transparent px-3 pb-3 pt-10 text-xs font-semibold uppercase tracking-[0.12em] text-white opacity-0 transition group-hover:opacity-100 group-focus-visible:opacity-100">
                Ampliar
              </span>
            </button>
          </div>

          <div className="flex flex-col justify-center px-5 py-7 sm:px-8 sm:py-9 lg:px-10">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--color-gold-500)]">
              {action.location} • {action.year}
            </p>
            <h3 className="mt-4 font-heading text-3xl uppercase tracking-[0.05em] text-white sm:text-4xl">
              {action.title}
            </h3>
            <p className="mt-5 max-w-2xl text-base leading-7 text-[color:var(--color-text-300)] sm:text-lg sm:leading-8">
              {action.description}
            </p>
            <p className="mt-8 border-l-2 border-[color:var(--color-gold-500)] pl-4 text-sm font-semibold uppercase tracking-[0.14em] text-[color:var(--color-gold-400)] sm:text-base">
              {action.impact}
            </p>
          </div>
        </div>
      </article>

      {isLightboxOpen ? (
        <Lightbox images={[action.image]} imageAlts={[action.alt]} index={0} onClose={closeLightbox} />
      ) : null}
    </>
  );
}
