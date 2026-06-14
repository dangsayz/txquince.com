# /voice — your AI voice, portable

This folder is a self-contained bundle of the `/voice` Claude Code skill plus your
voice blueprint. Installing it puts `/voice` at the **user level**, so it works in
**every Claude Code project** on that machine — now and future.

## Install on your computer (Mac / Linux) — run once

```bash
bash ai-voice/install-voice.sh
```

That script writes:

- `~/.claude/skills/voice/SKILL.md` — the skill (this is why `/voice` appears in every project)
- `~/.ai-voice/me/*.md` — your voice files (tone, vocabulary, beliefs, etc.)

Then **restart Claude Code** and type:

```
/voice draft a post about owning your pipeline
```

## What's in here

| Path | What it is |
|------|-----------|
| `install-voice.sh` | One-shot installer (self-contained — recreates everything) |
| `skills/voice/SKILL.md` | The `/voice` skill definition |
| `me/*.md` | Your voice blueprint — edit these to make the voice sharper |

## Make it yours
The `me/` files have `TODO` placeholders (your name, real stats, real stories).
The voice works without them, but it gets noticeably better as you fill them in.
Edit the files in `~/.ai-voice/me/` after installing — `/voice` reads them live.

## Notes
- **Per machine:** run the installer once on each computer where you use Claude Code.
- **Windows:** use WSL or Git Bash to run the script, or create the two paths manually.
- This bundle is just a backup/installer; the live copy lives at `~/.ai-voice` and `~/.claude/skills/voice` after install.
