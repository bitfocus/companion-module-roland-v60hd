// Roland-V60HD

let tcp = require('../../tcp')
let instance_skel = require('../../instance_skel')

var debug
var log

class instance extends instance_skel {
	constructor(system, id, config) {
		super(system, id, config)

		this.cmdPipe = []
		this.pollMixerTimer = undefined
		this.buttonSet = []

		this.CHOICES_INPUTS = [
			{ label: 'SDI IN 1', id: '0' },
			{ label: 'SDI IN 2', id: '1' },
			{ label: 'SDI IN 3', id: '2' },
			{ label: 'SDI IN 4', id: '3' },
			{ label: 'HDMI IN 5', id: '4' },
			{ label: 'HDMI/RGB IN 6', id: '5' },
			{ label: 'STILL/BKG IN 7', id: '6' },
			{ label: 'STILL/BKG IN 8', id: '7' },
		]

		this.CHOICES_BUSES = [
			{ id: '0', label: 'Program' },
			{ id: '1', label: 'Preset/Preview' },
			{ id: '2', label: 'Aux' },
		]
	}

	destroy() {
		if (this.socket !== undefined) {
			this.socket.destroy()
		}

		if (this.pollMixerTimer !== undefined) {
			clearInterval(this.pollMixerTimer)
			delete this.pollMixerTimer
		}

		debug('destroy', this.id)
	}

	init() {
		debug = this.debug
		log = this.log
		this.updateConfig(this.config)
	}

	updateConfig(config) {
		// polling is running and polling has been de-selected by config change
		if (this.pollMixerTimer !== undefined) {
			clearInterval(this.pollMixerTimer)
			delete this.pollMixerTimer
		}
		this.config = config
		this.initActions()
		this.initFeedbacks()
		this.init_tcp()
		this.initPolling()
		this.initPresets()
	}

	init_tcp() {
		let pipeline = ''

		if (this.socket !== undefined) {
			this.socket.destroy()
			delete this.socket
		}

		if (this.config.port === undefined) {
			this.config.port = 8023
		}

		if (this.config.host) {
			this.socket = new tcp(this.config.host, this.config.port)

			this.socket.on('status_change', (status, message) => {
				this.status(status, message)
			})

			this.socket.on('error', (err) => {
				debug('Network error', err)
				this.log('error', 'Network error: ' + err.message)
			})

			this.socket.on('connect', () => {
				debug('Connected')
			})

			this.socket.on('data', (receivebuffer) => {
				pipeline += receivebuffer.toString('utf8')
				if (pipeline.length == 1 && pipeline.charAt(0) == '\u0006') {
					// process simple <ack> responses (06H) as these come back for all successsful Control commands
					this.cmdPipeNext()
					pipeline = ''
				} else {
					// partial response pipeline processing as TCP Serial module can return partial responses in stream.
					if (pipeline.includes(';')) {
						// got at least one command terminated with ';'
						// multiple rapid Query strings can result in async multiple responses so split response into individual messages
						let allresponses = pipeline.split(';')
						// last element will either be a partial response an <ack> (processed next timer tick) or an empty string from split where a complete pipeline ends with ';'
						pipeline = allresponses.pop()
						for (let response of allresponses) {
							// Chance of leading <ack> responses from key commands or prior Query
							while (response.charAt[0] == '\u0006') {
								response = response.slice(1)
								this.cmdPipeNext()
							}
							if (response.length > 0) {
								this.processResponse(response)
							}
						}
					}
				}
			})
		}
	}
	cmdPipeNext() {
		if (this.cmdPipe.length > 0) {
			return this.cmdPipe.pop()
		} else {
			this.log('error', 'Unexpected response count (pipe underrun)')
			return ''
		}
	}
	processResponse(response) {
		let category = 'XXX'
		let args = []

		const errorMessage = (errcode, pipeitem) => {
			let errstring = ''
			switch (errcode) {
				case '0':
					errstring = '(Syntax Error)'
					break
				case '4':
					errstring = '(Invalid Function Error)'
					break
				case '5':
					errstring = '(Out of Range Error)'
					break
				default:
					errstring = '(UNKNOWN Error)'
					break
			}
			this.log('error', 'ERR: ' + errstring + ' - Command = ' + pipeitem)
		}

		let settingseparator = response.search(':')
		if (settingseparator > 2) {
			category = response.substring(settingseparator - 3, settingseparator)
			let argstring = response.substring(settingseparator + 1, response.length) // from start of params to end of string
			args = argstring.split(',')
		}
		switch (category) {
			case 'QPL': //button settings array (polled)
				this.buttonSet = args
				this.checkFeedbacks()
				break
			case 'ERR':
				errorMessage(args[0], this.cmdPipeNext())
				break
		}
	}
	sendCommmand(cmd) {
		if (cmd !== undefined) {
			if (this.socket !== undefined && this.socket.connected) {
				this.socket.send('\u0002' + cmd + ';')
				this.cmdPipe.unshift(cmd) // pipe buffer to match commands and responses asynchronously
			} else {
				debug('Socket not connected :(')
			}
		}
	}

