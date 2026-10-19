# Cadastro inicial: usuário, empresa e equipe

Decisão do usuário (2026-10-19): listar **todas as pessoas internas** com função e telefone, para o Heimdall ligar cada pessoa a cada contato e contextualizar tudo; cadastrar também o **próprio usuário** (nome, função, o que faz) e a **empresa** (o que faz e vende).

## Arquivos
| Arquivo | Conteúdo |
|---|---|
| `templates/cadastro/usuario.md` | modelo em branco do usuário |
| `templates/cadastro/empresa.md` | modelo em branco da empresa (inclui funil, objeções e concorrência) |
| `templates/cadastro/equipe.md` | modelo em branco da equipe (tabela) e lista opcional de **contatos pessoais a ignorar** |
Os modelos ficam no git, **em branco**. Os arquivos preenchidos ficam em `data/cadastro/` (fora do git, como todo dado pessoal). O preenchimento é feito na configuração (passo de onboarding), não agora.

## Como o Heimdall usa cada arquivo
1. **Equipe → contatos internos.** Cada linha vira um contato com `papel = interno` e `papel_fonte = cadastro`, que **vale mais do que qualquer inferência** (regra já decidida). Isso resolve "Pedro é gestor interno" sem depender de aprendizado.
2. **Telefone → identificação no WhatsApp.** A documentação do Baileys manda usar o número com código do país e só dígitos, e **usar o JID devolvido por `sock.onWhatsApp`** em vez do montado à mão, porque o WhatsApp pode normalizar o número. Como as mensagens chegam por LID, cada telefone do cadastro é resolvido também para LID (`lidMapping.getLIDsForPN`, em lote) e os dois entram em `contato_jids`. Números sem WhatsApp são listados como aviso. **Não verificado:** como números brasileiros (com ou sem o nono dígito) são normalizados; a documentação do Baileys não trata disso. Testar no spike (E1) com os números reais.
3. **Hindsight.** Os três cadastros entram como conhecimento **atemporal** (`timestamp: "unset"`, indicado pela documentação para material sem data), com `document_id` fixo (`cadastro:usuario`, `cadastro:empresa`, `cadastro:equipe`); ao editar, reenviar o mesmo `document_id` substitui a versão anterior.
4. **Hermes.** A memória nativa é pequena (`USER.md` tem 1.375 caracteres e `MEMORY.md` 2.200), então só o essencial vai para lá: nome, função, frase sobre a empresa e tom. O resto fica disponível pelo **MCP do Heimdall** (ferramentas de leitura `perfil_usuario()`, `perfil_empresa()`, `equipe()`). A personalidade de assessor vai em `SOUL.md` (arquivo de personalidade global do Hermes).
5. **Contatos pessoais a ignorar** (opcional): usam `shouldIgnoreJid` do Baileys, que descarta eventos **e a decifragem** daquele contato. Conflita com a decisão "escutar tudo"; só vale para quem o usuário listar.

## Edição depois
Editar o arquivo em `data/cadastro/` e usar "recarregar cadastro" (comando ou botão do painel). Cada recarga atualiza contatos, o Hindsight e o MCP, e registra a versão.

## Perguntas
1. Quer a lista de **contatos pessoais a ignorar**, ou o Heimdall escuta literalmente tudo, inclusive família e amigos? (Os modelos já trazem a seção, opcional.)
2. Prefere preencher em arquivo de texto ou **por formulário na tela de onboarding**? (O formulário é mais amigável, e é a base do produto comercial.)
