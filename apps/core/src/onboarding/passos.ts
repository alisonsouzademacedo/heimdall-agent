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
  { id: 'whatsapp', titulo: 'Conectar o WhatsApp', mito: 'Bifröst · a ponte', explicacao: 'Gera o QR Code e confirma a conexao. O Heimdall so escuta; nunca envia a ninguem alem de voce.', pronto: false },
  { id: 'cadastro', titulo: 'Cadastro', mito: 'Os Nove Mundos · quem é quem', explicacao: 'Quem e voce, a empresa e a equipe interna.', pronto: false },
  { id: 'sincronizar', titulo: 'Sincronizar com o telefone', mito: 'O ouvido que escuta a relva crescer', explicacao: 'Traz todo o historico que o WhatsApp entregar, com barra de progresso real.', pronto: false },
  { id: 'extrair', titulo: 'Extrair', mito: 'Runas · gravar o que foi dito', explicacao: 'Guarda mensagens e baixa audios e PDFs originais antes que expirem.', pronto: false },
  { id: 'modelo', titulo: 'Conectar o modelo', mito: 'Mímisbrunnr · a fonte da sabedoria', explicacao: 'Assinatura do ChatGPT ou chave de API, com chamada de teste.', pronto: false },
  { id: 'processar', titulo: 'Processar', mito: 'Yggdrasil · as raízes da memória', explicacao: 'Transcreve audios, converte PDFs e extrai compromissos. Inclui o teste rapido com os seus proprios arquivos.', pronto: false },
  { id: 'voz', titulo: 'Voz e personalidade', mito: 'Gjallarhorn · a voz', explicacao: 'Mostra como o Heimdall entendeu o seu jeito e pede a sua aprovacao.', pronto: false },
  { id: 'selfchat', titulo: 'Self-chat', mito: 'Huginn e Muninn · pensamento e memória', explicacao: 'Teste de ida e volta e dos codigos de correcao (A1, F2, P1).', pronto: false },
  { id: 'agenda', titulo: 'Agenda e relatório de teste', mito: 'A vigília · cada manhã às 08:00', explicacao: 'Horarios dos relatorios e um relatorio de teste agora.', pronto: false },
  { id: 'backup', titulo: 'Backup e segurança', mito: 'O cofre de Asgard', explicacao: 'Destino do backup, primeiro backup e ensaio de restauracao.', pronto: false },
  { id: 'pronto', titulo: 'Pronto', mito: 'Heimdall vigia', explicacao: 'Painel de status. Daqui em diante e automatico.', pronto: false }
];
