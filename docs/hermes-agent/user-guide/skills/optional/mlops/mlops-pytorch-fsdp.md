<!-- source: https://hermes-agent.nousresearch.com/docs/user-guide/skills/optional/mlops/mlops-pytorch-fsdp -->
[Skip to main content](https://hermes-agent.nousresearch.com/docs/user-guide/skills/optional/mlops/mlops-pytorch-fsdp#__docusaurus_skipToContent_fallback)

On this page

Fully sharded data-parallel training for large models.

## Skill metadata [​](https://hermes-agent.nousresearch.com/docs/user-guide/skills/optional/mlops/mlops-pytorch-fsdp\#skill-metadata "Direct link to Skill metadata")

|  |  |
| --- | --- |
| Source | Optional — install with `hermes skills install official/mlops/pytorch-fsdp` |
| Path | `optional-skills/mlops/pytorch-fsdp` |
| Version | `1.0.0` |
| Author | Orchestra Research |
| License | MIT |
| Dependencies | `torch>=2.0`, `transformers` |
| Platforms | linux, macos |
| Tags | `Distributed Training`, `PyTorch`, `FSDP`, `Data Parallel`, `Sharding`, `Mixed Precision`, `CPU Offloading`, `FSDP2`, `Large-Scale Training` |

## Reference: full SKILL.md [​](https://hermes-agent.nousresearch.com/docs/user-guide/skills/optional/mlops/mlops-pytorch-fsdp\#reference-full-skillmd "Direct link to Reference: full SKILL.md")

info

The following is the complete skill definition that Hermes loads when this skill is triggered. This is what the agent sees as instructions when the skill is active.

# Pytorch-Fsdp Skill

Assistance with pytorch-fsdp development, generated from official documentation.

## When to Use This Skill [​](https://hermes-agent.nousresearch.com/docs/user-guide/skills/optional/mlops/mlops-pytorch-fsdp\#when-to-use-this-skill "Direct link to When to Use This Skill")

This skill should be triggered when:

- Working with pytorch-fsdp
- Asking about pytorch-fsdp features or APIs
- Implementing pytorch-fsdp solutions
- Debugging pytorch-fsdp code
- Learning pytorch-fsdp best practices

## Quick Reference [​](https://hermes-agent.nousresearch.com/docs/user-guide/skills/optional/mlops/mlops-pytorch-fsdp\#quick-reference "Direct link to Quick Reference")

The full common-patterns catalog (~157k chars of runnable FSDP snippets) lives in
`references/common-patterns.md` — load it with `read_file` when you need wrapping,
sharding-strategy, checkpoint, or mixed-precision examples. Start there rather than
reconstructing FSDP incantations from memory.

## Reference Files [​](https://hermes-agent.nousresearch.com/docs/user-guide/skills/optional/mlops/mlops-pytorch-fsdp\#reference-files "Direct link to Reference Files")

This skill includes comprehensive documentation in `references/`:

- **other.md** \- Other documentation

Use `view` to read specific reference files when detailed information is needed.

## Working with This Skill [​](https://hermes-agent.nousresearch.com/docs/user-guide/skills/optional/mlops/mlops-pytorch-fsdp\#working-with-this-skill "Direct link to Working with This Skill")

### For Beginners [​](https://hermes-agent.nousresearch.com/docs/user-guide/skills/optional/mlops/mlops-pytorch-fsdp\#for-beginners "Direct link to For Beginners")

Start with the getting\_started or tutorials reference files for foundational concepts.

### For Specific Features [​](https://hermes-agent.nousresearch.com/docs/user-guide/skills/optional/mlops/mlops-pytorch-fsdp\#for-specific-features "Direct link to For Specific Features")

Use the appropriate category reference file (api, guides, etc.) for detailed information.

### For Code Examples [​](https://hermes-agent.nousresearch.com/docs/user-guide/skills/optional/mlops/mlops-pytorch-fsdp\#for-code-examples "Direct link to For Code Examples")

The quick reference section above contains common patterns extracted from the official docs.

## Resources [​](https://hermes-agent.nousresearch.com/docs/user-guide/skills/optional/mlops/mlops-pytorch-fsdp\#resources "Direct link to Resources")

### references/ [​](https://hermes-agent.nousresearch.com/docs/user-guide/skills/optional/mlops/mlops-pytorch-fsdp\#references "Direct link to references/")

Organized documentation extracted from official sources. These files contain:

- Detailed explanations
- Code examples with language annotations
- Links to original documentation
- Table of contents for quick navigation

### scripts/ [​](https://hermes-agent.nousresearch.com/docs/user-guide/skills/optional/mlops/mlops-pytorch-fsdp\#scripts "Direct link to scripts/")

Add helper scripts here for common automation tasks.

### assets/ [​](https://hermes-agent.nousresearch.com/docs/user-guide/skills/optional/mlops/mlops-pytorch-fsdp\#assets "Direct link to assets/")

Add templates, boilerplate, or example projects here.

## Notes [​](https://hermes-agent.nousresearch.com/docs/user-guide/skills/optional/mlops/mlops-pytorch-fsdp\#notes "Direct link to Notes")

- This skill was automatically generated from official documentation
- Reference files preserve the structure and examples from source docs
- Code examples include language detection for better syntax highlighting
- Quick reference patterns are extracted from common usage examples in the docs

## Updating [​](https://hermes-agent.nousresearch.com/docs/user-guide/skills/optional/mlops/mlops-pytorch-fsdp\#updating "Direct link to Updating")

To refresh this skill with updated documentation:

1. Re-run the scraper with the same configuration
2. The skill will be rebuilt with the latest information

- [Skill metadata](https://hermes-agent.nousresearch.com/docs/user-guide/skills/optional/mlops/mlops-pytorch-fsdp#skill-metadata)
- [Reference: full SKILL.md](https://hermes-agent.nousresearch.com/docs/user-guide/skills/optional/mlops/mlops-pytorch-fsdp#reference-full-skillmd)
- [When to Use This Skill](https://hermes-agent.nousresearch.com/docs/user-guide/skills/optional/mlops/mlops-pytorch-fsdp#when-to-use-this-skill)
- [Quick Reference](https://hermes-agent.nousresearch.com/docs/user-guide/skills/optional/mlops/mlops-pytorch-fsdp#quick-reference)
- [Reference Files](https://hermes-agent.nousresearch.com/docs/user-guide/skills/optional/mlops/mlops-pytorch-fsdp#reference-files)
- [Working with This Skill](https://hermes-agent.nousresearch.com/docs/user-guide/skills/optional/mlops/mlops-pytorch-fsdp#working-with-this-skill)
  - [For Beginners](https://hermes-agent.nousresearch.com/docs/user-guide/skills/optional/mlops/mlops-pytorch-fsdp#for-beginners)
  - [For Specific Features](https://hermes-agent.nousresearch.com/docs/user-guide/skills/optional/mlops/mlops-pytorch-fsdp#for-specific-features)
  - [For Code Examples](https://hermes-agent.nousresearch.com/docs/user-guide/skills/optional/mlops/mlops-pytorch-fsdp#for-code-examples)
- [Resources](https://hermes-agent.nousresearch.com/docs/user-guide/skills/optional/mlops/mlops-pytorch-fsdp#resources)
  - [references/](https://hermes-agent.nousresearch.com/docs/user-guide/skills/optional/mlops/mlops-pytorch-fsdp#references)
  - [scripts/](https://hermes-agent.nousresearch.com/docs/user-guide/skills/optional/mlops/mlops-pytorch-fsdp#scripts)
  - [assets/](https://hermes-agent.nousresearch.com/docs/user-guide/skills/optional/mlops/mlops-pytorch-fsdp#assets)
- [Notes](https://hermes-agent.nousresearch.com/docs/user-guide/skills/optional/mlops/mlops-pytorch-fsdp#notes)
- [Updating](https://hermes-agent.nousresearch.com/docs/user-guide/skills/optional/mlops/mlops-pytorch-fsdp#updating)
