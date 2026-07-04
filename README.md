# 🐙 Cephalo

**An offline, deterministic, zero‑AI command & technique reference for OSCP / OSCE³ preparation.**

Cephalo is a single‑page reference you drive yourself. Set your variables once
(attacker IP, target, creds, wordlist) and every command on every page fills in
automatically. It does **not** scan, exploit, or automate anything — you run each
command and make every decision.

> ⚠️ **Authorized testing only.** Cephalo is an educational reference for
> learner‑owned labs, HackTheBox / Proving‑Grounds, and the exams you are
> registered for. Only ever run these techniques against systems you own or are
> explicitly authorized to test. You are responsible for how you use it.

---

## Core principles

Cephalo is built around a few non‑negotiable rules, enforced by build‑time gates:

- **Zero AI.** No LLM, no inference, no `Math.random`, no ambient clock, no NLP/ML.
  Every surface (search, CVE lookup, privilege advisor, decision maps) is
  deterministic retrieval over curated tables — the same input always yields the
  same output.
- **Offline / local‑first.** No runtime network calls, no telemetry, no sign‑up.
  Installs as a PWA and works fully offline.
- **No machine names, ever.** Nothing in the content, comments, filenames, or git
  history references a specific lab machine.
- **Defanged by default.** Examples use RFC 5737 / RFC 3849 documentation ranges
  and `example.local` — never routable targets.
- **Anti‑fabrication.** Unverified CVEs, offsets, and gadgets are marked
  `[UNVERIFIED]` and carry references and a reason, never invented.
- **Link‑only tooling.** No third‑party binary is bundled or hosted — every tool
  links out to its upstream source; you fetch it yourself.
- **Sensitive values are session‑only.** Passwords, hashes, and keys are masked
  and never persisted.

## What's inside

Five knowledge packs, toggled independently (OSCP is always on):

| Pack | Focus |
|------|-------|
| **OSCP / PEN‑200** | Linux, Windows & Active Directory command core + BloodHound |
| **OSWE / WEB‑300** | White‑box web exploitation methodology |
| **OSEP / PEN‑300** | Evasion (methodology only), lateral movement, AD |
| **OSED / EXP‑301** | Windows exploit‑development reference (links out for deep hands‑on) |
| **OSEE / EXP‑401** | Advanced exploitation concepts (links out for deep hands‑on) |

Plus deterministic helper surfaces: a global Ctrl‑K search, an offline CVE /
version lookup, a privilege advisor, a Nmap triage router, a tool arsenal, and
React‑Flow attack mind‑maps.

## Quick start

Requires Node ≥ 20.18 and [pnpm](https://pnpm.io) 10.

```bash
pnpm install
pnpm dev        # builds content, then serves at http://localhost:5173
```

Other useful scripts:

```bash
pnpm build      # build content + typecheck + production bundle
pnpm test       # unit tests (Vitest)
pnpm run ci     # run every ship-blocking gate
```

## Tech stack

Vite 6 · React 18 · TypeScript (strict) · TanStack Router (hash routing) ·
Zustand · MiniSearch · @xyflow/react · Zod · Vitest · Playwright ·
vite‑plugin‑pwa (offline precache).

---

*Cephalo, offline ve tamamen deterministik bir OSCP/OSCE³ komut referansıdır —
yapay zekâ yok, ağ yok, telemetri yok. Yalnızca yetkili olduğunuz sistemlerde,
eğitim amacıyla kullanın.*
