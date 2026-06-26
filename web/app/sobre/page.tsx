import Image from "next/image";
import Link from "next/link";
import type { ComponentType, SVGProps } from "react";
import {
  ResponsabilidadeIcon,
  Handshake,
  HeartHandshake,
  Scale,
  Shield,
  UsersRound,
} from "@/components/ui/icons/icons";
import { Reveal } from "@/components/ui/Reveal";
import { DeaconIcon } from "@/components/ui/icons/icons";
import { PriestIcon } from "@/components/ui/icons/icons";
import { BishopIcon } from "@/components/ui/icons/icons";
import { CardinalIcon } from "@/components/ui/icons/icons";
import { PapaIcon } from "@/components/ui/icons/icons";

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

const values = [
  "RESPONSABILIDADE",
  "RESPEITO",
  "FAMÍLIA",
  "FILANTROPIA",
  "IRMANDADE",
];

const identityCards = [
  {
    label: "Nome",
    title: "OS PAPAS",
    text: "O nome surgiu como uma forma de homenagear o amigo Papa XXIII, devido sua experiência no motociclismo, e a palavra Papas, do grego Pappas, era utilizada carinhosamente para designar a figura do Pai.",
  },
  {
    label: "Irmandade",
    title: "FRATRES IN VIA",
    text: "Como todos são filhos do Pai, assim, nos tornaríamos IRMÃOS NA ESTRADA, cuja frase em latim “FRATRES IN VIA” escolhida por nosso vice, Da Pop, está representada em nosso Brasão.",
  },
];

