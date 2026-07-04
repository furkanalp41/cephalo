# CEPHALO — COMPLETION LOOP (run with `/loop`)

> **What this is.** A self-driving audit-and-build loop. On **every iteration** you (Claude Code,
> working in `/home/vlad/bigOscpPrep`) measure build state, audit it against the master checklist
> below — **with Active Directory, Linux, AND Windows each held to a zero-gaps standard** — implement/author
> the next missing batch, verify the invariants, and emit one short progress report. You **stop the loop only when the
> DEFINITION OF DONE is fully met**. Until then, every iteration must move at least one checklist item
> from ☐ to ☑ or fix at least one red gate. Never report "done" while any ☐ remains.

> **Authority.** This loop assumes `_prompts/CODE-PROMPT.md` is the engineering brief and its FROZEN
> SHARED CONTRACT + token KEYS are law. This loop never edits a frozen interface. It only adds content,
> wires components, and closes gaps.

---

## PER-ITERATION CONTRACT (do these in order, every tick)

**STEP 1 — Measure state (no guessing).** Run, don't assume:
- `corepack enable && pnpm install && pnpm tsc --noEmit && pnpm lint` (GREEN-GATE 1)
- `pnpm test` (unit) and the content/CI gate scripts that exist (`scripts/gate-*.ts`, `pnpm build`)
- Read `coverage.manifest.yaml` and compute **covered vs. required** technique IDs.
- `ls content/**` to see what's authored. If a gate or command does not exist yet, that itself is the gap — build it.

**STEP 2 — Audit against the MASTER CHECKLIST (below).** For each item decide ☑ (present, typed,
validated, cited, wired into search + at least one mindmap, severity-tagged) or ☐ (absent/partial).
Treat **partial as ☐**. AD, Linux, and Windows items are audited line-by-line; do not collapse them.

**STEP 3 — Do the next batch.** Pick the highest-leverage 3–8 ☐ items (red gates first, then AD gaps,
then Linux/Windows, then cross-cutting). Implement them fully: author the typed YAML + markdown body,
wire variables, add references, mark `[UNVERIFIED]` where a fact is not citable, add to the relevant
mindmap, set severity. Do **not** stub to make the checkbox green — a stub is still ☐.

**STEP 4 — Verify invariants (must all hold before you end the tick).** See INVARIANTS section. If any
fails, fix it this tick before moving on.

**STEP 5 — Report (fixed format, ≤15 lines).**
```
ITER <n> | gates: <green/red list> | coverage: <covered>/<required> (<pct>%)
AD: <done>/<total AD items>   Linux: x/y   Windows: x/y   Cross-cut: x/y
Did this tick: <bullet list of items moved ☐→☑ or gates fixed>
Top remaining (AD-first): <up to 6 ☐ items>
Invariants: <PASS/FAIL per invariant; FAIL => what you fixed>
Next tick: <plan>
```

---

## DEFINITION OF DONE (stop condition — ALL must be true)

1. **Every ☐ in the MASTER CHECKLIST is ☑** — the **AD, Linux, and Windows** sections each have **zero** open boxes.
2. `coverage.manifest.yaml` required IDs are **100%** covered; `canon-map.yaml` shows every source
   section (viperone / TJnull / Section-18 / HackTricks-equivalent) maps to ≥1 Cephalo node.
3. **All CI gates exit 0**: tsc, lint, unit, e2e (Playwright), anti-fabrication gate, no-machine-names
   gate, overlap-fingerprint gate, routable-IP gate, a11y/contrast gate, token-KEY parity gate, build.
4. Every Command/Technique/BloodHoundQuery carries `references[]` **or** an explicit `[UNVERIFIED]` badge;
   the anti-fabrication gate passes with **no uncited hard-facts** (CVE/offset/version/flag claims).
5. The app builds to static output, installs as a PWA, and works **fully offline** (search + interpolation).

Only when 1–5 hold: print `CEPHALO COMPLETE — all checklists ☑, all gates green` and end the loop.

---

## INVARIANTS (re-checked every tick — any FAIL is a stop-and-fix)

- **No machine names** anywhere (content, comments, filenames, commit messages, git history). Coverage is
  expressed only as abstract technique IDs + archetype bands. The hash-only denylist lint passes.
- **Trophy Room PDF / machine list never enters the repo** (gitignored; never read into committed files).
- **Defang-by-default**: variable defaults are inert placeholders (`<tun0-ip>`, `<target-ip>`); example IPs
  are RFC5737 (`198.51.100.0/24`, TEST-NET) / RFC3849 only; sensitive vars (`PASS`,`NTHASH`,`AESKEY`)
  are masked + session-only (never persisted); `copy-filled` is gated on `allResolved && noInvalid`; the
  routable-IP gate rejects real third-party addresses.
- **No fabrication**: no invented CVE/flag/offset/gadget/version. Uncertain ⇒ literal `[UNVERIFIED]` + a
  citation pointer. Commands are canonical real tool syntax only.
