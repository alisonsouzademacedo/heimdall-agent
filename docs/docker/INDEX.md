# Docker docs — índice

Fonte: https://docs.docker.com (cópia `.md` de cada página, a partir do `llms-full.txt` do site). Páginas: 693.
**Incluído:** primeiros passos e conceitos, Docker Desktop (instalação, uso, solução de problemas), Docker Engine (instalação, daemon, rede, armazenamento, logs, segurança), Compose, Build, referência da CLI, referência do arquivo Compose e do Dockerfile.
**Não incluído:** API do Docker Hub e do Engine, Swarm, versão empresarial, contas e assinaturas, Scout, imagens endurecidas (DHI), extensões, IA (Gordon, sandboxes, Model Runner, MCP), notas de versão, CI do Build, exemplos.
Leia primeiro: `desktop/setup/`, `engine/install/`, `compose/`, `engine/containers/resource_constraints`, `desktop/troubleshoot-and-support/`.
Aliases da CLI sem página própria (404 no site): `docker build/exec/info/images/push` — ver `docker image build`, `docker container exec`, `docker system info`, `docker image ls`, `docker image push`.

## build (40)

- [Cloud driver](build/builders/drivers/cloud.md) — 0 KB
- [Docker container driver](build/builders/drivers/docker-container.md) — 7 KB
- [Docker driver](build/builders/drivers/docker.md) — 1 KB
- [Kubernetes driver](build/builders/drivers/kubernetes.md) — 19 KB
- [Remote driver](build/builders/drivers/remote.md) — 7 KB
- [Manage builders](build/builders/manage.md) — 5 KB
- [Base images](build/building/base-images.md) — 4 KB
- [Building best practices](build/building/best-practices.md) — 32 KB
- [Container Device Interface (CDI)](build/building/cdi.md) — 17 KB
- [Export binaries](build/building/export.md) — 4 KB
- [Multi-platform builds](build/building/multi-platform.md) — 16 KB
- [Multi-stage builds](build/building/multi-stage.md) — 6 KB
- [Build secrets](build/building/secrets.md) — 9 KB
- [Build variables](build/building/variables.md) — 24 KB
- [Configure BuildKit](build/buildkit/configure.md) — 11 KB
- [Dockerfile release notes](build/buildkit/dockerfile-release-notes.md) — 0 KB
- [Custom Dockerfile syntax](build/buildkit/frontend.md) — 4 KB
- [buildkitd.toml](build/buildkit/toml-configuration.md) — 11 KB
- [Azure Blob Storage cache](build/cache/backends/azblob.md) — 2 KB
- [GitHub Actions cache](build/cache/backends/gha.md) — 8 KB
- [Inline cache](build/cache/backends/inline.md) — 1 KB
- [Local cache](build/cache/backends/local.md) — 6 KB
- [Registry cache](build/cache/backends/registry.md) — 4 KB
- [Amazon S3 cache](build/cache/backends/s3.md) — 4 KB
- [Build garbage collection](build/cache/garbage-collection.md) — 12 KB
- [Build cache invalidation](build/cache/invalidation.md) — 4 KB
- [Optimize cache usage in builds](build/cache/optimize.md) — 13 KB
- [Checking your build configuration](build/checks.md) — 9 KB
- [Build context](build/concepts/context.md) — 25 KB
- [Dockerfile overview](build/concepts/dockerfile.md) — 11 KB
- [Docker Build Overview](build/concepts/overview.md) — 3 KB
- [OpenTelemetry support](build/debug/opentelemetry.md) — 1 KB
- [Image and registry exporters](build/exporters/image-registry.md) — 7 KB
- [Local and tar exporters](build/exporters/local-tar.md) — 3 KB
- [OCI and Docker exporters](build/exporters/oci-docker.md) — 3 KB
- [Annotations](build/metadata/annotations.md) — 7 KB
- [Image attestation storage](build/metadata/attestations/attestation-storage.md) — 7 KB
- [SBOM attestations](build/metadata/attestations/sbom.md) — 11 KB
- [SLSA definitions](build/metadata/attestations/slsa-definitions.md) — 24 KB
- [Provenance attestations](build/metadata/attestations/slsa-provenance.md) — 12 KB

## compose (36)

