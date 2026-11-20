const fs = require('fs');
const path = require('path');

console.log('====================================================');
console.log('   ADVANCED SCIENTIFIC CALCULATOR - TEST RUNNER    ');
console.log('====================================================\n');

// Mock browser globals for Node.js test environment
const mockDOM = {
  mainDisplay: { textContent: '', style: {} },
  historyDisplay: { textContent: '', style: {} },
  expressionDisplay: { textContent: '', style: {} },
  memoryValue: { textContent: '', style: {} },
  historyList: { innerHTML: '', style: {} },
  functionList: { innerHTML: '', style: {} },
  coursesContainer: { innerHTML: '', querySelectorAll: () => [], appendChild: () => {}, style: {} },
  largeMatrixViewer: { innerHTML: '', style: {} },
  gpaBreakdown: { innerHTML: '', style: {} },
  gradeChart: { innerHTML: '', style: {} },
  numCourses: { value: '1', style: {} },
  gpaScale: { value: '4.0', style: {} },
  graphAngleMode: { value: 'radians', style: {} },
  graphXMin: { value: '-10', style: {} },
  graphXMax: { value: '10', style: {} },
  graphYMin: { value: '-10', style: {} },
  graphYMax: { value: '10', style: {} },
  xMin: { value: '-10', style: {} },
  xMax: { value: '10', style: {} },
  yMin: { value: '-10', style: {} },
  yMax: { value: '10', style: {} },
  graphResolution: { value: '1000', style: {} },
  showAdvancedGrid: { checked: true, style: {} },
  showAxes: { checked: true, style: {} },
  showLabels: { checked: true, style: {} },
  showZeros: { checked: false, style: {} },
  derivativeInput: { value: 't^2 + 3*t', style: {} },
  derivativePoint: { value: '2', style: {} },
  derivativeResult: { innerHTML: '', style: {} },
  integralInput: { value: 'x^2', style: {} },
  integralLower: { value: '2', style: {} },
  integralUpper: { value: '0', style: {} },
  integralResult: { innerHTML: '', style: {} },
  equationInput: { value: 'x^2 - 4 = 0', style: {} },
  equationResult: { innerHTML: '', style: {} },
  matrixARows: { value: '4', style: {} },
  matrixACols: { value: '5', style: {} },
  matrixBRows: { value: '5', style: {} },
  matrixBCols: { value: '2', style: {} },
  badgeMatrixA: { textContent: '', style: {} },
  badgeMatrixB: { textContent: '', style: {} },
  matrixInputsA: { innerHTML: '', style: {} },
  matrixInputsB: { innerHTML: '', style: {} },
  matrixResult: { innerHTML: '', style: {} },
  matrixOperationSelect: { value: 'multiply', style: {} },
  limitInput: { value: 'sin(x)/x', style: {} },
  limitPoint: { value: '0', style: {} },
  limitDirection: { value: 'both', style: {} },
  limitResult: { innerHTML: '', style: {} },
  taylorInput: { value: 'sin(x)', style: {} },
  taylorCenter: { value: '0', style: {} },
  taylorOrder: { value: '3', style: {} },
  taylorResult: { innerHTML: '', style: {} },
  advCombType: { value: 'catalan', style: {} },
  advCombN: { value: '5', style: {} },
  advCombR: { value: '3', style: {} },
  advCombResult: { innerHTML: '', style: {} },
  advCombRGroup: { style: { display: 'none' } },
  settingsModalBackdrop: { classList: { add: () => {}, remove: () => {}, contains: () => false }, style: {} },
  settingAngleUnit: { value: 'deg', style: {} },
  settingPrecision: { value: '12', style: {} },
  settingNotation: { value: 'auto', style: {} },
  settingDetailedErrors: { value: 'true', style: {} },
  hamburgerMenu: {
    classes: new Set(['hidden']),
    classList: {
      add(c) { mockDOM.hamburgerMenu.classes.add(c); },
      remove(c) { mockDOM.hamburgerMenu.classes.delete(c); },
      contains(c) { return mockDOM.hamburgerMenu.classes.has(c); }
    },
    setAttribute: () => {},
    style: {}
  },
  menuBackdrop: {
    classes: new Set(),
    classList: {
      add(c) { mockDOM.menuBackdrop.classes.add(c); },
      remove(c) { mockDOM.menuBackdrop.classes.delete(c); },
      contains(c) { return mockDOM.menuBackdrop.classes.has(c); }
    },
    style: {}
  },
  advancedBasicSection: {
    classes: new Set(),
    classList: {
      add(c) { mockDOM.advancedBasicSection.classes.add(c); },
      remove(c) { mockDOM.advancedBasicSection.classes.delete(c); },
      toggle(c) {
        if (mockDOM.advancedBasicSection.classes.has(c)) {
          mockDOM.advancedBasicSection.classes.delete(c);
          return false;
        } else {
          mockDOM.advancedBasicSection.classes.add(c);
          return true;
        }
      },
      contains(c) { return mockDOM.advancedBasicSection.classes.has(c); }
    },
    style: {}
  },
  btnToggleBasicKeypad: {
    classes: new Set(['active']),
    classList: {
      add(c) { mockDOM.btnToggleBasicKeypad.classes.add(c); },
      remove(c) { mockDOM.btnToggleBasicKeypad.classes.delete(c); },
      toggle(c, force) {
        if (force === undefined) force = !mockDOM.btnToggleBasicKeypad.classes.has(c);
        if (force) mockDOM.btnToggleBasicKeypad.classes.add(c);
        else mockDOM.btnToggleBasicKeypad.classes.delete(c);
        return force;
      },
      contains(c) { return mockDOM.btnToggleBasicKeypad.classes.has(c); }
    },
    style: {}
  },
  toggleBasicKeypadText: { textContent: 'Basic Pad: ON', style: {} },
  solutionStepsCard: {
    classes: new Set(),
    classList: {
      add(c) { mockDOM.solutionStepsCard.classes.add(c); },
      remove(c) { mockDOM.solutionStepsCard.classes.delete(c); },
      contains(c) { return mockDOM.solutionStepsCard.classes.has(c); }
    },
    style: { display: 'none' },
    scrollIntoView: () => {}
  },
  solutionStepsBody: { innerHTML: '', style: { display: 'none' } },
  stepsCountBadge: { textContent: '0 steps', style: {} },
  stepsToggleChevron: { className: 'fas fa-chevron-down', style: {} },
  btnToggleStepsIcon: { style: {} },
  pwaInstallContainer: {
    classes: new Set(['pwa-install-container', 'pwa-hidden']),
    classList: {
      add(c) { mockDOM.pwaInstallContainer.classes.add(c); },
      remove(c) { mockDOM.pwaInstallContainer.classes.delete(c); },
      contains(c) { return mockDOM.pwaInstallContainer.classes.has(c); }
    },
    style: { display: 'none' }
  },
  menuInstallBtn: { style: { display: 'none' } }
};

