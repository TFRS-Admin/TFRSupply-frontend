import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { after, before, describe, it } from 'node:test';
import React from 'react';
import { renderToString } from 'react-dom/server';
import { createServer } from 'vite';

let server;
let modules;

before(async () => {
  server = await createServer({ logLevel: 'error' });
  modules = {
    fleetProjectsDomain: await server.ssrLoadModule('/src/domain/fleetProjects/index.ts'),
    fleetProjectContext: await server.ssrLoadModule('/src/context/FleetProjectContext.jsx'),
    fleetBuildsContext: await server.ssrLoadModule('/src/context/FleetBuildsContext.jsx'),
    fleetTemplatesContext: await server.ssrLoadModule('/src/context/FleetTemplatesContext.jsx'),
    departmentStandardsContext: await server.ssrLoadModule('/src/context/DepartmentStandardsContext.jsx'),
    upfitBuilderContext: await server.ssrLoadModule('/src/context/UpfitBuilderContext.jsx'),
    vehicleContext: await server.ssrLoadModule('/src/context/VehicleContext.jsx'),
    compareContext: await server.ssrLoadModule('/src/context/CompareContext.jsx'),
    recentlyViewedContext: await server.ssrLoadModule('/src/context/RecentlyViewedContext.jsx'),
    savedProductsContext: await server.ssrLoadModule('/src/context/SavedProductsContext.jsx'),
    configuratorContext: await server.ssrLoadModule('/src/context/ConfiguratorContext.jsx'),
    router: await server.ssrLoadModule('/node_modules/react-router-dom/dist/index.js'),
    fleetProjectCard: await server.ssrLoadModule('/src/components/fleetProjects/FleetProjectCard.jsx'),
    fleetProjectsWorkspaceSection: await server.ssrLoadModule('/src/components/fleetProjects/FleetProjectsWorkspaceSection.jsx'),
    projectSummaryCard: await server.ssrLoadModule('/src/components/fleetProjects/ProjectSummaryCard.jsx'),
    fleetProjectIndicator: await server.ssrLoadModule('/src/components/fleetProjects/FleetProjectIndicator.jsx'),
    fleetBuildsPanel: await server.ssrLoadModule('/src/components/fleetBuilds/FleetBuildsPanel.jsx'),
    finishYourUpfitPanel: await server.ssrLoadModule('/src/components/fleetBuilds/FinishYourUpfitPanel.jsx'),
    workspacePage: await server.ssrLoadModule('/src/pages/WorkspaceDashboard.jsx'),
  };
});

after(async () => {
  await server?.close();
});

// React SSR inserts `<!-- -->` marker comments between adjacent JSX text
// expressions — strip them so naive string assertions aren't broken by them
// (see fleet-templates-vehicle-cloning.test.mjs for the same helper).
function stripHtmlComments(html) {
  return html.replace(/<!--\s*-->/g, '');
}

function renderPure(element) {
  return stripHtmlComments(renderToString(element));
}

/**
 * A minimal in-memory localStorage so FleetProjectContext/FleetBuildsContext/
 * FleetTemplatesContext's `loadFromStorage()` can be exercised with seeded
 * data — the Vite SSR modules loaded above execute in this same Node
 * process, so setting `global.localStorage` before rendering is visible to
 * their plain `localStorage.getItem(...)` calls. Real mutation callbacks
 * (createProject, addBuild, etc.) can't be exercised this way — React's SSR
 * `useState` setters are no-ops once renderToString has returned — so
 * persistence/scoping is verified by seeding storage and asserting on what
 * a fresh render reads back, and CRUD behavior is verified directly against
 * the pure domain functions those callbacks delegate to.
 */
function withLocalStorage(seed, fn) {
  const store = new Map(Object.entries(seed).map(([key, value]) => [key, typeof value === 'string' ? value : JSON.stringify(value)]));
  global.localStorage = {
    getItem: (key) => (store.has(key) ? store.get(key) : null),
    setItem: (key, value) => { store.set(key, String(value)); },
    removeItem: (key) => { store.delete(key); },
  };
  try {
    return fn();
  } finally {
    delete global.localStorage;
  }
}

