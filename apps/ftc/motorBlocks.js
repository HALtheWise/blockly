/**
 * This file contains definitions for all the blocks that are generated using blockgen.js
 * 
 * @author eric@legoaces.org (Eric Miller)
 */

//NXT Motor Control
//http://www.robotc.net/wiki/NXT_Motors_and_Servos_Overview
if (typeof(NXT) == 'undefined'){
NXT = {};}
NXT.Motors = {};
NXT.Motors.color = 100;
NXT.Motors.Simplecode = [
{
	name:"motor_speed_control",
	display_name:"enable speed control", //defaults to name
	args:[["motor", "Motor"],["speed control", "Boolean"]],
	tooltip: 'Enables PID speed control for a motor',
	hue: NXT.Motors.color,
	template: 'nMotorPIDSpeedCtrl[~0] = ~1 ? mtrSpeedReg : mtrNoReg;\n'
},
{
	name:"motor_speed_max",
	display_name:"set max PID speed", //defaults to name
	args:[["max speed", "Number"]],
	tooltip: 'Sets the maximum encoder clicks per second that PID will attempt to reach.\nDo not set above 750 on low batteries.',
	hue: NXT.Motors.color,
	template: 'nMaxRegulatedSpeed = ~0;\n'
},
{
	name:"motor_encoder_get",
	display_name:"encoder get", //defaults to name
	args:[["motor", "Motor"]],
	tooltip: 'Retrieves the encoder value for the specified motor.',
	returns: 'Number',
	hue: NXT.Motors.color,
	template: 'nMotorEncoder[~0]'
},
{
	name:"motor_encoder_reset",
	display_name:"reset encoder", //defaults to name
	args:[["motor", "Motor"]],
	tooltip: 'Resets the encoder value for the specified motor.',
	hue: NXT.Motors.color,
	template: 'nMotorEncoder[~0] = 0;\n'
},
{
	name:"motor_encoder_set_target",
	display_name:"encoder target", //defaults to name
	args:[["motor", "Motor"], ['target', 'Number']],
	tooltip: 'If you specify a positive value the motor will slow to a stop at this position.\nA negative value will leave the motor in coast / float mode when the encoder position is reached.',
	hue: NXT.Motors.color,
	template: 'nMotorEncoderTarget[~0] = ~1;\n'
},
{
	name:"motor_reflect",
	display_name:"invert motor", //defaults to name
	args:[["motor", "Motor"], ['invert', 'Boolean']],
	tooltip: 'flips/reflects the logical motor direction',
	hue: NXT.Motors.color,
	template: 'bMotorReflected[~0] = ~1;\n'
}
                      ];
Blockly.RobotC.generateBlocks(NXT.Motors.color, NXT.Motors.Simplecode);