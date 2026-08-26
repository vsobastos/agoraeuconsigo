/** Fala fixa da Nina com um áudio pré-gravado correspondente (gerado no ElevenLabs). */
export interface Frase { id: string; texto: string; audio: string; }

/** Diretório em `public/` de onde os áudios pré-gravados são servidos estaticamente. */
const CAMINHO_AUDIOS = '/audios';

/**
 * Catálogo das falas fixas da Nina, indexado por id.
 *
 * Falas com conteúdo variável (soletrar uma palavra, ler uma conta específica)
 * não entram aqui — essas são geradas dinamicamente por item, a partir de
 * `conteudo.ts`, e usam TTS em vez de áudio pré-gravado.
 */
export const FRASES: Record<string, Frase> = {
    inicial_novo: {
        id: 'inicial_novo',
        texto: 'Oi! Eu sou a Nina, e vou te acompanhar. Toca no botão grande, laranja, que está brilhando no meio da tela. É por ali que a gente começa.',
        audio: `${CAMINHO_AUDIOS}/inicial_novo.mp3`,
    },
    inicial_recorrente: {
        id: 'inicial_recorrente',
        texto: 'Que bom te ver de novo! Toca no botão que está brilhando pra gente continuar de onde você parou.',
        audio: `${CAMINHO_AUDIOS}/inicial_recorrente.mp3`,
    },
    explica_assistente: {
        id: 'explica_assistente',
        texto: 'Se quiser que eu fique mutada, é só tocar no botão do microfone, ali no canto de cima, à esquerda. Toca de novo e eu volto.',
        audio: `${CAMINHO_AUDIOS}/explica_assistente.mp3`,
    },
    modulos_intro: {
        id: 'modulos_intro',
        texto: 'Aqui estão as quatro coisas que a gente pode aprender. Em cima, o quadro azul são as letras, e o roxo são as sílabas. Embaixo, o verde são os números, e o laranja são as contas. Toca no que você quiser.',
        audio: `${CAMINHO_AUDIOS}/modulos_intro.mp3`,
    },
    licoes_intro: {
        id: 'licoes_intro',
        texto: 'Estas são as atividades. A que está brilhando é a sua próxima. Toca nela pra começar.',
        audio: `${CAMINHO_AUDIOS}/licoes_intro.mp3`,
    },
    licao_travada: {
        id: 'licao_travada',
        texto: 'Essa ainda está guardada pra depois. Primeiro a gente termina a que está brilhando, e aí ela abre. Vamos nessa?',
        audio: `${CAMINHO_AUDIOS}/licao_travada.mp3`,
    },
    atividade_copiar: {
        id: 'atividade_copiar',
        texto: 'Olha o que está grande aí em cima. Escreve igualzinho nas caixinhas, uma letra de cada vez. Se acertar, a caixa fica verde.',
        audio: `${CAMINHO_AUDIOS}/atividade_copiar.mp3`,
    },
    atividade_responder: {
        id: 'atividade_responder',
        texto: 'Olha a conta que está em cima. Escreve o resultado nas caixinhas. Pode ir com calma.',
        audio: `${CAMINHO_AUDIOS}/atividade_responder.mp3`,
    },
    acertou: {
        id: 'acertou',
        texto: 'Isso! Você acertou. Muito bem! Vamos pro próximo.',
        audio: `${CAMINHO_AUDIOS}/acertou.mp3`,
    },
    errou: {
        id: 'errou',
        texto: 'Quase! Não tem problema errar, faz parte de aprender. Vamos de novo, sem pressa. Se quiser, toca em "Me ajuda".',
        audio: `${CAMINHO_AUDIOS}/errou.mp3`,
    },
    licao_concluida: {
        id: 'licao_concluida',
        texto: 'Você terminou tudo! Que orgulho! Já abri a próxima atividade pra você. Toca em "Continuar".',
        audio: `${CAMINHO_AUDIOS}/licao_concluida.mp3`,
    },
    modulo_concluido: {
        id: 'modulo_concluido',
        texto: 'Você terminou tudo desta parte! Está indo muito bem. Que tal escolher outra pra continuar aprendendo?',
        audio: `${CAMINHO_AUDIOS}/modulo_concluido.mp3`,
    },
};