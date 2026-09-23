'use client';
import { useEffect } from 'react';
import { Check } from 'lucide-react';
import { usarApp } from '@/contexto/AppProvider';
import { FRASES } from '@/lib/frases';
import { BotaoOuvirDeNovo } from '@/componentes/BotaoOuvirDeNovo';

/** Explica por voz o que é guardado (nome + número, só neste aparelho) antes do primeiro acesso. */
export function TelaConsentimento() {
    const { estado, tocarAudio, irPara } = usarApp();

    useEffect(() => {
        if (estado.assistenteAtivo) tocarAudio(FRASES.consentimento.audio);
        // dispara só uma vez, na montagem
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <main className="relative flex min-h-dvh flex-col items-center justify-center gap-8
                     bg-gradient-to-b from-amber-50 to-orange-100 px-6 text-center">
            <h1 className="text-3xl font-extrabold text-orange-900">Agora eu consigo</h1>
            <p className="max-w-md text-xl text-stone-700">
                Eu vou guardar só o seu nome e um número de acesso, aqui neste aparelho.
                Você pode apagar isso quando quiser.
            </p>
            <button
                onClick={() => irPara('primeiro_acesso')}
                aria-label="Eu concordo"
                className="cursor-pointer flex items-center gap-3 rounded-full bg-emerald-500 px-10 py-6
                     text-2xl font-bold text-white shadow-xl transition active:scale-95 hover:scale-105
                     focus:outline-none focus-visible:ring-4 focus-visible:ring-emerald-300"
            >
                <Check size={32} /> Eu concordo
            </button>
            <BotaoOuvirDeNovo audio={FRASES.consentimento.audio} />
        </main>
    );
}
