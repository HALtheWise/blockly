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
 * @fileoverview Utility functions for generating executable code from
 * Blockly code.
 * @author eric@legoaces.org (Eric Miller)
 */
'use strict';

goog.provide('Blockly.Degenerator');

goog.require('Blockly.Block');


/**
 * Class for a code degenerator that translates the language into blocks.
 * @param {string} name Language name of this degenerator.
 * @param {Blockly.Generator} generator Corresponding generator
 * @constructor
 */

Blockly.Degenerator = function(name, generator) {
	this.name_ = name;
	this.ePatterns = [];
	this.sPatterns = [];
	this.RESERVED_WORDS_ = '';
	this.generator = generator
};

/**
 * Category to separate generated function names from variables and procedures.
 */
Blockly.Degenerator.NAME_TYPE = 'generated_function';

Blockly.Degenerator.prototype.apply = function(string, pattern){
	var m=new Blockly.Degenerator.Match(string)
	var pat = pattern.pattern
	for (var i = 0; i < pat.length; i++){
		var result = pat[i](m)
		if (!result){
			return false
		}
		m = result
	}
	m.pattern = pattern
	return m
}

Blockly.Degenerator.prototype.applyAll = function(string, patterns, noRecurse, noExtend){
	string = this.pstrip(string)

	var matches = []
	for (var i = 0; i < patterns.length; i++){
		var result = this.apply(string, patterns[i])
		if (result){
			matches.push(result)
		}
	}
	if (matches.length == 0) return false

	matches.sort(function(a,b){return a.getPriority() - b.getPriority()}) //sorts in ascending order by priority

	var match = matches[matches.length-1] //Highest priority match is returned

	if (!noRecurse){ //Handle subStatements and subexpressions
		var subExprs = match.subExpressions
		for (var i = 0; i < subExprs.length; i++){
			var xpr = subExprs[i]
			var result = this.applyAll(xpr.code, this.ePatterns, noRecurse, noExtend)
			if (result){
				xpr.match = result
			}
		}
		var subStmt = match.subStatements
		for (var i = 0; i < subStmt.length; i++){
			var stmt = subStmt[i]
			var result = this.applyAll(stmt.code, this.sPatterns, noRecurse, noExtend)
			if (result){
				stmt.match = result
			}
		}
	}

	if (!noExtend && match.unmatched.trimLeft().length > 0){ //Handle successor statements
		var result = this.applyAll(match.unmatched.trimLeft(), patterns, noRecurse, noExtend)
		if (result){
			match.nextStatement = result
		}
	}

	return match
}

