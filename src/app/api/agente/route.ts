import { SYSTEM_NINA } from '@/lib/nina-prompt';
import { GoogleGenerativeAI, SchemaType, type Tool } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY ?? '');

/** Declarações de função (tool-calling) que o agente Nina pode invocar para agir no app. */
const tools: Tool[] = [
    {
        functionDeclarations: [
            {
                name: 'navegar_para',
                description: 'Leva o usuário para uma tela do app.',
                parameters: {
                    type: SchemaType.OBJECT,
                    properties: {
                        tela: {
                            type: SchemaType.STRING,
                            format: 'enum',
                            enum: ['modulos', 'licoes', 'atividade'],
                        },
                    },
                    required: ['tela'],
                } as const,
            },
            {
                name: 'selecionar_modulo',
                description: 'Abre um módulo específico e mostra suas lições.',
                parameters: {
                    type: SchemaType.OBJECT,
                    properties: {
                        modulo: {
                            type: SchemaType.STRING,
                            format: 'enum',
                            enum: ['alfabeto', 'silabas', 'numeros', 'calculos'],
                        },
                    },
                    required: ['modulo'],
                } as const,
            },
            {
                name: 'selecionar_licao',
                description: 'Entra em uma lição específica para começar a atividade.',
                parameters: {
                    type: SchemaType.OBJECT,
                    properties: { licaoId: { type: SchemaType.STRING } },
                    required: ['licaoId'],
                } as const,
            },
            {
                name: 'destacar_elemento',
                description: 'Faz um elemento da tela pulsar para indicar onde tocar.',
                parameters: {
                    type: SchemaType.OBJECT,
                    properties: { elementoId: { type: SchemaType.STRING } },
                    required: ['elementoId'],
                } as const,
            },
            {
                name: 'soletrar',
                description: 'Soletra uma palavra, letra por letra, para ajudar o aluno.',
                parameters: {
                    type: SchemaType.OBJECT,
                    properties: { palavra: { type: SchemaType.STRING } },
                    required: ['palavra'],
                } as const,
            },
        ],
    },
];

/**
 * Único endpoint do app: recebe o estado atual e um evento em texto livre,
 * consulta o Gemini com o prompt da Nina e as ferramentas de navegação, e
 * devolve a fala da assistente junto das ações a executar no front-end.
 *
 * Nunca retorna erro HTTP — falhas do modelo resultam em fala e ações vazias
 * (status 200) para que o app siga navegável por toque, sem a Nina.
 */
export async function POST(req: Request) {
    try {
        const { estado, evento } = await req.json();

        const model = genAI.getGenerativeModel({
            model: 'gemini-3.6-flash',
            systemInstruction: SYSTEM_NINA,
            tools,
        });

        const result = await model.generateContent({
            contents: [
                {
                    role: 'user',
                    parts: [
                        {
                            text: `Estado atual do app:\n${JSON.stringify(estado)}\n\nO que aconteceu:\n${evento}`,
                        },
                    ],
                },
            ],
        });

        const response = result.response;
        let fala = '';
        const acoes: { ferramenta: string; args: Record<string, unknown> }[] = [];

        for (const candidate of response.candidates ?? []) {
            for (const part of candidate.content.parts) {
                if (part.text) fala += part.text;
                if (part.functionCall) {
                    acoes.push({
                        ferramenta: part.functionCall.name,
                        args: part.functionCall.args as Record<string, unknown>,
                    });
                }
            }
        }

        return Response.json({ fala, acoes });
    } catch (erro) {
        console.error('Erro no agente:', erro);
        return Response.json(
            { fala: '', acoes: [], erro: 'falha_agente' },
            { status: 200 },
        );
    }
}
