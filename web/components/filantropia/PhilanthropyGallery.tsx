"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";

type PhilanthropyGalleryProps = {
  actionTitle: string;
  images: string[];
};

export function PhilanthropyGallery({ actionTitle, images }: PhilanthropyGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const lastTriggerRef = useRef<HTMLButtonElement | null>(null);
  const isOpen = selectedIndex !== null;

  const closeLightbox = useCallback(() => {
    setSelectedIndex(null);
    window.requestAnimationFrame(() => lastTriggerRef.current?.focus());
  }, []);

  const showPrevious = useCallback(() => {
    setSelectedIndex((current) => {
      if (current === null) return null;
      return current === 0 ? images.length - 1 : current - 1;
    });
  }, [images.length]);

  const showNext = useCallback(() => {
    setSelectedIndex((current) => {
      if (current === null) return null;
      return current === images.length - 1 ? 0 : current + 1;
    });
  }, [images.length]);

  useEffect(() => {
    if (!isOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeButtonRef.current?.focus();

    // Os atalhos ficam ativos apenas com o modal aberto para não interferir na página.
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeLightbox();
      if (event.key === "ArrowLeft") showPrevious();
      if (event.key === "ArrowRight") showNext();
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [closeLightbox, isOpen, showNext, showPrevious]);

  const openLightbox = (index: number, trigger: HTMLButtonElement) => {
    lastTriggerRef.current = trigger;
    setSelectedIndex(index);
  };

  return (
    <>
      <div className="mt-5 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3">
        {images.map((src, imageIndex) => (
          <button
            key={src}
            type="button"
            onClick={(event) => openLightbox(imageIndex, event.currentTarget)}
            aria-label={`Ampliar foto ${imageIndex + 1} da ação ${actionTitle}`}
            className="group relative aspect-[4/3] overflow-hidden rounded-lg border border-white/10 bg-[color:var(--color-bg-900)] text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--color-gold-500)] focus-visible:ring-offset-2 focus-visible:ring-offset-[color:var(--color-bg-950)]"
          >
            <Image
              src={src}
              alt={`Registro da ação do MC Os Papas no ${actionTitle}, foto ${imageIndex + 1}`}
              fill
              className="object-cover transition duration-300 group-hover:scale-[1.03] group-focus-visible:scale-[1.03]"
              sizes="(max-width: 639px) 50vw, (max-width: 1023px) 50vw, 33vw"
            />
            <span className="absolute inset-x-0 bottom-0 flex items-end bg-gradient-to-t from-black/80 to-transparent px-3 pb-3 pt-10 text-xs font-semibold uppercase tracking-[0.12em] text-white opacity-0 transition group-hover:opacity-100 group-focus-visible:opacity-100">
              Ampliar
            </span>
          </button>
        ))}
      </div>

      {selectedIndex !== null ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="philanthropy-lightbox-title"
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/90 p-4 backdrop-blur-sm"
          onClick={closeLightbox}
        >
          <h2 id="philanthropy-lightbox-title" className="sr-only">
            Foto ampliada da ação {actionTitle}
          </h2>

          <button
            ref={closeButtonRef}
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              closeLightbox();
            }}
            aria-label="Fechar imagem ampliada"
            className="absolute right-4 top-4 z-10 flex h-11 w-11 items-center justify-center rounded-full border border-white/20 bg-black/60 text-2xl leading-none text-white transition hover:border-[color:var(--color-gold-500)] hover:text-[color:var(--color-gold-500)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--color-gold-500)] sm:right-6 sm:top-6"
          >
            ×
          </button>

          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              showPrevious();
            }}
            aria-label="Imagem anterior"
            className="absolute left-2 top-1/2 z-10 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-black/60 text-3xl leading-none text-white transition hover:border-[color:var(--color-gold-500)] hover:text-[color:var(--color-gold-500)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--color-gold-500)] sm:left-6"
          >
            ‹
          </button>

          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              showNext();
            }}
            aria-label="Próxima imagem"
            className="absolute right-2 top-1/2 z-10 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-black/60 text-3xl leading-none text-white transition hover:border-[color:var(--color-gold-500)] hover:text-[color:var(--color-gold-500)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--color-gold-500)] sm:right-6"
          >
            ›
          </button>

          <div
            className="relative h-[78vh] w-[calc(100vw-2rem)] max-w-6xl sm:h-[84vh] sm:w-[calc(100vw-8rem)]"
            onClick={(event) => event.stopPropagation()}
          >
            <Image
              src={images[selectedIndex]}
              alt={`Registro ampliado da ação ${actionTitle}, foto ${selectedIndex + 1}`}
              fill
              priority
              className="object-contain"
              sizes="(max-width: 639px) calc(100vw - 2rem), calc(100vw - 8rem)"
            />
          </div>

          <p className="absolute bottom-4 rounded-full border border-white/15 bg-black/60 px-3 py-1 text-sm text-white sm:bottom-6">
            {selectedIndex + 1} / {images.length}
          </p>
        </div>
      ) : null}
    </>
  );
}
