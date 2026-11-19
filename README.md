# 🧮 Advanced Scientific Calculator (PWA)

A fast, responsive, and installable Progressive Web App (PWA) calculator equipped with comprehensive math tools, arbitrary matrix algebra, interactive function graphing, and clear error diagnostics.

---

## ⚡ Main Features

- 📱 **Progressive Web App (PWA):** Installable on iOS, Android, and Desktop with offline caching via Service Worker.
- 📱 **100% Device Responsive:** Optimized for all screen sizes — compact phones, tablets, laptops, landscape mode, and notched displays.
- 🧮 **8 Core Calculation Modes:**
  - **Basic & Advanced:** PEMDAS arithmetic, hyperbolic functions (`sinh`, `cosh`, `tanh`), $\log_2$, constants, and fraction-decimal toggle (`a/b`).
  - **Calculus:** Symbolic derivatives, numerical integrals ($\int$), equation solver, limits ($\lim_{x \to c}$), and Taylor/Maclaurin series expansions.
  - **Polynomials:** Multi-degree root finder, biquadratic solver, function analysis, and Horner evaluation.
  - **Function Grapher:** High-DPI canvas plotting with smooth curve rendering, asymptote handling, zoom, and pan.
  - **Combinatorics:** Permutations, combinations, binomial expansions, Catalan numbers ($C_n$), derangements ($!n$), and Bell numbers ($B_n$).
  - **Matrix Engine:** Arbitrary rectangular dimensions ($R \times C$ up to $100 \times 100$), unified operations dropdown, powers, norms, and Kronecker products.
  - **Unlimited GPA:** Dynamic course list without limits, weighted quality points, and instant GPA breakdowns.
  - **History & Settings:** Persistent calculation log, customizable decimal precision (4–16 digits), angle units (deg/rad/grad), and detailed mathematical error diagnostics.

---

## 🚀 Quick Start

### Run Locally
Open [`calculate.htm`](calculate.htm) directly in any web browser, or serve with a local HTTP server:
```bash
# Optional local server
python -m http.server 8000
# or
npx serve .
```

### Run Automated Tests
```bash
npm test
```
All 80 automated unit tests run and verify core calculation, precision, graphing, matrix, and responsive features.

---

## 📁 Project Structure

```
scientific-calculator/
├── calculate.htm      # Main app UI & layouts
├── calculate.js       # Core math engine, modes & PWA handlers
├── calculate.css      # Responsive styles & multi-device themes
├── sw.js              # Service Worker for offline capability
├── manifest.json      # PWA install manifest
├── images/            # App icons, favicons & screenshots
├── test/
│   └── run_tests.js   # Automated unit test suite (80 tests)
└── LIMITATIONS.md     # Documented fixes & architectural history
```

---

## 📄 License
MIT License.
