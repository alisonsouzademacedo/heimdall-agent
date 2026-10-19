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

## Decisões do usuário (2026-10-20)
- **Escuta tudo.** O usuário **não tem contatos pessoais** no WhatsApp empresarial, só o **próprio número pessoal**. Esse número entra no cadastro do usuário (campo "Meu número pessoal") com `papel = dono_pessoal`: fica **fora das regras de cliente** (não gera follow-up nem cobrança) e seu conteúdo é contexto do próprio usuário. Não é canal de comando: o Heimdall só conversa com o dono no self-chat. A seção opcional "contatos a ignorar" dos modelos fica **vazia**.
- **Cadastro por formulário** na tela de onboarding (não por arquivo). O formulário grava o que hoje está nos modelos: os campos dos três modelos são a especificação dos campos do formulário. Os arquivos em `data/cadastro/` passam a ser a **cópia exportável** do que foi preenchido.

## Formulário (campos)
1. **Usuário:** nome completo, como prefere ser chamado, função, o que faz no dia a dia, telefone do WhatsApp comercial, número pessoal, metas, jeito de se comunicar, horário de trabalho, observações.
2. **Empresa:** nome, o que faz e vende, produtos e serviços, para quem vende, diferenciais, processo comercial, objeções comuns e como contornar, objeções irreversíveis, concorrentes, site e canais. (O funil de 5 etapas já vem preenchido.)
3. **Equipe:** tabela com nome, função, telefone (com validação e máscara de DDI e DDD), relação, observações; botão para adicionar linha. Depois de conectar o WhatsApp, a tela mostra, ao lado de cada telefone, se ele foi **encontrado no WhatsApp** (resolvido por `onWhatsApp`) e avisa os que não foram.
Posição no onboarding: depois do passo 1 (QR), porque a verificação dos telefones precisa da conexão; o preenchimento em si pode ser feito antes.
