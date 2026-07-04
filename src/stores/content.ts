// src/stores/content.ts — loads the generated bundle + serialized search index at
// boot (offline-first: precached by the service worker). No runtime network after
// first load. Builds id→entity maps and hydrates the SearchEngine singleton.
import { create } from 'zustand';
import { searchEngine } from '@/engine/search';
import type {
  ContentBundle,
  Command,
  Technique,
  Section,
  MindMap,
  Reference,
  BloodHoundQuery,
  VariableDef,
} from '@/types/content';

const BASE = import.meta.env.BASE_URL ?? '/';

interface ContentState {
  status: 'idle' | 'loading' | 'ready' | 'error';
  error?: string;
  bundle?: ContentBundle;
  commandsById: Map<string, Command>;
  techniquesById: Map<string, Technique>;
  sectionsById: Map<string, Section>;
  mindmapsById: Map<string, MindMap>;
  referencesById: Map<string, Reference>;
  bloodhoundById: Map<string, BloodHoundQuery>;
  variableDefs: VariableDef[];
  bloodhound: BloodHoundQuery[];
  /** id → palette display label (covers every SearchDoc.id incl. `tag.<id>`). */
  labelById: Map<string, { title: string; sub: string; type: string }>;
  load: () => Promise<void>;
  /** Lazily merge a pack's ContentBundle into the in-memory maps (v3 packs). The
   *  search index is already combined at build time, so this only feeds the views. */
  mergePack: (b: ContentBundle) => void;
}

export const useContent = create<ContentState>((set, get) => ({
  status: 'idle',
  commandsById: new Map(),
  techniquesById: new Map(),
  sectionsById: new Map(),
  mindmapsById: new Map(),
  referencesById: new Map(),
  bloodhoundById: new Map(),
  variableDefs: [],
  bloodhound: [],
  labelById: new Map(),
  load: async () => {
    if (get().status === 'loading' || get().status === 'ready') return;
    set({ status: 'loading' });
    try {
      const [bundleRes, searchRes] = await Promise.all([
        fetch(`${BASE}content/oscp.json`),
        fetch(`${BASE}content/search-index.json`),
      ]);
      if (!bundleRes.ok) throw new Error(`content fetch ${bundleRes.status}`);
      const bundle = (await bundleRes.json()) as ContentBundle;
      const searchPayload = (await searchRes.json()) as object;
      searchEngine.load(searchPayload);

      const labelById = new Map<string, { title: string; sub: string; type: string }>();
      for (const c of bundle.commands)
        labelById.set(c.id, { title: c.title, sub: c.tool ?? c.phase ?? '', type: 'command' });
      for (const t of bundle.techniques)
        labelById.set(t.id, { title: t.title, sub: `${t.os.join('/')} · ${t.phase}`, type: 'technique' });
      for (const s of bundle.sections)
        labelById.set(s.id, { title: s.title, sub: s.os, type: 'section' });
      for (const q of bundle.bloodhound)
        labelById.set(q.id, { title: q.title, sub: q.edge ?? q.category, type: 'bloodhound' });
      for (const tag of bundle.tags)
        labelById.set(`tag.${tag.id}`, { title: tag.label, sub: tag.category ?? 'tag', type: 'tag' });

      set({
        status: 'ready',
        bundle,
        commandsById: new Map(bundle.commands.map((c) => [c.id, c])),
        techniquesById: new Map(bundle.techniques.map((t) => [t.id, t])),
        sectionsById: new Map(bundle.sections.map((s) => [s.id, s])),
        mindmapsById: new Map(bundle.mindmaps.map((m) => [m.id, m])),
        referencesById: new Map(bundle.references.map((r) => [r.id, r])),
        bloodhoundById: new Map(bundle.bloodhound.map((q) => [q.id, q])),
        variableDefs: bundle.variables,
        bloodhound: bundle.bloodhound,
        labelById,
      });
    } catch (e) {
      set({ status: 'error', error: (e as Error).message });
    }
  },
  mergePack: (b) => {
    const s = get();
    if (s.status !== 'ready' || !s.bundle) return; // base pack must be loaded first
    const commandsById = new Map(s.commandsById);
    for (const c of b.commands) commandsById.set(c.id, c);
    const techniquesById = new Map(s.techniquesById);
    for (const t of b.techniques) techniquesById.set(t.id, t);
    const sectionsById = new Map(s.sectionsById);
    for (const sec of b.sections) sectionsById.set(sec.id, sec);
    const mindmapsById = new Map(s.mindmapsById);
    for (const m of b.mindmaps) mindmapsById.set(m.id, m);
    const labelById = new Map(s.labelById);
    for (const c of b.commands) labelById.set(c.id, { title: c.title, sub: c.tool ?? c.phase ?? '', type: 'command' });
    for (const t of b.techniques) labelById.set(t.id, { title: t.title, sub: `${t.os.join('/')} · ${t.phase}`, type: 'technique' });
    for (const sec of b.sections) labelById.set(sec.id, { title: sec.title, sub: sec.os, type: 'section' });
    set({
      commandsById,
      techniquesById,
      sectionsById,
      mindmapsById,
      labelById,
      bundle: {
        ...s.bundle,
        sections: [...s.bundle.sections, ...b.sections],
        techniques: [...s.bundle.techniques, ...b.techniques],
        commands: [...s.bundle.commands, ...b.commands],
        mindmaps: [...s.bundle.mindmaps, ...b.mindmaps],
      },
    });
  },
}));
