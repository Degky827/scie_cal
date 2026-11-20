// Advanced Scientific Calculator JavaScript

let currentInput = '0';
let previousInput = '';
let operation = null;
let expressionChain = '';
let memory = 0;
let angleMode = 'deg'; // 'deg' or 'rad'
let history = [];

// HTML sanitization helper to prevent DOM XSS
function escapeHTML(str) {
    if (str === null || str === undefined) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

// Display elements
const mainDisplay = document.getElementById('mainDisplay');
const historyDisplay = document.getElementById('historyDisplay');
const expressionDisplay = document.getElementById('expressionDisplay');
const memoryValue = document.getElementById('memoryValue');

// Responsive Hamburger Menu Controls
function openHamburgerMenu() {
    const hamburgerMenu = document.getElementById('hamburgerMenu');
    const menuBackdrop = document.getElementById('menuBackdrop');
    if (hamburgerMenu) {
        hamburgerMenu.classList.remove('hidden');
        hamburgerMenu.classList.add('open');
        if (typeof hamburgerMenu.setAttribute === 'function') {
            hamburgerMenu.setAttribute('aria-hidden', 'false');
        }
    }
    if (menuBackdrop) {
        menuBackdrop.classList.add('active');
    }
    if (typeof document.querySelector === 'function') {
        const modeToggle = document.querySelector('.mode-toggle');
        if (modeToggle) modeToggle.style.display = 'none';
    }
}

function closeHamburgerMenu() {
    const hamburgerMenu = document.getElementById('hamburgerMenu');
    const menuBackdrop = document.getElementById('menuBackdrop');
    if (hamburgerMenu) {
        hamburgerMenu.classList.remove('open');
        hamburgerMenu.classList.add('hidden');
        if (typeof hamburgerMenu.setAttribute === 'function') {
            hamburgerMenu.setAttribute('aria-hidden', 'true');
        }
    }
    if (menuBackdrop) {
        menuBackdrop.classList.remove('active');
    }
    if (typeof document.querySelector === 'function') {
        const modeToggle = document.querySelector('.mode-toggle');
        if (modeToggle) {
            modeToggle.style.display = '';
        }
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    loadHistory();
    updateDisplay();
    // Hook up hamburger menu handlers
    const hamburgerBtn = document.getElementById('hamburgerBtn');
    const hamburgerMenu = document.getElementById('hamburgerMenu');
    const closeMenuBtn = document.getElementById('closeMenuBtn');
    const menuInstallBtn = document.getElementById('menuInstallBtn');
    const menuBackdrop = document.getElementById('menuBackdrop');

    if (hamburgerBtn) {
        hamburgerBtn.addEventListener('click', openHamburgerMenu);
    }

    if (closeMenuBtn) {
        closeMenuBtn.addEventListener('click', closeHamburgerMenu);
    }

    if (menuBackdrop) {
        menuBackdrop.addEventListener('click', closeHamburgerMenu);
    }

    // Ensure mode-toggle is hidden whenever the hamburger is visible (responsive fallback)
    function updateNavVisibility() {
        const hamburgerStyles = window.getComputedStyle(hamburgerBtn || document.createElement('div'));
        const modeToggle = document.querySelector('.mode-toggle');
        if (!modeToggle) return;
        if (hamburgerStyles && hamburgerStyles.display !== 'none') {
            modeToggle.style.display = 'none';
        } else {
            modeToggle.style.display = '';
        }
    }

    window.addEventListener('resize', updateNavVisibility);
    // initial call
    updateNavVisibility();

    // Install via menu uses the same install button created in HTML
    if (menuInstallBtn) {
        menuInstallBtn.addEventListener('click', () => {
            // Try to trigger the install button if available, else show prompt
            const installBtn = document.querySelector('.install-button');
            if (installBtn) installBtn.click();
        });
    }
});

// Mode switching
document.querySelectorAll('.mode-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
        const mode = e.target.dataset.mode;
        switchMode(mode);
    });
});

function switchMode(mode) {
    closeHamburgerMenu();
    document.querySelectorAll('.mode-btn').forEach(btn => btn.classList.remove('active'));
    const targetBtn = document.querySelector(`[data-mode="${mode}"]`);
    if (targetBtn) targetBtn.classList.add('active');
    
    document.getElementById('basicMode').classList.add('hidden');
    document.getElementById('advancedMode').classList.add('hidden');
    document.getElementById('calculusMode').classList.add('hidden');
    document.getElementById('polynomialMode').classList.add('hidden');
    document.getElementById('grapherMode').classList.add('hidden');
    document.getElementById('combinatoricsMode').classList.add('hidden');
    document.getElementById('matrixMode').classList.add('hidden');
    document.getElementById('gpaMode').classList.add('hidden');
    
    if (mode === 'basic') {
        document.getElementById('basicMode').classList.remove('hidden');
    } else if (mode === 'advanced') {
        document.getElementById('advancedMode').classList.remove('hidden');
    } else if (mode === 'calculus') {
        document.getElementById('calculusMode').classList.remove('hidden');
    } else if (mode === 'polynomial') {
        document.getElementById('polynomialMode').classList.remove('hidden');
        initializePolynomialSolver();
    } else if (mode === 'grapher') {
        document.getElementById('grapherMode').classList.remove('hidden');
        initializeAdvancedGrapher();
    } else if (mode === 'combinatorics') {
        document.getElementById('combinatoricsMode').classList.remove('hidden');
    } else if (mode === 'matrix') {
        document.getElementById('matrixMode').classList.remove('hidden');
        initializeMatrixInputs();
    } else if (mode === 'gpa') {
        document.getElementById('gpaMode').classList.remove('hidden');
        initializeGPACalculator();
    }
}

// Toggle Basic Keypad inside Advanced Mode
function toggleAdvancedBasicKeypad() {
    const sec = document.getElementById('advancedBasicSection');
    const btn = document.getElementById('btnToggleBasicKeypad');
    const text = document.getElementById('toggleBasicKeypadText');
    if (!sec) return;
    const isHidden = sec.classList.toggle('hidden');
    if (btn) btn.classList.toggle('active', !isHidden);
    if (text) text.textContent = isHidden ? 'Basic Pad: OFF' : 'Basic Pad: ON';
}

// Universal Sub-Tab Switcher for uncluttered navigation
function switchSubTab(modeId, tabId) {
    const modeEl = document.getElementById(modeId);
    if (!modeEl) return;
    
    // Update sub-tab buttons
    const btns = modeEl.querySelectorAll('.sub-tab-btn');
    btns.forEach(btn => {
        const isMatch = btn.getAttribute('data-tab') === tabId;
        btn.classList.toggle('active', isMatch);
    });
    
    // Update dropdown selector if present
    const selector = modeEl.querySelector('.sub-tab-selector');
    if (selector && selector.value !== tabId) {
        selector.value = tabId;
    }
    
    // Update content panes
    const contents = modeEl.querySelectorAll('.sub-tab-content');
    contents.forEach(content => {
        if (content.id === tabId) {
            content.classList.remove('hidden');
        } else {
            content.classList.add('hidden');
        }
    });
}

// Display & Helper functions
function isErrorState(val) {
    if (typeof val !== 'string') return false;
    return val === 'Error' || val.startsWith('Error') || val.includes('Error');
}

// Convert between decimal and fraction (e.g. 0.75 <-> 3/4)
function decimalToFraction(val, maxDenominator = 1000000, tolerance = 1e-9) {
    if (typeof val === 'string' && val.includes('/')) {
        const parts = val.split('/');
        if (parts.length === 2) {
            const num = parseFloat(parts[0]);
            const den = parseFloat(parts[1]);
            if (den !== 0) return (num / den).toString();
        }
    }
    const numVal = parseFloat(val);
    if (isNaN(numVal)) return val;
    if (Number.isInteger(numVal)) return numVal.toString();
    
    const sign = numVal < 0 ? -1 : 1;
    let x = Math.abs(numVal);
    let h1 = 1, h2 = 0, k1 = 0, k2 = 1;
    let b = x;
    do {
        let a = Math.floor(b);
        let aux = h1;
        h1 = a * h1 + h2;
        h2 = aux;
        aux = k1;
        k1 = a * k1 + k2;
        k2 = aux;
        b = 1 / (b - a);
    } while (Math.abs(x - h1 / k1) > x * tolerance && k1 < maxDenominator);

    const numerator = sign * h1;
    const denominator = k1;
    if (denominator === 1) return numerator.toString();
    return `${numerator}/${denominator}`;
}

// Detailed error message diagnosis
function getDetailedErrorMessage(error, expr) {
    if (!expr || expr.trim() === '') {
        return 'Syntax Error: Empty expression';
    }
    const clean = expr.trim();
    
    // Check unmatched parentheses
    const openParens = (clean.match(/\(/g) || []).length;
    const closeParens = (clean.match(/\)/g) || []).length;
    if (openParens !== closeParens) {
        return `Syntax Error: Unmatched parentheses (${openParens} '(' vs ${closeParens} ')')`;
    }
    
    // Check division by zero: / 0 or / 0.0 or / (0)
    if (/\/\s*0(?![.0-9])|\/\s*0\.0*(?![1-9])|\/\s*\(\s*0\s*\)/.test(clean)) {
        return 'Math Error: Division by zero';
    }
    
    // Check trailing operator
    if (/[\+\-\*\/\%\^]\s*$/.test(clean)) {
        return 'Syntax Error: Incomplete expression with trailing operator';
    }
    
    // Check consecutive invalid operators (e.g., ++, **, //, *+, +*)
    if (/[\+\*\/\%\^]{2,}/.test(clean.replace(/\*\*/g, ''))) {
        return 'Syntax Error: Invalid consecutive operators';
    }
    
    // Check domain errors
    if (/sqrt\s*\(\s*-\d+/.test(clean)) {
        return 'Domain Error: Negative square root';
    }
    if (/log\s*\(\s*-\d+|ln\s*\(\s*-\d+|log\s*\(\s*0\s*\)|ln\s*\(\s*0\s*\)/.test(clean)) {
        return 'Domain Error: Non-positive argument for logarithm';
    }

    if (error && error.message) {
        return error.message.startsWith('Error') || error.message.includes('Error') ? error.message : `Error: ${error.message}`;
    }
    
    return 'Calculation Error: Invalid mathematical syntax';
}

// Remove IEEE-754 precision artifacts like 0.1 + 0.2 = 0.30000000000000004
function formatResult(val) {
    if (typeof val !== 'number' || isNaN(val)) return 'Error';
    if (!isFinite(val)) return val > 0 ? 'Infinity' : '-Infinity';
    const precision = (typeof settingsState !== 'undefined' && settingsState.precision) ? settingsState.precision : 12;
    const notation = (typeof settingsState !== 'undefined' && settingsState.notation) ? settingsState.notation : 'auto';
    
    if (notation === 'scientific') {
        return val.toExponential(Math.min(precision, 8));
    }
    const rounded = parseFloat(val.toPrecision(precision));
    return rounded.toString();
}

function updateDisplay() {
    mainDisplay.textContent = currentInput;
    if (mainDisplay && mainDisplay.style) {
        if (typeof currentInput === 'string' && isErrorState(currentInput)) {
            mainDisplay.style.fontSize = '1.1rem';
            mainDisplay.style.color = '#f87171';
        } else {
            mainDisplay.style.fontSize = (typeof currentInput === 'string' && currentInput.length > 14) ? '1.5rem' : '';
            mainDisplay.style.color = '';
        }
    }
    if (expressionChain) {
        historyDisplay.textContent = expressionChain;
    } else if (previousInput && operation) {
        historyDisplay.textContent = `${previousInput} ${operation}`;
    } else {
        historyDisplay.textContent = '';
    }
}

function appendNumber(num) {
    if (num === '.') {
        if (currentInput === '0' || isErrorState(currentInput) || !currentInput) {
            currentInput = '0.';
        } else if (currentInput.includes('.')) {
            return; // Prevent duplicate decimal points
        } else {
            currentInput += '.';
        }
    } else {
        if (currentInput === '0' || isErrorState(currentInput)) {
            currentInput = num;
        } else {
            currentInput += num;
        }
    }
    updateDisplay();
}

function appendOperator(op) {
    if (isErrorState(currentInput)) return;
    
    const opSym = (op === 'mod') ? '%' : op;
    
    if (expressionChain) {
        if (currentInput === '0' && expressionChain.endsWith(' ')) {
            // Replace trailing operator if user selected another
            expressionChain = expressionChain.trimEnd().replace(/[\+\-\*/\%\^]$/, opSym) + ' ';
        } else {
            expressionChain += `${currentInput} ${opSym} `;
            currentInput = '0';
        }
    } else {
        expressionChain = `${currentInput} ${opSym} `;
        currentInput = '0';
    }
    
    previousInput = expressionChain;
    operation = op;
    updateDisplay();
}

function appendFunction(func) {
    if (currentInput === '0' || isErrorState(currentInput)) {
        currentInput = func;
    } else {
        currentInput += func;
    }
    updateDisplay();
}

// Physical & Mathematical Constants
const SCIENTIFIC_CONSTANTS = {
    pi: Math.PI,
    e: Math.E,
    c: 299792458,              // Speed of light in vacuum (m/s)
    g: 9.80665,                // Standard acceleration of gravity (m/s^2)
    G: 6.67430e-11,            // Universal gravitational constant (m^3 kg^-1 s^-2)
    h: 6.62607015e-34,         // Planck constant (J*s)
    hbar: 1.054571817e-34,     // Reduced Planck constant (J*s)
    k: 1.380649e-23,           // Boltzmann constant (J/K)
    Na: 6.02214076e23,         // Avogadro constant (mol^-1)
    qe: 1.602176634e-19,       // Elementary charge (C)
    me: 9.1093837015e-31,      // Electron rest mass (kg)
    mp: 1.67262192369e-27,     // Proton rest mass (kg)
    eps0: 8.8541878128e-12,    // Vacuum permittivity (F/m)
    mu0: 1.25663706212e-6,     // Vacuum permeability (N/A^2)
    R: 8.314462618             // Molar gas constant (J/(mol*K))
};

function getConstant(constant) {
    return SCIENTIFIC_CONSTANTS[constant];
}

function appendConstant(constant) {
    const val = SCIENTIFIC_CONSTANTS[constant] !== undefined 
        ? SCIENTIFIC_CONSTANTS[constant] 
        : (constant === 'pi' ? Math.PI : Math.E);
    
    const valStr = formatResult(val);
    if (currentInput === '0' || currentInput === 'Error') {
        currentInput = valStr;
    } else {
        currentInput += valStr;
    }
    updateDisplay();
}

// Helper to parse input values or evaluate parenthesized arithmetic expressions
function evaluateArithmetic(val) {
    if (typeof val === 'number') return val;
    val = String(val).trim();
    if (!val || val === 'Error') return NaN;
    
    // Simple numeric string
    if (/^-?\d+(\.\d+)?([eE][+-]?\d+)?$/.test(val)) {
        return parseFloat(val);
    }

    // Security check: Only allow safe numeric arithmetic tokens
    if (!/^[0-9+\-*/%^().\s eE]+$/.test(val)) {
        return NaN;
    }

    // Check division by zero: / 0 or / 0.0 or / (0)
    if (/\/\s*0(?![.0-9])|\/\s*0\.0*(?![1-9])|\/\s*\(\s*0\s*\)/.test(val)) {
        throw new Error('Math Error: Division by zero');
    }
    
    try {
        const sanitized = val.replace(/\^/g, '**');
        // Double check no unauthorized letters remain (other than exponent notation)
        if (/[a-zA-Z_$]/.test(sanitized.replace(/[eE][+-]?\d+/g, ''))) {
            return NaN;
        }
        const fn = new Function('window', 'document', 'globalThis', '"use strict"; return (' + sanitized + ');');
        const res = fn(undefined, undefined, undefined);
        return typeof res === 'number' && isFinite(res) ? res : NaN;
    } catch (e) {
        throw e;
    }
}

// Format a timeline of solution steps as HTML
function formatStepsTimelineHTML(steps) {
    if (!steps || !steps.length) return '';
    const cards = steps.map((s, i) => `
        <div class="step-card">
            <div class="step-number">${i + 1}</div>
            <div class="step-content">
                <div class="step-heading">${escapeHTML(s.title || `Step ${i + 1}`)}</div>
                ${s.math ? `<div class="step-math">${escapeHTML(s.math)}</div>` : ''}
                ${s.explanation ? `<div class="step-explanation">${escapeHTML(s.explanation)}</div>` : ''}
            </div>
        </div>
    `).join('');
    
    return `
        <div class="calculus-steps-wrapper" style="margin-top: 1rem;">
            <div class="solution-steps-header" style="border-radius: 8px 8px 0 0;">
                <div class="solution-steps-title">
                    <i class="fas fa-list-ol"></i> Solution Steps
                    <span class="steps-count-badge">${steps.length} ${steps.length === 1 ? 'step' : 'steps'}</span>
                </div>
            </div>
            <div class="solution-steps-body" style="background: rgba(15, 23, 42, 0.5); border-radius: 0 0 8px 8px; border: 1px solid rgba(255, 255, 255, 0.08); border-top: none;">
                <div class="steps-timeline">
                    ${cards}
                </div>
            </div>
        </div>
    `;
}

// Generate structured step-by-step solution breakdown for arithmetic expressions (PEMDAS)
function generateArithmeticSteps(exprStr, finalResult) {
    const steps = [];
    let expr = String(exprStr).trim();
    if (!expr) return steps;

    steps.push({
        title: 'Original Expression',
        math: expr,
        explanation: 'Review the mathematical expression and apply standard Order of Operations (PEMDAS: Parentheses / Functions, Exponents, Multiplication & Division, Addition & Subtraction).'
    });

    let current = expr;
    let stepCount = 1;

    // 1. Evaluate known single-argument functions: sqrt, cbrt, abs, sin, cos, tan, log, ln
    let fnMatches = current.match(/([a-zA-Z]+)\(([^()]+)\)/);
    while (fnMatches && stepCount < 10) {
        const fnName = fnMatches[1].toLowerCase();
        const argStr = fnMatches[2];
        try {
            let fnVal = NaN;
            const argNum = parseFloat(argStr);
            if (!isNaN(argNum)) {
                if (fnName === 'sqrt') fnVal = Math.sqrt(argNum);
                else if (fnName === 'cbrt') fnVal = Math.cbrt(argNum);
                else if (fnName === 'abs') fnVal = Math.abs(argNum);
                else if (fnName === 'sin') fnVal = (currentAngleMode === 'deg') ? Math.sin(argNum * Math.PI / 180) : Math.sin(argNum);
                else if (fnName === 'cos') fnVal = (currentAngleMode === 'deg') ? Math.cos(argNum * Math.PI / 180) : Math.cos(argNum);
                else if (fnName === 'tan') fnVal = (currentAngleMode === 'deg') ? Math.tan(argNum * Math.PI / 180) : Math.tan(argNum);
                else if (fnName === 'log') fnVal = Math.log10(argNum);
                else if (fnName === 'ln') fnVal = Math.log(argNum);
            }
            if (!isNaN(fnVal) && isFinite(fnVal)) {
                stepCount++;
                const formattedVal = Number(fnVal.toFixed(8)).toString();
                current = current.replace(fnMatches[0], formattedVal);
                steps.push({
                    title: `Evaluate Function ${fnMatches[1]}()`,
                    math: `${fnMatches[0]} = ${formattedVal}`,
                    explanation: `Calculate function ${fnMatches[1]} with argument ${argStr} = ${formattedVal}. Expression simplifies to: ${current}`
                });
            } else {
                break;
            }
        } catch (e) {
            break;
        }
        fnMatches = current.match(/([a-zA-Z]+)\(([^()]+)\)/);
    }

    // 2. Evaluate expressions inside Parentheses
    let parenMatches = current.match(/\(([^()]+)\)/);
    while (parenMatches && stepCount < 16) {
        const inner = parenMatches[1];
        try {
            const innerSanitized = inner.replace(/\^/g, '**');
            const evalInner = new Function('return (' + innerSanitized + ');')();
            if (typeof evalInner === 'number' && isFinite(evalInner)) {
                stepCount++;
                const formattedInner = Number(evalInner.toFixed(8)).toString();
                current = current.replace('(' + inner + ')', formattedInner);
                steps.push({
                    title: 'Resolve Parentheses',
                    math: `(${inner}) → ${formattedInner}`,
                    explanation: `Evaluate the sub-expression within brackets: (${inner}) = ${formattedInner}. Expression reduces to: ${current}`
                });
            } else {
                break;
            }
        } catch (e) {
            break;
        }
        parenMatches = current.match(/\(([^()]+)\)/);
    }

    // 3. Evaluate Exponents / Powers (^)
    let powerMatches = current.match(/(-?\d+(?:\.\d+)?)\s*\^\s*(-?\d+(?:\.\d+)?)/);
    while (powerMatches && stepCount < 22) {
        const base = parseFloat(powerMatches[1]);
        const exp = parseFloat(powerMatches[2]);
        const powVal = Math.pow(base, exp);
        stepCount++;
        const formattedPow = Number(powVal.toFixed(8)).toString();
        current = current.replace(powerMatches[0], formattedPow);
        steps.push({
            title: 'Evaluate Exponentiation',
            math: `${powerMatches[0]} = ${formattedPow}`,
            explanation: `Compute base ${powerMatches[1]} raised to exponent ${powerMatches[2]}: ${powerMatches[0]} = ${formattedPow}. Expression reduces to: ${current}`
        });
        powerMatches = current.match(/(-?\d+(?:\.\d+)?)\s*\^\s*(-?\d+(?:\.\d+)?)/);
    }

    // 4. Evaluate Multiplication (*), Division (/), and Modulo (%)
    let multDivMatches = current.match(/(-?\d+(?:\.\d+)?)\s*([*/%])\s*(-?\d+(?:\.\d+)?)/);
    while (multDivMatches && stepCount < 30) {
        const n1 = parseFloat(multDivMatches[1]);
        const op = multDivMatches[2];
        const n2 = parseFloat(multDivMatches[3]);
        let val;
        let opName = 'Multiplication';
        if (op === '*') { val = n1 * n2; opName = 'Multiplication'; }
        else if (op === '/') { val = n1 / n2; opName = 'Division'; }
        else if (op === '%') { val = n1 % n2; opName = 'Modulo'; }

        stepCount++;
        const formattedVal = Number(val.toFixed(8)).toString();
        current = current.replace(multDivMatches[0], formattedVal);
        steps.push({
            title: `Evaluate ${opName}`,
            math: `${multDivMatches[0]} = ${formattedVal}`,
            explanation: `Perform ${opName.toLowerCase()} from left to right: ${multDivMatches[1]} ${op} ${multDivMatches[3]} = ${formattedVal}. Expression reduces to: ${current}`
        });
        multDivMatches = current.match(/(-?\d+(?:\.\d+)?)\s*([*/%])\s*(-?\d+(?:\.\d+)?)/);
    }

    // 5. Evaluate Addition (+) and Subtraction (-)
    let addSubMatches = current.match(/(-?\d+(?:\.\d+)?)\s*([+-])\s*(\d+(?:\.\d+)?)/);
    while (addSubMatches && stepCount < 38) {
        if (addSubMatches.index === 0 && !addSubMatches[1]) break;
        const n1 = parseFloat(addSubMatches[1]);
        const op = addSubMatches[2];
        const n2 = parseFloat(addSubMatches[3]);
        const val = op === '+' ? n1 + n2 : n1 - n2;
        stepCount++;
        const formattedVal = Number(val.toFixed(8)).toString();
        current = current.replace(addSubMatches[0], formattedVal);
        steps.push({
            title: `Evaluate ${op === '+' ? 'Addition' : 'Subtraction'}`,
            math: `${addSubMatches[0]} = ${formattedVal}`,
            explanation: `Perform ${op === '+' ? 'addition' : 'subtraction'}: ${addSubMatches[1]} ${op} ${addSubMatches[3]} = ${formattedVal}. Expression reduces to: ${current}`
        });
        addSubMatches = current.match(/(-?\d+(?:\.\d+)?)\s*([+-])\s*(\d+(?:\.\d+)?)/);
    }

    steps.push({
        title: 'Final Result',
        math: `${expr} = ${finalResult !== undefined ? finalResult : current}`,
        explanation: 'All arithmetic operations completed according to precedence rules.'
    });

    return steps;
}

// Render steps into target DOM container
function renderSolutionSteps(steps, targetContainerId = 'solutionStepsBody', countBadgeId = 'stepsCountBadge') {
    const container = document.getElementById(targetContainerId);
    if (!container) return;

    if (!steps || steps.length === 0) {
        container.innerHTML = '<p class="steps-empty">No solution steps available.</p>';
        const badge = document.getElementById(countBadgeId);
        if (badge) badge.textContent = '0 steps';
        return;
    }

    const countBadge = document.getElementById(countBadgeId);
    if (countBadge) {
        countBadge.textContent = `${steps.length} ${steps.length === 1 ? 'step' : 'steps'}`;
    }

    const stepsHTML = steps.map((step, idx) => `
        <div class="step-card">
            <div class="step-number">${idx + 1}</div>
            <div class="step-content">
                <div class="step-heading">${escapeHTML(step.title || `Step ${idx + 1}`)}</div>
                ${step.math ? `<div class="step-math">${escapeHTML(step.math)}</div>` : ''}
                ${step.explanation ? `<div class="step-explanation">${escapeHTML(step.explanation)}</div>` : ''}
            </div>
        </div>
    `).join('');

    container.innerHTML = `<div class="steps-timeline">${stepsHTML}</div>`;
}

// Toggle collapsible solution steps card
function toggleSolutionStepsCard() {
    const body = document.getElementById('solutionStepsBody');
    const chevron = document.getElementById('stepsToggleChevron');
    if (!body) return;
    if (body.style.display === 'none') {
        body.style.display = 'block';
        if (chevron) chevron.className = 'fas fa-chevron-up';
    } else {
        body.style.display = 'none';
        if (chevron) chevron.className = 'fas fa-chevron-down';
    }
}

// View solution steps for a specific calculation from history
function viewHistorySteps(index) {
    const item = history[index];
    if (!item || !item.steps || item.steps.length === 0) return;
    if (currentMode !== 'basic' && currentMode !== 'advanced') {
        switchMode('basic');
    }
    renderSolutionSteps(item.steps, 'solutionStepsBody', 'stepsCountBadge');
    const stepsCard = document.getElementById('solutionStepsCard');
    if (stepsCard) {
        stepsCard.style.display = 'block';
        const body = document.getElementById('solutionStepsBody');
        if (body) body.style.display = 'block';
        const chevron = document.getElementById('stepsToggleChevron');
        if (chevron) chevron.className = 'fas fa-chevron-up';
        stepsCard.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
}

// Basic operations with PEMDAS operator precedence & precision formatting
function calculate() {
    let fullExpr = '';
    try {
        if (expressionChain) {
            fullExpr = `${expressionChain} ${currentInput}`.trim();
        } else if (currentInput) {
            fullExpr = currentInput.trim();
        }
        
        if (!fullExpr) return;
        
        const evaluated = evaluateArithmetic(fullExpr);
        if (isNaN(evaluated)) throw new Error('Invalid calculation');
        
        const formatted = formatResult(evaluated);
        const steps = generateArithmeticSteps(fullExpr, formatted);
        addToHistory(fullExpr, formatted, steps);
        
        // Render step-by-step breakdown
        renderSolutionSteps(steps, 'solutionStepsBody', 'stepsCountBadge');
        const stepsCard = document.getElementById('solutionStepsCard');
        if (stepsCard) {
            stepsCard.style.display = 'block';
            const body = document.getElementById('solutionStepsBody');
            if (body) body.style.display = 'block';
            const chevron = document.getElementById('stepsToggleChevron');
            if (chevron) chevron.className = 'fas fa-chevron-up';
        }

        currentInput = formatted;
        expressionChain = '';
        previousInput = '';
        operation = null;
        updateDisplay();
    } catch (error) {
        const isDetailed = (typeof settingsState === 'undefined' || settingsState.detailedErrors !== false);
        currentInput = isDetailed ? getDetailedErrorMessage(error, fullExpr) : 'Error';
        expressionChain = '';
        previousInput = '';
        operation = null;
        updateDisplay();
    }
}

function clearAll() {
    currentInput = '0';
    expressionChain = '';
    previousInput = '';
    operation = null;
    const stepsCard = document.getElementById('solutionStepsCard');
    if (stepsCard) {
        stepsCard.style.display = 'none';
    }
    updateDisplay();
}

function clearEntry() {
    currentInput = '0';
    updateDisplay();
}

function backspace() {
    if (currentInput.length > 1 && !isErrorState(currentInput)) {
        currentInput = currentInput.slice(0, -1);
    } else {
        currentInput = '0';
    }
    updateDisplay();
}

function toggleSign() {
    if (currentInput !== '0' && !isErrorState(currentInput)) {
        currentInput = (parseFloat(currentInput) * -1).toString();
        updateDisplay();
    }
}

function percentage() {
    if (!isErrorState(currentInput)) {
        currentInput = (parseFloat(currentInput) / 100).toString();
        updateDisplay();
    }
}

// Scientific functions
function scientificFunction(func) {
    if (isErrorState(currentInput)) return;
    
    try {
        let value = parseFloat(currentInput);
        let result;
        
        switch(func) {
            case 'sin':
                result = angleMode === 'deg' ? Math.sin(value * Math.PI / 180) : Math.sin(value);
                break;
            case 'cos':
                result = angleMode === 'deg' ? Math.cos(value * Math.PI / 180) : Math.cos(value);
                break;
            case 'tan':
                result = angleMode === 'deg' ? Math.tan(value * Math.PI / 180) : Math.tan(value);
                break;
            case 'asin':
                if (value < -1 || value > 1) throw new Error('Domain Error: asin(x) requires -1 ≤ x ≤ 1');
                result = angleMode === 'deg' ? Math.asin(value) * 180 / Math.PI : Math.asin(value);
                break;
            case 'acos':
                if (value < -1 || value > 1) throw new Error('Domain Error: acos(x) requires -1 ≤ x ≤ 1');
                result = angleMode === 'deg' ? Math.acos(value) * 180 / Math.PI : Math.acos(value);
                break;
            case 'atan':
                result = angleMode === 'deg' ? Math.atan(value) * 180 / Math.PI : Math.atan(value);
                break;
            case 'sinh':
                result = Math.sinh(value);
                break;
            case 'cosh':
                result = Math.cosh(value);
                break;
            case 'tanh':
                result = Math.tanh(value);
                break;
            case 'log':
                if (value <= 0) throw new Error('Domain Error: Non-positive argument for log10 (requires x > 0)');
                result = Math.log10(value);
                break;
            case 'log2':
                if (value <= 0) throw new Error('Domain Error: Non-positive argument for log2 (requires x > 0)');
                result = Math.log2(value);
                break;
            case 'ln':
                if (value <= 0) throw new Error('Domain Error: Non-positive argument for ln (requires x > 0)');
                result = Math.log(value);
                break;
            case 'toFraction': {
                result = decimalToFraction(currentInput);
                addToHistory(`frac(${currentInput})`, result);
                currentInput = result.toString();
                previousInput = '';
                operation = null;
                updateDisplay();
                return;
            }
            case 'exp':
                result = Math.exp(value);
                break;
            case '10^':
                result = Math.pow(10, value);
                break;
            case 'square':
                result = value * value;
                break;
            case 'cube':
                result = value * value * value;
                break;
            case 'sqrt':
                if (value < 0) throw new Error('Domain Error: Negative square root (requires x ≥ 0)');
                result = Math.sqrt(value);
                break;
            case 'cbrt':
                result = Math.cbrt(value);
                break;
            case 'factorial':
                result = factorial(value);
                break;
            case 'abs':
                result = Math.abs(value);
                break;
            case 'reciprocal':
                if (value === 0) throw new Error('Math Error: Division by zero');
                result = 1 / value;
                break;
            default:
                return;
        }
        
        addToHistory(`${func}(${currentInput})`, result);
        currentInput = result.toString();
        previousInput = '';
        operation = null;
        updateDisplay();
    } catch (error) {
        const isDetailed = (typeof settingsState === 'undefined' || settingsState.detailedErrors !== false);
        currentInput = isDetailed ? (error.message.startsWith('Domain Error') || error.message.startsWith('Math Error') ? error.message : `Error: ${error.message}`) : 'Error';
        updateDisplay();
    }
}

function factorial(n) {
    if (n < 0 || !Number.isInteger(n)) throw new Error('Invalid input');
    if (n === 0 || n === 1) return 1;
    
    // Use BigInt for exact computation without IEEE-754 precision loss
    if (n <= 1000) {
        let res = 1n;
        for (let i = 2n; i <= BigInt(n); i++) {
            res *= i;
        }
        if (n <= 21) return Number(res);
        const str = res.toString();
        if (str.length > 15) {
            const exp = str.length - 1;
            const mantissa = parseFloat(str[0] + '.' + str.slice(1, 7));
            return `${mantissa}e+${exp}`;
        }
        return str;
    }
    
    // For n > 1000, Stirling approximation in log-space
    const lnFact = n * Math.log(n) - n + 0.5 * Math.log(2 * Math.PI * n);
    const log10Fact = lnFact / Math.LN10;
    const exponent = Math.floor(log10Fact);
    const mantissa = Math.pow(10, log10Fact - exponent);
    return `${mantissa.toFixed(4)}e+${exponent}`;
}

function toggleAngleMode() {
    angleMode = angleMode === 'deg' ? 'rad' : 'deg';
    document.getElementById('angleMode').textContent = angleMode.toUpperCase();
}

// Memory functions
function memoryStore() {
    if (currentInput !== 'Error') {
        memory = parseFloat(currentInput);
        memoryValue.textContent = memory;
        showNotification('Stored in memory');
    }
}

function memoryRecall() {
    currentInput = memory.toString();
    updateDisplay();
}

function memoryClear() {
    memory = 0;
    memoryValue.textContent = '0';
    showNotification('Memory cleared');
}

function memoryAdd() {
    if (currentInput !== 'Error') {
        memory += parseFloat(currentInput);
        memoryValue.textContent = memory;
        showNotification('Added to memory');
    }
}

function memorySubtract() {
    if (currentInput !== 'Error') {
        memory -= parseFloat(currentInput);
        memoryValue.textContent = memory;
        showNotification('Subtracted from memory');
    }
}

// Calculus functions using math.js
function calculateDerivative() {
    const input = document.getElementById('derivativeInput').value;
    const point = document.getElementById('derivativePoint').value;
    const resultDiv = document.getElementById('derivativeResult');
    
    if (!input) {
        resultDiv.innerHTML = '<span style="color: var(--danger)">Please enter a function</span>';
        return;
    }
    
    if (typeof math === 'undefined') {
        resultDiv.innerHTML = '<span style="color: var(--danger)">Symbolic math library (math.js) is not loaded</span>';
        return;
    }
    
    try {
        const expr = math.parse(input);
        
        // Auto-detect variable in expression (e.g. x, t, y, u)
        let variable = 'x';
        if (expr.filter) {
            const symbols = expr.filter(node => node.isSymbolNode)
                                .map(n => n.name)
                                .filter(n => !['pi', 'e', 'E', 'PI'].includes(n));
            if (symbols.length > 0) variable = symbols[0];
        }
        
        const derivative = math.derivative(expr, variable);
        let resultText = `<strong>d/d${escapeHTML(variable)} [${escapeHTML(input)}] = ${escapeHTML(derivative.toString())}</strong>`;
        
        const steps = [
            {
                title: 'Problem Formulation',
                math: `f(${variable}) = ${input}`,
                explanation: `Identify independent variable '${variable}' and function f(${variable}) to differentiate.`
            },
            {
                title: 'Symbolic Differentiation',
                math: `d/d${variable} [${input}] = ${derivative.toString()}`,
                explanation: 'Apply calculus differentiation rules (Power Rule, Product Rule, Quotient Rule, Chain Rule) to obtain the analytical derivative.'
            }
        ];

        if (point !== '') {
            const pointVal = parseFloat(point);
            if (!isNaN(pointVal)) {
                const scope = { [variable]: pointVal };
                const value = derivative.evaluate(scope);
                resultText += `<br><br>At ${escapeHTML(variable)} = ${pointVal}: <strong>${Number(value).toFixed(6)}</strong>`;
                steps.push({
                    title: `Point Evaluation at ${variable} = ${pointVal}`,
                    math: `f'(${pointVal}) = ${Number(value).toFixed(6)}`,
                    explanation: `Substitute ${variable} = ${pointVal} into the derivative function to determine the instantaneous rate of change (tangent slope).`
                });
            }
        }
        
        resultDiv.innerHTML = resultText + formatStepsTimelineHTML(steps);
    } catch (error) {
        resultDiv.innerHTML = `<span style="color: var(--danger)">Error: ${escapeHTML(error.message)}</span>`;
    }
}

function calculateIntegral() {
    const input = document.getElementById('integralInput').value;
    let lower = parseFloat(document.getElementById('integralLower').value);
    let upper = parseFloat(document.getElementById('integralUpper').value);
    const resultDiv = document.getElementById('integralResult');
    
    if (!input) {
        resultDiv.innerHTML = '<span style="color: var(--danger)">Please enter a function</span>';
        return;
    }
    
    if (isNaN(lower) || isNaN(upper)) {
        resultDiv.innerHTML = '<span style="color: var(--danger)">Please enter valid bounds</span>';
        return;
    }
    
    try {
        let sign = 1;
        if (lower > upper) {
            const tmp = lower;
            lower = upper;
            upper = tmp;
            sign = -1;
        }
        
        const varMatch = input.match(/[a-zA-Z]/);
        const variable = varMatch ? varMatch[0] : 'x';
        
        let f;
        if (typeof math !== 'undefined' && math.compile) {
            f = math.compile(input);
        }
        const evalF = (val) => {
            if (f) return f.evaluate({ [variable]: val });
            return evaluateFunction(input, val);
        };
        
        const n = 1000;
        const h = (upper - lower) / n;
        const fLower = evalF(lower);
        const fUpper = evalF(upper);
        
        if (!isFinite(fLower) || !isFinite(fUpper)) {
            throw new Error('Integrand is undefined or infinite at the boundary points');
        }
        
        let sum = fLower + fUpper;
        for (let i = 1; i < n; i++) {
            const x = lower + i * h;
            const fx = evalF(x);
            if (!isFinite(fx)) {
                throw new Error(`Singularity or discontinuity encountered near ${variable} = ${x.toFixed(4)}`);
            }
            const weight = i % 2 === 0 ? 2 : 4;
            sum += weight * fx;
        }
        
        const result = sign * (h / 3) * sum;
        
        const steps = [
            {
                title: 'Problem Formulation',
                math: `∫ [${input}] d${variable} from ${lower} to ${upper}`,
                explanation: `Definite integral problem on the interval [${lower}, ${upper}] with respect to variable '${variable}'.`
            },
            {
                title: 'Check Boundary Points',
                math: `f(${lower}) = ${fLower.toFixed(6)},  f(${upper}) = ${fUpper.toFixed(6)}`,
                explanation: `Verify that the integrand is finite and continuous at the boundary points [${lower}, ${upper}].`
            },
            {
                title: "Discretization (Simpson's 1/3 Rule)",
                math: `n = ${n} subintervals, step size h = (b - a)/n = (${upper} - ${lower})/${n} = ${h.toFixed(6)}`,
                explanation: "Discretize the continuous integral domain into an even number of subintervals using composite Simpson's 1/3 rule for fourth-order accuracy."
            },
            {
                title: 'Composite Quadrature Sum',
                math: `S = f(x_0) + 4 ∑ f(x_odd) + 2 ∑ f(x_even) + f(x_n)`,
                explanation: `Evaluate alternating parity-weighted function values across all ${n - 1} interior quadrature nodes.`
            },
            {
                title: 'Final Numerical Evaluation',
                math: `∫_${lower}^${upper} (${input}) d${variable} ≈ ${result.toFixed(6)}`,
                explanation: `Multiply composite sum by (h / 3)${sign === -1 ? ' with sign correction due to swapped bounds' : ''} to obtain final value.`
            }
        ];

        resultDiv.innerHTML = `
            <strong>∫ ${escapeHTML(input)} d${escapeHTML(variable)} from ${escapeHTML(sign === -1 ? upper : lower)} to ${escapeHTML(sign === -1 ? lower : upper)}</strong>
            <br><br>
            Result: <strong>${result.toFixed(6)}</strong>
            ${formatStepsTimelineHTML(steps)}
        `;
    } catch (error) {
        resultDiv.innerHTML = `<span style="color: var(--danger)">Error: ${escapeHTML(error.message)}</span>`;
    }
}

function solveEquation() {
    const input = document.getElementById('equationInput').value;
    const resultDiv = document.getElementById('equationResult');
    
    if (!input) {
        resultDiv.innerHTML = '<span style="color: var(--danger)">Please enter an equation</span>';
        return;
    }
    
    try {
        let equation = input.replace(/\s/g, '');
        if (!equation.includes('=')) {
            equation += '=0';
        }
        
        const [left, right] = equation.split('=');
        const expr = `${left}-(${right || '0'})`;
        
        const varMatch = expr.match(/[a-zA-Z]/);
        const variable = varMatch ? varMatch[0] : 'x';

        let f, df;
        if (typeof math !== 'undefined' && typeof math.compile === 'function') {
            f = math.compile(expr);
            try {
                df = math.derivative(math.parse(expr), variable);
            } catch (de) {
                df = null;
            }
        }
        
        const evalF = (xVal) => {
            if (f) return f.evaluate({ [variable]: xVal });
            return evaluateFunction(expr, xVal);
        };
        
        const evalDf = (xVal) => {
            if (df) return df.evaluate({ [variable]: xVal });
            const h = 1e-6;
            return (evalF(xVal + h) - evalF(xVal - h)) / (2 * h);
        };
        
        const starts = [-50, -20, -10, -5, -2, -1, -0.5, 0, 0.5, 1, 2, 5, 10, 20, 50];
        const foundRoots = [];
        const tolerance = 1e-8;
        const maxIterations = 80;
        
        for (const start of starts) {
            let x = start;
            for (let iter = 0; iter < maxIterations; iter++) {
                try {
                    const fx = evalF(x);
                    const dfx = evalDf(x);
                    if (Math.abs(fx) < tolerance) {
                        if (isFinite(x)) {
                            const rounded = Math.round(x * 1e6) / 1e6;
                            if (!foundRoots.some(r => Math.abs(r - rounded) < 1e-4)) {
                                foundRoots.push(rounded);
                            }
                        }
                        break;
                    }
                    if (Math.abs(dfx) < 1e-12) {
                        x += 0.25;
                        continue;
                    }
                    const step = fx / dfx;
                    if (!isFinite(step)) break;
                    x = x - step;
                    if (Math.abs(x) > 1e8) break;
                } catch (e) {
                    break;
                }
            }
        }
        
        foundRoots.sort((a, b) => a - b);
        
        const steps = [
            {
                title: 'Transform to Standard Form',
                math: `f(${variable}) = ${expr} = 0`,
                explanation: `Rearrange input equation '${input}' into standard root-finding format f(${variable}) = 0.`
            },
            {
                title: 'Newton-Raphson Numerical Iteration',
                math: `x_{n+1} = x_n - \\frac{f(x_n)}{f'(x_n)}`,
                explanation: 'Apply gradient-guided Newton-Raphson multi-start iterations with dynamic step descent.'
            },
            {
                title: 'Convergence & Verification',
                math: foundRoots.length > 0 ? `Roots verified: ${foundRoots.map(r => `${variable} ≈ ${r}`).join(', ')}` : 'No real roots converged within search range',
                explanation: 'Candidate roots are checked against error tolerance |f(x)| < 1e-8 to ensure mathematical precision.'
            }
        ];

        if (foundRoots.length > 0) {
            let rootsHTML = `<strong>Solution${foundRoots.length > 1 ? 's' : ''}:</strong><br><br>`;
            foundRoots.forEach((root, idx) => {
                const verif = evalF(root);
                rootsHTML += `${escapeHTML(variable)}${foundRoots.length > 1 ? `<sub>${idx + 1}</sub>` : ''} ≈ <strong>${root.toFixed(6)}</strong> <small>(f ≈ ${verif.toExponential(2)})</small><br>`;
            });
            resultDiv.innerHTML = rootsHTML + formatStepsTimelineHTML(steps);
        } else {
            resultDiv.innerHTML = `<span style="color: var(--warning)">No real solutions found in domain [-50, 50]. The equation may have complex roots or no solution.</span>` + formatStepsTimelineHTML(steps);
        }
    } catch (error) {
        resultDiv.innerHTML = `<span style="color: var(--danger)">Error: ${escapeHTML(error.message)}</span>`;
    }
}

// History functions
function addToHistory(expression, result, steps = []) {
    const historyItem = {
        expression: expression,
        result: result,
        steps: steps || [],
        timestamp: new Date().toLocaleTimeString()
    };
    
    history.unshift(historyItem);
    if (history.length > 50) history.pop();
    
    saveHistory();
    renderHistory();
}

function renderHistory() {
    const historyList = document.getElementById('historyList');
    if (!historyList) return;
    
    if (history.length === 0) {
        historyList.innerHTML = '<p class="no-history">No calculations yet</p>';
        return;
    }
    
    historyList.innerHTML = history.map((item, index) => `
        <div class="history-item">
            <div style="cursor: pointer;" onclick="loadFromHistory(${index})">
                <div class="history-expression">${escapeHTML(item.expression)}</div>
                <div class="history-result">= ${escapeHTML(item.result)}</div>
            </div>
            ${item.steps && item.steps.length > 0 ? `
                <button class="history-item-steps-btn" onclick="event.stopPropagation(); viewHistorySteps(${index})" title="View Solution Steps">
                    <i class="fas fa-list-ol"></i> Solution Steps (${item.steps.length})
                </button>
            ` : ''}
        </div>
    `).join('');
}

function loadFromHistory(index) {
    const item = history[index];
    currentInput = item.result.toString();
    updateDisplay();
}

function clearHistory() {
    if (confirm('Clear all history?')) {
        history = [];
        saveHistory();
        renderHistory();
        if (typeof showNotification === 'function') {
            showNotification('History cleared');
        }
    }
}

function saveHistory() {
    localStorage.setItem('calculatorHistory', JSON.stringify(history));
}

function loadHistory() {
    try {
        const saved = (typeof localStorage !== 'undefined') ? localStorage.getItem('calculatorHistory') : null;
        if (saved) {
            history = JSON.parse(saved);
            renderHistory();
        }
    } catch (e) {
        console.warn('Could not load history:', e);
    }
}

// Export calculation history as JSON or CSV
function exportHistory(format = 'json') {
    if (!history || history.length === 0) {
        showNotification('No history to export');
        return;
    }
    
    let content, mimeType, filename;
    if (format === 'csv') {
        const headers = 'Timestamp,Expression,Result\n';
        const rows = history.map(h => `"${h.timestamp || ''}","${String(h.expression).replace(/"/g, '""')}","${String(h.result).replace(/"/g, '""')}"`).join('\n');
        content = headers + rows;
        mimeType = 'text/csv;charset=utf-8;';
        filename = `calculator-history-${Date.now()}.csv`;
    } else {
        content = JSON.stringify(history, null, 2);
        mimeType = 'application/json;charset=utf-8;';
        filename = `calculator-history-${Date.now()}.json`;
    }
    
    try {
        const blob = new Blob([content], { type: mimeType });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        showNotification(`History exported as ${format.toUpperCase()}`);
    } catch (e) {
        showNotification('Export failed: ' + e.message);
    }
}

function toggleHistory() {
    closeHamburgerMenu();
    document.getElementById('historyPanel')?.classList.toggle('active');
}

// Notification
function showNotification(message) {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        left: 50%;
        transform: translateX(-50%);
        padding: 1rem 2rem;
        background: var(--primary);
        color: white;
        border-radius: 10px;
        box-shadow: var(--shadow);
        z-index: 2000;
        animation: slideDown 0.3s ease;
    `;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideUp 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 2000);
}

// Keyboard support
document.addEventListener('keydown', (e) => {
    // Prevent capturing input when user is typing inside form input fields, textareas, or selects
    const tag = e.target && e.target.tagName;
    if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || (e.target && e.target.isContentEditable)) {
        return;
    }

    if (e.key >= '0' && e.key <= '9') appendNumber(e.key);
    else if (e.key === '.') appendNumber('.');
    else if (e.key === '+') appendOperator('+');
    else if (e.key === '-') appendOperator('-');
    else if (e.key === '*') appendOperator('*');
    else if (e.key === '/') appendOperator('/');
    else if (e.key === 'Enter') {
        e.preventDefault();
        calculate();
    }
    else if (e.key === 'Escape') clearAll();
    else if (e.key === 'Backspace') {
        e.preventDefault();
        backspace();
    }
});

// Add animation styles
const style = document.createElement('style');
style.textContent = `
    @keyframes slideDown {
        from { transform: translate(-50%, -100%); opacity: 0; }
        to { transform: translate(-50%, 0); opacity: 1; }
    }
    @keyframes slideUp {
        from { transform: translate(-50%, 0); opacity: 1; }
        to { transform: translate(-50%, -100%); opacity: 0; }
    }
`;
document.head.appendChild(style);

// Combinatorics Functions

// Helper function for large factorials using Stirling's approximation when needed
function bigFactorial(n) {
    return factorial(n);
}

// Permutation P(n,r) = n! / (n-r)!
function permutation(n, r) {
    if (n < 0 || r < 0) throw new Error('Values must be non-negative');
    if (r > n) return 0;
    if (r === 0) return 1;
    
    let result = 1;
    for (let i = n; i > n - r; i--) {
        result *= i;
    }
    return result;
}

// Combination C(n,r) = n! / (r! * (n-r)!)
function combination(n, r) {
    if (n < 0 || r < 0) throw new Error('Values must be non-negative');
    if (r > n) return 0;
    if (r === 0 || r === n) return 1;
    
    // Use the more efficient formula
    r = Math.min(r, n - r);
    let result = 1;
    for (let i = 0; i < r; i++) {
        result = result * (n - i) / (i + 1);
    }
    return Math.round(result);
}

// Binomial coefficient
function binomialCoefficient(n, k) {
    return combination(n, k);
}

// Calculate Permutation
function calculatePermutation() {
    const n = parseInt(document.getElementById('permutationN').value);
    const r = parseInt(document.getElementById('permutationR').value);
    const resultDiv = document.getElementById('permutationResult');
    
    if (isNaN(n) || isNaN(r)) {
        resultDiv.innerHTML = '<span style="color: var(--danger)">Please enter valid numbers for both n and r</span>';
        return;
    }
    
    try {
        const result = permutation(n, r);
        const formula = `P(${n},${r}) = ${n}! / (${n}-${r})! = ${n}! / ${n-r}!`;

        const permSteps = [
            {
                title: 'Permutation Formula Definition',
                math: `P(n, r) = \\frac{n!}{(n - r)!}`,
                explanation: `Calculate ordered arrangements of ${r} items selected from a collection of ${n} distinct items.`
            },
            {
                title: 'Substitute Parameters',
                math: `P(${n}, ${r}) = \\frac{${n}!}{( ${n} - ${r} )!} = \\frac{${n}!}{( ${n - r} )!}`,
                explanation: `Insert values n = ${n} and r = ${r} into the factorial formula.`
            },
            {
                title: 'Factorial Cancellation & Product',
                math: `P(${n}, ${r}) = ${result.toLocaleString()}`,
                explanation: `Cancel (${n - r})! from numerator and denominator to produce final permutations count.`
            }
        ];
        
        resultDiv.innerHTML = `
            <strong>Permutation Formula:</strong><br>
            ${formula}<br><br>
            <strong>Result:</strong> <span style="color: var(--success); font-size: 1.2em;">${result.toLocaleString()}</span><br><br>
            <small>This represents the number of ways to arrange ${r} items from ${n} total items where order matters.</small>
            ${formatStepsTimelineHTML(permSteps)}
        `;
        
        addToHistory(`P(${n},${r})`, result);
    } catch (error) {
        resultDiv.innerHTML = `<span style="color: var(--danger)">Error: ${error.message}</span>`;
    }
}

// Calculate Combination
function calculateCombination() {
    const n = parseInt(document.getElementById('combinationN').value);
    const r = parseInt(document.getElementById('combinationR').value);
    const resultDiv = document.getElementById('combinationResult');
    
    if (isNaN(n) || isNaN(r)) {
        resultDiv.innerHTML = '<span style="color: var(--danger)">Please enter valid numbers for both n and r</span>';
        return;
    }
    
    try {
        const result = combination(n, r);
        const formula = `C(${n},${r}) = ${n}! / (${r}! × (${n}-${r})!) = ${n}! / (${r}! × ${n-r}!)`;

        const combSteps = [
            {
                title: 'Combination Formula Definition',
                math: `C(n, r) = \\binom{n}{r} = \\frac{n!}{r! \\cdot (n - r)!}`,
                explanation: `Calculate unordered subsets of ${r} items chosen from a set of ${n} distinct items.`
            },
            {
                title: 'Substitute Parameters',
                math: `C(${n}, ${r}) = \\frac{${n}!}{${r}! \\cdot (${n} - ${r})!} = \\frac{${n}!}{${r}! \\cdot ${n - r}!}`,
                explanation: `Insert values n = ${n} and r = ${r} into the combination formula.`
            },
            {
                title: 'Factorial Evaluation',
                math: `C(${n}, ${r}) = ${result.toLocaleString()}`,
                explanation: `Divide the permutation product by r! to eliminate order dependencies.`
            }
        ];
        
        resultDiv.innerHTML = `
            <strong>Combination Formula:</strong><br>
            ${formula}<br><br>
            <strong>Result:</strong> <span style="color: var(--success); font-size: 1.2em;">${result.toLocaleString()}</span><br><br>
            <small>This represents the number of ways to choose ${r} items from ${n} total items where order doesn't matter.</small>
            ${formatStepsTimelineHTML(combSteps)}
        `;
        
        addToHistory(`C(${n},${r})`, result);
    } catch (error) {
        resultDiv.innerHTML = `<span style="color: var(--danger)">Error: ${error.message}</span>`;
    }
}

// Binomial mode tracking
let binomialMode = 'expand';

function setBinomialMode(mode) {
    binomialMode = mode;
    
    // Update button states
    document.querySelectorAll('.btn-option').forEach(btn => btn.classList.remove('active'));
    const binBtn = Array.from(document.querySelectorAll('.btn-option')).find(b => b.getAttribute('onclick') && b.getAttribute('onclick').includes(`'${mode}'`));
    if (binBtn) binBtn.classList.add('active');
    
    // Show/hide relevant input groups
    document.getElementById('termInputGroup').style.display = 'none';
    document.getElementById('coefficientInputGroup').style.display = 'none';
    
    if (mode === 'term') {
        document.getElementById('termInputGroup').style.display = 'block';
    } else if (mode === 'coefficient') {
        document.getElementById('coefficientInputGroup').style.display = 'block';
    }
}

// Parse expression to extract coefficient and power
function parseSingleBinomialTerm(expr) {
    expr = expr.trim();
    if (!expr) return { coeff: 0, power: 0, variable: '' };
    
    if (!isNaN(Number(expr))) {
        return { coeff: parseFloat(expr), power: 0, variable: '' };
    }
    
    const varMatch = expr.match(/[a-zA-Z]/);
    if (!varMatch) {
        return { coeff: parseFloat(expr) || 0, power: 0, variable: '' };
    }
    
    const variable = varMatch[0];
    
    if (expr === variable || expr === `+${variable}`) return { coeff: 1, power: 1, variable };
    if (expr === `-${variable}`) return { coeff: -1, power: 1, variable };
    
    let power = 1;
    const powerRegex = new RegExp(`${variable}\\^(-?\\d+)`);
    const powerMatch = expr.match(powerRegex);
    if (powerMatch) {
        power = parseInt(powerMatch[1]);
    } else if (!expr.includes(variable)) {
        power = 0;
    }
    
    let coeff = 1;
    const coeffRegex = new RegExp(`^([+-]?\\d*\\.?\\d*)\\s*\\*?\\s*${variable}`);
    const coeffMatch = expr.match(coeffRegex);
    if (coeffMatch) {
        const cStr = coeffMatch[1];
        if (cStr === '' || cStr === '+') coeff = 1;
        else if (cStr === '-') coeff = -1;
        else coeff = parseFloat(cStr);
    }
    
    return { coeff, power, variable };
}

function parseExpression(expr) {
    expr = expr.trim();
    if (!expr) return { coeff: 0, power: 0, variable: '' };
    
    if (expr.includes('/')) {
        const parts = expr.split('/');
        const numPart = parts[0].trim();
        const denPart = parts[1].trim();
        
        const numParsed = parseSingleBinomialTerm(numPart);
        const denParsed = parseSingleBinomialTerm(denPart);
        
        const coeff = numParsed.coeff / denParsed.coeff;
        
        if (numParsed.variable && !denParsed.variable) {
            return { coeff, power: numParsed.power, variable: numParsed.variable };
        }
        if (!numParsed.variable && denParsed.variable) {
            return { coeff, power: -denParsed.power, variable: denParsed.variable };
        }
        if (numParsed.variable && denParsed.variable && numParsed.variable === denParsed.variable) {
            return { coeff, power: numParsed.power - denParsed.power, variable: numParsed.variable };
        }
        if (!numParsed.variable && !denParsed.variable) {
            return { coeff, power: 0, variable: '' };
        }
    }
    
    return parseSingleBinomialTerm(expr);
}

// Calculate Binomial Expansion with enhanced functionality
function calculateBinomial() {
    const a = document.getElementById('binomialA').value || 'x';
    const b = document.getElementById('binomialB').value || '1';
    const n = parseInt(document.getElementById('binomialN').value);
    const resultDiv = document.getElementById('binomialResult');
    
    if (isNaN(n) || n < 0) {
        resultDiv.innerHTML = '<span style="color: var(--danger)">Please enter a valid non-negative power n</span>';
        return;
    }
    
    if (n > 20 && binomialMode === 'expand') {
        resultDiv.innerHTML = '<span style="color: var(--danger)">Power too large. Please use n ≤ 20 for full expansion</span>';
        return;
    }
    
    try {
        // Parse the expressions
        const parsedA = parseExpression(a);
        const parsedB = parseExpression(b);
        
        if (binomialMode === 'constant') {
            // Find constant term
            findConstantTerm(parsedA, parsedB, n, resultDiv);
            
        } else if (binomialMode === 'term') {
            // Calculate specific term
            const r = parseInt(document.getElementById('binomialR').value);
            if (isNaN(r) || r < 0 || r > n) {
                resultDiv.innerHTML = '<span style="color: var(--danger)">r must be between 0 and n</span>';
                return;
            }
            
            calculateSpecificTerm(parsedA, parsedB, n, r, resultDiv);
            
        } else if (binomialMode === 'coefficient') {
            // Find coefficient only
            const r = parseInt(document.getElementById('binomialCoeffR').value);
            if (isNaN(r) || r < 0 || r > n) {
                resultDiv.innerHTML = '<span style="color: var(--danger)">r must be between 0 and n</span>';
                return;
            }
            
            const coeff = binomialCoefficient(n, r);
            const termCoeff = coeff * Math.pow(parsedA.coeff, n - r) * Math.pow(parsedB.coeff, r);
            
            resultDiv.innerHTML = `
                <strong>Coefficient of T<sub>${r+1}</sub>:</strong><br>
                C(${n},${r}) × ${parsedA.coeff}^${n-r} × ${parsedB.coeff}^${r}<br><br>
                <strong>Result:</strong> <span style="color: var(--success); font-size: 1.5em;">${termCoeff.toLocaleString()}</span><br><br>
                <small>This is the coefficient of the ${getOrdinal(r+1)} term in (${a} + ${b})^${n}</small>
            `;
            
        } else if (binomialMode === 'middle') {
            // Find middle term(s)
            findMiddleTerms(parsedA, parsedB, n, resultDiv);
            
        } else {
            // Full expansion
            expandBinomial(parsedA, parsedB, n, resultDiv);
        }
        
        addToHistory(`(${a}+${b})^${n} [${binomialMode}]`, 'calculated');
    } catch (error) {
        resultDiv.innerHTML = `<span style="color: var(--danger)">Error: ${error.message}</span>`;
    }
}

// Find constant term in binomial expansion
function findConstantTerm(parsedA, parsedB, n, resultDiv) {
    // For constant term, total power of variables must be 0
    // If a = c₁x^p₁ and b = c₂x^p₂, then in term C(n,r) × a^(n-r) × b^r
    // Total power = (n-r)×p₁ + r×p₂ = 0
    // Solving: (n-r)×p₁ + r×p₂ = 0
    // n×p₁ - r×p₁ + r×p₂ = 0
    // r×(p₂ - p₁) = -n×p₁
    // r = -n×p₁ / (p₂ - p₁)
    
    const p1 = parsedA.power;
    const p2 = parsedB.power;
    const c1 = parsedA.coeff;
    const c2 = parsedB.coeff;
    
    if (p1 === p2) {
        if (p1 === 0) {
            // Both are constants, every term is constant
            const result = Math.pow(c1 + c2, n);
            resultDiv.innerHTML = `
                <strong>Finding constant term in (${c1} + ${c2})^${n}:</strong><br><br>
                Since both terms are constants, the entire expansion is constant:<br><br>
                <div class="highlight-result">
                    Constant term: ${result.toLocaleString()}
                </div>
            `;
        } else {
            // Same power, no constant term possible
            resultDiv.innerHTML = `
                <strong>Finding constant term in (${document.getElementById('binomialA').value} + ${document.getElementById('binomialB').value})^${n}:</strong><br><br>
                <span style="color: var(--warning); font-size: 1.2em;">No constant term exists</span><br><br>
                <small>Both terms have the same power of the variable, so no combination can produce a constant term.</small>
            `;
        }
        return;
    }
    
    const r = (-n * p1) / (p2 - p1);
    
    if (!Number.isInteger(r) || r < 0 || r > n) {
        resultDiv.innerHTML = `
            <strong>Finding constant term in (${document.getElementById('binomialA').value} + ${document.getElementById('binomialB').value})^${n}:</strong><br><br>
            <span style="color: var(--warning); font-size: 1.2em;">No constant term exists</span><br><br>
            <div style="background: var(--bg-light); padding: 1rem; border-radius: 8px; margin: 1rem 0;">
                <strong>Analysis:</strong><br>
                For constant term, total power must be 0:<br>
                (${n} - r) × ${p1} + r × ${p2} = 0<br>
                Solving for r: r = ${(-n * p1)} / ${(p2 - p1)} = ${r.toFixed(2)}<br><br>
                Since r = ${r.toFixed(2)} is ${!Number.isInteger(r) ? 'not an integer' : r < 0 ? 'negative' : 'greater than n'}, no constant term exists.
            </div>
        `;
        return;
    }
    
    const binomialCoeff = binomialCoefficient(n, r);
    const coefficient = binomialCoeff * Math.pow(c1, n - r) * Math.pow(c2, r);
    const totalPower = (n - r) * p1 + r * p2;
    
    resultDiv.innerHTML = `
        <strong>Finding constant term in (${document.getElementById('binomialA').value} + ${document.getElementById('binomialB').value})^${n}:</strong><br><br>
        
        <div style="background: var(--bg-light); padding: 1rem; border-radius: 8px; margin: 1rem 0;">
            <strong>General term:</strong> T<sub>r+1</sub> = C(${n},r) × (${document.getElementById('binomialA').value})^${n-r} × (${document.getElementById('binomialB').value})^r<br><br>
            
            <strong>For constant term, total power = 0:</strong><br>
            (${n} - r) × ${p1} + r × ${p2} = 0<br>
            ${n * p1} - ${p1}r + ${p2}r = 0<br>
            r(${p2} - ${p1}) = ${-n * p1}<br>
            r = ${r}<br><br>
            
            <strong>Verification:</strong> Total power = (${n} - ${r}) × ${p1} + ${r} × ${p2} = ${totalPower} ✓
        </div>
        
        <strong>Calculation:</strong><br>
        T<sub>${r+1}</sub> = C(${n},${r}) × ${c1}^${n-r} × ${c2}^${r}<br>
        = ${binomialCoeff} × ${c1}^${n-r} × ${c2}^${r}<br>
        = ${binomialCoeff} × ${Math.pow(c1, n-r)} × ${Math.pow(c2, r)}<br><br>
        
        <div class="highlight-result">
            Constant term: ${coefficient.toLocaleString()}
        </div>
        
        <small>This is the ${getOrdinal(r+1)} term in the expansion.</small>
    `;
}

// Calculate specific term with detailed breakdown
function calculateSpecificTerm(parsedA, parsedB, n, r, resultDiv) {
    const coeff = binomialCoefficient(n, r);
    const aCoeff = Math.pow(parsedA.coeff, n - r);
    const bCoeff = Math.pow(parsedB.coeff, r);
    const totalCoeff = coeff * aCoeff * bCoeff;
    
    const aPower = (n - r) * parsedA.power;
    const bPower = r * parsedB.power;
    const totalPower = aPower + bPower;
    
    let termStr = '';
    if (totalCoeff !== 1 || totalPower === 0) {
        termStr += totalCoeff;
    }
    if (totalPower > 0) {
        termStr += 'x';
        if (totalPower !== 1) termStr += `^${totalPower}`;
    } else if (totalPower < 0) {
        termStr += `/x`;
        if (totalPower !== -1) termStr += `^${Math.abs(totalPower)}`;
    }
    if (termStr === '') termStr = '1';
    
    resultDiv.innerHTML = `
        <strong>Term T<sub>${r+1}</sub> (r=${r}):</strong><br><br>
        
        <div style="background: var(--bg-light); padding: 1rem; border-radius: 8px; margin: 1rem 0;">
            <strong>Formula:</strong> T<sub>${r+1}</sub> = C(${n},${r}) × (${document.getElementById('binomialA').value})^${n-r} × (${document.getElementById('binomialB').value})^${r}<br><br>
            
            <strong>Coefficient calculation:</strong><br>
            C(${n},${r}) × ${parsedA.coeff}^${n-r} × ${parsedB.coeff}^${r}<br>
            = ${coeff} × ${aCoeff} × ${bCoeff} = ${totalCoeff}<br><br>
            
            <strong>Power calculation:</strong><br>
            Power of x: (${n-r}) × ${parsedA.power} + ${r} × ${parsedB.power} = ${totalPower}
        </div>
        
        <div class="highlight-result">
            T<sub>${r+1}</sub> = ${termStr}
        </div>
        
        <small>This is the ${getOrdinal(r+1)} term in the expansion of (${document.getElementById('binomialA').value} + ${document.getElementById('binomialB').value})^${n}</small>
    `;
}

// Find middle terms with enhanced display
function findMiddleTerms(parsedA, parsedB, n, resultDiv) {
    let middleTerms = [];
    
    if (n % 2 === 0) {
        const r = n / 2;
        middleTerms.push(r);
    } else {
        middleTerms.push(Math.floor(n / 2), Math.ceil(n / 2));
    }
    
    let resultHTML = `<strong>Middle Term${middleTerms.length > 1 ? 's' : ''}:</strong><br><br>`;
    
    middleTerms.forEach(r => {
        const coeff = binomialCoefficient(n, r);
        const aCoeff = Math.pow(parsedA.coeff, n - r);
        const bCoeff = Math.pow(parsedB.coeff, r);
        const totalCoeff = coeff * aCoeff * bCoeff;
        
        const totalPower = (n - r) * parsedA.power + r * parsedB.power;
        
        let termStr = '';
        if (totalCoeff !== 1 || totalPower === 0) {
            termStr += totalCoeff;
        }
        if (totalPower > 0) {
            termStr += 'x';
            if (totalPower !== 1) termStr += `^${totalPower}`;
        } else if (totalPower < 0) {
            termStr += `/x`;
            if (totalPower !== -1) termStr += `^${Math.abs(totalPower)}`;
        }
        if (termStr === '') termStr = '1';
        
        resultHTML += `
            <div style="margin-bottom: 1rem; padding: 1rem; background: var(--bg-light); border-radius: 8px;">
                <strong>T<sub>${r+1}</sub> (r=${r}):</strong><br>
                Coefficient: ${totalCoeff.toLocaleString()}<br>
                Term: <span style="color: var(--success); font-size: 1.1em;">${termStr}</span>
            </div>
        `;
    });
    
    resultDiv.innerHTML = resultHTML;
}

// Expand binomial with enhanced formatting
function expandBinomial(parsedA, parsedB, n, resultDiv) {
    let expansion = [];
    let formula = `(${document.getElementById('binomialA').value} + ${document.getElementById('binomialB').value})^${n} = `;
    
    for (let i = 0; i <= n; i++) {
        const coeff = binomialCoefficient(n, i);
        const aCoeff = Math.pow(parsedA.coeff, n - i);
        const bCoeff = Math.pow(parsedB.coeff, i);
        const totalCoeff = coeff * aCoeff * bCoeff;
        
        const aPower = (n - i) * parsedA.power;
        const bPower = i * parsedB.power;
        
        let term = '';
        
        // Handle sign
        if (i > 0) {
            if (totalCoeff >= 0) {
                term += ' + ';
            } else {
                term += ' - ';
            }
        } else if (totalCoeff < 0) {
            term += '-';
        }
        
        const absCoeff = Math.abs(totalCoeff);
        
        // Build the term
        let termParts = [];
        
        // Add coefficient if it's not 1 or if there are no variables
        if (absCoeff !== 1 || (aPower === 0 && bPower === 0)) {
            termParts.push(absCoeff.toString());
        }
        
        // Add first variable (from parsedA)
        if (aPower !== 0) {
            if (parsedA.variable) {
                if (aPower === 1) {
                    termParts.push(parsedA.variable);
                } else if (aPower > 0) {
                    termParts.push(`${parsedA.variable}^${aPower}`);
                } else {
                    termParts.push(`/${parsedA.variable}${aPower === -1 ? '' : '^' + Math.abs(aPower)}`);
                }
            } else {
                // Default to 'x' if no variable specified
                if (aPower === 1) {
                    termParts.push('x');
                } else if (aPower > 0) {
                    termParts.push(`x^${aPower}`);
                } else {
                    termParts.push(`/x${aPower === -1 ? '' : '^' + Math.abs(aPower)}`);
                }
            }
        }
        
        // Add second variable (from parsedB)
        if (bPower !== 0) {
            if (parsedB.variable) {
                if (bPower === 1) {
                    termParts.push(parsedB.variable);
                } else if (bPower > 0) {
                    termParts.push(`${parsedB.variable}^${bPower}`);
                } else {
                    termParts.push(`/${parsedB.variable}${bPower === -1 ? '' : '^' + Math.abs(bPower)}`);
                }
            } else {
                // Default to 'y' if no variable specified for second term
                if (bPower === 1) {
                    termParts.push('y');
                } else if (bPower > 0) {
                    termParts.push(`y^${bPower}`);
                } else {
                    termParts.push(`/y${bPower === -1 ? '' : '^' + Math.abs(bPower)}`);
                }
            }
        }
        
        // Join the term parts
        if (termParts.length === 0) {
            term += '1';
        } else {
            term += termParts.join('');
        }
        
        expansion.push(term);
    }
    
    resultDiv.innerHTML = `
        <strong>Binomial Expansion:</strong><br>
        <div style="background: var(--bg-light); padding: 1rem; border-radius: 8px; margin: 1rem 0; font-family: monospace; word-break: break-all; line-height: 1.8;">
            ${formula}<br><br>${expansion.join('')}
        </div>
        <strong>Number of terms:</strong> ${n + 1}<br>
        <strong>Note:</strong> This expansion properly handles multiple variables and their powers.
    `;
}

// Helper function to format binomial terms
function formatBinomialTerm(coeff, a, aPower, b, bPower, isFirst = false) {
    let term = '';
    
    // Handle coefficient
    if (coeff !== 1 || (aPower === 0 && bPower === 0)) {
        term += coeff;
    }
    
    // Handle 'a' term
    if (aPower > 0) {
        if (a !== '1' && a !== 1) {
            term += a;
            if (aPower > 1) term += `^${aPower}`;
        } else if (aPower > 1) {
            term += `^${aPower}`;
        }
    }
    
    // Handle 'b' term
    if (bPower > 0) {
        if (b !== '1' && b !== 1) {
            term += b;
            if (bPower > 1) term += `^${bPower}`;
        } else if (bPower > 1) {
            term += `^${bPower}`;
        }
    }
    
    // Handle edge case where term is empty
    if (term === '' || (coeff === 1 && aPower === 0 && bPower === 0)) {
        term = '1';
    }
    
    return term;
}

// Helper function to get ordinal numbers
function getOrdinal(n) {
    const suffixes = ['th', 'st', 'nd', 'rd'];
    const v = n % 100;
    return n + (suffixes[(v - 20) % 10] || suffixes[v] || suffixes[0]);
}

// Coefficient mode tracking
let coeffMode = 'single';

function setCoeffMode(mode) {
    coeffMode = mode;
    
    // Update button states
    document.querySelectorAll('.btn-tab').forEach(btn => btn.classList.remove('active'));
    const coeffBtn = Array.from(document.querySelectorAll('.btn-tab')).find(b => b.getAttribute('onclick') && b.getAttribute('onclick').includes(`'${mode}'`));
    if (coeffBtn) coeffBtn.classList.add('active');
    
    // Show/hide relevant modes
    document.getElementById('singleVarMode').style.display = mode === 'single' ? 'block' : 'none';
    document.getElementById('twoVarMode').style.display = mode === 'two' ? 'block' : 'none';
    
    // Clear previous results
    document.getElementById('coefficientResult').innerHTML = '';
}

// Find coefficient of specific power in binomial expansion
function findCoefficient() {
    const a = parseFloat(document.getElementById('coeffA').value) || 1;
    const b = parseFloat(document.getElementById('coeffB').value) || 1;
    const n = parseInt(document.getElementById('coeffN').value);
    const m = parseInt(document.getElementById('coeffM').value);
    const resultDiv = document.getElementById('coefficientResult');
    
    if (isNaN(n) || isNaN(m) || n < 0 || m < 0) {
        resultDiv.innerHTML = '<span style="color: var(--danger)">Please enter valid non-negative numbers</span>';
        return;
    }
    
    if (m > n) {
        resultDiv.innerHTML = `
            <strong>Coefficient of x^${m}:</strong><br><br>
            <span style="color: var(--warning); font-size: 1.2em;">0</span><br><br>
            <small>The power ${m} is greater than the expansion degree ${n}, so the coefficient is 0.</small>
        `;
        return;
    }
    
    try {
        // For (ax + b)^n, the general term is C(n,r) * (ax)^(n-r) * b^r
        // = C(n,r) * a^(n-r) * x^(n-r) * b^r
        // For coefficient of x^m, we need n-r = m, so r = n-m
        
        const r = n - m;
        if (r < 0 || r > n) {
            resultDiv.innerHTML = `
                <strong>Coefficient of x^${m}:</strong><br><br>
                <span style="color: var(--warning); font-size: 1.2em;">0</span><br><br>
                <small>No term with x^${m} exists in this expansion.</small>
            `;
            return;
        }
        
        const binomialCoeff = binomialCoefficient(n, r);
        const aPower = Math.pow(a, n - r);
        const bPower = Math.pow(b, r);
        const coefficient = binomialCoeff * aPower * bPower;
        
        resultDiv.innerHTML = `
            <strong>Finding coefficient of x^${m} in (${a}x + ${b})^${n}:</strong><br><br>
            
            <div style="background: var(--bg-light); padding: 1rem; border-radius: 8px; margin: 1rem 0;">
                <strong>General term:</strong> T<sub>r+1</sub> = C(${n},r) × (${a}x)^${n-r} × ${b}^r<br>
                <strong>For x^${m}:</strong> We need ${n}-r = ${m}, so r = ${r}<br><br>
                
                <strong>Calculation:</strong><br>
                T<sub>${r+1}</sub> = C(${n},${r}) × ${a}^${n-r} × ${b}^${r}<br>
                = ${binomialCoeff} × ${a}^${n-r} × ${b}^${r}<br>
                = ${binomialCoeff} × ${aPower} × ${bPower}<br>
            </div>
            
            <strong>Coefficient of x^${m}:</strong> <span style="color: var(--success); font-size: 1.5em;">${coefficient.toLocaleString()}</span><br><br>
            
            <small>This coefficient comes from the ${getOrdinal(r+1)} term in the expansion.</small>
        `;
        
        addToHistory(`Coeff of x^${m} in (${a}x+${b})^${n}`, coefficient);
    } catch (error) {
        resultDiv.innerHTML = `<span style="color: var(--danger)">Error: ${error.message}</span>`;
    }
}

// Find coefficient of x^p y^q in two-variable binomial expansion
function findTwoVarCoefficient() {
    const a = parseFloat(document.getElementById('twoVarA').value) || 1;
    const b = parseFloat(document.getElementById('twoVarB').value) || 1;
    const n = parseInt(document.getElementById('twoVarN').value);
    const p = parseInt(document.getElementById('powerX').value);
    const q = parseInt(document.getElementById('powerY').value);
    const resultDiv = document.getElementById('coefficientResult');
    
    if (isNaN(n) || isNaN(p) || isNaN(q) || n < 0 || p < 0 || q < 0) {
        resultDiv.innerHTML = '<span style="color: var(--danger)">Please enter valid non-negative numbers</span>';
        return;
    }
    
    if (p + q !== n) {
        resultDiv.innerHTML = `
            <strong>Coefficient of x^${p}y^${q}:</strong><br><br>
            <span style="color: var(--warning); font-size: 1.2em;">0</span><br><br>
            <small>The sum of powers (${p} + ${q} = ${p + q}) must equal the expansion degree (${n}) for a non-zero coefficient.</small>
        `;
        return;
    }
    
    if (p > n || q > n) {
        resultDiv.innerHTML = `
            <strong>Coefficient of x^${p}y^${q}:</strong><br><br>
            <span style="color: var(--warning); font-size: 1.2em;">0</span><br><br>
            <small>Individual powers cannot exceed the expansion degree ${n}.</small>
        `;
        return;
    }
    
    try {
        // For (ax + by)^n, the general term is C(n,r) * (ax)^(n-r) * (by)^r
        // = C(n,r) * a^(n-r) * x^(n-r) * b^r * y^r
        // For coefficient of x^p y^q, we need:
        // n-r = p (power of x) and r = q (power of y)
        // This gives us r = q and n-r = n-q = p
        
        const r = q;
        if (n - r !== p) {
            resultDiv.innerHTML = `
                <strong>Coefficient of x^${p}y^${q}:</strong><br><br>
                <span style="color: var(--warning); font-size: 1.2em;">0</span><br><br>
                <small>No term with x^${p}y^${q} exists in this expansion.</small>
            `;
            return;
        }
        
        const binomialCoeff = binomialCoefficient(n, r);
        const aPower = Math.pow(a, p);
        const bPower = Math.pow(b, q);
        const coefficient = binomialCoeff * aPower * bPower;
        
        // Determine sign for display
        const sign = coefficient >= 0 ? '' : '-';
        const absCoeff = Math.abs(coefficient);
        
        resultDiv.innerHTML = `
            <strong>Finding coefficient of x^${p}y^${q} in (${a}x + ${b}y)^${n}:</strong><br><br>
            
            <div style="background: var(--bg-light); padding: 1rem; border-radius: 8px; margin: 1rem 0;">
                <strong>General term:</strong> T<sub>r+1</sub> = C(${n},r) × (${a}x)^${n-r} × (${b}y)^r<br>
                <strong>For x^${p}y^${q}:</strong> We need ${n}-r = ${p} and r = ${q}<br>
                <strong>Therefore:</strong> r = ${q}<br><br>
                
                <strong>Verification:</strong><br>
                • Power of x: ${n} - ${q} = ${p} ✓<br>
                • Power of y: ${q} ✓<br><br>
                
                <strong>Calculation:</strong><br>
                T<sub>${q+1}</sub> = C(${n},${q}) × ${a}^${p} × ${b}^${q}<br>
                = ${binomialCoeff} × ${a}^${p} × ${b}^${q}<br>
                = ${binomialCoeff} × ${aPower} × ${bPower}<br>
                = ${coefficient}
            </div>
            
            <div class="highlight-result">
                Coefficient of x^${p}y^${q}: ${sign}${absCoeff.toLocaleString()}
            </div>
            
            <strong>Term in expansion:</strong> ${coefficient}x^${p}y^${q}<br><br>
            <small>This is the ${getOrdinal(q+1)} term in the binomial expansion.</small>
        `;
        
        addToHistory(`Coeff of x^${p}y^${q} in (${a}x+${b}y)^${n}`, coefficient);
    } catch (error) {
        resultDiv.innerHTML = `<span style="color: var(--danger)">Error: ${error.message}</span>`;
    }
}

// Quick combinatorics functions
function quickFactorial() {
    const n = parseInt(document.getElementById('quickN').value);
    const resultDiv = document.getElementById('quickResult');
    
    if (isNaN(n) || n < 0) {
        resultDiv.innerHTML = '<span style="color: var(--danger)">Please enter a valid non-negative number</span>';
        return;
    }
    
    try {
        const result = bigFactorial(n);
        resultDiv.innerHTML = `
            <strong>${n}! = ${result > 1e15 ? result.toExponential(6) : result.toLocaleString()}</strong>
        `;
        addToHistory(`${n}!`, result);
    } catch (error) {
        resultDiv.innerHTML = `<span style="color: var(--danger)">Error: ${error.message}</span>`;
    }
}

function quickDoubleFactorial() {
    const n = parseInt(document.getElementById('quickN').value);
    const resultDiv = document.getElementById('quickResult');
    
    if (isNaN(n) || n < 0) {
        resultDiv.innerHTML = '<span style="color: var(--danger)">Please enter a valid non-negative number</span>';
        return;
    }
    
    try {
        let result = 1;
        for (let i = n; i > 0; i -= 2) {
            result *= i;
        }
        
        resultDiv.innerHTML = `
            <strong>${n}!! = ${result.toLocaleString()}</strong><br>
            <small>Double factorial: product of all positive integers ≤ n with same parity</small>
        `;
        addToHistory(`${n}!!`, result);
    } catch (error) {
        resultDiv.innerHTML = `<span style="color: var(--danger)">Error: ${error.message}</span>`;
    }
}

function quickDerangement() {
    const n = parseInt(document.getElementById('quickN').value);
    const resultDiv = document.getElementById('quickResult');
    
    if (isNaN(n) || n < 0) {
        resultDiv.innerHTML = '<span style="color: var(--danger)">Please enter a valid non-negative number</span>';
        return;
    }
    
    try {
        if (n === 0) {
            resultDiv.innerHTML = '<strong>!0 = 1</strong>';
            return;
        }
        
        // Calculate derangement using the formula: !n = n! * Σ((-1)^k / k!) for k=0 to n
        let result = 0;
        const nFactorial = bigFactorial(n);
        
        for (let k = 0; k <= n; k++) {
            result += Math.pow(-1, k) / bigFactorial(k);
        }
        result = Math.round(nFactorial * result);
        
        resultDiv.innerHTML = `
            <strong>!${n} = ${result.toLocaleString()}</strong><br>
            <small>Derangements: permutations where no element appears in its original position</small>
        `;
        addToHistory(`!${n}`, result);
    } catch (error) {
        resultDiv.innerHTML = `<span style="color: var(--danger)">Error: ${error.message}</span>`;
    }
}

function quickCatalanNumber() {
    const n = parseInt(document.getElementById('quickN').value);
    const resultDiv = document.getElementById('quickResult');
    
    if (isNaN(n) || n < 0) {
        resultDiv.innerHTML = '<span style="color: var(--danger)">Please enter a valid non-negative number</span>';
        return;
    }
    
    try {
        // Catalan number: C_n = (2n)! / ((n+1)! * n!)
        const result = bigFactorial(2 * n) / (bigFactorial(n + 1) * bigFactorial(n));
        
        resultDiv.innerHTML = `
            <strong>C<sub>${n}</sub> = ${Math.round(result).toLocaleString()}</strong><br>
            <small>Catalan number: counts various combinatorial structures</small>
        `;
        addToHistory(`C_${n}`, Math.round(result));
    } catch (error) {
        resultDiv.innerHTML = `<span style="color: var(--danger)">Error: ${error.message}</span>`;
    }
}

function quickStirlingSecond() {
    const n = parseInt(document.getElementById('quickN').value);
    const k = parseInt(document.getElementById('quickK').value);
    const resultDiv = document.getElementById('quickResult');
    
    if (isNaN(n) || isNaN(k) || n < 0 || k < 0) {
        resultDiv.innerHTML = '<span style="color: var(--danger)">Please enter valid non-negative numbers for both n and k</span>';
        return;
    }
    
    try {
        // Stirling number of the second kind using recurrence relation
        function stirlingSecond(n, k) {
            if (n === 0 && k === 0) return 1;
            if (n === 0 || k === 0) return 0;
            if (k > n) return 0;
            if (k === 1 || k === n) return 1;
            
            // Use dynamic programming for efficiency
            const dp = Array(n + 1).fill().map(() => Array(k + 1).fill(0));
            dp[0][0] = 1;
            
            for (let i = 1; i <= n; i++) {
                for (let j = 1; j <= Math.min(i, k); j++) {
                    dp[i][j] = j * dp[i-1][j] + dp[i-1][j-1];
                }
            }
            
            return dp[n][k];
        }
        
        const result = stirlingSecond(n, k);
        
        resultDiv.innerHTML = `
            <strong>S(${n},${k}) = ${result.toLocaleString()}</strong><br>
            <small>Stirling number of 2nd kind: ways to partition n objects into k non-empty subsets</small>
        `;
        addToHistory(`S(${n},${k})`, result);
    } catch (error) {
        resultDiv.innerHTML = `<span style="color: var(--danger)">Error: ${error.message}</span>`;
    }
}

function quickBellNumber() {
    const n = parseInt(document.getElementById('quickN').value);
    const resultDiv = document.getElementById('quickResult');
    
    if (isNaN(n) || n < 0) {
        resultDiv.innerHTML = '<span style="color: var(--danger)">Please enter a valid non-negative number</span>';
        return;
    }
    
    if (n > 15) {
        resultDiv.innerHTML = '<span style="color: var(--danger)">n too large. Please use n ≤ 15</span>';
        return;
    }
    
    try {
        // Bell number using Bell triangle
        function bellNumber(n) {
            if (n === 0) return 1;
            
            const bell = [[1]];
            
            for (let i = 1; i <= n; i++) {
                bell[i] = [bell[i-1][bell[i-1].length - 1]];
                for (let j = 1; j < bell[i-1].length + 1; j++) {
                    bell[i][j] = bell[i-1][j-1] + bell[i][j-1];
                }
            }
            
            return bell[n][0];
        }
        
        const result = bellNumber(n);
        
        resultDiv.innerHTML = `
            <strong>B<sub>${n}</sub> = ${result.toLocaleString()}</strong><br>
            <small>Bell number: total number of ways to partition n objects</small>
        `;
        addToHistory(`B_${n}`, result);
    } catch (error) {
        resultDiv.innerHTML = `<span style="color: var(--danger)">Error: ${error.message}</span>`;
    }
}
// Load example into binomial calculator
function loadBinomialExample(a, b, n) {
    const aInput = document.getElementById('binomialA');
    const bInput = document.getElementById('binomialB');
    const nInput = document.getElementById('binomialN');
    if (aInput) aInput.value = a;
    if (bInput) bInput.value = b;
    if (nInput) nInput.value = n;
    
    // Switch to constant term mode for fractional examples
    if (b && b.includes('/x')) {
        setBinomialMode('constant');
        // Manually trigger the mode change since event.target won't be available
        document.querySelectorAll('.binomial-options .btn-option').forEach(btn => btn.classList.remove('active'));
        const constBtn = document.querySelector('.binomial-options [onclick*="constant"]');
        if (constBtn) constBtn.classList.add('active');
    }
    
    showNotification(`Loaded example: (${a} + ${b})^${n}`);
}

// Global loadExample supporting both binomial (3 args) and grapher (1 arg)
function loadExample(arg1, arg2, arg3) {
    if (arguments.length >= 2 || (arg2 !== undefined && arg3 !== undefined)) {
        loadBinomialExample(arg1, arg2, arg3);
    } else if (typeof loadGraphExample === 'function') {
        loadGraphExample(arg1);
    }
}

// Multinomial Theorem Functions

let multinomialMode = 'coefficient';

function setMultinomialMode(mode) {
    multinomialMode = mode;
    
    // Update button states
    document.querySelectorAll('.multinomial-options .btn-option').forEach(btn => btn.classList.remove('active'));
    const multiBtn = Array.from(document.querySelectorAll('.multinomial-options .btn-option')).find(b => b.getAttribute('onclick') && b.getAttribute('onclick').includes(`'${mode}'`));
    if (multiBtn) multiBtn.classList.add('active');
    
    // Show/hide coefficient input
    const coeffGroup = document.getElementById('multinomialCoeffGroup');
    if (mode === 'coefficient') {
        coeffGroup.style.display = 'block';
    } else {
        coeffGroup.style.display = 'none';
    }
}

function updateMultinomialInputs() {
    const numTerms = parseInt(document.getElementById('multinomialTerms').value);
    const powersInput = document.getElementById('multinomialPowersInput');
    
    // Clear existing inputs
    powersInput.innerHTML = '';
    
    // Create new inputs based on number of terms
    const variables = ['x', 'y', 'z', 'w', 'v'];
    for (let i = 0; i < numTerms; i++) {
        const input = document.createElement('input');
        input.type = 'number';
        input.id = `power${i + 1}`;
        input.placeholder = `power of ${variables[i] || `term ${i + 1}`}`;
        input.min = '0';
        powersInput.appendChild(input);
    }
    
    // Update default expression
    const defaultTerms = variables.slice(0, numTerms).join(', ');
    document.getElementById('multinomialExpression').value = defaultTerms;
}

// Calculate multinomial coefficient
function multinomialCoefficient(n, powers) {
    // Multinomial coefficient: n! / (k1! * k2! * ... * km!)
    let numerator = bigFactorial(n);
    let denominator = 1;
    
    for (let power of powers) {
        denominator *= bigFactorial(power);
    }
    
    return Math.round(numerator / denominator);
}

// Calculate number of terms in multinomial expansion
function countMultinomialTerms(n, k) {
    // Number of terms = C(n + k - 1, k - 1)
    return combination(n + k - 1, k - 1);
}

function calculateMultinomial() {
    const expression = document.getElementById('multinomialExpression').value;
    const n = parseInt(document.getElementById('multinomialN').value);
    const resultDiv = document.getElementById('multinomialResult');
    
    if (!expression || expression.trim() === '') {
        resultDiv.innerHTML = '<span style="color: var(--danger)">Please enter the terms</span>';
        return;
    }
    
    if (isNaN(n) || n < 0) {
        resultDiv.innerHTML = '<span style="color: var(--danger)">Please enter a valid non-negative power n</span>';
        return;
    }
    
    if (n > 10 && multinomialMode === 'expand') {
        resultDiv.innerHTML = '<span style="color: var(--danger)">Power too large for full expansion. Please use n ≤ 10</span>';
        return;
    }
    
    try {
        // Parse terms
        const terms = expression.split(',').map(t => t.trim());
        const k = terms.length;
        
        if (multinomialMode === 'coefficient') {
            findMultinomialCoefficient(terms, n, k, resultDiv);
        } else if (multinomialMode === 'expand') {
            expandMultinomial(terms, n, k, resultDiv);
        } else if (multinomialMode === 'count') {
            countTerms(terms, n, k, resultDiv);
        }
        
        addToHistory(`(${expression})^${n} [multinomial]`, 'calculated');
    } catch (error) {
        resultDiv.innerHTML = `<span style="color: var(--danger)">Error: ${error.message}</span>`;
    }
}

function findMultinomialCoefficient(terms, n, k, resultDiv) {
    // Get powers from inputs
    const powers = [];
    for (let i = 1; i <= k; i++) {
        const power = parseInt(document.getElementById(`power${i}`).value);
        if (isNaN(power) || power < 0) {
            resultDiv.innerHTML = '<span style="color: var(--danger)">Please enter valid non-negative powers for all terms</span>';
            return;
        }
        powers.push(power);
    }
    
    // Check if sum of powers equals n
    const sum = powers.reduce((a, b) => a + b, 0);
    if (sum !== n) {
        resultDiv.innerHTML = `
            <span style="color: var(--danger)">Sum of powers (${sum}) must equal n (${n})</span><br><br>
            <small>For a term to exist in (${terms.join(' + ')})^${n}, the sum of all powers must equal ${n}</small>
        `;
        return;
    }
    
    // Calculate multinomial coefficient
    const coeff = multinomialCoefficient(n, powers);
    
    // Build term string
    let termStr = '';
    for (let i = 0; i < k; i++) {
        if (powers[i] > 0) {
            termStr += terms[i];
            if (powers[i] > 1) termStr += `^${powers[i]}`;
        }
    }
    if (termStr === '') termStr = '1';
    
    // Build formula string
    let formulaStr = `${n}! / (`;
    formulaStr += powers.map(p => `${p}!`).join(' × ');
    formulaStr += ')';
    
    resultDiv.innerHTML = `
        <strong>Finding coefficient of ${termStr} in (${terms.join(' + ')})^${n}:</strong><br><br>
        
        <div style="background: var(--bg-light); padding: 1rem; border-radius: 8px; margin: 1rem 0;">
            <strong>Multinomial Coefficient Formula:</strong><br>
            C(${n}; ${powers.join(', ')}) = ${formulaStr}<br><br>
            
            <strong>Calculation:</strong><br>
            = ${bigFactorial(n)} / (${powers.map(p => bigFactorial(p)).join(' × ')})<br>
            = ${bigFactorial(n)} / ${powers.reduce((acc, p) => acc * bigFactorial(p), 1)}<br>
        </div>
        
        <div class="highlight-result">
            Coefficient of ${termStr}: ${coeff.toLocaleString()}
        </div>
        
        <strong>Verification:</strong><br>
        Powers: ${powers.join(' + ')} = ${sum} = n ✓<br><br>
        
        <small>This coefficient represents the number of ways to arrange ${n} items where ${powers.map((p, i) => `${p} are of type ${i + 1}`).join(', ')}.</small>
    `;
}

function expandMultinomial(terms, n, k, resultDiv) {
    if (k > 3 || n > 6) {
        resultDiv.innerHTML = `
            <span style="color: var(--warning)">Full expansion is too large to display.</span><br><br>
            <strong>Number of terms:</strong> ${countMultinomialTerms(n, k).toLocaleString()}<br><br>
            <small>Use "Find Coefficient" mode to find specific terms, or reduce n ≤ 6 and terms ≤ 3 for full expansion.</small>
        `;
        return;
    }
    
    // Generate all partitions of n into k parts
    const partitions = generatePartitions(n, k);
    
    let expansionHTML = `
        <strong>Multinomial Expansion of (${terms.join(' + ')})^${n}:</strong><br><br>
        <div style="background: var(--bg-light); padding: 1rem; border-radius: 8px; margin: 1rem 0; max-height: 400px; overflow-y: auto;">
    `;
    
    let termCount = 0;
    for (let partition of partitions) {
        const coeff = multinomialCoefficient(n, partition);
        
        let termStr = '';
        if (coeff !== 1) termStr += coeff;
        
        for (let i = 0; i < k; i++) {
            if (partition[i] > 0) {
                termStr += terms[i];
                if (partition[i] > 1) termStr += `<sup>${partition[i]}</sup>`;
            }
        }
        
        if (termCount > 0) expansionHTML += ' + ';
        expansionHTML += termStr;
        termCount++;
    }
    
    expansionHTML += `
        </div>
        <strong>Total number of terms:</strong> ${termCount}<br>
        <strong>Sum of coefficients:</strong> ${Math.pow(k, n).toLocaleString()}<br><br>
        <small>Each term represents a unique way to distribute the power ${n} among ${k} variables.</small>
    `;
    
    resultDiv.innerHTML = expansionHTML;
}

function countTerms(terms, n, k, resultDiv) {
    const numTerms = countMultinomialTerms(n, k);
    
    resultDiv.innerHTML = `
        <strong>Counting terms in (${terms.join(' + ')})^${n}:</strong><br><br>
        
        <div style="background: var(--bg-light); padding: 1rem; border-radius: 8px; margin: 1rem 0;">
            <strong>Formula:</strong><br>
            Number of terms = C(n + k - 1, k - 1)<br>
            = C(${n} + ${k} - 1, ${k} - 1)<br>
            = C(${n + k - 1}, ${k - 1})<br><br>
            
            <strong>Calculation:</strong><br>
            = ${(n + k - 1)}! / (${k - 1}! × ${n}!)<br>
        </div>
        
        <div class="highlight-result">
            Number of distinct terms: ${numTerms.toLocaleString()}
        </div>
        
        <strong>Sum of all coefficients:</strong> ${Math.pow(k, n).toLocaleString()}<br>
        <small>(Found by substituting all variables = 1)</small><br><br>
        
        <strong>Interpretation:</strong><br>
        <small>This represents the number of distinct monomials in the expansion, where each term has the form ${terms.map((t, i) => `${t}^{k${i + 1}}`).join('')} with k₁ + k₂ + ... + k${k} = ${n}.</small>
    `;
}

// Generate all partitions of n into k non-negative parts
function generatePartitions(n, k, current = [], start = 0) {
    if (k === 1) {
        return [[...current, n]];
    }
    
    const partitions = [];
    for (let i = 0; i <= n; i++) {
        const remaining = n - i;
        const subPartitions = generatePartitions(remaining, k - 1, [...current, i], i);
        partitions.push(...subPartitions);
    }
    
    return partitions;
}

// Initialize multinomial inputs on page load
document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('multinomialTerms')) {
        updateMultinomialInputs();
    }
});

// Matrix Operations Functions

// Initialize matrix inputs
function initializeMatrixInputs() {
    updateMatrixInputs('A');
    updateMatrixInputs('B');
    updateSystemInputs();
    updateDetMatrixInputs();
    if (!largeMatrixState.A.data) {
        generateRandomLargeMatrix('A', 5, 5, -5, 5, true);
        generateRandomLargeMatrix('B', 5, 5, -5, 5, true);
    }
}

// Get matrix dimensions (rows and cols, clamped 1-25)
function getMatrixDimensions(matrixName) {
    const rowsEl = document.getElementById(`matrix${matrixName}Rows`);
    const colsEl = document.getElementById(`matrix${matrixName}Cols`);
    let rows = rowsEl ? parseInt(rowsEl.value) : 3;
    let cols = colsEl ? parseInt(colsEl.value) : rows;
    if (isNaN(rows) || rows < 1) rows = 1;
    if (isNaN(cols) || cols < 1) cols = 1;
    if (rows > 25) rows = 25;
    if (cols > 25) cols = 25;
    
    // Update badge if present
    const badge = document.getElementById(`badgeMatrix${matrixName}`);
    if (badge) badge.textContent = `${rows}×${cols}`;
    
    return { rows, cols };
}

// Update matrix input grids
function updateMatrixInputs(matrixName) {
    const { rows, cols } = getMatrixDimensions(matrixName);
    const grid = document.getElementById(`matrix${matrixName}Grid`);
    if (!grid) return;
    
    // Preserve existing inputs
    const existing = {};
    for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cols; j++) {
            const el = document.getElementById(`${matrixName.toLowerCase()}${i}_${j}`) || 
                       document.getElementById(`${matrixName.toLowerCase()}${i}${j}`);
            if (el && el.value !== '') existing[`${i}_${j}`] = el.value;
        }
    }
    
    grid.innerHTML = '';
    grid.style.gridTemplateColumns = `repeat(${cols}, minmax(42px, 1fr))`;
    
    for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cols; j++) {
            const input = document.createElement('input');
            input.type = 'number';
            input.step = 'any';
            input.id = `${matrixName.toLowerCase()}${i}_${j}`;
            input.placeholder = '0';
            input.className = 'matrix-cell';
            if (existing[`${i}_${j}`] !== undefined) {
                input.value = existing[`${i}_${j}`];
            }
            grid.appendChild(input);
        }
    }
}

// Update system equation inputs
function updateSystemInputs() {
    const size = parseInt(document.getElementById('systemSize').value);
    
    // Update coefficient matrix
    const coeffGrid = document.getElementById('coefficientGrid');
    coeffGrid.innerHTML = '';
    coeffGrid.style.gridTemplateColumns = `repeat(${size}, 1fr)`;
    
    for (let i = 0; i < size; i++) {
        for (let j = 0; j < size; j++) {
            const input = document.createElement('input');
            input.type = 'number';
            input.step = '0.1';
            input.id = `coeff${i}${j}`;
            input.placeholder = '0';
            input.className = 'matrix-cell';
            coeffGrid.appendChild(input);
        }
    }
    
    // Update constants vector
    const constGrid = document.getElementById('constantsGrid');
    constGrid.innerHTML = '';
    
    for (let i = 0; i < size; i++) {
        const input = document.createElement('input');
        input.type = 'number';
        input.step = '0.1';
        input.id = `const${i}`;
        input.placeholder = '0';
        input.className = 'vector-cell';
        constGrid.appendChild(input);
    }
}

// Update determinant matrix inputs
function updateDetMatrixInputs() {
    const size = parseInt(document.getElementById('detMatrixSize').value);
    const grid = document.getElementById('detMatrixGrid');
    
    grid.innerHTML = '';
    grid.style.gridTemplateColumns = `repeat(${size}, 1fr)`;
    
    for (let i = 0; i < size; i++) {
        for (let j = 0; j < size; j++) {
            const input = document.createElement('input');
            input.type = 'number';
            input.step = '0.1';
            input.id = `det${i}${j}`;
            input.placeholder = '0';
            input.className = 'matrix-cell';
            grid.appendChild(input);
        }
    }
}

// Get matrix from inputs as 2D array
function getMatrix(matrixName) {
    const { rows, cols } = getMatrixDimensions(matrixName);
    const matrix = [];
    
    for (let i = 0; i < rows; i++) {
        matrix[i] = [];
        for (let j = 0; j < cols; j++) {
            const el = document.getElementById(`${matrixName.toLowerCase()}${i}_${j}`) || 
                       document.getElementById(`${matrixName.toLowerCase()}${i}${j}`);
            const value = el ? (parseFloat(el.value) || 0) : 0;
            matrix[i][j] = value;
        }
    }
    
    return matrix;
}

// Matrix Operations Dropdown Handlers
function handleMatrixOpDropdownChange() {
    const sel = document.getElementById('matrixOperationSelect');
    if (!sel) return;
    const val = sel.value;
    const scalarGroup = document.getElementById('scalarInputGroup');
    const powerGroup = document.getElementById('powerInputGroup');
    
    if (scalarGroup) {
        scalarGroup.style.display = (val === 'scalarA' || val === 'scalarB') ? 'block' : 'none';
    }
    if (powerGroup) {
        powerGroup.style.display = (val === 'powerA' || val === 'powerB') ? 'block' : 'none';
    }
}

function executeSelectedMatrixOperation() {
    const sel = document.getElementById('matrixOperationSelect');
    if (!sel) return;
    const op = sel.value;
    
    switch (op) {
        case 'multiply':
            multiplyMatrices();
            break;
        case 'add':
            addMatrices();
            break;
        case 'subtract':
            subtractMatrices();
            break;
        case 'kronecker':
            calculateKroneckerProduct();
            break;
        case 'transposeA':
            calculateTranspose('A');
            break;
        case 'determinantA':
            calculateDeterminant('A');
            break;
        case 'inverseA':
            calculateInverse('A');
            break;
        case 'traceA':
            calculateTrace('A');
            break;
        case 'rankA':
            calculateRank('A');
            break;
        case 'powerA': {
            const p = parseInt(document.getElementById('matrixPowerVal')?.value) || 2;
            calculateMatrixPower('A', p);
            break;
        }
        case 'normA':
            calculateMatrixNorms('A');
            break;
        case 'eigenvaluesA':
            calculateEigenvalues('A');
            break;
        case 'eigenvectorsA':
            calculateEigenvectors('A');
            break;
        case 'eigensystemA':
            calculateEigenSystem('A');
            break;
        case 'scalarA': {
            const s = parseFloat(document.getElementById('scalarValue')?.value) || 2;
            calculateScalarMultiply('A', s);
            break;
        }
        case 'transposeB':
            calculateTranspose('B');
            break;
        case 'determinantB':
            calculateDeterminant('B');
            break;
        case 'inverseB':
            calculateInverse('B');
            break;
        case 'traceB':
            calculateTrace('B');
            break;
        case 'rankB':
            calculateRank('B');
            break;
        case 'powerB': {
            const p = parseInt(document.getElementById('matrixPowerVal')?.value) || 2;
            calculateMatrixPower('B', p);
            break;
        }
        case 'normB':
            calculateMatrixNorms('B');
            break;
        case 'scalarB': {
            const s = parseFloat(document.getElementById('scalarValue')?.value) || 2;
            calculateScalarMultiply('B', s);
            break;
        }
        default:
            multiplyMatrices();
    }
}

// Get determinant matrix from inputs
function getDetMatrix() {
    const size = parseInt(document.getElementById('detMatrixSize').value);
    const matrix = [];
    
    for (let i = 0; i < size; i++) {
        matrix[i] = [];
        for (let j = 0; j < size; j++) {
            const value = parseFloat(document.getElementById(`det${i}${j}`).value) || 0;
            matrix[i][j] = value;
        }
    }
    
    return matrix;
}

// Matrix utility functions
function createMatrix(rows, cols, fillValue = 0) {
    return Array(rows).fill().map(() => Array(cols).fill(fillValue));
}

function copyMatrix(matrix) {
    return matrix.map(row => [...row]);
}

function formatMatrix(matrix, precision = 4) {
    if (!matrix || matrix.length === 0) return 'Empty matrix';
    
    const formatted = matrix.map(row => 
        row.map(val => {
            if (Math.abs(val) < 1e-10) return '0';
            return Number(val).toFixed(precision).replace(/\.?0+$/, '');
        })
    );
    
    let html = '<div class="matrix-display">';
    html += '<table class="matrix-table">';
    
    for (let row of formatted) {
        html += '<tr>';
        for (let cell of row) {
            html += `<td>${cell}</td>`;
        }
        html += '</tr>';
    }
    
    html += '</table>';
    html += '</div>';
    
    return html;
}

// Calculate determinant using cofactor expansion
function calculateDeterminant(matrixName) {
    const matrix = getMatrix(matrixName);
    const resultDiv = document.getElementById('matrixResult');
    
    try {
        const det = determinant(matrix);
        
        resultDiv.innerHTML = `
            <strong>Determinant of Matrix ${matrixName}:</strong><br><br>
            ${formatMatrix(matrix)}<br>
            <div class="highlight-result">
                det(${matrixName}) = ${det.toFixed(6)}
            </div>
            <small>
                ${det === 0 ? 'Matrix is singular (non-invertible)' : 'Matrix is non-singular (invertible)'}
            </small>
        `;
        
        addToHistory(`det(${matrixName})`, det);
    } catch (error) {
        resultDiv.innerHTML = `<span style="color: var(--danger)">Error: ${error.message}</span>`;
    }
}

function determinant(matrix) {
    const n = matrix.length;
    
    if (n !== matrix[0].length) {
        throw new Error(`Square Matrix Required: Determinant is only defined for square (N×N) matrices, but received a ${n}×${matrix[0].length} matrix.`);
    }
    
    if (n === 1) return matrix[0][0];
    if (n === 2) return matrix[0][0] * matrix[1][1] - matrix[0][1] * matrix[1][0];
    
    // Use LU decomposition for larger matrices
    const { L, U, swaps } = luDecomposition(matrix);
    let det = swaps % 2 === 0 ? 1 : -1;
    
    for (let i = 0; i < n; i++) {
        det *= U[i][i];
    }
    
    return det;
}

// Calculate matrix inverse
function calculateInverse(matrixName) {
    const matrix = getMatrix(matrixName);
    const resultDiv = document.getElementById('matrixResult');
    
    try {
        const inv = inverse(matrix);
        
        resultDiv.innerHTML = `
            <strong>Inverse of Matrix ${matrixName}:</strong><br><br>
            <strong>Original Matrix:</strong><br>
            ${formatMatrix(matrix)}<br>
            <strong>Inverse Matrix:</strong><br>
            ${formatMatrix(inv)}<br>
            <small>Verification: A × A⁻¹ should equal the identity matrix</small>
        `;
        
        addToHistory(`inv(${matrixName})`, 'calculated');
    } catch (error) {
        resultDiv.innerHTML = `<span style="color: var(--danger)">Error: ${error.message}</span>`;
    }
}

function inverse(matrix) {
    const n = matrix.length;
    const det = determinant(matrix);
    
    if (Math.abs(det) < 1e-10) {
        throw new Error('Matrix is singular (determinant = 0)');
    }
    
    if (n === 1) return [[1 / matrix[0][0]]];
    
    if (n === 2) {
        return [
            [matrix[1][1] / det, -matrix[0][1] / det],
            [-matrix[1][0] / det, matrix[0][0] / det]
        ];
    }
    
    // Use Gauss-Jordan elimination for larger matrices
    const augmented = matrix.map((row, i) => {
        const newRow = [...row];
        for (let j = 0; j < n; j++) {
            newRow.push(i === j ? 1 : 0);
        }
        return newRow;
    });
    
    // Forward elimination
    for (let i = 0; i < n; i++) {
        // Find pivot
        let maxRow = i;
        for (let k = i + 1; k < n; k++) {
            if (Math.abs(augmented[k][i]) > Math.abs(augmented[maxRow][i])) {
                maxRow = k;
            }
        }
        
        // Swap rows
        [augmented[i], augmented[maxRow]] = [augmented[maxRow], augmented[i]];
        
        // Make diagonal element 1 with singularity / pivot safeguard
        const pivot = augmented[i][i];
        if (Math.abs(pivot) < 1e-12) {
            throw new Error('Matrix is singular or ill-conditioned (zero pivot encountered)');
        }
        for (let j = 0; j < 2 * n; j++) {
            augmented[i][j] /= pivot;
        }
        
        // Eliminate column
        for (let k = 0; k < n; k++) {
            if (k !== i) {
                const factor = augmented[k][i];
                for (let j = 0; j < 2 * n; j++) {
                    augmented[k][j] -= factor * augmented[i][j];
                }
            }
        }
    }
    
    // Extract inverse matrix
    const result = [];
    for (let i = 0; i < n; i++) {
        result[i] = augmented[i].slice(n);
    }
    
    return result;
}

// Calculate transpose
function calculateTranspose(matrixName) {
    const matrix = getMatrix(matrixName);
    const resultDiv = document.getElementById('matrixResult');
    
    try {
        const transposed = transpose(matrix);
        
        resultDiv.innerHTML = `
            <strong>Transpose of Matrix ${matrixName}:</strong><br><br>
            <strong>Original Matrix:</strong><br>
            ${formatMatrix(matrix)}<br>
            <strong>Transposed Matrix:</strong><br>
            ${formatMatrix(transposed)}
        `;
        
        addToHistory(`${matrixName}ᵀ`, 'calculated');
    } catch (error) {
        resultDiv.innerHTML = `<span style="color: var(--danger)">Error: ${error.message}</span>`;
    }
}

function transpose(matrix) {
    const rows = matrix.length;
    const cols = matrix[0].length;
    const result = createMatrix(cols, rows);
    
    for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cols; j++) {
            result[j][i] = matrix[i][j];
        }
    }
    
    return result;
}

// Calculate trace
function calculateTrace(matrixName) {
    const matrix = getMatrix(matrixName);
    const resultDiv = document.getElementById('matrixResult');
    
    try {
        const tr = trace(matrix);
        
        resultDiv.innerHTML = `
            <strong>Trace of Matrix ${matrixName}:</strong><br><br>
            ${formatMatrix(matrix)}<br>
            <div class="highlight-result">
                tr(${matrixName}) = ${tr.toFixed(6)}
            </div>
            <small>Trace is the sum of diagonal elements</small>
        `;
        
        addToHistory(`tr(${matrixName})`, tr);
    } catch (error) {
        resultDiv.innerHTML = `<span style="color: var(--danger)">Error: ${error.message}</span>`;
    }
}

function trace(matrix) {
    const n = matrix.length;
    if (n !== matrix[0].length) {
        throw new Error(`Square Matrix Required: Trace is the sum of main diagonal elements and is only defined for square (N×N) matrices, but received a ${n}×${matrix[0].length} matrix.`);
    }
    
    let sum = 0;
    for (let i = 0; i < n; i++) {
        sum += matrix[i][i];
    }
    
    return sum;
}

// Calculate rank using row reduction
function calculateRank(matrixName) {
    const matrix = getMatrix(matrixName);
    const resultDiv = document.getElementById('matrixResult');
    
    try {
        const rank = matrixRank(matrix);
        
        resultDiv.innerHTML = `
            <strong>Rank of Matrix ${matrixName}:</strong><br><br>
            ${formatMatrix(matrix)}<br>
            <div class="highlight-result">
                rank(${matrixName}) = ${rank}
            </div>
            <small>
                Rank represents the dimension of the vector space spanned by the matrix rows/columns
            </small>
        `;
        
        addToHistory(`rank(${matrixName})`, rank);
    } catch (error) {
        resultDiv.innerHTML = `<span style="color: var(--danger)">Error: ${error.message}</span>`;
    }
}

function matrixRank(matrix) {
    const m = matrix.length;
    const n = matrix[0].length;
    const mat = copyMatrix(matrix);
    
    let rank = 0;
    const tolerance = 1e-10;
    
    for (let col = 0; col < n && rank < m; col++) {
        // Find pivot
        let pivot = -1;
        for (let row = rank; row < m; row++) {
            if (Math.abs(mat[row][col]) > tolerance) {
                pivot = row;
                break;
            }
        }
        
        if (pivot === -1) continue;
        
        // Swap rows
        if (pivot !== rank) {
            [mat[rank], mat[pivot]] = [mat[pivot], mat[rank]];
        }
        
        // Eliminate
        for (let row = rank + 1; row < m; row++) {
            if (Math.abs(mat[row][col]) > tolerance) {
                const factor = mat[row][col] / mat[rank][col];
                for (let c = col; c < n; c++) {
                    mat[row][c] -= factor * mat[rank][c];
                }
            }
        }
        
        rank++;
    }
    
    return rank;
}

// Calculate eigenvalues (simplified for 2x2 and 3x3)
function calculateEigenvalues(matrixName) {
    const matrix = getMatrix(matrixName);
    const resultDiv = document.getElementById('matrixResult');
    
    try {
        const eigenvals = eigenvalues(matrix);
        
        let eigenHTML = `
            <strong>Eigenvalues of Matrix ${matrixName}:</strong><br><br>
            ${formatMatrix(matrix)}<br>
            <strong>Eigenvalues:</strong><br>
        `;
        
        eigenvals.forEach((val, i) => {
            if (typeof val === 'object') {
                eigenHTML += `λ${i+1} = ${val.real.toFixed(4)} ${val.imag >= 0 ? '+' : ''}${val.imag.toFixed(4)}i<br>`;
            } else {
                eigenHTML += `λ${i+1} = ${val.toFixed(6)}<br>`;
            }
        });
        
        eigenHTML += `<br><small>Eigenvalues are solutions to det(A - λI) = 0</small>`;
        
        resultDiv.innerHTML = eigenHTML;
        addToHistory(`eigenvals(${matrixName})`, 'calculated');
    } catch (error) {
        resultDiv.innerHTML = `<span style="color: var(--danger)">Error: ${error.message}</span>`;
    }
}

function eigenvalues(matrix) {
    const n = matrix.length;
    
    if (n !== matrix[0].length) {
        throw new Error('Matrix must be square');
    }
    
    if (n === 1) {
        return [matrix[0][0]];
    }
    
    if (n === 2) {
        // For 2x2 matrix: λ² - tr(A)λ + det(A) = 0
        const a = matrix[0][0];
        const b = matrix[0][1];
        const c = matrix[1][0];
        const d = matrix[1][1];
        
        const tr = a + d;
        const det = a * d - b * c;
        
        const discriminant = tr * tr - 4 * det;
        
        if (discriminant >= 0) {
            const sqrt_disc = Math.sqrt(discriminant);
            return [(tr + sqrt_disc) / 2, (tr - sqrt_disc) / 2];
        } else {
            const sqrt_disc = Math.sqrt(-discriminant);
            return [
                { real: tr / 2, imag: sqrt_disc / 2 },
                { real: tr / 2, imag: -sqrt_disc / 2 }
            ];
        }
    }
    
    if (n === 3) {
        // Simplified characteristic polynomial for 3x3
        const a = matrix[0][0], b = matrix[0][1], c = matrix[0][2];
        const d = matrix[1][0], e = matrix[1][1], f = matrix[1][2];
        const g = matrix[2][0], h = matrix[2][1], i = matrix[2][2];
        
        // Coefficients of characteristic polynomial: λ³ + p₂λ² + p₁λ + p₀ = 0
        const p2 = -(a + e + i);
        const p1 = (a*e + a*i + e*i) - (b*d + c*g + f*h);
        const p0 = -(a*e*i + b*f*g + c*d*h - c*e*g - a*f*h - b*d*i);
        
        // Use numerical method for cubic equation (simplified)
        return solveCubic(1, p2, p1, p0);
    }
    
    throw new Error('Eigenvalue calculation only supported for matrices up to 3×3');
}

// Simplified cubic equation solver
function solveCubic(a, b, c, d) {
    // Convert to depressed cubic t³ + pt + q = 0
    const p = (3*a*c - b*b) / (3*a*a);
    const q = (2*b*b*b - 9*a*b*c + 27*a*a*d) / (27*a*a*a);
    
    const discriminant = (q/2)*(q/2) + (p/3)*(p/3)*(p/3);
    
    if (Math.abs(discriminant) < 1e-10) {
        // Multiple roots
        if (Math.abs(p) < 1e-10) {
            return [-b/(3*a), -b/(3*a), -b/(3*a)];
        } else {
            const t1 = 3*q/p;
            const t2 = -3*q/(2*p);
            return [t1 - b/(3*a), t2 - b/(3*a), t2 - b/(3*a)];
        }
    } else if (discriminant > 0) {
        // One real root
        const sqrt_disc = Math.sqrt(discriminant);
        const u = Math.cbrt(-q/2 + sqrt_disc);
        const v = Math.cbrt(-q/2 - sqrt_disc);
        const real_root = u + v - b/(3*a);
        
        // Two complex roots
        const real_part = -(u + v)/2 - b/(3*a);
        const imag_part = Math.sqrt(3)/2 * (u - v);
        
        return [
            real_root,
            { real: real_part, imag: imag_part },
            { real: real_part, imag: -imag_part }
        ];
    } else {
        // Three real roots
        const rho = Math.sqrt(-(p/3)*(p/3)*(p/3));
        const ratio = -q / (2 * rho);
        const clampedRatio = Math.max(-1, Math.min(1, isNaN(ratio) ? 0 : ratio));
        const theta = Math.acos(clampedRatio);
        
        const root1 = 2 * Math.cbrt(rho) * Math.cos(theta/3) - b/(3*a);
        const root2 = 2 * Math.cbrt(rho) * Math.cos((theta + 2*Math.PI)/3) - b/(3*a);
        const root3 = 2 * Math.cbrt(rho) * Math.cos((theta + 4*Math.PI)/3) - b/(3*a);
        
        return [root1, root2, root3];
    }
}

// Matrix addition
function addMatrices() {
    const matrixA = getMatrix('A');
    const matrixB = getMatrix('B');
    const resultDiv = document.getElementById('matrixResult');
    
    try {
        const result = matrixAdd(matrixA, matrixB);
        
        resultDiv.innerHTML = `
            <strong>Matrix Addition: A + B</strong><br><br>
            <div class="matrix-equation-view">
                <div class="matrix-equation-item">
                    <strong>Matrix A:</strong>
                    ${formatMatrix(matrixA)}
                </div>
                <div class="matrix-equation-op">+</div>
                <div class="matrix-equation-item">
                    <strong>Matrix B:</strong>
                    ${formatMatrix(matrixB)}
                </div>
                <div class="matrix-equation-op">=</div>
                <div class="matrix-equation-item">
                    <strong>Result:</strong>
                    ${formatMatrix(result)}
                </div>
            </div>
        `;
        
        addToHistory('A + B', 'calculated');
    } catch (error) {
        resultDiv.innerHTML = `<span style="color: var(--danger)">Error: ${error.message}</span>`;
    }
}

function matrixAdd(matrixA, matrixB) {
    if (matrixA.length !== matrixB.length || matrixA[0].length !== matrixB[0].length) {
        throw new Error(`Dimension Mismatch: Cannot add Matrix A (${matrixA.length}×${matrixA[0].length}) and Matrix B (${matrixB.length}×${matrixB[0].length}). Both matrices must have identical dimensions.`);
    }
    
    const result = createMatrix(matrixA.length, matrixA[0].length);
    
    for (let i = 0; i < matrixA.length; i++) {
        for (let j = 0; j < matrixA[0].length; j++) {
            result[i][j] = matrixA[i][j] + matrixB[i][j];
        }
    }
    
    return result;
}

// Matrix subtraction
function subtractMatrices() {
    const matrixA = getMatrix('A');
    const matrixB = getMatrix('B');
    const resultDiv = document.getElementById('matrixResult');
    
    try {
        const result = matrixSubtract(matrixA, matrixB);
        
        resultDiv.innerHTML = `
            <strong>Matrix Subtraction: A - B</strong><br><br>
            <div class="matrix-equation-view">
                <div class="matrix-equation-item">
                    <strong>Matrix A:</strong>
                    ${formatMatrix(matrixA)}
                </div>
                <div class="matrix-equation-op">−</div>
                <div class="matrix-equation-item">
                    <strong>Matrix B:</strong>
                    ${formatMatrix(matrixB)}
                </div>
                <div class="matrix-equation-op">=</div>
                <div class="matrix-equation-item">
                    <strong>Result:</strong>
                    ${formatMatrix(result)}
                </div>
            </div>
        `;
        
        addToHistory('A - B', 'calculated');
    } catch (error) {
        resultDiv.innerHTML = `<span style="color: var(--danger)">Error: ${error.message}</span>`;
    }
}

function matrixSubtract(matrixA, matrixB) {
    if (matrixA.length !== matrixB.length || matrixA[0].length !== matrixB[0].length) {
        throw new Error(`Dimension Mismatch: Cannot subtract Matrix B (${matrixB.length}×${matrixB[0].length}) from Matrix A (${matrixA.length}×${matrixA[0].length}). Both matrices must have identical dimensions.`);
    }
    
    const result = createMatrix(matrixA.length, matrixA[0].length);
    
    for (let i = 0; i < matrixA.length; i++) {
        for (let j = 0; j < matrixA[0].length; j++) {
            result[i][j] = matrixA[i][j] - matrixB[i][j];
        }
    }
    
    return result;
}

// Matrix multiplication
function multiplyMatrices() {
    const matrixA = getMatrix('A');
    const matrixB = getMatrix('B');
    const resultDiv = document.getElementById('matrixResult');
    
    try {
        const result = matrixMultiply(matrixA, matrixB);
        const rowsA = matrixA.length;
        const colsA = matrixA[0].length;
        const rowsB = matrixB.length;
        const colsB = matrixB[0].length;

        let sampleDot = '';
        if (colsA > 0 && rowsB > 0) {
            const terms = [];
            for (let k = 0; k < Math.min(colsA, 3); k++) {
                terms.push(`(${matrixA[0][k]} × ${matrixB[k][0]})`);
            }
            if (colsA > 3) terms.push('...');
            sampleDot = `C_{1,1} = ${terms.join(' + ')} = ${result[0][0]}`;
        }

        const matrixSteps = [
            {
                title: 'Check Matrix Compatibility',
                math: `A(${rowsA} × ${colsA}) × B(${rowsB} × ${colsB}) → C(${rowsA} × ${colsB})`,
                explanation: `Multiplication is valid because columns of Matrix A (${colsA}) match rows of Matrix B (${rowsB}). Product dimensions are ${rowsA} × ${colsB}.`
            },
            {
                title: 'Row-Column Dot Product Formula',
                math: `C_{i,j} = \\sum_{k=1}^{${colsA}} A_{i,k} \\cdot B_{k,j}`,
                explanation: 'Each entry C(i, j) in the product matrix is the inner dot product of Row i from Matrix A and Column j from Matrix B.'
            },
            {
                title: 'Sample Calculation (Entry C₁,₁)',
                math: sampleDot || `C_{1,1} = ${result[0][0]}`,
                explanation: 'Multiply corresponding elements of Row 1 from Matrix A with Column 1 from Matrix B and sum them.'
            },
            {
                title: 'Construct Final Result Matrix',
                math: `Computed ${rowsA} × ${colsB} product entries`,
                explanation: 'Repeat inner products across all rows and columns to complete the product matrix.'
            }
        ];
        
        resultDiv.innerHTML = `
            <strong>Matrix Multiplication: A × B</strong><br><br>
            <div class="matrix-equation-view">
                <div class="matrix-equation-item">
                    <strong>Matrix A:</strong>
                    ${formatMatrix(matrixA)}
                </div>
                <div class="matrix-equation-op">×</div>
                <div class="matrix-equation-item">
                    <strong>Matrix B:</strong>
                    ${formatMatrix(matrixB)}
                </div>
                <div class="matrix-equation-op">=</div>
                <div class="matrix-equation-item">
                    <strong>Result:</strong>
                    ${formatMatrix(result)}
                </div>
            </div>
            ${formatStepsTimelineHTML(matrixSteps)}
        `;
        
        addToHistory('A × B', 'calculated');
    } catch (error) {
        resultDiv.innerHTML = `<span style="color: var(--danger)">Error: ${error.message}</span>`;
    }
}

function matrixMultiply(matrixA, matrixB) {
    if (matrixA[0].length !== matrixB.length) {
        throw new Error(`Dimension Mismatch: Cannot multiply Matrix A (${matrixA.length}×${matrixA[0].length}) by Matrix B (${matrixB.length}×${matrixB[0].length}). Matrix A columns (${matrixA[0].length}) must equal Matrix B rows (${matrixB.length}).`);
    }
    
    const result = createMatrix(matrixA.length, matrixB[0].length);
    
    for (let i = 0; i < matrixA.length; i++) {
        for (let j = 0; j < matrixB[0].length; j++) {
            let sum = 0;
            for (let k = 0; k < matrixA[0].length; k++) {
                sum += matrixA[i][k] * matrixB[k][j];
            }
            result[i][j] = sum;
        }
    }
    
    return result;
}

// Scalar multiplication
function scalarMultiply() {
    const matrixA = getMatrix('A');
    const scalar = parseFloat(document.getElementById('scalarValue').value) || 1;
    const resultDiv = document.getElementById('matrixResult');
    
    try {
        const result = matrixScalarMultiply(matrixA, scalar);
        
        resultDiv.innerHTML = `
            <strong>Scalar Multiplication: ${scalar} × A</strong><br><br>
            <div class="matrix-equation-view">
                <div class="matrix-equation-op" style="font-size: 1.8rem;">${scalar}</div>
                <div class="matrix-equation-op">×</div>
                <div class="matrix-equation-item">
                    <strong>Matrix A:</strong>
                    ${formatMatrix(matrixA)}
                </div>
                <div class="matrix-equation-op">=</div>
                <div class="matrix-equation-item">
                    <strong>Result:</strong>
                    ${formatMatrix(result)}
                </div>
            </div>
        `;
        
        addToHistory(`${scalar} × A`, 'calculated');
    } catch (error) {
        resultDiv.innerHTML = `<span style="color: var(--danger)">Error: ${error.message}</span>`;
    }
}

function matrixScalarMultiply(matrix, scalar) {
    const result = createMatrix(matrix.length, matrix[0].length);
    
    for (let i = 0; i < matrix.length; i++) {
        for (let j = 0; j < matrix[0].length; j++) {
            result[i][j] = matrix[i][j] * scalar;
        }
    }
    
    return result;
}

// LU Decomposition
function luDecomposition(matrix) {
    const n = matrix.length;
    const L = createMatrix(n, n);
    const U = copyMatrix(matrix);
    let swaps = 0;
    
    // Initialize L as identity matrix
    for (let i = 0; i < n; i++) {
        L[i][i] = 1;
    }
    
    for (let i = 0; i < n; i++) {
        // Partial pivoting
        let maxRow = i;
        for (let k = i + 1; k < n; k++) {
            if (Math.abs(U[k][i]) > Math.abs(U[maxRow][i])) {
                maxRow = k;
            }
        }
        
        if (maxRow !== i) {
            [U[i], U[maxRow]] = [U[maxRow], U[i]];
            [L[i], L[maxRow]] = [L[maxRow], L[i]];
            swaps++;
        }
        
        // Elimination
        for (let k = i + 1; k < n; k++) {
            if (Math.abs(U[i][i]) < 1e-10) {
                throw new Error('Matrix is singular');
            }
            
            const factor = U[k][i] / U[i][i];
            L[k][i] = factor;
            
            for (let j = i; j < n; j++) {
                U[k][j] -= factor * U[i][j];
            }
        }
    }
    
    return { L, U, swaps };
}

// Linear system solvers
function solveLinearSystem() {
    const { coeffMatrix, constants } = getLinearSystem();
    const method = document.getElementById('solutionMethod').value;
    const resultDiv = document.getElementById('linearSystemResult');
    
    try {
        let solution;
        let methodName;
        
        switch (method) {
            case 'cramer':
                solution = solveByCramer(coeffMatrix, constants);
                methodName = "Cramer's Rule";
                break;
            case 'gaussian':
                solution = solveByGaussian(coeffMatrix, constants);
                methodName = "Gaussian Elimination";
                break;
            case 'matrix':
                solution = solveByMatrix(coeffMatrix, constants);
                methodName = "Matrix Method (A⁻¹b)";
                break;
            case 'lu':
                solution = solveByLU(coeffMatrix, constants);
                methodName = "LU Decomposition";
                break;
            default:
                throw new Error('Unknown solution method');
        }
        
        let solutionHTML = `
            <strong>Linear System Solution (${methodName}):</strong><br><br>
            <strong>System: Ax = b</strong><br><br>
            <div style="display: grid; grid-template-columns: 1fr auto 1fr auto 1fr; gap: 1rem; align-items: center;">
                <div>
                    <strong>Coefficient Matrix A:</strong><br>
                    ${formatMatrix(coeffMatrix)}
                </div>
                <div style="font-size: 1.5rem; text-align: center;">×</div>
                <div>
                    <strong>Variables x:</strong><br>
                    <div class="vector-display">
        `;
        
        for (let i = 0; i < solution.length; i++) {
            solutionHTML += `x<sub>${i+1}</sub><br>`;
        }
        
        solutionHTML += `
                    </div>
                </div>
                <div style="font-size: 1.5rem; text-align: center;">=</div>
                <div>
                    <strong>Constants b:</strong><br>
                    <div class="vector-display">
        `;
        
        for (let i = 0; i < constants.length; i++) {
            solutionHTML += `${constants[i]}<br>`;
        }
        
        solutionHTML += `
                    </div>
                </div>
            </div>
            <br>
            <div class="highlight-result">
                <strong>Solution:</strong><br>
        `;
        
        for (let i = 0; i < solution.length; i++) {
            solutionHTML += `x<sub>${i+1}</sub> = ${solution[i].toFixed(6)}<br>`;
        }
        
        solutionHTML += `
            </div>
            <br>
            <small>Method used: ${methodName}</small>
        `;
        
        resultDiv.innerHTML = solutionHTML;
        addToHistory(`Linear system (${methodName})`, 'solved');
    } catch (error) {
        resultDiv.innerHTML = `<span style="color: var(--danger)">Error: ${error.message}</span>`;
    }
}

// Cramer's rule
function solveByCramer(coeffMatrix, constants) {
    const n = coeffMatrix.length;
    const detA = determinant(coeffMatrix);
    
    if (Math.abs(detA) < 1e-10) {
        throw new Error('System has no unique solution (determinant = 0)');
    }
    
    const solution = [];
    
    for (let i = 0; i < n; i++) {
        const tempMatrix = copyMatrix(coeffMatrix);
        
        // Replace column i with constants
        for (let j = 0; j < n; j++) {
            tempMatrix[j][i] = constants[j];
        }
        
        const detTemp = determinant(tempMatrix);
        solution[i] = detTemp / detA;
    }
    
    return solution;
}

// Gaussian elimination
function solveByGaussian(coeffMatrix, constants) {
    const n = coeffMatrix.length;
    const augmented = coeffMatrix.map((row, i) => [...row, constants[i]]);
    
    // Forward elimination
    for (let i = 0; i < n; i++) {
        // Find pivot
        let maxRow = i;
        for (let k = i + 1; k < n; k++) {
            if (Math.abs(augmented[k][i]) > Math.abs(augmented[maxRow][i])) {
                maxRow = k;
            }
        }
        
        // Swap rows
        [augmented[i], augmented[maxRow]] = [augmented[maxRow], augmented[i]];
        
        // Check for singular matrix
        if (Math.abs(augmented[i][i]) < 1e-10) {
            throw new Error('System has no unique solution');
        }
        
        // Eliminate
        for (let k = i + 1; k < n; k++) {
            const factor = augmented[k][i] / augmented[i][i];
            for (let j = i; j <= n; j++) {
                augmented[k][j] -= factor * augmented[i][j];
            }
        }
    }
    
    // Back substitution
    const solution = new Array(n);
    for (let i = n - 1; i >= 0; i--) {
        solution[i] = augmented[i][n];
        for (let j = i + 1; j < n; j++) {
            solution[i] -= augmented[i][j] * solution[j];
        }
        solution[i] /= augmented[i][i];
    }
    
    return solution;
}

// Matrix method (A^-1 * b)
function solveByMatrix(coeffMatrix, constants) {
    const invA = inverse(coeffMatrix);
    const solution = [];
    
    for (let i = 0; i < invA.length; i++) {
        let sum = 0;
        for (let j = 0; j < constants.length; j++) {
            sum += invA[i][j] * constants[j];
        }
        solution[i] = sum;
    }
    
    return solution;
}

// LU decomposition method
function solveByLU(coeffMatrix, constants) {
    const { L, U } = luDecomposition(coeffMatrix);
    const n = coeffMatrix.length;
    
    // Solve Ly = b (forward substitution)
    const y = new Array(n);
    for (let i = 0; i < n; i++) {
        y[i] = constants[i];
        for (let j = 0; j < i; j++) {
            y[i] -= L[i][j] * y[j];
        }
    }
    
    // Solve Ux = y (back substitution)
    const x = new Array(n);
    for (let i = n - 1; i >= 0; i--) {
        x[i] = y[i];
        for (let j = i + 1; j < n; j++) {
            x[i] -= U[i][j] * x[j];
        }
        x[i] /= U[i][i];
    }
    
    return x;
}

// Matrix utility functions for filling matrices
function fillRandomMatrix(matrixName) {
    const { rows, cols } = getMatrixDimensions(matrixName);
    
    for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cols; j++) {
            const value = Math.floor(Math.random() * 20) - 10;
            const el = document.getElementById(`${matrixName.toLowerCase()}${i}_${j}`) || 
                       document.getElementById(`${matrixName.toLowerCase()}${i}${j}`);
            if (el) el.value = value;
        }
    }
    
    if (typeof showNotification === 'function') {
        showNotification(`Matrix ${matrixName} (${rows}×${cols}) filled with random values`);
    }
}

function fillIdentityMatrix(matrixName) {
    const { rows, cols } = getMatrixDimensions(matrixName);
    
    for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cols; j++) {
            const value = i === j ? 1 : 0;
            const el = document.getElementById(`${matrixName.toLowerCase()}${i}_${j}`) || 
                       document.getElementById(`${matrixName.toLowerCase()}${i}${j}`);
            if (el) el.value = value;
        }
    }
    
    if (typeof showNotification === 'function') {
        showNotification(`Matrix ${matrixName} set to identity (${rows}×${cols})`);
    }
}

function clearMatrix(matrixName) {
    const { rows, cols } = getMatrixDimensions(matrixName);
    
    for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cols; j++) {
            const el = document.getElementById(`${matrixName.toLowerCase()}${i}_${j}`) || 
                       document.getElementById(`${matrixName.toLowerCase()}${i}${j}`);
            if (el) el.value = '';
        }
    }
    
    if (typeof showNotification === 'function') {
        showNotification(`Matrix ${matrixName} cleared`);
    }
}

// Matrix Power: A^k
function calculateMatrixPower(matrixName, power = 2) {
    const matrix = getMatrix(matrixName);
    const resultDiv = document.getElementById('matrixResult');
    if (!resultDiv) return;
    
    if (matrix.length !== matrix[0].length) {
        resultDiv.innerHTML = `<span style="color: var(--danger)">Square Matrix Required: Matrix power Aᵏ is only defined for square (N×N) matrices, but Matrix ${matrixName} has dimensions ${matrix.length}×${matrix[0].length}.</span>`;
        return;
    }
    
    const n = matrix.length;
    let res = createMatrix(n, n);
    for (let i = 0; i < n; i++) res[i][i] = 1; // Identity
    
    for (let p = 0; p < power; p++) {
        res = matrixMultiply(res, matrix);
    }
    
    resultDiv.innerHTML = `
        <strong>Matrix Power: ${matrixName}<sup>${power}</sup></strong><br><br>
        <div class="matrix-equation-view">
            <div class="matrix-equation-item">
                <strong>Matrix ${matrixName}:</strong>
                ${formatMatrix(matrix)}
            </div>
            <div class="matrix-equation-op">→</div>
            <div class="matrix-equation-item">
                <strong>Result (${matrixName}<sup>${power}</sup>):</strong>
                ${formatMatrix(res)}
            </div>
        </div>
    `;
    addToHistory(`${matrixName}^${power}`, 'calculated');
}

// Matrix Norms: Frobenius, L1, L-Infinity
function calculateMatrixNorms(matrixName) {
    const matrix = getMatrix(matrixName);
    const resultDiv = document.getElementById('matrixResult');
    if (!resultDiv) return;
    
    const rows = matrix.length;
    const cols = matrix[0].length;
    
    // Frobenius Norm: sqrt(sum(a_ij^2))
    let sumSq = 0;
    for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cols; j++) {
            sumSq += matrix[i][j] * matrix[i][j];
        }
    }
    const frobNorm = Math.sqrt(sumSq);
    
    // L1 Norm: Maximum absolute column sum
    let maxColSum = 0;
    for (let j = 0; j < cols; j++) {
        let colSum = 0;
        for (let i = 0; i < rows; i++) {
            colSum += Math.abs(matrix[i][j]);
        }
        if (colSum > maxColSum) maxColSum = colSum;
    }
    
    // L-Infinity Norm: Maximum absolute row sum
    let maxRowSum = 0;
    for (let i = 0; i < rows; i++) {
        let rowSum = 0;
        for (let j = 0; j < cols; j++) {
            rowSum += Math.abs(matrix[i][j]);
        }
        if (rowSum > maxRowSum) maxRowSum = rowSum;
    }
    
    resultDiv.innerHTML = `
        <strong>Matrix Norms for Matrix ${matrixName} (${rows}×${cols}):</strong><br><br>
        ${formatMatrix(matrix)}<br>
        <ul style="margin-top: 10px; line-height: 1.8;">
            <li><strong>Frobenius Norm (||A||<sub>F</sub>):</strong> ${frobNorm.toFixed(6)}</li>
            <li><strong>1-Norm / Maximum Column Sum (||A||<sub>1</sub>):</strong> ${maxColSum.toFixed(6)}</li>
            <li><strong>Infinity Norm / Maximum Row Sum (||A||<sub>∞</sub>):</strong> ${maxRowSum.toFixed(6)}</li>
        </ul>
    `;
    addToHistory(`||${matrixName}||`, frobNorm.toFixed(4));
}

// Kronecker Product A (x) B
function calculateKroneckerProduct() {
    const A = getMatrix('A');
    const B = getMatrix('B');
    const resultDiv = document.getElementById('matrixResult');
    if (!resultDiv) return;
    
    const rA = A.length, cA = A[0].length;
    const rB = B.length, cB = B[0].length;
    const rC = rA * rB, cC = cA * cB;
    
    if (rC > 20 || cC > 20) {
        resultDiv.innerHTML = `<span style="color: var(--danger)">Matrix Size Error: Kronecker product result would be ${rC}×${cC} (> 20×20). Please use smaller input dimensions.</span>`;
        return;
    }
    
    const C = createMatrix(rC, cC);
    for (let i = 0; i < rA; i++) {
        for (let j = 0; j < cA; j++) {
            for (let k = 0; k < rB; k++) {
                for (let l = 0; l < cB; l++) {
                    C[i * rB + k][j * cB + l] = A[i][j] * B[k][l];
                }
            }
        }
    }
    
    resultDiv.innerHTML = `
        <strong>Kronecker Product (A ⊗ B): Result ${rC}×${cC}</strong><br><br>
        ${formatMatrix(C)}
    `;
    addToHistory('A ⊗ B', 'calculated');
}

// Scalar multiply helper
function calculateScalarMultiply(matrixName, scalar = 2) {
    const matrix = getMatrix(matrixName);
    const resultDiv = document.getElementById('matrixResult');
    if (!resultDiv) return;
    
    const rows = matrix.length;
    const cols = matrix[0].length;
    const res = createMatrix(rows, cols);
    for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cols; j++) {
            res[i][j] = matrix[i][j] * scalar;
        }
    }
    
    resultDiv.innerHTML = `
        <strong>Scalar Multiplication: ${scalar} × Matrix ${matrixName}</strong><br><br>
        ${formatMatrix(res)}
    `;
    addToHistory(`${scalar} × ${matrixName}`, 'calculated');
}

// Load matrix examples
function loadMatrixExample(exampleType) {
    switch (exampleType) {
        case 'rotation':
            // 2D rotation matrix (45 degrees)
            document.getElementById('matrixARows').value = '2';
            updateMatrixInputs('A');
            const cos45 = Math.cos(Math.PI / 4);
            const sin45 = Math.sin(Math.PI / 4);
            document.getElementById('a00').value = cos45.toFixed(4);
            document.getElementById('a01').value = (-sin45).toFixed(4);
            document.getElementById('a10').value = sin45.toFixed(4);
            document.getElementById('a11').value = cos45.toFixed(4);
            showNotification('Loaded 2D rotation matrix (45°)');
            break;
            
        case 'system':
            // 3x3 solvable system
            document.getElementById('systemSize').value = '3';
            updateSystemInputs();
            // Coefficient matrix
            const coeffs = [[2, 1, -1], [-3, -1, 2], [-2, 1, 2]];
            const consts = [8, -11, -3];
            
            for (let i = 0; i < 3; i++) {
                for (let j = 0; j < 3; j++) {
                    document.getElementById(`coeff${i}${j}`).value = coeffs[i][j];
                }
                document.getElementById(`const${i}`).value = consts[i];
            }
            showNotification('Loaded 3×3 linear system example');
            break;
            
        case 'symmetric':
            // Symmetric matrix with real eigenvalues
            document.getElementById('matrixARows').value = '3';
            updateMatrixInputs('A');
            const symMatrix = [[4, -2, 1], [-2, 5, -3], [1, -3, 6]];
            
            for (let i = 0; i < 3; i++) {
                for (let j = 0; j < 3; j++) {
                    document.getElementById(`a${i}${j}`).value = symMatrix[i][j];
                }
            }
            showNotification('Loaded symmetric matrix example');
            break;
            
        case 'singular':
            // Singular matrix (determinant = 0)
            document.getElementById('matrixARows').value = '3';
            updateMatrixInputs('A');
            const singMatrix = [[1, 2, 3], [4, 5, 6], [7, 8, 9]];
            
            for (let i = 0; i < 3; i++) {
                for (let j = 0; j < 3; j++) {
                    document.getElementById(`a${i}${j}`).value = singMatrix[i][j];
                }
            }
            showNotification('Loaded singular matrix example');
            break;
    }
}

// Get linear system (if not already defined)
function getLinearSystem() {
    const size = parseInt(document.getElementById('systemSize').value);
    const coeffMatrix = [];
    const constants = [];
    
    for (let i = 0; i < size; i++) {
        coeffMatrix[i] = [];
        for (let j = 0; j < size; j++) {
            const value = parseFloat(document.getElementById(`coeff${i}${j}`).value) || 0;
            coeffMatrix[i][j] = value;
        }
        constants[i] = parseFloat(document.getElementById(`const${i}`).value) || 0;
    }
    
    return { coeffMatrix, constants };
}

// Calculate eigenvectors
function calculateEigenvectors(matrixName) {
    const matrix = getMatrix(matrixName);
    const resultDiv = document.getElementById('eigenResult');
    
    try {
        const eigenvals = eigenvalues(matrix);
        const eigenvecs = [];
        
        for (let i = 0; i < eigenvals.length; i++) {
            const lambda = typeof eigenvals[i] === 'object' ? eigenvals[i].real : eigenvals[i];
            const eigenvec = findEigenvector(matrix, lambda);
            eigenvecs.push(eigenvec);
        }
        
        let eigenHTML = `
            <strong>Eigenvectors of Matrix ${matrixName}:</strong><br><br>
            ${formatMatrix(matrix)}<br><br>
        `;
        
        for (let i = 0; i < eigenvals.length; i++) {
            eigenHTML += `<div class="eigenvector-item">`;
            
            if (typeof eigenvals[i] === 'object') {
                eigenHTML += `<strong>λ${i+1} = ${eigenvals[i].real.toFixed(4)} ${eigenvals[i].imag >= 0 ? '+' : ''}${eigenvals[i].imag.toFixed(4)}i</strong><br>`;
                eigenHTML += `<small>Complex eigenvalue - eigenvector calculation not shown</small>`;
            } else {
                eigenHTML += `<strong>λ${i+1} = ${eigenvals[i].toFixed(6)}</strong><br>`;
                eigenHTML += `<strong>Eigenvector v${i+1}:</strong><br>`;
                eigenHTML += `<div class="vector-display">`;
                for (let j = 0; j < eigenvecs[i].length; j++) {
                    eigenHTML += `${eigenvecs[i][j].toFixed(4)}<br>`;
                }
                eigenHTML += `</div>`;
                eigenHTML += `<small>Normalized eigenvector</small>`;
            }
            
            eigenHTML += `</div><br>`;
        }
        
        eigenHTML += `<small>Eigenvectors satisfy: Av = λv</small>`;
        
        resultDiv.innerHTML = eigenHTML;
        addToHistory(`eigenvectors(${matrixName})`, 'calculated');
    } catch (error) {
        resultDiv.innerHTML = `<span style="color: var(--danger)">Error: ${error.message}</span>`;
    }
}

// Find eigenvector for a given eigenvalue
function findEigenvector(matrix, lambda) {
    const n = matrix.length;
    const A = copyMatrix(matrix);
    
    // Create (A - λI)
    for (let i = 0; i < n; i++) {
        A[i][i] -= lambda;
    }
    
    // Solve (A - λI)v = 0 using null space
    // Use row reduction to find null space
    const tolerance = 1e-10;
    
    // Augment with zero vector
    const augmented = A.map(row => [...row, 0]);
    
    // Row reduction
    for (let col = 0; col < n && col < n; col++) {
        // Find pivot
        let pivot = -1;
        for (let row = col; row < n; row++) {
            if (Math.abs(augmented[row][col]) > tolerance) {
                pivot = row;
                break;
            }
        }
        
        if (pivot === -1) continue;
        
        // Swap rows
        if (pivot !== col) {
            [augmented[col], augmented[pivot]] = [augmented[pivot], augmented[col]];
        }
        
        // Normalize pivot row
        const pivotVal = augmented[col][col];
        for (let j = 0; j <= n; j++) {
            augmented[col][j] /= pivotVal;
        }
        
        // Eliminate column
        for (let row = 0; row < n; row++) {
            if (row !== col && Math.abs(augmented[row][col]) > tolerance) {
                const factor = augmented[row][col];
                for (let j = 0; j <= n; j++) {
                    augmented[row][j] -= factor * augmented[col][j];
                }
            }
        }
    }
    
    // Find free variable and construct eigenvector
    const eigenvector = new Array(n).fill(0);
    let freeVar = -1;
    
    for (let i = 0; i < n; i++) {
        let isZeroRow = true;
        for (let j = 0; j < n; j++) {
            if (Math.abs(augmented[i][j]) > tolerance) {
                isZeroRow = false;
                break;
            }
        }
        if (isZeroRow) {
            freeVar = i;
            break;
        }
    }
    
    if (freeVar === -1) freeVar = n - 1;
    
    eigenvector[freeVar] = 1;
    
    // Back substitute
    for (let i = n - 1; i >= 0; i--) {
        if (i === freeVar) continue;
        
        let sum = 0;
        for (let j = i + 1; j < n; j++) {
            sum += augmented[i][j] * eigenvector[j];
        }
        
        if (Math.abs(augmented[i][i]) > tolerance) {
            eigenvector[i] = -sum / augmented[i][i];
        }
    }
    
    // Normalize
    let norm = 0;
    for (let i = 0; i < n; i++) {
        norm += eigenvector[i] * eigenvector[i];
    }
    norm = Math.sqrt(norm);
    
    for (let i = 0; i < n; i++) {
        eigenvector[i] /= norm;
    }
    
    return eigenvector;
}

// Calculate complete eigen system (eigenvalues + eigenvectors)
function calculateEigenSystem(matrixName) {
    const matrix = getMatrix(matrixName);
    const resultDiv = document.getElementById('eigenResult');
    
    try {
        const eigenvals = eigenvalues(matrix);
        const eigenvecs = [];
        
        for (let i = 0; i < eigenvals.length; i++) {
            if (typeof eigenvals[i] !== 'object') {
                const lambda = eigenvals[i];
                const eigenvec = findEigenvector(matrix, lambda);
                eigenvecs.push(eigenvec);
            } else {
                eigenvecs.push(null);
            }
        }
        
        let eigenHTML = `
            <strong>Complete Eigen System of Matrix ${matrixName}:</strong><br><br>
            <strong>Original Matrix:</strong><br>
            ${formatMatrix(matrix)}<br><br>
            <div class="eigen-system-display">
        `;
        
        for (let i = 0; i < eigenvals.length; i++) {
            eigenHTML += `<div class="eigen-pair">`;
            
            if (typeof eigenvals[i] === 'object') {
                eigenHTML += `
                    <div class="eigenvalue-box complex">
                        <strong>λ${i+1} = ${eigenvals[i].real.toFixed(4)} ${eigenvals[i].imag >= 0 ? '+' : ''}${eigenvals[i].imag.toFixed(4)}i</strong>
                        <br><small>Complex eigenvalue</small>
                    </div>
                `;
            } else {
                eigenHTML += `
                    <div class="eigenvalue-box real">
                        <strong>λ${i+1} = ${eigenvals[i].toFixed(6)}</strong>
                    </div>
                    <div class="eigenvector-box">
                        <strong>v${i+1} =</strong>
                        <div class="vector-display">
                `;
                
                for (let j = 0; j < eigenvecs[i].length; j++) {
                    eigenHTML += `${eigenvecs[i][j].toFixed(4)}<br>`;
                }
                
                eigenHTML += `
                        </div>
                    </div>
                    <div class="verification">
                        <small>Av${i+1} = λ${i+1}v${i+1}</small>
                    </div>
                `;
            }
            
            eigenHTML += `</div>`;
        }
        
        eigenHTML += `
            </div>
            <br>
            <div class="eigen-properties">
                <strong>Properties:</strong><br>
                • Trace = Sum of eigenvalues = ${trace(matrix).toFixed(4)}<br>
                • Determinant = Product of eigenvalues = ${determinant(matrix).toFixed(4)}<br>
                • Eigenvectors are linearly independent (for distinct eigenvalues)
            </div>
        `;
        
        resultDiv.innerHTML = eigenHTML;
        addToHistory(`eigen-system(${matrixName})`, 'calculated');
    } catch (error) {
        resultDiv.innerHTML = `<span style="color: var(--danger)">Error: ${error.message}</span>`;
    }
}

// Solve determinant equations
function solveDeterminantEquation() {
    const matrix = getDetMatrix();
    const equationType = document.getElementById('detEquationType').value;
    const paramSymbol = document.getElementById('parameterSymbol').value || 'λ';
    const resultDiv = document.getElementById('detEquationResult');
    
    try {
        let resultHTML = '';
        
        switch (equationType) {
            case 'characteristic':
                resultHTML = solveCharacteristicEquation(matrix, paramSymbol);
                break;
            case 'homogeneous':
                resultHTML = solveHomogeneousSystem(matrix);
                break;
            case 'parametric':
                resultHTML = solveParametricDeterminant(matrix, paramSymbol);
                break;
            case 'custom':
                resultHTML = solveCustomDeterminant(matrix, paramSymbol);
                break;
        }
        
        resultDiv.innerHTML = resultHTML;
        addToHistory(`det equation (${equationType})`, 'solved');
    } catch (error) {
        resultDiv.innerHTML = `<span style="color: var(--danger)">Error: ${error.message}</span>`;
    }
}

// Solve characteristic equation det(A - λI) = 0
function solveCharacteristicEquation(matrix, paramSymbol) {
    const n = matrix.length;
    
    let html = `
        <strong>Characteristic Equation: det(A - ${paramSymbol}I) = 0</strong><br><br>
        <strong>Matrix A:</strong><br>
        ${formatMatrix(matrix)}<br><br>
    `;
    
    // Build characteristic polynomial
    if (n === 2) {
        const a = matrix[0][0];
        const b = matrix[0][1];
        const c = matrix[1][0];
        const d = matrix[1][1];
        
        const trace = a + d;
        const det = a * d - b * c;
        
        html += `
            <strong>Characteristic Polynomial:</strong><br>
            det(A - ${paramSymbol}I) = (${a} - ${paramSymbol})(${d} - ${paramSymbol}) - (${b})(${c})<br>
            = ${paramSymbol}² - ${trace}${paramSymbol} + ${det}<br>
            = ${paramSymbol}² ${trace >= 0 ? '-' : '+'} ${Math.abs(trace)}${paramSymbol} ${det >= 0 ? '+' : ''} ${det}<br><br>
        `;
        
        const discriminant = trace * trace - 4 * det;
        
        html += `<strong>Solving ${paramSymbol}² ${trace >= 0 ? '-' : '+'} ${Math.abs(trace)}${paramSymbol} ${det >= 0 ? '+' : ''} ${det} = 0:</strong><br><br>`;
        
        if (discriminant >= 0) {
            const sqrt_disc = Math.sqrt(discriminant);
            const lambda1 = (trace + sqrt_disc) / 2;
            const lambda2 = (trace - sqrt_disc) / 2;
            
            html += `
                <div class="highlight-result">
                    ${paramSymbol}₁ = ${lambda1.toFixed(6)}<br>
                    ${paramSymbol}₂ = ${lambda2.toFixed(6)}
                </div>
                <br>
                <strong>Discriminant:</strong> Δ = ${discriminant.toFixed(4)} (Real roots)
            `;
        } else {
            const sqrt_disc = Math.sqrt(-discriminant);
            const real = trace / 2;
            const imag = sqrt_disc / 2;
            
            html += `
                <div class="highlight-result">
                    ${paramSymbol}₁ = ${real.toFixed(4)} + ${imag.toFixed(4)}i<br>
                    ${paramSymbol}₂ = ${real.toFixed(4)} - ${imag.toFixed(4)}i
                </div>
                <br>
                <strong>Discriminant:</strong> Δ = ${discriminant.toFixed(4)} (Complex roots)
            `;
        }
    } else if (n === 3) {
        const eigenvals = eigenvalues(matrix);
        
        html += `
            <strong>Characteristic Polynomial (3×3):</strong><br>
            det(A - ${paramSymbol}I) = -${paramSymbol}³ + p₂${paramSymbol}² + p₁${paramSymbol} + p₀<br><br>
            
            <strong>Solutions (Eigenvalues):</strong><br>
            <div class="highlight-result">
        `;
        
        eigenvals.forEach((val, i) => {
            if (typeof val === 'object') {
                html += `${paramSymbol}${i+1} = ${val.real.toFixed(4)} ${val.imag >= 0 ? '+' : ''}${val.imag.toFixed(4)}i<br>`;
            } else {
                html += `${paramSymbol}${i+1} = ${val.toFixed(6)}<br>`;
            }
        });
        
        html += `
            </div>
            <br>
            <strong>Verification:</strong><br>
            • Sum of roots = Trace(A) = ${trace(matrix).toFixed(4)}<br>
            • Product of roots = det(A) = ${determinant(matrix).toFixed(4)}
        `;
    }
    
    return html;
}

// Solve homogeneous system
function solveHomogeneousSystem(matrix) {
    const det = determinant(matrix);
    
    let html = `
        <strong>Homogeneous System: Ax = 0</strong><br><br>
        <strong>Coefficient Matrix A:</strong><br>
        ${formatMatrix(matrix)}<br><br>
        <strong>Determinant:</strong> det(A) = ${det.toFixed(6)}<br><br>
    `;
    
    if (Math.abs(det) < 1e-10) {
        html += `
            <div class="highlight-result">
                det(A) = 0 (Singular Matrix)
            </div>
            <br>
            <strong>Solution:</strong> Non-trivial solutions exist!<br><br>
            <strong>Finding null space (non-zero solutions):</strong><br>
        `;
        
        // Find null space
        const nullSpace = findNullSpace(matrix);
        
        if (nullSpace.length > 0) {
            html += `<strong>Basis vectors for null space:</strong><br>`;
            nullSpace.forEach((vec, i) => {
                html += `<div class="vector-display">`;
                html += `<strong>v${i+1} =</strong><br>`;
                vec.forEach(val => {
                    html += `${val.toFixed(4)}<br>`;
                });
                html += `</div>`;
            });
            
            html += `<br><small>General solution: x = c₁v₁ + c₂v₂ + ... (linear combination)</small>`;
        }
    } else {
        html += `
            <div class="highlight-result">
                det(A) ≠ 0 (Non-singular Matrix)
            </div>
            <br>
            <strong>Solution:</strong> Only the trivial solution x = 0 exists<br>
            <small>When det(A) ≠ 0, the only solution to Ax = 0 is x = 0</small>
        `;
    }
    
    return html;
}

// Find null space of a matrix
function findNullSpace(matrix) {
    const n = matrix.length;
    const m = matrix[0].length;
    const A = copyMatrix(matrix);
    const tolerance = 1e-10;
    
    // Row reduction
    let rank = 0;
    const pivotCols = [];
    
    for (let col = 0; col < m && rank < n; col++) {
        // Find pivot
        let pivot = -1;
        for (let row = rank; row < n; row++) {
            if (Math.abs(A[row][col]) > tolerance) {
                pivot = row;
                break;
            }
        }
        
        if (pivot === -1) continue;
        
        pivotCols.push(col);
        
        // Swap rows
        if (pivot !== rank) {
            [A[rank], A[pivot]] = [A[pivot], A[rank]];
        }
        
        // Normalize
        const pivotVal = A[rank][col];
        for (let j = 0; j < m; j++) {
            A[rank][j] /= pivotVal;
        }
        
        // Eliminate
        for (let row = 0; row < n; row++) {
            if (row !== rank && Math.abs(A[row][col]) > tolerance) {
                const factor = A[row][col];
                for (let j = 0; j < m; j++) {
                    A[row][j] -= factor * A[rank][j];
                }
            }
        }
        
        rank++;
    }
    
    // Find free variables
    const freeVars = [];
    for (let i = 0; i < m; i++) {
        if (!pivotCols.includes(i)) {
            freeVars.push(i);
        }
    }
    
    // Construct basis vectors
    const nullSpace = [];
    
    for (let freeVar of freeVars) {
        const vec = new Array(m).fill(0);
        vec[freeVar] = 1;
        
        // Back substitute
        for (let i = rank - 1; i >= 0; i--) {
            const pivotCol = pivotCols[i];
            let sum = 0;
            for (let j = pivotCol + 1; j < m; j++) {
                sum += A[i][j] * vec[j];
            }
            vec[pivotCol] = -sum;
        }
        
        nullSpace.push(vec);
    }
    
    return nullSpace;
}

// Solve parametric determinant
function solveParametricDeterminant(matrix, paramSymbol) {
    return solveCharacteristicEquation(matrix, paramSymbol);
}

// Solve custom determinant
function solveCustomDeterminant(matrix, paramSymbol) {
    const det = determinant(matrix);
    
    return `
        <strong>Custom Determinant Calculation:</strong><br><br>
        <strong>Matrix:</strong><br>
        ${formatMatrix(matrix)}<br><br>
        <div class="highlight-result">
            det(A) = ${det.toFixed(6)}
        </div>
        <br>
        <strong>Setting det(A) = 0:</strong><br>
        ${det.toFixed(6)} = 0<br><br>
        ${Math.abs(det) < 1e-10 ? 
            '<span style="color: var(--success)">✓ The determinant is zero (matrix is singular)</span>' :
            '<span style="color: var(--warning)">✗ The determinant is not zero (matrix is non-singular)</span>'
        }
    `;
}

// ==========================================================================
// ARBITRARY & LARGE MATRIX ENGINE (Up to 100x100)
// ==========================================================================

var largeMatrixState = {
    A: { rows: 5, cols: 5, data: null },
    B: { rows: 5, cols: 5, data: null },
    result: { rows: 0, cols: 0, data: null, name: 'Result' },
    activeView: 'result',
    pageRow: 0,
    pageCol: 0,
    pageSize: 10
};

function createZeroMatrix(rows, cols) {
    const mat = new Array(rows);
    for (let i = 0; i < rows; i++) {
        mat[i] = new Float64Array(cols);
    }
    return mat;
}

function generateRandomLargeMatrix(targetName, r, c, min = -10, max = 10, isInt = true, sparsity = 0) {
    const rows = Math.min(100, Math.max(1, parseInt(r) || 5));
    const cols = Math.min(100, Math.max(1, parseInt(c) || 5));
    const mat = createZeroMatrix(rows, cols);
    
    for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cols; j++) {
            if (sparsity > 0 && Math.random() < sparsity) {
                mat[i][j] = 0;
            } else {
                let val = min + Math.random() * (max - min);
                mat[i][j] = isInt ? Math.round(val) : parseFloat(val.toFixed(2));
            }
        }
    }
    
    largeMatrixState[targetName] = { rows, cols, data: mat };
    largeMatrixState.activeView = targetName;
    largeMatrixState.pageRow = 0;
    largeMatrixState.pageCol = 0;
    renderLargeMatrixViewer();
    if (typeof showNotification === 'function') {
        showNotification(`Generated Matrix ${targetName} (${rows}×${cols})`);
    }
    return mat;
}

function setLargeIdentity(targetName, n) {
    const size = Math.min(100, Math.max(1, parseInt(n) || 5));
    const mat = createZeroMatrix(size, size);
    for (let i = 0; i < size; i++) {
        mat[i][i] = 1;
    }
    largeMatrixState[targetName] = { rows: size, cols: size, data: mat };
    largeMatrixState.activeView = targetName;
    largeMatrixState.pageRow = 0;
    largeMatrixState.pageCol = 0;
    renderLargeMatrixViewer();
    if (typeof showNotification === 'function') {
        showNotification(`Created Identity Matrix ${targetName} (${size}×${size})`);
    }
    return mat;
}

function parseCustomLargeMatrix(targetName, rawText) {
    if (!rawText || !rawText.trim()) return null;
    const lines = rawText.trim().split(/\r?\n/).filter(line => line.trim().length > 0);
    const parsed = [];
    let maxCols = 0;
    for (let line of lines) {
        const row = line.trim().split(/[\s,;]+/).filter(x => x.length > 0).map(Number);
        if (row.some(isNaN)) {
            if (typeof showNotification === 'function') showNotification('Error parsing numbers in custom matrix');
            return null;
        }
        maxCols = Math.max(maxCols, row.length);
        parsed.push(row);
    }
    const rows = Math.min(100, parsed.length);
    const cols = Math.min(100, maxCols);
    const mat = createZeroMatrix(rows, cols);
    for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cols; j++) {
            mat[i][j] = parsed[i][j] !== undefined ? parsed[i][j] : 0;
        }
    }
    largeMatrixState[targetName] = { rows, cols, data: mat };
    largeMatrixState.activeView = targetName;
    largeMatrixState.pageRow = 0;
    largeMatrixState.pageCol = 0;
    renderLargeMatrixViewer();
    if (typeof showNotification === 'function') {
        showNotification(`Loaded Custom Matrix ${targetName} (${rows}×${cols})`);
    }
    return mat;
}

function multiplyLargeMatricesOp() {
    const A = largeMatrixState.A;
    const B = largeMatrixState.B;
    if (!A.data || !B.data) {
        if (typeof showNotification === 'function') showNotification('Please generate or input Matrix A and Matrix B first');
        return null;
    }
    if (A.cols !== B.rows) {
        const msg = `Multiplication error: A columns (${A.cols}) must equal B rows (${B.rows})`;
        if (typeof showNotification === 'function') showNotification(msg);
        return null;
    }
    
    const t0 = (typeof performance !== 'undefined' && performance.now) ? performance.now() : Date.now();
    const rA = A.rows;
    const cA = A.cols;
    const cB = B.cols;
    const C = createZeroMatrix(rA, cB);
    
    for (let i = 0; i < rA; i++) {
        const rowA = A.data[i];
        const rowC = C[i];
        for (let k = 0; k < cA; k++) {
            const aik = rowA[k];
            if (aik === 0) continue;
            const rowB = B.data[k];
            for (let j = 0; j < cB; j++) {
                rowC[j] += aik * rowB[j];
            }
        }
    }
    const t1 = (typeof performance !== 'undefined' && performance.now) ? performance.now() : Date.now();
    const dt = (t1 - t0).toFixed(2);
    
    largeMatrixState.result = {
        rows: rA,
        cols: cB,
        data: C,
        name: `A × B (${rA}×${cB})`,
        timeMs: dt
    };
    largeMatrixState.activeView = 'result';
    largeMatrixState.pageRow = 0;
    largeMatrixState.pageCol = 0;
    renderLargeMatrixViewer();
    if (typeof showNotification === 'function') {
        showNotification(`Multiplied A × B (${rA}×${cB}) in ${dt}ms`);
    }
    return C;
}

function addLargeMatricesOp() {
    const A = largeMatrixState.A;
    const B = largeMatrixState.B;
    if (!A.data || !B.data) {
        if (typeof showNotification === 'function') showNotification('Please generate or input Matrix A and Matrix B first');
        return null;
    }
    if (A.rows !== B.rows || A.cols !== B.cols) {
        const msg = `Addition error: Dimensions must match (${A.rows}×${A.cols} vs ${B.rows}×${B.cols})`;
        if (typeof showNotification === 'function') showNotification(msg);
        return null;
    }
    const rows = A.rows;
    const cols = A.cols;
    const C = createZeroMatrix(rows, cols);
    for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cols; j++) {
            C[i][j] = A.data[i][j] + B.data[i][j];
        }
    }
    largeMatrixState.result = {
        rows, cols, data: C,
        name: `A + B (${rows}×${cols})`
    };
    largeMatrixState.activeView = 'result';
    largeMatrixState.pageRow = 0;
    largeMatrixState.pageCol = 0;
    renderLargeMatrixViewer();
    return C;
}

function subtractLargeMatricesOp() {
    const A = largeMatrixState.A;
    const B = largeMatrixState.B;
    if (!A.data || !B.data) {
        if (typeof showNotification === 'function') showNotification('Please generate or input Matrix A and Matrix B first');
        return null;
    }
    if (A.rows !== B.rows || A.cols !== B.cols) {
        const msg = `Subtraction error: Dimensions must match (${A.rows}×${A.cols} vs ${B.rows}×${B.cols})`;
        if (typeof showNotification === 'function') showNotification(msg);
        return null;
    }
    const rows = A.rows;
    const cols = A.cols;
    const C = createZeroMatrix(rows, cols);
    for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cols; j++) {
            C[i][j] = A.data[i][j] - B.data[i][j];
        }
    }
    largeMatrixState.result = {
        rows, cols, data: C,
        name: `A - B (${rows}×${cols})`
    };
    largeMatrixState.activeView = 'result';
    largeMatrixState.pageRow = 0;
    largeMatrixState.pageCol = 0;
    renderLargeMatrixViewer();
    return C;
}

function transposeLargeMatrixOp(targetName) {
    const src = largeMatrixState[targetName];
    if (!src || !src.data) {
        if (typeof showNotification === 'function') showNotification(`Matrix ${targetName} is empty`);
        return null;
    }
    const rows = src.rows;
    const cols = src.cols;
    const C = createZeroMatrix(cols, rows);
    for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cols; j++) {
            C[j][i] = src.data[i][j];
        }
    }
    largeMatrixState.result = {
        rows: cols,
        cols: rows,
        data: C,
        name: `${targetName}ᵀ (${cols}×${rows})`
    };
    largeMatrixState.activeView = 'result';
    largeMatrixState.pageRow = 0;
    largeMatrixState.pageCol = 0;
    renderLargeMatrixViewer();
    return C;
}

function scalarMultiplyLargeOp(targetName, scalar) {
    const src = largeMatrixState[targetName];
    if (!src || !src.data) {
        if (typeof showNotification === 'function') showNotification(`Matrix ${targetName} is empty`);
        return null;
    }
    const s = parseFloat(scalar);
    if (isNaN(s)) return null;
    const rows = src.rows;
    const cols = src.cols;
    const C = createZeroMatrix(rows, cols);
    for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cols; j++) {
            C[i][j] = src.data[i][j] * s;
        }
    }
    largeMatrixState.result = {
        rows, cols, data: C,
        name: `${s} × ${targetName} (${rows}×${cols})`
    };
    largeMatrixState.activeView = 'result';
    largeMatrixState.pageRow = 0;
    largeMatrixState.pageCol = 0;
    renderLargeMatrixViewer();
    return C;
}

function computeLargeMatrixStats(mat, rows, cols) {
    if (!mat) return null;
    let sumSq = 0;
    let trace = 0;
    let min = Infinity;
    let max = -Infinity;
    let zeros = 0;
    const isSquare = rows === cols;
    
    for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cols; j++) {
            const v = mat[i][j];
            sumSq += v * v;
            if (v < min) min = v;
            if (v > max) max = v;
            if (v === 0) zeros++;
            if (isSquare && i === j) trace += v;
        }
    }
    const norm = Math.sqrt(sumSq);
    const total = rows * cols;
    const sparsity = total > 0 ? ((zeros / total) * 100).toFixed(1) : 0;
    return {
        rows, cols,
        isSquare,
        trace: isSquare ? trace.toFixed(4) : 'N/A',
        norm: norm.toFixed(4),
        min: min === Infinity ? 0 : min,
        max: max === -Infinity ? 0 : max,
        sparsity: `${sparsity}%`
    };
}

function renderLargeMatrixViewer() {
    const container = document.getElementById('largeMatrixViewer');
    if (!container) return;
    
    const active = largeMatrixState.activeView;
    const obj = largeMatrixState[active];
    if (!obj || !obj.data) {
        container.innerHTML = '<p class="no-result">No matrix data generated yet. Click Generate or Identity to begin.</p>';
        return;
    }
    
    const { rows, cols, data, name, timeMs } = obj;
    const stats = computeLargeMatrixStats(data, rows, cols);
    
    const pageSize = largeMatrixState.pageSize || 10;
    const pageRow = largeMatrixState.pageRow || 0;
    const pageCol = largeMatrixState.pageCol || 0;
    
    const endRow = Math.min(rows, pageRow + pageSize);
    const endCol = Math.min(cols, pageCol + pageSize);
    
    let html = `
        <div class="matrix-stats-pills">
            <span class="matrix-stat-pill">Viewing: <strong>${name || active}</strong></span>
            <span class="matrix-stat-pill">Dimensions: <strong>${rows} × ${cols}</strong></span>
            <span class="matrix-stat-pill">Trace: <strong>${stats.trace}</strong></span>
            <span class="matrix-stat-pill">Frobenius Norm: <strong>${stats.norm}</strong></span>
            <span class="matrix-stat-pill">Range: <strong>[${stats.min}, ${stats.max}]</strong></span>
            <span class="matrix-stat-pill">Sparsity: <strong>${stats.sparsity}</strong></span>
            ${timeMs ? `<span class="matrix-stat-pill">Time: <strong>${timeMs}ms</strong></span>` : ''}
        </div>
        
        <div class="matrix-pagination-bar">
            <div>
                Showing Rows ${pageRow + 1}-${endRow} of ${rows}, Cols ${pageCol + 1}-${endCol} of ${cols}
            </div>
            <div style="display: flex; gap: 6px;">
                <button class="btn btn-sm btn-matrix-action" onclick="changeLargeMatrixPage('row', -10)" ${pageRow === 0 ? 'disabled' : ''}>▲ Rows -10</button>
                <button class="btn btn-sm btn-matrix-action" onclick="changeLargeMatrixPage('row', 10)" ${endRow >= rows ? 'disabled' : ''}>▼ Rows +10</button>
                <button class="btn btn-sm btn-matrix-action" onclick="changeLargeMatrixPage('col', -10)" ${pageCol === 0 ? 'disabled' : ''}>◀ Cols -10</button>
                <button class="btn btn-sm btn-matrix-action" onclick="changeLargeMatrixPage('col', 10)" ${endCol >= cols ? 'disabled' : ''}>▶ Cols +10</button>
            </div>
            <div style="display: flex; gap: 6px;">
                <button class="btn btn-sm btn-matrix-action" onclick="copyLargeMatrixCSV('${active}')"><i class="fas fa-copy"></i> Copy CSV</button>
                <button class="btn btn-sm btn-matrix-action" onclick="downloadLargeMatrixCSV('${active}')"><i class="fas fa-download"></i> Download CSV</button>
            </div>
        </div>
        
        <div class="matrix-viewer-wrapper">
            <table class="matrix-virtual-table">
                <thead>
                    <tr>
                        <th>R \\ C</th>
    `;
    
    for (let j = pageCol; j < endCol; j++) {
        html += `<th>C${j + 1}</th>`;
    }
    html += `</tr></thead><tbody>`;
    
    for (let i = pageRow; i < endRow; i++) {
        html += `<tr><th>R${i + 1}</th>`;
        for (let j = pageCol; j < endCol; j++) {
            const val = data[i][j];
            html += `<td>${Number.isInteger(val) ? val : val.toFixed(2)}</td>`;
        }
        html += `</tr>`;
    }
    
    html += `</tbody></table></div>`;
    container.innerHTML = html;
}

function changeLargeMatrixPage(axis, delta) {
    const active = largeMatrixState.activeView;
    const obj = largeMatrixState[active];
    if (!obj || !obj.data) return;
    
    if (axis === 'row') {
        const next = largeMatrixState.pageRow + delta;
        if (next >= 0 && next < obj.rows) {
            largeMatrixState.pageRow = next;
        }
    } else if (axis === 'col') {
        const next = largeMatrixState.pageCol + delta;
        if (next >= 0 && next < obj.cols) {
            largeMatrixState.pageCol = next;
        }
    }
    renderLargeMatrixViewer();
}

function setLargeMatrixView(target) {
    largeMatrixState.activeView = target;
    largeMatrixState.pageRow = 0;
    largeMatrixState.pageCol = 0;
    renderLargeMatrixViewer();
}

function exportLargeMatrixCSVString(target) {
    const obj = largeMatrixState[target];
    if (!obj || !obj.data) return '';
    const { rows, cols, data } = obj;
    const lines = [];
    for (let i = 0; i < rows; i++) {
        const row = [];
        for (let j = 0; j < cols; j++) {
            row.push(data[i][j]);
        }
        lines.push(row.join(','));
    }
    return lines.join('\n');
}

function copyLargeMatrixCSV(target) {
    const csv = exportLargeMatrixCSVString(target);
    if (!csv) return;
    if (navigator.clipboard) {
        navigator.clipboard.writeText(csv).then(() => {
            if (typeof showNotification === 'function') showNotification('Matrix CSV copied to clipboard!');
        });
    } else {
        if (typeof showNotification === 'function') showNotification('Clipboard access unavailable');
    }
}

function downloadLargeMatrixCSV(target) {
    const csv = exportLargeMatrixCSVString(target);
    if (!csv) return;
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `matrix_${target}_${Date.now()}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    if (typeof showNotification === 'function') showNotification('Matrix CSV downloaded!');
}

// GPA Calculator Functions

// Grade scales and their corresponding grade points with your exact specifications
const gradeScales = {
    '4.0': {
        'A+': 4.0, 'A': 4.0, 'A-': 3.7,
        'B+': 3.3, 'B': 3.0, 'B-': 2.7,
        'C+': 2.3, 'C': 2.0, 'C-': 1.7,
        'D': 1.0, 'F': 0.0
    },
    '4.3': {
        'A+': 4.0, 'A': 4.0, 'A-': 3.7,
        'B+': 3.3, 'B': 3.0, 'B-': 2.7,
        'C+': 2.3, 'C': 2.0, 'C-': 1.7,
        'D': 1.0, 'F': 0.0
    },
    '5.0': {
        'A+': 5.0, 'A': 5.0, 'A-': 4.6,
        'B+': 4.1, 'B': 3.8, 'B-': 3.4,
        'C+': 2.9, 'C': 2.5, 'C-': 2.1,
        'D': 1.3, 'F': 0.0
    },
    '10.0': {
        'A+': 10.0, 'A': 10.0, 'A-': 9.2,
        'B+': 8.3, 'B': 7.5, 'B-': 6.7,
        'C+': 5.8, 'C': 5.0, 'C-': 4.2,
        'D': 2.5, 'F': 0.0
    }
};

// Your exact percentage to grade conversion ranges
const percentageToGrade = {
    // A+ >= 90
    90: 'A+',
    // A >= 85 and < 90
    85: 'A',
    // A- >= 80 and < 85
    80: 'A-',
    // B+ >= 75 and < 80
    75: 'B+',
    // B >= 70 and < 75
    70: 'B',
    // B- >= 65 and < 70
    65: 'B-',
    // C+ >= 60 and < 65
    60: 'C+',
    // C >= 55 and < 60
    55: 'C',
    // C- >= 50 and < 55
    50: 'C-',
    // D >= 45 and < 50
    45: 'D',
    // F < 45
    0: 'F'
};

// Grade to percentage ranges for display (your exact ranges)
const gradeToPercentageRanges = {
    'A+': '90-100%',
    'A': '85-89%',
    'A-': '80-84%',
    'B+': '75-79%',
    'B': '70-74%',
    'B-': '65-69%',
    'C+': '60-64%',
    'C': '55-59%',
    'C-': '50-54%',
    'D': '45-49%',
    'F': '0-44%'
};

// Initialize GPA calculator
function initializeGPACalculator() {
    updateCourseInputs();
    updateGradeOptions();
    updateGradeScaleReference();
    updateInputMode();
}

// Add a course dynamically (no 7-course limitation)
function addCourse() {
    const numCoursesInput = document.getElementById('numCourses');
    if (!numCoursesInput) return;
    const current = Math.max(1, parseInt(numCoursesInput.value) || 1);
    numCoursesInput.value = current + 1;
    updateCourseInputs();
    if (typeof showNotification === 'function') {
        showNotification(`Added Course ${current + 1}`);
    }
}

// Remove the last course dynamically
function removeLastCourse() {
    const numCoursesInput = document.getElementById('numCourses');
    if (!numCoursesInput) return;
    const current = parseInt(numCoursesInput.value) || 1;
    if (current > 1) {
        removeCourse(current);
    } else {
        if (typeof showNotification === 'function') {
            showNotification('Cannot remove the last course');
        }
    }
}

// Update course input fields based on number of courses
function updateCourseInputs() {
    const numCoursesInput = document.getElementById('numCourses');
    if (!numCoursesInput) return;
    const numCourses = Math.max(1, parseInt(numCoursesInput.value) || 1);
    numCoursesInput.value = numCourses;
    const container = document.getElementById('coursesContainer');
    if (!container) return;
    
    // Save existing user input before rebuilding
    const existingData = [];
    const existingElements = container.querySelectorAll('.course-input');
    existingElements.forEach((el, index) => {
        const i = index + 1;
        existingData.push({
            name: document.getElementById(`courseName${i}`)?.value || '',
            credits: document.getElementById(`credits${i}`)?.value || '',
            grade: document.getElementById(`grade${i}`)?.value || '',
            percentage: document.getElementById(`percentage${i}`)?.value || ''
        });
    });
    
    container.innerHTML = '';
    
    for (let i = 1; i <= numCourses; i++) {
        const courseDiv = document.createElement('div');
        courseDiv.className = 'course-input';
        courseDiv.innerHTML = `
            <div class="course-header">
                <h4>Course ${i}</h4>
                <button class="btn-remove-course" onclick="removeCourse(${i})" title="Remove Course">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="course-fields">
                <div class="field-group">
                    <label>Course Name:</label>
                    <input type="text" id="courseName${i}" placeholder="e.g., Calculus I" class="course-name-input">
                </div>
                <div class="field-group">
                    <label>Credit Hours:</label>
                    <input type="number" id="credits${i}" placeholder="3" min="0.5" max="6" step="0.5" class="credits-input">
                </div>
                <div class="field-group grade-input-group" id="gradeGroup${i}">
                    <label>Grade:</label>
                    <select id="grade${i}" class="grade-select">
                        <option value="">Select Grade</option>
                    </select>
                </div>
                <div class="field-group percentage-input-group" id="percentageGroup${i}">
                    <label>Percentage:</label>
                    <input type="number" id="percentage${i}" placeholder="85" min="0" max="100" step="0.1" class="percentage-input" onchange="updateGradeFromPercentage(${i})" oninput="updateGradeFromPercentage(${i})">
                </div>
                <div class="field-group auto-grade-display" id="autoGradeDisplay${i}" style="display: none;">
                    <label>Auto Grade:</label>
                    <div class="auto-grade-value" id="autoGrade${i}">--</div>
                </div>
            </div>
        `;
        container.appendChild(courseDiv);
    }
    
    updateGradeOptions();
    updateInputMode();

    // Restore preserved data
    for (let i = 1; i <= Math.min(numCourses, existingData.length); i++) {
        const data = existingData[i - 1];
        const nameEl = document.getElementById(`courseName${i}`);
        const creditsEl = document.getElementById(`credits${i}`);
        const gradeEl = document.getElementById(`grade${i}`);
        const percentageEl = document.getElementById(`percentage${i}`);
        if (nameEl && data.name) nameEl.value = data.name;
        if (creditsEl && data.credits) creditsEl.value = data.credits;
        if (gradeEl && data.grade) gradeEl.value = data.grade;
        if (percentageEl && data.percentage) {
            percentageEl.value = data.percentage;
            updateGradeFromPercentage(i);
        }
    }
}

// Update grade options based on selected scale
function updateGradeOptions() {
    const scale = document.getElementById('gpaScale').value;
    const numCourses = parseInt(document.getElementById('numCourses').value);
    
    for (let i = 1; i <= numCourses; i++) {
        const gradeSelect = document.getElementById(`grade${i}`);
        if (!gradeSelect) continue;
        
        gradeSelect.innerHTML = '<option value="">Select Grade</option>';
        
        if (scale !== 'percentage') {
            const grades = gradeScales[scale];
            for (const [grade, points] of Object.entries(grades)) {
                const option = document.createElement('option');
                option.value = points;
                option.textContent = `${grade} (${points}) - ${gradeToPercentageRanges[grade] || ''}`;
                gradeSelect.appendChild(option);
            }
        }
    }
}

// Update input mode display
function updateInputMode() {
    const inputMode = document.getElementById('inputMode').value;
    const numCourses = parseInt(document.getElementById('numCourses').value);
    
    for (let i = 1; i <= numCourses; i++) {
        const gradeGroup = document.getElementById(`gradeGroup${i}`);
        const percentageGroup = document.getElementById(`percentageGroup${i}`);
        const autoGradeDisplay = document.getElementById(`autoGradeDisplay${i}`);
        
        if (!gradeGroup || !percentageGroup) continue;
        
        switch (inputMode) {
            case 'grades':
                gradeGroup.style.display = 'block';
                percentageGroup.style.display = 'none';
                if (autoGradeDisplay) autoGradeDisplay.style.display = 'none';
                break;
            case 'percentage':
                gradeGroup.style.display = 'none';
                percentageGroup.style.display = 'block';
                if (autoGradeDisplay) autoGradeDisplay.style.display = 'block';
                break;
            case 'both':
                gradeGroup.style.display = 'block';
                percentageGroup.style.display = 'block';
                if (autoGradeDisplay) autoGradeDisplay.style.display = 'block';
                break;
        }
    }
}

// Update grade from percentage input
function updateGradeFromPercentage(courseNum) {
    const percentage = parseFloat(document.getElementById(`percentage${courseNum}`).value);
    const autoGradeElement = document.getElementById(`autoGrade${courseNum}`);
    const gradeSelect = document.getElementById(`grade${courseNum}`);
    
    if (isNaN(percentage) || percentage < 0 || percentage > 100) {
        if (autoGradeElement) autoGradeElement.textContent = '--';
        return;
    }
    
    const letterGrade = getLetterGradeFromPercentage(percentage);
    const scale = document.getElementById('gpaScale').value;
    
    if (autoGradeElement) {
        autoGradeElement.textContent = letterGrade;
        autoGradeElement.className = `auto-grade-value grade-${letterGrade.replace('+', 'plus').replace('-', 'minus')}`;
    }
    
    // Auto-select the corresponding grade in dropdown if in 'both' mode
    const inputMode = document.getElementById('inputMode').value;
    if (inputMode === 'both' && gradeSelect && scale !== 'percentage') {
        const gradePoints = gradeScales[scale][letterGrade];
        if (gradePoints !== undefined) {
            gradeSelect.value = gradePoints;
        }
    }
}

// Get letter grade from percentage with your exact ranges
function getLetterGradeFromPercentage(percentage) {
    if (percentage >= 90) return 'A+';
    if (percentage >= 85) return 'A';
    if (percentage >= 80) return 'A-';
    if (percentage >= 75) return 'B+';
    if (percentage >= 70) return 'B';
    if (percentage >= 65) return 'B-';
    if (percentage >= 60) return 'C+';
    if (percentage >= 55) return 'C';
    if (percentage >= 50) return 'C-';
    if (percentage >= 45) return 'D';
    return 'F';
}

// Update grade scale reference
function updateGradeScaleReference() {
    const scale = document.getElementById('gpaScale').value;
    const refDiv = document.getElementById('gradeScaleRef');
    
    let html = '<h4>Grade Scale Reference:</h4><div class="grade-scale-grid">';
    
    if (scale === 'percentage') {
        html += `
            <div class="scale-item grade-a-plus">A+: 90-100% (4.0)</div>
            <div class="scale-item grade-a">A: 85-89% (4.0)</div>
            <div class="scale-item grade-a-minus">A-: 80-84% (3.7)</div>
            <div class="scale-item grade-b-plus">B+: 75-79% (3.3)</div>
            <div class="scale-item grade-b">B: 70-74% (3.0)</div>
            <div class="scale-item grade-b-minus">B-: 65-69% (2.7)</div>
            <div class="scale-item grade-c-plus">C+: 60-64% (2.3)</div>
            <div class="scale-item grade-c">C: 55-59% (2.0)</div>
            <div class="scale-item grade-c-minus">C-: 50-54% (1.7)</div>
            <div class="scale-item grade-d">D: 45-49% (1.0)</div>
            <div class="scale-item grade-f">F: 0-44% (0.0)</div>
        `;
    } else {
        const grades = gradeScales[scale];
        for (const [grade, points] of Object.entries(grades)) {
            const percentageRange = gradeToPercentageRanges[grade] || '';
            const gradeClass = `grade-${grade.replace('+', '-plus').replace('-', '-minus').toLowerCase()}`;
            html += `<div class="scale-item ${gradeClass}">${grade}: ${points} ${percentageRange ? `(${percentageRange})` : ''}</div>`;
        }
    }
    
    html += '</div>';
    
    // Add percentage conversion guide with your exact ranges
    html += `
        <div class="percentage-guide">
            <h4>Percentage to Grade Conversion:</h4>
            <div class="conversion-grid">
                <div class="conversion-item">A+ = 90-100%</div>
                <div class="conversion-item">A = 85-89%</div>
                <div class="conversion-item">A- = 80-84%</div>
                <div class="conversion-item">B+ = 75-79%</div>
                <div class="conversion-item">B = 70-74%</div>
                <div class="conversion-item">B- = 65-69%</div>
                <div class="conversion-item">C+ = 60-64%</div>
                <div class="conversion-item">C = 55-59%</div>
                <div class="conversion-item">C- = 50-54%</div>
                <div class="conversion-item">D = 45-49%</div>
                <div class="conversion-item">F = 0-44%</div>
            </div>
            <div class="important-note">
                <strong>Important:</strong> Both A+ and A have the same GPA value (4.0 on 4.0 scale). 
                The maximum GPA is 4.0 regardless of having all A+ grades.
            </div>
        </div>
    `;
    
    refDiv.innerHTML = html;
}

// Remove a course
function removeCourse(courseNum) {
    const numCoursesInput = document.getElementById('numCourses');
    if (!numCoursesInput) return;
    const numCourses = parseInt(numCoursesInput.value);
    if (numCourses <= 1) {
        showNotification('Cannot remove the last course');
        return;
    }
    
    // Collect data from all courses except the one to remove
    const preservedData = [];
    for (let i = 1; i <= numCourses; i++) {
        if (i === courseNum) continue;
        preservedData.push({
            name: document.getElementById(`courseName${i}`)?.value || '',
            credits: document.getElementById(`credits${i}`)?.value || '',
            grade: document.getElementById(`grade${i}`)?.value || '',
            percentage: document.getElementById(`percentage${i}`)?.value || ''
        });
    }
    
    numCoursesInput.value = preservedData.length;
    
    const container = document.getElementById('coursesContainer');
    container.innerHTML = '';
    
    for (let i = 1; i <= preservedData.length; i++) {
        const courseDiv = document.createElement('div');
        courseDiv.className = 'course-input';
        courseDiv.innerHTML = `
            <div class="course-header">
                <h4>Course ${i}</h4>
                <button class="btn-remove-course" onclick="removeCourse(${i})" title="Remove Course">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="course-fields">
                <div class="field-group">
                    <label>Course Name:</label>
                    <input type="text" id="courseName${i}" placeholder="e.g., Calculus I" class="course-name-input">
                </div>
                <div class="field-group">
                    <label>Credit Hours:</label>
                    <input type="number" id="credits${i}" placeholder="3" min="0.5" max="6" step="0.5" class="credits-input">
                </div>
                <div class="field-group grade-input-group" id="gradeGroup${i}">
                    <label>Grade:</label>
                    <select id="grade${i}" class="grade-select">
                        <option value="">Select Grade</option>
                    </select>
                </div>
                <div class="field-group percentage-input-group" id="percentageGroup${i}">
                    <label>Percentage:</label>
                    <input type="number" id="percentage${i}" placeholder="85" min="0" max="100" step="0.1" class="percentage-input" onchange="updateGradeFromPercentage(${i})" oninput="updateGradeFromPercentage(${i})">
                </div>
                <div class="field-group auto-grade-display" id="autoGradeDisplay${i}" style="display: none;">
                    <label>Auto Grade:</label>
                    <div class="auto-grade-value" id="autoGrade${i}">--</div>
                </div>
            </div>
        `;
        container.appendChild(courseDiv);
    }
    
    updateGradeOptions();
    updateInputMode();
    
    for (let i = 1; i <= preservedData.length; i++) {
        const data = preservedData[i - 1];
        const nameEl = document.getElementById(`courseName${i}`);
        const creditsEl = document.getElementById(`credits${i}`);
        const gradeEl = document.getElementById(`grade${i}`);
        const percentageEl = document.getElementById(`percentage${i}`);
        if (nameEl && data.name) nameEl.value = data.name;
        if (creditsEl && data.credits) creditsEl.value = data.credits;
        if (gradeEl && data.grade) gradeEl.value = data.grade;
        if (percentageEl && data.percentage) {
            percentageEl.value = data.percentage;
            updateGradeFromPercentage(i);
        }
    }
    
    showNotification(`Course ${courseNum} removed`);
}

// Calculate GPA
function calculateGPA() {
    const numCourses = parseInt(document.getElementById('numCourses').value);
    const scale = document.getElementById('gpaScale').value;
    const inputMode = document.getElementById('inputMode').value;
    
    let totalCredits = 0;
    let totalQualityPoints = 0;
    let validCourses = 0;
    const courseData = [];
    const gradeDistribution = {};
    
    for (let i = 1; i <= numCourses; i++) {
        const courseName = document.getElementById(`courseName${i}`).value || `Course ${i}`;
        const credits = parseFloat(document.getElementById(`credits${i}`).value);
        
        if (isNaN(credits) || credits <= 0) continue;
        
        let gradePoints = 0;
        let gradeLetter = '';
        let percentage = null;
        
        // Determine grade points based on input mode
        if (inputMode === 'percentage' || (inputMode === 'both' && document.getElementById(`percentage${i}`).value)) {
            percentage = parseFloat(document.getElementById(`percentage${i}`).value);
            if (isNaN(percentage) || percentage < 0 || percentage > 100) continue;
            
            gradeLetter = getLetterGradeFromPercentage(percentage);
            gradePoints = convertPercentageToGPA(percentage, scale);
        } else {
            gradePoints = parseFloat(document.getElementById(`grade${i}`).value);
            if (isNaN(gradePoints)) continue;
            
            gradeLetter = getGradeLetterFromPoints(gradePoints, scale);
        }
        
        const qualityPoints = gradePoints * credits;
        
        totalCredits += credits;
        totalQualityPoints += qualityPoints;
        validCourses++;
        
        courseData.push({
            name: courseName,
            credits: credits,
            grade: gradeLetter,
            gradePoints: gradePoints,
            qualityPoints: qualityPoints,
            percentage: percentage
        });
        
        // Update grade distribution
        if (gradeDistribution[gradeLetter]) {
            gradeDistribution[gradeLetter]++;
        } else {
            gradeDistribution[gradeLetter] = 1;
        }
    }
    
    if (validCourses === 0) {
        showNotification('Please enter at least one complete course with credits and grade');
        return;
    }
    
    const gpa = totalQualityPoints / totalCredits;
    
    // Update display
    updateGPADisplay(gpa, totalCredits, totalQualityPoints, courseData, gradeDistribution);
    
    // Add to history
    addToHistory(`GPA (${validCourses} courses)`, gpa.toFixed(3));
    
    showNotification(`GPA calculated: ${gpa.toFixed(3)}`);
}

// Convert percentage to GPA points with your exact specifications
function convertPercentageToGPA(percentage, scale) {
    const letterGrade = getLetterGradeFromPercentage(percentage);
    const targetScale = scale === 'percentage' ? '4.0' : scale;
    
    if (gradeScales[targetScale] && gradeScales[targetScale][letterGrade] !== undefined) {
        return gradeScales[targetScale][letterGrade];
    }
    
    // Fallback with your exact grade points (A+ and A both = 4.0)
    const fallbackGrades = {
        'A+': 4.0, 'A': 4.0, 'A-': 3.7,
        'B+': 3.3, 'B': 3.0, 'B-': 2.7,
        'C+': 2.3, 'C': 2.0, 'C-': 1.7,
        'D': 1.0, 'F': 0.0
    };
    
    return fallbackGrades[letterGrade] || 0.0;
}

// Get letter grade from percentage (removed old function)
// This function is now getLetterGradeFromPercentage above

// Get grade letter from points
function getGradeLetterFromPoints(points, scale) {
    const grades = gradeScales[scale];
    for (const [letter, gradePoints] of Object.entries(grades)) {
        if (Math.abs(points - gradePoints) < 0.01) {
            return letter;
        }
    }
    return '?';
}

// Update GPA display with enhanced information
function updateGPADisplay(gpa, totalCredits, totalQualityPoints, courseData, gradeDistribution) {
    // Update summary cards
    document.getElementById('currentGPA').textContent = gpa.toFixed(3);
    document.getElementById('totalCredits').textContent = totalCredits.toFixed(1);
    document.getElementById('qualityPoints').textContent = totalQualityPoints.toFixed(2);
    
    // Update grade distribution chart
    const chartDiv = document.getElementById('gradeChart');
    let chartHTML = '';
    
    const gradeColors = {
        'A+': '#059669', 'A': '#10b981', 'A-': '#34d399',
        'B+': '#2563eb', 'B': '#3b82f6', 'B-': '#60a5fa',
        'C+': '#d97706', 'C': '#f59e0b', 'C-': '#fbbf24',
        'D': '#ef4444', 'F': '#6b7280'
    };
    
    for (const [grade, count] of Object.entries(gradeDistribution)) {
        const percentage = (count / courseData.length * 100).toFixed(1);
        const color = gradeColors[grade] || '#6b7280';
        
        chartHTML += `
            <div class="grade-bar">
                <div class="grade-label">${grade}</div>
                <div class="grade-bar-container">
                    <div class="grade-bar-fill" style="width: ${percentage}%; background-color: ${color}"></div>
                </div>
                <div class="grade-count">${count} (${percentage}%)</div>
            </div>
        `;
    }
    
    chartDiv.innerHTML = chartHTML;
    
    // Update breakdown with course details including percentages
    const breakdownDiv = document.getElementById('gpaBreakdown');
    let breakdownHTML = '<h4>Course Breakdown</h4><div class="course-breakdown-list">';
    
    courseData.forEach(course => {
        const percentageInfo = course.percentage !== null ? ` • ${course.percentage}%` : '';
        breakdownHTML += `
            <div class="course-breakdown-item">
                <div class="course-info">
                    <strong>${escapeHTML(course.name)}</strong>
                    <span class="course-details">${course.credits} credits • Grade: ${escapeHTML(course.grade)} (${course.gradePoints})${percentageInfo}</span>
                </div>
                <div class="quality-points">${course.qualityPoints.toFixed(2)} QP</div>
            </div>
        `;
    });
    
    breakdownHTML += '</div>';
    breakdownDiv.innerHTML = breakdownHTML;
}

// Calculate cumulative GPA
function calculateCumulativeGPA() {
    const previousGPA = parseFloat(document.getElementById('previousGPA').value);
    const previousCredits = parseFloat(document.getElementById('previousCredits').value);
    
    if (isNaN(previousGPA) || isNaN(previousCredits)) {
        document.getElementById('cumulativeResult').innerHTML = 
            '<span style="color: var(--danger)">Please enter valid previous GPA and credit hours</span>';
        return;
    }
    
    // Get current semester data
    const currentGPAElement = document.getElementById('currentGPA');
    const currentCreditsElement = document.getElementById('totalCredits');
    
    if (currentGPAElement.textContent === '--') {
        document.getElementById('cumulativeResult').innerHTML = 
            '<span style="color: var(--danger)">Please calculate current semester GPA first</span>';
        return;
    }
    
    const currentGPA = parseFloat(currentGPAElement.textContent);
    const currentCredits = parseFloat(currentCreditsElement.textContent);
    
    // Calculate cumulative GPA
    const totalPreviousQP = previousGPA * previousCredits;
    const totalCurrentQP = currentGPA * currentCredits;
    const totalCredits = previousCredits + currentCredits;
    const cumulativeGPA = (totalPreviousQP + totalCurrentQP) / totalCredits;
    
    const resultHTML = `
        <div class="cumulative-display">
            <div class="cumulative-summary">
                <h4>Cumulative GPA Calculation</h4>
                <div class="calculation-breakdown">
                    <div class="calc-row">
                        <span>Previous: ${previousGPA.toFixed(3)} GPA × ${previousCredits} credits = ${totalPreviousQP.toFixed(2)} QP</span>
                    </div>
                    <div class="calc-row">
                        <span>Current: ${currentGPA.toFixed(3)} GPA × ${currentCredits} credits = ${totalCurrentQP.toFixed(2)} QP</span>
                    </div>
                    <div class="calc-row total">
                        <span>Total: ${(totalPreviousQP + totalCurrentQP).toFixed(2)} QP ÷ ${totalCredits} credits</span>
                    </div>
                </div>
            </div>
            <div class="cumulative-result-display">
                <div class="cumulative-gpa-value">${cumulativeGPA.toFixed(3)}</div>
                <div class="cumulative-label">Cumulative GPA</div>
                <div class="cumulative-details">
                    Total Credits: ${totalCredits}<br>
                    GPA Change: ${(cumulativeGPA - previousGPA).toFixed(3)}
                </div>
            </div>
        </div>
    `;
    
    document.getElementById('cumulativeResult').innerHTML = resultHTML;
    addToHistory(`Cumulative GPA`, cumulativeGPA.toFixed(3));
}

// Calculate GPA goal
function calculateGPAGoal() {
    const targetGPA = parseFloat(document.getElementById('targetGPA').value);
    const remainingCredits = parseFloat(document.getElementById('remainingCredits').value);
    
    if (isNaN(targetGPA) || isNaN(remainingCredits)) {
        document.getElementById('goalResult').innerHTML = 
            '<span style="color: var(--danger)">Please enter valid target GPA and remaining credit hours</span>';
        return;
    }
    
    // Get current cumulative data or current semester data
    const previousGPA = parseFloat(document.getElementById('previousGPA').value) || 0;
    const previousCredits = parseFloat(document.getElementById('previousCredits').value) || 0;
    const currentGPAElement = document.getElementById('currentGPA');
    
    let currentGPA = 0;
    let currentCredits = 0;
    
    if (currentGPAElement.textContent !== '--') {
        currentGPA = parseFloat(currentGPAElement.textContent);
        currentCredits = parseFloat(document.getElementById('totalCredits').textContent);
    }
    
    const totalCurrentQP = (previousGPA * previousCredits) + (currentGPA * currentCredits);
    const totalCurrentCredits = previousCredits + currentCredits;
    const totalFutureCredits = totalCurrentCredits + remainingCredits;
    
    // Calculate required GPA: (target * total_credits) - current_QP = required_QP
    const requiredTotalQP = targetGPA * totalFutureCredits;
    const requiredQP = requiredTotalQP - totalCurrentQP;
    const requiredGPA = requiredQP / remainingCredits;
    
    let resultHTML = `
        <div class="goal-display">
            <div class="goal-calculation">
                <h4>GPA Goal Analysis</h4>
                <div class="goal-breakdown">
                    <div class="goal-row">Current Situation:</div>
                    <div class="goal-detail">• Current QP: ${totalCurrentQP.toFixed(2)}</div>
                    <div class="goal-detail">• Current Credits: ${totalCurrentCredits}</div>
                    <div class="goal-detail">• Remaining Credits: ${remainingCredits}</div>
                    <br>
                    <div class="goal-row">To achieve ${targetGPA.toFixed(2)} GPA:</div>
                    <div class="goal-detail">• Total QP needed: ${requiredTotalQP.toFixed(2)}</div>
                    <div class="goal-detail">• Additional QP needed: ${requiredQP.toFixed(2)}</div>
                </div>
            </div>
            <div class="goal-result-display">
    `;
    
    if (requiredGPA > 4.0) {
        resultHTML += `
                <div class="goal-gpa-value impossible">${requiredGPA.toFixed(3)}</div>
                <div class="goal-label">Required GPA</div>
                <div class="goal-status impossible">⚠️ Impossible with 4.0 scale</div>
                <div class="goal-advice">Consider taking more credit hours or adjusting your target GPA</div>
        `;
    } else if (requiredGPA < 0) {
        resultHTML += `
                <div class="goal-gpa-value achieved">Target Achieved!</div>
                <div class="goal-label">You've already met your goal</div>
                <div class="goal-status achieved">🎉 Congratulations!</div>
                <div class="goal-advice">You can maintain any GPA above ${Math.max(0, requiredGPA).toFixed(2)} in remaining courses</div>
        `;
    } else {
        let difficulty = '';
        let difficultyClass = '';
        
        if (requiredGPA >= 3.7) {
            difficulty = 'Very Challenging';
            difficultyClass = 'very-hard';
        } else if (requiredGPA >= 3.3) {
            difficulty = 'Challenging';
            difficultyClass = 'hard';
        } else if (requiredGPA >= 2.7) {
            difficulty = 'Moderate';
            difficultyClass = 'moderate';
        } else {
            difficulty = 'Achievable';
            difficultyClass = 'easy';
        }
        
        resultHTML += `
                <div class="goal-gpa-value ${difficultyClass}">${requiredGPA.toFixed(3)}</div>
                <div class="goal-label">Required GPA</div>
                <div class="goal-status ${difficultyClass}">${difficulty}</div>
                <div class="goal-advice">You need to maintain a ${requiredGPA.toFixed(2)} GPA in your remaining ${remainingCredits} credit hours</div>
        `;
    }
    
    resultHTML += `
            </div>
        </div>
    `;
    
    document.getElementById('goalResult').innerHTML = resultHTML;
    addToHistory(`GPA Goal (${targetGPA.toFixed(2)})`, requiredGPA.toFixed(3));
}

// Clear all courses
function clearAllCourses() {
    if (confirm('Clear all course data?')) {
        const numCourses = parseInt(document.getElementById('numCourses').value);
        
        for (let i = 1; i <= numCourses; i++) {
            const courseName = document.getElementById(`courseName${i}`);
            const credits = document.getElementById(`credits${i}`);
            const grade = document.getElementById(`grade${i}`);
            const percentage = document.getElementById(`percentage${i}`);
            
            if (courseName) courseName.value = '';
            if (credits) credits.value = '';
            if (grade) grade.value = '';
            if (percentage) percentage.value = '';
        }
        
        // Clear results
        document.getElementById('currentGPA').textContent = '--';
        document.getElementById('totalCredits').textContent = '--';
        document.getElementById('qualityPoints').textContent = '--';
        document.getElementById('gradeChart').innerHTML = '';
        document.getElementById('gpaBreakdown').innerHTML = '<h4>Grade Distribution</h4><div class="grade-chart" id="gradeChart"></div>';
        
        showNotification('All courses cleared');
    }
}

// Load sample grades with your grade system
function loadSampleGrades() {
    const sampleData = [
        { name: 'Calculus I', credits: 4, grade: 'A+', percentage: 92 },
        { name: 'Physics I', credits: 4, grade: 'A', percentage: 87 },
        { name: 'Chemistry', credits: 3, grade: 'A-', percentage: 82 },
        { name: 'English Composition', credits: 3, grade: 'B+', percentage: 77 },
        { name: 'Computer Science', credits: 3, grade: 'A', percentage: 88 },
        { name: 'History', credits: 3, grade: 'B', percentage: 72 },
        { name: 'Statistics', credits: 3, grade: 'A-', percentage: 83 }
    ];
    
    const scale = document.getElementById('gpaScale').value;
    const inputMode = document.getElementById('inputMode').value;
    const numCourses = Math.min(parseInt(document.getElementById('numCourses').value), sampleData.length);
    
    for (let i = 0; i < numCourses; i++) {
        const course = sampleData[i];
        
        document.getElementById(`courseName${i + 1}`).value = course.name;
        document.getElementById(`credits${i + 1}`).value = course.credits;
        
        if (inputMode === 'percentage' || inputMode === 'both') {
            document.getElementById(`percentage${i + 1}`).value = course.percentage;
            updateGradeFromPercentage(i + 1);
        }
        
        if (inputMode === 'grades' || (inputMode === 'both' && scale !== 'percentage')) {
            const gradePoints = gradeScales[scale][course.grade] || gradeScales['4.0'][course.grade];
            if (gradePoints !== undefined) {
                document.getElementById(`grade${i + 1}`).value = gradePoints;
            }
        }
    }
    
    showNotification('Sample grades loaded with your grade system');
}

// Get percentage from letter grade with your ranges
function getPercentageFromGrade(grade) {
    const percentages = {
        'A+': 92, 'A': 87, 'A-': 82,
        'B+': 77, 'B': 72, 'B-': 67,
        'C+': 62, 'C': 57, 'C-': 52,
        'D': 47, 'F': 35
    };
    return percentages[grade] || 85;
}

// ===== POLYNOMIAL SOLVER FUNCTIONS =====

// Initialize polynomial solver
function initializePolynomialSolver() {
    updateCoefficientInputs();
    updatePolynomialInputMethod();
    if (typeof initializeGraphInteraction === 'function') {
        initializeGraphInteraction();
    }
}

// Update polynomial input method
function updatePolynomialInputMethod() {
    const method = document.getElementById('polynomialInputMethod').value;
    
    document.getElementById('coefficientInput').classList.toggle('hidden', method !== 'coefficients');
    document.getElementById('expressionInput').classList.toggle('hidden', method !== 'expression');
    document.getElementById('factoredInput').classList.toggle('hidden', method !== 'factored');
    
    // Clear previous results
    document.getElementById('polynomialResult').innerHTML = '<p class="no-result">Polynomial solutions will appear here...</p>';
    document.getElementById('polynomialAnalysis').innerHTML = '<p class="no-result">Function analysis will appear here...</p>';
}

// Update coefficient inputs based on degree
function updateCoefficientInputs() {
    const degree = parseInt(document.getElementById('polynomialDegree').value);
    const grid = document.getElementById('coefficientsGrid');
    
    grid.innerHTML = '';
    
    const labels = ['a', 'b', 'c', 'd', 'e'];
    const powers = ['⁴', '³', '²', '¹', '⁰'];
    
    for (let i = 0; i <= degree; i++) {
        const div = document.createElement('div');
        div.className = 'coefficient-item';
        
        const power = degree - i;
        const powerLabel = power === 0 ? '' : power === 1 ? 'x' : `x${powers[4-power]}`;
        
        div.innerHTML = `
            <label>${labels[i]}${powerLabel}:</label>
            <input type="number" id="coeff${i}" placeholder="${i === 0 ? '1' : '0'}" step="0.1" />
        `;
        
        grid.appendChild(div);
    }
}

// Parse polynomial from different input methods
function parsePolynomial() {
    const method = document.getElementById('polynomialInputMethod').value;
    
    switch (method) {
        case 'coefficients':
            return parseFromCoefficients();
        case 'expression':
            return parseFromExpression();
        case 'factored':
            return parseFromFactored();
        default:
            throw new Error('Unknown input method');
    }
}

// Parse polynomial from coefficients
function parseFromCoefficients() {
    const degree = parseInt(document.getElementById('polynomialDegree').value);
    const coefficients = [];
    
    for (let i = 0; i <= degree; i++) {
        const value = parseFloat(document.getElementById(`coeff${i}`).value) || (i === 0 ? 1 : 0);
        coefficients.push(value);
    }
    
    return { coefficients, degree };
}

// Parse polynomial from expression
function parseFromExpression() {
    const expression = document.getElementById('polynomialExpression').value.trim();
    
    if (!expression) {
        throw new Error('Please enter a polynomial expression');
    }
    
    let cleanExpr = expression.replace(/\s/g, '').toLowerCase().replace(/\*\*/g, '^');
    const terms = cleanExpr.split(/(?=[+-])/).filter(term => term.length > 0);
    
    const parsedTerms = terms.map(term => parseTerm(term));
    let maxDegree = 0;
    parsedTerms.forEach(t => {
        if (t.power > maxDegree) maxDegree = t.power;
    });
    
    const coefficients = new Array(maxDegree + 1).fill(0);
    parsedTerms.forEach(t => {
        coefficients[maxDegree - t.power] += t.coeff;
    });
    
    let firstNonZero = coefficients.findIndex(c => c !== 0);
    if (firstNonZero === -1) {
        return { coefficients: [0], degree: 0 };
    }
    const trimmedCoeffs = coefficients.slice(firstNonZero);
    const actualDegree = trimmedCoeffs.length - 1;
    
    return { coefficients: trimmedCoeffs, degree: actualDegree };
}

// Parse individual term
function parseTerm(term) {
    term = term.trim();
    
    let sign = 1;
    if (term.startsWith('+')) {
        term = term.substring(1);
    } else if (term.startsWith('-')) {
        sign = -1;
        term = term.substring(1);
    }
    
    let coeff = 1;
    let power = 0;
    
    if (term.includes('x')) {
        const coeffMatch = term.match(/^([+-]?\d*\.?\d*)/);
        if (coeffMatch && coeffMatch[1] !== '' && coeffMatch[1] !== '+' && coeffMatch[1] !== '-') {
            const parsed = parseFloat(coeffMatch[1]);
            coeff = isNaN(parsed) ? 1 : parsed;
        }
        
        if (term.includes('^')) {
            const powerMatch = term.match(/x\^(\d+)/);
            if (powerMatch) {
                power = parseInt(powerMatch[1]);
            }
        } else {
            power = 1;
        }
    } else {
        coeff = parseFloat(term) || 0;
        power = 0;
    }
    
    return { coeff: sign * coeff, power };
}

// Parse polynomial from factored form
function parseFromFactored() {
    const factored = document.getElementById('polynomialFactored').value.trim();
    
    if (!factored) {
        throw new Error('Please enter a factored polynomial');
    }
    
    // Extract factors using regex
    const factorRegex = /\([^)]+\)/g;
    const factors = factored.match(factorRegex);
    
    if (!factors) {
        throw new Error('Invalid factored form. Use format like (x-1)(x+2)');
    }
    
    // Start with polynomial 1
    let result = { coefficients: [1], degree: 0 };
    
    for (let factor of factors) {
        const linearFactor = parseLinearFactor(factor);
        result = multiplyPolynomials(result, linearFactor);
    }
    
    return result;
}

// Parse linear factor like (x-1) or (2x+3)
function parseLinearFactor(factor) {
    factor = factor.replace(/[()]/g, '').trim();
    
    let a = 1, b = 0;
    
    if (factor.includes('x')) {
        // Extract coefficient of x
        const coeffMatch = factor.match(/^([+-]?\d*\.?\d*)/);
        if (coeffMatch && coeffMatch[1] !== '') {
            a = parseFloat(coeffMatch[1]) || 1;
        }
        
        // Extract constant term
        const constMatch = factor.match(/([+-]\d*\.?\d*)$/);
        if (constMatch) {
            b = parseFloat(constMatch[1]);
        }
    } else {
        // Just a constant
        b = parseFloat(factor);
        a = 0;
    }
    
    return { coefficients: [a, b], degree: a !== 0 ? 1 : 0 };
}

// Multiply two polynomials
function multiplyPolynomials(poly1, poly2) {
    const result = new Array(poly1.degree + poly2.degree + 1).fill(0);
    
    for (let i = 0; i <= poly1.degree; i++) {
        for (let j = 0; j <= poly2.degree; j++) {
            result[i + j] += poly1.coefficients[i] * poly2.coefficients[j];
        }
    }
    
    return { coefficients: result, degree: poly1.degree + poly2.degree };
}

// Solve polynomial equation
function solvePolynomial() {
    const resultDiv = document.getElementById('polynomialResult');
    
    try {
        const polynomial = parsePolynomial();
        const roots = findPolynomialRoots(polynomial);
        
        displayPolynomialSolution(polynomial, roots, resultDiv);
        
        // Auto-plot the graph if canvas exists
        try {
            currentPolynomialForGraph = polynomial;
            currentRoots = roots;
            if (document.getElementById('polynomialCanvas')) {
                autoScaleGraph();
            }
        } catch (error) {
            console.log('Auto-plot skipped:', error.message);
        }
        
        addToHistory(`Polynomial degree ${polynomial.degree}`, 'solved');
    } catch (error) {
        resultDiv.innerHTML = `<span style="color: var(--danger)">Error: ${error.message}</span>`;
    }
}

// Find polynomial roots based on degree
function findPolynomialRoots(polynomial) {
    const { coefficients, degree } = polynomial;
    
    switch (degree) {
        case 0:
            return coefficients[0] === 0 ? ['All real numbers'] : ['No solution'];
        case 1:
            return solveLinear(coefficients);
        case 2:
            return solveQuadratic(coefficients);
        case 3:
            return solveCubic(coefficients[0], coefficients[1], coefficients[2], coefficients[3]);
        case 4:
            return solveQuartic(coefficients);
        default:
            // Support degree > 4 using robust multi-start numerical root search
            return findRootsNumerically(coefficients, degree);
    }
}

// Solve linear equation ax + b = 0
function solveLinear(coeffs) {
    const [a, b] = coeffs;
    
    if (a === 0) {
        return b === 0 ? ['All real numbers'] : ['No solution'];
    }
    
    return [-b / a];
}

// Solve quadratic equation ax² + bx + c = 0
function solveQuadratic(coeffs) {
    const [a, b, c] = coeffs;
    
    if (a === 0) {
        return solveLinear([b, c]);
    }
    
    const discriminant = b * b - 4 * a * c;
    
    if (discriminant > 0) {
        const sqrt_d = Math.sqrt(discriminant);
        return [(-b + sqrt_d) / (2 * a), (-b - sqrt_d) / (2 * a)];
    } else if (discriminant === 0) {
        return [-b / (2 * a)];
    } else {
        const real = -b / (2 * a);
        const imag = Math.sqrt(-discriminant) / (2 * a);
        return [
            { real, imag },
            { real, imag: -imag }
        ];
    }
}

// Solve quartic equation (simplified approach)
function solveQuartic(coeffs) {
    const [a, b, c, d, e] = coeffs;
    // Check if biquadratic: ax^4 + cx^2 + e = 0 (b === 0 and d === 0)
    if (Math.abs(b) < 1e-12 && Math.abs(d) < 1e-12) {
        const quadRoots = solveQuadratic([a, c, e]);
        const roots = [];
        quadRoots.forEach(u => {
            if (typeof u === 'number') {
                if (u >= 0) {
                    roots.push(Math.sqrt(u), -Math.sqrt(u));
                } else {
                    const im = Math.sqrt(-u);
                    roots.push({ real: 0, imag: im }, { real: 0, imag: -im });
                }
            } else if (u && typeof u === 'object') {
                const r = Math.hypot(u.real, u.imag);
                const theta = Math.atan2(u.imag, u.real);
                const sqrtR = Math.sqrt(r);
                const rootReal = sqrtR * Math.cos(theta / 2);
                const rootImag = sqrtR * Math.sin(theta / 2);
                roots.push({ real: rootReal, imag: rootImag }, { real: -rootReal, imag: -rootImag });
            }
        });
        return roots;
    }
    return findRootsNumerically(coeffs, 4);
}

// Numerical root finding using Newton's method
function findRootsNumerically(coeffs, degree) {
    const roots = [];
    const tolerance = 1e-10;
    const maxIterations = 100;
    
    // Evaluate polynomial at x
    function evaluate(x) {
        let result = 0;
        for (let i = 0; i <= degree; i++) {
            result += coeffs[i] * Math.pow(x, degree - i);
        }
        return result;
    }
    
    // Evaluate derivative at x
    function evaluateDerivative(x) {
        let result = 0;
        for (let i = 0; i < degree; i++) {
            result += coeffs[i] * (degree - i) * Math.pow(x, degree - i - 1);
        }
        return result;
    }
    
    // Try different starting points
    const startingPoints = [-10, -5, -1, 0, 1, 5, 10];
    
    for (let start of startingPoints) {
        let x = start;
        let found = false;
        
        for (let iter = 0; iter < maxIterations; iter++) {
            const fx = evaluate(x);
            const fpx = evaluateDerivative(x);
            
            if (Math.abs(fx) < tolerance) {
                // Check if this root is already found
                const isNew = !roots.some(root => Math.abs(root - x) < tolerance);
                if (isNew) {
                    roots.push(x);
                }
                found = true;
                break;
            }
            
            if (Math.abs(fpx) < tolerance) break; // Derivative too small
            
            x = x - fx / fpx;
        }
    }
    
    return roots.slice(0, degree); // Return at most 'degree' roots
}

// Display polynomial solution
function displayPolynomialSolution(polynomial, roots, resultDiv) {
    const { coefficients, degree } = polynomial;
    
    let polynomialStr = formatPolynomial(coefficients, degree);
    
    let resultHTML = `
        <strong>Polynomial Equation:</strong><br>
        <div class="polynomial-display">${polynomialStr} = 0</div><br>
        
        <strong>Degree:</strong> ${degree}<br><br>
        
        <strong>Solutions:</strong><br>
    `;
    
    if (roots.length === 0) {
        resultHTML += '<span style="color: var(--warning);">No real roots found</span>';
    } else {
        roots.forEach((root, index) => {
            if (typeof root === 'string') {
                resultHTML += `<div class="root-item">${root}</div>`;
            } else if (typeof root === 'object') {
                resultHTML += `<div class="root-item">x${index + 1} = ${root.real.toFixed(6)} ${root.imag >= 0 ? '+' : ''}${root.imag.toFixed(6)}i</div>`;
            } else {
                resultHTML += `<div class="root-item">x${index + 1} = ${root.toFixed(6)}</div>`;
            }
        });
    }
    
    resultHTML += `<br><small>Roots are values of x where the polynomial equals zero</small>`;

    const polySteps = [
        {
            title: 'Standard Polynomial Form',
            math: `${polynomialStr} = 0`,
            explanation: `Identify polynomial equation of degree ${degree} with leading coefficient ${coefficients[0]}.`
        },
        {
            title: 'Algebraic Resolution Method',
            math: degree === 1 ? 'Linear formula: x = -b / a' : degree === 2 ? 'Quadratic formula: x = (-b ± √(b² - 4ac)) / (2a)' : `Degree ${degree}: Numerical companion matrix factorization & deflation`,
            explanation: degree === 1 ? 'Direct linear inverse solution.' : degree === 2 ? 'Evaluate discriminant Δ = b² - 4ac to determine root character.' : 'Apply QR/companion matrix factorization to solve all complex and real roots.'
        },
        {
            title: 'Fundamental Theorem of Algebra',
            math: `Degree ${degree} → Exactly ${degree} root(s) counting multiplicities`,
            explanation: `The polynomial equation has ${roots.length} computed root(s) satisfying P(x) = 0.`
        }
    ];
    
    resultDiv.innerHTML = resultHTML + formatStepsTimelineHTML(polySteps);
}

// Format polynomial for display
function formatPolynomial(coefficients, degree) {
    let terms = [];
    
    for (let i = 0; i <= degree; i++) {
        const coeff = coefficients[i];
        const power = degree - i;
        
        if (coeff === 0) continue;
        
        let term = '';
        
        // Handle coefficient
        if (i === 0) {
            term += coeff;
        } else {
            term += coeff > 0 ? ` + ${coeff}` : ` - ${Math.abs(coeff)}`;
        }
        
        // Handle variable and power
        if (power > 0) {
            if (Math.abs(coeff) === 1 && power > 0) {
                term = term.replace(/[+-]?\s*1/, term.includes('-') ? '-' : (i === 0 ? '' : '+'));
            }
            
            if (power === 1) {
                term += 'x';
            } else {
                term += `x<sup>${power}</sup>`;
            }
        }
        
        terms.push(term);
    }
    
    return terms.join('').replace(/^\s*\+\s*/, '') || '0';
}

// Analyze polynomial function
function analyzePolynomial() {
    const analysisDiv = document.getElementById('polynomialAnalysis');
    
    try {
        const polynomial = parsePolynomial();
        const analysis = performPolynomialAnalysis(polynomial);
        
        displayPolynomialAnalysis(polynomial, analysis, analysisDiv);
    } catch (error) {
        analysisDiv.innerHTML = `<span style="color: var(--danger)">Error: ${error.message}</span>`;
    }
}

// Perform polynomial analysis
function performPolynomialAnalysis(polynomial) {
    const { coefficients, degree } = polynomial;
    
    const analysis = {
        leadingCoefficient: coefficients[0],
        constantTerm: coefficients[coefficients.length - 1],
        endBehavior: getEndBehavior(coefficients[0], degree),
        derivative: getDerivative(coefficients, degree),
        criticalPoints: [],
        inflectionPoints: []
    };
    
    // Find critical points (where derivative = 0)
    if (degree > 1) {
        const derivativeRoots = findPolynomialRoots(analysis.derivative);
        analysis.criticalPoints = derivativeRoots.filter(root => typeof root === 'number');
    }
    
    // Find inflection points (where second derivative = 0)
    if (degree > 2) {
        const secondDerivative = getDerivative(analysis.derivative.coefficients, analysis.derivative.degree);
        const secondDerivativeRoots = findPolynomialRoots(secondDerivative);
        analysis.inflectionPoints = secondDerivativeRoots.filter(root => typeof root === 'number');
    }
    
    return analysis;
}

// Get polynomial derivative
function getDerivative(coefficients, degree) {
    if (degree === 0) {
        return { coefficients: [0], degree: 0 };
    }
    
    const derivCoeffs = [];
    for (let i = 0; i < degree; i++) {
        derivCoeffs.push(coefficients[i] * (degree - i));
    }
    
    return { coefficients: derivCoeffs, degree: degree - 1 };
}

// Get end behavior
function getEndBehavior(leadingCoeff, degree) {
    const isEven = degree % 2 === 0;
    const isPositive = leadingCoeff > 0;
    
    if (isEven) {
        return isPositive ? 
            'As x → ±∞, f(x) → +∞' : 
            'As x → ±∞, f(x) → -∞';
    } else {
        return isPositive ? 
            'As x → -∞, f(x) → -∞; As x → +∞, f(x) → +∞' : 
            'As x → -∞, f(x) → +∞; As x → +∞, f(x) → -∞';
    }
}

// Display polynomial analysis
function displayPolynomialAnalysis(polynomial, analysis, analysisDiv) {
    const { coefficients, degree } = polynomial;
    const polynomialStr = formatPolynomial(coefficients, degree);
    
    let analysisHTML = `
        <strong>Function Analysis:</strong><br>
        <div class="polynomial-display">f(x) = ${polynomialStr}</div><br>
        
        <div class="analysis-grid">
            <div class="analysis-item">
                <strong>Degree:</strong> ${degree}
            </div>
            <div class="analysis-item">
                <strong>Leading Coefficient:</strong> ${analysis.leadingCoefficient}
            </div>
            <div class="analysis-item">
                <strong>Constant Term:</strong> ${analysis.constantTerm}
            </div>
            <div class="analysis-item">
                <strong>End Behavior:</strong><br>
                <small>${analysis.endBehavior}</small>
            </div>
        </div><br>
        
        <strong>Derivative:</strong><br>
        <div class="polynomial-display">f'(x) = ${formatPolynomial(analysis.derivative.coefficients, analysis.derivative.degree)}</div><br>
    `;
    
    if (analysis.criticalPoints.length > 0) {
        analysisHTML += `<strong>Critical Points:</strong><br>`;
        analysis.criticalPoints.forEach((point, index) => {
            analysisHTML += `x = ${point.toFixed(6)}<br>`;
        });
        analysisHTML += '<br>';
    }
    
    if (analysis.inflectionPoints.length > 0) {
        analysisHTML += `<strong>Inflection Points:</strong><br>`;
        analysis.inflectionPoints.forEach((point, index) => {
            analysisHTML += `x = ${point.toFixed(6)}<br>`;
        });
        analysisHTML += '<br>';
    }
    
    analysisHTML += `<small>Critical points are where f'(x) = 0. Inflection points are where f''(x) = 0.</small>`;
    
    analysisDiv.innerHTML = analysisHTML;
}

// Clear polynomial inputs
function clearPolynomial() {
    // Clear coefficient inputs
    const degree = parseInt(document.getElementById('polynomialDegree').value);
    for (let i = 0; i <= degree; i++) {
        const input = document.getElementById(`coeff${i}`);
        if (input) input.value = '';
    }
    
    // Clear other inputs
    document.getElementById('polynomialExpression').value = '';
    document.getElementById('polynomialFactored').value = '';
    
    // Clear results
    document.getElementById('polynomialResult').innerHTML = '<p class="no-result">Polynomial solutions will appear here...</p>';
    document.getElementById('polynomialAnalysis').innerHTML = '<p class="no-result">Function analysis will appear here...</p>';
    document.getElementById('polynomialOperationResult').innerHTML = '<p class="no-result">Operation results will appear here...</p>';
    
    showNotification('Polynomial inputs cleared');
}

// Polynomial operations
let currentPolynomialOperation = 'arithmetic';

function setPolynomialOperation(operation) {
    currentPolynomialOperation = operation;
    
    // Update tab states
    document.querySelectorAll('.operation-tabs .btn-tab').forEach(btn => btn.classList.remove('active'));
    const opBtn = document.querySelector(`.operation-tabs .btn-tab[onclick*="${operation}"]`);
    if (opBtn) opBtn.classList.add('active');
    
    // Show/hide operation content
    document.querySelectorAll('.operation-content').forEach(content => content.classList.add('hidden'));
    document.getElementById(`${operation}Operation`).classList.remove('hidden');
    
    // Clear results
    document.getElementById('polynomialOperationResult').innerHTML = '<p class="no-result">Operation results will appear here...</p>';
}

// Polynomial arithmetic operations
function polynomialArithmetic(operation) {
    const resultDiv = document.getElementById('polynomialOperationResult');
    
    try {
        const polyA = parsePolynomialExpression(document.getElementById('polyA').value);
        const polyB = parsePolynomialExpression(document.getElementById('polyB').value);
        
        let result;
        let operationSymbol;
        
        switch (operation) {
            case 'add':
                result = addPolynomials(polyA, polyB);
                operationSymbol = '+';
                break;
            case 'subtract':
                result = subtractPolynomials(polyA, polyB);
                operationSymbol = '-';
                break;
            case 'multiply':
                result = multiplyPolynomials(polyA, polyB);
                operationSymbol = '×';
                break;
        }
        
        displayArithmeticResult(polyA, polyB, result, operationSymbol, resultDiv);
    } catch (error) {
        resultDiv.innerHTML = `<span style="color: var(--danger)">Error: ${error.message}</span>`;
    }
}

// Parse polynomial expression for operations
function parsePolynomialExpression(expr) {
    if (!expr || expr.trim() === '') {
        throw new Error('Please enter polynomial expressions');
    }
    
    // Use the same parsing logic as the main parser
    const tempInput = document.getElementById('polynomialExpression');
    const originalValue = tempInput.value;
    tempInput.value = expr;
    
    const originalMethod = document.getElementById('polynomialInputMethod').value;
    document.getElementById('polynomialInputMethod').value = 'expression';
    
    const result = parseFromExpression();
    
    // Restore original values
    tempInput.value = originalValue;
    document.getElementById('polynomialInputMethod').value = originalMethod;
    
    return result;
}

// Add polynomials
function addPolynomials(polyA, polyB) {
    const maxDegree = Math.max(polyA.degree, polyB.degree);
    const result = new Array(maxDegree + 1).fill(0);
    
    // Pad coefficients arrays to same length
    const coeffsA = [...polyA.coefficients];
    const coeffsB = [...polyB.coefficients];
    
    while (coeffsA.length < maxDegree + 1) coeffsA.unshift(0);
    while (coeffsB.length < maxDegree + 1) coeffsB.unshift(0);
    
    for (let i = 0; i <= maxDegree; i++) {
        result[i] = coeffsA[i] + coeffsB[i];
    }
    
    // Remove leading zeros
    while (result.length > 1 && result[0] === 0) {
        result.shift();
    }
    
    return { coefficients: result, degree: result.length - 1 };
}

// Subtract polynomials
function subtractPolynomials(polyA, polyB) {
    const maxDegree = Math.max(polyA.degree, polyB.degree);
    const result = new Array(maxDegree + 1).fill(0);
    
    // Pad coefficients arrays to same length
    const coeffsA = [...polyA.coefficients];
    const coeffsB = [...polyB.coefficients];
    
    while (coeffsA.length < maxDegree + 1) coeffsA.unshift(0);
    while (coeffsB.length < maxDegree + 1) coeffsB.unshift(0);
    
    for (let i = 0; i <= maxDegree; i++) {
        result[i] = coeffsA[i] - coeffsB[i];
    }
    
    // Remove leading zeros
    while (result.length > 1 && result[0] === 0) {
        result.shift();
    }
    
    return { coefficients: result, degree: result.length - 1 };
}

// Display arithmetic result
function displayArithmeticResult(polyA, polyB, result, operation, resultDiv) {
    const polyAStr = formatPolynomial(polyA.coefficients, polyA.degree);
    const polyBStr = formatPolynomial(polyB.coefficients, polyB.degree);
    const resultStr = formatPolynomial(result.coefficients, result.degree);
    
    resultDiv.innerHTML = `
        <strong>Polynomial ${operation === '+' ? 'Addition' : operation === '-' ? 'Subtraction' : 'Multiplication'}:</strong><br><br>
        
        <div class="polynomial-operation-display">
            <div class="polynomial-display">P(x) = ${polyAStr}</div>
            <div class="operation-symbol">${operation}</div>
            <div class="polynomial-display">Q(x) = ${polyBStr}</div>
            <div class="equals-symbol">=</div>
            <div class="polynomial-display result-highlight">${resultStr}</div>
        </div><br>
        
        <strong>Result Degree:</strong> ${result.degree}<br>
        <small>The ${operation === '×' ? 'product' : operation === '+' ? 'sum' : 'difference'} of the two polynomials</small>
    `;
}

// Polynomial division
function polynomialDivision() {
    const resultDiv = document.getElementById('polynomialOperationResult');
    
    try {
        const dividend = parsePolynomialExpression(document.getElementById('polyDividend').value);
        const divisor = parsePolynomialExpression(document.getElementById('polyDivisor').value);
        
        const { quotient, remainder } = dividePolynomials(dividend, divisor);
        
        displayDivisionResult(dividend, divisor, quotient, remainder, resultDiv);
    } catch (error) {
        resultDiv.innerHTML = `<span style="color: var(--danger)">Error: ${error.message}</span>`;
    }
}

// Divide polynomials using long division
function dividePolynomials(dividend, divisor) {
    if (divisor.degree === 0 && divisor.coefficients[0] === 0) {
        throw new Error('Cannot divide by zero polynomial');
    }
    
    let quotientCoeffs = [];
    let remainder = { ...dividend, coefficients: [...dividend.coefficients] };
    
    while (remainder.degree >= divisor.degree && remainder.coefficients.some(c => c !== 0)) {
        // Calculate the leading term of quotient
        const leadCoeff = remainder.coefficients[0] / divisor.coefficients[0];
        const leadPower = remainder.degree - divisor.degree;
        
        quotientCoeffs.push(leadCoeff);
        
        // Subtract divisor * leading term from remainder
        for (let i = 0; i <= divisor.degree; i++) {
            remainder.coefficients[i] -= leadCoeff * divisor.coefficients[i];
        }
        
        // Remove leading zero and update degree
        remainder.coefficients.shift();
        remainder.degree--;
    }
    
    // Handle case where quotient is zero
    if (quotientCoeffs.length === 0) {
        quotientCoeffs = [0];
    }
    
    const quotient = { coefficients: quotientCoeffs, degree: quotientCoeffs.length - 1 };
    
    return { quotient, remainder };
}

// Display division result
function displayDivisionResult(dividend, divisor, quotient, remainder, resultDiv) {
    const dividendStr = formatPolynomial(dividend.coefficients, dividend.degree);
    const divisorStr = formatPolynomial(divisor.coefficients, divisor.degree);
    const quotientStr = formatPolynomial(quotient.coefficients, quotient.degree);
    const remainderStr = formatPolynomial(remainder.coefficients, remainder.degree);
    
    resultDiv.innerHTML = `
        <strong>Polynomial Long Division:</strong><br><br>
        
        <div class="division-display">
            <div class="dividend-divisor">
                <span class="polynomial-display">${dividendStr}</span> ÷ <span class="polynomial-display">${divisorStr}</span>
            </div><br>
            
            <div class="quotient-remainder">
                <strong>Quotient:</strong> <span class="polynomial-display result-highlight">${quotientStr}</span><br>
                <strong>Remainder:</strong> <span class="polynomial-display">${remainderStr}</span>
            </div>
        </div><br>
        
        <strong>Verification:</strong><br>
        <div class="polynomial-display">
            (${divisorStr}) × (${quotientStr}) + (${remainderStr}) = ${dividendStr}
        </div><br>
        
        <small>Division follows the formula: Dividend = Divisor × Quotient + Remainder</small>
    `;
}

// Polynomial derivative
function polynomialDerivative() {
    const resultDiv = document.getElementById('polynomialOperationResult');
    
    try {
        const polynomial = parsePolynomialExpression(document.getElementById('polyDerivative').value);
        const order = parseInt(document.getElementById('derivativeOrder').value);
        
        let derivative = polynomial;
        for (let i = 0; i < order; i++) {
            derivative = getDerivative(derivative.coefficients, derivative.degree);
        }
        
        displayDerivativeResult(polynomial, derivative, order, resultDiv);
    } catch (error) {
        resultDiv.innerHTML = `<span style="color: var(--danger)">Error: ${error.message}</span>`;
    }
}

// Display derivative result
function displayDerivativeResult(original, derivative, order, resultDiv) {
    const originalStr = formatPolynomial(original.coefficients, original.degree);
    const derivativeStr = formatPolynomial(derivative.coefficients, derivative.degree);
    
    const orderSymbols = ['', "'", "''", "'''", "⁽⁴⁾"];
    const orderNames = ['', 'First', 'Second', 'Third', 'Fourth'];
    
    resultDiv.innerHTML = `
        <strong>${orderNames[order]} Derivative:</strong><br><br>
        
        <div class="derivative-display">
            <div class="polynomial-display">f(x) = ${originalStr}</div><br>
            <div class="polynomial-display result-highlight">f${orderSymbols[order]}(x) = ${derivativeStr}</div>
        </div><br>
        
        <strong>Derivative Rules Applied:</strong><br>
        <ul>
            <li>Power Rule: d/dx[x^n] = nx^(n-1)</li>
            <li>Constant Multiple Rule: d/dx[cf(x)] = c·f'(x)</li>
            <li>Sum Rule: d/dx[f(x) + g(x)] = f'(x) + g'(x)</li>
        </ul>
    `;
}

// Load polynomial examples
function loadPolynomialExample(type) {
    document.getElementById('polynomialInputMethod').value = 'coefficients';
    updatePolynomialInputMethod();
    
    switch (type) {
        case 'quadratic':
            document.getElementById('polynomialDegree').value = '2';
            updateCoefficientInputs();
            document.getElementById('coeff0').value = '1';
            document.getElementById('coeff1').value = '-5';
            document.getElementById('coeff2').value = '6';
            showNotification('Loaded quadratic example: x² - 5x + 6 = 0');
            break;
            
        case 'cubic':
            document.getElementById('polynomialDegree').value = '3';
            updateCoefficientInputs();
            document.getElementById('coeff0').value = '1';
            document.getElementById('coeff1').value = '-6';
            document.getElementById('coeff2').value = '11';
            document.getElementById('coeff3').value = '-6';
            showNotification('Loaded cubic example: x³ - 6x² + 11x - 6 = 0');
            break;
            
        case 'quartic':
            document.getElementById('polynomialDegree').value = '4';
            updateCoefficientInputs();
            document.getElementById('coeff0').value = '1';
            document.getElementById('coeff1').value = '0';
            document.getElementById('coeff2').value = '-10';
            document.getElementById('coeff3').value = '0';
            document.getElementById('coeff4').value = '9';
            showNotification('Loaded quartic example: x⁴ - 10x² + 9 = 0');
            break;
            
        case 'complex':
            document.getElementById('polynomialDegree').value = '2';
            updateCoefficientInputs();
            document.getElementById('coeff0').value = '1';
            document.getElementById('coeff1').value = '1';
            document.getElementById('coeff2').value = '1';
            showNotification('Loaded complex roots example: x² + x + 1 = 0');
            break;
    }
}
// ===== POLYNOMIAL GRAPHING FUNCTIONS =====

let currentPolynomialForGraph = null;
let currentRoots = [];
let currentCriticalPoints = [];

// Plot polynomial graph
function plotPolynomialGraph() {
    const canvas = document.getElementById('polynomialCanvas');
    const ctx = canvas.getContext('2d');
    const graphInfo = document.getElementById('graphInfo');
    
    try {
        // Get current polynomial
        currentPolynomialForGraph = parsePolynomial();
        
        // Get roots and critical points if available
        currentRoots = findPolynomialRoots(currentPolynomialForGraph);
        const analysis = performPolynomialAnalysis(currentPolynomialForGraph);
        currentCriticalPoints = analysis.criticalPoints;
        
        // Get graph settings
        const xMin = parseFloat(document.getElementById('xMin').value) || -10;
        const xMax = parseFloat(document.getElementById('xMax').value) || 10;
        const yMin = parseFloat(document.getElementById('yMin').value) || -10;
        const yMax = parseFloat(document.getElementById('yMax').value) || 10;
        
        const showGrid = document.getElementById('showGrid').checked;
        const showRoots = document.getElementById('showRoots').checked;
        const showCriticalPoints = document.getElementById('showCriticalPoints').checked;
        
        // Set up Retina / High-DPI support
        const dpr = (typeof window !== 'undefined' && window.devicePixelRatio) || 1;
        const logicalWidth = 800;
        const logicalHeight = 600;
        
        canvas.setAttribute('data-logical-width', logicalWidth);
        canvas.setAttribute('data-logical-height', logicalHeight);
        
        const physicalWidth = Math.round(logicalWidth * dpr);
        const physicalHeight = Math.round(logicalHeight * dpr);
        if (canvas.width !== physicalWidth || canvas.height !== physicalHeight) {
            canvas.width = physicalWidth;
            canvas.height = physicalHeight;
        }
        
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        ctx.clearRect(0, 0, logicalWidth, logicalHeight);
        
        // Set up coordinate system
        const padding = 40;
        const graphWidth = logicalWidth - 2 * padding;
        const graphHeight = logicalHeight - 2 * padding;
        
        // Coordinate transformation functions
        const xToCanvas = (x) => padding + ((x - xMin) / (xMax - xMin)) * graphWidth;
        const yToCanvas = (y) => logicalHeight - padding - ((y - yMin) / (yMax - yMin)) * graphHeight;
        const canvasToX = (canvasX) => xMin + ((canvasX - padding) / graphWidth) * (xMax - xMin);
        const canvasToY = (canvasY) => yMax - ((canvasY - padding) / graphHeight) * (yMax - yMin);
        
        // Draw grid
        if (showGrid) {
            drawGrid(ctx, xMin, xMax, yMin, yMax, xToCanvas, yToCanvas);
        }
        
        // Draw axes
        drawAxes(ctx, xMin, xMax, yMin, yMax, xToCanvas, yToCanvas);
        
        // Draw polynomial curve
        drawPolynomialCurve(ctx, currentPolynomialForGraph, xMin, xMax, xToCanvas, yToCanvas);
        
        // Draw roots
        if (showRoots && currentRoots.length > 0) {
            drawRoots(ctx, currentRoots, xToCanvas, yToCanvas);
        }
        
        // Draw critical points
        if (showCriticalPoints && currentCriticalPoints.length > 0) {
            drawCriticalPoints(ctx, currentCriticalPoints, currentPolynomialForGraph, xToCanvas, yToCanvas);
        }
        
        // Draw labels and legend
        drawLabels(ctx, xMin, xMax, yMin, yMax, xToCanvas, yToCanvas);
        drawLegend(ctx, currentPolynomialForGraph, showRoots, showCriticalPoints);
        
        // Update graph info
        updateGraphInfo(currentPolynomialForGraph, currentRoots, currentCriticalPoints);
        
        addToHistory('Polynomial graph', 'plotted');
    } catch (error) {
        graphInfo.innerHTML = `<div class="error">Error plotting graph: ${error.message}</div>`;
    }
}

// Draw grid
function drawGrid(ctx, xMin, xMax, yMin, yMax, xToCanvas, yToCanvas) {
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 0.5;
    ctx.setLineDash([2, 2]);
    
    // Vertical grid lines
    const xStep = (xMax - xMin) / 20;
    for (let x = Math.ceil(xMin / xStep) * xStep; x <= xMax; x += xStep) {
        ctx.beginPath();
        ctx.moveTo(xToCanvas(x), yToCanvas(yMin));
        ctx.lineTo(xToCanvas(x), yToCanvas(yMax));
        ctx.stroke();
    }
    
    // Horizontal grid lines
    const yStep = (yMax - yMin) / 15;
    for (let y = Math.ceil(yMin / yStep) * yStep; y <= yMax; y += yStep) {
        ctx.beginPath();
        ctx.moveTo(xToCanvas(xMin), yToCanvas(y));
        ctx.lineTo(xToCanvas(xMax), yToCanvas(y));
        ctx.stroke();
    }
    
    ctx.setLineDash([]);
}

// Draw axes
function drawAxes(ctx, xMin, xMax, yMin, yMax, xToCanvas, yToCanvas) {
    ctx.strokeStyle = '#64748b';
    ctx.lineWidth = 2;
    
    // X-axis
    if (yMin <= 0 && yMax >= 0) {
        ctx.beginPath();
        ctx.moveTo(xToCanvas(xMin), yToCanvas(0));
        ctx.lineTo(xToCanvas(xMax), yToCanvas(0));
        ctx.stroke();
    }
    
    // Y-axis
    if (xMin <= 0 && xMax >= 0) {
        ctx.beginPath();
        ctx.moveTo(xToCanvas(0), yToCanvas(yMin));
        ctx.lineTo(xToCanvas(0), yToCanvas(yMax));
        ctx.stroke();
    }
}

// Draw polynomial curve
function drawPolynomialCurve(ctx, polynomial, xMin, xMax, xToCanvas, yToCanvas) {
    ctx.strokeStyle = '#6366f1';
    ctx.lineWidth = 3;
    ctx.setLineDash([]);
    
    const steps = 1000;
    const dx = (xMax - xMin) / steps;
    
    ctx.beginPath();
    let firstPoint = true;
    
    for (let i = 0; i <= steps; i++) {
        const x = xMin + i * dx;
        const y = evaluatePolynomial(polynomial, x);
        
        // Skip if y is too large (avoid drawing off-screen)
        if (Math.abs(y) > 1000) continue;
        
        const canvasX = xToCanvas(x);
        const canvasY = yToCanvas(y);
        
        if (firstPoint) {
            ctx.moveTo(canvasX, canvasY);
            firstPoint = false;
        } else {
            ctx.lineTo(canvasX, canvasY);
        }
    }
    
    ctx.stroke();
}

// Evaluate polynomial at given x
function evaluatePolynomial(polynomial, x) {
    const { coefficients, degree } = polynomial;
    let result = 0;
    
    for (let i = 0; i <= degree; i++) {
        result += coefficients[i] * Math.pow(x, degree - i);
    }
    
    return result;
}

// Draw roots
function drawRoots(ctx, roots, xToCanvas, yToCanvas) {
    ctx.fillStyle = '#ef4444';
    ctx.strokeStyle = '#dc2626';
    ctx.lineWidth = 2;
    
    roots.forEach(root => {
        if (typeof root === 'number') {
            const x = xToCanvas(root);
            const y = yToCanvas(0);
            
            // Draw circle
            ctx.beginPath();
            ctx.arc(x, y, 6, 0, 2 * Math.PI);
            ctx.fill();
            ctx.stroke();
            
            // Draw label
            ctx.fillStyle = '#1f2937';
            ctx.font = '12px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(`x = ${root.toFixed(2)}`, x, y - 15);
            ctx.fillStyle = '#ef4444';
        }
    });
}

// Draw critical points
function drawCriticalPoints(ctx, criticalPoints, polynomial, xToCanvas, yToCanvas) {
    ctx.fillStyle = '#f59e0b';
    ctx.strokeStyle = '#d97706';
    ctx.lineWidth = 2;
    
    criticalPoints.forEach(point => {
        const x = xToCanvas(point);
        const y = yToCanvas(evaluatePolynomial(polynomial, point));
        
        // Draw diamond
        ctx.beginPath();
        ctx.moveTo(x, y - 8);
        ctx.lineTo(x + 6, y);
        ctx.lineTo(x, y + 8);
        ctx.lineTo(x - 6, y);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        
        // Draw label
        ctx.fillStyle = '#1f2937';
        ctx.font = '12px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(`(${point.toFixed(2)}, ${evaluatePolynomial(polynomial, point).toFixed(2)})`, x, y - 20);
        ctx.fillStyle = '#f59e0b';
    });
}

// Draw labels
function drawLabels(ctx, xMin, xMax, yMin, yMax, xToCanvas, yToCanvas) {
    ctx.fillStyle = '#1f2937';
    ctx.font = '14px Arial';
    ctx.textAlign = 'center';
    
    // X-axis labels
    const xStep = (xMax - xMin) / 10;
    for (let x = Math.ceil(xMin / xStep) * xStep; x <= xMax; x += xStep) {
        if (Math.abs(x) > 0.01) { // Skip zero
            ctx.fillText(x.toFixed(1), xToCanvas(x), yToCanvas(0) + 20);
        }
    }
    
    // Y-axis labels
    ctx.textAlign = 'right';
    const yStep = (yMax - yMin) / 8;
    for (let y = Math.ceil(yMin / yStep) * yStep; y <= yMax; y += yStep) {
        if (Math.abs(y) > 0.01) { // Skip zero
            ctx.fillText(y.toFixed(1), xToCanvas(0) - 10, yToCanvas(y) + 5);
        }
    }
    
    // Origin label
    ctx.textAlign = 'right';
    ctx.fillText('0', xToCanvas(0) - 10, yToCanvas(0) + 20);
}

// Draw legend
function drawLegend(ctx, polynomial, showRoots, showCriticalPoints) {
    const legendX = 20;
    let legendY = 20;
    
    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.fillRect(legendX - 10, legendY - 10, 200, showRoots && showCriticalPoints ? 80 : showRoots || showCriticalPoints ? 60 : 40);
    
    ctx.strokeStyle = '#64748b';
    ctx.lineWidth = 1;
    ctx.strokeRect(legendX - 10, legendY - 10, 200, showRoots && showCriticalPoints ? 80 : showRoots || showCriticalPoints ? 60 : 40);
    
    // Function curve
    ctx.strokeStyle = '#6366f1';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(legendX, legendY);
    ctx.lineTo(legendX + 20, legendY);
    ctx.stroke();
    
    ctx.fillStyle = '#1f2937';
    ctx.font = '12px Arial';
    ctx.textAlign = 'left';
    ctx.fillText(`f(x) = ${formatPolynomial(polynomial.coefficients, polynomial.degree)}`, legendX + 25, legendY + 4);
    
    legendY += 20;
    
    // Roots legend
    if (showRoots) {
        ctx.fillStyle = '#ef4444';
        ctx.beginPath();
        ctx.arc(legendX + 10, legendY, 4, 0, 2 * Math.PI);
        ctx.fill();
        
        ctx.fillStyle = '#1f2937';
        ctx.fillText('Roots (zeros)', legendX + 25, legendY + 4);
        legendY += 20;
    }
    
    // Critical points legend
    if (showCriticalPoints) {
        ctx.fillStyle = '#f59e0b';
        ctx.beginPath();
        ctx.moveTo(legendX + 10, legendY - 4);
        ctx.lineTo(legendX + 14, legendY);
        ctx.lineTo(legendX + 10, legendY + 4);
        ctx.lineTo(legendX + 6, legendY);
        ctx.closePath();
        ctx.fill();
        
        ctx.fillStyle = '#1f2937';
        ctx.fillText('Critical Points', legendX + 25, legendY + 4);
    }
}

// Update graph info
function updateGraphInfo(polynomial, roots, criticalPoints) {
    const graphInfo = document.getElementById('graphInfo');
    
    let infoHTML = `
        <div class="graph-summary">
            <h4>Graph Summary</h4>
            <p><strong>Function:</strong> f(x) = ${formatPolynomial(polynomial.coefficients, polynomial.degree)}</p>
            <p><strong>Degree:</strong> ${polynomial.degree}</p>
    `;
    
    if (roots.length > 0) {
        const realRoots = roots.filter(root => typeof root === 'number');
        if (realRoots.length > 0) {
            infoHTML += `<p><strong>Real Roots:</strong> ${realRoots.map(r => r.toFixed(3)).join(', ')}</p>`;
        }
    }
    
    if (criticalPoints.length > 0) {
        infoHTML += `<p><strong>Critical Points:</strong> ${criticalPoints.map(p => p.toFixed(3)).join(', ')}</p>`;
    }
    
    infoHTML += '</div>';
    graphInfo.innerHTML = infoHTML;
}

// Auto scale graph based on polynomial
function autoScaleGraph() {
    if (!currentPolynomialForGraph) {
        showNotification('Please plot a polynomial first');
        return;
    }
    
    // Find reasonable bounds by sampling the function
    let minY = Infinity;
    let maxY = -Infinity;
    const xRange = 20; // Sample from -10 to 10
    
    for (let x = -xRange/2; x <= xRange/2; x += 0.1) {
        const y = evaluatePolynomial(currentPolynomialForGraph, x);
        if (Math.abs(y) < 1000) { // Avoid extreme values
            minY = Math.min(minY, y);
            maxY = Math.max(maxY, y);
        }
    }
    
    // Add some padding
    const yPadding = (maxY - minY) * 0.1;
    minY -= yPadding;
    maxY += yPadding;
    
    // Update inputs
    document.getElementById('xMin').value = -xRange/2;
    document.getElementById('xMax').value = xRange/2;
    document.getElementById('yMin').value = minY.toFixed(1);
    document.getElementById('yMax').value = maxY.toFixed(1);
    
    // Replot
    plotPolynomialGraph();
    showNotification('Graph auto-scaled');
}

// Reset graph view to default
function resetGraphView() {
    document.getElementById('xMin').value = -10;
    document.getElementById('xMax').value = 10;
    document.getElementById('yMin').value = -10;
    document.getElementById('yMax').value = 10;
    document.getElementById('showGrid').checked = true;
    document.getElementById('showRoots').checked = true;
    document.getElementById('showCriticalPoints').checked = true;
    
    if (currentPolynomialForGraph) {
        plotPolynomialGraph();
    }
    
    showNotification('Graph view reset');
}

// Add mouse and touch interaction for polynomial graph with normalized coordinates
function initializeGraphInteraction() {
    const canvas = document.getElementById('polynomialCanvas');
    if (!canvas) return;
    
    function updatePolyCoordinates(clientX, clientY) {
        if (!currentPolynomialForGraph) return;
        
        const rect = canvas.getBoundingClientRect();
        if (!rect.width || !rect.height) return;
        
        const logicalWidth = parseFloat(canvas.getAttribute('data-logical-width')) || 800;
        const logicalHeight = parseFloat(canvas.getAttribute('data-logical-height')) || 600;
        
        // Normalize coordinates to compensate for CSS responsive scaling
        const scaleX = logicalWidth / rect.width;
        const scaleY = logicalHeight / rect.height;
        const mouseX = (clientX - rect.left) * scaleX;
        const mouseY = (clientY - rect.top) * scaleY;
        
        const xMin = parseFloat(document.getElementById('xMin')?.value) || -10;
        const xMax = parseFloat(document.getElementById('xMax')?.value) || 10;
        const yMin = parseFloat(document.getElementById('yMin')?.value) || -10;
        const yMax = parseFloat(document.getElementById('yMax')?.value) || 10;
        
        const padding = 40;
        const graphWidth = logicalWidth - 2 * padding;
        const graphHeight = logicalHeight - 2 * padding;
        
        if (mouseX >= padding && mouseX <= logicalWidth - padding &&
            mouseY >= padding && mouseY <= logicalHeight - padding) {
            
            const x = xMin + ((mouseX - padding) / graphWidth) * (xMax - xMin);
            const y = evaluatePolynomial(currentPolynomialForGraph, x);
            
            canvas.title = `x = ${x.toFixed(3)}, f(x) = ${y.toFixed(3)}`;
        }
    }
    
    canvas.addEventListener('mousemove', function(event) {
        updatePolyCoordinates(event.clientX, event.clientY);
    });
    
    canvas.addEventListener('touchstart', function(event) {
        if (event.touches.length > 0) {
            updatePolyCoordinates(event.touches[0].clientX, event.touches[0].clientY);
        }
    }, { passive: true });
    
    canvas.addEventListener('touchmove', function(event) {
        if (event.touches.length > 0) {
            const touch = event.touches[0];
            const rect = canvas.getBoundingClientRect();
            if (touch.clientX >= rect.left && touch.clientX <= rect.right &&
                touch.clientY >= rect.top && touch.clientY <= rect.bottom) {
                event.preventDefault();
                updatePolyCoordinates(touch.clientX, touch.clientY);
            }
        }
    }, { passive: false });
}

// ===== ADVANCED FUNCTION GRAPHER =====

let activeFunctions = [];
let currentFunctionType = 'custom';
let graphColors = ['#6366f1', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#06b6d4', '#f97316', '#84cc16'];
let colorIndex = 0;

// Initialize advanced grapher
function initializeAdvancedGrapher() {
    console.log('Initializing advanced grapher...');
    
    // Add a small delay to ensure DOM is ready
    setTimeout(() => {
        try {
            updateFunctionInputs();
            initializeAdvancedGraphInteraction();
            setupPreviewListeners();
            updateTrigPreview();
            updateExpPreview();
            updateLogPreview();
            
            // Initialize empty graph
            const canvas = document.getElementById('advancedCanvas');
            if (canvas) {
                console.log('Canvas found, initializing empty graph');
                const ctx = canvas.getContext('2d');
                drawEmptyGraph(ctx);
            } else {
                console.error('Advanced canvas not found');
            }
            
            console.log('Advanced grapher initialized successfully');
        } catch (error) {
            console.error('Error initializing advanced grapher:', error);
        }
    }, 100);
}

// Set function type
function setFunctionType(type) {
    currentFunctionType = type;
    
    // Update tab states
    document.querySelectorAll('.function-tabs .btn-tab').forEach(btn => btn.classList.remove('active'));
    const fnBtn = document.querySelector(`.function-tabs .btn-tab[onclick*="${type}"]`);
    if (fnBtn) fnBtn.classList.add('active');
    
    updateFunctionInputs();
}

// Update function inputs based on type
function updateFunctionInputs() {
    // Hide all input contents
    document.querySelectorAll('.function-input-content').forEach(content => {
        content.classList.add('hidden');
    });
    
    // Show selected input content
    document.getElementById(`${currentFunctionType}Function`).classList.remove('hidden');
    
    // Update polynomial inputs if needed
    if (currentFunctionType === 'polynomial') {
        updatePolyInputs();
    }
}

// Update polynomial coefficient inputs
function updatePolyInputs() {
    const degree = parseInt(document.getElementById('polyDegree').value) || 3;
    const container = document.getElementById('polyCoefficients');
    
    container.innerHTML = '';
    
    for (let i = 0; i <= degree; i++) {
        const power = degree - i;
        const div = document.createElement('div');
        div.className = 'coeff-input';
        
        div.innerHTML = `
            <label>x^${power}:</label>
            <input type="number" id="polyCoeff${i}" value="${i === 0 ? 1 : 0}" step="0.1">
        `;
        
        container.appendChild(div);
    }
}

// Update trigonometric function preview
function updateTrigPreview() {
    const amplitude = document.getElementById('trigAmplitude')?.value || 1;
    const type = document.getElementById('trigType')?.value || 'sin';
    const frequency = document.getElementById('trigFrequency')?.value || 1;
    const phase = document.getElementById('trigPhase')?.value || 0;
    const vertical = document.getElementById('trigVertical')?.value || 0;
    
    let preview = '';
    if (amplitude != 1) preview += amplitude + '*';
    preview += type + '(';
    if (frequency != 1) preview += frequency + '*';
    preview += 'x';
    if (phase != 0) preview += (phase > 0 ? ' + ' : ' - ') + Math.abs(phase);
    preview += ')';
    if (vertical != 0) preview += (vertical > 0 ? ' + ' : ' - ') + Math.abs(vertical);
    
    const previewElement = document.getElementById('trigPreview');
    if (previewElement) {
        previewElement.textContent = `f(x) = ${preview}`;
    }
}

// Update exponential function preview
function updateExpPreview() {
    const base = document.getElementById('expBase')?.value || Math.E;
    const coeff = document.getElementById('expCoeff')?.value || 1;
    const mult = document.getElementById('expMult')?.value || 1;
    const horizontal = document.getElementById('expHorizontal')?.value || 0;
    const vertical = document.getElementById('expVertical')?.value || 0;
    
    let preview = '';
    if (coeff != 1) preview += coeff + '*';
    
    const baseStr = Math.abs(parseFloat(base) - Math.E) < 0.001 ? 'e' : base;
    preview += baseStr + '^(';
    if (mult != 1) preview += mult + '*';
    preview += 'x';
    if (horizontal != 0) preview += (horizontal > 0 ? ' + ' : ' - ') + Math.abs(horizontal);
    preview += ')';
    if (vertical != 0) preview += (vertical > 0 ? ' + ' : ' - ') + Math.abs(vertical);
    
    const previewElement = document.getElementById('expPreview');
    if (previewElement) {
        previewElement.textContent = `f(x) = ${preview}`;
    }
}

// Update logarithmic function preview
function updateLogPreview() {
    const base = document.getElementById('logBase')?.value || 'e';
    const coeff = document.getElementById('logCoeff')?.value || 1;
    const mult = document.getElementById('logMult')?.value || 1;
    const horizontal = document.getElementById('logHorizontal')?.value || 0;
    const vertical = document.getElementById('logVertical')?.value || 0;
    
    let preview = '';
    if (coeff != 1) preview += coeff + '*';
    
    const logStr = base === 'e' ? 'ln' : base === '10' ? 'log' : `log_${base}`;
    preview += logStr + '(';
    if (mult != 1) preview += mult + '*';
    preview += 'x';
    if (horizontal != 0) preview += (horizontal > 0 ? ' + ' : ' - ') + Math.abs(horizontal);
    preview += ')';
    if (vertical != 0) preview += (vertical > 0 ? ' + ' : ' - ') + Math.abs(vertical);
    
    const previewElement = document.getElementById('logPreview');
    if (previewElement) {
        previewElement.textContent = `f(x) = ${preview}`;
    }
}

// Set exponential base presets
function setExpBase(base) {
    const baseInput = document.getElementById('expBase');
    if (base === 'e') {
        baseInput.value = Math.E.toFixed(3);
    } else {
        baseInput.value = base;
    }
    updateExpPreview();
}

// Add event listeners for real-time preview updates
function setupPreviewListeners() {
    // Trigonometric inputs
    ['trigAmplitude', 'trigType', 'trigFrequency', 'trigPhase', 'trigVertical'].forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            element.addEventListener('input', updateTrigPreview);
            element.addEventListener('change', updateTrigPreview);
        }
    });
    
    // Exponential inputs
    ['expBase', 'expCoeff', 'expMult', 'expHorizontal', 'expVertical'].forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            element.addEventListener('input', updateExpPreview);
        }
    });
    
    // Logarithmic inputs
    ['logBase', 'logCoeff', 'logMult', 'logHorizontal', 'logVertical'].forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            element.addEventListener('input', updateLogPreview);
            element.addEventListener('change', updateLogPreview);
        }
    });
    
    // Log base custom input
    const logBase = document.getElementById('logBase');
    const logCustomBase = document.getElementById('logCustomBase');
    if (logBase && logCustomBase) {
        logBase.addEventListener('change', () => {
            logCustomBase.style.display = logBase.value === 'custom' ? 'inline' : 'none';
            updateLogPreview();
        });
    }
}

// Call setup when DOM is loaded or when grapher mode is initialized
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setupPreviewListeners);
} else {
    setupPreviewListeners();
}

// Build function string based on current type
function buildFunctionString() {
    switch (currentFunctionType) {
        case 'custom':
            return document.getElementById('customFunctionInput').value.trim();
            
        case 'polynomial':
            const degree = parseInt(document.getElementById('polyDegree').value);
            let polyStr = '';
            let hasTerms = false;
            
            for (let i = 0; i <= degree; i++) {
                const coeff = parseFloat(document.getElementById(`polyCoeff${i}`).value) || 0;
                const power = degree - i;
                
                if (coeff === 0) continue;
                
                if (hasTerms && coeff > 0) polyStr += ' + ';
                else if (hasTerms && coeff < 0) polyStr += ' - ';
                else if (coeff < 0) polyStr += '-';
                
                const absCoeff = Math.abs(coeff);
                
                if (power === 0) {
                    polyStr += absCoeff;
                } else if (power === 1) {
                    if (absCoeff === 1) polyStr += 'x';
                    else polyStr += absCoeff + '*x';
                } else {
                    if (absCoeff === 1) polyStr += `x^${power}`;
                    else polyStr += `${absCoeff}*x^${power}`;
                }
                
                hasTerms = true;
            }
            
            return polyStr || '0';
            
        case 'trigonometric':
            const amplitude = parseFloat(document.getElementById('trigAmplitude').value) || 1;
            const type = document.getElementById('trigType').value;
            const frequency = parseFloat(document.getElementById('trigFrequency').value) || 1;
            const phase = parseFloat(document.getElementById('trigPhase').value) || 0;
            const vertical = parseFloat(document.getElementById('trigVertical').value) || 0;
            
            let trigStr = '';
            if (amplitude !== 1) trigStr += amplitude + '*';
            trigStr += type + '(';
            if (frequency !== 1) trigStr += frequency + '*';
            trigStr += 'x';
            if (phase !== 0) trigStr += (phase > 0 ? ' + ' : ' - ') + Math.abs(phase);
            trigStr += ')';
            if (vertical !== 0) trigStr += (vertical > 0 ? ' + ' : ' - ') + Math.abs(vertical);
            
            return trigStr;
            
        case 'exponential':
            const base = parseFloat(document.getElementById('expBase').value) || Math.E;
            const coeff = parseFloat(document.getElementById('expCoeff').value) || 1;
            const mult = parseFloat(document.getElementById('expMult').value) || 1;
            const horizontal = parseFloat(document.getElementById('expHorizontal').value) || 0;
            const expVertical = parseFloat(document.getElementById('expVertical').value) || 0;
            
            let expStr = '';
            if (coeff !== 1) expStr += coeff + '*';
            
            if (Math.abs(base - Math.E) < 0.001) {
                expStr += 'exp(';
            } else {
                expStr += base + '^(';
            }
            
            if (mult !== 1) expStr += mult + '*';
            expStr += 'x';
            if (horizontal !== 0) expStr += (horizontal > 0 ? ' + ' : ' - ') + Math.abs(horizontal);
            expStr += ')';
            if (expVertical !== 0) expStr += (expVertical > 0 ? ' + ' : ' - ') + Math.abs(expVertical);
            
            return expStr;
            
        case 'logarithmic':
            const logBase = document.getElementById('logBase').value;
            const logCoeff = parseFloat(document.getElementById('logCoeff').value) || 1;
            const logMult = parseFloat(document.getElementById('logMult').value) || 1;
            const logHorizontal = parseFloat(document.getElementById('logHorizontal').value) || 0;
            const logVertical = parseFloat(document.getElementById('logVertical').value) || 0;
            
            let logStr = '';
            if (logCoeff !== 1) logStr += logCoeff + '*';
            
            if (logBase === 'e') {
                logStr += 'ln(';
            } else if (logBase === '10') {
                logStr += 'log(';
            } else if (logBase === '2') {
                logStr += 'log2(';
            } else {
                const customBase = parseFloat(document.getElementById('logCustomBase').value) || 3;
                logStr += `log(`;
            }
            
            if (logMult !== 1) logStr += logMult + '*';
            logStr += 'x';
            if (logHorizontal !== 0) logStr += (logHorizontal > 0 ? ' + ' : ' - ') + Math.abs(logHorizontal);
            logStr += ')';
            
            if (logBase === 'custom') {
                const customBase = parseFloat(document.getElementById('logCustomBase').value) || 3;
                logStr += ` / log(${customBase})`;
            } else if (logBase === '2') {
                logStr = logStr.replace('log2(', 'log(') + ' / log(2)';
            }
            
            if (logVertical !== 0) logStr += (logVertical > 0 ? ' + ' : ' - ') + Math.abs(logVertical);
            
            return logStr;
            
        default:
            return '';
    }
}

// Add function to graph
function addFunctionToGraph() {
    try {
        const functionStr = buildFunctionString();
        
        if (!functionStr) {
            showNotification('Please enter a function');
            return;
        }
        
        console.log('Adding function:', functionStr);
        
        // Test if function is valid by evaluating at x=0
        try {
            const testResult = evaluateFunction(functionStr, 0);
            console.log('Function test at x=0:', testResult);
        } catch (error) {
            console.error('Function validation error:', error);
            showNotification('Invalid function syntax: ' + error.message);
            return;
        }
        
        const functionObj = {
            id: Date.now(),
            expression: functionStr,
            color: graphColors[colorIndex % graphColors.length],
            visible: true,
            type: currentFunctionType
        };
        
        activeFunctions.push(functionObj);
        colorIndex++;
        
        console.log('Active functions:', activeFunctions);
        
        updateFunctionList();
        plotAdvancedGraph();
        
        showNotification(`Function added: ${functionStr}`);
        
    } catch (error) {
        console.error('Error adding function:', error);
        showNotification('Error adding function: ' + error.message);
    }
}

// Whitelist of allowed identifier tokens in user expressions
const SAFE_MATH_IDENTIFIERS = new Set([
    'x', 't', 'y', 'u', 'v', 'z',
    'pi', 'PI', 'e', 'E',
    'sin', 'cos', 'tan', 'asin', 'acos', 'atan',
    'sec', 'csc', 'cot',
    'ln', 'log', 'log10', 'log2', 'exp',
    'sqrt', 'cbrt', 'abs', 'floor', 'ceil', 'round'
]);

// Evaluate mathematical function safely without code injection risks
function evaluateFunction(expression, x, variableName = 'x') {
    try {
        let expr = String(expression).trim();
        if (!expr) return NaN;

        // Disallow dangerous syntax: property access, indexing, assignments, semicolons, backticks, quotes
        if (/[;`'"\\\[\]{}]/.test(expr)) {
            throw new Error('Disallowed characters in expression');
        }
        if (/\.\s*[a-zA-Z_$]/.test(expr)) {
            throw new Error('Property access is not allowed');
        }

        // Check all identifiers against whitelist
        const identifiers = expr.match(/[a-zA-Z_$][a-zA-Z0-9_$]*/g) || [];
        for (const id of identifiers) {
            if (!SAFE_MATH_IDENTIFIERS.has(id)) {
                throw new Error('Unknown or forbidden identifier: ' + id);
            }
        }

        const angleMode = document.getElementById('graphAngleMode')?.value || 'radians';
        const isDeg = (angleMode === 'degrees' || angleMode === 'deg');

        const scope = {
            x: Number(x),
            [variableName]: Number(x),
            pi: Math.PI, PI: Math.PI,
            e: Math.E, E: Math.E,
            sin: (u) => isDeg ? Math.sin(u * Math.PI / 180) : Math.sin(u),
            cos: (u) => isDeg ? Math.cos(u * Math.PI / 180) : Math.cos(u),
            tan: (u) => isDeg ? Math.tan(u * Math.PI / 180) : Math.tan(u),
            asin: (u) => isDeg ? Math.asin(u) * 180 / Math.PI : Math.asin(u),
            acos: (u) => isDeg ? Math.acos(u) * 180 / Math.PI : Math.acos(u),
            atan: (u) => isDeg ? Math.atan(u) * 180 / Math.PI : Math.atan(u),
            sec: (u) => 1 / (isDeg ? Math.cos(u * Math.PI / 180) : Math.cos(u)),
            csc: (u) => 1 / (isDeg ? Math.sin(u * Math.PI / 180) : Math.sin(u)),
            cot: (u) => 1 / (isDeg ? Math.tan(u * Math.PI / 180) : Math.tan(u)),
            ln: Math.log,
            log: Math.log10,
            log10: Math.log10,
            log2: Math.log2,
            exp: Math.exp,
            sqrt: Math.sqrt,
            cbrt: Math.cbrt,
            abs: Math.abs,
            floor: Math.floor,
            ceil: Math.ceil,
            round: Math.round
        };

        expr = expr.replace(/\^/g, '**');

        // Implicit multiplication:
        // A number (not part of identifier like log2) followed by a letter or opening paren
        expr = expr.replace(/(?<![a-zA-Z_])(\d+(?:\.\d+)?)\s*([a-zA-Z_(])/g, '$1*$2');
        // Closing paren followed by letter, opening paren, or digit
        expr = expr.replace(/(\))\s*([a-zA-Z_\d(])/g, '$1*$2');

        const paramNames = Object.keys(scope);
        const paramValues = Object.values(scope);

        // Mask global scope so code execution cannot reach window, document, or globalThis
        const fn = new Function('window', 'document', 'globalThis', ...paramNames, '"use strict"; return (' + expr + ');');
        const val = fn(undefined, undefined, undefined, ...paramValues);
        return typeof val === 'number' && isFinite(val) ? val : (isNaN(val) ? NaN : (val > 0 ? Infinity : -Infinity));
    } catch (error) {
        throw new Error('Invalid expression: ' + error.message);
    }
}

// Plot advanced graph with Retina / High-DPI support
function plotAdvancedGraph() {
    const canvas = document.getElementById('advancedCanvas');
    if (!canvas) {
        console.error('Canvas not found');
        return;
    }
    
    const dpr = (typeof window !== 'undefined' && window.devicePixelRatio) || 1;
    const logicalWidth = 900;
    const logicalHeight = 700;
    
    canvas.setAttribute('data-logical-width', logicalWidth);
    canvas.setAttribute('data-logical-height', logicalHeight);
    
    const physicalWidth = Math.round(logicalWidth * dpr);
    const physicalHeight = Math.round(logicalHeight * dpr);
    
    if (canvas.width !== physicalWidth || canvas.height !== physicalHeight) {
        canvas.width = physicalWidth;
        canvas.height = physicalHeight;
    }
    
    const ctx = canvas.getContext('2d');
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    
    console.log('Plotting graph with', activeFunctions.length, 'functions (DPR:', dpr, ')');
    
    if (activeFunctions.length === 0) {
        ctx.clearRect(0, 0, logicalWidth, logicalHeight);
        drawEmptyGraph(ctx);
        return;
    }
    
    try {
        const xMin = parseFloat(document.getElementById('graphXMin')?.value || document.getElementById('advancedXMin')?.value) || -10;
        const xMax = parseFloat(document.getElementById('graphXMax')?.value || document.getElementById('advancedXMax')?.value) || 10;
        const yMin = parseFloat(document.getElementById('graphYMin')?.value || document.getElementById('advancedYMin')?.value) || -10;
        const yMax = parseFloat(document.getElementById('graphYMax')?.value || document.getElementById('advancedYMax')?.value) || 10;
        const resolution = parseInt(document.getElementById('graphResolution')?.value) || 1000;
        
        const showGrid = (document.getElementById('showAdvancedGrid') || document.getElementById('advancedShowGrid'))?.checked ?? true;
        const showAxes = (document.getElementById('showAxes') || document.getElementById('advancedShowAxes'))?.checked ?? true;
        const showLabels = (document.getElementById('showLabels') || document.getElementById('advancedShowLabels'))?.checked ?? true;
        const showZeros = (document.getElementById('showZeros') || document.getElementById('advancedShowZeros'))?.checked ?? true;
        
        console.log('Graph settings:', { xMin, xMax, yMin, yMax, resolution });
        
        // Clear canvas using logical dimensions
        ctx.clearRect(0, 0, logicalWidth, logicalHeight);
        
        // Set up coordinate system
        const padding = 50;
        const graphWidth = logicalWidth - 2 * padding;
        const graphHeight = logicalHeight - 2 * padding;
        
        const xToCanvas = (x) => padding + ((x - xMin) / (xMax - xMin)) * graphWidth;
        const yToCanvas = (y) => logicalHeight - padding - ((y - yMin) / (yMax - yMin)) * graphHeight;
        
        // Draw grid
        if (showGrid) {
            drawAdvancedGrid(ctx, xMin, xMax, yMin, yMax, xToCanvas, yToCanvas);
        }
        
        // Draw axes
        if (showAxes) {
            drawAdvancedAxes(ctx, xMin, xMax, yMin, yMax, xToCanvas, yToCanvas);
        }
        
        // Draw labels
        if (showLabels) {
            drawAdvancedLabels(ctx, xMin, xMax, yMin, yMax, xToCanvas, yToCanvas);
        }
        
        // Draw functions
        activeFunctions.forEach((func, index) => {
            if (func.visible) {
                console.log(`Drawing function ${index + 1}:`, func.expression);
                drawAdvancedFunction(ctx, func, xMin, xMax, yMin, yMax, resolution, xToCanvas, yToCanvas);
                
                // Draw zeros if enabled
                if (showZeros) {
                    findAndDrawZeros(ctx, func, xMin, xMax, xToCanvas, yToCanvas);
                }
            }
        });
        
        // Draw legend
        drawAdvancedLegend(ctx, activeFunctions);
        
        console.log('Graph plotted successfully');
        
    } catch (error) {
        console.error('Error plotting graph:', error);
        showNotification('Error plotting graph: ' + error.message);
    }
}

// Find and draw zeros (roots) for advanced functions
function findAndDrawZeros(ctx, func, xMin, xMax, xToCanvas, yToCanvas) {
    const zeros = [];
    const resolution = 1000;
    const dx = (xMax - xMin) / resolution;
    
    // Simple zero-finding using sign changes
    let prevY = null;
    for (let i = 0; i <= resolution; i++) {
        const x = xMin + i * dx;
        try {
            const y = evaluateFunction(func.expression, x);
            
            if (prevY !== null && Math.sign(y) !== Math.sign(prevY) && isFinite(y) && isFinite(prevY)) {
                // Found a sign change, approximate the zero
                const prevX = xMin + (i - 1) * dx;
                const zeroX = prevX - prevY * (x - prevX) / (y - prevY);
                zeros.push(zeroX);
            }
            prevY = y;
        } catch (error) {
            prevY = null;
        }
    }
    
    // Draw zeros
    ctx.fillStyle = '#ef4444';
    ctx.strokeStyle = '#dc2626';
    ctx.lineWidth = 2;
    
    zeros.forEach(zero => {
        const x = xToCanvas(zero);
        const y = yToCanvas(0);
        
        // Draw circle
        ctx.beginPath();
        ctx.arc(x, y, 5, 0, 2 * Math.PI);
        ctx.fill();
        ctx.stroke();
        
        // Draw label
        ctx.fillStyle = '#1f2937';
        ctx.font = '10px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(`${zero.toFixed(2)}`, x, y - 10);
        ctx.fillStyle = '#ef4444';
    });
}

// Draw advanced function curve with robust asymptote handling
function drawAdvancedFunction(ctx, func, xMin, xMax, yMin, yMax, resolution, xToCanvas, yToCanvas) {
    ctx.strokeStyle = func.color;
    ctx.lineWidth = 2.5;
    ctx.setLineDash([]);
    
    const dx = (xMax - xMin) / resolution;
    const ySpan = yMax - yMin;
    const logicalHeight = parseFloat(ctx.canvas.getAttribute('data-logical-height')) || 700;
    
    ctx.beginPath();
    let isDrawing = false;
    let lastY = null;
    
    for (let i = 0; i <= resolution; i++) {
        const x = xMin + i * dx;
        
        try {
            const y = evaluateFunction(func.expression, x);
            
            // Skip non-finite or extreme values
            if (!isFinite(y) || Math.abs(y) > 1e7) {
                isDrawing = false;
                lastY = null;
                continue;
            }
            
            const canvasX = xToCanvas(x);
            const canvasY = yToCanvas(y);
            
            // Detect vertical asymptotes (e.g. tan(x), 1/x, sec(x)):
            // 1. Extreme vertical jump between adjacent points
            // 2. Sign flip with large magnitude across the pole
            if (lastY !== null) {
                const dy = Math.abs(y - lastY);
                const isSignFlip = (y * lastY < 0);
                const isLargeMagnitude = (Math.abs(y) > ySpan * 0.25 || Math.abs(lastY) > ySpan * 0.25);
                const isAsymptote = (isSignFlip && isLargeMagnitude && dy > ySpan * 0.35) || (dy > ySpan * 1.5);
                
                if (isAsymptote) {
                    isDrawing = false;
                }
            }
            
            // Skip points far outside canvas bounds to prevent erratic line bridges
            if (canvasY < -100 || canvasY > logicalHeight + 100) {
                isDrawing = false;
                lastY = y;
                continue;
            }
            
            if (!isDrawing) {
                ctx.moveTo(canvasX, canvasY);
                isDrawing = true;
            } else {
                ctx.lineTo(canvasX, canvasY);
            }
            lastY = y;
        } catch (error) {
            isDrawing = false;
            lastY = null;
        }
    }
    
    ctx.stroke();
}

// Function curve drawer with safe yMin/yMax resolution
function drawFunctionCurve(ctx, func, xMin, xMax, xToCanvas, yToCanvas) {
    const yMin = parseFloat(document.getElementById('graphYMin')?.value || document.getElementById('advancedYMin')?.value) || -10;
    const yMax = parseFloat(document.getElementById('graphYMax')?.value || document.getElementById('advancedYMax')?.value) || 10;
    const resolution = parseInt(document.getElementById('graphResolution')?.value) || 1000;
    drawAdvancedFunction(ctx, func, xMin, xMax, yMin, yMax, resolution, xToCanvas, yToCanvas);
}

// Draw advanced grid
function drawAdvancedGrid(ctx, xMin, xMax, yMin, yMax, xToCanvas, yToCanvas) {
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 0.5;
    ctx.setLineDash([1, 1]);
    
    // Vertical lines
    const xStep = (xMax - xMin) / 20;
    for (let x = Math.ceil(xMin / xStep) * xStep; x <= xMax; x += xStep) {
        ctx.beginPath();
        ctx.moveTo(xToCanvas(x), yToCanvas(yMin));
        ctx.lineTo(xToCanvas(x), yToCanvas(yMax));
        ctx.stroke();
    }
    
    // Horizontal lines
    const yStep = (yMax - yMin) / 14;
    for (let y = Math.ceil(yMin / yStep) * yStep; y <= yMax; y += yStep) {
        ctx.beginPath();
        ctx.moveTo(xToCanvas(xMin), yToCanvas(y));
        ctx.lineTo(xToCanvas(xMax), yToCanvas(y));
        ctx.stroke();
    }
    
    ctx.setLineDash([]);
}

// Draw advanced axes
function drawAdvancedAxes(ctx, xMin, xMax, yMin, yMax, xToCanvas, yToCanvas) {
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 2;
    
    // X-axis
    if (yMin <= 0 && yMax >= 0) {
        ctx.beginPath();
        ctx.moveTo(xToCanvas(xMin), yToCanvas(0));
        ctx.lineTo(xToCanvas(xMax), yToCanvas(0));
        ctx.stroke();
        
        // Arrow
        const arrowX = xToCanvas(xMax);
        const arrowY = yToCanvas(0);
        ctx.beginPath();
        ctx.moveTo(arrowX - 10, arrowY - 5);
        ctx.lineTo(arrowX, arrowY);
        ctx.lineTo(arrowX - 10, arrowY + 5);
        ctx.stroke();
    }
    
    // Y-axis
    if (xMin <= 0 && xMax >= 0) {
        ctx.beginPath();
        ctx.moveTo(xToCanvas(0), yToCanvas(yMin));
        ctx.lineTo(xToCanvas(0), yToCanvas(yMax));
        ctx.stroke();
        
        // Arrow
        const arrowX = xToCanvas(0);
        const arrowY = yToCanvas(yMax);
        ctx.beginPath();
        ctx.moveTo(arrowX - 5, arrowY + 10);
        ctx.lineTo(arrowX, arrowY);
        ctx.lineTo(arrowX + 5, arrowY + 10);
        ctx.stroke();
    }
}

// Draw advanced labels
function drawAdvancedLabels(ctx, xMin, xMax, yMin, yMax, xToCanvas, yToCanvas) {
    ctx.fillStyle = '#374151';
    ctx.font = '12px Arial';
    ctx.textAlign = 'center';
    
    // X-axis labels
    const xStep = (xMax - xMin) / 10;
    for (let x = Math.ceil(xMin / xStep) * xStep; x <= xMax; x += xStep) {
        if (Math.abs(x) > 0.01) {
            ctx.fillText(x.toFixed(1), xToCanvas(x), yToCanvas(0) + 20);
        }
    }
    
    // Y-axis labels
    ctx.textAlign = 'right';
    const yStep = (yMax - yMin) / 8;
    for (let y = Math.ceil(yMin / yStep) * yStep; y <= yMax; y += yStep) {
        if (Math.abs(y) > 0.01) {
            ctx.fillText(y.toFixed(1), xToCanvas(0) - 10, yToCanvas(y) + 4);
        }
    }
}

// Draw advanced legend
function drawAdvancedLegend(ctx, functions) {
    if (functions.length === 0) return;
    
    const legendX = 20;
    let legendY = 20;
    const legendWidth = 250;
    const itemHeight = 25;
    const legendHeight = functions.length * itemHeight + 20;
    
    // Background
    ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
    ctx.fillRect(legendX - 10, legendY - 10, legendWidth, legendHeight);
    
    ctx.strokeStyle = '#d1d5db';
    ctx.lineWidth = 1;
    ctx.strokeRect(legendX - 10, legendY - 10, legendWidth, legendHeight);
    
    // Function entries
    functions.forEach((func, index) => {
        const y = legendY + index * itemHeight;
        
        // Color line
        ctx.strokeStyle = func.color;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(legendX, y);
        ctx.lineTo(legendX + 20, y);
        ctx.stroke();
        
        // Function text
        ctx.fillStyle = func.visible ? '#374151' : '#9ca3af';
        ctx.font = '12px monospace';
        ctx.textAlign = 'left';
        const displayText = func.expression.length > 25 ? func.expression.substring(0, 25) + '...' : func.expression;
        ctx.fillText(displayText, legendX + 25, y + 4);
    });
}

// Draw empty graph
function drawEmptyGraph(ctx) {
    if (!ctx || !ctx.canvas) {
        console.error('Invalid canvas context');
        return;
    }
    
    try {
        const width = parseFloat(ctx.canvas.getAttribute('data-logical-width')) || 900;
        const height = parseFloat(ctx.canvas.getAttribute('data-logical-height')) || 700;
        const padding = 50;

        // Fill background
        ctx.fillStyle = '#f8fafc';
        ctx.fillRect(0, 0, width, height);
        
        // Draw basic grid
        ctx.strokeStyle = '#e2e8f0';
        ctx.lineWidth = 1;
        
        // Vertical lines
        for (let i = 0; i <= 10; i++) {
            const x = padding + (i / 10) * (width - 2 * padding);
            ctx.beginPath();
            ctx.moveTo(x, padding);
            ctx.lineTo(x, height - padding);
            ctx.stroke();
        }
        
        // Horizontal lines
        for (let i = 0; i <= 8; i++) {
            const y = padding + (i / 8) * (height - 2 * padding);
            ctx.beginPath();
            ctx.moveTo(padding, y);
            ctx.lineTo(width - padding, y);
            ctx.stroke();
        }
        
        // Draw axes
        ctx.strokeStyle = '#64748b';
        ctx.lineWidth = 2;
        
        const centerX = width / 2;
        const centerY = height / 2;
        
        // X-axis
        ctx.beginPath();
        ctx.moveTo(padding, centerY);
        ctx.lineTo(width - padding, centerY);
        ctx.stroke();
        
        // Y-axis
        ctx.beginPath();
        ctx.moveTo(centerX, padding);
        ctx.lineTo(centerX, height - padding);
        ctx.stroke();
        
        // Add text
        ctx.fillStyle = '#64748b';
        ctx.font = '18px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Add functions to see the graph', centerX, centerY - 20);
        
        ctx.font = '14px Arial';
        ctx.fillText('Use the controls above to add mathematical functions', centerX, centerY + 10);
        
    } catch (error) {
        console.error('Error drawing empty graph:', error);
    }
}

// Update function list display
function updateFunctionList() {
    const listContainer = document.getElementById('functionList');
    
    if (activeFunctions.length === 0) {
        listContainer.innerHTML = '<p class="no-functions">No functions added yet. Use the controls above to add functions to the graph.</p>';
        return;
    }
    
    let listHTML = '';
    activeFunctions.forEach((func, index) => {
        listHTML += `
            <div class="function-item" style="border-left: 4px solid ${escapeHTML(func.color)}">
                <div class="function-info">
                    <span class="function-expression">${escapeHTML(func.expression)}</span>
                    <span class="function-type">(${escapeHTML(func.type)})</span>
                </div>
                <div class="function-controls">
                    <button class="btn btn-toggle ${func.visible ? 'active' : ''}" onclick="toggleFunction(${func.id})">
                        <i class="fas fa-eye${func.visible ? '' : '-slash'}"></i>
                    </button>
                    <button class="btn btn-remove" onclick="removeFunction(${func.id})">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `;
    });
    
    listContainer.innerHTML = listHTML;
}

// Toggle function visibility
function toggleFunction(id) {
    const func = activeFunctions.find(f => f.id === id);
    if (func) {
        func.visible = !func.visible;
        updateFunctionList();
        plotAdvancedGraph();
    }
}

// Remove function
function removeFunction(id) {
    activeFunctions = activeFunctions.filter(f => f.id !== id);
    updateFunctionList();
    plotAdvancedGraph();
    showNotification('Function removed');
}

// Clear all functions
function clearAllFunctions() {
    if (activeFunctions.length === 0) {
        showNotification('No functions to clear');
        return;
    }
    
    activeFunctions = [];
    colorIndex = 0;
    updateFunctionList();
    plotAdvancedGraph();
    showNotification('All functions cleared');
}

// Auto fit graph
function autoFitGraph() {
    if (activeFunctions.length === 0) {
        showNotification('Add functions first');
        return;
    }
    
    // Sample functions to find good bounds
    let minY = Infinity;
    let maxY = -Infinity;
    const xRange = 20;
    
    for (let x = -xRange/2; x <= xRange/2; x += 0.1) {
        activeFunctions.forEach(func => {
            if (func.visible) {
                try {
                    const y = evaluateFunction(func.expression, x);
                    if (isFinite(y) && Math.abs(y) < 1000) {
                        minY = Math.min(minY, y);
                        maxY = Math.max(maxY, y);
                    }
                } catch (error) {
                    // Skip invalid points
                }
            }
        });
    }
    
    if (isFinite(minY) && isFinite(maxY)) {
        const yPadding = (maxY - minY) * 0.1;
        document.getElementById('graphXMin').value = -xRange/2;
        document.getElementById('graphXMax').value = xRange/2;
        document.getElementById('graphYMin').value = (minY - yPadding).toFixed(1);
        document.getElementById('graphYMax').value = (maxY + yPadding).toFixed(1);
        
        plotAdvancedGraph();
        showNotification('Graph auto-fitted');
    } else {
        showNotification('Cannot auto-fit: invalid function values');
    }
}

// Zoom graph
function zoomGraph(factor) {
    const xMin = parseFloat(document.getElementById('graphXMin').value);
    const xMax = parseFloat(document.getElementById('graphXMax').value);
    const yMin = parseFloat(document.getElementById('graphYMin').value);
    const yMax = parseFloat(document.getElementById('graphYMax').value);
    
    const xCenter = (xMin + xMax) / 2;
    const yCenter = (yMin + yMax) / 2;
    const xRange = (xMax - xMin) * factor / 2;
    const yRange = (yMax - yMin) * factor / 2;
    
    document.getElementById('graphXMin').value = (xCenter - xRange).toFixed(1);
    document.getElementById('graphXMax').value = (xCenter + xRange).toFixed(1);
    document.getElementById('graphYMin').value = (yCenter - yRange).toFixed(1);
    document.getElementById('graphYMax').value = (yCenter + yRange).toFixed(1);
    
    plotAdvancedGraph();
}

// Reset advanced graph
function resetAdvancedGraph() {
    document.getElementById('graphXMin').value = -10;
    document.getElementById('graphXMax').value = 10;
    document.getElementById('graphYMin').value = -10;
    document.getElementById('graphYMax').value = 10;
    document.getElementById('showAdvancedGrid').checked = true;
    document.getElementById('showAxes').checked = true;
    document.getElementById('showLabels').checked = true;
    document.getElementById('showZeros').checked = true;
    document.getElementById('showExtrema').checked = true;
    
    plotAdvancedGraph();
    showNotification('Graph reset');
}

// Load example function into grapher
function loadGraphExample(expression) {
    console.log('Loading example:', expression);
    const customInput = document.getElementById('customFunctionInput');
    if (customInput) customInput.value = expression;
    setFunctionType('custom');
    
    // Update tab states
    document.querySelectorAll('.function-tabs .btn-tab').forEach(btn => btn.classList.remove('active'));
    const customTab = document.querySelector('[onclick*="custom"]');
    if (customTab) {
        customTab.classList.add('active');
    }
    
    updateFunctionInputs();
    showNotification(`Loaded example: ${expression}`);
}

// Load multiple example functions
function loadExampleFunctions() {
    const examples = [
        'sin(x)',
        'cos(x)',
        'x^2',
        'exp(-x^2/4)'
    ];
    
    clearAllFunctions();
    
    examples.forEach(expr => {
        const functionObj = {
            id: Date.now() + Math.random(),
            expression: expr,
            color: graphColors[colorIndex % graphColors.length],
            visible: true,
            type: 'custom'
        };
        
        activeFunctions.push(functionObj);
        colorIndex++;
    });
    
    updateFunctionList();
    autoFitGraph();
    showNotification('Example functions loaded');
}

// Initialize advanced graph interaction with normalized scaling and touch support
function initializeAdvancedGraphInteraction() {
    const canvas = document.getElementById('advancedCanvas');
    const coordDisplay = document.getElementById('graphCoordinates');
    if (!canvas || !coordDisplay) return;
    
    function updateCoordinates(clientX, clientY) {
        const rect = canvas.getBoundingClientRect();
        if (!rect.width || !rect.height) return;
        
        const logicalWidth = parseFloat(canvas.getAttribute('data-logical-width')) || 900;
        const logicalHeight = parseFloat(canvas.getAttribute('data-logical-height')) || 700;
        
        // Exact scaling factor between CSS display pixels and canvas internal coordinates
        const scaleX = logicalWidth / rect.width;
        const scaleY = logicalHeight / rect.height;
        const mouseX = (clientX - rect.left) * scaleX;
        const mouseY = (clientY - rect.top) * scaleY;
        
        const xMin = parseFloat(document.getElementById('graphXMin')?.value || document.getElementById('advancedXMin')?.value) || -10;
        const xMax = parseFloat(document.getElementById('graphXMax')?.value || document.getElementById('advancedXMax')?.value) || 10;
        const yMin = parseFloat(document.getElementById('graphYMin')?.value || document.getElementById('advancedYMin')?.value) || -10;
        const yMax = parseFloat(document.getElementById('graphYMax')?.value || document.getElementById('advancedYMax')?.value) || 10;
        
        const padding = 50;
        const graphWidth = logicalWidth - 2 * padding;
        const graphHeight = logicalHeight - 2 * padding;
        
        if (mouseX >= padding && mouseX <= logicalWidth - padding &&
            mouseY >= padding && mouseY <= logicalHeight - padding) {
            
            const x = xMin + ((mouseX - padding) / graphWidth) * (xMax - xMin);
            const y = yMax - ((mouseY - padding) / graphHeight) * (yMax - yMin);
            
            coordDisplay.textContent = `x = ${x.toFixed(3)}, y = ${y.toFixed(3)}`;
        } else {
            coordDisplay.textContent = 'Move mouse or touch graph to see coordinates';
        }
    }
    
    // Desktop mouse events
    canvas.addEventListener('mousemove', function(event) {
        updateCoordinates(event.clientX, event.clientY);
    });
    
    canvas.addEventListener('mouseleave', function() {
        coordDisplay.textContent = 'Move mouse or touch graph to see coordinates';
    });
    
    // Mobile touch events
    canvas.addEventListener('touchstart', function(event) {
        if (event.touches.length > 0) {
            updateCoordinates(event.touches[0].clientX, event.touches[0].clientY);
        }
    }, { passive: true });
    
    canvas.addEventListener('touchmove', function(event) {
        if (event.touches.length > 0) {
            const touch = event.touches[0];
            const rect = canvas.getBoundingClientRect();
            // Prevent native page scroll while inspecting graph
            if (touch.clientX >= rect.left && touch.clientX <= rect.right &&
                touch.clientY >= rect.top && touch.clientY <= rect.bottom) {
                event.preventDefault();
                updateCoordinates(touch.clientX, touch.clientY);
            }
        }
    }, { passive: false });
    
    canvas.addEventListener('touchend', function() {
        coordDisplay.textContent = 'Move mouse or touch graph to see coordinates';
    });
}
// Test function for debugging
function testGrapher() {
    console.log('Testing grapher...');
    
    // Clear existing functions
    activeFunctions = [];
    colorIndex = 0;
    
    // Add a simple test function
    const testFunction = {
        id: Date.now(),
        expression: 'x^2',
        color: '#6366f1',
        visible: true,
        type: 'custom'
    };
    
    activeFunctions.push(testFunction);
    
    console.log('Test function added:', testFunction);
    
    // Test function evaluation
    try {
        const testX = 2;
        const result = evaluateFunction('x^2', testX);
        console.log(`f(${testX}) = ${result}`);
        
        if (result === 4) {
            console.log('Function evaluation working correctly');
        } else {
            console.error('Function evaluation failed');
        }
    } catch (error) {
        console.error('Function evaluation error:', error);
    }
    
    // Update display and plot
    updateFunctionList();
    plotAdvancedGraph();
    
    showNotification('Test function x² added');
}
// Manual test function - call this from browser console
function manualGraphTest() {
    console.log('=== Manual Graph Test ===');
    
    // Check if elements exist
    const canvas = document.getElementById('advancedCanvas');
    console.log('Canvas found:', !!canvas);
    
    if (canvas) {
        console.log('Canvas dimensions:', canvas.width, 'x', canvas.height);
        const ctx = canvas.getContext('2d');
        console.log('Context:', !!ctx);
        
        // Test drawing
        try {
            ctx.fillStyle = 'red';
            ctx.fillRect(10, 10, 100, 100);
            console.log('Basic drawing test: SUCCESS');
        } catch (error) {
            console.error('Basic drawing test: FAILED', error);
        }
        
        // Test empty graph
        try {
            drawEmptyGraph(ctx);
            console.log('Empty graph test: SUCCESS');
        } catch (error) {
            console.error('Empty graph test: FAILED', error);
        }
    }
    
    // Test function evaluation
    try {
        const result1 = evaluateFunction('x^2', 3);
        console.log('Function test x^2 at x=3:', result1, '(should be 9)');
        
        const result2 = evaluateFunction('sin(x)', Math.PI/2);
        console.log('Function test sin(x) at x=π/2:', result2, '(should be ~1)');
        
        const result3 = evaluateFunction('2*x + 1', 5);
        console.log('Function test 2*x+1 at x=5:', result3, '(should be 11)');
        
    } catch (error) {
        console.error('Function evaluation test: FAILED', error);
    }
    
    // Test adding a simple function
    try {
        activeFunctions = [];
        const testFunc = {
            id: Date.now(),
            expression: 'x^2',
            color: '#6366f1',
            visible: true,
            type: 'custom'
        };
        activeFunctions.push(testFunc);
        
        console.log('Test function added:', testFunc);
        
        // Try to plot
        plotAdvancedGraph();
        console.log('Plot test: SUCCESS');
        
    } catch (error) {
        console.error('Plot test: FAILED', error);
    }
    
    console.log('=== Test Complete ===');
}

// Make it globally available
window.manualGraphTest = manualGraphTest;
// Test function for debugging graph issues
function testGraphFunctionality() {
    console.log('=== Testing Graph Functionality ===');
    
    // Test canvas
    const canvas = document.getElementById('advancedCanvas');
    console.log('Canvas found:', !!canvas);
    if (canvas) {
        console.log('Canvas dimensions:', canvas.width, 'x', canvas.height);
        const ctx = canvas.getContext('2d');
        console.log('Context available:', !!ctx);
        
        // Test empty graph
        try {
            drawEmptyGraph(ctx);
            console.log('Empty graph test: SUCCESS');
        } catch (error) {
            console.log('Empty graph test: FAILED', error);
        }
    }
    
    // Test function evaluation
    try {
        const testResult = evaluateFunction('sin(x)', Math.PI/2);
        console.log('Function evaluation test (sin(π/2)):', testResult, '(should be ~1)');
    } catch (error) {
        console.log('Function evaluation test: FAILED', error);
    }
    
    // Test polynomial canvas
    const polyCanvas = document.getElementById('polynomialCanvas');
    console.log('Polynomial canvas found:', !!polyCanvas);
    
    console.log('=== Test Complete ===');
}

// Add test button functionality (call this from browser console)
window.testGraphFunctionality = testGraphFunctionality;

// ===== STEP 6: SCIENTIFIC ENHANCEMENTS =====

// --- Unit Converter Engine ---
function convertUnits(val, from, to, category) {
    const v = Number(val);
    if (isNaN(v)) return NaN;
    if (from === to) return v;
    
    const fLower = String(from).toLowerCase();
    const tLower = String(to).toLowerCase();
    
    // Temperature special case
    if (category === 'temperature' || ['c', 'f', 'k'].includes(fLower) && ['c', 'f', 'k'].includes(tLower)) {
        let kelvin;
        if (fLower === 'c') kelvin = v + 273.15;
        else if (fLower === 'f') kelvin = (v - 32) * (5 / 9) + 273.15;
        else kelvin = v;
        
        if (tLower === 'c') return kelvin - 273.15;
        if (tLower === 'f') return (kelvin - 273.15) * (9 / 5) + 32;
        return kelvin;
    }
    
    // Scale-based conversion table (rates relative to base unit)
    const RATES = {
        // Length (base: meter)
        m: 1, km: 1000, cm: 0.01, mm: 0.001, um: 1e-6, nm: 1e-9,
        mi: 1609.344, yd: 0.9144, ft: 0.3048, in: 0.0254,
        // Mass (base: kg)
        kg: 1, g: 0.001, mg: 1e-6, lb: 0.45359237, oz: 0.028349523125, ton: 1000,
        // Pressure (base: Pa)
        pa: 1, kpa: 1000, bar: 100000, psi: 6894.757, atm: 101325, mmhg: 133.322,
        // Energy (base: Joules)
        j: 1, kj: 1000, cal: 4.184, kcal: 4184, wh: 3600, kwh: 3600000, ev: 1.602176634e-19,
        // Angle (base: radians)
        rad: 1, deg: Math.PI / 180, grad: Math.PI / 200,
        // Time (base: seconds)
        s: 1, ms: 0.001, min: 60, hr: 3600, day: 86400, yr: 31536000
    };
    
    const fRate = RATES[fLower];
    const tRate = RATES[tLower];
    
    if (fRate === undefined || tRate === undefined) {
        throw new Error(`Unsupported unit conversion from ${from} to ${to}`);
    }
    
    return (v * fRate) / tRate;
}

// --- Complex Number Arithmetic Class ---
class Complex {
    constructor(real = 0, imag = 0) {
        this.real = Number(real) || 0;
        this.imag = Number(imag) || 0;
    }
    
    add(other) {
        const o = Complex.from(other);
        return new Complex(this.real + o.real, this.imag + o.imag);
    }
    
    sub(other) {
        const o = Complex.from(other);
        return new Complex(this.real - o.real, this.imag - o.imag);
    }
    
    mul(other) {
        const o = Complex.from(other);
        return new Complex(
            this.real * o.real - this.imag * o.imag,
            this.real * o.imag + this.imag * o.real
        );
    }
    
    div(other) {
        const o = Complex.from(other);
        const denom = o.real * o.real + o.imag * o.imag;
        if (denom === 0) throw new Error('Complex division by zero');
        return new Complex(
            (this.real * o.real + this.imag * o.imag) / denom,
            (this.imag * o.real - this.real * o.imag) / denom
        );
    }
    
    abs() {
        return Math.hypot(this.real, this.imag);
    }
    
    arg() {
        return Math.atan2(this.imag, this.real);
    }
    
    conj() {
        return new Complex(this.real, -this.imag);
    }
    
    pow(n) {
        const r = this.abs();
        const theta = this.arg();
        const rn = Math.pow(r, n);
        return new Complex(rn * Math.cos(n * theta), rn * Math.sin(n * theta));
    }
    
    toString() {
        const r = Math.round(this.real * 1e10) / 1e10;
        const i = Math.round(this.imag * 1e10) / 1e10;
        if (i === 0) return `${r}`;
        if (r === 0) return i === 1 ? 'i' : (i === -1 ? '-i' : `${i}i`);
        const sign = i > 0 ? '+' : '-';
        const absI = Math.abs(i);
        const iStr = absI === 1 ? 'i' : `${absI}i`;
        return `${r} ${sign} ${iStr}`;
    }
    
    static from(val) {
        if (val instanceof Complex) return val;
        if (typeof val === 'number') return new Complex(val, 0);
        if (typeof val === 'string') return Complex.parse(val);
        if (typeof val === 'object' && val !== null) {
            return new Complex(val.real || val.r || 0, val.imag || val.i || 0);
        }
        return new Complex(0, 0);
    }
    
    static parse(str) {
        str = String(str).replace(/\s+/g, '');
        if (!str) return new Complex(0, 0);
        
        // Pure imaginary: '3i', '-i', '+i', '2.5i'
        const pureImag = str.match(/^([+-]?\d*(?:\.\d+)?)[ij]$/i);
        if (pureImag) {
            const coeff = pureImag[1] === '' || pureImag[1] === '+' ? 1 : (pureImag[1] === '-' ? -1 : parseFloat(pureImag[1]));
            return new Complex(0, coeff);
        }
        
        // Pure real: '5', '-3.14'
        if (/^[+-]?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?$/.test(str)) {
            return new Complex(parseFloat(str), 0);
        }
        
        // Combined 'a+bi' or 'a-bi'
        const match = str.match(/^([+-]?\d*(?:\.\d+)?(?:[eE][+-]?\d+)?)([+-]\d*(?:\.\d+)?)?[ij]$/i);
        if (match) {
            const real = parseFloat(match[1]) || 0;
            const imagStr = match[2];
            const imag = (!imagStr || imagStr === '+') ? 1 : (imagStr === '-' ? -1 : parseFloat(imagStr));
            return new Complex(real, imag);
        }
        
        throw new Error('Invalid complex number format: ' + str);
    }
}

// --- Vector Operations Engine ---
const VectorOps = {
    dot(u, v) {
        if (!Array.isArray(u) || !Array.isArray(v) || u.length !== v.length) {
            throw new Error('Vectors must be arrays of equal dimension');
        }
        return u.reduce((sum, ui, i) => sum + ui * v[i], 0);
    },
    cross(u, v) {
        if (u.length !== 3 || v.length !== 3) {
            throw new Error('Cross product is defined for 3D vectors');
        }
        return [
            u[1] * v[2] - u[2] * v[1],
            u[2] * v[0] - u[0] * v[2],
            u[0] * v[1] - u[1] * v[0]
        ];
    },
    magnitude(u) {
        return Math.hypot(...u);
    },
    normalize(u) {
        const mag = this.magnitude(u);
        if (mag === 0) throw new Error('Cannot normalize zero vector');
        return u.map(x => x / mag);
    },
    angle(u, v) {
        const dot = this.dot(u, v);
        const mag = this.magnitude(u) * this.magnitude(v);
        if (mag === 0) throw new Error('Cannot calculate angle with zero vector');
        const cosTheta = Math.max(-1, Math.min(1, dot / mag));
        return Math.acos(cosTheta);
    }
};

// --- Multi-Variable Calculus: Partial Derivatives & Gradient ---
function evaluateFunctionMulti(expression, scopeObj) {
    const keys = Object.keys(scopeObj);
    const vals = Object.values(scopeObj);
    return evaluateFunction(expression, scopeObj.x !== undefined ? scopeObj.x : vals[0]);
}

function calculatePartialDerivative(fnExpr, point, wrtVariable = 'x', h = 1e-6) {
    const xVal = point[wrtVariable] !== undefined ? point[wrtVariable] : 0;
    const f1 = evaluateFunction(fnExpr, xVal + h, wrtVariable);
    const f2 = evaluateFunction(fnExpr, xVal - h, wrtVariable);
    return (f1 - f2) / (2 * h);
}

function calculateGradient(fnExpr, point, variables = ['x', 'y']) {
    return variables.map(v => calculatePartialDerivative(fnExpr, point, v));
}

// --- Calculus: Limits & Series ---
function calculateLimit() {
    const input = document.getElementById('limitInput')?.value;
    const pointStr = document.getElementById('limitPoint')?.value;
    const direction = document.getElementById('limitDirection')?.value || 'both';
    const resultDiv = document.getElementById('limitResult');
    if (!resultDiv) return;

    if (!input || !input.trim()) {
        resultDiv.innerHTML = '<span style="color: var(--danger)">Please enter a function f(x)</span>';
        return;
    }
    const c = parseFloat(pointStr !== '' && pointStr !== undefined ? pointStr : 0);
    if (isNaN(c)) {
        resultDiv.innerHTML = '<span style="color: var(--danger)">Please enter a valid approach point c</span>';
        return;
    }

    try {
        const varMatch = input.match(/[a-zA-Z]/);
        const variable = varMatch ? varMatch[0] : 'x';

        let compiledFn = null;
        if (typeof math !== 'undefined' && typeof math.compile === 'function') {
            try {
                compiledFn = math.compile(input);
            } catch (ce) {}
        }

        const evalF = (xVal) => {
            if (compiledFn) {
                return compiledFn.evaluate({ [variable]: xVal });
            }
            return evaluateFunction(input, xVal);
        };

        const steps = [1e-2, 1e-3, 1e-4, 1e-5, 1e-6, 1e-7];
        const leftVals = [];
        const rightVals = [];

        for (const h of steps) {
            try {
                const fl = evalF(c - h);
                if (typeof fl === 'number' && isFinite(fl)) leftVals.push({ h, x: c - h, fx: fl });
            } catch (e) {}
            try {
                const fr = evalF(c + h);
                if (typeof fr === 'number' && isFinite(fr)) rightVals.push({ h, x: c + h, fx: fr });
            } catch (e) {}
        }

        const leftLim = leftVals.length > 0 ? leftVals[leftVals.length - 1].fx : NaN;
        const rightLim = rightVals.length > 0 ? rightVals[rightVals.length - 1].fx : NaN;

        const roundLim = (val) => {
            if (isNaN(val)) return 'Undefined';
            if (Math.abs(val - Math.round(val)) < 1e-5) return Math.round(val).toString();
            return Number(val).toFixed(6).replace(/\.?0+$/, '');
        };

        let resultHTML = `<strong>Function:</strong> f(${variable}) = ${escapeHTML(input)}, approaching c = ${c}<br><br>`;

        if (direction === 'left') {
            const limStr = roundLim(leftLim);
            resultHTML += `<div class="highlight-result">lim (${variable} → ${c}⁻) = <strong>${limStr}</strong></div>`;
        } else if (direction === 'right') {
            const limStr = roundLim(rightLim);
            resultHTML += `<div class="highlight-result">lim (${variable} → ${c}⁺) = <strong>${limStr}</strong></div>`;
        } else {
            // Both sided
            const diff = Math.abs(leftLim - rightLim);
            if (!isNaN(leftLim) && !isNaN(rightLim) && diff < 1e-3) {
                const limVal = (leftLim + rightLim) / 2;
                resultHTML += `<div class="highlight-result">lim (${variable} → ${c}) = <strong>${roundLim(limVal)}</strong></div>`;
                resultHTML += `<small style="color: #94a3b8">Left-hand limit: ${roundLim(leftLim)}, Right-hand limit: ${roundLim(rightLim)} (Continuous / Convergent)</small>`;
            } else {
                resultHTML += `<div class="highlight-result" style="color: var(--danger)">Limit Does Not Exist (DNE)</div>`;
                resultHTML += `<small style="color: #94a3b8">Left-hand limit (${variable} → ${c}⁻) = ${roundLim(leftLim)}<br>Right-hand limit (${variable} → ${c}⁺) = ${roundLim(rightLim)}</small>`;
            }
        }

        const limitSteps = [
            {
                title: 'Problem Formulation',
                math: `lim (${variable} → ${c}) [${input}]  [Direction: ${direction}]`,
                explanation: `Investigate behavior of function f(${variable}) as ${variable} approaches point ${c}.`
            },
            {
                title: 'Left-Hand Numerical Sequence (x → c⁻)',
                math: `x = [${c} - 10⁻², ..., ${c} - 10⁻⁷] → f(x) ≈ ${roundLim(leftLim)}`,
                explanation: `Evaluate decreasing sequence of small offsets from the left to trace one-sided convergence.`
            },
            {
                title: 'Right-Hand Numerical Sequence (x → c⁺)',
                math: `x = [${c} + 10⁻², ..., ${c} + 10⁻⁷] → f(x) ≈ ${roundLim(rightLim)}`,
                explanation: `Evaluate decreasing sequence of small offsets from the right to trace one-sided convergence.`
            },
            {
                title: 'Limit Existence Conclusion',
                math: direction === 'both' ? (Math.abs(leftLim - rightLim) < 1e-3 ? `lim (${variable} → ${c}) = ${roundLim((leftLim + rightLim) / 2)}` : 'Limit Does Not Exist (DNE)') : `lim (${variable} → ${c}${direction === 'left' ? '⁻' : '⁺'}) = ${direction === 'left' ? roundLim(leftLim) : roundLim(rightLim)}`,
                explanation: direction === 'both' ? (Math.abs(leftLim - rightLim) < 1e-3 ? 'Both left-hand and right-hand limits match, confirming existence of two-sided limit.' : 'Left-hand and right-hand limits differ or diverge, so two-sided limit does not exist.') : 'Directional limit determined from approach path.'
            }
        ];

        resultDiv.innerHTML = resultHTML + formatStepsTimelineHTML(limitSteps);
        addToHistory(`lim_{${variable}→${c}} (${input})`, direction === 'both' ? roundLim(leftLim) : (direction === 'left' ? roundLim(leftLim) : roundLim(rightLim)));
    } catch (err) {
        resultDiv.innerHTML = `<span style="color: var(--danger)">Error calculating limit: ${escapeHTML(err.message)}</span>`;
    }
}

function calculateTaylorSeries() {
    const input = document.getElementById('taylorInput')?.value;
    const centerStr = document.getElementById('taylorCenter')?.value;
    const orderStr = document.getElementById('taylorOrder')?.value;
    const resultDiv = document.getElementById('taylorResult');
    if (!resultDiv) return;

    if (!input || !input.trim()) {
        resultDiv.innerHTML = '<span style="color: var(--danger)">Please enter a function f(x)</span>';
        return;
    }

    const c = parseFloat(centerStr !== '' && centerStr !== undefined ? centerStr : 0);
    const order = Math.min(6, Math.max(1, parseInt(orderStr) || 4));

    try {
        const varMatch = input.match(/[a-zA-Z]/);
        const variable = varMatch ? varMatch[0] : 'x';

        let parsedExpr = null;
        if (typeof math !== 'undefined' && typeof math.parse === 'function') {
            try {
                parsedExpr = math.parse(input);
            } catch (pe) {}
        }

        const factorialNum = (k) => {
            let res = 1;
            for (let i = 2; i <= k; i++) res *= i;
            return res;
        };

        const derivatives = [];
        let currentExpr = parsedExpr;

        for (let k = 0; k <= order; k++) {
            if (k === 0) {
                let f0 = NaN;
                if (currentExpr) {
                    try { f0 = currentExpr.evaluate({ [variable]: c }); } catch (e) {}
                }
                if (isNaN(f0)) f0 = evaluateFunction(input, c);
                derivatives.push({ order: 0, dExpr: input, valAtC: f0, coeff: f0 });
            } else {
                let dExpr = null;
                let valAtC = NaN;
                if (currentExpr && typeof math !== 'undefined' && typeof math.derivative === 'function') {
                    try {
                        currentExpr = math.derivative(currentExpr, variable);
                        dExpr = currentExpr.toString();
                        valAtC = currentExpr.evaluate({ [variable]: c });
                    } catch (e) {}
                }
                if (isNaN(valAtC)) {
                    // Numerical derivative finite difference fallback
                    const h = 1e-4;
                    const f1 = evaluateFunction(input, c + h);
                    const f0 = evaluateFunction(input, c);
                    const fm1 = evaluateFunction(input, c - h);
                    if (k === 1) valAtC = (f1 - fm1) / (2 * h);
                    else if (k === 2) valAtC = (f1 - 2 * f0 + fm1) / (h * h);
                    else valAtC = 0;
                }
                const fact = factorialNum(k);
                derivatives.push({ order: k, dExpr: dExpr || `f^(${k})`, valAtC, coeff: valAtC / fact });
            }
        }

        // Build polynomial string
        let polyTerms = [];
        for (let k = 0; k <= order; k++) {
            const coeff = derivatives[k].coeff;
            if (Math.abs(coeff) < 1e-9) continue;

            const roundCoeff = (Math.abs(coeff - Math.round(coeff)) < 1e-6) ? Math.round(coeff) : Number(coeff.toFixed(4));
            let termStr = '';

            let powerStr = '';
            if (k === 1) {
                powerStr = (c === 0) ? variable : `(${variable} - ${c})`;
            } else if (k > 1) {
                powerStr = (c === 0) ? `${variable}^${k}` : `(${variable} - ${c})^${k}`;
            }

            if (k === 0) {
                termStr = `${roundCoeff}`;
            } else if (roundCoeff === 1) {
                termStr = powerStr;
            } else if (roundCoeff === -1) {
                termStr = `-${powerStr}`;
            } else {
                termStr = `${roundCoeff}·${powerStr}`;
            }

            if (polyTerms.length > 0 && roundCoeff > 0) {
                polyTerms.push(`+ ${termStr}`);
            } else if (polyTerms.length > 0 && roundCoeff < 0) {
                polyTerms.push(`- ${termStr.replace(/^-/, '')}`);
            } else {
                polyTerms.push(termStr);
            }
        }

        const polynomialString = polyTerms.length > 0 ? polyTerms.join(' ') : '0';
        const typeName = (c === 0) ? `Maclaurin Series (c = 0, Order ${order})` : `Taylor Series around c = ${c} (Order ${order})`;

        let resultHTML = `<strong>${typeName} for f(${variable}) = ${escapeHTML(input)}:</strong><br><br>`;
        resultHTML += `<div class="highlight-result" style="font-family: monospace; font-size: 1.1rem; line-height: 1.6;">`;
        resultHTML += `P_${order}(${variable}) = ${escapeHTML(polynomialString)}`;
        resultHTML += `</div><br>`;
        resultHTML += `<strong>Derivatives at center c = ${c}:</strong><br><ul style="margin: 8px 0 0 20px; font-size: 0.9rem; color: #cbd5e1;">`;
        for (const d of derivatives) {
            const valStr = isNaN(d.valAtC) ? 'Undefined' : (Math.abs(d.valAtC - Math.round(d.valAtC)) < 1e-6 ? Math.round(d.valAtC) : Number(d.valAtC).toFixed(5));
            resultHTML += `<li>f<sup>(${d.order})</sup>(${c}) = ${valStr} &nbsp;→&nbsp; a_${d.order} = ${valStr}/${factorialNum(d.order)} = ${Number(d.coeff).toFixed(5)}</li>`;
        }
        resultHTML += `</ul>`;

        const taylorSteps = [
            {
                title: 'Taylor Series Definition',
                math: `P_n(${variable}) = \\sum_{k=0}^{n} \\frac{f^{(k)}(c)}{k!} (${variable} - c)^k`,
                explanation: `Approximate f(${variable}) near center point c = ${c} up to polynomial degree n = ${order}.`
            },
            {
                title: 'Compute Successive Derivatives at Center',
                math: derivatives.slice(0, 3).map(d => `f^(${d.order})(${c}) ≈ ${isNaN(d.valAtC) ? '?' : Number(d.valAtC).toFixed(3)}`).join(', ') + (derivatives.length > 3 ? '...' : ''),
                explanation: 'Evaluate zero-th through n-th order derivatives at expansion center c to obtain polynomial coefficients.'
            },
            {
                title: 'Construct Polynomial Terms',
                math: `P_${order}(${variable}) = ${polynomialString}`,
                explanation: `Assemble evaluated derivative coefficients divided by k! to construct final approximating polynomial.`
            }
        ];

        resultDiv.innerHTML = resultHTML + formatStepsTimelineHTML(taylorSteps);
        addToHistory(`Taylor(${input}, c=${c}, n=${order})`, polynomialString);
    } catch (err) {
        resultDiv.innerHTML = `<span style="color: var(--danger)">Error calculating Taylor series: ${escapeHTML(err.message)}</span>`;
    }
}

// --- Combinatorics: Advanced Sequences & Partitions ---
function updateAdvCombInputs() {
    const type = document.getElementById('advCombType')?.value;
    const rGroup = document.getElementById('advCombRGroup');
    if (!rGroup) return;
    if (type === 'repetition') {
        rGroup.style.display = 'block';
    } else {
        rGroup.style.display = 'none';
    }
}

function calculateAdvancedCombinatorics() {
    const type = document.getElementById('advCombType')?.value || 'catalan';
    const n = parseInt(document.getElementById('advCombN')?.value);
    const r = parseInt(document.getElementById('advCombR')?.value);
    const resultDiv = document.getElementById('advCombResult');
    if (!resultDiv) return;

    if (isNaN(n) || n < 0) {
        resultDiv.innerHTML = '<span style="color: var(--danger)">Invalid input: n must be a non-negative integer (n ≥ 0)</span>';
        return;
    }

    try {
        let resultTitle = '';
        let formula = '';
        let value = '';
        let explanation = '';

        if (type === 'catalan') {
            if (n > 35) {
                resultDiv.innerHTML = '<span style="color: var(--danger)">n is too large (max 35 for exact calculation)</span>';
                return;
            }
            const bigFact = (num) => {
                let res = 1n;
                for (let i = 2n; i <= BigInt(num); i++) res *= i;
                return res;
            };
            const bigCatalan = (num) => {
                if (num === 0) return 1n;
                const numerator = bigFact(2 * num);
                const denominator = bigFact(num + 1) * bigFact(num);
                return numerator / denominator;
            };
            const catVal = bigCatalan(n);
            resultTitle = `Catalan Number C_${n}`;
            formula = `Cₙ = (1 / (n+1)) · C(2n, n) = (2n)! / ((n+1)! · n!)`;
            value = catVal.toString();
            explanation = `C_${n} represents the number of Dyck paths of length 2n, valid expressions of ${n} pairs of parentheses, and full binary trees with ${n + 1} leaves.`;
        } else if (type === 'derangements') {
            if (n > 30) {
                resultDiv.innerHTML = '<span style="color: var(--danger)">n is too large (max 30 for exact calculation)</span>';
                return;
            }
            const subfactorial = (num) => {
                if (num === 0) return 1n;
                if (num === 1) return 0n;
                let a = 1n, b = 0n;
                for (let i = 2n; i <= BigInt(num); i++) {
                    const c = (i - 1n) * (b + a);
                    a = b;
                    b = c;
                }
                return b;
            };
            const subVal = subfactorial(n);
            resultTitle = `Subfactorial / Derangements !${n}`;
            formula = `!n = n! · ∑_{k=0}^{n} (-1)^k / k! ≈ [n! / e]`;
            value = subVal.toString();
            explanation = `!${n} is the number of permutations of ${n} distinct items where no item appears in its original position (0 fixed points).`;
        } else if (type === 'repetition') {
            if (isNaN(r) || r < 0) {
                resultDiv.innerHTML = '<span style="color: var(--danger)">Invalid input: r must be a non-negative integer (r ≥ 0)</span>';
                return;
            }
            if (n === 0 && r > 0) {
                resultDiv.innerHTML = '<span style="color: var(--danger)">Cannot choose items from an empty set (n = 0)</span>';
                return;
            }
            const bigCombination = (N, K) => {
                if (K < 0 || K > N) return 0n;
                if (K === 0 || K === N) return 1n;
                const k = Math.min(K, N - K);
                let num = 1n;
                let den = 1n;
                for (let i = 1; i <= k; i++) {
                    num *= BigInt(N - i + 1);
                    den *= BigInt(i);
                }
                return num / den;
            };
            const crVal = (n === 0 && r === 0) ? 1n : bigCombination(n + r - 1, r);
            resultTitle = `Combinations with Repetition CR(${n}, ${r})`;
            formula = `CR(n, r) = C(n + r - 1, r) = (n + r - 1)! / (r! · (n - 1)!)`;
            value = crVal.toString();
            explanation = `CR(${n}, ${r}) represents the number of ways to choose ${r} items from ${n} categories where items can be repeated (stars and bars problem).`;
        } else if (type === 'bell') {
            if (n > 25) {
                resultDiv.innerHTML = '<span style="color: var(--danger)">n is too large (max 25 for exact calculation)</span>';
                return;
            }
            const bellNumber = (num) => {
                if (num === 0) return 1n;
                const bell = [ [1n] ];
                for (let i = 1; i <= num; i++) {
                    const row = [ bell[i - 1][i - 1] ];
                    for (let j = 1; j <= i; j++) {
                        row.push(row[j - 1] + bell[i - 1][j - 1]);
                    }
                    bell.push(row);
                }
                return bell[num][0];
            };
            const bVal = bellNumber(n);
            resultTitle = `Bell Number B_${n}`;
            formula = `B_{n+1} = ∑_{k=0}^{n} C(n, k) · B_k`;
            value = bVal.toString();
            explanation = `B_${n} is the number of ways to partition a set of ${n} labeled elements into non-empty subsets.`;
        }

        resultDiv.innerHTML = `
            <strong>${escapeHTML(resultTitle)}:</strong><br><br>
            <div class="highlight-result">
                Result = <strong>${value}</strong>
            </div>
            <br>
            <div style="font-size: 0.9rem; color: #94a3b8; line-height: 1.5;">
                <strong>Formula:</strong> <code>${escapeHTML(formula)}</code><br><br>
                ${escapeHTML(explanation)}
            </div>
        `;
        addToHistory(`${resultTitle}`, value);
    } catch (err) {
        resultDiv.innerHTML = `<span style="color: var(--danger)">Error: ${escapeHTML(err.message)}</span>`;
    }
}

// --- Settings Management ---
var settingsState = {
    angleUnit: 'deg',
    precision: 12,
    notation: 'auto',
    detailedErrors: true
};

function loadSettings() {
    try {
        if (typeof localStorage !== 'undefined') {
            const saved = localStorage.getItem('calculatorSettings');
            if (saved) {
                settingsState = Object.assign(settingsState, JSON.parse(saved));
            }
        }
    } catch (e) {}
}

function saveSettings() {
    try {
        if (typeof localStorage !== 'undefined') {
            localStorage.setItem('calculatorSettings', JSON.stringify(settingsState));
        }
    } catch (e) {}
}

function openSettings() {
    closeHamburgerMenu();
    const backdrop = document.getElementById('settingsModalBackdrop');
    if (!backdrop) return;
    
    const angleEl = document.getElementById('settingAngleUnit');
    if (angleEl) angleEl.value = settingsState.angleUnit;
    const precEl = document.getElementById('settingPrecision');
    if (precEl) precEl.value = settingsState.precision.toString();
    const notEl = document.getElementById('settingNotation');
    if (notEl) notEl.value = settingsState.notation;
    const errEl = document.getElementById('settingDetailedErrors');
    if (errEl) errEl.value = settingsState.detailedErrors.toString();

    backdrop.classList.add('active');
}

function closeSettings() {
    const backdrop = document.getElementById('settingsModalBackdrop');
    if (backdrop) backdrop.classList.remove('active');
}

function updateSetting(key, val) {
    settingsState[key] = val;
    if (key === 'angleUnit') {
        angleMode = val;
        const btn = document.getElementById('angleMode');
        if (btn) btn.textContent = val.toUpperCase();
    }
    saveSettings();
}

function resetCalculatorSettings() {
    settingsState = {
        angleUnit: 'deg',
        precision: 12,
        notation: 'auto',
        detailedErrors: true
    };
    saveSettings();
    openSettings();
    if (typeof showNotification === 'function') {
        showNotification('Settings reset to default');
    }
}

loadSettings();

// Export helper functions and modules to window / global
window.testGraphFunctionality = testGraphFunctionality;
window.manualGraphTest = manualGraphTest;
window.testGrapher = testGrapher;
window.loadExample = loadExample;
window.loadBinomialExample = loadBinomialExample;
window.loadGraphExample = loadGraphExample;
window.drawFunctionCurve = drawFunctionCurve;

// Export Step 6 scientific modules
window.SCIENTIFIC_CONSTANTS = SCIENTIFIC_CONSTANTS;
window.getConstant = getConstant;
window.convertUnits = convertUnits;
window.Complex = Complex;
window.VectorOps = VectorOps;
window.calculatePartialDerivative = calculatePartialDerivative;
window.calculateGradient = calculateGradient;

// Export Step 8 features
window.calculateLimit = calculateLimit;
window.calculateTaylorSeries = calculateTaylorSeries;
window.updateAdvCombInputs = updateAdvCombInputs;
window.calculateAdvancedCombinatorics = calculateAdvancedCombinatorics;
window.decimalToFraction = decimalToFraction;
window.getDetailedErrorMessage = getDetailedErrorMessage;
window.settingsState = settingsState;
window.openSettings = openSettings;
window.closeSettings = closeSettings;
window.updateSetting = updateSetting;
window.resetCalculatorSettings = resetCalculatorSettings;
window.openHamburgerMenu = openHamburgerMenu;
window.closeHamburgerMenu = closeHamburgerMenu;
window.toggleAdvancedBasicKeypad = toggleAdvancedBasicKeypad;

// Export Step 12 features: solution steps engine
window.formatStepsTimelineHTML = formatStepsTimelineHTML;
window.generateArithmeticSteps = generateArithmeticSteps;
window.renderSolutionSteps = renderSolutionSteps;
window.toggleSolutionStepsCard = toggleSolutionStepsCard;
window.viewHistorySteps = viewHistorySteps;

console.log('Calculator JavaScript loaded successfully');
