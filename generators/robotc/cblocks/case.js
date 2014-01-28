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
 * @fileoverview Generating RobotC for Switch block.
 * @author q.neutron@gmail.com (Quynh Neutron)
 */
'use strict';

goog.provide('Blockly.RobotC.case');

goog.require('Blockly.RobotC');


Blockly.RobotC['cblocks_case'] = function(block) {
  // If/elseif/else condition.
  var n = 0;
  var argument = Blockly.RobotC.valueToCode(block, 'INPUT',
      Blockly.RobotC.ORDER_NONE) || '0';
  var code = 'switch(' + argument + '){\n';
  var innercode = '';
  for (n = 1; n <= block.caseCount_; n++) {
    argument = Blockly.RobotC.valueToCode(block, 'CHOICE' + n,
        Blockly.RobotC.ORDER_NONE) || '0';
    var branch = Blockly.RobotC.statementToCode(block, 'DO' + n);
    innercode += 'case ' + argument + ':\n' + branch + 'break;\n';
  }
  if (block.defaultCount_) {
    branch = Blockly.RobotC.statementToCode(block, 'DEFAULT') || '\n';
    innercode += 'default:\n' + branch;
  }
  /**
   * TODO: Handle indentation better
   */
  return code + Blockly.RobotC.prefixLines(innercode, '  ') + '}\n';
};