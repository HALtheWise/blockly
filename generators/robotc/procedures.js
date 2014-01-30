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
 * @fileoverview Generating JavaScript for procedure blocks.
 * @author fraser@google.com (Neil Fraser)
 */
'use strict';

goog.provide('Blockly.RobotC.procedures');

goog.require('Blockly.RobotC');


Blockly.RobotC['procedures_defreturn'] = function(block) {
	// Define a procedure with a return value.
	var funcName = Blockly.RobotC.variableDB_.getName(
			block.getFieldValue('NAME'), Blockly.Procedures.NAME_TYPE);
	var branch = Blockly.RobotC.statementToCode(block, 'STACK');
	var type = (block.callType_ == 'procedures_callnoreturn') ? 'void' : 'float';
	var returnValue = Blockly.RobotC.valueToCode(block, 'RETURN',
			Blockly.RobotC.ORDER_NONE) || '';
	if (returnValue) {
		returnValue = '  return ' + returnValue + ';\n';
	}

	  var args = [];
	  for (var x = 0; x < block.arguments_.length; x++) {
	    args[x] = 'float ' + Blockly.RobotC.variableDB_.getName(block.arguments_[x],
	        Blockly.Variables.NAME_TYPE);
	  }
	  
	var code = type + ' ' + funcName + '(' + args.join(', ') + ') {\n' +
			branch + returnValue + '}';
	code = Blockly.RobotC.scrub_(block, code);
	Blockly.RobotC.definitions_['function_' + funcName] = code;
	return null;
};

// Defining a procedure without a return value uses the same generator as
// a procedure with a return value.
Blockly.RobotC['procedures_defnoreturn'] =
		Blockly.RobotC['procedures_defreturn'];

Blockly.RobotC['procedures_definit'] = function(block) {
	// Define a procedure with a return value.
	var branch = Blockly.RobotC.statementToCode(block, 'GLOBALS') + Blockly.RobotC.statementToCode(block, 'STACK');
	var code = 'void init() {\n' +
			branch + '}';
	code = Blockly.RobotC.scrub_(block, code);
	Blockly.RobotC.definitions_['init'] = code;
	return null;
};

Blockly.RobotC['procedures_callreturn'] = function(block) {
	// Call a procedure with a return value.
	var funcName = Blockly.RobotC.variableDB_.getName(
			block.getFieldValue('NAME'), Blockly.Procedures.NAME_TYPE);
	var args = [];
	for (var x = 0; x < block.arguments_.length; x++) {
		args[x] = Blockly.RobotC.valueToCode(block, 'ARG' + x,
				Blockly.RobotC.ORDER_COMMA) || 'null';
	}
	var code = funcName + '(' + args.join(', ') + ')';
	return [code, Blockly.RobotC.ORDER_FUNCTION_CALL];
};

Blockly.RobotC['procedures_callnoreturn'] = function(block) {
	// Call a procedure with no return value.
	var funcName = Blockly.RobotC.variableDB_.getName(
			block.getFieldValue('NAME'), Blockly.Procedures.NAME_TYPE);
	var args = [];
	for (var x = 0; x < block.arguments_.length; x++) {
		args[x] = Blockly.RobotC.valueToCode(block, 'ARG' + x,
				Blockly.RobotC.ORDER_COMMA) || 'null';
	}
	var code = funcName + '(' + args.join(', ') + ');\n';
	return code;
};

Blockly.RobotC['procedures_ifreturn'] = function(block) {
	// Conditionally return value from a procedure.
	var condition = Blockly.RobotC.valueToCode(block, 'CONDITION',
			Blockly.RobotC.ORDER_NONE) || 'false';
	var code = 'if (' + condition + ') {\n';
	if (block.hasReturnValue_) {
		var value = Blockly.RobotC.valueToCode(block, 'VALUE',
				Blockly.RobotC.ORDER_NONE) || 'null';
		code += '  return ' + value + ';\n';
	} else {
		code += '  return;\n';
	}
	code += '}\n';
	return code;
};
