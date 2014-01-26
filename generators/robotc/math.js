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

goog.provide('Blockly.robotc.math');

goog.require('Blockly.robotc');

Blockly.robotc['math_number'] = function(block) {
	// Numeric value.
	var code = block.getFieldValue('NUM');
	//Validate that the input starts with a number. parseFloat will correctly ignore the trailing f on single-precision floats.
	//TODO: better validation to make sure there isn't other crud after the number
	if(isNaN(parseFloat(code))) {
		code = '0';
	}
	return [code, Blockly.robotc.ORDER_ATOMIC];
};

Blockly.robotc['math_arithmetic'] = function(block) {
	// Basic arithmetic operators, and power.
	var OPERATORS = {
		ADD: [' + ', Blockly.robotc.ORDER_ADDITION],
		MINUS: [' - ', Blockly.robotc.ORDER_SUBTRACTION],
		MULTIPLY: [' * ', Blockly.robotc.ORDER_MULTIPLICATION],
		DIVIDE: [' / ', Blockly.robotc.ORDER_DIVISION],
		POWER: [null, Blockly.robotc.ORDER_COMMA]  // Handle power separately.
	};
	var tuple = OPERATORS[block.getFieldValue('OP')];
	var operator = tuple[0];
	var order = tuple[1];
	var argument0 = Blockly.robotc.valueToCode(block, 'A', order) || '0';
	var argument1 = Blockly.robotc.valueToCode(block, 'B', order) || '0';
	var code;
	// Power requires a special case since it has no operator. The ZR libraries use all single-precision floats. 
	if (!operator) {
		code = 'powf(' + argument0 + ', ' + argument1 + ')';
		return [code, Blockly.robotc.ORDER_FUNCTION_CALL];
	}
	code = argument0 + operator + argument1;
	return [code, order];
};

Blockly.robotc['math_single'] = function(block) {
	// Math operators with single operand.
	var operator = block.getFieldValue('OP');
	var code;
	var arg;
	if (operator == '-') {
		// Negation is a special case given its different operator precedence.
		arg = Blockly.robotc.valueToCode(block, 'NUM',
				Blockly.robotc.ORDER_UNARY_NEGATION) || '0';
		if (arg[0] == '-') {
			// --3 is not legal
			arg = ' ' + arg;
		}
		code = '-' + arg;
		return [code, Blockly.robotc.ORDER_UNARY_NEGATION];
	}
	arg = Blockly.robotc.valueToCode(block, 'NUM',
			Blockly.robotc.ORDER_NONE) || '0';
	// All ZR trig functions are single-precision and handled in radians, which makes most of the JS version of this unnecessary
	code = operator + '(' + arg + ')';
	return [code, Blockly.robotc.ORDER_FUNCTION_CALL];
};

Blockly.robotc['math_constant'] = function(block) {
	return [block.getFieldValue('CONSTANT'), Blockly.robotc.ORDER_ATOMIC];
};

Blockly.robotc['math_change'] = function(block) {
	// Add to a variable in place.
	var argument0 = Blockly.robotc.valueToCode(block, 'DELTA',
			Blockly.robotc.ORDER_ADDITION) || '0';
	var varName = Blockly.robotc.variableDB_.getName(
			block.getFieldValue('VAR'), Blockly.Variables.NAME_TYPE);
	return varName + ' += ' + argument0 + ';\n';
};

// Rounding functions have a single operand.
Blockly.robotc['math_round'] = Blockly.robotc['math_single'];
// Trigonometry functions have a single operand.
Blockly.robotc['math_trig'] = Blockly.robotc['math_single'];


Blockly.robotc['math_modulo'] = function(block) {
	// Remainder computation.
	var argument0 = Blockly.robotc.valueToCode(block, 'DIVIDEND',
			Blockly.robotc.ORDER_MODULUS) || '0';
	var argument1 = Blockly.robotc.valueToCode(block, 'DIVISOR',
			Blockly.robotc.ORDER_MODULUS) || '0';
	var code = argument0 + ' % ' + argument1;
	return [code, Blockly.robotc.ORDER_MODULUS];
};
