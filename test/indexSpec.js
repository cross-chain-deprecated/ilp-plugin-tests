'use strict'

const assert = require('chai').assert
const testPlugin = require('..')

const Plugin = testPlugin.plugin

describe('Plugin module', function () {
  it('should be a constructor', function () {
    assert.isFunction(Plugin)
  })
})
