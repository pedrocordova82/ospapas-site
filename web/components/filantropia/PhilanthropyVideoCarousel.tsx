"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type PhilanthropyVideoCarouselProps = {
  actionTitle: string;
  videos: string[];
};

export function PhilanthropyVideoCarousel({ actionTitle, videos }: PhilanthropyVideoCarouselProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const lastTriggerRef = useRef<HTMLButtonElement | null>(null);
  const isOpen = selectedIndex !== null;

  const closeModal = useCallback(() => {
    setSelectedIndex(null);
    window.requestAnimationFrame(() => lastTriggerRef.current?.focus());
  }, []);

  const showPrevious = useCallback(() => {
    setSelectedIndex((current) => {
      if (current === null) return null;
      return current === 0 ? videos.length - 1 : current - 1;
    });
  }, [videos.length]);

  const showNext = useCallback(() => {
    setSelectedIndex((current) => {
      if (current === null) return null;
      return current === videos.length - 1 ? 0 : current + 1;
    });
  }, [videos.length]);

  useEffect(() => {
    if (!isOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeButtonRef.current?.focus();

    // Os atalhos de vídeo só ficam ativos enquanto o modal estiver aberto.
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeModal();
      if (event.key === "ArrowLeft") showPrevious();
      if (event.key === "ArrowRight") showNext();
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [closeModal, isOpen, showNext, showPrevious]);

  const openModal = (index: number, trigger: HTMLButtonElement) => {
    lastTriggerRef.current = trigger;
    setSelectedIndex(index);
  };

  return (
    <>
      <div className="-mx-4 mt-5 overflow-x-auto px-4 pb-3 [scrollbar-color:rgba(242,183,5,0.45)_rgba(255,255,255,0.08)] [scrollbar-width:thin] sm:-mx-6 sm:px-6 lg:mx-0 lg:px-0">
        <div className="flex w-max snap-x snap-mandatory gap-4">
          {videos.map((src, videoIndex) => (
            <button
              key={src}
              type="button"
              onClick={(event) => openModal(videoIndex, event.currentTarget)}
              aria-label={`Reproduzir vídeo ${videoIndex + 1} da ação ${actionTitle}`}
              className="group relative aspect-[9/16] w-40 shrink-0 snap-start overflow-hidden rounded-lg border border-white/10 bg-black text-left shadow-lg shadow-black/20 transition hover:border-[color:var(--color-gold-500)]/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--color-gold-500)] focus-visible:ring-offset-2 focus-visible:ring-offset-[color:var(--color-bg-950)] sm:w-48"
            >
              <video
                src={src}
                muted
                playsInline
                preload="metadata"
                aria-hidden="true"
                className="pointer-events-none h-full w-full object-cover opacity-80 transition duration-300 group-hover:scale-[1.03] group-hover:opacity-100 group-focus-visible:scale-[1.03] group-focus-visible:opacity-100"
              />
              <span className="absolute inset-0 bg-black/20 transition group-hover:bg-black/10 group-focus-visible:bg-black/10" />
              <span className="absolute left-1/2 top-1/2 flex h-14 w-14 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-[color:var(--color-gold-500)]/70 bg-black/65 text-xl text-[color:var(--color-gold-500)] transition group-hover:scale-105 group-hover:bg-black/80">
                ▶
              </span>
            </button>
          ))}
        </div>
      </div>

      {selectedIndex !== null ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="philanthropy-video-modal-title"
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/90 p-4 backdrop-blur-sm"
          onClick={closeModal}
        >
          <h2 id="philanthropy-video-modal-title" className="sr-only">
            Vídeo da ação {actionTitle}
          </h2>

          <button
            ref={closeButtonRef}
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              closeModal();
            }}
            aria-label="Fechar vídeo"
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
            aria-label="Vídeo anterior"
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
            aria-label="Próximo vídeo"
            className="absolute right-2 top-1/2 z-10 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-black/60 text-3xl leading-none text-white transition hover:border-[color:var(--color-gold-500)] hover:text-[color:var(--color-gold-500)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--color-gold-500)] sm:right-6"
          >
            ›
          </button>

          <div
            className="flex h-[82vh] w-[calc(100vw-5rem)] max-w-md items-center justify-center"
            onClick={(event) => event.stopPropagation()}
          >
            <video
              key={videos[selectedIndex]}
              controls
              controlsList="nodownload"
              playsInline
              preload="metadata"
              aria-label={`Reprodução do vídeo ${selectedIndex + 1} da ação ${actionTitle}`}
              className="max-h-full max-w-full rounded-lg border border-white/10 bg-black object-contain shadow-2xl shadow-black/60"
            >
              <source src={videos[selectedIndex]} type="video/mp4" />
              Seu navegador não oferece suporte à reprodução deste vídeo.
            </video>
          </div>

          <p className="absolute bottom-4 rounded-full border border-white/15 bg-black/60 px-3 py-1 text-sm text-white sm:bottom-6">
            {selectedIndex + 1} / {videos.length}
          </p>
        </div>
      ) : null}
    </>
  );
}
