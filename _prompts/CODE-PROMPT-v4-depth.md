---
title: CODE-PROMPT-v4-depth
purpose: Content-DEPTH upgrade — raise the per-technique authoring bar + expand coverage for OSCP (linux/windows/ad) + OSWE + OSEP
target-repo: /home/vlad/bigOscpPrep
applies-to: the same self-driving build agent that runs _prompts/LOOP.md
binds-to: CODE-PROMPT.md (FROZEN) + CODE-PROMPT-v2-arsenal.md + CODE-PROMPT-v3-osce3-packs.md
version: v4
---

# CODE-PROMPT-v4 — CONTENT DEPTH (OSCP · OSWE · OSEP)

You are the Cephalo build agent. This is a **purely additive CONTENT-DEPTH upgrade**. It adds **no type module**,
**edits no frozen file**, and **re-implements nothing**. It raises the *authoring bar* every Technique/Command must
meet, expands coverage with finer leaves, and upgrades the loop's DEFINITION OF DONE so the SAME `/loop` re-audits
existing nodes to the deeper bar and drives the new leaves to `☑`.

> **AUTHORING POSTURE (read first).** Deepen the corpus the way the loop already works: **incrementally, a few
> nodes per tick**, highest-band-first. Do NOT attempt to emit the entire offensive corpus in one bulk artifact —
> that is neither how the loop runs nor good practice. Each tick authors a handful of nodes to the rubric below,
> runs the gates, and reports. This keeps every change reviewable and within the deterministic/exam-legal posture.

---

## 0. DISCIPLINE (unchanged — every node, every tick)
- **Transform, never reproduce** — short functional headings only; summarize + LINK via `Reference`; never copy
  long-form blog/course prose. OSCE3 nodes cite `ref.osce3.joas` + ≥1 primary source.
- **No machine names** anywhere; never commit the source PDFs/lists.
- **Anti-fabrication** — never invent a CVE/EDB/flag/offset/gadget/version/function. Uncertain ⇒ literal
  `[UNVERIFIED]` + `confidence:'unverified'` + non-empty `references[]` + a human reason.
- **Defang** — RFC5737 (`198.51.100.0/24`, `192.0.2.0/24`), RFC3849, `example.local`; sensitive vars
  (`PASS`/`NTHASH`/`AESKEY`/`SESSION`/`DB_PASS`) `sensitive:true` (masked, session-only).
- **No bundled binary** — link official sources + the `ToolBinary` arsenal; never host/commit a binary.
- **OSEP evasion = methodology/concept ONLY** — theory + enumeration + tool-provenance + decision flow; never a
  working AV/EDR/AMSI/AppLocker bypass payload, loader, or stager. (`gate-evasion-methodology-only`.)
- **OSED/OSEE deep hands-on → Ringzero** (`ref.ringzero`); Cephalo ships only canonical helper syntax.
- **Deterministic · offline · no AI · exam-legal · NEVER edit a frozen module.** Depth = more `Command`s /
  `variants[]` / `notes` / `references[]` / `relatedIds` on EXISTING + new technique nodes. No new type modules.

---

## 1. THE DEPTH RUBRIC — the bar EVERY technique node must meet (re-audit existing nodes too)

A technique is `☑` only when its `Command`s **collectively** provide ALL applicable items below. A node that has a
single command where 3 standard tools exist, or that lacks the operator extras, is now **`☐` ("thin")** and must be
deepened. Audit existing OSCP/OSWE/OSEP nodes against this list and deepen the thin ones.

1. **Primary** canonical command.
2. **Tool-by-tool alternatives** wherever they genuinely exist — name and author each real alternative
   (e.g. SMB enum across `enum4linux-ng` / `netexec` / `smbclient` / `smbmap` / `rpcclient`; Kerberoast across
   `Rubeus` / impacket `GetUserSPNs` / `netexec`; lateral across every impacket exec method).
3. **Per-OS and per-`CredMode` variants** — for AD/auth commands supply the three `CredMode` variants
   (`password` / `nthash` / `kerberos`) through the frozen `variants[]` (variant-selection, never string-built).
4. **Exact real flags** + every `{{VARIABLE}}` registered in the variable registry (no invented flags).
5. **Precondition** (when/why it applies) + `danger:Severity` + `confidence`.
6. **Operator extras** that make it exam-useful: common **gotchas**, **OPSEC/lockout** notes, **output-to-watch-for**,
   the **hashcat/john mode** when a hash is produced (e.g. NetNTLMv2 `5600`, Kerberoast `13100`, AS-REP `18200`,
   constrained/PKINIT as applicable `[UNVERIFIED]` if unsure), and **troubleshooting** (the common failure + fix).
