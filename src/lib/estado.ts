export type ModuloId = 'alfabeto' | 'silabas' | 'numeros' | 'calculos';

export type StatusLicao =
    | 'bloqueada'
    | 'disponivel'
    | 'em_andamento'
    | 'concluida';

export interface Licao {
    id: string;
    indice: number;
    status: StatusLicao;
    progresso: number;
}

export interface Modulo {
    id: ModuloId;
    licoes: Licao[];
}

export interface EstadoApp {
    versao: number;
    usuarioNovo: boolean;
    assistenteAtivo: boolean;
    ultimoModulo: ModuloId | null;
    ultimaLicao: string | null;
    modulos: Record<ModuloId, Modulo>;
}

const MODULOS: ModuloId[] = ['alfabeto', 'silabas', 'numeros', 'calculos'];

/**
 * Cria as 4 lições de um módulo, com a primeira já disponível e as demais bloqueadas.
 */
function criarLicoes(moduloId: ModuloId): Licao[] {
    return Array.from({ length: 4 }, (_, i) => ({
        id: `${moduloId}-${i + 1}`,
        indice: i + 1,
        status: i === 0 ? 'disponivel' : 'bloqueada',
        progresso: 0,
    }));
}

/**
 * Monta o estado inicial de um usuário novo, com todos os módulos e suas lições
 * na configuração padrão (apenas a primeira lição de cada módulo disponível).
 */
export function estadoInicial(): EstadoApp {
    const modulos = {} as Record<ModuloId, Modulo>;
    for (const id of MODULOS) modulos[id] = { id, licoes: criarLicoes(id) };
    return {
        versao: 1,
        usuarioNovo: true,
        assistenteAtivo: true,
        ultimoModulo: null,
        ultimaLicao: null,
        modulos,
    };
}

/**
 * Atualiza o progresso de uma lição e, ao concluí-la, desbloqueia a próxima
 * lição do mesmo módulo (se ainda estiver bloqueada).
 *
 * @param estado estado atual do app
 * @param moduloId módulo ao qual a lição pertence
 * @param licaoId lição sendo atualizada
 * @param progresso progresso bruto (0-100); é normalizado para esse intervalo
 * @returns novo estado com a lição (e, se aplicável, a próxima) atualizadas
 */
export function registrarProgresso(
    estado: EstadoApp, moduloId: ModuloId, licaoId: string, progresso: number,
): EstadoApp {
    const modulo = estado.modulos[moduloId];
    const licoes = modulo.licoes.map((licao) => {
        if (licao.id !== licaoId) return licao;
        const p = Math.min(100, Math.max(0, Math.round(progresso)));
        const status: StatusLicao = p >= 100 ? 'concluida' : 'em_andamento';
        return { ...licao, progresso: p, status };
    });

    const atual = licoes.find((l) => l.id === licaoId)!;
    if (atual.status === 'concluida') {
        const proxima = licoes.find((l) => l.indice === atual.indice + 1);
        if (proxima && proxima.status === 'bloqueada') proxima.status = 'disponivel';
    }

    return {
        ...estado,
        usuarioNovo: false,
        ultimoModulo: moduloId,
        ultimaLicao: licaoId,
        modulos: { ...estado.modulos, [moduloId]: { ...modulo, licoes } },
    };
}

/**
 * Encontra a lição que deve ser destacada para o usuário dentro de um módulo:
 * a que está em andamento tem prioridade sobre a próxima disponível.
 *
 * @returns a lição a destacar, ou `null` se o módulo estiver totalmente concluído
 */
export function licaoDestaque(modulo: Modulo): Licao | null {
    const prioridade: StatusLicao[] = ['em_andamento', 'disponivel'];
    for (const status of prioridade) {
        const l = modulo.licoes.find((x) => x.status === status);
        if (l) return l;
    }
    return null;
}

const CHAVE = 'agora-eu-consigo:estado';

/**
 * Lê o estado salvo em `localStorage`. Retorna um estado inicial novo quando
 * não há nada salvo, os dados estão corrompidos, ou a versão salva é incompatível.
 */
export function carregarEstado(): EstadoApp {
    if (typeof window === 'undefined') return estadoInicial();
    try {
        const bruto = window.localStorage.getItem(CHAVE);
        if (!bruto) return estadoInicial();
        const dados = JSON.parse(bruto) as EstadoApp;
        if (dados.versao !== 1) return estadoInicial();
        return dados;
    } catch {
        return estadoInicial();
    }
}

/**
 * Persiste o estado em `localStorage`. Falhas de escrita (cota cheia, aba
 * privada) são ignoradas silenciosamente — não há fallback no MVP.
 */
export function salvarEstado(estado: EstadoApp): void {
    if (typeof window === 'undefined') return;
    try { window.localStorage.setItem(CHAVE, JSON.stringify(estado)); }
    catch { /* ignora */ }
}

/**
 * Estado de demonstração usado pela query string `?demo=1`: usuário recorrente
 * com as duas primeiras lições de "alfabeto" já concluídas.
 */
export function estadoDemo(): EstadoApp {
    const estado = estadoInicial();
    estado.usuarioNovo = false;
    estado.ultimoModulo = 'alfabeto';
    estado.ultimaLicao = 'alfabeto-3';
    const alfabeto = estado.modulos.alfabeto;
    alfabeto.licoes[0] = { ...alfabeto.licoes[0], status: 'concluida', progresso: 100 };
    alfabeto.licoes[1] = { ...alfabeto.licoes[1], status: 'concluida', progresso: 100 };
    return estado;
}