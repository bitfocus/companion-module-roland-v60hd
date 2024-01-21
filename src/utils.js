const { InstanceStatus, TCPHelper } = require('@companion-module/base')

module.exports = {
	initTCP: function() {
		let self = this;

		let pipeline = '';
	
		if (self.socket !== undefined) {
			self.socket.destroy();
			delete self.socket;
		}
	
		if (self.config.port === undefined) {
			self.config.port = 8023;
		}
	
		if (self.config.host) {
			self.socket = new TCPHelper(self.config.host, self.config.port);
		
			self.socket.on('error', function (err) {
				self.log('error','Network error: ' + err.message);
			});
	
			self.socket.on('connect', function () {
				self.updateStatus(InstanceStatus.Ok);
				self.initPolling();
			});
	
			self.socket.on('data', function(buffer) {
				let indata = buffer.toString('utf8');
				//future feedback can be added here
			});

			self.socket.on('data', (receivebuffer) => {
				pipeline += receivebuffer.toString('utf8')

				// ACKs are sent at the end of the stream result, we should have 1 command to 1 ack
				if (pipeline.includes(self.CONTROL_ACK)) {
					self.lastReturnedCommand = self.cmdPipeNext()
					if (pipeline.length == 1) pipeline = ''
				}

				// Every command ends with ; and an ACK or an ACK if nothing needed; `VER` is the only command that won't return an ACK, which we do not use
				if (pipeline.includes(';')) {
					// multiple rapid Query strings can result in async multiple responses so split response into individual messages
					// however, the documentation for the V-60 says NOT to send more than 1 command before receiving the ACK from the last one,
					// so we should always have one at a time
					let allresponses = pipeline.split(';')
					// last element will either be a partial response, an <ack> (processed next timer tick), or an empty string from split where a complete pipeline ends with ';'
					pipeline = allresponses.pop()
					for (let response of allresponses) {
						response = response.replace(new RegExp(self.CONTROL_ACK, 'g'), '')

						if (response.length > 0) {
							self.processResponse(response)
						}
					}
				}
			})
		}
	},

	cmdPipeNext: function() {
		let self = this;

		const return_cmd = self.cmdPipe.shift()

		if(self.cmdPipe.length > 0) {
			self.socket.send(self.CONTROL_STX + self.cmdPipe[0] + ';')
		}

		return return_cmd
	},

	processResponse: function(response) {
		let self = this;

		let category = 'XXX'
		let args = []

		const errorMessage = (errcode) => {
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
			self.log('error', 'ERR: ' + errstring + ' - Command = ' + self.lastReturnedCommand)
		}
 
		let settingseparator = response.search(':')
		if (settingseparator > 2) {
			category = response.substring(settingseparator - 3, settingseparator)
			let argstring = response.substring(settingseparator + 1, response.length) // from start of params to end of string
			args = argstring.split(',')
		} 
		switch (category) {
			case 'QPL': //button settings array (polled)
				self.buttonSet = args

				self.checkVariables();
				self.checkFeedbacks();
				break
			case 'ERR':
				errorMessage(args[0]);
			break
		}	
	},

	sendCommand: function(cmd) {
		let self = this;

		if (cmd !== undefined) {
			if (self.socket !== undefined && self.socket.isConnected) {
				self.cmdPipe.push(cmd)

				if(self.cmdPipe.length === 1) {
					self.socket.send(self.CONTROL_STX + cmd + ';')
				}
			} else {
				self.log('debug', 'Socket not connected :(');
			}
		}
	},

	initPolling: function() {
		let self = this;

		if (self.pollMixerTimer === undefined && self.config.poll_interval > 0) {
			self.pollMixerTimer = setInterval(self.sendQPL.bind(self), self.config.poll_interval)
		}
	},

	sendQPL: function() {
		let self = this;

		if (!self.cmdPipe.includes('QPL:7')) { // No need to flood the buffer with these
			self.sendCommmand('QPL:7')
		}
	}
}