'use client';
import { useEffect, useState } from 'react';
import { Trash2 } from 'lucide-react';
import { usarApp } from '@/contexto/AppProvider';
import { usarAuth } from '@/contexto/AuthProvider';
import { FRASES } from '@/lib/frases';
import { Avatar } from '@/componentes/Avatar';

/**
 * Mostra o perfil ativo e permite apagar os dados guardados no aparelho
 * (perfil e sessão). O progresso das lições não é apagado — é compartilhado
 * por aparelho, não pertence a um perfil (ver `EstadoApp` em `estado.ts`).
 */
export function TelaMeusDados() {
    const { estado, tocarAudio, irPara } = usarApp();
    const { perfilAtual, perfis, apagarDados } = usarAuth();
    const [confirmando, setConfirmando] = useState(false);

    useEffect(() => {
        if (!perfilAtual) irPara('entrada');
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [perfilAtual]);

    if (!perfilAtual) return null;

    const pedirConfirmacao = () => {
        setConfirmando(true);
        if (estado.assistenteAtivo) tocarAudio(FRASES.apagarConfirmar.audio);
    };

    const apagar = async () => {
        const idApagado = perfilAtual.id;
        const restam = perfis.filter((p) => p.id !== idApagado).length;
        apagarDados(idApagado);
        if (estado.assistenteAtivo) await tocarAudio(FRASES.apagarFeito.audio);
        irPara(restam > 0 ? 'entrada' : 'consentimento');
    };

    return (
        <main className="relative flex min-h-dvh flex-col items-center justify-center gap-8
                     bg-gradient-to-b from-stone-50 to-stone-100 px-6 text-center">
            <Avatar avatar={perfilAtual.avatar} tamanho="lg" />
            <p className="text-2xl font-bold text-stone-800">{perfilAtual.nomeExibicao}</p>
            <p className="text-lg text-stone-600">Número {perfilAtual.numero}</p>

            {confirmando ? (
                <div className="flex flex-col items-center gap-4">
                    <p className="max-w-xs text-lg text-rose-700">
                        Tem certeza? Isso apaga seu perfil deste aparelho e não pode ser desfeito.
                    </p>
                    <div className="flex gap-4">
                        <button
                            onClick={apagar}
                            className="cursor-pointer rounded-full bg-rose-600 px-8 py-4 text-xl font-bold
                                 text-white shadow-xl transition active:scale-95 hover:scale-105
                                 focus:outline-none focus-visible:ring-4 focus-visible:ring-rose-300"
                        >
                            Sim, apagar
                        </button>
                        <button
                            onClick={() => setConfirmando(false)}
                            className="cursor-pointer rounded-full bg-stone-200 px-8 py-4 text-xl font-bold
                                 text-stone-700 shadow-md transition active:scale-95 hover:scale-105
                                 focus:outline-none focus-visible:ring-4 focus-visible:ring-stone-300"
                        >
                            Cancelar
                        </button>
                    </div>
                </div>
            ) : (
                <button
                    onClick={pedirConfirmacao}
                    className="cursor-pointer flex items-center gap-3 rounded-full bg-rose-500 px-8 py-4
                         text-xl font-bold text-white shadow-xl transition active:scale-95 hover:scale-105
                         focus:outline-none focus-visible:ring-4 focus-visible:ring-rose-300"
                >
                    <Trash2 size={24} /> Apagar meus dados
                </button>
            )}
        </main>
    );
}
