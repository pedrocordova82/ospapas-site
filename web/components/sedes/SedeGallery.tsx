"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import EventGalleryModal, { type EventGalleryItem } from "@/components/ui/EventGalleryModal";
import Lightbox from "@/components/ui/Lightbox";

type SedeGalleryProps = {
  images: string[];
  sedeName: string;
  events: EventGalleryItem[];
};

/**
 * SECTION: Galeria interativa da sede
 * A galeria reutiliza o mesmo fluxo de Brasília para manter navegação,
 * acessibilidade e comportamento mobile consistentes entre as regionais.
 */
export function SedeGallery({ images, sedeName, events }: SedeGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<EventGalleryItem | null>(null);
  const lastEventTriggerRef = useRef<HTMLButtonElement | null>(null);

  const openEvent = (event: EventGalleryItem, trigger: HTMLButtonElement) => {
    lastEventTriggerRef.current = trigger;
    setSelectedEvent(event);
  };

  const closeEvent = () => {
    setSelectedEvent(null);
    window.requestAnimationFrame(() => lastEventTriggerRef.current?.focus());
  };

  return (
    <>
      {events.length > 0 ? (
        <section className="mx-auto w-full max-w-6xl px-4 pt-14 sm:px-6 lg:px-8">
          <p className="text-xs uppercase tracking-[0.14em] text-[color:var(--color-gold-500)]">Agenda</p>
          <h2 className="mt-3 font-heading text-4xl uppercase tracking-[0.05em] text-white sm:text-5xl">Eventos</h2>
          <div className="mt-8 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {events.map((event) => (
              <button
                key={event.title}
                type="button"
                onClick={(clickEvent) => openEvent(event, clickEvent.currentTarget)}
                className="group overflow-hidden rounded-xl border border-white/10 bg-[color:var(--color-bg-900)] text-left cursor-pointer transition"
                aria-label={`Abrir galeria do evento ${event.title}`}
              >
                <div className="relative h-48 w-full overflow-hidden sm:h-52">
                  <Image
                    src={event.coverImage}
                    alt={event.coverImageAlt ?? event.title}
                    fill
                    className="object-cover transition duration-300 group-hover:scale-[1.03]"
                  />
                </div>
                <div className="p-5">
                  <h3 className="font-heading text-2xl uppercase tracking-[0.04em] text-white sm:text-3xl">{event.title}</h3>
                  <p className="mt-3 text-xs uppercase tracking-[0.12em] text-[color:var(--color-gold-500)]">{event.date}</p>
                  {event.location ? <p className="mt-1 text-sm text-white/80">{event.location}</p> : null}
                </div>
              </button>
            ))}
          </div>
        </section>
      ) : null}

      {images.length > 0 ? (
        <section className="mx-auto w-full max-w-6xl px-4 pt-14 sm:px-6 lg:px-8">
          <p className="text-xs uppercase tracking-[0.14em] text-[color:var(--color-gold-500)]">Momentos</p>
          <h2 className="mt-3 font-heading text-4xl uppercase tracking-[0.05em] text-white sm:text-5xl">Galeria</h2>
          <div className="mt-8 grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4">
            {images.map((image, index) => (
              <button
                key={image}
                type="button"
                onClick={() => setSelectedIndex(index)}
                className="overflow-hidden rounded-lg"
                aria-label={`Abrir imagem ${index + 1} da galeria de ${sedeName}`}
              >
                <div className="relative h-28 w-full cursor-pointer transition duration-300 hover:scale-105 sm:h-36 md:h-44">
                  <Image src={image} alt={`Galeria ${sedeName} ${index + 1}`} fill className="object-cover" />
                </div>
              </button>
            ))}
          </div>
        </section>
      ) : null}

      {selectedIndex !== null ? <Lightbox images={images} index={selectedIndex} onClose={() => setSelectedIndex(null)} /> : null}
      {selectedEvent ? (
        <EventGalleryModal
          key={selectedEvent.title}
          event={selectedEvent}
          onClose={closeEvent}
        />
      ) : null}
    </>
  );
}
