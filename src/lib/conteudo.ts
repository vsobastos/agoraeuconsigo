export type TipoItem = 'copiar' | 'responder';

/** Um exercício dentro de uma lição. */
export interface Item {
    tipo: TipoItem;
    /** O que aparece grande na tela (a letra, sílaba, número ou conta). */
    enunciado: string;
    /** Alvo que o aluno precisa digitar para acertar o item. */
    resposta: string;
}

/** Conteúdo das lições, indexado por `licaoId` (ex.: `"alfabeto-1"`). */
export const CONTEUDO: Record<string, Item[]> = {
    'alfabeto-1': [
        { tipo: 'copiar', enunciado: 'A', resposta: 'A' },
        { tipo: 'copiar', enunciado: 'B', resposta: 'B' },
        { tipo: 'copiar', enunciado: 'C', resposta: 'C' },
    ],
    'alfabeto-2': [
        { tipo: 'copiar', enunciado: 'D', resposta: 'D' },
        { tipo: 'copiar', enunciado: 'E', resposta: 'E' },
        { tipo: 'copiar', enunciado: 'F', resposta: 'F' },
    ],
    'alfabeto-3': [ // lição destacada em estadoDemo() (ver estado.ts)
        { tipo: 'copiar', enunciado: 'G', resposta: 'G' },
        { tipo: 'copiar', enunciado: 'H', resposta: 'H' },
        { tipo: 'copiar', enunciado: 'I', resposta: 'I' },
    ],
    'alfabeto-4': [
        { tipo: 'copiar', enunciado: 'J', resposta: 'J' },
        { tipo: 'copiar', enunciado: 'K', resposta: 'K' },
        { tipo: 'copiar', enunciado: 'L', resposta: 'L' },
    ],
    'silabas-1': [
        { tipo: 'copiar', enunciado: 'BA', resposta: 'BA' },
        { tipo: 'copiar', enunciado: 'BE', resposta: 'BE' },
        { tipo: 'copiar', enunciado: 'BI', resposta: 'BI' },
    ],
    'silabas-2': [
        { tipo: 'copiar', enunciado: 'MA', resposta: 'MA' },
        { tipo: 'copiar', enunciado: 'ME', resposta: 'ME' },
        { tipo: 'copiar', enunciado: 'MI', resposta: 'MI' },
    ],
    'silabas-3': [
        { tipo: 'copiar', enunciado: 'PA', resposta: 'PA' },
        { tipo: 'copiar', enunciado: 'PE', resposta: 'PE' },
        { tipo: 'copiar', enunciado: 'PI', resposta: 'PI' },
    ],
    'silabas-4': [
        { tipo: 'copiar', enunciado: 'TA', resposta: 'TA' },
        { tipo: 'copiar', enunciado: 'TE', resposta: 'TE' },
        { tipo: 'copiar', enunciado: 'TI', resposta: 'TI' },
    ],
    'numeros-1': [
        { tipo: 'copiar', enunciado: '1', resposta: '1' },
        { tipo: 'copiar', enunciado: '2', resposta: '2' },
        { tipo: 'copiar', enunciado: '3', resposta: '3' },
    ],
    'numeros-2': [
        { tipo: 'copiar', enunciado: '4', resposta: '4' },
        { tipo: 'copiar', enunciado: '5', resposta: '5' },
        { tipo: 'copiar', enunciado: '6', resposta: '6' },
    ],
    'numeros-3': [
        { tipo: 'copiar', enunciado: '7', resposta: '7' },
        { tipo: 'copiar', enunciado: '8', resposta: '8' },
        { tipo: 'copiar', enunciado: '9', resposta: '9' },
    ],
    'numeros-4': [
        { tipo: 'copiar', enunciado: '10', resposta: '10' },
        { tipo: 'copiar', enunciado: '11', resposta: '11' },
        { tipo: 'copiar', enunciado: '12', resposta: '12' },
    ],
    'calculos-1': [
        { tipo: 'responder', enunciado: '1 + 1', resposta: '2' },
        { tipo: 'responder', enunciado: '2 + 1', resposta: '3' },
        { tipo: 'responder', enunciado: '3 + 2', resposta: '5' },
    ],
    'calculos-2': [
        { tipo: 'responder', enunciado: '4 + 3', resposta: '7' },
        { tipo: 'responder', enunciado: '5 + 4', resposta: '9' },
        { tipo: 'responder', enunciado: '6 + 5', resposta: '11' },
    ],
    'calculos-3': [
        { tipo: 'responder', enunciado: '5 - 2', resposta: '3' },
        { tipo: 'responder', enunciado: '7 - 3', resposta: '4' },
        { tipo: 'responder', enunciado: '9 - 4', resposta: '5' },
    ],
    'calculos-4': [
        { tipo: 'responder', enunciado: '8 + 2', resposta: '10' },
        { tipo: 'responder', enunciado: '10 - 3', resposta: '7' },
        { tipo: 'responder', enunciado: '6 + 6', resposta: '12' },
    ],
};