7. **Cross-links** — `relatedIds`/`tags` to the prior and next kill-chain step. **OSEP/OSWE REUSE the existing OSCP
   `ad.*`/`win.*`/`linux.*` nodes via `relatedIds` — never duplicate a command** (the overlap gate enforces this).
8. **References** — `references[]` (+ joas/primary for OSCE3) or `[UNVERIFIED]` + a ref. Engine-safe templating: any
   literal injection payload (SSTI/XXE braces) lives in `Technique.body`/`Command.notes` prose, never in `template`.

**Re-audit rule:** during STEP 2 of every tick, also re-score already-`☑` nodes against this rubric; demote thin
ones to `☐` and deepen them before authoring brand-new topics. Depth-before-breadth within a band.

---

## 2. EXPANDED COVERAGE — finer technique leaves (add to `coverage.manifest.yaml`; drive to `☑`)

These are the deeper leaves the rubric implies. IDs are dotted slugs + a one-line label + the tools/variables to
author (the loop writes the actual command bodies, to the rubric, incrementally). NO machine names. Bands:
core/high = author first; medium/low = still required for depth-complete.

### 2.1 `oscp` · Linux
- `linux.recon.{nmap-staged, rustscan, udp, masscan}` — staged scanning; vars `{{RHOST}}/{{RPORT}}/{{INTERFACE}}`.
- `linux.enum.{ftp, ssh, smtp-userenum, dns-axfr, http-dirbrute, http-vhost, http-params, http-cms, nfs, smb-multi,
  snmp, ldap-anon, mssql, mysql, postgres, rdp, winrm, redis}` — multi-tool per service.
- `linux.web.{lfi-wrappers, lfi-logpoison, rfi, sqli-manual, sqli-sqlmap, cmdi, ssti, upload-bypass, xxe}`.
- `linux.shell.{revshell-matrix, bind, pty-upgrade, pwncat}` ; `linux.transfer.{host, pull, b64, devtcp}`.
- `linux.localenum.{linpeas, pspy, manual}`.
- `linux.privesc.{sudo-gtfobins, suid-gtfobins, suid-custom, capabilities, cron-writable, cron-wildcard, path-hijack,
  nfs-norootsquash, docker, lxd, ld-preload, writable-passwd, kernel, pkexec-pwnkit}` — pkexec/kernel `[UNVERIFIED]`.
- `linux.pivot.{chisel, ligolo, ssh-tunnel, proxychains}`.

### 2.2 `oscp` · Windows (non-AD)
- `win.enum.{winpeas, seatbelt, manual, wesng}`.
- `win.loot.{cmdkey, runas-savedcred, reg-autologon, putty-vnc, unattend, webconfig, ps-history, sam-system,
  lsass-concept}`.
- `win.privesc.{svc-insecure-perms, svc-unquoted, svc-weak-reg, dll-hijack, alwaysinstallelevated, seimpersonate-potato,
  sebackup-restore, seloaddriver, semanagevolume, sedebug, setakeownership, schtask-abuse, autorun, runas-storedcred,
  uac-bypass-concept, kernel-lpe}` — potato build-gated `[UNVERIFIED]`; uac/kernel concept.
- `win.shell.{ps-revshell, ncexe, catch}` ; `win.transfer.{certutil, iwr, smbserver, bitsadmin}` ; `win.amsi.concept`.

### 2.3 `oscp` · Active Directory (deepest — author the three `CredMode` variants on lateral/cred nodes)
- `ad.enum.unauth.{smb-null, ldap-anon, rid-cycle, kerbrute-user, asrep-nopreauth, dns}`.
- `ad.enum.authed.{sharphound, bloodhound-python, bloodhound-ce, powerview, ldapdomaindump, netexec-sweep,
  certipy-find, gmsa, laps, trusts}` — bloodhound-ce schema `[UNVERIFIED]`.
- `ad.cred.{kerberoast-rubeus, kerberoast-impacket, kerberoast-netexec, kerberoast-targeted, asrep-roast, spray,
  responder, relay-smb-ldap, relay-esc8, coerce-petitpotam, coerce-printerbug, coerce-coercer, hashcat-modes}`.
- `ad.lateral.{pth, oth-ptk, ptt, psexec, smbexec, wmiexec, atexec, dcomexec, evil-winrm, winrs, rdp-pth,
  secretsdump-local}` — each with `variants[]` for password/nthash/kerberos.
