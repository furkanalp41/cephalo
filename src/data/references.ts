// src/data/references.ts — typed, deduped citation registry.
// Source-priority ladder (§9.3): official-tool-docs > nvd/mitre (CVEs) > rfc
// (protocols) > gtfobins/lolbas (binary abuse) > hacktricks/payloadsallthethings/
// ad-cheatsheet (secondary) > tjnull (syllabus framing). archiveUrl = link-rot
// fallback.
import type { Reference } from '@/types/content';

export const REFERENCES: Reference[] = [
  // ---- official tool docs ----
  { id: 'ref.nmap', title: 'Nmap Reference Guide', url: 'https://nmap.org/book/man.html', source: 'official-tool-docs' },
  { id: 'ref.netexec', title: 'NetExec (nxc) Documentation', url: 'https://www.netexec.wiki/', source: 'official-tool-docs' },
  { id: 'ref.impacket', title: 'Impacket — Fortra/SecureAuth', url: 'https://github.com/fortra/impacket', source: 'official-tool-docs' },
  { id: 'ref.rubeus', title: 'Rubeus — GhostPack', url: 'https://github.com/GhostPack/Rubeus', source: 'official-tool-docs' },
  { id: 'ref.kerbrute', title: 'Kerbrute', url: 'https://github.com/ropnop/kerbrute', source: 'official-tool-docs' },
  { id: 'ref.bloodhound', title: 'BloodHound Community Edition Docs', url: 'https://bloodhound.specterops.io/', source: 'official-tool-docs' },
  { id: 'ref.sharphound', title: 'SharpHound Collector Docs', url: 'https://bloodhound.specterops.io/collect-data/ce-collection/sharphound', source: 'official-tool-docs' },
  { id: 'ref.bloodhoundpy', title: 'bloodhound.py (Python ingestor)', url: 'https://github.com/dirkjanm/BloodHound.py', source: 'official-tool-docs' },
  { id: 'ref.certipy', title: 'Certipy (ADCS)', url: 'https://github.com/ly4k/Certipy', source: 'official-tool-docs' },
  { id: 'ref.hashcat', title: 'hashcat Wiki', url: 'https://hashcat.net/wiki/', source: 'official-tool-docs' },
  { id: 'ref.john', title: 'John the Ripper Documentation', url: 'https://www.openwall.com/john/doc/', source: 'official-tool-docs' },
  { id: 'ref.ffuf', title: 'ffuf', url: 'https://github.com/ffuf/ffuf', source: 'official-tool-docs' },
  { id: 'ref.feroxbuster', title: 'feroxbuster', url: 'https://github.com/epi052/feroxbuster', source: 'official-tool-docs' },
  { id: 'ref.gobuster', title: 'gobuster', url: 'https://github.com/OJ/gobuster', source: 'official-tool-docs' },
  { id: 'ref.whatweb', title: 'WhatWeb', url: 'https://github.com/urbanadventurer/WhatWeb', source: 'official-tool-docs' },
  { id: 'ref.nikto', title: 'Nikto', url: 'https://github.com/sullo/nikto', source: 'official-tool-docs' },
  { id: 'ref.wpscan', title: 'WPScan', url: 'https://github.com/wpscanteam/wpscan', source: 'official-tool-docs' },
  { id: 'ref.windapsearch', title: 'windapsearch', url: 'https://github.com/ropnop/windapsearch', source: 'official-tool-docs' },
  { id: 'ref.responder', title: 'Responder', url: 'https://github.com/lgandx/Responder', source: 'official-tool-docs' },
  { id: 'ref.mimikatz', title: 'mimikatz', url: 'https://github.com/gentilkiwi/mimikatz/wiki', source: 'official-tool-docs' },
  { id: 'ref.evilwinrm', title: 'Evil-WinRM', url: 'https://github.com/Hackplayers/evil-winrm', source: 'official-tool-docs' },
  { id: 'ref.chisel', title: 'chisel', url: 'https://github.com/jpillora/chisel', source: 'official-tool-docs' },
  { id: 'ref.ligolo', title: 'Ligolo-ng', url: 'https://github.com/nicocha30/ligolo-ng', source: 'official-tool-docs' },
  { id: 'ref.winpeas', title: 'PEASS-ng (winPEAS/linPEAS)', url: 'https://github.com/peass-ng/PEASS-ng', source: 'official-tool-docs' },
  { id: 'ref.bloodyad', title: 'bloodyAD (AD privilege-escalation tool)', url: 'https://github.com/CravateRouge/bloodyAD', source: 'official-tool-docs' },
  { id: 'ref.powerview', title: 'PowerView / PowerSploit', url: 'https://powersploit.readthedocs.io/', source: 'ad-cheatsheet' },
  { id: 'ref.ldapdomaindump', title: 'ldapdomaindump', url: 'https://github.com/dirkjanm/ldapdomaindump', source: 'official-tool-docs' },
  { id: 'ref.enum4linux', title: 'enum4linux-ng', url: 'https://github.com/cddmp/enum4linux-ng', source: 'official-tool-docs' },
  { id: 'ref.smbmap', title: 'smbmap', url: 'https://github.com/ShawnDEvans/smbmap', source: 'official-tool-docs' },
  { id: 'ref.lsassy', title: 'lsassy', url: 'https://github.com/Hackndo/lsassy', source: 'official-tool-docs' },
  { id: 'ref.coercer', title: 'Coercer (auth coercion)', url: 'https://github.com/p0dalirius/Coercer', source: 'official-tool-docs' },
  { id: 'ref.pkinittools', title: 'PKINITtools (UnPAC-the-hash)', url: 'https://github.com/dirkjanm/PKINITtools', source: 'official-tool-docs' },
  { id: 'ref.whisker', title: 'pyWhisker (Shadow Credentials)', url: 'https://github.com/ShutdownRepo/pywhisker', source: 'official-tool-docs' },
  { id: 'ref.adrecon', title: 'ADRecon', url: 'https://github.com/adrecon/ADRecon', source: 'official-tool-docs' },
  { id: 'ref.sqlmap', title: 'sqlmap', url: 'https://github.com/sqlmapproject/sqlmap', source: 'official-tool-docs' },
  { id: 'ref.snmp', title: 'snmpwalk / net-snmp', url: 'http://www.net-snmp.org/docs/man/snmpwalk.html', source: 'official-tool-docs' },
  { id: 'ref.ligolong', title: 'Ligolo-ng', url: 'https://github.com/nicocha30/ligolo-ng', source: 'official-tool-docs' },
  { id: 'ref.pspy', title: 'pspy (unprivileged process snooper)', url: 'https://github.com/DominicBreuker/pspy', source: 'official-tool-docs' },
  // ---- v2 arsenal tool provenance (link-only; never bundled) ----
  { id: 'ref.printspoofer', title: 'PrintSpoofer (itm4n)', url: 'https://github.com/itm4n/PrintSpoofer', source: 'official-tool-docs' },
  { id: 'ref.godpotato', title: 'GodPotato (BeichenDream)', url: 'https://github.com/BeichenDream/GodPotato', source: 'official-tool-docs' },
  { id: 'ref.juicypotato', title: 'JuicyPotato (ohpe)', url: 'https://github.com/ohpe/juicy-potato', source: 'official-tool-docs' },
  { id: 'ref.powersploit', title: 'PowerSploit (PowerView/PowerUp, archived)', url: 'https://github.com/PowerShellMafia/PowerSploit', source: 'official-tool-docs' },
  { id: 'ref.nishang', title: 'Nishang (samratashok)', url: 'https://github.com/samratashok/nishang', source: 'official-tool-docs' },
  // CVE citations — the CVE id lives in the reference TITLE (Sources affordance),
  // never in node prose, so the anti-fabrication gate stays green.
  { id: 'ref.cve-pwnkit', title: 'CVE-2021-4034 (PwnKit, pkexec LPE) — NVD', url: 'https://nvd.nist.gov/vuln/detail/CVE-2021-4034', source: 'cve-nvd' },
  { id: 'ref.cve-baronsamedit', title: 'CVE-2021-3156 (Baron Samedit, sudo) — NVD', url: 'https://nvd.nist.gov/vuln/detail/CVE-2021-3156', source: 'cve-nvd' },
  { id: 'ref.cve-printnightmare', title: 'CVE-2021-34527 (PrintNightmare) — NVD', url: 'https://nvd.nist.gov/vuln/detail/CVE-2021-34527', source: 'cve-nvd' },
  // ---- v2 CVE lookup citations (CVE id lives in the reference TITLE) ----
  { id: 'ref.cve-vsftpd234', title: 'CVE-2011-2523 (vsftpd 2.3.4 backdoor) — NVD', url: 'https://nvd.nist.gov/vuln/detail/CVE-2011-2523', source: 'cve-nvd' },
  { id: 'ref.cve-proftpd135', title: 'CVE-2015-3306 (ProFTPD mod_copy RCE) — NVD', url: 'https://nvd.nist.gov/vuln/detail/CVE-2015-3306', source: 'cve-nvd' },
  { id: 'ref.cve-apache2449', title: 'CVE-2021-41773 (Apache 2.4.49 path traversal/RCE) — NVD', url: 'https://nvd.nist.gov/vuln/detail/CVE-2021-41773', source: 'cve-nvd' },
  { id: 'ref.cve-apache2450', title: 'CVE-2021-42013 (Apache 2.4.50 path traversal/RCE) — NVD', url: 'https://nvd.nist.gov/vuln/detail/CVE-2021-42013', source: 'cve-nvd' },
  { id: 'ref.cve-sambacry', title: 'CVE-2017-7494 (Samba is_known_pipename RCE) — NVD', url: 'https://nvd.nist.gov/vuln/detail/CVE-2017-7494', source: 'cve-nvd' },
  { id: 'ref.cve-shellshock', title: 'CVE-2014-6271 (Shellshock, bash) — NVD', url: 'https://nvd.nist.gov/vuln/detail/CVE-2014-6271', source: 'cve-nvd' },
  { id: 'ref.cve-webmin1890', title: 'CVE-2019-15107 (Webmin password_change RCE) — NVD', url: 'https://nvd.nist.gov/vuln/detail/CVE-2019-15107', source: 'cve-nvd' },
  { id: 'ref.exploitdb', title: 'Exploit-Database (Offensive Security) — run searchsploit locally', url: 'https://www.exploit-db.com/', source: 'exploitdb' },

  // ---- microsoft official ----
  { id: 'ref.ms-winrm', title: 'Microsoft: WS-Management / WinRM', url: 'https://learn.microsoft.com/windows/win32/winrm/portal', source: 'microsoft' },
  { id: 'ref.ms-kerberos', title: 'Microsoft: Kerberos Authentication Overview', url: 'https://learn.microsoft.com/windows-server/security/kerberos/kerberos-authentication-overview', source: 'microsoft' },
  { id: 'ref.ms-dpapi', title: 'Microsoft: DPAPI', url: 'https://learn.microsoft.com/windows/win32/seccng/cng-dpapi', source: 'microsoft' },

  // ---- RFC (protocols) ----
  { id: 'ref.rfc4120', title: 'RFC 4120 — The Kerberos Network Authentication Service (V5)', url: 'https://www.rfc-editor.org/rfc/rfc4120', source: 'rfc' },
  { id: 'ref.rfc4178', title: 'RFC 4178 — SPNEGO', url: 'https://www.rfc-editor.org/rfc/rfc4178', source: 'rfc' },
  { id: 'ref.rfc1001', title: 'RFC 1001 — NetBIOS over TCP/UDP', url: 'https://www.rfc-editor.org/rfc/rfc1001', source: 'rfc' },

  // ---- GTFOBins / LOLBAS ----
  { id: 'ref.gtfobins', title: 'GTFOBins', url: 'https://gtfobins.github.io/', source: 'gtfobins' },
  { id: 'ref.lolbas', title: 'LOLBAS', url: 'https://lolbas-project.github.io/', source: 'lolbas' },

  // ---- MITRE ATT&CK + NVD ----
  { id: 'ref.attack', title: 'MITRE ATT&CK', url: 'https://attack.mitre.org/', source: 'mitre' },
  { id: 'ref.nvd', title: 'NIST National Vulnerability Database', url: 'https://nvd.nist.gov/', source: 'cve-nvd' },

  // ---- secondary (synthesized, never transcribed) ----
  { id: 'ref.hacktricks', title: 'HackTricks (secondary)', url: 'https://book.hacktricks.xyz/', source: 'hacktricks', archiveUrl: 'https://web.archive.org/web/2024/https://book.hacktricks.xyz/' },
  { id: 'ref.patt', title: 'PayloadsAllTheThings (secondary)', url: 'https://github.com/swisskyrepo/PayloadsAllTheThings', source: 'payloadsallthethings' },
  { id: 'ref.viperone', title: 'viperone — Pentesting AD cheatsheet (secondary)', url: 'https://viperone.gitbook.io/pentest-everything/', source: 'viperone', archiveUrl: 'https://web.archive.org/web/2024/https://viperone.gitbook.io/pentest-everything/' },
  { id: 'ref.adsecurity', title: 'ADSecurity (AD reference, secondary)', url: 'https://adsecurity.org/', source: 'ad-cheatsheet' },

  // ---- syllabus framing ----
  { id: 'ref.tjnull', title: 'TJnull / NetSecFocus OSCP-prep framing', url: 'https://www.netsecfocus.com/', source: 'tjnull' },

  // ---- OSCE3 spine + primary sources (v3 packs cite ref.osce3.joas + ≥1 primary) ----
  { id: 'ref.osce3.joas', title: 'Joas A. Santos — OSCE³ & OSEE Study Guide (taxonomy index)', url: 'https://github.com/JoasASantos/OSCE3-Complete-Guide', source: 'other' },
  { id: 'ref.ringzero', title: 'Ringzero — companion exploit-dev project (deep OSED/OSEE hands-on)', source: 'other' },
  { id: 'ref.oswe.timip', title: 'timip/OSWE', url: 'https://github.com/timip/OSWE', source: 'other' },
  { id: 'ref.ysoserialnet', title: 'ysoserial.net (.NET deserialization gadgets)', url: 'https://github.com/pwntester/ysoserial.net', source: 'other' },
  { id: 'ref.osep.chvancooten', title: 'chvancooten/OSEP-Code-Snippets', url: 'https://github.com/chvancooten/OSEP-Code-Snippets', source: 'other' },
  { id: 'ref.osed.epi052', title: 'epi052/osed-scripts', url: 'https://github.com/epi052/osed-scripts', source: 'other' },
  { id: 'ref.corelan', title: 'Corelan — Exploit Writing Tutorials / mona.py', url: 'https://www.corelan.be/', source: 'other' },
  { id: 'ref.osee.nccmitigations', title: 'NCC Group — windows_mitigations', url: 'https://github.com/nccgroup/exploit_mitigations', source: 'other' },
  { id: 'ref.offsec.web300', title: 'OffSec WEB-300 / OSWE Exam Guide', url: 'https://help.offsec.com/', source: 'official-tool-docs' },
  { id: 'ref.offsec.pen300', title: 'OffSec PEN-300 / OSEP Exam FAQ', url: 'https://help.offsec.com/', source: 'official-tool-docs' },
  { id: 'ref.offsec.exp301', title: 'OffSec EXP-301 / OSED Exam Guide', url: 'https://help.offsec.com/', source: 'official-tool-docs' },
  { id: 'ref.offsec.exp401', title: 'OffSec EXP-401 / OSEE', url: 'https://www.offsec.com/courses/exp-401/', source: 'official-tool-docs' },
];
