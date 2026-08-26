'use client';
import { useEffect } from 'react';
import { Check, Lock, ArrowRight } from 'lucide-react';
import { MODULOS_CONFIG } from '@/lib/modulos';
import { usarApp } from '@/contexto/AppProvider';
import { Licao, licaoDestaque } from '@/lib/estado';

/** Tela com a lista de lições de um módulo, com status de bloqueio/progresso. */
export function TelaLicoes() {
    const { estado, nav, abrirLicao, dispararEvento } = usarApp();
    const moduloId = nav.moduloAtivo;

    if (!moduloId) return null;

    const modulo = estado.modulos[moduloId];
    const cfg = MODULOS_CONFIG[moduloId];
    const destaque = licaoDestaque(modulo);

    useEffect(() => {
        // depois de terminar uma atividade e voltar pra cá, já se ouviu essa introdução
        if (!nav.anunciarLicoes) return;
        dispararEvento(
            `O usuário está vendo as atividades da área "${cfg.nome}" (${cfg.corNome}). ` +
            (destaque
                ? 'A atividade que ele deve fazer agora está brilhando. Diga para tocar nela.'
                : 'Todas as atividades desta área já foram concluídas. Parabenize e sugira escolher outra área.'),
            destaque ? 'licoes_intro' : 'modulo_concluido'
        );
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [moduloId]);

    const aoTocar = (licao: Licao) => {
        if (licao.status === 'bloqueada') {
            dispararEvento(
                `O usuário tocou numa atividade ainda trancada (a número ${licao.indice}). ` +
                'Explique com carinho que primeiro ele precisa terminar a que está brilhando.',
                'licao_travada'
            );
            return;
        }
        // a tela de atividade já se anuncia sozinha no próprio mount — não dispara evento aqui
        abrirLicao(licao.id);
    };

    return (
        <main className="min-h-dvh bg-stone-50 px-6 py-10">
            <div className="mx-auto flex max-w-md flex-col gap-4">
                {modulo.licoes.map((licao) => {
                    const ehDestaque = destaque?.id === licao.id;
                    const trancada = licao.status === 'bloqueada';
                    const feita = licao.status === 'concluida';

                    return (
                        <div key={licao.id} className="relative">
                            {ehDestaque && (
                                <span
                                    className={`absolute inset-0 rounded-2xl ${cfg.bg} opacity-40 motion-safe:animate-ping`}
                                    aria-hidden
                                />
                            )}
                            <button
                                onClick={() => aoTocar(licao)}
                                aria-disabled={trancada}
                                aria-label={`Atividade ${licao.indice}${feita ? ', concluída' : trancada ? ', trancada' : ''}`}
                                className={`cursor-pointer relative flex w-full items-center gap-4 rounded-2xl px-6 py-6
                            text-left shadow-md transition active:scale-[0.98]
                            focus:outline-none focus-visible:ring-4 ${cfg.ring}
                            ${trancada ? 'bg-stone-200 text-stone-400' : `${cfg.bg} text-white`}`}
                            >
                                {/* número = a ordem E um numeral pra aprender */}
                                <span className="text-4xl font-black tabular-nums">{licao.indice}</span>

                                <span className="ml-auto flex h-12 w-12 items-center justify-center rounded-full bg-white/25">
                                    {feita ? <Check size={30} />
                                        : trancada ? <Lock size={26} />
                                            : <ArrowRight size={30} />}
                                </span>
                            </button>
                        </div>
                    );
                })}
            </div>
        </main>
    );
}