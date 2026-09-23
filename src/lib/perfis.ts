import { normalizarNome, nomesParecidos } from './nome';

export type Figura = 'cachorro' | 'sol' | 'casa' | 'flor' | 'peixe' | 'estrela';
export type CorAvatar = 'azul' | 'amarelo' | 'verde' | 'rosa' | 'laranja' | 'roxo';

export interface Avatar { figura: Figura; cor: CorAvatar; }

export interface Perfil {
    id: string;
    numero: number;
    nomeExibicao: string;
    nomeNormalizado: string;
    avatar: Avatar;
    criadoEm: string;
    consentimentoEm: string;
}

/** Combinações fixas de figura+cor usadas como avatar, na ordem de atribuição. */
export const AVATARES: Avatar[] = [
    { figura: 'cachorro', cor: 'azul' },
    { figura: 'sol', cor: 'amarelo' },
    { figura: 'casa', cor: 'verde' },
    { figura: 'flor', cor: 'rosa' },
    { figura: 'peixe', cor: 'laranja' },
    { figura: 'estrela', cor: 'roxo' },
];

/** Como a Nina fala cada figura em voz alta. */
export const ROTULO_FIGURA: Record<Figura, string> = {
    cachorro: 'o cachorro',
    sol: 'o sol',
    casa: 'a casa',
    flor: 'a flor',
    peixe: 'o peixe',
    estrela: 'a estrela',
};

/** Como a Nina fala cada cor em voz alta. */
export const ROTULO_COR: Record<CorAvatar, string> = {
    azul: 'azul',
    amarelo: 'amarelo',
    verde: 'verde',
    rosa: 'rosa',
    laranja: 'laranja',
    roxo: 'roxo',
};

/** Frase falada que descreve um avatar, ex.: "o cachorro azul". */
export function falarAvatar(avatar: Avatar): string {
    return `${ROTULO_FIGURA[avatar.figura]} ${ROTULO_COR[avatar.cor]}`;
}

const CHAVE_PERFIS = 'agora-eu-consigo:perfis';

/**
 * Lê os perfis salvos em `localStorage`. Retorna lista vazia quando não há
 * nada salvo ou os dados estão corrompidos — nunca lança.
 */
export function carregarPerfis(): Perfil[] {
    if (typeof window === 'undefined') return [];
    try {
        const bruto = window.localStorage.getItem(CHAVE_PERFIS);
        if (!bruto) return [];
        const dados = JSON.parse(bruto);
        return Array.isArray(dados) ? dados as Perfil[] : [];
    } catch {
        return [];
    }
}

/** Persiste a lista de perfis em `localStorage`. Falhas de escrita são ignoradas. */
export function salvarPerfis(perfis: Perfil[]): void {
    if (typeof window === 'undefined') return;
    try { window.localStorage.setItem(CHAVE_PERFIS, JSON.stringify(perfis)); }
    catch { /* ignora */ }
}

/** Próximo número de acesso sequencial, dado os perfis já existentes. */
function proximoNumero(perfis: Perfil[]): number {
    return perfis.reduce((max, p) => Math.max(max, p.numero), 0) + 1;
}

/**
 * Escolhe um avatar ainda não usado no aparelho. Se todas as combinações já
 * estiverem em uso (mais de {@link AVATARES.length} perfis), repete em ciclo.
 */
function proximoAvatar(perfis: Perfil[]): Avatar {
    const usados = new Set(perfis.map((p) => `${p.avatar.figura}-${p.avatar.cor}`));
    const livre = AVATARES.find((a) => !usados.has(`${a.figura}-${a.cor}`));
    return livre ?? AVATARES[perfis.length % AVATARES.length];
}

function gerarId(): string {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID();
    return `perfil-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

/**
 * Cria um novo perfil a partir do nome dito por voz (ou digitado/confirmado
 * por toque), gera número de acesso e avatar, salva e retorna o perfil criado.
 */
export function criarPerfil(nomeExibicao: string): Perfil {
    const perfis = carregarPerfis();
    const perfil: Perfil = {
        id: gerarId(),
        numero: proximoNumero(perfis),
        nomeExibicao: nomeExibicao.trim(),
        nomeNormalizado: normalizarNome(nomeExibicao),
        avatar: proximoAvatar(perfis),
        criadoEm: new Date().toISOString(),
        consentimentoEm: new Date().toISOString(),
    };
    salvarPerfis([...perfis, perfil]);
    return perfil;
}

/** Remove um perfil do aparelho pelo id. */
export function apagarPerfil(id: string): void {
    salvarPerfis(carregarPerfis().filter((p) => p.id !== id));
}

/**
 * Busca perfis cujo nome normalizado é parecido com o nome falado, tolerando
 * erro de reconhecimento (ver {@link nomesParecidos}).
 */
export function encontrarPerfisPorNome(nomeFalado: string, perfis: Perfil[] = carregarPerfis()): Perfil[] {
    const alvo = normalizarNome(nomeFalado);
    return perfis.filter((p) => nomesParecidos(p.nomeNormalizado, alvo));
}

/** Busca um perfil pelo número de acesso exato. */
export function perfilPorNumero(numero: number, perfis: Perfil[] = carregarPerfis()): Perfil | undefined {
    return perfis.find((p) => p.numero === numero);
}

const CHAVE_SESSAO = 'agora-eu-consigo:sessao';

/**
 * Lê o id do perfil da sessão ativa (`sessionStorage` — dura só a aba atual,
 * ao contrário dos perfis em si). `null` quando não há sessão.
 */
export function lerIdSessao(): string | null {
    if (typeof window === 'undefined') return null;
    try { return window.sessionStorage.getItem(CHAVE_SESSAO); }
    catch { return null; }
}

/** Salva (ou, com `null`, encerra) a sessão ativa. */
export function salvarIdSessao(id: string | null): void {
    if (typeof window === 'undefined') return;
    try {
        if (id) window.sessionStorage.setItem(CHAVE_SESSAO, id);
        else window.sessionStorage.removeItem(CHAVE_SESSAO);
    } catch { /* ignora */ }
}
