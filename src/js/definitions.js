
//Precedence map. Even is left to right. odd is right to left
var _PRECEDENCE_MAP = {
  //Parenthesis
  '(': 0,
  ')': 0,

  //Trig
  'sin': 5,
  'cos': 5,
  'tan': 5,
  'sinh': 5,
  'cosh': 5,
  'tanh': 5,

  //misc math
  'abs': 5,
  'ceil': 5,
  'floor': 5,
  'round': 5,
  'log': 5,

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
  'sinh': (a) => Math.sinh(a),
  'cosh': (a) => Math.cosh(a),
  'tanh': (a) => Math.tanh(a),

  //misc math
  'abs': (a) => Math.abs(a),
  'ceil': (a) => Math.ceil(a),
  'floor': (a) => Math.floor(a),
  'round': (a) => Math.round(a),

  //natural log
  'log': (a) => Math.log(a),
}