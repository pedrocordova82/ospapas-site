"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Menu, X } from "lucide-react"

const navItems = [
  { label: "Sobre", href: "#sobre" },
  { label: "Sedes", href: "#sedes" },
  { label: "Eventos", href: "#eventos" },
  { label: "Filantropia", href: "#filantropia" },
  { label: "Contato", href: "#contato" },
]

export function Header() {
  const [open, setOpen] = useState(false)

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-white/10 bg-[color:var(--color-bg-900)]/85 backdrop-blur">
        <div className="mx-auto flex h-20 w-full max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 text-[color:var(--color-text-100)]">
            <Image
              src="/logo-ospapas.png"
              alt="Logo do MC Os Papas"
              width={40}
              height={40}
            />
            <div className="flex flex-col">
              <span className="font-heading text-3xl leading-none tracking-[0.08em]">
                MC OS PAPAS
              </span>
              <span className="text-[10px] uppercase tracking-[0.2em] text-[color:var(--color-gold-500)]">
                FRATRES IN VIA
              </span>
            </div>
          </Link>

          {/* Menu Desktop */}
          <nav
            aria-label="Navegacao principal"
            className="hidden md:block"
          >
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

          {/* Área direita */}
          <div className="flex items-center gap-4">

            {/* Botão Mobile */}
            <button
              className="md:hidden text-white"
              onClick={() => setOpen(!open)}
            >
              {open ? <X size={26} /> : <Menu size={26} />}
            </button>

            {/* Botão Desktop */}
            <a
              href="#entrar"
              className="hidden md:inline-block rounded-md border border-[color:var(--color-gold-500)] px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-[color:var(--color-gold-500)] transition hover:bg-[color:var(--color-gold-500)] hover:text-black"
            >
              Como Entrar
            </a>

          </div>
        </div>
      </header>

      {/* Overlay escuro */}
      {open && (
        <div
        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-30"
        onClick={() => setOpen(false)}
        />
      )}
      
      
      {/* Menu Mobile */}
      {open && (
        <div className="md:hidden fixed top-20 left-0 w-full bg-black border-t border-white/10 z-50">
          <nav className="flex flex-col items-center py-6 gap-6">
            {navItems.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="text-white text-lg uppercase tracking-[0.12em]"
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
  )
}