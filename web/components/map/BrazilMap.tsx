"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

interface BrazilMapProps {
  className?: string;
}

type HotspotAlign = "top" | "bottom" | "left" | "right";

interface MapHotspot {
  id: string;
  state: string;
  presences: Array<{
    city: string;
    type: string;
  }>;
  x: number;
  y: number;
  align?: HotspotAlign;
}

const HOTSPOTS: MapHotspot[] = [
  {
    id: "pa",
    state: "PA",
    presences: [
      { city: "Belém", type: "Sede Nacional" },
      { city: "Tomé-Açu", type: "Regional" },
      { city: "Porto de Moz", type: "Subsede Representativa" },
      { city: "Almeirim", type: "Subsede Representativa" },
      { city: "Salinópolis", type: "Subsede Representativa" },
    ],
    x: 53.7,
    y: 29,
    align: "bottom",
  },
  {
    id: "ma",
    state: "MA",
    presences: [{ city: "São Luís", type: "Subsede" }],
    x: 72.6,
    y: 30.4,
    align: "left",
  },
  {
    id: "df",
    state: "DF",
    presences: [{ city: "Brasília", type: "Regional" }],
    x: 67.6,
    y: 53.6,
    align: "top",
  },
  {
    id: "rj",
    state: "RJ",
    presences: [{ city: "Rio de Janeiro", type: "Regional" }],
    x: 76.5,
    y: 70.6,
    align: "left",
  },
  {
    id: "sc",
    state: "SC",
    presences: [
      { city: "São Miguel do Oeste", type: "Regional" },
      { city: "Criciúma", type: "Subsede Representativa" },
    ],
    x: 61.4,
    y: 80.9,
    align: "top",
  },
  {
    id: "ap",
    state: "AP",
    presences: [{ city: "Macapá", type: "Subsede Representativa" }],
    x: 57.5,
    y: 13.2,
    align: "bottom",
  },
  {
    id: "pe",
    state: "PE",
    presences: [{ city: "Recife", type: "Subsede Representativa" }],
    x: 92.1,
    y: 34.5,
    align: "left",
  },
  {
    id: "sp",
    state: "SP",
    presences: [{ city: "São José dos Campos", type: "Subsede Representativa" }],
    x: 65.5,
    y: 73,
    align: "left",
  },
  {
    id: "pr",
    state: "PR",
    presences: [
      { city: "Curitiba", type: "Subsede Representativa" },
      { city: "Umuarama", type: "Subsede Representativa" },
    ],
    x: 57.5,
    y: 73.4,
    align: "right",
  },
  {
    id: "rs",
    state: "RS",
    presences: [{ city: "Rio Grande", type: "Subsede Representativa" }],
    x: 54.8,
    y: 91.5,
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
      "bottom-full right-0 mb-4",
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
    left: "right-4 top-full -translate-y-1/2 md:right-auto md:left-full md:top-1/2 md:-translate-x-1/2",
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

  return (
    <div ref={rootRef} className={`w-full ${className}`}>
      <div className="relative mx-auto w-full">
        <Image
          src="/images/geral/mapa.svg"
          alt="Mapa do Brasil com sedes do MC Os Papas"
          className="h-auto w-full select-none brightness-110 contrast-110"
          width={2049}
          height={2136}
          sizes="(max-width: 768px) 100vw, (max-width: 1280px) 90vw, 1280px"
          priority={false}
        />

        <div className="absolute inset-0">
          {HOTSPOTS.map((hotspot) => {
            const isPinned = pinnedId === hotspot.id;
            const isActive = displayedId === hotspot.id;

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
                    aria-label={`Presenças do MC Os Papas em ${hotspot.state}`}
                    aria-expanded={isActive}
                    aria-describedby={isActive ? `tooltip-${hotspot.id}` : undefined}
                    className="relative h-11 w-11 cursor-pointer rounded-md bg-transparent focus:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--color-gold-500)]/70 focus-visible:ring-offset-2 focus-visible:ring-offset-black/60"
                    onFocus={() => setActiveId(hotspot.id)}
                    onBlur={() => {
                      if (!isPinned) setActiveId(null);
                    }}
                    onClick={() => {
                      const nextPinnedId = isPinned ? null : hotspot.id;
                      setPinnedId(nextPinnedId);
                      setActiveId(nextPinnedId ?? hotspot.id);
                    }}
                  />

                  <div
                    id={`tooltip-${hotspot.id}`}
                    role="tooltip"
                    className={[
                      "pointer-events-none absolute z-20 w-[min(12rem,calc(100vw-1.25rem))] md:w-[min(16rem,calc(100vw-2rem))]",
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
                      <p className="mt-1 text-sm font-semibold text-white">Presenças no estado</p>
                      <ul className="mt-3 space-y-2">
                        {hotspot.presences.map((presence) => (
                          <li
                            key={`${hotspot.state}-${presence.city}`}
                            className="border-t border-white/10 pt-2 first:border-t-0 first:pt-0"
                          >
                            <p className="text-xs font-semibold text-white md:text-sm">{presence.city}</p>
                            <p className="mt-0.5 text-[10px] uppercase tracking-[0.1em] text-[color:var(--color-gold-500)]/85 md:text-xs">
                              {presence.type}
                            </p>
                          </li>
                        ))}
                      </ul>
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