Blockly.Degenerator.prototype.tokenizeNew = function(s, lang){ //scans backward
	var canidates = [
		{pattern:/;\n*/g, //End of line + optional semicolon
		 f: function(s, match, list){list.push(Blockly.Degenerator.Pattern.statementEndMatch); return list}},

		{pattern:/^/g, //Beginning of line
		 f: function(s, match, list){
			 list.push(
				 function(match){return Blockly.Degenerator.Pattern.stringMatch(s, match)});}},

		{pattern:/\|block:[0-9]*~~input:[^~\|]*~~order:[0-9]*\|/g, //Expression input
		 f: function(s, match, list){
			 var index = s.lastIndexOf(match)
			 var pat   = s.slice(index + match.length).trim()
			 var fieldName = match.match(/input:[^~]*/)[0].split(':')[1]
			 list.push(
				 function(match){return Blockly.Degenerator.Pattern.stringMatch(pat, match)});
			 list.push(Blockly.Degenerator.Pattern.whitespaceMatch)
			 list.push(
				 function(match){return Blockly.Degenerator.Pattern.expressionMatch(lang, pat, fieldName, match)});
			 list.push(Blockly.Degenerator.Pattern.whitespaceMatch)}},

		{pattern:/\|block:[0-9]*~~input:[^\|~]*\|/g, //Statement input
		 f: function(s, match, list){
			 var index = s.lastIndexOf(match)
			 var pat   = s.slice(index + match.length).trim()
			 var fieldName = match.match(/input:[^\|]*/)[0].split(':')[1]
			 list.push(
				 function(match){return Blockly.Degenerator.Pattern.stringMatch(pat, match)});
			 list.push(Blockly.Degenerator.Pattern.whitespaceMatch)
			 list.push(
				 function(match){return Blockly.Degenerator.Pattern.statementMatch(lang, pat, fieldName, match)});
			 list.push(Blockly.Degenerator.Pattern.whitespaceMatch)}}
	]

	var matches = []

	for (var i = 0; i < canidates.length; i++){
		var can = canidates[i]
		var pat = new RegExp(can.pattern)
		var fail=0
		while (true){
			fail++
			var match = pat.exec(s)
			if (!match) break;
			matches.push({index: match.index, match: match[0], func: can.f})
			if (match[0].length == 0) break;
			if (fail>100){console.log('fail',fail); break;}
		}
	}

	matches.sort(function(a,b){return (b.index+b.match.length) - (a.index+a.match.length)}) //Sort in reverse order by index

	var str = s
	var allpats = [] //Initially built backwards


	for (var i = 0; i < matches.length; i++){
		var mat = matches[i]
		mat.func(str, mat.match, allpats)
		str = str.slice(0, mat.index)
	}
	allpats.reverse()
	return allpats
}

/**
 * Generate code for all blocks in the workspace in the specified language.
 * @return {string} Generated code.
 */
//Blockly.Degenerator.prototype.codeToWorkspace = function(code) {
//};

Blockly.Degenerator.prototype.statementMatch = function(patterns, ePatterns, sequence){
	if (typeof(sequence) == 'string') sequence = new Blockly.Degenerator.Sequence(sequence)


	while (sequence.unmatched.length>0){
		sequence.unmatched = sequence.unmatched.trim()

		var results = []
		for (var i = 0; i < patterns.length; i++){
			if (typeof(patterns[i]) == 'function'){
				var ret = patterns[i](sequence.getMatch()) //semi-deep copy
				if (!ret) continue
				results.push(ret)
					}else{
						var pat = patterns[i].pattern
						var match = sequence.getMatch(); //semi-deep copy

						match = this.patternMatch(pat, match, false)
						if (!match) continue
						console.log("Match returned from patternMatch: %o", match)
						match.matched(patterns[i].block, patterns[i].args)

						results.push(match)
					}
		}
		if (results.length == 0){ console.log("No matches found for Sequence: %o", sequence); return 'fail, no matches'}

		var max = results[0]
		for (var i = 0; i < results.length; i++){
			var res = results[i]
			if (res.code.length > max.code.length){ //Take the longest potential match
				max=res
			}
		}
		console.log("Sequence %o: longest match: %o", sequence, max)

		sequence.matched(max)

		var ses = match.getSubExpressions()
		for (var i = 0; i < ses.length; i++){ //Recurse expressions
			var ter = ses[i]
			ter = this.expressionMatch(ePatterns, ter)
		}
	}
	return results, sequence

}

// The following are some helpful functions which can be used by multiple
// languages.

/**
 * Prepend a common prefix onto each line of code.
 * @param {string} text The lines of code.
 * @param {string} prefix The common prefix.
 * @return {string} The prefixed lines of code.
 */
Blockly.Degenerator.prototype.prefixLines = function(text, prefix) {
	return prefix + text.replace(/\n(.)/g, '\n' + prefix + '$1');
};

