/**
 * This file contains code to generate blocks that consist of simple API calls.
 * It also has a parseC function that takes a line of C code like:
 * 'void noReturnFunction(){ //This function does stuff'
 * 		and returns a simpleblock format object.
 * 
 * @author eric@legoaces.org (Eric Miller)
 */

/*simpleBlock = {
		name:"blockly_name",
		display_name:"do stuff", //defaults to name
		args:[["Human Input Name", "Number"],["Human Input Name2", ["Number", "Boolean"]]],
		connections: "Both", //defaults to "both" unless returns defined
		returns: 'Number',
		tooltip: 'Description of function',
		hue: 180,
		template: 'setMotor(~0);\n'
};*/

/*data = [
        'void noReturnFunction(){ //Tooltip for the function.',
        'float returnsNumber(int arg1, int arg2)  //Another tooltip.'
        ];*/

typeMap = {
		'float' : 'Number',
		'int' 	: 'Number',
		'long' 	: 'Number',
		'bool' 	: 'Boolean',
		'motor'	: 'Motor',
		'void'	: null
};


Blockly.RobotC.parseC = function(colour, inputString){
	console.log('hi');
	if(!inputString || inputString.indexOf('(') < 0 || inputString.indexOf(')') < 0){
		return null;
	}
	var block = {hue:colour};
	
	var firstPart = inputString.split('(')[0].split(' ');
	
	block.name = firstPart.pop();
	
	var returnType = typeMap[firstPart.pop()];
	
	if (returnType == null){
		block.connections = 'Both';
	} else {
		block.returns = returnType;
	}
	
	var argsTemplate = [];
	
	var args = ((inputString.split('(')[1]).split(')')[0]).split(/[ ]*,[ ]*/);
	if (args[0] != ""){
		var finalArgs = [];
		for (var x = 0; x < args.length; x++){
			var temp = args[x].split(' ');
			var argName = temp.pop();
			var type = typeMap[temp.pop()];
			finalArgs.push([argName, type]);
			argsTemplate.push('~'+x);
		}
		block.args = finalArgs;
	} else {
		block.args = [];
	}
	
	if (inputString.indexOf('//') >= 0){
		block.tooltip = inputString.split('//').pop();
	} else {
		block.tooltip = 'This block does not have a tooltip';
	}
	
	block.template = block.name+'('+argsTemplate.join(', ')+')' + (returnType ? '' : ';\n');
	
	console.log(block);
	return block;
};
	
Blockly.RobotC.generateSimpleBlock = function(block){
	
	Blockly.Blocks[block.name] = {
			init: function() {
				// TODO: add help URL support
				this.setHelpUrl('http://www.example.com/');
				this.setColour(block.hue);
				this.appendDummyInput()
					.appendField(block.humanName || block.name);
				console.log(block.args);
				for (argnum in (block.args||[])){
					var arg = args[argnum];
					this.appendValueInput('INPUT'+argnum)
						.appendField(arg[0])
						.setAlign(Blockly.ALIGN_RIGHT)
						.setCheck(arg[1] || '');
				}
				
				if (typeof(block.returns) != 'undefined'){
					this.setOutput(true, block.returns);
				}else{
					this.setPreviousStatement(block.connections == 'Top' || block.connections == 'Both');
					this.setNextStatement(block.connections == 'Bottom' || block.connections == 'Both');
				}
				this.setTooltip(block.tooltip || '');
			},
	};
	
	var template = block.template;
	var returns = typeof(block.returns) != 'undefined';
	
	Blockly.RobotC[block.name] = function(block) {
		var code = template;
		for (var i=0; i<numArgs; i++){
			var input = Blockly.RobotC.valueToCode(block, 'INPUT'+i, Blockly.RobotC.ORDER_ATOMIC) || 'null';
			code.replace('~'+i, input);
		}
		if (returns){
			return [code, Blockly.RobotC.ORDER_FUNCTION_CALL];
		}
		return code;
	};
	
	Blockly.RobotC.generateBlocks = function(colour, blist){
		for (i in blist){
			Blockly.RobotC.generateSimpleBlocks(Blockly.RobotC.parseC(colour, blist[i]));
		}
	};
};