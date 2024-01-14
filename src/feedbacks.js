const { combineRgb } = require('@companion-module/base')

module.exports = {
	initFeedbacks() {
		let self = this;
		
		let feedbacks = {}

		feedbacks['program'] = {
			type: 'boolean',
			name: 'Program Status for input',
			description: 'Show feedback for program state',
			options: [
				{
					type: 'dropdown',
					id: 'input',
					label: 'Input',
					choices: self.CHOICES_INPUTS,
					default: '0',
				},
			],
			style: {
				color: combineRgb(0, 0, 0),
				bgcolor: combineRgb(255, 0, 0),
			},
			callback: (feedback) => {
				let opt = feedback.options
				if (self.buttonSet[0] == opt.input) {
					return true
				} else {
					return false
				}
			},
		}
		feedbacks['preview'] = {
			type: 'boolean',
			name: 'Preset Status for input',
			description: 'Show feedback for preset state',
			options: [
				{
					type: 'dropdown',
					id: 'input',
					label: 'Input',
					choices: self.CHOICES_INPUTS,
					default: '0',
				},
			],
			style: {
				color: combineRgb(0, 0, 0),
				bgcolor: combineRgb(0, 255, 0),
			},
			callback: (feedback) => {
				let opt = feedback.options
				if (self.buttonSet[1] == opt.input) {
					return true
				} else {
					return false
				}
			},
		}
		feedbacks['aux'] = {
			type: 'boolean',
			name: 'Aux Status for input',
			description: 'Show feedback for aux state',
			options: [
				{
					type: 'dropdown',
					id: 'input',
					label: 'Input',
					choices: self.CHOICES_INPUTS,
					default: '0',
				},
			],
			style: {
				color: combineRgb(0, 0, 0),
				bgcolor: combineRgb(255, 0, 0),
			},
			callback: (feedback) => {
				let opt = feedback.options
				if (self.buttonSet[2] == opt.input) {
					return true
				} else {
					return false
				}
			},
		}
		feedbacks['dsk'] = {
			type: 'boolean',
			name: 'DSK Status',
			description: 'Show DSK status',
			options: [],
			style: {
				color: combineRgb(0, 0, 0),
				bgcolor: combineRgb(255, 0, 0),
			},
			callback: (feedback) => {
				if (self.buttonSet[4] == '1') {
					return true
				} else {
					return false
				}
			},
		}
		feedbacks['PinP1status'] = {
			type: 'boolean',
			name: 'PinP 1 Status',
			description: 'Show PinP 1 status',
			options: [],
			style: {
				color: combineRgb(0, 0, 0),
				bgcolor: combineRgb(0, 255, 0),
			},
			callback: (feedback) => {
				if (self.buttonSet[3] == '1') {
					return true
				} else {
					return false
				}
			},
		}
		feedbacks['PinP2status'] = {
			type: 'boolean',
			name: 'PinP 2 Status',
			description: 'Show PinP 2 status',
			options: [],
			style: {
				color: combineRgb(0, 0, 0),
				bgcolor: combineRgb(0, 255, 0),
			},
			callback: (feedback) => {
				if (self.buttonSet[3] == '2') {
					return true
				} else {
					return false
				}
			},
		}
		feedbacks['SPLITstatus'] = {
			type: 'boolean',
			name: 'SPLIT Status',
			description: 'Show SPLIT status',
			options: [],
			style: {
				color: combineRgb(0, 0, 0),
				bgcolor: combineRgb(0, 255, 0),
			},
			callback: (feedback) => {
				if (self.buttonSet[3] == '3') {
					return true
				} else {
					return false
				}
			},
		}
		feedbacks['outputfade'] = {
			type: 'boolean',
			name: 'Output Fade Status',
			description: 'Show Output Fade status',
			options: [],
			style: {
				color: combineRgb(0, 0, 0),
				bgcolor: combineRgb(255, 0, 0),
			},
			callback: (feedback) => {
				if (self.buttonSet[5] == '1') {
					return true
				} else {
					return false
				}
			},
		}

		self.setFeedbackDefinitions(feedbacks)
	}
}