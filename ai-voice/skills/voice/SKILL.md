---
name: voice
description: Write content in the user's own voice — LinkedIn posts, hooks, captions, short posts, bios. Use whenever the user asks to draft something "in my voice" or write a social/long-form post. Pulls voice, stories, beliefs, stats, humour, and vocabulary from their voice blueprint at ~/.ai-voice/me/.
---

# /voice — write it in your voice

Use this skill any time the user asks you to draft a LinkedIn post, hook, caption, short post, or bio "in my voice." Default output is a LinkedIn-ready post; adapt the structure if they ask for a different format. Output is ready to paste.

## Step 1 — Load the user's voice

Always read these files first (the voice blueprint lives at `~/.ai-voice/me/`). Do not guess the user's voice — pull from source:

1. `~/.ai-voice/me/identity.md` — who they are, what they sell
2. `~/.ai-voice/me/tone.md` — how they write
3. `~/.ai-voice/me/vocabulary.md` — words they use + words to avoid
4. `~/.ai-voice/me/humour.md` — how they joke
5. `~/.ai-voice/me/beliefs.md` — their hot takes / positions
6. `~/.ai-voice/me/stories.md` — anecdotes they tell
7. `~/.ai-voice/me/data.md` and `~/.ai-voice/me/stats.md` — numbers they name-drop
8. `~/.ai-voice/me/analogies.md` — metaphors and mental models they use

If a file still has TODO placeholders, work with what's filled in and do NOT invent the missing facts (especially numbers/stories).

## Step 2 — Ask only what you can't infer

If the user gave you a topic, run with it. Only ask if it's genuinely ambiguous (e.g., "post about AI" — clarify the angle). Default to action over questioning.

## Step 3 — Post structure

1. **Bold unicode headline** (𝐁𝐎𝐋𝐃) — the big claim or result. Specifics, dollar amounts, percentages — only if real.
2. **Hook line** — one punchy line that tightens the headline.
3. **Pattern interrupt** — short line that creates tension or curiosity.
4. **Story bridge** — transition into the story (e.g., "Here's the thing:").
5. **Narrative body** — short paragraphs, 1–3 sentences each. Heavy line breaks. One thought per line. Use a real story from `me/stories.md` when the topic allows.
6. **Payoff / lesson** — the one-line takeaway. Often maps to a belief from `me/beliefs.md` (e.g., "own the pipeline," "good input, good output").
7. **Numbered list of specifics** — 3–5 items with real numbers pulled from `me/data.md` / `me/stats.md`. Never invent stats. If there are none, replace with 3–5 mechanism steps instead.
8. **Soft close / CTA** — what the reader does next. No hard pitch unless requested.

## Step 4 — Voice rules (non-negotiable)

- Match the default voice from `me/tone.md`: calm, direct, first-principles, systems-thinking, short declaratives. Never sound generic.
- Use their sentence rhythm, not yours. Period-driven, not comma-driven.
- Drop in real numbers from `me/data.md` / `me/stats.md` — never invent stats.
- Humour and profanity match `me/humour.md` and `me/vocabulary.md` — dry, understated, sparse.
- Banned words from `me/vocabulary.md` are a HARD filter. Scan the draft and remove every instance before delivering.
- End with a clear next step or a quietly confident line. No "what do you think?" engagement-bait unless asked.

## Step 5 — Banned words (hard filter)

Before returning the draft, scan against `me/vocabulary.md` § "Banned words" and remove every instance. Common AI-sounding offenders: delve, tapestry, realm, testament, navigate (verb), robust, leverage (verb), synergy, holistic, ecosystem, elevate, unlock, streamline, seamless, game-changer, supercharge, "moving forward," circle back, touch base, low-hanging fruit, "thrilled to announce," "in today's fast-paced world."

Avoid emoji spam. Match emoji usage from `me/tone.md` (default: minimal/none).

## Step 6 — Length & format

- **Default:** ~150–300 words. A story you can read on a phone.
- **Short hook post:** ~60–120 words.
- **Long-form / announcement:** 300–500 words.

Default to long-form for a launch/result; short for an opinion/quick take.

## Step 7 — Deliver

Output the post as a plain markdown code block (clean copy/paste). Below it, in 1–2 lines, note which story/stat you anchored on and one alternate hook. No preamble, no explanation — just the post.

## What success looks like

The reader can tell from the first line a calm systems-builder wrote this, not an AI. It lands one real number, tells one true story, ends with a clear next step, and contains zero banned words.
