"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

type LightboxProps = {
  images: string[];
  index: number;
  onClose: () => void;
};

export default function Lightbox({ images, index, onClose }: LightboxProps) {
  const [currentIndex, setCurrentIndex] = useState(index);
  const [zoomed, setZoomed] = useState(false);
  const touchStartX = useRef(0);

  const prev = () => {
    setCurrentIndex((i) => (i === 0 ? images.length - 1 : i - 1));
    setZoomed(false);
  };

  const next = () => {
    setCurrentIndex((i) => (i === images.length - 1 ? 0 : i + 1));
    setZoomed(false);
  };

  const image = images[currentIndex];

  useEffect(() => {
    // Mantém a navegação disponível no teclado enquanto o lightbox estiver aberto.
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") {
        setCurrentIndex((i) => (i === 0 ? images.length - 1 : i - 1));
        setZoomed(false);
      }
      if (e.key === "ArrowRight") {
        setCurrentIndex((i) => (i === images.length - 1 ? 0 : i + 1));
        setZoomed(false);
      }
    };

    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose, images.length]);

  if (!image || images.length === 0) return null;

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.changedTouches[0].screenX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const diff = e.changedTouches[0].screenX - touchStartX.current;

    // Um deslocamento mínimo evita acionar troca de imagem em toques curtos.
    if (diff > 50) prev();
    if (diff < -50) next();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
      onClick={onClose}
    >
      <button
        onClick={(e) => {
          e.stopPropagation();
          prev();
        }}
        className="absolute left-6 top-1/2 -translate-y-1/2 text-4xl text-white"
        aria-label="Imagem anterior"
      >
        ‹
      </button>

      <button
        onClick={(e) => {
          e.stopPropagation();
          next();
        }}
        className="absolute right-6 top-1/2 -translate-y-1/2 text-4xl text-white"
        aria-label="Próxima imagem"
      >
        ›
      </button>

      <div
        className="relative max-h-[90vh] max-w-[90vw]"
        onClick={(e) => e.stopPropagation()}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <button
          onClick={onClose}
          className="absolute -top-10 right-0 text-3xl text-white"
          aria-label="Fechar imagem"
        >
          ×
        </button>

        <Image
          src={image}
          alt="Imagem ampliada da galeria"
          width={1600}
          height={1200}
          onClick={(e) => {
            e.stopPropagation();
            setZoomed((value) => !value);
          }}
          className={`max-h-[90vh] rounded-xl object-contain shadow-2xl transition ${
            zoomed ? "scale-150 cursor-zoom-out" : "cursor-zoom-in"
          }`}
        />
      </div>
    </div>
  );
}