- `ad.deleg.{unconstrained, constrained-s4u, rbcd}`.
- `ad.acl.{genericall, genericwrite, writeowner, writedacl, addmember, forcechangepw, shadowcred, gpo-abuse}`.
- `ad.adcs.{esc1, esc2, esc3, esc4, esc6, esc7, esc8}` (verified) + `ad.adcs.esc9-13` (`[UNVERIFIED]`).
- `ad.domdom.{dcsync, golden, silver, diamond, ntds, dsrm, adminsdholder}`.
- `ad.trusts.{enum, sid-history, cross-forest}`.
- `ad.bloodhound.{collect, cypher-library, edge-abuse-map}` — cypher library + edge→`abuseTechniqueId` FK.

### 2.4 `oswe` (deep web)
- `oswe.review.{sink-source, dangerous-funcs}` ; `oswe.authbypass.{logic, jwt, sqli}`.
- `oswe.sqli.{blind-boolean, blind-time, sqlmap, tamper, outfile, largeobject}`.
- `oswe.deser.{dotnet, java, php}` (ysoserial/.net/phpggc INVOCATIONS; gadget names `[UNVERIFIED]`).
- `oswe.ssti.{detect, jinja2, twig, freemarker, el}` (payloads in prose only).
- `oswe.xxe.{fileread, oob, blind, svg-docx}` ; `oswe.xss.{stored, dom, ato-chain}`.
- `oswe.php.{typejuggle, magichash}` (`0e` constants `[UNVERIFIED]`) ; `oswe.token.{weakrandom, mt-seed}`.
- `oswe.upload.{ext-bypass, content-type, polyglot}` ; `oswe.pgsql.{udf, udfrevshell, largeobject}`.
- `oswe.rce.{dbfunc, websocket-cmdinj}` ; `oswe.exfil.{oob, blind}`.

### 2.5 `osep` (evasion methodology-only + lateral/MSSQL/AD bridge)
- `osep.theory.os` ; `osep.clientside.{office, jscript, hta}` (methodology) ; `osep.inject.process` (methodology).
- `osep.evasion.{intro, advanced, applocker, netfilter}` (theory + enumeration commands only; no bypass payload).
- `osep.tunnel.{dns, http, icmp}` ; `osep.pivot.{chisel, ligolo}`.
- `osep.creds.{win, linux}` ; `osep.lateral.{win-bridge, linux-bridge}` (`relatedIds` → oscp `ad.*`/`win.*`/`linux.*`).
- `osep.mssql.{xpcmdshell, linkedserver, execas, mssqlclient}` (real copy-paste; `danger:critical`).
- `osep.ad.bridge` (`relatedIds` → the full oscp `ad.*` tree; zero duplication).

> Append these as a `depth-v4:` block in `coverage.manifest.yaml` (consumed by `gate-pack-coverage` / the coverage
> gate). Reuse existing technique ids where a node already exists — a new leaf that overlaps gets `relatedIds`, not a
> clone. Add `canon-map.yaml` rows (`source: 'Depth: <heading>'`) so the superset audit stays green.

---

## 3. GATES (reuse — no new gate needed)
Depth is enforced by the EXISTING gates now spanning more nodes: `gate-fabrication` + `gate-unverified-refs`
(every hard fact cited or `[UNVERIFIED]`), `gate-denylist` (no machine names), `gate-routable-ip` + `gate-placeholder`
(defang), `gate-no-bundled-binary`, `gate-evasion-methodology-only` (OSEP), `gate-overlap` + `gate-template-clone`
(OSEP/OSWE reuse, no duplication), the coverage gate (now resolving the `depth-v4` ids), and the frozen
`schema-parity` test (five frozen files byte-identical). No new gate; the bar is the **rubric audit** in §1.

---

## 4. LOOP + DEFINITION OF DONE upgrade
Append the `## v4 — DEPTH` section (below, also added to `_prompts/LOOP.md`) and extend DEFINITION OF DONE:
- **DoD additions:** (a) every node passes the §1 rubric audit (no "thin" nodes remain in any `☑` band); (b) every
  `depth-v4` coverage id is `☑`; (c) all reused gates green across the deepened corpus; (d) the five frozen files
  stay byte-identical (`git diff --stat` empty).
- **Execution:** each tick — re-audit a slice of existing nodes to the rubric (deepen thin ones), then author the
  next highest-band `depth-v4` leaves, then gates, then report. Depth-before-breadth. Never bulk-dump.
