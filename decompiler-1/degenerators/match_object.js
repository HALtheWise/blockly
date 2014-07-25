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
 * @fileoverview Describes a match that has been found between a piece of source and the Blockly blocks to recreate it.
 * @author eric@legoaces.org (Eric Miller)
 */


Blockly.Degenerator.Match = function( codeString ){
	this.pattern = undefined //Blockly.Degenerator.Pattern object
	this.code = codeString
	this.unmatched = codeString
	this.subExpressions = [] //list of strings or Blockly.Degenerator.Match's
	this.subStatements = []
	this.nextStatement = undefined //Blockly.Degenerator.Match
}

Blockly.Degenerator.Match.prototype.matched = function(blockType, params){
	this.block = blockType
	this.fields = params
}

Blockly.Degenerator.Match.prototype.apply = function(pattern){
	var l = pattern.pattern
	for (var i = 0; i < l.length; i++){
		var f = l[i]

		var res = f(this)
		if (!res){
			return false
		}else{
			//this = res
		}
	}
	return true
}

Blockly.Degenerator.Match.prototype.addSubExpression = function(valueName, codeString){
	this.subExpressions.push({value: valueName, code: codeString, match: undefined})
}

Blockly.Degenerator.Match.prototype.addSubStatement = function(valueName, codeString){
	this.subStatements.push({value: valueName, code: codeString, match: undefined})
}

Blockly.Degenerator.Match.prototype.getSubStatements = function(){
	results = []
	for (var i = 0; i < this.subStatements.length; i++){
		results.push(this.subStatements[i].sequence)
	}
	return results
}

Blockly.Degenerator.Match.prototype.getSubExpressions = function(){
	results = []
	for (var i = 0; i < this.subExpressions.length; i++){
		results.push(this.subExpressions[i].match)
	}
	return results
}

Blockly.Degenerator.Match.prototype.clone = function(){
	return new Blockly.Degenerator.Match(this.code)
}

Blockly.Degenerator.Match.prototype.getPriority = function(){
	var p = this.pattern.priority
	if (typeof(p) == 'function') p = p(this)
	return p
}

Blockly.Degenerator.Match.prototype.toBlock = function(){

	return this.pattern.toBlock(this);

	/*var block = Blockly.Block.obtain(Blockly.mainWorkspace, this.block)
	block.initSvg()
	block.render()

	var allkeys = Object.keys(this.fields)

	for (var i = 0; i < allkeys.length; i++){
		block.setFieldValue(this.fields[allkeys[i]], allkeys[i])
	}

	for (var i = 0; i < this.subExpressions.length; i++){ //recurse expressions
		var exp = this.subExpressions[i]

		var newBlock = exp.match.toBlock() 		//recurse statements

		block.getInput(exp.value).connection.connect(newBlock.outputConnection)
		// newBlock.outputConnection.connect(block.getInput(exp.value).connection)
		// newBlock.setParent(block)
	}

	for (var i = 0; i < this.subStatements.length; i++){ //recurse statements
		var exp = this.subStatements[i]

		var newBlock = exp.sequence.toBlock() 		//recurse statements

		block.getInput(exp.value).connection.connect(newBlock.previousConnection)
		// newBlock.outputConnection.connect(block.getInput(exp.value).connection)
		// newBlock.setParent(block)
	}

	return block*/
}
