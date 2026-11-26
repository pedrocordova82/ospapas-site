# AGENTS.md

## Project

This repository contains the MC Os Papas institutional website.

## Branches and Pull Requests

- The main development branch is `desenvolvimento`.
- The production branch is `main`.
- Codex must always create a new branch and open a Pull Request targeting `desenvolvimento`.
- Codex must never push directly to `main`.
- Production deploy happens only after merging `desenvolvimento` into `main`.

## Deployment

- The production deploy is handled by GitHub Actions to AWS S3 + CloudFront.

## Code and Website Standards

- Code comments, when necessary, must be written in Brazilian Portuguese.
- The website must remain responsive, performant, accessible, and compatible with static export.

## Desenvolvimento do portal administrativo

- Leia `ADMIN_PROJECT_SPEC.md` e `ADMIN_ARCHITECTURE.md` antes de trabalhar no portal. Consulte `ADMIN_DESIGN_SYSTEM.md` assim que o documento existir.
- Consulte `ADMIN_COST_ESTIMATE.md` para mudanças de infraestrutura ou com impacto financeiro.
- Respeite Security First, as fronteiras arquiteturais aprovadas, o comportamento do site existente e todos os bloqueadores de produção.
- Informe desvios arquiteturais antes de implementá-los. É vedado provisionar infraestrutura sem autorização.
