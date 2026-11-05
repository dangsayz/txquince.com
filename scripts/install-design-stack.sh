#!/usr/bin/env bash
# Installs the design/frontend skill stack used for every UI job (see CLAUDE.md
# "Design workflow"). Idempotent; safe to re-run in a fresh cloud session.
# Plugin installs (mobbin, frontend-design) are Claude Code slash commands and
# must be run in the chat: /plugin marketplace add mobbin/skills && /plugin install mobbin@mobbin
# and /plugin install frontend-design@claude-plugins-official
set -u
cd "$(dirname "$0")/.."
run() { echo "== $*"; "$@" || echo "!! failed: $* (continuing)"; }
run npx -y skills add https://github.com/Leonxlnx/taste-skill --skill design-taste-frontend -y
run npx -y impeccable install
run npx -y skills add https://github.com/emilkowalski/skills --skill pick-ui-library -y
run npx -y skills add Jakubantalik/transitions.dev -y
run npx -y skills add vercel-labs/agent-skills --skill web-design-guidelines -y
