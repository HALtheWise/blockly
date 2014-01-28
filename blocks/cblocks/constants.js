/**
 * Visual Blocks Editor
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
 * @fileoverview Variable and list blocks for Blockly. Modified for ZR C++ API.
 * @author fraser@google.com (Neil Fraser), dininno@mit.edu (Ethan DiNinno)
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
				.appendField(Blockly.Msg.VARIABLES_GET_TITLE)
				.appendField(new Blockly.FieldVariable(' ', null, false), 'VAR')
				.appendField(Blockly.Msg.VARIABLES_GET_TAIL);
		this.setOutput(true);
		this.setTooltip(Blockly.Msg.VARIABLES_GET_TOOLTIP);
		this.contextMenuMsg_ = Blockly.Msg.VARIABLES_GET_CREATE_SET;
		this.contextMenuType_ = 'variables_set';
	},
	renameVar: function(oldName, newName) {
		if (Blockly.Names.equals(oldName, this.getFieldValue('VAR'))) {
			this.setFieldValue(newName, 'VAR');
		}
	},
	customContextMenu: function(options) {
		var option = {enabled: true};
		var name = this.getFieldValue('VAR');
		option.text = this.contextMenuMsg_.replace('%1', name);
		var xmlField = goog.dom.createDom('field', null, name);
		xmlField.setAttribute('name', 'VAR');
		var xmlBlock = goog.dom.createDom('block', null, xmlField);
		xmlBlock.setAttribute('type', this.contextMenuType_);
		option.callback = Blockly.ContextMenu.callbackFactory(this, xmlBlock);
		options.push(option);
	}
};

Blockly.Blocks['cblocks_constants_declare'] = {
	init: function() {
		// Global #define declaration
		if (typeof(Blockly.RobotC.constants) == 'undefined'){
			Blockly.RobotC.constants = [];
		}
		this.setColour(330);
		this.appendDummyInput()
				.appendField('type:')
				.appendField(new Blockly.FieldDropdown(Blockly.zr_cpp.C_VARIABLE_TYPES), 'TYPE')
				.appendField('name:')
				.appendField(new Blockly.FieldTextInput('myVariable', this.validator), 'NAME')
				.appendField('initial value:');
		this.appendValueInput('VALUE');
		this.setInputsInline(true);
		this.setPreviousStatement(true);
		this.setNextStatement(true);
		this.setTooltip('');
	},
	getConstant: function() {
		//Has different name from getVars so the variable will not be double counted
		return {
			type: this.getFieldValue('TYPE'),
			name: this.getFieldValue('NAME'),
			isArray: 'FALSE',
		};
	},
	validator: function(newVar) {
		// Merge runs of whitespace.  Strip leading and trailing whitespace.
		// Beyond this, all names are legal.
		newVar = newVar.replace(/[\s\xa0]+/g, ' ').replace(/ */g, '_');
		return newVar || null;
	}
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