function renderWithProviders(element, initialEntries = ['/']) {
  const { MemoryRouter } = modules.router;
  const { VehicleProvider } = modules.vehicleContext;
  const { CompareProvider } = modules.compareContext;
  const { RecentlyViewedProvider } = modules.recentlyViewedContext;
  const { SavedProductsProvider } = modules.savedProductsContext;
  const { FleetProjectProvider } = modules.fleetProjectContext;
  const { FleetBuildsProvider } = modules.fleetBuildsContext;
  const { FleetTemplatesProvider } = modules.fleetTemplatesContext;
  const { DepartmentStandardsProvider } = modules.departmentStandardsContext;
  const { UpfitBuilderProvider } = modules.upfitBuilderContext;
  const { ConfiguratorProvider } = modules.configuratorContext;

  return stripHtmlComments(renderToString(
    React.createElement(MemoryRouter, { initialEntries },
      React.createElement(VehicleProvider, null,
        React.createElement(CompareProvider, null,
          React.createElement(RecentlyViewedProvider, null,
            React.createElement(SavedProductsProvider, null,
              React.createElement(FleetProjectProvider, null,
                React.createElement(FleetBuildsProvider, null,
                  React.createElement(FleetTemplatesProvider, null,
                    React.createElement(DepartmentStandardsProvider, null,
                      React.createElement(UpfitBuilderProvider, null,
                        React.createElement(ConfiguratorProvider, null, element),
                      ),
                    ),
                  ),
                ),
              ),
            ),
          ),
        ),
      ),
    ),
  ));
}

function makeProject(overrides = {}) {
  return { id: 'proj-1', name: 'Project One', archived: false, createdAt: 1000, updatedAt: 1000, ...overrides };
}

function makeBuild(overrides = {}) {
  return {
    id: 'build-1', name: 'Build 1', vehicle: null, quantity: 1, buildStyle: null,
    selections: {}, createdAt: 1000, projectId: 'proj-1', ...overrides,
  };
}

function makeTemplate(overrides = {}) {
  return {
    id: 'template-1', name: 'Template 1', vehicle: null, buildStyle: null, selections: {},
    completionPercent: 0, sourceBuildId: null, createdAt: 1000, updatedAt: 1000,
    usageCount: 0, lastUsedAt: null, projectId: 'proj-1', ...overrides,
  };
}

// ---------------------------------------------------------------------------
// Domain: Fleet Project CRUD rules
// ---------------------------------------------------------------------------
describe('Fleet Project domain rules — create', () => {
  it('assigns the next default incrementing name when none is given', () => {
    const { createFleetProject } = modules.fleetProjectsDomain;
    const project = createFleetProject('proj-2', 2000, [makeProject()]);
    assert.equal(project.name, 'Fleet Project 2');
    assert.equal(project.archived, false);
    assert.equal(project.createdAt, 2000);
    assert.equal(project.updatedAt, 2000);
  });

  it('uses a trimmed custom name when supplied', () => {
    const { createFleetProject } = modules.fleetProjectsDomain;
    const project = createFleetProject('proj-2', 2000, [], '  2026 Patrol Vehicles  ');
    assert.equal(project.name, '2026 Patrol Vehicles');
  });

  it('addFleetProject refuses to add past MAX_FLEET_PROJECTS', () => {
    const { addFleetProject, MAX_FLEET_PROJECTS } = modules.fleetProjectsDomain;
    const full = Array.from({ length: MAX_FLEET_PROJECTS }, (_, i) => makeProject({ id: `p${i}` }));
    const result = addFleetProject(full, makeProject({ id: 'overflow' }));
    assert.equal(result, full);
    assert.equal(result.length, MAX_FLEET_PROJECTS);
  });
});

describe('Fleet Project domain rules — rename', () => {
  it('renames a project by id, trimming whitespace and bumping updatedAt', () => {
    const { renameFleetProject } = modules.fleetProjectsDomain;
    const result = renameFleetProject([makeProject()], 'proj-1', '  Sheriff Fleet Expansion  ', 3000);
    assert.equal(result[0].name, 'Sheriff Fleet Expansion');
    assert.equal(result[0].updatedAt, 3000);
  });

  it('is a no-op for a blank name', () => {
    const { renameFleetProject } = modules.fleetProjectsDomain;
    const projects = [makeProject()];
    const result = renameFleetProject(projects, 'proj-1', '   ', 3000);
    assert.equal(result, projects);
  });
});

describe('Fleet Project domain rules — archive/unarchive', () => {
  it('archives a project by id', () => {
    const { setFleetProjectArchived } = modules.fleetProjectsDomain;
    const result = setFleetProjectArchived([makeProject()], 'proj-1', true, 4000);
    assert.equal(result[0].archived, true);
    assert.equal(result[0].updatedAt, 4000);
  });

  it('unarchives a project by id', () => {
    const { setFleetProjectArchived } = modules.fleetProjectsDomain;
    const result = setFleetProjectArchived([makeProject({ archived: true })], 'proj-1', false, 4000);
    assert.equal(result[0].archived, false);
  });
});

