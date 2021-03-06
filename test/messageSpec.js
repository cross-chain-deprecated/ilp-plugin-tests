'use strict'

const assert = require('chai').assert
const testPlugin = require('..')

const Plugin = testPlugin.plugin

const optsA = testPlugin.options[0].pluginOptions
const optsB = testPlugin.options[1].pluginOptions
const transferA = testPlugin.options[0].transfer
const transferB = testPlugin.options[1].transfer
const timeout = testPlugin.timeout

describe('Plugin messaging', function () {
  beforeEach(function * () {
    // give plenty of time more than the expiry
    this.timeout += timeout * 2

    this.pluginA = new Plugin(optsA)
    this.pluginB = new Plugin(optsB)

    const pA = new Promise(resolve => this.pluginA.once('connect', resolve))
    yield this.pluginA.connect({ timeout })
    yield pA

    const pB = new Promise(resolve => this.pluginB.once('connect', resolve))
    yield this.pluginB.connect({ timeout })
    yield pB

    assert.isTrue(this.pluginA.isConnected())
    assert.isTrue(this.pluginB.isConnected())

    this.prefix = this.pluginA.getInfo().prefix
  })

  afterEach(function * () {
    if (this.pluginA.isConnected()) yield this.pluginA.disconnect()
    if (this.pluginB.isConnected()) yield this.pluginB.disconnect()
  })

  describe('sendMessage', function () {
    it('should be a function', function () {
      assert.isFunction(this.pluginA.sendMessage)
    })

    it('should send a simple message', function (done) {
      this.pluginB.once('incoming_message', (message) => {
        assert.deepEqual(message, {
          ledger: this.prefix,
          account: this.pluginA.getAccount(),
          from: this.pluginA.getAccount(),
          to: transferA.account,
          data: {foo: 'bar'}
        })
        done()
      })

      this.pluginA.sendMessage({
        ledger: this.prefix,
        account: transferA.account,
        data: {foo: 'bar'}
      }).catch(done)
    })

    it('should reject message missing `ledger`', function (done) {
      this.pluginA.sendMessage({
        account: transferA.account,
        data: {foo: 'bar'}
      }).catch((e) => {
        assert.equal(e.name, 'InvalidFieldsError')
        done()
      }).catch(done)
    })

    it('should reject message with an incorrect `ledger`', function (done) {
      this.pluginA.sendMessage({
        ledger: 'fail',
        account: transferA.account,
        data: {foo: 'bar'}
      }).catch((e) => {
        assert.equal(e.name, 'InvalidFieldsError')
        done()
      }).catch(done)
    })

    it('should reject message missing `account`', function (done) {
      this.pluginA.sendMessage({
        ledger: this.prefix,
        data: {foo: 'bar'}
      }).catch((e) => {
        assert.equal(e.name, 'InvalidFieldsError')
        done()
      }).catch(done)
    })

    it('should reject message missing `data`', function (done) {
      this.pluginA.sendMessage({
        ledger: this.prefix,
        account: transferA.account
      }).catch((e) => {
        assert.equal(e.name, 'InvalidFieldsError')
        done()
      }).catch(done)
    })
  })
})
