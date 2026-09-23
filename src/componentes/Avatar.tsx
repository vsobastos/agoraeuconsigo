import { Dog, Sun, Home, Flower2, Fish, Star, type LucideIcon } from 'lucide-react';
import { Avatar as AvatarPerfil, CorAvatar, Figura } from '@/lib/perfis';

const ICONE_FIGURA: Record<Figura, LucideIcon> = {
    cachorro: Dog,
    sol: Sun,
    casa: Home,
    flor: Flower2,
    peixe: Fish,
    estrela: Star,
};

const BG_COR: Record<CorAvatar, string> = {
    azul: 'bg-sky-500',
    amarelo: 'bg-amber-400',
    verde: 'bg-emerald-500',
    rosa: 'bg-pink-500',
    laranja: 'bg-orange-500',
    roxo: 'bg-violet-500',
};

const TAMANHOS = {
    sm: { caixa: 'h-16 w-16', icone: 28 },
    md: { caixa: 'h-24 w-24', icone: 44 },
    lg: { caixa: 'h-36 w-36', icone: 68 },
} as const;

interface Props {
    avatar: AvatarPerfil;
    tamanho?: keyof typeof TAMANHOS;
}

/** Figura + cor de um perfil, usado nos cartões da grade e na tela de confirmação. */
export function Avatar({ avatar, tamanho = 'md' }: Props) {
    const Icone = ICONE_FIGURA[avatar.figura];
    const t = TAMANHOS[tamanho];
    return (
        <div
            className={`flex ${t.caixa} shrink-0 items-center justify-center rounded-full text-white shadow-md ${BG_COR[avatar.cor]}`}
            aria-hidden
        >
            <Icone size={t.icone} />
        </div>
    );
}