describe('Fleet Project domain rules — delete', () => {
  it('removes a project by id', () => {
    const { removeFleetProject } = modules.fleetProjectsDomain;
    const result = removeFleetProject([makeProject(), makeProject({ id: 'proj-2' })], 'proj-1');
    assert.deepEqual(result.map((p) => p.id), ['proj-2']);
  });

  it('resolveNextActiveProjectId falls back to another non-archived project when the active one is removed', () => {
    const { resolveNextActiveProjectId } = modules.fleetProjectsDomain;
    const remaining = [makeProject({ id: 'proj-2', archived: true }), makeProject({ id: 'proj-3' })];
    assert.equal(resolveNextActiveProjectId(remaining, 'proj-1', 'proj-1'), 'proj-3');
  });

  it('leaves the active id untouched when a different project is removed', () => {
    const { resolveNextActiveProjectId } = modules.fleetProjectsDomain;
    assert.equal(resolveNextActiveProjectId([makeProject({ id: 'proj-1' })], 'proj-2', 'proj-1'), 'proj-1');
  });

  it('returns null once the last project is removed', () => {
    const { resolveNextActiveProjectId } = modules.fleetProjectsDomain;
    assert.equal(resolveNextActiveProjectId([], 'proj-1', 'proj-1'), null);
  });
});

describe('Fleet Project domain rules — duplicate', () => {
  it('duplicates a project\'s metadata with a "(Copy)" suffix, never archived', () => {
    const { duplicateFleetProjectMeta } = modules.fleetProjectsDomain;
    const copy = duplicateFleetProjectMeta('proj-2', 5000, makeProject({ name: 'DOT Amber Fleet', archived: true }));
    assert.equal(copy.name, 'DOT Amber Fleet (Copy)');
    assert.equal(copy.archived, false);
    assert.equal(copy.createdAt, 5000);
  });
});

describe('Fleet Project domain rules — default project', () => {
  it('always resolves to the fixed DEFAULT_PROJECT_ID/DEFAULT_PROJECT_NAME regardless of when it is created', () => {
    const { createDefaultFleetProject, DEFAULT_PROJECT_ID, DEFAULT_PROJECT_NAME } = modules.fleetProjectsDomain;
    const a = createDefaultFleetProject(1000);
    const b = createDefaultFleetProject(2000);
    assert.equal(a.id, DEFAULT_PROJECT_ID);
    assert.equal(b.id, DEFAULT_PROJECT_ID);
    assert.equal(a.name, DEFAULT_PROJECT_NAME);
  });
});

// ---------------------------------------------------------------------------
// Domain: summarizeFleetProject (Project Summary / workspace card stats)
// ---------------------------------------------------------------------------
describe('summarizeFleetProject', () => {
  it('summarizes vehicle/build/template counts, average completion, and a no-pricing product estimate', () => {
    const { summarizeFleetProject } = modules.fleetProjectsDomain;
    const completeBuild = makeBuild({
      id: 'b1', quantity: 3, buildStyle: 'patrol',
      selections: {
        roof_lighting: [{ productId: 'p1', label: 'L', addedAt: 1 }],
        siren: [{ productId: 'p2', label: 'S', addedAt: 1 }],
        speaker: [{ productId: 'p3', label: 'Sp', addedAt: 1 }],
        console: [{ productId: 'p4', label: 'C', addedAt: 1 }],
      },
    });
    const incompleteBuild = makeBuild({ id: 'b2', quantity: 2, buildStyle: 'patrol', selections: {}, templateId: 'template-1' });
    const summary = summarizeFleetProject(makeProject(), [completeBuild, incompleteBuild], [makeTemplate()]);

    assert.equal(summary.buildCount, 2);
    assert.equal(summary.vehicleCount, 5);
    assert.equal(summary.templateCount, 1);
    assert.equal(summary.completedBuildCount, 1);
    assert.equal(summary.incompleteBuildCount, 1);
    assert.equal(summary.templateUsageCount, 1);
    assert.equal(summary.estimatedProductCount, 12);
    assert.equal(summary.averageCompletionPercent, 50);
    assert.equal(summary.completionColor, 'yellow');
    assert.deepEqual(summary.buildStyles, [{ styleId: 'patrol', label: 'Patrol', count: 2 }]);
    assert.ok(typeof summary.estimatedProductCount === 'number', 'no pricing — a count, never a dollar amount');
  });

  it('filters builds/templates down to the given project id (safe to pass an unscoped list)', () => {
    const { summarizeFleetProject } = modules.fleetProjectsDomain;
    const builds = [makeBuild({ projectId: 'proj-1' }), makeBuild({ id: 'b2', projectId: 'proj-2' })];
    const summary = summarizeFleetProject(makeProject({ id: 'proj-1' }), builds, []);
    assert.equal(summary.buildCount, 1);
  });

  it('returns all zeros and falls back to project.updatedAt for lastModified when there is no fleet data yet', () => {
    const { summarizeFleetProject } = modules.fleetProjectsDomain;
    const summary = summarizeFleetProject(makeProject({ updatedAt: 9999 }), [], []);
    assert.equal(summary.buildCount, 0);
    assert.equal(summary.vehicleCount, 0);
    assert.equal(summary.averageCompletionPercent, 0);
    assert.equal(summary.completionColor, 'red');
    assert.equal(summary.lastModified, 9999);
  });
});