- [Customize Compose Bridge](compose/bridge/customize.md) — 10 KB
- [Use the default Compose Bridge transformation](compose/bridge/usage.md) — 5 KB
- [Use Docker Model Runner with Compose Bridge](compose/bridge/use-model-runner.md) — 3 KB
- [Using the Compose SDK](compose/compose-sdk.md) — 7 KB
- [Docker Compose Quickstart](compose/gettingstarted.md) — 17 KB
- [Build dependent images](compose/how-tos/dependent-images.md) — 4 KB
- [Best practices for working with environment variables in Docker Compose](compose/how-tos/environment-variables/best-practices.md) — 1 KB
- [Environment variables precedence in Docker Compose](compose/how-tos/environment-variables/envvars-precedence.md) — 9 KB
- [Configure pre-defined environment variables in Docker Compose](compose/how-tos/environment-variables/envvars.md) — 8 KB
- [Set environment variables within your container's environment](compose/how-tos/environment-variables/set-environment-variables.md) — 5 KB
- [Set, use, and manage variables in a Compose file with interpolation](compose/how-tos/environment-variables/variable-interpolation.md) — 11 KB
- [Use Compose Watch](compose/how-tos/file-watch.md) — 9 KB
- [Run Docker Compose services with GPU access](compose/how-tos/gpu-support.md) — 7 KB
- [Use init containers in Compose](compose/how-tos/init-containers.md) — 6 KB
- [Using lifecycle hooks with Compose](compose/how-tos/lifecycle.md) — 2 KB
- [Extend your Compose file](compose/how-tos/multiple-compose-files/extends.md) — 5 KB
- [Include](compose/how-tos/multiple-compose-files/include.md) — 4 KB
- [Merge Compose files](compose/how-tos/multiple-compose-files/merge.md) — 10 KB
- [Networking in Compose](compose/how-tos/networking.md) — 14 KB
- [Package and deploy Docker Compose applications as OCI artifacts](compose/how-tos/oci-artifact.md) — 6 KB
- [Use Compose in production](compose/how-tos/production.md) — 2 KB
- [Using profiles with Compose](compose/how-tos/profiles.md) — 5 KB
- [Specify a project name](compose/how-tos/project-name.md) — 2 KB
- [Use provider services](compose/how-tos/provider-services.md) — 4 KB
- [Control startup and shutdown order in Compose](compose/how-tos/startup-order.md) — 2 KB
- [Manage secrets securely in Docker Compose](compose/how-tos/use-secrets.md) — 4 KB
- [Install the Docker Compose plugin](compose/install/linux.md) — 3 KB
- [Install the Docker Compose standalone (Legacy)](compose/install/standalone.md) — 3 KB
- [Uninstall Docker Compose](compose/install/uninstall.md) — 1 KB
- [How Compose works](compose/intro/compose-application-model.md) — 8 KB
- [Why use Compose?](compose/intro/features-uses.md) — 3 KB
- [History and development of Docker Compose](compose/intro/history.md) — 3 KB
- [Release notes](compose/release-notes.md) — 0 KB
- [Frequently asked questions about Docker Compose](compose/support-and-feedback/faq.md) — 5 KB
- [Give feedback](compose/support-and-feedback/feedback.md) — 0 KB
- [Trust model for Compose files](compose/trust-model.md) — 5 KB

## desktop (38)

- [containerd image store](desktop/features/containerd.md) — 3 KB
- [Use the Docker Desktop CLI](desktop/features/desktop-cli.md) — 1 KB
- [GPU support in Docker Desktop for Windows](desktop/features/gpu.md) — 3 KB
- [Explore networking how-tos on Docker Desktop](desktop/features/networking/networking-how-tos.md) — 7 KB
- [Synchronized file shares](desktop/features/synchronized-file-sharing.md) — 6 KB
- [Using USB/IP with Docker Desktop](desktop/features/usbip.md) — 3 KB
- [Virtual Machine Manager](desktop/features/vmm.md) — 3 KB
- [Wasm workloads](desktop/features/wasm.md) — 7 KB
- [WSL 2 best practices for Docker Desktop on Windows](desktop/features/wsl/best-practices.md) — 2 KB
- [Custom kernels on WSL](desktop/features/wsl/custom-kernels.md) — 1 KB
- [Develop with Docker Desktop using WSL 2 on Windows](desktop/features/wsl/use-wsl.md) — 1 KB
- [How to back up and restore your Docker Desktop data](desktop/settings-and-maintenance/backup-and-restore.md) — 5 KB
- [Change your Docker Desktop settings](desktop/settings-and-maintenance/settings.md) — 26 KB
- [Install Docker Desktop on Arch-based distributions](desktop/setup/install/linux/archlinux.md) — 4 KB
- [Install Docker Desktop on Debian](desktop/setup/install/linux/debian.md) — 6 KB
- [Install Docker Desktop on Fedora](desktop/setup/install/linux/fedora.md) — 6 KB
- [Install Docker Desktop on RHEL](desktop/setup/install/linux/rhel.md) — 7 KB
- [Install Docker Desktop on Ubuntu](desktop/setup/install/linux/ubuntu.md) — 6 KB
- [Install Docker Desktop on Mac](desktop/setup/install/mac-install.md) — 11 KB
- [Understand permission requirements for Docker Desktop on Mac](desktop/setup/install/mac-permission-requirements.md) — 7 KB
- [Install Docker Desktop on Windows](desktop/setup/install/windows-install.md) — 23 KB
- [Understand permission requirements for Windows](desktop/setup/install/windows-permission-requirements.md) — 9 KB
- [Run Docker Desktop for Windows in a VM or VDI environment](desktop/setup/vm-vdi.md) — 6 KB
- [General FAQs for Desktop](desktop/troubleshoot-and-support/faqs/general.md) — 5 KB
- [FAQs for Docker Desktop for Linux](desktop/troubleshoot-and-support/faqs/linuxfaqs.md) — 7 KB
- [FAQs for Docker Desktop for Mac](desktop/troubleshoot-and-support/faqs/macfaqs.md) — 7 KB
- [FAQs on Docker Desktop releases](desktop/troubleshoot-and-support/faqs/releases.md) — 1 KB
- [FAQs for Docker Desktop for Windows](desktop/troubleshoot-and-support/faqs/windowsfaqs.md) — 3 KB
- [Give feedback](desktop/troubleshoot-and-support/feedback.md) — 1 KB
- [Troubleshoot topics for Docker Desktop](desktop/troubleshoot-and-support/troubleshoot/topics.md) — 21 KB
- [Uninstall Docker Desktop](desktop/uninstall.md) — 6 KB
- [Explore the Builds view in Docker Desktop](desktop/use-desktop/builds.md) — 9 KB
- [Explore the Containers view in Docker Desktop](desktop/use-desktop/container.md) — 5 KB
- [Explore the Images view in Docker Desktop](desktop/use-desktop/images.md) — 5 KB
- [Explore the Kubernetes view](desktop/use-desktop/kubernetes.md) — 9 KB
- [Explore the Logs view in Docker Desktop](desktop/use-desktop/logs.md) — 2 KB
- [Docker Desktop's Resource Saver mode](desktop/use-desktop/resource-saver.md) — 3 KB
- [Explore the Volumes view in Docker Desktop](desktop/use-desktop/volumes.md) — 10 KB

## engine (86)

- [Completion](engine/cli/completion.md) — 2 KB
- [Filter commands](engine/cli/filter.md) — 4 KB
- [Format command and log output](engine/cli/formatting.md) — 2 KB
- [OpenTelemetry for the Docker CLI](engine/cli/otel.md) — 5 KB
- [Use a proxy server with the Docker CLI](engine/cli/proxy.md) — 7 KB
- [GPU access](engine/containers/gpu.md) — 4 KB
- [Run multiple processes in a container](engine/containers/multi-service_container.md) — 4 KB
- [Resource constraints](engine/containers/resource_constraints.md) — 17 KB
- [Running containers](engine/containers/run.md) — 56 KB
- [Runtime metrics](engine/containers/runmetrics.md) — 21 KB
- [Start containers automatically](engine/containers/start-containers-automatically.md) — 7 KB
- [Alternative container runtimes](engine/daemon/alternative-runtimes.md) — 6 KB
- [Run containerd in the Docker daemon](engine/daemon/embedded-containerd.md) — 3 KB
- [Use IPv6 networking](engine/daemon/ipv6.md) — 5 KB
- [Live restore](engine/daemon/live-restore.md) — 3 KB
- [Read the daemon logs](engine/daemon/logs.md) — 5 KB
- [Collect Docker metrics with Prometheus](engine/daemon/prometheus.md) — 5 KB
- [Daemon proxy configuration](engine/daemon/proxy.md) — 8 KB
- [Configure remote access for Docker daemon](engine/daemon/remote-access.md) — 4 KB
- [Start the daemon](engine/daemon/start.md) — 1 KB
- [Troubleshooting the Docker daemon](engine/daemon/troubleshoot.md) — 17 KB
- [Deprecated Docker Engine features](engine/deprecated.md) — 67 KB
- [Install Docker Engine from binaries](engine/install/binaries.md) — 9 KB
- [Install Docker Engine on CentOS](engine/install/centos.md) — 12 KB
- [Install Docker Engine on Debian](engine/install/debian.md) — 14 KB
- [Install Docker Engine on Fedora](engine/install/fedora.md) — 13 KB
- [Linux post-installation steps for Docker Engine](engine/install/linux-postinstall.md) — 9 KB
- [Install Docker Engine on Raspberry Pi OS (32-bit / armhf)](engine/install/raspberry-pi-os.md) — 15 KB
- [Install Docker Engine on RHEL](engine/install/rhel.md) — 13 KB
- [Install Docker Engine on Ubuntu](engine/install/ubuntu.md) — 14 KB
- [Configure logging drivers](engine/logging/configure.md) — 10 KB
- [Amazon CloudWatch Logs logging driver](engine/logging/drivers/awslogs.md) — 12 KB
- [ETW logging driver](engine/logging/drivers/etwlogs.md) — 3 KB
- [Fluentd logging driver](engine/logging/drivers/fluentd.md) — 7 KB
- [Google Cloud Logging driver](engine/logging/drivers/gcplogs.md) — 5 KB
- [Graylog Extended Format logging driver](engine/logging/drivers/gelf.md) — 6 KB
- [Journald logging driver](engine/logging/drivers/journald.md) — 6 KB
- [JSON File logging driver](engine/logging/drivers/json-file.md) — 5 KB
- [Local file logging driver](engine/logging/drivers/local.md) — 3 KB
- [Splunk logging driver](engine/logging/drivers/splunk.md) — 13 KB
- [Syslog logging driver](engine/logging/drivers/syslog.md) — 9 KB
- [Use docker logs with remote logging drivers](engine/logging/dual-logging.md) — 6 KB
- [Customize log driver output](engine/logging/log_tags.md) — 1 KB
- [Use a logging driver plugin](engine/logging/plugins.md) — 1 KB
- [Docker contexts](engine/manage-resources/contexts.md) — 6 KB
- [Docker object labels](engine/manage-resources/labels.md) — 5 KB
- [Prune unused Docker objects](engine/manage-resources/pruning.md) — 6 KB
- [Use CA certificates with Docker](engine/network/ca-certs.md) — 7 KB
- [Bridge network driver](engine/network/drivers/bridge.md) — 27 KB
- [Host network driver](engine/network/drivers/host.md) — 5 KB
- [IPvlan network driver](engine/network/drivers/ipvlan.md) — 29 KB
- [Macvlan network driver](engine/network/drivers/macvlan.md) — 11 KB
- [None network driver](engine/network/drivers/none.md) — 1 KB
- [Overlay network driver](engine/network/drivers/overlay.md) — 16 KB
- [Docker with iptables](engine/network/firewall-iptables.md) — 7 KB
- [Docker with nftables](engine/network/firewall-nftables.md) — 13 KB
- [Legacy container links](engine/network/links.md) — 16 KB
- [Packet filtering and firewalls](engine/network/packet-filtering-firewalls.md) — 4 KB
- [Port publishing and mapping](engine/network/port-publishing.md) — 14 KB
- [Antivirus software and Docker](engine/security/antivirus.md) — 0 KB
- [AppArmor security profiles for Docker](engine/security/apparmor.md) — 11 KB
- [Verify repository client with certificates](engine/security/certificates.md) — 4 KB
- [Docker security non-events](engine/security/non-events.md) — 5 KB
- [Protect the Docker daemon socket](engine/security/protect-access.md) — 10 KB
- [Tips](engine/security/rootless/tips.md) — 5 KB
- [Troubleshooting](engine/security/rootless/troubleshoot.md) — 20 KB
- [UID/GID mapping](engine/security/rootless/uid-gid-mapping.md) — 0 KB
- [Seccomp security profiles for Docker](engine/security/seccomp.md) — 18 KB
- [Deploy Notary Server with Compose](engine/security/trust/deploying_notary.md) — 1 KB
- [Automation with content trust](engine/security/trust/trust_automation.md) — 4 KB
- [Delegations for content trust](engine/security/trust/trust_delegation.md) — 20 KB
- [Manage keys for content trust](engine/security/trust/trust_key_mng.md) — 5 KB
- [Play in a content trust sandbox](engine/security/trust/trust_sandbox.md) — 12 KB
- [Isolate containers with a user namespace](engine/security/userns-remap.md) — 12 KB
- [Bind mounts](engine/storage/bind-mounts.md) — 19 KB
- [containerd image store with Docker Engine](engine/storage/containerd.md) — 7 KB
- [BTRFS storage driver](engine/storage/drivers/btrfs-driver.md) — 13 KB
- [Device Mapper storage driver (deprecated)](engine/storage/drivers/device-mapper-driver.md) — 33 KB
- [OverlayFS storage driver](engine/storage/drivers/overlayfs-driver.md) — 18 KB
- [Select a storage driver](engine/storage/drivers/select-storage-driver.md) — 12 KB
- [VFS storage driver](engine/storage/drivers/vfs-driver.md) — 4 KB
- [windowsfilter storage driver](engine/storage/drivers/windowsfilter-driver.md) — 1 KB
- [ZFS storage driver](engine/storage/drivers/zfs-driver.md) — 10 KB
- [Image mounts](engine/storage/image-mounts.md) — 7 KB
- [tmpfs mounts](engine/storage/tmpfs.md) — 9 KB
- [Volumes](engine/storage/volumes.md) — 28 KB

## get-started (20)

- [Build, tag, and publish an image](get-started/docker-concepts/building-images/build-tag-and-publish-an-image.md) — 10 KB
- [Multi-stage builds](get-started/docker-concepts/building-images/multi-stage-builds.md) — 14 KB
- [Understanding the image layers](get-started/docker-concepts/building-images/understanding-image-layers.md) — 9 KB
- [Using the build cache](get-started/docker-concepts/building-images/using-the-build-cache.md) — 14 KB
- [Writing a Dockerfile](get-started/docker-concepts/building-images/writing-a-dockerfile.md) — 5 KB
- [Multi-container applications](get-started/docker-concepts/running-containers/multi-container-applications.md) — 11 KB
- [Overriding container defaults](get-started/docker-concepts/running-containers/overriding-container-defaults.md) — 10 KB
- [Persisting container data](get-started/docker-concepts/running-containers/persisting-container-data.md) — 6 KB
- [Publishing and exposing ports](get-started/docker-concepts/running-containers/publishing-ports.md) — 6 KB
- [Sharing local files with containers](get-started/docker-concepts/running-containers/sharing-local-files.md) — 10 KB
- [What is a container?](get-started/docker-concepts/the-basics/what-is-a-container.md) — 9 KB
- [What is a registry?](get-started/docker-concepts/the-basics/what-is-a-registry.md) — 6 KB
- [What is an image?](get-started/docker-concepts/the-basics/what-is-an-image.md) — 10 KB
- [What is Docker Compose?](get-started/docker-concepts/the-basics/what-is-docker-compose.md) — 7 KB
- [What is Docker?](get-started/docker-overview.md) — 9 KB
- [Get Docker](get-started/get-docker.md) — 1 KB
- [Educational resources](get-started/resources.md) — 4 KB
- [Roll out Docker to a pilot group](get-started/tutorials/admin-set-up.md) — 3 KB
- [Run your coding agent in a sandbox](get-started/tutorials/run-an-agent.md) — 5 KB
- [Build and share a containerized application](get-started/tutorials/run-an-app.md) — 6 KB

## reference (19)

- [Compose Build Specification](reference/compose-file/build.md) — 19 KB
- [Configs top-level element](reference/compose-file/configs.md) — 3 KB
- [Compose Deploy Specification](reference/compose-file/deploy.md) — 10 KB
- [Compose Develop Specification](reference/compose-file/develop.md) — 6 KB
- [Extensions](reference/compose-file/extension.md) — 4 KB
- [Fragments](reference/compose-file/fragments.md) — 2 KB
- [Use include to modularize Compose files](reference/compose-file/include.md) — 4 KB
- [Interpolation](reference/compose-file/interpolation.md) — 2 KB
- [Legacy versions](reference/compose-file/legacy-versions.md) — 0 KB
- [Merge Compose files](reference/compose-file/merge.md) — 4 KB
- [Models](reference/compose-file/models.md) — 1 KB
- [Define and manage networks in Docker Compose](reference/compose-file/networks.md) — 7 KB
- [Learn how to use profiles in Docker Compose](reference/compose-file/profiles.md) — 2 KB
- [Secrets](reference/compose-file/secrets.md) — 1 KB
- [Define services in Docker Compose](reference/compose-file/services.md) — 78 KB
- [Version and name top-level elements](reference/compose-file/version-and-name.md) — 1 KB
- [Define and manage volumes in Docker Compose](reference/compose-file/volumes.md) — 5 KB
- [Dockerfile reference](reference/dockerfile.md) — 122 KB
- [Glossary](reference/glossary.md) — 0 KB

## reference/cli (454)

Uma página por comando (`reference/cli/docker/...`). Consulte pelo nome do arquivo.

