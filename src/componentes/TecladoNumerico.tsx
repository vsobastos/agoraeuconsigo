'use client';
import { Delete, Check } from 'lucide-react';

interface Props {
    valor: string;
    onDigitar: (digito: string) => void;
    onApagar: () => void;
    onConfirmar: () => void;
}

const TECLA = 'cursor-pointer flex h-16 w-16 items-center justify-center rounded-full bg-white ' +
    'text-2xl font-bold text-stone-700 shadow-md transition active:scale-95 hover:scale-105 ' +
    'focus:outline-none focus-visible:ring-4 focus-visible:ring-sky-300';

/** Teclado numérico grande para confirmar o número de acesso por toque. */
export function TecladoNumerico({ valor, onDigitar, onApagar, onConfirmar }: Props) {
    return (
        <div className="flex flex-col items-center gap-4">
            <div className="min-w-32 rounded-2xl bg-white px-6 py-3 text-center text-4xl font-extrabold text-stone-800 shadow-inner">
                {valor || '—'}
            </div>
            <div className="grid grid-cols-3 gap-3">
                {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((d) => (
                    <button key={d} onClick={() => onDigitar(d)} className={TECLA}>
                        {d}
                    </button>
                ))}
                <button onClick={onApagar} aria-label="Apagar" className={`${TECLA} bg-stone-200`}>
                    <Delete size={24} />
                </button>
                <button onClick={() => onDigitar('0')} className={TECLA}>0</button>
                <button
                    onClick={onConfirmar}
                    aria-label="Confirmar"
                    disabled={!valor}
                    className={`${TECLA} bg-emerald-500 text-white disabled:opacity-40`}
                >
                    <Check size={24} />
                </button>
            </div>
        </div>
    );
}