// ---------------------------------------------------------------------------
// FleetProjectCard / FleetProjectsWorkspaceSection (pure, fixture-driven)
// ---------------------------------------------------------------------------
describe('FleetProjectCard', () => {
  function baseSummary(overrides = {}) {
    return {
      buildCount: 2, vehicleCount: 5, templateCount: 1, averageCompletionPercent: 50, completionColor: 'yellow',
      completedBuildCount: 1, incompleteBuildCount: 1, estimatedProductCount: 12, templateUsageCount: 1,
      buildStyles: [], lastModified: 1700000000000, ...overrides,
    };
  }

  it('renders the project name, stats, and Active badge when active', () => {
    const { default: FleetProjectCard } = modules.fleetProjectCard;
    const html = renderPure(React.createElement(FleetProjectCard, {
      project: makeProject({ name: '2026 Patrol Vehicle Replacement' }),
      summary: baseSummary(),
      isActive: true,
      onOpen: () => {}, onDuplicate: () => {}, onRename: () => {}, onArchive: () => {}, onDelete: () => {},
    }));

    assert.match(html, /2026 Patrol Vehicle Replacement/);
    assert.match(html, /ACTIVE/);
    assert.match(html, />5</); // vehicle count
    assert.match(html, />2</); // build count
    assert.match(html, />1</); // template count
    assert.match(html, /Open/);
    assert.match(html, /Duplicate/);
    assert.match(html, /Rename/);
    assert.match(html, /Archive/);
    assert.match(html, /Delete/);
  });

  it('shows Restore/Delete only (no Open/Duplicate/Rename/Archive) once archived', () => {
    const { default: FleetProjectCard } = modules.fleetProjectCard;
    const html = renderPure(React.createElement(FleetProjectCard, {
      project: makeProject({ archived: true }),
      summary: baseSummary(),
      isActive: false,
      onUnarchive: () => {}, onDelete: () => {},
    }));

    assert.match(html, /ARCHIVED/);
    assert.match(html, /Restore/);
    assert.doesNotMatch(html, />Open</);
    assert.doesNotMatch(html, />Duplicate</);
    assert.doesNotMatch(html, />Archive</);
  });

  it('does not render the Active badge when not active', () => {
    const { default: FleetProjectCard } = modules.fleetProjectCard;
    const html = renderPure(React.createElement(FleetProjectCard, {
      project: makeProject(), summary: baseSummary(), isActive: false,
      onOpen: () => {}, onDuplicate: () => {}, onRename: () => {}, onArchive: () => {}, onDelete: () => {},
    }));
    assert.doesNotMatch(html, /ACTIVE/);
  });
});

