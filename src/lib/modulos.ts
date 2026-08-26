import { ModuloId } from './estado';

/** Configuração visual e de voz de um módulo, usada pelas telas e pelo prompt da Nina. */
export interface ConfigModulo {
    id: ModuloId;
    /** Rótulo curto exibido sob o quadro. */
    nome: string;
    /** Como a Nina se refere ao módulo por voz, ex.: "o azul". */
    corNome: string;
    /** Desenho-exemplo grande exibido dentro do quadro. */
    glifo: string;
    /** Classe Tailwind da cor de fundo do quadro. */
    bg: string;
    /** Classe Tailwind da cor do anel de foco/destaque. */
    ring: string;
}

/** Configuração dos 4 módulos, indexada por {@link ModuloId}. */
export const MODULOS_CONFIG: Record<ModuloId, ConfigModulo> = {
    alfabeto: { id: 'alfabeto', nome: 'Letras', corNome: 'azul', glifo: 'Aa', bg: 'bg-sky-500', ring: 'ring-sky-300' },
    silabas: { id: 'silabas', nome: 'Sílabas', corNome: 'roxo', glifo: 'ba', bg: 'bg-violet-500', ring: 'ring-violet-300' },
    numeros: { id: 'numeros', nome: 'Números', corNome: 'verde', glifo: '123', bg: 'bg-emerald-500', ring: 'ring-emerald-300' },
    calculos: { id: 'calculos', nome: 'Contas', corNome: 'laranja', glifo: '1+1', bg: 'bg-orange-500', ring: 'ring-orange-300' },
};

/** Ordem de exibição dos módulos nas telas. */
export const ORDEM_MODULOS: ModuloId[] = ['alfabeto', 'silabas', 'numeros', 'calculos'];