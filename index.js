// Roland-V60HD

const { InstanceBase, InstanceStatus, runEntrypoint } = require('@companion-module/base')
const UpgradeScripts = require('./src/upgrades')

const config = require('./src/config')
const actions = require('./src/actions')
const feedbacks = require('./src/feedbacks')
const variables = require('./src/variables')
const presets = require('./src/presets')

const utils = require('./src/utils')
const constants = require('./src/constants')

class v60hdInstance extends InstanceBase {
	constructor(internal) {
		super(internal)

		// Assign the methods from the listed files to this class
		Object.assign(this, {
			...config,
			...actions,
			...feedbacks,
			...variables,
			...presets,
			...utils,
			...constants
		});

		this.socket = undefined;

		this.CONTROL_STX = '\u0002';
		this.CONTROL_ACK = '\u0006';

		this.cmdPipe = [];
		this.pollMixerTimer = undefined;
		this.buttonSet = [];
		this.lastReturnedCommand = '';
	}

	async destroy() {
		if (this.socket !== undefined) {
			this.socket.destroy();
		}

		if (this.pollMixerTimer !== undefined) {
			clearInterval(this.pollMixerTimer)
			delete this.pollMixerTimer
		}
	}

	async init(config) {
		this.configUpdated(config);
	}

	async configUpdated(config) {
		this.config = config;

		this.updateStatus(InstanceStatus.Connecting);

		// polling is running and polling has been de-selected by config change
		if (this.pollMixerTimer !== undefined) {
			clearInterval(this.pollMixerTimer)
			delete this.pollMixerTimer
		}
		
		this.initActions();
		this.initFeedbacks();
		this.initVariables();
		this.initPresets();

		this.initTCP();
	}
}

runEntrypoint(v60hdInstance, UpgradeScripts);