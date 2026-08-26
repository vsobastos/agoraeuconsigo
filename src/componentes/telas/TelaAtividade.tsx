'use client';
import { useEffect, useRef, useState } from 'react';
import { Check, Volume2, ArrowRight } from 'lucide-react';
import { MODULOS_CONFIG } from '@/lib/modulos';
import { CONTEUDO } from '@/lib/conteudo';
import { usarApp } from '@/contexto/AppProvider';
import { registrarProgresso } from '@/lib/estado';

/** Normaliza texto para comparação de resposta: maiúsculas, sem espaços. */
const norm = (s: string) => s.toUpperCase().replace(/\s+/g, '');

/** Tela de exercícios de uma lição: apresenta cada item e confere a resposta digitada. */
export function TelaAtividade() {
    const { estado, nav, aplicarEstado, abrirModulo, dispararEvento } = usarApp();
    const moduloId = nav.moduloAtivo;
    const licaoId = nav.licaoAtiva;

    const [indice, setIndice] = useState(0);
    const [digitado, setDigitado] = useState('');
    const [acertou, setAcertou] = useState(false);
    /** Só mostra feedback verde/vermelho depois de clicar em "Conferir" — digitando, as caixas ficam neutras. */
    const [conferido, setConferido] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    const itens = licaoId ? (CONTEUDO[licaoId] ?? []) : [];
    const total = itens.length;
    const item = itens[indice];
    const cfg = moduloId ? MODULOS_CONFIG[moduloId] : null;
    const alvo = item ? norm(item.resposta) : '';
    const dig = norm(digitado);

    /** Nina apresenta cada item ao entrar na tela ou avançar para o próximo. */
    useEffect(() => {
        if (!item) return;
        dispararEvento(
            item.tipo === 'copiar'
                ? `O usuário precisa copiar "${item.enunciado}". Peça para ele escrever, letra por letra, o que está grande na tela.`
                : `A pergunta é "${item.enunciado}" e a resposta é "${item.resposta}". Leia a pergunta e peça a resposta — sem entregá-la.`,
            item.tipo === 'copiar' ? 'atividade_copiar' : 'atividade_responder'
        );
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [indice, licaoId]);

    if (!moduloId || !licaoId || !cfg) return null;
    if (!item) {
        return (
            <main className="flex min-h-dvh items-center justify-center bg-stone-50 px-6 text-center">
                <p className="text-xl text-stone-500">Esta atividade ainda não tem conteúdo.</p>
            </main>
        );
    }

    /** Confere a resposta digitada contra o alvo do item atual e reage (acerto/erro/conclusão). */
    const conferir = () => {
        setConferido(true);
        if (dig === alvo) {
            setAcertou(true);
            const feitos = indice + 1;
            aplicarEstado(
                registrarProgresso(estado, moduloId, licaoId, Math.round((feitos / total) * 100))
            );
            if (feitos >= total) {
                dispararEvento(`O usuário terminou toda a atividade "${cfg.nome}"! Comemore bastante e avise que a próxima foi liberada.`, 'licao_concluida');
            } else {
                // só avança pro próximo item quando o áudio de "acertou" tiver acabado de tocar
                dispararEvento('O usuário acertou. Comemore com carinho e siga para o próximo.', 'acertou')
                    .then(() => { setIndice((i) => i + 1); setDigitado(''); setAcertou(false); setConferido(false); });
            }
        } else {
            // toca o áudio de "errou" e só então limpa o campo, pra dar chance de tentar de novo
            dispararEvento(`O usuário tentou e não acertou "${item.enunciado}". Anime, sem dizer que errou, e ofereça ajuda.`, 'errou')
                .then(() => { setDigitado(''); setConferido(false); });
        }
    };

    const pedirAjuda = () =>
        dispararEvento(`O usuário pediu ajuda com "${item.enunciado}". Se for palavra, soletre devagar; se for conta, dê uma dica simples.`);

    const licaoConcluida = acertou && indice + 1 >= total;

    return (
        <main className="flex min-h-dvh flex-col bg-stone-50 px-6 py-10">
            <p className="mb-6 text-center text-lg font-semibold tabular-nums text-stone-400">
                {Math.min(indice + 1, total)} / {total}
            </p>

            <div className="mb-10 text-center">
                <span className={`inline-block rounded-2xl px-8 py-6 text-6xl font-black text-white ${cfg.bg}`}>
                    {item.enunciado}
                </span>
            </div>

            {/* caixas com feedback verde/vermelho — toque foca o teclado */}
            <div className="relative mx-auto mb-8 w-full max-w-md" onClick={() => inputRef.current?.focus()}>
                <div className="flex justify-center gap-3">
                    {Array.from({ length: alvo.length }).map((_, i) => {
                        const preenchida = i < dig.length;
                        const certa = preenchida && conferido && dig[i] === alvo[i];
                        const errada = preenchida && conferido && dig[i] !== alvo[i];
                        return (
                            <div
                                key={i}
                                className={`flex h-20 w-16 items-center justify-center rounded-xl border-4 text-4xl font-black
                            ${!preenchida ? 'border-stone-200 bg-white text-stone-300'
                                        : certa ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                                            : errada ? 'border-red-400 bg-red-50 text-red-600'
                                                : 'border-sky-300 bg-white text-stone-700'}`}
                            >
                                {preenchida ? dig[i] : ''}
                            </div>
                        );
                    })}
                </div>
                {/* input real invisível: traz o teclado e captura as teclas */}
                <input
                    ref={inputRef}
                    value={digitado}
                    onChange={(e) => { if (!acertou) { setDigitado(e.target.value); setConferido(false); } }}
                    maxLength={alvo.length}
                    autoFocus
                    inputMode={moduloId === 'numeros' || moduloId === 'calculos' ? 'numeric' : 'text'}
                    aria-label="Escreva aqui"
                    className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                />
            </div>

            <div className="mx-auto flex w-full max-w-md flex-col gap-3">
                {!acertou && (
                    <button
                        onClick={conferir}
                        className="flex items-center justify-center gap-3 rounded-2xl bg-emerald-500 py-6
                       text-2xl font-bold text-white shadow-md transition active:scale-95
                       focus:outline-none focus-visible:ring-4 focus-visible:ring-emerald-300"
                    >
                        <Check size={32} /> Conferir
                    </button>
                )}

                {estado.assistenteAtivo && !acertou && (
                    <button
                        onClick={pedirAjuda}
                        className="flex items-center justify-center gap-3 rounded-2xl bg-white py-5
                       text-xl font-semibold text-stone-600 shadow-sm transition active:scale-95
                       focus:outline-none focus-visible:ring-4 focus-visible:ring-sky-300"
                    >
                        <Volume2 size={28} /> Me ajuda
                    </button>
                )}

                {licaoConcluida && (
                    <button
                        onClick={() => abrirModulo(moduloId, false)}
                        className={`flex items-center justify-center gap-3 rounded-2xl ${cfg.bg} py-6
                        text-2xl font-bold text-white shadow-md transition active:scale-95`}
                    >
                        <ArrowRight size={32} /> Continuar
                    </button>
                )}
            </div>
        </main>
    );
}