	initPolling() {
		if (this.pollMixerTimer === undefined) {
			this.pollMixerTimer = setInterval(() => {
				this.sendCommmand('QPL:7')
			}, this.config.poll_interval)
		}
	}

	config_fields() {
		return [
			{
				type: 'text',
				id: 'info',
				width: 12,
				label: 'Information',
				value: 'This module will connect to a Roland Pro AV V-60HD Video Switcher. (with feedbacks)',
			},
			{
				type: 'textinput',
				id: 'host',
				label: 'IP Address',
				width: 6,
				default: '192.168.0.1',
				regex: this.REGEX_IP,
			},
			{
				type: 'number',
				id: 'poll_interval',
				label: 'Polling Interval (ms)',
				min: 300,
				max: 30000,
				default: 500,
				width: 8,
			},
		]
	}

	initActions() {
		let actions = {
			select_pgm: {
				label: 'Select channel for final video output (PGM)',
				options: [
					{
						type: 'dropdown',
						label: 'Source',
						id: 'source',
						default: '0',
						choices: this.CHOICES_INPUTS,
					},
				],
			},
			select_pvw: {
				label: 'Select channel for preset video (PST/PVW)',
				options: [
					{
						type: 'dropdown',
						label: 'Source',
						id: 'source',
						default: '0',
						choices: this.CHOICES_INPUTS,
					},
				],
			},
			select_aux: {
				label: 'Select channel to send to AUX bus',
				options: [
					{
						type: 'dropdown',
						label: 'Source',
						id: 'source',
						default: '0',
						choices: this.CHOICES_INPUTS,
					},
				],
			},
			select_transition_effect: {
				label: 'Select transition effect',
				options: [
					{
						type: 'dropdown',
						label: 'Transition Effect',
						id: 'transitioneffect',
						default: '0',
						choices: [
							{ id: '0', label: 'Mix' },
							{ id: '1', label: 'Wipe 1' },
							{ id: '2', label: 'Wipe 2' },
						],
					},
				],
			},
			set_transition_time: {
				label: 'Set Video Transition Time',
				options: [
					{
						type: 'textinput',
						label: 'Time between 0 (0.0 sec) and 40 (4.0 sec)',
						id: 'transitiontime',
						default: '1',
					},
				],
			},
			cut: {
				label: 'Press the [CUT] button',
			},
			auto: {
				label: 'Press the [AUTO] button',
			},
			pinp1: {
				label: 'Press the [PinP 1] button',
			},
			pinp2: {
				label: 'Press the [PinP 2] button',
			},
			split: {
				label: 'Press the [Split] button',
			},
			dsk: {
				label: 'Press the [DSK] button',
			},
			dsk_pvw: {
				label: 'Press the DSK [PVW] button',
			},
			dsk_automixing: {
				label: 'Press the DSK [AUTO MIXING] button',
			},
			dsk_outputfade: {
				label: 'Press the DSK [OUTPUT FADE] button',
			},
			pinp1_position: {
				label: 'Adjust display position of inset screen assigned to the [PinP 1] button',
				options: [
					{
						type: 'textinput',
						label: 'Horizontal Position (-450 to 450)',
						id: 'horizontal',
						default: '0',
					},
					{
						type: 'textinput',
						label: 'Vertical Position (-400 to 400)',
						id: 'vertical',
						default: '0',
					},
				],
			},
			pinp2_position: {
				label: 'Adjust display position of inset screen assigned to the [PinP 2] button',
				options: [
					{
						type: 'textinput',
						label: 'Horizontal Position (-450 to 450)',
						id: 'horizontal',
						default: '0',
					},
					{
						type: 'textinput',
						label: 'Vertical Position (-400 to 400)',
						id: 'vertical',
						default: '0',
					},
				],
			},
			split_position: {
				label: 'During split composition, adjust the display position of the video',
				options: [
					{
						type: 'textinput',
						label: 'Position 1 (-250 to 250)',
						id: 'value1',
						default: '0',
					},
					{
						type: 'textinput',
						label: 'Position 2 (-250 to 250)',
						id: 'value2',
						default: '0',
					},
				],
			},
			dsk_selectsource: {
				label: 'During DSK composition, set the channel of the overlaid logo or image',
				options: [
					{
						type: 'dropdown',
						label: 'Source',
						id: 'source',
						default: '0',
						choices: this.CHOICES_INPUTS,
					},
				],
			},
			dsk_keylevel: {
				label: 'Adjust the key level (amount of extraction) for DSK composition',
				options: [
					{
						type: 'textinput',
						label: '0 - 255',
						id: 'level',
						default: '255',
					},
				],
			},
			dsk_keygain: {
				label: 'Adjust the key gain (semi-transmissive region) for DSK composition',
				options: [
					{
						type: 'textinput',
						label: '0 - 255',
						id: 'level',
						default: '255',
					},
				],
			},
			select_channel6input: {
				label: 'Select input connector for Channel 6',
				options: [
					{
						type: 'dropdown',
						label: 'Input Connector',
						id: 'inputconnector',
						default: '0',
						choices: [
							{ id: '0', label: 'HDMI' },
							{ id: '1', label: 'RGB/Component' },
						],
					},
				],
			},
			select_outputbus_sdi1: {
				label: 'Select output bus for SDI 1',
				options: [
					{
						type: 'dropdown',
						label: 'Bus',
						id: 'bus',
						default: '0',
						choices: this.CHOICES_BUSES,
					},
				],
			},
			select_outputbus_sdi2: {
				label: 'Select output bus for SDI 2',
				options: [
					{
						type: 'dropdown',
						label: 'Bus',
						id: 'bus',
						default: '0',
						choices: this.CHOICES_BUSES,
					},
				],
			},
			select_outputbus_hdmi1: {
				label: 'Select output bus for HDMI 1',
				options: [
					{
						type: 'dropdown',
						label: 'Bus',
						id: 'bus',
						default: '0',
						choices: this.CHOICES_BUSES,
					},
				],
			},
			select_outputbus_hdmi2: {
				label: 'Select output bus for HDMI 2',
				options: [
					{
						type: 'dropdown',
						label: 'Bus',
						id: 'bus',
						default: '0',
						choices: this.CHOICES_BUSES,
					},
				],
			},
			hdcp: {
				label: 'Set HDCP On/Off',
				options: [
					{
						type: 'dropdown',
						label: 'HDCP Setting',
						id: 'hdcpsetting',
						default: '0',
						choices: [
							{ id: '0', label: 'Off' },
							{ id: '1', label: 'On' },
						],
					},
				],
			},
			preset: {
				label: 'Call up Preset Memory',
				options: [
					{
						type: 'dropdown',
						label: 'Preset',
						id: 'preset',
						default: '0',
						choices: [
							{ id: '0', label: 'Preset 1' },
							{ id: '1', label: 'Preset 2' },
							{ id: '2', label: 'Preset 3' },
							{ id: '3', label: 'Preset 4' },
							{ id: '4', label: 'Preset 5' },
							{ id: '5', label: 'Preset 6' },
							{ id: '6', label: 'Preset 7' },
							{ id: '7', label: 'Preset 8' },
						],
					},
				],
			},
		}
		this.setActions(actions)
	}

