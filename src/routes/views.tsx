// src/routes/views.tsx — route view components. They read params via the loose
// hooks and render live command surfaces from the content store.
import { useEffect, useRef } from 'react';
import { Link, useParams, useSearch } from '@tanstack/react-router';
import { useContent } from '@/stores/content';
import { useTheme } from '@/stores/theme';
import { useVariables } from '@/stores/variables';
import { useUI } from '@/stores/ui';
import { templateEngine } from '@/engine/template';
import { VARIABLE_DEFS_BY_ID } from '@/data/variables';
import { LiveCommandCard } from '@/components/LiveCommandCard';
import { MindMapHost } from '@/components/MindMap';
import { ConfidenceBadge } from '@/components/bits';
import type { BloodHoundQuery, Command, OS, Section, Technique } from '@/types/content';

// Stable empty arrays — never recreated per render (avoids Zustand snapshot loops).
const EMPTY_SECTIONS: Section[] = [];
const EMPTY_TECHNIQUES: Technique[] = [];

function Loading() {
  const status = useContent((s) => s.status);
  const error = useContent((s) => s.error);
  if (status === 'error') return <p className="muted">Failed to load content: {error}</p>;
  return <p className="muted">Loading content…</p>;
}

// Realm = theme + content, unified: a route under a given OS re-skins the whole app
// to that realm (no remount — just the data-os token swap).
function useSyncRealm(os: OS | undefined) {
  const cur = useTheme((s) => s.os);
  const setOs = useTheme((s) => s.setOs);
  useEffect(() => {
    if (os && os !== cur) setOs(os);
  }, [os, cur, setOs]);
}

export function RealmHome() {
  const params = useParams({ strict: false });
  const themeOs = useTheme((s) => s.os);
  const os = (params.os as OS) ?? themeOs;
  useSyncRealm(params.os as OS | undefined);
  const ready = useContent((s) => s.status === 'ready');
  const bundle = useContent((s) => s.bundle);
  const techniquesById = useContent((s) => s.techniquesById);

  if (!ready) return <Loading />;
  const sections = bundle?.sections ?? EMPTY_SECTIONS;
  const realmSections = sections.filter((s) => s.os === os).sort((a, b) => a.order - b.order);

  return (
    <div>
      <h1 className="section-title">{os === 'ad' ? 'Active Directory' : os[0]!.toUpperCase() + os.slice(1)}</h1>
      <p className="muted">Set your variables once; every command below fills in. Authorized testing only.</p>
      {realmSections.map((s) => (
        <section key={s.id} style={{ marginBottom: 24 }}>
          <h2 style={{ fontSize: 'var(--cph-fs-lg)' }}>{s.title}</h2>
          {s.description && <p className="muted">{s.description}</p>}
          <ul>
            {s.techniques.map((tid) => {
              const t = techniquesById.get(tid);
              return (
                <li key={tid}>
                  <Link to="/$os/technique/$techniqueId" params={{ os, techniqueId: tid }}>
                    {t?.title ?? tid}
                  </Link>
                  {t && (
                    <>
                      {' '}
                      <span className="muted">— {t.summary}</span>
                    </>
                  )}
                </li>
              );
            })}
          </ul>
        </section>
      ))}
    </div>
  );
}

export function TechniqueView() {
  const params = useParams({ strict: false });
  const techniqueId = params.techniqueId as string;
  const os = params.os as OS;
  useSyncRealm(os);
  const ready = useContent((s) => s.status === 'ready');
  const technique = useContent((s) => s.techniquesById.get(techniqueId));
  const commandsById = useContent((s) => s.commandsById);
  const techniquesById = useContent((s) => s.techniquesById);
  const values = useVariables((s) => s.values);
  const flashOcto = useUI((s) => s.flashOcto);

  // Celebrate when every variable across this technique's commands resolves
  // (false→true transition only — no spurious bloom on load).
  const prevResolved = useRef(true);
  useEffect(() => {
    if (!technique) return;
    const cmds = technique.commands
      .map((id) => commandsById.get(id))
      .filter((c): c is Command => Boolean(c));
    if (!cmds.length) return;
    const resolved = cmds.every(
      (c) => templateEngine.render(c.template, { values, defs: VARIABLE_DEFS_BY_ID, mode: 'filled' }).allResolved,
    );
    if (resolved && !prevResolved.current) flashOcto('celebrate', 2400);
    prevResolved.current = resolved;
  }, [values, technique, commandsById, flashOcto]);

  if (!ready) return <Loading />;
  if (!technique) return <p className="muted">Technique not found: {techniqueId}</p>;

  const commands = technique.commands
    .map((id) => commandsById.get(id))
    .filter((c): c is Command => Boolean(c));

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <h1 className="section-title" style={{ margin: 0 }}>
          {technique.title}
        </h1>
        <ConfidenceBadge confidence={technique.confidence} />
      </div>
      <p className="muted">{technique.summary}</p>
      {technique.body && (
        // body is sanitized HTML, pre-rendered at build time
        <div className="muted" dangerouslySetInnerHTML={{ __html: technique.body }} />
      )}
      {technique.relatedIds && technique.relatedIds.length > 0 && (
        <p className="muted">
          Related:{' '}
          {technique.relatedIds.map((rid, i) => {
            const rt = techniquesById.get(rid);
            const rOs = rt?.os[0] ?? os;
            return (
              <span key={rid}>
                {i > 0 && ', '}
                <Link to="/$os/technique/$techniqueId" params={{ os: rOs, techniqueId: rid }}>
                  {rt?.title ?? rid}
                </Link>
              </span>
            );
          })}
        </p>
      )}
      <div style={{ marginTop: 16 }}>
        {commands.map((c) => (
          <LiveCommandCard key={c.id} command={c} />
        ))}
      </div>
    </div>
  );
}