describe('FleetProjectsWorkspaceSection', () => {
  function baseProps(overrides = {}) {
    return {
      projects: [], archivedProjects: [], activeProjectId: null, summaries: {}, isFull: false, showArchived: false,
      onToggleShowArchived: () => {}, onCreate: () => {}, onOpen: () => {}, onDuplicate: () => {},
      onRename: () => {}, onArchive: () => {}, onUnarchive: () => {}, onDelete: () => {},
      ...overrides,
    };
  }

  it('renders an empty state with a create CTA when there are no active projects', () => {
    const { default: FleetProjectsWorkspaceSection } = modules.fleetProjectsWorkspaceSection;
    const html = renderPure(React.createElement(FleetProjectsWorkspaceSection, baseProps()));
    assert.match(html, /No active fleet projects/);
    assert.match(html, /Create Your First Project/);
  });

  it('renders a card per project with the New Project action always available', () => {
    const { default: FleetProjectsWorkspaceSection } = modules.fleetProjectsWorkspaceSection;
    const project = makeProject({ name: 'Sheriff Fleet Expansion' });
    const html = renderPure(React.createElement(FleetProjectsWorkspaceSection, baseProps({
      projects: [project],
      activeProjectId: project.id,
      summaries: { [project.id]: { buildCount: 0, vehicleCount: 0, templateCount: 0, averageCompletionPercent: 0, completionColor: 'red', completedBuildCount: 0, incompleteBuildCount: 0, estimatedProductCount: 0, templateUsageCount: 0, buildStyles: [], lastModified: null } },
    })));
    assert.match(html, /Fleet Projects \(1\)/);
    assert.match(html, /Sheriff Fleet Expansion/);
    assert.match(html, /New Project/);
  });

  it('shows a collapsed archived-projects toggle only once something is archived', () => {
    const { default: FleetProjectsWorkspaceSection } = modules.fleetProjectsWorkspaceSection;
    const archived = makeProject({ id: 'proj-archived', name: 'Old Program', archived: true });
    const htmlWithout = renderPure(React.createElement(FleetProjectsWorkspaceSection, baseProps()));
    assert.doesNotMatch(htmlWithout, /Archived Projects/);

    const htmlWith = renderPure(React.createElement(FleetProjectsWorkspaceSection, baseProps({
      archivedProjects: [archived],
      summaries: { [archived.id]: { buildCount: 0, vehicleCount: 0, templateCount: 0, averageCompletionPercent: 0, completionColor: 'red', completedBuildCount: 0, incompleteBuildCount: 0, estimatedProductCount: 0, templateUsageCount: 0, buildStyles: [], lastModified: null } },
    })));
    assert.match(htmlWith, /Show Archived Projects \(1\)/);
    assert.doesNotMatch(htmlWith, /Old Program/); // collapsed by default

    const htmlExpanded = renderPure(React.createElement(FleetProjectsWorkspaceSection, baseProps({
      archivedProjects: [archived],
      showArchived: true,
      summaries: { [archived.id]: { buildCount: 0, vehicleCount: 0, templateCount: 0, averageCompletionPercent: 0, completionColor: 'red', completedBuildCount: 0, incompleteBuildCount: 0, estimatedProductCount: 0, templateUsageCount: 0, buildStyles: [], lastModified: null } },
    })));
    assert.match(htmlExpanded, /Old Program/);
  });

  it('disables New Project once isFull', () => {
    const { default: FleetProjectsWorkspaceSection } = modules.fleetProjectsWorkspaceSection;
    const html = renderPure(React.createElement(FleetProjectsWorkspaceSection, baseProps({ isFull: true })));
    assert.match(html, /disabled=""/);
  });

  it('uses a mobile-safe responsive stats grid on each project card', () => {
    const { default: FleetProjectCard } = modules.fleetProjectCard;
    const html = renderPure(React.createElement(FleetProjectCard, {
      project: makeProject(),
      summary: { buildCount: 0, vehicleCount: 0, templateCount: 0, averageCompletionPercent: 0, completionColor: 'red', completedBuildCount: 0, incompleteBuildCount: 0, estimatedProductCount: 0, templateUsageCount: 0, buildStyles: [], lastModified: null },
      isActive: false, onOpen: () => {}, onDuplicate: () => {}, onRename: () => {}, onArchive: () => {}, onDelete: () => {},
    }));
    assert.match(html, /grid-cols-2 sm:grid-cols-4/);
  });
});

// ---------------------------------------------------------------------------
// ProjectSummaryCard (Fleet Builder "Project Summary")
// ---------------------------------------------------------------------------
describe('ProjectSummaryCard', () => {
  it('renders every required stat with no pricing/dollar formatting', () => {
    const { default: ProjectSummaryCard } = modules.projectSummaryCard;
    const html = renderPure(React.createElement(ProjectSummaryCard, {
      projectName: '2026 Patrol Vehicle Replacement',
      summary: {
        vehicleCount: 5, estimatedProductCount: 12, completedBuildCount: 1, incompleteBuildCount: 1,
        templateUsageCount: 1, buildStyles: [{ styleId: 'patrol', label: 'Patrol', count: 2 }],
      },
    }));

    assert.match(html, /Project Summary/);
    assert.match(html, /2026 Patrol Vehicle Replacement/);
    assert.match(html, /Vehicles/);
    assert.match(html, /Estimated Products/);
    assert.match(html, /Completed Builds/);
    assert.match(html, /Incomplete Builds/);
    assert.match(html, /Template Usage/);
    assert.match(html, /Build Styles/);
    assert.match(html, /Patrol × 2/);
    assert.doesNotMatch(html, /\$/);
  });

  it('omits the Build Styles row when nothing has a style chosen yet', () => {
    const { default: ProjectSummaryCard } = modules.projectSummaryCard;
    const html = renderPure(React.createElement(ProjectSummaryCard, {
      projectName: 'New Project',
      summary: { vehicleCount: 0, estimatedProductCount: 0, completedBuildCount: 0, incompleteBuildCount: 0, templateUsageCount: 0, buildStyles: [] },
    }));
    assert.doesNotMatch(html, /Build Styles/);
  });
});