- **Frozen contract untouched**: `src/types/{content,engine,components,tokens}.ts` unchanged; one `Severity`
  scale drives both command danger and mindmap heat; one `OctoState` union; one `--cph-*` namespace; no
  parallel enums, no renamed props. Token KEYS exist for design to fill (CSS stubs OK; values are design's).
- **Local-first**: no signup, no telemetry, no runtime network. Search index is prebuilt + serialized.
- **A11y**: WCAG AA contrast in all three OS skins; meaning never encoded by hue alone; reduced-motion path.

---

## MASTER CHECKLIST

### ◆ ACTIVE DIRECTORY — hold to ZERO GAPS (every box must end ☑)

**AD-1 Enumeration — unauthenticated / pre-creds**
- ☐ Host/DC discovery; SMB null session; SMB signing check; OS/domain fingerprint
- ☐ LDAP anonymous bind enumeration (naming context, users, computers)
- ☐ RID cycling / SID brute to enumerate users
- ☐ Kerberos username enumeration (kerbrute userenum)
- ☐ AS-REP roasting of accounts without pre-auth (no creds needed) + crack
- ☐ SMB/RPC share + null-session enumeration; anonymous file shares
- ☐ DNS enumeration of the domain (SRV records, DC discovery)
- ☐ SMTP/other user-leak vectors that feed user lists

**AD-2 Enumeration — authenticated**
- ☐ SharpHound + BloodHound (legacy) collection; `bloodhound-python`; **and BloodHound CE** — schema
  divergence between legacy and CE flagged `[UNVERIFIED]`
- ☐ neo4j + BloodHound setup steps
- ☐ PowerView / PowerSploit domain enumeration
- ☐ `ldapdomaindump`, `enum4linux-ng`
- ☐ `netexec`/`crackmapexec` module sweep (shares, users, passpol, sessions, loggedon, gpp, etc.)
- ☐ Password policy + lockout enumeration (avoid lockout before spraying)
- ☐ GPO / SYSVOL enumeration; GPP `cpassword` decryption
- ☐ LAPS read; gMSA read (`gMSADumper`)
- ☐ ADCS enumeration (`certipy find`) — CA + template inventory
- ☐ Trust enumeration (intra-/inter-forest)

**AD-3 Auth protocols & credential material**
- ☐ NTLM auth flow (concept node) + where NT hash is usable
- ☐ Kerberos flow (AS-REQ→TGT→TGS) concept node
- ☐ Credential forms map: cleartext / NT hash / AES key / TGT / TGS / DPAPI (where each is usable)

**AD-4 Credential attacks**
- ☐ Kerberoasting (request SPN tickets, crack) — incl. targeted Kerberoast via write access
- ☐ AS-REP roasting (authenticated discovery + crack)
- ☐ Password spraying (with lockout-aware guidance)
- ☐ LLMNR / NBT-NS / mDNS poisoning (Responder) → hash capture
- ☐ NTLM relay (`ntlmrelayx`): SMB→SMB, SMB→LDAP(S), relay to ADCS (**ESC8**)
- ☐ Authentication coercion: PrinterBug / PetitPotam / Coercer / DFSCoerce (as available) feeding relay
- ☐ Hash/ticket cracking reference (hashcat modes for NetNTLMv2, Kerberoast 13100, AS-REP 18200)

**AD-5 Lateral movement & execution**
- ☐ Pass-the-Hash (`-hashes`, PtH via netexec/impacket/evil-winrm)
- ☐ Overpass-the-Hash / Pass-the-Key (NT/AES → TGT)
- ☐ Pass-the-Ticket (inject `.kirbi`/`.ccache`)
- ☐ Exec methods: `psexec` / `smbexec` / `wmiexec` / `atexec` / `dcomexec` (Impacket), `evil-winrm`,
  `winrs`, RDP (`xfreerdp` pth), SSH where relevant
- ☐ Credential dumping post-access: `secretsdump` (local SAM/LSA), LSASS (concept + lsassy/nanodump), DPAPI

**AD-6 Delegation abuse**
- ☐ Unconstrained delegation (TGT capture, printerbug-assisted)
- ☐ Constrained delegation (S4U2self/S4U2proxy, `getST`)
- ☐ Resource-Based Constrained Delegation (RBCD) — write `msDS-AllowedToActOnBehalfOfOtherIdentity`

**AD-7 ACL / object-control abuses (map each BloodHound edge → abuse)**
- ☐ GenericAll / GenericWrite
- ☐ WriteOwner / WriteDACL
- ☐ AddMember (group) / ForceChangePassword
- ☐ AddKeyCredentialLink — **Shadow Credentials** (`pywhisker`/`certipy shadow`)
- ☐ AddAllowedToAct (→ RBCD), GPO abuse, AdminSDHolder

**AD-8 ADCS (Certified Pre-Owned)**
- ☐ ESC1, ESC2, ESC3 (enrollment/template misconfig → cert as DA)
- ☐ ESC4 (template ACL), ESC6 (EDITF_ATTRIBUTESUBJECTALTNAME2)
- ☐ ESC7 (CA officer/manager rights), ESC8 (web-enroll NTLM relay)
- ☐ Certipy request/auth flow (UPN/SAN abuse → TGT/NT hash via PKINIT/UnPAC-the-hash)
- ☐ ESC9/ESC10/ESC11 noted (mark `[UNVERIFIED]` if not validated)

**AD-9 Privilege escalation to Domain Admin**
- ☐ DCSync (`secretsdump @dc -just-dc`, via WriteDACL/replication rights)
- ☐ Path composition node: combine roasting/ACL/delegation/ADCS → DA (this is where mindmaps shine)

**AD-10 Domain dominance / persistence**
- ☐ Golden Ticket (krbtgt) — incl. AES variant
- ☐ Silver Ticket (service account) ; Diamond / Sapphire ticket (mark `[UNVERIFIED]` if not validated)
- ☐ Skeleton Key (concept/methodology only), DSRM, custom SSP, AdminSDHolder persistence
- ☐ NTDS.dit extraction: `secretsdump`, `ntdsutil` IFM, VSS shadow copy
- ☐ Golden gMSA (concept)

**AD-11 Trusts & cross-forest**
- ☐ Enumerate trusts; trust direction/transitivity
- ☐ SID history abuse; intra-forest child→parent (Golden + SID history)
- ☐ Inter-forest trust key abuse (mark `[UNVERIFIED]` where not validated)

**AD-12 BloodHound (first-class)**
- ☐ Collection commands (SharpHound all/loop, bloodhound-python) + neo4j/BloodHound setup
- ☐ **Cypher query library**: shortest path to DA, owned→DA, kerberoastable, AS-REP-roastable,
  unconstrained-delegation principals, RBCD candidates, ACL paths, sessions of high-value users
- ☐ **Edge→abuse table**: every covered edge has `abuseTechniqueId` FK to the AD technique that weaponizes it
- ☐ Legacy vs CE schema/field divergence documented + `[UNVERIFIED]` where unsure

**AD-13 Tooling coverage** (each appears with canonical syntax + variables, not as prose)
- ☐ Impacket suite, Rubeus, Kerbrute, netexec/CrackMapExec, BloodHound + neo4j, PowerView/PowerSploit,
  Certipy, Responder, ntlmrelayx, ldapdomaindump, Whisker/pyWhisker, lsassy/nanodump, ADRecon, mimikatz
  (methodology/concept only)

**AD-14 Variable correctness for AD**
- ☐ `DOMAIN, DC_IP, DC_HOST, USER, PASS, NTHASH, AESKEY, TARGET, SPN, SID, TICKET` are wired into every
  AD command via `{{...}}`; `credMode` (password / NT-hash / Kerberos) is **variant-selection** on one
  template, not three hand-written copies.

---

### ◆ LINUX — hold to ZERO GAPS (every box must end ☑)

> Variables wired via `{{...}}` on every command: `RHOST, RPORT, URL, WORDLIST, LHOST, LPORT, USER, PASS, INTERFACE`.
> Per-box exploit/version claims are `[UNVERIFIED]` + cited; privesc nodes cross-link **GTFOBins**.

**LX-1 Discovery & port scanning**
- ☐ Host discovery (ping sweep, `nmap -sn`, arp-scan, fping)
- ☐ Full TCP sweep (`nmap -p-`, rustscan, masscan) — two-stage methodology (fast all-ports → targeted)
- ☐ Service/version + default scripts (`nmap -sCV`), targeted NSE scripts
- ☐ UDP top-ports (`nmap -sU --top-ports`)
- ☐ Scan hygiene: timing/rate, `-oA` output, re-scan discovered ports

**LX-2 Per-service enumeration** (each a node with canonical commands)
- ☐ 21 FTP — anonymous login, banner/version, up/download, searchsploit on version
- ☐ 22 SSH — version, auth methods, user/key enum, weak-cred spray
- ☐ 23 Telnet ; 79 Finger (user enum) ; 512/513/514 r-services ; 873 rsync (module list/pull)
- ☐ 25/465/587 SMTP — VRFY/EXPN/RCPT user enum (smtp-user-enum), open-relay test
- ☐ 53 DNS — `dig`/`host`, zone transfer (AXFR), subdomain brute
- ☐ 80/443 HTTP(S) — fingerprint (whatweb/wappalyzer), nikto, **dir/file brute (feroxbuster/gobuster/ffuf)**,
  **vhost brute**, robots/source/headers, TLS (sslscan), param fuzzing, CMS-specific (wpscan, droopescan)
- ☐ 110/143/993/995 POP3/IMAP
- ☐ 111/2049 RPC/NFS — `rpcinfo`, `showmount -e`, mount, `no_root_squash` flag
- ☐ 135/139/445 SMB — enum4linux-ng, smbclient, smbmap, rpcclient, null session, share spider
- ☐ 161 SNMP — onesixtyone, snmpwalk (v1/v2c communities), MIB walk
- ☐ 389/636 LDAP — ldapsearch anonymous bind
- ☐ 1433 MSSQL / 1521 Oracle-TNS / 3306 MySQL / 5432 Postgres — version, default creds, client query
- ☐ 3389 RDP — `nmap` scripts, `xfreerdp`, BlueKeep noted `[UNVERIFIED]`
- ☐ 5900 VNC ; 5985/5986 WinRM (cross-ref AD) ; 6379 Redis (unauth → config-set webshell/SSH-key write)
- ☐ 9200 Elasticsearch ; 27017 MongoDB ; generic `searchsploit` on every version banner

**LX-3 Web exploitation methodology** (methodology-level, never weaponized payloads)
- ☐ LFI/RFI (php wrappers, log poisoning) ; file-upload bypass ; command injection
- ☐ SQLi (union / boolean / time-based; sqlmap) ; SSTI ; XXE ; deserialization (concept)
- ☐ Auth bypass / IDOR / default creds ; cross-cut: feed found creds into the VariableBar → reverse shell

**LX-4 Initial access / shells**
- ☐ Reverse shells (bash, `nc`, python, php, perl, ruby, socat, powershell-on-linux) — `LHOST`/`LPORT`
- ☐ Bind shells ; listeners (nc, socat, pwncat, msf multi/handler)
- ☐ **TTY/PTY upgrade** (python pty, `script`, `stty raw -echo`, socat full pty)
- ☐ Web shells

**LX-5 File transfer**
- ☐ Host (python `http.server`, `php -S`, updog, impacket-smbserver) ; pull (wget, curl, scp)
- ☐ base64 copy-paste ; `nc` transfer ; `/dev/tcp` ; cross-platform (certutil) cross-ref

**LX-6 Local enumeration**
- ☐ Automated (linpeas, LinEnum, lse, **pspy** for cron/process spying)
- ☐ Manual: `id`/groups, `sudo -l`, kernel/OS (`uname -a`, /etc/os-release), SUID/SGID find,
  capabilities (`getcap -r /`), cron (/etc/crontab, cron.d), writable files/dirs, `$PATH`/env,
  internal listeners (`ss -tlnp`), processes, installed software, `/etc/passwd`+`/etc/shadow` perms,
  SSH keys, history/config secrets, mail, backups, world-writable, NFS exports

**LX-7 Privilege-escalation vectors** (each a node; cross-link GTFOBins; per-box CVEs `[UNVERIFIED]`)
- ☐ sudo misconfig + GTFOBins ; sudo CVEs (e.g. Baron Samedit) `[UNVERIFIED]`
- ☐ SUID/SGID + GTFOBins ; custom SUID binary analysis (strings/ltrace/reverse)
- ☐ Linux capabilities (cap_setuid, etc.)
- ☐ Cron abuse (writable script, **wildcard injection**, PATH hijack)
- ☐ `$PATH` hijacking ; writable `/etc/passwd` or `/etc/shadow`
- ☐ Kernel exploits (searchsploit by kernel/distro — `[UNVERIFIED]` per target)
- ☐ NFS `no_root_squash` root-owned SUID drop
- ☐ Docker / LXD group escape ; other groups (disk, adm, lxc)
- ☐ `LD_PRELOAD` / `LD_LIBRARY_PATH` (sudo `env_keep`)
- ☐ Writable systemd/service unit ; service exploitation
- ☐ pkexec **PwnKit (CVE-2021-4034)** — cite + `[UNVERIFIED]` applicability
- ☐ Password reuse / creds in files / DB / config

**LX-8 Post-exploitation / pivoting (OSCP scope)**
- ☐ Loot collection ; lab-only persistence (concept)
- ☐ Port-forward / pivot (`ssh -L/-R/-D`, chisel, socat, ligolo-ng) ; proxychains ; enumerate from foothold

### ◆ WINDOWS (non-AD local) — hold to ZERO GAPS (every box must end ☑)

> Variables wired via `{{...}}`: `RHOST, RPORT, LHOST, LPORT, USER, PASS`. Defender/AMSI evasion is
> **methodology/concept ONLY** (no working bypass). Per-box LPE CVEs are `[UNVERIFIED]` + cited; cross-link **LOLBAS**.

**WIN-1 Enumeration after foothold**
- ☐ Automated (winPEAS, Seatbelt, PrivescCheck, JAWS)
- ☐ Manual: `whoami /all` (privileges + groups), `systeminfo` (+ wesng / windows-exploit-suggester `[UNVERIFIED]`),
  `net user`/`net localgroup`, ipconfig/route/arp, netstat, tasklist + services (`sc query`, `wmic`/`Get-Service`),
  installed software, scheduled tasks (`schtasks`), drivers, env, `$PATH`

**WIN-2 OS / credential looting**
- ☐ Stored creds: `cmdkey /list`, Windows Vault, `runas /savecred`, Credential Manager
- ☐ Registry: winlogon autologon, PuTTY/VNC/SNMP saved creds (`reg query`)
- ☐ Files: unattend.xml / sysprep.inf, web.config, IIS, PowerShell history, KeePass, configs
- ☐ SAM/SYSTEM hive (`reg save`) → offline `secretsdump` ; LSASS dump (concept; comsvcs/procdump) → cross-ref AD
- ☐ Browser creds, DPAPI (concept)

**WIN-3 Privilege-escalation vectors** (each a node)
- ☐ Service misconfigs: insecure service perms (`accesschk`), weak binary perms, **unquoted service path**,
  weak service registry perms, **DLL hijacking**
- ☐ `AlwaysInstallElevated` (HKLM + HKCU) → malicious MSI
- ☐ Token impersonation: `SeImpersonatePrivilege` → **Potato family** (Juicy/PrintSpoofer/Rogue/GodPotato —
  version-gated, `[UNVERIFIED]`)
- ☐ `SeBackupPrivilege`/`SeRestorePrivilege` → SAM/SYSTEM copy ; `SeTakeOwnership`/`SeDebug`/`SeLoadDriver`/
  `SeManageVolume` (each `[UNVERIFIED]` applicability)
- ☐ Autorun/startup misconfigs ; scheduled-task abuse (writable task binary) ; writable folder in `$PATH`
- ☐ Stored creds → `runas` ; password reuse
- ☐ UAC bypass (**methodology/concept only** — e.g. fodhelper)
- ☐ Kernel / named-pipe LPEs (windows-exploit-suggester, searchsploit — `[UNVERIFIED]` per target);
  PrintNightmare and similar noted concept + `[UNVERIFIED]`

**WIN-4 Shells / transfer / execution**
- ☐ Reverse shells (PowerShell one-liner, `nc.exe`, nishang, msfvenom exe — `LHOST`/`LPORT`) ; bind ; catch PS shells
- ☐ File transfer: certutil, PowerShell (`Invoke-WebRequest`/`Net.WebClient`), impacket-smbserver, bitsadmin, ftp, base64
- ☐ **AMSI/Defender: methodology/concept ONLY** (responsible-use — no working bypass) ; **LOLBAS** reference node

### ◆ CROSS-CUTTING / PLATFORM — hold to ZERO GAPS (every box must end ☑)

> These are the product capabilities that make the content usable. A surface that renders but
> isn't wired to the live engine is **partial = ☐**. Never edit a frozen interface to satisfy one.

**CC-1 Variable engine & VariableBar**
- ☐ Token parse `{{UPPER_SNAKE}}`; every **visible** CommandCard re-interpolates live on any value change
- ☐ `copy-filled` vs `copy-raw`; copy-filled **gated on `allResolved && noInvalid`**
- ☐ Unset tokens render as obvious placeholders; per-command variable highlight; click a var → focus its field in the bar
- ☐ Validation (IP / port / host) with inline error; invalid state styled (not hue-only)
- ☐ Sensitive vars (`PASS,NTHASH,AESKEY`) **masked + session-only, never persisted**; reveal-on-hold toggle
- ☐ Defaults seeded into the values map at store init (does **not** alter the frozen `values ?? fallback ?? placeholder` chain)
- ☐ Group glyphs, per-field state dots, accent bars, set/unset summary, collapse
- ☐ `credMode` switch (password / nt-hash / kerberos) = **variant-selection on one template**, not 3 copies

**CC-2 Search (SearchPalette)**
- ☐ cmdk-style fuzzy palette, keyboard-first (open hotkey, arrow/enter, esc)
- ☐ Index over **port / service / technique / tag / body**; **prebuilt + serialized at compile time** (works offline)
- ☐ Ranking: exact-port boost; **`verified > unverified` tiebreak via the build-time side table**
- ☐ Hits deep-link to the technique/node; empty-state; scoped/recent search

**CC-3 MindMaps**
- ☐ `@xyflow/react`; **one map per phase per OS**; deterministic layout (dagre/elk)
- ☐ Node kinds (technique/decision/outcome) with `node→techniqueId` deep-link; edge kinds (or/then/escalates)
- ☐ **One `Severity` scale drives node heat**; legend; pan/zoom; focusable nodes; meaning never hue-only
- ☐ Responsive + reduced-motion fallback

**CC-4 Theming (OS-reactive)**
- ☐ `data-os` swaps `--cph-*` **VALUES with no remount**; realm = theme + content unified (an AD route wears the AD skin)
- ☐ Three skins (linux / windows / ad), **each WCAG-AA**, **CVD-safe** (status by icon+text, not hue)
- ☐ `RealmSwitcher`; selection persists; token **KEYS owned by code**, **VALUES owned by design** (`theme.*.css`)
- ☐ Token-KEY parity gate: every `TOKEN_KEYS` key resolves at `:root` in `theme.base.css`; **no stray `--cph-*`**

**CC-5 Octopus mascot**
- ☐ Driven **purely by app state** through the frozen `OctoState` union (idle/thinking/delivering/success/error/greeting/celebrate)
- ☐ Per-state animation + glow + caption; click→greeting; intensity respected
- ☐ Rive artifact (lazy) **+ inline-SVG fallback**; **all states render** (parity); reduced-motion path
- ☐ Art-direction invariant: credible deep-sea cephalopod — **no kawaii, no emoji-as-UI**

**CC-6 Routing / deep-links / keyboard**
- ☐ TanStack **typed routes**; deep-linkable technique / mindmap / bloodhound URLs; **realm-sync on route**
- ☐ Keyboard map (open search, copy, navigate, help) + `KeyboardHelp` overlay; focus management; skip-to-content
- ☐ Back/forward + not-found (404) states

**CC-7 PWA / offline / local-first**
- ☐ `vite-plugin-pwa`/Workbox precache; **installable**; **works fully offline** (search + interpolation + content)
- ☐ **No runtime network, no telemetry, no analytics, no signup**; only non-sensitive settings persisted
- ☐ Content-update flow on new version

**CC-8 Responsible-use & safety surfaces**
- ☐ Persistent **responsible-use note** on hands-on surfaces; authorized-targets-only language
- ☐ Defang defaults visible to the user; routable-IP rejection surfaced; sensitive-var masking visible

**CC-9 Content model & authoring pipeline**
- ☐ Zod schemas **in lockstep** with frozen types; `build-content.ts` validates authoring sources
- ☐ Emits `content/*.json` + `search-index.json` + `search-side.json` + `mindmaps.json`
- ☐ Deduped `references` registry; **every Command/Technique/BH query has `references[]` or a `[UNVERIFIED]` badge**
- ☐ `coverage.manifest.yaml` + `canon-map.yaml` kept current as content grows

**CC-10 Extensibility (packs)**
- ☐ OSWE/OSEP **pack scaffold** present (content-pack structure + pack filter); switchable; no content yet
- ☐ Pack enum + per-entity `packs[]` honored in UI + search

**CC-11 CI gates (all green — see DEFINITION OF DONE #3)**
- ☐ tsc, lint, unit (vitest), e2e (playwright)
- ☐ anti-fabrication, no-machine-names (hash denylist), overlap-fingerprint (8-gram), routable-IP,
  token-KEY parity, side-table, placeholder, credMode, coverage, unverified-refs, a11y/contrast, build

**CC-12 Accessibility (global)**
- ☐ WCAG-AA contrast in all three skins; everything keyboard-reachable; visible focus ring
- ☐ `prefers-reduced-motion` honored everywhere (Octo, mindmap, transitions)
- ☐ ARIA labels on copy buttons, var fields, search, mindmap nodes; status conveyed by **icon+text, never hue alone**

---

## HARD RULES (never violate to make a box green)
- Never invent a command/flag/CVE to satisfy a checkbox. If you can't cite it, author the node and mark it
  `[UNVERIFIED]` with a source pointer — that still counts as ☑ *for coverage*, but the anti-fabrication
  gate stays green because it's labeled.
- Never add a machine name or commit the PDF to make coverage look complete.
- Never edit a frozen interface to fit content; extend via the content model only.
- A stub, a TODO, or an empty section is ☐, not ☑. Be honest in the report.

---

## v2 — ARSENAL / DETERMINISTIC ENGINES (F1–F8)

**Authority:** `_prompts/CODE-PROMPT-v2-arsenal.md` is the additive engineering authority for this v2 section;
it binds additively to `CODE-PROMPT.md` and edits ZERO frozen files. Design VALUES for the 38 new `--cph-` keys
live in `_prompts/DESIGN-PROMPT-v2-arsenal.md`. DEFINITION OF DONE extends: every v2 ☐ is ☑ AND all v2 gates exit 0;
`src/types/{content,engine,components,tokens}.ts` + `schema-parity.test.ts` stay byte-identical every tick
(verify with `git diff --stat` on those paths = empty). Same loop, same gate-green rule, AD/Linux/Windows + v2 all zero-gaps.

### LOOP.md MASTER CHECKLIST — NEW additive blocks (same ☐/☑ discipline; ☑ only when the leaf is content-complete AND its gate is green)

```
◆ PS — POWERSHELL & Invoke-* ARSENAL (F1; content only)
☐ PS-1  PowerView slice: Get-Domain/User/Group/Computer/GPO, Get-DomainObjectAcl, Find-LocalAdminAccess,
        Find-DomainShare, Find-DomainUserLocation, Get-DomainSPNTicket, Set-DomainObject, Add-DomainGroupMember,
        Set-DomainObjectOwner/Add-DomainObjectAcl — legacy+modern names, [UNVERIFIED] on fork-divergent ones
☐ PS-2  PowerUp slice: Invoke-AllChecks, Get-ServiceUnquoted, Get-ModifiableService(File), Invoke-ServiceAbuse,
        Write-ServiceBinary, Write-HijackDll, Get-UnattendedInstallFile, Get-RegistryAlwaysInstallElevated,
        Get-ApplicationHost, autorun/autologon
☐ PS-3  Invoke-* family: Kerberoast, ASREPRoast, Mimikatz variants, DCSync (own Command), RunAs, Command,
        IEX/Expression, WebRequest transfer (+certutil/bitsadmin cmd variants)
☐ PS-4  Nishang slice: Invoke-PowerShellTcp, Copy-VSS, Out-Minidump, Invoke-PortScan, Get-Information
☐ PS-5  DLL-hijack weaponization Technique (detect→generate→plant→trigger), methodology-level, Write-HijackDll only
        ☑ each PS-* leaf: shell:'powershell' + {{TOKENS}} + precondition + severity + refs/[UNVERIFIED]
        + indexed in MiniSearch + wired to ≥1 DecisionMap + ≥1 PrivilegeRule + a ToolBinary

◆ TOOL — PROVENANCE (F2)
☐ TOOL-1 GhostPack: Rubeus, Certify, Seatbelt (compile/SharpCollection note)
☐ TOOL-2 ADCS/AD: Certipy, SharpHound+BloodHound, Impacket, NetExec(nxc), Responder
☐ TOOL-3 Win privesc: winPEAS/linPEAS, PrintSpoofer, GodPotato, JuicyPotato(+NG)/RoguePotato/SweetPotato, accesschk, PsExec, RunasCs
☐ TOOL-4 Creds/PS/pivot: mimikatz, PowerSploit(PowerView/PowerUp), Nishang, Chisel, ligolo-ng
        ☑ each: officialRef(+releaseRef?)=Reference, shipsOnKali/kaliPath, literal fetchNote, NO binaryUrl, no committed blob

◆ ADV — PRIVILEGE ADVISOR (F3)
☐ ADV-1 Win token-priv signals+rules (SeImpersonate build-gated, SeAssignPrimaryToken, SeBackup, SeRestore[UNV],
        SeTakeOwnership[UNV], SeDebug, SeLoadDriver[UNV], SeManageVolume[UNV], SeTcb/SeCreateToken[UNV])
☐ ADV-2 Win groups (SID-first): Backup/Server/Print/Account Operators, DnsAdmins[UNV], GPO-creators, Remote-Mgmt
☐ ADV-3 Linux sudo: ALL, GTFOBins-per-basename, LD_PRELOAD, Baron-Samedit→F6
☐ ADV-4 Linux suid/cap/group/file: GTFOBins-suid(pkexec→PwnKit[UNV]), cap_setuid/dac_read/sys_admin[UNV]/sys_ptrace[UNV],
        docker/lxd/disk/shadow/adm, writable passwd/shadow, kernel→F6
☐ ADV-5 parser: ANSI-strip, block-sniff per source, token-priv fires enabled|disabled, SID-first groups, unrecognizedLines passthrough
        ☑ every signal→≥1 rule→compiling commandId (TemplateEngine)+toolBinaryId+confidence; [UNVERIFIED] carries reason+refs

◆ ASK — ASK-THE-OCTOPUS (F4)
☐ ASK-1 IntentAlias coverage for every core technique (synonyms/abbrevs)
☐ ASK-2 PhrasebookEntry coverage incl. powershell + AD bridges + advisor-signal phrasings ("what can I do with SeImpersonate")
☐ ASK-3 stoplist keeps load-bearing short tokens (ad/sam/spn/smb/rce/suid/db/ca); table-driven stemmer
☐ ASK-4 resolve pipeline + explain-why chip; OctoState wiring; golden snapshot (query→ordered ids)
        ☑ every alias/phrase target id resolves to a LIVE content id

◆ DEC — DECISION TREES (F5/F7)
☐ DEC-1 dec.win.tokenpriv (potato-by-build / hive / service-misconfig / Backup Operators)
☐ DEC-2 dec.linux.privesc (sudo/getcap/suid/kernel/group/NFS branches)
☐ DEC-3 dec.ad.nocreds-to-da (poison/coerce → creds/BloodHound/Kerberoast/ACL/ADCS/delegation → local-admin → DCSync/DA)
☐ DEC-4 ADCS ESC1–8 verified, ESC9/10 cited, ESC11/12/13 [UNVERIFIED]; delegation unconstrained/constrained/RBCD S4U; ACL-abuse→command table
        ☑ each node: check-command + observe + ≥2 branch edges incl fallback; signalRef reuses F3 signals; decision-reachability green

◆ CVE — CVE/VERSION LOOKUP (F6)
☐ CVE-1 curated CveExploitEntry per common exam service/version (vsftpd/ProFTPD/Apache/Samba/OpenSMTPD/Shellshock/Drupalgeddon2/Webmin/PwnKit)
☐ CVE-2 version matcher + searchsploit escape hatch; uncertain ⇒ [UNVERIFIED]
        ☑ each entry cited (NVD+EDB Reference) or [UNVERIFIED]; searchsploitTerm exact; no invented ids; cve-antifab green

◆ NMAP — TRIAGE / SCAN ROUTER (F8)
☐ NMAP-1 parser: human + -oG + -oX, multi-host, ANSI/noise-tolerant, dep-free XML, injected clock
☐ NMAP-2 routing table: full common-port catalog → real technique ids (port+service+product regex)
☐ NMAP-3 realm inference: AD-gated, category-deduped; Samba override; confidence rule
☐ NMAP-4 autofill: RHOST/TARGET/DOMAIN; NEVER overwrite user-set (conflict gate)
☐ NMAP-5 CVE handoff → F6 (curated, [UNVERIFIED] on loose; no network/auto-run)
☐ NMAP-6 explainability: every firing carries matchedOn+matchedText; explain() string
☐ NMAP-7 Ask-the-Octopus 'Paste scan' mode + NmapTriageBoard (sev/node/var tokens)
☐ NMAP-8 golden fixtures + unit tests (linux/windows/AD-DC/multi-host); gates green
```

### coverage.manifest.yaml — additive `v2` block (abstract dataset IDs; no machine names) + `nmap-routes` block
```yaml
v2:
  arsenal:  [tool.rubeus, tool.powerview, tool.powerup, tool.printspoofer, tool.godpotato,
             tool.certipy, tool.netexec, tool.mimikatz, tool.nishang, tool.impacket]
  signals:  [sig.win.seimpersonate, sig.win.sebackup, sig.win.sedebug, sig.win.seloaddriver,
             sig.win.semanagevolume, sig.win.backupoperators, sig.win.serveroperators,
             sig.linux.sudo_nopasswd, sig.linux.cap_setuid, sig.linux.docker]
  decisions: [dec.win.tokenpriv, dec.linux.privesc, dec.ad.nocreds-to-da]
  cve:      [cve.proftpd.135.modcopy, cve.vsftpd.234.backdoor, cve.apache.2449.traversal,
             cve.linux.pwnkit, cve.shellshock]
nmap-routes:   # gate fails if a catalog port has no route
  - { id: nmap.route.ftp,      port: 21,   band: high }
  - { id: nmap.route.ssh,      port: 22,   band: high }
  - { id: nmap.route.smb,      port: 445,  band: core }
  - { id: nmap.route.ldap,     port: 389,  band: core }
  - { id: nmap.route.kerberos, port: 88,   band: core }
  - { id: nmap.route.winrm,    port: 5985, band: high }
  - { id: nmap.route.rdp,      port: 3389, band: medium }
  - { id: nmap.route.mssql,    port: 1433, band: high }
  - { id: nmap.route.web,      port: 80,   band: high }
  # …one entry per seed ServiceRoute so the full common-port catalog is auditable as covered
```
Plus extend existing technique-band rows with PS arsenal ids (`ps.powerview.*`, `ps.powerup.*`, `ps.invoke.*`) so the running loop counts coverage. New CI gates added to the CC-11 list: ps-shell, tool-provenance, advisor-coverage, intent-resolves, decision-reachability, cve-antifab (G15), no-ai-deps (G16), no-runtime-net (G17), csp (G18), playwright-no-net (G19), nmap-route-coverage, EXTENDED token-KEY parity. The self-driving loop drives every ☐ to ☑ via these new coverage.manifest IDs.

---

## v3 — OSCE3 CONTENT PACKS (OSWE / OSEP / OSED / OSEE)

Authority: _prompts/CODE-PROMPT-v3-osce3-packs.md (additive content; binds to FROZEN + v2; edits ZERO frozen files).
Prereq: v1 (OSCP content) + v2 (Ask/CVE/Advisor/Nmap/Decision/ToolBinary surfaces) complete — §7 wiring is gated
on v2. Source: _prompts/OSCE3-SOURCE-INDEX.md (Joas taxonomy + links; no commands). Discipline:
transform-not-reproduce + cite, no machine names, [UNVERIFIED]+cite, no bundled binaries, EVASION
methodology-only, OSED/OSEE deep hands-on → Ringzero, deterministic/offline/no-AI, NEVER edit a frozen module.

◆ PACK — REGISTRATION & PLUMBING (no frozen edit)
☐ PACK-0  generalize scripts/gates.ts loadBundle() → MERGE all registered pack bundles into one in-memory
          ContentBundle (NON-frozen script edit); every reused gate now spans all packs (§9.0)
☐ PACK-1  packs.ts registers oscp+oswe+osep+osed+osee; osed/osee via the (string & {}) PackId arm (no union edit)
☐ PACK-2  per-pack manifest src/data/pack-manifests/<id>.ts (label/blurb/skin/roots/kind/primaryRefs/badgeKey)
☐ PACK-3  build-content.ts generalized: content/<id>/** → public/content/<id>.json (oscp output STRUCTURALLY
          unchanged ignoring generatedAt — NOT byte-stable); ONE combined search index with SearchDoc.packs set;
          bloodhound/tag docs stay packs:['oscp']; mindmaps keyed by pack
☐ PACK-4  EXTEND src/stores/packs.ts (usePacks): keep array `enabled` + 'cephalo.packs' persist + oscp-lock;
          ADD `focused` + focus(id) + lazy same-origin loadPack(id). NO src/state/ store, NO Set rewrite
☐ PACK-5  PackSwitcher.tsx (presentational, consumes usePacks) + tokens.v3.ts --cph-pack-* KEYS; gate-tokens EXTENDED
          ☑ each: five frozen files byte-identical; pack toggles filter search+mindmaps(+v2 surfaces once built); gates green

◆ OSWE — WEB (deep copy-paste command pack; 22 techniques; os:['linux']/['windows'])
☐ OSWE-1  method.tooling + method.sourcereview (sink→source grep methodology)
☐ OSWE-2  xss.stored + xss.dom + session.hijack
☐ OSWE-3  sqli.blind + bypass.regex + bypass.charset + exfil.data
☐ OSWE-4  deser.dotnet (ysoserial.net) + rce.chain + rce.dbfunc
☐ OSWE-5  upload.bypass + php.typejuggle + php.magichash
☐ OSWE-6  pgsql.udf + pgsql.udfrevshell + pgsql.largeobject
☐ OSWE-7  ssti + xxe + token.weakrandom + cmdinj.websocket
          ☑ each leaf: {{TOKENS}} + correct shell (sql/text/bash) + danger + confidence + refs(joas+primary);
          indexed in MiniSearch with packs:[oswe]; ≥1 mindmap node; CVE/version claims [UNVERIFIED]+cite

◆ OSEP — EVASION + LATERAL (deep pack; 16 techniques; EVASION = methodology-only; AD REUSES OSCP)
☐ OSEP-1  theory.os + method.combine (full-chain mindmap)
☐ OSEP-2  clientside.office + clientside.jscript  (METHODOLOGY ONLY — evasion-methodology-only gate)
☐ OSEP-3  inject.process + evasion.intro + evasion.advanced  (METHODOLOGY ONLY)
☐ OSEP-4  evasion.applocker + evasion.netfilter  (enumeration commands ok; no bypass payload)
☐ OSEP-5  win.creds + win.lateral  (REUSE ad.lateral.*/win.loot.* via relatedIds — overlap gate must not trip)
☐ OSEP-6  linux.post + linux.lateral + kiosk.breakout  (reuse linux.* via relatedIds)
☐ OSEP-7  mssql.attacks (xp_cmdshell/linked-server/EXECUTE AS — real copy-paste, danger:critical)
☐ OSEP-8  ad.exploit BRIDGE (relatedIds → full oscp ad.* tree; zero duplication)
          ☑ each leaf: evasion nodes tagged `evasion` carry NO payload; lateral/AD nodes cross-link not clone;
          packs:[osep]; refs(joas+primary); indexed; ≥1 decision/mindmap node

◆ OSED — EXPLOIT-DEV REFERENCE (reference pack; 10 techniques; os:['windows']; deep → Ringzero)
☐ OSED-1  windbg + stack.bof (pattern_create/offset, !mona pattern)
☐ OSED-2  seh + egghunter (!mona seh / !mona egg; msfvenom egg payload)
☐ OSED-3  ida + re.bugs (crash triage; methodology body)
☐ OSED-4  shellcode (nasm_shell/nasm) + formatstring
☐ OSED-5  bypass.depaslr + rop (!mona rop/ropfunc/jmp) — deep build → ref.ringzero
          ☑ each leaf: copy-paste helper commands only (msfvenom/mona/nasm/WinDbg); NEVER an invented offset/
          gadget (confidence:'unverified'+cite); packs:[osed]; body links Ringzero; indexed

◆ OSEE — ADVANCED WINDOWS REFERENCE (reference pack; 5 techniques; mostly concept+links → Ringzero)
☐ OSEE-1  usermode.mitigations (DEP/ASLR/CFG/ACG/CET concept map; NCC cite)
☐ OSEE-2  heap.escape + wdeg.disarm (concept; review disclosure status before linking; [UNVERIFIED])
☐ OSEE-3  kernel.re + kernel.mitigations (IOCTL surface; kASLR/SMEP/SMAP/kCFG/HVCI concept) — deep → Ringzero
          ☑ each leaf: concept summary + cited links ONLY; no weaponization; confidence:'unverified'+cite;
          packs:[osee]; body links Ringzero; indexed

◆ SURFACES — PACK-AWARENESS (filter existing v2; do not re-implement; PREREQ: v2 surface exists)
☐ SURF-1  search + SearchPalette pack-facet chips honor usePacks.enabled (SearchFilters.packs)
☐ SURF-2  mindmaps + (once v2-built) Ask(F4)/Advisor(F3)/CVE(F6)/Decision(F5/F7)/Nmap(F8) filter by usePacks.enabled
☐ SURF-3  dec.oswe.authbypass-to-rce, dec.osep.foothold-to-da (cross-links dec.ad.nocreds-to-da), dec.osed.crash-to-eip
          ☑ every new alias/phrase/route/decision target resolves to a LIVE pack-tagged id; reachability gate green
          (a SURF box stays ☐ until its v2 surface exists AND the filter wiring is in place)

◆ GATE — NEW CI (CC-11 extension)
☐ GATE-0  loadBundle() merges all registered pack bundles (PACK-0); reused gates verified to scan OSCE3 content
☐ GATE-1  gate-pack-coverage (every coverage osce3 id → technique+pack+compiling-command|reference)
☐ GATE-2  gate-osce3-cite (joas + ≥1 primary on every OSCE3 node; unverified carries refs)
☐ GATE-3  gate-evasion-methodology-only (no working bypass payload on any `evasion`-tagged node)
☐ GATE-4  reuse (now spanning all packs via merged loader): fabrication, unverified-refs, denylist(no-machine-names),
          routable-ip, placeholder, overlap (catches OSCP↔OSEP duplication), side-table, credmode, coverage(Gate 13
          resolves OSCE3 canon rows via merged techIds), EXTENDED token-parity, no-bundled-binary
          ☑ all v3 gates exit 0; five frozen files byte-identical (git diff --stat empty)

---

> **Note:** the v3 coverage rows (`coverage.manifest.yaml` `osce3:`/`decisions-v3`/`nmap-routes-v3`) and the
> `canon-map.yaml` OSCE3 rows are NOT in this file — apply them per §10.1/§10.2 of `CODE-PROMPT-v3-osce3-packs.md`.
> Frozen files stay byte-identical; osed/osee ride the `(string & {})` PackId arm; evasion methodology-only;
> OSED/OSEE deep hands-on → Ringzero. SURF-* stays ☐ until each v2 surface exists in `src/`.

---

## v4 — DEPTH (raise the bar on OSCP / OSWE / OSEP; re-audit existing nodes)

**Authority:** `_prompts/CODE-PROMPT-v4-depth.md` (additive content depth; binds to FROZEN + v2 + v3; edits ZERO
frozen files). **Posture:** deepen INCREMENTALLY — a few nodes per tick, highest-band-first, depth-before-breadth.
Never bulk-author. The DEPTH RUBRIC (§1 of the addendum) is the bar: every technique's commands must collectively give
primary + tool-by-tool alternatives + per-OS/credMode variants + exact flags + precondition + operator extras
(gotchas / OPSEC / output-to-watch / hashcat mode / troubleshooting) + cross-links (relatedIds; OSEP/OSWE REUSE OSCP)
+ references or [UNVERIFIED]. A `☑` node that is "thin" (1 command where N tools exist, or missing the extras) is
DEMOTED to `☐` and deepened.

◆ DEPTH — RE-AUDIT (run a slice every tick, before new breadth)
☐ DEPTH-AUDIT  re-score existing oscp/oswe/osep nodes against the §1 rubric; demote thin nodes to ☐ and deepen
☐ DEPTH-XLINK  every OSEP/OSWE node that overlaps an OSCP node uses relatedIds (NOT a clone); overlap gate green

◆ DEPTH — EXPANDED LEAVES (add `depth-v4:` ids to coverage.manifest.yaml; drive to ☑; see §2 of the addendum)
☐ DEPTH-LINUX  linux.recon.* / enum.* (multi-tool) / web.* / shell+transfer / localenum / privesc.* (full vector
               catalog incl. gtfobins-by-binary) / pivot.*
☐ DEPTH-WIN    win.enum.* / loot.* / privesc.* (svc-misconfig, dll-hijack, every Se* priv, build-gated potatoes
               [UNVERIFIED]) / shell+transfer / amsi.concept
☐ DEPTH-AD     ad.enum.unauth.* / enum.authed.* / cred.* (roast multi-tool, spray, responder, relay-esc8, coerce-*,
               hashcat modes) / lateral.* (each with password|nthash|kerberos variants) / deleg.* / acl.* /
               adcs.esc1-8 (+esc9-13 [UNVERIFIED]) / domdom.* / trusts.* / bloodhound.* (cypher + edge→abuse)
☐ DEPTH-OSWE   oswe.review/authbypass/sqli.*/deser.*/ssti.*/xxe.*/xss.*/php.*/token.*/upload.*/pgsql.*/rce.*/exfil.*
               (payloads in prose; sqlmap full flags; ysoserial/.net/phpggc invocations; gadget names [UNVERIFIED])
☐ DEPTH-OSEP   osep.theory / clientside.* + inject.process + evasion.* (METHODOLOGY ONLY — no bypass payload) /
               tunnel.* / pivot.* / creds.* / lateral.* (relatedIds→oscp) / mssql.* (real) / ad.bridge (relatedIds→ad.*)
        ☑ each leaf authored to the §1 rubric: multi-variant, exact flags, {{TOKENS}}, extras, cross-links, refs/[UNVERIFIED]

**DEFINITION OF DONE (v4 extension — adds to v1+v2+v3):** every node passes the §1 rubric audit (no thin ☑ nodes in
any band); every `depth-v4` coverage id is ☑; all reused gates (fabrication, unverified-refs, denylist, routable-ip,
placeholder, no-bundled-binary, evasion-methodology-only, overlap, template-clone, coverage) exit 0 across the
deepened corpus; the five frozen files stay byte-identical (`git diff --stat` empty every tick).

