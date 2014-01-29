/**
 * This file contains blocks and block generators for RobotC functions.
 * @author eric@legoaces.org (Eric Miller)
 */

Blockly.RobotC.RobotC_builtin_vars = [


                                      ];

var MOTOR_COLOR = 290;

Blockly.Blocks['set_motor'] = {
		init: function() {
			this.setHelpUrl('http://www.robotc.net/wiki/NXT_Functions_Motors#motor');
			this.setColour(MOTOR_COLOR);
			this.appendValueInput("MOTOR")
				.setCheck("Motor")
				.setAlign(Blockly.ALIGN_RIGHT)
				.appendField("set motor");
			this.appendValueInput("POWER")
				.setCheck("Number")
				.setAlign(Blockly.ALIGN_RIGHT)
				.appendField("to");
			this.appendDummyInput()
				.appendField("% power");
			this.setInputsInline(true);
			this.setPreviousStatement(true);
			this.setNextStatement(true);
			this.setTooltip('Set the selected motor to the selected power level');
		}
};

Blockly.RobotC['set_motor'] = function(block) {
	var value_motor = Blockly.JavaScript.valueToCode(block, 'MOTOR', Blockly.JavaScript.ORDER_ATOMIC);
	var value_power = Blockly.JavaScript.valueToCode(block, 'POWER', Blockly.JavaScript.ORDER_ATOMIC);
	var code = 'motor['+value_motor+'] = ' + value_power + ';';
	return code;
};

Blockly.Blocks['motor_constant'] = {
		init: function() {
			this.setHelpUrl('http://www.example.com/');
			this.setColour(MOTOR_COLOR);
			this.appendDummyInput()
				.appendField("motor")
				.appendField(new Blockly.FieldDropdown([["wrist 1", "wrist1"], ["wrist 2", "wrist2"], ["tail winch", "tailwinch"], ["main winch", "hookwinch"], ["arm motor", "arms"], ["ramp deploy stick", "stick"], ["front left drive", "FL"], ["back left drive", "BL"], ["front right drive", "FR"], ["back right drive", "BR"]]), "MOTOR");
			this.setOutput(true, "Motor");
			this.setTooltip('');
		}
};

Blockly.RobotC['motor_constant'] = function(block) {
	var dropdown_motor = block.getFieldValue('MOTOR');
	var code = dropdown_motor;
	return [code, Blockly.RobotC.ORDER_ATOMIC];
};