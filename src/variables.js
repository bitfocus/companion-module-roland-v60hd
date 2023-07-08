const constants = require('./constants')

module.exports = {
	initVariables() {
		let variables = []

		variables.push({ variableId: 'program', name: 'Currently active input' })
		variables.push({ variableId: 'preview', name: 'Input in preview' })
		variables.push({ variableId: 'aux', name: 'Input currently active in aux' })
		variables.push({ variableId: 'dsk_status', name: 'DSK is on or off' })
		variables.push({ variableId: 'pip_1_status', name: 'PiP1 is on or off' })
		variables.push({ variableId: 'pip_2_status', name: 'PiP2 is on or off' })
		variables.push({ variableId: 'split_status', name: 'SPLIT is on or off' })
		variables.push({ variableId: 'outputfade_status', name: 'Output fade is on or off' })

		this.setVariableDefinitions(variables);
	},

	checkVariables() {
		try {
			let variableObj = {};

			variableObj['program'] = parseInt(this.buttonSet[0]) + 1;
			variableObj['preview'] = parseInt(this.buttonSet[1]) + 1;
			variableObj['aux'] = parseInt(this.buttonSet[2]) + 1;
			variableObj['dsk_status'] = this.buttonSet[4] === '1' ? 'on' : 'off';
			variableObj['pip_1_status'] = this.buttonSet[3] === '1' ? 'on' : 'off';
			variableObj['pip_2_status'] = this.buttonSet[3] === '2' ? 'on' : 'off';
			variableObj['split_status'] = this.buttonSet[3] === '3' ? 'on' : 'off';
			variableObj['outputfade_status'] = this.buttonSet[5] === '1' ? 'on' : 'off';
			
			this.setVariableValues(variableObj);
		}
		catch(error) {
			this.log('error', `Error checking variables: ${error.toString()}`)
		}
	}
}