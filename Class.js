// Extracted from Prototype.js's Class implementation
// See: https://github.com/Rixius/prototype.node.js
var Class;

function extend(destination, source) {
  for (var property in source)
    destination[property] = source[property];
  return destination;
}

function isFunction(object) {
  return Object.prototype.toString.call(object) === '[object Function]';
}

function wrapFunction(fn, wrapper) {
  var __method = fn;
  return function() {
    var a = update([__method.bind(this)], arguments);
    return wrapper.apply(this, a);
  }
}

function updateArguments(array, args) {
  var arrayLength = array.length, length = args.length;
  while (length--) array[arrayLength + length] = args[length];
  return array;
}

function wrap(method, wrapper) {
  return function() {
    var a = updateArguments([method.bind(this)], arguments);
    return wrapper.apply(this, a);
  }
}

function emptyFunction() {}

function argumentNames(fn) {
  var names = fn.toString().match(/^[\s\(]*function[^(]*\(([^)]*)\)/)[1]
    .replace(/\/\/.*?[\r\n]|\/\*(?:.|[\r\n])*?\*\//g, '')
    .replace(/\s+/g, '').split(',');
  return names.length == 1 && !names[0] ? [] : names;
}

var IS_DONTENUM_BUGGY = (function(){
  for (var p in { toString: 1 }) {
    if (p === 'toString') return false;
  }
  return true;
})();

function subclass() {};

function create() {
  var parent = null, properties = [].slice.call(arguments);
  if (isFunction(properties[0]))
    parent = properties.shift();

  function klass() {
    this.initialize.apply(this, arguments);
  }

  extend(klass, Class.Methods);
  klass.superclass = parent;
  klass.subclasses = [];

  if (parent) {
    subclass.prototype = parent.prototype;
    klass.prototype = new subclass;
    parent.subclasses.push(klass);
  }

  for (var i = 0, length = properties.length; i < length; i++)
    klass.addMethods(properties[i]);

  if (!klass.prototype.initialize)
    klass.prototype.initialize = emptyFunction;

  klass.prototype.constructor = klass;
  return klass;
}

function addMethods(source) {
  var ancestor   = this.superclass && this.superclass.prototype,
      properties = Object.keys(source);

  if (IS_DONTENUM_BUGGY) {
    if (source.toString != Object.prototype.toString)
      properties.push("toString");
    if (source.valueOf != Object.prototype.valueOf)
      properties.push("valueOf");
  }

  for (var i = 0, length = properties.length; i < length; i++) {
    var property = properties[i], value = source[property];
    if (ancestor && isFunction(value) &&
        argumentNames(value)[0] == "$super") {
      var method = value;
      value = wrap(
        (function(m) {
          return function() { return ancestor[m].apply(this, arguments); };
        })(property),
        method
      );

      value.valueOf = method.valueOf.bind(method);
      value.toString = method.toString.bind(method);
    }
    this.prototype[property] = value;
  }

  return this;
}

module.exports = Class = {
  create: create,
  Methods: {
    addMethods: addMethods
  }
};
