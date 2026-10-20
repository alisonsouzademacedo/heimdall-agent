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
- **Windows: antes de instalar o Docker Desktop**, conferir `systeminfo` ("Virtualização Habilitada no Firmware" ou "Um hipervisor foi detectado") e `wsl --version` (código 0). Sem virtualização ligada na BIOS/UEFI e sem WSL 2 o Docker instala mas não abre; `wsl --install` exige administrador e reinício (`windows-install.md`, "WSL: Verification and setup" e "Administrator privileges"). O instalador (`instalar.ps1`) e o passo "Ambiente" da tela já verificam isso (LICOES.md, 2026-10-19).
- **Windows: se `wsl --install` responder em círculo** ("não está instalado... instale executando `wsl.exe --install`", código 1, e os recursos seguem `Disabled`), usar o caminho manual oficial (`learn.microsoft.com/windows/wsl/install-manual`): como administrador, `dism.exe /online /enable-feature /featurename:Microsoft-Windows-Subsystem-Linux /all /norestart` e `dism.exe /online /enable-feature /featurename:VirtualMachinePlatform /all /norestart`; código **3010 = reiniciar**; depois `wsl --version` e `wsl --update`. Não instala distribuição Linux (o Docker Desktop não precisa). A saída do `wsl.exe` é UTF-16: gravar em arquivo e converter para ler.
- **Windows: memória.** Medido em 2026-10-19 (8 GB): com o Docker Desktop recém-aberto e **sem nenhum contêiner**, o processo `vmmemWSL` já ocupa ~2 GB e a memória livre caiu para ~1 GB (com navegador e o app do Claude abertos); o Docker informa `Total Memory: 3.746GiB` (padrão de metade da RAM) e não existe `.wslconfig`. A imagem completa do Hindsight pede 1,5 a 2 GB só para a API (`02-hindsight.md`): **antes de subir o Compose, fechar programas e medir; limitar a VM em `.wslconfig` é opção da documentação (`best-practices.md`)**.
- **Windows: Docker Desktop não abre e mostra "initializing Secrets Engine ... engine.sock.stale ... The file cannot be accessed by the system"** (erro 1920). É bug conhecido do Docker (issues `docker/for-win` 15057, 15063, 15064; `docker/desktop-feedback` 460, 554, 692), disparado por socket antigo em `%LOCALAPPDATA%\docker-secrets-engine\engine.sock` (e, às vezes, em `%LOCALAPPDATA%\Docker\run`, que o próprio Docker já move para `run.stale`). **Não adianta apagar o arquivo** (nenhuma ferramenta consegue abri-lo; `chkdsk /scan` sai limpo). Contorno dos relatos: **Docker Desktop e WSL parados** (`wsl --shutdown`), **renomear** (não apagar) `docker-secrets-engine`; o Docker recria. Imagens, contêineres e volumes ficam intactos. O instalador faz isso após perguntar (`instalar/docker-reparo.ps1`). **Confirmado em 2026-10-20 nesta máquina:** antes de reiniciar, remover e renomear davam "acesso negado" mesmo com Docker e WSL parados; **depois de reiniciar o Windows** (sem abrir o Docker), `wsl --shutdown` + remover o arquivo **funcionou**, e o Docker abriu sem perder imagens. Ou seja: se der "acesso negado", **reiniciar o Windows e rodar o `iniciar.cmd` antes de abrir o Docker**. Confirmar o log: `%LOCALAPPDATA%\Docker\log\host\com.docker.backend.exe.log`, linha `cleaning stale socket directories`. A pasta movida (com o arquivo) fica no disco; são 0 bytes.
- **Windows: o instalador do Docker só é executado com assinatura digital válida de "Docker Inc"** (`instalar/assinatura.ps1`). Se recusar, ver o `data\bugs\*assinatura-docker*.md` (mostra quem assinou) antes de qualquer decisão; nunca contornar.

## Desfazer
Desinstalar pelo painel do sistema (Windows/Mac) ou pelos pacotes `apt` (Linux); volumes do Docker não são apagados sozinhos.

## Não verificado (só na prática)
Se o Windows do usuário (edição e versão) aceita o Docker Desktop com WSL 2; versão do WSL instalada.
