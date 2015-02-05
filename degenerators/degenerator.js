/**
 * @license
 * Visual Blocks Editor
 *
 * Copyright 2012 Google Inc.
 * https://developers.google.com/blockly/
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
 * @fileoverview Utility functions for generating Blockly blocks from code.
 * @author eric@legoaces.org (Eric Miller)
 */
'use strict';

goog.provide('Blockly.Degenerator');

goog.require('Blockly.Block');


/**
 * Class for a code degenerator that translates the blocks from a language.
 * @param {string} name Language name of this degenerator.
 * @param {Blockly.Generator} The corresponding generator.
 * @param {function} A function like esprima.parse(code).
 * @constructor
 */
Blockly.Degenerator = function(name, generator, parser) {
	this.name_ = name;
	this.generator = generator;
	this.parser_ = parser;
};

Blockly.Degenerator.isValuePattern = function(s){
	if (typeof(s) != 'string') return false;
	return Boolean(s.match(/\|block:[0-9]*~~input:[^~\|]*~~order:[0-9]*\|/g))
}

Blockly.Degenerator.isExpresisonPattern = function(s){
	if (typeof(s) != 'string') return false;
	return Boolean(s.match(/\|block:[0-9]*~~input:[^\|~]*\|/g))
}

Blockly.Degenerator.prototype.makePattern = function(blockType, fields, mutation){
	// Override
	var oldV2C = Blockly.JavaScript.valueToCode
	var oldS2C = Blockly.JavaScript.statementToCode
	Blockly.JavaScript.valueToCode = function(block, input, order) {
		return '"|block:'+String(block.id)+
			'~~input:'+String(input)+'~~order:'+String(order)+'|"'}
	Blockly.JavaScript.statementToCode = function(block, input) {
		return '"|block:'+String(block.id)+
			'~~input:'+String(input)+'|";'}

	var block = Blockly.Block.obtain(Blockly.mainWorkspace, blockType)

	if (mutation){
		Blockly.Degenerator.applyMutation(block, mutation)
	}

	var allkeys = Object.keys(fields)
	for (var i = 0; i < allkeys.length; i++){
		var key = allkeys[i]
		block.setFieldValue(fields[key], key)
	}

	var isValue = false

	var code = this.generator.blockToCode(block)
	if (typeof(code) != 'string'){ //The block we parsed is an Value, not a Statement
		code = code[0]
		isValue = true
	}
	block.dispose()

	Blockly.JavaScript.valueToCode = oldV2C
	Blockly.JavaScript.statementToCode = oldS2C

	var ast = this.parser_(code);

	return new Blockly.Degenerator.Pattern(ast.body[0], blockType, fields, mutation) //At some point, this should probably retain the entire list to accomodate multi-statement blocks.
}

Blockly.Degenerator.applyMutation = function(block, string){
	var parser = new DOMParser()
	var dom = parser.parseFromString(string, 'text/xml')
	if (!dom || !dom.firstChild ||
		dom.firstChild.nodeName.toLowerCase() != 'mutation'){
		console.error('Parsing mutation string "%s" failed: returned %o', string, dom)
		ga('send', 'exception', {
			'exDescription': 'MutationParseError',
			'exString': string,
			'exFatal': false})
		return
	}
	block.domToMutation(dom.firstChild)
}
