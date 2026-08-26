'use client';
import { useEffect } from 'react';
import { usarApp } from '@/contexto/AppProvider';
import { MODULOS_CONFIG, ORDEM_MODULOS } from '@/lib/modulos';
import { ModuloId } from '@/lib/estado';

export function TelaModulos() {
    const { abrirModulo, dispararEvento } = usarApp();

    useEffect(() => {
        dispararEvento(
            'O usuário está na tela com as quatro áreas de estudo. ' +
            'Apresente as quatro pela cor e pela posição, e convide a escolher uma.',
            'modulos_intro'
        );
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // a tela de lições já se anuncia sozinha no próprio mount — não dispara evento aqui
    const escolher = (id: ModuloId) => {
        abrirModulo(id);
    };

    return (
        <main className="min-h-dvh bg-stone-50 px-6 py-10">
            <div className="mx-auto grid max-w-md grid-cols-2 gap-5">
                {ORDEM_MODULOS.map((id) => {
                    const cfg = MODULOS_CONFIG[id];
                    return (
                        <button
                            key={id}
                            onClick={() => escolher(id)}
                            aria-label={cfg.nome}
                            className={`flex aspect-square flex-col items-center justify-center gap-3
                          rounded-3xl ${cfg.bg} text-white shadow-lg transition cursor-pointer hover:scale-105
                          active:scale-95 focus:outline-none focus-visible:ring-4 ${cfg.ring}`}
                        >
                            <span className="text-6xl font-black leading-none">{cfg.glifo}</span>
                            <span className="text-xl font-bold">{cfg.nome}</span>
                        </button>
                    );
                })}
            </div>
        </main>
    );
}