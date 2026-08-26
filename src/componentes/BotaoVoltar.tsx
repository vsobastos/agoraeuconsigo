'use client';
import { ArrowLeft } from 'lucide-react';
import { usarApp } from '@/contexto/AppProvider';

/** Tela anterior no back stack, para cada tela que tem "voltar". */
const DESTINO = {
    modulos: 'inicial',
    licoes: 'modulos',
    atividade: 'licoes',
} as const;

/** Botão global de voltar, ausente na tela inicial (topo do back stack). */
export function BotaoVoltar() {
    const { nav, irPara } = usarApp();
    const destino = DESTINO[nav.tela as keyof typeof DESTINO];
    if (!destino) return null;

    return (
        <button
            onClick={() => irPara(destino)}
            aria-label="Voltar"
            className="absolute cursor-pointer left-5 top-5 z-10 flex h-16 w-16 items-center justify-center
                 rounded-full bg-white text-stone-600 shadow-md transition active:scale-95 hover:scale-105
                 focus:outline-none focus-visible:ring-4 focus-visible:ring-stone-300"
        >
            <ArrowLeft size={30} />
        </button>
    );
}