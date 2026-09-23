/**
 * Normaliza um nome falado para comparação: minúsculas, sem acento, e só o
 * primeiro nome — o reconhecimento de voz costuma captar só isso mesmo.
 */
export function normalizarNome(nome: string): string {
    const semAcento = nome
        .trim()
        .normalize('NFD')
        .replace(/[̀-ͯ]/g, '');
    const primeiro = semAcento.split(/\s+/)[0] ?? '';
    return primeiro.toLowerCase().replace(/[^a-z]/g, '');
}

/**
 * Distância de Levenshtein entre duas strings (número mínimo de inserções,
 * remoções ou substituições para transformar uma na outra).
 */
export function distanciaLevenshtein(a: string, b: string): number {
    const linhas = a.length + 1;
    const colunas = b.length + 1;
    const dist: number[][] = Array.from({ length: linhas }, () => new Array<number>(colunas).fill(0));

    for (let i = 0; i < linhas; i++) dist[i][0] = i;
    for (let j = 0; j < colunas; j++) dist[0][j] = j;

    for (let i = 1; i < linhas; i++) {
        for (let j = 1; j < colunas; j++) {
            const custo = a[i - 1] === b[j - 1] ? 0 : 1;
            dist[i][j] = Math.min(
                dist[i - 1][j] + 1,
                dist[i][j - 1] + 1,
                dist[i - 1][j - 1] + custo,
            );
        }
    }
    return dist[linhas - 1][colunas - 1];
}

/** Tolerância padrão de erro de reconhecimento aceita ao comparar nomes. */
export const TOLERANCIA_NOME = 2;

/**
 * Compara dois nomes já normalizados e diz se estão próximos o suficiente
 * para serem considerados o mesmo nome, dado erro de reconhecimento de voz.
 */
export function nomesParecidos(a: string, b: string, tolerancia: number = TOLERANCIA_NOME): boolean {
    if (!a || !b) return false;
    return distanciaLevenshtein(a, b) <= tolerancia;
}