Blockly.Degenerator.prototype.expressionMatch = function(patterns, match){
	if (typeof(match) == 'string') match = new Blockly.Degenerator.Match(match)

	match.code = this.pstrip(match.code)

	var results = []
	for (var i = 0; i < patterns.length; i++){
		if (typeof(patterns[i]) == 'function'){
			var ret = patterns[i](match.clone()) //semi-deep copy
			if (!ret) continue
			results.push(ret)
				}else{
					var pat = patterns[i].pattern
					var match1 = match.clone(); //semi-deep copy
					match1 = this.patternMatch(pat[0], match1)
					if (!match1) continue
					console.log(match1)
					match1.bind = pat[1]
					match1.matched(patterns[i].block, patterns[i].args)

					results.push(match1)
				}
	}
	if (results.length == 0) return 'fail, no matches'

	var max = results[0]
	for (var i = 0; i < results.length; i++){
		var res = results[i]
		if (res.bind > max.bind){
			max=res
		}
	}
	console.log(max)

	match.bind = max.bind
	match.block = max.block
	match.fields = max.fields
	match.subExpressions = max.subExpressions

	var ses = match.getSubExpressions()
	for (var i = 0; i < ses.length; i++){ //Recurse
		var ter = ses[i]
		ter = this.expressionMatch(patterns, ter)
	}

	return results, match
}

Blockly.Degenerator.prototype.pstrip = function(s){
	s = s.trim()
	if (s[0] == '(' && this.lenToMatch(s.slice(1), ')') == s.length-2){
		//Thing begins and ends with parenthesis
		s = s.slice(1, s.length-1)
		s = s.trim()
	}
	return s
}

Blockly.Degenerator.prototype.patternMatch = function(pattern, match, requireEnd){
	if (typeof(pattern) == 'function') return pattern(match)
	if (typeof(requireEnd) == 'undefined') requireEnd = true

	var tokens = this.tokenize(pattern)
	if (tokens.length % 2 != 1) throw Error()
	var j = 0

	// console.log(tokens)

	var subExpressions = []

	for (var i = 0; i < tokens.length; i += 2){
		var t = tokens[i] //should always be string

		if (i==0){ //This is the first token.
			if (match.code.indexOf(t) != 0) return false //String does not start with first token!
			j += t.length
		}
		if (i>0){
			var p = tokens[i-1] //previous token. Should be object.
			var valueInput = p.k.split(':')[2].split('~')[0]

			p.start = j
			//console.log(string.slice(j))
			var d = this.lenToMatch(match.code.slice(j), t)
			if (d < 0) return false //The next token did not exist in the remaining string
			j += d
			p.end = j
			p.string = match.code.slice(p.start, p.end)

			subExpressions.push({valueInput: valueInput, code: p.string})

			j += t.length
		}
		if (i == tokens.length - 1){ //Last token
			if (requireEnd){
				if (j != match.code.length){ //Last token not at end of string
					return false
				}
			}else{
				match.code = match.code.slice(0,j)
			}
		}

	}
	console.log(subExpressions)

	for (var i = 0; i < subExpressions.length; i++){ //Copy the subexpressions into the origional match object.
		var se = subExpressions[i]
		match.addSubExpression(se.valueInput, se.code)
	}

	return match;
}

Blockly.Degenerator.prototype.tokenize = function(pattern){
	var tokens = []

	while (true){
		var r = pattern.match(/\|block:[0-9]*~~input:[^~]*~~order:[0-9]*\|/)
		if (!r || r.length == 0 || r[0].length == 0){
			tokens.push(pattern)
			break
		}
		r = r[0]
		var i = pattern.indexOf(r)
		tokens.push(pattern.slice(0,i))
		tokens.push({k:r})
		pattern = pattern.slice(i+r.length)
	}
	return tokens
}

