# 1. Docker

Fontes: `docs/docker/desktop/setup/install/{windows-install,mac-install}.md`, `docs/docker/engine/install/ubuntu.md`, `docs/docker/engine/network/port-publishing.md`.

## Requisitos
| Sistema | Requisito documentado |
|---|---|
| Windows | Docker Desktop com **WSL 2** (WSL 2.1.5 ou superior); Windows 10 22H2 (build 19045) ou Windows 11 23H2 (build 22631) ou superior; **8 GB de RAM**; virtualização ligada na BIOS/UEFI. A página lista Pro, Enterprise e Education e diz que **Home e Education só rodam contêineres Linux** (que é o nosso caso). **Verificado em 2026-10-20 (`windows-install.md` e `desktop/troubleshoot-and-support/troubleshoot/topics.md`):** a lista de requisitos cita só Pro, Enterprise e Education; porém a mesma página diz que Home e Education rodam contêineres Linux, e a página de problemas tem uma seção chamada **"WSL 2 and Windows Home"** (recursos exigidos: Virtual Machine Platform, Windows Subsystem for Linux, virtualização na BIOS e hipervisor ativo na inicialização). **Conclusão:** a documentação indica que Home funciona com WSL 2, mas **não o afirma na lista de requisitos**; só a instalação na máquina do usuário confirma |
| macOS | Docker Desktop; versão atual e as duas anteriores do macOS; **4 GB de RAM**; Rosetta 2 recomendado |
| Linux (Ubuntu) | Docker Engine; Ubuntu 22.04, 24.04, 26.04 ou 26.10, 64 bits (derivadas como Mint: não oficial) |
**Licença:** o Docker Desktop é gratuito para uso pessoal, educação e pequenas empresas (menos de 250 funcionários **e** menos de US$ 10 milhões de receita); caso contrário exige assinatura paga (`mac-install.md`). **Relevante para clientes comerciais.**

## Passos
- **Windows:** baixar o instalador (x86_64) da página `windows-install.md`; instalação por usuário é a padrão e dispensa administrador; manter o backend WSL 2.
- **macOS:** abrir `Docker.dmg` e arrastar para Aplicativos (`mac-install.md`).
- **Linux (Ubuntu):** repositório `apt` de `ubuntu.md`: instalar `ca-certificates curl`; baixar a chave em `/etc/apt/keyrings/docker.asc`; criar `/etc/apt/sources.list.d/docker.sources`; `sudo apt update`; `sudo apt install docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin`; conferir `sudo systemctl status docker`. (Comandos exatos na página.) Uso sem `sudo`: `docs/docker/engine/install/linux-postinstall.md`.

## Verificação
`docker version`; `docker run hello-world` (com `sudo` no Linux, a menos que o pós-instalação tenha sido feito); `docker compose version`.

## Boas práticas de WSL 2 (`desktop/features/wsl/best-practices.md`)
- WSL **2.1.5 ou superior** (abaixo disso o Docker Desktop pode travar); manter atualizado. Conferir com `wsl --version`.
- Dados montados em contêineres devem ficar **no sistema de arquivos do Linux (dentro do WSL)**, não em `/mnt/c/...`: o acesso pelo Windows é muito mais lento.
- O processo `vmmem.exe` pode consumir toda a memória: limitar memória, CPU e swap da máquina virtual do WSL em `.wslconfig`.
- Teste de saúde do WSL (página de problemas): `wsl -l -v` e `wsl -d docker-desktop echo WSL 2 is working`.

## Armadilhas
- Linux: portas publicadas passam por cima do ufw/firewalld; usar R1.
- Desktop (Windows/Mac): pastas do computador montadas em contêineres têm o problema do WAL (R2).
- Docker só é compatível com `iptables-nft` e `iptables-legacy` (`ubuntu.md`).

## Desfazer
Desinstalar pelo painel do sistema (Windows/Mac) ou pelos pacotes `apt` (Linux); volumes do Docker não são apagados sozinhos.

## Não verificado (só na prática)
Se o Windows do usuário (edição e versão) aceita o Docker Desktop com WSL 2; versão do WSL instalada.
