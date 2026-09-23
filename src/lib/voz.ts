import { obterConstrutorReconhecimento } from './reconhecimento-voz';

export type ErroOuvir = 'negado' | 'sem_suporte' | 'timeout' | 'silencio';

export interface ResultadoOuvir {
    transcricao: string | null;
    erro: ErroOuvir | null;
}

/**
 * Captura uma fala única do usuário via Web Speech API, com timeout.
 *
 * Nunca rejeita — falta de suporte, permissão negada, silêncio ou timeout
 * viram `erro` no resultado, pra quem chamar sempre poder cair no fluxo por
 * toque sem precisar tratar exceção.
 */
export function ouvir(timeoutMs: number = 7000): Promise<ResultadoOuvir> {
    const Construtor = obterConstrutorReconhecimento();
    if (!Construtor) return Promise.resolve({ transcricao: null, erro: 'sem_suporte' });

    return new Promise((resolve) => {
        const reconhecimento = new Construtor();
        reconhecimento.lang = 'pt-BR';
        reconhecimento.interimResults = false;
        reconhecimento.continuous = false;

        let resolvido = false;
        const concluir = (resultado: ResultadoOuvir) => {
            if (resolvido) return;
            resolvido = true;
            clearTimeout(temporizador);
            resolve(resultado);
        };

        const temporizador = setTimeout(() => {
            try { reconhecimento.stop(); } catch { /* já parado */ }
            concluir({ transcricao: null, erro: 'timeout' });
        }, timeoutMs);

        reconhecimento.onresult = (ev) => {
            const transcricao = ev.results[0]?.[0]?.transcript?.trim();
            concluir(transcricao ? { transcricao, erro: null } : { transcricao: null, erro: 'silencio' });
        };
        // 'not-allowed' e 'service-not-allowed' cobrem tanto permissão negada
        // quanto navegadores que bloqueiam o microfone por política própria
        reconhecimento.onerror = (ev) => {
            const negado = ev.error === 'not-allowed' || ev.error === 'service-not-allowed';
            concluir({ transcricao: null, erro: negado ? 'negado' : 'silencio' });
        };
        reconhecimento.onend = () => concluir({ transcricao: null, erro: 'silencio' });

        try {
            reconhecimento.start();
        } catch {
            concluir({ transcricao: null, erro: 'sem_suporte' });
        }
    });
}