Blockly.Degenerator.prototype.lenToMatch = function(s, end) {
	if (end.length == 0) return s.length
	var inQuote = ''
	var inParens = []
	var i=0
	var quotes = '\'"' // " , '
	var parens = {'(':')','{':'}','[':']'}
	while (i < s.length){
		var c = s[i]
		if (inQuote){
			if (c == '\\'){ //single backslash
				i++ //Skip the next character
			}
			if (c == inQuote){
				inQuote = '' //Exit quote
			}
		}else if (inParens.length > 0){
			var p = parens[inParens[inParens.length-1]]
			if (c == p){
				inParens.pop()
			}
		}else{
			var done = s.slice(i).indexOf(end) == 0
			if (done) return i
			if (quotes.indexOf(c) >= 0){
				inQuote = c
			}
			if (c in parens){
				inParens.push(c)
			}
		}
		i++
	}
	return -1; //Thing not found
}

Blockly.Degenerator.prototype.iterNoParens = function(s, callback, nullParens) {
	if (typeof(nullParens) == 'undefined') nullParens = true
	var inQuote = ''
	var inParens = []
	var i=0
	var quotes = '\'"' // " , '
	var openers = '({['
	var closers = {'(':')','{':'}','[':']'}
	while (i < s.length){
		var c = s[i]
		if (inQuote){
			if (c == '\\'){
				i++ //Skip the next character
			}
			if (c == inQuote){
				var end = callback(i)
				if (end) return end
				inQuote = '' //Exit quote
			}
		}else if (inParens.length > 0){
			var p = closers[inParens[inParens.length-1]]
			if (c == p){
				var end = callback(i)
				if (end) return end
				inParens.pop()
			}else if (!nullParens){
				var end = callback(i)
				if (end) return end
					}
		}else{
			var end = callback(i)
			if (end) return end
			if (quotes.indexOf(c) >= 0){
				inQuote = c
			}
			if (openers.indexOf(c) >= 0){
				inParens.push(c)
			}
		}
		i++
	}
}

function testInput(blockType, test, mutation){
	// console.log(test)
	var oldV2C = Blockly.JavaScript.valueToCode
	var oldS2C = Blockly.JavaScript.statementToCode
	Blockly.JavaScript.valueToCode = function(block, input, order) {
		return '|block:'+String(block.id)+
			'~~input:'+String(input)+'~~order:'+String(order)+'|'}
	Blockly.JavaScript.statementToCode = function(block, input) {
		return '|block:'+String(block.id)+
			'~~input:'+String(input)+'|'}

	var block = Blockly.Block.obtain(Blockly.mainWorkspace, blockType)
	
	if (mutation){
		Blockly.Degenerator.applyMutation(block, mutation)
	}
	
	var allkeys = Object.keys(test)
	var testClone = {}
	for (var i = 0; i < allkeys.length; i++){
		var key = allkeys[i]
		testClone[key] = test[key]
		block.setFieldValue(test[key], key)
	}

	var priority = undefined
	var isExpression = false

	var result = Blockly.JavaScript.blockToCode(block)
	if (typeof(result) != 'string'){ //The block we parsed is an Expression, not a Statement
		priority = result[1]
		result = result[0]
		isExpression = true
	}
	block.dispose()
	Blockly.JavaScript.valueToCode = oldV2C
	Blockly.JavaScript.statementToCode = oldS2C

	var tokens = Blockly.Degenerate.JavaScript.tokenizeNew(result, Blockly.Degenerate.JavaScript)
	if (isExpression) tokens.push(Blockly.Degenerator.Pattern.endMatch)

	return new Blockly.Degenerator.Pattern(tokens, blockType, testClone, priority)
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

function testAllInputs(blockType, tests){ //recursive when lists exist
	if (typeof(tests) == 'undefined') tests = {}
	var allKeys = Object.keys(tests)
	var foundList = false
	for (var i = 0; i < allKeys.length; i++){
		var k = allKeys[i]
		var v = tests[k]
		if (typeof(v) == 'object'){
			foundList = true
			var results = []
			var origional = v
			for (var j = 0; j < v.length; j++){
				tests[k] = v[j]
				results = results.concat(testAllInputs(blockType, tests))
			}
			tests[k] = v
			return results
		}
	}
	if (!foundList){
		return [testInput(blockType, tests)]
	}
}
