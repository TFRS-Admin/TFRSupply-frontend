/**
 * domain/configuration/engineTests.js
 * Lightweight self-tests for the pure configurator engine.
 * No external test framework — runs entirely in-browser via runEngineTests().
 *
 * Usage (browser console or debug panel):
 *   import { runEngineTests } from '@/domain/configuration/engineTests';
 *   runEngineTests();
 *
 * Or call from AdminDebugSummary / DebugPanel for developer-mode visibility.
 */

import {
  initializeEngine,
  applySelection,
  clearStep,
  isStepComplete,
  getPendingRequiredSteps,
  getCompletionPercentage,
  getActiveDependencies,
  getDependencyRequiredSteps,
  getCompatibilityViolations,
  generateSkuPreview,
  getSelectedAccessories,
  computeSummary,
} from './configuratorEngine.js';

// ─── Minimal fixture JSON (self-contained, no file imports) ───────────────

const FIXTURE = {
  id: 'test-configurator',
  productId: 'test-product',
  label: 'Test Configurator',
  skuRoot: 'TST',
  skuTemplate: 'TST-{size}-{color}',
  priceDisplay: 'Contact for pricing',
  steps: [
    {
      id: 'size',
      label: 'Size',
      required: true,
      skuSegmentKey: 'size',
      options: [
        { id: 'small', label: 'Small', skuSegment: 'SM' },
        { id: 'large', label: 'Large', skuSegment: 'LG' },
      ],
    },
    {
      id: 'color',
      label: 'Color',
      required: true,
      skuSegmentKey: 'color',
      options: [
        { id: 'red',  label: 'Red',   skuSegment: 'R' },
        { id: 'blue', label: 'Blue',  skuSegment: 'B' },
        { id: 'amber',label: 'Amber', skuSegment: 'A' },
      ],
    },
    {
      id: 'mounting',
      label: 'Mounting',
      required: false,
      skuSegmentKey: 'mounting',
      options: [
        { id: 'perm',    label: 'Permanent', skuSegment: 'PERM' },
        { id: 'magnetic',label: 'Magnetic',  skuSegment: 'MAG'  },
      ],
    },
    {
      id: 'accessories',
      label: 'Accessories',
      required: false,
      multiple: true,
      skuSegmentKey: 'accessories',
      options: [
        { id: 'cable-10', label: '10ft Cable',    skuSegment: 'C10',  priceModifier: 28 },
        { id: 'alley',    label: 'Alley Light Kit',skuSegment: 'ALLY', priceModifier: 95 },
      ],
    },
  ],
  dependencyRules: [
    {
      id: 'dep-large-requires-mounting',
      type: 'requires',
      ifStep: 'size',
      ifOption: 'large',
      thenStep: 'mounting',
      thenOption: null,
      message: 'Large size requires a mounting selection.',
    },
  ],
  compatibilityRules: [
    {
      id: 'excl-magnetic-large',
      type: 'excludes',
      stepA: 'size',
      optionA: 'large',
      stepB: 'mounting',
      optionB: 'magnetic',
      message: 'Magnetic mount not approved for large size.',
    },
    {
      id: 'warn-amber-small',
      type: 'warns',
      stepA: 'color',
      optionA: 'amber',
      stepB: 'size',
      optionB: 'small',
      message: 'Amber on small units is non-standard.',
    },
  ],
};

// ─── Assertion helpers ─────────────────────────────────────────────────────

function assert(condition, label) {
  return { pass: !!condition, label };
}

function assertEq(actual, expected, label) {
  const pass = JSON.stringify(actual) === JSON.stringify(expected);
  return { pass, label, actual: pass ? undefined : actual, expected: pass ? undefined : expected };
}

// ─── Test Suites ───────────────────────────────────────────────────────────

function testInitialization() {
  const { session, selections } = initializeEngine(FIXTURE);
  return [
    assert(session !== null, 'session is not null'),
    assertEq(session.id, 'test-configurator', 'session.id'),
    assertEq(session.steps.length, 4, 'session has 4 steps'),
    assertEq(session.dependencyRules.length, 1, '1 dependency rule'),
    assertEq(session.compatibilityRules.length, 2, '2 compatibility rules'),
    assertEq(Object.keys(selections).length, 0, 'initial selections is empty'),
    assertEq(session.skuTemplate, 'TST-{size}-{color}', 'skuTemplate preserved'),
  ];
}

function testSelectionUpdates() {
  const { session } = initializeEngine(FIXTURE);
  let sel = {};

  sel = applySelection(session, sel, 'size', 'small');
  const afterSmall = [
    assertEq(sel['size'], 'small', 'size=small after selection'),
  ];

  sel = applySelection(session, sel, 'size', 'large');
  const afterLarge = [
    assertEq(sel['size'], 'large', 'size=large after re-selection'),
  ];

  sel = clearStep(sel, 'size');
  const afterClear = [
    assert(sel['size'] === undefined, 'size cleared'),
  ];

  return [...afterSmall, ...afterLarge, ...afterClear];
}