// ---------------------------------------------------------------------------
// FleetProjectContext + scoping — persistence, switching, legacy migration
// ---------------------------------------------------------------------------
describe('FleetProjectContext (connected, seeded localStorage)', () => {
  it('bootstraps a single default project when nothing is stored yet', () => {
    const html = withLocalStorage({}, () => renderWithProviders(
      React.createElement(modules.fleetProjectIndicator.default),
    ));
    assert.match(html, /My Fleet Project/);
  });

  it('reads a previously created active project back from storage', () => {
    const html = withLocalStorage({
      tfr_fleet_projects: { projects: [makeProject({ name: 'Sheriff Fleet Expansion' })], activeProjectId: 'proj-1' },
    }, () => renderWithProviders(React.createElement(modules.fleetProjectIndicator.default)));
    assert.match(html, /Sheriff Fleet Expansion/);
  });
});

describe('FleetBuildsContext/FleetTemplatesContext — Fleet Projects scoping', () => {
  it('only shows the active project\'s fleet builds — switching projects changes what Fleet Builder shows, without deleting the other project\'s data', () => {
    const seed = {
      tfr_fleet_projects: {
        projects: [makeProject({ id: 'proj-a', name: 'Project A' }), makeProject({ id: 'proj-b', name: 'Project B' })],
        activeProjectId: 'proj-a',
      },
      tfr_fleet_builds: {
        builds: [
          makeBuild({ id: 'build-a', name: 'Patrol Build A', projectId: 'proj-a' }),
          makeBuild({ id: 'build-b', name: 'Patrol Build B', projectId: 'proj-b' }),
        ],
        activeBuildIdByProject: { 'proj-a': 'build-a', 'proj-b': 'build-b' },
      },
    };

    const { default: FleetBuildsPanel } = modules.fleetBuildsPanel;
    const htmlOnA = withLocalStorage(seed, () => renderWithProviders(React.createElement(FleetBuildsPanel)));
    assert.match(htmlOnA, /Patrol Build A/);
    assert.doesNotMatch(htmlOnA, /Patrol Build B/);

    // "Switching" — same stored builds, only activeProjectId differs — proves
    // build-b was never lost, just filtered out of view while proj-a is active.
    const seedOnB = { ...seed, tfr_fleet_projects: { ...seed.tfr_fleet_projects, activeProjectId: 'proj-b' } };
    const htmlOnB = withLocalStorage(seedOnB, () => renderWithProviders(React.createElement(FleetBuildsPanel)));
    assert.match(htmlOnB, /Patrol Build B/);
    assert.doesNotMatch(htmlOnB, /Patrol Build A/);
  });

  it('only shows the active project\'s fleet templates', () => {
    const seed = {
      tfr_fleet_projects: {
        projects: [makeProject({ id: 'proj-a' }), makeProject({ id: 'proj-b' })],
        activeProjectId: 'proj-a',
      },
      tfr_fleet_templates: [
        makeTemplate({ id: 'template-a', name: 'Explorer Patrol', projectId: 'proj-a' }),
        makeTemplate({ id: 'template-b', name: 'F-150 Work Truck', projectId: 'proj-b' }),
      ],
    };

    const { default: FleetBuildsPanel } = modules.fleetBuildsPanel;
    const html = withLocalStorage(seed, () => renderWithProviders(React.createElement(FleetBuildsPanel)));
    assert.match(html, /Explorer Patrol/);
    assert.doesNotMatch(html, /F-150 Work Truck/);
  });

  it('normalizes pre-Fleet-Projects builds/templates (no projectId) onto the default project instead of losing them', () => {
    const legacySeed = {
      // No tfr_fleet_projects key at all — simulates a customer who used Fleet
      // Builds/Templates before this feature shipped.
      tfr_fleet_builds: {
        builds: [{ id: 'legacy-build', name: 'Legacy Build', vehicle: null, quantity: 1, buildStyle: null, selections: {}, createdAt: 500 }],
        activeBuildId: 'legacy-build',
      },
      tfr_fleet_templates: [
        { id: 'legacy-template', name: 'Legacy Template', vehicle: null, buildStyle: null, selections: {}, completionPercent: 0, sourceBuildId: null, createdAt: 500, updatedAt: 500, usageCount: 0, lastUsedAt: null },
      ],
    };

    const { default: FleetBuildsPanel } = modules.fleetBuildsPanel;
    const html = withLocalStorage(legacySeed, () => renderWithProviders(React.createElement(FleetBuildsPanel)));
    assert.match(html, /Legacy Build/);
    assert.match(html, /Legacy Template/);
  });

  it('source: FleetBuildsPanel guards against no active project (only reachable transiently after deleting the last project mid-session — FleetProjectContext always bootstraps a default project on load)', () => {
    const source = readFileSync(new URL('../src/components/fleetBuilds/FleetBuildsPanel.jsx', import.meta.url), 'utf8');
    assert.match(source, /if \(!activeProject\)/);
    assert.match(source, /No active fleet project/);
  });
});

