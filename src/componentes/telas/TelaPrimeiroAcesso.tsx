'use client';
import { useEffect, useState } from 'react';
import { Mic, ThumbsUp, ThumbsDown, ArrowRight, Loader2 } from 'lucide-react';
import { usarApp } from '@/contexto/AppProvider';
import { usarAuth } from '@/contexto/AuthProvider';
import { FRASES } from '@/lib/frases';
import { FALAS_AUTH } from '@/lib/frases-auth';
import { falarAvatar, Perfil } from '@/lib/perfis';
import { ouvir } from '@/lib/voz';
import { Avatar } from '@/componentes/Avatar';
import { BotaoOuvirDeNovo } from '@/componentes/BotaoOuvirDeNovo';

type Fase = 'pedindo' | 'ouvindo' | 'confirmando' | 'revelando';

/** Depois de 2 tentativas sem sucesso (sem suporte, mic negado, não entendida, ou "não" duas vezes),
 *  cria o perfil com um nome genérico — evita travar quem ainda não tem outro perfil pra cair no toque. */
const MAX_TENTATIVAS = 2;

/** Primeiro acesso (Fluxo 1): captura o nome por voz, confirma, gera número e avatar do perfil. */
export function TelaPrimeiroAcesso() {
    const { estado, falar, tocarAudio, irParaInicio } = usarApp();
    const { criarPerfil } = usarAuth();
    const [fase, setFase] = useState<Fase>('pedindo');
    const [nomeCandidato, setNomeCandidato] = useState('');
    const [tentativas, setTentativas] = useState(0);
    const [perfilCriado, setPerfilCriado] = useState<Perfil | null>(null);

    useEffect(() => {
        if (estado.assistenteAtivo) tocarAudio(FRASES.pedirNome.audio);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        if (fase !== 'revelando' || !perfilCriado) return;
        if (estado.assistenteAtivo) falar(FALAS_AUTH.numeroGerado(perfilCriado.numero, falarAvatar(perfilCriado.avatar)));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [fase, perfilCriado]);

    const revelar = (perfil: Perfil) => {
        setPerfilCriado(perfil);
        setFase('revelando');
    };

    /** Esgotadas as tentativas por voz: ainda assim cria o perfil, com um nome genérico. */
    const criarComNomeGenerico = () => revelar(criarPerfil('Amigo'));

    const escutar = async () => {
        setFase('ouvindo');
        const resultado = await ouvir();

        if (!resultado.transcricao) {
            const proxima = tentativas + 1;
            setTentativas(proxima);
            if (proxima >= MAX_TENTATIVAS) { criarComNomeGenerico(); return; }
            if (estado.assistenteAtivo) await tocarAudio(FRASES.naoEntendiNome.audio);
            setFase('pedindo');
            return;
        }

        setNomeCandidato(resultado.transcricao);
        setFase('confirmando');
        if (estado.assistenteAtivo) falar(FALAS_AUTH.confirmarNome(resultado.transcricao));
    };

    const confirmarSim = () => revelar(criarPerfil(nomeCandidato));

    const confirmarNao = async () => {
        const proxima = tentativas + 1;
        setTentativas(proxima);
        if (proxima >= MAX_TENTATIVAS) { criarComNomeGenerico(); return; }
        if (estado.assistenteAtivo) await tocarAudio(FRASES.naoEntendiNome.audio);
        setFase('pedindo');
    };

    return (
        <main className="relative flex min-h-dvh flex-col items-center justify-center gap-8
                     bg-gradient-to-b from-amber-50 to-orange-100 px-6 text-center">
            {fase === 'revelando' && perfilCriado ? (
                <>
                    <Avatar avatar={perfilCriado.avatar} tamanho="lg" />
                    <p className="text-2xl font-bold text-orange-900">Seu número é o</p>
                    <p className="text-8xl font-extrabold text-orange-600">{perfilCriado.numero}</p>
                    <button
                        onClick={() => irParaInicio()}
                        className="cursor-pointer flex items-center gap-3 rounded-full bg-orange-500 px-10 py-6
                             text-2xl font-bold text-white shadow-xl transition active:scale-95 hover:scale-105
                             focus:outline-none focus-visible:ring-4 focus-visible:ring-orange-300"
                    >
                        Continuar <ArrowRight size={32} />
                    </button>
                </>
            ) : fase === 'confirmando' ? (
                <>
                    <p className="text-3xl font-bold text-orange-900">Você é o {nomeCandidato}?</p>
                    <div className="flex gap-6">
                        <button
                            onClick={confirmarSim}
                            aria-label="Sim"
                            className="cursor-pointer flex h-24 w-24 items-center justify-center rounded-full
                                 bg-emerald-500 text-white shadow-xl transition active:scale-95 hover:scale-105
                                 focus:outline-none focus-visible:ring-4 focus-visible:ring-emerald-300"
                        >
                            <ThumbsUp size={40} />
                        </button>
                        <button
                            onClick={confirmarNao}
                            aria-label="Não"
                            className="cursor-pointer flex h-24 w-24 items-center justify-center rounded-full
                                 bg-rose-500 text-white shadow-xl transition active:scale-95 hover:scale-105
                                 focus:outline-none focus-visible:ring-4 focus-visible:ring-rose-300"
                        >
                            <ThumbsDown size={40} />
                        </button>
                    </div>
                    <BotaoOuvirDeNovo texto={FALAS_AUTH.confirmarNome(nomeCandidato)} />
                </>
            ) : (
                <>
                    <p className="text-3xl font-bold text-orange-900">Qual é o seu nome?</p>
                    <button
                        onClick={escutar}
                        disabled={fase === 'ouvindo'}
                        aria-label={fase === 'ouvindo' ? 'Ouvindo' : 'Toque para falar'}
                        className={`cursor-pointer flex h-32 w-32 items-center justify-center rounded-full
                             text-white shadow-xl transition active:scale-95 hover:scale-105
                             focus:outline-none focus-visible:ring-4 focus-visible:ring-orange-300
                             ${fase === 'ouvindo' ? 'bg-orange-600 motion-safe:animate-pulse' : 'bg-orange-500'}`}
                    >
                        {fase === 'ouvindo' ? <Loader2 size={56} className="animate-spin" /> : <Mic size={56} />}
                    </button>
                    <span className="text-lg text-stone-600">Toque no microfone e diga seu nome</span>
                    <BotaoOuvirDeNovo audio={FRASES.pedirNome.audio} />
                </>
            )}
        </main>
    );
}
