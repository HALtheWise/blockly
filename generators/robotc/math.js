/**
 * Visual Blocks Language
 *
 * Copyright 2012 Google Inc.
 * http://blockly.googlecode.com/
 * and 2014 Massachusetts Institute of Technology
 * http://zerorobotics.org/
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * @fileoverview Generating C++ for math blocks. Modified from the standard Blockly JavaScript generator.
 * @author q.neutron@gmail.com (Quynh Neutron), dininno@mit.edu (Ethan DiNinno)
 */
'use strict';

goog.provide('Blockly.RobotC.math');

goog.require('Blockly.RobotC');

Blockly.RobotC['math_number'] = function(block) {
	// Numeric value.
	var code = block.getFieldValue('NUM');
	//Validate that the input starts with a number. parseFloat will correctly ignore the trailing f on single-precision floats.
	//TODO: better validation to make sure there isn't other crud after the number
	if(isNaN(parseFloat(code))) {
		code = '0';
	}
	return [code, Blockly.RobotC.ORDER_ATOMIC];
};

Blockly.RobotC['math_arithmetic'] = function(block) {
	// Basic arithmetic operators, and power.
	var OPERATORS = {
		ADD: [' + ', Blockly.RobotC.ORDER_ADDITION],
		MINUS: [' - ', Blockly.RobotC.ORDER_SUBTRACTION],
		MULTIPLY: [' * ', Blockly.RobotC.ORDER_MULTIPLICATION],
		DIVIDE: [' / ', Blockly.RobotC.ORDER_DIVISION],
		POWER: [null, Blockly.RobotC.ORDER_COMMA]  // Handle power separately.
	};
	var tuple = OPERATORS[block.getFieldValue('OP')];
	var operator = tuple[0];
	var order = tuple[1];
	var argument0 = Blockly.RobotC.valueToCode(block, 'A', order) || '0';
	var argument1 = Blockly.RobotC.valueToCode(block, 'B', order) || '0';
	var code;
	// Power requires a special case since it has no operator. The ZR libraries use all single-precision floats. 
	if (!operator) {
		code = 'pow(' + argument0 + ', ' + argument1 + ')';
		return [code, Blockly.RobotC.ORDER_FUNCTION_CALL];
	}
	code = argument0 + operator + argument1;
	return [code, order];
};

Blockly.RobotC['math_single'] = function(block) {
	// Math operators with single operand.
	var operator = block.getFieldValue('OP').toLowerCase();
	var code;
	var arg;
	if (operator == 'neg') {
		// Negation is a special case given its different operator precedence.
		arg = Blockly.RobotC.valueToCode(block, 'NUM',
				Blockly.RobotC.ORDER_UNARY_NEGATION) || '0';
		if (arg[0] == '-') {
			// --3 is not legal
			arg = ' ' + arg;
		}
		code = '-' + arg;
		return [code, Blockly.RobotC.ORDER_UNARY_NEGATION];
	}
	arg = Blockly.RobotC.valueToCode(block, 'NUM',
			Blockly.RobotC.ORDER_NONE) || '0';
	// All ZR trig functions are single-precision and handled in radians, which makes most of the JS version of this unnecessary
	var phrasebook = {'root': 'sqrt', 'ln': 'log', 'log10': 'log10', 'pow10': '10^',
		'roundup':'ceil', 'rounddown':'floor'};
	if (operator in phrasebook){
		operator = phrasebook[operator];
	}
	code = operator + '(' + arg + ')';
	return [code, Blockly.RobotC.ORDER_FUNCTION_CALL];
};

Blockly.RobotC['math_constant'] = function(block) {
	return [block.getFieldValue('CONSTANT'), Blockly.RobotC.ORDER_ATOMIC];
};

Blockly.RobotC['math_change'] = function(block) {
	// Add to a variable in place.
	var argument0 = Blockly.RobotC.valueToCode(block, 'DELTA',
			Blockly.RobotC.ORDER_ADDITION) || '0';
	var varName = Blockly.RobotC.variableDB_.getName(
			block.getFieldValue('VAR'), Blockly.Variables.NAME_TYPE);
	return varName + ' += ' + argument0 + ';\n';
};

