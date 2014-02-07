/**
 * This file contains definitions for all the blocks that are generated using blockgen.js
 * that access, modify, or use the timers in the NXT.
 * See http://www.robotc.net/wiki/NXT_Functions_Timing
 * 
 * @author eric@legoaces.org (Eric Miller)
 */
if (typeof(NXT) == 'undefined'){
NXT = {};}

Blockly.Blocks['timer_constant'] = {
		init: function() {
			this.setHelpUrl('http://www.example.com/');
			this.setColour(MOTOR_COLOR);
			this.appendDummyInput()
			//TODO: let this list be dynamically configurable somehow.
				.appendField(new Blockly.FieldDropdown([["timer 1", "T1"], ["timer 2", "T2"], ["timer 3", "T3"], ['timer 4', 'T4']]), "TIMER");
			this.setOutput(true, "Timer");
			this.setTooltip('');
		}
};

Blockly.RobotC['timer_constant'] = function(block) {
	var dropdown_motor = block.getFieldValue('TIMER');
	var code = dropdown_motor;
	return [code, Blockly.RobotC.ORDER_ATOMIC];
};

NXT.Timing = {};
NXT.Timing.color = 200;
NXT.Timing.Simplecode = [
{
	name:"timer_clear",
	display_name:"clear timer", //defaults to name
	args:[["", "Timer"]],
	tooltip: 'resets timer to 0',
	hue: NXT.Timing.color,
	template: 'ClearTimer(~0);\n'
},
{
	name:"timer_get_1ms",
	display_name:"get 1ms ticks", //defaults to name
	args:[["", "Timer"]],
	tooltip: 'Gets number of 1ms increments to pass since timer reset',
	hue: NXT.Timing.color,
	returns: 'Number',
	template: 'time1[~0]'
},
{
	name:"timer_get_10ms",
	display_name:"get 10ms ticks", //defaults to name
	args:[["", "Timer"]],
	tooltip: 'Gets number of 10ms increments to pass since timer reset',
	hue: NXT.Timing.color,
	returns: 'Number',
	template: 'time10[~0]'
},
{
	name:"timer_get_1ms",
	display_name:"get 100ms ticks", //defaults to name
	args:[["", "Timer"]],
	tooltip: 'Gets number of 100ms increments to pass since timer reset',
	hue: NXT.Timing.color,
	returns: 'Number',
	template: 'time100[~0]'
},
{
	name:"wait_1ms",
	display_name:"wait ", //defaults to name
	args:[["time = ", "Number"]],
	tooltip: 'Waits for the specified number of 1ms increments.',
	hue: NXT.Timing.color,
	template: 'wait1Msec(~0);\n'
},
{
	name:"wait_10ms",
	display_name:"wait ", //defaults to name
	args:[["time = 10*", "Number"]],
	tooltip: 'Waits for the specified number of 10ms increments.',
	hue: NXT.Timing.color,
	template: 'wait10Msec(~0);\n'
},
{
	name:"clock_minutes",
	display_name:"clock minutes", //defaults to name
	args:[],
	tooltip: 'Returns the number of minutes on the NXT clock.',
	hue: NXT.Timing.color,
	returns: "Number",
	template: 'nClockMinutes'
}
                      ];

Blockly.RobotC.generateBlocks(NXT.Timing.color, NXT.Timing.Simplecode);