"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "@/components/ui/icons/icons";
import { useEffect, useState, type MouseEvent } from "react";

const navItems = [
  { label: "Home", href: "/#top", activePath: "/" },
  { label: "Sobre", href: "/sobre", activePath: "/sobre" },
  { label: "Sedes", href: "/#sedes", activePath: "/sedes" },
  { label: "Eventos", href: "/#eventos", activePath: "/eventos" },
  { label: "Filantropia", href: "/#filantropia", activePath: "/filantropia" },
  // Removido item "Contato" para evitar redundância,
  // já que o site possui CTA via WhatsApp e formulário de interesse.
];

export function Header() {
  const [open, setOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const pathname = usePathname();

  // Evita destacar links de âncoras que não pertencem à rota atual.
  const isActive = (path: string) => {
    if (path === "/") return pathname === "/";
    return pathname.startsWith(path);
  };

  // Na home, o clique no logo sempre leva o usuário de volta ao topo.
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

  // Reforça visualmente a CTA quando o usuário já avançou além da primeira dobra.
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 48);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-white/10 bg-[color:var(--color-bg-900)]/85 backdrop-blur">
        <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between gap-2 px-3 sm:h-20 sm:gap-3 sm:px-6 lg:px-8">
          <Link
            href="/#top"
            onClick={handleLogoClick}
            className="min-w-0 flex cursor-pointer items-center gap-2 text-[color:var(--color-text-100)] sm:gap-3"
          >
            <Image
              src="/images/geral/logo-ospapas.png"
              alt="Logo do MC Os Papas"
              width={40}
              height={40}
              className="h-9 w-9 shrink-0 sm:h-10 sm:w-10"
            />
            <div className="min-w-0 flex flex-col text-left">
              <span className="truncate font-heading text-[1.7rem] leading-none tracking-[0.08em] sm:text-3xl">
                MC OS PAPAS
              </span>
              <span className="truncate text-[9px] uppercase tracking-[0.18em] text-[color:var(--color-gold-500)] sm:text-[10px] sm:tracking-[0.2em]">
                FRATRES IN VIA
              </span>
            </div>
          </Link>

          <nav className="hidden md:block" aria-label="Navegacao principal">
            <ul className="flex items-center gap-6">
              {navItems.map((item) => (
                <li key={item.label}>
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

          <div className="flex shrink-0 items-center gap-2 sm:gap-4">
            <Link
              href="/faca-parte"
              className={`inline-flex shrink-0 items-center rounded-md border px-2.5 py-2 text-[10px] font-semibold uppercase tracking-[0.12em] transition md:hidden ${
                isScrolled
                  ? "border-[color:var(--color-gold-500)] bg-[color:var(--color-gold-500)] text-black shadow-[0_0_24px_rgba(212,175,55,0.22)]"
                  : "border-[color:var(--color-gold-500)]/80 text-[color:var(--color-gold-500)] shadow-[0_8px_24px_rgba(0,0,0,0.22)] hover:bg-[color:var(--color-gold-500)] hover:text-black"
              }`}
            >
              Faça Parte
            </Link>

            <button className="shrink-0 p-1 text-white md:hidden" onClick={() => setOpen((v) => !v)}>
              {open ? <X size={26} /> : <Menu size={26} />}
            </button>

            <Link
              href="/faca-parte"
              className={`hidden items-center rounded-md border px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.14em] transition duration-300 md:inline-flex ${
                isScrolled
                  ? "border-[color:var(--color-gold-500)] bg-[color:var(--color-gold-500)] text-black shadow-[0_0_28px_rgba(212,175,55,0.24)] hover:-translate-y-0.5 hover:shadow-[0_10px_34px_rgba(212,175,55,0.22)]"
                  : "border-[color:var(--color-gold-500)] text-[color:var(--color-gold-500)] shadow-[0_10px_28px_rgba(0,0,0,0.22)] hover:-translate-y-0.5 hover:bg-[color:var(--color-gold-500)] hover:text-black hover:shadow-[0_12px_32px_rgba(212,175,55,0.16)]"
              } focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--color-gold-500)] focus-visible:ring-offset-2 focus-visible:ring-offset-[color:var(--color-bg-900)]`}
            >
              Faça Parte do MC
            </Link>
          </div>
        </div>
      </header>

      {open && <div className="fixed inset-0 z-30 bg-black/80 backdrop-blur-sm" onClick={() => setOpen(false)} />}

      {open && (
        <div className="fixed left-0 top-16 z-50 max-h-[calc(100vh-4rem)] w-full overflow-y-auto border-t border-white/10 bg-black md:hidden">
          <nav className="flex flex-col items-center gap-6 px-6 py-6">
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

            <Link
              href="/faca-parte"
              className="mt-4 rounded-md border border-[color:var(--color-gold-500)] px-6 py-3 text-sm uppercase tracking-[0.12em] text-[color:var(--color-gold-500)]"
              onClick={() => setOpen(false)}
            >
              Faça Parte do MC
            </Link>
          </nav>
        </div>
      )}
    </>
  );
}
