'use client';
import { usarAuth } from '@/contexto/AuthProvider';
import { usarApp } from '@/contexto/AppProvider';
import { Avatar } from './Avatar';

/**
 * Avatar de quem está usando o app — canto inferior ESQUERDO, toca pra ver
 * "Meus dados". Só aparece com uma sessão ativa (nunca durante o próprio
 * fluxo de acesso, quando ainda não há `perfilAtual`).
 */
export function BotaoPerfil() {
    const { perfilAtual } = usarAuth();
    const { irPara } = usarApp();
    if (!perfilAtual) return null;

    return (
        <button
            onClick={() => irPara('meus_dados')}
            aria-label={`Meus dados de ${perfilAtual.nomeExibicao}`}
            className="absolute cursor-pointer left-5 bottom-5 z-10 rounded-full shadow-md transition
                 active:scale-95 hover:scale-105 focus:outline-none focus-visible:ring-4 focus-visible:ring-sky-300"
        >
            <Avatar avatar={perfilAtual.avatar} tamanho="sm" />
        </button>
    );
}
