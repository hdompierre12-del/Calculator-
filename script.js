const display = document.querySelector('#display');
const previous = document.querySelector('#previous');
const keys = document.querySelector('#keys');

let current = '0';
let stored = null;
let pendingOperator = null;
let replaceCurrent = false;

function show(value = current) {
  display.textContent = value.length > 12 ? Number(value).toPrecision(8) : value;
}

function inputDigit(digit) {
  if (replaceCurrent || current === '0' || current === 'Error') {
    current = digit;
    replaceCurrent = false;
  } else if (current.replace('-', '').length < 12) {
    current += digit;
  }
  show();
}

function calculate(a, operator, b) {
  if (operator === '+') return a + b;
  if (operator === '−') return a - b;
  if (operator === '×') return a * b;
  if (operator === '÷') return b === 0 ? null : a / b;
  return b;
}

function chooseOperator(operator) {
  const value = Number(current);
  if (pendingOperator && !replaceCurrent) {
    const result = calculate(stored, pendingOperator, value);
    if (result === null) return show('Cannot divide by zero');
    current = String(Number(result.toPrecision(10)));
    show();
  }
  stored = Number(current);
  pendingOperator = operator;
  previous.textContent = `${current} ${operator}`;
  replaceCurrent = true;
  document.querySelectorAll('.operator').forEach(button => {
    button.classList.toggle('selected', button.dataset.operator === operator);
  });
}

function equals() {
  if (!pendingOperator || stored === null) return;
  const right = Number(current);
  const expression = `${stored} ${pendingOperator} ${right} =`;
  const result = calculate(stored, pendingOperator, right);
  document.querySelectorAll('.operator').forEach(button => button.classList.remove('selected'));
  pendingOperator = null;
  stored = null;
  replaceCurrent = true;
  previous.textContent = expression;
  if (result === null) {
    current = 'Error';
    previous.textContent = 'Cannot divide by zero';
  } else {
    current = String(Number(result.toPrecision(10)));
  }
  show();
}

function clear() {
  current = '0';
  stored = null;
  pendingOperator = null;
  replaceCurrent = false;
  previous.textContent = '';
  document.querySelectorAll('.operator').forEach(button => button.classList.remove('selected'));
  show();
}

function activate(action) {
  if (action === 'clear') return clear();
  if (action === 'decimal') {
    if (replaceCurrent || current === 'Error') { current = '0'; replaceCurrent = false; }
    if (!current.includes('.')) current += '.';
    return show();
  }
  if (action === 'sign') {
    if (current !== '0' && current !== 'Error') current = String(-Number(current));
    return show();
  }
  if (action === 'percent') {
    current = String(Number(current) / 100);
    replaceCurrent = false;
    return show();
  }
  if (action === 'equals') equals();
}

keys.addEventListener('click', event => {
  const button = event.target.closest('button');
  if (!button) return;
  if (button.dataset.digit !== undefined) inputDigit(button.dataset.digit);
  else if (button.dataset.operator) chooseOperator(button.dataset.operator);
  else activate(button.dataset.action);
});

document.addEventListener('keydown', event => {
  if (/^[0-9]$/.test(event.key)) inputDigit(event.key);
  else if (event.key === '.') activate('decimal');
  else if (event.key === 'Enter' || event.key === '=') { event.preventDefault(); equals(); }
  else if (event.key === 'Escape' || event.key === 'Backspace') clear();
  else if (event.key === '+') chooseOperator('+');
  else if (event.key === '-') chooseOperator('−');
  else if (event.key === '*') chooseOperator('×');
  else if (event.key === '/') { event.preventDefault(); chooseOperator('÷'); }
});
