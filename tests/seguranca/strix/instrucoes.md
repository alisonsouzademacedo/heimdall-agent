# Instruções para a varredura do Strix no núcleo do Heimdall

Alvo: **uma cópia do código** do projeto (somente arquivos versionados). Não há aplicação web no ar nesta etapa.

## Regras do teste (obrigatórias)
- Somente **relatar**. **Não edite nenhum arquivo** do alvo e não crie arquivos fora de `/workspace` da varredura.
- Não acesse nenhuma URL, domínio ou IP. Não use a internet para atacar nada. Pesquisa de vulnerabilidades conhecidas é permitida.
- Não existe conta de WhatsApp, cliente ou segredo real neste alvo; qualquer valor parecido com segredo é de teste.
- O projeto é um agente que **só escuta** o WhatsApp de uma pessoa e só envia ao próprio chat dessa pessoa. A regra mais importante é que **nenhum código pode criar outro caminho de envio** a terceiros.

## Em foco (do mais importante ao menos)
1. **Segundo caminho de envio**: qualquer forma de enviar mensagem a um destino que não seja o self-chat (`apps/core/src/envio.ts`), inclusive por argumento extra, objeto alterável, injeção de transporte ou desvio da validação de JID (`jid.ts`).
2. **Falsificação do self-chat**: como uma mensagem de cliente poderia ser tratada como comando do dono (`ehMensagemDoSelfChat`, `fromMe`, confusão entre telefone e LID).
3. **Apagar dados sem autorização** (`apagar.ts`): contornar o código de confirmação, a validade, o uso único, a origem do self-chat; apagar dados de outro cliente; injeção de SQL pelos números/listas montados em texto.
4. **Ensino indevido** (`aprendizado.ts`): texto de cliente virando regra; mudança das regras protegidas (7 tentativas, 2 dias úteis) sem ordem do dono.
5. **Injeção de SQL e caminhos de arquivo** em `db.ts`, `ingestao.ts`, `backup.ts` (nomes de arquivo, aspas, `VACUUM INTO`).
6. **Negação de serviço por expressão regular** em `interpretarCorrecoes` e na frase de confirmação.
7. **Segredos** versionados ou impressos em logs.

## Saída esperada
Para cada achado: arquivo e linha, como explorar (passo a passo mínimo), impacto e correção sugerida. Marque como **não explorável** o que for só risco teórico.