function testMultiSelect() {
  const { session } = initializeEngine(FIXTURE);
  let sel = {};

  sel = applySelection(session, sel, 'accessories', 'cable-10');
  sel = applySelection(session, sel, 'accessories', 'alley');
  const afterAdd = [
    assert(Array.isArray(sel['accessories']), 'accessories is array'),
    assertEq(sel['accessories'].length, 2, 'accessories has 2 items'),
  ];

  sel = applySelection(session, sel, 'accessories', 'cable-10');
  const afterToggle = [
    assertEq(sel['accessories'].length, 1, 'toggle removes cable-10'),
    assertEq(sel['accessories'][0], 'alley', 'alley remains'),
  ];

  const { session: s2 } = initializeEngine(FIXTURE);
  const accessories = getSelectedAccessories(s2, { accessories: ['cable-10', 'alley'] });
  const accessoryData = [
    assertEq(accessories.length, 2, 'getSelectedAccessories returns 2'),
    assertEq(accessories[0].optionLabel, '10ft Cable', 'first accessory label'),
    assertEq(accessories[1].priceModifier, 95, 'alley kit priceModifier'),
  ];

  return [...afterAdd, ...afterToggle, ...accessoryData];
}

function testDependencyRules() {
  const { session } = initializeEngine(FIXTURE);
  const sel = { size: 'large' };

  const active = getActiveDependencies(session, sel);
  const depSteps = getDependencyRequiredSteps(session, sel);

  return [
    assertEq(active.length, 1, 'dep-large-requires-mounting is active'),
    assertEq(active[0].id, 'dep-large-requires-mounting', 'correct rule id'),
    assertEq(depSteps.length, 1, 'getDependencyRequiredSteps returns 1'),
    assertEq(depSteps[0].stepId, 'mounting', 'required step is mounting'),
    assertEq(depSteps[0].triggerLabel, 'Large', 'triggerLabel is Large'),
    assertEq(depSteps[0].targetStepLabel, 'Mounting', 'targetStepLabel is Mounting'),
    assert(depSteps[0].message.length > 0, 'dep message is present'),
  ];
}

function testExclusionRules() {
  const { session } = initializeEngine(FIXTURE);
  const sel = { size: 'large', mounting: 'magnetic' };

  const violations = getCompatibilityViolations(session, sel);
  const hard = violations.filter(v => v.type === 'excludes');

  return [
    assertEq(hard.length, 1, 'one hard exclusion fires'),
    assertEq(hard[0].ruleId, 'excl-magnetic-large', 'correct exclusion rule'),
    assertEq(hard[0].optionALabel, 'Large', 'optionALabel resolved'),
    assertEq(hard[0].optionBLabel, 'Magnetic', 'optionBLabel resolved'),
    assert(hard[0].message.length > 0, 'exclusion message is present'),
  ];
}

function testWarningRules() {
  const { session } = initializeEngine(FIXTURE);
  const sel = { color: 'amber', size: 'small' };

  const violations = getCompatibilityViolations(session, sel);
  const warns = violations.filter(v => v.type === 'warns');
  const hard = violations.filter(v => v.type === 'excludes');

  return [
    assertEq(warns.length, 1, 'one warning fires'),
    assertEq(warns[0].ruleId, 'warn-amber-small', 'correct warning rule'),
    assertEq(hard.length, 0, 'no hard exclusions for warn-only combo'),
    assert(warns[0].message.length > 0, 'warning message present'),
  ];
}

function testCompletionPercentage() {
  const { session } = initializeEngine(FIXTURE);

  const at0 = getCompletionPercentage(session, {});
  const at50 = getCompletionPercentage(session, { size: 'small' });
  const at100 = getCompletionPercentage(session, { size: 'small', color: 'red' });

  // With dependency: size=large makes mounting required → 3 required steps total
  const withDep50 = getCompletionPercentage(session, { size: 'large' }); // 1/3
  const withDep66 = getCompletionPercentage(session, { size: 'large', color: 'red' }); // 2/3
  const withDep100 = getCompletionPercentage(session, { size: 'large', color: 'red', mounting: 'perm' }); // 3/3

  return [
    assertEq(at0, 0, '0% when empty'),
    assertEq(at50, 50, '50% with 1/2 required steps'),
    assertEq(at100, 100, '100% with all 2 required steps'),
    assertEq(withDep50, 33, '33% when dep adds mounting (1/3)'),
    assertEq(withDep66, 67, '67% when dep adds mounting (2/3)'),
    assertEq(withDep100, 100, '100% when dep step also filled'),
  ];
}