const hierarchy = [
  {
    icon: PapaIcon,
    title: "Papa",
    description:
      "O Papa representa o mais alto nível de hierarquia dentro do Moto Clube. São membros de extrema confiança, normalmente fundadores, líderes ou integrantes que possuem grande respeito e responsabilidade dentro da organização, podendo também atuar como representantes nômades do Moto Clube.",
  },
  {
    icon: CardinalIcon,
    title: "Cardeal",
    description:
      "O Cardeal é um membro escudado, que já recebeu o brasão completo do Moto Clube em seu colete. Esse nível representa confiança, lealdade e comprometimento comprovado com a irmandade e seus valores.",
  },
  {
    icon: BishopIcon,
    title: "Bispo",
    description:
      "O Bispo é o membro que já conquistou maior reconhecimento dentro do clube. Ele passa a utilizar o nome \"Os Papas\" na parte superior do colete, demonstrando que já possui maior nível de pertencimento e responsabilidade dentro da estrutura do Moto Clube.",
  },
  {
    icon: PriestIcon,
    title: "Padre",
    description:
      "O Padre é o membro que já foi oficialmente aceito na irmandade. Ele passa a utilizar no colete a identificação do país e da cidade do capítulo ao qual pertence, representando sua base e sua ligação com o Moto Clube.",
  },
  {
    icon: DeaconIcon,
    title: "Diácono",
    description:
      "O Diácono é o membro em período de avaliação dentro do Moto Clube. Nesta fase ele demonstra comprometimento, disciplina e alinhamento com os valores do clube. Ainda não utiliza identificação no colete, pois está em processo de aprendizado e integração com a irmandade.",
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
            <h1 className="mt-3 text-balance font-heading text-4xl uppercase tracking-[0.04em] text-white sm:text-6xl lg:text-7xl">
              Irmandade, estrada e tradição
            </h1>
          </div>
        </div>
      </section>

      <Reveal>
        <section className="mx-auto w-full max-w-6xl px-6 py-16 lg:py-20">
          <p className="text-xs uppercase tracking-[0.16em] text-[color:var(--color-gold-500)]">Quem Somos</p>
          <h2 className="mt-4 max-w-4xl font-heading text-5xl uppercase leading-[0.95] tracking-[0.05em] text-[color:var(--color-text-100)] sm:text-6xl lg:text-7xl">
            Estrada, Irmandade e Tradição
          </h2>
          <p className="mt-6 max-w-6xl whitespace-pre-line text-justify text-base leading-6 text-[color:var(--color-text-300)] sm:text-lg">
            {`Cinco amigos motociclistas...

Unidos por laços de afinidade...

No intervalo de um almoço, no restaurante Yamaga, em Ananindeua-PA, conversavam como fariam para fazer seus passeios de moto, se carregariam algum Brasão em seus coletes ou usariam coletes lisos. Foi assim que surgiu a ideia de montar um grupo, um moto clube. Dessa forma, em 20 de setembro de 2014 nasceu o MC OS PAPAS, entidade sem funs lucrativos, construída sob a forma de assosiação.`}
          </p>
          <div className="mt-8 grid gap-6 sm:mt-10 lg:grid-cols-2">
            {identityCards.map((card) => (
              <article key={card.title} className="rounded-xl border border-white/10 bg-[color:var(--color-bg-900)] p-6 sm:p-8">
                <p className="text-xs uppercase tracking-[0.14em] text-[color:var(--color-gold-500)]">{card.label}</p>
                <h3 className="mt-3 font-heading text-3xl uppercase tracking-[0.05em] text-white sm:text-4xl">{card.title}</h3>
                <p className="mt-4 text-sm leading-7 text-[color:var(--color-text-300)]">{card.text}</p>
              </article>
            ))}
          </div>
        </section>
      </Reveal>

      <Reveal>
        <section className="mx-auto w-full max-w-6xl px-6 py-16">
          <p className="text-xs uppercase tracking-[0.14em] text-[color:var(--color-gold-500)]">Objetivo</p>
          <h2 className="mt-3 font-heading text-4xl uppercase tracking-[0.05em] text-white sm:text-5xl">Propósitos do Moto Clube</h2>
          {/* Mantém a seção mais estreita para reduzir a largura de leitura
              e deixar os propósitos mais leves de percorrer. */}
          <div className="mx-auto mt-8 grid max-w-5xl gap-3">
            {[
              "Promover e proporcionar aos seus associados, atividades recreativas, sociais e esportivas.",
              "Promover viagens, reuniões e eventos ligados ao motociclismo, no Brasil e no Exterior.",
              "Promover e divulgar o Motociclismo como esporte sadio, bem como suas normas de segurança.",
              "Buscar a fraternidade entre motociclistas em geral, promovendo a integração com outros motociclistas, moto grupos e moto clubes, participando de eventos destinados aos mesmos.",
              "Empreender atividades e eventos educativos e culturais, destinados à filantropia e de ajuda à pessoas carentes e outras finalidades afins.",
              "Receber e apoiar motociclistas estradeiros que porventura necessitem de apoio ou passem pela cidade onde está localizada a sede.",
            ].map((purpose) => (
              <article key={purpose} className="rounded-xl border border-white/10 bg-[color:var(--color-bg-900)] p-5 sm:p-6">
                <p className="text-sm leading-7 text-[color:var(--color-text-200)] sm:text-base sm:leading-8">{purpose}</p>
              </article>
            ))}
          </div>
        </section>
      </Reveal>

      <Reveal>
        <section className="mx-auto w-full max-w-6xl px-6 py-6 sm:py-8">
          <div className="overflow-hidden rounded-[28px] border border-[color:var(--color-gold-500)]/18 bg-[linear-gradient(180deg,rgba(20,20,20,0.96)_0%,rgba(11,11,11,0.98)_100%)] px-6 py-8 sm:px-8 sm:py-10 lg:px-10 lg:py-12">
            <div className="grid items-center gap-10 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:gap-14">
              <div className="flex justify-center lg:justify-start">
                <div className="relative w-full max-w-[220px] sm:max-w-[280px] lg:max-w-[340px]">
                  <div className="absolute inset-0 rounded-full bg-[color:var(--color-gold-500)]/12 blur-3xl" />
                  <Image
                    src="/images/geral/opsop.png"
                    alt="Emblema OPSOP do MC Os Papas"
                    width={680}
                    height={680}
                    className="relative h-auto w-full object-contain drop-shadow-[0_18px_40px_rgba(0,0,0,0.35)]"
                  />
                </div>
              </div>

              <div className="max-w-2xl text-center lg:text-left">
                <p className="text-xs uppercase tracking-[0.16em] text-[color:var(--color-gold-500)]">Símbolo da Irmandade</p>
                <h2 className="mt-3 font-heading text-4xl uppercase tracking-[0.05em] text-white sm:text-5xl">OPSOP</h2>
                <p className="mt-5 text-lg uppercase tracking-[0.18em] text-[color:var(--color-gold-500)] sm:text-xl">
                  Os Papas Sempre Os Papas
                </p>
                <p className="mt-6 text-sm leading-8 text-[color:var(--color-text-300)] sm:text-base">
                  Mais do que uma sigla, OPSOP representa permanência, lealdade e identidade. É a lembrança de que,
                  independentemente da estrada, da distância ou do tempo, quem carrega a essência da irmandade segue sendo Os
                  Papas — sempre com honra, respeito e compromisso com o Moto Clube.
                </p>
              </div>
            </div>
          </div>
        </section>
      </Reveal>

      <Reveal>
        <section className="mx-auto w-full max-w-6xl px-6 py-10">
          <p className="text-xs uppercase tracking-[0.14em] text-[color:var(--color-gold-500)]">Insígnias</p>
          <h2 className="mt-3 font-heading text-4xl uppercase tracking-[0.05em] text-white sm:text-5xl">Brasão do Moto Clube</h2>
          <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
            {coatOfArmsItems.map((item) => {
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
        <section className="mx-auto w-full max-w-6xl px-6 py-10">
          <p className="text-xs uppercase tracking-[0.14em] text-[color:var(--color-gold-500)]">Princípios</p>
          <h2 className="mt-3 font-heading text-4xl uppercase tracking-[0.05em] text-white sm:text-5xl">Valores do Moto Clube</h2>
          <div className="mt-6 grid grid-cols-1 justify-items-center gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
            {values.map((value) => {
              const iconMap: Record<string, ComponentType<SVGProps<SVGSVGElement>>> = {
                RESPONSABILIDADE: ResponsabilidadeIcon,
                RESPEITO: Scale,
                FAMÍLIA: UsersRound,
                FILANTROPIA: HeartHandshake,
                IRMANDADE: Handshake,
              };
              const Icon = iconMap[value] ?? Shield;

              return (
                <article key={value} className="w-full rounded-xl border border-white/10 bg-[color:var(--color-bg-900)] p-6 text-center">
                  <div className="mb-4 flex justify-center">
                    <Icon width={32} height={32} className="text-[color:var(--color-gold-500)]" />
                  </div>
                  <h3 className="break-normal text-center font-heading text-2xl uppercase tracking-[0.01em] text-white [overflow-wrap:break-word]">
                    {value}
                  </h3>
                </article>
              );
            })}
          </div>
        </section>
      </Reveal>

      <Reveal>
        <section className="mx-auto max-w-5xl space-y-12 px-4 py-16 text-center sm:px-6">
          <div className="space-y-4">
            <p className="text-xs uppercase tracking-[0.14em] text-[color:var(--color-gold-500)]">Lema do Moto Clube</p>
            <h2 className="text-3xl font-heading uppercase tracking-[0.06em] text-white">
              Sempre haverá um de nós na estrada
            </h2>
          </div>

          <div className="space-y-4 border-t border-white/10 pt-8">
            <p className="text-xs uppercase tracking-[0.14em] text-[color:var(--color-gold-500)]">Missão do Moto Clube</p>
            <h2 className="text-3xl font-heading uppercase tracking-[0.06em] text-white">
              Vivenciar a cultura do motociclismo estradeiro em prol da filantropia e o bem estar social
            </h2>
          </div>

          <div className="space-y-4 border-t border-white/10 pt-8">
            <p className="text-xs uppercase tracking-[0.14em] text-[color:var(--color-gold-500)]">Visão do Moto Clube</p>
            <h2 className="text-3xl font-heading uppercase tracking-[0.06em] text-white">
              Ter um membro que se identifique com nossos valores em cada estado do Brasil
            </h2>
          </div>
        </section>
      </Reveal>

      <Reveal>
        <section className="mx-auto w-full max-w-6xl px-6 py-16">
          <p className="text-xs uppercase tracking-[0.14em] text-[color:var(--color-gold-500)]">Estrutura</p>
          <h2 className="mt-3 font-heading text-4xl uppercase tracking-[0.05em] text-white sm:text-5xl">Hierarquia do Moto Clube</h2>
          <div className="mt-8 flex flex-wrap justify-center gap-6">
            {hierarchy.map((item) => {
              const Icon = item.icon;
              return (
                <article key={item.title} className="w-[260px] rounded-xl border border-white/10 bg-[color:var(--color-bg-900)] p-6 text-center">
                  <Icon width={50} height={50} className="text-[color:var(--color-gold-500)]" />
                  <h3 className="mt-4 font-heading text-3xl uppercase tracking-[0.04em] text-white">{item.title}</h3>
                  <p className="mt-3 text-sm leading-7 text-[color:var(--color-text-300)]">{item.description}</p>
                </article>
              );
            })}
          </div>
        </section>
      </Reveal>

      <Reveal>
        <section className="mx-auto w-full max-w-6xl px-6 py-16">
          <div className="rounded-xl border border-white/10 bg-[color:var(--color-bg-900)] p-6 sm:p-8">
            <p className="text-xs uppercase tracking-[0.14em] text-[color:var(--color-gold-500)]">Membros</p>
            <h2 className="mt-3 font-heading text-4xl uppercase tracking-[0.05em] text-white sm:text-5xl">Diretoria</h2>
            <p className="mt-5 max-w-3xl text-sm leading-7 text-[color:var(--color-text-300)] sm:text-base sm:leading-8">
              Conheça a Diretoria responsável por conduzir o Moto Clube Os Papas, preservando sua história, seus valores e sua irmandade.
            </p>
            <Link
              href="/diretoria"
              className="mt-7 inline-flex rounded-md border border-[color:var(--color-gold-500)] px-5 py-2.5 text-sm font-semibold uppercase tracking-[0.12em] text-[color:var(--color-gold-500)] transition hover:bg-[color:var(--color-gold-500)] hover:text-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--color-gold-500)] focus-visible:ring-offset-2 focus-visible:ring-offset-[color:var(--color-bg-900)]"
            >
              Conhecer Diretoria
            </Link>
          </div>
        </section>
      </Reveal>
    </div>
  );
}