export function MindMapView() {
  const params = useParams({ strict: false });
  const search = useSearch({ strict: false }) as { node?: string };
  const mapId = params.mapId as string;
  const ready = useContent((s) => s.status === 'ready');
  const map = useContent((s) => s.mindmapsById.get(mapId));
  useSyncRealm(map?.os);

  if (!ready) return <Loading />;
  if (!map) return <p className="muted">Mindmap not found: {mapId}</p>;

  return (
    <div>
      <h1 className="section-title">{map.title}</h1>
      <MindMapHost map={map} {...(search.node ? { selectedNodeId: search.node } : {})} />
    </div>
  );
}

// Adapt a BloodHoundQuery into a Command so the cypher card reuses the full
// var-interpolation / copy / sources / responsible-use machinery (no duplication).
function bhToCommand(q: BloodHoundQuery): Command {
  const notes: string[] = [];
  if (q.abuse) notes.push(`Abuse: ${q.abuse}`);
  if (q.legacyUI) notes.push('BloodHound legacy vs CE schema divergence — verify in your version.');
  return {
    id: q.id,
    title: q.title,
    template: q.cypher,
    shell: 'text',
    description: q.description,
    os: ['ad'],
    phase: 'credential-access',
    confidence: q.confidence,
    references: q.references,
    packs: ['oscp'],
    ...(q.tags ? { tags: q.tags } : {}),
    ...(notes.length ? { notes } : {}),
  };
}

export function BloodHoundView() {
  useSyncRealm('ad');
  const ready = useContent((s) => s.status === 'ready');
  const bloodhound = useContent((s) => s.bloodhound);
  const techniquesById = useContent((s) => s.techniquesById);

  if (!ready) return <Loading />;
  const library = bloodhound.filter((q) => q.category !== 'edge-abuse');
  const edges = bloodhound.filter((q) => q.category === 'edge-abuse');

  return (
    <div>
      <h1 className="section-title">BloodHound</h1>
      <p className="muted">
        Cypher interpolates {'{{DOMAIN}}'} like any command. Edge → abuse rows link to the
        weaponizing technique. Authorized testing only.
      </p>

      <h2 style={{ fontSize: 'var(--cph-fs-lg)' }}>Cypher library</h2>
      {library.map((q) => (
        <LiveCommandCard key={q.id} command={bhToCommand(q)} />
      ))}

      <h2 style={{ fontSize: 'var(--cph-fs-lg)' }}>Edge → abuse → command</h2>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th style={{ textAlign: 'left' }}>Edge</th>
            <th style={{ textAlign: 'left' }}>What it grants</th>
            <th style={{ textAlign: 'left' }}>Abuse</th>
            <th style={{ textAlign: 'left' }}>Run it →</th>
          </tr>
        </thead>
        <tbody>
          {edges.map((q) => {
            const tech = q.abuseTechniqueId ? techniquesById.get(q.abuseTechniqueId) : undefined;
            return (
              <tr key={q.id} style={{ borderTop: '1px solid var(--cph-color-border)' }}>
                <td>
                  <code className="chip">{q.edge}</code>
                </td>
                <td className="muted">{q.description}</td>
                <td className="muted">{q.abuse}</td>
                <td>
                  {tech ? (
                    <Link to="/$os/technique/$techniqueId" params={{ os: 'ad', techniqueId: tech.id }}>
                      {tech.title}
                    </Link>
                  ) : (
                    <span className="muted">—</span>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export function CrossCuttingView() {
  const ready = useContent((s) => s.status === 'ready');
  const bundle = useContent((s) => s.bundle);

  if (!ready) return <Loading />;
  const techniques = bundle?.techniques ?? EMPTY_TECHNIQUES;
  const xcut = techniques.filter((t) => t.tags.includes('cross-cutting'));

  return (
    <div>
      <h1 className="section-title">Cross-cutting</h1>
      <p className="muted">Shells, file transfer, and pivoting — spanning every realm.</p>
      <ul>
        {xcut.map((t) => (
          <li key={t.id}>
            <Link to="/$os/technique/$techniqueId" params={{ os: t.os[0] ?? 'linux', techniqueId: t.id }}>
              {t.title}
            </Link>{' '}
            <span className="muted">— {t.summary}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
