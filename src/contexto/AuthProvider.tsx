'use client';
import {
    createContext, useContext, useState, useEffect, useCallback,
} from 'react';
import {
    Perfil,
    carregarPerfis,
    criarPerfil as criarPerfilLib,
    apagarPerfil as apagarPerfilLib,
    lerIdSessao,
    salvarIdSessao,
} from '@/lib/perfis';

interface ContextoAuth {
    perfis: Perfil[];
    perfilAtual: Perfil | null;
    prontoAuth: boolean;
    criarPerfil: (nomeExibicao: string) => Perfil;
    entrar: (perfilId: string) => boolean;
    sair: () => void;
    apagarDados: (perfilId: string) => void;
}

const Ctx = createContext<ContextoAuth | null>(null);

/** Hook de acesso ao contexto de identidade. Deve ser usado dentro de {@link AuthProvider}. */
export const usarAuth = () => {
    const c = useContext(Ctx);
    if (!c) throw new Error('usarAuth fora do AuthProvider');
    return c;
};

/**
 * Provider de identidade local (perfis por voz/toque): mantém a lista de
 * perfis do aparelho (`localStorage`) e a sessão ativa (`sessionStorage`,
 * dura só a aba atual). Não tem nenhuma ligação com o progresso das lições
 * (`EstadoApp`, em `AppProvider`) — perfil é só "quem está usando agora";
 * o progresso continua por aparelho, compartilhado entre perfis.
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [perfis, setPerfis] = useState<Perfil[]>([]);
    const [perfilAtual, setPerfilAtual] = useState<Perfil | null>(null);
    const [prontoAuth, setProntoAuth] = useState(false);

    useEffect(() => {
        const lista = carregarPerfis();
        const idSessao = lerIdSessao();
        setPerfis(lista);
        setPerfilAtual(idSessao ? lista.find((p) => p.id === idSessao) ?? null : null);
        setProntoAuth(true);
    }, []);

    /** Cria um perfil novo (Fluxo 1) e já entra com ele. */
    const criarPerfil = useCallback((nomeExibicao: string) => {
        const perfil = criarPerfilLib(nomeExibicao);
        setPerfis((atual) => [...atual, perfil]);
        setPerfilAtual(perfil);
        salvarIdSessao(perfil.id);
        return perfil;
    }, []);

    /** Entra com um perfil já existente (Fluxo 2 ou 3). `false` se o id não existir mais. */
    const entrar = useCallback((perfilId: string) => {
        const perfil = perfis.find((p) => p.id === perfilId);
        if (!perfil) return false;
        setPerfilAtual(perfil);
        salvarIdSessao(perfil.id);
        return true;
    }, [perfis]);

    /** Encerra a sessão sem apagar o perfil — volta pra tela de entrada. */
    const sair = useCallback(() => {
        setPerfilAtual(null);
        salvarIdSessao(null);
    }, []);

    /** Apaga o perfil do aparelho. Não mexe no progresso das lições (compartilhado por aparelho). */
    const apagarDados = useCallback((perfilId: string) => {
        apagarPerfilLib(perfilId);
        setPerfis((atual) => atual.filter((p) => p.id !== perfilId));
        setPerfilAtual((atual) => {
            if (atual?.id !== perfilId) return atual;
            salvarIdSessao(null);
            return null;
        });
    }, []);

    return (
        <Ctx.Provider value={{
            perfis, perfilAtual, prontoAuth, criarPerfil, entrar, sair, apagarDados,
        }}>
            {children}
        </Ctx.Provider>
    );
}
