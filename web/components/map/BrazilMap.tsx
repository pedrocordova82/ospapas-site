"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";

interface BrazilMapProps {
  className?: string;
}

type HotspotAlign = "top" | "bottom" | "left" | "right";

interface MapHotspot {
  id: string;
  name: string;
  city: string;
  state: string;
  description: string;
  x: number;
  y: number;
  align?: HotspotAlign;
}

const HOTSPOTS: MapHotspot[] = [
  {
    id: "belem",
    name: "Sede Belém",
    city: "Belém",
    state: "PA",
    description: "Base ativa no Norte, sendo a sede nacional e origem do MC, conectando estrada, presença e irmandade.",
    x: 53.5,
    y: 28.5,
    align: "left",
  },
  {
    id: "sao-luis",
    name: "Sede São Luís",
    city: "São Luís",
    state: "MA",
    description: "Ponto de encontro no litoral, com rota forte para eventos e rolês.",
    x: 72.6,
    y: 30.4,
    align: "right",
  },
  {
    id: "brasilia",
    name: "Sede Brasília",
    city: "Brasília",
    state: "DF",
    description: "Centro estratégico da irmandade, ligando diferentes regiões do país.",
    x: 66.1,
    y: 56.6,
    align: "top",
  },
  {
    id: "rio-de-janeiro",
    name: "Sede Rio de Janeiro",
    city: "Rio de Janeiro",
    state: "RJ",
    description: "Presença marcante no Sudeste, com estrada, união e representatividade.",
    x: 76.5,
    y: 70.6,
    align: "left",
  },
  {
    id: "sao-miguel-do-oeste",
    name: "Sede São Miguel do Oeste",
    city: "São Miguel do Oeste",
    state: "SC",
    description: "Extremo Sul com atuação forte, encontros familiares e espírito de missão.",
    x: 61.4,
    y: 83.9,
    align: "top",
  },
];

function getTooltipPositionClasses(align: HotspotAlign = "top") {
  // Em telas pequenas preferimos eixo vertical para evitar corte lateral.
  const positions: Record<HotspotAlign, string> = {
    top: [
      "bottom-full left-1/2 mb-4 -translate-x-1/2",
      "md:bottom-full md:left-1/2 md:mb-4 md:-translate-x-1/2",
    ].join(" "),
    bottom: [
      "top-full left-1/2 mt-4 -translate-x-1/2",
      "md:top-full md:left-1/2 md:mt-4 md:-translate-x-1/2",
    ].join(" "),
    left: [
      "bottom-full left-1/2 mb-4 -translate-x-1/2",
      "md:bottom-auto md:left-auto md:right-full md:top-1/2 md:mb-0 md:mr-4 md:-translate-y-1/2 md:translate-x-0",
    ].join(" "),
    right: [
      "bottom-full left-1/2 mb-4 -translate-x-1/2",
      "md:bottom-auto md:left-full md:top-1/2 md:mb-0 md:ml-4 md:-translate-y-1/2 md:translate-x-0",
    ].join(" "),
  };

  return positions[align];
}

function getArrowPositionClasses(align: HotspotAlign = "top") {
  const positions: Record<HotspotAlign, string> = {
    top: "left-1/2 top-full -translate-x-1/2 -translate-y-1/2",
    bottom: "left-1/2 bottom-full -translate-x-1/2 translate-y-1/2",
    left: "left-1/2 top-full -translate-x-1/2 -translate-y-1/2 md:left-full md:top-1/2 md:-translate-y-1/2 md:-translate-x-1/2",
    right: "left-1/2 top-full -translate-x-1/2 -translate-y-1/2 md:left-0 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2",
  };

  return positions[align];
}

