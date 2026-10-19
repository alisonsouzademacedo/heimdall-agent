# Prompt inicial para a IA no notebook do dono (copiar e colar)

Como usar: (1) deixe fechados os programas pesados; (2) baixe o projeto; (3) abra a IA **dentro da pasta do projeto**; (4) cole o texto da caixa abaixo.

## 1. Baixar o projeto (sem Git)
No navegador, logado no GitHub: abra `https://github.com/alisonsouzademacedo/heimdall-agent/tree/claude/affectionate-albattani-rtz8mu`, clique em **Code → Download ZIP**, extraia (ex.: `C:\Heimdall`). Com Git instalado, equivale a: `git clone -b claude/affectionate-albattani-rtz8mu https://github.com/alisonsouzademacedo/heimdall-agent.git C:\Heimdall`.
(O repositório ainda não tem a branch `main`; por isso o nome da branch.)

## 2. Abrir uma IA na pasta
Segundo `docs/claude-code/setup.md`: no PowerShell, `irm https://claude.ai/install.ps1 | iex`; abra um terminal novo, entre na pasta (`cd C:\Heimdall`) e rode `claude`. O Git for Windows é recomendado (dá o `sh` que os testes usam). Codex ou Antigravity também servem: leem o `AGENTS.md` sozinhos.

## 3. Texto para colar
```
Você é a IA instaladora do projeto Heimdall, neste notebook (Windows 11 Pro, 8 GB de RAM, 84 GB livres, GTX 1650). Sou o dono; não sou programador: explique em português simples.

ANTES DE QUALQUER AÇÃO, leia por inteiro, nesta ordem:
1) AGENTS.md (regras; as 6 inegociáveis valem acima de tudo)
2) docs/plano/PROGRESS.md (onde paramos) e docs/plano/README.md (decisões D1-D29)
3) docs/plano/fase-1-spike.md (parte B), docs/plano/fase-1-requisitos-e-preflight.md, docs/plano/fase-1-arquitetura-e-compose.md
4) docs/plano/runbooks/ (README e 01 a 08)
Depois leia a documentação de cada componente ANTES de mexer nele (tabela do AGENTS.md; páginas inteiras, não trechos).

OBJETIVO DESTA SESSÃO: deixar o "background" pronto para eu fazer o resto pela tela de onboarding (protótipo em docs/plano/prototipo-onboarding/). A definição de pronto está no fim de docs/plano/fase-1-onboarding-visual.md.

PASSOS (um de cada vez; avise o que vai fazer e como eu confiro; PARE e peça minha confirmação antes de instalar programas, ativar WSL2/virtualização, abrir portas, fazer login, escanear QR ou apagar algo):
0. Rode spike/preflight (powershell -ExecutionPolicy Bypass -File .\spike\preflight\preflight.ps1) e mostre o resultado.
1. Rode a linha de base dos testes: em apps\core, "npm test" (precisa Node 22.18+). Se o Git Bash existir: "sh tests/run-all.sh". Mostre a saída real. Se algo falhar, o código está errado até se provar o contrário (regra 5): me explique e espere.
2. Instale o que falta, um por vez, com minha confirmação: Docker Desktop (runbook 01), Node 22, Python 3, Git. Registre versões em docs/plano/PROGRESS.md.
3. Siga os runbooks 02 (Hindsight; ATENÇÃO: configurar embeddings, reranker e busca em PORTUGUÊS antes de qualquer carga), 03 (Hermes; restringir ferramentas, chave da API, pasta de trabalho que NÃO seja a raiz do repositório), 06 (transcrição e PDF). Fixe versões; nada de "latest".
4. Verifique as "só a prática" do runbooks/README.md (marcadas como não verificadas) e registre o que viu funcionar.
5. Antes de cada etapa que me exija (QR do WhatsApp, login do ChatGPT em Hermes e Hindsight, escolha do destino do backup), pare e me diga EXATAMENTE o que fazer.

REGRAS DE OURO: nunca envie mensagem a ninguém (só existirá o self-chat); nunca peça nem imprima chaves, tokens ou conversas no chat (eu digito segredos só aqui, na minha máquina); dados reais ficam em data\ (fora do git); todo erro resolvido vira teste que falhava + correção + registro em docs/plano/LICOES.md; mudanças pequenas; ao terminar cada passo, atualize docs/plano/PROGRESS.md e faça commit. Não use o Strix (decidi não adotar).
Comece pelo passo 0.
```
