"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

export type EventGalleryItem = {
  title: string;
  date: string;
  location: string;
  coverImage: string;
  images: string[];
};

type EventGalleryModalProps = {
  event: EventGalleryItem;
  onClose: () => void;
};

export default function EventGalleryModal({ event, onClose }: EventGalleryModalProps) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    // Faz a galeria responder ao teclado sem depender do foco nos botões laterais.
    const handleKeyDown = (eventKey: KeyboardEvent) => {
      if (eventKey.key === "Escape") onClose();
      if (eventKey.key === "ArrowLeft") {
        setIndex((current) => (current === 0 ? event.images.length - 1 : current - 1));
      }
      if (eventKey.key === "ArrowRight") {
        setIndex((current) => (current === event.images.length - 1 ? 0 : current + 1));
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [event.images.length, onClose]);

  const prev = () => {
    setIndex((current) => (current === 0 ? event.images.length - 1 : current - 1));
  };

  const next = () => {
    // O carrossel volta ao início para manter a navegação contínua.
    setIndex((current) => (current === event.images.length - 1 ? 0 : current + 1));
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <button
        onClick={(clickEvent) => {
          clickEvent.stopPropagation();
          onClose();
        }}
        className="absolute right-4 top-4 rounded-full bg-black/45 p-2 text-2xl text-white transition hover:scale-110 sm:right-6 sm:top-6"
        aria-label="Fechar galeria do evento"
      >
        ✕
      </button>

      <button
        onClick={(clickEvent) => {
          clickEvent.stopPropagation();
          prev();
        }}
        className="absolute left-2 top-1/2 rounded-full bg-black/45 p-2 text-3xl text-white transition hover:scale-110 sm:left-6"
        aria-label="Imagem anterior do evento"
      >
        ‹
      </button>

      <button
        onClick={(clickEvent) => {
          clickEvent.stopPropagation();
          next();
        }}
        className="absolute right-2 top-1/2 rounded-full bg-black/45 p-2 text-3xl text-white transition hover:scale-110 sm:right-6"
        aria-label="Próxima imagem do evento"
      >
        ›
      </button>

      <div
        className="relative h-[60vh] w-full max-w-4xl sm:h-[70vh] sm:w-[90vw]"
        onClick={(clickEvent) => clickEvent.stopPropagation()}
      >
        <Image
          src={event.images[index]}
          alt={`${event.title} - imagem ${index + 1}`}
          fill
          className="rounded-lg object-contain"
          sizes="90vw"
        />
      </div>

      <div className="absolute bottom-4 rounded-full bg-black/45 px-3 py-1 text-sm text-white sm:bottom-6">
        {index + 1} / {event.images.length}
      </div>
    </div>
  );
}