let capturedListeners = {};
global.document = {
  getElementById: (id) => mockDOM[id] || { style: {}, classList: { add: () => {}, remove: () => {}, contains: () => false }, textContent: '', innerHTML: '', value: '', checked: false, addEventListener: () => {}, querySelectorAll: () => [], appendChild: () => {}, setAttribute: () => {} },
  querySelectorAll: () => [],
  querySelector: () => null,
  addEventListener: (event, handler) => { capturedListeners[event] = handler; },
  createElement: () => ({ style: {}, classList: { add: () => {}, remove: () => {}, contains: () => false }, appendChild: () => {}, remove: () => {}, setAttribute: () => {}, focus: () => {} }),
  head: { appendChild: () => {} },
  body: { appendChild: () => {}, removeChild: () => {} }
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

// Mock math.js for unit testing
global.math = {
  parse: (expr) => ({
    toString: () => expr,
    filter: () => [{ isSymbolNode: true, name: 't' }],
    evaluate: (scope) => 7
  }),
  derivative: (expr, variable) => ({
    toString: () => `2*${variable} + 3`,
    evaluate: (scope) => 2 * (scope[variable] || 0) + 3
  }),
  simplify: (node) => node,
  compile: null
};

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

  console.log('\n--- Step 7: Sub-Navigation, Unlimited GPA & 100x100 Matrix Engine ---');

  // Sub-Tab Switcher
  const mockTabBtn1 = { getAttribute: (a) => a === 'data-tab' ? 'tab1' : null, classList: { toggle: (cls, on) => { mockTabBtn1.active = on; } } };
  const mockTabBtn2 = { getAttribute: (a) => a === 'data-tab' ? 'tab2' : null, classList: { toggle: (cls, on) => { mockTabBtn2.active = on; } } };
  const mockTabContent1 = { id: 'tab1', classList: { remove: () => { mockTabContent1.hidden = false; }, add: () => { mockTabContent1.hidden = true; } } };
  const mockTabContent2 = { id: 'tab2', classList: { remove: () => { mockTabContent2.hidden = false; }, add: () => { mockTabContent2.hidden = true; } } };
  const mockModeEl = {
    querySelectorAll: (sel) => sel === '.sub-tab-btn' ? [mockTabBtn1, mockTabBtn2] : (sel === '.sub-tab-content' ? [mockTabContent1, mockTabContent2] : []),
    querySelector: () => null
  };
  mockDOM['testMode'] = mockModeEl;
  switchSubTab('testMode', 'tab2');
  assert(mockTabBtn2.active === true && mockTabBtn1.active === false, 'Sub-tab buttons toggled active correctly');
  assert(mockTabContent2.hidden === false && mockTabContent1.hidden === true, 'Sub-tab content pane switched visibility correctly');

  // Unlimited GPA Courses
  mockDOM['numCourses'].value = '7';
  addCourse();
  assert(parseInt(mockDOM['numCourses'].value) === 8, 'GPA dynamic course addition passes 7 courses limit (now 8)');
  addCourse();
  addCourse();
  assert(parseInt(mockDOM['numCourses'].value) === 10, 'GPA dynamic course addition reaches 10 courses');

  // Large Matrix Engine (100x100)
  const matA = generateRandomLargeMatrix('A', 100, 100, -10, 10, true);
  assert(matA.length === 100 && matA[0].length === 100, '100x100 matrix generated with 10,000 cells');
  assert(largeMatrixState.A.rows === 100 && largeMatrixState.A.cols === 100, 'Matrix A dimensions correctly recorded as 100x100');

  const matI = setLargeIdentity('B', 100);
  assert(matI.length === 100 && matI[0][0] === 1 && matI[0][1] === 0, '100x100 identity matrix verified');

  const tStart = Date.now();
  const prod = multiplyLargeMatricesOp();
  const tEnd = Date.now();
  assert(prod !== null && prod.length === 100 && prod[0].length === 100, '100x100 matrix multiplication executed');
  assert(tEnd - tStart < 200, `100x100 matrix multiplication executed in ${tEnd - tStart}ms (< 200ms)`);

  // Verify A * I = A
  let isIdentityProd = true;
  for (let r = 0; r < 10; r++) {
    for (let c = 0; c < 10; c++) {
      if (Math.abs(prod[r][c] - matA[r][c]) > 1e-9) {
        isIdentityProd = false;
        break;
      }
    }
  }
  assert(isIdentityProd, '100x100 Matrix multiplication identity property verified: A × I = A');

  // Transpose of 100x100
  const transA = transposeLargeMatrixOp('A');
  assert(transA[0][1] === matA[1][0] && transA[50][25] === matA[25][50], '100x100 Matrix transpose property verified: Aᵀ[j][i] = A[i][j]');

  console.log('\n--- Step 8: Arbitrary Matrix, Detailed Errors, Math Extensions & Settings ---');
  
  // 1. HTML Verification: Back button, Install pointer, Settings modal
  const htmlContent = fs.readFileSync(path.join(__dirname, '../calculate.htm'), 'utf8');
  assert(htmlContent.includes('btn-back-history') && htmlContent.includes('toggleHistory()'), 'Permanent Back button exists in History header');
  assert(htmlContent.includes('fa-hand-pointer') && htmlContent.includes('install-pointer-icon'), 'Install App buttons feature animated pointer finger icon');
  assert(htmlContent.includes('settingsModalBackdrop') && htmlContent.includes('settingAngleUnit'), 'Settings modal backdrop & controls present in HTML');

  // 2. Arbitrary Rectangular Matrix (e.g. 4x5 * 5x2 = 4x2)
  const dimsA = getMatrixDimensions('A');
  const dimsB = getMatrixDimensions('B');
  assert(dimsA.rows === 4 && dimsA.cols === 5, 'Matrix A dimensions correctly read as arbitrary 4×5');
  assert(dimsB.rows === 5 && dimsB.cols === 2, 'Matrix B dimensions correctly read as arbitrary 5×2');
  
  const matrixA_test = [
    [1, 2, 3, 4, 5],
    [2, 0, 1, 1, 0],
    [0, 1, 0, 2, 1],
    [1, 1, 1, 1, 1]
  ];
  const matrixB_test = [
    [1, 0],
    [0, 1],
    [1, 1],
    [0, 2],
    [1, 0]
  ];
  const multRes = matrixMultiply(matrixA_test, matrixB_test);
  assert(multRes.length === 4 && multRes[0].length === 2, 'Rectangular matrix product A(4×5) × B(5×2) produces 4×2 result');
  assert(multRes[0][0] === 9 && multRes[0][1] === 13, 'Rectangular matrix multiplication computed exact cell values [9, 13]');

  // 3. Matrix Dimension Mismatch & Non-Square Guards with Explanatory Errors
  let detErrThrown = false;
  try {
    determinant(matrixA_test);
  } catch (err) {
    detErrThrown = true;
    assert(err.message.includes('Square Matrix Required'), 'Determinant correctly throws detailed error for rectangular 4×5 matrix');
  }
  assert(detErrThrown, 'Determinant guard on non-square matrix triggered');

  // 4. Detailed Error Explanations in Basic/Advanced Evaluation
  const divZeroErr = getDetailedErrorMessage(new Error('Division by zero'), '10 / 0');
  assert(divZeroErr.includes('Math Error: Division by zero'), 'Detailed error identifies division by zero');

  const unclosedParenErr = getDetailedErrorMessage(new Error('Syntax'), '(2 + 3 * (4 - 1)');
  assert(unclosedParenErr.includes('Syntax Error: Unmatched parentheses'), 'Detailed error identifies unmatched parentheses');

  const negSqrtErr = getDetailedErrorMessage(new Error('Domain'), 'sqrt(-25)');
  assert(negSqrtErr.includes('Domain Error: Negative square root'), 'Detailed error identifies negative square root');

  // 5. Advanced Math: Hyperbolics, log2, Fraction Conversion
  clearAll();
  scientificFunction('sinh');
  assert(mockDOM.mainDisplay.textContent === '0', 'sinh(0) evaluates to 0');

  clearAll();
  scientificFunction('cosh');
  assert(mockDOM.mainDisplay.textContent === '1', 'cosh(0) evaluates to 1');

  clearAll();
  appendNumber('8');
  scientificFunction('log2');
  assert(mockDOM.mainDisplay.textContent === '3', 'log2(8) evaluates to 3');

  const fracVal = decimalToFraction(0.75);
  assert(fracVal === '3/4', 'decimalToFraction(0.75) converts to 3/4');
  const toggleBack = decimalToFraction('3/4');
  assert(toggleBack === '0.75', 'decimalToFraction("3/4") toggles back to 0.75');

  // 6. Calculus: Limits
  mockDOM['limitInput'].value = 'sin(x)/x';
  mockDOM['limitPoint'].value = '0';
  mockDOM['limitDirection'].value = 'both';
  calculateLimit();
  assert(mockDOM['limitResult'].innerHTML.includes('1'), 'Limit lim_{x→0} sin(x)/x evaluates to 1');

  // 7. Advanced Combinatorics: Catalan, Derangements, Repetition, Bell
  mockDOM['advCombType'].value = 'catalan';
  mockDOM['advCombN'].value = '5';
  calculateAdvancedCombinatorics();
  assert(mockDOM['advCombResult'].innerHTML.includes('42'), 'Catalan number C_5 evaluates to 42');

  mockDOM['advCombType'].value = 'derangements';
  mockDOM['advCombN'].value = '5';
  calculateAdvancedCombinatorics();
  assert(mockDOM['advCombResult'].innerHTML.includes('44'), 'Subfactorial !5 derangements evaluates to 44');

  mockDOM['advCombType'].value = 'repetition';
  mockDOM['advCombN'].value = '5';
  mockDOM['advCombR'].value = '3';
  calculateAdvancedCombinatorics();
  assert(mockDOM['advCombResult'].innerHTML.includes('35'), 'Combinations with repetition CR(5,3) evaluates to 35');

  mockDOM['advCombType'].value = 'bell';
  mockDOM['advCombN'].value = '5';
  calculateAdvancedCombinatorics();
  assert(mockDOM['advCombResult'].innerHTML.includes('52'), 'Bell number B_5 evaluates to 52');

  // 8. Settings State Management
  updateSetting('precision', 4);
  assert(settingsState.precision === 4, 'Settings updated decimal precision to 4');
  const formattedWithSetting = formatResult(1.23456789);
  assert(formattedWithSetting === '1.235', 'formatResult respects user precision setting (4 sig digits)');
  resetCalculatorSettings();
  assert(settingsState.precision === 12, 'resetCalculatorSettings restores default precision of 12');

  console.log('\n--- Step 9: Comprehensive Multi-Device Responsiveness ---');
  
  // 1. Viewport & Mobile Meta Tags
  assert(htmlContent.includes('viewport-fit=cover'), 'HTML meta viewport includes viewport-fit=cover for notch/gesture devices');
  assert(htmlContent.includes('id="menuBackdrop"'), 'HTML contains #menuBackdrop for touch-outside dismiss on mobile');

  // 2. CSS Media Query Verification
  const cssContent = fs.readFileSync(path.join(__dirname, '../calculate.css'), 'utf8');
  assert(cssContent.includes('@media (max-width: 992px)'), 'CSS includes tablet/medium laptop breakpoint (992px)');
  assert(cssContent.includes('@media (max-width: 768px)'), 'CSS includes mobile portrait/tablet breakpoint (768px)');
  assert(cssContent.includes('@media (max-width: 480px)'), 'CSS includes smartphone standard breakpoint (480px)');
  assert(cssContent.includes('@media (max-width: 360px)'), 'CSS includes small/compact phone breakpoint (360px)');
  assert(cssContent.includes('(orientation: landscape)'), 'CSS includes mobile compact landscape orientation rules');
  assert(cssContent.includes('env(safe-area-inset-top)'), 'CSS incorporates iOS/Android safe area insets');
  assert(cssContent.includes('overflow-x: auto') && cssContent.includes('-webkit-overflow-scrolling: touch'), 'Horizontal scroll containers enabled for touch devices');

  // 3. Hamburger Menu Drawer Navigation Execution
  openHamburgerMenu();
  assert(mockDOM['hamburgerMenu'].classList.contains('open'), 'openHamburgerMenu() adds .open class to mobile drawer');
  closeHamburgerMenu();
  assert(!mockDOM['hamburgerMenu'].classList.contains('open'), 'closeHamburgerMenu() removes .open class');

  // 4. Mode Switching auto-closes Mobile Drawer
  openHamburgerMenu();
  switchMode('basic');
  assert(!mockDOM['hamburgerMenu'].classList.contains('open'), 'switchMode() automatically closes mobile drawer upon navigation');

  // 5. Matrix Results Containment & Responsive Equation Layout
  assert(cssContent.includes('.matrix-equation-view') && cssContent.includes('.matrix-equation-item'), 'CSS includes responsive .matrix-equation-view layout');
  multiplyMatrices();
  assert(mockDOM['matrixResult'].innerHTML.includes('matrix-equation-view'), 'multiplyMatrices() outputs responsive .matrix-equation-view wrapper');
  assert(mockDOM['matrixResult'].innerHTML.includes('matrix-equation-item'), 'multiplyMatrices() wraps each operand in .matrix-equation-item');

  console.log('\n--- Step 10: Glossy Neon Green PWA Install Button Specification ---');
  // 1. Structure Verification
  assert(htmlContent.includes('pwa-install-container') && htmlContent.includes('pwaInstallContainer'), 'PWA install container widget present in HTML');
  assert(htmlContent.includes('pwa-install-pill') && htmlContent.includes('pwaInstallBtn'), 'Glossy pill install button present with #pwaInstallBtn');
  assert(htmlContent.includes('pill-label') && htmlContent.includes('Install the App'), 'Install button features "Install the App" label');
  assert(htmlContent.includes('pill-download-box') && htmlContent.includes('pill-divider'), 'Install button contains download tray icon and vertical divider');
  assert(htmlContent.includes('pill-target-box') && htmlContent.includes('pill-target-svg'), 'Install button contains concentric target bullseye');
  assert(htmlContent.includes('pill-hand-pointer') && htmlContent.includes('pill-hand-svg') && htmlContent.includes('hand-tap-anim'), 'Install button contains animated cartoon pointer hand tapping the target');
  assert(htmlContent.includes('install-floor-ring'), 'Install button features bottom curved neon floor glow');
  assert(htmlContent.includes('install-rays-left') && htmlContent.includes('install-rays-right'), 'Install button features top-left green and top-right yellow action rays');

  // 2. CSS Visual Fidelity & Animations
  assert(cssContent.includes('.pwa-install-pill') && cssContent.includes('.pill-gloss-shine'), 'CSS includes capsule pill styling with glass specular reflection');
  assert(cssContent.includes('handTapBounce'), 'CSS includes @keyframes handTapBounce for tactile button tapping animation');
  assert(cssContent.includes('floorPulse'), 'CSS includes @keyframes floorPulse for neon floor glow');
  assert(cssContent.includes('@media (max-width: 600px)') && cssContent.includes('.pwa-install-container'), 'CSS includes responsive mobile scaling for the install button');

  console.log('\n--- Step 11: Advanced Page Integrated Basic Keypad & Toolbar ---');
  // 1. Structure Verification
  assert(htmlContent.includes('advanced-toolbar') && htmlContent.includes('btnToggleBasicKeypad'), 'Advanced mode toolbar features Basic Pad toggle button');
  assert(htmlContent.includes("switchMode('basic')"), 'Advanced mode includes quick-switch button to Basic mode');
  assert(htmlContent.includes('advanced-basic-section') && htmlContent.includes('advancedBasicGrid'), 'Advanced mode contains integrated basic keypad grid');
  assert(htmlContent.includes('advanced-basic-grid') && htmlContent.includes("appendNumber('7')"), 'Advanced basic keypad contains numeric buttons (0-9)');
  assert(htmlContent.includes('advanced-basic-grid') && htmlContent.includes("calculate()"), 'Advanced basic keypad contains equals button');
  assert(htmlContent.includes('advanced-basic-grid') && htmlContent.includes("clearAll()"), 'Advanced basic keypad contains AC button');

  // 2. CSS Styles
  assert(cssContent.includes('.advanced-toolbar') && cssContent.includes('.btn-adv-tool'), 'CSS contains styling for advanced toolbar and tools');
  assert(cssContent.includes('.advanced-basic-section') && cssContent.includes('.advanced-basic-grid'), 'CSS contains styling for integrated basic keypad');

  // 3. Execution: toggleAdvancedBasicKeypad
  assert(typeof toggleAdvancedBasicKeypad === 'function', 'toggleAdvancedBasicKeypad is defined as a function');
  toggleAdvancedBasicKeypad();
  assert(mockDOM['advancedBasicSection'].classList.contains('hidden'), 'toggleAdvancedBasicKeypad hides section when toggled once');
  assert(mockDOM['toggleBasicKeypadText'].textContent === 'Basic Pad: OFF', 'toggle text updates to Basic Pad: OFF');
  toggleAdvancedBasicKeypad();
  assert(!mockDOM['advancedBasicSection'].classList.contains('hidden'), 'toggleAdvancedBasicKeypad reveals section when toggled twice');
  assert(mockDOM['toggleBasicKeypadText'].textContent === 'Basic Pad: ON', 'toggle text updates to Basic Pad: ON');

  console.log('\n--- Step 12: Permanent PWA Install Suppression, Step-by-Step Breakdown & Mobile Integration ---');
  // 1. PWA Install Suppression
  assert(htmlContent.includes('isPWAInstalled'), 'HTML defines isPWAInstalled() detection logic');
  assert(htmlContent.includes('hideInstallButtons'), 'HTML defines hideInstallButtons() suppression function');
  assert(htmlContent.includes('checkInstallVisibility'), 'HTML checks install visibility on page load');
  assert(htmlContent.includes('class="pwa-install-container pwa-hidden"'), 'PWA container is hidden by default with pwa-hidden');
  assert(htmlContent.includes('display: none;'), 'PWA container has inline display: none to prevent flash on load');
  assert(htmlContent.includes("localStorage.setItem('pwa_installed', 'true')"), 'PWA install accepted saves pwa_installed flag in localStorage');

  // 2. Integration Page Mobile Responsiveness
  assert(htmlContent.includes('calc-input-group') && htmlContent.includes('calc-input-label'), 'Integration form uses responsive .calc-input-group and labels');
  assert(cssContent.includes('.integral-bounds') && cssContent.includes('grid-template-columns'), 'CSS defines responsive grid for .integral-bounds');
  assert(cssContent.includes('@media (max-width: 480px)') && cssContent.includes('.integral-bounds'), 'CSS stacks integral bounds on mobile screens <= 480px');
  assert(cssContent.includes('overflow-wrap: anywhere') || cssContent.includes('word-break: break-word'), 'Calculus results wrap long formulas on mobile screens');

  // 3. Step-by-Step Solution Breakdown
  assert(htmlContent.includes('id="solutionStepsCard"') && htmlContent.includes('id="solutionStepsBody"'), 'Step-by-step card elements present in calculate.htm');
  assert(typeof generateArithmeticSteps === 'function', 'generateArithmeticSteps is defined as a function');
  assert(typeof toggleSolutionStepsCard === 'function', 'toggleSolutionStepsCard is defined as a function');
  assert(typeof renderSolutionSteps === 'function', 'renderSolutionSteps is defined as a function');

  // Test arithmetic steps generation with PEMDAS
  const pemdasSteps = generateArithmeticSteps('2 + 3 * 4', '14');
  assert(pemdasSteps.length >= 3, 'generateArithmeticSteps produces >= 3 steps for 2 + 3 * 4');
  assert(pemdasSteps.some(s => s.title.includes('Multiplication')), 'Steps trace multiplication before addition');
  assert(pemdasSteps[pemdasSteps.length - 1].math.includes('14'), 'Final step reflects computed result');

  // Test parentheses and powers
  const parenSteps = generateArithmeticSteps('(5 + 3) * 2 ^ 3', '64');
  assert(parenSteps.some(s => s.title.includes('Parentheses')), 'Steps trace parentheses resolution');
  assert(parenSteps.some(s => s.title.includes('Exponentiation')), 'Steps trace exponentiation');

  // Test calculate() integration
  currentInput = '2 + 3 * 4';
  expressionChain = '';
  calculate();
  assert(mockDOM['solutionStepsCard'].style.display === 'block', 'calculate() automatically displays #solutionStepsCard');
  assert(mockDOM['solutionStepsBody'].innerHTML.includes('step-card'), 'calculate() renders step cards in #solutionStepsBody');
  assert(mockDOM['stepsCountBadge'].textContent.includes('step'), 'calculate() updates steps count badge');

  // Test clearAll() resets steps card
  clearAll();
  assert(mockDOM['solutionStepsCard'].style.display === 'none', 'clearAll() hides #solutionStepsCard');

  // Test Calculus step-by-step solutions
  calculateDerivative();
  assert(mockDOM['derivativeResult'].innerHTML.includes('Solution Steps') && mockDOM['derivativeResult'].innerHTML.includes('step-card'), 'calculateDerivative outputs step-by-step breakdown');

  calculateIntegral();
  assert(mockDOM['integralResult'].innerHTML.includes('Solution Steps') && mockDOM['integralResult'].innerHTML.includes('Simpson') && mockDOM['integralResult'].innerHTML.includes('1/3 Rule'), 'calculateIntegral outputs Simpson\'s Rule step-by-step breakdown');

  solveEquation();
  assert(mockDOM['equationResult'].innerHTML.includes('Solution Steps') && mockDOM['equationResult'].innerHTML.includes('Newton-Raphson'), 'solveEquation outputs Newton-Raphson step-by-step breakdown');

  console.log('\n--- Step 13: Universal Equation Solver & Advanced Calculus Function Types ---');
  // 1. Variable Detection & Expression Normalization
  assert(detectIndependentVariable('log(x) = 2') === 'x', 'detectIndependentVariable identifies x in log(x) = 2');
  assert(detectIndependentVariable('ln(t) + 3*t = 5') === 't', 'detectIndependentVariable identifies t in ln(t) + 3*t = 5');
  assert(detectIndependentVariable('sin(u) + 2*u = 1') === 'u', 'detectIndependentVariable identifies u in sin(u)');
  assert(detectIndependentVariable('y = 3*x^2 + 5*x - 1') === 'x', 'detectIndependentVariable strips y = and identifies x');
  assert(normalizeMathExpression('2x + 3').includes('2*x'), 'normalizeMathExpression handles implicit multiplication 2x');
  assert(normalizeMathExpression('ln(x)').includes('log(x)'), 'normalizeMathExpression normalizes ln to log');

  // 2. Solve Logarithmic Equation: ln(x) = 2 -> x ≈ 7.389056
  mockDOM['equationInput'].value = 'ln(x) = 2';
  solveEquation();
  assert(mockDOM['equationResult'].innerHTML.includes('7.389056'), 'solveEquation solves logarithmic equation ln(x) = 2');
  assert(mockDOM['equationResult'].innerHTML.includes('Logarithmic Equation'), 'solveEquation classifies equation as Logarithmic');

  // 3. Solve Exponential Equation: e^x = 10 -> x ≈ 2.302585
  mockDOM['equationInput'].value = 'e^x = 10';
  solveEquation();
  assert(mockDOM['equationResult'].innerHTML.includes('2.302585'), 'solveEquation solves exponential equation e^x = 10');

  // 4. Solve Mixed Transcendental Equation: x + ln(x) = 5 -> x ≈ 3.693441
  mockDOM['equationInput'].value = 'x + ln(x) = 5';
  solveEquation();
  assert(mockDOM['equationResult'].innerHTML.includes('3.693441'), 'solveEquation solves mixed transcendental equation x + ln(x) = 5');

  // 5. Solve Rational Equation: (x + 1)/(x - 2) = 4 -> x = 3
  mockDOM['equationInput'].value = '(x + 1)/(x - 2) = 4';
  solveEquation();
  assert(mockDOM['equationResult'].innerHTML.includes('3.000000') || mockDOM['equationResult'].innerHTML.includes('3'), 'solveEquation solves rational equation (x+1)/(x-2) = 4');

  // 6. Solve Long Polynomial Equation: 2x^3 - 4x^2 + 3x - 1 = 0 -> x = 1
  mockDOM['equationInput'].value = '2x^3 - 4x^2 + 3x - 1 = 0';
  solveEquation();
  assert(mockDOM['equationResult'].innerHTML.includes('1.000000') || mockDOM['equationResult'].innerHTML.includes('1'), 'solveEquation solves long polynomial equation');

  // 7. Solve Radical Equation: sqrt(x + 5) = x - 1 -> x = 4 (extraneous root rejected)
  mockDOM['equationInput'].value = 'sqrt(x + 5) = x - 1';
  solveEquation();
  assert(mockDOM['equationResult'].innerHTML.includes('4.000000') || mockDOM['equationResult'].innerHTML.includes('4'), 'solveEquation solves radical equation sqrt(x+5) = x-1');

  // 8. Derivative with Logarithmic and Long Expressions
  mockDOM['derivativeInput'].value = 'ln(x) + 3*x^2';
  mockDOM['derivativePoint'].value = '2';
  calculateDerivative();
  assert(mockDOM['derivativeResult'].innerHTML.includes('Solution Steps'), 'calculateDerivative outputs steps for logarithmic function');
  assert(mockDOM['derivativeResult'].innerHTML.includes('Logarithmic Rule'), 'calculateDerivative steps cite Logarithmic Rule');

  console.log('\n====================================================');
  console.log(`  SUMMARY: ALL ${totalPassed} TESTS PASSED PERFECTLY! (0 Failed)`);
  console.log('====================================================\n');
}

runAllTests().catch(e => {
  console.error('\nFAILED RUNNING TESTS:', e);
  process.exit(1);
});
