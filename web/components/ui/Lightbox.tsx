"use client";

import Image from "next/image";
import { useEffect } from "react";

type LightboxProps = {
  image: string | null;
  onClose: () => void;
};

/**
 * SECTION: Lightbox Modal
 * Displays a fullscreen overlay image preview while keeping users on
 * the same page. Supports close by backdrop, button, and ESC key.
 */
export default function Lightbox({ image, onClose }: LightboxProps) {
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose]);

  if (!image) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
      onClick={onClose}
    >
      <div className="relative max-h-[90vh] max-w-[90vw]" onClick={(e) => e.stopPropagation()}>
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
          className="max-h-[90vh] rounded-xl object-contain shadow-2xl"
        />
      </div>
    </div>
  );
}
