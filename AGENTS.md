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
