import Image from "next/image";
import {
  ResponsabilidadeIcon,
  FamiliaIcon,
  Handshake,
  HeartHandshake,
  Scale,
  Crown,
  Shield,
  ShieldCheck,
  Users,
  User,
} from "@/components/ui/icons/icons";
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

const values = [
  "RESPONSABILIDADE",
  "RESPEITO",
  "FAMÍLIA",
  "FILANTROPIA",
  "IRMANDADE",
];

const leadership = [
  {
    name: "Nômade Papa",
    rank: "Fundador",
    chapter: "Belém-PA",
    image: "/images/diretoria/nomade-papa-fundador-belem.png",
  },
  {
    name: "Caveira",
    rank: "Presidente - Cardeal",
    chapter: "Rio de janeiro-RJ",
    image: "/images/diretoria/caveira-presidente-cardeal-regional-rio-de-janeiro.png",
  },
  {
    name: "Mardone",
    rank: "Vice-Presidente - Cardeal",
    chapter: "Tomé Açu-PA",
    image: "/images/diretoria/mardone-vice-cardeal-regional-tome-acu.png",
  },
  {
    name: "Billau",
    rank: "Diretor Sede Nacional - Cardela",
    chapter: "Belém-PA",
    image: "/images/diretoria/billau-diretor-cardeal-sede-belem.png",
  },
  {
    name: "Verme",
    rank: "Diretor Regional - Cardeal",
    chapter: "Rio de Janeiro-RJ",
    image: "/images/diretoria/verme-diretor-cardeal-regional-regional-reio-de-janeiro.png",
  },
  {
    name: "Poodle",
    rank: "Diretor Regional - Cardela",
    chapter: "Brasília-DF",
    image: "/images/diretoria/podle-diretor-cardeal-regional-brasilia.png",
  },
  {
    name: "Gadeia",
    rank: "Diretor Regional - Cardeal",
    chapter: "Tomé Açi-PA",
    image: "/images/diretoria/gadeia-diretor-cardeal-regional-tome-acu.png",
  },
  {
    name: "Netanf",
    rank: "Diretor Financeiro - Cardeal",
    chapter: "Rio de Janeiro-RJ",
    image: "/images/diretoria/netanf-diretor-financeiro-cardeal-regional-rio-de-janeiro.png",
  },
  {
    name: "sniper",
    rank: "Diretor Social - Cardeal",
    chapter: "Rio de Janeiro-RJ",
    image: "/images/diretoria/sniper-diretor-social-regional-rio-de-janeiro.png",
  },
  {
    name: "Careca",
    rank: "Diretor de Marketing - Cardeal",
    chapter: "Rio de Janeiro-RJ",
    image: "/images/diretoria/careca-diretor-marketing-regional-rio-de-janeiro.png",
  },
  {
    name: "El Loco",
    rank: "Representante - Cardeal",
    chapter: "São Luís-MA",
    image: "/images/diretoria/el-loco-representante-cardeal-subsede-sao-luis.png",
  },
  {
    name: "Bino",
    rank: "Representante - Cardeal",
    chapter: "Macapá-AP",
    image: "/images/diretoria/bino-representante-cardeal-subsede-macapa.png",
  },
  {
    name: "Varejão",
    rank: "Representante - Cardeal",
    chapter: "Porto de Moz-PA",
    image: "/images/diretoria/varejao-representante-cardeal-subsede-porto-de-moz.png",
  },
];

