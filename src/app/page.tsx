'use client';
import { usarApp } from '@/contexto/AppProvider';
import { BotaoVoltar } from '@/componentes/BotaoVoltar';
import { BotaoPerguntar } from '@/componentes/BotaoPerguntar';
import { TelaInicial } from '@/componentes/telas/TelaInicial';
import { TelaModulos } from '@/componentes/telas/TelaModulos';
import { TelaLicoes } from '@/componentes/telas/TelaLicoes';
import { TelaAtividade } from '@/componentes/telas/TelaAtividade';

/** Entrypoint único da SPA: alterna entre telas conforme `nav.tela` no contexto global. */
export default function Page() {
  const { nav } = usarApp();

  const tela =
    nav.tela === 'modulos' ? <TelaModulos />
      : nav.tela === 'licoes' ? <TelaLicoes />
        : nav.tela === 'atividade' ? <TelaAtividade />
          : <TelaInicial />;

  return (
    <>
      <BotaoVoltar />
      <BotaoPerguntar />
      {tela}
    </>
  );
}