const test = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const vm = require('node:vm')
const path = require('node:path')
const context = { module: { exports: {} }, require: () => ({}) }
vm.runInNewContext(fs.readFileSync(path.join(__dirname, '../src/utils.js'), 'utf8'), context)
const utils = context.module.exports
function connection() {
 const sent = []
 const c = { ...utils, CONTROL_STX: '\u0002', cmdPipe: [], socket: { isConnected: true, send: s => sent.push(s) } }
 return { c, sent }
}
test('status query has exactly one STX and one terminator', () => {
 const {c, sent} = connection()
 c.sendQPL()
 assert.deepEqual(sent, ['\u0002QPL:7;'])
})
test('pending status query is not queued twice', () => {
 const {c, sent} = connection()
 c.sendQPL(); c.sendQPL()
 assert.equal(c.cmdPipe.length, 1)
 assert.equal(sent.length, 1)
})
test('queued status query is framed once when preceding command completes', () => {
 const {c, sent} = connection()
 c.sendCommand('PGM:0'); c.sendQPL(); c.cmdPipeNext()
 assert.deepEqual(sent, ['\u0002PGM:0;', '\u0002QPL:7;'])
})