const hierarchy = [
  {
    icon: Crown,
    title: "Papa",
    description:
      "Líder máximo do Moto Clube, responsável por representar a irmandade, conduzir as decisões estratégicas e zelar pelos valores e pela união do clube.",
  },
  {
    icon: Shield,
    title: "Cardeal",
    description:
      "Auxilia diretamente o Papa na liderança do Moto Clube, contribuindo nas decisões importantes e na organização da irmandade.",
  },
  {
    icon: ShieldCheck,
    title: "Bispo",
    description:
      "Responsável por apoiar a estrutura do Moto Clube, ajudando na coordenação das atividades e na manutenção da ordem e disciplina.",
  },
  {
    icon: Users,
    title: "Padre",
    description:
      "Membro ativo do Moto Clube que participa das atividades, fortalece a irmandade e representa os valores do clube.",
  },
  {
    icon: User,
    title: "Diácono",
    description:
      "Integrante em fase inicial dentro do Moto Clube, aprendendo a cultura, os valores e a tradição da irmandade.",
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
                Como todoso são filhos do Pai, assim, nos tornaríamos IRMÃOS NA ESTRADA, cuja frase em latim &quot;FRATRES IN VIA&quot; escolhida por nosso vice, Da Pop,
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
        <section className="mx-auto w-full max-w-6xl px-3 pb-16 sm:px-6 lg:px-8">
          <p className="text-xs uppercase tracking-[0.14em] text-[color:var(--color-gold-500)]">Princípios</p>
          <h2 className="mt-3 font-heading text-4xl uppercase tracking-[0.05em] text-white sm:text-5xl">Valores do Moto Clube</h2>
          <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {values.map((value) => {
              const iconMap: Record<string, typeof Shield> = {
                RESPONSABILIDADE: ResponsabilidadeIcon,
                RESPEITO: Scale,
                FAMÍLIA: FamiliaIcon,
                FILANTROPIA: HeartHandshake,
                IRMANDADE: Handshake,
              };
              const Icon = iconMap[value] ?? Shield;

              return (
                <article key={value} className="rounded-xl border border-white/10 bg-[color:var(--color-bg-900)] p-6 text-center">
                  <div className="mb-4 flex justify-center">
                    <Icon width={32} height={32} className="text-[color:var(--color-gold-500)]" />
                  </div>
                  <h3 className="break-words text-center font-heading text-3xl uppercase tracking-[0.04em] text-white [overflow-wrap:break-word]">
                    {value}
                  </h3>
                </article>
              );
            })}
          </div>
        </section>
      </Reveal>

      <Reveal>
        <section className="mx-auto w-full max-w-6xl px-4 pb-16 text-center sm:px-6 lg:px-8">
          <p className="text-base uppercase tracking-[0.14em] text-[color:var(--color-gold-500)]">
            Máxima do Moto Clube
          </p>

          <h2 className="mt-1 font-heading text-5xl uppercase tracking-[0.06em] text-white sm:text-3xl">
            Sempre haverá um de nós na estrada
          </h2>

          <p className="mt-7 text-base uppercase tracking-[0.14em] text-[color:var(--color-gold-500)]">
            Missão do Moto Clube
          </p>

          <h2 className="mt-1 font-heading text-5xl uppercase tracking-[0.06em] text-white sm:text-3xl">
            Vivenciar a cultura do motociclismo estradeiro em prol da filantropia e o bem estar social
          </h2>

          <p className="mt-7 text-base uppercase tracking-[0.14em] text-[color:var(--color-gold-500)]">
            Visão do Moto Clube
          </p>

          <h2 className="mt-1 font-heading text-5xl uppercase tracking-[0.06em] text-white sm:text-3xl">
            Ter um membro que se identifique com nossos valores em cada estado do Brasil
          </h2> 
      </section>
    </Reveal>

      <Reveal>
        <section className="mx-auto w-full max-w-6xl px-3 pb-16 sm:px-6 lg:px-8">
          <p className="text-xs uppercase tracking-[0.14em] text-[color:var(--color-gold-500)]">Estrutura</p>
          <h2 className="mt-3 font-heading text-4xl uppercase tracking-[0.05em] text-white sm:text-5xl">Hierarquia do Moto Clube</h2>
          <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
            {hierarchy.map((item) => {
              const Icon = item.icon;
              return (
                <article key={item.title} className="rounded-xl border border-white/10 bg-[color:var(--color-bg-900)] p-6 text-center">
                  <Icon size={30} className="mx-auto text-[color:var(--color-gold-500)]" />
                  <h3 className="mt-4 font-heading text-3xl uppercase tracking-[0.04em] text-white">{item.title}</h3>
                  <p className="mt-3 text-sm leading-7 text-[color:var(--color-text-300)]">{item.description}</p>
                </article>
              );
            })}
          </div>
        </section>
      </Reveal>

      <Reveal>
        <section className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">
          <p className="text-xs uppercase tracking-[0.14em] text-[color:var(--color-gold-500)]">Membros</p>
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
