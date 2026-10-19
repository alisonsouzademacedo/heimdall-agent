<!-- source: https://docs.docker.com/reference/cli/docker/buildx/replay/build/ -->
# docker buildx replay build

**Description:** Rebuild an image from provenance and pinned materials

**Usage:** `docker buildx replay build [OPTIONS] SUBJECT`





> [!NOTE]
> **Experimental**
>
> This command is experimental. Experimental features are intended for testing and feedback as their functionality or design may change between releases without warning or can be removed entirely in a future release.





## Description

`replay build` reconstructs an image from the provenance attestation attached
to an existing subject.

The replay mode controls how sources are resolved:

- `materials` (default) pins every source to the digest recorded in the
  provenance. A source that is not recorded, or whose content changed, fails
  the build.
- `frontend` replays the recorded frontend and options, but resolves sources
  again, so the result can differ from the original build.

Replayed builds do not add new provenance or SBOM attestations. Local outputs
with `mode=delete` are not supported.


## Options

| Option | Default | Description |
|--------|---------|-------------|
| `--dry-run` |  |  Print a plan of the replay without solving or exporting |
| `--format` | `pretty` |  Format dry-run output (`pretty` | `json`) |
| `--load` |  |  Shorthand for `--output=type=docker` |
| `--network` |  |  Network mode for RUN instructions (`default` | `none`; defaults to the mode of the original build)<br> |
| `-o`, `--output` |  |  Output destination (format: `type=local,dest=path`) |
| `--platform` |  |  Platform of the subject to replay (defaults to the only platform of the subject or the builder default platform)<br> |
| `--progress` | `auto` |  Set type of progress output (`auto` | `plain` | `tty` | `quiet` | `rawjson`)<br> |
| `--push` |  |  Shorthand for `--output=type=registry,unpack=false` |
| `--replay-mode` | `materials` |  Replay mode (`materials` | `frontend`) |
| `--secret` |  |  Secret to expose to the replayed build (format: `id=mysecret[,src=/local/secret]`)<br> |
| `--ssh` |  |  SSH agent socket or keys to expose (format: `default|<id>[=<socket>|<key>[,<key>]]`)<br> |
| `-t`, `--tag` |  |  Image identifier (format: `[registry/]repository[:tag]`) |



## Examples

### Replay a registry image and export to an OCI tar

```console
docker buildx replay build docker-image://example.com/app@sha256:deadbeef \
  --output=type=oci,dest=replay.oci.tar
```

### Dry-run a replay to inspect the plan

```console
docker buildx replay build docker-image://example.com/app@sha256:deadbeef --dry-run --format=json | jq
```

Dry-run runs the same checks as a real replay, so a subject that cannot be
replayed fails before any build starts.



