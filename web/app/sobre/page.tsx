import Image from "next/image";
import type { Metadata } from "next";
import {
  ResponsabilidadeIcon,
  Handshake,
  HeartHandshake,
  Scale,
  UsersRound,
} from "@/components/ui/icons/icons";
import { Reveal } from "@/components/ui/Reveal";
import { DeaconIcon } from "@/components/ui/icons/icons";
import { PriestIcon } from "@/components/ui/icons/icons";
import { BishopIcon } from "@/components/ui/icons/icons";
import { CardinalIcon } from "@/components/ui/icons/icons";
import { PapaIcon } from "@/components/ui/icons/icons";

export const metadata: Metadata = {
  title: "Quem Somos | MC Os Papas",
  description: "Conheça a história, os valores e a irmandade do Moto Clube Os Papas.",
};

const coatOfArmsImage = "/images/sobre/brasao.png";

const coatOfArmsItems = [
  {
    title: "OS PAPAS",
    description: "Historicamente a palavra \"Papas\", do grego Pappas, era utilizada carinhosamente para designar a figura do Pai, pois todos nós somos filhos do Pai, e assim nos tornamos “Irmãos na Estrada”",
    image: "/images/sobre/os-papas.png",
  },
  {
    title: "ESCUDO",
    description: "O escudo é um símbolo universal de proteção, defesa, segurança, honra e disciplina, historicamente usado para resguardar guerreiros em combate. Na heráldica representa identidade, nobreza e alianças familiares. Nesse contexto nosso Brasão possui dois escudos, que representam de forma honrosa cada um de seus membros, e reforça a ideia da participação de nossas Famílias no Moto Clube.",
    image: "/images/sobre/escudo.png",
  },
  {
    title: "CHAVES",
    description: "As chaves possuem um duplo papel, ou seja, de abertura e fechamento, uma vez que permitem encontrar o outro lado, no caso de portas, cofres e tudo que contenha uma fechadura. Assim, em dupla, simbolizam os objetos relacionados às mudanças, ao êxito, à libertação, à sabedoria, ao conhecimento, à prosperidade e ao mistério.",
    image: "/images/sobre/chaves.png",
  },
  {
    title: "MITRA",
    description: "Palavra de origem grega, para designar a cobertura de cabeça litúrgica usada pelos bispos (sucessores dos apóstolos) e pelo Papa em celebrações solenes, como insígnia de autoridade e dignidade. Na mitologia foi um Deus da luz, justiça e aliança, representando a verdade e a disciplina, valores que o MC OS PAPAS defendem.",
    image: "/images/sobre/mitra.png",
  },
  {
    title: "FÊNIX",
    description: "A Fênix é uma ave mitológica que simboliza o renascimento, a imortalidade e o triunfo da vida sobre a morte. Ao se incendiar e renascer das próprias cinzas, simboliza a capacidade de superação, esperança e o eterno recomeço, fazendo assim alusão a decisão de seus membros fundadores, em se unirem na criação do MC OS PAPAS, representando assim, um novo nascimento.",
    image: "/images/sobre/fenix.png",
  },
  {
    title: "FRATRES IN VIA v",
    description: "Como todos somos filhos do Pai, nos tornamos assim “Irmãos de Estrada”, que em latim é “FRATRES IN VIA”. O numeral V, em romano, significa os 5 fundadores do Moto Clube",
    image: "/images/sobre/fratres-in-via.png",
  },
];

const values = [
  {
    id: "respeito",
    label: "RESPEITO",
    Icon: ResponsabilidadeIcon,
  },
  {
    id: "igualdade",
    label: "IGUALDADE",
    Icon: Scale,
  },
  {
    id: "irmandade",
    label: "IRMANDADE",
    Icon: Handshake,
  },
  {
    id: "filantropia",
    label: "FILANTROPIA",
    Icon: HeartHandshake,
  },
  {
    id: "familia",
    label: "FAMÍLIA",
    Icon: UsersRound,
  },
];

