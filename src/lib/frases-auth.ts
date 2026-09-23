/**
 * Falas da Nina do fluxo de acesso que têm nome ou número dinâmicos — por isso
 * não podem ser pré-gravadas e são sempre ditas por TTS (`falar()` do
 * `AppProvider`). As falas fixas desse fluxo ficam em `frases.ts`, com áudio
 * pré-gravado, como as demais.
 */
export const FALAS_AUTH = {
    confirmarNome: (nome: string) => `Eu entendi ${nome}. Você é ${nome}?`,
    numeroGerado: (numero: number, avatarFalado: string) =>
        `Seu número é o ${numero}. Você é ${avatarFalado}. Seu número é o ${numero}.`,
    pedirNumero: (nome: string) => `Oi, ${nome}! Qual é o seu número?`,
} as const;
