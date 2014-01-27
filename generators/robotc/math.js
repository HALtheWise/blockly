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
		code = 'powf(' + argument0 + ', ' + argument1 + ')';
		return [code, Blockly.RobotC.ORDER_FUNCTION_CALL];
	}
	code = argument0 + operator + argument1;
	return [code, order];
};

Blockly.RobotC['math_single'] = function(block) {
	// Math operators with single operand.
	var operator = block.getFieldValue('OP');
	var code;
	var arg;
	if (operator == 'NEG') {
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
	const var operatorTranslation = {'root': 'sqrt', 'abs':'abs', 'ln': 'log', 'log10': 'log10', 'exp': 'exp', 'pow10': '10^'};
	code = operatorTranslation[operator.toLowerCase()] + '(' + arg + ')';
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
