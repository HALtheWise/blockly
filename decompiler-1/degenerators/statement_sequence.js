// This file was automatically generated from common.soy.
// Please don't edit this file by hand.

if (typeof apps == 'undefined') { var apps = {}; }


apps.messages = function(opt_data, opt_ignored, opt_ijData) {
  return '<div style="display: none"><span id="subtitle">a visual programming environment</span><span id="blocklyMessage">Blockly</span><span id="codeTooltip">See generated JavaScript code.</span><span id="linkTooltip">Save and link to blocks.</span><span id="runTooltip">Run the program defined by the blocks in the workspace.</span><span id="runProgram">Run Program</span><span id="resetProgram">Reset</span><span id="dialogOk">OK</span><span id="dialogCancel">Cancel</span><span id="catLogic">Logic</span><span id="catLoops">Loops</span><span id="catMath">Math</span><span id="catText">Text</span><span id="catLists">Lists</span><span id="catColour">Colour</span><span id="catVariables">Variables</span><span id="catProcedures">Functions</span><span id="httpRequestError">There was a problem with the request.</span><span id="linkAlert">Share your blocks with this link:\\n\\n%1</span><span id="hashError">Sorry, \'%1\' doesn\'t correspond with any saved program.</span><span id="xmlError">Could not load your saved file.  Perhaps it was created with a different version of Blockly?</span><span id="listVariable">list</span><span id="textVariable">text</span></div>';
};


apps.dialog = function(opt_data, opt_ignored, opt_ijData) {
  return '<div id="dialogShadow" class="dialogAnimate"></div><div id="dialogBorder"></div><div id="dialog"></div>';
};


apps.codeDialog = function(opt_data, opt_ignored, opt_ijData) {
  return '<div id="dialogCode" class="dialogHiddenContent"><pre id="containerCode"></pre>' + apps.ok(null, null, opt_ijData) + '</div>';
};


apps.storageDialog = function(opt_data, opt_ignored, opt_ijData) {
  return '<div id="dialogStorage" class="dialogHiddenContent"><div id="containerStorage"></div>' + apps.ok(null, null, opt_ijData) + '</div>';
};


apps.ok = function(opt_data