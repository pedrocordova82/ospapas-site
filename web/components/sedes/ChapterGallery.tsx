"use client";

import Image from "next/image";
import { useState } from "react";
import Lightbox from "@/components/ui/Lightbox";

type ChapterGalleryProps = {
  images: string[];
  chapterName: string;
};

/**
 * SECTION: Interactive Chapter Gallery
 * Keeps the same gallery grid layout while adding click-to-expand image
 * interaction through a reusable Lightbox component.
 */
export function ChapterGallery({ images, chapterName }: ChapterGalleryProps) {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  return (
    <>
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

      <Lightbox image={selectedImage} onClose={() => setSelectedImage(null)} />
    </>
  );
}
