# Protótipo visual do onboarding

Protótipo navegável (só visual, dados de exemplo) criado em 2026-10-19 para o dono avaliar a tela de configuração. Foi publicado como "canvas" do Claude (link privado do dono); estes arquivos são a **cópia dos fontes** para o histórico. Não são o produto final: a tela real será programada no `core` depois que o dono aprovar o desenho.

## Base de design
Gerada com a skill **UI UX Pro Max** (`github.com/nextlevelbuilder/ui-ux-pro-max-skill`, licença MIT): clonada e executada com `scripts/search.py "AI agent setup wizard dashboard dark cybersecurity monitoring" --design-system --density 5 --motion 4 --variance 6`. A skill devolveu: estilo Glassmorphism (modo escuro), cores `#0F172A` (fundo), `#1B2336` (cartão), `#22C55E` (verde de sucesso), `#EF4444` (erro), tipografia Fira Code / Fira Sans, e a lista de verificação antes da entrega (ícones SVG, foco visível, movimento reduzido, contraste 4,5:1, alvos de 44 px). Para os passos usei também as consultas de UX "progress indicators" (mostrar etapa e barra de progresso).
Camada nossa (mitologia): olho de Heimdall, ponte Bifröst como linha de progresso (gradiente só nas barras), ouro `#D4A84B` do Gjallarhorn, títulos em Cormorant, nomes nórdicos nos passos.

## Arquivos
- `Main.dc.html`: onboarding interativo com os 12 passos (modo revisão libera qualquer passo).
- `Chat.dc.html`: self-chat no celular (relatório, códigos A1/F1/P1 e correção).
- `Sistema.dc.html`: folha do sistema visual.
O formato `.dc.html` depende do ambiente de canvas; não abrem sozinhos no navegador.
