import { ModuloId } from './estado';

export interface ConfigModulo {
    id: ModuloId;
    nome: string;      // rótulo curto sob o quadro
    corNome: string;   // como a Nina chama por voz: "o azul"
    glifo: string;     // o desenho-exemplo grande dentro do quadro
    bg: string;        // cor do quadro
    ring: string;      // cor do anel de foco/destaque
}

export const MODULOS_CONFIG: Record<ModuloId, ConfigModulo> = {
    alfabeto: { id: 'alfabeto', nome: 'Letras', corNome: 'azul', glifo: 'Aa', bg: 'bg-sky-500', ring: 'ring-sky-300' },
    silabas: { id: 'silabas', nome: 'Sílabas', corNome: 'roxo', glifo: 'ba', bg: 'bg-violet-500', ring: 'ring-violet-300' },
    numeros: { id: 'numeros', nome: 'Números', corNome: 'verde', glifo: '123', bg: 'bg-emerald-500', ring: 'ring-emerald-300' },
    calculos: { id: 'calculos', nome: 'Contas', corNome: 'laranja', glifo: '1+1', bg: 'bg-orange-500', ring: 'ring-orange-300' },
};

export const ORDEM_MODULOS: ModuloId[] = ['alfabeto', 'silabas', 'numeros', 'calculos'];