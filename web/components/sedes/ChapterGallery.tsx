"use client";

import Image from "next/image";
import { useState } from "react";
import Lightbox from "@/components/ui/Lightbox";

type ChapterGalleryProps = {
  images: string[];
  chapterName: string;
  events: {
    title: string;
    date: string;
    location: string;
    image: string;
  }[];
};

/**
 * SECTION: Interactive Chapter Gallery
 * Keeps the same gallery grid layout while adding click-to-expand image
 * interaction through a reusable Lightbox component.
 */
export function ChapterGallery({ images, chapterName, events }: ChapterGalleryProps) {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  return (
    <>
      {events.length > 0 ? (
        <section className="mx-auto w-full max-w-6xl px-4 pt-14 sm:px-6 lg:px-8">
          <p className="text-xs uppercase tracking-[0.14em] text-[color:var(--color-gold-500)]">Agenda</p>
          <h2 className="mt-3 font-heading text-4xl uppercase tracking-[0.05em] text-white sm:text-5xl">Eventos</h2>
          <div className="mt-8 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {events.map((event) => (
              <article key={event.title} className="overflow-hidden rounded-xl border border-white/10 bg-[color:var(--color-bg-900)]">
                <button
                  type="button"
                  onClick={() => setSelectedImage(event.image)}
                  className="relative h-52 w-full cursor-pointer overflow-hidden"
                  aria-label={`Abrir imagem do evento ${event.title}`}
                >
                  <Image src={event.image} alt={event.title} fill className="object-cover transition duration-300 hover:scale-105" />
                </button>
                <div className="p-5">
                  <h3 className="font-heading text-3xl uppercase tracking-[0.04em] text-white">{event.title}</h3>
                  <p className="mt-3 text-xs uppercase tracking-[0.12em] text-[color:var(--color-gold-500)]">{event.date}</p>
                  <p className="mt-1 text-sm text-white/80">{event.location}</p>
                </div>
              </article>
            ))}
          </div>
        </section>
      ) : null}

      {images.length > 0 ? (
        <section className="mx-auto w-full max-w-6xl px-4 pt-14 sm:px-6 lg:px-8">
          <p className="text-xs uppercase tracking-[0.14em] text-[color:var(--color-gold-500)]">Momentos</p>
          <h2 className="mt-3 font-heading text-4xl uppercase tracking-[0.05em] text-white sm:text-5xl">Galeria</h2>
          <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
            {images.map((image, index) => (
              <button
                key={image}
                type="button"
                onClick={() => setSelectedImage(image)}
                className="overflow-hidden rounded-lg"
                aria-label={`Abrir imagem ${index + 1} da galeria de ${chapterName}`}
              >
                <div className="relative h-36 w-full cursor-pointer transition duration-300 hover:scale-105 sm:h-44">
                  <Image src={image} alt={`Galeria ${chapterName} ${index + 1}`} fill className="object-cover" />
                </div>
              </button>
            ))}
          </div>
        </section>
      ) : null}

      <Lightbox image={selectedImage} onClose={() => setSelectedImage(null)} />
    </>
  );
}
