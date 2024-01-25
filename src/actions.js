module.exports = {
	initActions() {
		let self = this;
		let actions = {};

		actions.select_pgm = {
			name: 'Select Program Channel',
			options: [
				{
					type: 'dropdown',
					label: 'Source',
					id: 'source',
					default: '0',
					allowCustom: true,
					choices: self.CHOICES_INPUTS,
				},
			],
			callback: async (action) => {
				let options = action.options;
				let source = await self.parseVariablesInString(options.source);
				let cmd = `PGM:${source};`;
				self.sendCommand(cmd);
			}
		};
		
		actions.select_pvw = {
			name: 'Select Preview/Preset Channel',
			options: [
				{
					type: 'dropdown',
					label: 'Source',
					id: 'source',
					default: '0',
					allowCustom: true,
					choices: self.CHOICES_INPUTS,
				},
			],
			callback: async (action) => {
				let options = action.options;
				let source = await self.parseVariablesInString(options.source);
				let cmd = `PST:${source};`;
				self.sendCommand(cmd);
			}
		};
		
		actions.select_aux = {
			name: 'Select Aux Channel',
			options: [
				{
					type: 'dropdown',
					label: 'Source',
					id: 'source',
					default: '0',
					allowCustom: true,
					choices: self.CHOICES_INPUTS,
				},
			],
			callback: async (action) => {
				let options = action.options;
				let source = await self.parseVariablesInString(options.source);
				let cmd = `AUX:${source};`;
				self.sendCommand(cmd);
			}
		};
		
		actions.select_transition_effect = {
			name: 'Select Transition Effect',
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
			callback: async (action) => {
				let options = action.options;
				let cmd = `TRS:${options.transitioneffect};`;
				self.sendCommand(cmd);
			}
		};
		
		actions.set_transition_time = {
			name: 'Set Video Transition Time',
			options: [
				{
					type: 'textinput',
					label: 'Time between 0 (0.0 sec) and 40 (4.0 sec)',
					id: 'transitiontime',
					default: '1',
				},
			],
			callback: async (action) => {
				let options = action.options;
				let cmd = `TIM:${options.transitiontime};`;
				self.sendCommand(cmd);
			}
		};
		
		actions.cut = {
			name: 'Press Cut Button',
			options: [],
			callback: async (action) => {
				let cmd = `CUT;`;
				self.sendCommand(cmd);
			}
		};
		
		actions.auto = {
			name: 'Press Auto Button',
			options: [],
			callback: async (action) => {
				let cmd = `ATO;`;
				self.sendCommand(cmd);
			}
		};
		
		actions.pinp1 = {
			name: 'Press PinP 1 Button',
			options: [],
			callback: async (action) => {
				let cmd = `P1S;`;
				self.sendCommand(cmd);
			}
		};
		
		actions.pinp2 = {
			name: 'Press PinP 2 Button',
			options: [],
			callback: async (action) => {
				let cmd = `P2S;`;
				self.sendCommand(cmd);
			}
		};
		
		actions.split = {
			name: 'Press Split Button',
			options: [],
			callback: async (action) => {
				let cmd = `SPS;`;
				self.sendCommand(cmd);
			}
		};
		
		actions.dsk = {
			name: 'Press DSK Button',
			options: [],
			callback: async (action) => {
				let cmd = `DSK;`;
				self.sendCommand(cmd);
			}
		};
		
		actions.dsk_on = {
			name: 'Turn DSK On',
			options: [],
			callback: async (action) => {
				if (self.buttonSet[4] !== '1') {
					let cmd = 'DSK;';
					self.sendCommand(cmd);
				}
			}
		};
		
		actions.dsk_off = {
			name: 'Turn DSK Off',
			options: [],
			callback: async (action) => {
				if (self.buttonSet[4] == '1') {
					let cmd = 'DSK;';
					self.sendCommand(cmd);
				}
			}
		};
		
		actions.dsk_pvw = {
			name: 'Press DSK [PVW] Button',
			options: [],
			callback: async (action) => {
				let cmd = 'DVW;';
				self.sendCommand(cmd);
			}
		};
		
		actions.automixing = {
			name: 'Press Auto Mixing Button',
			options: [],
			callback: async (action) => {
				let cmd = 'ATM';
				self.sendCommand(cmd);
			}
		};
		
		actions.outputfade = {
			name: 'Press Output Fade Button',
			options: [],
			callback: async (action) => {
				let cmd = 'FDE;';
				self.sendCommand(cmd);
			}
		};
		
		actions.pinp1_position = {
			name: 'Adjust PinP 1 Position',
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
			callback: async (action) => {
				let options = action.options;
				let cmd = `PP1:${options.horizontal},${options.vertical};`;
				self.sendCommand(cmd);
			}
		};
		
		actions.pinp2_position = {
			name: 'Adjust PinP 2 Position',
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
			callback: async (action) => {
				let options = action.options;
				let cmd = `PP2:${options.horizontal},${options.vertical};`;
				self.sendCommand(cmd);
			}
		};
		
		actions.split_position = {
			name: 'Adjust Split Position',
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
			callback: async (action) => {
				let options = action.options;
				let cmd = `SPT:${options.value1},${options.value2};`;
				self.sendCommand(cmd);
			}
		};
		
		actions.dsk_selectsource = {
			name: 'During DSK composition, set the channel of the overlaid logo or image',
			options: [
				{
					type: 'dropdown',
					label: 'Source',
					id: 'source',
					default: '0',
					allowCustom: true,
					choices: self.CHOICES_INPUTS,
				},
			],
			callback: async (action) => {
				let options = action.options;
				let source = await self.parseVariablesInString(options.source);
				let cmd = `DSS:${source};`;
				self.sendCommand(cmd);
			}
		};
		
		actions.dsk_keylevel = {
			name: 'Adjust the key level (amount of extraction) for DSK composition',
			options: [
				{
					type: 'textinput',
					label: '0 - 255',
					id: 'level',
					default: '255',
				},
			],
			callback: async (action) => {
				let options = action.options;
				let cmd = `KYL:${options.level};`;
				self.sendCommand(cmd);
			}
		};
		
		actions.dsk_keygain = {
			name: 'Adjust the key gain (semi-transmissive region) for DSK composition',
			options: [
				{
					type: 'textinput',
					label: '0 - 255',
					id: 'level',
					default: '255',
				},
			],
			callback: async (action) => {
				let options = action.options;
				let cmd = `KYG:${options.level};`;
				self.sendCommand(cmd);
			}
		};
		
		actions.select_channel6input = {
			name: 'Select input connector for Channel 6',
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
			callback: async (action) => {
				let options = action.options;
				let cmd = `IPS:${options.inputconnector};`;
				self.sendCommand(cmd);
			}
		};
		
		actions.select_outputbus_sdi1 = {
			name: 'Select output bus for SDI 1',
			options: [
				{
					type: 'dropdown',
					label: 'Bus',
					id: 'bus',
					default: '0',
					choices: self.CHOICES_BUSES,
				},
			],
			callback: async (action) => {
				let options = action.options;
				let cmd = `OS1:${options.bus};`;
				self.sendCommand(cmd);
			}
		};
		
		actions.select_outputbus_sdi2 = {
			name: 'Select output bus for SDI 2',
			options: [
				{
					type: 'dropdown',
					label: 'Bus',
					id: 'bus',
					default: '0',
					choices: self.CHOICES_BUSES,
				},
			],
			callback: async (action) => {
				let options = action.options;
				let cmd = `OS2:${options.bus};`;
				self.sendCommand(cmd);
			}
		};
		
		actions.select_outputbus_hdmi1 = {
			name: 'Select output bus for HDMI 1',
			options: [
				{
					type: 'dropdown',
					label: 'Bus',
					id: 'bus',
					default: '0',
					choices: self.CHOICES_BUSES,
				},
			],
			callback: async (action) => {
				let options = action.options;
				let cmd = `OH1:${options.bus};`;
				self.sendCommand(cmd);
			}
		};
		
		actions.select_outputbus_hdmi2 = {
			name: 'Select output bus for HDMI 2',
			options: [
				{
					type: 'dropdown',
					label: 'Bus',
					id: 'bus',
					default: '0',
					choices: self.CHOICES_BUSES,
				},
			],
			callback: async (action) => {
				let options = action.options;
				let cmd = `OH2:${options.bus};`;
				self.sendCommand(cmd);
			}
		};
		
		actions.hdcp = {
			name: 'Set HDCP On/Off',
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
			callback: async (action) => {
				let options = action.options;
				let cmd = `HCP:${options.hdcpsetting};`;
				self.sendCommand(cmd);
			}
		};
		
		actions.preset = {
			name: 'Call up Preset Memory',
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
			callback: async (action) => {
				let options = action.options;
				let cmd = `MEM:${options.preset};`;
				self.sendCommand(cmd);
			}
		};
		
		actions.audio_mute = {
			name: 'Mute/Unmute Audio',
			options: [
				{
					type: 'dropdown',
					label: 'Audio Source',
					id: 'audiosource',
					default: '0',
					choices: self.CHOICES_MUTES,
				},
			],
			callback: async (action) => {
				let options = action.options;
				let cmd = `IAM:${options.audiosource};`;
				self.sendCommand(cmd);
			}
		};		
		
		self.setActionDefinitions(actions)
	}
}