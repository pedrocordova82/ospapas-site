import Image from "next/image";
import { Crown, KeyRound, Landmark, Shield, Route, Handshake, Heart, HeartHandshake, Scale } from "lucide-react";
import { Reveal } from "@/components/ui/Reveal";

const coatOfArmsItems = [
  {
    title: "O BRASÃO",
    description: "Representa liderança espiritual, responsabilidade e compromisso com a irmandade.",
    image: "/images/sobre/brasao.png",
  },
  {
    title: "OS PAPAS",
    description: "A palavra \"Papas\", do grego, era utilizada carinhosamente para designar a figura do Pai.",
    image: "/images/sobre/os-papas.png",
  },
  {
    title: "FRATRES IN VIA v",
    description: "O lema do MC é representado pela frase \"Fratres in via\", do latim \"Irmãos na estrada\". O V representa os 5 membros fundadores.",
    image: "/images/sobre/fratres-in-via.png",
  },
  {
    title: "CHAVES",
    description: "As chaves simbolizam a mudança, a abertura que nos permite acessar o outro lado, e também o fechamento. Em seu duplo papel, fazem referência ao 6exito, sabedoria e libertação.",
    image: "/images/sobre/chaves.png",
  },
  {
    title: "MITRA",
    description: "A Mitra simboliza o capacete de defesa contra os adversários da verdade, a qual sempre defenderemos.",
    image: "/images/sobre/mitra.png",
  },
  {
    title: "FÊNIX",
    description: "A Fênix, conhecida por nascer das cinzas, faz alusão à união dos membros fundadores em prol da criação do MC. Representando, assim, um novo nascimento.",
    image: "/images/sobre/fenix.png",
  },
  {
    title: "ESCUDO",
    description: "O escudo, além de proteger, remete ao orgulho, a exemplo dos guerreiros nos tempos antigos, que ostentavam-os com grande honra e combate.",
    image: "/images/sobre/escudo.png",
  },
];

const values = ["IRMANDADE", "ESTRADA", "RESPEITO", "FILANTROPIA", "LEALDADE"];

const leadership = [
  {
    name: "Poodle",
    rank: "Diretor - Cardeal",
    chapter: "Brasília",
    image: "/images/brasilia/members/joao.jpg",
  },
  {
    name: "Mendes",
    rank: "Capitão",
    chapter: "Brasília",
    image: "/images/brasilia/members/carlos.jpg",
  },
  {
    name: "Oliveira",
    rank: "Road Captain",
    chapter: "Brasília",
    image: "/images/brasilia/members/marcos.jpg",
  },
  {
    name: "Conselho",
    rank: "Diretoria Institucional",
    chapter: "Sede Nacional",
    image: "/images/geral/logo-ospapas.png",
  },
];

