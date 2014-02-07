/**
 * This file contains definitions for all the blocks that are generated using blockgen.js
 * they access sensor values, as seen at http://www.robotc.net/wiki/NXT_Sensors_Overview
 * 
 * @author eric@legoaces.org (Eric Miller)
 */
if (typeof(NXT) == 'undefined'){
NXT = {};}

Blockly.Blocks['sensor_constant'] = {
		init: function() {
			this.setHelpUrl('http://www.example.com/');
			this.setColour(MOTOR_COLOR);
			this.appendDummyInput()
			//TODO: let this list be dynamically configurable somehow.
				.appendField(new Blockly.FieldDropdown([["touch multiplexer", "touch"], ["gyroscope", "gyro"], ["IR seeker", "seeker"]]), "SENSOR");
			this.setOutput(true, "Sensor");
			this.setTooltip('');
		}
};

Blockly.RobotC['sensor_constant'] = function(block) {
	var dropdown_motor = block.getFieldValue('SENSOR');
	var code = dropdown_motor;
	return [code, Blockly.RobotC.ORDER_ATOMIC];
};

NXT.Sensors = {};
NXT.Sensors.color = 160;
NXT.Sensors.Simplecode = [
{
	name:"sensor_value",
	display_name:"get value", //defaults to name
	args:[["sensor", "Sensor"]],
	tooltip: 'Gets value for a given sensor (see RobotC wiki)',
	hue: NXT.Sensors.color,
	returns: 'Number',
	template: 'SensorValue[~0]'
},
{
	name:"sensor_value",
	display_name:"get raw value", //defaults to name
	args:[["sensor", "Sensor"]],
	tooltip: 'Gets raw value for a given sensor (see RobotC wiki)',
	hue: NXT.Sensors.color,
	returns: 'Number',
	template: 'SensorRaw[~0]'
}
                      ];

Blockly.RobotC.generateBlocks(NXT.Sensors.color, NXT.Sensors.Simplecode);