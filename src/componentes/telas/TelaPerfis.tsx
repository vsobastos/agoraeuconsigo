'use client';
import { useEffect, useState } from 'react';
import { UserPlus } from 'lucide-react';
import { usarApp } from '@/contexto/AppProvider';
import { usarAuth } from '@/contexto/AuthProvider';
import { FRASES } from '@/lib/frases';
import { Perfil } from '@/lib/perfis';
import { Avatar } from '@/componentes/Avatar';
import { TecladoNumerico } from '@/componentes/TecladoNumerico';
import { BotaoOuvirDeNovo } from '@/componentes/BotaoOuvirDeNovo';

const INSTRUCAO = 'Toca no seu cartão.';

/**
 * Alternativa por toque (Fluxo 3) — sempre disponível, é pra onde a entrada por
 * voz cai quando não acha ninguém, erra duas vezes, ou o microfone está
 * negado/indisponível.
 */
export function TelaPerfis() {
    const { estado, falar, tocarAudio, irPara, irParaInicio } = usarApp();
    const { perfis, entrar } = usarAuth();
    const [selecionado, setSelecionado] = useState<Perfil | null>(null);
    const [numeroDigitado, setNumeroDigitado] = useState('');

    useEffect(() => {
        if (estado.assistenteAtivo) falar(INSTRUCAO);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const digitar = (d: string) => setNumeroDigitado((atual) => (atual.length >= 4 ? atual : atual + d));
    const apagar = () => setNumeroDigitado((atual) => atual.slice(0, -1));

    const confirmar = async () => {
        if (!selecionado) return;
        if (numeroDigitado !== '' && Number(numeroDigitado) === selecionado.numero) {
            entrar(selecionado.id);
            irParaInicio();
            return;
        }
        setNumeroDigitado('');
        if (estado.assistenteAtivo) await tocarAudio(FRASES.numeroErrado.audio);
    };

    return (
        <main className="relative flex min-h-dvh flex-col items-center justify-center gap-8
                     bg-gradient-to-b from-sky-50 to-sky-100 px-6 py-16 text-center">
            {selecionado ? (
                <>
                    <Avatar avatar={selecionado.avatar} tamanho="lg" />
                    <p className="text-2xl font-bold text-sky-900">Toca no seu número</p>
                    <TecladoNumerico
                        valor={numeroDigitado}
                        onDigitar={digitar}
                        onApagar={apagar}
                        onConfirmar={confirmar}
                    />
                    <button
                        onClick={() => setSelecionado(null)}
                        className="cursor-pointer text-lg font-semibold text-sky-700 underline
                             focus:outline-none focus-visible:ring-4 focus-visible:ring-sky-300"
                    >
                        Trocar de cartão
                    </button>
                </>
            ) : (
                <>
                    <p className="text-2xl font-bold text-sky-900">Toca no seu cartão</p>
                    <div className="flex flex-wrap justify-center gap-4">
                        {perfis.map((perfil) => (
                            <button
                                key={perfil.id}
                                onClick={() => setSelecionado(perfil)}
                                className="cursor-pointer flex flex-col items-center gap-2 rounded-2xl bg-white
                                     p-4 shadow-md transition active:scale-95 hover:scale-105
                                     focus:outline-none focus-visible:ring-4 focus-visible:ring-sky-300"
                            >
                                <Avatar avatar={perfil.avatar} />
                                <span className="text-2xl font-extrabold text-stone-700">{perfil.numero}</span>
                                <span className="text-sm text-stone-500">{perfil.nomeExibicao}</span>
                            </button>
                        ))}
                        <button
                            onClick={() => irPara('consentimento')}
                            aria-label="Sou pessoa nova"
                            className="cursor-pointer flex flex-col items-center justify-center gap-2 rounded-2xl
                                 border-2 border-dashed border-sky-300 p-4 text-sky-600 transition
                                 active:scale-95 hover:scale-105
                                 focus:outline-none focus-visible:ring-4 focus-visible:ring-sky-300"
                        >
                            <UserPlus size={32} />
                            <span className="text-sm font-semibold">Sou pessoa nova</span>
                        </button>
                    </div>
                    <BotaoOuvirDeNovo texto={INSTRUCAO} />
                </>
            )}
        </main>
    );
}
