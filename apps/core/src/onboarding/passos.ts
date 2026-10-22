// Os passos da tela de onboarding (docs/plano/fase-1-onboarding-visual.md, versao 2). Mesma ordem do prototipo.
export interface Passo {
  id: string;
  titulo: string;
  mito: string;
  explicacao: string;
  pronto: boolean; // true = o passo ja funciona de verdade nesta versao
}

export const PASSOS: readonly Passo[] = [
  { id: 'ambiente', titulo: 'Ambiente', mito: 'Himinbjörg · o posto de vigia', explicacao: 'Primeiro, o Heimdall confere o computador (sistema, memória, disco e Docker) e mostra, em linguagem simples, o que falta antes de continuar.', pronto: true },
  { id: 'whatsapp', titulo: 'Conectar o WhatsApp', mito: 'Bifröst · a ponte', explicacao: 'Você lê o QR Code com o celular. O Heimdall só escuta; nunca envia mensagem a ninguém além de você.', pronto: true },
  { id: 'cadastro', titulo: 'Cadastro', mito: 'Os Nove Mundos · quem é quem', explicacao: 'Cadastre só a equipe interna (não clientes): nome, função e telefone. Você digita do jeito de sempre; o Heimdall entende o formato e procura a pessoa nos contatos do WhatsApp.', pronto: true },
  { id: 'sincronizar', titulo: 'Sincronizar com o telefone', mito: 'O ouvido que escuta a relva crescer', explicacao: 'O Heimdall traz o histórico que o WhatsApp entregar. Se você liberar, ele também busca mensagens antigas, conversa por conversa, no seu próprio celular; isso pode demorar.', pronto: true },
  { id: 'extrair', titulo: 'Extrair', mito: 'Runas · gravar o que foi dito', explicacao: 'Guarda o texto e baixa os áudios e PDFs originais antes que o WhatsApp apague.', pronto: true },
  { id: 'modelo', titulo: 'Conectar o modelo', mito: 'Mímisbrunnr · a fonte da sabedoria', explicacao: 'O login do ChatGPT Plus é feito uma vez no terminal. Aqui você confere se o modelo responde e faz uma chamada de teste; esta tela nunca guarda senha, token ou chave.', pronto: true },
  { id: 'processar', titulo: 'Processar', mito: 'Yggdrasil · as raízes da memória', explicacao: 'O modelo lê as conversas e extrai compromissos. Só começa depois do seu OK: você vê quantos dias serão processados e pode pausar quando quiser.', pronto: true },
  { id: 'voz', titulo: 'Voz e personalidade', mito: 'Gjallarhorn · a voz', explicacao: 'Mostra como o Heimdall entendeu o seu jeito de falar e pede a sua aprovação. Ainda não está ligado nesta versão.', pronto: false },
  { id: 'selfchat', titulo: 'Self-chat', mito: 'Huginn e Muninn · pensamento e memória', explicacao: 'Teste de ida e volta no seu self-chat e dos códigos de correção (A1, F2, P1).', pronto: true },
  { id: 'agenda', titulo: 'Agenda e relatório de teste', mito: 'A vigília · cada manhã às 08:00', explicacao: 'Escolhe os horários dos relatórios e gera um relatório de teste agora, para você conferir o formato.', pronto: true },
  { id: 'backup', titulo: 'Backup e segurança', mito: 'O cofre de Asgard', explicacao: 'Escolhe onde guardar a cópia de segurança, faz o primeiro backup e ensina a restaurar.', pronto: true },
  { id: 'crm', titulo: 'CRM (Krayin)', mito: 'O quadro do funil', explicacao: 'Conecta o Krayin e confere o funil de 5 etapas. O Heimdall propõe cada movimento; você aprova no self-chat. Nenhum cartão se move sozinho.', pronto: true },
  { id: 'pronto', titulo: 'Pronto', mito: 'Heimdall vigia', explicacao: 'Painel de status. Daqui em diante é automático.', pronto: true }
];
