//Regex for matching a number
var numberRegex = /^[+-]?((\d+(\.\d*)?)|(\.\d+))/;


//Implementation of the shunt-yard algorithm
function parseEquation(eqString) {
  eqString = eqString.replace(/\s/g, '');

  var ops = [];
  var values = [];

  while (eqString.length > 0) {
    var numMatch = false;

    if (values.length === 0 || (eqString.charAt(0) !== '-' && eqString.charAt(0) !== '+')) {
      numMatch = eqString.match(numberRegex);
      if (numMatch) {
        numMatch = numMatch[0];
      }
    }

    if (eqString.charAt(0) === 'x') {
      numMatch = 'x';
    }

    console.log(numMatch);

    if (numMatch) {
      if (numMatch === 'x') {
        values.push(numMatch);
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

  if (ops.length === 0 && values.length === 1) { //Special case where the function is just a value/variable with no operators
    return createTreeFunction(['\0'], values);
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
    });
    return this.opFunction(...computedOperands);
  }

  batch(vars, values) {

  }

  toString() {
    if (this.operands.length === 1) {
      if (this.op !== '\0') { //If this isn't a "no operator" value
        return `${this.op}(${this.operands[0].toString()})`;
      } else {
        return this.operands[0].toString();
      }
    } else if (this.operands.length === 2) {
      //Parentheses rewuired if there the precence of this operator is higher than it's operands
      var opStrings = this.operands.map((op) => {
        if (_PRECEDENCE_MAP[this.op] < _PRECEDENCE_MAP[op.op]) {
          return `(${op.toString()})`;
        } else {
          return op.toString();
        }
      }, this);

      return opStrings.join(` ${this.op} `);
    }

    return 'OTHER';
  }
}

function numOperands(op) {
  if (_OP_TABLE[op]) {
    return _OP_TABLE[op].length;
  }
  return -1;
}