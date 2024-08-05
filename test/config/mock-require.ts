"use strict";
/* eslint-disable no-var, prefer-rest-params, @typescript-eslint/no-this-alias */

const Module = require("module");
const assert = require("assert");

var require: any = function require(path) {
  assert(typeof path == "string", "path must be a string");
  assert(path, "missing path");

  const _this = this;
  const next = function (_path) {
    return Module.prototype.require.next.apply(_this, arguments);
  };

  // console.log('mock-require: requiring <' + path + '> from <' + this.id + '>');

  switch (path) {
    case "punycode":
      // replace module with other
      if (/\/punycode\//.exec(this.filename)) {
        // imports from within original resolve into original module
        return next("punycode");
      } else {
        return next("punycode/");
      }

    default:
      // forward unrecognized modules to previous handler
      // console.log(path);
      return next(path);
  }
};

require.next = Module.prototype.require;

Module.prototype.require = require;

module.exports = {};
