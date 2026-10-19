<!-- source: https://docs.docker.com/reference/cli/docker/compose/bridge/convert/ -->
# docker compose bridge convert

**Description:** Convert compose files to Kubernetes manifests, Helm charts, or another model


**Usage:** `docker compose bridge convert`










## Description

Convert compose files to Kubernetes manifests, Helm charts, or another model



## Options

| Option | Default | Description |
|--------|---------|-------------|
| `-o`, `--output` | `out` |  The output directory for the Kubernetes resources |
| `--templates` |  |  Directory containing transformation templates |
| `-t`, `--transformation` |  |  Transformation to apply to compose model (default: docker/compose-bridge-kubernetes)<br> |
| `-y`, `--yes` |  |  Assume "yes" to the output directory overwrite prompt. For scripts/CI, where no interactive confirmation is possible<br> |






