"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "@/components/ui/icons/icons";
import { useState, type MouseEvent } from "react";

/**
 * SECTION: Navigation Items
 * Centralized anchor list used by both desktop and mobile menus.
 * Keeping this array shared prevents navigation drift between breakpoints.
 */
const navItems = [
  { label: "Home", href: "/#top", activePath: "/" },
  { label: "Sobre", href: "/sobre", activePath: "/sobre" },
  { label: "Sedes", href: "/#sedes", activePath: "/sedes" },
  { label: "Eventos", href: "/#eventos", activePath: "/eventos" },
  { label: "Filantropia", href: "/#filantropia", activePath: "/filantropia" },
  { label: "Contato", href: "/#contato", activePath: "/contato" },
];

export function Header() {
  /**
   * SECTION: Mobile Navigation Toggle
   * Controls whether the mobile menu and dark overlay are visible.
   */
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  /**
   * SECTION: Active Navigation Helper
   * Header highlighting is route-based so each menu item only reacts to its
   * own path prefix without loose matching side effects.
   */
  const isActive = (path: string) => {
    if (path === "/") return pathname === "/";
    return pathname.startsWith(path);
  };

  /**
   * SECTION: Logo Navigation + Smooth Scroll
   * On homepage, clicking the logo forces smooth scroll to top.
   * On other pages, the Link keeps normal route navigation behavior.
   */
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
      {/**
       * SECTION: Header Shell
       * Sticky top bar shared across pages with logo, desktop navigation,
       * and breakpoint-specific controls.
       */}
      <header className="sticky top-0 z-40 border-b border-white/10 bg-[color:var(--color-bg-900)]/85 backdrop-blur">
        <div className="mx-auto flex h-20 w-full max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link
            href="/#top"
            onClick={handleLogoClick}
            className="flex cursor-pointer items-center gap-3 text-[color:var(--color-text-100)]"
          >
            <Image src="/images/geral/logo-ospapas.png" alt="Logo do MC Os Papas" width={40} height={40} />
            <div className="flex flex-col text-left">
              <span className="font-heading text-3xl leading-none tracking-[0.08em]">MC OS PAPAS</span>
              <span className="text-[10px] uppercase tracking-[0.2em] text-[color:var(--color-gold-500)]">FRATRES IN VIA</span>
            </div>
          </Link>

          {/**
           * SECTION: Desktop Navigation
           * Visible from medium screens and up (`md:block`).
           * Mobile navigation is rendered separately below.
           */}
          <nav className="hidden md:block" aria-label="Navegacao principal">
            <ul className="flex items-center gap-6">
              {navItems.map((item) => (
                <li key={item.label}>
                  {/**
                   * SECTION: Active Navigation Styling
                   * Active state is derived from the current route path so
                   * homepage anchors do not keep unrelated items highlighted.
                   */}
                  <Link
                    href={item.href}
                    scroll={true}
                    className={`text-sm uppercase tracking-[0.12em] transition ${
                      isActive(item.activePath)
                        ? "text-[color:var(--color-gold-500)]"
                        : "text-[color:var(--color-text-300)] hover:text-[color:var(--color-gold-500)]"
                    }`}
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/**
           * SECTION: Right Controls
           * Mobile shows the hamburger toggle, while desktop shows the
           * "Como Entrar" call-to-action button.
           */}
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

      {/**
       * SECTION: Mobile Menu Overlay
       * Dark overlay closes the mobile menu when users click outside it.
       */}
      {open && <div className="fixed inset-0 z-30 bg-black/80 backdrop-blur-sm" onClick={() => setOpen(false)} />}

      {/**
       * SECTION: Mobile Navigation Panel
       * Visible only on small screens (`md:hidden`) and rendered as a
       * stacked vertical menu below the sticky header.
       */}
      {open && (
        <div className="fixed left-0 top-20 z-50 w-full border-t border-white/10 bg-black md:hidden">
          <nav className="flex flex-col items-center gap-6 py-6">
            {navItems.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className={`text-lg uppercase tracking-[0.12em] ${
                  isActive(item.activePath) ? "text-[color:var(--color-gold-500)]" : "text-white"
                }`}
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
