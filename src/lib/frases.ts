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

    // fluxo de acesso (consentimento, primeiro acesso, entrada, perfis, meus dados)
    consentimento: {
        id: 'consentimento',
        texto: 'Oi! Eu sou a Nina. Antes de começar, eu preciso guardar seu nome e um número de acesso, só aqui neste aparelho. Você pode apagar isso quando quiser. Toca no botão pra começar.',
        audio: `${CAMINHO_AUDIOS}/consentimento.mp3`,
    },
    pedirNome: {
        id: 'pedirNome',
        texto: 'Qual é o seu nome?',
        audio: `${CAMINHO_AUDIOS}/pedirNome.mp3`,
    },
    naoEntendiNome: {
        id: 'naoEntendiNome',
        texto: 'Não consegui entender direito. Pode falar seu nome de novo, bem devagar?',
        audio: `${CAMINHO_AUDIOS}/naoEntendiNome.mp3`,
    },
    saudacaoEntrada: {
        id: 'saudacaoEntrada',
        texto: 'Oi de novo! Qual é o seu nome?',
        audio: `${CAMINHO_AUDIOS}/saudacaoEntrada.mp3`,
    },
    numeroErrado: {
        id: 'numeroErrado',
        texto: 'Esse número não é o seu. Vamos tentar de novo?',
        audio: `${CAMINHO_AUDIOS}/numeroErrado.mp3`,
    },
    perfisParecidos: {
        id: 'perfisParecidos',
        texto: 'Achei mais de uma pessoa parecida com esse nome. Toca no seu cartão.',
        audio: `${CAMINHO_AUDIOS}/perfisParecidos.mp3`,
    },
    naoAchei: {
        id: 'naoAchei',
        texto: 'Não consegui te encontrar pela voz. Toca no seu cartão aqui embaixo.',
        audio: `${CAMINHO_AUDIOS}/naoAchei.mp3`,
    },
    microfoneNegado: {
        id: 'microfoneNegado',
        texto: 'Sem problema, não consegui usar o microfone. Toca no seu cartão aqui embaixo.',
        audio: `${CAMINHO_AUDIOS}/microfoneNegado.mp3`,
    },
    ouvindoDeNovo: {
        id: 'ouvindoDeNovo',
        texto: 'Vamos tentar de novo.',
        audio: `${CAMINHO_AUDIOS}/ouvindoDeNovo.mp3`,
    },
    apagarConfirmar: {
        id: 'apagarConfirmar',
        texto: 'Tem certeza que quer apagar seus dados? Isso não pode ser desfeito.',
        audio: `${CAMINHO_AUDIOS}/apagarConfirmar.mp3`,
    },
    apagarFeito: {
        id: 'apagarFeito',
        texto: 'Pronto, seus dados foram apagados.',
        audio: `${CAMINHO_AUDIOS}/apagarFeito.mp3`,
    },
};
