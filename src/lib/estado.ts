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
const VERSAO_ATUAL = 1;

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
        versao: VERSAO_ATUAL,
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
 * Checagem estrutural leve: só o suficiente para saber se os dados salvos
 * têm a forma mínima de um `EstadoApp` (e não, por exemplo, `null`, uma
 * string, ou um objeto de outra chave do localStorage).
 */
function estadoValido(dados: unknown): dados is Partial<EstadoApp> & Record<string, unknown> {
    return typeof dados === 'object' && dados !== null && 'modulos' in dados;
}

/**
 * Mescla as lições salvas com as do estado inicial, lição por lição, mantendo
 * o progresso reconhecível e preenchendo qualquer coisa ausente ou malformada
 * com o valor padrão daquela lição — em vez de descartar o módulo inteiro.
 */
function mesclarLicoes(base: Licao[], salvas: unknown): Licao[] {
    if (!Array.isArray(salvas)) return base;
    return base.map((licaoBase) => {
        const salva = salvas.find(
            (l): l is Licao => typeof l === 'object' && l !== null && (l as Licao).id === licaoBase.id,
        );
        return salva ? { ...licaoBase, ...salva } : licaoBase;
    });
}

function mesclarModulos(
    base: Record<ModuloId, Modulo>, salvos: unknown,
): Record<ModuloId, Modulo> {
    if (typeof salvos !== 'object' || salvos === null) return base;
    const modulos = {} as Record<ModuloId, Modulo>;
    for (const id of MODULOS) {
        const moduloSalvo = (salvos as Record<string, unknown>)[id];
        const licoesSalvas = typeof moduloSalvo === 'object' && moduloSalvo !== null
            ? (moduloSalvo as Partial<Modulo>).licoes
            : undefined;
        modulos[id] = { id, licoes: mesclarLicoes(base[id].licoes, licoesSalvas) };
    }
    return modulos;
}

/**
 * Migra dados salvos com uma versão diferente da atual para o formato atual,
 * preservando o progresso reconhecível em vez de descartá-lo. Hoje só existe
 * a versão 1, então este é o único caminho — mas estabelece o padrão para
 * quando o formato do estado mudar de novo no futuro.
 */
function migrarEstado(dados: Partial<EstadoApp> & Record<string, unknown>): EstadoApp {
    const base = estadoInicial();
    return {
        ...base,
        usuarioNovo: dados.usuarioNovo ?? base.usuarioNovo,
        assistenteAtivo: dados.assistenteAtivo ?? base.assistenteAtivo,
        ultimoModulo: dados.ultimoModulo ?? base.ultimoModulo,
        ultimaLicao: dados.ultimaLicao ?? base.ultimaLicao,
        modulos: mesclarModulos(base.modulos, dados.modulos),
        versao: VERSAO_ATUAL,
    };
}

/**
 * Lê o estado salvo em `localStorage`. Retorna um estado inicial novo quando
 * não há nada salvo ou os dados estão genuinamente corrompidos; quando a
 * versão salva é diferente da atual, migra em vez de apagar o progresso.
 */
export function carregarEstado(): EstadoApp {
    if (typeof window === 'undefined') return estadoInicial();
    try {
        const bruto = window.localStorage.getItem(CHAVE);
        if (!bruto) return estadoInicial();
        const dados = JSON.parse(bruto);
        if (!estadoValido(dados)) return estadoInicial();
        if (dados.versao === VERSAO_ATUAL) return dados as EstadoApp;
        return migrarEstado(dados);
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