function testSkuPreview() {
  const { session } = initializeEngine(FIXTURE);

  const partial = generateSkuPreview(session, { size: 'small' });
  const full    = generateSkuPreview(session, { size: 'small', color: 'red' });
  const empty   = generateSkuPreview(session, {});

  // accessories are not in template — should not crash SKU
  const withAcc = generateSkuPreview(session, { size: 'large', color: 'blue', accessories: ['cable-10', 'alley'] });

  return [
    assert(partial !== null, 'partial SKU is not null'),
    assert(partial.includes('???'), 'partial SKU has ??? for unresolved'),
    assertEq(full, 'TST-SM-R', 'full SKU correct'),
    assert(empty.includes('???'), 'empty selections yields all ???'),
    assertEq(withAcc, 'TST-LG-B', 'accessories do not contaminate base SKU'),
  ];
}

function testComputeSummary() {
  const { session } = initializeEngine(FIXTURE);

  // Happy path
  const happy = computeSummary(session, { size: 'small', color: 'red' });
  const happyTests = [
    assert(happy.isComplete, 'happy path isComplete'),
    assertEq(happy.completion, 100, 'happy path 100%'),
    assertEq(happy.violations.length, 0, 'no violations on happy path'),
    assertEq(happy.pendingSteps.length, 0, 'no pending steps on happy path'),
    assertEq(happy.accessories.length, 0, 'no accessories on happy path'),
    assertEq(happy.skuPreview, 'TST-SM-R', 'correct SKU preview'),
  ];

  // Exclusion path — isComplete must be false
  const excl = computeSummary(session, { size: 'large', color: 'red', mounting: 'magnetic' });
  const exclTests = [
    assert(!excl.isComplete, 'exclusion path blocks isComplete'),
    assertEq(excl.violations.filter(v => v.type === 'excludes').length, 1, 'one hard violation'),
  ];

  // Warning path — isComplete CAN be true if required steps are filled
  const warn = computeSummary(session, { size: 'small', color: 'amber' });
  const warnTests = [
    assert(warn.isComplete, 'soft warning does not block isComplete'),
    assertEq(warn.violations.filter(v => v.type === 'warns').length, 1, 'one soft warning'),
  ];

  // Accessory path
  const withAcc = computeSummary(session, {
    size: 'small',
    color: 'red',
    accessories: ['cable-10', 'alley'],
  });
  const accTests = [
    assert(withAcc.isComplete, 'accessories do not block completion'),
    assertEq(withAcc.accessories.length, 2, 'two accessories in summary'),
    assertEq(withAcc.accessories[0].optionLabel, '10ft Cable', 'first accessory label'),
    assertEq(withAcc.skuPreview, 'TST-SM-R', 'accessory does not change base SKU'),
  ];

  return [...happyTests, ...exclTests, ...warnTests, ...accTests];
}

// ─── Runner ────────────────────────────────────────────────────────────────

export function runEngineTests() {
  const suites = [
    { name: 'Initialization',        run: testInitialization },
    { name: 'Selection Updates',     run: testSelectionUpdates },
    { name: 'Multi-Select',          run: testMultiSelect },
    { name: 'Dependency Rules',      run: testDependencyRules },
    { name: 'Exclusion Rules',       run: testExclusionRules },
    { name: 'Warning Rules',         run: testWarningRules },
    { name: 'Completion Percentage', run: testCompletionPercentage },
    { name: 'SKU Preview',           run: testSkuPreview },
    { name: 'computeSummary',        run: testComputeSummary },
  ];

  const results = [];
  let totalPass = 0;
  let totalFail = 0;

  suites.forEach(suite => {
    let cases;
    try {
      cases = suite.run();
    } catch (err) {
      results.push({ suite: suite.name, error: err.message, cases: [] });
      totalFail++;
      return;
    }
    const pass = cases.filter(c => c.pass).length;
    const fail = cases.filter(c => !c.pass).length;
    totalPass += pass;
    totalFail += fail;
    results.push({ suite: suite.name, pass, fail, cases });
  });

  // Console output
  console.group('[EngineTests] Results');
  results.forEach(r => {
    if (r.error) {
      console.error(`  ✕ ${r.suite} — CRASHED: ${r.error}`);
      return;
    }
    const icon = r.fail === 0 ? '✓' : '✕';
    console[r.fail > 0 ? 'warn' : 'log'](`  ${icon} ${r.suite} — ${r.pass}/${r.pass + r.fail} passed`);
    r.cases.filter(c => !c.pass).forEach(c => {
      console.warn(`      FAIL: ${c.label}`, c.actual !== undefined ? `got ${JSON.stringify(c.actual)}, expected ${JSON.stringify(c.expected)}` : '');
    });
  });
  console.log(`\n  Total: ${totalPass} passed, ${totalFail} failed`);
  console.groupEnd();

  return { totalPass, totalFail, results };
}