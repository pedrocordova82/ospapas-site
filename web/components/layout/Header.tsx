"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { useState } from "react";

const navItems = [
  { label: "Sobre", href: "#sobre" },
  { label: "Sedes", href: "#sedes" },
  { label: "Eventos", href: "#eventos" },
  { label: "Filantropia", href: "#filantropia" },
  { label: "Contato", href: "#contato" },
];

export function Header() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  const handleLogoClick = (event: React.MouseEvent<HTMLAnchorElement>) => {
    if (pathname === "/") {
      event.preventDefault();
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    }
  };

  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-[color:var(--color-bg-900)]/85 backdrop-blur">
      <div className="mx-auto flex h-20 w-full max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" onClick={handleLogoClick} className="flex items-center gap-3 text-[color:var(--color-text-100)]">
          <Image src="/logo-ospapas.png" alt="Logo do MC Os Papas" width={40} height={40} />
          <div className="flex flex-col">
            <span className="font-heading text-3xl leading-none tracking-[0.08em]">MC OS PAPAS</span>
            <span className="text-[10px] uppercase tracking-[0.2em] text-[color:var(--color-gold-500)]">FRATRES IN VIA</span>
          </div>
        </Link>

        <nav aria-label="Navegacao principal" className="hidden md:block">
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

        <a
          href="#entrar"
          className="hidden rounded-md border border-[color:var(--color-gold-500)] px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-[color:var(--color-gold-500)] transition hover:bg-[color:var(--color-gold-500)] hover:text-[color:var(--color-bg-950)] md:inline-flex"
        >
          Como Entrar
        </a>

        <button
          type="button"
          onClick={() => setOpen((current) => !current)}
          className="inline-flex items-center justify-center rounded-md border border-white/15 p-2 text-white transition hover:border-[color:var(--color-gold-500)] hover:text-[color:var(--color-gold-500)] md:hidden"
          aria-label={open ? "Fechar menu de navegacao" : "Abrir menu de navegacao"}
          aria-expanded={open}
        >
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      <div
        className={`absolute left-0 top-full w-full border-t border-white/10 bg-[color:var(--color-bg-950)]/95 backdrop-blur md:hidden transition-all duration-300 ${
          open ? "visible translate-y-0 opacity-100" : "invisible -translate-y-2 opacity-0"
        }`}
      >
        <nav className="flex flex-col items-center gap-6 py-6">
          {navItems.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              onClick={() => setOpen(false)}
              className="text-sm uppercase tracking-[0.12em] text-[color:var(--color-text-300)] transition hover:text-[color:var(--color-gold-500)]"
            >
              {item.label}
            </Link>
          ))}
          <a
            href="#entrar"
            onClick={() => setOpen(false)}
            className="rounded-md border border-[color:var(--color-gold-500)] px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-[color:var(--color-gold-500)] transition hover:bg-[color:var(--color-gold-500)] hover:text-[color:var(--color-bg-950)]"
          >
            Como Entrar
          </a>
        </nav>
      </div>
    </header>
  );
}