// Rounding functions have a single operand.
Blockly.RobotC['math_round'] = Blockly.RobotC['math_single'];
// Trigonometry functions have a single operand.
Blockly.RobotC['math_trig'] = Blockly.RobotC['math_single'];


Blockly.RobotC['math_modulo'] = function(block) {
	// Remainder computation.
	var argument0 = Blockly.RobotC.valueToCode(block, 'DIVIDEND',
			Blockly.RobotC.ORDER_MODULUS) || '0';
	var argument1 = Blockly.RobotC.valueToCode(block, 'DIVISOR',
			Blockly.RobotC.ORDER_MODULUS) || '0';
	var code = argument0 + ' % ' + argument1;
	return [code, Blockly.RobotC.ORDER_MODULUS];
};

/*
Blockly.RobotC['math_number_property'] = function(block) {
  // Check if a number is even, odd, prime, whole, positive, or negative
  // or if it is divisible by certain number. Returns true or false.
  var number_to_check = Blockly.RobotC.valueToCode(block, 'NUMBER_TO_CHECK',
      Blockly.RobotC.ORDER_MULTIPLICATIVE) || '0';
  var dropdown_property = block.getFieldValue('PROPERTY');
  var code = '';
  if (dropdown_property == 'PRIME') {
    var functionName = Blockly.RobotC.provideFunction_(
        'isPrime',
        ['bool ' + Blockly.RobotC.FUNCTION_NAME_PLACEHOLDER_ + '(int n):',
         '  # https://en.wikipedia.org/wiki/Primality_test#Naive_methods',
         '  if (n == 2 || n == 3){',
         '    return true;',
         '  }',
         '  # False if n is negative, is 1, or not whole,' +
             ' or if n is divisible by 2 or 3.',
         '  if (n <= 1 || n % 2 == 0 || n % 3 == 0){',
         '    return false;',
         '  }',
         '  # Check all the numbers of form 6k +/- 1, up to sqrt(n).',
         '  for (x = 6; x <= sqrt(n); x += 6) {',
         '    if (n % (x - 1) == 0 || n % (x + 1) == 0){',
         '      return false;',
         '    }',
         '  }',
         '  return true;']);
    code = functionName + '(' + number_to_check + ')';
    return [code, Blockly.RobotC.ORDER_FUNCTION_CALL];
  }
  switch (dropdown_property) {
    case 'EVEN':
      code = number_to_check + ' % 2 == 0';
      break;
    case 'ODD':
      code = number_to_check + ' % 2 == 1';
      break;
    case 'WHOLE':
      code = number_to_check + ' % 1 == 0';
      break;
    case 'POSITIVE':
      code = number_to_check + ' > 0';
      break;
    case 'NEGATIVE':
      code = number_to_check + ' < 0';
      break;
    case 'DIVISIBLE_BY':
      var divisor = Blockly.RobotC.valueToCode(block, 'DIVISOR',
          Blockly.RobotC.ORDER_MULTIPLICATION);
      // If 'divisor' is some code that evals to 0, RobotC will raise an error.
      if (!divisor || divisor == '0') {
        return ['false', Blockly.RobotC.ORDER_ATOMIC];
      }
      code = number_to_check + ' % ' + divisor + ' == 0';
      break;
  }
  return [code, Blockly.RobotC.ORDER_NONE];
};*/

Blockly.RobotC['math_constrain'] = function(block) {
  // Constrain a number between two limits.
  var argument0 = Blockly.RobotC.valueToCode(block, 'VALUE',
      Blockly.Python.ORDER_NONE) || '0';
  var argument1 = Blockly.RobotC.valueToCode(block, 'LOW',
      Blockly.Python.ORDER_NONE) || '0';
  /**
   * TODO: Need to change default max value to be infinity.
   */
  var argument2 = Blockly.RobotC.valueToCode(block, 'HIGH',
      Blockly.RobotC.ORDER_NONE) || '0';
  var code = 'min(max(' + argument0 + ', ' + argument1 + '), ' +
      argument2 + ')';
  return [code, Blockly.RobotC.ORDER_FUNCTION_CALL];
};