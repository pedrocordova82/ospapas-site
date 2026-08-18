"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";

export type EventGalleryVideo = {
  src: string;
  poster?: string;
  label: string;
  type?: string;
};

export type EventGalleryItem = {
  id?: string;
  title: string;
  date: string;
  location?: string;
  coverImage: string;
  coverImageAlt?: string;
  images: string[];
  imageAlts?: string[];
  videos?: EventGalleryVideo[];
};

type EventGalleryModalProps = {
  event: EventGalleryItem;
  onClose: () => void;
};

export default function EventGalleryModal({ event, onClose }: EventGalleryModalProps) {
  const [index, setIndex] = useState(0);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const touchStartX = useRef(0);
  const mediaItems = [
    ...event.images.map((src, imageIndex) => ({
      kind: "image" as const,
      src,
      alt: event.imageAlts?.[imageIndex] ?? `${event.title} - imagem ${imageIndex + 1}`,
    })),
    ...(event.videos ?? []).map((video) => ({
      kind: "video" as const,
      ...video,
    })),
  ];
  const currentMedia = mediaItems[index];

  const prev = useCallback(() => {
    setIndex((current) => (current === 0 ? mediaItems.length - 1 : current - 1));
  }, [mediaItems.length]);

  const next = useCallback(() => {
    setIndex((current) => (current === mediaItems.length - 1 ? 0 : current + 1));
  }, [mediaItems.length]);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeButtonRef.current?.focus();

    // Faz a galeria responder ao teclado sem depender do foco nos botões laterais.
    const handleKeyDown = (eventKey: KeyboardEvent) => {
      if (eventKey.key === "Escape") onClose();
      if (eventKey.key === "ArrowLeft") prev();
      if (eventKey.key === "ArrowRight") next();
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [next, onClose, prev]);

  const handleTouchEnd = (eventTouch: React.TouchEvent) => {
    const distance = eventTouch.changedTouches[0].clientX - touchStartX.current;

    if (distance > 50) prev();
    if (distance < -50) next();
  };

  if (!currentMedia || mediaItems.length === 0) {
    return null;
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Galeria do evento ${event.title}`}
      className="fixed inset-0 z-[60] flex items-center justify-center overflow-hidden bg-black/90 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <button
        ref={closeButtonRef}
        type="button"
        onClick={(clickEvent) => {
          clickEvent.stopPropagation();
          onClose();
        }}
        className="absolute right-4 top-4 z-20 flex h-11 w-11 items-center justify-center rounded-full border border-white/20 bg-black/70 text-2xl leading-none text-white transition hover:border-[color:var(--color-gold-500)] hover:text-[color:var(--color-gold-500)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--color-gold-500)] sm:right-6 sm:top-6"
        aria-label="Fechar imagem ampliada"
      >
        ×
      </button>

      <button
        type="button"
        onClick={(clickEvent) => {
          clickEvent.stopPropagation();
          prev();
        }}
        className="absolute left-2 top-1/2 z-20 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-black/70 text-3xl leading-none text-white transition hover:border-[color:var(--color-gold-500)] hover:text-[color:var(--color-gold-500)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--color-gold-500)] sm:left-6"
        aria-label="Imagem anterior"
      >
        ‹
      </button>

      <button
        type="button"
        onClick={(clickEvent) => {
          clickEvent.stopPropagation();
          next();
        }}
        className="absolute right-2 top-1/2 z-20 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-black/70 text-3xl leading-none text-white transition hover:border-[color:var(--color-gold-500)] hover:text-[color:var(--color-gold-500)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--color-gold-500)] sm:right-6"
        aria-label="Próxima imagem"
      >
        ›
      </button>

      <div
        className="relative flex h-[78vh] w-[calc(100vw-2rem)] max-w-4xl items-center justify-center sm:h-[84vh] sm:w-[calc(100vw-8rem)]"
        onClick={(clickEvent) => clickEvent.stopPropagation()}
        onTouchStart={(eventTouch) => {
          touchStartX.current = eventTouch.changedTouches[0].clientX;
        }}
        onTouchEnd={handleTouchEnd}
      >
        {currentMedia.kind === "image" ? (
          <Image
            src={currentMedia.src}
            alt={currentMedia.alt}
            fill
            className="rounded-lg object-contain"
            sizes="(max-width: 639px) calc(100vw - 2rem), calc(100vw - 8rem)"
          />
        ) : (
          <video
            key={currentMedia.src}
            controls
            controlsList="nodownload"
            playsInline
            preload="metadata"
            poster={currentMedia.poster}
            aria-label={currentMedia.label}
            className="max-h-full max-w-full rounded-lg border border-white/10 bg-black object-contain shadow-2xl shadow-black/60"
          >
            <source src={currentMedia.src} type={currentMedia.type ?? "video/mp4"} />
            Seu navegador não oferece suporte à reprodução deste vídeo.
          </video>
        )}
      </div>

      <div className="absolute bottom-4 z-20 rounded-full border border-white/15 bg-black/70 px-3 py-1 text-sm text-white sm:bottom-6">
        {index + 1} / {mediaItems.length}
      </div>
    </div>
  );
}
