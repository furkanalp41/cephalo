// src/routes/router.tsx — typed, deep-linkable routes (TanStack Router). Hash
// history keeps deep links working on any static host / offline / GitHub Pages
// with no server rewrites.
import {
  createRootRoute,
  createRoute,
  createRouter,
  createHashHistory,
  Link,
} from '@tanstack/react-router';
import { App } from '@/app/App';

function NotFound() {
  return (
    <div style={{ padding: 24 }}>
      <h1 className="section-title">Nothing surfaced here</h1>
      <p className="muted">
        That route doesn&apos;t exist. <Link to="/">Back to Cephalo</Link>.
      </p>
    </div>
  );
}
import {
  RealmHome,
  TechniqueView,
  MindMapView,
  BloodHoundView,
  CrossCuttingView,
} from './views';
import { CveLookupRoute } from '@/features/cve/CveLookupView';
import { ToolArsenalRoute } from '@/features/arsenal/ToolArsenalView';
import { AskOctopusRoute } from '@/features/ask/AskOctopusView';
import { PrivilegeAdvisorRoute } from '@/features/advisor/PrivilegeAdvisorView';
import { DecisionMindMapRoute } from '@/features/decision/DecisionMindMapView';

const rootRoute = createRootRoute({ component: App });

const indexRoute = createRoute({ getParentRoute: () => rootRoute, path: '/', component: RealmHome });
const realmRoute = createRoute({ getParentRoute: () => rootRoute, path: '/$os', component: RealmHome });
const techniqueRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/$os/technique/$techniqueId',
  component: TechniqueView,
});
const mindmapRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/$os/mindmap/$mapId',
  component: MindMapView,
  validateSearch: (search: Record<string, unknown>): { node?: string } => {
    const node = search.node;
    return typeof node === 'string' ? { node } : {};
  },
});
const bloodhoundRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/bloodhound',
  component: BloodHoundView,
});
const crossRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/cross-cutting/$topic',
  component: CrossCuttingView,
});
const cveRoute = createRoute({ getParentRoute: () => rootRoute, path: '/cve', component: CveLookupRoute });
const arsenalRoute = createRoute({ getParentRoute: () => rootRoute, path: '/arsenal', component: ToolArsenalRoute });
const askRoute = createRoute({ getParentRoute: () => rootRoute, path: '/ask', component: AskOctopusRoute });
const advisorRoute = createRoute({ getParentRoute: () => rootRoute, path: '/advisor', component: PrivilegeAdvisorRoute });
const decisionRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/$os/decision/$mapId',
  component: DecisionMindMapRoute,
  validateSearch: (search: Record<string, unknown>): { node?: string } => {
    const node = search.node;
    return typeof node === 'string' ? { node } : {};
  },
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  realmRoute,
  techniqueRoute,
  mindmapRoute,
  bloodhoundRoute,
  crossRoute,
  cveRoute,
  arsenalRoute,
  askRoute,
  advisorRoute,
  decisionRoute,
]);

export const router = createRouter({
  routeTree,
  history: createHashHistory(),
  defaultPreload: 'intent',
  defaultNotFoundComponent: NotFound,
});

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}
