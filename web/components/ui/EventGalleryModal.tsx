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
    setIndex((current) => (current === event.images.length - 1 ? 0 : current + 1));
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
      onClick={onClose}
    >
      <button
        onClick={(clickEvent) => {
          clickEvent.stopPropagation();
          onClose();
        }}
        className="absolute right-6 top-6 text-2xl text-white transition hover:scale-110"
        aria-label="Fechar galeria do evento"
      >
        ✕
      </button>

      <button
        onClick={(clickEvent) => {
          clickEvent.stopPropagation();
          prev();
        }}
        className="absolute left-6 text-3xl text-white transition hover:scale-110"
        aria-label="Imagem anterior do evento"
      >
        ‹
      </button>

      <button
        onClick={(clickEvent) => {
          clickEvent.stopPropagation();
          next();
        }}
        className="absolute right-6 text-3xl text-white transition hover:scale-110"
        aria-label="Próxima imagem do evento"
      >
        ›
      </button>

      <div
        className="relative h-[70vh] w-[90vw] max-w-4xl"
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

      <div className="absolute bottom-6 text-sm text-white">
        {index + 1} / {event.images.length}
      </div>
    </div>
  );
}
