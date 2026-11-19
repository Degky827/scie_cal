const fs = require('fs');
const path = require('path');

console.log('====================================================');
console.log('   ADVANCED SCIENTIFIC CALCULATOR - TEST RUNNER    ');
console.log('====================================================\n');

// Mock browser globals for Node.js test environment
const mockDOM = {
  mainDisplay: { textContent: '' },
  historyDisplay: { textContent: '' },
  expressionDisplay: { textContent: '' },
  memoryValue: { textContent: '' },
  historyList: { innerHTML: '' },
  functionList: { innerHTML: '' },
  gpaBreakdown: { innerHTML: '' },
  gradeChart: { innerHTML: '' },
  numCourses: { value: '1' },
  gpaScale: { value: '4.0' },
  graphAngleMode: { value: 'radians' },
  graphXMin: { value: '-10' },
  graphXMax: { value: '10' },
  graphYMin: { value: '-10' },
  graphYMax: { value: '10' },
  xMin: { value: '-10' },
  xMax: { value: '10' },
  yMin: { value: '-10' },
  yMax: { value: '10' },
  graphResolution: { value: '1000' },
  showAdvancedGrid: { checked: true },
  showAxes: { checked: true },
  showLabels: { checked: true },
  showZeros: { checked: false },
  derivativeInput: { value: 't^2 + 3*t' },
  derivativePoint: { value: '2' },
  derivativeResult: { innerHTML: '' },
  integralInput: { value: 'x^2' },
  integralLower: { value: '2' },
  integralUpper: { value: '0' },
  integralResult: { innerHTML: '' },
  equationInput: { value: 'x^2 - 4 = 0' },
  equationResult: { innerHTML: '' }
};

let capturedListeners = {};
global.document = {
  getElementById: (id) => mockDOM[id] || { textContent: '', innerHTML: '', value: '', checked: false, addEventListener: () => {} },
  querySelectorAll: () => [],
  addEventListener: (event, handler) => { capturedListeners[event] = handler; },
  createElement: () => ({ style: {}, appendChild: () => {}, setAttribute: () => {}, focus: () => {} }),
  head: { appendChild: () => {} }
};

global.localStorage = {
  store: {},
  getItem(k) { return this.store[k] || null; },
  setItem(k, v) { this.store[k] = String(v); },
  removeItem(k) { delete this.store[k]; },
  clear() { this.store = {}; }
};

global.window = global;
global.window.devicePixelRatio = 2;

// Load and evaluate calculate.js
const calculateJS = fs.readFileSync(path.join(__dirname, '../calculate.js'), 'utf8');
eval(calculateJS);

let totalPassed = 0;
let totalFailed = 0;

function assert(condition, message) {
  if (condition) {
    totalPassed++;
    console.log(`  ✓ ${message}`);
  } else {
    totalFailed++;
    console.error(`  ✗ FAIL: ${message}`);
    throw new Error(message);
  }
}

