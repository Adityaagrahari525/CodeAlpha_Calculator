/**
 * Professional Calculator Web Application
 * Features:
 * - Clean state management & expression parser (No eval())
 * - Order of operations (BODMAS/PEMDAS) support
 * - Real-time expression & result display
 * - Percentage calculations & precision handling
 * - Keyboard support with active visual key highlights
 * - Division by zero and edge-case guards
 * - Light / Dark mode toggle with localStorage persistence
 */

(function () {
  'use strict';

  // --- DOM Elements ---
  const expressionDisplay = document.getElementById('expression-display');
  const resultDisplay = document.getElementById('result-display');
  const themeToggleBtn = document.getElementById('theme-toggle');
  const buttons = document.querySelectorAll('.keypad-grid .btn');

  // --- State Variables ---
  let currentExpression = '';
  let lastResult = null;
  let isEvaluated = false;
  let hasError = false;

  // Recognized operators
  const OPERATORS = ['+', '−', '×', '÷'];
  const OP_MAP = {
    '+': '+',
    '-': '−',
    '−': '−',
    '*': '×',
    '×': '×',
    '/': '÷',
    '÷': '÷'
  };

  // ==========================================================================
  // Display & UI Utilities
  // ==========================================================================

  /**
   * Adjusts the font size of the result display according to the text length
   */
  function adjustFontSize(text) {
    resultDisplay.classList.remove('text-medium', 'text-small', 'text-xsmall');
    const length = text.length;

    if (length > 13) {
      resultDisplay.classList.add('text-xsmall');
    } else if (length > 10) {
      resultDisplay.classList.add('text-small');
    } else if (length > 7) {
      resultDisplay.classList.add('text-medium');
    }
  }

  /**
   * Updates the display views based on current state
   */
  function updateDisplay() {
    if (hasError) {
      resultDisplay.textContent = 'Cannot divide by zero';
      resultDisplay.classList.add('error-state');
      adjustFontSize('Cannot divide by zero');
      expressionDisplay.textContent = currentExpression || '';
      return;
    }

    resultDisplay.classList.remove('error-state');

    // Update Expression Display
    if (isEvaluated && lastResult !== null) {
      expressionDisplay.textContent = `${currentExpression} =`;
      resultDisplay.textContent = formatResult(lastResult);
    } else {
      expressionDisplay.textContent = currentExpression;
      
      // Determine what to show in main result display
      if (!currentExpression) {
        resultDisplay.textContent = '0';
      } else {
        // Show current number token or real-time intermediate evaluation
        const currentToken = getCurrentNumberToken(currentExpression);
        resultDisplay.textContent = currentToken || formatResult(getIntermediateResult(currentExpression));
      }
    }

    adjustFontSize(resultDisplay.textContent);
    
    // Auto scroll right for overflow text
    resultDisplay.scrollLeft = resultDisplay.scrollWidth;
    expressionDisplay.scrollLeft = expressionDisplay.scrollWidth;
  }

  /**
   * Extracts the current trailing number token being entered
   */
  function getCurrentNumberToken(expr) {
    const tokens = expr.trim().split(' ');
    const last = tokens[tokens.length - 1];
    if (last && !OPERATORS.includes(last)) {
      return last;
    }
    return '';
  }

  // ==========================================================================
  // Core Calculator Input Actions
  // ==========================================================================

  /**
   * Appends a digit (0-9) to the current expression
   */
  function appendNumber(digit) {
    if (hasError) {
      clearCalculator();
    }

    if (isEvaluated) {
      // Start fresh after an evaluated result
      currentExpression = digit;
      isEvaluated = false;
      lastResult = null;
      updateDisplay();
      return;
    }

    const currentToken = getCurrentNumberToken(currentExpression);

    // Prevent multiple leading zeroes like '000'
    if (currentToken === '0' && digit === '0') {
      return;
    }

    // Replace single leading '0' with the new digit
    if (currentToken === '0' && digit !== '0') {
      currentExpression = currentExpression.slice(0, -1) + digit;
      updateDisplay();
      return;
    }

    currentExpression += digit;
    updateDisplay();
  }

  /**
   * Appends decimal point, ensuring only one decimal point per number token
   */
  function appendDecimal() {
    if (hasError) {
      clearCalculator();
    }

    if (isEvaluated) {
      currentExpression = '0.';
      isEvaluated = false;
      lastResult = null;
      updateDisplay();
      return;
    }

    const currentToken = getCurrentNumberToken(currentExpression);

    // If current token already has a decimal, reject
    if (currentToken.includes('.')) {
      return;
    }

    if (!currentToken) {
      // If preceded by an operator or empty expression, append '0.'
      if (currentExpression.endsWith(' ')) {
        currentExpression += '0.';
      } else {
        currentExpression = '0.';
      }
    } else {
      currentExpression += '.';
    }

    updateDisplay();
  }

  /**
   * Appends or replaces an arithmetic operator (+, −, ×, ÷)
   */
  function chooseOperator(op) {
    if (hasError) {
      clearCalculator();
    }

    const standardOp = OP_MAP[op] || op;

    // If just evaluated, chain from the previous result
    if (isEvaluated && lastResult !== null) {
      currentExpression = `${formatResult(lastResult)} ${standardOp} `;
      isEvaluated = false;
      lastResult = null;
      updateDisplay();
      return;
    }

    if (!currentExpression) {
      // If user starts with minus, support negative numbers
      if (standardOp === '−') {
        currentExpression = '−';
        updateDisplay();
        return;
      }
      // Otherwise default to 0 + op
      currentExpression = `0 ${standardOp} `;
      updateDisplay();
      return;
    }

    const trimmed = currentExpression.trim();
    const parts = trimmed.split(' ');
    const lastPart = parts[parts.length - 1];

    // If expression ends with an operator, handle replacement
    if (OPERATORS.includes(lastPart)) {
      // Support negative sign after multiplication or division (e.g. "5 × -")
      if ((lastPart === '×' || lastPart === '÷') && standardOp === '−') {
        currentExpression = `${trimmed} −`;
        updateDisplay();
        return;
      }

      // Replace the operator
      parts[parts.length - 1] = standardOp;
      currentExpression = parts.join(' ') + ' ';
      updateDisplay();
      return;
    }

    // If last character was a solitary negative sign
    if (currentExpression.trim() === '−') {
      if (standardOp !== '−') {
        currentExpression = '';
      }
      updateDisplay();
      return;
    }

    // Trailing decimal cleanup (e.g. '12.' -> '12')
    if (currentExpression.endsWith('.')) {
      currentExpression = currentExpression.slice(0, -1);
    }

    currentExpression += ` ${standardOp} `;
    updateDisplay();
  }

  /**
   * Handles percentage calculation (%)
   */
  function handlePercentage() {
    if (hasError) return;

    if (isEvaluated && lastResult !== null) {
      currentExpression = formatResult(lastResult);
      isEvaluated = false;
    }

    if (!currentExpression) return;

    const tokens = currentExpression.trim().split(' ');
    const lastToken = tokens[tokens.length - 1];

    if (!lastToken || OPERATORS.includes(lastToken) || isNaN(lastToken.replace('−', '-'))) {
      return;
    }

    const currentNum = parseFloat(lastToken.replace('−', '-'));

    // If percentage is part of an expression like '200 + 10%'
    if (tokens.length >= 3) {
      const prevNumToken = tokens[tokens.length - 3].replace('−', '-');
      const operator = tokens[tokens.length - 2];
      const prevNum = parseFloat(prevNumToken);

      if (!isNaN(prevNum) && (operator === '+' || operator === '−')) {
        // e.g. 200 + 10% -> 200 + 20
        const percentageValue = (prevNum * currentNum) / 100;
        tokens[tokens.length - 1] = formatResult(percentageValue);
        currentExpression = tokens.join(' ');
        updateDisplay();
        return;
      }
    }

    // Standalone or multiplicative percentage (e.g. 50% -> 0.5)
    const converted = currentNum / 100;
    tokens[tokens.length - 1] = formatResult(converted);
    currentExpression = tokens.join(' ');
    updateDisplay();
  }

  /**
   * Deletes the last entered character (DEL / Backspace)
   */
  function deleteLast() {
    if (hasError) {
      clearCalculator();
      return;
    }

    if (isEvaluated) {
      clearCalculator();
      return;
    }

    if (!currentExpression) return;

    // If expression ends with space (meaning operator spacing ' + '), strip operator and spaces
    if (currentExpression.endsWith(' ')) {
      currentExpression = currentExpression.trimEnd();
      const parts = currentExpression.split(' ');
      parts.pop(); // remove operator
      currentExpression = parts.join(' ');
    } else {
      currentExpression = currentExpression.slice(0, -1);
    }

    updateDisplay();
  }

  /**
   * Clears the entire calculator (AC / Escape)
   */
  function clearCalculator() {
    currentExpression = '';
    lastResult = null;
    isEvaluated = false;
    hasError = false;
    updateDisplay();
  }

  // ==========================================================================
  // Safe Mathematical Evaluation (No eval())
  // ==========================================================================

  /**
   * Evaluates a sanitized mathematical expression safely according to BODMAS
   */
  function evaluateExpression(exprString) {
    if (!exprString) return 0;

    let cleanStr = exprString.trim();
    if (cleanStr.endsWith('.')) cleanStr = cleanStr.slice(0, -1);

    const tokens = cleanStr.split(' ').filter(t => t.length > 0);
    if (tokens.length === 0) return 0;

    // If expression ends with an operator, disregard the trailing operator for evaluation
    if (OPERATORS.includes(tokens[tokens.length - 1])) {
      tokens.pop();
    }

    if (tokens.length === 0) return 0;

    // Step 1: Parse numbers & normalized operators into an array
    const parsed = [];
    for (let i = 0; i < tokens.length; i++) {
      const token = tokens[i];
      if (OPERATORS.includes(token)) {
        parsed.push(token);
      } else {
        const numVal = parseFloat(token.replace('−', '-'));
        if (isNaN(numVal)) return null;
        parsed.push(numVal);
      }
    }

    // Step 2: First pass — handle Multiplication (×) and Division (÷)
    const afterMulDiv = [];
    let i = 0;
    while (i < parsed.length) {
      const item = parsed[i];
      if (item === '×' || item === '÷') {
        const prevNum = afterMulDiv.pop();
        const nextNum = parsed[i + 1];

        if (typeof nextNum !== 'number') return null;

        if (item === '÷') {
          if (nextNum === 0) {
            throw new Error('DIVISION_BY_ZERO');
          }
          afterMulDiv.push(prevNum / nextNum);
        } else {
          afterMulDiv.push(prevNum * nextNum);
        }
        i += 2; // skip operator and operand
      } else {
        afterMulDiv.push(item);
        i++;
      }
    }

    // Step 3: Second pass — handle Addition (+) and Subtraction (−)
    if (afterMulDiv.length === 0) return 0;
    let result = typeof afterMulDiv[0] === 'number' ? afterMulDiv[0] : 0;
    let j = 1;

    while (j < afterMulDiv.length) {
      const op = afterMulDiv[j];
      const nextVal = afterMulDiv[j + 1];

      if (typeof nextVal !== 'number') break;

      if (op === '+') {
        result += nextVal;
      } else if (op === '−' || op === '-') {
        result -= nextVal;
      }
      j += 2;
    }

    return result;
  }

  /**
   * Helper to retrieve intermediate result for display if valid
   */
  function getIntermediateResult(expr) {
    try {
      const res = evaluateExpression(expr);
      return res !== null && !isNaN(res) ? res : 0;
    } catch (e) {
      return 0;
    }
  }

  /**
   * Computes the final calculation on '=' or 'Enter'
   */
  function calculate() {
    if (hasError) {
      clearCalculator();
      return;
    }

    if (!currentExpression) return;

    try {
      const result = evaluateExpression(currentExpression);
      if (result === null || isNaN(result)) {
        return;
      }

      lastResult = result;
      isEvaluated = true;
      updateDisplay();
    } catch (err) {
      if (err.message === 'DIVISION_BY_ZERO') {
        hasError = true;
        updateDisplay();
      }
    }
  }

  /**
   * Formats numeric results to avoid floating point inaccuracies (e.g. 0.1 + 0.2 = 0.3)
   */
  function formatResult(num) {
    if (num === null || num === undefined || isNaN(num)) return '0';
    if (!isFinite(num)) return 'Cannot divide by zero';

    // Round to 10 decimal places to eliminate IEEE-754 precision artifacts
    const precisionRounded = Number(Math.round(Number(num + 'e+10')) + 'e-10');

    // Exponential notation for extreme numbers
    if (Math.abs(precisionRounded) >= 1e12 || (Math.abs(precisionRounded) > 0 && Math.abs(precisionRounded) < 1e-7)) {
      return precisionRounded.toExponential(6).replace(/e\+?/, 'e');
    }

    return precisionRounded.toString();
  }

  // ==========================================================================
  // Visual Keyboard Feedback & Event Handling
  // ==========================================================================

  /**
   * Visually highlights a button matching the key pressed
   */
  function triggerButtonHighlight(key) {
    let targetBtn = null;

    // Find matching button by data-key or data-value
    buttons.forEach(btn => {
      const dataKey = btn.dataset.key;
      const dataVal = btn.dataset.value;

      if (dataKey === key || dataVal === key) {
        targetBtn = btn;
      }
    });

    if (targetBtn) {
      targetBtn.classList.add('keyboard-active');
      setTimeout(() => {
        targetBtn.classList.remove('keyboard-active');
      }, 140);
    }
  }

  /**
   * Keyboard event handler
   */
  function handleKeyboardInput(e) {
    const key = e.key;

    // Digits 0–9
    if (/^[0-9]$/.test(key)) {
      e.preventDefault();
      triggerButtonHighlight(key);
      appendNumber(key);
      return;
    }

    // Decimal point
    if (key === '.') {
      e.preventDefault();
      triggerButtonHighlight('.');
      appendDecimal();
      return;
    }

    // Operators
    if (key === '+' || key === '-' || key === '*' || key === '/') {
      e.preventDefault();
      triggerButtonHighlight(key);
      chooseOperator(key);
      return;
    }

    // Percentage
    if (key === '%') {
      e.preventDefault();
      triggerButtonHighlight('%');
      handlePercentage();
      return;
    }

    // Equals / Calculate
    if (key === 'Enter' || key === '=') {
      e.preventDefault();
      triggerButtonHighlight('Enter');
      calculate();
      return;
    }

    // Delete / Backspace
    if (key === 'Backspace') {
      e.preventDefault();
      triggerButtonHighlight('Backspace');
      deleteLast();
      return;
    }

    // All Clear
    if (key === 'Escape' || key === 'Delete') {
      e.preventDefault();
      triggerButtonHighlight('Escape');
      clearCalculator();
      return;
    }

    // Theme Toggle shortcut (T / t)
    if (key === 't' || key === 'T') {
      toggleTheme();
    }
  }

  /**
   * Click / Touch event delegation for calculator buttons
   */
  function handleButtonClick(e) {
    const btn = e.target.closest('.btn');
    if (!btn) return;

    const action = btn.dataset.action;
    const value = btn.dataset.value;

    switch (action) {
      case 'number':
        appendNumber(value);
        break;
      case 'decimal':
        appendDecimal();
        break;
      case 'operator':
        chooseOperator(value);
        break;
      case 'percent':
        handlePercentage();
        break;
      case 'clear':
        clearCalculator();
        break;
      case 'delete':
        deleteLast();
        break;
      case 'equals':
        calculate();
        break;
    }
  }

  // ==========================================================================
  // Theme Toggle & Persistence
  // ==========================================================================

  function getPreferredTheme() {
    const storedTheme = localStorage.getItem('calc-theme');
    if (storedTheme) {
      return storedTheme;
    }
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }

  function applyTheme(theme) {
    if (theme === 'dark') {
      document.documentElement.setAttribute('data-theme', 'dark');
      themeToggleBtn.setAttribute('aria-label', 'Switch to light mode');
    } else {
      document.documentElement.removeAttribute('data-theme');
      themeToggleBtn.setAttribute('aria-label', 'Switch to dark mode');
    }
    localStorage.setItem('calc-theme', theme);
  }

  function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
    const nextTheme = currentTheme === 'dark' ? 'light' : 'dark';
    applyTheme(nextTheme);
  }

  // ==========================================================================
  // Initialization
  // ==========================================================================

  function init() {
    // Initialize Theme
    applyTheme(getPreferredTheme());
    themeToggleBtn.addEventListener('click', toggleTheme);

    // Keypad Click Listeners
    const keypad = document.querySelector('.keypad-grid');
    keypad.addEventListener('click', handleButtonClick);

    // Keyboard Listeners
    window.addEventListener('keydown', handleKeyboardInput);

    // Initial Display State
    updateDisplay();
  }

  // Run on DOM Content Loaded
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
