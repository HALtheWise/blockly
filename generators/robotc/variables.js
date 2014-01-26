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
 * @fileoverview Generating C++ for variable blocks. Modified from the standard Blockly JavaScript generator.
 * @author fraser@google.com (Neil Fraser), dininno@mit.edu (Ethan DiNinno)
 */
'use strict';

goog.provide('Blockly.robotc.variables');

goog.require('Blockly.robotc');


Blockly.robotc['variables_get'] = function(block) {
	// Variable getter.
	var code = Blockly.robotc.variableDB_.getName(block.getFieldValue('VAR'),
			Blockly.Variables.NAME_TYPE);
	return [code, Blockly.robotc.ORDER_ATOMIC];
};

Blockly.robotc['variables_set'] = function(block) {
	// Variable setter.
	var argument0 = Blockly.robotc.valueToCode(block, 'VALUE',
			Blockly.robotc.ORDER_ASSIGNMENT) || '0';
	var varName = Blockly.robotc.variableDB_.getName(
			block.getFieldValue('VAR'), Blockly.Variables.NAME_TYPE);
	return varName + ' = ' + argument0 + ';\n';
};

Blockly.robotc['variables_declare'] = function(block) {
	// Declare variable. 
	var varName = Blockly.robotc.variableDB_.getName(block.getFieldValue('NAME'), Blockly.Variables.NAME_TYPE);
	var val = Blockly.robotc.valueToCode(block, 'VALUE', Blockly.robotc.ORDER_ASSIGNMENT) || '0';
	return varName + ' = ' + val + ';\n';
};


Blockly.robotc['variables_array_get'] = function(block) {
	//Note: Uses 0-based indices, not 1-based like other Blockly generators
	var index = Blockly.robotc.valueToCode(block, 'INDEX',
			Blockly.robotc.ORDER_NONE) || '0';
	var array = Blockly.robotc.variableDB_.getName(block.getFieldValue('ARRAY'), Blockly.Variables.NAME_TYPE) || '_';
	var code = array + '[' + index + ']';
	return [code, Blockly.robotc.ORDER_MEMBER];
};

Blockly.robotc['variables_array_set'] = function(block) {
	//Note: Uses 0-based indices, not 1-based like other Blockly generators
	var index = Blockly.robotc.valueToCode(block, 'INDEX',
			Blockly.robotc.ORDER_NONE) || '0';
	var array = Blockly.robotc.variableDB_.getName(block.getFieldValue('ARRAY'), Blockly.Variables.NAME_TYPE) || '_';
	var value = Blockly.robotc.valueToCode(block, 'VALUE',
			Blockly.robotc.ORDER_ASSIGNMENT) || '0';
	return array + '[' + index + '] = ' + value + ';\n';
};

Blockly.robotc['variables_array_declare'] = function(block) {
	// Declare array. 
	var varName = Blockly.robotc.variableDB_.getName(
			block.getFieldValue('NAME'), Blockly.Variables.NAME_TYPE);
	var len = block.getFieldValue('LENGTH');
	var code = '';
	for(var i = 0; i < len; i++) {
		var val = Blockly.robotc.valueToCode(block, 'VALUE' + i, Blockly.robotc.ORDER_ASSIGNMENT) || '0';
		code = code + varName + '[' + i + '] = ' + val + ';\n';
	}
	return code;
};