	action(action) {
		let cmd
		let options = action.options

		switch (action.action) {
			case 'select_pgm':
				cmd = 'PGM:' + options.source
				break
			case 'select_pvw':
				cmd = 'PST:' + options.source
				break
			case 'select_aux':
				cmd = 'AUX:' + options.source
				break
			case 'select_transition_effect':
				cmd = 'TRS:' + options.transitioneffect
				break
			case 'set_transition_time':
				cmd = 'TIM:' + options.transitiontime
				break
			case 'cut':
				cmd = 'CUT'
				break
			case 'auto':
				cmd = 'ATO'
				break
			case 'pinp1':
				cmd = 'P1S'
				break
			case 'pinp2':
				cmd = 'P2S'
				break
			case 'split':
				cmd = 'SPS'
				break
			case 'dsk':
				cmd = 'DSK'
				break
			case 'dsk_pvw':
				cmd = 'DVW'
				break
			case 'dsk_automixing':
				cmd = 'ATM'
				break
			case 'dsk_outputfade':
				cmd = 'FDE'
				break
			case 'pinp1_position':
				cmd = 'PP1:' + options.horizontal + ',' + options.vertical
				break
			case 'pinp2_position':
				cmd = 'PP2:' + options.horizontal + ',' + options.vertical
				break
			case 'split_position':
				cmd = 'SPT:' + options.value1 + ',' + options.value2
				break
			case 'dsk_selectsource':
				cmd = 'DSS:' + options.source
				break
			case 'dsk_keylevel':
				cmd = 'KYL:' + options.level
				break
			case 'dsk_keygain':
				cmd = 'KYG:' + options.level
				break
			case 'select_channel6input':
				cmd = 'IPS:' + options.inputconnector
				break
			case 'select_outputbus_sdi1':
				cmd = 'OS1:' + options.bus
				break
			case 'select_outputbus_sdi2':
				cmd = 'OS2:' + options.bus
				break
			case 'select_outputbus_hdmi1':
				cmd = 'OH1:' + options.bus
				break
			case 'select_outputbus_hdmi2':
				cmd = 'OH2:' + options.bus
				break
			case 'hdcp':
				cmd = 'HCP:' + options.hdcpsetting
				break
			case 'preset':
				cmd = 'MEM:' + options.preset
				break
		}
		this.sendCommmand(cmd)
	}

