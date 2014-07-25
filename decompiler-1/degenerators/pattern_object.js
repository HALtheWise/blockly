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

Blockly.Degenerator.Pattern = function(pattern, block, fields, priority){
	if (typeof(priority) == 'undefined') priority = 1
	this.pattern = pattern; //[];
	this.block = block; //'';
	this.fields = fields; //new Object();
	this.priority = priority;
	this.mutation = undefined;
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

Blockly.Degenerator.Pattern.expressionMatch = function(degenerator, nextToken, fieldName, match) { //match internal expression
	var t = Blockly.Degenerator.Pattern.untilStringMatch(degenerator, nextToken, match);
	if (!t) return t
	match = t[0]
	match.addSubExpression(fieldName, t[1])
	return match
}

Blockly.Degenerator.Pattern.statementMatch = function(degenerator, nextToken, fieldName, match) { //match internal expression
	var t = Blockly.Degenerator.Pattern.untilStringMatch(degenerator, nextToken, match);
	if (!t) return t
	match = t[0]
	match.addSubStatement(fieldName, t[1])
	return match
}

Blockly.Degenerator.Pattern.whitespaceMatch = function(match){
	match.unmatched = match.unmatched.trimLeft();
	return match;
}

Blockly.Degenerator.Pattern.stringMatch = function(pat, match){
	var s = match.unmatched;
	if (s.slice(0, pat.length) != pat){
		return false;
	}
	match.unmatched = s.slice(pat.length);
	return match;
}

Blockly.Degenerator.Pattern.untilStringMatch = function(degenerator, pat, match){
	var s = match.unmatched;

	if (s.indexOf(pat) == -1){ //pat does not exist in string. No guaruntee, but increases efficiency.
		return false;
	}

	var d = degenerator.lenToMatch(s, pat)
	if (d < 0) return false //The next token does not exist in the remaining string

	match.unmatched = s.slice(d);
	var innerString = s.slice(0,d);

	return [match, innerString];
}

Blockly.Degenerator.Pattern.statementEndMatch = function(match){
	var s = match.unmatched;

	var lineEndMatch = s.match(/[^\n\S]*(?:;\s*|\n\s*|$)/)
	if (lineEndMatch){ //At end of line (give or take whitespace)
		match.unmatched = s.slice(lineEndMatch.length);
		return match;
	}

	return false;
}

Blockly.Degenerator.Pattern.endMatch = function(match){
	match = Blockly.Degenerator.Pattern.whitespaceMatch(match);

	if (match.unmatched.length > 0) return false; //We aren't at the end.
	return match;
}
