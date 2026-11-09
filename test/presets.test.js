const test = require('node:test')
const assert = require('node:assert/strict')
const vm = require('node:vm')
const fs = require('node:fs')
const path = require('node:path')
const context = { module: {exports:{}}, require: () => ({combineRgb: (r,g,b)=>(r<<16)|(g<<8)|b}) }
vm.runInNewContext(fs.readFileSync(path.join(__dirname,'../src/presets.js'),'utf8'),context)
test('button presets supply the style required by Companion',()=>{
 let presets
 context.module.exports.initPresets.call({setPresetDefinitions: p=>presets=p})
 assert.equal(presets.length,2)
 for(const p of presets){assert.ok(p.style, p.name+' has no style');assert.equal(typeof p.style.text,'string');assert.equal(p.bank,undefined)}
})
