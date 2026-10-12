# Modern Glassmorphism Calculator

A production-quality, responsive **Calculator Web Application** built strictly using vanilla web technologies (**HTML5**, **CSS3**, and **Vanilla JavaScript**). Designed with modern minimal glassmorphism aesthetics, comprehensive keyboard support, robust error handling, and accessibility best practices.

---

## 📸 Preview & Design Direction

- **Style:** Clean, minimal glassmorphism with subtle radial glows and backdrop blur.
- **Palette:** Soft neutral off-white background (`#F4F7F6`), translucent card surface, vibrant teal call-to-action (`#0F766E`), and soft red destructive button (`#FEE2E2`).
- **Modes:** Includes a persistent **Light & Dark Mode** toggle saved via `localStorage`.

---

## ✨ Features

- **Standard Arithmetic Operations:** Addition (`+`), Subtraction (`−`), Multiplication (`×`), and Division (`÷`).
- **Mathematical Order of Operations (BODMAS/PEMDAS):** Evaluates multi-step expressions accurately without using `eval()`.
- **Decimal Numbers:** Supports high-precision floating point numbers with strict multi-decimal point prevention.
- **Percentage Calculations (`%`):** Standalone percentage calculations (e.g., `50% = 0.5`) and contextual arithmetic calculations.
- **Delete (`DEL`) & Clear (`AC`):** Granular backspace for single character deletion and complete calculator state reset.
- **Real-Time Display:** Dual-level display showcasing the full expression history in a secondary muted font and the current active number/result prominently.
- **Dynamic Text Scaling:** Automatically scales down display font size for long digits to avoid horizontal overflow or broken layouts.
- **Division by Zero Protection:** Gracefully displays `"Cannot divide by zero"` without application crashes or NaN exposure.
- **Floating-Point Precision Fix:** Eliminates IEEE-754 binary floating-point artifacts (e.g., `0.1 + 0.2 = 0.3` instead of `0.30000000000000004`).
- **Keyboard Support & Visual Highlights:** Fully operable via keyboard with visual button press animations corresponding to each physical key press.
- **Theme Toggle:** Clean Light/Dark mode switcher with seamless transitions and automatic persistence.
- **Responsive Layout:** Optimized for all screen sizes ranging from 320px mobile screens to large desktop monitors.
- **Accessibility:** Semantic HTML, ARIA labels, live status regions, visible focus rings, and full keyboard navigation.

---

## 🛠️ Tech Stack

- **HTML5:** Semantic structure, accessible button markup, SVG icons, and live status regions.
- **CSS3:** Custom properties (CSS variables), glassmorphism (`backdrop-filter`), CSS Grid, Flexbox, micro-transitions, and responsive media queries.
- **Vanilla JavaScript (ES6+):** Pure object-oriented/modular state management, token-based expression parser, event delegation, and `localStorage` API. No external libraries or frameworks.

---

## 📁 Project Structure

```text
calculator/
│
├── index.html        # Semantic HTML5 markup with ARIA accessibility
├── style.css         # Modern glassmorphism styles, dark/light themes, and responsive queries
├── script.js         # Safe mathematical parser, state manager, and event listeners
└── README.md         # Documentation and project overview
```

---

## 🚀 How to Run Locally

Because this project is built entirely with vanilla web standards, it requires no package managers or build steps.

### Method 1: Direct File Opening
Double-click `index.html` or open it with any modern web browser (Chrome, Firefox, Safari, Edge).

### Method 2: Local HTTP Server (Recommended)
You can serve the project using Python or any lightweight static file server:

```bash
# Using Python 3
python -m http.server 5500

# Using Node.js npx serve
npx serve .
```

Open `http://localhost:5500` in your web browser.

---

## ⌨️ Keyboard Shortcuts

| Key | Calculator Action | Accessible Label |
| :--- | :--- | :--- |
| `0` – `9` | Input Numbers | Digits 0 through 9 |
| `+` | Addition | Add |
| `-` | Subtraction | Subtract |
| `*` | Multiplication | Multiply |
| `/` | Division | Divide |
| `%` | Percentage | Percentage |
| `.` | Decimal Point | Decimal point |
| `Enter` or `=` | Calculate Result | Calculate equals |
| `Backspace` | Delete last entry | Delete |
| `Escape` or `Delete` | All Clear (`AC`) | All Clear |
| `T` | Toggle Dark/Light Mode | Theme Toggle |

---

## 🧪 Verified Test Cases

The calculator logic has been thoroughly tested against the following scenarios:

- `2 + 3 = 5`
- `10 - 4 = 6`
- `6 × 7 = 42`
- `20 ÷ 4 = 5`
- `10.5 + 2.5 = 13`
- `100 ÷ 0` → Gracefully displays `"Cannot divide by zero"`
- `5 + 5 × 2 = 15` (BODMAS verification: multiplication executed before addition)
- `0.1 + 0.2 = 0.3` (Floating point precision formatting)
- `10 + × 5 = 50` (Operator replacement logic)
- `1234` → `DEL` → `123` (Backspace functionality)
- Multi-decimal rejection (e.g., `10.5.6` rejected to `10.56`)

---

## 🔮 Future Improvements

- Calculation history drawer with timestamped expressions.
- Scientific calculator extension (trigonometry, logarithms, exponents, parentheses).
- Memory recall functions (`MC`, `MR`, `M+`, `M-`).
- Sound / Haptic feedback toggle for mobile touch events.
- Copy result to clipboard shortcut (`Ctrl+C`).

---

## 📄 License

This project is created for educational and internship demonstration purposes. Open source under the MIT License.
