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
 * @fileoverview Generating JavaScript for loop blocks.
 * @author fraser@google.com (Neil Fraser)
 */
'use strict';

goog.provide('Blockly.RobotC.loops');

goog.require('Blockly.RobotC');

Blockly.RobotC['controls_repeat_ext'] = function(block) {
	// Repeat n times (external number).
	var repeats = Blockly.RobotC.valueToCode(block, 'TIMES',
			Blockly.RobotC.ORDER_ASSIGNMENT) || '0';
	var branch = Blockly.RobotC.statementToCode(block, 'DO');
	var code = '';
	var loopVar = Blockly.RobotC.variableDB_.getDistinctName(
			'count', Blockly.Variables.NAME_TYPE);
	var endVar = repeats;
	if (!repeats.match(/^\w+$/) && !Blockly.isNumber(repeats)) {
		var endVar = Blockly.RobotC.variableDB_.getDistinctName(
				'repeat_end', Blockly.Variables.NAME_TYPE);
		code += 'int ' + endVar + ' = ' + repeats + ';\n';
	}
	code += 'for (int ' + loopVar + ' = 0; ' +
			loopVar + ' < ' + endVar + '; ' +
			loopVar + '++) {\n' +
			branch + '}\n';
	return code;
};

Blockly.RobotC['controls_whileUntil'] = function(block) {
	// While loop.
	var until = block.getFieldValue('MODE') == 'UNTIL';
	var argument0 = Blockly.RobotC.valueToCode(block, 'BOOL',
			until ? Blockly.RobotC.ORDER_LOGICAL_NOT :
			Blockly.RobotC.ORDER_NONE) || 'false';
	var branch = Blockly.RobotC.statementToCode(block, 'DO');
	if (until) {
		argument0 = '!' + argument0;
	}
	return 'while (' + argument0 + ') {\n' + branch + '}\n';
};

Blockly.RobotC['controls_for'] = function(block) {
	// For loop.
	var variable0 = Blockly.RobotC.variableDB_.getName(
			block.getFieldValue('VAR'), Blockly.Variables.NAME_TYPE);
	var argument0 = Blockly.RobotC.valueToCode(block, 'FROM',
			Blockly.RobotC.ORDER_ASSIGNMENT) || '0';
	var argument1 = Blockly.RobotC.valueToCode(block, 'TO',
			Blockly.RobotC.ORDER_ASSIGNMENT) || '0';
	var increment = Blockly.RobotC.valueToCode(block, 'BY',
			Blockly.RobotC.ORDER_ASSIGNMENT) || '1';
	var branch = Blockly.RobotC.statementToCode(block, 'DO');
	var code;
	if (Blockly.isNumber(argument0) && Blockly.isNumber(argument1) &&
			Blockly.isNumber(increment)) {
		// All arguments are simple numbers.
		var up = parseInt(argument0) <= parseInt(argument1);
		code = 'for (' + variable0 + ' = ' + argument0 + '; ' +
				variable0 + (up ? ' <= ' : ' >= ') + argument1 + '; ' +
				variable0;
		var step = Math.abs(parseInt(increment));
		if (step == 1) {
			code += up ? '++' : '--';
		} else {
			code += (up ? ' += ' : ' -= ') + step;
		}
		code += ') {\n' + branch + '}\n';
	} else {
		code = '';
		// Cache non-trivial values to variables to prevent repeated look-ups.
		var startVar = argument0;
		if (!argument0.match(/^\w+$/) && !Blockly.isNumber(argument0)) {
			var startVar = Blockly.RobotC.variableDB_.getDistinctName(
					variable0 + '_start', Blockly.Variables.NAME_TYPE);
			code += 'int ' + startVar + ' = ' + argument0 + ';\n';
		}
		var endVar = argument1;
		if (!argument1.match(/^\w+$/) && !Blockly.isNumber(argument1)) {
			var endVar = Blockly.RobotC.variableDB_.getDistinctName(
					variable0 + '_end', Blockly.Variables.NAME_TYPE);
			code += 'int ' + endVar + ' = ' + argument1 + ';\n';
		}
		// Determine loop direction at start, in case one of the bounds
		// changes during loop execution.
		var incVar = Blockly.RobotC.variableDB_.getDistinctName(
				variable0 + '_inc', Blockly.Variables.NAME_TYPE);
		code += 'int ' + incVar + ' = ';
		if (Blockly.isNumber(increment)) {
			code += Math.abs(increment) + ';\n';
		} else {
			code += 'fabsf(' + increment + ');\n';
		}
		code += 'if (' + startVar + ' > ' + endVar + ') {\n';
		code += '  ' + incVar + ' = -' + incVar +';\n';
		code += '}\n';
		code += 'for (' + variable0 + ' = ' + startVar + ';\n' +
				'     '  + incVar + ' >= 0 ? ' +
				variable0 + ' <= ' + endVar + ' : ' +
				variable0 + ' >= ' + endVar + ';\n' +
				'     ' + variable0 + ' += ' + incVar + ') {\n' +
				branch + '}\n';
	}
	return code;
};

Blockly.RobotC['controls_forEach'] = function(block) {
	// For each loop.
	var variable0 = Blockly.RobotC.variableDB_.getName(
			block.getFieldValue('VAR'), Blockly.Variables.NAME_TYPE);
	var argument0 = Blockly.RobotC.valueToCode(block, 'LIST',
			Blockly.RobotC.ORDER_ASSIGNMENT) || '[]';
	var branch = Blockly.RobotC.statementToCode(block, 'DO');
	if (Blockly.RobotC.INFINITE_LOOP_TRAP) {
		branch = Blockly.RobotC.INFINITE_LOOP_TRAP.replace(/%1/g,
				'\'' + block.id + '\'') + branch;
	}
	var indexVar = Blockly.RobotC.variableDB_.getDistinctName(
			variable0 + '_index', Blockly.Variables.NAME_TYPE);
	branch = '  ' + variable0 + ' = ' + argument0 + '[' + indexVar + '];\n' +
			branch;
	var code = 'for (var ' + indexVar + ' in  ' + argument0 + ') {\n' +
			branch + '}\n';
	return code;
};

Blockly.RobotC['controls_flow_statements'] = function(block) {
	// Flow statements: continue, break.
	switch (block.getFieldValue('FLOW')) {
		case 'BREAK':
			return 'break;\n';
		case 'CONTINUE':
			return 'continue;\n';
	}
	throw 'Unknown flow statement.';
};
