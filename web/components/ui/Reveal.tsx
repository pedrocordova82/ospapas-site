"use client";

import { useEffect, useRef } from "react";

type RevealProps = {
  children: React.ReactNode;
};

/**
 * SECTION: Reveal on Scroll
 * This component uses IntersectionObserver to reveal content when it enters
 * the viewport. The animation is triggered once for a subtle, performant UX.
 */
export function Reveal({ children }: RevealProps) {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    /**
     * SECTION: IntersectionObserver
     * Observes this wrapper element and applies the visible class once the
     * target reaches the configured viewport threshold.
     */
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("reveal-visible");
          observer.unobserve(entry.target);
        }
      },
      {
        threshold: 0.2,
      },
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} className="reveal">
      {children}
    </div>
  );
}