export default function SobrePage() {
  return (
    <div className="pb-16">
      <section className="relative isolate min-h-[48vh] overflow-hidden border-b border-white/10">
        <Image
          src="/images/sobre/capa_sobre.png"
          alt="Moto Clube Os Papas"
          fill
          priority
          className="object-cover"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(11,11,11,0.44)_0%,rgba(11,11,11,0.92)_100%)]" />

        <div className="relative mx-auto flex min-h-[48vh] w-full max-w-6xl items-end px-4 py-12 sm:px-6 lg:px-8">
          <div>
            <p className="text-base uppercase tracking-[0.16em] text-[color:var(--color-gold-500)]">Sobre o Moto Clube</p>
            <h1 className="mt-3 font-heading text-5xl uppercase tracking-[0.04em] text-white sm:text-6xl lg:text-7xl">
              Irmandade, estrada e tradição
            </h1>
          </div>
        </div>
      </section>

      <Reveal>
        <section className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
          <p className="text-xs uppercase tracking-[0.14em] text-[color:var(--color-gold-500)]">Origem</p>
          <h2 className="mt-3 font-heading text-4xl uppercase tracking-[0.05em] text-white sm:text-5xl">A história do Moto Clube</h2>
          <div className="mx-auto mt-8 max-w-4xl text-center text-sm leading-8 text-[color:var(--color-text-300)] sm:text-base">
            <p>
              O Os Papas MC nasceu da união de motociclistas que encontraram na estrada muito mais do que destino: encontraram
              propósito. A fundação do clube veio da vontade de construir uma irmandade sólida, baseada em respeito, lealdade e
              compromisso com a comunidade.
            </p>
            <p className="mt-4">
              Ao longo do tempo, cada sede e regional fortaleceu esse espírito, preservando tradição e disciplina, sem perder o
              senso de liberdade que define a cultura biker. Hoje, o motoclube segue firme, conectando irmãos por todo o Brasil.
            </p>
          </div>
        </section>
      </Reveal>

      <Reveal>
        <section className="mx-auto w-full max-w-6xl px-4 pb-16 sm:px-6 lg:px-8">
          <div className="grid gap-8 lg:grid-cols-2">
            <article className="rounded-xl border border-white/10 bg-[color:var(--color-bg-900)] p-8">
              <p className="text-xs uppercase tracking-[0.14em] text-[color:var(--color-gold-500)]">NOME</p>
              <h3 className="mt-3 font-heading text-4xl uppercase tracking-[0.05em] text-white">OS PAPAS</h3>
              <p className="mt-4 text-sm leading-7 text-[color:var(--color-text-300)]">
                O nome surgiu como uma forma de homenagear o amigo Papa XXIII, devido sua experiência no motociclismo, e a palavra Papas, do grego Pappas,
                era utilizada carinhosamente para designar a figura do Pai.
              </p>
            </article>

            <article className="rounded-xl border border-white/10 bg-[color:var(--color-bg-900)] p-8">
              <p className="text-xs uppercase tracking-[0.14em] text-[color:var(--color-gold-500)]">IRMANDADE</p>
              <h3 className="mt-3 font-heading text-4xl uppercase tracking-[0.05em] text-white">FRATRES IN VIA</h3>
              <p className="mt-4 text-sm leading-7 text-[color:var(--color-text-300)]">
                Como todoso são filhos do Pai, assim, nos tornaríamos IRMÃOS NA ESTRADA, cuja frase em latim "FRATRES IN VIA" escolhida por nosso vice, Da Pop,
                está representada em nosso Brasão.
              </p>
            </article>
          </div>
        </section>
      </Reveal>

      <Reveal>
        <section className="mx-auto w-full max-w-6xl px-4 pb-16 sm:px-6 lg:px-8">
          <p className="text-xs uppercase tracking-[0.14em] text-[color:var(--color-gold-500)]">Símbolos</p>
          <h2 className="mt-3 font-heading text-4xl uppercase tracking-[0.05em] text-white sm:text-5xl">Brasão do Moto Clube</h2>
          <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
            {coatOfArmsItems.map((item) => {
              const Icon = item.icon;
              return (
                <article key={item.title} className="rounded-xl border border-white/10 bg-[color:var(--color-bg-900)] p-6">
                  <Image
                    src={item.image}
                    alt={item.title}
                    width={100}
                    height={100}
                    className="mb-4 object-contain"
                  />
                  <h3 className="mt-4 font-heading text-3xl uppercase tracking-[0.05em] text-white">{item.title}</h3>
                  <p className="mt-3 text-sm leading-7 text-[color:var(--color-text-300)]">{item.description}</p>
                </article>
              );
            })}
          </div>
        </section>
      </Reveal>

      <Reveal>
        <section className="mx-auto w-full max-w-6xl px-4 pb-16 sm:px-6 lg:px-8">
          <p className="text-xs uppercase tracking-[0.14em] text-[color:var(--color-gold-500)]">Princípios</p>
          <h2 className="mt-3 font-heading text-4xl uppercase tracking-[0.05em] text-white sm:text-5xl">Valores do Moto Clube</h2>
          <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-5">
            {values.map((value) => {
              const iconMap: Record<string, typeof Shield> = {
                IRMANDADE: Handshake,
                ESTRADA: Route,
                RESPEITO: Scale,
                FILANTROPIA: HeartHandshake,
                LEALDADE: Heart,
              };
              const Icon = iconMap[value] ?? Shield;

              return (
                <article key={value} className="rounded-xl border border-white/10 bg-[color:var(--color-bg-900)] p-6 text-center">
                  <Icon size={30} className="mx-auto text-[color:var(--color-gold-500)]" />
                  <h3 className="mt-4 font-heading text-3xl uppercase tracking-[0.04em] text-white">{value}</h3>
                </article>
              );
            })}
          </div>
        </section>
      </Reveal>

      <Reveal>
        <section className="mx-auto w-full max-w-6xl px-4 pb-16 text-center sm:px-6 lg:px-8">
          <p className="text-base uppercase tracking-[0.14em] text-[color:var(--color-gold-500)]">Máxima do Moto Clube</p>
          <h2 className="mt-3 font-heading text-5xl uppercase tracking-[0.06em] text-white sm:text-3xl">Sempre haverá um de nós na estrada</h2>
          <p className="text-base uppercase tracking-[0.14em] text-[color:var(--color-gold-500)]">Missão do Moto Clube</p>
          <h2 className="mt-3 font-heading text-5xl uppercase tracking-[0.06em] text-white sm:text-3xl">Vivenciar a cultura do motociclismo estradeiro em prol da filantropia e o bem estar social</h2>
          <p className="text-base uppercase tracking-[0.14em] text-[color:var(--color-gold-500)]">Visão do Moto Clube</p>
          <h2 className="mt-3 font-heading text-5xl uppercase tracking-[0.06em] text-white sm:text-3xl">Ter um membro que se identifique com nossos valores em cada Estado do Brasil</h2>
        </section>
      </Reveal>

      <Reveal>
        <section className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">
          <p className="text-xs uppercase tracking-[0.14em] text-[color:var(--color-gold-500)]">Direção</p>
          <h2 className="mt-3 font-heading text-4xl uppercase tracking-[0.05em] text-white sm:text-5xl">Diretoria</h2>
          <div className="mt-8 grid grid-cols-1 gap-10 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {leadership.map((leader) => (
              <article key={leader.name} className="group text-center">
                <div className="overflow-hidden rounded-lg aspect-[2/3] shadow-lg shadow-black/40">
                  <div className="relative h-full w-full">
                    <Image
                      src={leader.image}
                      alt={leader.name}
                      fill
                      className="object-cover transition duration-300 group-hover:scale-[1.03]"
                    />
                  </div>
                </div>
                <div className="mt-3 text-center">
                  <p className="font-semibold text-white">{leader.name}</p>
                  <p className="text-sm text-[color:var(--color-gold-500)]">{leader.rank}</p>
                  <p className="mt-1 text-sm text-[color:var(--color-text-300)]">{leader.chapter}</p>
                </div>
              </article>
            ))}
          </div>
        </section>
      </Reveal>
    </div>
  );
}
