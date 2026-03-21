import Image from "next/image";

interface BrazilMapProps {
  className?: string;
}

export function BrazilMap({ className = "" }: BrazilMapProps) {
  return (
    <div
      className={`flex w-full items-center justify-center ${className}`}
      role="img"
      aria-label="Mapa do Brasil com sedes do MC Os Papas"
    >
      <Image
        src="/images/geral/mapa.png"
        alt="Mapa do Brasil com sedes do MC Os Papas"
        className="h-auto w-full"
        width={2049}
        height={2136}
        sizes="(max-width: 768px) 100vw, (max-width: 1280px) 90vw, 1280px"
      />
    </div>
  );
}
