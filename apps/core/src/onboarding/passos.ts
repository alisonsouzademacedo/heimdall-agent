// Os passos da tela de onboarding (docs/plano/fase-1-onboarding-visual.md, versao 2). Mesma ordem do prototipo.
export interface Passo {
  id: string;
  titulo: string;
  mito: string;
  explicacao: string;
  pronto: boolean; // true = o passo ja funciona de verdade nesta versao
}

export const PASSOS: readonly Passo[] = [
  { id: 'ambiente', titulo: 'Ambiente', mito: 'Himinbjörg · o posto de vigia', explicacao: 'Confere o computador (sistema, memoria, disco, Docker) e mostra o que falta.', pronto: true },
  { id: 'whatsapp', titulo: 'Conectar o WhatsApp', mito: 'Bifröst · a ponte', explicacao: 'Gera o QR Code e confirma a conexao. O Heimdall so escuta; nunca envia a ninguem alem de voce.', pronto: true },
  { id: 'cadastro', titulo: 'Cadastro', mito: 'Os Nove Mundos · quem é quem', explicacao: 'Cadastre a equipe interna (nao clientes): nome, funcao e telefone. Voce digita do jeito de sempre; o Heimdall entende o formato e acha a pessoa entre os contatos do WhatsApp.', pronto: true },
  { id: 'sincronizar', titulo: 'Sincronizar com o telefone', mito: 'O ouvido que escuta a relva crescer', explicacao: 'Traz todo o historico que o WhatsApp entregar e, se voce liberar, busca as mensagens mais antigas conversa por conversa. Amarelo ate acabar.', pronto: true },
  { id: 'extrair', titulo: 'Extrair', mito: 'Runas · gravar o que foi dito', explicacao: 'Guarda mensagens e baixa audios e PDFs originais antes que expirem.', pronto: true },
  { id: 'modelo', titulo: 'Conectar o modelo', mito: 'Mímisbrunnr · a fonte da sabedoria', explicacao: 'Confira o login do modelo (feito por voce, no terminal) e faca uma chamada de teste. Esta tela nunca guarda senha, token ou chave.', pronto: true },
  { id: 'processar', titulo: 'Processar', mito: 'Yggdrasil · as raízes da memória', explicacao: 'Extrai compromissos das conversas pelo modelo. So comeca depois do seu OK: voce ve quantos dias serao processados e libera ou pausa quando quiser.', pronto: true },
  { id: 'voz', titulo: 'Voz e personalidade', mito: 'Gjallarhorn · a voz', explicacao: 'Mostra como o Heimdall entendeu o seu jeito e pede a sua aprovacao.', pronto: false },
  { id: 'selfchat', titulo: 'Self-chat', mito: 'Huginn e Muninn · pensamento e memória', explicacao: 'Teste de ida e volta e dos codigos de correcao (A1, F2, P1).', pronto: true },
  { id: 'agenda', titulo: 'Agenda e relatório de teste', mito: 'A vigília · cada manhã às 08:00', explicacao: 'Horarios dos relatorios e um relatorio de teste agora.', pronto: true },
  { id: 'backup', titulo: 'Backup e segurança', mito: 'O cofre de Asgard', explicacao: 'Destino do backup, primeiro backup e ensaio de restauracao.', pronto: true },
  { id: 'pronto', titulo: 'Pronto', mito: 'Heimdall vigia', explicacao: 'Painel de status. Daqui em diante e automatico.', pronto: true }
];
