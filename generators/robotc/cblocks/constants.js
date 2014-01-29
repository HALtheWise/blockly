/**
 * Visual Blocks Language
 *
 * Copyright 2012 Google Inc.
 * http://blockly.googlecode.com/
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
 * @fileoverview Generating RobotC for constant blocks.
 * @author eric@legoaces.org (Eric Miller)
 */
'use strict';

goog.provide('Blockly.RobotC.constants');

goog.require('Blockly.RobotC');


Blockly.RobotC['cblocks_constants_get'] = function(block) {
  // Constants get
  var name = block.getFieldValue('VAR');
  return [name, Blockly.RobotC.ORDER_ATOMIC];
};

Blockly.RobotC['cblocks_constants_declare'] = function(block) {
	  // Constants declaration
	  if (typeof(Blockly.RobotC.definitions_['constants']) == 'undefined'){
		  Blockly.RobotC.definitions_['constants'] = "";
	  }
	  var argument0 = Blockly.RobotC.valueToCode(block, 'VALUE', Blockly.RobotC.ORDER_COMMA) || '0';
	  var code = '#define ' + block.getFieldValue('NAME') + ' ' + argument0;
	  Blockly.RobotC.definitions_['constants'] += code;
	  return '';
};