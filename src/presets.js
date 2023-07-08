const { combineRgb } = require('@companion-module/base')

module.exports = {
	initPresets() {
		let presets = []

		presets.push({
			type: 'button',
			category: 'Video',
			name: 'PROGRAM',
			bank: {
				text: 'Program',
				size: '18',
				color: combineRgb(255, 255, 255),
				bgcolor: combineRgb(0, 0, 0),
			},
			steps: [
				{
					down: [
						{
							actionId: 'select_pgm',
							options: {
								id: '0',
							}
						}
					],
					up: []
				}
			],
			feedbacks: [
				{
					feedbackId: 'program',
					options: {
						id: 0,
					},
					style: {
						color: combineRgb(0, 0, 0),
						bgcolor: combineRgb(255, 0, 0),
					},
				},
				{
					feedbackId: 'preview',
					options: {
						id: 0,
					},
					style: {
						color: combineRgb(0, 0, 0),
						bgcolor: combineRgb(0, 255, 0),
					},
				},
			],
		})

		presets.push({
			type: 'button',
			category: 'Video',
			name: 'PRESET',
			bank: {
				text: 'Preset',
				size: '18',
				color: combineRgb(255, 255, 255),
				bgcolor: combineRgb(0, 0, 0),
			},
			steps: [
				{
					down: [
						{
							actionId: 'select_pvw',
							options: {
								id: '0',
							}
						}
					],
					up: []
				}
			],
			feedbacks: [
				{
					feedbackId: 'program',
					options: {
						id: 0,
					},
					style: {
						color: combineRgb(0, 0, 0),
						bgcolor: combineRgb(255, 0, 0),
					},
				},
				{
					feedbackId: 'preview',
					options: {
						id: 0,
					},
					style: {
						color: combineRgb(0, 0, 0),
						bgcolor: combineRgb(0, 255, 0),
					},
				},
			],
		})

		this.setPresetDefinitions(presets)
	}
}