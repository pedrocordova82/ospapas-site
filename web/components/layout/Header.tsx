"use client";

import Image from "next/image";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { useState, type MouseEvent } from "react";

const navItems = [
  { label: "Sobre", href: "#sobre" },
  { label: "Sedes", href: "#sedes" },
  { label: "Eventos", href: "#eventos" },
  { label: "Filantropia", href: "#filantropia" },
  { label: "Contato", href: "#contato" },
];

export function Header() {
  const [open, setOpen] = useState(false);

  const handleLogoClick = (event: MouseEvent<HTMLAnchorElement>) => {
    if (window.location.pathname !== "/") return;

    event.preventDefault();
    if (window.location.hash !== "#top") {
      window.history.replaceState(null, "", "/#top");
    }

    const topEl = document.getElementById("top");
    if (topEl) {
      topEl.scrollIntoView({ behavior: "smooth", block: "start" });
    }

    window.scrollTo({ top: 0, behavior: "smooth" });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  };

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-white/10 bg-[color:var(--color-bg-900)]/85 backdrop-blur">
        <div className="mx-auto flex h-20 w-full max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link
            href="/#top"
            onClick={handleLogoClick}
            className="flex cursor-pointer items-center gap-3 text-[color:var(--color-text-100)]"
          >
            <Image src="/logo-ospapas.png" alt="Logo do MC Os Papas" width={40} height={40} />
            <div className="flex flex-col text-left">
              <span className="font-heading text-3xl leading-none tracking-[0.08em]">MC OS PAPAS</span>
              <span className="text-[10px] uppercase tracking-[0.2em] text-[color:var(--color-gold-500)]">FRATRES IN VIA</span>
            </div>
          </Link>

          <nav className="hidden md:block" aria-label="Navegacao principal">
            <ul className="flex items-center gap-6">
              {navItems.map((item) => (
                <li key={item.label}>
                  <a
                    href={item.href}
                    className="text-sm uppercase tracking-[0.12em] text-[color:var(--color-text-300)] transition hover:text-[color:var(--color-gold-500)]"
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <div className="flex items-center gap-4">
            <button className="text-white md:hidden" onClick={() => setOpen((v) => !v)}>
              {open ? <X size={26} /> : <Menu size={26} />}
            </button>

            <a
              href="#entrar"
              className="hidden rounded-md border border-[color:var(--color-gold-500)] px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-[color:var(--color-gold-500)] transition hover:bg-[color:var(--color-gold-500)] hover:text-black md:inline-block"
            >
              Como Entrar
            </a>
          </div>
        </div>
      </header>

      {open && <div className="fixed inset-0 z-30 bg-black/80 backdrop-blur-sm" onClick={() => setOpen(false)} />}

      {open && (
        <div className="fixed left-0 top-20 z-50 w-full border-t border-white/10 bg-black md:hidden">
          <nav className="flex flex-col items-center gap-6 py-6">
            {navItems.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="text-lg uppercase tracking-[0.12em] text-white"
                onClick={() => setOpen(false)}
              >
                {item.label}
              </Link>
            ))}

            <a
              href="#entrar"
              className="mt-4 rounded-md border border-[color:var(--color-gold-500)] px-6 py-3 text-sm uppercase tracking-[0.12em] text-[color:var(--color-gold-500)]"
              onClick={() => setOpen(false)}
            >
              Como Entrar
            </a>
          </nav>
        </div>
      )}
    </>
  );
}
