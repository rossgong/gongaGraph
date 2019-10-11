
//Precedence map. Even is left to right. odd is right to left
var _PRECEDENCE_MAP = {
  //Parenthesis
  '(': 0,
  ')': 0,

  //Trig
  'sin': 5,
  'cos': 5,
  'tan': 5,

  //Exponentiation
  '^': 11,

  //Multiply/Divide
  '*': 20,
  '/': 20,

  //Add/Subtract
  '+': 30,
  '-': 30
}

var _OP_TABLE = {
  //Exponentiation
  '^': (a, b) => Math.pow(a, b),

  //Multiply/Divide
  '*': (a, b) => a * b,
  '/': (a, b) => a / b,

  //Add/Subtract
  '+': (a, b) => a + b,
  '-': (a, b) => a - b,

  //Trig
  'sin': (a) => Math.sin(a),
  'cos': (a) => Math.cos(a),
  'tan': (a) => Math.tan(a),
}

//Implementation of the shunt-yard algorithm
function parseEquation(eqString) {
  eqString = eqString.replace(/\s/g, '');

  var ops = [];
  var values = [];

  while (eqString.length > 0) {
    var numMatch = false;

    if (values.length === 0 || (eqString.charAt(0) !== '-' && eqString.charAt(0) !== '+')) {
      numMatch = eqString.match(/^[+-]?((\d+(\.\d*)?)|(\.\d+))/);
      if (numMatch) numMatch = numMatch[0];
    }

    if (eqString.charAt(0) === 'x') {
      numMatch = 'x';
    }

    if (numMatch) {
      if (numMatch === 'x') {
        values.push(numMatch)
      } else {
        values.push(parseFloat(numMatch));
      }

      eqString = eqString.slice(numMatch.toString().length);
    } else {
      var operator = eqString.charAt(0);


      if (operator.match(/[a-z]/i)) {
        var i = 1;

        while (eqString.charAt(i).match(/[a-z]/i)) {
          operator += eqString.charAt(i);
          i++;
        }
      }

      if (operator === ')') {
        while (ops[ops.length - 1] !== '(') {
          values.push(createTreeFunction(ops, values));
        }
        ops.pop();
      } else {
        while (ops.length > 0 && ops[ops.length - 1] !== '(' && !isHigherOrder(operator, ops[ops.length - 1])) {
          values.push(createTreeFunction(ops, values));
        }
        ops.push(operator);
      }
      eqString = eqString.slice(operator.length);
    }
  }

  while (ops.length > 0) {
    values.push(createTreeFunction(ops, values));
  }

  return values[0];
}

function createTreeFunction(ops, vals) {
  var op = ops.pop();
  var operands = [];

  for (var i = 0; i < numOperands(op); i++) {
    var operand = vals.pop();
    if (operand) {
      operands.unshift(operand);
    } else {
      throw 'Not valid equation ran out of operands';
    }
  }

  return new Equation(op, operands);
}



function isHigherOrder(opA, opB) {
  if (_PRECEDENCE_MAP[opA] === _PRECEDENCE_MAP[opB] && _PRECEDENCE_MAP[opA] % 2 === 1) {
    return true;
  }
  return _PRECEDENCE_MAP[opA] < _PRECEDENCE_MAP[opB];
}

class Equation {
  constructor(opCode, operands) {
    if (_OP_TABLE[opCode]) {
      this.op = opCode;
      this.opFunction = _OP_TABLE[opCode];

      this.operands = operands;

      this.visible = true;
    } else {
      throw `Operater '${opCode}' not recognized`;
    }
  }

  exec(vars) {
    var computedOperands = this.operands.map(val => {
      if (val instanceof Equation) {
        return val.exec(vars);
      } else if (typeof val === 'string') {
        return vars[val];
      } else {
        return val;
      }
    })
    return this.opFunction(...computedOperands);
  }

  toString() {
    if (this.operands.length === 1) {
      return `${this.op}(${this.operands[0].toString()})`;
    } else if (this.operands.length === 2) {
      return `${this.operands[0]} ${this.op} ${this.operands[1]}`;
    }

    return 'OTHER';
  }
}

function numOperands(op) {
  if (_OP_TABLE[op]) {
    return _OP_TABLE[op].length
  }
  return -1;
}