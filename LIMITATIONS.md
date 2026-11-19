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

## Step 2: Mathematical & Algorithmic Calculation Constraints ✅ (Resolved)

> [!NOTE]
> All issues in this step have been fixed in [`calculate.js`](file:///c:/Users/abrha/OneDrive/Documents/GitHub/scientific-calculator/calculate.js). Full automated verification was executed via unit tests covering all edge cases.

1. **Lack of Operator Precedence (PEMDAS / BODMAS) — Fixed**
   - **Resolution:** Replaced the immediate-execution accumulator with an expression chain tracker and full arithmetic evaluator in `calculate.js`. Multi-step chained calculations like `2 + 3 * 4` evaluate using standard operator precedence (PEMDAS / BODMAS) to `14`, supporting nested parentheses, powers, and modulus.

2. **Floating-Point Rounding & Integer Overflow — Fixed**
   - **Resolution:**
     - Implemented `formatResult()` with precision epsilon rounding (`1e-12`), eliminating IEEE-754 precision artifacts (`0.1 + 0.2` renders cleanly as `0.3`).
     - Added `bigFactorial()` using JavaScript `BigInt` for large values up to $170!$, and logarithmic approximation $\ln(n!) = \sum \ln(k)$ to output proper scientific notation (e.g. `171! = 1.241018e+309`, `200! = 7.886578e+374`) without overflowing to `Infinity`.

3. **Calculus & Equation Solving Limitations — Fixed**
   - **Resolution:**
     - **Equation Solver:** Implemented multi-start Newton-Raphson root finding across a grid of starting points `[-50, 50]` with numerical derivative fallback when `math.js` is not present, finding multiple roots (e.g. $x^2 - 4 = 0 \implies x_1 = -2, x_2 = 2$) and auto-detecting any single-letter variable.
     - **Definite Integrals:** Added automatic bounds orientation check ($b < a \implies \int_a^b = -\int_b^a$), singularity detection to avoid dividing by zero, and support for expressions with variable detection.
     - **Derivatives:** Added automatic symbol detection so derivatives can be taken with respect to any variable (e.g., $t, y, u$) instead of hardcoding $x$.

4. **Polynomial Solver Capped at Degree 4 & Parsing Bugs — Fixed**
   - **Resolution:**
     - Fixed `parseTerm()` to correctly handle `0x` with coefficient `0` instead of falling back to `1`.
     - Added analytical biquadratic quartic solving ($ax^4 + cx^2 + e = 0$) returning all 4 real and complex roots.
     - Added generalized Durand-Kerner numerical root-finding for arbitrary polynomial degrees $\ge 5$, expanding the solver beyond degree 4.

5. **Matrix Dimensions & Algebra Constraints — Fixed**
   - **Resolution:**
     - Added zero-pivot detection and row-swapping safeguards in `inverse()`, correctly rejecting singular and degenerate matrices with descriptive error messages instead of generating `NaN` or dividing by zero.
     - Clamped the cosine argument $\theta = \frac{R}{\sqrt{-Q^3}}$ to the interval $[-1, 1]$ in `solveCubic()` to prevent numerical roundoff errors from producing `NaN` on degenerate roots like $(x-1)^3 = 0$.

6. **Binomial & Multinomial Expression Constraints — Fixed**
   - **Resolution:**
     - Refactored `parseExpression()` to support arbitrary single-letter variables ($z, t, u, w, \dots$) in addition to $x$ and $y$.
     - Added complete fractional term support: terms with variables in the numerator (e.g. `x/2`, `-3x/4`), fractional constants (`5/2`), and negative power terms (`-4/x`).
   - Power $n$ is restricted to non-negative integers $\le 20$ (no negative or fractional powers via Newton's generalized series).

---

## Step 3: Security, Input Validation & Keyboard Handling Vulnerabilities ✅ (Resolved)

> [!NOTE]
> All security, input validation, and keyboard event vulnerabilities have been fixed in [`calculate.js`](file:///c:/Users/abrha/OneDrive/Documents/GitHub/scientific-calculator/calculate.js) and verified via automated injection and regression tests.

1. **Unsafe Math String Evaluation via `eval()` & Script Injection — Fixed**
   - **File & Location:** [`calculate.js`](file:///c:/Users/abrha/OneDrive/Documents/GitHub/scientific-calculator/calculate.js)
   - **Resolution:** Replaced open string evaluation with two-layer sandboxed evaluation:
     - `evaluateArithmetic()` enforces a strict whitelist of safe numeric arithmetic characters `[0-9+\-*/%^().\s eE]`, rejecting all keywords, statements, or property accesses.
     - `evaluateFunction()` parses user function expressions against a strict whitelist of allowed mathematical identifiers (`sin`, `cos`, `tan`, `sqrt`, `x`, `t`, `pi`, `e`, etc.). It blocks property access (`.`, `[]`), semicolons, quotes, and masks globals (`window`, `document`, `globalThis` set to `undefined`), completely preventing arbitrary JavaScript execution.

2. **DOM-based Cross-Site Scripting (XSS) — Fixed**
   - **File & Location:** [`calculate.js`](file:///c:/Users/abrha/OneDrive/Documents/GitHub/scientific-calculator/calculate.js)
   - **Resolution:** Implemented `escapeHTML()` entity encoder and applied it to all dynamic HTML insertions:
     - History list: `escapeHTML(item.expression)` and `escapeHTML(item.result)`.
     - Graph function list: `escapeHTML(func.expression)` and `escapeHTML(func.color)`.
     - GPA course breakdown: `escapeHTML(course.name)` and `escapeHTML(course.grade)`.
     - Calculus, equation results, and dynamic error messages are safely sanitized before being inserted into `innerHTML`.

3. **Global Keystroke Listener Hijacking Form Inputs — Fixed**
   - **File & Location:** [`calculate.js`](file:///c:/Users/abrha/OneDrive/Documents/GitHub/scientific-calculator/calculate.js)
   - **Resolution:** Added an event target filter (`e.target.tagName === 'INPUT' || 'TEXTAREA' || 'SELECT' || e.target.isContentEditable`) in the document `keydown` listener. When users type inside any text or number field across Polynomial, Calculus, Matrix, or GPA modules, the global basic calculator shortcuts do not hijack the keys or corrupt the calculator display.

4. **Missing Decimal Point Prevention — Fixed**
   - **File & Location:** [`calculate.js`](file:///c:/Users/abrha/OneDrive/Documents/GitHub/scientific-calculator/calculate.js)
   - **Resolution:** Updated `appendNumber('.')` to check `currentInput.includes('.')`. Repeated clicks on `.` or typing `.` when a decimal point is already present in the current number are ignored, preventing malformed inputs like `1.2.3.4`. If pressed on empty/initial display, it automatically formats as `0.`.

---

## Step 4: Graphing, Visual Rendering & Touch/Mobile Limitations ✅ (Resolved)

> [!NOTE]
> All graphing, responsive scaling, touch interaction, and asymptote issues have been resolved across [`calculate.js`](file:///c:/Users/abrha/OneDrive/Documents/GitHub/scientific-calculator/calculate.js) and [`calculate.css`](file:///c:/Users/abrha/OneDrive/Documents/GitHub/scientific-calculator/calculate.css).

1. **Canvas Coordinate Desynchronization on Small Displays — Fixed**
   - **File & Location:** [`calculate.js`](file:///c:/Users/abrha/OneDrive/Documents/GitHub/scientific-calculator/calculate.js)
   - **Resolution:** Updated both `initializeAdvancedGraphInteraction()` and `initializeGraphInteraction()` to compute dynamic aspect scaling factors `scaleX = logicalWidth / rect.width` and `scaleY = logicalHeight / rect.height`. Cursor positions are accurately mapped to graph coordinates on any viewport size, from mobile screens up to desktop monitors.

2. **Absence of Mobile Touch Gesture Controls — Fixed**
   - **File & Location:** [`calculate.js`](file:///c:/Users/abrha/OneDrive/Documents/GitHub/scientific-calculator/calculate.js) and [`calculate.css`](file:///c:/Users/abrha/OneDrive/Documents/GitHub/scientific-calculator/calculate.css)
   - **Resolution:** Added `touchstart`, `touchmove`, and `touchend` event handlers to both canvases. `touchmove` calls `event.preventDefault()` to stop unwanted page scrolling during graph inspection, and `touch-action: none` was added in CSS for responsive touch interaction on mobile devices.

3. **Lack of High-DPI / Retina Canvas Scaling — Fixed**
   - **File & Location:** [`calculate.js`](file:///c:/Users/abrha/OneDrive/Documents/GitHub/scientific-calculator/calculate.js)
   - **Resolution:** Implemented Retina display detection using `window.devicePixelRatio`. Both `advancedCanvas` ($900 \times 700$) and `polynomialCanvas` ($800 \times 600$) upscale their internal pixel backing stores by DPR (e.g. $1800 \times 1400$ on 2x Retina displays) and apply `ctx.setTransform(dpr, 0, 0, dpr, 0, 0)` so axes, grid lines, text labels, and curves render with native sharpness.

4. **Poor Asymptote Handling — Fixed**
   - **File & Location:** [`calculate.js`](file:///c:/Users/abrha/OneDrive/Documents/GitHub/scientific-calculator/calculate.js)
   - **Resolution:** Added vertical asymptote and pole jump detection in `drawAdvancedFunction()`. When functions like $\tan(x)$, $1/x$, $\sec(x)$, or $\cot(x)$ exhibit rapid sign flips with large jumps across poles, the path is disconnected and resumed with `ctx.moveTo(canvasX, canvasY)` rather than drawing vertical lines between $-\infty$ and $+\infty$. Points outside display boundaries are clipped cleanly.

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