	initFeedbacks() {
		let feedbacks = {}

		feedbacks['program'] = {
			type: 'boolean',
			label: 'Program Status for input',
			description: 'Show feedback for program state',
			options: [
				{
					type: 'dropdown',
					id: 'input',
					label: 'Input',
					choices: this.CHOICES_INPUTS,
					default: '0',
				},
			],
			style: {
				color: this.rgb(0, 0, 0),
				bgcolor: this.rgb(255, 0, 0),
			},
			callback: (feedback, bank) => {
				let opt = feedback.options
				if (this.buttonSet[0] == opt.input) {
					return true
				} else {
					return false
				}
			},
		}
		feedbacks['preview'] = {
			type: 'boolean',
			label: 'Preset Status for input',
			description: 'Show feedback for preset state',
			options: [
				{
					type: 'dropdown',
					id: 'input',
					label: 'Input',
					choices: this.CHOICES_INPUTS,
					default: '0',
				},
			],
			style: {
				color: this.rgb(0, 0, 0),
				bgcolor: this.rgb(0, 255, 0),
			},
			callback: (feedback, bank) => {
				let opt = feedback.options
				if (this.buttonSet[1] == opt.input) {
					return true
				} else {
					return false
				}
			},
		}
		feedbacks['aux'] = {
			type: 'boolean',
			label: 'Aux Status for input',
			description: 'Show feedback for aux state',
			options: [
				{
					type: 'dropdown',
					id: 'input',
					label: 'Input',
					choices: this.CHOICES_INPUTS,
					default: '0',
				},
			],
			style: {
				color: this.rgb(0, 0, 0),
				bgcolor: this.rgb(255, 0, 0),
			},
			callback: (feedback, bank) => {
				let opt = feedback.options
				if (this.buttonSet[2] == opt.input) {
					return true
				} else {
					return false
				}
			},
		}
		this.setFeedbackDefinitions(feedbacks)
	}
	initPresets() {
		let presets = []

		presets.push({
			category: 'Video',
			label: 'PROGRAM',
			bank: {
				style: 'text',
				text: 'Program',
				size: '18',
				color: this.rgb(255, 255, 255),
				bgcolor: this.rgb(0, 0, 0),
			},
			actions: [
				{
					action: 'select_pgm',
					options: {
						id: '0',
					},
				},
			],
			feedbacks: [
				{
					type: 'program',
					options: {
						id: 0,
					},
					style: {
						color: this.rgb(0, 0, 0),
						bgcolor: this.rgb(255, 0, 0),
					},
				},
				{
					type: 'preview',
					options: {
						id: 0,
					},
					style: {
						color: this.rgb(0, 0, 0),
						bgcolor: this.rgb(0, 255, 0),
					},
				},
			],
		})
		presets.push({
			category: 'Video',
			label: 'PRESET',
			bank: {
				style: 'text',
				text: 'Preset',
				size: '18',
				color: this.rgb(255, 255, 255),
				bgcolor: this.rgb(0, 0, 0),
			},
			actions: [
				{
					action: 'select_pvw',
					options: {
						id: '0',
					},
				},
			],
			feedbacks: [
				{
					type: 'program',
					options: {
						id: 0,
					},
					style: {
						color: this.rgb(0, 0, 0),
						bgcolor: this.rgb(255, 0, 0),
					},
				},
				{
					type: 'preview',
					options: {
						id: 0,
					},
					style: {
						color: this.rgb(0, 0, 0),
						bgcolor: this.rgb(0, 255, 0),
					},
				},
			],
		})
		this.setPresetDefinitions(presets)
	}
}
exports = module.exports = instance
