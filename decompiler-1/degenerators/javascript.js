/**
 * @license
 * Visual Blocks Language
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
 * @fileoverview Helper functions for generating JavaScript for blocks.
 * @author eric@legoaces.org (Eric Miller)
 */
'use strict';

goog.provide('Blockly.Degenerate.JavaScript');

goog.require('Blockly.Generator');

Blockly.Degenerate.JavaScript = new Blockly.Degenerator('JavaScript', Blockly.JavaScript);

Blockly.Degenerate.JavaScript.setup = function(){
	var pats = Blockly.Degenerate.JavaScript.ePatterns

	pats = this.setupMath(pats)
	pats = this.setupLogic(pats)
	pats = this.setupStrings(pats)

	Blockly.Degenerate.JavaScript.ePatterns = pats

	pats = Blockly.Degenerate.JavaScript.sPatterns

	pats = pats.concat(testAllInputs('text_print'))
	pats = this.setupControls(pats)

	Blockly.Degenerate.JavaScript.sPatterns = pats
}


Blockly.Degenerate.JavaScript.setupMath = function(pats){
	pats = pats.concat(testAllInputs("math_arithmetic",{OP: 'ADD MINUS MULTIPLY DIVIDE POWER'.split(' ')}))
	pats = pats.concat(testAllInputs("math_single",{OP: 'ROOT ABS NEG LN LOG10 EXP POW10'.split(' ')}))
	pats = pats.concat(testAllInputs("math_constant",{CONSTANT: 'PI E GOLDEN_RATIO SQRT2 SQRT1_2 INFINITY'.split(' ')}))
	pats = pats.concat(testAllInputs("math_number_property",{PROPERTY: 'EVEN ODD WHOLE POSITIVE NEGATIVE DIVISIBLE_BY'.split(' ')})) //NOTE: PRIME is not in this list yet
	pats = pats.concat(testAllInputs("math_round",{OP: 'ROUND ROUNDUP ROUNDDOWN'.split(' ')}))
	pats = pats.concat(testAllInputs("math_modulo"))
	pats = pats.concat(testAllInputs("math_constrain"))
	//pats = pats.concat(testAllInputs("math_random_int")) //NOTE: does not fully work yet.
	pats = pats.concat(testAllInputs("math_random_float"))

	var isNum = function(match){
		var x = parseFloat(match.unmatched)
    var isNum = String(x) == match.unmatched || String(x) == '0'+match.unmatched
    if (!isNum) return false
    match.unmatched = ''
    return match
  }

  var numPat = new Blockly.Degenerator.Pattern([isNum], 'math_number', {NUM: function(match){return match.code}})

	pats.push(numPat)
	return pats
}

Blockly.Degenerate.JavaScript.setupControls = function(pats){
	pats = pats.concat(testAllInputs("controls_whileUntil",{MODE: 'WHILE UNTIL'.split(' ')}))
	pats = pats.concat(testAllInputs("controls_flow_statements",{FLOW: 'BREAK CONTINUE'.split(' ')}))
	for (var ifelse = 0; ifelse <= 5; ifelse++){ //controls_if
		var mutation = '<mutation elseif="' + String(ifelse) + '"></mutation>'
		console.log(mutation)
		pats.push(testInput('controls_if', {}, mutation)) //No else block
		//pats.push(testInput(testInput('controls_if', {}, 
		//	'<mutation elseif="' + String(ifelse) + '" else="1"></mutation>')))//Else block
	}
	return pats
}

Blockly.Degenerate.JavaScript.setupLogic = function(pats){
	pats = pats.concat(testAllInputs("logic_compare",{OP: 'EQ NEQ LT LTE GT GTE'.split(' ')}))
	pats = pats.concat(testAllInputs("logic_operation",{OP: 'AND OR'.split(' ')}))
	pats = pats.concat(testAllInputs("logic_null"))
	pats = pats.concat(testAllInputs("logic_negate"))
	pats = pats.concat(testAllInputs("logic_ternary"))
	pats = pats.concat(testAllInputs("logic_boolean",{BOOL: 'TRUE FALSE'.split(' ')}))
	return pats
}

Blockly.Degenerate.JavaScript.setupStrings = function(pats){

	var isStr = function(match){
		var s = match.code.trim()
		var doublematch = s.match(/^"(?:[^"\\]|\\.)*"$/) //fancy regex from http://stackoverflow.com/a/249937/2507591
		var singlematch = s.match(/^'(?:[^'\\]|\\.)*'$/) //fancy regex from http://stackoverflow.com/a/249937/2507591

    if (doublematch || singlematch) {
      match.unmatched = ''
      return match
    }
    return false
	}

  var getStr = function(match){
    var t = match.code.trim()
    return t.slice(1, t.length-1).replace(/\\./g, function(x){return x.slice(1)})
  }

	pats.push(new Blockly.Degenerator.Pattern([isStr], 'text', {TEXT: getStr}))

	return pats
}