const identityCards = [
  {
    label: "E por que OS PAPAS?",
    title: "OS PAPAS",
    text: "O nome seria uma forma de homenagem a um dos fundadores, Papa XXIII, devido a sua experiência no motociclismo. Historicamente a palavra “Papas”, do grego Pappas, era utilizada carinhosamente para designar a figura do Pai, pois todos nós somos filhos do Pai.",
  },
  {
    label: "Irmandade",
    title: "FRATRES IN VIA",
    text: "Como todos somos filhos do Pai, nos tornamos assim “Irmãos de Estrada”, que em latim é “FRATRES IN VIA”, frase escolhida a época, por um dos fundadores, “Da Pop”, e que está representada em nosso Brasão.",
  },
];

const founders = [
  {
    id: "cangaceiro",
    name: "Cangaceiro",
    image: "/images/fundadores/Cangaceiro.jpg",
    alt: "Foto histórica de Cangaceiro, fundador do MC Os Papas",
  },
  {
    id: "carnica",
    name: "Carniça",
    image: "/images/fundadores/Carniça.jpg",
    alt: "Foto histórica de Carniça, fundador do MC Os Papas",
  },
  {
    id: "da-pop",
    name: "Da Pop",
    image: "/images/fundadores/Da-Pop.jpg",
    alt: "Foto histórica de Da Pop, fundador do MC Os Papas",
    objectPosition: "center top",
  },
  {
    id: "papa-xxiii",
    name: "Papa XXIII",
    image: "/images/fundadores/Papa-XXIII.jpg",
    alt: "Foto histórica de Papa XXIII, fundador do MC Os Papas",
  },
  {
    id: "tio-chico",
    name: "Tio Chico",
    image: "/images/fundadores/Tio-Chico.jpg",
    alt: "Foto histórica de Tio Chico, fundador do MC Os Papas",
  },
];

