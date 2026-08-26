'use client';
import { useEffect } from 'react';
import { Mic, MicOff, Play, ArrowRight } from 'lucide-react';
import { usarApp } from '@/contexto/AppProvider';

/** Tela de entrada do app: apresenta a Nina e o botão de começar/continuar. */
export function TelaInicial() {
    const { estado, abrirModulo, irPara, aplicarEstado, dispararEvento } = usarApp();
    const novo = estado.usuarioNovo;

    /** Nina fala assim que a tela abre — mensagem diferente para usuário novo x recorrente. */
    useEffect(() => {
        dispararEvento(
            novo
                ? 'O usuário abriu o app pela primeira vez. Está na tela inicial. Dê as boas-vindas e mostre o botão grande que brilha.'
                : 'O usuário voltou ao app. Está na tela inicial. Receba de volta e convide a continuar de onde parou.',
            novo ? 'inicial_novo' : 'inicial_recorrente'
        );
        // dispara só uma vez, na montagem
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // a tela de destino já se anuncia sozinha no próprio mount — não dispara evento aqui,
    // pra não sobrepor dois áudios ao mesmo tempo
    const aoTocarComecar = () => {
        if (novo) {
            irPara('modulos');
        } else {
            const modulo = estado.ultimoModulo ?? 'alfabeto';
            abrirModulo(modulo);
        }
    };

    const alternarNina = () => {
        const ativo = !estado.assistenteAtivo;
        aplicarEstado({ ...estado, assistenteAtivo: ativo });
        if (!ativo && typeof window !== 'undefined') window.speechSynthesis?.cancel();
        if (ativo) dispararEvento('O usuário ligou a assistente de volta.');
    };

    return (
        <main className="relative flex min-h-dvh flex-col items-center justify-center
                     bg-gradient-to-b from-amber-50 to-orange-100 px-6">

            {/* Liga/desliga da Nina — canto superior ESQUERDO, pra bater com a fala que você vai gravar */}
            <button
                onClick={alternarNina}
                aria-label={estado.assistenteAtivo ? 'Desligar a assistente' : 'Ligar a assistente'}
                className={`absolute left-5 top-5 flex h-16 w-16 items-center justify-center rounded-full
                    shadow-md transition active:scale-95
                    focus:outline-none focus-visible:ring-4 focus-visible:ring-sky-400
                    ${estado.assistenteAtivo
                        ? 'bg-sky-500 text-white'
                        : 'bg-white text-slate-400'}`}
            >
                {estado.assistenteAtivo ? <Mic size={30} /> : <MicOff size={30} />}
            </button>

            {/* Nome do app — pouco texto, grande, adulto */}
            <h1 className="mb-1 text-center text-4xl font-extrabold tracking-tight text-orange-900">
                Agora eu consigo
            </h1>

            {/* O BOTÃO — o único elemento "gritante" da tela. Pulsa pra dizer "toque aqui". */}
            <div className="relative mt-12">
                <span
                    className="absolute inset-0 rounded-full bg-orange-400 opacity-60
                     motion-safe:animate-ping"
                    aria-hidden
                />
                <button
                    onClick={aoTocarComecar}
                    aria-label={novo ? 'Começar' : 'Continuar'}
                    className="cursor-pointer relative flex h-44 w-44 flex-col items-center justify-center gap-2
                     rounded-full bg-orange-500 text-white shadow-xl transition active:scale-95
                     focus:outline-none focus-visible:ring-4 focus-visible:ring-orange-300"
                >
                    {novo ? <Play size={60} /> : <ArrowRight size={60} />}
                    <span className="text-2xl font-bold">{novo ? 'Começar' : 'Continuar'}</span>
                </button>
            </div>
        </main>
    );
}