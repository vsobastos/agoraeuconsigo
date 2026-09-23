'use client';
import { useEffect, useState } from 'react';
import { Mic, Loader2 } from 'lucide-react';
import { usarApp } from '@/contexto/AppProvider';
import { usarAuth } from '@/contexto/AuthProvider';
import { FRASES } from '@/lib/frases';
import { FALAS_AUTH } from '@/lib/frases-auth';
import { encontrarPerfisPorNome, Perfil } from '@/lib/perfis';
import { ouvir } from '@/lib/voz';
import { Avatar } from '@/componentes/Avatar';
import { TecladoNumerico } from '@/componentes/TecladoNumerico';
import { BotaoOuvirDeNovo } from '@/componentes/BotaoOuvirDeNovo';

type Fase = 'pedindo_nome' | 'ouvindo_nome' | 'pedindo_numero' | 'multiplos';

/** Não achou pelo nome, ou errou o número, duas vezes seguidas: cai no Fluxo 3 (toque). */
const MAX_TENTATIVAS = 2;

/** Entrada por voz (Fluxo 2): pergunta o nome, confirma pelo número de acesso. */
export function TelaEntrada() {
    const { estado, falar, tocarAudio, irPara, irParaInicio } = usarApp();
    const { perfis, entrar } = usarAuth();
    const [fase, setFase] = useState<Fase>('pedindo_nome');
    const [tentativasNome, setTentativasNome] = useState(0);
    const [tentativasNumero, setTentativasNumero] = useState(0);
    const [perfilAlvo, setPerfilAlvo] = useState<Perfil | null>(null);
    const [candidatos, setCandidatos] = useState<Perfil[]>([]);
    const [numeroDigitado, setNumeroDigitado] = useState('');

    useEffect(() => {
        if (estado.assistenteAtivo) tocarAudio(FRASES.saudacaoEntrada.audio);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    /** Sem sucesso por voz: manda pra grade de cartões (Fluxo 3), com a frase certa pro motivo. */
    const irParaCartoes = async (fraseId: 'naoAchei' | 'microfoneNegado') => {
        if (estado.assistenteAtivo) await tocarAudio(FRASES[fraseId].audio);
        irPara('perfis');
    };

    const escutarNome = async () => {
        setFase('ouvindo_nome');
        const resultado = await ouvir();

        if (!resultado.transcricao) {
            if (resultado.erro === 'negado') { await irParaCartoes('microfoneNegado'); return; }
            const proxima = tentativasNome + 1;
            setTentativasNome(proxima);
            if (proxima >= MAX_TENTATIVAS) { await irParaCartoes('naoAchei'); return; }
            if (estado.assistenteAtivo) await tocarAudio(FRASES.ouvindoDeNovo.audio);
            setFase('pedindo_nome');
            return;
        }

        const achados = encontrarPerfisPorNome(resultado.transcricao, perfis);
        if (achados.length === 0) {
            const proxima = tentativasNome + 1;
            setTentativasNome(proxima);
            if (proxima >= MAX_TENTATIVAS) { await irParaCartoes('naoAchei'); return; }
            if (estado.assistenteAtivo) await tocarAudio(FRASES.naoEntendiNome.audio);
            setFase('pedindo_nome');
            return;
        }
        if (achados.length > 1) {
            setCandidatos(achados);
            setFase('multiplos');
            if (estado.assistenteAtivo) tocarAudio(FRASES.perfisParecidos.audio);
            return;
        }

        setPerfilAlvo(achados[0]);
        setFase('pedindo_numero');
        if (estado.assistenteAtivo) falar(FALAS_AUTH.pedirNumero(achados[0].nomeExibicao));
    };

    const escolherCandidato = (perfil: Perfil) => {
        entrar(perfil.id);
        irParaInicio();
    };

    const digitar = (d: string) => setNumeroDigitado((atual) => (atual.length >= 4 ? atual : atual + d));
    const apagar = () => setNumeroDigitado((atual) => atual.slice(0, -1));

    const confirmarNumero = async () => {
        if (!perfilAlvo) return;
        if (numeroDigitado !== '' && Number(numeroDigitado) === perfilAlvo.numero) {
            entrar(perfilAlvo.id);
            irParaInicio();
            return;
        }
        const proxima = tentativasNumero + 1;
        setTentativasNumero(proxima);
        setNumeroDigitado('');
        if (proxima >= MAX_TENTATIVAS) { await irParaCartoes('naoAchei'); return; }
        if (estado.assistenteAtivo) await tocarAudio(FRASES.numeroErrado.audio);
    };

    return (
        <main className="relative flex min-h-dvh flex-col items-center justify-center gap-8
                     bg-gradient-to-b from-sky-50 to-sky-100 px-6 text-center">
            {fase === 'multiplos' ? (
                <>
                    <p className="text-2xl font-bold text-sky-900">Toca no seu cartão</p>
                    <div className="flex flex-wrap justify-center gap-4">
                        {candidatos.map((perfil) => (
                            <button
                                key={perfil.id}
                                onClick={() => escolherCandidato(perfil)}
                                className="cursor-pointer flex flex-col items-center gap-2 rounded-2xl bg-white
                                     p-4 shadow-md transition active:scale-95 hover:scale-105
                                     focus:outline-none focus-visible:ring-4 focus-visible:ring-sky-300"
                            >
                                <Avatar avatar={perfil.avatar} />
                                <span className="text-lg font-bold text-stone-700">{perfil.numero}</span>
                                <span className="text-sm text-stone-500">{perfil.nomeExibicao}</span>
                            </button>
                        ))}
                    </div>
                    <BotaoOuvirDeNovo audio={FRASES.perfisParecidos.audio} />
                </>
            ) : fase === 'pedindo_numero' && perfilAlvo ? (
                <>
                    <Avatar avatar={perfilAlvo.avatar} tamanho="lg" />
                    <p className="text-2xl font-bold text-sky-900">Qual é o seu número, {perfilAlvo.nomeExibicao}?</p>
                    <TecladoNumerico
                        valor={numeroDigitado}
                        onDigitar={digitar}
                        onApagar={apagar}
                        onConfirmar={confirmarNumero}
                    />
                    <BotaoOuvirDeNovo texto={FALAS_AUTH.pedirNumero(perfilAlvo.nomeExibicao)} />
                </>
            ) : (
                <>
                    <p className="text-3xl font-bold text-sky-900">Qual é o seu nome?</p>
                    <button
                        onClick={escutarNome}
                        disabled={fase === 'ouvindo_nome'}
                        aria-label={fase === 'ouvindo_nome' ? 'Ouvindo' : 'Toque para falar'}
                        className={`cursor-pointer flex h-32 w-32 items-center justify-center rounded-full
                             text-white shadow-xl transition active:scale-95 hover:scale-105
                             focus:outline-none focus-visible:ring-4 focus-visible:ring-sky-300
                             ${fase === 'ouvindo_nome' ? 'bg-sky-600 motion-safe:animate-pulse' : 'bg-sky-500'}`}
                    >
                        {fase === 'ouvindo_nome' ? <Loader2 size={56} className="animate-spin" /> : <Mic size={56} />}
                    </button>
                    <button
                        onClick={() => irPara('perfis')}
                        className="cursor-pointer text-lg font-semibold text-sky-700 underline
                             focus:outline-none focus-visible:ring-4 focus-visible:ring-sky-300"
                    >
                        Ou toque no seu cartão
                    </button>
                    <BotaoOuvirDeNovo audio={FRASES.saudacaoEntrada.audio} />
                </>
            )}
        </main>
    );
}
