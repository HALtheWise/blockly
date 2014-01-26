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
 * @fileoverview Generating C++ for text blocks. Modified from the standard Blockly JavaScript generator.
 * @author q.neutron@gmail.com (Quynh Neutron), dininno@mit.edu (Ethan DiNinno)
 */
'use strict';

goog.provide('Blockly.RobotC.logic');

goog.require('Blockly.RobotC');


Blockly.RobotC['controls_if'] = function(block) {
  // If/elseif/else condition.
  var n = 0;
  var argument = Blockly.RobotC.valueToCode(block, 'IF' + n,
      Blockly.RobotC.ORDER_NONE) || 'false';
  var branch = Blockly.RobotC.statementToCode(block, 'DO' + n);
  var code = 'if (' + argument + ') {\n' + branch + '}';
  for (n = 1; n <= block.elseifCount_; n++) {
    argument = Blockly.RobotC.valueToCode(block, 'IF' + n,
        Blockly.RobotC.ORDER_NONE) || 'false';
    branch = Blockly.RobotC.statementToCode(block, 'DO' + n);
    code += ' else if (' + argument + ') {\n' + branch + '}';
  }
  if (block.elseCount_) {
    branch = Blockly.RobotC.statementToCode(block, 'ELSE');
    code += ' else {\n' + branch + '}';
  }
  return code + '\n';
};

Blockly.RobotC['logic_compare'] = function(block) {
  // Comparison operator.
  var OPERATORS = {
    EQ: '==',
    NEQ: '!=',
    LT: '<',
    LTE: '<=',
    GT: '>',
    GTE: '>='
  };
  var operator = OPERATORS[block.getFieldValue('OP')];
  var order = (operator == '==' || operator == '!=') ?
      Blockly.RobotC.ORDER_EQUALITY : Blockly.RobotC.ORDER_RELATIONAL;
  var argument0 = Blockly.RobotC.valueToCode(block, 'A', order) || '0';
  var argument1 = Blockly.RobotC.valueToCode(block, 'B', order) || '0';
  var code = argument0 + ' ' + operator + ' ' + argument1;
  return [code, order];
};

Blockly.RobotC['logic_operation'] = function(block) {
  // Operations 'and', 'or'.
  var operator = (block.getFieldValue('OP') == 'AND') ? '&&' : '||';
  var order = (operator == '&&') ? Blockly.RobotC.ORDER_LOGICAL_AND :
      Blockly.RobotC.ORDER_LOGICAL_OR;
  var argument0 = Blockly.RobotC.valueToCode(block, 'A', order);
  var argument1 = Blockly.RobotC.valueToCode(block, 'B', order);
  if (!argument0 && !argument1) {
    // If there are no arguments, then the return value is false.
    argument0 = 'false';
    argument1 = 'false';
  } else {
    // Single missing arguments have no effect on the return value.
    var defaultArgument = (operator == '&&') ? 'true' : 'false';
    if (!argument0) {
      argument0 = defaultArgument;
    }
    if (!argument1) {
      argument1 = defaultArgument;
    }
  }
  var code = argument0 + ' ' + operator + ' ' + argument1;
  return [code, order];
};

Blockly.RobotC['logic_negate'] = function(block) {
  // Negation.
  var order = Blockly.RobotC.ORDER_LOGICAL_NOT;
  var argument0 = Blockly.RobotC.valueToCode(block, 'BOOL', order) ||
      'true';
  var code = '!' + argument0;
  return [code, order];
};

Blockly.RobotC['logic_boolean'] = function(block) {
  // Boolean values true and false.
  var code = (block.getFieldValue('BOOL') == 'TRUE') ? 'true' : 'false';
  return [code, Blockly.RobotC.ORDER_ATOMIC];
};

Blockly.RobotC['logic_ternary'] = function(block) {
  // Ternary operator.
  var value_if = Blockly.RobotC.valueToCode(block, 'IF',
      Blockly.RobotC.ORDER_CONDITIONAL) || 'false';
  var value_then = Blockly.RobotC.valueToCode(block, 'THEN',
      Blockly.RobotC.ORDER_CONDITIONAL) || 'null';
  var value_else = Blockly.RobotC.valueToCode(block, 'ELSE',
      Blockly.RobotC.ORDER_CONDITIONAL) || 'null';
  var code = value_if + ' ? ' + value_then + ' : ' + value_else
  return [code, Blockly.RobotC.ORDER_CONDITIONAL];
};
