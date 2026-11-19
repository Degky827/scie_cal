# Scientific Calculator PWA — Application Limitations & Known Issues

This document outlines all identified bugs, design flaws, mathematical constraints, and architectural limitations discovered across the codebase (`calculate.js`, `calculate.htm`, `calculate.css`, `sw.js`, and `manifest.json`).

---

## Step 1: Critical Runtime Bugs & Broken Core Features ✅ (Resolved)

> [!NOTE]
> All issues in this step have been fixed in [`calculate.js`](file:///c:/Users/abrha/OneDrive/Documents/GitHub/scientific-calculator/calculate.js) and [`calculate.htm`](file:///c:/Users/abrha/OneDrive/Documents/GitHub/scientific-calculator/calculate.htm). The solutions are detailed below each item.

1. **Advanced Function Grapher Fails to Draw Curves**
   - **File & Location:** [`calculate.js` (Lines 6954–7000)](file:///c:/Users/abrha/OneDrive/Documents/GitHub/scientific-calculator/calculate.js#L6954-L7000)
   - **Root Cause:** In `drawFunctionCurve`, discontinuity detection checks `Math.abs(y - lastY) > (yMax - yMin) * 0.5`. However, `yMax` and `yMin` are not defined in the function scope or passed as parameters.
   - **Impact:** Throws a `ReferenceError: yMax is not defined` on every step after the first point. The `catch` block resets `firstPoint = true; lastY = null;`, preventing `ctx.lineTo()` from ever executing. The grapher draws zero curve segments.

2. **Graph Control Inputs Disconnected From DOM IDs**
   - **File & Location:** [`calculate.js` (Lines 6833–6838)](file:///c:/Users/abrha/OneDrive/Documents/GitHub/scientific-calculator/calculate.js#L6833-L6838) vs. [`calculate.htm` (Lines 620–646)](file:///c:/Users/abrha/OneDrive/Documents/GitHub/scientific-calculator/calculate.htm#L620-L646)
   - **Root Cause:** `plotAdvancedGraph` checks `document.getElementById('advancedXMin')`, `advancedXMax`, `advancedYMin`, `advancedYMax`, and `advancedShowGrid`. The actual HTML IDs are `graphXMin`, `graphXMax`, `graphYMin`, `graphYMax`, and `showAdvancedGrid`.
   - **Impact:** The script always defaults to fixed range values `[-10, 10]`. Changing axis limits or grid toggles in the UI has no effect.

3. **Graphing Math Evaluator Syntax & Logic Breakages**
   - **File & Location:** [`calculate.js` (Lines 6729–6759)](file:///c:/Users/abrha/OneDrive/Documents/GitHub/scientific-calculator/calculate.js#L6729-L6759)
   - **Root Cause:** Sequential regex replacements overwrite previous replacements improperly:
     - `replace(/ln/g, 'Math.log')` runs before `replace(/log/g, 'Math.log10')`, converting `ln(x)` into `Math.Math.log10((x))` (crashes).
     - `replace(/log/g, ...)` runs before `replace(/log2/g, ...)`, turning `log2(x)` into `Math.log102((x))` (crashes).
     - `sec(x)` and `cot(x)` transformations leave unclosed opening parentheses, creating JavaScript syntax errors in `eval()`.
     - Implicit multiplication such as `2x` or `2sin(x)` is not normalized into `2*(x)` and results in parsing errors.

4. **Massive Function Duplication & Scope Overwriting (21 Duplicate Functions)**
   - **File & Location:** [`calculate.js`](file:///c:/Users/abrha/OneDrive/Documents/GitHub/scientific-calculator/calculate.js)
   - **Root Cause:** A duplicate block of grapher code was appended at the end of the script, redefining 21 functions in global scope.
   - **Impact:** `loadExample(expression)` at line 7199 overwrote `loadExample(a, b, n)` at line 1582. Clicking binomial theorem example cards in the UI loads data into the graphing input rather than the binomial calculator.

5. **Advanced Mode Function Buttons `(`, `)`, `√`, and `∛` Return `NaN`**
   - **File & Location:** [`calculate.htm` (Lines 131–144)](file:///c:/Users/abrha/OneDrive/Documents/GitHub/scientific-calculator/calculate.htm#L131-L144) and [`calculate.js` (Line 176)](file:///c:/Users/abrha/OneDrive/Documents/GitHub/scientific-calculator/calculate.js#L176)
   - **Root Cause:** Buttons call `appendFunction('(')` or `appendFunction('sqrt')`. The basic calculation engine parses numbers using `parseFloat(currentInput)`. Any string containing opening parentheses or function names parses to `NaN`.

6. **GPA "Remove Course" Clears All User Inputs and Removes the Wrong Course**
   - **File & Location:** [`calculate.js` (Lines 3800–3810)](file:///c:/Users/abrha/OneDrive/Documents/GitHub/scientific-calculator/calculate.js#L3800-L3810)
   - **Root Cause:** `removeCourse(courseNum)` decrements `numCourses` and re-runs `updateCourseInputs()`, which sets `container.innerHTML = ''`.
   - **Impact:** It destroys all previously typed course names, credit values, and grades across all courses, and always drops the last course on the page rather than the selected course number.

---

## Step 2: Mathematical & Algorithmic Calculation Constraints

These are limitations in calculation precision, mathematical capability, and algorithm design.

1. **Lack of Operator Precedence (PEMDAS / BODMAS)**
   - Operates strictly as an immediate-execution accumulator (`prev op current`).
   - Entering `2 + 3 * 4` computes `(2 + 3) * 4 = 20` instead of `14`.

2. **Floating-Point Rounding & Integer Overflow**
   - Standard arithmetic directly relies on native JavaScript IEEE-754 double precision without rounding correction (`0.1 + 0.2` renders as `0.30000000000000004`).
   - Standard factorials above $170!$ overflow to `Infinity` because neither `BigInt` nor logarithmic representation is implemented.

3. **Calculus & Equation Solving Limitations**
   - **Equation Solver:** Newton-Raphson starts from a fixed initial guess $x = 1$. It finds at most one real root, fails when $f'(x) \approx 0$, cannot find complex roots, and fails to verify convergence if iterations oscillate.
   - **Definite Integrals:** Simpson’s rule uses a static $n = 1000$ intervals. Discontinuous functions or singularities (e.g., $1/x$ across zero) return incorrect values or `NaN`. No symbolic integration is supported.
   - **Derivatives:** Only supports the variable `x`. Entering other variables (`t`, `y`) or symbolic constants produces errors.

4. **Polynomial Solver Capped at Degree 4**
   - Polynomials of degree $> 4$ are rejected (`Polynomials of degree > 4 not supported`).
   - Quartic (degree 4) root-finding uses Newton's method across 7 hardcoded points `[-10, -5, -1, 0, 1, 5, 10]` and cannot find complex roots.
   - The expression parser incorrectly interprets `0x` as `1x` due to fallback truthy evaluation (`parseFloat("0") || 1`).

5. **Matrix Dimensions & Algebra Constraints**
   - Strictly restricted to square matrices ($2 \times 2$, $3 \times 3$, and $4 \times 4$). Non-square matrices and independent vector operations are unsupported.
   - Eigenvalue calculations are only implemented up to $3 \times 3$.
   - Matrix inversion fails when encountering zero or near-zero pivots without pivoting safeguards.

6. **Binomial & Multinomial Expression Constraints**
   - Only variables `x` and `y` are supported by `parseExpression`.
   - Fractional expressions like `x/2` drop the denominator and parse as `1x`.
   - Power $n$ is restricted to non-negative integers $\le 20$ (no negative or fractional powers via Newton's generalized series).

---

## Step 3: Security, Input Validation & Keyboard Handling Vulnerabilities

These are flaws related to unsanitized execution, injection risks, and event capture issues.

1. **Unsafe Math String Evaluation via `eval()`**
   - **File & Location:** [`calculate.js` (Line 6756)](file:///c:/Users/abrha/OneDrive/Documents/GitHub/scientific-calculator/calculate.js#L6756)
   - Function expressions entered into the grapher are evaluated using native `eval(expr)`, exposing the app to arbitrary JavaScript execution.

2. **DOM-based Cross-Site Scripting (XSS)**
   - **File & Location:** [`calculate.js` (Lines 522–527)](file:///c:/Users/abrha/OneDrive/Documents/GitHub/scientific-calculator/calculate.js#L522-L527)
   - Calculation history and equation results are written directly to `innerHTML` without HTML entity encoding or DOM sanitization (`historyList.innerHTML = ... ${item.expression}`).

3. **Global Keystroke Listener Hijacking Form Inputs**
   - **File & Location:** [`calculate.js` (Lines 606–616)](file:///c:/Users/abrha/OneDrive/Documents/GitHub/scientific-calculator/calculate.js#L606-L616)
   - The `keydown` listener on `document` fails to check `event.target.tagName`.
   - Typing numbers, pressing `Backspace`, or hitting `Enter` inside any text input field (in Calculus, Polynomial, Matrix, or GPA mode) simultaneously mutates and calculates the basic calculator display in the background.

4. **Missing Decimal Point Prevention**
   - `appendNumber('.')` does not verify if a decimal point already exists in `currentInput`, allowing invalid inputs such as `1.2.3.4`.

---

## Step 4: Graphing, Visual Rendering & Touch/Mobile Limitations

These are issues concerning canvas rendering accuracy, responsive scaling, and interaction.

1. **Canvas Coordinate Desynchronization on Small Displays**
   - In `initializeAdvancedGraphInteraction` (lines 7077–7094), cursor coordinates are taken from `event.clientX - rect.left` without normalizing against `canvas.width / rect.width`.
   - When the canvas is scaled down by CSS on mobile or tablet screens, hover coordinates desynchronize completely from the visual graph.

2. **Absence of Mobile Touch Gesture Controls**
   - Graph interaction only listens for desktop `mousemove`. No touch event handlers (`touchstart`, `touchmove`, `touchend`) exist, preventing touch-based inspection or panning on mobile devices.

3. **Lack of High-DPI / Retina Canvas Scaling**
   - Canvas width and height are fixed to HTML dimensions ($900 \times 700$ and $800 \times 600$) without accounting for `window.devicePixelRatio`, resulting in blurry text and low-resolution curves on modern displays.

4. **Poor Asymptote Handling**
   - Functions with vertical asymptotes (such as $\tan(x)$ or $1/x$) produce erratic vertical lines connecting $+\infty$ and $-\infty$.

---

## Step 5: PWA, Offline Caching & Asset Issues

These are problems with service worker caching, missing assets, and deployment configuration.

1. **Brittle Offline Caching Strategy**
   - **File & Location:** [`sw.js` (Lines 14–26)](file:///c:/Users/abrha/OneDrive/Documents/GitHub/scientific-calculator/sw.js#L14-L26)
   - `urlsToCache` includes remote CDN URLs (`cdnjs.cloudflare.com/...`). If network connectivity drops or the CDN is blocked during the initial install, `cache.addAll()` fails entirely and the service worker is aborted.
   - Font Awesome webfont binary files (`.woff2`) are not cached, causing icons to render as blank boxes when offline.

2. **Missing Manifest Assets**
   - **File & Location:** [`manifest.json` (Lines 40–52)](file:///c:/Users/abrha/OneDrive/Documents/GitHub/scientific-calculator/manifest.json#L40-L52)
   - `screenshot-wide.png` and `screenshot-narrow.png` are referenced in the manifest, but neither file exists in the repository.

3. **Meta-Refresh Start URL Redirection**
   - The PWA `start_url` points to `./` (`index.html`), which executes a `<meta http-equiv="refresh" content="0; URL=./calculate.htm">` client-side redirect. This can cause installation warnings or screen flashing on PWA launchers.

4. **Unsynchronized Local Storage**
   - Calculation history is stored exclusively in browser `localStorage` up to a maximum of 50 items. There is no export option (JSON/CSV), import facility, or cloud synchronization.

---

## Step 6: Code Quality, Architecture & Missing Scientific Feature Gaps

These are broader architectural deficiencies and omitted features expected in scientific calculators.

1. **Monolithic Architecture & Code Maintainability**
   - Single 7,411-line [`calculate.js`](file:///c:/Users/abrha/OneDrive/Documents/GitHub/scientific-calculator/calculate.js) file with over 200 unencapsulated global variables and functions polluting `window`.
   - Over 120 KB of CSS in [`calculate.css`](file:///c:/Users/abrha/OneDrive/Documents/GitHub/scientific-calculator/calculate.css) containing duplicate selectors and redundant media queries.
   - Over 100 inline `onclick="..."` HTML attributes, preventing the implementation of strict Content Security Policies (CSP).
   - No build tools, module bundlers, TypeScript types, linter configurations, or automated test suites (unit, integration, or end-to-end).

2. **Accessibility (a11y) & Localization Limitations**
   - Calculator displays lack `aria-live="polite"` regions, preventing screen readers from announcing results.
   - Form inputs lack programmatic `<label for="...">` associations.
   - No theme customization (locked to a single dark theme; no light mode or high-contrast option).
   - Decimal formatting hardcodes a period (`.`) and lacks internationalization (i18n) support for locales using comma decimals.

3. **Missing Standard Scientific & Engineering Features**
   - **Complex Number Engine:** No general arithmetic for complex numbers ($a + bi$) or polar notation ($r\angle\theta$) in standard calculations.
   - **Base & Bitwise Operations:** No programmer mode for Hexadecimal, Binary, Octal, or bitwise operations (`AND`, `OR`, `XOR`, `NOT`, bit shifts).
   - **Unit Conversions:** No conversion utilities for physical quantities (length, area, mass, speed, temperature, pressure, energy).
   - **Statistical Distributions:** Combinatorics is present ($nPr, nCr$), but common statistics (mean, median, standard deviation, linear regression, Normal/Poisson distributions) are missing.
   - **Financial Math:** No Time Value of Money (TVM), compound interest, loan amortization, or cash flow analysis.
