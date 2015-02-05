/**
 * @license
 * Visual Blocks Editor
 *
 * Copyright 2012 Google Inc.
 * https://blockly.googlecode.com/
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
 * @fileoverview Defines a template that has a .match method to translate generated code into Blockly blocks.
 * @author eric@legoaces.org (Eric Miller)
 */

//Blockly.Degenerator.Pattern.symbols = new Set('()[]{}+-/*|&')

Blockly.Degenerator.Pattern = function(pattern, block, fields, mutation){
	this.pattern = pattern; //ast
	this.block = block; //'';
	this.fields = fields; //new Object();
	this.mutation = mutation;
}

Blockly.Degenerator.Pattern.prototype.toBlock = function(match){

	var block = Blockly.Block.obtain(Blockly.mainWorkspace, this.block)
	if (this.mutation) Blockly.Degenerator.applyMutation(block, this.mutation)
	block.initSvg()
	block.render()

	var fields = this.fields
	if (typeof(fields) == 'function') fields = fields(match)

	var allkeys = Object.keys(fields)

	for (var i = 0; i < allkeys.length; i++){
		var value = this.fields[allkeys[i]]
		if (typeof(value) == 'function') value = value(match)

		block.setFieldValue(value, allkeys[i])
	}

	for (var i = 0; i < match.subExpressions.length; i++){ //recurse expressions
		var exp = match.subExpressions[i]

		if(!exp.match) continue;
		var newBlock = exp.match.toBlock()

		block.getInput(exp.value).connection.connect(newBlock.outputConnection)
	}

	for (var i = 0; i < match.subStatements.length; i++){ //recurse subStatements
		var stmt = match.subStatements[i]
		if (!stmt.match) continue;
		var newBlock = stmt.match.toBlock()

		block.getInput(stmt.value).connection.connect(newBlock.previousConnection)
	}

	if (match.nextStatement){//Connect to successor
		var newBlock = match.nextStatement.toBlock()
		if(newBlock) block.nextConnection.connect(newBlock.previousConnection)
			}

	return block
}


Blockly.Degenerator.Pattern.prototype.fitTo = function(canidate){
	return Blockly.Degenerator.matchAST(this.pattern, canidate);
}

Blockly.Degenerator.matchAST = function(pattern, canidate){
	if (pattern == canidate){
		return new Blockly.Degenerator.Match(this);
	}

	if (typeof(pattern)=="function"){
		var result = pattern(canidate);
		if (!result){return false;}
		return result;
	}

	if (typeof(pattern)!='object' || typeof(canidate)!='object'){
		return false;
	}

	if (pattern.type == "Literal" && Blockly.Degenerator.isValuePattern(pattern.value))
	{ //Discovered a value placeholder
		var m =  new Blockly.Degenerator.Match(this);
		m.addSubExpression(pattern.value, canidate)
		return m
	}

	if (pattern.type == "ExpressionStatement" && pattern.expression.type == "Literal"
		&& Blockly.Degenerator.isExpresisonPattern(pattern.expression.value))
	{ //Discovered an expression placeholder
		var m =  new Blockly.Degenerator.Match(this);
		m.addSubExpression(pattern.expression.value, canidate)
		return m
	}

	var match = new Blockly.Degenerator.Match(this);
	for (var key in pattern){
		if (!(key in pattern) || !(key in canidate)) {
			return false;
		}

		var submatch = Blockly.Degenerator.matchAST(pattern[key], canidate[key]);

		if (!submatch){
			return false;
		}else{
			match.merge(submatch);
		}
	}
	return match;
}