// ---------------------------------------------------------------------------
// Fleet Builder integration — Project Summary card
// ---------------------------------------------------------------------------
describe('FleetBuildsPanel — Project Summary integration', () => {
  it('renders the active project\'s Project Summary card above the builds list', () => {
    const seed = {
      tfr_fleet_projects: { projects: [makeProject({ name: 'DOT Amber Fleet' })], activeProjectId: 'proj-1' },
      tfr_fleet_builds: { builds: [makeBuild({ quantity: 4 })], activeBuildIdByProject: { 'proj-1': 'build-1' } },
    };
    const { default: FleetBuildsPanel } = modules.fleetBuildsPanel;
    const html = withLocalStorage(seed, () => renderWithProviders(React.createElement(FleetBuildsPanel)));
    assert.match(html, /Project Summary — DOT Amber Fleet/);
    assert.match(html, /data-testid="project-summary-card"/);
  });
});

// ---------------------------------------------------------------------------
// Finish Your Upfit integration — Current Project/Fleet Build/Template
// ---------------------------------------------------------------------------
describe('FinishYourUpfitPanelView — Current Project/Fleet Build/Template', () => {
  it('shows the current project, fleet build, and applied template together', () => {
    const { FinishYourUpfitPanelView } = modules.finishYourUpfitPanel;
    const build = makeBuild({ name: 'Explorer Patrol Build', templateId: 'template-1' });
    const html = renderWithProviders(React.createElement(FinishYourUpfitPanelView, {
      builds: [build],
      activeBuild: build,
      product: { id: 'p1', title: 'Light Bar' },
      templates: [],
      appliedTemplate: makeTemplate({ name: 'Explorer Patrol Template' }),
      activeProject: makeProject({ name: '2026 Patrol Vehicle Replacement' }),
      onAddToActiveBuild: () => {}, onOpenFleetBuilds: () => {}, onApplyTemplate: () => {}, onCloneActiveBuild: () => {},
    }));

    assert.match(html, /data-testid="current-project-label"[^]*?2026 Patrol Vehicle Replacement/);
    assert.match(html, /data-testid="current-fleet-build-label"[^]*?Explorer Patrol Build/);
    assert.match(html, /data-testid="current-template-summary-label"[^]*?Explorer Patrol Template/);
  });

  it('shows "None"/"None applied" placeholders before a project/build/template exists', () => {
    const { FinishYourUpfitPanelView } = modules.finishYourUpfitPanel;
    const build = makeBuild();
    const html = renderWithProviders(React.createElement(FinishYourUpfitPanelView, {
      builds: [build],
      activeBuild: build,
      product: { id: 'p1', title: 'Light Bar' },
      templates: [],
      appliedTemplate: null,
      activeProject: null,
      onAddToActiveBuild: () => {}, onOpenFleetBuilds: () => {}, onApplyTemplate: () => {}, onCloneActiveBuild: () => {},
    }));

    assert.match(html, /data-testid="current-project-label"[^]*?None</);
    assert.match(html, /data-testid="current-template-summary-label"[^]*?None applied/);
  });
});

// ---------------------------------------------------------------------------
// Workspace rendering — Fleet Projects section on /workspace
// ---------------------------------------------------------------------------
describe('WorkspaceDashboard — Fleet Projects section', () => {
  it('renders the Fleet Projects section with the bootstrapped default project active', () => {
    const { default: WorkspaceDashboard } = modules.workspacePage;
    const html = withLocalStorage({}, () => renderWithProviders(React.createElement(WorkspaceDashboard), ['/workspace']));
    assert.match(html, /Fleet Projects \(1\)/);
    assert.match(html, /My Fleet Project/);
    assert.match(html, /ACTIVE/);
  });

  it('renders every seeded project with its own stats', () => {
    const seed = {
      tfr_fleet_projects: {
        projects: [makeProject({ id: 'proj-a', name: 'Project A' }), makeProject({ id: 'proj-b', name: 'Project B' })],
        activeProjectId: 'proj-a',
      },
      tfr_fleet_builds: {
        builds: [makeBuild({ id: 'build-a', projectId: 'proj-a', quantity: 3 })],
        activeBuildIdByProject: { 'proj-a': 'build-a' },
      },
    };
    const { default: WorkspaceDashboard } = modules.workspacePage;
    const html = withLocalStorage(seed, () => renderWithProviders(React.createElement(WorkspaceDashboard), ['/workspace']));
    assert.match(html, /Fleet Projects \(2\)/);
    assert.match(html, /Project A/);
    assert.match(html, /Project B/);
  });
});