export function BrazilMap({ className = "" }: BrazilMapProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [pinnedId, setPinnedId] = useState<string | null>(null);

  // No mobile, o toque fixa o ponto para permitir leitura do tooltip sem hover.
  const displayedId = pinnedId ?? activeId;

  useEffect(() => {
    function handlePointerDown(event: PointerEvent) {
      // Fecha o tooltip fixado ao tocar fora da área interativa do mapa.
      if (!rootRef.current?.contains(event.target as Node)) {
        setPinnedId(null);
        setActiveId(null);
      }
    }

    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, []);

  const hotspots = useMemo(() => HOTSPOTS, []);

  return (
    <div ref={rootRef} className={`w-full ${className}`}>
      <div className="relative mx-auto w-full">
        <Image
          src="/images/geral/mapa.png"
          alt="Mapa do Brasil com sedes do MC Os Papas"
          className="h-auto w-full select-none brightness-110 contrast-110"
          width={2049}
          height={2136}
          sizes="(max-width: 768px) 100vw, (max-width: 1280px) 90vw, 1280px"
          priority={false}
        />

        <div className="absolute inset-0">
          {hotspots.map((hotspot) => {
            const isPinned = pinnedId === hotspot.id;
            const isActive = displayedId === hotspot.id;
            const shouldDim = displayedId !== null && !isActive;

            return (
              <div
                key={hotspot.id}
                className="absolute"
                style={{ left: `${hotspot.x}%`, top: `${hotspot.y}%` }}
                onMouseEnter={() => {
                  if (!pinnedId) setActiveId(hotspot.id);
                }}
                onMouseLeave={() => {
                  if (!pinnedId) setActiveId(null);
                }}
              >
                <div className="relative -translate-x-1/2 -translate-y-1/2">
                  <button
                    type="button"
                    aria-label={`${hotspot.name} em ${hotspot.city}, ${hotspot.state}`}
                    aria-expanded={isActive}
                    aria-describedby={isActive ? `tooltip-${hotspot.id}` : undefined}
                    className={[
                      "group relative flex h-5 w-5 cursor-pointer items-center justify-center rounded-full",
                      "transition-all duration-300 ease-out focus:outline-none focus-visible:ring-2",
                      "focus-visible:ring-[color:var(--color-gold-500)]/70 focus-visible:ring-offset-2",
                      "focus-visible:ring-offset-black/60",
                      shouldDim ? "scale-95 opacity-35" : "opacity-100",
                      isActive ? "scale-110" : "hover:scale-105",
                    ].join(" ")}
                    onFocus={() => setActiveId(hotspot.id)}
                    onBlur={() => {
                      if (!isPinned) setActiveId(null);
                    }}
                    onClick={() => {
                      const nextPinnedId = isPinned ? null : hotspot.id;
                      setPinnedId(nextPinnedId);
                      setActiveId(nextPinnedId ?? hotspot.id);
                    }}
                  >
                    <span
                      aria-hidden="true"
                      className={[
                        "absolute inset-0 rounded-full border border-[color:var(--color-gold-500)]/55",
                        "bg-[color:var(--color-gold-500)]/12 blur-[1px] transition-all duration-300",
                        isActive ? "scale-[2.4] opacity-100" : "scale-[1.9] opacity-45",
                      ].join(" ")}
                    />
                    <span
                      aria-hidden="true"
                      className={[
                        "absolute inset-0 rounded-full border border-[color:var(--color-gold-500)]/30",
                        "transition-all duration-300",
                        isActive ? "scale-[3.4] opacity-100" : "scale-[2.6] opacity-0 group-hover:opacity-70",
                      ].join(" ")}
                    />
                    <span
                      aria-hidden="true"
                      className={[
                        "relative z-10 h-2.5 w-2.5 rounded-full border border-[color:var(--color-gold-500)]/75",
                        "bg-[color:var(--color-gold-500)] shadow-[0_0_18px_rgba(255,215,0,0.45)]",
                        "transition-all duration-300",
                        isActive ? "scale-110" : "scale-100",
                      ].join(" ")}
                    />
                  </button>

                  <div
                    id={`tooltip-${hotspot.id}`}
                    role="tooltip"
                    className={[
                      "pointer-events-none absolute z-20 w-[min(16rem,calc(100vw-2rem))]",
                      "transition-all duration-300 ease-out",
                      getTooltipPositionClasses(hotspot.align),
                      isActive
                        ? "translate-y-0 opacity-100"
                        : "translate-y-1 opacity-0",
                    ].join(" ")}
                  >
                    <div className="relative overflow-hidden rounded-2xl border border-[color:var(--color-gold-500)]/20 bg-black/55 p-4 shadow-[0_18px_60px_rgba(0,0,0,0.4)] backdrop-blur-xl">
                      <div
                        aria-hidden="true"
                        className={`absolute h-3 w-3 rotate-45 border border-[color:var(--color-gold-500)]/20 bg-black/70 backdrop-blur-xl ${getArrowPositionClasses(
                          hotspot.align,
                        )}`}
                      />

                      <p className="text-[10px] uppercase tracking-[0.22em] text-[color:var(--color-gold-500)]/85">
                        {hotspot.state}
                      </p>
                      <p className="mt-1 text-sm font-semibold text-white">{hotspot.city}</p>
                      <p className="mt-2 text-sm leading-6 text-white/72">{hotspot.description}</p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