const hierarchy = [
  {
    icon: PapaIcon,
    title: "Papa",
    description:
      "Representa o mais alto nível de hierarquia dentro do Moto Clube. São membros de extrema confiança, normalmente fundadores, ex-líderes ou integrantes que possuem grande respeito e responsabilidade dentro da organização, podendo também atuar como representantes nômades do Moto Clube.",
  },
  {
    icon: CardinalIcon,
    title: "Cardeal",
    description:
      "Conhecido no mundo do motociclismo como “Colete Fechado”, é um membro escudado, que já recebeu o brasão completo do Moto Clube em seu colete. Esse nível representa confiança, lealdade e comprometimento comprovado com a irmandade, bem como com seus valores.",
  },
  {
    icon: BishopIcon,
    title: "Bispo",
    description:
      "Conhecido no mundo do motociclismo como “Meio Escudo”, é o membro que já conquistou maior reconhecimento dentro do clube. Ele passa a carregar em seu colete a inscrição \“OS PAPAS\", demonstrando que já possui maior nível de pertencimento e responsabilidade dentro da estrutura do Moto Clube.",
  },
  {
    icon: PriestIcon,
    title: "Padre",
    description:
      "Conhecido no mundo do motociclismo como “PP” (Pretendente a Participante), é o membro que já foi oficialmente aceito na irmandade. Ele passa a utilizar no colete a identificação do seu País e da cidade de origem da Sede a que pertence, representando sua ligação com o Moto Clube.",
  },
  {
    icon: DeaconIcon,
    title: "Diácono",
    description:
      "Conhecido no mundo do motociclismo como “Hangout” ou “Hang Around”, é o membro em período de avaliação dentro do Moto Clube. Nesta fase ele deve demonstrar comprometimento, disciplina e alinhamento com os valores do clube, e sendo assim, ainda não carrega os símbolos do Moto Clube, pois está em processo de aprendizado e integração com a irmandade.",
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
            <p className="text-base uppercase tracking-[0.16em] text-[color:var(--color-gold-500)]">Quem Somos</p>
            <h1 className="mt-3 text-balance font-heading text-4xl uppercase tracking-[0.04em] text-white sm:text-6xl lg:text-7xl">
              Irmandade, filantropia e estrada
            </h1>
          </div>
        </div>
      </section>

      <Reveal>
        <section className="mx-auto w-full max-w-6xl px-6 py-16 lg:py-20">
          <p className="text-xs uppercase tracking-[0.16em] text-[color:var(--color-gold-500)]">Nossa Origem</p>
          <h2 className="mt-4 max-w-4xl font-heading text-5xl uppercase leading-[0.95] tracking-[0.05em] text-[color:var(--color-text-100)] sm:text-6xl lg:text-7xl">
            Como Tudo Começou
          </h2>
          <p className="mt-6 max-w-6xl whitespace-pre-line text-justify text-base leading-6 text-[color:var(--color-text-300)] sm:text-lg">
            {`Cinco amigos motociclistas, unidos por laços de afinidade...

No intervalo de um almoço, no restaurante Yamaga, na cidade de Ananindeua, no Estado do Pará, conversavam como fariam para fazer seus passeios de moto, se carregariam algum Brasão em seus coletes ou usariam coletes lisos. Foi assim que surgiu a ideia de montar um grupo, um Moto Clube. Dessa forma, em 20 de setembro de 2014 nasceu o MC OS PAPAS, entidade sem fins lucrativos, construída sob a forma de Associação.`}
          </p>

          <section
            aria-labelledby="founders-title"
            className="mt-12 border-t border-white/10 pt-10"
          >
            <h3
              id="founders-title"
              className="font-heading text-3xl uppercase tracking-[0.05em] text-white sm:text-4xl"
            >
              Os Cinco Fundadores
            </h3>
            <ul className="mt-6 grid grid-cols-1 gap-4 min-[360px]:grid-cols-2 md:grid-cols-3 xl:grid-cols-5">
              {founders.map((founder) => (
                <li key={founder.id}>
                  <article className="h-full overflow-hidden rounded-lg border border-white/10 bg-[color:var(--color-bg-900)]">
                    <div className="relative aspect-[3/4] overflow-hidden bg-black/30">
                      <Image
                        src={founder.image}
                        alt={founder.alt}
                        fill
                        className="object-cover"
                        style={{ objectPosition: founder.objectPosition ?? "center center" }}
                        sizes="(max-width: 359px) 100vw, (max-width: 767px) 50vw, (max-width: 1279px) 33vw, 20vw"
                      />
                    </div>
                    <h4 className="border-t border-[color:var(--color-gold-500)]/25 px-4 py-4 text-base font-semibold text-white">
                      {founder.name}
                    </h4>
                  </article>
                </li>
              ))}
            </ul>
          </section>

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
        <section className="mx-auto w-full max-w-6xl px-6 py-10">
          <p className="text-xs uppercase tracking-[0.14em] text-[color:var(--color-gold-500)]">Símbolos</p>
          <div className="mt-2 flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-5">
            <h2 className="max-w-2xl font-heading text-4xl uppercase tracking-[0.05em] text-white sm:text-5xl">Brasão do Moto Clube</h2>
            <Image
              src={coatOfArmsImage}
              alt="Brasão do Moto Clube Os Papas"
              width={160}
              height={160}
              className="h-20 w-20 object-contain sm:h-24 sm:w-24 lg:h-28 lg:w-28"
            />
          </div>
          <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
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
                  Mais que um lema/grito de guerra, representa lealdade, irmandade e a liberdade de escolha dos seus membros, reforçando que a sigla significa paixão e o compromisso com o Moto Clube, sem significar aprisionamento, e sim pertencimento, uma entrega de coração e alma.
                </p>
              </div>
            </div>
          </div>
        </section>
      </Reveal>

      <Reveal>
        <section className="mx-auto w-full max-w-6xl px-6 py-10">
          <p className="text-xs uppercase tracking-[0.14em] text-[color:var(--color-gold-500)]">Princípios</p>
          <h2 className="mt-3 font-heading text-4xl uppercase tracking-[0.05em] text-white sm:text-5xl">Valores do Moto Clube</h2>
          <div className="mt-6 grid grid-cols-1 justify-items-center gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
            {values.map(({ id, label, Icon }) => {
              return (
                <article key={id} className="w-full rounded-xl border border-white/10 bg-[color:var(--color-bg-900)] p-6 text-center">
                  <div className="mb-4 flex justify-center">
                    <Icon width={32} height={32} className="text-[color:var(--color-gold-500)]" />
                  </div>
                  <h3 className="break-normal text-center font-heading text-2xl uppercase tracking-[0.01em] text-white [overflow-wrap:break-word]">
                    {label}
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
          <p className="text-xs uppercase tracking-[0.14em] text-[color:var(--color-gold-500)]">Organização</p>
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

    </div>
  );
}