async function runAllTests() {
  // --- STEP 1: Core Calculation & Graphing Fixes ---
  console.log('--- Step 1: Core Evaluation & Canvas Fixes ---');
  clearAll();
  appendNumber('9');
  scientificFunction('sqrt');
  assert(mockDOM.mainDisplay.textContent === '3', 'Square root of 9 evaluates to 3');

  scientificFunction('square');
  assert(mockDOM.mainDisplay.textContent === '9', '3 squared evaluates to 9');

  // --- STEP 2: Mathematical Precision & Precedence ---
  console.log('\n--- Step 2: PEMDAS, Precision & Polynomials ---');
  clearAll();
  appendNumber('2');
  appendOperator('+');
  appendNumber('3');
  appendOperator('*');
  appendNumber('4');
  calculate();
  assert(mockDOM.mainDisplay.textContent === '14', 'PEMDAS precedence: 2 + 3 * 4 = 14');

  clearAll();
  appendNumber('0');
  appendNumber('.');
  appendNumber('1');
  appendOperator('+');
  appendNumber('0');
  appendNumber('.');
  appendNumber('2');
  calculate();
  assert(mockDOM.mainDisplay.textContent === '0.3', 'Floating point precision: 0.1 + 0.2 = 0.3');

  const f171 = factorial(171);
  assert(typeof f171 === 'string' && f171.includes('e+309'), 'Factorial 171! does not overflow to Infinity');

  const biquartic = solveQuartic([1, 0, -5, 0, 4]);
  assert(biquartic.length === 4 && biquartic.includes(2) && biquartic.includes(-2), 'Biquadratic roots solved');

  // --- STEP 3: Security & Input Validation ---
  console.log('\n--- Step 3: Security, Sandboxing & XSS Sanitization ---');
  clearAll();
  appendNumber('.');
  appendNumber('.');
  assert(mockDOM.mainDisplay.textContent === '0.', 'Duplicate decimal points rejected');

  assert(isNaN(evaluateArithmetic('alert(1)')), 'Code injection rejected in evaluateArithmetic');
  assert(isNaN(evaluateArithmetic('window.location')), 'Property access rejected in evaluateArithmetic');

  let funcBlocked = false;
  try {
    evaluateFunction('alert(1)', 1);
  } catch (e) {
    funcBlocked = true;
  }
  assert(funcBlocked, 'Arbitrary functions blocked in evaluateFunction');

  const escaped = escapeHTML('<script>alert("xss")</script>');
  assert(escaped.includes('&lt;script&gt;'), 'HTML entities properly escaped');

  // --- STEP 4: Graphing, Responsive Viewports & Touch ---
  console.log('\n--- Step 4: Canvas High-DPI & Asymptote Handling ---');
  let segments = [];
  let lastP = null;
  const mockCtx = {
    canvas: { width: 900, height: 700, getAttribute: (k) => k === 'data-logical-height' ? '700' : '900' },
    beginPath: () => { lastP = null; },
    moveTo: (x, y) => { lastP = { x, y }; },
    lineTo: (x, y) => {
      if (lastP) segments.push({ y1: lastP.y, y2: y });
      lastP = { x, y };
    },
    stroke: () => {},
    setLineDash: () => {}
  };
  drawAdvancedFunction(mockCtx, { expression: 'tan(x)', color: '#6366f1' }, -10, 10, -10, 10, 1000, x => x, y => y);
  const bridges = segments.filter(s => Math.abs(s.y2 - s.y1) > 300);
  assert(bridges.length === 0, 'Vertical asymptotes cleanly disconnected for tan(x)');

  // --- STEP 5: PWA & Manifest ---
  console.log('\n--- Step 5: PWA Offline Caching & Manifest Assets ---');
  const manifest = JSON.parse(fs.readFileSync(path.join(__dirname, '../manifest.json'), 'utf8'));
  assert(manifest.start_url === './calculate.htm', 'PWA start_url points directly to calculate.htm');
  manifest.icons.forEach(ic => {
    assert(fs.existsSync(path.join(__dirname, '../', ic.src)), `Manifest icon ${ic.src} exists on disk`);
  });
  manifest.screenshots.forEach(sc => {
    assert(fs.existsSync(path.join(__dirname, '../', sc.src)), `Manifest screenshot ${sc.src} exists on disk`);
  });

  // --- STEP 6: Scientific Constants, Units & Complex Numbers ---
  console.log('\n--- Step 6: Scientific Constants, Unit Converter & Complex Numbers ---');
  // Constants
  assert(Math.abs(getConstant('c') - 299792458) < 1, 'Speed of light constant c verified');
  assert(Math.abs(getConstant('h') - 6.62607015e-34) < 1e-40, 'Planck constant h verified');
  assert(Math.abs(getConstant('Na') - 6.02214076e23) < 1e15, 'Avogadro constant Na verified');

  // Unit Converter
  assert(Math.abs(convertUnits(1, 'km', 'm') - 1000) < 1e-6, 'Unit conversion 1 km = 1000 m');
  assert(Math.abs(convertUnits(1, 'mi', 'km') - 1.609344) < 1e-5, 'Unit conversion 1 mile = 1.609344 km');
  assert(Math.abs(convertUnits(100, 'C', 'F') - 212) < 1e-6, 'Temperature conversion 100°C = 212°F');
  assert(Math.abs(convertUnits(1, 'kg', 'lb') - 2.20462) < 1e-4, 'Mass conversion 1 kg = 2.20462 lb');
  assert(Math.abs(convertUnits(180, 'deg', 'rad') - Math.PI) < 1e-6, 'Angle conversion 180° = π rad');

  // Complex Numbers
  const z1 = new Complex(2, 3);
  const z2 = new Complex(1, -4);
  const zSum = z1.add(z2);
  assert(zSum.real === 3 && zSum.imag === -1, 'Complex addition: (2+3i) + (1-4i) = 3 - i');

  const zProd = z1.mul(z2); // (2+3i)(1-4i) = 2 - 8i + 3i - 12(-1) = 14 - 5i
  assert(zProd.real === 14 && zProd.imag === -5, 'Complex multiplication: (2+3i) * (1-4i) = 14 - 5i');

  const zAbs = new Complex(3, 4).abs();
  assert(Math.abs(zAbs - 5) < 1e-6, 'Complex magnitude: |3 + 4i| = 5');

  // Vector Operations
  const u = [1, 2, 3];
  const v = [4, 5, 6];
  assert(VectorOps.dot(u, v) === 32, 'Vector dot product [1,2,3] · [4,5,6] = 32');
  const cross = VectorOps.cross(u, v);
  assert(cross[0] === -3 && cross[1] === 6 && cross[2] === -3, 'Vector cross product [1,2,3] × [4,5,6] = [-3, 6, -3]');

  console.log('\n====================================================');
  console.log(`  SUMMARY: ALL ${totalPassed} TESTS PASSED PERFECTLY! (0 Failed)`);
  console.log('====================================================\n');
}

runAllTests().catch(e => {
  console.error('\nFAILED RUNNING TESTS:', e);
  process.exit(1);
});
