/**
 * Visual Blocks Editor
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
 * @fileoverview Logic blocks for Blockly.
 * @author q.neutron@gmail.com (Quynh Neutron), eric@legoaces.org (Eric Miller)
 */

'use strict';

goog.provide('Blockly.Blocks.cblocks.case');

goog.require('Blockly.Blocks');


Blockly.Blocks['cblocks_case'] = {
  // If/case/else condition.
  init: function() {
    this.setHelpUrl(Blockly.Msg.CONTROLS_IF_HELPURL);
    this.setColour(210);
    this.appendValueInput('Input')
        .setCheck('Number')
        .appendField("switch");
    this.setPreviousStatement(true);
    this.setNextStatement(true);
    this.setMutator(new Blockly.Mutator(['cblocks_case_case',
                                         'cblocks_case_default']));
    this.setTooltip("Executes the code block whose selector matches\nthe input");
    // Assign 'this' to a variable for use in the tooltip closure below.
//    var thisBlock = this;
//    this.setTooltip(function() {
//      if (!thisBlock.elseifCount_ && !thisBlock.elseCount_) {
//        return Blockly.Msg.CONTROLS_IF_TOOLTIP_1;
//      } else if (!thisBlock.elseifCount_ && thisBlock.elseCount_) {
//        return Blockly.Msg.CONTROLS_IF_TOOLTIP_2;
//      } else if (thisBlock.elseifCount_ && !thisBlock.elseCount_) {
//        return Blockly.Msg.CONTROLS_IF_TOOLTIP_3;
//      } else if (thisBlock.elseifCount_ && thisBlock.elseCount_) {
//        return Blockly.Msg.CONTROLS_IF_TOOLTIP_4;
//      }
//      return '';
//    });
    this.caseCount_ = 1;
    this.defaultCount_ = 0;
  },
  mutationToDom: function() {
    if (!this.caseCount_ && !this.defaultCount_) {
      return null;
    }
    var container = document.createElement('mutation');
    if (this.caseCount_) {
      container.setAttribute('case', this.caseCount_);
    }
    if (this.defaultCount_) {
      container.setAttribute('else', 1);
    }
    return container;
  },
  domToMutation: function(xmlElement) {
    this.caseCount_ = parseInt(xmlElement.getAttribute('case'), 10);
    this.defaultCount_ = parseInt(xmlElement.getAttribute('else'), 10);
    for (var x = 1; x <= this.caseCount_; x++) {
      this.appendValueInput('CHOICE' + x)
          .setCheck('Number')
          .appendField("If switch = ");
      this.appendStatementInput('DO' + x)
          .appendField(Blockly.Msg.CONTROLS_IF_MSG_THEN);
    }
    if (this.defaultCount_) {
      this.appendStatementInput('DEFAULT')
          .appendField(Blockly.Msg.CONTROLS_IF_MSG_ELSE);
    }
  },
  decompose: function(workspace) {
    var containerBlock = Blockly.Block.obtain(workspace, 'cblocks_case_switch');
    containerBlock.initSvg();
    console.log(containerBlock);
    var connection = containerBlock.getInput('STACK').connection;
    for (var x = 1; x <= this.caseCount_; x++) {
      var caseBlock = Blockly.Block.obtain(workspace, 'cblocks_case_case');
      caseBlock.initSvg();
      connection.connect(caseBlock.previousConnection);
      connection = caseBlock.nextConnection;
    }
    if (this.defaultCount_) {
      var defaultBlock = Blockly.Block.obtain(workspace, 'cblocks_case_default');
      defaultBlock.initSvg();
      connection.connect(defaultBlock.previousConnection);
    }
    return containerBlock;
  },
  compose: function(containerBlock) {
    // Disconnect the else input blocks and remove the inputs.
    if (this.defaultCount_) {
      this.removeInput('DEFAULT');
    }
    this.defaultCount_ = 0;
    // Disconnect all the case input blocks and remove the inputs.
    for (var x = this.caseCount_; x > 0; x--) {
      this.removeInput('CHOICE' + x);
      this.removeInput('DO' + x);
    }
    this.caseCount_ = 0;
    // Rebuild the block's optional inputs.
    var clauseBlock = containerBlock.getInputTargetBlock('STACK');
    while (clauseBlock) {
      switch (clauseBlock.type) {
        case 'cblocks_case_case':
          this.caseCount_++;
          var ifInput = this.appendValueInput('CHOICE' + this.caseCount_)
              .setCheck('Number')
              .appendField("If switch = ");
          var doInput = this.appendStatementInput('DO' + this.caseCount_);
          doInput.appendField(Blockly.Msg.CONTROLS_IF_MSG_THEN);
          // Reconnect any child blocks.
          if (clauseBlock.valueConnection_) {
            ifInput.connection.connect(clauseBlock.valueConnection_);
          }
          if (clauseBlock.statementConnection_) {
            doInput.connection.connect(clauseBlock.statementConnection_);
          }
          break;
        case 'cblocks_case_default':
          this.defaultCount_++;
          var elseInput = this.appendStatementInput('DEFAULT');
          elseInput.appendField(Blockly.Msg.CONTROLS_IF_MSG_ELSE);
          // Reconnect any child blocks.
          if (clauseBlock.statementConnection_) {
            elseInput.connection.connect(clauseBlock.statementConnection_);
          }
          break;
        default:
          throw 'Unknown block type.';
      }
      clauseBlock = clauseBlock.nextConnection &&
          clauseBlock.nextConnection.targetBlock();
    }
  },
  saveConnections: function(containerBlock) {
    // Store a pointer to any connected child blocks.
    var clauseBlock = containerBlock.getInputTargetBlock('STACK');
    var x = 1;
    while (clauseBlock) {
      switch (clauseBlock.type) {
        case 'cblocks_case_case':
          var inputIf = this.getInput('CHOICE' + x);
          var inputDo = this.getInput('DO' + x);
          clauseBlock.valueConnection_ =
              inputIf && inputIf.connection.targetConnection;
          clauseBlock.statementConnection_ =
              inputDo && inputDo.connection.targetConnection;
          x++;
          break;
        case 'cblocks_case_default':
          var inputDo = this.getInput('DEFAULT');
          clauseBlock.statementConnection_ =
              inputDo && inputDo.connection.targetConnection;
          break;
        default:
          throw 'Unknown block type.';
      }
      clauseBlock = clauseBlock.nextConnection &&
          clauseBlock.nextConnection.targetBlock();
    }
  }
};

Blockly.Blocks['cblocks_case_switch'] = {
  // If condition.
  init: function() {
    this.setColour(210);
    this.appendDummyInput()
        .appendField("switch");
    this.appendStatementInput('STACK');
    this.setTooltip(Blockly.Msg.CONTROLS_IF_IF_TOOLTIP);
    this.contextMenu = false;
  }
};

Blockly.Blocks['cblocks_case_case'] = {
  // Else-If condition.
  init: function() {
    this.setColour(210);
    this.appendDummyInput()
        .appendField("case");
    this.setPreviousStatement(true);
    this.setNextStatement(true);
    this.setTooltip(Blockly.Msg.CONTROLS_IF_ELSEIF_TOOLTIP);
    this.contextMenu = false;
  }
};

Blockly.Blocks['cblocks_case_default'] = {
  // Else condition.
  init: function() {
    this.setColour(210);
    this.appendDummyInput()
        .appendField("default");
    this.setPreviousStatement(true);
    this.setTooltip(Blockly.Msg.CONTROLS_IF_ELSE_TOOLTIP);
    this.contextMenu = false;
  }
};
