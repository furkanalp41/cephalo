# OSCE3 SOURCE INDEX — taxonomy + curated references for the OSWE/OSEP/OSED/OSEE packs

> Captured from `/home/vlad/OSCE3-Complete-Guide` (Joas Antonio dos Santos, "OSCE³ & OSEE Study Guide",
> source repo: https://github.com/JoasASantos/OSCE3-Complete-Guide). That repo is an INDEX/TAXONOMY only —
> a README + an .xlsx + an .xmind that link out to ~250 external resources. It contains NO commands, payloads,
> or scripts. This file distills it into the structure + primary sources the Cephalo OSCE3 packs are built from.
>
> **How this feeds the build:** the four cert areas become content **packs** (`oswe`, `osep`, `osed`, `osee`).
> `PackId` is frozen as `'oscp' | 'oswe' | 'osep' | (string & {})` — so `'osed'` and `'osee'` are allowed
> ADDITIVELY via the `(string & {})` arm with **zero** change to the frozen union. Topics below become
> Techniques; Cephalo AUTHORS the actual commands/helpers under them (model knowledge, same as the OSCP packs);
> the links below become the `Reference` registry + `ToolBinary` provenance.

## DISCIPLINE (non-negotiable — same as the rest of Cephalo)
- **Transform, never reproduce.** Topic headings (short, functional) are fine to mirror. Do NOT copy long-form
  blog/course prose, OffSec course material (AWAE/PEN-300/EXP-301/EXP-401 are copyrighted), or any PDF/Drive file
  verbatim. Summarize + LINK OUT via `Reference`.
- **Cite the source.** Attribute Joas's guide and each linked author/repo. No LICENSE ships in the source repo →
  link-only, never re-host.
- **No machine names.** Several links are HTB/PG exam "reviews/notes" — never import machine names or per-machine
  solutions. Techniques only.
- **`[UNVERIFIED]` + cite** for any CVE/flag/offset/version that isn't certain. Deterministic, offline, no AI.
- **OSED/OSEE overlap with the companion "Ringzero" exploit-dev project.** Default: in Cephalo, build OSWE + OSEP
  as DEEP copy-paste command packs; build OSED + OSEE as technique/reference packs (topics + commands like
  msfvenom/mona/WinDbg/nasm + links), and point hands-on exploit-dev depth at Ringzero to avoid duplication.
  (Revisit if the user wants full OSED hands-on inside Cephalo too.)

---

## PACK: oswe (Offensive Security Web Expert)
**Topics (→ Techniques):** web security tooling & methodology · source-code analysis · persistent XSS ·
session hijacking · .NET deserialization · RCE · blind SQL injection · data exfiltration · file-upload &
extension-filter bypass · PHP type juggling (loose comparisons) · PostgreSQL extensions & UDFs · REGEX-restriction
bypass · magic hashes · character-restriction bypass · UDF reverse shells · PostgreSQL large objects · DOM-based
XSS (black box) · SSTI · weak random token generation · XXE · RCE via database functions · OS command injection
via WebSockets (black box).

**Primary command/helper sources (→ References + tool repos to mine):**
- timip/OSWE · noraj/AWAE-OSWE · wetw0rk/AWAE-PREP · kajalNair/OSWE-Prep · s0j0hn/AWAE-OSWE-Prep ·
  deletehead/awae_oswe_prep · Lawlez/myOSWE · snoopysecurity/OSWE-Prep · aaidanquimby/OSWE-Notes ·
  Secdomain/OSWE-Notes · saunders-jake/oswe-resources · ApexPredator-InfoSec/AWAE-OSWE · svdwi/OSWE-Labs-Poc
- 0xb120/cheatsheets_and_ctf-notes → `OSWE preparation.md`
- Vuln method guides (hackingarticles, group-cite): XXE, CSRF, XSS, unrestricted file upload, open redirect, RFI,
  HTML injection, path traversal, broken auth/session mgmt, OS command injection, LFI, SQLi (beginner/boolean/
  filter-bypass/form-based/outfile), IDOR, web shells, SMTP & Apache log poisoning → RCE.
- Reviews/journeys: ~38 links (z-r0crypt, rayhan0x01, stacktrac3, kuhi.to, RCESecurity, steflan, etc.) — keep as
  optional secondary references; not command sources.

## PACK: osep (Offensive Security Experienced Pentester)
**Topics (→ Techniques):** OS & programming theory · client-side exec with Office · client-side exec with JScript ·
process injection & migration · intro to AV evasion · advanced AV evasion · application whitelisting bypass ·
bypassing network filters · Linux post-exploitation · kiosk breakouts · Windows credentials · Windows lateral
movement · Linux lateral movement · Microsoft SQL attacks · Active Directory exploitation · combining the pieces.

**Primary command/helper sources (→ References + tool repos to mine — this is where real OSEP payloads live):**
- chvancooten/OSEP-Code-Snippets (+ its README) · nullg0re/Experienced-Pentester-OSEP · r0r0x-xx/OSEP-Pre ·
  deletehead/pen_300_osep_prep · J3rryBl4nks/OSEP-Thoughts · aldanabae/Osep · In3x0rabl3/OSEP · timip/OSEP ·
  Extravenger/OSEPlayground · Ross46/OSEP-PREP → `Useful Resources/Payloads.md`
- CyberSecurityUP/Awesome-Red-Team-Operations (broad red-team tooling index)
- Method blogs: pentestlab.blog (defense-evasion / antivirus-evasion), pentestlaboratories (process herpaderping),
  spaceraccoon OSEP review+exam. Official: OffSec OSEP Exam FAQ.

## PACK: osed (Offensive Security Exploit Developer) — technique/reference pack (deep hands-on → Ringzero)
**Topics (→ Techniques):** WinDbg workflow · stack buffer overflows · SEH overflows · intro to IDA Pro ·
egghunters (space restrictions) · shellcode from scratch · reverse-engineering bugs · stack overflow + DEP/ASLR
bypass · format-string attacks · custom ROP chains & ROP payload decoders.

**Primary command/helper sources (→ References + ToolBinary/script repos):**
- epi052/osed-scripts (+ wry4n/osed-scripts) · snoopysecurity/OSCE-Prep · r0r0x-xx/OSED-Pre · sradley/osed ·
  Nero22k/Exploit_Development · dest-3/OSED_Resources · mrtouch93/OSED-Notes · nop-tech/OSED ·
  0xZ0F/Z0FCourse_ExploitDevelopment · CyberSecurityUP/Buffer-Overflow-Labs · sufyandaredevil/OSED (SEH notes)
- Canon: Corelan (exploit-writing tutorials, CorelanTraining) · ired.team (ROP chaining) · Azeria Labs (heap) ·
  Connor McGarr (browser) · Offensive Security OSED Exam Guide.

## PACK: osee (Advanced Windows Exploitation) — reference pack (advanced; mostly → Ringzero/links)
**Topics (→ Techniques):** bypass/evasion of user-mode mitigations (DEP/ASLR/CFG/ACG/CET) · advanced heap
manipulation, guest-to-host & sandbox escapes · disarming WDEG + version-independent weaponization · 64-bit
Windows kernel-driver RE & vuln discovery · kernel-mode mitigation bypass (kASLR/NX/SMEP/SMAP/kCFG/HVCI).
**Sources (→ References):** NCC Group windows_mitigations · CrowdStrike state-of-exploit-dev · ZDI/BlackHat kernel
talks · palantir/exploitguard · MorteNoir1/virtualbox_e1000_0day (review disclosure status before linking) ·
timip/OSEE · dhn/OSEE · BLACKHAT-SSG/EXP-401-OSEE.

---

## MAPPING TO THE CEPHALO MODEL
- **Pack** = cert area (`oswe`/`osep`/`osed`/`osee`); every entity carries `packs[]`; UI gets a pack filter/switcher.
- **Technique** = a topic above (dotted id e.g. `oswe.deserialization.dotnet`, `osep.evasion.amsi`, `osed.seh`).
- **Command** = canonical syntax Cephalo authors under each technique, with `{{VARIABLES}}` (`{{URL}}`,`{{LHOST}}`,
  `{{RHOST}}`,`{{TARGET}}`,`{{LPORT}}`,`{{PAYLOAD}}`,`{{WORDLIST}}` …), `shell` set appropriately, `confidence`,
  `references[]`.
- **ToolBinary** = the script/tool repos above (epi052/osed-scripts, chvancooten/OSEP-Code-Snippets, etc.) — linked
  via `Reference`, never bundled/hosted.
- **Reference** = the links above (dedupe into `src/data/references.ts`; group review/blog links as secondary).
- **Coverage** = add `oswe.*` / `osep.*` / `osed.*` / `osee.*` technique IDs to `coverage.manifest.yaml`; add the
  OSCE3 blocks to `_prompts/LOOP.md` so the running loop drives the packs to zero-gaps.

## BUILD SEQUENCING
1. This index is captured. 2. After the v2 "arsenal" addendum lands, generate the **OSCE3 pack addendum**
(CODE + a small DESIGN note for the pack switcher / cert badges) that authors these packs against the same frozen
+ additive contract. 3. The loop extends to the new packs. No frozen-contract change; `osed`/`osee` ride the
`(string & {})` PackId arm.