// ---------------------------------------------------------------------------
// Mobile-safe structure — header indicator + drawer
// ---------------------------------------------------------------------------
describe('Mobile-safe structure', () => {
  it('FleetProjectIndicator is desktop-only (hidden md:flex), matching the vehicle selector/WorkspaceButton pattern', () => {
    const source = readFileSync(new URL('../src/components/fleetProjects/FleetProjectIndicator.jsx', import.meta.url), 'utf8');
    assert.match(source, /className="hidden md:flex"/);
  });

  it('source: MobileNavDrawer renders a Fleet Project accordion entry only when projects are supplied, defaulting to a switcher over every non-archived project', () => {
    // MobileNavDrawer's Sheet/Accordion (Radix) render into a portal that
    // produces no server-rendered output regardless of `open`/props, so this
    // is verified at the source level rather than via renderToString — the
    // same convention project-workspace.test.mjs and
    // fleet-templates-vehicle-cloning.test.mjs use for Radix-portal surfaces.
    const source = readFileSync(new URL('../src/components/navigation/MobileNavDrawer.jsx', import.meta.url), 'utf8');
    assert.match(source, /fleetProjects\.length > 0 &&/);
    assert.match(source, /Fleet Project: \$\{activeFleetProject\?\.name/);
    assert.match(source, /onClick=\{\(\) => onSwitchFleetProject\(project\.id\)\}/);
  });

  it('source: SiteHeader threads non-archived fleet projects and the switch handler into MobileNavDrawer', () => {
    const source = readFileSync(new URL('../src/components/navigator/SiteHeader.jsx', import.meta.url), 'utf8');
    assert.match(source, /fleetProjects=\{fleetProjectsList\.filter/);
    assert.match(source, /onSwitchFleetProject=\{/);
  });
});

// ---------------------------------------------------------------------------
// Composition — Fleet Projects wiring
// ---------------------------------------------------------------------------
describe('Composition — Fleet Projects wiring', () => {
  it('source: App.jsx mounts FleetProjectProvider above FleetBuildsProvider/FleetTemplatesProvider', () => {
    const source = readFileSync(new URL('../src/App.jsx', import.meta.url), 'utf8');
    assert.match(source, /import \{ FleetProjectProvider \} from '@\/context\/FleetProjectContext'/);
    assert.match(source, /<FleetProjectProvider>\s*<FleetBuildsProvider>/);
  });

  it('source: SiteHeader wires Fleet Project switching into the consolidated User menu', () => {
    const source = readFileSync(new URL('../src/components/navigator/SiteHeader.jsx', import.meta.url), 'utf8');
    assert.match(source, /useFleetProject\(\)/);
    assert.match(source, /onClick=\{\(\) => setActiveFleetProject\(project\.id\)\}/);
  });

  it('source: WorkspaceDashboard renders FleetProjectsWorkspaceSection', () => {
    const source = readFileSync(new URL('../src/pages/WorkspaceDashboard.jsx', import.meta.url), 'utf8');
    assert.match(source, /import FleetProjectsWorkspaceSection from '@\/components\/fleetProjects\/FleetProjectsWorkspaceSection'/);
    assert.match(source, /<FleetProjectsWorkspaceSection/);
  });

  it('source: FleetBuildsPanel renders ProjectSummaryCard', () => {
    const source = readFileSync(new URL('../src/components/fleetBuilds/FleetBuildsPanel.jsx', import.meta.url), 'utf8');
    assert.match(source, /import ProjectSummaryCard from '@\/components\/fleetProjects\/ProjectSummaryCard'/);
    assert.match(source, /<ProjectSummaryCard/);
  });

  it('source: FinishYourUpfitPanel reads useFleetProject for Current Project', () => {
    const source = readFileSync(new URL('../src/components/fleetBuilds/FinishYourUpfitPanel.jsx', import.meta.url), 'utf8');
    assert.match(source, /useFleetProject/);
  });
});
