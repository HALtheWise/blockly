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
 * @fileoverview Constant blocks for Blockly
 * @author fraser@google.com (Neil Fraser), eric@legoaces.org (Eric Miller)
 */
'use strict';

goog.provide('Blockly.Blocks.CBlocks.Constants');

goog.require('Blockly.Blocks');

Blockly.Blocks['cblocks_constants_get'] = {
	// Variable getter.
	init: function() {
		this.setHelpUrl(Blockly.Msg.VARIABLES_GET_HELPURL);
		this.setColour(330);
		this.appendDummyInput()
				.appendField('get constant')
				.appendField(new Blockly.FieldDropdown(this.getDropdown), 'VAR');
		this.setOutput(true);
		this.setTooltip('Get a #defined constant');
		this.contextMenuType_ = 'variables_set';
	},
	getDropdown: function(){
		var constList = Blockly.RobotC.getConstantNames();
		var result = [['','']];
		for (var x in constList){
			result.push([constList[x], constList[x]]);
		}
		return result;
	},
	/**
	 * Nothing calls this function.
	 * TODO: Add better support for renaming functions
	 */
	renameConst: function(oldName, newName) {
		if (Blockly.Names.equals(oldName, this.getFieldValue('VAR'))) {
			this.setFieldValue(newName, 'VAR');
		}
	}
};

Blockly.Blocks['cblocks_constants_declare'] = {
	init: function() {
		// Global #define declaration
		this.setColour(330);
		this.appendDummyInput()
				.appendField('constant ')
				.appendField(new Blockly.FieldTextInput('MY_CONSTANT', this.validator), 'NAME')
				.appendField('=');
		this.appendValueInput('VALUE');
		this.setInputsInline(true);
		this.setTooltip('#define a constant.\nBe careful renaming an already-existing constant.');
		Blockly.RobotC.discoverConstants();
	},
	getConstants: function() {
		//Has different name from getVars so the variable will not be double counted
		return [[this.getFieldValue('NAME'), this]];
	},
	validator: function(newVar) {
		// Merge runs of whitespace.  Strip leading and trailing whitespace.
		// Beyond this, all names are legal.
		newVar = newVar.split(' ').join('_').toUpperCase();
		setTimeout(Blockly.RobotC.discoverConstants,0);
		return newVar || null;
	}
};

Blockly.RobotC.discoverConstants = function(opt_block) {
	var blocks;
	if (opt_block) {
	  blocks = opt_block.getDescendants();
	} else {
	  blocks = Blockly.mainWorkspace.getAllBlocks();
	}
	
	Blockly.RobotC.constants = Object.create(null);
	// Iterate through every block and add each variable to the hash.
	for (var x = 0; x < blocks.length; x++) {
	  var func = blocks[x].getConstants;
	  if (func) {
	    var blockConstants = func.call(blocks[x]);
	    for (var y = 0; y < blockConstants.length; y++) {
	      var varName = blockConstants[y];
	      // Variable name may be null if the block is only half-built.
	      if (varName) {
	        Blockly.RobotC.constants[varName[0]] = varName[1];
	      }
	    }
	  }
	}
	
	return Blockly.RobotC.constants;
};

Blockly.RobotC.getConstantNames = function() {
	  var constantList = [];
	  for (var name in Blockly.RobotC.constants) {
	    constantList.push(name);
	  }
	  return constantList;
};

//Blockly.Blocks['variables_globalvars'] = {
//	// Container for global variables.
//	init: function() {
//		this.setHelpUrl(Blockly.Msg.PROCEDURES_DEFNORETURN_HELPURL);
//		this.setColour(290);
//		var name = Blockly.Procedures.findLegalName(
//				Blockly.Msg.PROCEDURES_DEFNORETURN_PROCEDURE, this);
//		this.appendDummyInput()
//				.appendField('global variables');
//		this.appendStatementInput('STACK');
//		this.setTooltip('Declare global variables inside this block.');
//		this.arguments_ = [];
//		//The function block on a page cannot be deleted
//		this.setDeletable(false);
//	},
//	getVars: function() {
//		var children = this.getDescendants();
//		var len = children.length;
//		var globals = [];
//		if(len) {
//			for(var i = 0; i < len; i++) {
//				if (children[i].getGlobals !== void 0) {
//					globals.push(children[i].getGlobals());
//				}
//			}
//		}
//		Blockly.zr_cpp.C_GLOBAL_VARS = globals;
//		return [{name: null}];
//	},
//	callType_: 'procedures_callnoreturn'
//};
