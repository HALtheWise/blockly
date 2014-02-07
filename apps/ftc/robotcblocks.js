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
	var value_motor = Blockly.RobotC.valueToCode(block, 'MOTOR', Blockly.RobotC.ORDER_ATOMIC) || 'null';
	var value_power = Blockly.RobotC.valueToCode(block, 'POWER', Blockly.RobotC.ORDER_ATOMIC) || '0';
	var code = 'motor['+value_motor+'] = ' + value_power + ';\n';
	return code;
};

Blockly.Blocks['motor_constant'] = {
		init: function() {
			this.setHelpUrl('http://www.example.com/');
			this.setColour(MOTOR_COLOR);
			this.appendDummyInput()
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

Blockly.Blocks['wait_for_start'] = {
		init: function() {
			this.setHelpUrl('http://www.example.com/');
			this.setColour(180);
			this.appendDummyInput()
				.appendField("waitForStart()");
			this.setPreviousStatement(true);
			this.setNextStatement(true);
			this.setTooltip('Hangs the program until the FTC round begins.');
		}
};

Blockly.RobotC['wait_for_start'] = function(block) {
	var code = 'waitForStart();\n';
	return code;
};

Blockly.Blocks['get_joysticks'] = {
		init: function() {
			this.setHelpUrl('http://www.example.com/');
			this.setColour(180);
			this.appendDummyInput()
				.appendField("get joystick information");
			this.setPreviousStatement(true);
			this.setNextStatement(true);
			this.setTooltip('Retrieves the joystick control information from the FCS.');
		}
};

Blockly.RobotC['get_joysticks'] = function(block) {
	var code = 'getJoystickSettings(joystick);\n';
	return code;
};

Blockly.Blocks['task_main'] = {
		init: function() {
			this.setHelpUrl('http://www.example.com/');
			this.setColour(180);
			this.appendDummyInput()
				.appendField("when program starts:");
			this.appendStatementInput("STACK");
			this.setTooltip('Execution of the RobotC program begins here');
		}
};

Blockly.RobotC['task_main'] = function(block) {
	var statements_stack = Blockly.RobotC.statementToCode(block, 'STACK');
	var code = 'task main(){\n' + statements_stack + '}';
	return code;
};

Blockly.Blocks['get_joy_value'] = {
		init: function() {
			this.setHelpUrl('http://www.example.com/');
			this.setColour(230);
			this.appendDummyInput()
				.appendField(new Blockly.FieldDropdown([["main joystick", "joy1"], ["auxilary joystick", "joy2"]]), "CONTROLLER")
				.appendField(new Blockly.FieldDropdown([["left stick", "1"], ["right stick", "2"]]), "STICK")
				.appendField(new Blockly.FieldDropdown([["X axis", "x"], ["Y axis", "y"]]), "AXIS");
			this.setInputsInline(true);
			this.setOutput(true, "Number");
			this.setTooltip('Retrieves an axis value from the joystick');
		}
};

Blockly.RobotC['get_joy_value'] = function(block) {
	var dropdown_controller = block.getFieldValue('CONTROLLER');
	var dropdown_stick = block.getFieldValue('STICK');
	var dropdown_axis = block.getFieldValue('AXIS');
	var code = 'joystick.' + dropdown_controller + '_' + dropdown_axis + dropdown_stick;
	return [code, Blockly.RobotC.ORDER_MEMBER];
};

Blockly.Blocks['get_joy_button'] = {
		  init: function() {
		    this.setHelpUrl('http://www.example.com/');
		    this.setColour(230);
		    this.appendValueInput("BUTTON")
		        .setCheck("Number")
		        .appendField(new Blockly.FieldDropdown([["main joystick", "1"], ["auxilary joystick", "2"]]), "CONTROLLER")
		        .appendField("button");
		    this.setInputsInline(true);
		    this.setOutput(true);
		    this.setTooltip('Retrieves the pressed state of a button on a controller');
		  }
		};

Blockly.RobotC['get_joy_button'] = function(block) {
	  var value_button = Blockly.RobotC.valueToCode(block, 'BUTTON', Blockly.RobotC.ORDER_ATOMIC);
	  var dropdown_controller = block.getFieldValue('CONTROLLER');
	  var code = 'joy' + dropdown_controller + 'Btn(' + value_button + ')';
	  return [code, Blockly.RobotC.ORDER_FUNCTION_CALL];
	};