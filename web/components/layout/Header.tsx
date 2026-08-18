"use client";

import Image from "next/image";
import Link from "next/link";
import localFont from "next/font/local";
import { usePathname } from "next/navigation";
import { Menu, X } from "@/components/ui/icons/icons";
import { useEffect, useState, type MouseEvent } from "react";

const algerian = localFont({
  src: "../../public/fonts/algerian-regular.woff2",
  display: "swap",
  weight: "400",
});

type NavItem = {
  label: string;
  href: string;
  activePath: string;
  children?: {
    label: string;
    href: string;
    activePath: string;
  }[];
};

const navItems: NavItem[] = [
  { label: "Home", href: "/#top", activePath: "/" },
  { label: "Quem Somos", href: "/quem-somos", activePath: "/quem-somos" },
  { label: "Diretoria", href: "/diretoria", activePath: "/diretoria" },
  { label: "Sedes", href: "/sedes", activePath: "/sedes" },
  {
    label: "Eventos",
    href: "/eventos",
    activePath: "/eventos",
    children: [
      {
        label: "Encontro Nacional",
        href: "/eventos/encontro-nacional",
        activePath: "/eventos/encontro-nacional",
      },
    ],
  },
  { label: "Filantropia", href: "/filantropia", activePath: "/filantropia" },
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
              <span className={`${algerian.className} truncate text-[1.4rem] leading-none tracking-[-0.03em] [word-spacing:-0.20em] sm:text-[1.65rem]`}>
                MC OS PAPAS
              </span>
              <span className="truncate text-[9px] uppercase tracking-[0.18em] text-[color:var(--color-gold-500)] sm:text-[10px] sm:tracking-[0.2em]">
                FRATRES IN VIA
              </span>
            </div>
          </Link>

          <nav className="hidden lg:block" aria-label="Navegacao principal">
            <ul className="flex items-center gap-5 xl:gap-6">
              {navItems.map((item) => (
                <li key={item.label} className="group relative">
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
                  {item.children ? (
                    <div className="pointer-events-none absolute left-1/2 top-full w-56 -translate-x-1/2 pt-4 opacity-0 transition group-hover:pointer-events-auto group-hover:opacity-100 group-focus-within:pointer-events-auto group-focus-within:opacity-100">
                      <div className="rounded-md border border-white/10 bg-[color:var(--color-bg-900)] p-2 shadow-2xl shadow-black/40">
                        {item.children.map((child) => (
                          <Link
                            key={child.href}
                            href={child.href}
                            className={`block rounded-sm px-3 py-2 text-xs font-semibold uppercase tracking-[0.12em] transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--color-gold-500)] ${
                              isActive(child.activePath)
                                ? "bg-[color:var(--color-gold-500)] text-black"
                                : "text-[color:var(--color-text-300)] hover:bg-white/5 hover:text-[color:var(--color-gold-500)]"
                            }`}
                          >
                            {child.label}
                          </Link>
                        ))}
                      </div>
                    </div>
                  ) : null}
                </li>
              ))}
            </ul>
          </nav>

          <div className="flex shrink-0 items-center gap-2 sm:gap-4">
            <Link
              href="/faca-parte"
              className={`inline-flex shrink-0 items-center rounded-md border px-2.5 py-2 text-[10px] font-semibold uppercase tracking-[0.12em] transition lg:hidden ${
                isScrolled
                  ? "border-[color:var(--color-gold-500)] bg-[color:var(--color-gold-500)] text-black shadow-[0_0_24px_rgba(212,175,55,0.22)]"
                  : "border-[color:var(--color-gold-500)]/80 text-[color:var(--color-gold-500)] shadow-[0_8px_24px_rgba(0,0,0,0.22)] hover:bg-[color:var(--color-gold-500)] hover:text-black"
              }`}
            >
              Faça Parte
            </Link>

            <button className="shrink-0 p-1 text-white lg:hidden" onClick={() => setOpen((v) => !v)}>
              {open ? <X size={26} /> : <Menu size={26} />}
            </button>

            <Link
              href="/faca-parte"
              className={`hidden items-center rounded-md border px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.14em] transition duration-300 lg:inline-flex ${
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

      {open && <div className="fixed inset-0 z-30 bg-black/80 backdrop-blur-sm lg:hidden" onClick={() => setOpen(false)} />}

      {open && (
        <div className="fixed left-0 top-16 z-50 max-h-[calc(100vh-4rem)] w-full overflow-y-auto border-t border-white/10 bg-black sm:top-20 sm:max-h-[calc(100vh-5rem)] lg:hidden">
          <nav className="flex flex-col items-center gap-6 px-6 py-6">
            {navItems.map((item) => (
              <div key={item.label} className="flex flex-col items-center gap-4">
                <Link
                  href={item.href}
                  className={`text-lg uppercase tracking-[0.12em] ${
                    isActive(item.activePath) ? "text-[color:var(--color-gold-500)]" : "text-white"
                  }`}
                  onClick={() => setOpen(false)}
                >
                  {item.label}
                </Link>
                {item.children?.map((child) => (
                  <Link
                    key={child.href}
                    href={child.href}
                    className={`text-sm font-semibold uppercase tracking-[0.12em] ${
                      isActive(child.activePath) ? "text-[color:var(--color-gold-500)]" : "text-white/70"
                    }`}
                    onClick={() => setOpen(false)}
                  >
                    {child.label}
                  </Link>
                ))}
              </div>
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
