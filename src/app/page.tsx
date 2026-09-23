'use client';
import { usarApp } from '@/contexto/AppProvider';
import { BotaoVoltar } from '@/componentes/BotaoVoltar';
import { BotaoNina } from '@/componentes/BotaoNina';
import { BotaoPerguntar } from '@/componentes/BotaoPerguntar';
import { BotaoPerfil } from '@/componentes/BotaoPerfil';
import { TelaModulos } from '@/componentes/telas/TelaModulos';
import { TelaLicoes } from '@/componentes/telas/TelaLicoes';
import { TelaAtividade } from '@/componentes/telas/TelaAtividade';
import { TelaConsentimento } from '@/componentes/telas/TelaConsentimento';
import { TelaPrimeiroAcesso } from '@/componentes/telas/TelaPrimeiroAcesso';
import { TelaEntrada } from '@/componentes/telas/TelaEntrada';
import { TelaPerfis } from '@/componentes/telas/TelaPerfis';
import { TelaMeusDados } from '@/componentes/telas/TelaMeusDados';

/** Telas do fluxo de acesso — sem o mic global de "perguntar", pra não confundir com o mic de captura de nome. */
const TELAS_ACESSO = ['consentimento', 'primeiro_acesso', 'entrada', 'perfis'];

/** Entrypoint único da SPA: alterna entre telas conforme `nav.tela` no contexto global. */
export default function Page() {
  const { nav } = usarApp();

  const tela =
    nav.tela === 'consentimento' ? <TelaConsentimento />
      : nav.tela === 'primeiro_acesso' ? <TelaPrimeiroAcesso />
        : nav.tela === 'entrada' ? <TelaEntrada />
          : nav.tela === 'perfis' ? <TelaPerfis />
            : nav.tela === 'meus_dados' ? <TelaMeusDados />
              : nav.tela === 'modulos' ? <TelaModulos />
                : nav.tela === 'licoes' ? <TelaLicoes />
                  : <TelaAtividade />;

  return (
    <>
      <BotaoNina />
      <BotaoVoltar />
      {!TELAS_ACESSO.includes(nav.tela) && <BotaoPerguntar />}
      <BotaoPerfil />
      {tela}
    </>
  );
}