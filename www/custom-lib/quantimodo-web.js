(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.Quantimodo = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict'

exports.byteLength = byteLength
exports.toByteArray = toByteArray
exports.fromByteArray = fromByteArray

var lookup = []
var revLookup = []
var Arr = typeof Uint8Array !== 'undefined' ? Uint8Array : Array

var code = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'
for (var i = 0, len = code.length; i < len; ++i) {
  lookup[i] = code[i]
  revLookup[code.charCodeAt(i)] = i
}

revLookup['-'.charCodeAt(0)] = 62
revLookup['_'.charCodeAt(0)] = 63

function placeHoldersCount (b64) {
  var len = b64.length
  if (len % 4 > 0) {
    throw new Error('Invalid string. Length must be a multiple of 4')
  }

  // the number of equal signs (place holders)
  // if there are two placeholders, than the two characters before it
  // represent one byte
  // if there is only one, then the three characters before it represent 2 bytes
  // this is just a cheap hack to not do indexOf twice
  return b64[len - 2] === '=' ? 2 : b64[len - 1] === '=' ? 1 : 0
}

function byteLength (b64) {
  // base64 is 4/3 + up to two characters of the original data
  return (b64.length * 3 / 4) - placeHoldersCount(b64)
}

function toByteArray (b64) {
  var i, l, tmp, placeHolders, arr
  var len = b64.length
  placeHolders = placeHoldersCount(b64)

  arr = new Arr((len * 3 / 4) - placeHolders)

  // if there are placeholders, only get up to the last complete 4 chars
  l = placeHolders > 0 ? len - 4 : len

  var L = 0

  for (i = 0; i < l; i += 4) {
    tmp = (revLookup[b64.charCodeAt(i)] << 18) | (revLookup[b64.charCodeAt(i + 1)] << 12) | (revLookup[b64.charCodeAt(i + 2)] << 6) | revLookup[b64.charCodeAt(i + 3)]
    arr[L++] = (tmp >> 16) & 0xFF
    arr[L++] = (tmp >> 8) & 0xFF
    arr[L++] = tmp & 0xFF
  }

  if (placeHolders === 2) {
    tmp = (revLookup[b64.charCodeAt(i)] << 2) | (revLookup[b64.charCodeAt(i + 1)] >> 4)
    arr[L++] = tmp & 0xFF
  } else if (placeHolders === 1) {
    tmp = (revLookup[b64.charCodeAt(i)] << 10) | (revLookup[b64.charCodeAt(i + 1)] << 4) | (revLookup[b64.charCodeAt(i + 2)] >> 2)
    arr[L++] = (tmp >> 8) & 0xFF
    arr[L++] = tmp & 0xFF
  }

  return arr
}

function tripletToBase64 (num) {
  return lookup[num >> 18 & 0x3F] + lookup[num >> 12 & 0x3F] + lookup[num >> 6 & 0x3F] + lookup[num & 0x3F]
}

function encodeChunk (uint8, start, end) {
  var tmp
  var output = []
  for (var i = start; i < end; i += 3) {
    tmp = (uint8[i] << 16) + (uint8[i + 1] << 8) + (uint8[i + 2])
    output.push(tripletToBase64(tmp))
  }
  return output.join('')
}

function fromByteArray (uint8) {
  var tmp
  var len = uint8.length
  var extraBytes = len % 3 // if we have 1 byte left, pad 2 bytes
  var output = ''
  var parts = []
  var maxChunkLength = 16383 // must be multiple of 3

  // go through the array every three bytes, we'll deal with trailing stuff later
  for (var i = 0, len2 = len - extraBytes; i < len2; i += maxChunkLength) {
    parts.push(encodeChunk(uint8, i, (i + maxChunkLength) > len2 ? len2 : (i + maxChunkLength)))
  }

  // pad the end with zeros, but make sure to not forget the extra bytes
  if (extraBytes === 1) {
    tmp = uint8[len - 1]
    output += lookup[tmp >> 2]
    output += lookup[(tmp << 4) & 0x3F]
    output += '=='
  } else if (extraBytes === 2) {
    tmp = (uint8[len - 2] << 8) + (uint8[len - 1])
    output += lookup[tmp >> 10]
    output += lookup[(tmp >> 4) & 0x3F]
    output += lookup[(tmp << 2) & 0x3F]
    output += '='
  }

  parts.push(output)

  return parts.join('')
}

},{}],2:[function(require,module,exports){

},{}],3:[function(require,module,exports){
/*!
 * The buffer module from node.js, for the browser.
 *
 * @author   Feross Aboukhadijeh <feross@feross.org> <http://feross.org>
 * @license  MIT
 */
/* eslint-disable no-proto */

'use strict'

var base64 = require('base64-js')
var ieee754 = require('ieee754')

exports.Buffer = Buffer
exports.SlowBuffer = SlowBuffer
exports.INSPECT_MAX_BYTES = 50

var K_MAX_LENGTH = 0x7fffffff
exports.kMaxLength = K_MAX_LENGTH

/**
 * If `Buffer.TYPED_ARRAY_SUPPORT`:
 *   === true    Use Uint8Array implementation (fastest)
 *   === false   Print warning and recommend using `buffer` v4.x which has an Object
 *               implementation (most compatible, even IE6)
 *
 * Browsers that support typed arrays are IE 10+, Firefox 4+, Chrome 7+, Safari 5.1+,
 * Opera 11.6+, iOS 4.2+.
 *
 * We report that the browser does not support typed arrays if the are not subclassable
 * using __proto__. Firefox 4-29 lacks support for adding new properties to `Uint8Array`
 * (See: https://bugzilla.mozilla.org/show_bug.cgi?id=695438). IE 10 lacks support
 * for __proto__ and has a buggy typed array implementation.
 */
Buffer.TYPED_ARRAY_SUPPORT = typedArraySupport()

if (!Buffer.TYPED_ARRAY_SUPPORT && typeof console !== 'undefined' &&
    typeof console.error === 'function') {
  console.error(
    'This browser lacks typed array (Uint8Array) support which is required by ' +
    '`buffer` v5.x. Use `buffer` v4.x if you require old browser support.'
  )
}

function typedArraySupport () {
  // Can typed array instances can be augmented?
  try {
    var arr = new Uint8Array(1)
    arr.__proto__ = {__proto__: Uint8Array.prototype, foo: function () { return 42 }}
    return arr.foo() === 42
  } catch (e) {
    return false
  }
}

function createBuffer (length) {
  if (length > K_MAX_LENGTH) {
    throw new RangeError('Invalid typed array length')
  }
  // Return an augmented `Uint8Array` instance
  var buf = new Uint8Array(length)
  buf.__proto__ = Buffer.prototype
  return buf
}

/**
 * The Buffer constructor returns instances of `Uint8Array` that have their
 * prototype changed to `Buffer.prototype`. Furthermore, `Buffer` is a subclass of
 * `Uint8Array`, so the returned instances will have all the node `Buffer` methods
 * and the `Uint8Array` methods. Square bracket notation works as expected -- it
 * returns a single octet.
 *
 * The `Uint8Array` prototype remains unmodified.
 */

function Buffer (arg, encodingOrOffset, length) {
  // Common case.
  if (typeof arg === 'number') {
    if (typeof encodingOrOffset === 'string') {
      throw new Error(
        'If encoding is specified then the first argument must be a string'
      )
    }
    return allocUnsafe(arg)
  }
  return from(arg, encodingOrOffset, length)
}

// Fix subarray() in ES2016. See: https://github.com/feross/buffer/pull/97
if (typeof Symbol !== 'undefined' && Symbol.species &&
    Buffer[Symbol.species] === Buffer) {
  Object.defineProperty(Buffer, Symbol.species, {
    value: null,
    configurable: true,
    enumerable: false,
    writable: false
  })
}

Buffer.poolSize = 8192 // not used by this implementation

function from (value, encodingOrOffset, length) {
  if (typeof value === 'number') {
    throw new TypeError('"value" argument must not be a number')
  }

  if (isArrayBuffer(value)) {
    return fromArrayBuffer(value, encodingOrOffset, length)
  }

  if (typeof value === 'string') {
    return fromString(value, encodingOrOffset)
  }

  return fromObject(value)
}

/**
 * Functionally equivalent to Buffer(arg, encoding) but throws a TypeError
 * if value is a number.
 * Buffer.from(str[, encoding])
 * Buffer.from(array)
 * Buffer.from(buffer)
 * Buffer.from(arrayBuffer[, byteOffset[, length]])
 **/
Buffer.from = function (value, encodingOrOffset, length) {
  return from(value, encodingOrOffset, length)
}

// Note: Change prototype *after* Buffer.from is defined to workaround Chrome bug:
// https://github.com/feross/buffer/pull/148
Buffer.prototype.__proto__ = Uint8Array.prototype
Buffer.__proto__ = Uint8Array

function assertSize (size) {
  if (typeof size !== 'number') {
    throw new TypeError('"size" argument must be a number')
  } else if (size < 0) {
    throw new RangeError('"size" argument must not be negative')
  }
}

function alloc (size, fill, encoding) {
  assertSize(size)
  if (size <= 0) {
    return createBuffer(size)
  }
  if (fill !== undefined) {
    // Only pay attention to encoding if it's a string. This
    // prevents accidentally sending in a number that would
    // be interpretted as a start offset.
    return typeof encoding === 'string'
      ? createBuffer(size).fill(fill, encoding)
      : createBuffer(size).fill(fill)
  }
  return createBuffer(size)
}

/**
 * Creates a new filled Buffer instance.
 * alloc(size[, fill[, encoding]])
 **/
Buffer.alloc = function (size, fill, encoding) {
  return alloc(size, fill, encoding)
}

function allocUnsafe (size) {
  assertSize(size)
  return createBuffer(size < 0 ? 0 : checked(size) | 0)
}

/**
 * Equivalent to Buffer(num), by default creates a non-zero-filled Buffer instance.
 * */
Buffer.allocUnsafe = function (size) {
  return allocUnsafe(size)
}
/**
 * Equivalent to SlowBuffer(num), by default creates a non-zero-filled Buffer instance.
 */
Buffer.allocUnsafeSlow = function (size) {
  return allocUnsafe(size)
}

function fromString (string, encoding) {
  if (typeof encoding !== 'string' || encoding === '') {
    encoding = 'utf8'
  }

  if (!Buffer.isEncoding(encoding)) {
    throw new TypeError('"encoding" must be a valid string encoding')
  }

  var length = byteLength(string, encoding) | 0
  var buf = createBuffer(length)

  var actual = buf.write(string, encoding)

  if (actual !== length) {
    // Writing a hex string, for example, that contains invalid characters will
    // cause everything after the first invalid character to be ignored. (e.g.
    // 'abxxcd' will be treated as 'ab')
    buf = buf.slice(0, actual)
  }

  return buf
}

function fromArrayLike (array) {
  var length = array.length < 0 ? 0 : checked(array.length) | 0
  var buf = createBuffer(length)
  for (var i = 0; i < length; i += 1) {
    buf[i] = array[i] & 255
  }
  return buf
}

function fromArrayBuffer (array, byteOffset, length) {
  if (byteOffset < 0 || array.byteLength < byteOffset) {
    throw new RangeError('\'offset\' is out of bounds')
  }

  if (array.byteLength < byteOffset + (length || 0)) {
    throw new RangeError('\'length\' is out of bounds')
  }

  var buf
  if (byteOffset === undefined && length === undefined) {
    buf = new Uint8Array(array)
  } else if (length === undefined) {
    buf = new Uint8Array(array, byteOffset)
  } else {
    buf = new Uint8Array(array, byteOffset, length)
  }

  // Return an augmented `Uint8Array` instance
  buf.__proto__ = Buffer.prototype
  return buf
}

function fromObject (obj) {
  if (Buffer.isBuffer(obj)) {
    var len = checked(obj.length) | 0
    var buf = createBuffer(len)

    if (buf.length === 0) {
      return buf
    }

    obj.copy(buf, 0, 0, len)
    return buf
  }

  if (obj) {
    if (isArrayBufferView(obj) || 'length' in obj) {
      if (typeof obj.length !== 'number' || numberIsNaN(obj.length)) {
        return createBuffer(0)
      }
      return fromArrayLike(obj)
    }

    if (obj.type === 'Buffer' && Array.isArray(obj.data)) {
      return fromArrayLike(obj.data)
    }
  }

  throw new TypeError('First argument must be a string, Buffer, ArrayBuffer, Array, or array-like object.')
}

function checked (length) {
  // Note: cannot use `length < K_MAX_LENGTH` here because that fails when
  // length is NaN (which is otherwise coerced to zero.)
  if (length >= K_MAX_LENGTH) {
    throw new RangeError('Attempt to allocate Buffer larger than maximum ' +
                         'size: 0x' + K_MAX_LENGTH.toString(16) + ' bytes')
  }
  return length | 0
}

function SlowBuffer (length) {
  if (+length != length) { // eslint-disable-line eqeqeq
    length = 0
  }
  return Buffer.alloc(+length)
}

Buffer.isBuffer = function isBuffer (b) {
  return b != null && b._isBuffer === true
}

Buffer.compare = function compare (a, b) {
  if (!Buffer.isBuffer(a) || !Buffer.isBuffer(b)) {
    throw new TypeError('Arguments must be Buffers')
  }

  if (a === b) return 0

  var x = a.length
  var y = b.length

  for (var i = 0, len = Math.min(x, y); i < len; ++i) {
    if (a[i] !== b[i]) {
      x = a[i]
      y = b[i]
      break
    }
  }

  if (x < y) return -1
  if (y < x) return 1
  return 0
}

Buffer.isEncoding = function isEncoding (encoding) {
  switch (String(encoding).toLowerCase()) {
    case 'hex':
    case 'utf8':
    case 'utf-8':
    case 'ascii':
    case 'latin1':
    case 'binary':
    case 'base64':
    case 'ucs2':
    case 'ucs-2':
    case 'utf16le':
    case 'utf-16le':
      return true
    default:
      return false
  }
}

Buffer.concat = function concat (list, length) {
  if (!Array.isArray(list)) {
    throw new TypeError('"list" argument must be an Array of Buffers')
  }

  if (list.length === 0) {
    return Buffer.alloc(0)
  }

  var i
  if (length === undefined) {
    length = 0
    for (i = 0; i < list.length; ++i) {
      length += list[i].length
    }
  }

  var buffer = Buffer.allocUnsafe(length)
  var pos = 0
  for (i = 0; i < list.length; ++i) {
    var buf = list[i]
    if (!Buffer.isBuffer(buf)) {
      throw new TypeError('"list" argument must be an Array of Buffers')
    }
    buf.copy(buffer, pos)
    pos += buf.length
  }
  return buffer
}

function byteLength (string, encoding) {
  if (Buffer.isBuffer(string)) {
    return string.length
  }
  if (isArrayBufferView(string) || isArrayBuffer(string)) {
    return string.byteLength
  }
  if (typeof string !== 'string') {
    string = '' + string
  }

  var len = string.length
  if (len === 0) return 0

  // Use a for loop to avoid recursion
  var loweredCase = false
  for (;;) {
    switch (encoding) {
      case 'ascii':
      case 'latin1':
      case 'binary':
        return len
      case 'utf8':
      case 'utf-8':
      case undefined:
        return utf8ToBytes(string).length
      case 'ucs2':
      case 'ucs-2':
      case 'utf16le':
      case 'utf-16le':
        return len * 2
      case 'hex':
        return len >>> 1
      case 'base64':
        return base64ToBytes(string).length
      default:
        if (loweredCase) return utf8ToBytes(string).length // assume utf8
        encoding = ('' + encoding).toLowerCase()
        loweredCase = true
    }
  }
}
Buffer.byteLength = byteLength

function slowToString (encoding, start, end) {
  var loweredCase = false

  // No need to verify that "this.length <= MAX_UINT32" since it's a read-only
  // property of a typed array.

  // This behaves neither like String nor Uint8Array in that we set start/end
  // to their upper/lower bounds if the value passed is out of range.
  // undefined is handled specially as per ECMA-262 6th Edition,
  // Section 13.3.3.7 Runtime Semantics: KeyedBindingInitialization.
  if (start === undefined || start < 0) {
    start = 0
  }
  // Return early if start > this.length. Done here to prevent potential uint32
  // coercion fail below.
  if (start > this.length) {
    return ''
  }

  if (end === undefined || end > this.length) {
    end = this.length
  }

  if (end <= 0) {
    return ''
  }

  // Force coersion to uint32. This will also coerce falsey/NaN values to 0.
  end >>>= 0
  start >>>= 0

  if (end <= start) {
    return ''
  }

  if (!encoding) encoding = 'utf8'

  while (true) {
    switch (encoding) {
      case 'hex':
        return hexSlice(this, start, end)

      case 'utf8':
      case 'utf-8':
        return utf8Slice(this, start, end)

      case 'ascii':
        return asciiSlice(this, start, end)

      case 'latin1':
      case 'binary':
        return latin1Slice(this, start, end)

      case 'base64':
        return base64Slice(this, start, end)

      case 'ucs2':
      case 'ucs-2':
      case 'utf16le':
      case 'utf-16le':
        return utf16leSlice(this, start, end)

      default:
        if (loweredCase) throw new TypeError('Unknown encoding: ' + encoding)
        encoding = (encoding + '').toLowerCase()
        loweredCase = true
    }
  }
}

// This property is used by `Buffer.isBuffer` (and the `is-buffer` npm package)
// to detect a Buffer instance. It's not possible to use `instanceof Buffer`
// reliably in a browserify context because there could be multiple different
// copies of the 'buffer' package in use. This method works even for Buffer
// instances that were created from another copy of the `buffer` package.
// See: https://github.com/feross/buffer/issues/154
Buffer.prototype._isBuffer = true

function swap (b, n, m) {
  var i = b[n]
  b[n] = b[m]
  b[m] = i
}

Buffer.prototype.swap16 = function swap16 () {
  var len = this.length
  if (len % 2 !== 0) {
    throw new RangeError('Buffer size must be a multiple of 16-bits')
  }
  for (var i = 0; i < len; i += 2) {
    swap(this, i, i + 1)
  }
  return this
}

Buffer.prototype.swap32 = function swap32 () {
  var len = this.length
  if (len % 4 !== 0) {
    throw new RangeError('Buffer size must be a multiple of 32-bits')
  }
  for (var i = 0; i < len; i += 4) {
    swap(this, i, i + 3)
    swap(this, i + 1, i + 2)
  }
  return this
}

Buffer.prototype.swap64 = function swap64 () {
  var len = this.length
  if (len % 8 !== 0) {
    throw new RangeError('Buffer size must be a multiple of 64-bits')
  }
  for (var i = 0; i < len; i += 8) {
    swap(this, i, i + 7)
    swap(this, i + 1, i + 6)
    swap(this, i + 2, i + 5)
    swap(this, i + 3, i + 4)
  }
  return this
}

Buffer.prototype.toString = function toString () {
  var length = this.length
  if (length === 0) return ''
  if (arguments.length === 0) return utf8Slice(this, 0, length)
  return slowToString.apply(this, arguments)
}

Buffer.prototype.equals = function equals (b) {
  if (!Buffer.isBuffer(b)) throw new TypeError('Argument must be a Buffer')
  if (this === b) return true
  return Buffer.compare(this, b) === 0
}

Buffer.prototype.inspect = function inspect () {
  var str = ''
  var max = exports.INSPECT_MAX_BYTES
  if (this.length > 0) {
    str = this.toString('hex', 0, max).match(/.{2}/g).join(' ')
    if (this.length > max) str += ' ... '
  }
  return '<Buffer ' + str + '>'
}

Buffer.prototype.compare = function compare (target, start, end, thisStart, thisEnd) {
  if (!Buffer.isBuffer(target)) {
    throw new TypeError('Argument must be a Buffer')
  }

  if (start === undefined) {
    start = 0
  }
  if (end === undefined) {
    end = target ? target.length : 0
  }
  if (thisStart === undefined) {
    thisStart = 0
  }
  if (thisEnd === undefined) {
    thisEnd = this.length
  }

  if (start < 0 || end > target.length || thisStart < 0 || thisEnd > this.length) {
    throw new RangeError('out of range index')
  }

  if (thisStart >= thisEnd && start >= end) {
    return 0
  }
  if (thisStart >= thisEnd) {
    return -1
  }
  if (start >= end) {
    return 1
  }

  start >>>= 0
  end >>>= 0
  thisStart >>>= 0
  thisEnd >>>= 0

  if (this === target) return 0

  var x = thisEnd - thisStart
  var y = end - start
  var len = Math.min(x, y)

  var thisCopy = this.slice(thisStart, thisEnd)
  var targetCopy = target.slice(start, end)

  for (var i = 0; i < len; ++i) {
    if (thisCopy[i] !== targetCopy[i]) {
      x = thisCopy[i]
      y = targetCopy[i]
      break
    }
  }

  if (x < y) return -1
  if (y < x) return 1
  return 0
}

// Finds either the first index of `val` in `buffer` at offset >= `byteOffset`,
// OR the last index of `val` in `buffer` at offset <= `byteOffset`.
//
// Arguments:
// - buffer - a Buffer to search
// - val - a string, Buffer, or number
// - byteOffset - an index into `buffer`; will be clamped to an int32
// - encoding - an optional encoding, relevant is val is a string
// - dir - true for indexOf, false for lastIndexOf
function bidirectionalIndexOf (buffer, val, byteOffset, encoding, dir) {
  // Empty buffer means no match
  if (buffer.length === 0) return -1

  // Normalize byteOffset
  if (typeof byteOffset === 'string') {
    encoding = byteOffset
    byteOffset = 0
  } else if (byteOffset > 0x7fffffff) {
    byteOffset = 0x7fffffff
  } else if (byteOffset < -0x80000000) {
    byteOffset = -0x80000000
  }
  byteOffset = +byteOffset  // Coerce to Number.
  if (numberIsNaN(byteOffset)) {
    // byteOffset: it it's undefined, null, NaN, "foo", etc, search whole buffer
    byteOffset = dir ? 0 : (buffer.length - 1)
  }

  // Normalize byteOffset: negative offsets start from the end of the buffer
  if (byteOffset < 0) byteOffset = buffer.length + byteOffset
  if (byteOffset >= buffer.length) {
    if (dir) return -1
    else byteOffset = buffer.length - 1
  } else if (byteOffset < 0) {
    if (dir) byteOffset = 0
    else return -1
  }

  // Normalize val
  if (typeof val === 'string') {
    val = Buffer.from(val, encoding)
  }

  // Finally, search either indexOf (if dir is true) or lastIndexOf
  if (Buffer.isBuffer(val)) {
    // Special case: looking for empty string/buffer always fails
    if (val.length === 0) {
      return -1
    }
    return arrayIndexOf(buffer, val, byteOffset, encoding, dir)
  } else if (typeof val === 'number') {
    val = val & 0xFF // Search for a byte value [0-255]
    if (typeof Uint8Array.prototype.indexOf === 'function') {
      if (dir) {
        return Uint8Array.prototype.indexOf.call(buffer, val, byteOffset)
      } else {
        return Uint8Array.prototype.lastIndexOf.call(buffer, val, byteOffset)
      }
    }
    return arrayIndexOf(buffer, [ val ], byteOffset, encoding, dir)
  }

  throw new TypeError('val must be string, number or Buffer')
}

function arrayIndexOf (arr, val, byteOffset, encoding, dir) {
  var indexSize = 1
  var arrLength = arr.length
  var valLength = val.length

  if (encoding !== undefined) {
    encoding = String(encoding).toLowerCase()
    if (encoding === 'ucs2' || encoding === 'ucs-2' ||
        encoding === 'utf16le' || encoding === 'utf-16le') {
      if (arr.length < 2 || val.length < 2) {
        return -1
      }
      indexSize = 2
      arrLength /= 2
      valLength /= 2
      byteOffset /= 2
    }
  }

  function read (buf, i) {
    if (indexSize === 1) {
      return buf[i]
    } else {
      return buf.readUInt16BE(i * indexSize)
    }
  }

  var i
  if (dir) {
    var foundIndex = -1
    for (i = byteOffset; i < arrLength; i++) {
      if (read(arr, i) === read(val, foundIndex === -1 ? 0 : i - foundIndex)) {
        if (foundIndex === -1) foundIndex = i
        if (i - foundIndex + 1 === valLength) return foundIndex * indexSize
      } else {
        if (foundIndex !== -1) i -= i - foundIndex
        foundIndex = -1
      }
    }
  } else {
    if (byteOffset + valLength > arrLength) byteOffset = arrLength - valLength
    for (i = byteOffset; i >= 0; i--) {
      var found = true
      for (var j = 0; j < valLength; j++) {
        if (read(arr, i + j) !== read(val, j)) {
          found = false
          break
        }
      }
      if (found) return i
    }
  }

  return -1
}

Buffer.prototype.includes = function includes (val, byteOffset, encoding) {
  return this.indexOf(val, byteOffset, encoding) !== -1
}

Buffer.prototype.indexOf = function indexOf (val, byteOffset, encoding) {
  return bidirectionalIndexOf(this, val, byteOffset, encoding, true)
}

Buffer.prototype.lastIndexOf = function lastIndexOf (val, byteOffset, encoding) {
  return bidirectionalIndexOf(this, val, byteOffset, encoding, false)
}

function hexWrite (buf, string, offset, length) {
  offset = Number(offset) || 0
  var remaining = buf.length - offset
  if (!length) {
    length = remaining
  } else {
    length = Number(length)
    if (length > remaining) {
      length = remaining
    }
  }

  // must be an even number of digits
  var strLen = string.length
  if (strLen % 2 !== 0) throw new TypeError('Invalid hex string')

  if (length > strLen / 2) {
    length = strLen / 2
  }
  for (var i = 0; i < length; ++i) {
    var parsed = parseInt(string.substr(i * 2, 2), 16)
    if (numberIsNaN(parsed)) return i
    buf[offset + i] = parsed
  }
  return i
}

function utf8Write (buf, string, offset, length) {
  return blitBuffer(utf8ToBytes(string, buf.length - offset), buf, offset, length)
}

function asciiWrite (buf, string, offset, length) {
  return blitBuffer(asciiToBytes(string), buf, offset, length)
}

function latin1Write (buf, string, offset, length) {
  return asciiWrite(buf, string, offset, length)
}

function base64Write (buf, string, offset, length) {
  return blitBuffer(base64ToBytes(string), buf, offset, length)
}

function ucs2Write (buf, string, offset, length) {
  return blitBuffer(utf16leToBytes(string, buf.length - offset), buf, offset, length)
}

Buffer.prototype.write = function write (string, offset, length, encoding) {
  // Buffer#write(string)
  if (offset === undefined) {
    encoding = 'utf8'
    length = this.length
    offset = 0
  // Buffer#write(string, encoding)
  } else if (length === undefined && typeof offset === 'string') {
    encoding = offset
    length = this.length
    offset = 0
  // Buffer#write(string, offset[, length][, encoding])
  } else if (isFinite(offset)) {
    offset = offset >>> 0
    if (isFinite(length)) {
      length = length >>> 0
      if (encoding === undefined) encoding = 'utf8'
    } else {
      encoding = length
      length = undefined
    }
  } else {
    throw new Error(
      'Buffer.write(string, encoding, offset[, length]) is no longer supported'
    )
  }

  var remaining = this.length - offset
  if (length === undefined || length > remaining) length = remaining

  if ((string.length > 0 && (length < 0 || offset < 0)) || offset > this.length) {
    throw new RangeError('Attempt to write outside buffer bounds')
  }

  if (!encoding) encoding = 'utf8'

  var loweredCase = false
  for (;;) {
    switch (encoding) {
      case 'hex':
        return hexWrite(this, string, offset, length)

      case 'utf8':
      case 'utf-8':
        return utf8Write(this, string, offset, length)

      case 'ascii':
        return asciiWrite(this, string, offset, length)

      case 'latin1':
      case 'binary':
        return latin1Write(this, string, offset, length)

      case 'base64':
        // Warning: maxLength not taken into account in base64Write
        return base64Write(this, string, offset, length)

      case 'ucs2':
      case 'ucs-2':
      case 'utf16le':
      case 'utf-16le':
        return ucs2Write(this, string, offset, length)

      default:
        if (loweredCase) throw new TypeError('Unknown encoding: ' + encoding)
        encoding = ('' + encoding).toLowerCase()
        loweredCase = true
    }
  }
}

Buffer.prototype.toJSON = function toJSON () {
  return {
    type: 'Buffer',
    data: Array.prototype.slice.call(this._arr || this, 0)
  }
}

function base64Slice (buf, start, end) {
  if (start === 0 && end === buf.length) {
    return base64.fromByteArray(buf)
  } else {
    return base64.fromByteArray(buf.slice(start, end))
  }
}

function utf8Slice (buf, start, end) {
  end = Math.min(buf.length, end)
  var res = []

  var i = start
  while (i < end) {
    var firstByte = buf[i]
    var codePoint = null
    var bytesPerSequence = (firstByte > 0xEF) ? 4
      : (firstByte > 0xDF) ? 3
      : (firstByte > 0xBF) ? 2
      : 1

    if (i + bytesPerSequence <= end) {
      var secondByte, thirdByte, fourthByte, tempCodePoint

      switch (bytesPerSequence) {
        case 1:
          if (firstByte < 0x80) {
            codePoint = firstByte
          }
          break
        case 2:
          secondByte = buf[i + 1]
          if ((secondByte & 0xC0) === 0x80) {
            tempCodePoint = (firstByte & 0x1F) << 0x6 | (secondByte & 0x3F)
            if (tempCodePoint > 0x7F) {
              codePoint = tempCodePoint
            }
          }
          break
        case 3:
          secondByte = buf[i + 1]
          thirdByte = buf[i + 2]
          if ((secondByte & 0xC0) === 0x80 && (thirdByte & 0xC0) === 0x80) {
            tempCodePoint = (firstByte & 0xF) << 0xC | (secondByte & 0x3F) << 0x6 | (thirdByte & 0x3F)
            if (tempCodePoint > 0x7FF && (tempCodePoint < 0xD800 || tempCodePoint > 0xDFFF)) {
              codePoint = tempCodePoint
            }
          }
          break
        case 4:
          secondByte = buf[i + 1]
          thirdByte = buf[i + 2]
          fourthByte = buf[i + 3]
          if ((secondByte & 0xC0) === 0x80 && (thirdByte & 0xC0) === 0x80 && (fourthByte & 0xC0) === 0x80) {
            tempCodePoint = (firstByte & 0xF) << 0x12 | (secondByte & 0x3F) << 0xC | (thirdByte & 0x3F) << 0x6 | (fourthByte & 0x3F)
            if (tempCodePoint > 0xFFFF && tempCodePoint < 0x110000) {
              codePoint = tempCodePoint
            }
          }
      }
    }

    if (codePoint === null) {
      // we did not generate a valid codePoint so insert a
      // replacement char (U+FFFD) and advance only 1 byte
      codePoint = 0xFFFD
      bytesPerSequence = 1
    } else if (codePoint > 0xFFFF) {
      // encode to utf16 (surrogate pair dance)
      codePoint -= 0x10000
      res.push(codePoint >>> 10 & 0x3FF | 0xD800)
      codePoint = 0xDC00 | codePoint & 0x3FF
    }

    res.push(codePoint)
    i += bytesPerSequence
  }

  return decodeCodePointsArray(res)
}

// Based on http://stackoverflow.com/a/22747272/680742, the browser with
// the lowest limit is Chrome, with 0x10000 args.
// We go 1 magnitude less, for safety
var MAX_ARGUMENTS_LENGTH = 0x1000

function decodeCodePointsArray (codePoints) {
  var len = codePoints.length
  if (len <= MAX_ARGUMENTS_LENGTH) {
    return String.fromCharCode.apply(String, codePoints) // avoid extra slice()
  }

  // Decode in chunks to avoid "call stack size exceeded".
  var res = ''
  var i = 0
  while (i < len) {
    res += String.fromCharCode.apply(
      String,
      codePoints.slice(i, i += MAX_ARGUMENTS_LENGTH)
    )
  }
  return res
}

function asciiSlice (buf, start, end) {
  var ret = ''
  end = Math.min(buf.length, end)

  for (var i = start; i < end; ++i) {
    ret += String.fromCharCode(buf[i] & 0x7F)
  }
  return ret
}

function latin1Slice (buf, start, end) {
  var ret = ''
  end = Math.min(buf.length, end)

  for (var i = start; i < end; ++i) {
    ret += String.fromCharCode(buf[i])
  }
  return ret
}

function hexSlice (buf, start, end) {
  var len = buf.length

  if (!start || start < 0) start = 0
  if (!end || end < 0 || end > len) end = len

  var out = ''
  for (var i = start; i < end; ++i) {
    out += toHex(buf[i])
  }
  return out
}

function utf16leSlice (buf, start, end) {
  var bytes = buf.slice(start, end)
  var res = ''
  for (var i = 0; i < bytes.length; i += 2) {
    res += String.fromCharCode(bytes[i] + (bytes[i + 1] * 256))
  }
  return res
}

Buffer.prototype.slice = function slice (start, end) {
  var len = this.length
  start = ~~start
  end = end === undefined ? len : ~~end

  if (start < 0) {
    start += len
    if (start < 0) start = 0
  } else if (start > len) {
    start = len
  }

  if (end < 0) {
    end += len
    if (end < 0) end = 0
  } else if (end > len) {
    end = len
  }

  if (end < start) end = start

  var newBuf = this.subarray(start, end)
  // Return an augmented `Uint8Array` instance
  newBuf.__proto__ = Buffer.prototype
  return newBuf
}

/*
 * Need to make sure that buffer isn't trying to write out of bounds.
 */
function checkOffset (offset, ext, length) {
  if ((offset % 1) !== 0 || offset < 0) throw new RangeError('offset is not uint')
  if (offset + ext > length) throw new RangeError('Trying to access beyond buffer length')
}

Buffer.prototype.readUIntLE = function readUIntLE (offset, byteLength, noAssert) {
  offset = offset >>> 0
  byteLength = byteLength >>> 0
  if (!noAssert) checkOffset(offset, byteLength, this.length)

  var val = this[offset]
  var mul = 1
  var i = 0
  while (++i < byteLength && (mul *= 0x100)) {
    val += this[offset + i] * mul
  }

  return val
}

Buffer.prototype.readUIntBE = function readUIntBE (offset, byteLength, noAssert) {
  offset = offset >>> 0
  byteLength = byteLength >>> 0
  if (!noAssert) {
    checkOffset(offset, byteLength, this.length)
  }

  var val = this[offset + --byteLength]
  var mul = 1
  while (byteLength > 0 && (mul *= 0x100)) {
    val += this[offset + --byteLength] * mul
  }

  return val
}

Buffer.prototype.readUInt8 = function readUInt8 (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 1, this.length)
  return this[offset]
}

Buffer.prototype.readUInt16LE = function readUInt16LE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 2, this.length)
  return this[offset] | (this[offset + 1] << 8)
}

Buffer.prototype.readUInt16BE = function readUInt16BE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 2, this.length)
  return (this[offset] << 8) | this[offset + 1]
}

Buffer.prototype.readUInt32LE = function readUInt32LE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 4, this.length)

  return ((this[offset]) |
      (this[offset + 1] << 8) |
      (this[offset + 2] << 16)) +
      (this[offset + 3] * 0x1000000)
}

Buffer.prototype.readUInt32BE = function readUInt32BE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 4, this.length)

  return (this[offset] * 0x1000000) +
    ((this[offset + 1] << 16) |
    (this[offset + 2] << 8) |
    this[offset + 3])
}

Buffer.prototype.readIntLE = function readIntLE (offset, byteLength, noAssert) {
  offset = offset >>> 0
  byteLength = byteLength >>> 0
  if (!noAssert) checkOffset(offset, byteLength, this.length)

  var val = this[offset]
  var mul = 1
  var i = 0
  while (++i < byteLength && (mul *= 0x100)) {
    val += this[offset + i] * mul
  }
  mul *= 0x80

  if (val >= mul) val -= Math.pow(2, 8 * byteLength)

  return val
}

Buffer.prototype.readIntBE = function readIntBE (offset, byteLength, noAssert) {
  offset = offset >>> 0
  byteLength = byteLength >>> 0
  if (!noAssert) checkOffset(offset, byteLength, this.length)

  var i = byteLength
  var mul = 1
  var val = this[offset + --i]
  while (i > 0 && (mul *= 0x100)) {
    val += this[offset + --i] * mul
  }
  mul *= 0x80

  if (val >= mul) val -= Math.pow(2, 8 * byteLength)

  return val
}

Buffer.prototype.readInt8 = function readInt8 (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 1, this.length)
  if (!(this[offset] & 0x80)) return (this[offset])
  return ((0xff - this[offset] + 1) * -1)
}

Buffer.prototype.readInt16LE = function readInt16LE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 2, this.length)
  var val = this[offset] | (this[offset + 1] << 8)
  return (val & 0x8000) ? val | 0xFFFF0000 : val
}

Buffer.prototype.readInt16BE = function readInt16BE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 2, this.length)
  var val = this[offset + 1] | (this[offset] << 8)
  return (val & 0x8000) ? val | 0xFFFF0000 : val
}

Buffer.prototype.readInt32LE = function readInt32LE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 4, this.length)

  return (this[offset]) |
    (this[offset + 1] << 8) |
    (this[offset + 2] << 16) |
    (this[offset + 3] << 24)
}

Buffer.prototype.readInt32BE = function readInt32BE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 4, this.length)

  return (this[offset] << 24) |
    (this[offset + 1] << 16) |
    (this[offset + 2] << 8) |
    (this[offset + 3])
}

Buffer.prototype.readFloatLE = function readFloatLE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 4, this.length)
  return ieee754.read(this, offset, true, 23, 4)
}

Buffer.prototype.readFloatBE = function readFloatBE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 4, this.length)
  return ieee754.read(this, offset, false, 23, 4)
}

Buffer.prototype.readDoubleLE = function readDoubleLE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 8, this.length)
  return ieee754.read(this, offset, true, 52, 8)
}

Buffer.prototype.readDoubleBE = function readDoubleBE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 8, this.length)
  return ieee754.read(this, offset, false, 52, 8)
}

function checkInt (buf, value, offset, ext, max, min) {
  if (!Buffer.isBuffer(buf)) throw new TypeError('"buffer" argument must be a Buffer instance')
  if (value > max || value < min) throw new RangeError('"value" argument is out of bounds')
  if (offset + ext > buf.length) throw new RangeError('Index out of range')
}

Buffer.prototype.writeUIntLE = function writeUIntLE (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset >>> 0
  byteLength = byteLength >>> 0
  if (!noAssert) {
    var maxBytes = Math.pow(2, 8 * byteLength) - 1
    checkInt(this, value, offset, byteLength, maxBytes, 0)
  }

  var mul = 1
  var i = 0
  this[offset] = value & 0xFF
  while (++i < byteLength && (mul *= 0x100)) {
    this[offset + i] = (value / mul) & 0xFF
  }

  return offset + byteLength
}

Buffer.prototype.writeUIntBE = function writeUIntBE (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset >>> 0
  byteLength = byteLength >>> 0
  if (!noAssert) {
    var maxBytes = Math.pow(2, 8 * byteLength) - 1
    checkInt(this, value, offset, byteLength, maxBytes, 0)
  }

  var i = byteLength - 1
  var mul = 1
  this[offset + i] = value & 0xFF
  while (--i >= 0 && (mul *= 0x100)) {
    this[offset + i] = (value / mul) & 0xFF
  }

  return offset + byteLength
}

Buffer.prototype.writeUInt8 = function writeUInt8 (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 1, 0xff, 0)
  this[offset] = (value & 0xff)
  return offset + 1
}

Buffer.prototype.writeUInt16LE = function writeUInt16LE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 2, 0xffff, 0)
  this[offset] = (value & 0xff)
  this[offset + 1] = (value >>> 8)
  return offset + 2
}

Buffer.prototype.writeUInt16BE = function writeUInt16BE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 2, 0xffff, 0)
  this[offset] = (value >>> 8)
  this[offset + 1] = (value & 0xff)
  return offset + 2
}

Buffer.prototype.writeUInt32LE = function writeUInt32LE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 4, 0xffffffff, 0)
  this[offset + 3] = (value >>> 24)
  this[offset + 2] = (value >>> 16)
  this[offset + 1] = (value >>> 8)
  this[offset] = (value & 0xff)
  return offset + 4
}

Buffer.prototype.writeUInt32BE = function writeUInt32BE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 4, 0xffffffff, 0)
  this[offset] = (value >>> 24)
  this[offset + 1] = (value >>> 16)
  this[offset + 2] = (value >>> 8)
  this[offset + 3] = (value & 0xff)
  return offset + 4
}

Buffer.prototype.writeIntLE = function writeIntLE (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) {
    var limit = Math.pow(2, (8 * byteLength) - 1)

    checkInt(this, value, offset, byteLength, limit - 1, -limit)
  }

  var i = 0
  var mul = 1
  var sub = 0
  this[offset] = value & 0xFF
  while (++i < byteLength && (mul *= 0x100)) {
    if (value < 0 && sub === 0 && this[offset + i - 1] !== 0) {
      sub = 1
    }
    this[offset + i] = ((value / mul) >> 0) - sub & 0xFF
  }

  return offset + byteLength
}

Buffer.prototype.writeIntBE = function writeIntBE (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) {
    var limit = Math.pow(2, (8 * byteLength) - 1)

    checkInt(this, value, offset, byteLength, limit - 1, -limit)
  }

  var i = byteLength - 1
  var mul = 1
  var sub = 0
  this[offset + i] = value & 0xFF
  while (--i >= 0 && (mul *= 0x100)) {
    if (value < 0 && sub === 0 && this[offset + i + 1] !== 0) {
      sub = 1
    }
    this[offset + i] = ((value / mul) >> 0) - sub & 0xFF
  }

  return offset + byteLength
}

Buffer.prototype.writeInt8 = function writeInt8 (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 1, 0x7f, -0x80)
  if (value < 0) value = 0xff + value + 1
  this[offset] = (value & 0xff)
  return offset + 1
}

Buffer.prototype.writeInt16LE = function writeInt16LE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 2, 0x7fff, -0x8000)
  this[offset] = (value & 0xff)
  this[offset + 1] = (value >>> 8)
  return offset + 2
}

Buffer.prototype.writeInt16BE = function writeInt16BE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 2, 0x7fff, -0x8000)
  this[offset] = (value >>> 8)
  this[offset + 1] = (value & 0xff)
  return offset + 2
}

Buffer.prototype.writeInt32LE = function writeInt32LE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 4, 0x7fffffff, -0x80000000)
  this[offset] = (value & 0xff)
  this[offset + 1] = (value >>> 8)
  this[offset + 2] = (value >>> 16)
  this[offset + 3] = (value >>> 24)
  return offset + 4
}

Buffer.prototype.writeInt32BE = function writeInt32BE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 4, 0x7fffffff, -0x80000000)
  if (value < 0) value = 0xffffffff + value + 1
  this[offset] = (value >>> 24)
  this[offset + 1] = (value >>> 16)
  this[offset + 2] = (value >>> 8)
  this[offset + 3] = (value & 0xff)
  return offset + 4
}

function checkIEEE754 (buf, value, offset, ext, max, min) {
  if (offset + ext > buf.length) throw new RangeError('Index out of range')
  if (offset < 0) throw new RangeError('Index out of range')
}

function writeFloat (buf, value, offset, littleEndian, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) {
    checkIEEE754(buf, value, offset, 4, 3.4028234663852886e+38, -3.4028234663852886e+38)
  }
  ieee754.write(buf, value, offset, littleEndian, 23, 4)
  return offset + 4
}

Buffer.prototype.writeFloatLE = function writeFloatLE (value, offset, noAssert) {
  return writeFloat(this, value, offset, true, noAssert)
}

Buffer.prototype.writeFloatBE = function writeFloatBE (value, offset, noAssert) {
  return writeFloat(this, value, offset, false, noAssert)
}

function writeDouble (buf, value, offset, littleEndian, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) {
    checkIEEE754(buf, value, offset, 8, 1.7976931348623157E+308, -1.7976931348623157E+308)
  }
  ieee754.write(buf, value, offset, littleEndian, 52, 8)
  return offset + 8
}

Buffer.prototype.writeDoubleLE = function writeDoubleLE (value, offset, noAssert) {
  return writeDouble(this, value, offset, true, noAssert)
}

Buffer.prototype.writeDoubleBE = function writeDoubleBE (value, offset, noAssert) {
  return writeDouble(this, value, offset, false, noAssert)
}

// copy(targetBuffer, targetStart=0, sourceStart=0, sourceEnd=buffer.length)
Buffer.prototype.copy = function copy (target, targetStart, start, end) {
  if (!start) start = 0
  if (!end && end !== 0) end = this.length
  if (targetStart >= target.length) targetStart = target.length
  if (!targetStart) targetStart = 0
  if (end > 0 && end < start) end = start

  // Copy 0 bytes; we're done
  if (end === start) return 0
  if (target.length === 0 || this.length === 0) return 0

  // Fatal error conditions
  if (targetStart < 0) {
    throw new RangeError('targetStart out of bounds')
  }
  if (start < 0 || start >= this.length) throw new RangeError('sourceStart out of bounds')
  if (end < 0) throw new RangeError('sourceEnd out of bounds')

  // Are we oob?
  if (end > this.length) end = this.length
  if (target.length - targetStart < end - start) {
    end = target.length - targetStart + start
  }

  var len = end - start
  var i

  if (this === target && start < targetStart && targetStart < end) {
    // descending copy from end
    for (i = len - 1; i >= 0; --i) {
      target[i + targetStart] = this[i + start]
    }
  } else if (len < 1000) {
    // ascending copy from start
    for (i = 0; i < len; ++i) {
      target[i + targetStart] = this[i + start]
    }
  } else {
    Uint8Array.prototype.set.call(
      target,
      this.subarray(start, start + len),
      targetStart
    )
  }

  return len
}

// Usage:
//    buffer.fill(number[, offset[, end]])
//    buffer.fill(buffer[, offset[, end]])
//    buffer.fill(string[, offset[, end]][, encoding])
Buffer.prototype.fill = function fill (val, start, end, encoding) {
  // Handle string cases:
  if (typeof val === 'string') {
    if (typeof start === 'string') {
      encoding = start
      start = 0
      end = this.length
    } else if (typeof end === 'string') {
      encoding = end
      end = this.length
    }
    if (val.length === 1) {
      var code = val.charCodeAt(0)
      if (code < 256) {
        val = code
      }
    }
    if (encoding !== undefined && typeof encoding !== 'string') {
      throw new TypeError('encoding must be a string')
    }
    if (typeof encoding === 'string' && !Buffer.isEncoding(encoding)) {
      throw new TypeError('Unknown encoding: ' + encoding)
    }
  } else if (typeof val === 'number') {
    val = val & 255
  }

  // Invalid ranges are not set to a default, so can range check early.
  if (start < 0 || this.length < start || this.length < end) {
    throw new RangeError('Out of range index')
  }

  if (end <= start) {
    return this
  }

  start = start >>> 0
  end = end === undefined ? this.length : end >>> 0

  if (!val) val = 0

  var i
  if (typeof val === 'number') {
    for (i = start; i < end; ++i) {
      this[i] = val
    }
  } else {
    var bytes = Buffer.isBuffer(val)
      ? val
      : new Buffer(val, encoding)
    var len = bytes.length
    for (i = 0; i < end - start; ++i) {
      this[i + start] = bytes[i % len]
    }
  }

  return this
}

// HELPER FUNCTIONS
// ================

var INVALID_BASE64_RE = /[^+/0-9A-Za-z-_]/g

function base64clean (str) {
  // Node strips out invalid characters like \n and \t from the string, base64-js does not
  str = str.trim().replace(INVALID_BASE64_RE, '')
  // Node converts strings with length < 2 to ''
  if (str.length < 2) return ''
  // Node allows for non-padded base64 strings (missing trailing ===), base64-js does not
  while (str.length % 4 !== 0) {
    str = str + '='
  }
  return str
}

function toHex (n) {
  if (n < 16) return '0' + n.toString(16)
  return n.toString(16)
}

function utf8ToBytes (string, units) {
  units = units || Infinity
  var codePoint
  var length = string.length
  var leadSurrogate = null
  var bytes = []

  for (var i = 0; i < length; ++i) {
    codePoint = string.charCodeAt(i)

    // is surrogate component
    if (codePoint > 0xD7FF && codePoint < 0xE000) {
      // last char was a lead
      if (!leadSurrogate) {
        // no lead yet
        if (codePoint > 0xDBFF) {
          // unexpected trail
          if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
          continue
        } else if (i + 1 === length) {
          // unpaired lead
          if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
          continue
        }

        // valid lead
        leadSurrogate = codePoint

        continue
      }

      // 2 leads in a row
      if (codePoint < 0xDC00) {
        if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
        leadSurrogate = codePoint
        continue
      }

      // valid surrogate pair
      codePoint = (leadSurrogate - 0xD800 << 10 | codePoint - 0xDC00) + 0x10000
    } else if (leadSurrogate) {
      // valid bmp char, but last char was a lead
      if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
    }

    leadSurrogate = null

    // encode utf8
    if (codePoint < 0x80) {
      if ((units -= 1) < 0) break
      bytes.push(codePoint)
    } else if (codePoint < 0x800) {
      if ((units -= 2) < 0) break
      bytes.push(
        codePoint >> 0x6 | 0xC0,
        codePoint & 0x3F | 0x80
      )
    } else if (codePoint < 0x10000) {
      if ((units -= 3) < 0) break
      bytes.push(
        codePoint >> 0xC | 0xE0,
        codePoint >> 0x6 & 0x3F | 0x80,
        codePoint & 0x3F | 0x80
      )
    } else if (codePoint < 0x110000) {
      if ((units -= 4) < 0) break
      bytes.push(
        codePoint >> 0x12 | 0xF0,
        codePoint >> 0xC & 0x3F | 0x80,
        codePoint >> 0x6 & 0x3F | 0x80,
        codePoint & 0x3F | 0x80
      )
    } else {
      throw new Error('Invalid code point')
    }
  }

  return bytes
}

function asciiToBytes (str) {
  var byteArray = []
  for (var i = 0; i < str.length; ++i) {
    // Node's code seems to be doing this and not & 0x7F..
    byteArray.push(str.charCodeAt(i) & 0xFF)
  }
  return byteArray
}

function utf16leToBytes (str, units) {
  var c, hi, lo
  var byteArray = []
  for (var i = 0; i < str.length; ++i) {
    if ((units -= 2) < 0) break

    c = str.charCodeAt(i)
    hi = c >> 8
    lo = c % 256
    byteArray.push(lo)
    byteArray.push(hi)
  }

  return byteArray
}

function base64ToBytes (str) {
  return base64.toByteArray(base64clean(str))
}

function blitBuffer (src, dst, offset, length) {
  for (var i = 0; i < length; ++i) {
    if ((i + offset >= dst.length) || (i >= src.length)) break
    dst[i + offset] = src[i]
  }
  return i
}

// ArrayBuffers from another context (i.e. an iframe) do not pass the `instanceof` check
// but they should be treated as valid. See: https://github.com/feross/buffer/issues/166
function isArrayBuffer (obj) {
  return obj instanceof ArrayBuffer ||
    (obj != null && obj.constructor != null && obj.constructor.name === 'ArrayBuffer' &&
      typeof obj.byteLength === 'number')
}

// Node 0.10 supports `ArrayBuffer` but lacks `ArrayBuffer.isView`
function isArrayBufferView (obj) {
  return (typeof ArrayBuffer.isView === 'function') && ArrayBuffer.isView(obj)
}

function numberIsNaN (obj) {
  return obj !== obj // eslint-disable-line no-self-compare
}

},{"base64-js":1,"ieee754":4}],4:[function(require,module,exports){
exports.read = function (buffer, offset, isLE, mLen, nBytes) {
  var e, m
  var eLen = nBytes * 8 - mLen - 1
  var eMax = (1 << eLen) - 1
  var eBias = eMax >> 1
  var nBits = -7
  var i = isLE ? (nBytes - 1) : 0
  var d = isLE ? -1 : 1
  var s = buffer[offset + i]

  i += d

  e = s & ((1 << (-nBits)) - 1)
  s >>= (-nBits)
  nBits += eLen
  for (; nBits > 0; e = e * 256 + buffer[offset + i], i += d, nBits -= 8) {}

  m = e & ((1 << (-nBits)) - 1)
  e >>= (-nBits)
  nBits += mLen
  for (; nBits > 0; m = m * 256 + buffer[offset + i], i += d, nBits -= 8) {}

  if (e === 0) {
    e = 1 - eBias
  } else if (e === eMax) {
    return m ? NaN : ((s ? -1 : 1) * Infinity)
  } else {
    m = m + Math.pow(2, mLen)
    e = e - eBias
  }
  return (s ? -1 : 1) * m * Math.pow(2, e - mLen)
}

exports.write = function (buffer, value, offset, isLE, mLen, nBytes) {
  var e, m, c
  var eLen = nBytes * 8 - mLen - 1
  var eMax = (1 << eLen) - 1
  var eBias = eMax >> 1
  var rt = (mLen === 23 ? Math.pow(2, -24) - Math.pow(2, -77) : 0)
  var i = isLE ? 0 : (nBytes - 1)
  var d = isLE ? 1 : -1
  var s = value < 0 || (value === 0 && 1 / value < 0) ? 1 : 0

  value = Math.abs(value)

  if (isNaN(value) || value === Infinity) {
    m = isNaN(value) ? 1 : 0
    e = eMax
  } else {
    e = Math.floor(Math.log(value) / Math.LN2)
    if (value * (c = Math.pow(2, -e)) < 1) {
      e--
      c *= 2
    }
    if (e + eBias >= 1) {
      value += rt / c
    } else {
      value += rt * Math.pow(2, 1 - eBias)
    }
    if (value * c >= 2) {
      e++
      c /= 2
    }

    if (e + eBias >= eMax) {
      m = 0
      e = eMax
    } else if (e + eBias >= 1) {
      m = (value * c - 1) * Math.pow(2, mLen)
      e = e + eBias
    } else {
      m = value * Math.pow(2, eBias - 1) * Math.pow(2, mLen)
      e = 0
    }
  }

  for (; mLen >= 8; buffer[offset + i] = m & 0xff, i += d, m /= 256, mLen -= 8) {}

  e = (e << mLen) | m
  eLen += mLen
  for (; eLen > 0; buffer[offset + i] = e & 0xff, i += d, e /= 256, eLen -= 8) {}

  buffer[offset + i - d] |= s * 128
}

},{}],5:[function(require,module,exports){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

'use strict';

// If obj.hasOwnProperty has been overridden, then calling
// obj.hasOwnProperty(prop) will break.
// See: https://github.com/joyent/node/issues/1707
function hasOwnProperty(obj, prop) {
  return Object.prototype.hasOwnProperty.call(obj, prop);
}

module.exports = function(qs, sep, eq, options) {
  sep = sep || '&';
  eq = eq || '=';
  var obj = {};

  if (typeof qs !== 'string' || qs.length === 0) {
    return obj;
  }

  var regexp = /\+/g;
  qs = qs.split(sep);

  var maxKeys = 1000;
  if (options && typeof options.maxKeys === 'number') {
    maxKeys = options.maxKeys;
  }

  var len = qs.length;
  // maxKeys <= 0 means that we should not limit keys count
  if (maxKeys > 0 && len > maxKeys) {
    len = maxKeys;
  }

  for (var i = 0; i < len; ++i) {
    var x = qs[i].replace(regexp, '%20'),
        idx = x.indexOf(eq),
        kstr, vstr, k, v;

    if (idx >= 0) {
      kstr = x.substr(0, idx);
      vstr = x.substr(idx + 1);
    } else {
      kstr = x;
      vstr = '';
    }

    k = decodeURIComponent(kstr);
    v = decodeURIComponent(vstr);

    if (!hasOwnProperty(obj, k)) {
      obj[k] = v;
    } else if (isArray(obj[k])) {
      obj[k].push(v);
    } else {
      obj[k] = [obj[k], v];
    }
  }

  return obj;
};

var isArray = Array.isArray || function (xs) {
  return Object.prototype.toString.call(xs) === '[object Array]';
};

},{}],6:[function(require,module,exports){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

'use strict';

var stringifyPrimitive = function(v) {
  switch (typeof v) {
    case 'string':
      return v;

    case 'boolean':
      return v ? 'true' : 'false';

    case 'number':
      return isFinite(v) ? v : '';

    default:
      return '';
  }
};

module.exports = function(obj, sep, eq, name) {
  sep = sep || '&';
  eq = eq || '=';
  if (obj === null) {
    obj = undefined;
  }

  if (typeof obj === 'object') {
    return map(objectKeys(obj), function(k) {
      var ks = encodeURIComponent(stringifyPrimitive(k)) + eq;
      if (isArray(obj[k])) {
        return map(obj[k], function(v) {
          return ks + encodeURIComponent(stringifyPrimitive(v));
        }).join(sep);
      } else {
        return ks + encodeURIComponent(stringifyPrimitive(obj[k]));
      }
    }).join(sep);

  }

  if (!name) return '';
  return encodeURIComponent(stringifyPrimitive(name)) + eq +
         encodeURIComponent(stringifyPrimitive(obj));
};

var isArray = Array.isArray || function (xs) {
  return Object.prototype.toString.call(xs) === '[object Array]';
};

function map (xs, f) {
  if (xs.map) return xs.map(f);
  var res = [];
  for (var i = 0; i < xs.length; i++) {
    res.push(f(xs[i], i));
  }
  return res;
}

var objectKeys = Object.keys || function (obj) {
  var res = [];
  for (var key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) res.push(key);
  }
  return res;
};

},{}],7:[function(require,module,exports){
'use strict';

exports.decode = exports.parse = require('./decode');
exports.encode = exports.stringify = require('./encode');

},{"./decode":5,"./encode":6}],8:[function(require,module,exports){

/**
 * Expose `Emitter`.
 */

if (typeof module !== 'undefined') {
  module.exports = Emitter;
}

/**
 * Initialize a new `Emitter`.
 *
 * @api public
 */

function Emitter(obj) {
  if (obj) return mixin(obj);
};

/**
 * Mixin the emitter properties.
 *
 * @param {Object} obj
 * @return {Object}
 * @api private
 */

function mixin(obj) {
  for (var key in Emitter.prototype) {
    obj[key] = Emitter.prototype[key];
  }
  return obj;
}

/**
 * Listen on the given `event` with `fn`.
 *
 * @param {String} event
 * @param {Function} fn
 * @return {Emitter}
 * @api public
 */

Emitter.prototype.on =
Emitter.prototype.addEventListener = function(event, fn){
  this._callbacks = this._callbacks || {};
  (this._callbacks['$' + event] = this._callbacks['$' + event] || [])
    .push(fn);
  return this;
};

/**
 * Adds an `event` listener that will be invoked a single
 * time then automatically removed.
 *
 * @param {String} event
 * @param {Function} fn
 * @return {Emitter}
 * @api public
 */

Emitter.prototype.once = function(event, fn){
  function on() {
    this.off(event, on);
    fn.apply(this, arguments);
  }

  on.fn = fn;
  this.on(event, on);
  return this;
};

/**
 * Remove the given callback for `event` or all
 * registered callbacks.
 *
 * @param {String} event
 * @param {Function} fn
 * @return {Emitter}
 * @api public
 */

Emitter.prototype.off =
Emitter.prototype.removeListener =
Emitter.prototype.removeAllListeners =
Emitter.prototype.removeEventListener = function(event, fn){
  this._callbacks = this._callbacks || {};

  // all
  if (0 == arguments.length) {
    this._callbacks = {};
    return this;
  }

  // specific event
  var callbacks = this._callbacks['$' + event];
  if (!callbacks) return this;

  // remove all handlers
  if (1 == arguments.length) {
    delete this._callbacks['$' + event];
    return this;
  }

  // remove specific handler
  var cb;
  for (var i = 0; i < callbacks.length; i++) {
    cb = callbacks[i];
    if (cb === fn || cb.fn === fn) {
      callbacks.splice(i, 1);
      break;
    }
  }
  return this;
};

/**
 * Emit `event` with the given args.
 *
 * @param {String} event
 * @param {Mixed} ...
 * @return {Emitter}
 */

Emitter.prototype.emit = function(event){
  this._callbacks = this._callbacks || {};
  var args = [].slice.call(arguments, 1)
    , callbacks = this._callbacks['$' + event];

  if (callbacks) {
    callbacks = callbacks.slice(0);
    for (var i = 0, len = callbacks.length; i < len; ++i) {
      callbacks[i].apply(this, args);
    }
  }

  return this;
};

/**
 * Return array of callbacks for `event`.
 *
 * @param {String} event
 * @return {Array}
 * @api public
 */

Emitter.prototype.listeners = function(event){
  this._callbacks = this._callbacks || {};
  return this._callbacks['$' + event] || [];
};

/**
 * Check if this emitter has `event` handlers.
 *
 * @param {String} event
 * @return {Boolean}
 * @api public
 */

Emitter.prototype.hasListeners = function(event){
  return !! this.listeners(event).length;
};

},{}],9:[function(require,module,exports){
/**
 * Root reference for iframes.
 */

var root;
if (typeof window !== 'undefined') { // Browser window
  root = window;
} else if (typeof self !== 'undefined') { // Web Worker
  root = self;
} else { // Other environments
  console.warn("Using browser-only version of superagent in non-browser environment");
  root = this;
}

var Emitter = require('component-emitter');
var RequestBase = require('./request-base');
var isObject = require('./is-object');
var isFunction = require('./is-function');
var ResponseBase = require('./response-base');
var shouldRetry = require('./should-retry');

/**
 * Noop.
 */

function noop(){};

/**
 * Expose `request`.
 */

var request = exports = module.exports = function(method, url) {
  // callback
  if ('function' == typeof url) {
    return new exports.Request('GET', method).end(url);
  }

  // url first
  if (1 == arguments.length) {
    return new exports.Request('GET', method);
  }

  return new exports.Request(method, url);
}

exports.Request = Request;

/**
 * Determine XHR.
 */

request.getXHR = function () {
  if (root.XMLHttpRequest
      && (!root.location || 'file:' != root.location.protocol
          || !root.ActiveXObject)) {
    return new XMLHttpRequest;
  } else {
    try { return new ActiveXObject('Microsoft.XMLHTTP'); } catch(e) {}
    try { return new ActiveXObject('Msxml2.XMLHTTP.6.0'); } catch(e) {}
    try { return new ActiveXObject('Msxml2.XMLHTTP.3.0'); } catch(e) {}
    try { return new ActiveXObject('Msxml2.XMLHTTP'); } catch(e) {}
  }
  throw Error("Browser-only verison of superagent could not find XHR");
};

/**
 * Removes leading and trailing whitespace, added to support IE.
 *
 * @param {String} s
 * @return {String}
 * @api private
 */

var trim = ''.trim
  ? function(s) { return s.trim(); }
  : function(s) { return s.replace(/(^\s*|\s*$)/g, ''); };

/**
 * Serialize the given `obj`.
 *
 * @param {Object} obj
 * @return {String}
 * @api private
 */

function serialize(obj) {
  if (!isObject(obj)) return obj;
  var pairs = [];
  for (var key in obj) {
    pushEncodedKeyValuePair(pairs, key, obj[key]);
  }
  return pairs.join('&');
}

/**
 * Helps 'serialize' with serializing arrays.
 * Mutates the pairs array.
 *
 * @param {Array} pairs
 * @param {String} key
 * @param {Mixed} val
 */

function pushEncodedKeyValuePair(pairs, key, val) {
  if (val != null) {
    if (Array.isArray(val)) {
      val.forEach(function(v) {
        pushEncodedKeyValuePair(pairs, key, v);
      });
    } else if (isObject(val)) {
      for(var subkey in val) {
        pushEncodedKeyValuePair(pairs, key + '[' + subkey + ']', val[subkey]);
      }
    } else {
      pairs.push(encodeURIComponent(key)
        + '=' + encodeURIComponent(val));
    }
  } else if (val === null) {
    pairs.push(encodeURIComponent(key));
  }
}

/**
 * Expose serialization method.
 */

 request.serializeObject = serialize;

 /**
  * Parse the given x-www-form-urlencoded `str`.
  *
  * @param {String} str
  * @return {Object}
  * @api private
  */

function parseString(str) {
  var obj = {};
  var pairs = str.split('&');
  var pair;
  var pos;

  for (var i = 0, len = pairs.length; i < len; ++i) {
    pair = pairs[i];
    pos = pair.indexOf('=');
    if (pos == -1) {
      obj[decodeURIComponent(pair)] = '';
    } else {
      obj[decodeURIComponent(pair.slice(0, pos))] =
        decodeURIComponent(pair.slice(pos + 1));
    }
  }

  return obj;
}

/**
 * Expose parser.
 */

request.parseString = parseString;

/**
 * Default MIME type map.
 *
 *     superagent.types.xml = 'application/xml';
 *
 */

request.types = {
  html: 'text/html',
  json: 'application/json',
  xml: 'application/xml',
  urlencoded: 'application/x-www-form-urlencoded',
  'form': 'application/x-www-form-urlencoded',
  'form-data': 'application/x-www-form-urlencoded'
};

/**
 * Default serialization map.
 *
 *     superagent.serialize['application/xml'] = function(obj){
 *       return 'generated xml here';
 *     };
 *
 */

 request.serialize = {
   'application/x-www-form-urlencoded': serialize,
   'application/json': JSON.stringify
 };

 /**
  * Default parsers.
  *
  *     superagent.parse['application/xml'] = function(str){
  *       return { object parsed from str };
  *     };
  *
  */

request.parse = {
  'application/x-www-form-urlencoded': parseString,
  'application/json': JSON.parse
};

/**
 * Parse the given header `str` into
 * an object containing the mapped fields.
 *
 * @param {String} str
 * @return {Object}
 * @api private
 */

function parseHeader(str) {
  var lines = str.split(/\r?\n/);
  var fields = {};
  var index;
  var line;
  var field;
  var val;

  lines.pop(); // trailing CRLF

  for (var i = 0, len = lines.length; i < len; ++i) {
    line = lines[i];
    index = line.indexOf(':');
    field = line.slice(0, index).toLowerCase();
    val = trim(line.slice(index + 1));
    fields[field] = val;
  }

  return fields;
}

/**
 * Check if `mime` is json or has +json structured syntax suffix.
 *
 * @param {String} mime
 * @return {Boolean}
 * @api private
 */

function isJSON(mime) {
  return /[\/+]json\b/.test(mime);
}

/**
 * Initialize a new `Response` with the given `xhr`.
 *
 *  - set flags (.ok, .error, etc)
 *  - parse header
 *
 * Examples:
 *
 *  Aliasing `superagent` as `request` is nice:
 *
 *      request = superagent;
 *
 *  We can use the promise-like API, or pass callbacks:
 *
 *      request.get('/').end(function(res){});
 *      request.get('/', function(res){});
 *
 *  Sending data can be chained:
 *
 *      request
 *        .post('/user')
 *        .send({ name: 'tj' })
 *        .end(function(res){});
 *
 *  Or passed to `.send()`:
 *
 *      request
 *        .post('/user')
 *        .send({ name: 'tj' }, function(res){});
 *
 *  Or passed to `.post()`:
 *
 *      request
 *        .post('/user', { name: 'tj' })
 *        .end(function(res){});
 *
 * Or further reduced to a single call for simple cases:
 *
 *      request
 *        .post('/user', { name: 'tj' }, function(res){});
 *
 * @param {XMLHTTPRequest} xhr
 * @param {Object} options
 * @api private
 */

function Response(req) {
  this.req = req;
  this.xhr = this.req.xhr;
  // responseText is accessible only if responseType is '' or 'text' and on older browsers
  this.text = ((this.req.method !='HEAD' && (this.xhr.responseType === '' || this.xhr.responseType === 'text')) || typeof this.xhr.responseType === 'undefined')
     ? this.xhr.responseText
     : null;
  this.statusText = this.req.xhr.statusText;
  var status = this.xhr.status;
  // handle IE9 bug: http://stackoverflow.com/questions/10046972/msie-returns-status-code-of-1223-for-ajax-request
  if (status === 1223) {
      status = 204;
  }
  this._setStatusProperties(status);
  this.header = this.headers = parseHeader(this.xhr.getAllResponseHeaders());
  // getAllResponseHeaders sometimes falsely returns "" for CORS requests, but
  // getResponseHeader still works. so we get content-type even if getting
  // other headers fails.
  this.header['content-type'] = this.xhr.getResponseHeader('content-type');
  this._setHeaderProperties(this.header);

  if (null === this.text && req._responseType) {
    this.body = this.xhr.response;
  } else {
    this.body = this.req.method != 'HEAD'
      ? this._parseBody(this.text ? this.text : this.xhr.response)
      : null;
  }
}

ResponseBase(Response.prototype);

/**
 * Parse the given body `str`.
 *
 * Used for auto-parsing of bodies. Parsers
 * are defined on the `superagent.parse` object.
 *
 * @param {String} str
 * @return {Mixed}
 * @api private
 */

Response.prototype._parseBody = function(str){
  var parse = request.parse[this.type];
  if(this.req._parser) {
    return this.req._parser(this, str);
  }
  if (!parse && isJSON(this.type)) {
    parse = request.parse['application/json'];
  }
  return parse && str && (str.length || str instanceof Object)
    ? parse(str)
    : null;
};

/**
 * Return an `Error` representative of this response.
 *
 * @return {Error}
 * @api public
 */

Response.prototype.toError = function(){
  var req = this.req;
  var method = req.method;
  var url = req.url;

  var msg = 'cannot ' + method + ' ' + url + ' (' + this.status + ')';
  var err = new Error(msg);
  err.status = this.status;
  err.method = method;
  err.url = url;

  return err;
};

/**
 * Expose `Response`.
 */

request.Response = Response;

/**
 * Initialize a new `Request` with the given `method` and `url`.
 *
 * @param {String} method
 * @param {String} url
 * @api public
 */

function Request(method, url) {
  var self = this;
  this._query = this._query || [];
  this.method = method;
  this.url = url;
  this.header = {}; // preserves header name case
  this._header = {}; // coerces header names to lowercase
  this.on('end', function(){
    var err = null;
    var res = null;

    try {
      res = new Response(self);
    } catch(e) {
      err = new Error('Parser is unable to parse the response');
      err.parse = true;
      err.original = e;
      // issue #675: return the raw response if the response parsing fails
      if (self.xhr) {
        // ie9 doesn't have 'response' property
        err.rawResponse = typeof self.xhr.responseType == 'undefined' ? self.xhr.responseText : self.xhr.response;
        // issue #876: return the http status code if the response parsing fails
        err.status = self.xhr.status ? self.xhr.status : null;
        err.statusCode = err.status; // backwards-compat only
      } else {
        err.rawResponse = null;
        err.status = null;
      }

      return self.callback(err);
    }

    self.emit('response', res);

    var new_err;
    try {
      if (!self._isResponseOK(res)) {
        new_err = new Error(res.statusText || 'Unsuccessful HTTP response');
        new_err.original = err;
        new_err.response = res;
        new_err.status = res.status;
      }
    } catch(e) {
      new_err = e; // #985 touching res may cause INVALID_STATE_ERR on old Android
    }

    // #1000 don't catch errors from the callback to avoid double calling it
    if (new_err) {
      self.callback(new_err, res);
    } else {
      self.callback(null, res);
    }
  });
}

/**
 * Mixin `Emitter` and `RequestBase`.
 */

Emitter(Request.prototype);
RequestBase(Request.prototype);

/**
 * Set Content-Type to `type`, mapping values from `request.types`.
 *
 * Examples:
 *
 *      superagent.types.xml = 'application/xml';
 *
 *      request.post('/')
 *        .type('xml')
 *        .send(xmlstring)
 *        .end(callback);
 *
 *      request.post('/')
 *        .type('application/xml')
 *        .send(xmlstring)
 *        .end(callback);
 *
 * @param {String} type
 * @return {Request} for chaining
 * @api public
 */

Request.prototype.type = function(type){
  this.set('Content-Type', request.types[type] || type);
  return this;
};

/**
 * Set Accept to `type`, mapping values from `request.types`.
 *
 * Examples:
 *
 *      superagent.types.json = 'application/json';
 *
 *      request.get('/agent')
 *        .accept('json')
 *        .end(callback);
 *
 *      request.get('/agent')
 *        .accept('application/json')
 *        .end(callback);
 *
 * @param {String} accept
 * @return {Request} for chaining
 * @api public
 */

Request.prototype.accept = function(type){
  this.set('Accept', request.types[type] || type);
  return this;
};

/**
 * Set Authorization field value with `user` and `pass`.
 *
 * @param {String} user
 * @param {String} [pass] optional in case of using 'bearer' as type
 * @param {Object} options with 'type' property 'auto', 'basic' or 'bearer' (default 'basic')
 * @return {Request} for chaining
 * @api public
 */

Request.prototype.auth = function(user, pass, options){
  if (typeof pass === 'object' && pass !== null) { // pass is optional and can substitute for options
    options = pass;
  }
  if (!options) {
    options = {
      type: 'function' === typeof btoa ? 'basic' : 'auto',
    }
  }

  switch (options.type) {
    case 'basic':
      this.set('Authorization', 'Basic ' + btoa(user + ':' + pass));
    break;

    case 'auto':
      this.username = user;
      this.password = pass;
    break;
      
    case 'bearer': // usage would be .auth(accessToken, { type: 'bearer' })
      this.set('Authorization', 'Bearer ' + user);
    break;  
  }
  return this;
};

/**
 * Add query-string `val`.
 *
 * Examples:
 *
 *   request.get('/shoes')
 *     .query('size=10')
 *     .query({ color: 'blue' })
 *
 * @param {Object|String} val
 * @return {Request} for chaining
 * @api public
 */

Request.prototype.query = function(val){
  if ('string' != typeof val) val = serialize(val);
  if (val) this._query.push(val);
  return this;
};

/**
 * Queue the given `file` as an attachment to the specified `field`,
 * with optional `options` (or filename).
 *
 * ``` js
 * request.post('/upload')
 *   .attach('content', new Blob(['<a id="a"><b id="b">hey!</b></a>'], { type: "text/html"}))
 *   .end(callback);
 * ```
 *
 * @param {String} field
 * @param {Blob|File} file
 * @param {String|Object} options
 * @return {Request} for chaining
 * @api public
 */

Request.prototype.attach = function(field, file, options){
  if (file) {
    if (this._data) {
      throw Error("superagent can't mix .send() and .attach()");
    }

    this._getFormData().append(field, file, options || file.name);
  }
  return this;
};

Request.prototype._getFormData = function(){
  if (!this._formData) {
    this._formData = new root.FormData();
  }
  return this._formData;
};

/**
 * Invoke the callback with `err` and `res`
 * and handle arity check.
 *
 * @param {Error} err
 * @param {Response} res
 * @api private
 */

Request.prototype.callback = function(err, res){
  // console.log(this._retries, this._maxRetries)
  if (this._maxRetries && this._retries++ < this._maxRetries && shouldRetry(err, res)) {
    return this._retry();
  }

  var fn = this._callback;
  this.clearTimeout();

  if (err) {
    if (this._maxRetries) err.retries = this._retries - 1;
    this.emit('error', err);
  }

  fn(err, res);
};

/**
 * Invoke callback with x-domain error.
 *
 * @api private
 */

Request.prototype.crossDomainError = function(){
  var err = new Error('Request has been terminated\nPossible causes: the network is offline, Origin is not allowed by Access-Control-Allow-Origin, the page is being unloaded, etc.');
  err.crossDomain = true;

  err.status = this.status;
  err.method = this.method;
  err.url = this.url;

  this.callback(err);
};

// This only warns, because the request is still likely to work
Request.prototype.buffer = Request.prototype.ca = Request.prototype.agent = function(){
  console.warn("This is not supported in browser version of superagent");
  return this;
};

// This throws, because it can't send/receive data as expected
Request.prototype.pipe = Request.prototype.write = function(){
  throw Error("Streaming is not supported in browser version of superagent");
};

/**
 * Compose querystring to append to req.url
 *
 * @api private
 */

Request.prototype._appendQueryString = function(){
  var query = this._query.join('&');
  if (query) {
    this.url += (this.url.indexOf('?') >= 0 ? '&' : '?') + query;
  }

  if (this._sort) {
    var index = this.url.indexOf('?');
    if (index >= 0) {
      var queryArr = this.url.substring(index + 1).split('&');
      if (isFunction(this._sort)) {
        queryArr.sort(this._sort);
      } else {
        queryArr.sort();
      }
      this.url = this.url.substring(0, index) + '?' + queryArr.join('&');
    }
  }
};

/**
 * Check if `obj` is a host object,
 * we don't want to serialize these :)
 *
 * @param {Object} obj
 * @return {Boolean}
 * @api private
 */
Request.prototype._isHost = function _isHost(obj) {
  // Native objects stringify to [object File], [object Blob], [object FormData], etc.
  return obj && 'object' === typeof obj && !Array.isArray(obj) && Object.prototype.toString.call(obj) !== '[object Object]';
}

/**
 * Initiate request, invoking callback `fn(res)`
 * with an instanceof `Response`.
 *
 * @param {Function} fn
 * @return {Request} for chaining
 * @api public
 */

Request.prototype.end = function(fn){
  if (this._endCalled) {
    console.warn("Warning: .end() was called twice. This is not supported in superagent");
  }
  this._endCalled = true;

  // store callback
  this._callback = fn || noop;

  // querystring
  this._appendQueryString();

  return this._end();
};

Request.prototype._end = function() {
  var self = this;
  var xhr = this.xhr = request.getXHR();
  var data = this._formData || this._data;

  this._setTimeouts();

  // state change
  xhr.onreadystatechange = function(){
    var readyState = xhr.readyState;
    if (readyState >= 2 && self._responseTimeoutTimer) {
      clearTimeout(self._responseTimeoutTimer);
    }
    if (4 != readyState) {
      return;
    }

    // In IE9, reads to any property (e.g. status) off of an aborted XHR will
    // result in the error "Could not complete the operation due to error c00c023f"
    var status;
    try { status = xhr.status } catch(e) { status = 0; }

    if (!status) {
      if (self.timedout || self._aborted) return;
      return self.crossDomainError();
    }
    self.emit('end');
  };

  // progress
  var handleProgress = function(direction, e) {
    if (e.total > 0) {
      e.percent = e.loaded / e.total * 100;
    }
    e.direction = direction;
    self.emit('progress', e);
  }
  if (this.hasListeners('progress')) {
    try {
      xhr.onprogress = handleProgress.bind(null, 'download');
      if (xhr.upload) {
        xhr.upload.onprogress = handleProgress.bind(null, 'upload');
      }
    } catch(e) {
      // Accessing xhr.upload fails in IE from a web worker, so just pretend it doesn't exist.
      // Reported here:
      // https://connect.microsoft.com/IE/feedback/details/837245/xmlhttprequest-upload-throws-invalid-argument-when-used-from-web-worker-context
    }
  }

  // initiate request
  try {
    if (this.username && this.password) {
      xhr.open(this.method, this.url, true, this.username, this.password);
    } else {
      xhr.open(this.method, this.url, true);
    }
  } catch (err) {
    // see #1149
    return this.callback(err);
  }

  // CORS
  if (this._withCredentials) xhr.withCredentials = true;

  // body
  if (!this._formData && 'GET' != this.method && 'HEAD' != this.method && 'string' != typeof data && !this._isHost(data)) {
    // serialize stuff
    var contentType = this._header['content-type'];
    var serialize = this._serializer || request.serialize[contentType ? contentType.split(';')[0] : ''];
    if (!serialize && isJSON(contentType)) {
      serialize = request.serialize['application/json'];
    }
    if (serialize) data = serialize(data);
  }

  // set header fields
  for (var field in this.header) {
    if (null == this.header[field]) continue;

    if (this.header.hasOwnProperty(field))
      xhr.setRequestHeader(field, this.header[field]);
  }

  if (this._responseType) {
    xhr.responseType = this._responseType;
  }

  // send stuff
  this.emit('request', this);

  // IE11 xhr.send(undefined) sends 'undefined' string as POST payload (instead of nothing)
  // We need null here if data is undefined
  xhr.send(typeof data !== 'undefined' ? data : null);
  return this;
};

/**
 * GET `url` with optional callback `fn(res)`.
 *
 * @param {String} url
 * @param {Mixed|Function} [data] or fn
 * @param {Function} [fn]
 * @return {Request}
 * @api public
 */

request.get = function(url, data, fn){
  var req = request('GET', url);
  if ('function' == typeof data) fn = data, data = null;
  if (data) req.query(data);
  if (fn) req.end(fn);
  return req;
};

/**
 * HEAD `url` with optional callback `fn(res)`.
 *
 * @param {String} url
 * @param {Mixed|Function} [data] or fn
 * @param {Function} [fn]
 * @return {Request}
 * @api public
 */

request.head = function(url, data, fn){
  var req = request('HEAD', url);
  if ('function' == typeof data) fn = data, data = null;
  if (data) req.send(data);
  if (fn) req.end(fn);
  return req;
};

/**
 * OPTIONS query to `url` with optional callback `fn(res)`.
 *
 * @param {String} url
 * @param {Mixed|Function} [data] or fn
 * @param {Function} [fn]
 * @return {Request}
 * @api public
 */

request.options = function(url, data, fn){
  var req = request('OPTIONS', url);
  if ('function' == typeof data) fn = data, data = null;
  if (data) req.send(data);
  if (fn) req.end(fn);
  return req;
};

/**
 * DELETE `url` with optional `data` and callback `fn(res)`.
 *
 * @param {String} url
 * @param {Mixed} [data]
 * @param {Function} [fn]
 * @return {Request}
 * @api public
 */

function del(url, data, fn){
  var req = request('DELETE', url);
  if ('function' == typeof data) fn = data, data = null;
  if (data) req.send(data);
  if (fn) req.end(fn);
  return req;
};

request['del'] = del;
request['delete'] = del;

/**
 * PATCH `url` with optional `data` and callback `fn(res)`.
 *
 * @param {String} url
 * @param {Mixed} [data]
 * @param {Function} [fn]
 * @return {Request}
 * @api public
 */

request.patch = function(url, data, fn){
  var req = request('PATCH', url);
  if ('function' == typeof data) fn = data, data = null;
  if (data) req.send(data);
  if (fn) req.end(fn);
  return req;
};

/**
 * POST `url` with optional `data` and callback `fn(res)`.
 *
 * @param {String} url
 * @param {Mixed} [data]
 * @param {Function} [fn]
 * @return {Request}
 * @api public
 */

request.post = function(url, data, fn){
  var req = request('POST', url);
  if ('function' == typeof data) fn = data, data = null;
  if (data) req.send(data);
  if (fn) req.end(fn);
  return req;
};

/**
 * PUT `url` with optional `data` and callback `fn(res)`.
 *
 * @param {String} url
 * @param {Mixed|Function} [data] or fn
 * @param {Function} [fn]
 * @return {Request}
 * @api public
 */

request.put = function(url, data, fn){
  var req = request('PUT', url);
  if ('function' == typeof data) fn = data, data = null;
  if (data) req.send(data);
  if (fn) req.end(fn);
  return req;
};

},{"./is-function":10,"./is-object":11,"./request-base":12,"./response-base":13,"./should-retry":14,"component-emitter":8}],10:[function(require,module,exports){
/**
 * Check if `fn` is a function.
 *
 * @param {Function} fn
 * @return {Boolean}
 * @api private
 */
var isObject = require('./is-object');

function isFunction(fn) {
  var tag = isObject(fn) ? Object.prototype.toString.call(fn) : '';
  return tag === '[object Function]';
}

module.exports = isFunction;

},{"./is-object":11}],11:[function(require,module,exports){
/**
 * Check if `obj` is an object.
 *
 * @param {Object} obj
 * @return {Boolean}
 * @api private
 */

function isObject(obj) {
  return null !== obj && 'object' === typeof obj;
}

module.exports = isObject;

},{}],12:[function(require,module,exports){
/**
 * Module of mixed-in functions shared between node and client code
 */
var isObject = require('./is-object');

/**
 * Expose `RequestBase`.
 */

module.exports = RequestBase;

/**
 * Initialize a new `RequestBase`.
 *
 * @api public
 */

function RequestBase(obj) {
  if (obj) return mixin(obj);
}

/**
 * Mixin the prototype properties.
 *
 * @param {Object} obj
 * @return {Object}
 * @api private
 */

function mixin(obj) {
  for (var key in RequestBase.prototype) {
    obj[key] = RequestBase.prototype[key];
  }
  return obj;
}

/**
 * Clear previous timeout.
 *
 * @return {Request} for chaining
 * @api public
 */

RequestBase.prototype.clearTimeout = function _clearTimeout(){
  clearTimeout(this._timer);
  clearTimeout(this._responseTimeoutTimer);
  delete this._timer;
  delete this._responseTimeoutTimer;
  return this;
};

/**
 * Override default response body parser
 *
 * This function will be called to convert incoming data into request.body
 *
 * @param {Function}
 * @api public
 */

RequestBase.prototype.parse = function parse(fn){
  this._parser = fn;
  return this;
};

/**
 * Set format of binary response body.
 * In browser valid formats are 'blob' and 'arraybuffer',
 * which return Blob and ArrayBuffer, respectively.
 *
 * In Node all values result in Buffer.
 *
 * Examples:
 *
 *      req.get('/')
 *        .responseType('blob')
 *        .end(callback);
 *
 * @param {String} val
 * @return {Request} for chaining
 * @api public
 */

RequestBase.prototype.responseType = function(val){
  this._responseType = val;
  return this;
};

/**
 * Override default request body serializer
 *
 * This function will be called to convert data set via .send or .attach into payload to send
 *
 * @param {Function}
 * @api public
 */

RequestBase.prototype.serialize = function serialize(fn){
  this._serializer = fn;
  return this;
};

/**
 * Set timeouts.
 *
 * - response timeout is time between sending request and receiving the first byte of the response. Includes DNS and connection time.
 * - deadline is the time from start of the request to receiving response body in full. If the deadline is too short large files may not load at all on slow connections.
 *
 * Value of 0 or false means no timeout.
 *
 * @param {Number|Object} ms or {response, read, deadline}
 * @return {Request} for chaining
 * @api public
 */

RequestBase.prototype.timeout = function timeout(options){
  if (!options || 'object' !== typeof options) {
    this._timeout = options;
    this._responseTimeout = 0;
    return this;
  }

  for(var option in options) {
    switch(option) {
      case 'deadline':
        this._timeout = options.deadline;
        break;
      case 'response':
        this._responseTimeout = options.response;
        break;
      default:
        console.warn("Unknown timeout option", option);
    }
  }
  return this;
};

/**
 * Set number of retry attempts on error.
 *
 * Failed requests will be retried 'count' times if timeout or err.code >= 500.
 *
 * @param {Number} count
 * @return {Request} for chaining
 * @api public
 */

RequestBase.prototype.retry = function retry(count){
  // Default to 1 if no count passed or true
  if (arguments.length === 0 || count === true) count = 1;
  if (count <= 0) count = 0;
  this._maxRetries = count;
  this._retries = 0;
  return this;
};

/**
 * Retry request
 *
 * @return {Request} for chaining
 * @api private
 */

RequestBase.prototype._retry = function() {
  this.clearTimeout();

  // node
  if (this.req) {
    this.req = null;
    this.req = this.request();
  }

  this._aborted = false;
  this.timedout = false;

  return this._end();
};

/**
 * Promise support
 *
 * @param {Function} resolve
 * @param {Function} [reject]
 * @return {Request}
 */

RequestBase.prototype.then = function then(resolve, reject) {
  if (!this._fullfilledPromise) {
    var self = this;
    if (this._endCalled) {
      console.warn("Warning: superagent request was sent twice, because both .end() and .then() were called. Never call .end() if you use promises");
    }
    this._fullfilledPromise = new Promise(function(innerResolve, innerReject){
      self.end(function(err, res){
        if (err) innerReject(err); else innerResolve(res);
      });
    });
  }
  return this._fullfilledPromise.then(resolve, reject);
}

RequestBase.prototype.catch = function(cb) {
  return this.then(undefined, cb);
};

/**
 * Allow for extension
 */

RequestBase.prototype.use = function use(fn) {
  fn(this);
  return this;
}

RequestBase.prototype.ok = function(cb) {
  if ('function' !== typeof cb) throw Error("Callback required");
  this._okCallback = cb;
  return this;
};

RequestBase.prototype._isResponseOK = function(res) {
  if (!res) {
    return false;
  }

  if (this._okCallback) {
    return this._okCallback(res);
  }

  return res.status >= 200 && res.status < 300;
};


/**
 * Get request header `field`.
 * Case-insensitive.
 *
 * @param {String} field
 * @return {String}
 * @api public
 */

RequestBase.prototype.get = function(field){
  return this._header[field.toLowerCase()];
};

/**
 * Get case-insensitive header `field` value.
 * This is a deprecated internal API. Use `.get(field)` instead.
 *
 * (getHeader is no longer used internally by the superagent code base)
 *
 * @param {String} field
 * @return {String}
 * @api private
 * @deprecated
 */

RequestBase.prototype.getHeader = RequestBase.prototype.get;

/**
 * Set header `field` to `val`, or multiple fields with one object.
 * Case-insensitive.
 *
 * Examples:
 *
 *      req.get('/')
 *        .set('Accept', 'application/json')
 *        .set('X-API-Key', 'foobar')
 *        .end(callback);
 *
 *      req.get('/')
 *        .set({ Accept: 'application/json', 'X-API-Key': 'foobar' })
 *        .end(callback);
 *
 * @param {String|Object} field
 * @param {String} val
 * @return {Request} for chaining
 * @api public
 */

RequestBase.prototype.set = function(field, val){
  if (isObject(field)) {
    for (var key in field) {
      this.set(key, field[key]);
    }
    return this;
  }
  this._header[field.toLowerCase()] = val;
  this.header[field] = val;
  return this;
};

/**
 * Remove header `field`.
 * Case-insensitive.
 *
 * Example:
 *
 *      req.get('/')
 *        .unset('User-Agent')
 *        .end(callback);
 *
 * @param {String} field
 */
RequestBase.prototype.unset = function(field){
  delete this._header[field.toLowerCase()];
  delete this.header[field];
  return this;
};

/**
 * Write the field `name` and `val`, or multiple fields with one object
 * for "multipart/form-data" request bodies.
 *
 * ``` js
 * request.post('/upload')
 *   .field('foo', 'bar')
 *   .end(callback);
 *
 * request.post('/upload')
 *   .field({ foo: 'bar', baz: 'qux' })
 *   .end(callback);
 * ```
 *
 * @param {String|Object} name
 * @param {String|Blob|File|Buffer|fs.ReadStream} val
 * @return {Request} for chaining
 * @api public
 */
RequestBase.prototype.field = function(name, val) {

  // name should be either a string or an object.
  if (null === name ||  undefined === name) {
    throw new Error('.field(name, val) name can not be empty');
  }

  if (this._data) {
    console.error(".field() can't be used if .send() is used. Please use only .send() or only .field() & .attach()");
  }

  if (isObject(name)) {
    for (var key in name) {
      this.field(key, name[key]);
    }
    return this;
  }

  if (Array.isArray(val)) {
    for (var i in val) {
      this.field(name, val[i]);
    }
    return this;
  }

  // val should be defined now
  if (null === val || undefined === val) {
    throw new Error('.field(name, val) val can not be empty');
  }
  if ('boolean' === typeof val) {
    val = '' + val;
  }
  this._getFormData().append(name, val);
  return this;
};

/**
 * Abort the request, and clear potential timeout.
 *
 * @return {Request}
 * @api public
 */
RequestBase.prototype.abort = function(){
  if (this._aborted) {
    return this;
  }
  this._aborted = true;
  this.xhr && this.xhr.abort(); // browser
  this.req && this.req.abort(); // node
  this.clearTimeout();
  this.emit('abort');
  return this;
};

/**
 * Enable transmission of cookies with x-domain requests.
 *
 * Note that for this to work the origin must not be
 * using "Access-Control-Allow-Origin" with a wildcard,
 * and also must set "Access-Control-Allow-Credentials"
 * to "true".
 *
 * @api public
 */

RequestBase.prototype.withCredentials = function(on){
  // This is browser-only functionality. Node side is no-op.
  if(on==undefined) on = true;
  this._withCredentials = on;
  return this;
};

/**
 * Set the max redirects to `n`. Does noting in browser XHR implementation.
 *
 * @param {Number} n
 * @return {Request} for chaining
 * @api public
 */

RequestBase.prototype.redirects = function(n){
  this._maxRedirects = n;
  return this;
};

/**
 * Convert to a plain javascript object (not JSON string) of scalar properties.
 * Note as this method is designed to return a useful non-this value,
 * it cannot be chained.
 *
 * @return {Object} describing method, url, and data of this request
 * @api public
 */

RequestBase.prototype.toJSON = function(){
  return {
    method: this.method,
    url: this.url,
    data: this._data,
    headers: this._header
  };
};


/**
 * Send `data` as the request body, defaulting the `.type()` to "json" when
 * an object is given.
 *
 * Examples:
 *
 *       // manual json
 *       request.post('/user')
 *         .type('json')
 *         .send('{"name":"tj"}')
 *         .end(callback)
 *
 *       // auto json
 *       request.post('/user')
 *         .send({ name: 'tj' })
 *         .end(callback)
 *
 *       // manual x-www-form-urlencoded
 *       request.post('/user')
 *         .type('form')
 *         .send('name=tj')
 *         .end(callback)
 *
 *       // auto x-www-form-urlencoded
 *       request.post('/user')
 *         .type('form')
 *         .send({ name: 'tj' })
 *         .end(callback)
 *
 *       // defaults to x-www-form-urlencoded
 *      request.post('/user')
 *        .send('name=tobi')
 *        .send('species=ferret')
 *        .end(callback)
 *
 * @param {String|Object} data
 * @return {Request} for chaining
 * @api public
 */

RequestBase.prototype.send = function(data){
  var isObj = isObject(data);
  var type = this._header['content-type'];

  if (this._formData) {
    console.error(".send() can't be used if .attach() or .field() is used. Please use only .send() or only .field() & .attach()");
  }

  if (isObj && !this._data) {
    if (Array.isArray(data)) {
      this._data = [];
    } else if (!this._isHost(data)) {
      this._data = {};
    }
  } else if (data && this._data && this._isHost(this._data)) {
    throw Error("Can't merge these send calls");
  }

  // merge
  if (isObj && isObject(this._data)) {
    for (var key in data) {
      this._data[key] = data[key];
    }
  } else if ('string' == typeof data) {
    // default to x-www-form-urlencoded
    if (!type) this.type('form');
    type = this._header['content-type'];
    if ('application/x-www-form-urlencoded' == type) {
      this._data = this._data
        ? this._data + '&' + data
        : data;
    } else {
      this._data = (this._data || '') + data;
    }
  } else {
    this._data = data;
  }

  if (!isObj || this._isHost(data)) {
    return this;
  }

  // default to json
  if (!type) this.type('json');
  return this;
};


/**
 * Sort `querystring` by the sort function
 *
 *
 * Examples:
 *
 *       // default order
 *       request.get('/user')
 *         .query('name=Nick')
 *         .query('search=Manny')
 *         .sortQuery()
 *         .end(callback)
 *
 *       // customized sort function
 *       request.get('/user')
 *         .query('name=Nick')
 *         .query('search=Manny')
 *         .sortQuery(function(a, b){
 *           return a.length - b.length;
 *         })
 *         .end(callback)
 *
 *
 * @param {Function} sort
 * @return {Request} for chaining
 * @api public
 */

RequestBase.prototype.sortQuery = function(sort) {
  // _sort default to true but otherwise can be a function or boolean
  this._sort = typeof sort === 'undefined' ? true : sort;
  return this;
};

/**
 * Invoke callback with timeout error.
 *
 * @api private
 */

RequestBase.prototype._timeoutError = function(reason, timeout, errno){
  if (this._aborted) {
    return;
  }
  var err = new Error(reason + timeout + 'ms exceeded');
  err.timeout = timeout;
  err.code = 'ECONNABORTED';
  err.errno = errno;
  this.timedout = true;
  this.abort();
  this.callback(err);
};

RequestBase.prototype._setTimeouts = function() {
  var self = this;

  // deadline
  if (this._timeout && !this._timer) {
    this._timer = setTimeout(function(){
      self._timeoutError('Timeout of ', self._timeout, 'ETIME');
    }, this._timeout);
  }
  // response timeout
  if (this._responseTimeout && !this._responseTimeoutTimer) {
    this._responseTimeoutTimer = setTimeout(function(){
      self._timeoutError('Response timeout of ', self._responseTimeout, 'ETIMEDOUT');
    }, this._responseTimeout);
  }
}

},{"./is-object":11}],13:[function(require,module,exports){

/**
 * Module dependencies.
 */

var utils = require('./utils');

/**
 * Expose `ResponseBase`.
 */

module.exports = ResponseBase;

/**
 * Initialize a new `ResponseBase`.
 *
 * @api public
 */

function ResponseBase(obj) {
  if (obj) return mixin(obj);
}

/**
 * Mixin the prototype properties.
 *
 * @param {Object} obj
 * @return {Object}
 * @api private
 */

function mixin(obj) {
  for (var key in ResponseBase.prototype) {
    obj[key] = ResponseBase.prototype[key];
  }
  return obj;
}

/**
 * Get case-insensitive `field` value.
 *
 * @param {String} field
 * @return {String}
 * @api public
 */

ResponseBase.prototype.get = function(field){
    return this.header[field.toLowerCase()];
};

/**
 * Set header related properties:
 *
 *   - `.type` the content type without params
 *
 * A response of "Content-Type: text/plain; charset=utf-8"
 * will provide you with a `.type` of "text/plain".
 *
 * @param {Object} header
 * @api private
 */

ResponseBase.prototype._setHeaderProperties = function(header){
    // TODO: moar!
    // TODO: make this a util

    // content-type
    var ct = header['content-type'] || '';
    this.type = utils.type(ct);

    // params
    var params = utils.params(ct);
    for (var key in params) this[key] = params[key];

    this.links = {};

    // links
    try {
        if (header.link) {
            this.links = utils.parseLinks(header.link);
        }
    } catch (err) {
        // ignore
    }
};

/**
 * Set flags such as `.ok` based on `status`.
 *
 * For example a 2xx response will give you a `.ok` of __true__
 * whereas 5xx will be __false__ and `.error` will be __true__. The
 * `.clientError` and `.serverError` are also available to be more
 * specific, and `.statusType` is the class of error ranging from 1..5
 * sometimes useful for mapping respond colors etc.
 *
 * "sugar" properties are also defined for common cases. Currently providing:
 *
 *   - .noContent
 *   - .badRequest
 *   - .unauthorized
 *   - .notAcceptable
 *   - .notFound
 *
 * @param {Number} status
 * @api private
 */

ResponseBase.prototype._setStatusProperties = function(status){
    var type = status / 100 | 0;

    // status / class
    this.status = this.statusCode = status;
    this.statusType = type;

    // basics
    this.info = 1 == type;
    this.ok = 2 == type;
    this.redirect = 3 == type;
    this.clientError = 4 == type;
    this.serverError = 5 == type;
    this.error = (4 == type || 5 == type)
        ? this.toError()
        : false;

    // sugar
    this.accepted = 202 == status;
    this.noContent = 204 == status;
    this.badRequest = 400 == status;
    this.unauthorized = 401 == status;
    this.notAcceptable = 406 == status;
    this.forbidden = 403 == status;
    this.notFound = 404 == status;
};

},{"./utils":15}],14:[function(require,module,exports){
var ERROR_CODES = [
  'ECONNRESET',
  'ETIMEDOUT',
  'EADDRINFO',
  'ESOCKETTIMEDOUT'
];

/**
 * Determine if a request should be retried.
 * (Borrowed from segmentio/superagent-retry)
 *
 * @param {Error} err
 * @param {Response} [res]
 * @returns {Boolean}
 */
module.exports = function shouldRetry(err, res) {
  if (err && err.code && ~ERROR_CODES.indexOf(err.code)) return true;
  if (res && res.status && res.status >= 500) return true;
  // Superagent timeout
  if (err && 'timeout' in err && err.code == 'ECONNABORTED') return true;
  if (err && 'crossDomain' in err) return true;
  return false;
};

},{}],15:[function(require,module,exports){

/**
 * Return the mime type for the given `str`.
 *
 * @param {String} str
 * @return {String}
 * @api private
 */

exports.type = function(str){
  return str.split(/ *; */).shift();
};

/**
 * Return header field parameters.
 *
 * @param {String} str
 * @return {Object}
 * @api private
 */

exports.params = function(str){
  return str.split(/ *; */).reduce(function(obj, str){
    var parts = str.split(/ *= */);
    var key = parts.shift();
    var val = parts.shift();

    if (key && val) obj[key] = val;
    return obj;
  }, {});
};

/**
 * Parse Link header fields.
 *
 * @param {String} str
 * @return {Object}
 * @api private
 */

exports.parseLinks = function(str){
  return str.split(/ *, */).reduce(function(obj, str){
    var parts = str.split(/ *; */);
    var url = parts[0].slice(1, -1);
    var rel = parts[1].split(/ *= */)[1].slice(1, -1);
    obj[rel] = url;
    return obj;
  }, {});
};

/**
 * Strip content related fields from `header`.
 *
 * @param {Object} header
 * @return {Object} header
 * @api private
 */

exports.cleanHeader = function(header, shouldStripCookie){
  delete header['content-type'];
  delete header['content-length'];
  delete header['transfer-encoding'];
  delete header['host'];
  if (shouldStripCookie) {
    delete header['cookie'];
  }
  return header;
};
},{}],16:[function(require,module,exports){
(function (Buffer){
/**
 * quantimodo
 * QuantiModo makes it easy to retrieve normalized user data from a wide array of devices and applications. [Learn about QuantiModo](https://quantimo.do), check out our [docs](https://github.com/QuantiModo/docs) or contact us at [help.quantimo.do](https://help.quantimo.do).
 *
 * OpenAPI spec version: 5.8.728
 *
 * NOTE: This class is auto generated by the swagger code generator program.
 * https://github.com/swagger-api/swagger-codegen.git
 *
 * Swagger Codegen version: 2.2.3
 *
 * Do not edit the class manually.
 *
 */

(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define(['superagent', 'querystring'], factory);
  } else if (typeof module === 'object' && module.exports) {
    // CommonJS-like environments that support module.exports, like Node.
    module.exports = factory(require('superagent'), require('querystring'));
  } else {
    // Browser globals (root is window)
    if (!root.Quantimodo) {
      root.Quantimodo = {};
    }
    root.Quantimodo.ApiClient = factory(root.superagent, root.querystring);
  }
}(this, function(superagent, querystring) {
  'use strict';

  /**
   * @module ApiClient
   * @version 5.8.807
   */

  /**
   * Manages low level client-server communications, parameter marshalling, etc. There should not be any need for an
   * application to use this class directly - the *Api and model classes provide the public API for the service. The
   * contents of this file should be regarded as internal but are documented for completeness.
   * @alias module:ApiClient
   * @class
   */
  var exports = function() {
    /**
     * The base URL against which to resolve every API call's (relative) path.
     * @type {String}
     * @default https://app.quantimo.do/api
     */
    this.basePath = 'https://app.quantimo.do/api'.replace(/\/+$/, '');

    /**
     * The authentication methods to be included for all API calls.
     * @type {Array.<String>}
     */
    this.authentications = {
      'access_token': {type: 'apiKey', 'in': 'query', name: 'access_token'},
      'client_id': {type: 'apiKey', 'in': 'query', name: 'clientId'},
      'quantimodo_oauth2': {type: 'oauth2'}
    };
    /**
     * The default HTTP headers to be included for all API calls.
     * @type {Array.<String>}
     * @default {}
     */
    this.defaultHeaders = {};

    /**
     * The default HTTP timeout for all API calls.
     * @type {Number}
     * @default 60000
     */
    this.timeout = 60000;

    /**
     * If set to false an additional timestamp parameter is added to all API GET calls to
     * prevent browser caching
     * @type {Boolean}
     * @default true
     */
    this.cache = true;

    /**
     * If set to true, the client will save the cookies from each server
     * response, and return them in the next request.
     * @default false
     */
    this.enableCookies = false;

    /*
     * Used to save and return cookies in a node.js (non-browser) setting,
     * if this.enableCookies is set to true.
     */
    if (typeof window === 'undefined') {
      this.agent = new superagent.agent();
    }

  };

  /**
   * Returns a string representation for an actual parameter.
   * @param param The actual parameter.
   * @returns {String} The string representation of <code>param</code>.
   */
  exports.prototype.paramToString = function(param) {
    if (param == undefined || param == null) {
      return '';
    }
    if (param instanceof Date) {
      return param.toJSON();
    }
    return param.toString();
  };

  /**
   * Builds full URL by appending the given path to the base URL and replacing path parameter place-holders with parameter values.
   * NOTE: query parameters are not handled here.
   * @param {String} path The path to append to the base URL.
   * @param {Object} pathParams The parameter values to append.
   * @returns {String} The encoded path with parameter values substituted.
   */
  exports.prototype.buildUrl = function(path, pathParams) {
    if (!path.match(/^\//)) {
      path = '/' + path;
    }
    var url = this.basePath + path;
    var _this = this;
    url = url.replace(/\{([\w-]+)\}/g, function(fullMatch, key) {
      var value;
      if (pathParams.hasOwnProperty(key)) {
        value = _this.paramToString(pathParams[key]);
      } else {
        value = fullMatch;
      }
      return encodeURIComponent(value);
    });
    return url;
  };

  /**
   * Checks whether the given content type represents JSON.<br>
   * JSON content type examples:<br>
   * <ul>
   * <li>application/json</li>
   * <li>application/json; charset=UTF8</li>
   * <li>APPLICATION/JSON</li>
   * </ul>
   * @param {String} contentType The MIME content type to check.
   * @returns {Boolean} <code>true</code> if <code>contentType</code> represents JSON, otherwise <code>false</code>.
   */
  exports.prototype.isJsonMime = function(contentType) {
    return Boolean(contentType != null && contentType.match(/^application\/json(;.*)?$/i));
  };

  /**
   * Chooses a content type from the given array, with JSON preferred; i.e. return JSON if included, otherwise return the first.
   * @param {Array.<String>} contentTypes
   * @returns {String} The chosen content type, preferring JSON.
   */
  exports.prototype.jsonPreferredMime = function(contentTypes) {
    for (var i = 0; i < contentTypes.length; i++) {
      if (this.isJsonMime(contentTypes[i])) {
        return contentTypes[i];
      }
    }
    return contentTypes[0];
  };

  /**
   * Checks whether the given parameter value represents file-like content.
   * @param param The parameter to check.
   * @returns {Boolean} <code>true</code> if <code>param</code> represents a file.
   */
  exports.prototype.isFileParam = function(param) {
    // fs.ReadStream in Node.js and Electron (but not in runtime like browserify)
    if (typeof require === 'function') {
      var fs;
      try {
        fs = require('fs');
      } catch (err) {}
      if (fs && fs.ReadStream && param instanceof fs.ReadStream) {
        return true;
      }
    }
    // Buffer in Node.js
    if (typeof Buffer === 'function' && param instanceof Buffer) {
      return true;
    }
    // Blob in browser
    if (typeof Blob === 'function' && param instanceof Blob) {
      return true;
    }
    // File in browser (it seems File object is also instance of Blob, but keep this for safe)
    if (typeof File === 'function' && param instanceof File) {
      return true;
    }
    return false;
  };

  /**
   * Normalizes parameter values:
   * <ul>
   * <li>remove nils</li>
   * <li>keep files and arrays</li>
   * <li>format to string with `paramToString` for other cases</li>
   * </ul>
   * @param {Object.<String, Object>} params The parameters as object properties.
   * @returns {Object.<String, Object>} normalized parameters.
   */
  exports.prototype.normalizeParams = function(params) {
    var newParams = {};
    for (var key in params) {
      if (params.hasOwnProperty(key) && params[key] != undefined && params[key] != null) {
        var value = params[key];
        if (this.isFileParam(value) || Array.isArray(value)) {
          newParams[key] = value;
        } else {
          newParams[key] = this.paramToString(value);
        }
      }
    }
    return newParams;
  };

  /**
   * Enumeration of collection format separator strategies.
   * @enum {String}
   * @readonly
   */
  exports.CollectionFormatEnum = {
    /**
     * Comma-separated values. Value: <code>csv</code>
     * @const
     */
    CSV: ',',
    /**
     * Space-separated values. Value: <code>ssv</code>
     * @const
     */
    SSV: ' ',
    /**
     * Tab-separated values. Value: <code>tsv</code>
     * @const
     */
    TSV: '\t',
    /**
     * Pipe(|)-separated values. Value: <code>pipes</code>
     * @const
     */
    PIPES: '|',
    /**
     * Native array. Value: <code>multi</code>
     * @const
     */
    MULTI: 'multi'
  };

  /**
   * Builds a string representation of an array-type actual parameter, according to the given collection format.
   * @param {Array} param An array parameter.
   * @param {module:ApiClient.CollectionFormatEnum} collectionFormat The array element separator strategy.
   * @returns {String|Array} A string representation of the supplied collection, using the specified delimiter. Returns
   * <code>param</code> as is if <code>collectionFormat</code> is <code>multi</code>.
   */
  exports.prototype.buildCollectionParam = function buildCollectionParam(param, collectionFormat) {
    if (param == null) {
      return null;
    }
    switch (collectionFormat) {
      case 'csv':
        return param.map(this.paramToString).join(',');
      case 'ssv':
        return param.map(this.paramToString).join(' ');
      case 'tsv':
        return param.map(this.paramToString).join('\t');
      case 'pipes':
        return param.map(this.paramToString).join('|');
      case 'multi':
        // return the array directly as SuperAgent will handle it as expected
        return param.map(this.paramToString);
      default:
        throw new Error('Unknown collection format: ' + collectionFormat);
    }
  };

  /**
   * Applies authentication headers to the request.
   * @param {Object} request The request object created by a <code>superagent()</code> call.
   * @param {Array.<String>} authNames An array of authentication method names.
   */
  exports.prototype.applyAuthToRequest = function(request, authNames) {
    var _this = this;
    authNames.forEach(function(authName) {
      var auth = _this.authentications[authName];
      switch (auth.type) {
        case 'basic':
          if (auth.username || auth.password) {
            request.auth(auth.username || '', auth.password || '');
          }
          break;
        case 'apiKey':
          if (auth.apiKey) {
            var data = {};
            if (auth.apiKeyPrefix) {
              data[auth.name] = auth.apiKeyPrefix + ' ' + auth.apiKey;
            } else {
              data[auth.name] = auth.apiKey;
            }
            if (auth['in'] === 'header') {
              request.set(data);
            } else {
              request.query(data);
            }
          }
          break;
        case 'oauth2':
          if (auth.accessToken) {
            request.set({'Authorization': 'Bearer ' + auth.accessToken});
          }
          break;
        default:
          throw new Error('Unknown authentication type: ' + auth.type);
      }
    });
  };

  /**
   * Deserializes an HTTP response body into a value of the specified type.
   * @param {Object} response A SuperAgent response object.
   * @param {(String|Array.<String>|Object.<String, Object>|Function)} returnType The type to return. Pass a string for simple types
   * or the constructor function for a complex type. Pass an array containing the type name to return an array of that type. To
   * return an object, pass an object with one property whose name is the key type and whose value is the corresponding value type:
   * all properties on <code>data<code> will be converted to this type.
   * @returns A value of the specified type.
   */
  exports.prototype.deserialize = function deserialize(response, returnType) {
    if (response == null || returnType == null || response.status == 204) {
      return null;
    }
    // Rely on SuperAgent for parsing response body.
    // See http://visionmedia.github.io/superagent/#parsing-response-bodies
    var data = response.body;
    if (data == null || (typeof data === 'object' && typeof data.length === 'undefined' && !Object.keys(data).length)) {
      // SuperAgent does not always produce a body; use the unparsed response as a fallback
      data = response.text;
    }
    return exports.convertToType(data, returnType);
  };

  /**
   * Callback function to receive the result of the operation.
   * @callback module:ApiClient~callApiCallback
   * @param {String} error Error message, if any.
   * @param data The data returned by the service call.
   * @param {String} response The complete HTTP response.
   */

  /**
   * Invokes the REST service using the supplied settings and parameters.
   * @param {String} path The base URL to invoke.
   * @param {String} httpMethod The HTTP method to use.
   * @param {Object.<String, String>} pathParams A map of path parameters and their values.
   * @param {Object.<String, Object>} queryParams A map of query parameters and their values.
   * @param {Object.<String, Object>} headerParams A map of header parameters and their values.
   * @param {Object.<String, Object>} formParams A map of form parameters and their values.
   * @param {Object} bodyParam The value to pass as the request body.
   * @param {Array.<String>} authNames An array of authentication type names.
   * @param {Array.<String>} contentTypes An array of request MIME types.
   * @param {Array.<String>} accepts An array of acceptable response MIME types.
   * @param {(String|Array|ObjectFunction)} returnType The required type to return; can be a string for simple types or the
   * constructor for a complex type.
   * @param {module:ApiClient~callApiCallback} callback The callback function.
   * @returns {Object} The SuperAgent request object.
   */
  exports.prototype.callApi = function callApi(path, httpMethod, pathParams,
      queryParams, headerParams, formParams, bodyParam, authNames, contentTypes, accepts,
      returnType, callback) {

    var _this = this;
    var url = this.buildUrl(path, pathParams);
    var request = superagent(httpMethod, url);

    // apply authentications
    this.applyAuthToRequest(request, authNames);

    // set query parameters
    if (httpMethod.toUpperCase() === 'GET' && this.cache === false) {
        queryParams['_'] = new Date().getTime();
    }
    request.query(this.normalizeParams(queryParams));

    // set header parameters
    request.set(this.defaultHeaders).set(this.normalizeParams(headerParams));

    // set request timeout
    request.timeout(this.timeout);

    var contentType = this.jsonPreferredMime(contentTypes);
    if (contentType) {
      // Issue with superagent and multipart/form-data (https://github.com/visionmedia/superagent/issues/746)
      if(contentType != 'multipart/form-data') {
        request.type(contentType);
      }
    } else if (!request.header['Content-Type']) {
      request.type('application/json');
    }

    if (contentType === 'application/x-www-form-urlencoded') {
      request.send(querystring.stringify(this.normalizeParams(formParams)));
    } else if (contentType == 'multipart/form-data') {
      var _formParams = this.normalizeParams(formParams);
      for (var key in _formParams) {
        if (_formParams.hasOwnProperty(key)) {
          if (this.isFileParam(_formParams[key])) {
            // file field
            request.attach(key, _formParams[key]);
          } else {
            request.field(key, _formParams[key]);
          }
        }
      }
    } else if (bodyParam) {
      request.send(bodyParam);
    }

    var accept = this.jsonPreferredMime(accepts);
    if (accept) {
      request.accept(accept);
    }

    if (returnType === 'Blob') {
      request.responseType('blob');
    } else if (returnType === 'String') {
      request.responseType('string');
    }

    // Attach previously saved cookies, if enabled
    if (this.enableCookies){
      if (typeof window === 'undefined') {
        this.agent.attachCookies(request);
      }
      else {
        request.withCredentials();
      }
    }


    request.end(function(error, response) {
      if (callback) {
        var data = null;
        if (!error) {
          try {
            data = _this.deserialize(response, returnType);
            if (_this.enableCookies && typeof window === 'undefined'){
              _this.agent.saveCookies(response);
            }
          } catch (err) {
            error = err;
          }
        }
        callback(error, data, response);
      }
    });

    return request;
  };

  /**
   * Parses an ISO-8601 string representation of a date value.
   * @param {String} str The date value as a string.
   * @returns {Date} The parsed date object.
   */
  exports.parseDate = function(str) {
    return new Date(str.replace(/T/i, ' '));
  };

  /**
   * Converts a value to the specified type.
   * @param {(String|Object)} data The data to convert, as a string or object.
   * @param {(String|Array.<String>|Object.<String, Object>|Function)} type The type to return. Pass a string for simple types
   * or the constructor function for a complex type. Pass an array containing the type name to return an array of that type. To
   * return an object, pass an object with one property whose name is the key type and whose value is the corresponding value type:
   * all properties on <code>data<code> will be converted to this type.
   * @returns An instance of the specified type or null or undefined if data is null or undefined.
   */
  exports.convertToType = function(data, type) {
    if (data === null || data === undefined)
      return data

    switch (type) {
      case 'Boolean':
        return Boolean(data);
      case 'Integer':
        return parseInt(data, 10);
      case 'Number':
        return parseFloat(data);
      case 'String':
        return String(data);
      case 'Date':
        return this.parseDate(String(data));
      case 'Blob':
      	return data;
      default:
        if (type === Object) {
          // generic object, return directly
          return data;
        } else if (typeof type === 'function') {
          // for model type like: User
          return type.constructFromObject(data);
        } else if (Array.isArray(type)) {
          // for array type like: ['String']
          var itemType = type[0];
          return data.map(function(item) {
            return exports.convertToType(item, itemType);
          });
        } else if (typeof type === 'object') {
          // for plain object type like: {'String': 'Integer'}
          var keyType, valueType;
          for (var k in type) {
            if (type.hasOwnProperty(k)) {
              keyType = k;
              valueType = type[k];
              break;
            }
          }
          var result = {};
          for (var k in data) {
            if (data.hasOwnProperty(k)) {
              var key = exports.convertToType(k, keyType);
              var value = exports.convertToType(data[k], valueType);
              result[key] = value;
            }
          }
          return result;
        } else {
          // for unknown type, return the data directly
          return data;
        }
    }
  };

  /**
   * Constructs a new map or array model from REST data.
   * @param data {Object|Array} The REST data.
   * @param obj {Object|Array} The target object or array.
   */
  exports.constructFromObject = function(data, obj, itemType) {
    if (Array.isArray(data)) {
      for (var i = 0; i < data.length; i++) {
        if (data.hasOwnProperty(i))
          obj[i] = exports.convertToType(data[i], itemType);
      }
    } else {
      for (var k in data) {
        if (data.hasOwnProperty(k))
          obj[k] = exports.convertToType(data[k], itemType);
      }
    }
  };

  /**
   * The default API client implementation.
   * @type {module:ApiClient}
   */
  exports.instance = new exports();

  return exports;
}));

}).call(this,require("buffer").Buffer)
},{"buffer":3,"fs":2,"querystring":7,"superagent":9}],17:[function(require,module,exports){
/**
 * quantimodo
 * QuantiModo makes it easy to retrieve normalized user data from a wide array of devices and applications. [Learn about QuantiModo](https://quantimo.do), check out our [docs](https://github.com/QuantiModo/docs) or contact us at [help.quantimo.do](https://help.quantimo.do).
 *
 * OpenAPI spec version: 5.8.728
 *
 * NOTE: This class is auto generated by the swagger code generator program.
 * https://github.com/swagger-api/swagger-codegen.git
 *
 * Swagger Codegen version: 2.2.3
 *
 * Do not edit the class manually.
 *
 */

(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define(['ApiClient', 'model/AggregatedCorrelation', 'model/CommonResponse', 'model/GetCorrelationsResponse', 'model/GetStudyResponse', 'model/JsonErrorResponse', 'model/PostCorrelation', 'model/UserCorrelation', 'model/Vote', 'model/VoteDelete'], factory);
  } else if (typeof module === 'object' && module.exports) {
    // CommonJS-like environments that support module.exports, like Node.
    module.exports = factory(require('../ApiClient'), require('../model/AggregatedCorrelation'), require('../model/CommonResponse'), require('../model/GetCorrelationsResponse'), require('../model/GetStudyResponse'), require('../model/JsonErrorResponse'), require('../model/PostCorrelation'), require('../model/UserCorrelation'), require('../model/Vote'), require('../model/VoteDelete'));
  } else {
    // Browser globals (root is window)
    if (!root.Quantimodo) {
      root.Quantimodo = {};
    }
    root.Quantimodo.AnalyticsApi = factory(root.Quantimodo.ApiClient, root.Quantimodo.AggregatedCorrelation, root.Quantimodo.CommonResponse, root.Quantimodo.GetCorrelationsResponse, root.Quantimodo.GetStudyResponse, root.Quantimodo.JsonErrorResponse, root.Quantimodo.PostCorrelation, root.Quantimodo.UserCorrelation, root.Quantimodo.Vote, root.Quantimodo.VoteDelete);
  }
}(this, function(ApiClient, AggregatedCorrelation, CommonResponse, GetCorrelationsResponse, GetStudyResponse, JsonErrorResponse, PostCorrelation, UserCorrelation, Vote, VoteDelete) {
  'use strict';

  /**
   * Analytics service.
   * @module api/AnalyticsApi
   * @version 5.8.807
   */

  /**
   * Constructs a new AnalyticsApi. 
   * @alias module:api/AnalyticsApi
   * @class
   * @param {module:ApiClient} apiClient Optional API client implementation to use,
   * default to {@link module:ApiClient#instance} if unspecified.
   */
  var exports = function(apiClient) {
    this.apiClient = apiClient || ApiClient.instance;


    /**
     * Callback function to receive the result of the deleteVote operation.
     * @callback module:api/AnalyticsApi~deleteVoteCallback
     * @param {String} error Error message, if any.
     * @param {module:model/CommonResponse} data The data returned by the service call.
     * @param {String} response The complete HTTP response.
     */

    /**
     * Delete vote
     * Delete previously posted vote
     * @param {module:model/VoteDelete} body The cause and effect variable names for the predictor vote to be deleted.
     * @param {Object} opts Optional parameters
     * @param {Number} opts.userId User&#39;s id
     * @param {module:api/AnalyticsApi~deleteVoteCallback} callback The callback function, accepting three arguments: error, data, response
     * data is of type: {@link module:model/CommonResponse}
     */
    this.deleteVote = function(body, opts, callback) {
      opts = opts || {};
      var postBody = body;

      // verify the required parameter 'body' is set
      if (body === undefined || body === null) {
        throw new Error("Missing the required parameter 'body' when calling deleteVote");
      }


      var pathParams = {
      };
      var queryParams = {
        'userId': opts['userId']
      };
      var headerParams = {
      };
      var formParams = {
      };

      var authNames = ['access_token', 'quantimodo_oauth2'];
      var contentTypes = ['application/json'];
      var accepts = ['application/json'];
      var returnType = CommonResponse;

      return this.apiClient.callApi(
        '/v3/votes/delete', 'DELETE',
        pathParams, queryParams, headerParams, formParams, postBody,
        authNames, contentTypes, accepts, returnType, callback
      );
    }

    /**
     * Callback function to receive the result of the getAggregatedCorrelations operation.
     * @callback module:api/AnalyticsApi~getAggregatedCorrelationsCallback
     * @param {String} error Error message, if any.
     * @param {Array.<module:model/AggregatedCorrelation>} data The data returned by the service call.
     * @param {String} response The complete HTTP response.
     */

    /**
     * Get aggregated correlations
     * Get correlations based on the anonymized aggregate data from all QuantiModo users.
     * @param {Object} opts Optional parameters
     * @param {Number} opts.userId User&#39;s id
     * @param {String} opts.effectVariableName Variable name of the hypothetical effect variable.  Example: Overall Mood
     * @param {String} opts.causeVariableName Variable name of the hypothetical cause variable.  Example: Sleep Duration
     * @param {String} opts.correlationCoefficient Pearson correlation coefficient between cause and effect after lagging by onset delay and grouping by duration of action
     * @param {String} opts.onsetDelay The amount of time in seconds that elapses after the predictor/stimulus event before the outcome as perceived by a self-tracker is known as the onset delay. For example, the onset delay between the time a person takes an aspirin (predictor/stimulus event) and the time a person perceives a change in their headache severity (outcome) is approximately 30 minutes.
     * @param {String} opts.durationOfAction The amount of time over which a predictor/stimulus event can exert an observable influence on an outcome variable value. For instance, aspirin (stimulus/predictor) typically decreases headache severity for approximately four hours (duration of action) following the onset delay.
     * @param {String} opts.updatedAt When the record was last updated. Use UTC ISO 8601 &#x60;YYYY-MM-DDThh:mm:ss&#x60; datetime format. Time zone should be UTC and not local.
     * @param {Number} opts.limit The LIMIT is used to limit the number of results returned. So if youhave 1000 results, but only want to the first 10, you would set this to 10 and offset to 0. The maximum limit is 200 records. (default to 100)
     * @param {Number} opts.offset OFFSET says to skip that many rows before beginning to return rows to the client. OFFSET 0 is the same as omitting the OFFSET clause.If both OFFSET and LIMIT appear, then OFFSET rows are skipped before starting to count the LIMIT rows that are returned.
     * @param {String} opts.sort Sort by one of the listed field names. If the field name is prefixed with &#x60;-&#x60;, it will sort in descending order.
     * @param {Boolean} opts.outcomesOfInterest Only include correlations for which the effect is an outcome of interest for the user
     * @param {module:api/AnalyticsApi~getAggregatedCorrelationsCallback} callback The callback function, accepting three arguments: error, data, response
     * data is of type: {@link Array.<module:model/AggregatedCorrelation>}
     */
    this.getAggregatedCorrelations = function(opts, callback) {
      opts = opts || {};
      var postBody = null;


      var pathParams = {
      };
      var queryParams = {
        'userId': opts['userId'],
        'effectVariableName': opts['effectVariableName'],
        'causeVariableName': opts['causeVariableName'],
        'correlationCoefficient': opts['correlationCoefficient'],
        'onsetDelay': opts['onsetDelay'],
        'durationOfAction': opts['durationOfAction'],
        'updatedAt': opts['updatedAt'],
        'limit': opts['limit'],
        'offset': opts['offset'],
        'sort': opts['sort'],
        'outcomesOfInterest': opts['outcomesOfInterest']
      };
      var headerParams = {
      };
      var formParams = {
      };

      var authNames = ['access_token', 'quantimodo_oauth2'];
      var contentTypes = ['application/json'];
      var accepts = ['application/json'];
      var returnType = [AggregatedCorrelation];

      return this.apiClient.callApi(
        '/v3/aggregatedCorrelations', 'GET',
        pathParams, queryParams, headerParams, formParams, postBody,
        authNames, contentTypes, accepts, returnType, callback
      );
    }

    /**
     * Callback function to receive the result of the getStudy operation.
     * @callback module:api/AnalyticsApi~getStudyCallback
     * @param {String} error Error message, if any.
     * @param {module:model/GetStudyResponse} data The data returned by the service call.
     * @param {String} response The complete HTTP response.
     */

    /**
     * Get Study
     * Get Study
     * @param {Object} opts Optional parameters
     * @param {String} opts.causeVariableName Variable name of the hypothetical cause variable.  Example: Sleep Duration
     * @param {String} opts.effectVariableName Variable name of the hypothetical effect variable.  Example: Overall Mood
     * @param {String} opts.appName Example: MoodiModo
     * @param {String} opts.clientId Example: oauth_test_client
     * @param {Boolean} opts.includeCharts Example: true
     * @param {module:api/AnalyticsApi~getStudyCallback} callback The callback function, accepting three arguments: error, data, response
     * data is of type: {@link module:model/GetStudyResponse}
     */
    this.getStudy = function(opts, callback) {
      opts = opts || {};
      var postBody = null;


      var pathParams = {
      };
      var queryParams = {
        'causeVariableName': opts['causeVariableName'],
        'effectVariableName': opts['effectVariableName'],
        'appName': opts['appName'],
        'clientId': opts['clientId'],
        'includeCharts': opts['includeCharts']
      };
      var headerParams = {
      };
      var formParams = {
      };

      var authNames = [];
      var contentTypes = ['application/json'];
      var accepts = ['application/json'];
      var returnType = GetStudyResponse;

      return this.apiClient.callApi(
        '/v4/study', 'GET',
        pathParams, queryParams, headerParams, formParams, postBody,
        authNames, contentTypes, accepts, returnType, callback
      );
    }

    /**
     * Callback function to receive the result of the getUserCorrelationExplantions operation.
     * @callback module:api/AnalyticsApi~getUserCorrelationExplantionsCallback
     * @param {String} error Error message, if any.
     * @param {Array.<module:model/UserCorrelation>} data The data returned by the service call.
     * @param {String} response The complete HTTP response.
     */

    /**
     * Get correlation explanations
     * Get explanations of  correlations based on data from a single user.
     * @param {Object} opts Optional parameters
     * @param {String} opts.effectVariableName Variable name of the hypothetical effect variable.  Example: Overall Mood
     * @param {String} opts.causeVariableName Variable name of the hypothetical cause variable.  Example: Sleep Duration
     * @param {module:api/AnalyticsApi~getUserCorrelationExplantionsCallback} callback The callback function, accepting three arguments: error, data, response
     * data is of type: {@link Array.<module:model/UserCorrelation>}
     */
    this.getUserCorrelationExplantions = function(opts, callback) {
      opts = opts || {};
      var postBody = null;


      var pathParams = {
      };
      var queryParams = {
        'effectVariableName': opts['effectVariableName'],
        'causeVariableName': opts['causeVariableName']
      };
      var headerParams = {
      };
      var formParams = {
      };

      var authNames = ['access_token', 'quantimodo_oauth2'];
      var contentTypes = ['application/json'];
      var accepts = ['application/json'];
      var returnType = [UserCorrelation];

      return this.apiClient.callApi(
        '/v3/correlations/explanations', 'GET',
        pathParams, queryParams, headerParams, formParams, postBody,
        authNames, contentTypes, accepts, returnType, callback
      );
    }

    /**
     * Callback function to receive the result of the getUserCorrelations operation.
     * @callback module:api/AnalyticsApi~getUserCorrelationsCallback
     * @param {String} error Error message, if any.
     * @param {module:model/GetCorrelationsResponse} data The data returned by the service call.
     * @param {String} response The complete HTTP response.
     */

    /**
     * Get correlations
     * Get correlations based on data from a single user.
     * @param {Object} opts Optional parameters
     * @param {Number} opts.userId User&#39;s id
     * @param {String} opts.effectVariableName Variable name of the hypothetical effect variable.  Example: Overall Mood
     * @param {String} opts.causeVariableName Variable name of the hypothetical cause variable.  Example: Sleep Duration
     * @param {String} opts.correlationCoefficient Pearson correlation coefficient between cause and effect after lagging by onset delay and grouping by duration of action
     * @param {String} opts.onsetDelay The amount of time in seconds that elapses after the predictor/stimulus event before the outcome as perceived by a self-tracker is known as the onset delay. For example, the onset delay between the time a person takes an aspirin (predictor/stimulus event) and the time a person perceives a change in their headache severity (outcome) is approximately 30 minutes.
     * @param {String} opts.durationOfAction The amount of time over which a predictor/stimulus event can exert an observable influence on an outcome variable value. For instance, aspirin (stimulus/predictor) typically decreases headache severity for approximately four hours (duration of action) following the onset delay.
     * @param {String} opts.updatedAt When the record was last updated. Use UTC ISO 8601 &#x60;YYYY-MM-DDThh:mm:ss&#x60; datetime format. Time zone should be UTC and not local.
     * @param {Number} opts.limit The LIMIT is used to limit the number of results returned. So if youhave 1000 results, but only want to the first 10, you would set this to 10 and offset to 0. The maximum limit is 200 records. (default to 100)
     * @param {Number} opts.offset OFFSET says to skip that many rows before beginning to return rows to the client. OFFSET 0 is the same as omitting the OFFSET clause.If both OFFSET and LIMIT appear, then OFFSET rows are skipped before starting to count the LIMIT rows that are returned.
     * @param {String} opts.sort Sort by one of the listed field names. If the field name is prefixed with &#x60;-&#x60;, it will sort in descending order.
     * @param {Boolean} opts.outcomesOfInterest Only include correlations for which the effect is an outcome of interest for the user
     * @param {String} opts.appName Example: MoodiModo
     * @param {String} opts.clientId Example: oauth_test_client
     * @param {module:api/AnalyticsApi~getUserCorrelationsCallback} callback The callback function, accepting three arguments: error, data, response
     * data is of type: {@link module:model/GetCorrelationsResponse}
     */
    this.getUserCorrelations = function(opts, callback) {
      opts = opts || {};
      var postBody = null;


      var pathParams = {
      };
      var queryParams = {
        'userId': opts['userId'],
        'effectVariableName': opts['effectVariableName'],
        'causeVariableName': opts['causeVariableName'],
        'correlationCoefficient': opts['correlationCoefficient'],
        'onsetDelay': opts['onsetDelay'],
        'durationOfAction': opts['durationOfAction'],
        'updatedAt': opts['updatedAt'],
        'limit': opts['limit'],
        'offset': opts['offset'],
        'sort': opts['sort'],
        'outcomesOfInterest': opts['outcomesOfInterest'],
        'appName': opts['appName'],
        'clientId': opts['clientId']
      };
      var headerParams = {
      };
      var formParams = {
      };

      var authNames = ['access_token', 'quantimodo_oauth2'];
      var contentTypes = ['application/json'];
      var accepts = ['application/json'];
      var returnType = GetCorrelationsResponse;

      return this.apiClient.callApi(
        '/v3/correlations', 'GET',
        pathParams, queryParams, headerParams, formParams, postBody,
        authNames, contentTypes, accepts, returnType, callback
      );
    }

    /**
     * Callback function to receive the result of the postAggregatedCorrelations operation.
     * @callback module:api/AnalyticsApi~postAggregatedCorrelationsCallback
     * @param {String} error Error message, if any.
     * @param data This operation does not return a value.
     * @param {String} response The complete HTTP response.
     */

    /**
     * Store or Update a Correlation
     * Add correlation
     * @param {module:model/PostCorrelation} body Provides correlation data
     * @param {Object} opts Optional parameters
     * @param {Number} opts.userId User&#39;s id
     * @param {module:api/AnalyticsApi~postAggregatedCorrelationsCallback} callback The callback function, accepting three arguments: error, data, response
     */
    this.postAggregatedCorrelations = function(body, opts, callback) {
      opts = opts || {};
      var postBody = body;

      // verify the required parameter 'body' is set
      if (body === undefined || body === null) {
        throw new Error("Missing the required parameter 'body' when calling postAggregatedCorrelations");
      }


      var pathParams = {
      };
      var queryParams = {
        'userId': opts['userId']
      };
      var headerParams = {
      };
      var formParams = {
      };

      var authNames = ['access_token', 'quantimodo_oauth2'];
      var contentTypes = ['application/json'];
      var accepts = ['application/json'];
      var returnType = null;

      return this.apiClient.callApi(
        '/v3/aggregatedCorrelations', 'POST',
        pathParams, queryParams, headerParams, formParams, postBody,
        authNames, contentTypes, accepts, returnType, callback
      );
    }

    /**
     * Callback function to receive the result of the postVote operation.
     * @callback module:api/AnalyticsApi~postVoteCallback
     * @param {String} error Error message, if any.
     * @param {module:model/CommonResponse} data The data returned by the service call.
     * @param {String} response The complete HTTP response.
     */

    /**
     * Post or update vote
     * This is to enable users to indicate their opinion on the plausibility of a causal relationship between a treatment and outcome. QuantiModo incorporates crowd-sourced plausibility estimations into their algorithm. This is done allowing user to indicate their view of the plausibility of each relationship with thumbs up/down buttons placed next to each prediction.
     * @param {module:model/Vote} body Contains the cause variable, effect variable, and vote value.
     * @param {Object} opts Optional parameters
     * @param {Number} opts.userId User&#39;s id
     * @param {module:api/AnalyticsApi~postVoteCallback} callback The callback function, accepting three arguments: error, data, response
     * data is of type: {@link module:model/CommonResponse}
     */
    this.postVote = function(body, opts, callback) {
      opts = opts || {};
      var postBody = body;

      // verify the required parameter 'body' is set
      if (body === undefined || body === null) {
        throw new Error("Missing the required parameter 'body' when calling postVote");
      }


      var pathParams = {
      };
      var queryParams = {
        'userId': opts['userId']
      };
      var headerParams = {
      };
      var formParams = {
      };

      var authNames = ['access_token', 'quantimodo_oauth2'];
      var contentTypes = ['application/json'];
      var accepts = ['application/json'];
      var returnType = CommonResponse;

      return this.apiClient.callApi(
        '/v3/votes', 'POST',
        pathParams, queryParams, headerParams, formParams, postBody,
        authNames, contentTypes, accepts, returnType, callback
      );
    }
  };

  return exports;
}));

},{"../ApiClient":16,"../model/AggregatedCorrelation":26,"../model/CommonResponse":35,"../model/GetCorrelationsResponse":45,"../model/GetStudyResponse":47,"../model/JsonErrorResponse":52,"../model/PostCorrelation":66,"../model/UserCorrelation":86,"../model/Vote":92,"../model/VoteDelete":93}],18:[function(require,module,exports){
/**
 * quantimodo
 * QuantiModo makes it easy to retrieve normalized user data from a wide array of devices and applications. [Learn about QuantiModo](https://quantimo.do), check out our [docs](https://github.com/QuantiModo/docs) or contact us at [help.quantimo.do](https://help.quantimo.do).
 *
 * OpenAPI spec version: 5.8.728
 *
 * NOTE: This class is auto generated by the swagger code generator program.
 * https://github.com/swagger-api/swagger-codegen.git
 *
 * Swagger Codegen version: 2.2.3
 *
 * Do not edit the class manually.
 *
 */

(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define(['ApiClient'], factory);
  } else if (typeof module === 'object' && module.exports) {
    // CommonJS-like environments that support module.exports, like Node.
    module.exports = factory(require('../ApiClient'));
  } else {
    // Browser globals (root is window)
    if (!root.Quantimodo) {
      root.Quantimodo = {};
    }
    root.Quantimodo.AuthenticationApi = factory(root.Quantimodo.ApiClient);
  }
}(this, function(ApiClient) {
  'use strict';

  /**
   * Authentication service.
   * @module api/AuthenticationApi
   * @version 5.8.807
   */

  /**
   * Constructs a new AuthenticationApi. 
   * @alias module:api/AuthenticationApi
   * @class
   * @param {module:ApiClient} apiClient Optional API client implementation to use,
   * default to {@link module:ApiClient#instance} if unspecified.
   */
  var exports = function(apiClient) {
    this.apiClient = apiClient || ApiClient.instance;


    /**
     * Callback function to receive the result of the getAccessToken operation.
     * @callback module:api/AuthenticationApi~getAccessTokenCallback
     * @param {String} error Error message, if any.
     * @param data This operation does not return a value.
     * @param {String} response The complete HTTP response.
     */

    /**
     * Get a user access token
     * Client provides authorization token obtained from /api/v3/oauth2/authorize to this endpoint and receives an access token. Access token can then be used to query different API endpoints of QuantiModo. ### Request Access Token After user approves your access to the given scope form the https:/app.quantimo.do/v2/oauth2/authorize endpoint, you&#39;ll receive an authorization code to request an access token. This time make a &#x60;POST&#x60; request to &#x60;/api/v2/oauth/access_token&#x60; with parameters including: * &#x60;grant_type&#x60; Can be &#x60;authorization_code&#x60; or &#x60;refresh_token&#x60; since we are getting the &#x60;access_token&#x60; for the first time we don&#39;t have a &#x60;refresh_token&#x60; so this must be &#x60;authorization_code&#x60;. * &#x60;code&#x60; Authorization code you received with the previous request. * &#x60;redirect_uri&#x60; Your application&#39;s redirect url. ### Refreshing Access Token Access tokens expire at some point, to continue using our api you need to refresh them with &#x60;refresh_token&#x60; you received along with the &#x60;access_token&#x60;. To do this make a &#x60;POST&#x60; request to &#x60;/api/v2/oauth/access_token&#x60; with correct parameters, which are: * &#x60;grant_type&#x60; This time grant type must be &#x60;refresh_token&#x60; since we have it. * &#x60;clientId&#x60; Your application&#39;s client id. * &#x60;client_secret&#x60; Your application&#39;s client secret. * &#x60;refresh_token&#x60; The refresh token you received with the &#x60;access_token&#x60;. Every request you make to this endpoint will give you a new refresh token and make the old one expired. So you can keep getting new access tokens with new refresh tokens. ### Using Access Token Currently we support 2 ways for this, you can&#39;t use both at the same time. * Adding access token to the request header as &#x60;Authorization: Bearer {access_token}&#x60; * Adding to the url as a query parameter &#x60;?access_token&#x3D;{access_token}&#x60; You can read more about OAuth2 from [here](http://oauth.net/2/)
     * @param {String} clientSecret This is the secret for your obtained clientId. QuantiModo uses this to validate that only your application uses the clientId.  Obtain this by creating a free application at [https://app.quantimo.do/api/v2/apps](https://app.quantimo.do/api/v2/apps).
     * @param {String} grantType Grant Type can be &#39;authorization_code&#39; or &#39;refresh_token&#39;
     * @param {String} code Authorization code you received with the previous request.
     * @param {String} responseType If the value is code, launches a Basic flow, requiring a POST to the token endpoint to obtain the tokens. If the value is token id_token or id_token token, launches an Implicit flow, requiring the use of Javascript at the redirect URI to retrieve tokens from the URI #fragment.
     * @param {String} scope Scopes include basic, readmeasurements, and writemeasurements. The &#x60;basic&#x60; scope allows you to read user info (displayName, email, etc). The &#x60;readmeasurements&#x60; scope allows one to read a user&#39;s data. The &#x60;writemeasurements&#x60; scope allows you to write user data. Separate multiple scopes by a space.
     * @param {Object} opts Optional parameters
     * @param {String} opts.clientId Example: oauth_test_client
     * @param {String} opts.redirectUri The redirect URI is the URL within your client application that will receive the OAuth2 credentials.
     * @param {String} opts.state An opaque string that is round-tripped in the protocol; that is to say, it is returned as a URI parameter in the Basic flow, and in the URI
     * @param {module:api/AuthenticationApi~getAccessTokenCallback} callback The callback function, accepting three arguments: error, data, response
     */
    this.getAccessToken = function(clientSecret, grantType, code, responseType, scope, opts, callback) {
      opts = opts || {};
      var postBody = null;

      // verify the required parameter 'clientSecret' is set
      if (clientSecret === undefined || clientSecret === null) {
        throw new Error("Missing the required parameter 'clientSecret' when calling getAccessToken");
      }

      // verify the required parameter 'grantType' is set
      if (grantType === undefined || grantType === null) {
        throw new Error("Missing the required parameter 'grantType' when calling getAccessToken");
      }

      // verify the required parameter 'code' is set
      if (code === undefined || code === null) {
        throw new Error("Missing the required parameter 'code' when calling getAccessToken");
      }

      // verify the required parameter 'responseType' is set
      if (responseType === undefined || responseType === null) {
        throw new Error("Missing the required parameter 'responseType' when calling getAccessToken");
      }

      // verify the required parameter 'scope' is set
      if (scope === undefined || scope === null) {
        throw new Error("Missing the required parameter 'scope' when calling getAccessToken");
      }


      var pathParams = {
      };
      var queryParams = {
        'clientId': opts['clientId'],
        'client_secret': clientSecret,
        'grant_type': grantType,
        'code': code,
        'response_type': responseType,
        'scope': scope,
        'redirect_uri': opts['redirectUri'],
        'state': opts['state']
      };
      var headerParams = {
      };
      var formParams = {
      };

      var authNames = ['access_token', 'quantimodo_oauth2'];
      var contentTypes = ['application/json'];
      var accepts = ['application/json'];
      var returnType = null;

      return this.apiClient.callApi(
        '/v3/oauth2/token', 'GET',
        pathParams, queryParams, headerParams, formParams, postBody,
        authNames, contentTypes, accepts, returnType, callback
      );
    }

    /**
     * Callback function to receive the result of the getOauthAuthorizationCode operation.
     * @callback module:api/AuthenticationApi~getOauthAuthorizationCodeCallback
     * @param {String} error Error message, if any.
     * @param data This operation does not return a value.
     * @param {String} response The complete HTTP response.
     */

    /**
     * Request Authorization Code
     * You can implement OAuth2 authentication to your application using our **OAuth2** endpoints.  You need to redirect users to &#x60;/api/v3/oauth2/authorize&#x60; endpoint to get an authorization code and include the parameters below.   This page will ask the user if they want to allow a client&#39;s application to submit or obtain data from their QM account. It will redirect the user to the url provided by the client application with the code as a query parameter or error in case of an error. See the /api/v2/oauth/access_token endpoint for the next steps.
     * @param {String} clientSecret This is the secret for your obtained clientId. QuantiModo uses this to validate that only your application uses the clientId.  Obtain this by creating a free application at [https://app.quantimo.do/api/v2/apps](https://app.quantimo.do/api/v2/apps).
     * @param {String} responseType If the value is code, launches a Basic flow, requiring a POST to the token endpoint to obtain the tokens. If the value is token id_token or id_token token, launches an Implicit flow, requiring the use of Javascript at the redirect URI to retrieve tokens from the URI #fragment.
     * @param {String} scope Scopes include basic, readmeasurements, and writemeasurements. The &#x60;basic&#x60; scope allows you to read user info (displayName, email, etc). The &#x60;readmeasurements&#x60; scope allows one to read a user&#39;s data. The &#x60;writemeasurements&#x60; scope allows you to write user data. Separate multiple scopes by a space.
     * @param {Object} opts Optional parameters
     * @param {String} opts.clientId Example: oauth_test_client
     * @param {String} opts.redirectUri The redirect URI is the URL within your client application that will receive the OAuth2 credentials.
     * @param {String} opts.state An opaque string that is round-tripped in the protocol; that is to say, it is returned as a URI parameter in the Basic flow, and in the URI
     * @param {module:api/AuthenticationApi~getOauthAuthorizationCodeCallback} callback The callback function, accepting three arguments: error, data, response
     */
    this.getOauthAuthorizationCode = function(clientSecret, responseType, scope, opts, callback) {
      opts = opts || {};
      var postBody = null;

      // verify the required parameter 'clientSecret' is set
      if (clientSecret === undefined || clientSecret === null) {
        throw new Error("Missing the required parameter 'clientSecret' when calling getOauthAuthorizationCode");
      }

      // verify the required parameter 'responseType' is set
      if (responseType === undefined || responseType === null) {
        throw new Error("Missing the required parameter 'responseType' when calling getOauthAuthorizationCode");
      }

      // verify the required parameter 'scope' is set
      if (scope === undefined || scope === null) {
        throw new Error("Missing the required parameter 'scope' when calling getOauthAuthorizationCode");
      }


      var pathParams = {
      };
      var queryParams = {
        'clientId': opts['clientId'],
        'client_secret': clientSecret,
        'response_type': responseType,
        'scope': scope,
        'redirect_uri': opts['redirectUri'],
        'state': opts['state']
      };
      var headerParams = {
      };
      var formParams = {
      };

      var authNames = ['access_token', 'quantimodo_oauth2'];
      var contentTypes = ['application/json'];
      var accepts = ['application/json'];
      var returnType = null;

      return this.apiClient.callApi(
        '/v3/oauth2/authorize', 'GET',
        pathParams, queryParams, headerParams, formParams, postBody,
        authNames, contentTypes, accepts, returnType, callback
      );
    }
  };

  return exports;
}));

},{"../ApiClient":16}],19:[function(require,module,exports){
/**
 * quantimodo
 * QuantiModo makes it easy to retrieve normalized user data from a wide array of devices and applications. [Learn about QuantiModo](https://quantimo.do), check out our [docs](https://github.com/QuantiModo/docs) or contact us at [help.quantimo.do](https://help.quantimo.do).
 *
 * OpenAPI spec version: 5.8.728
 *
 * NOTE: This class is auto generated by the swagger code generator program.
 * https://github.com/swagger-api/swagger-codegen.git
 *
 * Swagger Codegen version: 2.2.3
 *
 * Do not edit the class manually.
 *
 */

(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define(['ApiClient', 'model/Connector'], factory);
  } else if (typeof module === 'object' && module.exports) {
    // CommonJS-like environments that support module.exports, like Node.
    module.exports = factory(require('../ApiClient'), require('../model/Connector'));
  } else {
    // Browser globals (root is window)
    if (!root.Quantimodo) {
      root.Quantimodo = {};
    }
    root.Quantimodo.ConnectorsApi = factory(root.Quantimodo.ApiClient, root.Quantimodo.Connector);
  }
}(this, function(ApiClient, Connector) {
  'use strict';

  /**
   * Connectors service.
   * @module api/ConnectorsApi
   * @version 5.8.807
   */

  /**
   * Constructs a new ConnectorsApi. 
   * @alias module:api/ConnectorsApi
   * @class
   * @param {module:ApiClient} apiClient Optional API client implementation to use,
   * default to {@link module:ApiClient#instance} if unspecified.
   */
  var exports = function(apiClient) {
    this.apiClient = apiClient || ApiClient.instance;


    /**
     * Callback function to receive the result of the connectConnector operation.
     * @callback module:api/ConnectorsApi~connectConnectorCallback
     * @param {String} error Error message, if any.
     * @param data This operation does not return a value.
     * @param {String} response The complete HTTP response.
     */

    /**
     * Obtain a token from 3rd party data source
     * Attempt to obtain a token from the data provider, store it in the database. With this, the connector to continue to obtain new user data until the token is revoked.
     * @param {module:model/String} connectorName Lowercase system name of the source application or device. Get a list of available connectors from the /v3/connectors/list endpoint.
     * @param {Object} opts Optional parameters
     * @param {Number} opts.userId User&#39;s id
     * @param {module:api/ConnectorsApi~connectConnectorCallback} callback The callback function, accepting three arguments: error, data, response
     */
    this.connectConnector = function(connectorName, opts, callback) {
      opts = opts || {};
      var postBody = null;

      // verify the required parameter 'connectorName' is set
      if (connectorName === undefined || connectorName === null) {
        throw new Error("Missing the required parameter 'connectorName' when calling connectConnector");
      }


      var pathParams = {
        'connectorName': connectorName
      };
      var queryParams = {
        'userId': opts['userId']
      };
      var headerParams = {
      };
      var formParams = {
      };

      var authNames = ['access_token', 'quantimodo_oauth2'];
      var contentTypes = ['application/json'];
      var accepts = ['application/json'];
      var returnType = null;

      return this.apiClient.callApi(
        '/v3/connectors/{connectorName}/connect', 'GET',
        pathParams, queryParams, headerParams, formParams, postBody,
        authNames, contentTypes, accepts, returnType, callback
      );
    }

    /**
     * Callback function to receive the result of the disconnectConnector operation.
     * @callback module:api/ConnectorsApi~disconnectConnectorCallback
     * @param {String} error Error message, if any.
     * @param data This operation does not return a value.
     * @param {String} response The complete HTTP response.
     */

    /**
     * Delete stored connection info
     * The disconnect method deletes any stored tokens or connection information from the connectors database.
     * @param {module:model/String} connectorName Lowercase system name of the source application or device. Get a list of available connectors from the /v3/connectors/list endpoint.
     * @param {module:api/ConnectorsApi~disconnectConnectorCallback} callback The callback function, accepting three arguments: error, data, response
     */
    this.disconnectConnector = function(connectorName, callback) {
      var postBody = null;

      // verify the required parameter 'connectorName' is set
      if (connectorName === undefined || connectorName === null) {
        throw new Error("Missing the required parameter 'connectorName' when calling disconnectConnector");
      }


      var pathParams = {
        'connectorName': connectorName
      };
      var queryParams = {
      };
      var headerParams = {
      };
      var formParams = {
      };

      var authNames = ['access_token', 'quantimodo_oauth2'];
      var contentTypes = ['application/json'];
      var accepts = ['application/json'];
      var returnType = null;

      return this.apiClient.callApi(
        '/v3/connectors/{connectorName}/disconnect', 'GET',
        pathParams, queryParams, headerParams, formParams, postBody,
        authNames, contentTypes, accepts, returnType, callback
      );
    }

    /**
     * Callback function to receive the result of the getConnectors operation.
     * @callback module:api/ConnectorsApi~getConnectorsCallback
     * @param {String} error Error message, if any.
     * @param {Array.<module:model/Connector>} data The data returned by the service call.
     * @param {String} response The complete HTTP response.
     */

    /**
     * List of Connectors
     * A connector pulls data from other data providers using their API or a screenscraper. Returns a list of all available connectors and information about them such as their id, name, whether the user has provided access, logo url, connection instructions, and the update history.
     * @param {Object} opts Optional parameters
     * @param {String} opts.appName Example: MoodiModo
     * @param {String} opts.clientId Example: oauth_test_client
     * @param {module:api/ConnectorsApi~getConnectorsCallback} callback The callback function, accepting three arguments: error, data, response
     * data is of type: {@link Array.<module:model/Connector>}
     */
    this.getConnectors = function(opts, callback) {
      opts = opts || {};
      var postBody = null;


      var pathParams = {
      };
      var queryParams = {
        'appName': opts['appName'],
        'clientId': opts['clientId']
      };
      var headerParams = {
      };
      var formParams = {
      };

      var authNames = ['access_token', 'quantimodo_oauth2'];
      var contentTypes = ['application/json'];
      var accepts = ['application/json'];
      var returnType = [Connector];

      return this.apiClient.callApi(
        '/v4/connectors/list', 'GET',
        pathParams, queryParams, headerParams, formParams, postBody,
        authNames, contentTypes, accepts, returnType, callback
      );
    }

    /**
     * Callback function to receive the result of the getIntegrationJs operation.
     * @callback module:api/ConnectorsApi~getIntegrationJsCallback
     * @param {String} error Error message, if any.
     * @param data This operation does not return a value.
     * @param {String} response The complete HTTP response.
     */

    /**
     * Get embeddable connect javascript
     * Get embeddable connect javascript. Usage:   - Embedding in applications with popups for 3rd-party authentication windows.     Use &#x60;qmSetupInPopup&#x60; function after connecting &#x60;connect.js&#x60;.   - Embedding in applications with popups for 3rd-party authentication windows.     Requires a selector to block. It will be embedded in this block.     Use &#x60;qmSetupOnPage&#x60; function after connecting &#x60;connect.js&#x60;.   - Embedding in mobile applications without popups for 3rd-party authentication.     Use &#x60;qmSetupOnMobile&#x60; function after connecting &#x60;connect.js&#x60;.     If using in a Cordova application call  &#x60;qmSetupOnIonic&#x60; function after connecting &#x60;connect.js&#x60;.
     * @param {Object} opts Optional parameters
     * @param {String} opts.clientId Example: oauth_test_client
     * @param {module:api/ConnectorsApi~getIntegrationJsCallback} callback The callback function, accepting three arguments: error, data, response
     */
    this.getIntegrationJs = function(opts, callback) {
      opts = opts || {};
      var postBody = null;


      var pathParams = {
      };
      var queryParams = {
        'clientId': opts['clientId']
      };
      var headerParams = {
      };
      var formParams = {
      };

      var authNames = [];
      var contentTypes = ['application/json'];
      var accepts = ['application/x-javascript'];
      var returnType = null;

      return this.apiClient.callApi(
        '/v3/integration.js', 'GET',
        pathParams, queryParams, headerParams, formParams, postBody,
        authNames, contentTypes, accepts, returnType, callback
      );
    }

    /**
     * Callback function to receive the result of the getMobileConnectPage operation.
     * @callback module:api/ConnectorsApi~getMobileConnectPageCallback
     * @param {String} error Error message, if any.
     * @param data This operation does not return a value.
     * @param {String} response The complete HTTP response.
     */

    /**
     * Mobile connect page
     * This page is designed to be opened in a webview.  Instead of using popup authentication boxes, it uses redirection. You can include the user&#39;s access_token as a URL parameter like https://app.quantimo.do/api/v3/connect/mobile?access_token&#x3D;123
     * @param {Object} opts Optional parameters
     * @param {Number} opts.userId User&#39;s id
     * @param {module:api/ConnectorsApi~getMobileConnectPageCallback} callback The callback function, accepting three arguments: error, data, response
     */
    this.getMobileConnectPage = function(opts, callback) {
      opts = opts || {};
      var postBody = null;


      var pathParams = {
      };
      var queryParams = {
        'userId': opts['userId']
      };
      var headerParams = {
      };
      var formParams = {
      };

      var authNames = [];
      var contentTypes = ['application/json'];
      var accepts = ['text/html'];
      var returnType = null;

      return this.apiClient.callApi(
        '/v3/connect/mobile', 'GET',
        pathParams, queryParams, headerParams, formParams, postBody,
        authNames, contentTypes, accepts, returnType, callback
      );
    }

    /**
     * Callback function to receive the result of the updateConnector operation.
     * @callback module:api/ConnectorsApi~updateConnectorCallback
     * @param {String} error Error message, if any.
     * @param data This operation does not return a value.
     * @param {String} response The complete HTTP response.
     */

    /**
     * Sync with data source
     * The update method tells the QM Connector Framework to check with the data provider (such as Fitbit or MyFitnessPal) and retrieve any new measurements available.
     * @param {module:model/String} connectorName Lowercase system name of the source application or device. Get a list of available connectors from the /v3/connectors/list endpoint.
     * @param {Object} opts Optional parameters
     * @param {Number} opts.userId User&#39;s id
     * @param {module:api/ConnectorsApi~updateConnectorCallback} callback The callback function, accepting three arguments: error, data, response
     */
    this.updateConnector = function(connectorName, opts, callback) {
      opts = opts || {};
      var postBody = null;

      // verify the required parameter 'connectorName' is set
      if (connectorName === undefined || connectorName === null) {
        throw new Error("Missing the required parameter 'connectorName' when calling updateConnector");
      }


      var pathParams = {
        'connectorName': connectorName
      };
      var queryParams = {
        'userId': opts['userId']
      };
      var headerParams = {
      };
      var formParams = {
      };

      var authNames = ['access_token', 'quantimodo_oauth2'];
      var contentTypes = ['application/json'];
      var accepts = ['application/json'];
      var returnType = null;

      return this.apiClient.callApi(
        '/v3/connectors/{connectorName}/update', 'GET',
        pathParams, queryParams, headerParams, formParams, postBody,
        authNames, contentTypes, accepts, returnType, callback
      );
    }
  };

  return exports;
}));

},{"../ApiClient":16,"../model/Connector":36}],20:[function(require,module,exports){
/**
 * quantimodo
 * QuantiModo makes it easy to retrieve normalized user data from a wide array of devices and applications. [Learn about QuantiModo](https://quantimo.do), check out our [docs](https://github.com/QuantiModo/docs) or contact us at [help.quantimo.do](https://help.quantimo.do).
 *
 * OpenAPI spec version: 5.8.728
 *
 * NOTE: This class is auto generated by the swagger code generator program.
 * https://github.com/swagger-api/swagger-codegen.git
 *
 * Swagger Codegen version: 2.2.3
 *
 * Do not edit the class manually.
 *
 */

(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define(['ApiClient', 'model/CommonResponse', 'model/Measurement', 'model/MeasurementDelete', 'model/MeasurementSet', 'model/MeasurementUpdate', 'model/Pairs'], factory);
  } else if (typeof module === 'object' && module.exports) {
    // CommonJS-like environments that support module.exports, like Node.
    module.exports = factory(require('../ApiClient'), require('../model/CommonResponse'), require('../model/Measurement'), require('../model/MeasurementDelete'), require('../model/MeasurementSet'), require('../model/MeasurementUpdate'), require('../model/Pairs'));
  } else {
    // Browser globals (root is window)
    if (!root.Quantimodo) {
      root.Quantimodo = {};
    }
    root.Quantimodo.MeasurementsApi = factory(root.Quantimodo.ApiClient, root.Quantimodo.CommonResponse, root.Quantimodo.Measurement, root.Quantimodo.MeasurementDelete, root.Quantimodo.MeasurementSet, root.Quantimodo.MeasurementUpdate, root.Quantimodo.Pairs);
  }
}(this, function(ApiClient, CommonResponse, Measurement, MeasurementDelete, MeasurementSet, MeasurementUpdate, Pairs) {
  'use strict';

  /**
   * Measurements service.
   * @module api/MeasurementsApi
   * @version 5.8.807
   */

  /**
   * Constructs a new MeasurementsApi. 
   * @alias module:api/MeasurementsApi
   * @class
   * @param {module:ApiClient} apiClient Optional API client implementation to use,
   * default to {@link module:ApiClient#instance} if unspecified.
   */
  var exports = function(apiClient) {
    this.apiClient = apiClient || ApiClient.instance;


    /**
     * Callback function to receive the result of the deleteMeasurement operation.
     * @callback module:api/MeasurementsApi~deleteMeasurementCallback
     * @param {String} error Error message, if any.
     * @param {module:model/CommonResponse} data The data returned by the service call.
     * @param {String} response The complete HTTP response.
     */

    /**
     * Delete a measurement
     * Delete a previously submitted measurement
     * @param {module:model/MeasurementDelete} body The startTime and variableId of the measurement to be deleted.
     * @param {module:api/MeasurementsApi~deleteMeasurementCallback} callback The callback function, accepting three arguments: error, data, response
     * data is of type: {@link module:model/CommonResponse}
     */
    this.deleteMeasurement = function(body, callback) {
      var postBody = body;

      // verify the required parameter 'body' is set
      if (body === undefined || body === null) {
        throw new Error("Missing the required parameter 'body' when calling deleteMeasurement");
      }


      var pathParams = {
      };
      var queryParams = {
      };
      var headerParams = {
      };
      var formParams = {
      };

      var authNames = ['access_token', 'quantimodo_oauth2'];
      var contentTypes = ['application/json'];
      var accepts = ['application/json'];
      var returnType = CommonResponse;

      return this.apiClient.callApi(
        '/v3/measurements/delete', 'DELETE',
        pathParams, queryParams, headerParams, formParams, postBody,
        authNames, contentTypes, accepts, returnType, callback
      );
    }

    /**
     * Callback function to receive the result of the getMeasurements operation.
     * @callback module:api/MeasurementsApi~getMeasurementsCallback
     * @param {String} error Error message, if any.
     * @param {Array.<module:model/Measurement>} data The data returned by the service call.
     * @param {String} response The complete HTTP response.
     */

    /**
     * Get measurements for this user
     * Measurements are any value that can be recorded like daily steps, a mood rating, or apples eaten.
     * @param {Object} opts Optional parameters
     * @param {Number} opts.userId User&#39;s id
     * @param {Number} opts.id Measurement id
     * @param {String} opts.variableName Name of the variable you want measurements for
     * @param {module:model/String} opts.variableCategoryName Limit results to a specific variable category
     * @param {String} opts.sourceName ID of the source you want measurements for (supports exact name match only)
     * @param {String} opts.value Value of measurement
     * @param {module:model/String} opts.unitName Example: 86400
     * @param {String} opts.earliestMeasurementTime Excluded records with measurement times earlier than this value. Use UTC ISO 8601 &#x60;YYYY-MM-DDThh:mm:ss&#x60;  datetime format. Time zone should be UTC and not local.
     * @param {String} opts.latestMeasurementTime Excluded records with measurement times later than this value. Use UTC ISO 8601 &#x60;YYYY-MM-DDThh:mm:ss&#x60;  datetime format. Time zone should be UTC and not local.
     * @param {String} opts.createdAt When the record was first created. Use UTC ISO 8601 &#x60;YYYY-MM-DDThh:mm:ss&#x60; datetime format. Time zone should be UTC and not local.
     * @param {String} opts.updatedAt When the record was last updated. Use UTC ISO 8601 &#x60;YYYY-MM-DDThh:mm:ss&#x60; datetime format. Time zone should be UTC and not local.
     * @param {Number} opts.groupingWidth The time (in seconds) over which measurements are grouped together
     * @param {String} opts.groupingTimezone The time (in seconds) over which measurements are grouped together
     * @param {Number} opts.limit The LIMIT is used to limit the number of results returned. So if youhave 1000 results, but only want to the first 10, you would set this to 10 and offset to 0. The maximum limit is 200 records. (default to 100)
     * @param {Number} opts.offset OFFSET says to skip that many rows before beginning to return rows to the client. OFFSET 0 is the same as omitting the OFFSET clause.If both OFFSET and LIMIT appear, then OFFSET rows are skipped before starting to count the LIMIT rows that are returned.
     * @param {String} opts.sort Sort by one of the listed field names. If the field name is prefixed with &#x60;-&#x60;, it will sort in descending order.
     * @param {Boolean} opts.doNotProcess Example: true
     * @param {String} opts.appName Example: MoodiModo
     * @param {String} opts.clientId Example: oauth_test_client
     * @param {module:api/MeasurementsApi~getMeasurementsCallback} callback The callback function, accepting three arguments: error, data, response
     * data is of type: {@link Array.<module:model/Measurement>}
     */
    this.getMeasurements = function(opts, callback) {
      opts = opts || {};
      var postBody = null;


      var pathParams = {
      };
      var queryParams = {
        'userId': opts['userId'],
        'id': opts['id'],
        'variableName': opts['variableName'],
        'variableCategoryName': opts['variableCategoryName'],
        'sourceName': opts['sourceName'],
        'value': opts['value'],
        'unitName': opts['unitName'],
        'earliestMeasurementTime': opts['earliestMeasurementTime'],
        'latestMeasurementTime': opts['latestMeasurementTime'],
        'createdAt': opts['createdAt'],
        'updatedAt': opts['updatedAt'],
        'groupingWidth': opts['groupingWidth'],
        'groupingTimezone': opts['groupingTimezone'],
        'limit': opts['limit'],
        'offset': opts['offset'],
        'sort': opts['sort'],
        'doNotProcess': opts['doNotProcess'],
        'appName': opts['appName'],
        'clientId': opts['clientId']
      };
      var headerParams = {
      };
      var formParams = {
      };

      var authNames = ['access_token', 'quantimodo_oauth2'];
      var contentTypes = ['application/json'];
      var accepts = ['application/json'];
      var returnType = [Measurement];

      return this.apiClient.callApi(
        '/v3/measurements', 'GET',
        pathParams, queryParams, headerParams, formParams, postBody,
        authNames, contentTypes, accepts, returnType, callback
      );
    }

    /**
     * Callback function to receive the result of the getPairs operation.
     * @callback module:api/MeasurementsApi~getPairsCallback
     * @param {String} error Error message, if any.
     * @param {Array.<module:model/Pairs>} data The data returned by the service call.
     * @param {String} response The complete HTTP response.
     */

    /**
     * Get pairs of measurements for correlational analysis
     * Pairs cause measurements with effect measurements grouped over the duration of action after the onset delay.
     * @param {Object} opts Optional parameters
     * @param {Number} opts.userId User&#39;s id
     * @param {String} opts.effectVariableName Variable name of the hypothetical effect variable.  Example: Overall Mood
     * @param {String} opts.causeVariableName Variable name of the hypothetical cause variable.  Example: Sleep Duration
     * @param {String} opts.causeUnitName Name for the unit cause measurements to be returned in
     * @param {String} opts.onsetDelay The amount of time in seconds that elapses after the predictor/stimulus event before the outcome as perceived by a self-tracker is known as the onset delay. For example, the onset delay between the time a person takes an aspirin (predictor/stimulus event) and the time a person perceives a change in their headache severity (outcome) is approximately 30 minutes.
     * @param {String} opts.durationOfAction The amount of time over which a predictor/stimulus event can exert an observable influence on an outcome variable value. For instance, aspirin (stimulus/predictor) typically decreases headache severity for approximately four hours (duration of action) following the onset delay.
     * @param {String} opts.effectUnitName Name for the unit effect measurements to be returned in
     * @param {String} opts.earliestMeasurementTime Excluded records with measurement times earlier than this value. Use UTC ISO 8601 &#x60;YYYY-MM-DDThh:mm:ss&#x60;  datetime format. Time zone should be UTC and not local.
     * @param {String} opts.latestMeasurementTime Excluded records with measurement times later than this value. Use UTC ISO 8601 &#x60;YYYY-MM-DDThh:mm:ss&#x60;  datetime format. Time zone should be UTC and not local.
     * @param {Number} opts.limit The LIMIT is used to limit the number of results returned. So if youhave 1000 results, but only want to the first 10, you would set this to 10 and offset to 0. The maximum limit is 200 records. (default to 100)
     * @param {Number} opts.offset OFFSET says to skip that many rows before beginning to return rows to the client. OFFSET 0 is the same as omitting the OFFSET clause.If both OFFSET and LIMIT appear, then OFFSET rows are skipped before starting to count the LIMIT rows that are returned.
     * @param {String} opts.sort Sort by one of the listed field names. If the field name is prefixed with &#x60;-&#x60;, it will sort in descending order.
     * @param {module:api/MeasurementsApi~getPairsCallback} callback The callback function, accepting three arguments: error, data, response
     * data is of type: {@link Array.<module:model/Pairs>}
     */
    this.getPairs = function(opts, callback) {
      opts = opts || {};
      var postBody = null;


      var pathParams = {
      };
      var queryParams = {
        'userId': opts['userId'],
        'effectVariableName': opts['effectVariableName'],
        'causeVariableName': opts['causeVariableName'],
        'causeUnitName': opts['causeUnitName'],
        'onsetDelay': opts['onsetDelay'],
        'durationOfAction': opts['durationOfAction'],
        'effectUnitName': opts['effectUnitName'],
        'earliestMeasurementTime': opts['earliestMeasurementTime'],
        'latestMeasurementTime': opts['latestMeasurementTime'],
        'limit': opts['limit'],
        'offset': opts['offset'],
        'sort': opts['sort']
      };
      var headerParams = {
      };
      var formParams = {
      };

      var authNames = ['access_token', 'quantimodo_oauth2'];
      var contentTypes = ['application/json'];
      var accepts = ['application/json'];
      var returnType = [Pairs];

      return this.apiClient.callApi(
        '/v3/pairs', 'GET',
        pathParams, queryParams, headerParams, formParams, postBody,
        authNames, contentTypes, accepts, returnType, callback
      );
    }

    /**
     * Callback function to receive the result of the measurementExportRequest operation.
     * @callback module:api/MeasurementsApi~measurementExportRequestCallback
     * @param {String} error Error message, if any.
     * @param {'Number'} data The data returned by the service call.
     * @param {String} response The complete HTTP response.
     */

    /**
     * Post Request for Measurements CSV
     * Use this endpoint to schedule a CSV export containing all user measurements to be emailed to the user within 24 hours.
     * @param {Object} opts Optional parameters
     * @param {Number} opts.userId User&#39;s id
     * @param {module:api/MeasurementsApi~measurementExportRequestCallback} callback The callback function, accepting three arguments: error, data, response
     * data is of type: {@link 'Number'}
     */
    this.measurementExportRequest = function(opts, callback) {
      opts = opts || {};
      var postBody = null;


      var pathParams = {
      };
      var queryParams = {
        'userId': opts['userId']
      };
      var headerParams = {
      };
      var formParams = {
      };

      var authNames = ['access_token', 'quantimodo_oauth2'];
      var contentTypes = ['application/json'];
      var accepts = ['application/json'];
      var returnType = 'Number';

      return this.apiClient.callApi(
        '/v2/measurements/exportRequest', 'POST',
        pathParams, queryParams, headerParams, formParams, postBody,
        authNames, contentTypes, accepts, returnType, callback
      );
    }

    /**
     * Callback function to receive the result of the postMeasurements operation.
     * @callback module:api/MeasurementsApi~postMeasurementsCallback
     * @param {String} error Error message, if any.
     * @param data This operation does not return a value.
     * @param {String} response The complete HTTP response.
     */

    /**
     * Post a new set or update existing measurements to the database
     * You can submit or update multiple measurements in a \&quot;measurements\&quot; sub-array.  If the variable these measurements correspond to does not already exist in the database, it will be automatically added.
     * @param {Array.<module:model/MeasurementSet>} body An array of measurement sets containing measurement items you want to insert.
     * @param {Object} opts Optional parameters
     * @param {Number} opts.userId User&#39;s id
     * @param {module:api/MeasurementsApi~postMeasurementsCallback} callback The callback function, accepting three arguments: error, data, response
     */
    this.postMeasurements = function(body, opts, callback) {
      opts = opts || {};
      var postBody = body;

      // verify the required parameter 'body' is set
      if (body === undefined || body === null) {
        throw new Error("Missing the required parameter 'body' when calling postMeasurements");
      }


      var pathParams = {
      };
      var queryParams = {
        'userId': opts['userId']
      };
      var headerParams = {
      };
      var formParams = {
      };

      var authNames = ['access_token', 'quantimodo_oauth2'];
      var contentTypes = ['application/json'];
      var accepts = ['application/json'];
      var returnType = null;

      return this.apiClient.callApi(
        '/v3/measurements', 'POST',
        pathParams, queryParams, headerParams, formParams, postBody,
        authNames, contentTypes, accepts, returnType, callback
      );
    }

    /**
     * Callback function to receive the result of the v3MeasurementsUpdatePost operation.
     * @callback module:api/MeasurementsApi~v3MeasurementsUpdatePostCallback
     * @param {String} error Error message, if any.
     * @param {module:model/CommonResponse} data The data returned by the service call.
     * @param {String} response The complete HTTP response.
     */

    /**
     * Update a measurement
     * Delete a previously submitted measurement
     * @param {module:model/MeasurementUpdate} body The id as well as the new startTime, note, and/or value of the measurement to be updated
     * @param {module:api/MeasurementsApi~v3MeasurementsUpdatePostCallback} callback The callback function, accepting three arguments: error, data, response
     * data is of type: {@link module:model/CommonResponse}
     */
    this.v3MeasurementsUpdatePost = function(body, callback) {
      var postBody = body;

      // verify the required parameter 'body' is set
      if (body === undefined || body === null) {
        throw new Error("Missing the required parameter 'body' when calling v3MeasurementsUpdatePost");
      }


      var pathParams = {
      };
      var queryParams = {
      };
      var headerParams = {
      };
      var formParams = {
      };

      var authNames = ['access_token', 'quantimodo_oauth2'];
      var contentTypes = ['application/json'];
      var accepts = ['application/json'];
      var returnType = CommonResponse;

      return this.apiClient.callApi(
        '/v3/measurements/update', 'POST',
        pathParams, queryParams, headerParams, formParams, postBody,
        authNames, contentTypes, accepts, returnType, callback
      );
    }
  };

  return exports;
}));

},{"../ApiClient":16,"../model/CommonResponse":35,"../model/Measurement":57,"../model/MeasurementDelete":58,"../model/MeasurementSet":60,"../model/MeasurementUpdate":61,"../model/Pairs":64}],21:[function(require,module,exports){
/**
 * quantimodo
 * QuantiModo makes it easy to retrieve normalized user data from a wide array of devices and applications. [Learn about QuantiModo](https://quantimo.do), check out our [docs](https://github.com/QuantiModo/docs) or contact us at [help.quantimo.do](https://help.quantimo.do).
 *
 * OpenAPI spec version: 5.8.728
 *
 * NOTE: This class is auto generated by the swagger code generator program.
 * https://github.com/swagger-api/swagger-codegen.git
 *
 * Swagger Codegen version: 2.2.3
 *
 * Do not edit the class manually.
 *
 */

(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define(['ApiClient', 'model/CommonResponse', 'model/GetTrackingReminderNotificationsResponse', 'model/InlineResponse201', 'model/TrackingReminder', 'model/TrackingReminderDelete', 'model/TrackingReminderNotificationPost'], factory);
  } else if (typeof module === 'object' && module.exports) {
    // CommonJS-like environments that support module.exports, like Node.
    module.exports = factory(require('../ApiClient'), require('../model/CommonResponse'), require('../model/GetTrackingReminderNotificationsResponse'), require('../model/InlineResponse201'), require('../model/TrackingReminder'), require('../model/TrackingReminderDelete'), require('../model/TrackingReminderNotificationPost'));
  } else {
    // Browser globals (root is window)
    if (!root.Quantimodo) {
      root.Quantimodo = {};
    }
    root.Quantimodo.RemindersApi = factory(root.Quantimodo.ApiClient, root.Quantimodo.CommonResponse, root.Quantimodo.GetTrackingReminderNotificationsResponse, root.Quantimodo.InlineResponse201, root.Quantimodo.TrackingReminder, root.Quantimodo.TrackingReminderDelete, root.Quantimodo.TrackingReminderNotificationPost);
  }
}(this, function(ApiClient, CommonResponse, GetTrackingReminderNotificationsResponse, InlineResponse201, TrackingReminder, TrackingReminderDelete, TrackingReminderNotificationPost) {
  'use strict';

  /**
   * Reminders service.
   * @module api/RemindersApi
   * @version 5.8.807
   */

  /**
   * Constructs a new RemindersApi. 
   * @alias module:api/RemindersApi
   * @class
   * @param {module:ApiClient} apiClient Optional API client implementation to use,
   * default to {@link module:ApiClient#instance} if unspecified.
   */
  var exports = function(apiClient) {
    this.apiClient = apiClient || ApiClient.instance;


    /**
     * Callback function to receive the result of the deleteTrackingReminder operation.
     * @callback module:api/RemindersApi~deleteTrackingReminderCallback
     * @param {String} error Error message, if any.
     * @param {module:model/CommonResponse} data The data returned by the service call.
     * @param {String} response The complete HTTP response.
     */

    /**
     * Delete tracking reminder
     * Delete previously created tracking reminder
     * @param {module:model/TrackingReminderDelete} body Id of reminder to be deleted
     * @param {Object} opts Optional parameters
     * @param {Number} opts.userId User&#39;s id
     * @param {module:api/RemindersApi~deleteTrackingReminderCallback} callback The callback function, accepting three arguments: error, data, response
     * data is of type: {@link module:model/CommonResponse}
     */
    this.deleteTrackingReminder = function(body, opts, callback) {
      opts = opts || {};
      var postBody = body;

      // verify the required parameter 'body' is set
      if (body === undefined || body === null) {
        throw new Error("Missing the required parameter 'body' when calling deleteTrackingReminder");
      }


      var pathParams = {
      };
      var queryParams = {
        'userId': opts['userId']
      };
      var headerParams = {
      };
      var formParams = {
      };

      var authNames = ['access_token', 'quantimodo_oauth2'];
      var contentTypes = ['application/json'];
      var accepts = ['application/json'];
      var returnType = CommonResponse;

      return this.apiClient.callApi(
        '/v3/trackingReminders/delete', 'DELETE',
        pathParams, queryParams, headerParams, formParams, postBody,
        authNames, contentTypes, accepts, returnType, callback
      );
    }

    /**
     * Callback function to receive the result of the getTrackingReminderNotifications operation.
     * @callback module:api/RemindersApi~getTrackingReminderNotificationsCallback
     * @param {String} error Error message, if any.
     * @param {module:model/GetTrackingReminderNotificationsResponse} data The data returned by the service call.
     * @param {String} response The complete HTTP response.
     */

    /**
     * Get specific pending tracking reminders
     * Specfic pending reminder instances that still need to be tracked.  
     * @param {Object} opts Optional parameters
     * @param {Number} opts.userId User&#39;s id
     * @param {module:model/String} opts.variableCategoryName Limit results to a specific variable category
     * @param {String} opts.createdAt When the record was first created. Use UTC ISO 8601 &#x60;YYYY-MM-DDThh:mm:ss&#x60; datetime format. Time zone should be UTC and not local.
     * @param {String} opts.updatedAt When the record was last updated. Use UTC ISO 8601 &#x60;YYYY-MM-DDThh:mm:ss&#x60; datetime format. Time zone should be UTC and not local.
     * @param {Number} opts.limit The LIMIT is used to limit the number of results returned. So if youhave 1000 results, but only want to the first 10, you would set this to 10 and offset to 0. The maximum limit is 200 records. (default to 100)
     * @param {Number} opts.offset OFFSET says to skip that many rows before beginning to return rows to the client. OFFSET 0 is the same as omitting the OFFSET clause.If both OFFSET and LIMIT appear, then OFFSET rows are skipped before starting to count the LIMIT rows that are returned.
     * @param {String} opts.sort Sort by one of the listed field names. If the field name is prefixed with &#x60;-&#x60;, it will sort in descending order.
     * @param {String} opts.reminderTime Example: (lt)2017-07-31 21:43:26
     * @param {String} opts.appName Example: MoodiModo
     * @param {String} opts.clientId Example: oauth_test_client
     * @param {module:api/RemindersApi~getTrackingReminderNotificationsCallback} callback The callback function, accepting three arguments: error, data, response
     * data is of type: {@link module:model/GetTrackingReminderNotificationsResponse}
     */
    this.getTrackingReminderNotifications = function(opts, callback) {
      opts = opts || {};
      var postBody = null;


      var pathParams = {
      };
      var queryParams = {
        'userId': opts['userId'],
        'variableCategoryName': opts['variableCategoryName'],
        'createdAt': opts['createdAt'],
        'updatedAt': opts['updatedAt'],
        'limit': opts['limit'],
        'offset': opts['offset'],
        'sort': opts['sort'],
        'reminderTime': opts['reminderTime'],
        'appName': opts['appName'],
        'clientId': opts['clientId']
      };
      var headerParams = {
      };
      var formParams = {
      };

      var authNames = ['access_token', 'quantimodo_oauth2'];
      var contentTypes = ['application/json'];
      var accepts = ['application/json'];
      var returnType = GetTrackingReminderNotificationsResponse;

      return this.apiClient.callApi(
        '/v4/trackingReminderNotifications', 'GET',
        pathParams, queryParams, headerParams, formParams, postBody,
        authNames, contentTypes, accepts, returnType, callback
      );
    }

    /**
     * Callback function to receive the result of the getTrackingReminders operation.
     * @callback module:api/RemindersApi~getTrackingRemindersCallback
     * @param {String} error Error message, if any.
     * @param {Array.<module:model/TrackingReminder>} data The data returned by the service call.
     * @param {String} response The complete HTTP response.
     */

    /**
     * Get repeating tracking reminder settings
     * Users can be reminded to track certain variables at a specified frequency with a default value.
     * @param {Object} opts Optional parameters
     * @param {Number} opts.userId User&#39;s id
     * @param {module:model/String} opts.variableCategoryName Limit results to a specific variable category
     * @param {String} opts.createdAt When the record was first created. Use UTC ISO 8601 &#x60;YYYY-MM-DDThh:mm:ss&#x60; datetime format. Time zone should be UTC and not local.
     * @param {String} opts.updatedAt When the record was last updated. Use UTC ISO 8601 &#x60;YYYY-MM-DDThh:mm:ss&#x60; datetime format. Time zone should be UTC and not local.
     * @param {Number} opts.limit The LIMIT is used to limit the number of results returned. So if youhave 1000 results, but only want to the first 10, you would set this to 10 and offset to 0. The maximum limit is 200 records. (default to 100)
     * @param {Number} opts.offset OFFSET says to skip that many rows before beginning to return rows to the client. OFFSET 0 is the same as omitting the OFFSET clause.If both OFFSET and LIMIT appear, then OFFSET rows are skipped before starting to count the LIMIT rows that are returned.
     * @param {String} opts.sort Sort by one of the listed field names. If the field name is prefixed with &#x60;-&#x60;, it will sort in descending order.
     * @param {String} opts.appName Example: MoodiModo
     * @param {String} opts.clientId Example: oauth_test_client
     * @param {module:api/RemindersApi~getTrackingRemindersCallback} callback The callback function, accepting three arguments: error, data, response
     * data is of type: {@link Array.<module:model/TrackingReminder>}
     */
    this.getTrackingReminders = function(opts, callback) {
      opts = opts || {};
      var postBody = null;


      var pathParams = {
      };
      var queryParams = {
        'userId': opts['userId'],
        'variableCategoryName': opts['variableCategoryName'],
        'createdAt': opts['createdAt'],
        'updatedAt': opts['updatedAt'],
        'limit': opts['limit'],
        'offset': opts['offset'],
        'sort': opts['sort'],
        'appName': opts['appName'],
        'clientId': opts['clientId']
      };
      var headerParams = {
      };
      var formParams = {
      };

      var authNames = ['access_token', 'quantimodo_oauth2'];
      var contentTypes = ['application/json'];
      var accepts = ['application/json'];
      var returnType = [TrackingReminder];

      return this.apiClient.callApi(
        '/v3/trackingReminders', 'GET',
        pathParams, queryParams, headerParams, formParams, postBody,
        authNames, contentTypes, accepts, returnType, callback
      );
    }

    /**
     * Callback function to receive the result of the postTrackingReminderNotifications operation.
     * @callback module:api/RemindersApi~postTrackingReminderNotificationsCallback
     * @param {String} error Error message, if any.
     * @param {module:model/CommonResponse} data The data returned by the service call.
     * @param {String} response The complete HTTP response.
     */

    /**
     * Snooze, skip, or track a pending tracking reminder notification
     * Snooze, skip, or track a pending tracking reminder notification
     * @param {Array.<module:model/TrackingReminderNotificationPost>} body Id of the pending reminder to be snoozed
     * @param {Object} opts Optional parameters
     * @param {Number} opts.userId User&#39;s id
     * @param {String} opts.appName Example: MoodiModo
     * @param {String} opts.clientId Example: oauth_test_client
     * @param {module:api/RemindersApi~postTrackingReminderNotificationsCallback} callback The callback function, accepting three arguments: error, data, response
     * data is of type: {@link module:model/CommonResponse}
     */
    this.postTrackingReminderNotifications = function(body, opts, callback) {
      opts = opts || {};
      var postBody = body;

      // verify the required parameter 'body' is set
      if (body === undefined || body === null) {
        throw new Error("Missing the required parameter 'body' when calling postTrackingReminderNotifications");
      }


      var pathParams = {
      };
      var queryParams = {
        'userId': opts['userId'],
        'appName': opts['appName'],
        'clientId': opts['clientId']
      };
      var headerParams = {
      };
      var formParams = {
      };

      var authNames = ['access_token', 'quantimodo_oauth2'];
      var contentTypes = ['application/json'];
      var accepts = ['application/json'];
      var returnType = CommonResponse;

      return this.apiClient.callApi(
        '/v4/trackingReminderNotifications', 'POST',
        pathParams, queryParams, headerParams, formParams, postBody,
        authNames, contentTypes, accepts, returnType, callback
      );
    }

    /**
     * Callback function to receive the result of the postTrackingReminders operation.
     * @callback module:api/RemindersApi~postTrackingRemindersCallback
     * @param {String} error Error message, if any.
     * @param {module:model/InlineResponse201} data The data returned by the service call.
     * @param {String} response The complete HTTP response.
     */

    /**
     * Store a Tracking Reminder
     * This is to enable users to create reminders to track a variable with a default value at a specified frequency
     * @param {Object} opts Optional parameters
     * @param {Number} opts.userId User&#39;s id
     * @param {module:model/TrackingReminder} opts.body TrackingReminder that should be stored
     * @param {module:api/RemindersApi~postTrackingRemindersCallback} callback The callback function, accepting three arguments: error, data, response
     * data is of type: {@link module:model/InlineResponse201}
     */
    this.postTrackingReminders = function(opts, callback) {
      opts = opts || {};
      var postBody = opts['body'];


      var pathParams = {
      };
      var queryParams = {
        'userId': opts['userId']
      };
      var headerParams = {
      };
      var formParams = {
      };

      var authNames = ['access_token', 'quantimodo_oauth2'];
      var contentTypes = ['application/json'];
      var accepts = ['application/json'];
      var returnType = InlineResponse201;

      return this.apiClient.callApi(
        '/v3/trackingReminders', 'POST',
        pathParams, queryParams, headerParams, formParams, postBody,
        authNames, contentTypes, accepts, returnType, callback
      );
    }
  };

  return exports;
}));

},{"../ApiClient":16,"../model/CommonResponse":35,"../model/GetTrackingReminderNotificationsResponse":48,"../model/InlineResponse201":51,"../model/TrackingReminder":76,"../model/TrackingReminderDelete":77,"../model/TrackingReminderNotificationPost":80}],22:[function(require,module,exports){
/**
 * quantimodo
 * QuantiModo makes it easy to retrieve normalized user data from a wide array of devices and applications. [Learn about QuantiModo](https://quantimo.do), check out our [docs](https://github.com/QuantiModo/docs) or contact us at [help.quantimo.do](https://help.quantimo.do).
 *
 * OpenAPI spec version: 5.8.728
 *
 * NOTE: This class is auto generated by the swagger code generator program.
 * https://github.com/swagger-api/swagger-codegen.git
 *
 * Swagger Codegen version: 2.2.3
 *
 * Do not edit the class manually.
 *
 */

(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define(['ApiClient', 'model/Unit', 'model/UnitCategory'], factory);
  } else if (typeof module === 'object' && module.exports) {
    // CommonJS-like environments that support module.exports, like Node.
    module.exports = factory(require('../ApiClient'), require('../model/Unit'), require('../model/UnitCategory'));
  } else {
    // Browser globals (root is window)
    if (!root.Quantimodo) {
      root.Quantimodo = {};
    }
    root.Quantimodo.UnitsApi = factory(root.Quantimodo.ApiClient, root.Quantimodo.Unit, root.Quantimodo.UnitCategory);
  }
}(this, function(ApiClient, Unit, UnitCategory) {
  'use strict';

  /**
   * Units service.
   * @module api/UnitsApi
   * @version 5.8.807
   */

  /**
   * Constructs a new UnitsApi. 
   * @alias module:api/UnitsApi
   * @class
   * @param {module:ApiClient} apiClient Optional API client implementation to use,
   * default to {@link module:ApiClient#instance} if unspecified.
   */
  var exports = function(apiClient) {
    this.apiClient = apiClient || ApiClient.instance;


    /**
     * Callback function to receive the result of the getUnitCategories operation.
     * @callback module:api/UnitsApi~getUnitCategoriesCallback
     * @param {String} error Error message, if any.
     * @param {Array.<module:model/UnitCategory>} data The data returned by the service call.
     * @param {String} response The complete HTTP response.
     */

    /**
     * Get unit categories
     * Get a list of the categories of measurement units such as &#39;Distance&#39;, &#39;Duration&#39;, &#39;Energy&#39;, &#39;Frequency&#39;, &#39;Miscellany&#39;, &#39;Pressure&#39;, &#39;Proportion&#39;, &#39;Rating&#39;, &#39;Temperature&#39;, &#39;Volume&#39;, and &#39;Weight&#39;.
     * @param {module:api/UnitsApi~getUnitCategoriesCallback} callback The callback function, accepting three arguments: error, data, response
     * data is of type: {@link Array.<module:model/UnitCategory>}
     */
    this.getUnitCategories = function(callback) {
      var postBody = null;


      var pathParams = {
      };
      var queryParams = {
      };
      var headerParams = {
      };
      var formParams = {
      };

      var authNames = ['access_token', 'quantimodo_oauth2'];
      var contentTypes = ['application/json'];
      var accepts = ['application/json'];
      var returnType = [UnitCategory];

      return this.apiClient.callApi(
        '/v3/unitCategories', 'GET',
        pathParams, queryParams, headerParams, formParams, postBody,
        authNames, contentTypes, accepts, returnType, callback
      );
    }

    /**
     * Callback function to receive the result of the getUnits operation.
     * @callback module:api/UnitsApi~getUnitsCallback
     * @param {String} error Error message, if any.
     * @param {Array.<module:model/Unit>} data The data returned by the service call.
     * @param {String} response The complete HTTP response.
     */

    /**
     * Get units
     * Get a list of the available measurement units
     * @param {module:api/UnitsApi~getUnitsCallback} callback The callback function, accepting three arguments: error, data, response
     * data is of type: {@link Array.<module:model/Unit>}
     */
    this.getUnits = function(callback) {
      var postBody = null;


      var pathParams = {
      };
      var queryParams = {
      };
      var headerParams = {
      };
      var formParams = {
      };

      var authNames = ['access_token', 'quantimodo_oauth2'];
      var contentTypes = ['application/json'];
      var accepts = ['application/json'];
      var returnType = [Unit];

      return this.apiClient.callApi(
        '/v3/units', 'GET',
        pathParams, queryParams, headerParams, formParams, postBody,
        authNames, contentTypes, accepts, returnType, callback
      );
    }
  };

  return exports;
}));

},{"../ApiClient":16,"../model/Unit":83,"../model/UnitCategory":84}],23:[function(require,module,exports){
/**
 * quantimodo
 * QuantiModo makes it easy to retrieve normalized user data from a wide array of devices and applications. [Learn about QuantiModo](https://quantimo.do), check out our [docs](https://github.com/QuantiModo/docs) or contact us at [help.quantimo.do](https://help.quantimo.do).
 *
 * OpenAPI spec version: 5.8.728
 *
 * NOTE: This class is auto generated by the swagger code generator program.
 * https://github.com/swagger-api/swagger-codegen.git
 *
 * Swagger Codegen version: 2.2.3
 *
 * Do not edit the class manually.
 *
 */

(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define(['ApiClient', 'model/User'], factory);
  } else if (typeof module === 'object' && module.exports) {
    // CommonJS-like environments that support module.exports, like Node.
    module.exports = factory(require('../ApiClient'), require('../model/User'));
  } else {
    // Browser globals (root is window)
    if (!root.Quantimodo) {
      root.Quantimodo = {};
    }
    root.Quantimodo.UserApi = factory(root.Quantimodo.ApiClient, root.Quantimodo.User);
  }
}(this, function(ApiClient, User) {
  'use strict';

  /**
   * User service.
   * @module api/UserApi
   * @version 5.8.807
   */

  /**
   * Constructs a new UserApi. 
   * @alias module:api/UserApi
   * @class
   * @param {module:ApiClient} apiClient Optional API client implementation to use,
   * default to {@link module:ApiClient#instance} if unspecified.
   */
  var exports = function(apiClient) {
    this.apiClient = apiClient || ApiClient.instance;


    /**
     * Callback function to receive the result of the getUser operation.
     * @callback module:api/UserApi~getUserCallback
     * @param {String} error Error message, if any.
     * @param {module:model/User} data The data returned by the service call.
     * @param {String} response The complete HTTP response.
     */

    /**
     * Get user info
     * Returns user info.  If no userId is specified, returns info for currently authenticated user
     * @param {Object} opts Optional parameters
     * @param {Number} opts.userId User&#39;s id
     * @param {String} opts.createdAt When the record was first created. Use UTC ISO 8601 &#x60;YYYY-MM-DDThh:mm:ss&#x60; datetime format. Time zone should be UTC and not local.
     * @param {String} opts.updatedAt When the record was last updated. Use UTC ISO 8601 &#x60;YYYY-MM-DDThh:mm:ss&#x60; datetime format. Time zone should be UTC and not local.
     * @param {Number} opts.limit The LIMIT is used to limit the number of results returned. So if youhave 1000 results, but only want to the first 10, you would set this to 10 and offset to 0. The maximum limit is 200 records. (default to 100)
     * @param {Number} opts.offset OFFSET says to skip that many rows before beginning to return rows to the client. OFFSET 0 is the same as omitting the OFFSET clause.If both OFFSET and LIMIT appear, then OFFSET rows are skipped before starting to count the LIMIT rows that are returned.
     * @param {String} opts.sort Sort by one of the listed field names. If the field name is prefixed with &#x60;-&#x60;, it will sort in descending order.
     * @param {module:api/UserApi~getUserCallback} callback The callback function, accepting three arguments: error, data, response
     * data is of type: {@link module:model/User}
     */
    this.getUser = function(opts, callback) {
      opts = opts || {};
      var postBody = null;


      var pathParams = {
      };
      var queryParams = {
        'userId': opts['userId'],
        'createdAt': opts['createdAt'],
        'updatedAt': opts['updatedAt'],
        'limit': opts['limit'],
        'offset': opts['offset'],
        'sort': opts['sort']
      };
      var headerParams = {
      };
      var formParams = {
      };

      var authNames = ['access_token', 'quantimodo_oauth2'];
      var contentTypes = ['application/json'];
      var accepts = ['application/json'];
      var returnType = User;

      return this.apiClient.callApi(
        '/v3/user', 'GET',
        pathParams, queryParams, headerParams, formParams, postBody,
        authNames, contentTypes, accepts, returnType, callback
      );
    }

    /**
     * Callback function to receive the result of the postUserSettings operation.
     * @callback module:api/UserApi~postUserSettingsCallback
     * @param {String} error Error message, if any.
     * @param data This operation does not return a value.
     * @param {String} response The complete HTTP response.
     */

    /**
     * Post UserSettings
     * Post UserSettings
     * @param {Object} opts Optional parameters
     * @param {String} opts.appName Example: MoodiModo
     * @param {String} opts.clientId Example: oauth_test_client
     * @param {module:api/UserApi~postUserSettingsCallback} callback The callback function, accepting three arguments: error, data, response
     */
    this.postUserSettings = function(opts, callback) {
      opts = opts || {};
      var postBody = null;


      var pathParams = {
      };
      var queryParams = {
        'appName': opts['appName'],
        'clientId': opts['clientId']
      };
      var headerParams = {
      };
      var formParams = {
      };

      var authNames = [];
      var contentTypes = ['application/json'];
      var accepts = ['application/json'];
      var returnType = null;

      return this.apiClient.callApi(
        '/v3/userSettings', 'POST',
        pathParams, queryParams, headerParams, formParams, postBody,
        authNames, contentTypes, accepts, returnType, callback
      );
    }
  };

  return exports;
}));

},{"../ApiClient":16,"../model/User":85}],24:[function(require,module,exports){
/**
 * quantimodo
 * QuantiModo makes it easy to retrieve normalized user data from a wide array of devices and applications. [Learn about QuantiModo](https://quantimo.do), check out our [docs](https://github.com/QuantiModo/docs) or contact us at [help.quantimo.do](https://help.quantimo.do).
 *
 * OpenAPI spec version: 5.8.728
 *
 * NOTE: This class is auto generated by the swagger code generator program.
 * https://github.com/swagger-api/swagger-codegen.git
 *
 * Swagger Codegen version: 2.2.3
 *
 * Do not edit the class manually.
 *
 */

(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define(['ApiClient', 'model/CommonResponse', 'model/UserTag', 'model/UserVariable', 'model/UserVariableDelete', 'model/Variable', 'model/VariableCategory'], factory);
  } else if (typeof module === 'object' && module.exports) {
    // CommonJS-like environments that support module.exports, like Node.
    module.exports = factory(require('../ApiClient'), require('../model/CommonResponse'), require('../model/UserTag'), require('../model/UserVariable'), require('../model/UserVariableDelete'), require('../model/Variable'), require('../model/VariableCategory'));
  } else {
    // Browser globals (root is window)
    if (!root.Quantimodo) {
      root.Quantimodo = {};
    }
    root.Quantimodo.VariablesApi = factory(root.Quantimodo.ApiClient, root.Quantimodo.CommonResponse, root.Quantimodo.UserTag, root.Quantimodo.UserVariable, root.Quantimodo.UserVariableDelete, root.Quantimodo.Variable, root.Quantimodo.VariableCategory);
  }
}(this, function(ApiClient, CommonResponse, UserTag, UserVariable, UserVariableDelete, Variable, VariableCategory) {
  'use strict';

  /**
   * Variables service.
   * @module api/VariablesApi
   * @version 5.8.807
   */

  /**
   * Constructs a new VariablesApi. 
   * @alias module:api/VariablesApi
   * @class
   * @param {module:ApiClient} apiClient Optional API client implementation to use,
   * default to {@link module:ApiClient#instance} if unspecified.
   */
  var exports = function(apiClient) {
    this.apiClient = apiClient || ApiClient.instance;


    /**
     * Callback function to receive the result of the deleteUserTag operation.
     * @callback module:api/VariablesApi~deleteUserTagCallback
     * @param {String} error Error message, if any.
     * @param {module:model/CommonResponse} data The data returned by the service call.
     * @param {String} response The complete HTTP response.
     */

    /**
     * Delete user tag or ingredient
     * Delete previously created user tags or ingredients.
     * @param {Number} taggedVariableId This is the id of the variable being tagged with an ingredient or something.
     * @param {Number} tagVariableId This is the id of the ingredient variable whose value is determined based on the value of the tagged variable.
     * @param {module:api/VariablesApi~deleteUserTagCallback} callback The callback function, accepting three arguments: error, data, response
     * data is of type: {@link module:model/CommonResponse}
     */
    this.deleteUserTag = function(taggedVariableId, tagVariableId, callback) {
      var postBody = null;

      // verify the required parameter 'taggedVariableId' is set
      if (taggedVariableId === undefined || taggedVariableId === null) {
        throw new Error("Missing the required parameter 'taggedVariableId' when calling deleteUserTag");
      }

      // verify the required parameter 'tagVariableId' is set
      if (tagVariableId === undefined || tagVariableId === null) {
        throw new Error("Missing the required parameter 'tagVariableId' when calling deleteUserTag");
      }


      var pathParams = {
      };
      var queryParams = {
        'taggedVariableId': taggedVariableId,
        'tagVariableId': tagVariableId
      };
      var headerParams = {
      };
      var formParams = {
      };

      var authNames = ['access_token', 'quantimodo_oauth2'];
      var contentTypes = ['application/json'];
      var accepts = ['application/json'];
      var returnType = CommonResponse;

      return this.apiClient.callApi(
        '/v3/userTags/delete', 'DELETE',
        pathParams, queryParams, headerParams, formParams, postBody,
        authNames, contentTypes, accepts, returnType, callback
      );
    }

    /**
     * Callback function to receive the result of the deleteUserVariable operation.
     * @callback module:api/VariablesApi~deleteUserVariableCallback
     * @param {String} error Error message, if any.
     * @param data This operation does not return a value.
     * @param {String} response The complete HTTP response.
     */

    /**
     * Delete All Measurements For Variable
     * Users can delete all of their measurements for a variable
     * @param {module:model/UserVariableDelete} variableId Id of the variable whose measurements should be deleted
     * @param {module:api/VariablesApi~deleteUserVariableCallback} callback The callback function, accepting three arguments: error, data, response
     */
    this.deleteUserVariable = function(variableId, callback) {
      var postBody = variableId;

      // verify the required parameter 'variableId' is set
      if (variableId === undefined || variableId === null) {
        throw new Error("Missing the required parameter 'variableId' when calling deleteUserVariable");
      }


      var pathParams = {
      };
      var queryParams = {
      };
      var headerParams = {
      };
      var formParams = {
      };

      var authNames = ['access_token', 'quantimodo_oauth2'];
      var contentTypes = ['application/json'];
      var accepts = ['application/json'];
      var returnType = null;

      return this.apiClient.callApi(
        '/v3/userVariables/delete', 'DELETE',
        pathParams, queryParams, headerParams, formParams, postBody,
        authNames, contentTypes, accepts, returnType, callback
      );
    }

    /**
     * Callback function to receive the result of the getPublicVariables operation.
     * @callback module:api/VariablesApi~getPublicVariablesCallback
     * @param {String} error Error message, if any.
     * @param {Array.<module:model/Variable>} data The data returned by the service call.
     * @param {String} response The complete HTTP response.
     */

    /**
     * Get public variables
     * This endpoint retrieves an array of all public variables. Public variables are things like foods, medications, symptoms, conditions, and anything not unique to a particular user. For instance, a telephone number or name would not be a public variable.
     * @param {Object} opts Optional parameters
     * @param {Number} opts.userId User&#39;s id
     * @param {Number} opts.id Common variable id
     * @param {module:model/String} opts.variableCategoryName Limit results to a specific variable category
     * @param {String} opts.name Name of the variable. To get results matching a substring, add % as a wildcard as the first and/or last character of a query string parameter. In order to get variables that contain &#x60;Mood&#x60;, the following query should be used: ?variableName&#x3D;%Mood%
     * @param {String} opts.updatedAt When the record was last updated. Use UTC ISO 8601 &#x60;YYYY-MM-DDThh:mm:ss&#x60; datetime format. Time zone should be UTC and not local.
     * @param {String} opts.sourceName ID of the source you want measurements for (supports exact name match only)
     * @param {String} opts.earliestMeasurementTime Excluded records with measurement times earlier than this value. Use UTC ISO 8601 &#x60;YYYY-MM-DDThh:mm:ss&#x60;  datetime format. Time zone should be UTC and not local.
     * @param {String} opts.latestMeasurementTime Excluded records with measurement times later than this value. Use UTC ISO 8601 &#x60;YYYY-MM-DDThh:mm:ss&#x60;  datetime format. Time zone should be UTC and not local.
     * @param {String} opts.numberOfRawMeasurements Filter variables by the total number of measurements that they have. This could be used of you want to filter or sort by popularity.
     * @param {String} opts.lastSourceName Limit variables to those which measurements were last submitted by a specific source. So if you have a client application and you only want variables that were last updated by your app, you can include the name of your app here
     * @param {Number} opts.limit The LIMIT is used to limit the number of results returned. So if youhave 1000 results, but only want to the first 10, you would set this to 10 and offset to 0. The maximum limit is 200 records. (default to 100)
     * @param {Number} opts.offset OFFSET says to skip that many rows before beginning to return rows to the client. OFFSET 0 is the same as omitting the OFFSET clause.If both OFFSET and LIMIT appear, then OFFSET rows are skipped before starting to count the LIMIT rows that are returned.
     * @param {String} opts.sort Sort by one of the listed field names. If the field name is prefixed with &#x60;-&#x60;, it will sort in descending order.
     * @param {module:api/VariablesApi~getPublicVariablesCallback} callback The callback function, accepting three arguments: error, data, response
     * data is of type: {@link Array.<module:model/Variable>}
     */
    this.getPublicVariables = function(opts, callback) {
      opts = opts || {};
      var postBody = null;


      var pathParams = {
      };
      var queryParams = {
        'userId': opts['userId'],
        'id': opts['id'],
        'variableCategoryName': opts['variableCategoryName'],
        'name': opts['name'],
        'updatedAt': opts['updatedAt'],
        'sourceName': opts['sourceName'],
        'earliestMeasurementTime': opts['earliestMeasurementTime'],
        'latestMeasurementTime': opts['latestMeasurementTime'],
        'numberOfRawMeasurements': opts['numberOfRawMeasurements'],
        'lastSourceName': opts['lastSourceName'],
        'limit': opts['limit'],
        'offset': opts['offset'],
        'sort': opts['sort']
      };
      var headerParams = {
      };
      var formParams = {
      };

      var authNames = ['access_token', 'quantimodo_oauth2'];
      var contentTypes = ['application/json'];
      var accepts = ['application/json'];
      var returnType = [Variable];

      return this.apiClient.callApi(
        '/v3/public/variables', 'GET',
        pathParams, queryParams, headerParams, formParams, postBody,
        authNames, contentTypes, accepts, returnType, callback
      );
    }

    /**
     * Callback function to receive the result of the getUserVariables operation.
     * @callback module:api/VariablesApi~getUserVariablesCallback
     * @param {String} error Error message, if any.
     * @param {Array.<module:model/UserVariable>} data The data returned by the service call.
     * @param {String} response The complete HTTP response.
     */

    /**
     * Get variables with user&#39;s settings
     * Get variables for which the user has measurements. If the user has specified variable settings, these are provided instead of the common variable defaults.
     * @param {Object} opts Optional parameters
     * @param {Number} opts.userId User&#39;s id
     * @param {Number} opts.id Common variable id
     * @param {module:model/String} opts.variableCategoryName Limit results to a specific variable category
     * @param {String} opts.name Name of the variable. To get results matching a substring, add % as a wildcard as the first and/or last character of a query string parameter. In order to get variables that contain &#x60;Mood&#x60;, the following query should be used: ?variableName&#x3D;%Mood%
     * @param {String} opts.updatedAt When the record was last updated. Use UTC ISO 8601 &#x60;YYYY-MM-DDThh:mm:ss&#x60; datetime format. Time zone should be UTC and not local.
     * @param {String} opts.sourceName ID of the source you want measurements for (supports exact name match only)
     * @param {String} opts.earliestMeasurementTime Excluded records with measurement times earlier than this value. Use UTC ISO 8601 &#x60;YYYY-MM-DDThh:mm:ss&#x60;  datetime format. Time zone should be UTC and not local.
     * @param {String} opts.latestMeasurementTime Excluded records with measurement times later than this value. Use UTC ISO 8601 &#x60;YYYY-MM-DDThh:mm:ss&#x60;  datetime format. Time zone should be UTC and not local.
     * @param {String} opts.numberOfRawMeasurements Filter variables by the total number of measurements that they have. This could be used of you want to filter or sort by popularity.
     * @param {String} opts.lastSourceName Limit variables to those which measurements were last submitted by a specific source. So if you have a client application and you only want variables that were last updated by your app, you can include the name of your app here
     * @param {Number} opts.limit The LIMIT is used to limit the number of results returned. So if youhave 1000 results, but only want to the first 10, you would set this to 10 and offset to 0. The maximum limit is 200 records. (default to 100)
     * @param {Number} opts.offset OFFSET says to skip that many rows before beginning to return rows to the client. OFFSET 0 is the same as omitting the OFFSET clause.If both OFFSET and LIMIT appear, then OFFSET rows are skipped before starting to count the LIMIT rows that are returned.
     * @param {String} opts.sort Sort by one of the listed field names. If the field name is prefixed with &#x60;-&#x60;, it will sort in descending order.
     * @param {module:api/VariablesApi~getUserVariablesCallback} callback The callback function, accepting three arguments: error, data, response
     * data is of type: {@link Array.<module:model/UserVariable>}
     */
    this.getUserVariables = function(opts, callback) {
      opts = opts || {};
      var postBody = null;


      var pathParams = {
      };
      var queryParams = {
        'userId': opts['userId'],
        'id': opts['id'],
        'variableCategoryName': opts['variableCategoryName'],
        'name': opts['name'],
        'updatedAt': opts['updatedAt'],
        'sourceName': opts['sourceName'],
        'earliestMeasurementTime': opts['earliestMeasurementTime'],
        'latestMeasurementTime': opts['latestMeasurementTime'],
        'numberOfRawMeasurements': opts['numberOfRawMeasurements'],
        'lastSourceName': opts['lastSourceName'],
        'limit': opts['limit'],
        'offset': opts['offset'],
        'sort': opts['sort']
      };
      var headerParams = {
      };
      var formParams = {
      };

      var authNames = ['access_token', 'quantimodo_oauth2'];
      var contentTypes = ['application/json'];
      var accepts = ['application/json'];
      var returnType = [UserVariable];

      return this.apiClient.callApi(
        '/v3/userVariables', 'GET',
        pathParams, queryParams, headerParams, formParams, postBody,
        authNames, contentTypes, accepts, returnType, callback
      );
    }

    /**
     * Callback function to receive the result of the getVariableCategories operation.
     * @callback module:api/VariablesApi~getVariableCategoriesCallback
     * @param {String} error Error message, if any.
     * @param {Array.<module:model/VariableCategory>} data The data returned by the service call.
     * @param {String} response The complete HTTP response.
     */

    /**
     * Variable categories
     * The variable categories include Activity, Causes of Illness, Cognitive Performance, Conditions, Environment, Foods, Location, Miscellaneous, Mood, Nutrition, Physical Activity, Physique, Sleep, Social Interactions, Symptoms, Treatments, Vital Signs, and Work.
     * @param {module:api/VariablesApi~getVariableCategoriesCallback} callback The callback function, accepting three arguments: error, data, response
     * data is of type: {@link Array.<module:model/VariableCategory>}
     */
    this.getVariableCategories = function(callback) {
      var postBody = null;


      var pathParams = {
      };
      var queryParams = {
      };
      var headerParams = {
      };
      var formParams = {
      };

      var authNames = ['access_token', 'quantimodo_oauth2'];
      var contentTypes = ['application/json'];
      var accepts = ['application/json'];
      var returnType = [VariableCategory];

      return this.apiClient.callApi(
        '/v3/variableCategories', 'GET',
        pathParams, queryParams, headerParams, formParams, postBody,
        authNames, contentTypes, accepts, returnType, callback
      );
    }

    /**
     * Callback function to receive the result of the postUserTags operation.
     * @callback module:api/VariablesApi~postUserTagsCallback
     * @param {String} error Error message, if any.
     * @param {module:model/CommonResponse} data The data returned by the service call.
     * @param {String} response The complete HTTP response.
     */

    /**
     * Post or update user tags or ingredients
     * This endpoint allows users to tag foods with their ingredients.  This information will then be used to infer the user intake of the different ingredients by just entering the foods. The inferred intake levels will then be used to determine the effects of different nutrients on the user during analysis.
     * @param {module:model/UserTag} body Contains the new user tag data
     * @param {Object} opts Optional parameters
     * @param {Number} opts.userId User&#39;s id
     * @param {module:api/VariablesApi~postUserTagsCallback} callback The callback function, accepting three arguments: error, data, response
     * data is of type: {@link module:model/CommonResponse}
     */
    this.postUserTags = function(body, opts, callback) {
      opts = opts || {};
      var postBody = body;

      // verify the required parameter 'body' is set
      if (body === undefined || body === null) {
        throw new Error("Missing the required parameter 'body' when calling postUserTags");
      }


      var pathParams = {
      };
      var queryParams = {
        'userId': opts['userId']
      };
      var headerParams = {
      };
      var formParams = {
      };

      var authNames = ['access_token', 'quantimodo_oauth2'];
      var contentTypes = ['application/json'];
      var accepts = ['application/json'];
      var returnType = CommonResponse;

      return this.apiClient.callApi(
        '/v3/userTags', 'POST',
        pathParams, queryParams, headerParams, formParams, postBody,
        authNames, contentTypes, accepts, returnType, callback
      );
    }

    /**
     * Callback function to receive the result of the postUserVariables operation.
     * @callback module:api/VariablesApi~postUserVariablesCallback
     * @param {String} error Error message, if any.
     * @param {module:model/CommonResponse} data The data returned by the service call.
     * @param {String} response The complete HTTP response.
     */

    /**
     * Update User Settings for a Variable
     * Users can change the parameters used in analysis of that variable such as the expected duration of action for a variable to have an effect, the estimated delay before the onset of action. In order to filter out erroneous data, they are able to set the maximum and minimum reasonable daily values for a variable.
     * @param {Array.<module:model/UserVariable>} userVariables Variable user settings data
     * @param {Object} opts Optional parameters
     * @param {String} opts.appName Example: MoodiModo
     * @param {String} opts.clientId Example: oauth_test_client
     * @param {module:api/VariablesApi~postUserVariablesCallback} callback The callback function, accepting three arguments: error, data, response
     * data is of type: {@link module:model/CommonResponse}
     */
    this.postUserVariables = function(userVariables, opts, callback) {
      opts = opts || {};
      var postBody = userVariables;

      // verify the required parameter 'userVariables' is set
      if (userVariables === undefined || userVariables === null) {
        throw new Error("Missing the required parameter 'userVariables' when calling postUserVariables");
      }


      var pathParams = {
      };
      var queryParams = {
        'appName': opts['appName'],
        'clientId': opts['clientId']
      };
      var headerParams = {
      };
      var formParams = {
      };

      var authNames = ['access_token', 'quantimodo_oauth2'];
      var contentTypes = ['application/json'];
      var accepts = ['application/json'];
      var returnType = CommonResponse;

      return this.apiClient.callApi(
        '/v3/userVariables', 'POST',
        pathParams, queryParams, headerParams, formParams, postBody,
        authNames, contentTypes, accepts, returnType, callback
      );
    }

    /**
     * Callback function to receive the result of the resetUserVariableSettings operation.
     * @callback module:api/VariablesApi~resetUserVariableSettingsCallback
     * @param {String} error Error message, if any.
     * @param data This operation does not return a value.
     * @param {String} response The complete HTTP response.
     */

    /**
     * Reset user settings for a variable to defaults
     * Reset user settings for a variable to defaults
     * @param {module:model/UserVariableDelete} variableId Id of the variable whose measurements should be deleted
     * @param {module:api/VariablesApi~resetUserVariableSettingsCallback} callback The callback function, accepting three arguments: error, data, response
     */
    this.resetUserVariableSettings = function(variableId, callback) {
      var postBody = variableId;

      // verify the required parameter 'variableId' is set
      if (variableId === undefined || variableId === null) {
        throw new Error("Missing the required parameter 'variableId' when calling resetUserVariableSettings");
      }


      var pathParams = {
      };
      var queryParams = {
      };
      var headerParams = {
      };
      var formParams = {
      };

      var authNames = ['access_token', 'quantimodo_oauth2'];
      var contentTypes = ['application/json'];
      var accepts = ['application/json'];
      var returnType = null;

      return this.apiClient.callApi(
        '/v3/userVariables/reset', 'POST',
        pathParams, queryParams, headerParams, formParams, postBody,
        authNames, contentTypes, accepts, returnType, callback
      );
    }
  };

  return exports;
}));

},{"../ApiClient":16,"../model/CommonResponse":35,"../model/UserTag":87,"../model/UserVariable":88,"../model/UserVariableDelete":89,"../model/Variable":90,"../model/VariableCategory":91}],25:[function(require,module,exports){
/**
 * quantimodo
 * QuantiModo makes it easy to retrieve normalized user data from a wide array of devices and applications. [Learn about QuantiModo](https://quantimo.do), check out our [docs](https://github.com/QuantiModo/docs) or contact us at [help.quantimo.do](https://help.quantimo.do).
 *
 * OpenAPI spec version: 5.8.728
 *
 * NOTE: This class is auto generated by the swagger code generator program.
 * https://github.com/swagger-api/swagger-codegen.git
 *
 * Swagger Codegen version: 2.2.3
 *
 * Do not edit the class manually.
 *
 */

(function(factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define(['ApiClient', 'model/AggregatedCorrelation', 'model/Animation', 'model/Button', 'model/Category', 'model/Chart', 'model/ChartConfig', 'model/ChartStyle', 'model/Color', 'model/Column', 'model/CommonResponse', 'model/Connector', 'model/ConnectorInstruction', 'model/ConversionStep', 'model/Correlation', 'model/Credit', 'model/DataSource', 'model/Explanation', 'model/ExplanationStartTracking', 'model/GetCorrelationsDataResponse', 'model/GetCorrelationsResponse', 'model/GetStudyDataResponse', 'model/GetStudyResponse', 'model/GetTrackingReminderNotificationsResponse', 'model/Hover', 'model/Image', 'model/InlineResponse201', 'model/JsonErrorResponse', 'model/Lang', 'model/Legend', 'model/Loading', 'model/Marker', 'model/Measurement', 'model/MeasurementDelete', 'model/MeasurementItem', 'model/MeasurementSet', 'model/MeasurementUpdate', 'model/Option', 'model/Pair', 'model/Pairs', 'model/PlotOption', 'model/PostCorrelation', 'model/ProcessedDailyMeasurement', 'model/Scatter', 'model/Series', 'model/State', 'model/Statistic', 'model/Study', 'model/Subtitle', 'model/Title', 'model/Tooltip', 'model/TrackingReminder', 'model/TrackingReminderDelete', 'model/TrackingReminderNotification', 'model/TrackingReminderNotificationActionArray', 'model/TrackingReminderNotificationPost', 'model/TrackingReminderNotificationTrackAllAction', 'model/TrackingReminderNotificationsArray', 'model/Unit', 'model/UnitCategory', 'model/User', 'model/UserCorrelation', 'model/UserTag', 'model/UserVariable', 'model/UserVariableDelete', 'model/Variable', 'model/VariableCategory', 'model/Vote', 'model/VoteDelete', 'model/XAxi', 'model/YAxi', 'api/AnalyticsApi', 'api/AuthenticationApi', 'api/ConnectorsApi', 'api/MeasurementsApi', 'api/RemindersApi', 'api/UnitsApi', 'api/UserApi', 'api/VariablesApi'], factory);
  } else if (typeof module === 'object' && module.exports) {
    // CommonJS-like environments that support module.exports, like Node.
    module.exports = factory(require('./ApiClient'), require('./model/AggregatedCorrelation'), require('./model/Animation'), require('./model/Button'), require('./model/Category'), require('./model/Chart'), require('./model/ChartConfig'), require('./model/ChartStyle'), require('./model/Color'), require('./model/Column'), require('./model/CommonResponse'), require('./model/Connector'), require('./model/ConnectorInstruction'), require('./model/ConversionStep'), require('./model/Correlation'), require('./model/Credit'), require('./model/DataSource'), require('./model/Explanation'), require('./model/ExplanationStartTracking'), require('./model/GetCorrelationsDataResponse'), require('./model/GetCorrelationsResponse'), require('./model/GetStudyDataResponse'), require('./model/GetStudyResponse'), require('./model/GetTrackingReminderNotificationsResponse'), require('./model/Hover'), require('./model/Image'), require('./model/InlineResponse201'), require('./model/JsonErrorResponse'), require('./model/Lang'), require('./model/Legend'), require('./model/Loading'), require('./model/Marker'), require('./model/Measurement'), require('./model/MeasurementDelete'), require('./model/MeasurementItem'), require('./model/MeasurementSet'), require('./model/MeasurementUpdate'), require('./model/Option'), require('./model/Pair'), require('./model/Pairs'), require('./model/PlotOption'), require('./model/PostCorrelation'), require('./model/ProcessedDailyMeasurement'), require('./model/Scatter'), require('./model/Series'), require('./model/State'), require('./model/Statistic'), require('./model/Study'), require('./model/Subtitle'), require('./model/Title'), require('./model/Tooltip'), require('./model/TrackingReminder'), require('./model/TrackingReminderDelete'), require('./model/TrackingReminderNotification'), require('./model/TrackingReminderNotificationActionArray'), require('./model/TrackingReminderNotificationPost'), require('./model/TrackingReminderNotificationTrackAllAction'), require('./model/TrackingReminderNotificationsArray'), require('./model/Unit'), require('./model/UnitCategory'), require('./model/User'), require('./model/UserCorrelation'), require('./model/UserTag'), require('./model/UserVariable'), require('./model/UserVariableDelete'), require('./model/Variable'), require('./model/VariableCategory'), require('./model/Vote'), require('./model/VoteDelete'), require('./model/XAxi'), require('./model/YAxi'), require('./api/AnalyticsApi'), require('./api/AuthenticationApi'), require('./api/ConnectorsApi'), require('./api/MeasurementsApi'), require('./api/RemindersApi'), require('./api/UnitsApi'), require('./api/UserApi'), require('./api/VariablesApi'));
  }
}(function(ApiClient, AggregatedCorrelation, Animation, Button, Category, Chart, ChartConfig, ChartStyle, Color, Column, CommonResponse, Connector, ConnectorInstruction, ConversionStep, Correlation, Credit, DataSource, Explanation, ExplanationStartTracking, GetCorrelationsDataResponse, GetCorrelationsResponse, GetStudyDataResponse, GetStudyResponse, GetTrackingReminderNotificationsResponse, Hover, Image, InlineResponse201, JsonErrorResponse, Lang, Legend, Loading, Marker, Measurement, MeasurementDelete, MeasurementItem, MeasurementSet, MeasurementUpdate, Option, Pair, Pairs, PlotOption, PostCorrelation, ProcessedDailyMeasurement, Scatter, Series, State, Statistic, Study, Subtitle, Title, Tooltip, TrackingReminder, TrackingReminderDelete, TrackingReminderNotification, TrackingReminderNotificationActionArray, TrackingReminderNotificationPost, TrackingReminderNotificationTrackAllAction, TrackingReminderNotificationsArray, Unit, UnitCategory, User, UserCorrelation, UserTag, UserVariable, UserVariableDelete, Variable, VariableCategory, Vote, VoteDelete, XAxi, YAxi, AnalyticsApi, AuthenticationApi, ConnectorsApi, MeasurementsApi, RemindersApi, UnitsApi, UserApi, VariablesApi) {
  'use strict';

  /**
   * QuantiModo makes it easy to retrieve normalized user data from a wide array of devices and applications. [Learn about QuantiModo](https://quantimo.do), check out our [docs](https://github.com/QuantiModo/docs) or contact us at [help.quantimo.do](https://help.quantimo.do)..<br>
   * The <code>index</code> module provides access to constructors for all the classes which comprise the public API.
   * <p>
   * An AMD (recommended!) or CommonJS application will generally do something equivalent to the following:
   * <pre>
   * var Quantimodo = require('index'); // See note below*.
   * var xxxSvc = new Quantimodo.XxxApi(); // Allocate the API class we're going to use.
   * var yyyModel = new Quantimodo.Yyy(); // Construct a model instance.
   * yyyModel.someProperty = 'someValue';
   * ...
   * var zzz = xxxSvc.doSomething(yyyModel); // Invoke the service.
   * ...
   * </pre>
   * <em>*NOTE: For a top-level AMD script, use require(['index'], function(){...})
   * and put the application logic within the callback function.</em>
   * </p>
   * <p>
   * A non-AMD browser application (discouraged) might do something like this:
   * <pre>
   * var xxxSvc = new Quantimodo.XxxApi(); // Allocate the API class we're going to use.
   * var yyy = new Quantimodo.Yyy(); // Construct a model instance.
   * yyyModel.someProperty = 'someValue';
   * ...
   * var zzz = xxxSvc.doSomething(yyyModel); // Invoke the service.
   * ...
   * </pre>
   * </p>
   * @module index
   * @version 5.8.807
   */
  var exports = {
    /**
     * The ApiClient constructor.
     * @property {module:ApiClient}
     */
    ApiClient: ApiClient,
    /**
     * The AggregatedCorrelation model constructor.
     * @property {module:model/AggregatedCorrelation}
     */
    AggregatedCorrelation: AggregatedCorrelation,
    /**
     * The Animation model constructor.
     * @property {module:model/Animation}
     */
    Animation: Animation,
    /**
     * The Button model constructor.
     * @property {module:model/Button}
     */
    Button: Button,
    /**
     * The Category model constructor.
     * @property {module:model/Category}
     */
    Category: Category,
    /**
     * The Chart model constructor.
     * @property {module:model/Chart}
     */
    Chart: Chart,
    /**
     * The ChartConfig model constructor.
     * @property {module:model/ChartConfig}
     */
    ChartConfig: ChartConfig,
    /**
     * The ChartStyle model constructor.
     * @property {module:model/ChartStyle}
     */
    ChartStyle: ChartStyle,
    /**
     * The Color model constructor.
     * @property {module:model/Color}
     */
    Color: Color,
    /**
     * The Column model constructor.
     * @property {module:model/Column}
     */
    Column: Column,
    /**
     * The CommonResponse model constructor.
     * @property {module:model/CommonResponse}
     */
    CommonResponse: CommonResponse,
    /**
     * The Connector model constructor.
     * @property {module:model/Connector}
     */
    Connector: Connector,
    /**
     * The ConnectorInstruction model constructor.
     * @property {module:model/ConnectorInstruction}
     */
    ConnectorInstruction: ConnectorInstruction,
    /**
     * The ConversionStep model constructor.
     * @property {module:model/ConversionStep}
     */
    ConversionStep: ConversionStep,
    /**
     * The Correlation model constructor.
     * @property {module:model/Correlation}
     */
    Correlation: Correlation,
    /**
     * The Credit model constructor.
     * @property {module:model/Credit}
     */
    Credit: Credit,
    /**
     * The DataSource model constructor.
     * @property {module:model/DataSource}
     */
    DataSource: DataSource,
    /**
     * The Explanation model constructor.
     * @property {module:model/Explanation}
     */
    Explanation: Explanation,
    /**
     * The ExplanationStartTracking model constructor.
     * @property {module:model/ExplanationStartTracking}
     */
    ExplanationStartTracking: ExplanationStartTracking,
    /**
     * The GetCorrelationsDataResponse model constructor.
     * @property {module:model/GetCorrelationsDataResponse}
     */
    GetCorrelationsDataResponse: GetCorrelationsDataResponse,
    /**
     * The GetCorrelationsResponse model constructor.
     * @property {module:model/GetCorrelationsResponse}
     */
    GetCorrelationsResponse: GetCorrelationsResponse,
    /**
     * The GetStudyDataResponse model constructor.
     * @property {module:model/GetStudyDataResponse}
     */
    GetStudyDataResponse: GetStudyDataResponse,
    /**
     * The GetStudyResponse model constructor.
     * @property {module:model/GetStudyResponse}
     */
    GetStudyResponse: GetStudyResponse,
    /**
     * The GetTrackingReminderNotificationsResponse model constructor.
     * @property {module:model/GetTrackingReminderNotificationsResponse}
     */
    GetTrackingReminderNotificationsResponse: GetTrackingReminderNotificationsResponse,
    /**
     * The Hover model constructor.
     * @property {module:model/Hover}
     */
    Hover: Hover,
    /**
     * The Image model constructor.
     * @property {module:model/Image}
     */
    Image: Image,
    /**
     * The InlineResponse201 model constructor.
     * @property {module:model/InlineResponse201}
     */
    InlineResponse201: InlineResponse201,
    /**
     * The JsonErrorResponse model constructor.
     * @property {module:model/JsonErrorResponse}
     */
    JsonErrorResponse: JsonErrorResponse,
    /**
     * The Lang model constructor.
     * @property {module:model/Lang}
     */
    Lang: Lang,
    /**
     * The Legend model constructor.
     * @property {module:model/Legend}
     */
    Legend: Legend,
    /**
     * The Loading model constructor.
     * @property {module:model/Loading}
     */
    Loading: Loading,
    /**
     * The Marker model constructor.
     * @property {module:model/Marker}
     */
    Marker: Marker,
    /**
     * The Measurement model constructor.
     * @property {module:model/Measurement}
     */
    Measurement: Measurement,
    /**
     * The MeasurementDelete model constructor.
     * @property {module:model/MeasurementDelete}
     */
    MeasurementDelete: MeasurementDelete,
    /**
     * The MeasurementItem model constructor.
     * @property {module:model/MeasurementItem}
     */
    MeasurementItem: MeasurementItem,
    /**
     * The MeasurementSet model constructor.
     * @property {module:model/MeasurementSet}
     */
    MeasurementSet: MeasurementSet,
    /**
     * The MeasurementUpdate model constructor.
     * @property {module:model/MeasurementUpdate}
     */
    MeasurementUpdate: MeasurementUpdate,
    /**
     * The Option model constructor.
     * @property {module:model/Option}
     */
    Option: Option,
    /**
     * The Pair model constructor.
     * @property {module:model/Pair}
     */
    Pair: Pair,
    /**
     * The Pairs model constructor.
     * @property {module:model/Pairs}
     */
    Pairs: Pairs,
    /**
     * The PlotOption model constructor.
     * @property {module:model/PlotOption}
     */
    PlotOption: PlotOption,
    /**
     * The PostCorrelation model constructor.
     * @property {module:model/PostCorrelation}
     */
    PostCorrelation: PostCorrelation,
    /**
     * The ProcessedDailyMeasurement model constructor.
     * @property {module:model/ProcessedDailyMeasurement}
     */
    ProcessedDailyMeasurement: ProcessedDailyMeasurement,
    /**
     * The Scatter model constructor.
     * @property {module:model/Scatter}
     */
    Scatter: Scatter,
    /**
     * The Series model constructor.
     * @property {module:model/Series}
     */
    Series: Series,
    /**
     * The State model constructor.
     * @property {module:model/State}
     */
    State: State,
    /**
     * The Statistic model constructor.
     * @property {module:model/Statistic}
     */
    Statistic: Statistic,
    /**
     * The Study model constructor.
     * @property {module:model/Study}
     */
    Study: Study,
    /**
     * The Subtitle model constructor.
     * @property {module:model/Subtitle}
     */
    Subtitle: Subtitle,
    /**
     * The Title model constructor.
     * @property {module:model/Title}
     */
    Title: Title,
    /**
     * The Tooltip model constructor.
     * @property {module:model/Tooltip}
     */
    Tooltip: Tooltip,
    /**
     * The TrackingReminder model constructor.
     * @property {module:model/TrackingReminder}
     */
    TrackingReminder: TrackingReminder,
    /**
     * The TrackingReminderDelete model constructor.
     * @property {module:model/TrackingReminderDelete}
     */
    TrackingReminderDelete: TrackingReminderDelete,
    /**
     * The TrackingReminderNotification model constructor.
     * @property {module:model/TrackingReminderNotification}
     */
    TrackingReminderNotification: TrackingReminderNotification,
    /**
     * The TrackingReminderNotificationActionArray model constructor.
     * @property {module:model/TrackingReminderNotificationActionArray}
     */
    TrackingReminderNotificationActionArray: TrackingReminderNotificationActionArray,
    /**
     * The TrackingReminderNotificationPost model constructor.
     * @property {module:model/TrackingReminderNotificationPost}
     */
    TrackingReminderNotificationPost: TrackingReminderNotificationPost,
    /**
     * The TrackingReminderNotificationTrackAllAction model constructor.
     * @property {module:model/TrackingReminderNotificationTrackAllAction}
     */
    TrackingReminderNotificationTrackAllAction: TrackingReminderNotificationTrackAllAction,
    /**
     * The TrackingReminderNotificationsArray model constructor.
     * @property {module:model/TrackingReminderNotificationsArray}
     */
    TrackingReminderNotificationsArray: TrackingReminderNotificationsArray,
    /**
     * The Unit model constructor.
     * @property {module:model/Unit}
     */
    Unit: Unit,
    /**
     * The UnitCategory model constructor.
     * @property {module:model/UnitCategory}
     */
    UnitCategory: UnitCategory,
    /**
     * The User model constructor.
     * @property {module:model/User}
     */
    User: User,
    /**
     * The UserCorrelation model constructor.
     * @property {module:model/UserCorrelation}
     */
    UserCorrelation: UserCorrelation,
    /**
     * The UserTag model constructor.
     * @property {module:model/UserTag}
     */
    UserTag: UserTag,
    /**
     * The UserVariable model constructor.
     * @property {module:model/UserVariable}
     */
    UserVariable: UserVariable,
    /**
     * The UserVariableDelete model constructor.
     * @property {module:model/UserVariableDelete}
     */
    UserVariableDelete: UserVariableDelete,
    /**
     * The Variable model constructor.
     * @property {module:model/Variable}
     */
    Variable: Variable,
    /**
     * The VariableCategory model constructor.
     * @property {module:model/VariableCategory}
     */
    VariableCategory: VariableCategory,
    /**
     * The Vote model constructor.
     * @property {module:model/Vote}
     */
    Vote: Vote,
    /**
     * The VoteDelete model constructor.
     * @property {module:model/VoteDelete}
     */
    VoteDelete: VoteDelete,
    /**
     * The XAxi model constructor.
     * @property {module:model/XAxi}
     */
    XAxi: XAxi,
    /**
     * The YAxi model constructor.
     * @property {module:model/YAxi}
     */
    YAxi: YAxi,
    /**
     * The AnalyticsApi service constructor.
     * @property {module:api/AnalyticsApi}
     */
    AnalyticsApi: AnalyticsApi,
    /**
     * The AuthenticationApi service constructor.
     * @property {module:api/AuthenticationApi}
     */
    AuthenticationApi: AuthenticationApi,
    /**
     * The ConnectorsApi service constructor.
     * @property {module:api/ConnectorsApi}
     */
    ConnectorsApi: ConnectorsApi,
    /**
     * The MeasurementsApi service constructor.
     * @property {module:api/MeasurementsApi}
     */
    MeasurementsApi: MeasurementsApi,
    /**
     * The RemindersApi service constructor.
     * @property {module:api/RemindersApi}
     */
    RemindersApi: RemindersApi,
    /**
     * The UnitsApi service constructor.
     * @property {module:api/UnitsApi}
     */
    UnitsApi: UnitsApi,
    /**
     * The UserApi service constructor.
     * @property {module:api/UserApi}
     */
    UserApi: UserApi,
    /**
     * The VariablesApi service constructor.
     * @property {module:api/VariablesApi}
     */
    VariablesApi: VariablesApi
  };

  return exports;
}));

},{"./ApiClient":16,"./api/AnalyticsApi":17,"./api/AuthenticationApi":18,"./api/ConnectorsApi":19,"./api/MeasurementsApi":20,"./api/RemindersApi":21,"./api/UnitsApi":22,"./api/UserApi":23,"./api/VariablesApi":24,"./model/AggregatedCorrelation":26,"./model/Animation":27,"./model/Button":28,"./model/Category":29,"./model/Chart":30,"./model/ChartConfig":31,"./model/ChartStyle":32,"./model/Color":33,"./model/Column":34,"./model/CommonResponse":35,"./model/Connector":36,"./model/ConnectorInstruction":37,"./model/ConversionStep":38,"./model/Correlation":39,"./model/Credit":40,"./model/DataSource":41,"./model/Explanation":42,"./model/ExplanationStartTracking":43,"./model/GetCorrelationsDataResponse":44,"./model/GetCorrelationsResponse":45,"./model/GetStudyDataResponse":46,"./model/GetStudyResponse":47,"./model/GetTrackingReminderNotificationsResponse":48,"./model/Hover":49,"./model/Image":50,"./model/InlineResponse201":51,"./model/JsonErrorResponse":52,"./model/Lang":53,"./model/Legend":54,"./model/Loading":55,"./model/Marker":56,"./model/Measurement":57,"./model/MeasurementDelete":58,"./model/MeasurementItem":59,"./model/MeasurementSet":60,"./model/MeasurementUpdate":61,"./model/Option":62,"./model/Pair":63,"./model/Pairs":64,"./model/PlotOption":65,"./model/PostCorrelation":66,"./model/ProcessedDailyMeasurement":67,"./model/Scatter":68,"./model/Series":69,"./model/State":70,"./model/Statistic":71,"./model/Study":72,"./model/Subtitle":73,"./model/Title":74,"./model/Tooltip":75,"./model/TrackingReminder":76,"./model/TrackingReminderDelete":77,"./model/TrackingReminderNotification":78,"./model/TrackingReminderNotificationActionArray":79,"./model/TrackingReminderNotificationPost":80,"./model/TrackingReminderNotificationTrackAllAction":81,"./model/TrackingReminderNotificationsArray":82,"./model/Unit":83,"./model/UnitCategory":84,"./model/User":85,"./model/UserCorrelation":86,"./model/UserTag":87,"./model/UserVariable":88,"./model/UserVariableDelete":89,"./model/Variable":90,"./model/VariableCategory":91,"./model/Vote":92,"./model/VoteDelete":93,"./model/XAxi":94,"./model/YAxi":95}],26:[function(require,module,exports){
/**
 * quantimodo
 * QuantiModo makes it easy to retrieve normalized user data from a wide array of devices and applications. [Learn about QuantiModo](https://quantimo.do), check out our [docs](https://github.com/QuantiModo/docs) or contact us at [help.quantimo.do](https://help.quantimo.do).
 *
 * OpenAPI spec version: 5.8.728
 *
 * NOTE: This class is auto generated by the swagger code generator program.
 * https://github.com/swagger-api/swagger-codegen.git
 *
 * Swagger Codegen version: 2.2.3
 *
 * Do not edit the class manually.
 *
 */

(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define(['ApiClient'], factory);
  } else if (typeof module === 'object' && module.exports) {
    // CommonJS-like environments that support module.exports, like Node.
    module.exports = factory(require('../ApiClient'));
  } else {
    // Browser globals (root is window)
    if (!root.Quantimodo) {
      root.Quantimodo = {};
    }
    root.Quantimodo.AggregatedCorrelation = factory(root.Quantimodo.ApiClient);
  }
}(this, function(ApiClient) {
  'use strict';




  /**
   * The AggregatedCorrelation model module.
   * @module model/AggregatedCorrelation
   * @version 5.8.807
   */

  /**
   * Constructs a new <code>AggregatedCorrelation</code>.
   * @alias module:model/AggregatedCorrelation
   * @class
   * @param cause {String} Variable name of the cause variable for which the user desires correlations.
   * @param correlationCoefficient {Number} Pearson correlation coefficient between cause and effect measurements
   * @param durationOfAction {Number} The amount of time over which a predictor/stimulus event can exert an observable influence on an outcome variable value. For instance, aspirin (stimulus/predictor) typically decreases headache severity for approximately four hours (duration of action) following the onset delay.
   * @param effect {String} Variable name of the effect variable for which the user desires correlations.
   * @param numberOfPairs {Number} Number of points that went into the correlation calculation
   * @param onsetDelay {Number} The amount of time in seconds that elapses after the predictor/stimulus event before the outcome as perceived by a self-tracker is known as the onset delay. For example, the onset delay between the time a person takes an aspirin (predictor/stimulus event) and the time a person perceives a change in their headache severity (outcome) is approximately 30 minutes.
   * @param timestamp {Number} Time at which correlation was calculated
   */
  var exports = function(cause, correlationCoefficient, durationOfAction, effect, numberOfPairs, onsetDelay, timestamp) {
    var _this = this;










    _this['cause'] = cause;









    _this['correlationCoefficient'] = correlationCoefficient;



    _this['durationOfAction'] = durationOfAction;
    _this['effect'] = effect;








    _this['numberOfPairs'] = numberOfPairs;
    _this['onsetDelay'] = onsetDelay;





















    _this['timestamp'] = timestamp;

































































  };

  /**
   * Constructs a <code>AggregatedCorrelation</code> from a plain JavaScript object, optionally creating a new instance.
   * Copies all relevant properties from <code>data</code> to <code>obj</code> if supplied or a new instance if not.
   * @param {Object} data The plain JavaScript object bearing properties of interest.
   * @param {module:model/AggregatedCorrelation} obj Optional instance to populate.
   * @return {module:model/AggregatedCorrelation} The populated <code>AggregatedCorrelation</code> instance.
   */
  exports.constructFromObject = function(data, obj) {
    if (data) {
      obj = obj || new exports();

      if (data.hasOwnProperty('averageDailyLowCause')) {
        obj['averageDailyLowCause'] = ApiClient.convertToType(data['averageDailyLowCause'], 'Number');
      }
      if (data.hasOwnProperty('averageDailyHighCause')) {
        obj['averageDailyHighCause'] = ApiClient.convertToType(data['averageDailyHighCause'], 'Number');
      }
      if (data.hasOwnProperty('averageEffect')) {
        obj['averageEffect'] = ApiClient.convertToType(data['averageEffect'], 'Number');
      }
      if (data.hasOwnProperty('averageEffectFollowingHighCause')) {
        obj['averageEffectFollowingHighCause'] = ApiClient.convertToType(data['averageEffectFollowingHighCause'], 'Number');
      }
      if (data.hasOwnProperty('averageEffectFollowingLowCause')) {
        obj['averageEffectFollowingLowCause'] = ApiClient.convertToType(data['averageEffectFollowingLowCause'], 'Number');
      }
      if (data.hasOwnProperty('averageEffectFollowingHighCauseExplanation')) {
        obj['averageEffectFollowingHighCauseExplanation'] = ApiClient.convertToType(data['averageEffectFollowingHighCauseExplanation'], 'String');
      }
      if (data.hasOwnProperty('averageEffectFollowingLowCauseExplanation')) {
        obj['averageEffectFollowingLowCauseExplanation'] = ApiClient.convertToType(data['averageEffectFollowingLowCauseExplanation'], 'String');
      }
      if (data.hasOwnProperty('averageVote')) {
        obj['averageVote'] = ApiClient.convertToType(data['averageVote'], 'Number');
      }
      if (data.hasOwnProperty('causalityFactor')) {
        obj['causalityFactor'] = ApiClient.convertToType(data['causalityFactor'], 'Number');
      }
      if (data.hasOwnProperty('cause')) {
        obj['cause'] = ApiClient.convertToType(data['cause'], 'String');
      }
      if (data.hasOwnProperty('causeVariableCategoryName')) {
        obj['causeVariableCategoryName'] = ApiClient.convertToType(data['causeVariableCategoryName'], 'String');
      }
      if (data.hasOwnProperty('causeChanges')) {
        obj['causeChanges'] = ApiClient.convertToType(data['causeChanges'], 'Number');
      }
      if (data.hasOwnProperty('causeVariableCombinationOperation')) {
        obj['causeVariableCombinationOperation'] = ApiClient.convertToType(data['causeVariableCombinationOperation'], 'String');
      }
      if (data.hasOwnProperty('causeVariableImageUrl')) {
        obj['causeVariableImageUrl'] = ApiClient.convertToType(data['causeVariableImageUrl'], 'String');
      }
      if (data.hasOwnProperty('causeVariableIonIcon')) {
        obj['causeVariableIonIcon'] = ApiClient.convertToType(data['causeVariableIonIcon'], 'String');
      }
      if (data.hasOwnProperty('causeUnit')) {
        obj['causeUnit'] = ApiClient.convertToType(data['causeUnit'], 'String');
      }
      if (data.hasOwnProperty('causeVariableDefaultUnitId')) {
        obj['causeVariableDefaultUnitId'] = ApiClient.convertToType(data['causeVariableDefaultUnitId'], 'Number');
      }
      if (data.hasOwnProperty('causeVariableId')) {
        obj['causeVariableId'] = ApiClient.convertToType(data['causeVariableId'], 'Number');
      }
      if (data.hasOwnProperty('causeVariableName')) {
        obj['causeVariableName'] = ApiClient.convertToType(data['causeVariableName'], 'String');
      }
      if (data.hasOwnProperty('correlationCoefficient')) {
        obj['correlationCoefficient'] = ApiClient.convertToType(data['correlationCoefficient'], 'Number');
      }
      if (data.hasOwnProperty('createdAt')) {
        obj['createdAt'] = ApiClient.convertToType(data['createdAt'], 'Date');
      }
      if (data.hasOwnProperty('dataAnalysis')) {
        obj['dataAnalysis'] = ApiClient.convertToType(data['dataAnalysis'], 'String');
      }
      if (data.hasOwnProperty('dataSources')) {
        obj['dataSources'] = ApiClient.convertToType(data['dataSources'], 'String');
      }
      if (data.hasOwnProperty('durationOfAction')) {
        obj['durationOfAction'] = ApiClient.convertToType(data['durationOfAction'], 'Number');
      }
      if (data.hasOwnProperty('effect')) {
        obj['effect'] = ApiClient.convertToType(data['effect'], 'String');
      }
      if (data.hasOwnProperty('effectVariableCategoryName')) {
        obj['effectVariableCategoryName'] = ApiClient.convertToType(data['effectVariableCategoryName'], 'String');
      }
      if (data.hasOwnProperty('effectVariableImageUrl')) {
        obj['effectVariableImageUrl'] = ApiClient.convertToType(data['effectVariableImageUrl'], 'String');
      }
      if (data.hasOwnProperty('effectVariableIonIcon')) {
        obj['effectVariableIonIcon'] = ApiClient.convertToType(data['effectVariableIonIcon'], 'String');
      }
      if (data.hasOwnProperty('effectSize')) {
        obj['effectSize'] = ApiClient.convertToType(data['effectSize'], 'String');
      }
      if (data.hasOwnProperty('effectVariableId')) {
        obj['effectVariableId'] = ApiClient.convertToType(data['effectVariableId'], 'String');
      }
      if (data.hasOwnProperty('effectVariableName')) {
        obj['effectVariableName'] = ApiClient.convertToType(data['effectVariableName'], 'String');
      }
      if (data.hasOwnProperty('gaugeImage')) {
        obj['gaugeImage'] = ApiClient.convertToType(data['gaugeImage'], 'String');
      }
      if (data.hasOwnProperty('imageUrl')) {
        obj['imageUrl'] = ApiClient.convertToType(data['imageUrl'], 'String');
      }
      if (data.hasOwnProperty('numberOfPairs')) {
        obj['numberOfPairs'] = ApiClient.convertToType(data['numberOfPairs'], 'Number');
      }
      if (data.hasOwnProperty('onsetDelay')) {
        obj['onsetDelay'] = ApiClient.convertToType(data['onsetDelay'], 'Number');
      }
      if (data.hasOwnProperty('optimalPearsonProduct')) {
        obj['optimalPearsonProduct'] = ApiClient.convertToType(data['optimalPearsonProduct'], 'Number');
      }
      if (data.hasOwnProperty('outcomeDataSources')) {
        obj['outcomeDataSources'] = ApiClient.convertToType(data['outcomeDataSources'], 'String');
      }
      if (data.hasOwnProperty('predictorExplanation')) {
        obj['predictorExplanation'] = ApiClient.convertToType(data['predictorExplanation'], 'String');
      }
      if (data.hasOwnProperty('principalInvestigator')) {
        obj['principalInvestigator'] = ApiClient.convertToType(data['principalInvestigator'], 'String');
      }
      if (data.hasOwnProperty('qmScore')) {
        obj['qmScore'] = ApiClient.convertToType(data['qmScore'], 'Number');
      }
      if (data.hasOwnProperty('reverseCorrelation')) {
        obj['reverseCorrelation'] = ApiClient.convertToType(data['reverseCorrelation'], 'Number');
      }
      if (data.hasOwnProperty('significanceExplanation')) {
        obj['significanceExplanation'] = ApiClient.convertToType(data['significanceExplanation'], 'String');
      }
      if (data.hasOwnProperty('statisticalSignificance')) {
        obj['statisticalSignificance'] = ApiClient.convertToType(data['statisticalSignificance'], 'String');
      }
      if (data.hasOwnProperty('strengthLevel')) {
        obj['strengthLevel'] = ApiClient.convertToType(data['strengthLevel'], 'String');
      }
      if (data.hasOwnProperty('studyAbstract')) {
        obj['studyAbstract'] = ApiClient.convertToType(data['studyAbstract'], 'String');
      }
      if (data.hasOwnProperty('studyBackground')) {
        obj['studyBackground'] = ApiClient.convertToType(data['studyBackground'], 'String');
      }
      if (data.hasOwnProperty('studyDesign')) {
        obj['studyDesign'] = ApiClient.convertToType(data['studyDesign'], 'String');
      }
      if (data.hasOwnProperty('studyLimitations')) {
        obj['studyLimitations'] = ApiClient.convertToType(data['studyLimitations'], 'String');
      }
      if (data.hasOwnProperty('studyLinkDynamic')) {
        obj['studyLinkDynamic'] = ApiClient.convertToType(data['studyLinkDynamic'], 'String');
      }
      if (data.hasOwnProperty('studyLinkFacebook')) {
        obj['studyLinkFacebook'] = ApiClient.convertToType(data['studyLinkFacebook'], 'String');
      }
      if (data.hasOwnProperty('studyLinkGoogle')) {
        obj['studyLinkGoogle'] = ApiClient.convertToType(data['studyLinkGoogle'], 'String');
      }
      if (data.hasOwnProperty('studyLinkTwitter')) {
        obj['studyLinkTwitter'] = ApiClient.convertToType(data['studyLinkTwitter'], 'String');
      }
      if (data.hasOwnProperty('studyLinkStatic')) {
        obj['studyLinkStatic'] = ApiClient.convertToType(data['studyLinkStatic'], 'String');
      }
      if (data.hasOwnProperty('studyObjective')) {
        obj['studyObjective'] = ApiClient.convertToType(data['studyObjective'], 'String');
      }
      if (data.hasOwnProperty('studyResults')) {
        obj['studyResults'] = ApiClient.convertToType(data['studyResults'], 'String');
      }
      if (data.hasOwnProperty('studyTitle')) {
        obj['studyTitle'] = ApiClient.convertToType(data['studyTitle'], 'String');
      }
      if (data.hasOwnProperty('timestamp')) {
        obj['timestamp'] = ApiClient.convertToType(data['timestamp'], 'Number');
      }
      if (data.hasOwnProperty('updatedAt')) {
        obj['updatedAt'] = ApiClient.convertToType(data['updatedAt'], 'Date');
      }
      if (data.hasOwnProperty('userVote')) {
        obj['userVote'] = ApiClient.convertToType(data['userVote'], 'Number');
      }
      if (data.hasOwnProperty('valuePredictingHighOutcome')) {
        obj['valuePredictingHighOutcome'] = ApiClient.convertToType(data['valuePredictingHighOutcome'], 'Number');
      }
      if (data.hasOwnProperty('valuePredictingHighOutcomeExplanation')) {
        obj['valuePredictingHighOutcomeExplanation'] = ApiClient.convertToType(data['valuePredictingHighOutcomeExplanation'], 'String');
      }
      if (data.hasOwnProperty('valuePredictingLowOutcome')) {
        obj['valuePredictingLowOutcome'] = ApiClient.convertToType(data['valuePredictingLowOutcome'], 'Number');
      }
      if (data.hasOwnProperty('valuePredictingLowOutcomeExplanation')) {
        obj['valuePredictingLowOutcomeExplanation'] = ApiClient.convertToType(data['valuePredictingLowOutcomeExplanation'], 'String');
      }
      if (data.hasOwnProperty('averageForwardPearsonCorrelationOverOnsetDelays')) {
        obj['averageForwardPearsonCorrelationOverOnsetDelays'] = ApiClient.convertToType(data['averageForwardPearsonCorrelationOverOnsetDelays'], 'Number');
      }
      if (data.hasOwnProperty('averageReversePearsonCorrelationOverOnsetDelays')) {
        obj['averageReversePearsonCorrelationOverOnsetDelays'] = ApiClient.convertToType(data['averageReversePearsonCorrelationOverOnsetDelays'], 'Number');
      }
      if (data.hasOwnProperty('confidenceInterval')) {
        obj['confidenceInterval'] = ApiClient.convertToType(data['confidenceInterval'], 'Number');
      }
      if (data.hasOwnProperty('criticalTValue')) {
        obj['criticalTValue'] = ApiClient.convertToType(data['criticalTValue'], 'Number');
      }
      if (data.hasOwnProperty('effectChanges')) {
        obj['effectChanges'] = ApiClient.convertToType(data['effectChanges'], 'Number');
      }
      if (data.hasOwnProperty('experimentEndTime')) {
        obj['experimentEndTime'] = ApiClient.convertToType(data['experimentEndTime'], 'Date');
      }
      if (data.hasOwnProperty('experimentStartTime')) {
        obj['experimentStartTime'] = ApiClient.convertToType(data['experimentStartTime'], 'Date');
      }
      if (data.hasOwnProperty('forwardSpearmanCorrelationCoefficient')) {
        obj['forwardSpearmanCorrelationCoefficient'] = ApiClient.convertToType(data['forwardSpearmanCorrelationCoefficient'], 'Number');
      }
      if (data.hasOwnProperty('onsetDelayWithStrongestPearsonCorrelation')) {
        obj['onsetDelayWithStrongestPearsonCorrelation'] = ApiClient.convertToType(data['onsetDelayWithStrongestPearsonCorrelation'], 'Number');
      }
      if (data.hasOwnProperty('pearsonCorrelationWithNoOnsetDelay')) {
        obj['pearsonCorrelationWithNoOnsetDelay'] = ApiClient.convertToType(data['pearsonCorrelationWithNoOnsetDelay'], 'Number');
      }
      if (data.hasOwnProperty('predictivePearsonCorrelation')) {
        obj['predictivePearsonCorrelation'] = ApiClient.convertToType(data['predictivePearsonCorrelation'], 'Number');
      }
      if (data.hasOwnProperty('predictsHighEffectChange')) {
        obj['predictsHighEffectChange'] = ApiClient.convertToType(data['predictsHighEffectChange'], 'Number');
      }
      if (data.hasOwnProperty('predictsLowEffectChange')) {
        obj['predictsLowEffectChange'] = ApiClient.convertToType(data['predictsLowEffectChange'], 'Number');
      }
      if (data.hasOwnProperty('strongestPearsonCorrelationCoefficient')) {
        obj['strongestPearsonCorrelationCoefficient'] = ApiClient.convertToType(data['strongestPearsonCorrelationCoefficient'], 'Number');
      }
      if (data.hasOwnProperty('tValue')) {
        obj['tValue'] = ApiClient.convertToType(data['tValue'], 'Number');
      }
      if (data.hasOwnProperty('userId')) {
        obj['userId'] = ApiClient.convertToType(data['userId'], 'Number');
      }
      if (data.hasOwnProperty('causeVariableMostCommonConnectorId')) {
        obj['causeVariableMostCommonConnectorId'] = ApiClient.convertToType(data['causeVariableMostCommonConnectorId'], 'Number');
      }
      if (data.hasOwnProperty('causeVariableCategoryId')) {
        obj['causeVariableCategoryId'] = ApiClient.convertToType(data['causeVariableCategoryId'], 'Number');
      }
      if (data.hasOwnProperty('effectVariableCombinationOperation')) {
        obj['effectVariableCombinationOperation'] = ApiClient.convertToType(data['effectVariableCombinationOperation'], 'String');
      }
      if (data.hasOwnProperty('effectVariableCommonAlias')) {
        obj['effectVariableCommonAlias'] = ApiClient.convertToType(data['effectVariableCommonAlias'], 'String');
      }
      if (data.hasOwnProperty('effectVariableDefaultUnitId')) {
        obj['effectVariableDefaultUnitId'] = ApiClient.convertToType(data['effectVariableDefaultUnitId'], 'Number');
      }
      if (data.hasOwnProperty('effectVariableMostCommonConnectorId')) {
        obj['effectVariableMostCommonConnectorId'] = ApiClient.convertToType(data['effectVariableMostCommonConnectorId'], 'Number');
      }
      if (data.hasOwnProperty('effectVariableCategoryId')) {
        obj['effectVariableCategoryId'] = ApiClient.convertToType(data['effectVariableCategoryId'], 'Number');
      }
      if (data.hasOwnProperty('causeUserVariableShareUserMeasurements')) {
        obj['causeUserVariableShareUserMeasurements'] = ApiClient.convertToType(data['causeUserVariableShareUserMeasurements'], 'Number');
      }
      if (data.hasOwnProperty('effectUserVariableShareUserMeasurements')) {
        obj['effectUserVariableShareUserMeasurements'] = ApiClient.convertToType(data['effectUserVariableShareUserMeasurements'], 'Number');
      }
      if (data.hasOwnProperty('predictorFillingValue')) {
        obj['predictorFillingValue'] = ApiClient.convertToType(data['predictorFillingValue'], 'Number');
      }
      if (data.hasOwnProperty('outcomeFillingValue')) {
        obj['outcomeFillingValue'] = ApiClient.convertToType(data['outcomeFillingValue'], 'Number');
      }
      if (data.hasOwnProperty('createdTime')) {
        obj['createdTime'] = ApiClient.convertToType(data['createdTime'], 'Date');
      }
      if (data.hasOwnProperty('updatedTime')) {
        obj['updatedTime'] = ApiClient.convertToType(data['updatedTime'], 'Date');
      }
      if (data.hasOwnProperty('durationOfActionInHours')) {
        obj['durationOfActionInHours'] = ApiClient.convertToType(data['durationOfActionInHours'], 'Number');
      }
      if (data.hasOwnProperty('onsetDelayWithStrongestPearsonCorrelationInHours')) {
        obj['onsetDelayWithStrongestPearsonCorrelationInHours'] = ApiClient.convertToType(data['onsetDelayWithStrongestPearsonCorrelationInHours'], 'Number');
      }
      if (data.hasOwnProperty('direction')) {
        obj['direction'] = ApiClient.convertToType(data['direction'], 'String');
      }
      if (data.hasOwnProperty('causeVariableDefaultUnitAbbreviatedName')) {
        obj['causeVariableDefaultUnitAbbreviatedName'] = ApiClient.convertToType(data['causeVariableDefaultUnitAbbreviatedName'], 'String');
      }
      if (data.hasOwnProperty('effectVariableDefaultUnitAbbreviatedName')) {
        obj['effectVariableDefaultUnitAbbreviatedName'] = ApiClient.convertToType(data['effectVariableDefaultUnitAbbreviatedName'], 'String');
      }
      if (data.hasOwnProperty('causeVariableDefaultUnitName')) {
        obj['causeVariableDefaultUnitName'] = ApiClient.convertToType(data['causeVariableDefaultUnitName'], 'String');
      }
      if (data.hasOwnProperty('effectVariableDefaultUnitName')) {
        obj['effectVariableDefaultUnitName'] = ApiClient.convertToType(data['effectVariableDefaultUnitName'], 'String');
      }
      if (data.hasOwnProperty('shareUserMeasurements')) {
        obj['shareUserMeasurements'] = ApiClient.convertToType(data['shareUserMeasurements'], 'Boolean');
      }
      if (data.hasOwnProperty('effectUnit')) {
        obj['effectUnit'] = ApiClient.convertToType(data['effectUnit'], 'String');
      }
      if (data.hasOwnProperty('significantDifference')) {
        obj['significantDifference'] = ApiClient.convertToType(data['significantDifference'], 'Boolean');
      }
      if (data.hasOwnProperty('predictsHighEffectChangeSentenceFragment')) {
        obj['predictsHighEffectChangeSentenceFragment'] = ApiClient.convertToType(data['predictsHighEffectChangeSentenceFragment'], 'String');
      }
      if (data.hasOwnProperty('predictsLowEffectChangeSentenceFragment')) {
        obj['predictsLowEffectChangeSentenceFragment'] = ApiClient.convertToType(data['predictsLowEffectChangeSentenceFragment'], 'String');
      }
      if (data.hasOwnProperty('confidenceLevel')) {
        obj['confidenceLevel'] = ApiClient.convertToType(data['confidenceLevel'], 'String');
      }
      if (data.hasOwnProperty('predictivePearsonCorrelationCoefficient')) {
        obj['predictivePearsonCorrelationCoefficient'] = ApiClient.convertToType(data['predictivePearsonCorrelationCoefficient'], 'Number');
      }
      if (data.hasOwnProperty('studyLinkEmail')) {
        obj['studyLinkEmail'] = ApiClient.convertToType(data['studyLinkEmail'], 'String');
      }
      if (data.hasOwnProperty('gaugeImageSquare')) {
        obj['gaugeImageSquare'] = ApiClient.convertToType(data['gaugeImageSquare'], 'String');
      }
      if (data.hasOwnProperty('dataSourcesParagraphForCause')) {
        obj['dataSourcesParagraphForCause'] = ApiClient.convertToType(data['dataSourcesParagraphForCause'], 'String');
      }
      if (data.hasOwnProperty('instructionsForCause')) {
        obj['instructionsForCause'] = ApiClient.convertToType(data['instructionsForCause'], 'String');
      }
      if (data.hasOwnProperty('dataSourcesParagraphForEffect')) {
        obj['dataSourcesParagraphForEffect'] = ApiClient.convertToType(data['dataSourcesParagraphForEffect'], 'String');
      }
      if (data.hasOwnProperty('instructionsForEffect')) {
        obj['instructionsForEffect'] = ApiClient.convertToType(data['instructionsForEffect'], 'String');
      }
      if (data.hasOwnProperty('pValue')) {
        obj['pValue'] = ApiClient.convertToType(data['pValue'], 'Number');
      }
      if (data.hasOwnProperty('reversePearsonCorrelationCoefficient')) {
        obj['reversePearsonCorrelationCoefficient'] = ApiClient.convertToType(data['reversePearsonCorrelationCoefficient'], 'Number');
      }
      if (data.hasOwnProperty('predictorMinimumAllowedValue')) {
        obj['predictorMinimumAllowedValue'] = ApiClient.convertToType(data['predictorMinimumAllowedValue'], 'Number');
      }
      if (data.hasOwnProperty('predictorMaximumAllowedValue')) {
        obj['predictorMaximumAllowedValue'] = ApiClient.convertToType(data['predictorMaximumAllowedValue'], 'Number');
      }
      if (data.hasOwnProperty('predictorDataSources')) {
        obj['predictorDataSources'] = ApiClient.convertToType(data['predictorDataSources'], 'String');
      }
      if (data.hasOwnProperty('aggregateQMScore')) {
        obj['aggregateQMScore'] = ApiClient.convertToType(data['aggregateQMScore'], 'Number');
      }
      if (data.hasOwnProperty('numberOfCorrelations')) {
        obj['numberOfCorrelations'] = ApiClient.convertToType(data['numberOfCorrelations'], 'Number');
      }
      if (data.hasOwnProperty('numberOfUsers')) {
        obj['numberOfUsers'] = ApiClient.convertToType(data['numberOfUsers'], 'Number');
      }
      if (data.hasOwnProperty('forwardPearsonCorrelationCoefficient')) {
        obj['forwardPearsonCorrelationCoefficient'] = ApiClient.convertToType(data['forwardPearsonCorrelationCoefficient'], 'Number');
      }
      if (data.hasOwnProperty('correlationIsContradictoryToOptimalValues')) {
        obj['correlationIsContradictoryToOptimalValues'] = ApiClient.convertToType(data['correlationIsContradictoryToOptimalValues'], 'Boolean');
      }
    }
    return obj;
  }

  /**
   * 
   * @member {Number} averageDailyLowCause
   */
  exports.prototype['averageDailyLowCause'] = undefined;
  /**
   * 
   * @member {Number} averageDailyHighCause
   */
  exports.prototype['averageDailyHighCause'] = undefined;
  /**
   * 
   * @member {Number} averageEffect
   */
  exports.prototype['averageEffect'] = undefined;
  /**
   * 
   * @member {Number} averageEffectFollowingHighCause
   */
  exports.prototype['averageEffectFollowingHighCause'] = undefined;
  /**
   * 
   * @member {Number} averageEffectFollowingLowCause
   */
  exports.prototype['averageEffectFollowingLowCause'] = undefined;
  /**
   * 
   * @member {String} averageEffectFollowingHighCauseExplanation
   */
  exports.prototype['averageEffectFollowingHighCauseExplanation'] = undefined;
  /**
   * 
   * @member {String} averageEffectFollowingLowCauseExplanation
   */
  exports.prototype['averageEffectFollowingLowCauseExplanation'] = undefined;
  /**
   * Average Vote
   * @member {Number} averageVote
   */
  exports.prototype['averageVote'] = undefined;
  /**
   * 
   * @member {Number} causalityFactor
   */
  exports.prototype['causalityFactor'] = undefined;
  /**
   * Variable name of the cause variable for which the user desires correlations.
   * @member {String} cause
   */
  exports.prototype['cause'] = undefined;
  /**
   * Variable category of the cause variable.
   * @member {String} causeVariableCategoryName
   */
  exports.prototype['causeVariableCategoryName'] = undefined;
  /**
   * Number of changes in the predictor variable (a.k.a the number of experiments)
   * @member {Number} causeChanges
   */
  exports.prototype['causeChanges'] = undefined;
  /**
   * The way cause measurements are aggregated
   * @member {String} causeVariableCombinationOperation
   */
  exports.prototype['causeVariableCombinationOperation'] = undefined;
  /**
   * 
   * @member {String} causeVariableImageUrl
   */
  exports.prototype['causeVariableImageUrl'] = undefined;
  /**
   * For use in Ionic apps
   * @member {String} causeVariableIonIcon
   */
  exports.prototype['causeVariableIonIcon'] = undefined;
  /**
   * Unit of the predictor variable
   * @member {String} causeUnit
   */
  exports.prototype['causeUnit'] = undefined;
  /**
   * Unit Id of the predictor variable
   * @member {Number} causeVariableDefaultUnitId
   */
  exports.prototype['causeVariableDefaultUnitId'] = undefined;
  /**
   * 
   * @member {Number} causeVariableId
   */
  exports.prototype['causeVariableId'] = undefined;
  /**
   * Variable name of the cause variable for which the user desires correlations.
   * @member {String} causeVariableName
   */
  exports.prototype['causeVariableName'] = undefined;
  /**
   * Pearson correlation coefficient between cause and effect measurements
   * @member {Number} correlationCoefficient
   */
  exports.prototype['correlationCoefficient'] = undefined;
  /**
   * When the record was first created. Use UTC ISO 8601 `YYYY-MM-DDThh:mm:ss`  datetime format
   * @member {Date} createdAt
   */
  exports.prototype['createdAt'] = undefined;
  /**
   * How the data was analyzed
   * @member {String} dataAnalysis
   */
  exports.prototype['dataAnalysis'] = undefined;
  /**
   * How the data was obtained
   * @member {String} dataSources
   */
  exports.prototype['dataSources'] = undefined;
  /**
   * The amount of time over which a predictor/stimulus event can exert an observable influence on an outcome variable value. For instance, aspirin (stimulus/predictor) typically decreases headache severity for approximately four hours (duration of action) following the onset delay.
   * @member {Number} durationOfAction
   */
  exports.prototype['durationOfAction'] = undefined;
  /**
   * Variable name of the effect variable for which the user desires correlations.
   * @member {String} effect
   */
  exports.prototype['effect'] = undefined;
  /**
   * Variable category of the effect variable.
   * @member {String} effectVariableCategoryName
   */
  exports.prototype['effectVariableCategoryName'] = undefined;
  /**
   * 
   * @member {String} effectVariableImageUrl
   */
  exports.prototype['effectVariableImageUrl'] = undefined;
  /**
   * For use in Ionic apps
   * @member {String} effectVariableIonIcon
   */
  exports.prototype['effectVariableIonIcon'] = undefined;
  /**
   * Magnitude of the effects of a cause indicating whether it's practically meaningful.
   * @member {String} effectSize
   */
  exports.prototype['effectSize'] = undefined;
  /**
   * Magnitude of the effects of a cause indicating whether it's practically meaningful.
   * @member {String} effectVariableId
   */
  exports.prototype['effectVariableId'] = undefined;
  /**
   * Variable name of the effect variable for which the user desires correlations.
   * @member {String} effectVariableName
   */
  exports.prototype['effectVariableName'] = undefined;
  /**
   * Illustrates the strength of the relationship
   * @member {String} gaugeImage
   */
  exports.prototype['gaugeImage'] = undefined;
  /**
   * Large image for Facebook
   * @member {String} imageUrl
   */
  exports.prototype['imageUrl'] = undefined;
  /**
   * Number of points that went into the correlation calculation
   * @member {Number} numberOfPairs
   */
  exports.prototype['numberOfPairs'] = undefined;
  /**
   * The amount of time in seconds that elapses after the predictor/stimulus event before the outcome as perceived by a self-tracker is known as the onset delay. For example, the onset delay between the time a person takes an aspirin (predictor/stimulus event) and the time a person perceives a change in their headache severity (outcome) is approximately 30 minutes.
   * @member {Number} onsetDelay
   */
  exports.prototype['onsetDelay'] = undefined;
  /**
   * Optimal Pearson Product
   * @member {Number} optimalPearsonProduct
   */
  exports.prototype['optimalPearsonProduct'] = undefined;
  /**
   * original name of the cause.
   * @member {String} outcomeDataSources
   */
  exports.prototype['outcomeDataSources'] = undefined;
  /**
   * HIGHER Remeron predicts HIGHER Overall Mood
   * @member {String} predictorExplanation
   */
  exports.prototype['predictorExplanation'] = undefined;
  /**
   * Mike Sinn
   * @member {String} principalInvestigator
   */
  exports.prototype['principalInvestigator'] = undefined;
  /**
   * Value representing the significance of the relationship as a function of crowdsourced insights, predictive strength, data quantity, and data quality
   * @member {Number} qmScore
   */
  exports.prototype['qmScore'] = undefined;
  /**
   * Correlation when cause and effect are reversed. For any causal relationship, the forward correlation should exceed the reverse correlation.
   * @member {Number} reverseCorrelation
   */
  exports.prototype['reverseCorrelation'] = undefined;
  /**
   * Using a two-tailed t-test with alpha = 0.05, it was determined that the change...
   * @member {String} significanceExplanation
   */
  exports.prototype['significanceExplanation'] = undefined;
  /**
   * A function of the effect size and sample size
   * @member {String} statisticalSignificance
   */
  exports.prototype['statisticalSignificance'] = undefined;
  /**
   * weak, moderate, strong
   * @member {String} strengthLevel
   */
  exports.prototype['strengthLevel'] = undefined;
  /**
   * These data suggest with a high degree of confidence...
   * @member {String} studyAbstract
   */
  exports.prototype['studyAbstract'] = undefined;
  /**
   * In order to reduce suffering through the advancement of human knowledge...
   * @member {String} studyBackground
   */
  exports.prototype['studyBackground'] = undefined;
  /**
   * This study is based on data donated by one QuantiModo user...
   * @member {String} studyDesign
   */
  exports.prototype['studyDesign'] = undefined;
  /**
   * As with any human experiment, it was impossible to control for all potentially confounding variables...
   * @member {String} studyLimitations
   */
  exports.prototype['studyLimitations'] = undefined;
  /**
   * Url for the interactive study within the web app
   * @member {String} studyLinkDynamic
   */
  exports.prototype['studyLinkDynamic'] = undefined;
  /**
   * Url for sharing the study on Facebook
   * @member {String} studyLinkFacebook
   */
  exports.prototype['studyLinkFacebook'] = undefined;
  /**
   * Url for sharing the study on Google+
   * @member {String} studyLinkGoogle
   */
  exports.prototype['studyLinkGoogle'] = undefined;
  /**
   * Url for sharing the study on Twitter
   * @member {String} studyLinkTwitter
   */
  exports.prototype['studyLinkTwitter'] = undefined;
  /**
   * Url for sharing the statically rendered study on social media
   * @member {String} studyLinkStatic
   */
  exports.prototype['studyLinkStatic'] = undefined;
  /**
   * The objective of this study is to determine...
   * @member {String} studyObjective
   */
  exports.prototype['studyObjective'] = undefined;
  /**
   * This analysis suggests that...
   * @member {String} studyResults
   */
  exports.prototype['studyResults'] = undefined;
  /**
   * N1 Study HIGHER Remeron predicts HIGHER Overall Mood
   * @member {String} studyTitle
   */
  exports.prototype['studyTitle'] = undefined;
  /**
   * Time at which correlation was calculated
   * @member {Number} timestamp
   */
  exports.prototype['timestamp'] = undefined;
  /**
   * When the record in the database was last updated. Use UTC ISO 8601 `YYYY-MM-DDThh:mm:ss`  datetime format. Time zone should be UTC and not local.
   * @member {Date} updatedAt
   */
  exports.prototype['updatedAt'] = undefined;
  /**
   * User Vote
   * @member {Number} userVote
   */
  exports.prototype['userVote'] = undefined;
  /**
   * cause value that predicts an above average effect value (in default unit for cause variable)
   * @member {Number} valuePredictingHighOutcome
   */
  exports.prototype['valuePredictingHighOutcome'] = undefined;
  /**
   * Overall Mood, on average, 34% HIGHER after around 3.98mg Remeron
   * @member {String} valuePredictingHighOutcomeExplanation
   */
  exports.prototype['valuePredictingHighOutcomeExplanation'] = undefined;
  /**
   * cause value that predicts a below average effect value (in default unit for cause variable)
   * @member {Number} valuePredictingLowOutcome
   */
  exports.prototype['valuePredictingLowOutcome'] = undefined;
  /**
   * Overall Mood, on average, 4% LOWER after around 0mg Remeron
   * @member {String} valuePredictingLowOutcomeExplanation
   */
  exports.prototype['valuePredictingLowOutcomeExplanation'] = undefined;
  /**
   * Example: 0.396
   * @member {Number} averageForwardPearsonCorrelationOverOnsetDelays
   */
  exports.prototype['averageForwardPearsonCorrelationOverOnsetDelays'] = undefined;
  /**
   * Example: 0.453667
   * @member {Number} averageReversePearsonCorrelationOverOnsetDelays
   */
  exports.prototype['averageReversePearsonCorrelationOverOnsetDelays'] = undefined;
  /**
   * Example: 0.14344467795996
   * @member {Number} confidenceInterval
   */
  exports.prototype['confidenceInterval'] = undefined;
  /**
   * Example: 1.646
   * @member {Number} criticalTValue
   */
  exports.prototype['criticalTValue'] = undefined;
  /**
   * Example: 193
   * @member {Number} effectChanges
   */
  exports.prototype['effectChanges'] = undefined;
  /**
   * Example: 2014-07-30 12:50:00
   * @member {Date} experimentEndTime
   */
  exports.prototype['experimentEndTime'] = undefined;
  /**
   * Example: 2012-05-06 21:15:00
   * @member {Date} experimentStartTime
   */
  exports.prototype['experimentStartTime'] = undefined;
  /**
   * Example: 0.528359
   * @member {Number} forwardSpearmanCorrelationCoefficient
   */
  exports.prototype['forwardSpearmanCorrelationCoefficient'] = undefined;
  /**
   * Example: -86400
   * @member {Number} onsetDelayWithStrongestPearsonCorrelation
   */
  exports.prototype['onsetDelayWithStrongestPearsonCorrelation'] = undefined;
  /**
   * Example: 0.477
   * @member {Number} pearsonCorrelationWithNoOnsetDelay
   */
  exports.prototype['pearsonCorrelationWithNoOnsetDelay'] = undefined;
  /**
   * Example: 0.538
   * @member {Number} predictivePearsonCorrelation
   */
  exports.prototype['predictivePearsonCorrelation'] = undefined;
  /**
   * Example: 17
   * @member {Number} predictsHighEffectChange
   */
  exports.prototype['predictsHighEffectChange'] = undefined;
  /**
   * Example: -11
   * @member {Number} predictsLowEffectChange
   */
  exports.prototype['predictsLowEffectChange'] = undefined;
  /**
   * Example: 0.613
   * @member {Number} strongestPearsonCorrelationCoefficient
   */
  exports.prototype['strongestPearsonCorrelationCoefficient'] = undefined;
  /**
   * Example: 9.6986079652717
   * @member {Number} tValue
   */
  exports.prototype['tValue'] = undefined;
  /**
   * Example: 230
   * @member {Number} userId
   */
  exports.prototype['userId'] = undefined;
  /**
   * Example: 6
   * @member {Number} causeVariableMostCommonConnectorId
   */
  exports.prototype['causeVariableMostCommonConnectorId'] = undefined;
  /**
   * Example: 6
   * @member {Number} causeVariableCategoryId
   */
  exports.prototype['causeVariableCategoryId'] = undefined;
  /**
   * Example: MEAN
   * @member {String} effectVariableCombinationOperation
   */
  exports.prototype['effectVariableCombinationOperation'] = undefined;
  /**
   * Example: Mood_(psychology)
   * @member {String} effectVariableCommonAlias
   */
  exports.prototype['effectVariableCommonAlias'] = undefined;
  /**
   * Example: 10
   * @member {Number} effectVariableDefaultUnitId
   */
  exports.prototype['effectVariableDefaultUnitId'] = undefined;
  /**
   * Example: 10
   * @member {Number} effectVariableMostCommonConnectorId
   */
  exports.prototype['effectVariableMostCommonConnectorId'] = undefined;
  /**
   * Example: 1
   * @member {Number} effectVariableCategoryId
   */
  exports.prototype['effectVariableCategoryId'] = undefined;
  /**
   * Example: 1
   * @member {Number} causeUserVariableShareUserMeasurements
   */
  exports.prototype['causeUserVariableShareUserMeasurements'] = undefined;
  /**
   * Example: 1
   * @member {Number} effectUserVariableShareUserMeasurements
   */
  exports.prototype['effectUserVariableShareUserMeasurements'] = undefined;
  /**
   * Example: -1
   * @member {Number} predictorFillingValue
   */
  exports.prototype['predictorFillingValue'] = undefined;
  /**
   * Example: -1
   * @member {Number} outcomeFillingValue
   */
  exports.prototype['outcomeFillingValue'] = undefined;
  /**
   * Example: 2016-12-28 20:47:30
   * @member {Date} createdTime
   */
  exports.prototype['createdTime'] = undefined;
  /**
   * Example: 2017-05-06 15:40:38
   * @member {Date} updatedTime
   */
  exports.prototype['updatedTime'] = undefined;
  /**
   * Example: 168
   * @member {Number} durationOfActionInHours
   */
  exports.prototype['durationOfActionInHours'] = undefined;
  /**
   * Example: -24
   * @member {Number} onsetDelayWithStrongestPearsonCorrelationInHours
   */
  exports.prototype['onsetDelayWithStrongestPearsonCorrelationInHours'] = undefined;
  /**
   * Example: higher
   * @member {String} direction
   */
  exports.prototype['direction'] = undefined;
  /**
   * Example: /5
   * @member {String} causeVariableDefaultUnitAbbreviatedName
   */
  exports.prototype['causeVariableDefaultUnitAbbreviatedName'] = undefined;
  /**
   * Example: /5
   * @member {String} effectVariableDefaultUnitAbbreviatedName
   */
  exports.prototype['effectVariableDefaultUnitAbbreviatedName'] = undefined;
  /**
   * Example: 1 to 5 Rating
   * @member {String} causeVariableDefaultUnitName
   */
  exports.prototype['causeVariableDefaultUnitName'] = undefined;
  /**
   * Example: 1 to 5 Rating
   * @member {String} effectVariableDefaultUnitName
   */
  exports.prototype['effectVariableDefaultUnitName'] = undefined;
  /**
   * Example: 1
   * @member {Boolean} shareUserMeasurements
   */
  exports.prototype['shareUserMeasurements'] = undefined;
  /**
   * Example: /5
   * @member {String} effectUnit
   */
  exports.prototype['effectUnit'] = undefined;
  /**
   * Example: 1
   * @member {Boolean} significantDifference
   */
  exports.prototype['significantDifference'] = undefined;
  /**
   * Example: , on average, 17% 
   * @member {String} predictsHighEffectChangeSentenceFragment
   */
  exports.prototype['predictsHighEffectChangeSentenceFragment'] = undefined;
  /**
   * Example: , on average, 11% 
   * @member {String} predictsLowEffectChangeSentenceFragment
   */
  exports.prototype['predictsLowEffectChangeSentenceFragment'] = undefined;
  /**
   * Example: high
   * @member {String} confidenceLevel
   */
  exports.prototype['confidenceLevel'] = undefined;
  /**
   * Example: 0.538
   * @member {Number} predictivePearsonCorrelationCoefficient
   */
  exports.prototype['predictivePearsonCorrelationCoefficient'] = undefined;
  /**
   * Example: mailto:?subject=N1%20Study%3A%20Sleep%20Quality%20Predicts%20Higher%20Overall%20Mood&body=Check%20out%20my%20study%20at%20https%3A%2F%2Flocal.quantimo.do%2Fapi%2Fv2%2Fstudy%3FcauseVariableName%3DSleep%2520Quality%26effectVariableName%3DOverall%2520Mood%26userId%3D230%0A%0AHave%20a%20great%20day!
   * @member {String} studyLinkEmail
   */
  exports.prototype['studyLinkEmail'] = undefined;
  /**
   * Example: https://s3.amazonaws.com/quantimodo-docs/images/gauge-moderately-positive-relationship-200-200.png
   * @member {String} gaugeImageSquare
   */
  exports.prototype['gaugeImageSquare'] = undefined;
  /**
   * Example: Sleep Quality data was primarily collected using <a href=\"http://www.amazon.com/gp/product/B00A17IAO0/ref=as_li_qf_sp_asin_tl?ie=UTF8&camp=1789&creative=9325&creativeASIN=B00A17IAO0&linkCode=as2&tag=quant08-20\">Up by Jawbone</a>.  UP by Jawbone is a wristband and app that tracks how you sleep, move and eat and then helps you use that information to feel your best.
   * @member {String} dataSourcesParagraphForCause
   */
  exports.prototype['dataSourcesParagraphForCause'] = undefined;
  /**
   * Example: <a href=\"http://www.amazon.com/gp/product/B00A17IAO0/ref=as_li_qf_sp_asin_tl?ie=UTF8&camp=1789&creative=9325&creativeASIN=B00A17IAO0&linkCode=as2&tag=quant08-20\">Obtain Up by Jawbone</a> and use it to record your Sleep Quality. Once you have a <a href=\"http://www.amazon.com/gp/product/B00A17IAO0/ref=as_li_qf_sp_asin_tl?ie=UTF8&camp=1789&creative=9325&creativeASIN=B00A17IAO0&linkCode=as2&tag=quant08-20\">Up by Jawbone</a> account, <a href=\"https://app.quantimo.do/ionic/Modo/www/#/app/import\">connect your  Up by Jawbone account at QuantiModo</a> to automatically import and analyze your data.
   * @member {String} instructionsForCause
   */
  exports.prototype['instructionsForCause'] = undefined;
  /**
   * Example: Overall Mood data was primarily collected using <a href=\"https://quantimo.do\">QuantiModo</a>.  <a href=\"https://quantimo.do\">QuantiModo</a> is a Chrome extension, Android app, iOS app, and web app that allows you to easily track mood, symptoms, or any outcome you want to optimize in a fraction of a second.  You can also import your data from over 30 other apps and devices like Fitbit, Rescuetime, Jawbone Up, Withings, Facebook, Github, Google Calendar, Runkeeper, MoodPanda, Slice, Google Fit, and more.  <a href=\"https://quantimo.do\">QuantiModo</a> then analyzes your data to identify which hidden factors are most likely to be influencing your mood or symptoms and their optimal daily values.
   * @member {String} dataSourcesParagraphForEffect
   */
  exports.prototype['dataSourcesParagraphForEffect'] = undefined;
  /**
   * Example: <a href=\"https://quantimo.do\">Obtain QuantiModo</a> and use it to record your Overall Mood. Once you have a <a href=\"https://quantimo.do\">QuantiModo</a> account, <a href=\"https://app.quantimo.do/ionic/Modo/www/#/app/import\">connect your  QuantiModo account at QuantiModo</a> to automatically import and analyze your data.
   * @member {String} instructionsForEffect
   */
  exports.prototype['instructionsForEffect'] = undefined;
  /**
   * Example: 3.5306635529222E-5
   * @member {Number} pValue
   */
  exports.prototype['pValue'] = undefined;
  /**
   * Example: 0.63628232030415
   * @member {Number} reversePearsonCorrelationCoefficient
   */
  exports.prototype['reversePearsonCorrelationCoefficient'] = undefined;
  /**
   * Example: 10
   * @member {Number} predictorMinimumAllowedValue
   */
  exports.prototype['predictorMinimumAllowedValue'] = undefined;
  /**
   * Example: 160934
   * @member {Number} predictorMaximumAllowedValue
   */
  exports.prototype['predictorMaximumAllowedValue'] = undefined;
  /**
   * Example: RescueTime
   * @member {String} predictorDataSources
   */
  exports.prototype['predictorDataSources'] = undefined;
  /**
   * Example: 0.011598441286655
   * @member {Number} aggregateQMScore
   */
  exports.prototype['aggregateQMScore'] = undefined;
  /**
   * Example: 6
   * @member {Number} numberOfCorrelations
   */
  exports.prototype['numberOfCorrelations'] = undefined;
  /**
   * Example: 6
   * @member {Number} numberOfUsers
   */
  exports.prototype['numberOfUsers'] = undefined;
  /**
   * Example: 0.0333
   * @member {Number} forwardPearsonCorrelationCoefficient
   */
  exports.prototype['forwardPearsonCorrelationCoefficient'] = undefined;
  /**
   * Example: 1
   * @member {Boolean} correlationIsContradictoryToOptimalValues
   */
  exports.prototype['correlationIsContradictoryToOptimalValues'] = undefined;



  return exports;
}));



},{"../ApiClient":16}],27:[function(require,module,exports){
/**
 * quantimodo
 * QuantiModo makes it easy to retrieve normalized user data from a wide array of devices and applications. [Learn about QuantiModo](https://quantimo.do), check out our [docs](https://github.com/QuantiModo/docs) or contact us at [help.quantimo.do](https://help.quantimo.do).
 *
 * OpenAPI spec version: 5.8.728
 *
 * NOTE: This class is auto generated by the swagger code generator program.
 * https://github.com/swagger-api/swagger-codegen.git
 *
 * Swagger Codegen version: 2.2.3
 *
 * Do not edit the class manually.
 *
 */

(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define(['ApiClient'], factory);
  } else if (typeof module === 'object' && module.exports) {
    // CommonJS-like environments that support module.exports, like Node.
    module.exports = factory(require('../ApiClient'));
  } else {
    // Browser globals (root is window)
    if (!root.Quantimodo) {
      root.Quantimodo = {};
    }
    root.Quantimodo.Animation = factory(root.Quantimodo.ApiClient);
  }
}(this, function(ApiClient) {
  'use strict';




  /**
   * The Animation model module.
   * @module model/Animation
   * @version 5.8.807
   */

  /**
   * Constructs a new <code>Animation</code>.
   * @alias module:model/Animation
   * @class
   * @param duration {Number} Example: 0
   */
  var exports = function(duration) {
    var _this = this;

    _this['duration'] = duration;
  };

  /**
   * Constructs a <code>Animation</code> from a plain JavaScript object, optionally creating a new instance.
   * Copies all relevant properties from <code>data</code> to <code>obj</code> if supplied or a new instance if not.
   * @param {Object} data The plain JavaScript object bearing properties of interest.
   * @param {module:model/Animation} obj Optional instance to populate.
   * @return {module:model/Animation} The populated <code>Animation</code> instance.
   */
  exports.constructFromObject = function(data, obj) {
    if (data) {
      obj = obj || new exports();

      if (data.hasOwnProperty('duration')) {
        obj['duration'] = ApiClient.convertToType(data['duration'], 'Number');
      }
    }
    return obj;
  }

  /**
   * Example: 0
   * @member {Number} duration
   */
  exports.prototype['duration'] = undefined;



  return exports;
}));



},{"../ApiClient":16}],28:[function(require,module,exports){
/**
 * quantimodo
 * QuantiModo makes it easy to retrieve normalized user data from a wide array of devices and applications. [Learn about QuantiModo](https://quantimo.do), check out our [docs](https://github.com/QuantiModo/docs) or contact us at [help.quantimo.do](https://help.quantimo.do).
 *
 * OpenAPI spec version: 5.8.728
 *
 * NOTE: This class is auto generated by the swagger code generator program.
 * https://github.com/swagger-api/swagger-codegen.git
 *
 * Swagger Codegen version: 2.2.3
 *
 * Do not edit the class manually.
 *
 */

(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define(['ApiClient'], factory);
  } else if (typeof module === 'object' && module.exports) {
    // CommonJS-like environments that support module.exports, like Node.
    module.exports = factory(require('../ApiClient'));
  } else {
    // Browser globals (root is window)
    if (!root.Quantimodo) {
      root.Quantimodo = {};
    }
    root.Quantimodo.Button = factory(root.Quantimodo.ApiClient);
  }
}(this, function(ApiClient) {
  'use strict';




  /**
   * The Button model module.
   * @module model/Button
   * @version 5.8.807
   */

  /**
   * Constructs a new <code>Button</code>.
   * @alias module:model/Button
   * @class
   * @param text {String} Example: Start Tracking
   * @param link {String} Example: https://local.quantimo.do
   */
  var exports = function(text, link) {
    var _this = this;

    _this['text'] = text;
    _this['link'] = link;
  };

  /**
   * Constructs a <code>Button</code> from a plain JavaScript object, optionally creating a new instance.
   * Copies all relevant properties from <code>data</code> to <code>obj</code> if supplied or a new instance if not.
   * @param {Object} data The plain JavaScript object bearing properties of interest.
   * @param {module:model/Button} obj Optional instance to populate.
   * @return {module:model/Button} The populated <code>Button</code> instance.
   */
  exports.constructFromObject = function(data, obj) {
    if (data) {
      obj = obj || new exports();

      if (data.hasOwnProperty('text')) {
        obj['text'] = ApiClient.convertToType(data['text'], 'String');
      }
      if (data.hasOwnProperty('link')) {
        obj['link'] = ApiClient.convertToType(data['link'], 'String');
      }
    }
    return obj;
  }

  /**
   * Example: Start Tracking
   * @member {String} text
   */
  exports.prototype['text'] = undefined;
  /**
   * Example: https://local.quantimo.do
   * @member {String} link
   */
  exports.prototype['link'] = undefined;



  return exports;
}));



},{"../ApiClient":16}],29:[function(require,module,exports){
/**
 * quantimodo
 * QuantiModo makes it easy to retrieve normalized user data from a wide array of devices and applications. [Learn about QuantiModo](https://quantimo.do), check out our [docs](https://github.com/QuantiModo/docs) or contact us at [help.quantimo.do](https://help.quantimo.do).
 *
 * OpenAPI spec version: 5.8.728
 *
 * NOTE: This class is auto generated by the swagger code generator program.
 * https://github.com/swagger-api/swagger-codegen.git
 *
 * Swagger Codegen version: 2.2.3
 *
 * Do not edit the class manually.
 *
 */

(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define(['ApiClient'], factory);
  } else if (typeof module === 'object' && module.exports) {
    // CommonJS-like environments that support module.exports, like Node.
    module.exports = factory(require('../ApiClient'));
  } else {
    // Browser globals (root is window)
    if (!root.Quantimodo) {
      root.Quantimodo = {};
    }
    root.Quantimodo.Category = factory(root.Quantimodo.ApiClient);
  }
}(this, function(ApiClient) {
  'use strict';




  /**
   * The Category model module.
   * @module model/Category
   * @version 5.8.807
   */

  /**
   * Constructs a new <code>Category</code>.
   * @alias module:model/Category
   * @class
   * @extends Array
   */
  var exports = function() {
    var _this = this;
    _this = new Array();
    Object.setPrototypeOf(_this, exports);

    return _this;
  };

  /**
   * Constructs a <code>Category</code> from a plain JavaScript object, optionally creating a new instance.
   * Copies all relevant properties from <code>data</code> to <code>obj</code> if supplied or a new instance if not.
   * @param {Object} data The plain JavaScript object bearing properties of interest.
   * @param {module:model/Category} obj Optional instance to populate.
   * @return {module:model/Category} The populated <code>Category</code> instance.
   */
  exports.constructFromObject = function(data, obj) {
    if (data) {
      obj = obj || new exports();
      ApiClient.constructFromObject(data, obj, 'String');

    }
    return obj;
  }




  return exports;
}));



},{"../ApiClient":16}],30:[function(require,module,exports){
/**
 * quantimodo
 * QuantiModo makes it easy to retrieve normalized user data from a wide array of devices and applications. [Learn about QuantiModo](https://quantimo.do), check out our [docs](https://github.com/QuantiModo/docs) or contact us at [help.quantimo.do](https://help.quantimo.do).
 *
 * OpenAPI spec version: 5.8.728
 *
 * NOTE: This class is auto generated by the swagger code generator program.
 * https://github.com/swagger-api/swagger-codegen.git
 *
 * Swagger Codegen version: 2.2.3
 *
 * Do not edit the class manually.
 *
 */

(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define(['ApiClient', 'model/Animation', 'model/ChartConfig'], factory);
  } else if (typeof module === 'object' && module.exports) {
    // CommonJS-like environments that support module.exports, like Node.
    module.exports = factory(require('../ApiClient'), require('./Animation'), require('./ChartConfig'));
  } else {
    // Browser globals (root is window)
    if (!root.Quantimodo) {
      root.Quantimodo = {};
    }
    root.Quantimodo.Chart = factory(root.Quantimodo.ApiClient, root.Quantimodo.Animation, root.Quantimodo.ChartConfig);
  }
}(this, function(ApiClient, Animation, ChartConfig) {
  'use strict';




  /**
   * The Chart model module.
   * @module model/Chart
   * @version 5.8.807
   */

  /**
   * Constructs a new <code>Chart</code>.
   * @alias module:model/Chart
   * @class
   * @param type {String} Example: scatter
   * @param zoomType {String} Example: xy
   * @param chartConfig {module:model/ChartConfig} 
   * @param chartTitle {String} Example: Reference And Learning Hours following Barometric Pressure (R = 0.147)
   * @param chartId {String} Example: correlationScatterPlot
   * @param explanation {String} Example: The chart above indicates that an increase in Barometric Pressure is usually followed by an increase in Reference And Learning Hours.
   * @param height {Number} Example: 300
   * @param renderTo {String} Example: BarContainer
   * @param animation {module:model/Animation} 
   */
  var exports = function(type, zoomType, chartConfig, chartTitle, chartId, explanation, height, renderTo, animation) {
    var _this = this;

    _this['type'] = type;
    _this['zoomType'] = zoomType;
    _this['chartConfig'] = chartConfig;
    _this['chartTitle'] = chartTitle;
    _this['chartId'] = chartId;
    _this['explanation'] = explanation;
    _this['height'] = height;
    _this['renderTo'] = renderTo;
    _this['animation'] = animation;
  };

  /**
   * Constructs a <code>Chart</code> from a plain JavaScript object, optionally creating a new instance.
   * Copies all relevant properties from <code>data</code> to <code>obj</code> if supplied or a new instance if not.
   * @param {Object} data The plain JavaScript object bearing properties of interest.
   * @param {module:model/Chart} obj Optional instance to populate.
   * @return {module:model/Chart} The populated <code>Chart</code> instance.
   */
  exports.constructFromObject = function(data, obj) {
    if (data) {
      obj = obj || new exports();

      if (data.hasOwnProperty('type')) {
        obj['type'] = ApiClient.convertToType(data['type'], 'String');
      }
      if (data.hasOwnProperty('zoomType')) {
        obj['zoomType'] = ApiClient.convertToType(data['zoomType'], 'String');
      }
      if (data.hasOwnProperty('chartConfig')) {
        obj['chartConfig'] = ChartConfig.constructFromObject(data['chartConfig']);
      }
      if (data.hasOwnProperty('chartTitle')) {
        obj['chartTitle'] = ApiClient.convertToType(data['chartTitle'], 'String');
      }
      if (data.hasOwnProperty('chartId')) {
        obj['chartId'] = ApiClient.convertToType(data['chartId'], 'String');
      }
      if (data.hasOwnProperty('explanation')) {
        obj['explanation'] = ApiClient.convertToType(data['explanation'], 'String');
      }
      if (data.hasOwnProperty('height')) {
        obj['height'] = ApiClient.convertToType(data['height'], 'Number');
      }
      if (data.hasOwnProperty('renderTo')) {
        obj['renderTo'] = ApiClient.convertToType(data['renderTo'], 'String');
      }
      if (data.hasOwnProperty('animation')) {
        obj['animation'] = Animation.constructFromObject(data['animation']);
      }
    }
    return obj;
  }

  /**
   * Example: scatter
   * @member {String} type
   */
  exports.prototype['type'] = undefined;
  /**
   * Example: xy
   * @member {String} zoomType
   */
  exports.prototype['zoomType'] = undefined;
  /**
   * @member {module:model/ChartConfig} chartConfig
   */
  exports.prototype['chartConfig'] = undefined;
  /**
   * Example: Reference And Learning Hours following Barometric Pressure (R = 0.147)
   * @member {String} chartTitle
   */
  exports.prototype['chartTitle'] = undefined;
  /**
   * Example: correlationScatterPlot
   * @member {String} chartId
   */
  exports.prototype['chartId'] = undefined;
  /**
   * Example: The chart above indicates that an increase in Barometric Pressure is usually followed by an increase in Reference And Learning Hours.
   * @member {String} explanation
   */
  exports.prototype['explanation'] = undefined;
  /**
   * Example: 300
   * @member {Number} height
   */
  exports.prototype['height'] = undefined;
  /**
   * Example: BarContainer
   * @member {String} renderTo
   */
  exports.prototype['renderTo'] = undefined;
  /**
   * @member {module:model/Animation} animation
   */
  exports.prototype['animation'] = undefined;



  return exports;
}));



},{"../ApiClient":16,"./Animation":27,"./ChartConfig":31}],31:[function(require,module,exports){
/**
 * quantimodo
 * QuantiModo makes it easy to retrieve normalized user data from a wide array of devices and applications. [Learn about QuantiModo](https://quantimo.do), check out our [docs](https://github.com/QuantiModo/docs) or contact us at [help.quantimo.do](https://help.quantimo.do).
 *
 * OpenAPI spec version: 5.8.728
 *
 * NOTE: This class is auto generated by the swagger code generator program.
 * https://github.com/swagger-api/swagger-codegen.git
 *
 * Swagger Codegen version: 2.2.3
 *
 * Do not edit the class manually.
 *
 */

(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define(['ApiClient', 'model/Option', 'model/Series', 'model/Subtitle', 'model/Title', 'model/XAxi', 'model/YAxi'], factory);
  } else if (typeof module === 'object' && module.exports) {
    // CommonJS-like environments that support module.exports, like Node.
    module.exports = factory(require('../ApiClient'), require('./Option'), require('./Series'), require('./Subtitle'), require('./Title'), require('./XAxi'), require('./YAxi'));
  } else {
    // Browser globals (root is window)
    if (!root.Quantimodo) {
      root.Quantimodo = {};
    }
    root.Quantimodo.ChartConfig = factory(root.Quantimodo.ApiClient, root.Quantimodo.Option, root.Quantimodo.Series, root.Quantimodo.Subtitle, root.Quantimodo.Title, root.Quantimodo.XAxi, root.Quantimodo.YAxi);
  }
}(this, function(ApiClient, Option, Series, Subtitle, Title, XAxi, YAxi) {
  'use strict';




  /**
   * The ChartConfig model module.
   * @module model/ChartConfig
   * @version 5.8.807
   */

  /**
   * Constructs a new <code>ChartConfig</code>.
   * @alias module:model/ChartConfig
   * @class
   * @param options {module:model/Option} 
   * @param xAxis {module:model/XAxi} 
   * @param yAxis {module:model/YAxi} 
   * @param series {Array.<module:model/Series>} 
   * @param title {module:model/Title} 
   * @param subtitle {module:model/Subtitle} 
   * @param loading {Boolean} Example: false
   */
  var exports = function(options, xAxis, yAxis, series, title, subtitle, loading) {
    var _this = this;

    _this['options'] = options;
    _this['xAxis'] = xAxis;
    _this['yAxis'] = yAxis;
    _this['series'] = series;
    _this['title'] = title;
    _this['subtitle'] = subtitle;
    _this['loading'] = loading;
  };

  /**
   * Constructs a <code>ChartConfig</code> from a plain JavaScript object, optionally creating a new instance.
   * Copies all relevant properties from <code>data</code> to <code>obj</code> if supplied or a new instance if not.
   * @param {Object} data The plain JavaScript object bearing properties of interest.
   * @param {module:model/ChartConfig} obj Optional instance to populate.
   * @return {module:model/ChartConfig} The populated <code>ChartConfig</code> instance.
   */
  exports.constructFromObject = function(data, obj) {
    if (data) {
      obj = obj || new exports();

      if (data.hasOwnProperty('options')) {
        obj['options'] = Option.constructFromObject(data['options']);
      }
      if (data.hasOwnProperty('xAxis')) {
        obj['xAxis'] = XAxi.constructFromObject(data['xAxis']);
      }
      if (data.hasOwnProperty('yAxis')) {
        obj['yAxis'] = YAxi.constructFromObject(data['yAxis']);
      }
      if (data.hasOwnProperty('series')) {
        obj['series'] = ApiClient.convertToType(data['series'], [Series]);
      }
      if (data.hasOwnProperty('title')) {
        obj['title'] = Title.constructFromObject(data['title']);
      }
      if (data.hasOwnProperty('subtitle')) {
        obj['subtitle'] = Subtitle.constructFromObject(data['subtitle']);
      }
      if (data.hasOwnProperty('loading')) {
        obj['loading'] = ApiClient.convertToType(data['loading'], 'Boolean');
      }
    }
    return obj;
  }

  /**
   * @member {module:model/Option} options
   */
  exports.prototype['options'] = undefined;
  /**
   * @member {module:model/XAxi} xAxis
   */
  exports.prototype['xAxis'] = undefined;
  /**
   * @member {module:model/YAxi} yAxis
   */
  exports.prototype['yAxis'] = undefined;
  /**
   * @member {Array.<module:model/Series>} series
   */
  exports.prototype['series'] = undefined;
  /**
   * @member {module:model/Title} title
   */
  exports.prototype['title'] = undefined;
  /**
   * @member {module:model/Subtitle} subtitle
   */
  exports.prototype['subtitle'] = undefined;
  /**
   * Example: false
   * @member {Boolean} loading
   */
  exports.prototype['loading'] = undefined;



  return exports;
}));



},{"../ApiClient":16,"./Option":62,"./Series":69,"./Subtitle":73,"./Title":74,"./XAxi":94,"./YAxi":95}],32:[function(require,module,exports){
/**
 * quantimodo
 * QuantiModo makes it easy to retrieve normalized user data from a wide array of devices and applications. [Learn about QuantiModo](https://quantimo.do), check out our [docs](https://github.com/QuantiModo/docs) or contact us at [help.quantimo.do](https://help.quantimo.do).
 *
 * OpenAPI spec version: 5.8.728
 *
 * NOTE: This class is auto generated by the swagger code generator program.
 * https://github.com/swagger-api/swagger-codegen.git
 *
 * Swagger Codegen version: 2.2.3
 *
 * Do not edit the class manually.
 *
 */

(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define(['ApiClient'], factory);
  } else if (typeof module === 'object' && module.exports) {
    // CommonJS-like environments that support module.exports, like Node.
    module.exports = factory(require('../ApiClient'));
  } else {
    // Browser globals (root is window)
    if (!root.Quantimodo) {
      root.Quantimodo = {};
    }
    root.Quantimodo.ChartStyle = factory(root.Quantimodo.ApiClient);
  }
}(this, function(ApiClient) {
  'use strict';




  /**
   * The ChartStyle model module.
   * @module model/ChartStyle
   * @version 5.8.807
   */

  /**
   * Constructs a new <code>ChartStyle</code>.
   * @alias module:model/ChartStyle
   * @class
   * @param background {String} Example: url(/res/loading3.gif) no-repeat center
   */
  var exports = function(background) {
    var _this = this;

    _this['background'] = background;
  };

  /**
   * Constructs a <code>ChartStyle</code> from a plain JavaScript object, optionally creating a new instance.
   * Copies all relevant properties from <code>data</code> to <code>obj</code> if supplied or a new instance if not.
   * @param {Object} data The plain JavaScript object bearing properties of interest.
   * @param {module:model/ChartStyle} obj Optional instance to populate.
   * @return {module:model/ChartStyle} The populated <code>ChartStyle</code> instance.
   */
  exports.constructFromObject = function(data, obj) {
    if (data) {
      obj = obj || new exports();

      if (data.hasOwnProperty('background')) {
        obj['background'] = ApiClient.convertToType(data['background'], 'String');
      }
    }
    return obj;
  }

  /**
   * Example: url(/res/loading3.gif) no-repeat center
   * @member {String} background
   */
  exports.prototype['background'] = undefined;



  return exports;
}));



},{"../ApiClient":16}],33:[function(require,module,exports){
/**
 * quantimodo
 * QuantiModo makes it easy to retrieve normalized user data from a wide array of devices and applications. [Learn about QuantiModo](https://quantimo.do), check out our [docs](https://github.com/QuantiModo/docs) or contact us at [help.quantimo.do](https://help.quantimo.do).
 *
 * OpenAPI spec version: 5.8.728
 *
 * NOTE: This class is auto generated by the swagger code generator program.
 * https://github.com/swagger-api/swagger-codegen.git
 *
 * Swagger Codegen version: 2.2.3
 *
 * Do not edit the class manually.
 *
 */

(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define(['ApiClient'], factory);
  } else if (typeof module === 'object' && module.exports) {
    // CommonJS-like environments that support module.exports, like Node.
    module.exports = factory(require('../ApiClient'));
  } else {
    // Browser globals (root is window)
    if (!root.Quantimodo) {
      root.Quantimodo = {};
    }
    root.Quantimodo.Color = factory(root.Quantimodo.ApiClient);
  }
}(this, function(ApiClient) {
  'use strict';




  /**
   * The Color model module.
   * @module model/Color
   * @version 5.8.807
   */

  /**
   * Constructs a new <code>Color</code>.
   * @alias module:model/Color
   * @class
   * @extends Array
   */
  var exports = function() {
    var _this = this;
    _this = new Array();
    Object.setPrototypeOf(_this, exports);

    return _this;
  };

  /**
   * Constructs a <code>Color</code> from a plain JavaScript object, optionally creating a new instance.
   * Copies all relevant properties from <code>data</code> to <code>obj</code> if supplied or a new instance if not.
   * @param {Object} data The plain JavaScript object bearing properties of interest.
   * @param {module:model/Color} obj Optional instance to populate.
   * @return {module:model/Color} The populated <code>Color</code> instance.
   */
  exports.constructFromObject = function(data, obj) {
    if (data) {
      obj = obj || new exports();
      ApiClient.constructFromObject(data, obj, 'String');

    }
    return obj;
  }




  return exports;
}));



},{"../ApiClient":16}],34:[function(require,module,exports){
/**
 * quantimodo
 * QuantiModo makes it easy to retrieve normalized user data from a wide array of devices and applications. [Learn about QuantiModo](https://quantimo.do), check out our [docs](https://github.com/QuantiModo/docs) or contact us at [help.quantimo.do](https://help.quantimo.do).
 *
 * OpenAPI spec version: 5.8.728
 *
 * NOTE: This class is auto generated by the swagger code generator program.
 * https://github.com/swagger-api/swagger-codegen.git
 *
 * Swagger Codegen version: 2.2.3
 *
 * Do not edit the class manually.
 *
 */

(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define(['ApiClient'], factory);
  } else if (typeof module === 'object' && module.exports) {
    // CommonJS-like environments that support module.exports, like Node.
    module.exports = factory(require('../ApiClient'));
  } else {
    // Browser globals (root is window)
    if (!root.Quantimodo) {
      root.Quantimodo = {};
    }
    root.Quantimodo.Column = factory(root.Quantimodo.ApiClient);
  }
}(this, function(ApiClient) {
  'use strict';




  /**
   * The Column model module.
   * @module model/Column
   * @version 5.8.807
   */

  /**
   * Constructs a new <code>Column</code>.
   * @alias module:model/Column
   * @class
   * @param pointPadding {Number} Example: 0.2
   * @param borderWidth {Number} Example: 0
   * @param pointWidth {Number} Example: 33.333333333333
   * @param enableMouseTracking {Boolean} Example: true
   * @param colorByPoint {Boolean} Example: true
   */
  var exports = function(pointPadding, borderWidth, pointWidth, enableMouseTracking, colorByPoint) {
    var _this = this;

    _this['pointPadding'] = pointPadding;
    _this['borderWidth'] = borderWidth;
    _this['pointWidth'] = pointWidth;
    _this['enableMouseTracking'] = enableMouseTracking;
    _this['colorByPoint'] = colorByPoint;
  };

  /**
   * Constructs a <code>Column</code> from a plain JavaScript object, optionally creating a new instance.
   * Copies all relevant properties from <code>data</code> to <code>obj</code> if supplied or a new instance if not.
   * @param {Object} data The plain JavaScript object bearing properties of interest.
   * @param {module:model/Column} obj Optional instance to populate.
   * @return {module:model/Column} The populated <code>Column</code> instance.
   */
  exports.constructFromObject = function(data, obj) {
    if (data) {
      obj = obj || new exports();

      if (data.hasOwnProperty('pointPadding')) {
        obj['pointPadding'] = ApiClient.convertToType(data['pointPadding'], 'Number');
      }
      if (data.hasOwnProperty('borderWidth')) {
        obj['borderWidth'] = ApiClient.convertToType(data['borderWidth'], 'Number');
      }
      if (data.hasOwnProperty('pointWidth')) {
        obj['pointWidth'] = ApiClient.convertToType(data['pointWidth'], 'Number');
      }
      if (data.hasOwnProperty('enableMouseTracking')) {
        obj['enableMouseTracking'] = ApiClient.convertToType(data['enableMouseTracking'], 'Boolean');
      }
      if (data.hasOwnProperty('colorByPoint')) {
        obj['colorByPoint'] = ApiClient.convertToType(data['colorByPoint'], 'Boolean');
      }
    }
    return obj;
  }

  /**
   * Example: 0.2
   * @member {Number} pointPadding
   */
  exports.prototype['pointPadding'] = undefined;
  /**
   * Example: 0
   * @member {Number} borderWidth
   */
  exports.prototype['borderWidth'] = undefined;
  /**
   * Example: 33.333333333333
   * @member {Number} pointWidth
   */
  exports.prototype['pointWidth'] = undefined;
  /**
   * Example: true
   * @member {Boolean} enableMouseTracking
   */
  exports.prototype['enableMouseTracking'] = undefined;
  /**
   * Example: true
   * @member {Boolean} colorByPoint
   */
  exports.prototype['colorByPoint'] = undefined;



  return exports;
}));



},{"../ApiClient":16}],35:[function(require,module,exports){
/**
 * quantimodo
 * QuantiModo makes it easy to retrieve normalized user data from a wide array of devices and applications. [Learn about QuantiModo](https://quantimo.do), check out our [docs](https://github.com/QuantiModo/docs) or contact us at [help.quantimo.do](https://help.quantimo.do).
 *
 * OpenAPI spec version: 5.8.728
 *
 * NOTE: This class is auto generated by the swagger code generator program.
 * https://github.com/swagger-api/swagger-codegen.git
 *
 * Swagger Codegen version: 2.2.3
 *
 * Do not edit the class manually.
 *
 */

(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define(['ApiClient', 'model/GetStudyDataResponse'], factory);
  } else if (typeof module === 'object' && module.exports) {
    // CommonJS-like environments that support module.exports, like Node.
    module.exports = factory(require('../ApiClient'), require('./GetStudyDataResponse'));
  } else {
    // Browser globals (root is window)
    if (!root.Quantimodo) {
      root.Quantimodo = {};
    }
    root.Quantimodo.CommonResponse = factory(root.Quantimodo.ApiClient, root.Quantimodo.GetStudyDataResponse);
  }
}(this, function(ApiClient, GetStudyDataResponse) {
  'use strict';




  /**
   * The CommonResponse model module.
   * @module model/CommonResponse
   * @version 5.8.807
   */

  /**
   * Constructs a new <code>CommonResponse</code>.
   * @alias module:model/CommonResponse
   * @class
   * @param status {Number} Status code
   * @param success {Boolean} 
   */
  var exports = function(status, success) {
    var _this = this;

    _this['status'] = status;

    _this['success'] = success;

  };

  /**
   * Constructs a <code>CommonResponse</code> from a plain JavaScript object, optionally creating a new instance.
   * Copies all relevant properties from <code>data</code> to <code>obj</code> if supplied or a new instance if not.
   * @param {Object} data The plain JavaScript object bearing properties of interest.
   * @param {module:model/CommonResponse} obj Optional instance to populate.
   * @return {module:model/CommonResponse} The populated <code>CommonResponse</code> instance.
   */
  exports.constructFromObject = function(data, obj) {
    if (data) {
      obj = obj || new exports();

      if (data.hasOwnProperty('status')) {
        obj['status'] = ApiClient.convertToType(data['status'], 'Number');
      }
      if (data.hasOwnProperty('message')) {
        obj['message'] = ApiClient.convertToType(data['message'], 'String');
      }
      if (data.hasOwnProperty('success')) {
        obj['success'] = ApiClient.convertToType(data['success'], 'Boolean');
      }
      if (data.hasOwnProperty('data')) {
        obj['data'] = GetStudyDataResponse.constructFromObject(data['data']);
      }
    }
    return obj;
  }

  /**
   * Status code
   * @member {Number} status
   */
  exports.prototype['status'] = undefined;
  /**
   * Message
   * @member {String} message
   */
  exports.prototype['message'] = undefined;
  /**
   * @member {Boolean} success
   */
  exports.prototype['success'] = undefined;
  /**
   * @member {module:model/GetStudyDataResponse} data
   */
  exports.prototype['data'] = undefined;



  return exports;
}));



},{"../ApiClient":16,"./GetStudyDataResponse":46}],36:[function(require,module,exports){
/**
 * quantimodo
 * QuantiModo makes it easy to retrieve normalized user data from a wide array of devices and applications. [Learn about QuantiModo](https://quantimo.do), check out our [docs](https://github.com/QuantiModo/docs) or contact us at [help.quantimo.do](https://help.quantimo.do).
 *
 * OpenAPI spec version: 5.8.728
 *
 * NOTE: This class is auto generated by the swagger code generator program.
 * https://github.com/swagger-api/swagger-codegen.git
 *
 * Swagger Codegen version: 2.2.3
 *
 * Do not edit the class manually.
 *
 */

(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define(['ApiClient'], factory);
  } else if (typeof module === 'object' && module.exports) {
    // CommonJS-like environments that support module.exports, like Node.
    module.exports = factory(require('../ApiClient'));
  } else {
    // Browser globals (root is window)
    if (!root.Quantimodo) {
      root.Quantimodo = {};
    }
    root.Quantimodo.Connector = factory(root.Quantimodo.ApiClient);
  }
}(this, function(ApiClient) {
  'use strict';




  /**
   * The Connector model module.
   * @module model/Connector
   * @version 5.8.807
   */

  /**
   * Constructs a new <code>Connector</code>.
   * @alias module:model/Connector
   * @class
   * @param id {Number} Connector ID number
   * @param name {String} Connector lowercase system name
   * @param displayName {String} Connector pretty display name
   * @param image {String} URL to the image of the connector logo
   * @param getItUrl {String} URL to a site where one can get this device or application
   * @param connected {String} True if the authenticated user has this connector enabled
   * @param connectInstructions {String} URL and parameters used when connecting to a service
   * @param lastUpdate {Number} Epoch timestamp of last sync
   * @param totalMeasurementsInLastUpdate {Number} Number of measurements obtained during latest update
   */
  var exports = function(id, name, displayName, image, getItUrl, connected, connectInstructions, lastUpdate, totalMeasurementsInLastUpdate) {
    var _this = this;

    _this['id'] = id;
    _this['name'] = name;
    _this['displayName'] = displayName;
    _this['image'] = image;
    _this['getItUrl'] = getItUrl;
    _this['connected'] = connected;
    _this['connectInstructions'] = connectInstructions;
    _this['lastUpdate'] = lastUpdate;
    _this['totalMeasurementsInLastUpdate'] = totalMeasurementsInLastUpdate;


















  };

  /**
   * Constructs a <code>Connector</code> from a plain JavaScript object, optionally creating a new instance.
   * Copies all relevant properties from <code>data</code> to <code>obj</code> if supplied or a new instance if not.
   * @param {Object} data The plain JavaScript object bearing properties of interest.
   * @param {module:model/Connector} obj Optional instance to populate.
   * @return {module:model/Connector} The populated <code>Connector</code> instance.
   */
  exports.constructFromObject = function(data, obj) {
    if (data) {
      obj = obj || new exports();

      if (data.hasOwnProperty('id')) {
        obj['id'] = ApiClient.convertToType(data['id'], 'Number');
      }
      if (data.hasOwnProperty('name')) {
        obj['name'] = ApiClient.convertToType(data['name'], 'String');
      }
      if (data.hasOwnProperty('displayName')) {
        obj['displayName'] = ApiClient.convertToType(data['displayName'], 'String');
      }
      if (data.hasOwnProperty('image')) {
        obj['image'] = ApiClient.convertToType(data['image'], 'String');
      }
      if (data.hasOwnProperty('getItUrl')) {
        obj['getItUrl'] = ApiClient.convertToType(data['getItUrl'], 'String');
      }
      if (data.hasOwnProperty('connected')) {
        obj['connected'] = ApiClient.convertToType(data['connected'], 'String');
      }
      if (data.hasOwnProperty('connectInstructions')) {
        obj['connectInstructions'] = ApiClient.convertToType(data['connectInstructions'], 'String');
      }
      if (data.hasOwnProperty('lastUpdate')) {
        obj['lastUpdate'] = ApiClient.convertToType(data['lastUpdate'], 'Number');
      }
      if (data.hasOwnProperty('totalMeasurementsInLastUpdate')) {
        obj['totalMeasurementsInLastUpdate'] = ApiClient.convertToType(data['totalMeasurementsInLastUpdate'], 'Number');
      }
      if (data.hasOwnProperty('connectStatus')) {
        obj['connectStatus'] = ApiClient.convertToType(data['connectStatus'], 'String');
      }
      if (data.hasOwnProperty('updateRequestedAt')) {
        obj['updateRequestedAt'] = ApiClient.convertToType(data['updateRequestedAt'], 'Date');
      }
      if (data.hasOwnProperty('shortDescription')) {
        obj['shortDescription'] = ApiClient.convertToType(data['shortDescription'], 'String');
      }
      if (data.hasOwnProperty('message')) {
        obj['message'] = ApiClient.convertToType(data['message'], 'String');
      }
      if (data.hasOwnProperty('lastSuccessfulUpdatedAt')) {
        obj['lastSuccessfulUpdatedAt'] = ApiClient.convertToType(data['lastSuccessfulUpdatedAt'], 'Date');
      }
      if (data.hasOwnProperty('imageHtml')) {
        obj['imageHtml'] = ApiClient.convertToType(data['imageHtml'], 'String');
      }
      if (data.hasOwnProperty('updateStatus')) {
        obj['updateStatus'] = ApiClient.convertToType(data['updateStatus'], 'String');
      }
      if (data.hasOwnProperty('oauth')) {
        obj['oauth'] = ApiClient.convertToType(data['oauth'], Object);
      }
      if (data.hasOwnProperty('defaultVariableCategoryName')) {
        obj['defaultVariableCategoryName'] = ApiClient.convertToType(data['defaultVariableCategoryName'], 'String');
      }
      if (data.hasOwnProperty('connectorClientId')) {
        obj['connectorClientId'] = ApiClient.convertToType(data['connectorClientId'], 'String');
      }
      if (data.hasOwnProperty('longDescription')) {
        obj['longDescription'] = ApiClient.convertToType(data['longDescription'], 'String');
      }
      if (data.hasOwnProperty('enabled')) {
        obj['enabled'] = ApiClient.convertToType(data['enabled'], 'Number');
      }
      if (data.hasOwnProperty('linkedDisplayNameHtml')) {
        obj['linkedDisplayNameHtml'] = ApiClient.convertToType(data['linkedDisplayNameHtml'], 'String');
      }
      if (data.hasOwnProperty('clientId')) {
        obj['clientId'] = ApiClient.convertToType(data['clientId'], 'String');
      }
      if (data.hasOwnProperty('userId')) {
        obj['userId'] = ApiClient.convertToType(data['userId'], 'Number');
      }
      if (data.hasOwnProperty('connectorId')) {
        obj['connectorId'] = ApiClient.convertToType(data['connectorId'], 'Number');
      }
      if (data.hasOwnProperty('createdAt')) {
        obj['createdAt'] = ApiClient.convertToType(data['createdAt'], 'Date');
      }
      if (data.hasOwnProperty('updatedAt')) {
        obj['updatedAt'] = ApiClient.convertToType(data['updatedAt'], 'Date');
      }
    }
    return obj;
  }

  /**
   * Connector ID number
   * @member {Number} id
   */
  exports.prototype['id'] = undefined;
  /**
   * Connector lowercase system name
   * @member {String} name
   */
  exports.prototype['name'] = undefined;
  /**
   * Connector pretty display name
   * @member {String} displayName
   */
  exports.prototype['displayName'] = undefined;
  /**
   * URL to the image of the connector logo
   * @member {String} image
   */
  exports.prototype['image'] = undefined;
  /**
   * URL to a site where one can get this device or application
   * @member {String} getItUrl
   */
  exports.prototype['getItUrl'] = undefined;
  /**
   * True if the authenticated user has this connector enabled
   * @member {String} connected
   */
  exports.prototype['connected'] = undefined;
  /**
   * URL and parameters used when connecting to a service
   * @member {String} connectInstructions
   */
  exports.prototype['connectInstructions'] = undefined;
  /**
   * Epoch timestamp of last sync
   * @member {Number} lastUpdate
   */
  exports.prototype['lastUpdate'] = undefined;
  /**
   * Number of measurements obtained during latest update
   * @member {Number} totalMeasurementsInLastUpdate
   */
  exports.prototype['totalMeasurementsInLastUpdate'] = undefined;
  /**
   * Example: CONNECTED
   * @member {String} connectStatus
   */
  exports.prototype['connectStatus'] = undefined;
  /**
   * Example: 2017-07-18 05:16:31
   * @member {Date} updateRequestedAt
   */
  exports.prototype['updateRequestedAt'] = undefined;
  /**
   * Example: Tracks social interaction. QuantiModo requires permission to access your Facebook \"user likes\" and \"user posts\".
   * @member {String} shortDescription
   */
  exports.prototype['shortDescription'] = undefined;
  /**
   * Example: Got 412 new measurements on 2017-07-31 10:10:34
   * @member {String} message
   */
  exports.prototype['message'] = undefined;
  /**
   * Example: 2017-07-31 10:10:34
   * @member {Date} lastSuccessfulUpdatedAt
   */
  exports.prototype['lastSuccessfulUpdatedAt'] = undefined;
  /**
   * Example: <a href=\"http://www.facebook.com\"><img id=\"facebook_image\" title=\"Facebook\" src=\"https://i.imgur.com/GhwqK4f.png\" alt=\"Facebook\"></a>
   * @member {String} imageHtml
   */
  exports.prototype['imageHtml'] = undefined;
  /**
   * Example: UPDATED
   * @member {String} updateStatus
   */
  exports.prototype['updateStatus'] = undefined;
  /**
   * Example: {}
   * @member {Object} oauth
   */
  exports.prototype['oauth'] = undefined;
  /**
   * Example: Social Interactions
   * @member {String} defaultVariableCategoryName
   */
  exports.prototype['defaultVariableCategoryName'] = undefined;
  /**
   * Example: 225078261031461
   * @member {String} connectorClientId
   */
  exports.prototype['connectorClientId'] = undefined;
  /**
   * Example: Facebook is a social networking website where users may create a personal profile, add other users as friends, and exchange messages.
   * @member {String} longDescription
   */
  exports.prototype['longDescription'] = undefined;
  /**
   * Example: 1
   * @member {Number} enabled
   */
  exports.prototype['enabled'] = undefined;
  /**
   * Example: <a href=\"http://www.facebook.com\">Facebook</a>
   * @member {String} linkedDisplayNameHtml
   */
  exports.prototype['linkedDisplayNameHtml'] = undefined;
  /**
   * Example: ghostInspector
   * @member {String} clientId
   */
  exports.prototype['clientId'] = undefined;
  /**
   * Example: 230
   * @member {Number} userId
   */
  exports.prototype['userId'] = undefined;
  /**
   * Example: 8
   * @member {Number} connectorId
   */
  exports.prototype['connectorId'] = undefined;
  /**
   * Example: 2000-01-01 00:00:00
   * @member {Date} createdAt
   */
  exports.prototype['createdAt'] = undefined;
  /**
   * Example: 2017-07-31 10:10:34
   * @member {Date} updatedAt
   */
  exports.prototype['updatedAt'] = undefined;



  return exports;
}));



},{"../ApiClient":16}],37:[function(require,module,exports){
/**
 * quantimodo
 * QuantiModo makes it easy to retrieve normalized user data from a wide array of devices and applications. [Learn about QuantiModo](https://quantimo.do), check out our [docs](https://github.com/QuantiModo/docs) or contact us at [help.quantimo.do](https://help.quantimo.do).
 *
 * OpenAPI spec version: 5.8.728
 *
 * NOTE: This class is auto generated by the swagger code generator program.
 * https://github.com/swagger-api/swagger-codegen.git
 *
 * Swagger Codegen version: 2.2.3
 *
 * Do not edit the class manually.
 *
 */

(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define(['ApiClient'], factory);
  } else if (typeof module === 'object' && module.exports) {
    // CommonJS-like environments that support module.exports, like Node.
    module.exports = factory(require('../ApiClient'));
  } else {
    // Browser globals (root is window)
    if (!root.Quantimodo) {
      root.Quantimodo = {};
    }
    root.Quantimodo.ConnectorInstruction = factory(root.Quantimodo.ApiClient);
  }
}(this, function(ApiClient) {
  'use strict';




  /**
   * The ConnectorInstruction model module.
   * @module model/ConnectorInstruction
   * @version 5.8.807
   */

  /**
   * Constructs a new <code>ConnectorInstruction</code>.
   * @alias module:model/ConnectorInstruction
   * @class
   */
  var exports = function() {
    var _this = this;




  };

  /**
   * Constructs a <code>ConnectorInstruction</code> from a plain JavaScript object, optionally creating a new instance.
   * Copies all relevant properties from <code>data</code> to <code>obj</code> if supplied or a new instance if not.
   * @param {Object} data The plain JavaScript object bearing properties of interest.
   * @param {module:model/ConnectorInstruction} obj Optional instance to populate.
   * @return {module:model/ConnectorInstruction} The populated <code>ConnectorInstruction</code> instance.
   */
  exports.constructFromObject = function(data, obj) {
    if (data) {
      obj = obj || new exports();

      if (data.hasOwnProperty('url')) {
        obj['url'] = ApiClient.convertToType(data['url'], 'String');
      }
      if (data.hasOwnProperty('parameters')) {
        obj['parameters'] = ApiClient.convertToType(data['parameters'], ['String']);
      }
      if (data.hasOwnProperty('usePopup')) {
        obj['usePopup'] = ApiClient.convertToType(data['usePopup'], 'Boolean');
      }
    }
    return obj;
  }

  /**
   * url
   * @member {String} url
   */
  exports.prototype['url'] = undefined;
  /**
   * parameters array
   * @member {Array.<String>} parameters
   */
  exports.prototype['parameters'] = undefined;
  /**
   * usePopup
   * @member {Boolean} usePopup
   */
  exports.prototype['usePopup'] = undefined;



  return exports;
}));



},{"../ApiClient":16}],38:[function(require,module,exports){
/**
 * quantimodo
 * QuantiModo makes it easy to retrieve normalized user data from a wide array of devices and applications. [Learn about QuantiModo](https://quantimo.do), check out our [docs](https://github.com/QuantiModo/docs) or contact us at [help.quantimo.do](https://help.quantimo.do).
 *
 * OpenAPI spec version: 5.8.728
 *
 * NOTE: This class is auto generated by the swagger code generator program.
 * https://github.com/swagger-api/swagger-codegen.git
 *
 * Swagger Codegen version: 2.2.3
 *
 * Do not edit the class manually.
 *
 */

(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define(['ApiClient'], factory);
  } else if (typeof module === 'object' && module.exports) {
    // CommonJS-like environments that support module.exports, like Node.
    module.exports = factory(require('../ApiClient'));
  } else {
    // Browser globals (root is window)
    if (!root.Quantimodo) {
      root.Quantimodo = {};
    }
    root.Quantimodo.ConversionStep = factory(root.Quantimodo.ApiClient);
  }
}(this, function(ApiClient) {
  'use strict';




  /**
   * The ConversionStep model module.
   * @module model/ConversionStep
   * @version 5.8.807
   */

  /**
   * Constructs a new <code>ConversionStep</code>.
   * @alias module:model/ConversionStep
   * @class
   * @param operation {module:model/ConversionStep.OperationEnum} ADD or MULTIPLY
   * @param value {Number} This specifies the order of conversion steps starting with 0
   */
  var exports = function(operation, value) {
    var _this = this;

    _this['operation'] = operation;
    _this['value'] = value;
  };

  /**
   * Constructs a <code>ConversionStep</code> from a plain JavaScript object, optionally creating a new instance.
   * Copies all relevant properties from <code>data</code> to <code>obj</code> if supplied or a new instance if not.
   * @param {Object} data The plain JavaScript object bearing properties of interest.
   * @param {module:model/ConversionStep} obj Optional instance to populate.
   * @return {module:model/ConversionStep} The populated <code>ConversionStep</code> instance.
   */
  exports.constructFromObject = function(data, obj) {
    if (data) {
      obj = obj || new exports();

      if (data.hasOwnProperty('operation')) {
        obj['operation'] = ApiClient.convertToType(data['operation'], 'String');
      }
      if (data.hasOwnProperty('value')) {
        obj['value'] = ApiClient.convertToType(data['value'], 'Number');
      }
    }
    return obj;
  }

  /**
   * ADD or MULTIPLY
   * @member {module:model/ConversionStep.OperationEnum} operation
   */
  exports.prototype['operation'] = undefined;
  /**
   * This specifies the order of conversion steps starting with 0
   * @member {Number} value
   */
  exports.prototype['value'] = undefined;


  /**
   * Allowed values for the <code>operation</code> property.
   * @enum {String}
   * @readonly
   */
  exports.OperationEnum = {
    /**
     * value: "MULTIPLY"
     * @const
     */
    "MULTIPLY": "MULTIPLY",
    /**
     * value: "ADD"
     * @const
     */
    "ADD": "ADD"  };


  return exports;
}));



},{"../ApiClient":16}],39:[function(require,module,exports){
/**
 * quantimodo
 * QuantiModo makes it easy to retrieve normalized user data from a wide array of devices and applications. [Learn about QuantiModo](https://quantimo.do), check out our [docs](https://github.com/QuantiModo/docs) or contact us at [help.quantimo.do](https://help.quantimo.do).
 *
 * OpenAPI spec version: 5.8.728
 *
 * NOTE: This class is auto generated by the swagger code generator program.
 * https://github.com/swagger-api/swagger-codegen.git
 *
 * Swagger Codegen version: 2.2.3
 *
 * Do not edit the class manually.
 *
 */

(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define(['ApiClient'], factory);
  } else if (typeof module === 'object' && module.exports) {
    // CommonJS-like environments that support module.exports, like Node.
    module.exports = factory(require('../ApiClient'));
  } else {
    // Browser globals (root is window)
    if (!root.Quantimodo) {
      root.Quantimodo = {};
    }
    root.Quantimodo.Correlation = factory(root.Quantimodo.ApiClient);
  }
}(this, function(ApiClient) {
  'use strict';




  /**
   * The Correlation model module.
   * @module model/Correlation
   * @version 5.8.807
   */

  /**
   * Constructs a new <code>Correlation</code>.
   * @alias module:model/Correlation
   * @class
   * @param causeVariableName {String} Example: Sleep Quality
   * @param effectVariableName {String} Example: Overall Mood
   * @param averageDailyHighCause {Number} Example: 4.19
   * @param averageDailyLowCause {Number} Example: 1.97
   * @param averageEffect {Number} Example: 3.0791054117396
   * @param averageEffectFollowingHighCause {Number} Example: 3.55
   * @param averageEffectFollowingLowCause {Number} Example: 2.65
   * @param averageForwardPearsonCorrelationOverOnsetDelays {Number} Example: 0.396
   * @param averageReversePearsonCorrelationOverOnsetDelays {Number} Example: 0.453667
   * @param causeChanges {Number} Example: 164
   * @param causeVariableId {Number} Example: 1448
   * @param confidenceInterval {Number} Example: 0.14344467795996
   * @param createdAt {Date} Example: 2016-12-28 20:47:30
   * @param criticalTValue {Number} Example: 1.646
   * @param durationOfAction {Number} Example: 604800
   * @param effectChanges {Number} Example: 193
   * @param effectVariableId {Number} Example: 1398
   * @param experimentEndTime {Date} Example: 2014-07-30 12:50:00
   * @param experimentStartTime {Date} Example: 2012-05-06 21:15:00
   * @param correlationCoefficient {Number} Example: 0.538
   * @param forwardSpearmanCorrelationCoefficient {Number} Example: 0.528359
   * @param numberOfPairs {Number} Example: 298
   * @param onsetDelayWithStrongestPearsonCorrelation {Number} Example: -86400
   * @param optimalPearsonProduct {Number} Example: 0.68582816186982
   * @param pearsonCorrelationWithNoOnsetDelay {Number} Example: 0.477
   * @param predictivePearsonCorrelation {Number} Example: 0.538
   * @param predictsHighEffectChange {Number} Example: 17
   * @param predictsLowEffectChange {Number} Example: -11
   * @param qmScore {Number} Example: 0.528
   * @param statisticalSignificance {Number} Example: 0.9813
   * @param strongestPearsonCorrelationCoefficient {Number} Example: 0.613
   * @param tValue {Number} Example: 9.6986079652717
   * @param updatedAt {Date} Example: 2017-05-06 15:40:38
   * @param userId {Number} Example: 230
   * @param valuePredictingHighOutcome {Number} Example: 4.14
   * @param valuePredictingLowOutcome {Number} Example: 3.03
   * @param causeVariableCombinationOperation {String} Example: MEAN
   * @param causeVariableDefaultUnitId {Number} Example: 10
   * @param causeVariableImageUrl {String} Example: https://maxcdn.icons8.com/Color/PNG/96/Household/sleeping_in_bed-96.png
   * @param causeVariableIonIcon {String} Example: ion-ios-cloudy-night-outline
   * @param causeVariableMostCommonConnectorId {Number} Example: 6
   * @param causeVariableCategoryId {Number} Example: 6
   * @param effectVariableCombinationOperation {String} Example: MEAN
   * @param effectVariableCommonAlias {String} Example: Mood_(psychology)
   * @param effectVariableDefaultUnitId {Number} Example: 10
   * @param effectVariableImageUrl {String} Example: https://maxcdn.icons8.com/Color/PNG/96/Cinema/theatre_mask-96.png
   * @param effectVariableIonIcon {String} Example: ion-happy-outline
   * @param effectVariableMostCommonConnectorId {Number} Example: 10
   * @param effectVariableCategoryId {Number} Example: 1
   * @param timestamp {Number} Example: 1494085127
   * @param userVote {Number} Example: 1
   * @param causeUserVariableShareUserMeasurements {Number} Example: 1
   * @param effectUserVariableShareUserMeasurements {Number} Example: 1
   * @param predictorFillingValue {Number} Example: -1
   * @param outcomeFillingValue {Number} Example: -1
   * @param averageVote {String} Example: 0.9855
   * @param durationOfActionInHours {Number} Example: 168
   * @param onsetDelayWithStrongestPearsonCorrelationInHours {Number} Example: -24
   * @param effectVariableCategoryName {String} Example: Emotions
   * @param causeVariableCategoryName {String} Example: Sleep
   * @param direction {String} Example: higher
   * @param causeVariableDefaultUnitAbbreviatedName {String} Example: /5
   * @param effectVariableDefaultUnitAbbreviatedName {String} Example: /5
   * @param causeVariableDefaultUnitName {String} Example: 1 to 5 Rating
   * @param effectVariableDefaultUnitName {String} Example: 1 to 5 Rating
   * @param shareUserMeasurements {Boolean} Example: 1
   * @param effectUnit {String} Example: /5
   * @param significanceExplanation {String} Example: Using a two-tailed t-test with alpha = 0.05, it was determined that the change in Overall Mood is statistically significant at 95% confidence interval. 
   * @param significantDifference {Boolean} Example: 1
   * @param effectSize {String} Example: moderately positive
   * @param predictsHighEffectChangeSentenceFragment {String} Example: , on average, 17% 
   * @param predictsLowEffectChangeSentenceFragment {String} Example: , on average, 11% 
   * @param valuePredictingHighOutcomeExplanation {String} Example: Overall Mood, on average, 17% higher after around 4.14/5 Sleep Quality 
   * @param averageEffectFollowingHighCauseExplanation {String} Example: Overall Mood is 3.55/5 (15% higher) on average after days with around 4.19/5 Sleep Quality
   * @param averageEffectFollowingLowCauseExplanation {String} Example: Overall Mood is 2.65/5 (14% lower) on average after days with around 1.97/5 Sleep Quality
   * @param valuePredictingLowOutcomeExplanation {String} Example: Overall Mood, on average, 11% lower after around 3.03/5 Sleep Quality 
   * @param strengthLevel {String} Example: moderate
   * @param confidenceLevel {String} Example: high
   * @param predictivePearsonCorrelationCoefficient {Number} Example: 0.538
   * @param predictorExplanation {String} Example: Sleep Quality Predicts Higher Overall Mood
   * @param studyTitle {String} Example: N1 Study: Sleep Quality Predicts Higher Overall Mood
   * @param studyAbstract {String} Example: Your data suggests with a high degree of confidence (p=0) that Sleep Quality (Sleep) has a moderately positive predictive relationship (R=0.538) with Overall Mood  (Emotions).  The highest quartile of Overall Mood  measurements were observed following an average 4.14/5 Sleep Quality.  The lowest quartile of Overall Mood  measurements were observed following an average 3.03/5 Sleep Quality.
   * @param studyLinkStatic {String} Example: https://local.quantimo.do/api/v2/study?causeVariableName=Sleep%20Quality&effectVariableName=Overall%20Mood&userId=230
   * @param studyLinkDynamic {String} Example: https://local.quantimo.do/ionic/Modo/www/index.html#/app/study?causeVariableName=Sleep%20Quality&effectVariableName=Overall%20Mood&userId=230
   * @param studyLinkFacebook {String} Example: https://www.facebook.com/sharer/sharer.php?u=https%3A%2F%2Flocal.quantimo.do%2Fapi%2Fv2%2Fstudy%3FcauseVariableName%3DSleep%2520Quality%26effectVariableName%3DOverall%2520Mood%26userId%3D230
   * @param studyLinkGoogle {String} Example: https://plus.google.com/share?url=https%3A%2F%2Flocal.quantimo.do%2Fapi%2Fv2%2Fstudy%3FcauseVariableName%3DSleep%2520Quality%26effectVariableName%3DOverall%2520Mood%26userId%3D230
   * @param studyLinkTwitter {String} Example: https://twitter.com/home?status=Sleep%20Quality%20Predicts%20Higher%20Overall%20Mood%20https%3A%2F%2Flocal.quantimo.do%2Fapi%2Fv2%2Fstudy%3FcauseVariableName%3DSleep%2520Quality%26effectVariableName%3DOverall%2520Mood%26userId%3D230%20%40quantimodo
   * @param studyLinkEmail {String} Example: mailto:?subject=N1%20Study%3A%20Sleep%20Quality%20Predicts%20Higher%20Overall%20Mood&body=Check%20out%20my%20study%20at%20https%3A%2F%2Flocal.quantimo.do%2Fapi%2Fv2%2Fstudy%3FcauseVariableName%3DSleep%2520Quality%26effectVariableName%3DOverall%2520Mood%26userId%3D230%0A%0AHave%20a%20great%20day!
   * @param gaugeImage {String} Example: https://s3.amazonaws.com/quantimodo-docs/images/gauge-moderately-positive-relationship.png
   * @param gaugeImageSquare {String} Example: https://s3.amazonaws.com/quantimodo-docs/images/gauge-moderately-positive-relationship-200-200.png
   * @param imageUrl {String} Example: https://s3-us-west-1.amazonaws.com/qmimages/variable_categories_gauges_logo_background/gauge-moderately-positive-relationship_sleep_emotions_logo_background.png
   * @param studyDesign {String} Example: This study is based on data donated by one QuantiModo user. Thus, the study design is consistent with an n=1 observational natural experiment. 
   * @param studyObjective {String} Example: The objective of this study is to determine the nature of the relationship (if any) between the Sleep Quality and the Overall Mood. Additionally, we attempt to determine the Sleep Quality values most likely to produce optimal Overall Mood values. 
   * @param dataSources {String} Example: Sleep Quality data was primarily collected using <a href=\"http://www.amazon.com/gp/product/B00A17IAO0/ref=as_li_qf_sp_asin_tl?ie=UTF8&camp=1789&creative=9325&creativeASIN=B00A17IAO0&linkCode=as2&tag=quant08-20\">Up by Jawbone</a>.  UP by Jawbone is a wristband and app that tracks how you sleep, move and eat and then helps you use that information to feel your best.<br>Overall Mood data was primarily collected using <a href=\"https://quantimo.do\">QuantiModo</a>.  <a href=\"https://quantimo.do\">QuantiModo</a> is a Chrome extension, Android app, iOS app, and web app that allows you to easily track mood, symptoms, or any outcome you want to optimize in a fraction of a second.  You can also import your data from over 30 other apps and devices like Fitbit, Rescuetime, Jawbone Up, Withings, Facebook, Github, Google Calendar, Runkeeper, MoodPanda, Slice, Google Fit, and more.  <a href=\"https://quantimo.do\">QuantiModo</a> then analyzes your data to identify which hidden factors are most likely to be influencing your mood or symptoms and their optimal daily values.
   * @param dataSourcesParagraphForCause {String} Example: Sleep Quality data was primarily collected using <a href=\"http://www.amazon.com/gp/product/B00A17IAO0/ref=as_li_qf_sp_asin_tl?ie=UTF8&camp=1789&creative=9325&creativeASIN=B00A17IAO0&linkCode=as2&tag=quant08-20\">Up by Jawbone</a>.  UP by Jawbone is a wristband and app that tracks how you sleep, move and eat and then helps you use that information to feel your best.
   * @param instructionsForCause {String} Example: <a href=\"http://www.amazon.com/gp/product/B00A17IAO0/ref=as_li_qf_sp_asin_tl?ie=UTF8&camp=1789&creative=9325&creativeASIN=B00A17IAO0&linkCode=as2&tag=quant08-20\">Obtain Up by Jawbone</a> and use it to record your Sleep Quality. Once you have a <a href=\"http://www.amazon.com/gp/product/B00A17IAO0/ref=as_li_qf_sp_asin_tl?ie=UTF8&camp=1789&creative=9325&creativeASIN=B00A17IAO0&linkCode=as2&tag=quant08-20\">Up by Jawbone</a> account, <a href=\"https://app.quantimo.do/ionic/Modo/www/#/app/import\">connect your  Up by Jawbone account at QuantiModo</a> to automatically import and analyze your data.
   * @param dataSourcesParagraphForEffect {String} Example: Overall Mood data was primarily collected using <a href=\"https://quantimo.do\">QuantiModo</a>.  <a href=\"https://quantimo.do\">QuantiModo</a> is a Chrome extension, Android app, iOS app, and web app that allows you to easily track mood, symptoms, or any outcome you want to optimize in a fraction of a second.  You can also import your data from over 30 other apps and devices like Fitbit, Rescuetime, Jawbone Up, Withings, Facebook, Github, Google Calendar, Runkeeper, MoodPanda, Slice, Google Fit, and more.  <a href=\"https://quantimo.do\">QuantiModo</a> then analyzes your data to identify which hidden factors are most likely to be influencing your mood or symptoms and their optimal daily values.
   * @param instructionsForEffect {String} Example: <a href=\"https://quantimo.do\">Obtain QuantiModo</a> and use it to record your Overall Mood. Once you have a <a href=\"https://quantimo.do\">QuantiModo</a> account, <a href=\"https://app.quantimo.do/ionic/Modo/www/#/app/import\">connect your  QuantiModo account at QuantiModo</a> to automatically import and analyze your data.
   * @param dataAnalysis {String} Example: It was assumed that 0 hours would pass before a change in Sleep Quality would produce an observable change in Overall Mood.  It was assumed that Sleep Quality could produce an observable change in Overall Mood for as much as 7 days after the stimulus event.  
   * @param studyResults {String} Example: This analysis suggests that higher Sleep Quality (Sleep) generally predicts higher Overall Mood (p = 0).  Overall Mood is, on average, 17%  higher after around 4.14 Sleep Quality.  After an onset delay of 168 hours, Overall Mood is, on average, 11%  lower than its average over the 168 hours following around 3.03 Sleep Quality.  298 data points were used in this analysis.  The value for Sleep Quality changed 164 times, effectively running 82 separate natural experiments.  The top quartile outcome values are preceded by an average 4.14 /5 of Sleep Quality.  The bottom quartile outcome values are preceded by an average 3.03 /5 of Sleep Quality.  Forward Pearson Correlation Coefficient was 0.538 (p=0, 95% CI 0.395 to 0.681 onset delay = 0 hours, duration of action = 168 hours) .  The Reverse Pearson Correlation Coefficient was 0 (P=0, 95% CI -0.143 to 0.143, onset delay = -0 hours, duration of action = -168 hours). When the Sleep Quality value is closer to 4.14 /5 than 3.03 /5, the Overall Mood value which follows is, on average, 17%  percent higher than its typical value.  When the Sleep Quality value is closer to 3.03 /5 than 4.14 /5, the Overall Mood value which follows is 0% lower than its typical value.  Overall Mood is 3.55/5 (15% higher) on average after days with around 4.19/5 Sleep Quality  Overall Mood is 2.65/5 (14% lower) on average after days with around 1.97/5 Sleep Quality
   * @param studyLimitations {String} Example: As with any human experiment, it was impossible to control for all potentially confounding variables.                           Correlation does not necessarily imply correlation.  We can never know for sure if one factor is definitely the cause of an outcome.               However, lack of correlation definitely implies the lack of a causal relationship.  Hence, we can with great              confidence rule out non-existent relationships. For instance, if we discover no relationship between mood             and an antidepressant this information is just as or even more valuable than the discovery that there is a relationship.              <br>             <br>                         We can also take advantage of several characteristics of time series data from many subjects  to infer the likelihood of a causal relationship if we do find a correlational relationship.              The criteria for causation are a group of minimal conditions necessary to provide adequate evidence of a causal relationship between an incidence and a possible consequence.             The list of the criteria is as follows:             <br>             1. Strength (effect size): A small association does not mean that there is not a causal effect, though the larger the association, the more likely that it is causal.             <br>             2. Consistency (reproducibility): Consistent findings observed by different persons in different places with different samples strengthens the likelihood of an effect.             <br>             3. Specificity: Causation is likely if a very specific population at a specific site and disease with no other likely explanation. The more specific an association between a factor and an effect is, the bigger the probability of a causal relationship.             <br>             4. Temporality: The effect has to occur after the cause (and if there is an expected delay between the cause and expected effect, then the effect must occur after that delay).             <br>             5. Biological gradient: Greater exposure should generally lead to greater incidence of the effect. However, in some cases, the mere presence of the factor can trigger the effect. In other cases, an inverse proportion is observed: greater exposure leads to lower incidence.             <br>             6. Plausibility: A plausible mechanism between cause and effect is helpful.             <br>             7. Coherence: Coherence between epidemiological and laboratory findings increases the likelihood of an effect.             <br>             8. Experiment: \"Occasionally it is possible to appeal to experimental evidence\".             <br>             9. Analogy: The effect of similar factors may be considered.             <br>             <br>                            The confidence in a causal relationship is bolstered by the fact that time-precedence was taken into account in all calculations. Furthermore, in accordance with the law of large numbers (LLN), the predictive power and accuracy of these results will continually grow over time.  298 paired data points were used in this analysis.   Assuming that the relationship is merely coincidental, as the participant independently modifies their Sleep Quality values, the observed strength of the relationship will decline until it is below the threshold of significance.  To it another way, in the case that we do find a spurious correlation, suggesting that banana intake improves mood for instance,             one will likely increase their banana intake.  Due to the fact that this correlation is spurious, it is unlikely             that you will see a continued and persistent corresponding increase in mood.  So over time, the spurious correlation will             naturally dissipate.Furthermore, it will be very enlightening to aggregate this data with the data from other participants  with similar genetic, diseasomic, environmentomic, and demographic profiles.
   * @param onsetDelay {Number} Example: 0
   * @param onsetDelayInHours {Number} Example: 0
   * @param predictorMinimumAllowedValue {Number} Example: 30
   * @param predictorMaximumAllowedValue {Number} Example: 200
   * @param reversePearsonCorrelationCoefficient {Number} Example: 0.01377184270977
   * @param predictorDataSources {String} Example: RescueTime
   */
  var exports = function(causeVariableName, effectVariableName, averageDailyHighCause, averageDailyLowCause, averageEffect, averageEffectFollowingHighCause, averageEffectFollowingLowCause, averageForwardPearsonCorrelationOverOnsetDelays, averageReversePearsonCorrelationOverOnsetDelays, causeChanges, causeVariableId, confidenceInterval, createdAt, criticalTValue, durationOfAction, effectChanges, effectVariableId, experimentEndTime, experimentStartTime, correlationCoefficient, forwardSpearmanCorrelationCoefficient, numberOfPairs, onsetDelayWithStrongestPearsonCorrelation, optimalPearsonProduct, pearsonCorrelationWithNoOnsetDelay, predictivePearsonCorrelation, predictsHighEffectChange, predictsLowEffectChange, qmScore, statisticalSignificance, strongestPearsonCorrelationCoefficient, tValue, updatedAt, userId, valuePredictingHighOutcome, valuePredictingLowOutcome, causeVariableCombinationOperation, causeVariableDefaultUnitId, causeVariableImageUrl, causeVariableIonIcon, causeVariableMostCommonConnectorId, causeVariableCategoryId, effectVariableCombinationOperation, effectVariableCommonAlias, effectVariableDefaultUnitId, effectVariableImageUrl, effectVariableIonIcon, effectVariableMostCommonConnectorId, effectVariableCategoryId, timestamp, userVote, causeUserVariableShareUserMeasurements, effectUserVariableShareUserMeasurements, predictorFillingValue, outcomeFillingValue, averageVote, durationOfActionInHours, onsetDelayWithStrongestPearsonCorrelationInHours, effectVariableCategoryName, causeVariableCategoryName, direction, causeVariableDefaultUnitAbbreviatedName, effectVariableDefaultUnitAbbreviatedName, causeVariableDefaultUnitName, effectVariableDefaultUnitName, shareUserMeasurements, effectUnit, significanceExplanation, significantDifference, effectSize, predictsHighEffectChangeSentenceFragment, predictsLowEffectChangeSentenceFragment, valuePredictingHighOutcomeExplanation, averageEffectFollowingHighCauseExplanation, averageEffectFollowingLowCauseExplanation, valuePredictingLowOutcomeExplanation, strengthLevel, confidenceLevel, predictivePearsonCorrelationCoefficient, predictorExplanation, studyTitle, studyAbstract, studyLinkStatic, studyLinkDynamic, studyLinkFacebook, studyLinkGoogle, studyLinkTwitter, studyLinkEmail, gaugeImage, gaugeImageSquare, imageUrl, studyDesign, studyObjective, dataSources, dataSourcesParagraphForCause, instructionsForCause, dataSourcesParagraphForEffect, instructionsForEffect, dataAnalysis, studyResults, studyLimitations, onsetDelay, onsetDelayInHours, predictorMinimumAllowedValue, predictorMaximumAllowedValue, reversePearsonCorrelationCoefficient, predictorDataSources) {
    var _this = this;

    _this['causeVariableName'] = causeVariableName;
    _this['effectVariableName'] = effectVariableName;
    _this['averageDailyHighCause'] = averageDailyHighCause;
    _this['averageDailyLowCause'] = averageDailyLowCause;
    _this['averageEffect'] = averageEffect;
    _this['averageEffectFollowingHighCause'] = averageEffectFollowingHighCause;
    _this['averageEffectFollowingLowCause'] = averageEffectFollowingLowCause;
    _this['averageForwardPearsonCorrelationOverOnsetDelays'] = averageForwardPearsonCorrelationOverOnsetDelays;
    _this['averageReversePearsonCorrelationOverOnsetDelays'] = averageReversePearsonCorrelationOverOnsetDelays;
    _this['causeChanges'] = causeChanges;
    _this['causeVariableId'] = causeVariableId;
    _this['confidenceInterval'] = confidenceInterval;
    _this['createdAt'] = createdAt;
    _this['criticalTValue'] = criticalTValue;
    _this['durationOfAction'] = durationOfAction;
    _this['effectChanges'] = effectChanges;
    _this['effectVariableId'] = effectVariableId;
    _this['experimentEndTime'] = experimentEndTime;
    _this['experimentStartTime'] = experimentStartTime;
    _this['correlationCoefficient'] = correlationCoefficient;
    _this['forwardSpearmanCorrelationCoefficient'] = forwardSpearmanCorrelationCoefficient;
    _this['numberOfPairs'] = numberOfPairs;
    _this['onsetDelayWithStrongestPearsonCorrelation'] = onsetDelayWithStrongestPearsonCorrelation;
    _this['optimalPearsonProduct'] = optimalPearsonProduct;
    _this['pearsonCorrelationWithNoOnsetDelay'] = pearsonCorrelationWithNoOnsetDelay;
    _this['predictivePearsonCorrelation'] = predictivePearsonCorrelation;
    _this['predictsHighEffectChange'] = predictsHighEffectChange;
    _this['predictsLowEffectChange'] = predictsLowEffectChange;
    _this['qmScore'] = qmScore;
    _this['statisticalSignificance'] = statisticalSignificance;
    _this['strongestPearsonCorrelationCoefficient'] = strongestPearsonCorrelationCoefficient;
    _this['tValue'] = tValue;
    _this['updatedAt'] = updatedAt;
    _this['userId'] = userId;
    _this['valuePredictingHighOutcome'] = valuePredictingHighOutcome;
    _this['valuePredictingLowOutcome'] = valuePredictingLowOutcome;
    _this['causeVariableCombinationOperation'] = causeVariableCombinationOperation;
    _this['causeVariableDefaultUnitId'] = causeVariableDefaultUnitId;
    _this['causeVariableImageUrl'] = causeVariableImageUrl;
    _this['causeVariableIonIcon'] = causeVariableIonIcon;
    _this['causeVariableMostCommonConnectorId'] = causeVariableMostCommonConnectorId;
    _this['causeVariableCategoryId'] = causeVariableCategoryId;
    _this['effectVariableCombinationOperation'] = effectVariableCombinationOperation;
    _this['effectVariableCommonAlias'] = effectVariableCommonAlias;
    _this['effectVariableDefaultUnitId'] = effectVariableDefaultUnitId;
    _this['effectVariableImageUrl'] = effectVariableImageUrl;
    _this['effectVariableIonIcon'] = effectVariableIonIcon;
    _this['effectVariableMostCommonConnectorId'] = effectVariableMostCommonConnectorId;
    _this['effectVariableCategoryId'] = effectVariableCategoryId;
    _this['timestamp'] = timestamp;
    _this['userVote'] = userVote;
    _this['causeUserVariableShareUserMeasurements'] = causeUserVariableShareUserMeasurements;
    _this['effectUserVariableShareUserMeasurements'] = effectUserVariableShareUserMeasurements;
    _this['predictorFillingValue'] = predictorFillingValue;
    _this['outcomeFillingValue'] = outcomeFillingValue;
    _this['averageVote'] = averageVote;
    _this['durationOfActionInHours'] = durationOfActionInHours;
    _this['onsetDelayWithStrongestPearsonCorrelationInHours'] = onsetDelayWithStrongestPearsonCorrelationInHours;
    _this['effectVariableCategoryName'] = effectVariableCategoryName;
    _this['causeVariableCategoryName'] = causeVariableCategoryName;
    _this['direction'] = direction;
    _this['causeVariableDefaultUnitAbbreviatedName'] = causeVariableDefaultUnitAbbreviatedName;
    _this['effectVariableDefaultUnitAbbreviatedName'] = effectVariableDefaultUnitAbbreviatedName;
    _this['causeVariableDefaultUnitName'] = causeVariableDefaultUnitName;
    _this['effectVariableDefaultUnitName'] = effectVariableDefaultUnitName;
    _this['shareUserMeasurements'] = shareUserMeasurements;
    _this['effectUnit'] = effectUnit;
    _this['significanceExplanation'] = significanceExplanation;
    _this['significantDifference'] = significantDifference;
    _this['effectSize'] = effectSize;
    _this['predictsHighEffectChangeSentenceFragment'] = predictsHighEffectChangeSentenceFragment;
    _this['predictsLowEffectChangeSentenceFragment'] = predictsLowEffectChangeSentenceFragment;
    _this['valuePredictingHighOutcomeExplanation'] = valuePredictingHighOutcomeExplanation;
    _this['averageEffectFollowingHighCauseExplanation'] = averageEffectFollowingHighCauseExplanation;
    _this['averageEffectFollowingLowCauseExplanation'] = averageEffectFollowingLowCauseExplanation;
    _this['valuePredictingLowOutcomeExplanation'] = valuePredictingLowOutcomeExplanation;
    _this['strengthLevel'] = strengthLevel;
    _this['confidenceLevel'] = confidenceLevel;
    _this['predictivePearsonCorrelationCoefficient'] = predictivePearsonCorrelationCoefficient;
    _this['predictorExplanation'] = predictorExplanation;
    _this['studyTitle'] = studyTitle;
    _this['studyAbstract'] = studyAbstract;
    _this['studyLinkStatic'] = studyLinkStatic;
    _this['studyLinkDynamic'] = studyLinkDynamic;
    _this['studyLinkFacebook'] = studyLinkFacebook;
    _this['studyLinkGoogle'] = studyLinkGoogle;
    _this['studyLinkTwitter'] = studyLinkTwitter;
    _this['studyLinkEmail'] = studyLinkEmail;
    _this['gaugeImage'] = gaugeImage;
    _this['gaugeImageSquare'] = gaugeImageSquare;
    _this['imageUrl'] = imageUrl;
    _this['studyDesign'] = studyDesign;
    _this['studyObjective'] = studyObjective;
    _this['dataSources'] = dataSources;
    _this['dataSourcesParagraphForCause'] = dataSourcesParagraphForCause;
    _this['instructionsForCause'] = instructionsForCause;
    _this['dataSourcesParagraphForEffect'] = dataSourcesParagraphForEffect;
    _this['instructionsForEffect'] = instructionsForEffect;
    _this['dataAnalysis'] = dataAnalysis;
    _this['studyResults'] = studyResults;
    _this['studyLimitations'] = studyLimitations;
    _this['onsetDelay'] = onsetDelay;
    _this['onsetDelayInHours'] = onsetDelayInHours;
    _this['predictorMinimumAllowedValue'] = predictorMinimumAllowedValue;
    _this['predictorMaximumAllowedValue'] = predictorMaximumAllowedValue;
    _this['reversePearsonCorrelationCoefficient'] = reversePearsonCorrelationCoefficient;
    _this['predictorDataSources'] = predictorDataSources;
  };

  /**
   * Constructs a <code>Correlation</code> from a plain JavaScript object, optionally creating a new instance.
   * Copies all relevant properties from <code>data</code> to <code>obj</code> if supplied or a new instance if not.
   * @param {Object} data The plain JavaScript object bearing properties of interest.
   * @param {module:model/Correlation} obj Optional instance to populate.
   * @return {module:model/Correlation} The populated <code>Correlation</code> instance.
   */
  exports.constructFromObject = function(data, obj) {
    if (data) {
      obj = obj || new exports();

      if (data.hasOwnProperty('causeVariableName')) {
        obj['causeVariableName'] = ApiClient.convertToType(data['causeVariableName'], 'String');
      }
      if (data.hasOwnProperty('effectVariableName')) {
        obj['effectVariableName'] = ApiClient.convertToType(data['effectVariableName'], 'String');
      }
      if (data.hasOwnProperty('averageDailyHighCause')) {
        obj['averageDailyHighCause'] = ApiClient.convertToType(data['averageDailyHighCause'], 'Number');
      }
      if (data.hasOwnProperty('averageDailyLowCause')) {
        obj['averageDailyLowCause'] = ApiClient.convertToType(data['averageDailyLowCause'], 'Number');
      }
      if (data.hasOwnProperty('averageEffect')) {
        obj['averageEffect'] = ApiClient.convertToType(data['averageEffect'], 'Number');
      }
      if (data.hasOwnProperty('averageEffectFollowingHighCause')) {
        obj['averageEffectFollowingHighCause'] = ApiClient.convertToType(data['averageEffectFollowingHighCause'], 'Number');
      }
      if (data.hasOwnProperty('averageEffectFollowingLowCause')) {
        obj['averageEffectFollowingLowCause'] = ApiClient.convertToType(data['averageEffectFollowingLowCause'], 'Number');
      }
      if (data.hasOwnProperty('averageForwardPearsonCorrelationOverOnsetDelays')) {
        obj['averageForwardPearsonCorrelationOverOnsetDelays'] = ApiClient.convertToType(data['averageForwardPearsonCorrelationOverOnsetDelays'], 'Number');
      }
      if (data.hasOwnProperty('averageReversePearsonCorrelationOverOnsetDelays')) {
        obj['averageReversePearsonCorrelationOverOnsetDelays'] = ApiClient.convertToType(data['averageReversePearsonCorrelationOverOnsetDelays'], 'Number');
      }
      if (data.hasOwnProperty('causeChanges')) {
        obj['causeChanges'] = ApiClient.convertToType(data['causeChanges'], 'Number');
      }
      if (data.hasOwnProperty('causeVariableId')) {
        obj['causeVariableId'] = ApiClient.convertToType(data['causeVariableId'], 'Number');
      }
      if (data.hasOwnProperty('confidenceInterval')) {
        obj['confidenceInterval'] = ApiClient.convertToType(data['confidenceInterval'], 'Number');
      }
      if (data.hasOwnProperty('createdAt')) {
        obj['createdAt'] = ApiClient.convertToType(data['createdAt'], 'Date');
      }
      if (data.hasOwnProperty('criticalTValue')) {
        obj['criticalTValue'] = ApiClient.convertToType(data['criticalTValue'], 'Number');
      }
      if (data.hasOwnProperty('durationOfAction')) {
        obj['durationOfAction'] = ApiClient.convertToType(data['durationOfAction'], 'Number');
      }
      if (data.hasOwnProperty('effectChanges')) {
        obj['effectChanges'] = ApiClient.convertToType(data['effectChanges'], 'Number');
      }
      if (data.hasOwnProperty('effectVariableId')) {
        obj['effectVariableId'] = ApiClient.convertToType(data['effectVariableId'], 'Number');
      }
      if (data.hasOwnProperty('experimentEndTime')) {
        obj['experimentEndTime'] = ApiClient.convertToType(data['experimentEndTime'], 'Date');
      }
      if (data.hasOwnProperty('experimentStartTime')) {
        obj['experimentStartTime'] = ApiClient.convertToType(data['experimentStartTime'], 'Date');
      }
      if (data.hasOwnProperty('correlationCoefficient')) {
        obj['correlationCoefficient'] = ApiClient.convertToType(data['correlationCoefficient'], 'Number');
      }
      if (data.hasOwnProperty('forwardSpearmanCorrelationCoefficient')) {
        obj['forwardSpearmanCorrelationCoefficient'] = ApiClient.convertToType(data['forwardSpearmanCorrelationCoefficient'], 'Number');
      }
      if (data.hasOwnProperty('numberOfPairs')) {
        obj['numberOfPairs'] = ApiClient.convertToType(data['numberOfPairs'], 'Number');
      }
      if (data.hasOwnProperty('onsetDelayWithStrongestPearsonCorrelation')) {
        obj['onsetDelayWithStrongestPearsonCorrelation'] = ApiClient.convertToType(data['onsetDelayWithStrongestPearsonCorrelation'], 'Number');
      }
      if (data.hasOwnProperty('optimalPearsonProduct')) {
        obj['optimalPearsonProduct'] = ApiClient.convertToType(data['optimalPearsonProduct'], 'Number');
      }
      if (data.hasOwnProperty('pearsonCorrelationWithNoOnsetDelay')) {
        obj['pearsonCorrelationWithNoOnsetDelay'] = ApiClient.convertToType(data['pearsonCorrelationWithNoOnsetDelay'], 'Number');
      }
      if (data.hasOwnProperty('predictivePearsonCorrelation')) {
        obj['predictivePearsonCorrelation'] = ApiClient.convertToType(data['predictivePearsonCorrelation'], 'Number');
      }
      if (data.hasOwnProperty('predictsHighEffectChange')) {
        obj['predictsHighEffectChange'] = ApiClient.convertToType(data['predictsHighEffectChange'], 'Number');
      }
      if (data.hasOwnProperty('predictsLowEffectChange')) {
        obj['predictsLowEffectChange'] = ApiClient.convertToType(data['predictsLowEffectChange'], 'Number');
      }
      if (data.hasOwnProperty('qmScore')) {
        obj['qmScore'] = ApiClient.convertToType(data['qmScore'], 'Number');
      }
      if (data.hasOwnProperty('statisticalSignificance')) {
        obj['statisticalSignificance'] = ApiClient.convertToType(data['statisticalSignificance'], 'Number');
      }
      if (data.hasOwnProperty('strongestPearsonCorrelationCoefficient')) {
        obj['strongestPearsonCorrelationCoefficient'] = ApiClient.convertToType(data['strongestPearsonCorrelationCoefficient'], 'Number');
      }
      if (data.hasOwnProperty('tValue')) {
        obj['tValue'] = ApiClient.convertToType(data['tValue'], 'Number');
      }
      if (data.hasOwnProperty('updatedAt')) {
        obj['updatedAt'] = ApiClient.convertToType(data['updatedAt'], 'Date');
      }
      if (data.hasOwnProperty('userId')) {
        obj['userId'] = ApiClient.convertToType(data['userId'], 'Number');
      }
      if (data.hasOwnProperty('valuePredictingHighOutcome')) {
        obj['valuePredictingHighOutcome'] = ApiClient.convertToType(data['valuePredictingHighOutcome'], 'Number');
      }
      if (data.hasOwnProperty('valuePredictingLowOutcome')) {
        obj['valuePredictingLowOutcome'] = ApiClient.convertToType(data['valuePredictingLowOutcome'], 'Number');
      }
      if (data.hasOwnProperty('causeVariableCombinationOperation')) {
        obj['causeVariableCombinationOperation'] = ApiClient.convertToType(data['causeVariableCombinationOperation'], 'String');
      }
      if (data.hasOwnProperty('causeVariableDefaultUnitId')) {
        obj['causeVariableDefaultUnitId'] = ApiClient.convertToType(data['causeVariableDefaultUnitId'], 'Number');
      }
      if (data.hasOwnProperty('causeVariableImageUrl')) {
        obj['causeVariableImageUrl'] = ApiClient.convertToType(data['causeVariableImageUrl'], 'String');
      }
      if (data.hasOwnProperty('causeVariableIonIcon')) {
        obj['causeVariableIonIcon'] = ApiClient.convertToType(data['causeVariableIonIcon'], 'String');
      }
      if (data.hasOwnProperty('causeVariableMostCommonConnectorId')) {
        obj['causeVariableMostCommonConnectorId'] = ApiClient.convertToType(data['causeVariableMostCommonConnectorId'], 'Number');
      }
      if (data.hasOwnProperty('causeVariableCategoryId')) {
        obj['causeVariableCategoryId'] = ApiClient.convertToType(data['causeVariableCategoryId'], 'Number');
      }
      if (data.hasOwnProperty('effectVariableCombinationOperation')) {
        obj['effectVariableCombinationOperation'] = ApiClient.convertToType(data['effectVariableCombinationOperation'], 'String');
      }
      if (data.hasOwnProperty('effectVariableCommonAlias')) {
        obj['effectVariableCommonAlias'] = ApiClient.convertToType(data['effectVariableCommonAlias'], 'String');
      }
      if (data.hasOwnProperty('effectVariableDefaultUnitId')) {
        obj['effectVariableDefaultUnitId'] = ApiClient.convertToType(data['effectVariableDefaultUnitId'], 'Number');
      }
      if (data.hasOwnProperty('effectVariableImageUrl')) {
        obj['effectVariableImageUrl'] = ApiClient.convertToType(data['effectVariableImageUrl'], 'String');
      }
      if (data.hasOwnProperty('effectVariableIonIcon')) {
        obj['effectVariableIonIcon'] = ApiClient.convertToType(data['effectVariableIonIcon'], 'String');
      }
      if (data.hasOwnProperty('effectVariableMostCommonConnectorId')) {
        obj['effectVariableMostCommonConnectorId'] = ApiClient.convertToType(data['effectVariableMostCommonConnectorId'], 'Number');
      }
      if (data.hasOwnProperty('effectVariableCategoryId')) {
        obj['effectVariableCategoryId'] = ApiClient.convertToType(data['effectVariableCategoryId'], 'Number');
      }
      if (data.hasOwnProperty('timestamp')) {
        obj['timestamp'] = ApiClient.convertToType(data['timestamp'], 'Number');
      }
      if (data.hasOwnProperty('userVote')) {
        obj['userVote'] = ApiClient.convertToType(data['userVote'], 'Number');
      }
      if (data.hasOwnProperty('causeUserVariableShareUserMeasurements')) {
        obj['causeUserVariableShareUserMeasurements'] = ApiClient.convertToType(data['causeUserVariableShareUserMeasurements'], 'Number');
      }
      if (data.hasOwnProperty('effectUserVariableShareUserMeasurements')) {
        obj['effectUserVariableShareUserMeasurements'] = ApiClient.convertToType(data['effectUserVariableShareUserMeasurements'], 'Number');
      }
      if (data.hasOwnProperty('predictorFillingValue')) {
        obj['predictorFillingValue'] = ApiClient.convertToType(data['predictorFillingValue'], 'Number');
      }
      if (data.hasOwnProperty('outcomeFillingValue')) {
        obj['outcomeFillingValue'] = ApiClient.convertToType(data['outcomeFillingValue'], 'Number');
      }
      if (data.hasOwnProperty('averageVote')) {
        obj['averageVote'] = ApiClient.convertToType(data['averageVote'], 'String');
      }
      if (data.hasOwnProperty('durationOfActionInHours')) {
        obj['durationOfActionInHours'] = ApiClient.convertToType(data['durationOfActionInHours'], 'Number');
      }
      if (data.hasOwnProperty('onsetDelayWithStrongestPearsonCorrelationInHours')) {
        obj['onsetDelayWithStrongestPearsonCorrelationInHours'] = ApiClient.convertToType(data['onsetDelayWithStrongestPearsonCorrelationInHours'], 'Number');
      }
      if (data.hasOwnProperty('effectVariableCategoryName')) {
        obj['effectVariableCategoryName'] = ApiClient.convertToType(data['effectVariableCategoryName'], 'String');
      }
      if (data.hasOwnProperty('causeVariableCategoryName')) {
        obj['causeVariableCategoryName'] = ApiClient.convertToType(data['causeVariableCategoryName'], 'String');
      }
      if (data.hasOwnProperty('direction')) {
        obj['direction'] = ApiClient.convertToType(data['direction'], 'String');
      }
      if (data.hasOwnProperty('causeVariableDefaultUnitAbbreviatedName')) {
        obj['causeVariableDefaultUnitAbbreviatedName'] = ApiClient.convertToType(data['causeVariableDefaultUnitAbbreviatedName'], 'String');
      }
      if (data.hasOwnProperty('effectVariableDefaultUnitAbbreviatedName')) {
        obj['effectVariableDefaultUnitAbbreviatedName'] = ApiClient.convertToType(data['effectVariableDefaultUnitAbbreviatedName'], 'String');
      }
      if (data.hasOwnProperty('causeVariableDefaultUnitName')) {
        obj['causeVariableDefaultUnitName'] = ApiClient.convertToType(data['causeVariableDefaultUnitName'], 'String');
      }
      if (data.hasOwnProperty('effectVariableDefaultUnitName')) {
        obj['effectVariableDefaultUnitName'] = ApiClient.convertToType(data['effectVariableDefaultUnitName'], 'String');
      }
      if (data.hasOwnProperty('shareUserMeasurements')) {
        obj['shareUserMeasurements'] = ApiClient.convertToType(data['shareUserMeasurements'], 'Boolean');
      }
      if (data.hasOwnProperty('effectUnit')) {
        obj['effectUnit'] = ApiClient.convertToType(data['effectUnit'], 'String');
      }
      if (data.hasOwnProperty('significanceExplanation')) {
        obj['significanceExplanation'] = ApiClient.convertToType(data['significanceExplanation'], 'String');
      }
      if (data.hasOwnProperty('significantDifference')) {
        obj['significantDifference'] = ApiClient.convertToType(data['significantDifference'], 'Boolean');
      }
      if (data.hasOwnProperty('effectSize')) {
        obj['effectSize'] = ApiClient.convertToType(data['effectSize'], 'String');
      }
      if (data.hasOwnProperty('predictsHighEffectChangeSentenceFragment')) {
        obj['predictsHighEffectChangeSentenceFragment'] = ApiClient.convertToType(data['predictsHighEffectChangeSentenceFragment'], 'String');
      }
      if (data.hasOwnProperty('predictsLowEffectChangeSentenceFragment')) {
        obj['predictsLowEffectChangeSentenceFragment'] = ApiClient.convertToType(data['predictsLowEffectChangeSentenceFragment'], 'String');
      }
      if (data.hasOwnProperty('valuePredictingHighOutcomeExplanation')) {
        obj['valuePredictingHighOutcomeExplanation'] = ApiClient.convertToType(data['valuePredictingHighOutcomeExplanation'], 'String');
      }
      if (data.hasOwnProperty('averageEffectFollowingHighCauseExplanation')) {
        obj['averageEffectFollowingHighCauseExplanation'] = ApiClient.convertToType(data['averageEffectFollowingHighCauseExplanation'], 'String');
      }
      if (data.hasOwnProperty('averageEffectFollowingLowCauseExplanation')) {
        obj['averageEffectFollowingLowCauseExplanation'] = ApiClient.convertToType(data['averageEffectFollowingLowCauseExplanation'], 'String');
      }
      if (data.hasOwnProperty('valuePredictingLowOutcomeExplanation')) {
        obj['valuePredictingLowOutcomeExplanation'] = ApiClient.convertToType(data['valuePredictingLowOutcomeExplanation'], 'String');
      }
      if (data.hasOwnProperty('strengthLevel')) {
        obj['strengthLevel'] = ApiClient.convertToType(data['strengthLevel'], 'String');
      }
      if (data.hasOwnProperty('confidenceLevel')) {
        obj['confidenceLevel'] = ApiClient.convertToType(data['confidenceLevel'], 'String');
      }
      if (data.hasOwnProperty('predictivePearsonCorrelationCoefficient')) {
        obj['predictivePearsonCorrelationCoefficient'] = ApiClient.convertToType(data['predictivePearsonCorrelationCoefficient'], 'Number');
      }
      if (data.hasOwnProperty('predictorExplanation')) {
        obj['predictorExplanation'] = ApiClient.convertToType(data['predictorExplanation'], 'String');
      }
      if (data.hasOwnProperty('studyTitle')) {
        obj['studyTitle'] = ApiClient.convertToType(data['studyTitle'], 'String');
      }
      if (data.hasOwnProperty('studyAbstract')) {
        obj['studyAbstract'] = ApiClient.convertToType(data['studyAbstract'], 'String');
      }
      if (data.hasOwnProperty('studyLinkStatic')) {
        obj['studyLinkStatic'] = ApiClient.convertToType(data['studyLinkStatic'], 'String');
      }
      if (data.hasOwnProperty('studyLinkDynamic')) {
        obj['studyLinkDynamic'] = ApiClient.convertToType(data['studyLinkDynamic'], 'String');
      }
      if (data.hasOwnProperty('studyLinkFacebook')) {
        obj['studyLinkFacebook'] = ApiClient.convertToType(data['studyLinkFacebook'], 'String');
      }
      if (data.hasOwnProperty('studyLinkGoogle')) {
        obj['studyLinkGoogle'] = ApiClient.convertToType(data['studyLinkGoogle'], 'String');
      }
      if (data.hasOwnProperty('studyLinkTwitter')) {
        obj['studyLinkTwitter'] = ApiClient.convertToType(data['studyLinkTwitter'], 'String');
      }
      if (data.hasOwnProperty('studyLinkEmail')) {
        obj['studyLinkEmail'] = ApiClient.convertToType(data['studyLinkEmail'], 'String');
      }
      if (data.hasOwnProperty('gaugeImage')) {
        obj['gaugeImage'] = ApiClient.convertToType(data['gaugeImage'], 'String');
      }
      if (data.hasOwnProperty('gaugeImageSquare')) {
        obj['gaugeImageSquare'] = ApiClient.convertToType(data['gaugeImageSquare'], 'String');
      }
      if (data.hasOwnProperty('imageUrl')) {
        obj['imageUrl'] = ApiClient.convertToType(data['imageUrl'], 'String');
      }
      if (data.hasOwnProperty('studyDesign')) {
        obj['studyDesign'] = ApiClient.convertToType(data['studyDesign'], 'String');
      }
      if (data.hasOwnProperty('studyObjective')) {
        obj['studyObjective'] = ApiClient.convertToType(data['studyObjective'], 'String');
      }
      if (data.hasOwnProperty('dataSources')) {
        obj['dataSources'] = ApiClient.convertToType(data['dataSources'], 'String');
      }
      if (data.hasOwnProperty('dataSourcesParagraphForCause')) {
        obj['dataSourcesParagraphForCause'] = ApiClient.convertToType(data['dataSourcesParagraphForCause'], 'String');
      }
      if (data.hasOwnProperty('instructionsForCause')) {
        obj['instructionsForCause'] = ApiClient.convertToType(data['instructionsForCause'], 'String');
      }
      if (data.hasOwnProperty('dataSourcesParagraphForEffect')) {
        obj['dataSourcesParagraphForEffect'] = ApiClient.convertToType(data['dataSourcesParagraphForEffect'], 'String');
      }
      if (data.hasOwnProperty('instructionsForEffect')) {
        obj['instructionsForEffect'] = ApiClient.convertToType(data['instructionsForEffect'], 'String');
      }
      if (data.hasOwnProperty('dataAnalysis')) {
        obj['dataAnalysis'] = ApiClient.convertToType(data['dataAnalysis'], 'String');
      }
      if (data.hasOwnProperty('studyResults')) {
        obj['studyResults'] = ApiClient.convertToType(data['studyResults'], 'String');
      }
      if (data.hasOwnProperty('studyLimitations')) {
        obj['studyLimitations'] = ApiClient.convertToType(data['studyLimitations'], 'String');
      }
      if (data.hasOwnProperty('onsetDelay')) {
        obj['onsetDelay'] = ApiClient.convertToType(data['onsetDelay'], 'Number');
      }
      if (data.hasOwnProperty('onsetDelayInHours')) {
        obj['onsetDelayInHours'] = ApiClient.convertToType(data['onsetDelayInHours'], 'Number');
      }
      if (data.hasOwnProperty('predictorMinimumAllowedValue')) {
        obj['predictorMinimumAllowedValue'] = ApiClient.convertToType(data['predictorMinimumAllowedValue'], 'Number');
      }
      if (data.hasOwnProperty('predictorMaximumAllowedValue')) {
        obj['predictorMaximumAllowedValue'] = ApiClient.convertToType(data['predictorMaximumAllowedValue'], 'Number');
      }
      if (data.hasOwnProperty('reversePearsonCorrelationCoefficient')) {
        obj['reversePearsonCorrelationCoefficient'] = ApiClient.convertToType(data['reversePearsonCorrelationCoefficient'], 'Number');
      }
      if (data.hasOwnProperty('predictorDataSources')) {
        obj['predictorDataSources'] = ApiClient.convertToType(data['predictorDataSources'], 'String');
      }
    }
    return obj;
  }

  /**
   * Example: Sleep Quality
   * @member {String} causeVariableName
   */
  exports.prototype['causeVariableName'] = undefined;
  /**
   * Example: Overall Mood
   * @member {String} effectVariableName
   */
  exports.prototype['effectVariableName'] = undefined;
  /**
   * Example: 4.19
   * @member {Number} averageDailyHighCause
   */
  exports.prototype['averageDailyHighCause'] = undefined;
  /**
   * Example: 1.97
   * @member {Number} averageDailyLowCause
   */
  exports.prototype['averageDailyLowCause'] = undefined;
  /**
   * Example: 3.0791054117396
   * @member {Number} averageEffect
   */
  exports.prototype['averageEffect'] = undefined;
  /**
   * Example: 3.55
   * @member {Number} averageEffectFollowingHighCause
   */
  exports.prototype['averageEffectFollowingHighCause'] = undefined;
  /**
   * Example: 2.65
   * @member {Number} averageEffectFollowingLowCause
   */
  exports.prototype['averageEffectFollowingLowCause'] = undefined;
  /**
   * Example: 0.396
   * @member {Number} averageForwardPearsonCorrelationOverOnsetDelays
   */
  exports.prototype['averageForwardPearsonCorrelationOverOnsetDelays'] = undefined;
  /**
   * Example: 0.453667
   * @member {Number} averageReversePearsonCorrelationOverOnsetDelays
   */
  exports.prototype['averageReversePearsonCorrelationOverOnsetDelays'] = undefined;
  /**
   * Example: 164
   * @member {Number} causeChanges
   */
  exports.prototype['causeChanges'] = undefined;
  /**
   * Example: 1448
   * @member {Number} causeVariableId
   */
  exports.prototype['causeVariableId'] = undefined;
  /**
   * Example: 0.14344467795996
   * @member {Number} confidenceInterval
   */
  exports.prototype['confidenceInterval'] = undefined;
  /**
   * Example: 2016-12-28 20:47:30
   * @member {Date} createdAt
   */
  exports.prototype['createdAt'] = undefined;
  /**
   * Example: 1.646
   * @member {Number} criticalTValue
   */
  exports.prototype['criticalTValue'] = undefined;
  /**
   * Example: 604800
   * @member {Number} durationOfAction
   */
  exports.prototype['durationOfAction'] = undefined;
  /**
   * Example: 193
   * @member {Number} effectChanges
   */
  exports.prototype['effectChanges'] = undefined;
  /**
   * Example: 1398
   * @member {Number} effectVariableId
   */
  exports.prototype['effectVariableId'] = undefined;
  /**
   * Example: 2014-07-30 12:50:00
   * @member {Date} experimentEndTime
   */
  exports.prototype['experimentEndTime'] = undefined;
  /**
   * Example: 2012-05-06 21:15:00
   * @member {Date} experimentStartTime
   */
  exports.prototype['experimentStartTime'] = undefined;
  /**
   * Example: 0.538
   * @member {Number} correlationCoefficient
   */
  exports.prototype['correlationCoefficient'] = undefined;
  /**
   * Example: 0.528359
   * @member {Number} forwardSpearmanCorrelationCoefficient
   */
  exports.prototype['forwardSpearmanCorrelationCoefficient'] = undefined;
  /**
   * Example: 298
   * @member {Number} numberOfPairs
   */
  exports.prototype['numberOfPairs'] = undefined;
  /**
   * Example: -86400
   * @member {Number} onsetDelayWithStrongestPearsonCorrelation
   */
  exports.prototype['onsetDelayWithStrongestPearsonCorrelation'] = undefined;
  /**
   * Example: 0.68582816186982
   * @member {Number} optimalPearsonProduct
   */
  exports.prototype['optimalPearsonProduct'] = undefined;
  /**
   * Example: 0.477
   * @member {Number} pearsonCorrelationWithNoOnsetDelay
   */
  exports.prototype['pearsonCorrelationWithNoOnsetDelay'] = undefined;
  /**
   * Example: 0.538
   * @member {Number} predictivePearsonCorrelation
   */
  exports.prototype['predictivePearsonCorrelation'] = undefined;
  /**
   * Example: 17
   * @member {Number} predictsHighEffectChange
   */
  exports.prototype['predictsHighEffectChange'] = undefined;
  /**
   * Example: -11
   * @member {Number} predictsLowEffectChange
   */
  exports.prototype['predictsLowEffectChange'] = undefined;
  /**
   * Example: 0.528
   * @member {Number} qmScore
   */
  exports.prototype['qmScore'] = undefined;
  /**
   * Example: 0.9813
   * @member {Number} statisticalSignificance
   */
  exports.prototype['statisticalSignificance'] = undefined;
  /**
   * Example: 0.613
   * @member {Number} strongestPearsonCorrelationCoefficient
   */
  exports.prototype['strongestPearsonCorrelationCoefficient'] = undefined;
  /**
   * Example: 9.6986079652717
   * @member {Number} tValue
   */
  exports.prototype['tValue'] = undefined;
  /**
   * Example: 2017-05-06 15:40:38
   * @member {Date} updatedAt
   */
  exports.prototype['updatedAt'] = undefined;
  /**
   * Example: 230
   * @member {Number} userId
   */
  exports.prototype['userId'] = undefined;
  /**
   * Example: 4.14
   * @member {Number} valuePredictingHighOutcome
   */
  exports.prototype['valuePredictingHighOutcome'] = undefined;
  /**
   * Example: 3.03
   * @member {Number} valuePredictingLowOutcome
   */
  exports.prototype['valuePredictingLowOutcome'] = undefined;
  /**
   * Example: MEAN
   * @member {String} causeVariableCombinationOperation
   */
  exports.prototype['causeVariableCombinationOperation'] = undefined;
  /**
   * Example: 10
   * @member {Number} causeVariableDefaultUnitId
   */
  exports.prototype['causeVariableDefaultUnitId'] = undefined;
  /**
   * Example: https://maxcdn.icons8.com/Color/PNG/96/Household/sleeping_in_bed-96.png
   * @member {String} causeVariableImageUrl
   */
  exports.prototype['causeVariableImageUrl'] = undefined;
  /**
   * Example: ion-ios-cloudy-night-outline
   * @member {String} causeVariableIonIcon
   */
  exports.prototype['causeVariableIonIcon'] = undefined;
  /**
   * Example: 6
   * @member {Number} causeVariableMostCommonConnectorId
   */
  exports.prototype['causeVariableMostCommonConnectorId'] = undefined;
  /**
   * Example: 6
   * @member {Number} causeVariableCategoryId
   */
  exports.prototype['causeVariableCategoryId'] = undefined;
  /**
   * Example: MEAN
   * @member {String} effectVariableCombinationOperation
   */
  exports.prototype['effectVariableCombinationOperation'] = undefined;
  /**
   * Example: Mood_(psychology)
   * @member {String} effectVariableCommonAlias
   */
  exports.prototype['effectVariableCommonAlias'] = undefined;
  /**
   * Example: 10
   * @member {Number} effectVariableDefaultUnitId
   */
  exports.prototype['effectVariableDefaultUnitId'] = undefined;
  /**
   * Example: https://maxcdn.icons8.com/Color/PNG/96/Cinema/theatre_mask-96.png
   * @member {String} effectVariableImageUrl
   */
  exports.prototype['effectVariableImageUrl'] = undefined;
  /**
   * Example: ion-happy-outline
   * @member {String} effectVariableIonIcon
   */
  exports.prototype['effectVariableIonIcon'] = undefined;
  /**
   * Example: 10
   * @member {Number} effectVariableMostCommonConnectorId
   */
  exports.prototype['effectVariableMostCommonConnectorId'] = undefined;
  /**
   * Example: 1
   * @member {Number} effectVariableCategoryId
   */
  exports.prototype['effectVariableCategoryId'] = undefined;
  /**
   * Example: 1494085127
   * @member {Number} timestamp
   */
  exports.prototype['timestamp'] = undefined;
  /**
   * Example: 1
   * @member {Number} userVote
   */
  exports.prototype['userVote'] = undefined;
  /**
   * Example: 1
   * @member {Number} causeUserVariableShareUserMeasurements
   */
  exports.prototype['causeUserVariableShareUserMeasurements'] = undefined;
  /**
   * Example: 1
   * @member {Number} effectUserVariableShareUserMeasurements
   */
  exports.prototype['effectUserVariableShareUserMeasurements'] = undefined;
  /**
   * Example: -1
   * @member {Number} predictorFillingValue
   */
  exports.prototype['predictorFillingValue'] = undefined;
  /**
   * Example: -1
   * @member {Number} outcomeFillingValue
   */
  exports.prototype['outcomeFillingValue'] = undefined;
  /**
   * Example: 0.9855
   * @member {String} averageVote
   */
  exports.prototype['averageVote'] = undefined;
  /**
   * Example: 168
   * @member {Number} durationOfActionInHours
   */
  exports.prototype['durationOfActionInHours'] = undefined;
  /**
   * Example: -24
   * @member {Number} onsetDelayWithStrongestPearsonCorrelationInHours
   */
  exports.prototype['onsetDelayWithStrongestPearsonCorrelationInHours'] = undefined;
  /**
   * Example: Emotions
   * @member {String} effectVariableCategoryName
   */
  exports.prototype['effectVariableCategoryName'] = undefined;
  /**
   * Example: Sleep
   * @member {String} causeVariableCategoryName
   */
  exports.prototype['causeVariableCategoryName'] = undefined;
  /**
   * Example: higher
   * @member {String} direction
   */
  exports.prototype['direction'] = undefined;
  /**
   * Example: /5
   * @member {String} causeVariableDefaultUnitAbbreviatedName
   */
  exports.prototype['causeVariableDefaultUnitAbbreviatedName'] = undefined;
  /**
   * Example: /5
   * @member {String} effectVariableDefaultUnitAbbreviatedName
   */
  exports.prototype['effectVariableDefaultUnitAbbreviatedName'] = undefined;
  /**
   * Example: 1 to 5 Rating
   * @member {String} causeVariableDefaultUnitName
   */
  exports.prototype['causeVariableDefaultUnitName'] = undefined;
  /**
   * Example: 1 to 5 Rating
   * @member {String} effectVariableDefaultUnitName
   */
  exports.prototype['effectVariableDefaultUnitName'] = undefined;
  /**
   * Example: 1
   * @member {Boolean} shareUserMeasurements
   */
  exports.prototype['shareUserMeasurements'] = undefined;
  /**
   * Example: /5
   * @member {String} effectUnit
   */
  exports.prototype['effectUnit'] = undefined;
  /**
   * Example: Using a two-tailed t-test with alpha = 0.05, it was determined that the change in Overall Mood is statistically significant at 95% confidence interval. 
   * @member {String} significanceExplanation
   */
  exports.prototype['significanceExplanation'] = undefined;
  /**
   * Example: 1
   * @member {Boolean} significantDifference
   */
  exports.prototype['significantDifference'] = undefined;
  /**
   * Example: moderately positive
   * @member {String} effectSize
   */
  exports.prototype['effectSize'] = undefined;
  /**
   * Example: , on average, 17% 
   * @member {String} predictsHighEffectChangeSentenceFragment
   */
  exports.prototype['predictsHighEffectChangeSentenceFragment'] = undefined;
  /**
   * Example: , on average, 11% 
   * @member {String} predictsLowEffectChangeSentenceFragment
   */
  exports.prototype['predictsLowEffectChangeSentenceFragment'] = undefined;
  /**
   * Example: Overall Mood, on average, 17% higher after around 4.14/5 Sleep Quality 
   * @member {String} valuePredictingHighOutcomeExplanation
   */
  exports.prototype['valuePredictingHighOutcomeExplanation'] = undefined;
  /**
   * Example: Overall Mood is 3.55/5 (15% higher) on average after days with around 4.19/5 Sleep Quality
   * @member {String} averageEffectFollowingHighCauseExplanation
   */
  exports.prototype['averageEffectFollowingHighCauseExplanation'] = undefined;
  /**
   * Example: Overall Mood is 2.65/5 (14% lower) on average after days with around 1.97/5 Sleep Quality
   * @member {String} averageEffectFollowingLowCauseExplanation
   */
  exports.prototype['averageEffectFollowingLowCauseExplanation'] = undefined;
  /**
   * Example: Overall Mood, on average, 11% lower after around 3.03/5 Sleep Quality 
   * @member {String} valuePredictingLowOutcomeExplanation
   */
  exports.prototype['valuePredictingLowOutcomeExplanation'] = undefined;
  /**
   * Example: moderate
   * @member {String} strengthLevel
   */
  exports.prototype['strengthLevel'] = undefined;
  /**
   * Example: high
   * @member {String} confidenceLevel
   */
  exports.prototype['confidenceLevel'] = undefined;
  /**
   * Example: 0.538
   * @member {Number} predictivePearsonCorrelationCoefficient
   */
  exports.prototype['predictivePearsonCorrelationCoefficient'] = undefined;
  /**
   * Example: Sleep Quality Predicts Higher Overall Mood
   * @member {String} predictorExplanation
   */
  exports.prototype['predictorExplanation'] = undefined;
  /**
   * Example: N1 Study: Sleep Quality Predicts Higher Overall Mood
   * @member {String} studyTitle
   */
  exports.prototype['studyTitle'] = undefined;
  /**
   * Example: Your data suggests with a high degree of confidence (p=0) that Sleep Quality (Sleep) has a moderately positive predictive relationship (R=0.538) with Overall Mood  (Emotions).  The highest quartile of Overall Mood  measurements were observed following an average 4.14/5 Sleep Quality.  The lowest quartile of Overall Mood  measurements were observed following an average 3.03/5 Sleep Quality.
   * @member {String} studyAbstract
   */
  exports.prototype['studyAbstract'] = undefined;
  /**
   * Example: https://local.quantimo.do/api/v2/study?causeVariableName=Sleep%20Quality&effectVariableName=Overall%20Mood&userId=230
   * @member {String} studyLinkStatic
   */
  exports.prototype['studyLinkStatic'] = undefined;
  /**
   * Example: https://local.quantimo.do/ionic/Modo/www/index.html#/app/study?causeVariableName=Sleep%20Quality&effectVariableName=Overall%20Mood&userId=230
   * @member {String} studyLinkDynamic
   */
  exports.prototype['studyLinkDynamic'] = undefined;
  /**
   * Example: https://www.facebook.com/sharer/sharer.php?u=https%3A%2F%2Flocal.quantimo.do%2Fapi%2Fv2%2Fstudy%3FcauseVariableName%3DSleep%2520Quality%26effectVariableName%3DOverall%2520Mood%26userId%3D230
   * @member {String} studyLinkFacebook
   */
  exports.prototype['studyLinkFacebook'] = undefined;
  /**
   * Example: https://plus.google.com/share?url=https%3A%2F%2Flocal.quantimo.do%2Fapi%2Fv2%2Fstudy%3FcauseVariableName%3DSleep%2520Quality%26effectVariableName%3DOverall%2520Mood%26userId%3D230
   * @member {String} studyLinkGoogle
   */
  exports.prototype['studyLinkGoogle'] = undefined;
  /**
   * Example: https://twitter.com/home?status=Sleep%20Quality%20Predicts%20Higher%20Overall%20Mood%20https%3A%2F%2Flocal.quantimo.do%2Fapi%2Fv2%2Fstudy%3FcauseVariableName%3DSleep%2520Quality%26effectVariableName%3DOverall%2520Mood%26userId%3D230%20%40quantimodo
   * @member {String} studyLinkTwitter
   */
  exports.prototype['studyLinkTwitter'] = undefined;
  /**
   * Example: mailto:?subject=N1%20Study%3A%20Sleep%20Quality%20Predicts%20Higher%20Overall%20Mood&body=Check%20out%20my%20study%20at%20https%3A%2F%2Flocal.quantimo.do%2Fapi%2Fv2%2Fstudy%3FcauseVariableName%3DSleep%2520Quality%26effectVariableName%3DOverall%2520Mood%26userId%3D230%0A%0AHave%20a%20great%20day!
   * @member {String} studyLinkEmail
   */
  exports.prototype['studyLinkEmail'] = undefined;
  /**
   * Example: https://s3.amazonaws.com/quantimodo-docs/images/gauge-moderately-positive-relationship.png
   * @member {String} gaugeImage
   */
  exports.prototype['gaugeImage'] = undefined;
  /**
   * Example: https://s3.amazonaws.com/quantimodo-docs/images/gauge-moderately-positive-relationship-200-200.png
   * @member {String} gaugeImageSquare
   */
  exports.prototype['gaugeImageSquare'] = undefined;
  /**
   * Example: https://s3-us-west-1.amazonaws.com/qmimages/variable_categories_gauges_logo_background/gauge-moderately-positive-relationship_sleep_emotions_logo_background.png
   * @member {String} imageUrl
   */
  exports.prototype['imageUrl'] = undefined;
  /**
   * Example: This study is based on data donated by one QuantiModo user. Thus, the study design is consistent with an n=1 observational natural experiment. 
   * @member {String} studyDesign
   */
  exports.prototype['studyDesign'] = undefined;
  /**
   * Example: The objective of this study is to determine the nature of the relationship (if any) between the Sleep Quality and the Overall Mood. Additionally, we attempt to determine the Sleep Quality values most likely to produce optimal Overall Mood values. 
   * @member {String} studyObjective
   */
  exports.prototype['studyObjective'] = undefined;
  /**
   * Example: Sleep Quality data was primarily collected using <a href=\"http://www.amazon.com/gp/product/B00A17IAO0/ref=as_li_qf_sp_asin_tl?ie=UTF8&camp=1789&creative=9325&creativeASIN=B00A17IAO0&linkCode=as2&tag=quant08-20\">Up by Jawbone</a>.  UP by Jawbone is a wristband and app that tracks how you sleep, move and eat and then helps you use that information to feel your best.<br>Overall Mood data was primarily collected using <a href=\"https://quantimo.do\">QuantiModo</a>.  <a href=\"https://quantimo.do\">QuantiModo</a> is a Chrome extension, Android app, iOS app, and web app that allows you to easily track mood, symptoms, or any outcome you want to optimize in a fraction of a second.  You can also import your data from over 30 other apps and devices like Fitbit, Rescuetime, Jawbone Up, Withings, Facebook, Github, Google Calendar, Runkeeper, MoodPanda, Slice, Google Fit, and more.  <a href=\"https://quantimo.do\">QuantiModo</a> then analyzes your data to identify which hidden factors are most likely to be influencing your mood or symptoms and their optimal daily values.
   * @member {String} dataSources
   */
  exports.prototype['dataSources'] = undefined;
  /**
   * Example: Sleep Quality data was primarily collected using <a href=\"http://www.amazon.com/gp/product/B00A17IAO0/ref=as_li_qf_sp_asin_tl?ie=UTF8&camp=1789&creative=9325&creativeASIN=B00A17IAO0&linkCode=as2&tag=quant08-20\">Up by Jawbone</a>.  UP by Jawbone is a wristband and app that tracks how you sleep, move and eat and then helps you use that information to feel your best.
   * @member {String} dataSourcesParagraphForCause
   */
  exports.prototype['dataSourcesParagraphForCause'] = undefined;
  /**
   * Example: <a href=\"http://www.amazon.com/gp/product/B00A17IAO0/ref=as_li_qf_sp_asin_tl?ie=UTF8&camp=1789&creative=9325&creativeASIN=B00A17IAO0&linkCode=as2&tag=quant08-20\">Obtain Up by Jawbone</a> and use it to record your Sleep Quality. Once you have a <a href=\"http://www.amazon.com/gp/product/B00A17IAO0/ref=as_li_qf_sp_asin_tl?ie=UTF8&camp=1789&creative=9325&creativeASIN=B00A17IAO0&linkCode=as2&tag=quant08-20\">Up by Jawbone</a> account, <a href=\"https://app.quantimo.do/ionic/Modo/www/#/app/import\">connect your  Up by Jawbone account at QuantiModo</a> to automatically import and analyze your data.
   * @member {String} instructionsForCause
   */
  exports.prototype['instructionsForCause'] = undefined;
  /**
   * Example: Overall Mood data was primarily collected using <a href=\"https://quantimo.do\">QuantiModo</a>.  <a href=\"https://quantimo.do\">QuantiModo</a> is a Chrome extension, Android app, iOS app, and web app that allows you to easily track mood, symptoms, or any outcome you want to optimize in a fraction of a second.  You can also import your data from over 30 other apps and devices like Fitbit, Rescuetime, Jawbone Up, Withings, Facebook, Github, Google Calendar, Runkeeper, MoodPanda, Slice, Google Fit, and more.  <a href=\"https://quantimo.do\">QuantiModo</a> then analyzes your data to identify which hidden factors are most likely to be influencing your mood or symptoms and their optimal daily values.
   * @member {String} dataSourcesParagraphForEffect
   */
  exports.prototype['dataSourcesParagraphForEffect'] = undefined;
  /**
   * Example: <a href=\"https://quantimo.do\">Obtain QuantiModo</a> and use it to record your Overall Mood. Once you have a <a href=\"https://quantimo.do\">QuantiModo</a> account, <a href=\"https://app.quantimo.do/ionic/Modo/www/#/app/import\">connect your  QuantiModo account at QuantiModo</a> to automatically import and analyze your data.
   * @member {String} instructionsForEffect
   */
  exports.prototype['instructionsForEffect'] = undefined;
  /**
   * Example: It was assumed that 0 hours would pass before a change in Sleep Quality would produce an observable change in Overall Mood.  It was assumed that Sleep Quality could produce an observable change in Overall Mood for as much as 7 days after the stimulus event.  
   * @member {String} dataAnalysis
   */
  exports.prototype['dataAnalysis'] = undefined;
  /**
   * Example: This analysis suggests that higher Sleep Quality (Sleep) generally predicts higher Overall Mood (p = 0).  Overall Mood is, on average, 17%  higher after around 4.14 Sleep Quality.  After an onset delay of 168 hours, Overall Mood is, on average, 11%  lower than its average over the 168 hours following around 3.03 Sleep Quality.  298 data points were used in this analysis.  The value for Sleep Quality changed 164 times, effectively running 82 separate natural experiments.  The top quartile outcome values are preceded by an average 4.14 /5 of Sleep Quality.  The bottom quartile outcome values are preceded by an average 3.03 /5 of Sleep Quality.  Forward Pearson Correlation Coefficient was 0.538 (p=0, 95% CI 0.395 to 0.681 onset delay = 0 hours, duration of action = 168 hours) .  The Reverse Pearson Correlation Coefficient was 0 (P=0, 95% CI -0.143 to 0.143, onset delay = -0 hours, duration of action = -168 hours). When the Sleep Quality value is closer to 4.14 /5 than 3.03 /5, the Overall Mood value which follows is, on average, 17%  percent higher than its typical value.  When the Sleep Quality value is closer to 3.03 /5 than 4.14 /5, the Overall Mood value which follows is 0% lower than its typical value.  Overall Mood is 3.55/5 (15% higher) on average after days with around 4.19/5 Sleep Quality  Overall Mood is 2.65/5 (14% lower) on average after days with around 1.97/5 Sleep Quality
   * @member {String} studyResults
   */
  exports.prototype['studyResults'] = undefined;
  /**
   * Example: As with any human experiment, it was impossible to control for all potentially confounding variables.                           Correlation does not necessarily imply correlation.  We can never know for sure if one factor is definitely the cause of an outcome.               However, lack of correlation definitely implies the lack of a causal relationship.  Hence, we can with great              confidence rule out non-existent relationships. For instance, if we discover no relationship between mood             and an antidepressant this information is just as or even more valuable than the discovery that there is a relationship.              <br>             <br>                         We can also take advantage of several characteristics of time series data from many subjects  to infer the likelihood of a causal relationship if we do find a correlational relationship.              The criteria for causation are a group of minimal conditions necessary to provide adequate evidence of a causal relationship between an incidence and a possible consequence.             The list of the criteria is as follows:             <br>             1. Strength (effect size): A small association does not mean that there is not a causal effect, though the larger the association, the more likely that it is causal.             <br>             2. Consistency (reproducibility): Consistent findings observed by different persons in different places with different samples strengthens the likelihood of an effect.             <br>             3. Specificity: Causation is likely if a very specific population at a specific site and disease with no other likely explanation. The more specific an association between a factor and an effect is, the bigger the probability of a causal relationship.             <br>             4. Temporality: The effect has to occur after the cause (and if there is an expected delay between the cause and expected effect, then the effect must occur after that delay).             <br>             5. Biological gradient: Greater exposure should generally lead to greater incidence of the effect. However, in some cases, the mere presence of the factor can trigger the effect. In other cases, an inverse proportion is observed: greater exposure leads to lower incidence.             <br>             6. Plausibility: A plausible mechanism between cause and effect is helpful.             <br>             7. Coherence: Coherence between epidemiological and laboratory findings increases the likelihood of an effect.             <br>             8. Experiment: \"Occasionally it is possible to appeal to experimental evidence\".             <br>             9. Analogy: The effect of similar factors may be considered.             <br>             <br>                            The confidence in a causal relationship is bolstered by the fact that time-precedence was taken into account in all calculations. Furthermore, in accordance with the law of large numbers (LLN), the predictive power and accuracy of these results will continually grow over time.  298 paired data points were used in this analysis.   Assuming that the relationship is merely coincidental, as the participant independently modifies their Sleep Quality values, the observed strength of the relationship will decline until it is below the threshold of significance.  To it another way, in the case that we do find a spurious correlation, suggesting that banana intake improves mood for instance,             one will likely increase their banana intake.  Due to the fact that this correlation is spurious, it is unlikely             that you will see a continued and persistent corresponding increase in mood.  So over time, the spurious correlation will             naturally dissipate.Furthermore, it will be very enlightening to aggregate this data with the data from other participants  with similar genetic, diseasomic, environmentomic, and demographic profiles.
   * @member {String} studyLimitations
   */
  exports.prototype['studyLimitations'] = undefined;
  /**
   * Example: 0
   * @member {Number} onsetDelay
   */
  exports.prototype['onsetDelay'] = undefined;
  /**
   * Example: 0
   * @member {Number} onsetDelayInHours
   */
  exports.prototype['onsetDelayInHours'] = undefined;
  /**
   * Example: 30
   * @member {Number} predictorMinimumAllowedValue
   */
  exports.prototype['predictorMinimumAllowedValue'] = undefined;
  /**
   * Example: 200
   * @member {Number} predictorMaximumAllowedValue
   */
  exports.prototype['predictorMaximumAllowedValue'] = undefined;
  /**
   * Example: 0.01377184270977
   * @member {Number} reversePearsonCorrelationCoefficient
   */
  exports.prototype['reversePearsonCorrelationCoefficient'] = undefined;
  /**
   * Example: RescueTime
   * @member {String} predictorDataSources
   */
  exports.prototype['predictorDataSources'] = undefined;



  return exports;
}));



},{"../ApiClient":16}],40:[function(require,module,exports){
/**
 * quantimodo
 * QuantiModo makes it easy to retrieve normalized user data from a wide array of devices and applications. [Learn about QuantiModo](https://quantimo.do), check out our [docs](https://github.com/QuantiModo/docs) or contact us at [help.quantimo.do](https://help.quantimo.do).
 *
 * OpenAPI spec version: 5.8.728
 *
 * NOTE: This class is auto generated by the swagger code generator program.
 * https://github.com/swagger-api/swagger-codegen.git
 *
 * Swagger Codegen version: 2.2.3
 *
 * Do not edit the class manually.
 *
 */

(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define(['ApiClient'], factory);
  } else if (typeof module === 'object' && module.exports) {
    // CommonJS-like environments that support module.exports, like Node.
    module.exports = factory(require('../ApiClient'));
  } else {
    // Browser globals (root is window)
    if (!root.Quantimodo) {
      root.Quantimodo = {};
    }
    root.Quantimodo.Credit = factory(root.Quantimodo.ApiClient);
  }
}(this, function(ApiClient) {
  'use strict';




  /**
   * The Credit model module.
   * @module model/Credit
   * @version 5.8.807
   */

  /**
   * Constructs a new <code>Credit</code>.
   * @alias module:model/Credit
   * @class
   * @param enabled {Boolean} Example: false
   */
  var exports = function(enabled) {
    var _this = this;

    _this['enabled'] = enabled;
  };

  /**
   * Constructs a <code>Credit</code> from a plain JavaScript object, optionally creating a new instance.
   * Copies all relevant properties from <code>data</code> to <code>obj</code> if supplied or a new instance if not.
   * @param {Object} data The plain JavaScript object bearing properties of interest.
   * @param {module:model/Credit} obj Optional instance to populate.
   * @return {module:model/Credit} The populated <code>Credit</code> instance.
   */
  exports.constructFromObject = function(data, obj) {
    if (data) {
      obj = obj || new exports();

      if (data.hasOwnProperty('enabled')) {
        obj['enabled'] = ApiClient.convertToType(data['enabled'], 'Boolean');
      }
    }
    return obj;
  }

  /**
   * Example: false
   * @member {Boolean} enabled
   */
  exports.prototype['enabled'] = undefined;



  return exports;
}));



},{"../ApiClient":16}],41:[function(require,module,exports){
/**
 * quantimodo
 * QuantiModo makes it easy to retrieve normalized user data from a wide array of devices and applications. [Learn about QuantiModo](https://quantimo.do), check out our [docs](https://github.com/QuantiModo/docs) or contact us at [help.quantimo.do](https://help.quantimo.do).
 *
 * OpenAPI spec version: 5.8.728
 *
 * NOTE: This class is auto generated by the swagger code generator program.
 * https://github.com/swagger-api/swagger-codegen.git
 *
 * Swagger Codegen version: 2.2.3
 *
 * Do not edit the class manually.
 *
 */

(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define(['ApiClient'], factory);
  } else if (typeof module === 'object' && module.exports) {
    // CommonJS-like environments that support module.exports, like Node.
    module.exports = factory(require('../ApiClient'));
  } else {
    // Browser globals (root is window)
    if (!root.Quantimodo) {
      root.Quantimodo = {};
    }
    root.Quantimodo.DataSource = factory(root.Quantimodo.ApiClient);
  }
}(this, function(ApiClient) {
  'use strict';




  /**
   * The DataSource model module.
   * @module model/DataSource
   * @version 5.8.807
   */

  /**
   * Constructs a new <code>DataSource</code>.
   * @alias module:model/DataSource
   * @class
   * @param id {Number} Example: 72
   * @param name {String} Example: quantimodo
   * @param displayName {String} Example: QuantiModo
   * @param image {String} Example: https://app.quantimo.do/ionic/Modo/www/img/logos/quantimodo-logo-qm-rainbow-200-200.png
   * @param getItUrl {String} Example: https://quantimo.do
   * @param shortDescription {String} Example: Tracks anything
   * @param longDescription {String} Example: QuantiModo is a Chrome extension, Android app, iOS app, and web app that allows you to easily track mood, symptoms, or any outcome you want to optimize in a fraction of a second.  You can also import your data from over 30 other apps and devices like Fitbit, Rescuetime, Jawbone Up, Withings, Facebook, Github, Google Calendar, Runkeeper, MoodPanda, Slice, Google Fit, and more.  QuantiModo then analyzes your data to identify which hidden factors are most likely to be influencing your mood or symptoms and their optimal daily values.
   * @param enabled {Number} Example: 0
   * @param affiliate {Boolean} Example: true
   * @param defaultVariableCategoryName {String} Example: Foods
   * @param imageHtml {String} Example: <a href=\"https://quantimo.do\"><img id=\"quantimodo_image\" title=\"QuantiModo\" src=\"https://app.quantimo.do/ionic/Modo/www/img/logos/quantimodo-logo-qm-rainbow-200-200.png\" alt=\"QuantiModo\"></a>
   * @param linkedDisplayNameHtml {String} Example: <a href=\"https://quantimo.do\">QuantiModo</a>
   * @param connectorClientId {String} Example: ba7d0c12432650e23b3ce924ae2d21e2ff59e7e4e28650759633700af7ed0a30
   */
  var exports = function(id, name, displayName, image, getItUrl, shortDescription, longDescription, enabled, affiliate, defaultVariableCategoryName, imageHtml, linkedDisplayNameHtml, connectorClientId) {
    var _this = this;

    _this['id'] = id;
    _this['name'] = name;
    _this['displayName'] = displayName;
    _this['image'] = image;
    _this['getItUrl'] = getItUrl;
    _this['shortDescription'] = shortDescription;
    _this['longDescription'] = longDescription;
    _this['enabled'] = enabled;
    _this['affiliate'] = affiliate;
    _this['defaultVariableCategoryName'] = defaultVariableCategoryName;
    _this['imageHtml'] = imageHtml;
    _this['linkedDisplayNameHtml'] = linkedDisplayNameHtml;
    _this['connectorClientId'] = connectorClientId;
  };

  /**
   * Constructs a <code>DataSource</code> from a plain JavaScript object, optionally creating a new instance.
   * Copies all relevant properties from <code>data</code> to <code>obj</code> if supplied or a new instance if not.
   * @param {Object} data The plain JavaScript object bearing properties of interest.
   * @param {module:model/DataSource} obj Optional instance to populate.
   * @return {module:model/DataSource} The populated <code>DataSource</code> instance.
   */
  exports.constructFromObject = function(data, obj) {
    if (data) {
      obj = obj || new exports();

      if (data.hasOwnProperty('id')) {
        obj['id'] = ApiClient.convertToType(data['id'], 'Number');
      }
      if (data.hasOwnProperty('name')) {
        obj['name'] = ApiClient.convertToType(data['name'], 'String');
      }
      if (data.hasOwnProperty('displayName')) {
        obj['displayName'] = ApiClient.convertToType(data['displayName'], 'String');
      }
      if (data.hasOwnProperty('image')) {
        obj['image'] = ApiClient.convertToType(data['image'], 'String');
      }
      if (data.hasOwnProperty('getItUrl')) {
        obj['getItUrl'] = ApiClient.convertToType(data['getItUrl'], 'String');
      }
      if (data.hasOwnProperty('shortDescription')) {
        obj['shortDescription'] = ApiClient.convertToType(data['shortDescription'], 'String');
      }
      if (data.hasOwnProperty('longDescription')) {
        obj['longDescription'] = ApiClient.convertToType(data['longDescription'], 'String');
      }
      if (data.hasOwnProperty('enabled')) {
        obj['enabled'] = ApiClient.convertToType(data['enabled'], 'Number');
      }
      if (data.hasOwnProperty('affiliate')) {
        obj['affiliate'] = ApiClient.convertToType(data['affiliate'], 'Boolean');
      }
      if (data.hasOwnProperty('defaultVariableCategoryName')) {
        obj['defaultVariableCategoryName'] = ApiClient.convertToType(data['defaultVariableCategoryName'], 'String');
      }
      if (data.hasOwnProperty('imageHtml')) {
        obj['imageHtml'] = ApiClient.convertToType(data['imageHtml'], 'String');
      }
      if (data.hasOwnProperty('linkedDisplayNameHtml')) {
        obj['linkedDisplayNameHtml'] = ApiClient.convertToType(data['linkedDisplayNameHtml'], 'String');
      }
      if (data.hasOwnProperty('connectorClientId')) {
        obj['connectorClientId'] = ApiClient.convertToType(data['connectorClientId'], 'String');
      }
    }
    return obj;
  }

  /**
   * Example: 72
   * @member {Number} id
   */
  exports.prototype['id'] = undefined;
  /**
   * Example: quantimodo
   * @member {String} name
   */
  exports.prototype['name'] = undefined;
  /**
   * Example: QuantiModo
   * @member {String} displayName
   */
  exports.prototype['displayName'] = undefined;
  /**
   * Example: https://app.quantimo.do/ionic/Modo/www/img/logos/quantimodo-logo-qm-rainbow-200-200.png
   * @member {String} image
   */
  exports.prototype['image'] = undefined;
  /**
   * Example: https://quantimo.do
   * @member {String} getItUrl
   */
  exports.prototype['getItUrl'] = undefined;
  /**
   * Example: Tracks anything
   * @member {String} shortDescription
   */
  exports.prototype['shortDescription'] = undefined;
  /**
   * Example: QuantiModo is a Chrome extension, Android app, iOS app, and web app that allows you to easily track mood, symptoms, or any outcome you want to optimize in a fraction of a second.  You can also import your data from over 30 other apps and devices like Fitbit, Rescuetime, Jawbone Up, Withings, Facebook, Github, Google Calendar, Runkeeper, MoodPanda, Slice, Google Fit, and more.  QuantiModo then analyzes your data to identify which hidden factors are most likely to be influencing your mood or symptoms and their optimal daily values.
   * @member {String} longDescription
   */
  exports.prototype['longDescription'] = undefined;
  /**
   * Example: 0
   * @member {Number} enabled
   */
  exports.prototype['enabled'] = undefined;
  /**
   * Example: true
   * @member {Boolean} affiliate
   */
  exports.prototype['affiliate'] = undefined;
  /**
   * Example: Foods
   * @member {String} defaultVariableCategoryName
   */
  exports.prototype['defaultVariableCategoryName'] = undefined;
  /**
   * Example: <a href=\"https://quantimo.do\"><img id=\"quantimodo_image\" title=\"QuantiModo\" src=\"https://app.quantimo.do/ionic/Modo/www/img/logos/quantimodo-logo-qm-rainbow-200-200.png\" alt=\"QuantiModo\"></a>
   * @member {String} imageHtml
   */
  exports.prototype['imageHtml'] = undefined;
  /**
   * Example: <a href=\"https://quantimo.do\">QuantiModo</a>
   * @member {String} linkedDisplayNameHtml
   */
  exports.prototype['linkedDisplayNameHtml'] = undefined;
  /**
   * Example: ba7d0c12432650e23b3ce924ae2d21e2ff59e7e4e28650759633700af7ed0a30
   * @member {String} connectorClientId
   */
  exports.prototype['connectorClientId'] = undefined;



  return exports;
}));



},{"../ApiClient":16}],42:[function(require,module,exports){
/**
 * quantimodo
 * QuantiModo makes it easy to retrieve normalized user data from a wide array of devices and applications. [Learn about QuantiModo](https://quantimo.do), check out our [docs](https://github.com/QuantiModo/docs) or contact us at [help.quantimo.do](https://help.quantimo.do).
 *
 * OpenAPI spec version: 5.8.728
 *
 * NOTE: This class is auto generated by the swagger code generator program.
 * https://github.com/swagger-api/swagger-codegen.git
 *
 * Swagger Codegen version: 2.2.3
 *
 * Do not edit the class manually.
 *
 */

(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define(['ApiClient', 'model/ExplanationStartTracking', 'model/Image'], factory);
  } else if (typeof module === 'object' && module.exports) {
    // CommonJS-like environments that support module.exports, like Node.
    module.exports = factory(require('../ApiClient'), require('./ExplanationStartTracking'), require('./Image'));
  } else {
    // Browser globals (root is window)
    if (!root.Quantimodo) {
      root.Quantimodo = {};
    }
    root.Quantimodo.Explanation = factory(root.Quantimodo.ApiClient, root.Quantimodo.ExplanationStartTracking, root.Quantimodo.Image);
  }
}(this, function(ApiClient, ExplanationStartTracking, Image) {
  'use strict';




  /**
   * The Explanation model module.
   * @module model/Explanation
   * @version 5.8.807
   */

  /**
   * Constructs a new <code>Explanation</code>.
   * @alias module:model/Explanation
   * @class
   * @param ionIcon {String} Example: ion-ios-person
   * @param description {String} Example: These factors are most predictive of Overall Mood based on your own data.
   * @param title {String} Example: Top Predictors of Overall Mood
   * @param image {module:model/Image} 
   * @param startTracking {module:model/ExplanationStartTracking} 
   */
  var exports = function(ionIcon, description, title, image, startTracking) {
    var _this = this;

    _this['ionIcon'] = ionIcon;
    _this['description'] = description;
    _this['title'] = title;
    _this['image'] = image;
    _this['startTracking'] = startTracking;
  };

  /**
   * Constructs a <code>Explanation</code> from a plain JavaScript object, optionally creating a new instance.
   * Copies all relevant properties from <code>data</code> to <code>obj</code> if supplied or a new instance if not.
   * @param {Object} data The plain JavaScript object bearing properties of interest.
   * @param {module:model/Explanation} obj Optional instance to populate.
   * @return {module:model/Explanation} The populated <code>Explanation</code> instance.
   */
  exports.constructFromObject = function(data, obj) {
    if (data) {
      obj = obj || new exports();

      if (data.hasOwnProperty('ionIcon')) {
        obj['ionIcon'] = ApiClient.convertToType(data['ionIcon'], 'String');
      }
      if (data.hasOwnProperty('description')) {
        obj['description'] = ApiClient.convertToType(data['description'], 'String');
      }
      if (data.hasOwnProperty('title')) {
        obj['title'] = ApiClient.convertToType(data['title'], 'String');
      }
      if (data.hasOwnProperty('image')) {
        obj['image'] = Image.constructFromObject(data['image']);
      }
      if (data.hasOwnProperty('startTracking')) {
        obj['startTracking'] = ExplanationStartTracking.constructFromObject(data['startTracking']);
      }
    }
    return obj;
  }

  /**
   * Example: ion-ios-person
   * @member {String} ionIcon
   */
  exports.prototype['ionIcon'] = undefined;
  /**
   * Example: These factors are most predictive of Overall Mood based on your own data.
   * @member {String} description
   */
  exports.prototype['description'] = undefined;
  /**
   * Example: Top Predictors of Overall Mood
   * @member {String} title
   */
  exports.prototype['title'] = undefined;
  /**
   * @member {module:model/Image} image
   */
  exports.prototype['image'] = undefined;
  /**
   * @member {module:model/ExplanationStartTracking} startTracking
   */
  exports.prototype['startTracking'] = undefined;



  return exports;
}));



},{"../ApiClient":16,"./ExplanationStartTracking":43,"./Image":50}],43:[function(require,module,exports){
/**
 * quantimodo
 * QuantiModo makes it easy to retrieve normalized user data from a wide array of devices and applications. [Learn about QuantiModo](https://quantimo.do), check out our [docs](https://github.com/QuantiModo/docs) or contact us at [help.quantimo.do](https://help.quantimo.do).
 *
 * OpenAPI spec version: 5.8.728
 *
 * NOTE: This class is auto generated by the swagger code generator program.
 * https://github.com/swagger-api/swagger-codegen.git
 *
 * Swagger Codegen version: 2.2.3
 *
 * Do not edit the class manually.
 *
 */

(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define(['ApiClient', 'model/Button'], factory);
  } else if (typeof module === 'object' && module.exports) {
    // CommonJS-like environments that support module.exports, like Node.
    module.exports = factory(require('../ApiClient'), require('./Button'));
  } else {
    // Browser globals (root is window)
    if (!root.Quantimodo) {
      root.Quantimodo = {};
    }
    root.Quantimodo.ExplanationStartTracking = factory(root.Quantimodo.ApiClient, root.Quantimodo.Button);
  }
}(this, function(ApiClient, Button) {
  'use strict';




  /**
   * The ExplanationStartTracking model module.
   * @module model/ExplanationStartTracking
   * @version 5.8.807
   */

  /**
   * Constructs a new <code>ExplanationStartTracking</code>.
   * @alias module:model/ExplanationStartTracking
   * @class
   * @param title {String} Example: Improve Accuracy
   * @param description {String} Example: The more data I have the more accurate your results will be so track regularly!
   * @param button {module:model/Button} 
   */
  var exports = function(title, description, button) {
    var _this = this;

    _this['title'] = title;
    _this['description'] = description;
    _this['button'] = button;
  };

  /**
   * Constructs a <code>ExplanationStartTracking</code> from a plain JavaScript object, optionally creating a new instance.
   * Copies all relevant properties from <code>data</code> to <code>obj</code> if supplied or a new instance if not.
   * @param {Object} data The plain JavaScript object bearing properties of interest.
   * @param {module:model/ExplanationStartTracking} obj Optional instance to populate.
   * @return {module:model/ExplanationStartTracking} The populated <code>ExplanationStartTracking</code> instance.
   */
  exports.constructFromObject = function(data, obj) {
    if (data) {
      obj = obj || new exports();

      if (data.hasOwnProperty('title')) {
        obj['title'] = ApiClient.convertToType(data['title'], 'String');
      }
      if (data.hasOwnProperty('description')) {
        obj['description'] = ApiClient.convertToType(data['description'], 'String');
      }
      if (data.hasOwnProperty('button')) {
        obj['button'] = Button.constructFromObject(data['button']);
      }
    }
    return obj;
  }

  /**
   * Example: Improve Accuracy
   * @member {String} title
   */
  exports.prototype['title'] = undefined;
  /**
   * Example: The more data I have the more accurate your results will be so track regularly!
   * @member {String} description
   */
  exports.prototype['description'] = undefined;
  /**
   * @member {module:model/Button} button
   */
  exports.prototype['button'] = undefined;



  return exports;
}));



},{"../ApiClient":16,"./Button":28}],44:[function(require,module,exports){
/**
 * quantimodo
 * QuantiModo makes it easy to retrieve normalized user data from a wide array of devices and applications. [Learn about QuantiModo](https://quantimo.do), check out our [docs](https://github.com/QuantiModo/docs) or contact us at [help.quantimo.do](https://help.quantimo.do).
 *
 * OpenAPI spec version: 5.8.728
 *
 * NOTE: This class is auto generated by the swagger code generator program.
 * https://github.com/swagger-api/swagger-codegen.git
 *
 * Swagger Codegen version: 2.2.3
 *
 * Do not edit the class manually.
 *
 */

(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define(['ApiClient', 'model/Correlation', 'model/Explanation'], factory);
  } else if (typeof module === 'object' && module.exports) {
    // CommonJS-like environments that support module.exports, like Node.
    module.exports = factory(require('../ApiClient'), require('./Correlation'), require('./Explanation'));
  } else {
    // Browser globals (root is window)
    if (!root.Quantimodo) {
      root.Quantimodo = {};
    }
    root.Quantimodo.GetCorrelationsDataResponse = factory(root.Quantimodo.ApiClient, root.Quantimodo.Correlation, root.Quantimodo.Explanation);
  }
}(this, function(ApiClient, Correlation, Explanation) {
  'use strict';




  /**
   * The GetCorrelationsDataResponse model module.
   * @module model/GetCorrelationsDataResponse
   * @version 5.8.807
   */

  /**
   * Constructs a new <code>GetCorrelationsDataResponse</code>.
   * @alias module:model/GetCorrelationsDataResponse
   * @class
   * @param correlations {Array.<module:model/Correlation>} 
   * @param explanation {module:model/Explanation} 
   */
  var exports = function(correlations, explanation) {
    var _this = this;

    _this['correlations'] = correlations;
    _this['explanation'] = explanation;
  };

  /**
   * Constructs a <code>GetCorrelationsDataResponse</code> from a plain JavaScript object, optionally creating a new instance.
   * Copies all relevant properties from <code>data</code> to <code>obj</code> if supplied or a new instance if not.
   * @param {Object} data The plain JavaScript object bearing properties of interest.
   * @param {module:model/GetCorrelationsDataResponse} obj Optional instance to populate.
   * @return {module:model/GetCorrelationsDataResponse} The populated <code>GetCorrelationsDataResponse</code> instance.
   */
  exports.constructFromObject = function(data, obj) {
    if (data) {
      obj = obj || new exports();

      if (data.hasOwnProperty('correlations')) {
        obj['correlations'] = ApiClient.convertToType(data['correlations'], [Correlation]);
      }
      if (data.hasOwnProperty('explanation')) {
        obj['explanation'] = Explanation.constructFromObject(data['explanation']);
      }
    }
    return obj;
  }

  /**
   * @member {Array.<module:model/Correlation>} correlations
   */
  exports.prototype['correlations'] = undefined;
  /**
   * @member {module:model/Explanation} explanation
   */
  exports.prototype['explanation'] = undefined;



  return exports;
}));



},{"../ApiClient":16,"./Correlation":39,"./Explanation":42}],45:[function(require,module,exports){
/**
 * quantimodo
 * QuantiModo makes it easy to retrieve normalized user data from a wide array of devices and applications. [Learn about QuantiModo](https://quantimo.do), check out our [docs](https://github.com/QuantiModo/docs) or contact us at [help.quantimo.do](https://help.quantimo.do).
 *
 * OpenAPI spec version: 5.8.728
 *
 * NOTE: This class is auto generated by the swagger code generator program.
 * https://github.com/swagger-api/swagger-codegen.git
 *
 * Swagger Codegen version: 2.2.3
 *
 * Do not edit the class manually.
 *
 */

(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define(['ApiClient', 'model/GetCorrelationsDataResponse'], factory);
  } else if (typeof module === 'object' && module.exports) {
    // CommonJS-like environments that support module.exports, like Node.
    module.exports = factory(require('../ApiClient'), require('./GetCorrelationsDataResponse'));
  } else {
    // Browser globals (root is window)
    if (!root.Quantimodo) {
      root.Quantimodo = {};
    }
    root.Quantimodo.GetCorrelationsResponse = factory(root.Quantimodo.ApiClient, root.Quantimodo.GetCorrelationsDataResponse);
  }
}(this, function(ApiClient, GetCorrelationsDataResponse) {
  'use strict';




  /**
   * The GetCorrelationsResponse model module.
   * @module model/GetCorrelationsResponse
   * @version 5.8.807
   */

  /**
   * Constructs a new <code>GetCorrelationsResponse</code>.
   * @alias module:model/GetCorrelationsResponse
   * @class
   * @param status {Number} Status code
   * @param success {Boolean} 
   */
  var exports = function(status, success) {
    var _this = this;

    _this['status'] = status;

    _this['success'] = success;

  };

  /**
   * Constructs a <code>GetCorrelationsResponse</code> from a plain JavaScript object, optionally creating a new instance.
   * Copies all relevant properties from <code>data</code> to <code>obj</code> if supplied or a new instance if not.
   * @param {Object} data The plain JavaScript object bearing properties of interest.
   * @param {module:model/GetCorrelationsResponse} obj Optional instance to populate.
   * @return {module:model/GetCorrelationsResponse} The populated <code>GetCorrelationsResponse</code> instance.
   */
  exports.constructFromObject = function(data, obj) {
    if (data) {
      obj = obj || new exports();

      if (data.hasOwnProperty('status')) {
        obj['status'] = ApiClient.convertToType(data['status'], 'Number');
      }
      if (data.hasOwnProperty('message')) {
        obj['message'] = ApiClient.convertToType(data['message'], 'String');
      }
      if (data.hasOwnProperty('success')) {
        obj['success'] = ApiClient.convertToType(data['success'], 'Boolean');
      }
      if (data.hasOwnProperty('data')) {
        obj['data'] = GetCorrelationsDataResponse.constructFromObject(data['data']);
      }
    }
    return obj;
  }

  /**
   * Status code
   * @member {Number} status
   */
  exports.prototype['status'] = undefined;
  /**
   * Message
   * @member {String} message
   */
  exports.prototype['message'] = undefined;
  /**
   * @member {Boolean} success
   */
  exports.prototype['success'] = undefined;
  /**
   * @member {module:model/GetCorrelationsDataResponse} data
   */
  exports.prototype['data'] = undefined;



  return exports;
}));



},{"../ApiClient":16,"./GetCorrelationsDataResponse":44}],46:[function(require,module,exports){
/**
 * quantimodo
 * QuantiModo makes it easy to retrieve normalized user data from a wide array of devices and applications. [Learn about QuantiModo](https://quantimo.do), check out our [docs](https://github.com/QuantiModo/docs) or contact us at [help.quantimo.do](https://help.quantimo.do).
 *
 * OpenAPI spec version: 5.8.728
 *
 * NOTE: This class is auto generated by the swagger code generator program.
 * https://github.com/swagger-api/swagger-codegen.git
 *
 * Swagger Codegen version: 2.2.3
 *
 * Do not edit the class manually.
 *
 */

(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define(['ApiClient', 'model/Chart', 'model/Pair', 'model/ProcessedDailyMeasurement', 'model/Statistic', 'model/Variable'], factory);
  } else if (typeof module === 'object' && module.exports) {
    // CommonJS-like environments that support module.exports, like Node.
    module.exports = factory(require('../ApiClient'), require('./Chart'), require('./Pair'), require('./ProcessedDailyMeasurement'), require('./Statistic'), require('./Variable'));
  } else {
    // Browser globals (root is window)
    if (!root.Quantimodo) {
      root.Quantimodo = {};
    }
    root.Quantimodo.GetStudyDataResponse = factory(root.Quantimodo.ApiClient, root.Quantimodo.Chart, root.Quantimodo.Pair, root.Quantimodo.ProcessedDailyMeasurement, root.Quantimodo.Statistic, root.Quantimodo.Variable);
  }
}(this, function(ApiClient, Chart, Pair, ProcessedDailyMeasurement, Statistic, Variable) {
  'use strict';




  /**
   * The GetStudyDataResponse model module.
   * @module model/GetStudyDataResponse
   * @version 5.8.807
   */

  /**
   * Constructs a new <code>GetStudyDataResponse</code>.
   * @alias module:model/GetStudyDataResponse
   * @class
   * @param causeProcessedDailyMeasurements {Array.<module:model/ProcessedDailyMeasurement>} 
   * @param causeVariable {module:model/Variable} 
   * @param charts {Array.<module:model/Chart>} 
   * @param effectProcessedDailyMeasurements {Array.<module:model/ProcessedDailyMeasurement>} 
   * @param effectVariable {module:model/Variable} 
   * @param pairs {Array.<module:model/Pair>} 
   * @param statistics {module:model/Statistic} 
   * @param text {String} Example: 
   * @param user {String} Example: 
   * @param userId {Number} Example: 230
   */
  var exports = function(causeProcessedDailyMeasurements, causeVariable, charts, effectProcessedDailyMeasurements, effectVariable, pairs, statistics, text, user, userId) {
    var _this = this;

    _this['causeProcessedDailyMeasurements'] = causeProcessedDailyMeasurements;
    _this['causeVariable'] = causeVariable;
    _this['charts'] = charts;
    _this['effectProcessedDailyMeasurements'] = effectProcessedDailyMeasurements;
    _this['effectVariable'] = effectVariable;
    _this['pairs'] = pairs;
    _this['statistics'] = statistics;
    _this['text'] = text;
    _this['user'] = user;
    _this['userId'] = userId;
  };

  /**
   * Constructs a <code>GetStudyDataResponse</code> from a plain JavaScript object, optionally creating a new instance.
   * Copies all relevant properties from <code>data</code> to <code>obj</code> if supplied or a new instance if not.
   * @param {Object} data The plain JavaScript object bearing properties of interest.
   * @param {module:model/GetStudyDataResponse} obj Optional instance to populate.
   * @return {module:model/GetStudyDataResponse} The populated <code>GetStudyDataResponse</code> instance.
   */
  exports.constructFromObject = function(data, obj) {
    if (data) {
      obj = obj || new exports();

      if (data.hasOwnProperty('causeProcessedDailyMeasurements')) {
        obj['causeProcessedDailyMeasurements'] = ApiClient.convertToType(data['causeProcessedDailyMeasurements'], [ProcessedDailyMeasurement]);
      }
      if (data.hasOwnProperty('causeVariable')) {
        obj['causeVariable'] = Variable.constructFromObject(data['causeVariable']);
      }
      if (data.hasOwnProperty('charts')) {
        obj['charts'] = ApiClient.convertToType(data['charts'], [Chart]);
      }
      if (data.hasOwnProperty('effectProcessedDailyMeasurements')) {
        obj['effectProcessedDailyMeasurements'] = ApiClient.convertToType(data['effectProcessedDailyMeasurements'], [ProcessedDailyMeasurement]);
      }
      if (data.hasOwnProperty('effectVariable')) {
        obj['effectVariable'] = Variable.constructFromObject(data['effectVariable']);
      }
      if (data.hasOwnProperty('pairs')) {
        obj['pairs'] = ApiClient.convertToType(data['pairs'], [Pair]);
      }
      if (data.hasOwnProperty('statistics')) {
        obj['statistics'] = Statistic.constructFromObject(data['statistics']);
      }
      if (data.hasOwnProperty('text')) {
        obj['text'] = ApiClient.convertToType(data['text'], 'String');
      }
      if (data.hasOwnProperty('user')) {
        obj['user'] = ApiClient.convertToType(data['user'], 'String');
      }
      if (data.hasOwnProperty('userId')) {
        obj['userId'] = ApiClient.convertToType(data['userId'], 'Number');
      }
    }
    return obj;
  }

  /**
   * @member {Array.<module:model/ProcessedDailyMeasurement>} causeProcessedDailyMeasurements
   */
  exports.prototype['causeProcessedDailyMeasurements'] = undefined;
  /**
   * @member {module:model/Variable} causeVariable
   */
  exports.prototype['causeVariable'] = undefined;
  /**
   * @member {Array.<module:model/Chart>} charts
   */
  exports.prototype['charts'] = undefined;
  /**
   * @member {Array.<module:model/ProcessedDailyMeasurement>} effectProcessedDailyMeasurements
   */
  exports.prototype['effectProcessedDailyMeasurements'] = undefined;
  /**
   * @member {module:model/Variable} effectVariable
   */
  exports.prototype['effectVariable'] = undefined;
  /**
   * @member {Array.<module:model/Pair>} pairs
   */
  exports.prototype['pairs'] = undefined;
  /**
   * @member {module:model/Statistic} statistics
   */
  exports.prototype['statistics'] = undefined;
  /**
   * Example: 
   * @member {String} text
   */
  exports.prototype['text'] = undefined;
  /**
   * Example: 
   * @member {String} user
   */
  exports.prototype['user'] = undefined;
  /**
   * Example: 230
   * @member {Number} userId
   */
  exports.prototype['userId'] = undefined;



  return exports;
}));



},{"../ApiClient":16,"./Chart":30,"./Pair":63,"./ProcessedDailyMeasurement":67,"./Statistic":71,"./Variable":90}],47:[function(require,module,exports){
/**
 * quantimodo
 * QuantiModo makes it easy to retrieve normalized user data from a wide array of devices and applications. [Learn about QuantiModo](https://quantimo.do), check out our [docs](https://github.com/QuantiModo/docs) or contact us at [help.quantimo.do](https://help.quantimo.do).
 *
 * OpenAPI spec version: 5.8.728
 *
 * NOTE: This class is auto generated by the swagger code generator program.
 * https://github.com/swagger-api/swagger-codegen.git
 *
 * Swagger Codegen version: 2.2.3
 *
 * Do not edit the class manually.
 *
 */

(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define(['ApiClient', 'model/GetStudyDataResponse'], factory);
  } else if (typeof module === 'object' && module.exports) {
    // CommonJS-like environments that support module.exports, like Node.
    module.exports = factory(require('../ApiClient'), require('./GetStudyDataResponse'));
  } else {
    // Browser globals (root is window)
    if (!root.Quantimodo) {
      root.Quantimodo = {};
    }
    root.Quantimodo.GetStudyResponse = factory(root.Quantimodo.ApiClient, root.Quantimodo.GetStudyDataResponse);
  }
}(this, function(ApiClient, GetStudyDataResponse) {
  'use strict';




  /**
   * The GetStudyResponse model module.
   * @module model/GetStudyResponse
   * @version 5.8.807
   */

  /**
   * Constructs a new <code>GetStudyResponse</code>.
   * @alias module:model/GetStudyResponse
   * @class
   * @param status {Number} Status code
   * @param success {Boolean} 
   */
  var exports = function(status, success) {
    var _this = this;

    _this['status'] = status;

    _this['success'] = success;

  };

  /**
   * Constructs a <code>GetStudyResponse</code> from a plain JavaScript object, optionally creating a new instance.
   * Copies all relevant properties from <code>data</code> to <code>obj</code> if supplied or a new instance if not.
   * @param {Object} data The plain JavaScript object bearing properties of interest.
   * @param {module:model/GetStudyResponse} obj Optional instance to populate.
   * @return {module:model/GetStudyResponse} The populated <code>GetStudyResponse</code> instance.
   */
  exports.constructFromObject = function(data, obj) {
    if (data) {
      obj = obj || new exports();

      if (data.hasOwnProperty('status')) {
        obj['status'] = ApiClient.convertToType(data['status'], 'Number');
      }
      if (data.hasOwnProperty('message')) {
        obj['message'] = ApiClient.convertToType(data['message'], 'String');
      }
      if (data.hasOwnProperty('success')) {
        obj['success'] = ApiClient.convertToType(data['success'], 'Boolean');
      }
      if (data.hasOwnProperty('data')) {
        obj['data'] = GetStudyDataResponse.constructFromObject(data['data']);
      }
    }
    return obj;
  }

  /**
   * Status code
   * @member {Number} status
   */
  exports.prototype['status'] = undefined;
  /**
   * Message
   * @member {String} message
   */
  exports.prototype['message'] = undefined;
  /**
   * @member {Boolean} success
   */
  exports.prototype['success'] = undefined;
  /**
   * @member {module:model/GetStudyDataResponse} data
   */
  exports.prototype['data'] = undefined;



  return exports;
}));



},{"../ApiClient":16,"./GetStudyDataResponse":46}],48:[function(require,module,exports){
/**
 * quantimodo
 * QuantiModo makes it easy to retrieve normalized user data from a wide array of devices and applications. [Learn about QuantiModo](https://quantimo.do), check out our [docs](https://github.com/QuantiModo/docs) or contact us at [help.quantimo.do](https://help.quantimo.do).
 *
 * OpenAPI spec version: 5.8.728
 *
 * NOTE: This class is auto generated by the swagger code generator program.
 * https://github.com/swagger-api/swagger-codegen.git
 *
 * Swagger Codegen version: 2.2.3
 *
 * Do not edit the class manually.
 *
 */

(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define(['ApiClient', 'model/TrackingReminderNotificationsArray'], factory);
  } else if (typeof module === 'object' && module.exports) {
    // CommonJS-like environments that support module.exports, like Node.
    module.exports = factory(require('../ApiClient'), require('./TrackingReminderNotificationsArray'));
  } else {
    // Browser globals (root is window)
    if (!root.Quantimodo) {
      root.Quantimodo = {};
    }
    root.Quantimodo.GetTrackingReminderNotificationsResponse = factory(root.Quantimodo.ApiClient, root.Quantimodo.TrackingReminderNotificationsArray);
  }
}(this, function(ApiClient, TrackingReminderNotificationsArray) {
  'use strict';




  /**
   * The GetTrackingReminderNotificationsResponse model module.
   * @module model/GetTrackingReminderNotificationsResponse
   * @version 5.8.807
   */

  /**
   * Constructs a new <code>GetTrackingReminderNotificationsResponse</code>.
   * @alias module:model/GetTrackingReminderNotificationsResponse
   * @class
   * @param status {Number} Status code
   * @param success {Boolean} 
   */
  var exports = function(status, success) {
    var _this = this;

    _this['status'] = status;

    _this['success'] = success;

  };

  /**
   * Constructs a <code>GetTrackingReminderNotificationsResponse</code> from a plain JavaScript object, optionally creating a new instance.
   * Copies all relevant properties from <code>data</code> to <code>obj</code> if supplied or a new instance if not.
   * @param {Object} data The plain JavaScript object bearing properties of interest.
   * @param {module:model/GetTrackingReminderNotificationsResponse} obj Optional instance to populate.
   * @return {module:model/GetTrackingReminderNotificationsResponse} The populated <code>GetTrackingReminderNotificationsResponse</code> instance.
   */
  exports.constructFromObject = function(data, obj) {
    if (data) {
      obj = obj || new exports();

      if (data.hasOwnProperty('status')) {
        obj['status'] = ApiClient.convertToType(data['status'], 'Number');
      }
      if (data.hasOwnProperty('message')) {
        obj['message'] = ApiClient.convertToType(data['message'], 'String');
      }
      if (data.hasOwnProperty('success')) {
        obj['success'] = ApiClient.convertToType(data['success'], 'Boolean');
      }
      if (data.hasOwnProperty('data')) {
        obj['data'] = TrackingReminderNotificationsArray.constructFromObject(data['data']);
      }
    }
    return obj;
  }

  /**
   * Status code
   * @member {Number} status
   */
  exports.prototype['status'] = undefined;
  /**
   * Message
   * @member {String} message
   */
  exports.prototype['message'] = undefined;
  /**
   * @member {Boolean} success
   */
  exports.prototype['success'] = undefined;
  /**
   * @member {module:model/TrackingReminderNotificationsArray} data
   */
  exports.prototype['data'] = undefined;



  return exports;
}));



},{"../ApiClient":16,"./TrackingReminderNotificationsArray":82}],49:[function(require,module,exports){
/**
 * quantimodo
 * QuantiModo makes it easy to retrieve normalized user data from a wide array of devices and applications. [Learn about QuantiModo](https://quantimo.do), check out our [docs](https://github.com/QuantiModo/docs) or contact us at [help.quantimo.do](https://help.quantimo.do).
 *
 * OpenAPI spec version: 5.8.728
 *
 * NOTE: This class is auto generated by the swagger code generator program.
 * https://github.com/swagger-api/swagger-codegen.git
 *
 * Swagger Codegen version: 2.2.3
 *
 * Do not edit the class manually.
 *
 */

(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define(['ApiClient', 'model/Marker'], factory);
  } else if (typeof module === 'object' && module.exports) {
    // CommonJS-like environments that support module.exports, like Node.
    module.exports = factory(require('../ApiClient'), require('./Marker'));
  } else {
    // Browser globals (root is window)
    if (!root.Quantimodo) {
      root.Quantimodo = {};
    }
    root.Quantimodo.Hover = factory(root.Quantimodo.ApiClient, root.Quantimodo.Marker);
  }
}(this, function(ApiClient, Marker) {
  'use strict';




  /**
   * The Hover model module.
   * @module model/Hover
   * @version 5.8.807
   */

  /**
   * Constructs a new <code>Hover</code>.
   * @alias module:model/Hover
   * @class
   * @param enabled {Boolean} Example: true
   * @param lineColor {String} Example: rgb(100,100,100)
   * @param marker {module:model/Marker} 
   */
  var exports = function(enabled, lineColor, marker) {
    var _this = this;

    _this['enabled'] = enabled;
    _this['lineColor'] = lineColor;
    _this['marker'] = marker;
  };

  /**
   * Constructs a <code>Hover</code> from a plain JavaScript object, optionally creating a new instance.
   * Copies all relevant properties from <code>data</code> to <code>obj</code> if supplied or a new instance if not.
   * @param {Object} data The plain JavaScript object bearing properties of interest.
   * @param {module:model/Hover} obj Optional instance to populate.
   * @return {module:model/Hover} The populated <code>Hover</code> instance.
   */
  exports.constructFromObject = function(data, obj) {
    if (data) {
      obj = obj || new exports();

      if (data.hasOwnProperty('enabled')) {
        obj['enabled'] = ApiClient.convertToType(data['enabled'], 'Boolean');
      }
      if (data.hasOwnProperty('lineColor')) {
        obj['lineColor'] = ApiClient.convertToType(data['lineColor'], 'String');
      }
      if (data.hasOwnProperty('marker')) {
        obj['marker'] = Marker.constructFromObject(data['marker']);
      }
    }
    return obj;
  }

  /**
   * Example: true
   * @member {Boolean} enabled
   */
  exports.prototype['enabled'] = undefined;
  /**
   * Example: rgb(100,100,100)
   * @member {String} lineColor
   */
  exports.prototype['lineColor'] = undefined;
  /**
   * @member {module:model/Marker} marker
   */
  exports.prototype['marker'] = undefined;



  return exports;
}));



},{"../ApiClient":16,"./Marker":56}],50:[function(require,module,exports){
/**
 * quantimodo
 * QuantiModo makes it easy to retrieve normalized user data from a wide array of devices and applications. [Learn about QuantiModo](https://quantimo.do), check out our [docs](https://github.com/QuantiModo/docs) or contact us at [help.quantimo.do](https://help.quantimo.do).
 *
 * OpenAPI spec version: 5.8.728
 *
 * NOTE: This class is auto generated by the swagger code generator program.
 * https://github.com/swagger-api/swagger-codegen.git
 *
 * Swagger Codegen version: 2.2.3
 *
 * Do not edit the class manually.
 *
 */

(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define(['ApiClient'], factory);
  } else if (typeof module === 'object' && module.exports) {
    // CommonJS-like environments that support module.exports, like Node.
    module.exports = factory(require('../ApiClient'));
  } else {
    // Browser globals (root is window)
    if (!root.Quantimodo) {
      root.Quantimodo = {};
    }
    root.Quantimodo.Image = factory(root.Quantimodo.ApiClient);
  }
}(this, function(ApiClient) {
  'use strict';




  /**
   * The Image model module.
   * @module model/Image
   * @version 5.8.807
   */

  /**
   * Constructs a new <code>Image</code>.
   * @alias module:model/Image
   * @class
   * @param imageUrl {String} Example: https://www.filepicker.io/api/file/TjmeNWS5Q2SFmtJlUGLf
   * @param height {String} Example: 240
   * @param width {String} Example: 224
   */
  var exports = function(imageUrl, height, width) {
    var _this = this;

    _this['imageUrl'] = imageUrl;
    _this['height'] = height;
    _this['width'] = width;
  };

  /**
   * Constructs a <code>Image</code> from a plain JavaScript object, optionally creating a new instance.
   * Copies all relevant properties from <code>data</code> to <code>obj</code> if supplied or a new instance if not.
   * @param {Object} data The plain JavaScript object bearing properties of interest.
   * @param {module:model/Image} obj Optional instance to populate.
   * @return {module:model/Image} The populated <code>Image</code> instance.
   */
  exports.constructFromObject = function(data, obj) {
    if (data) {
      obj = obj || new exports();

      if (data.hasOwnProperty('imageUrl')) {
        obj['imageUrl'] = ApiClient.convertToType(data['imageUrl'], 'String');
      }
      if (data.hasOwnProperty('height')) {
        obj['height'] = ApiClient.convertToType(data['height'], 'String');
      }
      if (data.hasOwnProperty('width')) {
        obj['width'] = ApiClient.convertToType(data['width'], 'String');
      }
    }
    return obj;
  }

  /**
   * Example: https://www.filepicker.io/api/file/TjmeNWS5Q2SFmtJlUGLf
   * @member {String} imageUrl
   */
  exports.prototype['imageUrl'] = undefined;
  /**
   * Example: 240
   * @member {String} height
   */
  exports.prototype['height'] = undefined;
  /**
   * Example: 224
   * @member {String} width
   */
  exports.prototype['width'] = undefined;



  return exports;
}));



},{"../ApiClient":16}],51:[function(require,module,exports){
/**
 * quantimodo
 * QuantiModo makes it easy to retrieve normalized user data from a wide array of devices and applications. [Learn about QuantiModo](https://quantimo.do), check out our [docs](https://github.com/QuantiModo/docs) or contact us at [help.quantimo.do](https://help.quantimo.do).
 *
 * OpenAPI spec version: 5.8.728
 *
 * NOTE: This class is auto generated by the swagger code generator program.
 * https://github.com/swagger-api/swagger-codegen.git
 *
 * Swagger Codegen version: 2.2.3
 *
 * Do not edit the class manually.
 *
 */

(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define(['ApiClient', 'model/TrackingReminder'], factory);
  } else if (typeof module === 'object' && module.exports) {
    // CommonJS-like environments that support module.exports, like Node.
    module.exports = factory(require('../ApiClient'), require('./TrackingReminder'));
  } else {
    // Browser globals (root is window)
    if (!root.Quantimodo) {
      root.Quantimodo = {};
    }
    root.Quantimodo.InlineResponse201 = factory(root.Quantimodo.ApiClient, root.Quantimodo.TrackingReminder);
  }
}(this, function(ApiClient, TrackingReminder) {
  'use strict';




  /**
   * The InlineResponse201 model module.
   * @module model/InlineResponse201
   * @version 5.8.807
   */

  /**
   * Constructs a new <code>InlineResponse201</code>.
   * @alias module:model/InlineResponse201
   * @class
   */
  var exports = function() {
    var _this = this;



  };

  /**
   * Constructs a <code>InlineResponse201</code> from a plain JavaScript object, optionally creating a new instance.
   * Copies all relevant properties from <code>data</code> to <code>obj</code> if supplied or a new instance if not.
   * @param {Object} data The plain JavaScript object bearing properties of interest.
   * @param {module:model/InlineResponse201} obj Optional instance to populate.
   * @return {module:model/InlineResponse201} The populated <code>InlineResponse201</code> instance.
   */
  exports.constructFromObject = function(data, obj) {
    if (data) {
      obj = obj || new exports();

      if (data.hasOwnProperty('success')) {
        obj['success'] = ApiClient.convertToType(data['success'], 'Boolean');
      }
      if (data.hasOwnProperty('data')) {
        obj['data'] = TrackingReminder.constructFromObject(data['data']);
      }
    }
    return obj;
  }

  /**
   * @member {Boolean} success
   */
  exports.prototype['success'] = undefined;
  /**
   * @member {module:model/TrackingReminder} data
   */
  exports.prototype['data'] = undefined;



  return exports;
}));



},{"../ApiClient":16,"./TrackingReminder":76}],52:[function(require,module,exports){
/**
 * quantimodo
 * QuantiModo makes it easy to retrieve normalized user data from a wide array of devices and applications. [Learn about QuantiModo](https://quantimo.do), check out our [docs](https://github.com/QuantiModo/docs) or contact us at [help.quantimo.do](https://help.quantimo.do).
 *
 * OpenAPI spec version: 5.8.728
 *
 * NOTE: This class is auto generated by the swagger code generator program.
 * https://github.com/swagger-api/swagger-codegen.git
 *
 * Swagger Codegen version: 2.2.3
 *
 * Do not edit the class manually.
 *
 */

(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define(['ApiClient'], factory);
  } else if (typeof module === 'object' && module.exports) {
    // CommonJS-like environments that support module.exports, like Node.
    module.exports = factory(require('../ApiClient'));
  } else {
    // Browser globals (root is window)
    if (!root.Quantimodo) {
      root.Quantimodo = {};
    }
    root.Quantimodo.JsonErrorResponse = factory(root.Quantimodo.ApiClient);
  }
}(this, function(ApiClient) {
  'use strict';




  /**
   * The JsonErrorResponse model module.
   * @module model/JsonErrorResponse
   * @version 5.8.807
   */

  /**
   * Constructs a new <code>JsonErrorResponse</code>.
   * @alias module:model/JsonErrorResponse
   * @class
   * @param status {String} Status: \"ok\" or \"error\"
   */
  var exports = function(status) {
    var _this = this;

    _this['status'] = status;

  };

  /**
   * Constructs a <code>JsonErrorResponse</code> from a plain JavaScript object, optionally creating a new instance.
   * Copies all relevant properties from <code>data</code> to <code>obj</code> if supplied or a new instance if not.
   * @param {Object} data The plain JavaScript object bearing properties of interest.
   * @param {module:model/JsonErrorResponse} obj Optional instance to populate.
   * @return {module:model/JsonErrorResponse} The populated <code>JsonErrorResponse</code> instance.
   */
  exports.constructFromObject = function(data, obj) {
    if (data) {
      obj = obj || new exports();

      if (data.hasOwnProperty('status')) {
        obj['status'] = ApiClient.convertToType(data['status'], 'String');
      }
      if (data.hasOwnProperty('message')) {
        obj['message'] = ApiClient.convertToType(data['message'], 'String');
      }
    }
    return obj;
  }

  /**
   * Status: \"ok\" or \"error\"
   * @member {String} status
   */
  exports.prototype['status'] = undefined;
  /**
   * Error message
   * @member {String} message
   */
  exports.prototype['message'] = undefined;



  return exports;
}));



},{"../ApiClient":16}],53:[function(require,module,exports){
/**
 * quantimodo
 * QuantiModo makes it easy to retrieve normalized user data from a wide array of devices and applications. [Learn about QuantiModo](https://quantimo.do), check out our [docs](https://github.com/QuantiModo/docs) or contact us at [help.quantimo.do](https://help.quantimo.do).
 *
 * OpenAPI spec version: 5.8.728
 *
 * NOTE: This class is auto generated by the swagger code generator program.
 * https://github.com/swagger-api/swagger-codegen.git
 *
 * Swagger Codegen version: 2.2.3
 *
 * Do not edit the class manually.
 *
 */

(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define(['ApiClient'], factory);
  } else if (typeof module === 'object' && module.exports) {
    // CommonJS-like environments that support module.exports, like Node.
    module.exports = factory(require('../ApiClient'));
  } else {
    // Browser globals (root is window)
    if (!root.Quantimodo) {
      root.Quantimodo = {};
    }
    root.Quantimodo.Lang = factory(root.Quantimodo.ApiClient);
  }
}(this, function(ApiClient) {
  'use strict';




  /**
   * The Lang model module.
   * @module model/Lang
   * @version 5.8.807
   */

  /**
   * Constructs a new <code>Lang</code>.
   * @alias module:model/Lang
   * @class
   * @param loading {String} Example: 
   */
  var exports = function(loading) {
    var _this = this;

    _this['loading'] = loading;
  };

  /**
   * Constructs a <code>Lang</code> from a plain JavaScript object, optionally creating a new instance.
   * Copies all relevant properties from <code>data</code> to <code>obj</code> if supplied or a new instance if not.
   * @param {Object} data The plain JavaScript object bearing properties of interest.
   * @param {module:model/Lang} obj Optional instance to populate.
   * @return {module:model/Lang} The populated <code>Lang</code> instance.
   */
  exports.constructFromObject = function(data, obj) {
    if (data) {
      obj = obj || new exports();

      if (data.hasOwnProperty('loading')) {
        obj['loading'] = ApiClient.convertToType(data['loading'], 'String');
      }
    }
    return obj;
  }

  /**
   * Example: 
   * @member {String} loading
   */
  exports.prototype['loading'] = undefined;



  return exports;
}));



},{"../ApiClient":16}],54:[function(require,module,exports){
/**
 * quantimodo
 * QuantiModo makes it easy to retrieve normalized user data from a wide array of devices and applications. [Learn about QuantiModo](https://quantimo.do), check out our [docs](https://github.com/QuantiModo/docs) or contact us at [help.quantimo.do](https://help.quantimo.do).
 *
 * OpenAPI spec version: 5.8.728
 *
 * NOTE: This class is auto generated by the swagger code generator program.
 * https://github.com/swagger-api/swagger-codegen.git
 *
 * Swagger Codegen version: 2.2.3
 *
 * Do not edit the class manually.
 *
 */

(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define(['ApiClient'], factory);
  } else if (typeof module === 'object' && module.exports) {
    // CommonJS-like environments that support module.exports, like Node.
    module.exports = factory(require('../ApiClient'));
  } else {
    // Browser globals (root is window)
    if (!root.Quantimodo) {
      root.Quantimodo = {};
    }
    root.Quantimodo.Legend = factory(root.Quantimodo.ApiClient);
  }
}(this, function(ApiClient) {
  'use strict';




  /**
   * The Legend model module.
   * @module model/Legend
   * @version 5.8.807
   */

  /**
   * Constructs a new <code>Legend</code>.
   * @alias module:model/Legend
   * @class
   * @param enabled {Boolean} Example: false
   */
  var exports = function(enabled) {
    var _this = this;

    _this['enabled'] = enabled;
  };

  /**
   * Constructs a <code>Legend</code> from a plain JavaScript object, optionally creating a new instance.
   * Copies all relevant properties from <code>data</code> to <code>obj</code> if supplied or a new instance if not.
   * @param {Object} data The plain JavaScript object bearing properties of interest.
   * @param {module:model/Legend} obj Optional instance to populate.
   * @return {module:model/Legend} The populated <code>Legend</code> instance.
   */
  exports.constructFromObject = function(data, obj) {
    if (data) {
      obj = obj || new exports();

      if (data.hasOwnProperty('enabled')) {
        obj['enabled'] = ApiClient.convertToType(data['enabled'], 'Boolean');
      }
    }
    return obj;
  }

  /**
   * Example: false
   * @member {Boolean} enabled
   */
  exports.prototype['enabled'] = undefined;



  return exports;
}));



},{"../ApiClient":16}],55:[function(require,module,exports){
/**
 * quantimodo
 * QuantiModo makes it easy to retrieve normalized user data from a wide array of devices and applications. [Learn about QuantiModo](https://quantimo.do), check out our [docs](https://github.com/QuantiModo/docs) or contact us at [help.quantimo.do](https://help.quantimo.do).
 *
 * OpenAPI spec version: 5.8.728
 *
 * NOTE: This class is auto generated by the swagger code generator program.
 * https://github.com/swagger-api/swagger-codegen.git
 *
 * Swagger Codegen version: 2.2.3
 *
 * Do not edit the class manually.
 *
 */

(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define(['ApiClient', 'model/ChartStyle'], factory);
  } else if (typeof module === 'object' && module.exports) {
    // CommonJS-like environments that support module.exports, like Node.
    module.exports = factory(require('../ApiClient'), require('./ChartStyle'));
  } else {
    // Browser globals (root is window)
    if (!root.Quantimodo) {
      root.Quantimodo = {};
    }
    root.Quantimodo.Loading = factory(root.Quantimodo.ApiClient, root.Quantimodo.ChartStyle);
  }
}(this, function(ApiClient, ChartStyle) {
  'use strict';




  /**
   * The Loading model module.
   * @module model/Loading
   * @version 5.8.807
   */

  /**
   * Constructs a new <code>Loading</code>.
   * @alias module:model/Loading
   * @class
   * @param style {module:model/ChartStyle} 
   * @param hideDuration {Number} Example: 10
   * @param showDuration {Number} Example: 10
   */
  var exports = function(style, hideDuration, showDuration) {
    var _this = this;

    _this['style'] = style;
    _this['hideDuration'] = hideDuration;
    _this['showDuration'] = showDuration;
  };

  /**
   * Constructs a <code>Loading</code> from a plain JavaScript object, optionally creating a new instance.
   * Copies all relevant properties from <code>data</code> to <code>obj</code> if supplied or a new instance if not.
   * @param {Object} data The plain JavaScript object bearing properties of interest.
   * @param {module:model/Loading} obj Optional instance to populate.
   * @return {module:model/Loading} The populated <code>Loading</code> instance.
   */
  exports.constructFromObject = function(data, obj) {
    if (data) {
      obj = obj || new exports();

      if (data.hasOwnProperty('style')) {
        obj['style'] = ChartStyle.constructFromObject(data['style']);
      }
      if (data.hasOwnProperty('hideDuration')) {
        obj['hideDuration'] = ApiClient.convertToType(data['hideDuration'], 'Number');
      }
      if (data.hasOwnProperty('showDuration')) {
        obj['showDuration'] = ApiClient.convertToType(data['showDuration'], 'Number');
      }
    }
    return obj;
  }

  /**
   * @member {module:model/ChartStyle} style
   */
  exports.prototype['style'] = undefined;
  /**
   * Example: 10
   * @member {Number} hideDuration
   */
  exports.prototype['hideDuration'] = undefined;
  /**
   * Example: 10
   * @member {Number} showDuration
   */
  exports.prototype['showDuration'] = undefined;



  return exports;
}));



},{"../ApiClient":16,"./ChartStyle":32}],56:[function(require,module,exports){
/**
 * quantimodo
 * QuantiModo makes it easy to retrieve normalized user data from a wide array of devices and applications. [Learn about QuantiModo](https://quantimo.do), check out our [docs](https://github.com/QuantiModo/docs) or contact us at [help.quantimo.do](https://help.quantimo.do).
 *
 * OpenAPI spec version: 5.8.728
 *
 * NOTE: This class is auto generated by the swagger code generator program.
 * https://github.com/swagger-api/swagger-codegen.git
 *
 * Swagger Codegen version: 2.2.3
 *
 * Do not edit the class manually.
 *
 */

(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define(['ApiClient', 'model/State'], factory);
  } else if (typeof module === 'object' && module.exports) {
    // CommonJS-like environments that support module.exports, like Node.
    module.exports = factory(require('../ApiClient'), require('./State'));
  } else {
    // Browser globals (root is window)
    if (!root.Quantimodo) {
      root.Quantimodo = {};
    }
    root.Quantimodo.Marker = factory(root.Quantimodo.ApiClient, root.Quantimodo.State);
  }
}(this, function(ApiClient, State) {
  'use strict';




  /**
   * The Marker model module.
   * @module model/Marker
   * @version 5.8.807
   */

  /**
   * Constructs a new <code>Marker</code>.
   * @alias module:model/Marker
   * @class
   * @param radius {Number} Example: 5
   * @param states {module:model/State} 
   * @param enabled {Boolean} Example: false
   */
  var exports = function(radius, states, enabled) {
    var _this = this;

    _this['radius'] = radius;
    _this['states'] = states;
    _this['enabled'] = enabled;
  };

  /**
   * Constructs a <code>Marker</code> from a plain JavaScript object, optionally creating a new instance.
   * Copies all relevant properties from <code>data</code> to <code>obj</code> if supplied or a new instance if not.
   * @param {Object} data The plain JavaScript object bearing properties of interest.
   * @param {module:model/Marker} obj Optional instance to populate.
   * @return {module:model/Marker} The populated <code>Marker</code> instance.
   */
  exports.constructFromObject = function(data, obj) {
    if (data) {
      obj = obj || new exports();

      if (data.hasOwnProperty('radius')) {
        obj['radius'] = ApiClient.convertToType(data['radius'], 'Number');
      }
      if (data.hasOwnProperty('states')) {
        obj['states'] = State.constructFromObject(data['states']);
      }
      if (data.hasOwnProperty('enabled')) {
        obj['enabled'] = ApiClient.convertToType(data['enabled'], 'Boolean');
      }
    }
    return obj;
  }

  /**
   * Example: 5
   * @member {Number} radius
   */
  exports.prototype['radius'] = undefined;
  /**
   * @member {module:model/State} states
   */
  exports.prototype['states'] = undefined;
  /**
   * Example: false
   * @member {Boolean} enabled
   */
  exports.prototype['enabled'] = undefined;



  return exports;
}));



},{"../ApiClient":16,"./State":70}],57:[function(require,module,exports){
/**
 * quantimodo
 * QuantiModo makes it easy to retrieve normalized user data from a wide array of devices and applications. [Learn about QuantiModo](https://quantimo.do), check out our [docs](https://github.com/QuantiModo/docs) or contact us at [help.quantimo.do](https://help.quantimo.do).
 *
 * OpenAPI spec version: 5.8.728
 *
 * NOTE: This class is auto generated by the swagger code generator program.
 * https://github.com/swagger-api/swagger-codegen.git
 *
 * Swagger Codegen version: 2.2.3
 *
 * Do not edit the class manually.
 *
 */

(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define(['ApiClient'], factory);
  } else if (typeof module === 'object' && module.exports) {
    // CommonJS-like environments that support module.exports, like Node.
    module.exports = factory(require('../ApiClient'));
  } else {
    // Browser globals (root is window)
    if (!root.Quantimodo) {
      root.Quantimodo = {};
    }
    root.Quantimodo.Measurement = factory(root.Quantimodo.ApiClient);
  }
}(this, function(ApiClient) {
  'use strict';




  /**
   * The Measurement model module.
   * @module model/Measurement
   * @version 5.8.807
   */

  /**
   * Constructs a new <code>Measurement</code>.
   * @alias module:model/Measurement
   * @class
   * @param variableName {String} Name of the variable for which we are creating the measurement records
   * @param sourceName {String} Application or device used to record the measurement values
   * @param startTimeString {String} Start Time for the measurement event in UTC ISO 8601 `YYYY-MM-DDThh:mm:ss`
   * @param value {Number} Converted measurement value in requested unit
   * @param unitAbbreviatedName {String} Abbreviated name for the unit of measurement
   */
  var exports = function(variableName, sourceName, startTimeString, value, unitAbbreviatedName) {
    var _this = this;

    _this['variableName'] = variableName;
    _this['sourceName'] = sourceName;
    _this['startTimeString'] = startTimeString;

    _this['value'] = value;


    _this['unitAbbreviatedName'] = unitAbbreviatedName;






































  };

  /**
   * Constructs a <code>Measurement</code> from a plain JavaScript object, optionally creating a new instance.
   * Copies all relevant properties from <code>data</code> to <code>obj</code> if supplied or a new instance if not.
   * @param {Object} data The plain JavaScript object bearing properties of interest.
   * @param {module:model/Measurement} obj Optional instance to populate.
   * @return {module:model/Measurement} The populated <code>Measurement</code> instance.
   */
  exports.constructFromObject = function(data, obj) {
    if (data) {
      obj = obj || new exports();

      if (data.hasOwnProperty('variableName')) {
        obj['variableName'] = ApiClient.convertToType(data['variableName'], 'String');
      }
      if (data.hasOwnProperty('sourceName')) {
        obj['sourceName'] = ApiClient.convertToType(data['sourceName'], 'String');
      }
      if (data.hasOwnProperty('startTimeString')) {
        obj['startTimeString'] = ApiClient.convertToType(data['startTimeString'], 'String');
      }
      if (data.hasOwnProperty('startTimeEpoch')) {
        obj['startTimeEpoch'] = ApiClient.convertToType(data['startTimeEpoch'], 'Number');
      }
      if (data.hasOwnProperty('value')) {
        obj['value'] = ApiClient.convertToType(data['value'], 'Number');
      }
      if (data.hasOwnProperty('originalValue')) {
        obj['originalValue'] = ApiClient.convertToType(data['originalValue'], 'Number');
      }
      if (data.hasOwnProperty('originalunitAbbreviatedName')) {
        obj['originalunitAbbreviatedName'] = ApiClient.convertToType(data['originalunitAbbreviatedName'], 'String');
      }
      if (data.hasOwnProperty('unitAbbreviatedName')) {
        obj['unitAbbreviatedName'] = ApiClient.convertToType(data['unitAbbreviatedName'], 'String');
      }
      if (data.hasOwnProperty('note')) {
        obj['note'] = ApiClient.convertToType(data['note'], 'String');
      }
      if (data.hasOwnProperty('unitId')) {
        obj['unitId'] = ApiClient.convertToType(data['unitId'], 'Number');
      }
      if (data.hasOwnProperty('variableId')) {
        obj['variableId'] = ApiClient.convertToType(data['variableId'], 'Number');
      }
      if (data.hasOwnProperty('variableCategoryId')) {
        obj['variableCategoryId'] = ApiClient.convertToType(data['variableCategoryId'], 'Number');
      }
      if (data.hasOwnProperty('userVariableDefaultUnitId')) {
        obj['userVariableDefaultUnitId'] = ApiClient.convertToType(data['userVariableDefaultUnitId'], 'Number');
      }
      if (data.hasOwnProperty('id')) {
        obj['id'] = ApiClient.convertToType(data['id'], 'Number');
      }
      if (data.hasOwnProperty('originalUnitId')) {
        obj['originalUnitId'] = ApiClient.convertToType(data['originalUnitId'], 'Number');
      }
      if (data.hasOwnProperty('clientId')) {
        obj['clientId'] = ApiClient.convertToType(data['clientId'], 'String');
      }
      if (data.hasOwnProperty('createdAt')) {
        obj['createdAt'] = ApiClient.convertToType(data['createdAt'], 'String');
      }
      if (data.hasOwnProperty('updatedAt')) {
        obj['updatedAt'] = ApiClient.convertToType(data['updatedAt'], 'String');
      }
      if (data.hasOwnProperty('variableCategoryName')) {
        obj['variableCategoryName'] = ApiClient.convertToType(data['variableCategoryName'], 'String');
      }
      if (data.hasOwnProperty('userVariableVariableCategoryId')) {
        obj['userVariableVariableCategoryId'] = ApiClient.convertToType(data['userVariableVariableCategoryId'], 'Number');
      }
      if (data.hasOwnProperty('ionIcon')) {
        obj['ionIcon'] = ApiClient.convertToType(data['ionIcon'], 'String');
      }
      if (data.hasOwnProperty('svgUrl')) {
        obj['svgUrl'] = ApiClient.convertToType(data['svgUrl'], 'String');
      }
      if (data.hasOwnProperty('pngUrl')) {
        obj['pngUrl'] = ApiClient.convertToType(data['pngUrl'], 'String');
      }
      if (data.hasOwnProperty('pngPath')) {
        obj['pngPath'] = ApiClient.convertToType(data['pngPath'], 'String');
      }
      if (data.hasOwnProperty('variableCategoryImageUrl')) {
        obj['variableCategoryImageUrl'] = ApiClient.convertToType(data['variableCategoryImageUrl'], 'String');
      }
      if (data.hasOwnProperty('manualTracking')) {
        obj['manualTracking'] = ApiClient.convertToType(data['manualTracking'], 'Boolean');
      }
      if (data.hasOwnProperty('userVariableVariableCategoryName')) {
        obj['userVariableVariableCategoryName'] = ApiClient.convertToType(data['userVariableVariableCategoryName'], 'String');
      }
      if (data.hasOwnProperty('unitName')) {
        obj['unitName'] = ApiClient.convertToType(data['unitName'], 'String');
      }
      if (data.hasOwnProperty('unitCategoryId')) {
        obj['unitCategoryId'] = ApiClient.convertToType(data['unitCategoryId'], 'Number');
      }
      if (data.hasOwnProperty('unitCategoryName')) {
        obj['unitCategoryName'] = ApiClient.convertToType(data['unitCategoryName'], 'String');
      }
      if (data.hasOwnProperty('userVariableDefaultUnitName')) {
        obj['userVariableDefaultUnitName'] = ApiClient.convertToType(data['userVariableDefaultUnitName'], 'String');
      }
      if (data.hasOwnProperty('userVariableDefaultUnitAbbreviatedName')) {
        obj['userVariableDefaultUnitAbbreviatedName'] = ApiClient.convertToType(data['userVariableDefaultUnitAbbreviatedName'], 'String');
      }
      if (data.hasOwnProperty('userVariableDefaultUnitCategoryId')) {
        obj['userVariableDefaultUnitCategoryId'] = ApiClient.convertToType(data['userVariableDefaultUnitCategoryId'], 'Number');
      }
      if (data.hasOwnProperty('userVariableDefaultUnitCategoryName')) {
        obj['userVariableDefaultUnitCategoryName'] = ApiClient.convertToType(data['userVariableDefaultUnitCategoryName'], 'String');
      }
      if (data.hasOwnProperty('originalUnitName')) {
        obj['originalUnitName'] = ApiClient.convertToType(data['originalUnitName'], 'String');
      }
      if (data.hasOwnProperty('originalUnitAbbreviatedName')) {
        obj['originalUnitAbbreviatedName'] = ApiClient.convertToType(data['originalUnitAbbreviatedName'], 'String');
      }
      if (data.hasOwnProperty('originalUnitCategoryId')) {
        obj['originalUnitCategoryId'] = ApiClient.convertToType(data['originalUnitCategoryId'], 'Number');
      }
      if (data.hasOwnProperty('originalUnitCategoryName')) {
        obj['originalUnitCategoryName'] = ApiClient.convertToType(data['originalUnitCategoryName'], 'String');
      }
      if (data.hasOwnProperty('inputType')) {
        obj['inputType'] = ApiClient.convertToType(data['inputType'], 'String');
      }
      if (data.hasOwnProperty('variableDescription')) {
        obj['variableDescription'] = ApiClient.convertToType(data['variableDescription'], 'String');
      }
      if (data.hasOwnProperty('valence')) {
        obj['valence'] = ApiClient.convertToType(data['valence'], 'String');
      }
      if (data.hasOwnProperty('iconIcon')) {
        obj['iconIcon'] = ApiClient.convertToType(data['iconIcon'], 'String');
      }
      if (data.hasOwnProperty('minimumAllowedValue')) {
        obj['minimumAllowedValue'] = ApiClient.convertToType(data['minimumAllowedValue'], 'Number');
      }
      if (data.hasOwnProperty('maximumAllowedValue')) {
        obj['maximumAllowedValue'] = ApiClient.convertToType(data['maximumAllowedValue'], 'Number');
      }
      if (data.hasOwnProperty('startDate')) {
        obj['startDate'] = ApiClient.convertToType(data['startDate'], 'String');
      }
      if (data.hasOwnProperty('connectorId')) {
        obj['connectorId'] = ApiClient.convertToType(data['connectorId'], 'Number');
      }
    }
    return obj;
  }

  /**
   * Name of the variable for which we are creating the measurement records
   * @member {String} variableName
   */
  exports.prototype['variableName'] = undefined;
  /**
   * Application or device used to record the measurement values
   * @member {String} sourceName
   */
  exports.prototype['sourceName'] = undefined;
  /**
   * Start Time for the measurement event in UTC ISO 8601 `YYYY-MM-DDThh:mm:ss`
   * @member {String} startTimeString
   */
  exports.prototype['startTimeString'] = undefined;
  /**
   * Seconds between the start of the event measured and 1970 (Unix timestamp)
   * @member {Number} startTimeEpoch
   */
  exports.prototype['startTimeEpoch'] = undefined;
  /**
   * Converted measurement value in requested unit
   * @member {Number} value
   */
  exports.prototype['value'] = undefined;
  /**
   * Original value as originally submitted
   * @member {Number} originalValue
   */
  exports.prototype['originalValue'] = undefined;
  /**
   * Original Unit of measurement as originally submitted
   * @member {String} originalunitAbbreviatedName
   */
  exports.prototype['originalunitAbbreviatedName'] = undefined;
  /**
   * Abbreviated name for the unit of measurement
   * @member {String} unitAbbreviatedName
   */
  exports.prototype['unitAbbreviatedName'] = undefined;
  /**
   * Note of measurement
   * @member {String} note
   */
  exports.prototype['note'] = undefined;
  /**
   * Example: 23
   * @member {Number} unitId
   */
  exports.prototype['unitId'] = undefined;
  /**
   * Example: 5956846
   * @member {Number} variableId
   */
  exports.prototype['variableId'] = undefined;
  /**
   * Example: 13
   * @member {Number} variableCategoryId
   */
  exports.prototype['variableCategoryId'] = undefined;
  /**
   * Example: 23
   * @member {Number} userVariableDefaultUnitId
   */
  exports.prototype['userVariableDefaultUnitId'] = undefined;
  /**
   * Example: 1051466127
   * @member {Number} id
   */
  exports.prototype['id'] = undefined;
  /**
   * Example: 23
   * @member {Number} originalUnitId
   */
  exports.prototype['originalUnitId'] = undefined;
  /**
   * Example: quantimodo
   * @member {String} clientId
   */
  exports.prototype['clientId'] = undefined;
  /**
   * Example: 2017-07-30 21:08:36
   * @member {String} createdAt
   */
  exports.prototype['createdAt'] = undefined;
  /**
   * Example: 2017-07-30 21:08:36
   * @member {String} updatedAt
   */
  exports.prototype['updatedAt'] = undefined;
  /**
   * Example: Treatments
   * @member {String} variableCategoryName
   */
  exports.prototype['variableCategoryName'] = undefined;
  /**
   * Example: 13
   * @member {Number} userVariableVariableCategoryId
   */
  exports.prototype['userVariableVariableCategoryId'] = undefined;
  /**
   * Example: ion-ios-medkit-outline
   * @member {String} ionIcon
   */
  exports.prototype['ionIcon'] = undefined;
  /**
   * Example: https://app.quantimo.do/ionic/Modo/www/img/variable_categories/treatments.svg
   * @member {String} svgUrl
   */
  exports.prototype['svgUrl'] = undefined;
  /**
   * Example: https://app.quantimo.do/ionic/Modo/www/img/variable_categories/treatments.png
   * @member {String} pngUrl
   */
  exports.prototype['pngUrl'] = undefined;
  /**
   * Example: img/variable_categories/treatments.png
   * @member {String} pngPath
   */
  exports.prototype['pngPath'] = undefined;
  /**
   * Example: https://maxcdn.icons8.com/Color/PNG/96/Healthcare/pill-96.png
   * @member {String} variableCategoryImageUrl
   */
  exports.prototype['variableCategoryImageUrl'] = undefined;
  /**
   * Example: 1
   * @member {Boolean} manualTracking
   */
  exports.prototype['manualTracking'] = undefined;
  /**
   * Example: Treatments
   * @member {String} userVariableVariableCategoryName
   */
  exports.prototype['userVariableVariableCategoryName'] = undefined;
  /**
   * Example: Count
   * @member {String} unitName
   */
  exports.prototype['unitName'] = undefined;
  /**
   * Example: 6
   * @member {Number} unitCategoryId
   */
  exports.prototype['unitCategoryId'] = undefined;
  /**
   * Example: Miscellany
   * @member {String} unitCategoryName
   */
  exports.prototype['unitCategoryName'] = undefined;
  /**
   * Example: Count
   * @member {String} userVariableDefaultUnitName
   */
  exports.prototype['userVariableDefaultUnitName'] = undefined;
  /**
   * Example: count
   * @member {String} userVariableDefaultUnitAbbreviatedName
   */
  exports.prototype['userVariableDefaultUnitAbbreviatedName'] = undefined;
  /**
   * Example: 6
   * @member {Number} userVariableDefaultUnitCategoryId
   */
  exports.prototype['userVariableDefaultUnitCategoryId'] = undefined;
  /**
   * Example: Miscellany
   * @member {String} userVariableDefaultUnitCategoryName
   */
  exports.prototype['userVariableDefaultUnitCategoryName'] = undefined;
  /**
   * Example: Count
   * @member {String} originalUnitName
   */
  exports.prototype['originalUnitName'] = undefined;
  /**
   * Example: count
   * @member {String} originalUnitAbbreviatedName
   */
  exports.prototype['originalUnitAbbreviatedName'] = undefined;
  /**
   * Example: 6
   * @member {Number} originalUnitCategoryId
   */
  exports.prototype['originalUnitCategoryId'] = undefined;
  /**
   * Example: Miscellany
   * @member {String} originalUnitCategoryName
   */
  exports.prototype['originalUnitCategoryName'] = undefined;
  /**
   * Example: value
   * @member {String} inputType
   */
  exports.prototype['inputType'] = undefined;
  /**
   * Example: negative
   * @member {String} variableDescription
   */
  exports.prototype['variableDescription'] = undefined;
  /**
   * Example: negative
   * @member {String} valence
   */
  exports.prototype['valence'] = undefined;
  /**
   * Example: ion-sad-outline
   * @member {String} iconIcon
   */
  exports.prototype['iconIcon'] = undefined;
  /**
   * Example: 1
   * @member {Number} minimumAllowedValue
   */
  exports.prototype['minimumAllowedValue'] = undefined;
  /**
   * Example: 5
   * @member {Number} maximumAllowedValue
   */
  exports.prototype['maximumAllowedValue'] = undefined;
  /**
   * Example: 2014-08-27
   * @member {String} startDate
   */
  exports.prototype['startDate'] = undefined;
  /**
   * Example: 13
   * @member {Number} connectorId
   */
  exports.prototype['connectorId'] = undefined;



  return exports;
}));



},{"../ApiClient":16}],58:[function(require,module,exports){
/**
 * quantimodo
 * QuantiModo makes it easy to retrieve normalized user data from a wide array of devices and applications. [Learn about QuantiModo](https://quantimo.do), check out our [docs](https://github.com/QuantiModo/docs) or contact us at [help.quantimo.do](https://help.quantimo.do).
 *
 * OpenAPI spec version: 5.8.728
 *
 * NOTE: This class is auto generated by the swagger code generator program.
 * https://github.com/swagger-api/swagger-codegen.git
 *
 * Swagger Codegen version: 2.2.3
 *
 * Do not edit the class manually.
 *
 */

(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define(['ApiClient'], factory);
  } else if (typeof module === 'object' && module.exports) {
    // CommonJS-like environments that support module.exports, like Node.
    module.exports = factory(require('../ApiClient'));
  } else {
    // Browser globals (root is window)
    if (!root.Quantimodo) {
      root.Quantimodo = {};
    }
    root.Quantimodo.MeasurementDelete = factory(root.Quantimodo.ApiClient);
  }
}(this, function(ApiClient) {
  'use strict';




  /**
   * The MeasurementDelete model module.
   * @module model/MeasurementDelete
   * @version 5.8.807
   */

  /**
   * Constructs a new <code>MeasurementDelete</code>.
   * @alias module:model/MeasurementDelete
   * @class
   * @param variableId {Number} Variable id of the measurement to be deleted
   * @param startTime {Number} Start time of the measurement to be deleted
   */
  var exports = function(variableId, startTime) {
    var _this = this;

    _this['variableId'] = variableId;
    _this['startTime'] = startTime;
  };

  /**
   * Constructs a <code>MeasurementDelete</code> from a plain JavaScript object, optionally creating a new instance.
   * Copies all relevant properties from <code>data</code> to <code>obj</code> if supplied or a new instance if not.
   * @param {Object} data The plain JavaScript object bearing properties of interest.
   * @param {module:model/MeasurementDelete} obj Optional instance to populate.
   * @return {module:model/MeasurementDelete} The populated <code>MeasurementDelete</code> instance.
   */
  exports.constructFromObject = function(data, obj) {
    if (data) {
      obj = obj || new exports();

      if (data.hasOwnProperty('variableId')) {
        obj['variableId'] = ApiClient.convertToType(data['variableId'], 'Number');
      }
      if (data.hasOwnProperty('startTime')) {
        obj['startTime'] = ApiClient.convertToType(data['startTime'], 'Number');
      }
    }
    return obj;
  }

  /**
   * Variable id of the measurement to be deleted
   * @member {Number} variableId
   */
  exports.prototype['variableId'] = undefined;
  /**
   * Start time of the measurement to be deleted
   * @member {Number} startTime
   */
  exports.prototype['startTime'] = undefined;



  return exports;
}));



},{"../ApiClient":16}],59:[function(require,module,exports){
/**
 * quantimodo
 * QuantiModo makes it easy to retrieve normalized user data from a wide array of devices and applications. [Learn about QuantiModo](https://quantimo.do), check out our [docs](https://github.com/QuantiModo/docs) or contact us at [help.quantimo.do](https://help.quantimo.do).
 *
 * OpenAPI spec version: 5.8.728
 *
 * NOTE: This class is auto generated by the swagger code generator program.
 * https://github.com/swagger-api/swagger-codegen.git
 *
 * Swagger Codegen version: 2.2.3
 *
 * Do not edit the class manually.
 *
 */

(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define(['ApiClient'], factory);
  } else if (typeof module === 'object' && module.exports) {
    // CommonJS-like environments that support module.exports, like Node.
    module.exports = factory(require('../ApiClient'));
  } else {
    // Browser globals (root is window)
    if (!root.Quantimodo) {
      root.Quantimodo = {};
    }
    root.Quantimodo.MeasurementItem = factory(root.Quantimodo.ApiClient);
  }
}(this, function(ApiClient) {
  'use strict';




  /**
   * The MeasurementItem model module.
   * @module model/MeasurementItem
   * @version 5.8.807
   */

  /**
   * Constructs a new <code>MeasurementItem</code>.
   * @alias module:model/MeasurementItem
   * @class
   * @param timestamp {Number} Timestamp for the measurement event in epoch time (unixtime)
   * @param value {Number} Measurement value
   */
  var exports = function(timestamp, value) {
    var _this = this;

    _this['timestamp'] = timestamp;
    _this['value'] = value;

  };

  /**
   * Constructs a <code>MeasurementItem</code> from a plain JavaScript object, optionally creating a new instance.
   * Copies all relevant properties from <code>data</code> to <code>obj</code> if supplied or a new instance if not.
   * @param {Object} data The plain JavaScript object bearing properties of interest.
   * @param {module:model/MeasurementItem} obj Optional instance to populate.
   * @return {module:model/MeasurementItem} The populated <code>MeasurementItem</code> instance.
   */
  exports.constructFromObject = function(data, obj) {
    if (data) {
      obj = obj || new exports();

      if (data.hasOwnProperty('timestamp')) {
        obj['timestamp'] = ApiClient.convertToType(data['timestamp'], 'Number');
      }
      if (data.hasOwnProperty('value')) {
        obj['value'] = ApiClient.convertToType(data['value'], 'Number');
      }
      if (data.hasOwnProperty('note')) {
        obj['note'] = ApiClient.convertToType(data['note'], 'String');
      }
    }
    return obj;
  }

  /**
   * Timestamp for the measurement event in epoch time (unixtime)
   * @member {Number} timestamp
   */
  exports.prototype['timestamp'] = undefined;
  /**
   * Measurement value
   * @member {Number} value
   */
  exports.prototype['value'] = undefined;
  /**
   * Optional note to include with the measurement
   * @member {String} note
   */
  exports.prototype['note'] = undefined;



  return exports;
}));



},{"../ApiClient":16}],60:[function(require,module,exports){
/**
 * quantimodo
 * QuantiModo makes it easy to retrieve normalized user data from a wide array of devices and applications. [Learn about QuantiModo](https://quantimo.do), check out our [docs](https://github.com/QuantiModo/docs) or contact us at [help.quantimo.do](https://help.quantimo.do).
 *
 * OpenAPI spec version: 5.8.728
 *
 * NOTE: This class is auto generated by the swagger code generator program.
 * https://github.com/swagger-api/swagger-codegen.git
 *
 * Swagger Codegen version: 2.2.3
 *
 * Do not edit the class manually.
 *
 */

(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define(['ApiClient', 'model/MeasurementItem'], factory);
  } else if (typeof module === 'object' && module.exports) {
    // CommonJS-like environments that support module.exports, like Node.
    module.exports = factory(require('../ApiClient'), require('./MeasurementItem'));
  } else {
    // Browser globals (root is window)
    if (!root.Quantimodo) {
      root.Quantimodo = {};
    }
    root.Quantimodo.MeasurementSet = factory(root.Quantimodo.ApiClient, root.Quantimodo.MeasurementItem);
  }
}(this, function(ApiClient, MeasurementItem) {
  'use strict';




  /**
   * The MeasurementSet model module.
   * @module model/MeasurementSet
   * @version 5.8.807
   */

  /**
   * Constructs a new <code>MeasurementSet</code>.
   * @alias module:model/MeasurementSet
   * @class
   * @param measurementItems {Array.<module:model/MeasurementItem>} Array of timestamps, values, and optional notes
   * @param variableName {String} ORIGINAL name of the variable for which we are creating the measurement records
   * @param sourceName {String} Name of the application or device used to record the measurement values
   * @param unitAbbreviatedName {String} Unit of measurement
   */
  var exports = function(measurementItems, variableName, sourceName, unitAbbreviatedName) {
    var _this = this;

    _this['measurementItems'] = measurementItems;
    _this['variableName'] = variableName;
    _this['sourceName'] = sourceName;


    _this['unitAbbreviatedName'] = unitAbbreviatedName;
  };

  /**
   * Constructs a <code>MeasurementSet</code> from a plain JavaScript object, optionally creating a new instance.
   * Copies all relevant properties from <code>data</code> to <code>obj</code> if supplied or a new instance if not.
   * @param {Object} data The plain JavaScript object bearing properties of interest.
   * @param {module:model/MeasurementSet} obj Optional instance to populate.
   * @return {module:model/MeasurementSet} The populated <code>MeasurementSet</code> instance.
   */
  exports.constructFromObject = function(data, obj) {
    if (data) {
      obj = obj || new exports();

      if (data.hasOwnProperty('measurementItems')) {
        obj['measurementItems'] = ApiClient.convertToType(data['measurementItems'], [MeasurementItem]);
      }
      if (data.hasOwnProperty('variableName')) {
        obj['variableName'] = ApiClient.convertToType(data['variableName'], 'String');
      }
      if (data.hasOwnProperty('sourceName')) {
        obj['sourceName'] = ApiClient.convertToType(data['sourceName'], 'String');
      }
      if (data.hasOwnProperty('variableCategoryName')) {
        obj['variableCategoryName'] = ApiClient.convertToType(data['variableCategoryName'], 'String');
      }
      if (data.hasOwnProperty('combinationOperation')) {
        obj['combinationOperation'] = ApiClient.convertToType(data['combinationOperation'], 'String');
      }
      if (data.hasOwnProperty('unitAbbreviatedName')) {
        obj['unitAbbreviatedName'] = ApiClient.convertToType(data['unitAbbreviatedName'], 'String');
      }
    }
    return obj;
  }

  /**
   * Array of timestamps, values, and optional notes
   * @member {Array.<module:model/MeasurementItem>} measurementItems
   */
  exports.prototype['measurementItems'] = undefined;
  /**
   * ORIGINAL name of the variable for which we are creating the measurement records
   * @member {String} variableName
   */
  exports.prototype['variableName'] = undefined;
  /**
   * Name of the application or device used to record the measurement values
   * @member {String} sourceName
   */
  exports.prototype['sourceName'] = undefined;
  /**
   * Variable category name
   * @member {String} variableCategoryName
   */
  exports.prototype['variableCategoryName'] = undefined;
  /**
   * Way to aggregate measurements over time. Options are \"MEAN\" or \"SUM\". SUM should be used for things like minutes of exercise.  If you use MEAN for exercise, then a person might exercise more minutes in one day but add separate measurements that were smaller.  So when we are doing correlational analysis, we would think that the person exercised less that day even though they exercised more.  Conversely, we must use MEAN for things such as ratings which cannot be SUMMED.
   * @member {module:model/MeasurementSet.CombinationOperationEnum} combinationOperation
   */
  exports.prototype['combinationOperation'] = undefined;
  /**
   * Unit of measurement
   * @member {String} unitAbbreviatedName
   */
  exports.prototype['unitAbbreviatedName'] = undefined;


  /**
   * Allowed values for the <code>combinationOperation</code> property.
   * @enum {String}
   * @readonly
   */
  exports.CombinationOperationEnum = {
    /**
     * value: "MEAN"
     * @const
     */
    "MEAN": "MEAN",
    /**
     * value: "SUM"
     * @const
     */
    "SUM": "SUM"  };


  return exports;
}));



},{"../ApiClient":16,"./MeasurementItem":59}],61:[function(require,module,exports){
/**
 * quantimodo
 * QuantiModo makes it easy to retrieve normalized user data from a wide array of devices and applications. [Learn about QuantiModo](https://quantimo.do), check out our [docs](https://github.com/QuantiModo/docs) or contact us at [help.quantimo.do](https://help.quantimo.do).
 *
 * OpenAPI spec version: 5.8.728
 *
 * NOTE: This class is auto generated by the swagger code generator program.
 * https://github.com/swagger-api/swagger-codegen.git
 *
 * Swagger Codegen version: 2.2.3
 *
 * Do not edit the class manually.
 *
 */

(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define(['ApiClient'], factory);
  } else if (typeof module === 'object' && module.exports) {
    // CommonJS-like environments that support module.exports, like Node.
    module.exports = factory(require('../ApiClient'));
  } else {
    // Browser globals (root is window)
    if (!root.Quantimodo) {
      root.Quantimodo = {};
    }
    root.Quantimodo.MeasurementUpdate = factory(root.Quantimodo.ApiClient);
  }
}(this, function(ApiClient) {
  'use strict';




  /**
   * The MeasurementUpdate model module.
   * @module model/MeasurementUpdate
   * @version 5.8.807
   */

  /**
   * Constructs a new <code>MeasurementUpdate</code>.
   * @alias module:model/MeasurementUpdate
   * @class
   * @param id {Number} Variable id of the measurement to be updated
   */
  var exports = function(id) {
    var _this = this;

    _this['id'] = id;



  };

  /**
   * Constructs a <code>MeasurementUpdate</code> from a plain JavaScript object, optionally creating a new instance.
   * Copies all relevant properties from <code>data</code> to <code>obj</code> if supplied or a new instance if not.
   * @param {Object} data The plain JavaScript object bearing properties of interest.
   * @param {module:model/MeasurementUpdate} obj Optional instance to populate.
   * @return {module:model/MeasurementUpdate} The populated <code>MeasurementUpdate</code> instance.
   */
  exports.constructFromObject = function(data, obj) {
    if (data) {
      obj = obj || new exports();

      if (data.hasOwnProperty('id')) {
        obj['id'] = ApiClient.convertToType(data['id'], 'Number');
      }
      if (data.hasOwnProperty('startTime')) {
        obj['startTime'] = ApiClient.convertToType(data['startTime'], 'Number');
      }
      if (data.hasOwnProperty('value')) {
        obj['value'] = ApiClient.convertToType(data['value'], 'Number');
      }
      if (data.hasOwnProperty('note')) {
        obj['note'] = ApiClient.convertToType(data['note'], 'String');
      }
    }
    return obj;
  }

  /**
   * Variable id of the measurement to be updated
   * @member {Number} id
   */
  exports.prototype['id'] = undefined;
  /**
   * The new timestamp for the the event in epoch seconds (optional)
   * @member {Number} startTime
   */
  exports.prototype['startTime'] = undefined;
  /**
   * The new value of for the measurement (optional)
   * @member {Number} value
   */
  exports.prototype['value'] = undefined;
  /**
   * The new note for the measurement (optional)
   * @member {String} note
   */
  exports.prototype['note'] = undefined;



  return exports;
}));



},{"../ApiClient":16}],62:[function(require,module,exports){
/**
 * quantimodo
 * QuantiModo makes it easy to retrieve normalized user data from a wide array of devices and applications. [Learn about QuantiModo](https://quantimo.do), check out our [docs](https://github.com/QuantiModo/docs) or contact us at [help.quantimo.do](https://help.quantimo.do).
 *
 * OpenAPI spec version: 5.8.728
 *
 * NOTE: This class is auto generated by the swagger code generator program.
 * https://github.com/swagger-api/swagger-codegen.git
 *
 * Swagger Codegen version: 2.2.3
 *
 * Do not edit the class manually.
 *
 */

(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define(['ApiClient', 'model/Chart', 'model/Color', 'model/Credit', 'model/Lang', 'model/Legend', 'model/Loading', 'model/PlotOption', 'model/Title', 'model/XAxi', 'model/YAxi'], factory);
  } else if (typeof module === 'object' && module.exports) {
    // CommonJS-like environments that support module.exports, like Node.
    module.exports = factory(require('../ApiClient'), require('./Chart'), require('./Color'), require('./Credit'), require('./Lang'), require('./Legend'), require('./Loading'), require('./PlotOption'), require('./Title'), require('./XAxi'), require('./YAxi'));
  } else {
    // Browser globals (root is window)
    if (!root.Quantimodo) {
      root.Quantimodo = {};
    }
    root.Quantimodo.Option = factory(root.Quantimodo.ApiClient, root.Quantimodo.Chart, root.Quantimodo.Color, root.Quantimodo.Credit, root.Quantimodo.Lang, root.Quantimodo.Legend, root.Quantimodo.Loading, root.Quantimodo.PlotOption, root.Quantimodo.Title, root.Quantimodo.XAxi, root.Quantimodo.YAxi);
  }
}(this, function(ApiClient, Chart, Color, Credit, Lang, Legend, Loading, PlotOption, Title, XAxi, YAxi) {
  'use strict';




  /**
   * The Option model module.
   * @module model/Option
   * @version 5.8.807
   */

  /**
   * Constructs a new <code>Option</code>.
   * @alias module:model/Option
   * @class
   * @param chart {module:model/Chart} 
   * @param plotOptions {module:model/PlotOption} 
   * @param credits {module:model/Credit} 
   * @param yAxis {Array.<module:model/YAxi>} 
   * @param title {module:model/Title} 
   * @param xAxis {module:model/XAxi} 
   * @param lang {module:model/Lang} 
   * @param loading {module:model/Loading} 
   * @param legend {module:model/Legend} 
   * @param colors {Array.<module:model/Color>} 
   */
  var exports = function(chart, plotOptions, credits, yAxis, title, xAxis, lang, loading, legend, colors) {
    var _this = this;

    _this['chart'] = chart;
    _this['plotOptions'] = plotOptions;
    _this['credits'] = credits;
    _this['yAxis'] = yAxis;
    _this['title'] = title;
    _this['xAxis'] = xAxis;
    _this['lang'] = lang;
    _this['loading'] = loading;
    _this['legend'] = legend;
    _this['colors'] = colors;
  };

  /**
   * Constructs a <code>Option</code> from a plain JavaScript object, optionally creating a new instance.
   * Copies all relevant properties from <code>data</code> to <code>obj</code> if supplied or a new instance if not.
   * @param {Object} data The plain JavaScript object bearing properties of interest.
   * @param {module:model/Option} obj Optional instance to populate.
   * @return {module:model/Option} The populated <code>Option</code> instance.
   */
  exports.constructFromObject = function(data, obj) {
    if (data) {
      obj = obj || new exports();

      if (data.hasOwnProperty('chart')) {
        obj['chart'] = Chart.constructFromObject(data['chart']);
      }
      if (data.hasOwnProperty('plotOptions')) {
        obj['plotOptions'] = PlotOption.constructFromObject(data['plotOptions']);
      }
      if (data.hasOwnProperty('credits')) {
        obj['credits'] = Credit.constructFromObject(data['credits']);
      }
      if (data.hasOwnProperty('yAxis')) {
        obj['yAxis'] = ApiClient.convertToType(data['yAxis'], [YAxi]);
      }
      if (data.hasOwnProperty('title')) {
        obj['title'] = Title.constructFromObject(data['title']);
      }
      if (data.hasOwnProperty('xAxis')) {
        obj['xAxis'] = XAxi.constructFromObject(data['xAxis']);
      }
      if (data.hasOwnProperty('lang')) {
        obj['lang'] = Lang.constructFromObject(data['lang']);
      }
      if (data.hasOwnProperty('loading')) {
        obj['loading'] = Loading.constructFromObject(data['loading']);
      }
      if (data.hasOwnProperty('legend')) {
        obj['legend'] = Legend.constructFromObject(data['legend']);
      }
      if (data.hasOwnProperty('colors')) {
        obj['colors'] = ApiClient.convertToType(data['colors'], [Color]);
      }
    }
    return obj;
  }

  /**
   * @member {module:model/Chart} chart
   */
  exports.prototype['chart'] = undefined;
  /**
   * @member {module:model/PlotOption} plotOptions
   */
  exports.prototype['plotOptions'] = undefined;
  /**
   * @member {module:model/Credit} credits
   */
  exports.prototype['credits'] = undefined;
  /**
   * @member {Array.<module:model/YAxi>} yAxis
   */
  exports.prototype['yAxis'] = undefined;
  /**
   * @member {module:model/Title} title
   */
  exports.prototype['title'] = undefined;
  /**
   * @member {module:model/XAxi} xAxis
   */
  exports.prototype['xAxis'] = undefined;
  /**
   * @member {module:model/Lang} lang
   */
  exports.prototype['lang'] = undefined;
  /**
   * @member {module:model/Loading} loading
   */
  exports.prototype['loading'] = undefined;
  /**
   * @member {module:model/Legend} legend
   */
  exports.prototype['legend'] = undefined;
  /**
   * @member {Array.<module:model/Color>} colors
   */
  exports.prototype['colors'] = undefined;



  return exports;
}));



},{"../ApiClient":16,"./Chart":30,"./Color":33,"./Credit":40,"./Lang":53,"./Legend":54,"./Loading":55,"./PlotOption":65,"./Title":74,"./XAxi":94,"./YAxi":95}],63:[function(require,module,exports){
/**
 * quantimodo
 * QuantiModo makes it easy to retrieve normalized user data from a wide array of devices and applications. [Learn about QuantiModo](https://quantimo.do), check out our [docs](https://github.com/QuantiModo/docs) or contact us at [help.quantimo.do](https://help.quantimo.do).
 *
 * OpenAPI spec version: 5.8.728
 *
 * NOTE: This class is auto generated by the swagger code generator program.
 * https://github.com/swagger-api/swagger-codegen.git
 *
 * Swagger Codegen version: 2.2.3
 *
 * Do not edit the class manually.
 *
 */

(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define(['ApiClient'], factory);
  } else if (typeof module === 'object' && module.exports) {
    // CommonJS-like environments that support module.exports, like Node.
    module.exports = factory(require('../ApiClient'));
  } else {
    // Browser globals (root is window)
    if (!root.Quantimodo) {
      root.Quantimodo = {};
    }
    root.Quantimodo.Pair = factory(root.Quantimodo.ApiClient);
  }
}(this, function(ApiClient) {
  'use strict';




  /**
   * The Pair model module.
   * @module model/Pair
   * @version 5.8.807
   */

  /**
   * Constructs a new <code>Pair</code>.
   * @alias module:model/Pair
   * @class
   * @param causeMeasurement {Number} Example: 101341.66666667
   * @param effectMeasurement {Number} Example: 7.98
   * @param timestamp {Number} Example: 1464937200
   * @param startTimeSting {Date} Example: 2016-06-03 07:00:00
   * @param causeMeasurementValue {Number} Example: 101341.66666667
   * @param effectMeasurementValue {Number} Example: 7.98
   * @param causeVariableDefaultUnitAbbreviatedName {String} Example: 
   * @param effectVariableDefaultUnitAbbreviatedName {String} Example: 
   */
  var exports = function(causeMeasurement, effectMeasurement, timestamp, startTimeSting, causeMeasurementValue, effectMeasurementValue, causeVariableDefaultUnitAbbreviatedName, effectVariableDefaultUnitAbbreviatedName) {
    var _this = this;

    _this['causeMeasurement'] = causeMeasurement;
    _this['effectMeasurement'] = effectMeasurement;
    _this['timestamp'] = timestamp;
    _this['startTimeSting'] = startTimeSting;
    _this['causeMeasurementValue'] = causeMeasurementValue;
    _this['effectMeasurementValue'] = effectMeasurementValue;
    _this['causeVariableDefaultUnitAbbreviatedName'] = causeVariableDefaultUnitAbbreviatedName;
    _this['effectVariableDefaultUnitAbbreviatedName'] = effectVariableDefaultUnitAbbreviatedName;
  };

  /**
   * Constructs a <code>Pair</code> from a plain JavaScript object, optionally creating a new instance.
   * Copies all relevant properties from <code>data</code> to <code>obj</code> if supplied or a new instance if not.
   * @param {Object} data The plain JavaScript object bearing properties of interest.
   * @param {module:model/Pair} obj Optional instance to populate.
   * @return {module:model/Pair} The populated <code>Pair</code> instance.
   */
  exports.constructFromObject = function(data, obj) {
    if (data) {
      obj = obj || new exports();

      if (data.hasOwnProperty('causeMeasurement')) {
        obj['causeMeasurement'] = ApiClient.convertToType(data['causeMeasurement'], 'Number');
      }
      if (data.hasOwnProperty('effectMeasurement')) {
        obj['effectMeasurement'] = ApiClient.convertToType(data['effectMeasurement'], 'Number');
      }
      if (data.hasOwnProperty('timestamp')) {
        obj['timestamp'] = ApiClient.convertToType(data['timestamp'], 'Number');
      }
      if (data.hasOwnProperty('startTimeSting')) {
        obj['startTimeSting'] = ApiClient.convertToType(data['startTimeSting'], 'Date');
      }
      if (data.hasOwnProperty('causeMeasurementValue')) {
        obj['causeMeasurementValue'] = ApiClient.convertToType(data['causeMeasurementValue'], 'Number');
      }
      if (data.hasOwnProperty('effectMeasurementValue')) {
        obj['effectMeasurementValue'] = ApiClient.convertToType(data['effectMeasurementValue'], 'Number');
      }
      if (data.hasOwnProperty('causeVariableDefaultUnitAbbreviatedName')) {
        obj['causeVariableDefaultUnitAbbreviatedName'] = ApiClient.convertToType(data['causeVariableDefaultUnitAbbreviatedName'], 'String');
      }
      if (data.hasOwnProperty('effectVariableDefaultUnitAbbreviatedName')) {
        obj['effectVariableDefaultUnitAbbreviatedName'] = ApiClient.convertToType(data['effectVariableDefaultUnitAbbreviatedName'], 'String');
      }
    }
    return obj;
  }

  /**
   * Example: 101341.66666667
   * @member {Number} causeMeasurement
   */
  exports.prototype['causeMeasurement'] = undefined;
  /**
   * Example: 7.98
   * @member {Number} effectMeasurement
   */
  exports.prototype['effectMeasurement'] = undefined;
  /**
   * Example: 1464937200
   * @member {Number} timestamp
   */
  exports.prototype['timestamp'] = undefined;
  /**
   * Example: 2016-06-03 07:00:00
   * @member {Date} startTimeSting
   */
  exports.prototype['startTimeSting'] = undefined;
  /**
   * Example: 101341.66666667
   * @member {Number} causeMeasurementValue
   */
  exports.prototype['causeMeasurementValue'] = undefined;
  /**
   * Example: 7.98
   * @member {Number} effectMeasurementValue
   */
  exports.prototype['effectMeasurementValue'] = undefined;
  /**
   * Example: 
   * @member {String} causeVariableDefaultUnitAbbreviatedName
   */
  exports.prototype['causeVariableDefaultUnitAbbreviatedName'] = undefined;
  /**
   * Example: 
   * @member {String} effectVariableDefaultUnitAbbreviatedName
   */
  exports.prototype['effectVariableDefaultUnitAbbreviatedName'] = undefined;



  return exports;
}));



},{"../ApiClient":16}],64:[function(require,module,exports){
/**
 * quantimodo
 * QuantiModo makes it easy to retrieve normalized user data from a wide array of devices and applications. [Learn about QuantiModo](https://quantimo.do), check out our [docs](https://github.com/QuantiModo/docs) or contact us at [help.quantimo.do](https://help.quantimo.do).
 *
 * OpenAPI spec version: 5.8.728
 *
 * NOTE: This class is auto generated by the swagger code generator program.
 * https://github.com/swagger-api/swagger-codegen.git
 *
 * Swagger Codegen version: 2.2.3
 *
 * Do not edit the class manually.
 *
 */

(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define(['ApiClient'], factory);
  } else if (typeof module === 'object' && module.exports) {
    // CommonJS-like environments that support module.exports, like Node.
    module.exports = factory(require('../ApiClient'));
  } else {
    // Browser globals (root is window)
    if (!root.Quantimodo) {
      root.Quantimodo = {};
    }
    root.Quantimodo.Pairs = factory(root.Quantimodo.ApiClient);
  }
}(this, function(ApiClient) {
  'use strict';




  /**
   * The Pairs model module.
   * @module model/Pairs
   * @version 5.8.807
   */

  /**
   * Constructs a new <code>Pairs</code>.
   * @alias module:model/Pairs
   * @class
   * @param name {String} Category name
   */
  var exports = function(name) {
    var _this = this;

    _this['name'] = name;
  };

  /**
   * Constructs a <code>Pairs</code> from a plain JavaScript object, optionally creating a new instance.
   * Copies all relevant properties from <code>data</code> to <code>obj</code> if supplied or a new instance if not.
   * @param {Object} data The plain JavaScript object bearing properties of interest.
   * @param {module:model/Pairs} obj Optional instance to populate.
   * @return {module:model/Pairs} The populated <code>Pairs</code> instance.
   */
  exports.constructFromObject = function(data, obj) {
    if (data) {
      obj = obj || new exports();

      if (data.hasOwnProperty('name')) {
        obj['name'] = ApiClient.convertToType(data['name'], 'String');
      }
    }
    return obj;
  }

  /**
   * Category name
   * @member {String} name
   */
  exports.prototype['name'] = undefined;



  return exports;
}));



},{"../ApiClient":16}],65:[function(require,module,exports){
/**
 * quantimodo
 * QuantiModo makes it easy to retrieve normalized user data from a wide array of devices and applications. [Learn about QuantiModo](https://quantimo.do), check out our [docs](https://github.com/QuantiModo/docs) or contact us at [help.quantimo.do](https://help.quantimo.do).
 *
 * OpenAPI spec version: 5.8.728
 *
 * NOTE: This class is auto generated by the swagger code generator program.
 * https://github.com/swagger-api/swagger-codegen.git
 *
 * Swagger Codegen version: 2.2.3
 *
 * Do not edit the class manually.
 *
 */

(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define(['ApiClient', 'model/Column', 'model/Scatter'], factory);
  } else if (typeof module === 'object' && module.exports) {
    // CommonJS-like environments that support module.exports, like Node.
    module.exports = factory(require('../ApiClient'), require('./Column'), require('./Scatter'));
  } else {
    // Browser globals (root is window)
    if (!root.Quantimodo) {
      root.Quantimodo = {};
    }
    root.Quantimodo.PlotOption = factory(root.Quantimodo.ApiClient, root.Quantimodo.Column, root.Quantimodo.Scatter);
  }
}(this, function(ApiClient, Column, Scatter) {
  'use strict';




  /**
   * The PlotOption model module.
   * @module model/PlotOption
   * @version 5.8.807
   */

  /**
   * Constructs a new <code>PlotOption</code>.
   * @alias module:model/PlotOption
   * @class
   * @param scatter {module:model/Scatter} 
   * @param column {module:model/Column} 
   */
  var exports = function(scatter, column) {
    var _this = this;

    _this['scatter'] = scatter;
    _this['column'] = column;
  };

  /**
   * Constructs a <code>PlotOption</code> from a plain JavaScript object, optionally creating a new instance.
   * Copies all relevant properties from <code>data</code> to <code>obj</code> if supplied or a new instance if not.
   * @param {Object} data The plain JavaScript object bearing properties of interest.
   * @param {module:model/PlotOption} obj Optional instance to populate.
   * @return {module:model/PlotOption} The populated <code>PlotOption</code> instance.
   */
  exports.constructFromObject = function(data, obj) {
    if (data) {
      obj = obj || new exports();

      if (data.hasOwnProperty('scatter')) {
        obj['scatter'] = Scatter.constructFromObject(data['scatter']);
      }
      if (data.hasOwnProperty('column')) {
        obj['column'] = Column.constructFromObject(data['column']);
      }
    }
    return obj;
  }

  /**
   * @member {module:model/Scatter} scatter
   */
  exports.prototype['scatter'] = undefined;
  /**
   * @member {module:model/Column} column
   */
  exports.prototype['column'] = undefined;



  return exports;
}));



},{"../ApiClient":16,"./Column":34,"./Scatter":68}],66:[function(require,module,exports){
/**
 * quantimodo
 * QuantiModo makes it easy to retrieve normalized user data from a wide array of devices and applications. [Learn about QuantiModo](https://quantimo.do), check out our [docs](https://github.com/QuantiModo/docs) or contact us at [help.quantimo.do](https://help.quantimo.do).
 *
 * OpenAPI spec version: 5.8.728
 *
 * NOTE: This class is auto generated by the swagger code generator program.
 * https://github.com/swagger-api/swagger-codegen.git
 *
 * Swagger Codegen version: 2.2.3
 *
 * Do not edit the class manually.
 *
 */

(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define(['ApiClient'], factory);
  } else if (typeof module === 'object' && module.exports) {
    // CommonJS-like environments that support module.exports, like Node.
    module.exports = factory(require('../ApiClient'));
  } else {
    // Browser globals (root is window)
    if (!root.Quantimodo) {
      root.Quantimodo = {};
    }
    root.Quantimodo.PostCorrelation = factory(root.Quantimodo.ApiClient);
  }
}(this, function(ApiClient) {
  'use strict';




  /**
   * The PostCorrelation model module.
   * @module model/PostCorrelation
   * @version 5.8.807
   */

  /**
   * Constructs a new <code>PostCorrelation</code>.
   * @alias module:model/PostCorrelation
   * @class
   * @param causeVariableName {String} Cause variable name
   * @param effectVariableName {String} Effect variable name
   * @param correlation {Number} Correlation value
   */
  var exports = function(causeVariableName, effectVariableName, correlation) {
    var _this = this;

    _this['causeVariableName'] = causeVariableName;
    _this['effectVariableName'] = effectVariableName;
    _this['correlation'] = correlation;

  };

  /**
   * Constructs a <code>PostCorrelation</code> from a plain JavaScript object, optionally creating a new instance.
   * Copies all relevant properties from <code>data</code> to <code>obj</code> if supplied or a new instance if not.
   * @param {Object} data The plain JavaScript object bearing properties of interest.
   * @param {module:model/PostCorrelation} obj Optional instance to populate.
   * @return {module:model/PostCorrelation} The populated <code>PostCorrelation</code> instance.
   */
  exports.constructFromObject = function(data, obj) {
    if (data) {
      obj = obj || new exports();

      if (data.hasOwnProperty('causeVariableName')) {
        obj['causeVariableName'] = ApiClient.convertToType(data['causeVariableName'], 'String');
      }
      if (data.hasOwnProperty('effectVariableName')) {
        obj['effectVariableName'] = ApiClient.convertToType(data['effectVariableName'], 'String');
      }
      if (data.hasOwnProperty('correlation')) {
        obj['correlation'] = ApiClient.convertToType(data['correlation'], 'Number');
      }
      if (data.hasOwnProperty('vote')) {
        obj['vote'] = ApiClient.convertToType(data['vote'], 'Number');
      }
    }
    return obj;
  }

  /**
   * Cause variable name
   * @member {String} causeVariableName
   */
  exports.prototype['causeVariableName'] = undefined;
  /**
   * Effect variable name
   * @member {String} effectVariableName
   */
  exports.prototype['effectVariableName'] = undefined;
  /**
   * Correlation value
   * @member {Number} correlation
   */
  exports.prototype['correlation'] = undefined;
  /**
   * Vote: 0 or 1
   * @member {Number} vote
   */
  exports.prototype['vote'] = undefined;



  return exports;
}));



},{"../ApiClient":16}],67:[function(require,module,exports){
/**
 * quantimodo
 * QuantiModo makes it easy to retrieve normalized user data from a wide array of devices and applications. [Learn about QuantiModo](https://quantimo.do), check out our [docs](https://github.com/QuantiModo/docs) or contact us at [help.quantimo.do](https://help.quantimo.do).
 *
 * OpenAPI spec version: 5.8.728
 *
 * NOTE: This class is auto generated by the swagger code generator program.
 * https://github.com/swagger-api/swagger-codegen.git
 *
 * Swagger Codegen version: 2.2.3
 *
 * Do not edit the class manually.
 *
 */

(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define(['ApiClient'], factory);
  } else if (typeof module === 'object' && module.exports) {
    // CommonJS-like environments that support module.exports, like Node.
    module.exports = factory(require('../ApiClient'));
  } else {
    // Browser globals (root is window)
    if (!root.Quantimodo) {
      root.Quantimodo = {};
    }
    root.Quantimodo.ProcessedDailyMeasurement = factory(root.Quantimodo.ApiClient);
  }
}(this, function(ApiClient) {
  'use strict';




  /**
   * The ProcessedDailyMeasurement model module.
   * @module model/ProcessedDailyMeasurement
   * @version 5.8.807
   */

  /**
   * Constructs a new <code>ProcessedDailyMeasurement</code>.
   * @alias module:model/ProcessedDailyMeasurement
   * @class
   * @param startTimeEpoch {Number} Example: 1464937200
   * @param unitId {Number} Example: 47
   * @param variableId {Number} Example: 96380
   * @param variableName {String} Example: Barometric Pressure
   * @param variableCategoryId {Number} Example: 17
   * @param value {Number} Example: 101341.66666667
   * @param startDate {String} Example: 2016-06-03
   * @param note {String} Example: 
   * @param originalValue {String} Example: 101800, 101800, 101700, 101600, 101600, 101600
   * @param originalUnitId {String} Example: 47, 47, 47, 47, 47, 47
   * @param id {String} Example: 
   * @param duration {Number} Example: 0
   * @param startTimeString {Date} Example: 2016-06-03 07:00:00
   */
  var exports = function(startTimeEpoch, unitId, variableId, variableName, variableCategoryId, value, startDate, note, originalValue, originalUnitId, id, duration, startTimeString) {
    var _this = this;

    _this['startTimeEpoch'] = startTimeEpoch;
    _this['unitId'] = unitId;
    _this['variableId'] = variableId;
    _this['variableName'] = variableName;
    _this['variableCategoryId'] = variableCategoryId;
    _this['value'] = value;
    _this['startDate'] = startDate;
    _this['note'] = note;
    _this['originalValue'] = originalValue;
    _this['originalUnitId'] = originalUnitId;
    _this['id'] = id;
    _this['duration'] = duration;
    _this['startTimeString'] = startTimeString;
  };

  /**
   * Constructs a <code>ProcessedDailyMeasurement</code> from a plain JavaScript object, optionally creating a new instance.
   * Copies all relevant properties from <code>data</code> to <code>obj</code> if supplied or a new instance if not.
   * @param {Object} data The plain JavaScript object bearing properties of interest.
   * @param {module:model/ProcessedDailyMeasurement} obj Optional instance to populate.
   * @return {module:model/ProcessedDailyMeasurement} The populated <code>ProcessedDailyMeasurement</code> instance.
   */
  exports.constructFromObject = function(data, obj) {
    if (data) {
      obj = obj || new exports();

      if (data.hasOwnProperty('startTimeEpoch')) {
        obj['startTimeEpoch'] = ApiClient.convertToType(data['startTimeEpoch'], 'Number');
      }
      if (data.hasOwnProperty('unitId')) {
        obj['unitId'] = ApiClient.convertToType(data['unitId'], 'Number');
      }
      if (data.hasOwnProperty('variableId')) {
        obj['variableId'] = ApiClient.convertToType(data['variableId'], 'Number');
      }
      if (data.hasOwnProperty('variableName')) {
        obj['variableName'] = ApiClient.convertToType(data['variableName'], 'String');
      }
      if (data.hasOwnProperty('variableCategoryId')) {
        obj['variableCategoryId'] = ApiClient.convertToType(data['variableCategoryId'], 'Number');
      }
      if (data.hasOwnProperty('value')) {
        obj['value'] = ApiClient.convertToType(data['value'], 'Number');
      }
      if (data.hasOwnProperty('startDate')) {
        obj['startDate'] = ApiClient.convertToType(data['startDate'], 'String');
      }
      if (data.hasOwnProperty('note')) {
        obj['note'] = ApiClient.convertToType(data['note'], 'String');
      }
      if (data.hasOwnProperty('originalValue')) {
        obj['originalValue'] = ApiClient.convertToType(data['originalValue'], 'String');
      }
      if (data.hasOwnProperty('originalUnitId')) {
        obj['originalUnitId'] = ApiClient.convertToType(data['originalUnitId'], 'String');
      }
      if (data.hasOwnProperty('id')) {
        obj['id'] = ApiClient.convertToType(data['id'], 'String');
      }
      if (data.hasOwnProperty('duration')) {
        obj['duration'] = ApiClient.convertToType(data['duration'], 'Number');
      }
      if (data.hasOwnProperty('startTimeString')) {
        obj['startTimeString'] = ApiClient.convertToType(data['startTimeString'], 'Date');
      }
    }
    return obj;
  }

  /**
   * Example: 1464937200
   * @member {Number} startTimeEpoch
   */
  exports.prototype['startTimeEpoch'] = undefined;
  /**
   * Example: 47
   * @member {Number} unitId
   */
  exports.prototype['unitId'] = undefined;
  /**
   * Example: 96380
   * @member {Number} variableId
   */
  exports.prototype['variableId'] = undefined;
  /**
   * Example: Barometric Pressure
   * @member {String} variableName
   */
  exports.prototype['variableName'] = undefined;
  /**
   * Example: 17
   * @member {Number} variableCategoryId
   */
  exports.prototype['variableCategoryId'] = undefined;
  /**
   * Example: 101341.66666667
   * @member {Number} value
   */
  exports.prototype['value'] = undefined;
  /**
   * Example: 2016-06-03
   * @member {String} startDate
   */
  exports.prototype['startDate'] = undefined;
  /**
   * Example: 
   * @member {String} note
   */
  exports.prototype['note'] = undefined;
  /**
   * Example: 101800, 101800, 101700, 101600, 101600, 101600
   * @member {String} originalValue
   */
  exports.prototype['originalValue'] = undefined;
  /**
   * Example: 47, 47, 47, 47, 47, 47
   * @member {String} originalUnitId
   */
  exports.prototype['originalUnitId'] = undefined;
  /**
   * Example: 
   * @member {String} id
   */
  exports.prototype['id'] = undefined;
  /**
   * Example: 0
   * @member {Number} duration
   */
  exports.prototype['duration'] = undefined;
  /**
   * Example: 2016-06-03 07:00:00
   * @member {Date} startTimeString
   */
  exports.prototype['startTimeString'] = undefined;



  return exports;
}));



},{"../ApiClient":16}],68:[function(require,module,exports){
/**
 * quantimodo
 * QuantiModo makes it easy to retrieve normalized user data from a wide array of devices and applications. [Learn about QuantiModo](https://quantimo.do), check out our [docs](https://github.com/QuantiModo/docs) or contact us at [help.quantimo.do](https://help.quantimo.do).
 *
 * OpenAPI spec version: 5.8.728
 *
 * NOTE: This class is auto generated by the swagger code generator program.
 * https://github.com/swagger-api/swagger-codegen.git
 *
 * Swagger Codegen version: 2.2.3
 *
 * Do not edit the class manually.
 *
 */

(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define(['ApiClient', 'model/Marker', 'model/State', 'model/Tooltip'], factory);
  } else if (typeof module === 'object' && module.exports) {
    // CommonJS-like environments that support module.exports, like Node.
    module.exports = factory(require('../ApiClient'), require('./Marker'), require('./State'), require('./Tooltip'));
  } else {
    // Browser globals (root is window)
    if (!root.Quantimodo) {
      root.Quantimodo = {};
    }
    root.Quantimodo.Scatter = factory(root.Quantimodo.ApiClient, root.Quantimodo.Marker, root.Quantimodo.State, root.Quantimodo.Tooltip);
  }
}(this, function(ApiClient, Marker, State, Tooltip) {
  'use strict';




  /**
   * The Scatter model module.
   * @module model/Scatter
   * @version 5.8.807
   */

  /**
   * Constructs a new <code>Scatter</code>.
   * @alias module:model/Scatter
   * @class
   * @param marker {module:model/Marker} 
   * @param states {module:model/State} 
   * @param tooltip {module:model/Tooltip} 
   */
  var exports = function(marker, states, tooltip) {
    var _this = this;

    _this['marker'] = marker;
    _this['states'] = states;
    _this['tooltip'] = tooltip;
  };

  /**
   * Constructs a <code>Scatter</code> from a plain JavaScript object, optionally creating a new instance.
   * Copies all relevant properties from <code>data</code> to <code>obj</code> if supplied or a new instance if not.
   * @param {Object} data The plain JavaScript object bearing properties of interest.
   * @param {module:model/Scatter} obj Optional instance to populate.
   * @return {module:model/Scatter} The populated <code>Scatter</code> instance.
   */
  exports.constructFromObject = function(data, obj) {
    if (data) {
      obj = obj || new exports();

      if (data.hasOwnProperty('marker')) {
        obj['marker'] = Marker.constructFromObject(data['marker']);
      }
      if (data.hasOwnProperty('states')) {
        obj['states'] = State.constructFromObject(data['states']);
      }
      if (data.hasOwnProperty('tooltip')) {
        obj['tooltip'] = Tooltip.constructFromObject(data['tooltip']);
      }
    }
    return obj;
  }

  /**
   * @member {module:model/Marker} marker
   */
  exports.prototype['marker'] = undefined;
  /**
   * @member {module:model/State} states
   */
  exports.prototype['states'] = undefined;
  /**
   * @member {module:model/Tooltip} tooltip
   */
  exports.prototype['tooltip'] = undefined;



  return exports;
}));



},{"../ApiClient":16,"./Marker":56,"./State":70,"./Tooltip":75}],69:[function(require,module,exports){
/**
 * quantimodo
 * QuantiModo makes it easy to retrieve normalized user data from a wide array of devices and applications. [Learn about QuantiModo](https://quantimo.do), check out our [docs](https://github.com/QuantiModo/docs) or contact us at [help.quantimo.do](https://help.quantimo.do).
 *
 * OpenAPI spec version: 5.8.728
 *
 * NOTE: This class is auto generated by the swagger code generator program.
 * https://github.com/swagger-api/swagger-codegen.git
 *
 * Swagger Codegen version: 2.2.3
 *
 * Do not edit the class manually.
 *
 */

(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define(['ApiClient', 'model/Series', 'model/Tooltip'], factory);
  } else if (typeof module === 'object' && module.exports) {
    // CommonJS-like environments that support module.exports, like Node.
    module.exports = factory(require('../ApiClient'), require('./Series'), require('./Tooltip'));
  } else {
    // Browser globals (root is window)
    if (!root.Quantimodo) {
      root.Quantimodo = {};
    }
    root.Quantimodo.Series = factory(root.Quantimodo.ApiClient, root.Quantimodo.Series, root.Quantimodo.Tooltip);
  }
}(this, function(ApiClient, Series, Tooltip) {
  'use strict';




  /**
   * The Series model module.
   * @module model/Series
   * @version 5.8.807
   */

  /**
   * Constructs a new <code>Series</code>.
   * @alias module:model/Series
   * @class
   * @param name {String} Example: Reference And Learning Hours by Barometric Pressure
   * @param color {String} Example: rgba(223, 83, 83, .5)
   * @param data {Array.<module:model/Series>} 
   * @param type {String} Example: spline
   * @param tooltip {module:model/Tooltip} 
   * @param yAxis {Number} Example: 1
   */
  var exports = function(name, color, data, type, tooltip, yAxis) {
    var _this = this;

    _this['name'] = name;
    _this['color'] = color;
    _this['data'] = data;
    _this['type'] = type;
    _this['tooltip'] = tooltip;
    _this['yAxis'] = yAxis;
  };

  /**
   * Constructs a <code>Series</code> from a plain JavaScript object, optionally creating a new instance.
   * Copies all relevant properties from <code>data</code> to <code>obj</code> if supplied or a new instance if not.
   * @param {Object} data The plain JavaScript object bearing properties of interest.
   * @param {module:model/Series} obj Optional instance to populate.
   * @return {module:model/Series} The populated <code>Series</code> instance.
   */
  exports.constructFromObject = function(data, obj) {
    if (data) {
      obj = obj || new exports();

      if (data.hasOwnProperty('name')) {
        obj['name'] = ApiClient.convertToType(data['name'], 'String');
      }
      if (data.hasOwnProperty('color')) {
        obj['color'] = ApiClient.convertToType(data['color'], 'String');
      }
      if (data.hasOwnProperty('data')) {
        obj['data'] = ApiClient.convertToType(data['data'], [Series]);
      }
      if (data.hasOwnProperty('type')) {
        obj['type'] = ApiClient.convertToType(data['type'], 'String');
      }
      if (data.hasOwnProperty('tooltip')) {
        obj['tooltip'] = Tooltip.constructFromObject(data['tooltip']);
      }
      if (data.hasOwnProperty('yAxis')) {
        obj['yAxis'] = ApiClient.convertToType(data['yAxis'], 'Number');
      }
    }
    return obj;
  }

  /**
   * Example: Reference And Learning Hours by Barometric Pressure
   * @member {String} name
   */
  exports.prototype['name'] = undefined;
  /**
   * Example: rgba(223, 83, 83, .5)
   * @member {String} color
   */
  exports.prototype['color'] = undefined;
  /**
   * @member {Array.<module:model/Series>} data
   */
  exports.prototype['data'] = undefined;
  /**
   * Example: spline
   * @member {String} type
   */
  exports.prototype['type'] = undefined;
  /**
   * @member {module:model/Tooltip} tooltip
   */
  exports.prototype['tooltip'] = undefined;
  /**
   * Example: 1
   * @member {Number} yAxis
   */
  exports.prototype['yAxis'] = undefined;



  return exports;
}));



},{"../ApiClient":16,"./Series":69,"./Tooltip":75}],70:[function(require,module,exports){
/**
 * quantimodo
 * QuantiModo makes it easy to retrieve normalized user data from a wide array of devices and applications. [Learn about QuantiModo](https://quantimo.do), check out our [docs](https://github.com/QuantiModo/docs) or contact us at [help.quantimo.do](https://help.quantimo.do).
 *
 * OpenAPI spec version: 5.8.728
 *
 * NOTE: This class is auto generated by the swagger code generator program.
 * https://github.com/swagger-api/swagger-codegen.git
 *
 * Swagger Codegen version: 2.2.3
 *
 * Do not edit the class manually.
 *
 */

(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define(['ApiClient', 'model/Hover'], factory);
  } else if (typeof module === 'object' && module.exports) {
    // CommonJS-like environments that support module.exports, like Node.
    module.exports = factory(require('../ApiClient'), require('./Hover'));
  } else {
    // Browser globals (root is window)
    if (!root.Quantimodo) {
      root.Quantimodo = {};
    }
    root.Quantimodo.State = factory(root.Quantimodo.ApiClient, root.Quantimodo.Hover);
  }
}(this, function(ApiClient, Hover) {
  'use strict';




  /**
   * The State model module.
   * @module model/State
   * @version 5.8.807
   */

  /**
   * Constructs a new <code>State</code>.
   * @alias module:model/State
   * @class
   * @param hover {module:model/Hover} 
   */
  var exports = function(hover) {
    var _this = this;

    _this['hover'] = hover;
  };

  /**
   * Constructs a <code>State</code> from a plain JavaScript object, optionally creating a new instance.
   * Copies all relevant properties from <code>data</code> to <code>obj</code> if supplied or a new instance if not.
   * @param {Object} data The plain JavaScript object bearing properties of interest.
   * @param {module:model/State} obj Optional instance to populate.
   * @return {module:model/State} The populated <code>State</code> instance.
   */
  exports.constructFromObject = function(data, obj) {
    if (data) {
      obj = obj || new exports();

      if (data.hasOwnProperty('hover')) {
        obj['hover'] = Hover.constructFromObject(data['hover']);
      }
    }
    return obj;
  }

  /**
   * @member {module:model/Hover} hover
   */
  exports.prototype['hover'] = undefined;



  return exports;
}));



},{"../ApiClient":16,"./Hover":49}],71:[function(require,module,exports){
/**
 * quantimodo
 * QuantiModo makes it easy to retrieve normalized user data from a wide array of devices and applications. [Learn about QuantiModo](https://quantimo.do), check out our [docs](https://github.com/QuantiModo/docs) or contact us at [help.quantimo.do](https://help.quantimo.do).
 *
 * OpenAPI spec version: 5.8.728
 *
 * NOTE: This class is auto generated by the swagger code generator program.
 * https://github.com/swagger-api/swagger-codegen.git
 *
 * Swagger Codegen version: 2.2.3
 *
 * Do not edit the class manually.
 *
 */

(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define(['ApiClient'], factory);
  } else if (typeof module === 'object' && module.exports) {
    // CommonJS-like environments that support module.exports, like Node.
    module.exports = factory(require('../ApiClient'));
  } else {
    // Browser globals (root is window)
    if (!root.Quantimodo) {
      root.Quantimodo = {};
    }
    root.Quantimodo.Statistic = factory(root.Quantimodo.ApiClient);
  }
}(this, function(ApiClient) {
  'use strict';




  /**
   * The Statistic model module.
   * @module model/Statistic
   * @version 5.8.807
   */

  /**
   * Constructs a new <code>Statistic</code>.
   * @alias module:model/Statistic
   * @class
   * @param correlationCoefficient {Number} Example: 0.147
   * @param onsetDelay {Number} Example: 0
   * @param durationOfAction {Number} Example: 604800
   * @param numberOfPairs {Number} Example: 297
   * @param effectSize {String} Example: weakly positive
   * @param statisticalSignificance {Number} Example: 0.99987910063243
   * @param timestamp {Number} Example: 1502080560
   * @param reversePearsonCorrelationCoefficient {String} Example: 
   * @param predictivePearsonCorrelationCoefficient {Number} Example: 0.147
   * @param causalityFactor {Number} Example: 0.147
   * @param causeVariableCategoryName {String} Example: Environment
   * @param effectVariableCategoryName {String} Example: Activity
   * @param valuePredictingHighOutcome {Number} Example: 101187.2
   * @param valuePredictingLowOutcome {Number} Example: 97597.75
   * @param optimalPearsonProduct {Number} Example: 0.063550992332336
   * @param userVote {String} Example: 
   * @param averageVote {String} Example: 
   * @param causeVariableDefaultUnitId {Number} Example: 47
   * @param createdAt {Date} Example: 
   * @param updatedAt {Date} Example: 
   * @param causeChanges {Number} Example: 287
   * @param effectChanges {Number} Example: 295
   * @param qmScore {String} Example: 
   * @param error {String} Example: optimalPearsonProduct is not defined
   * @param predictsHighEffectChange {Number} Example: 0.84
   * @param predictsLowEffectChange {Number} Example: -82.6
   * @param pValue {Number} Example: 0
   * @param tValue {Number} Example: 8.1106621038493
   * @param criticalTValue {Number} Example: 1.646
   * @param confidenceInterval {Number} Example: 1.4269359716898
   * @param experimentStartTime {Number} Example: 1464937200
   * @param experimentEndTime {Number} Example: 1501722000
   * @param userId {Number} Example: 230
   * @param studyResults {String} Example: This analysis suggests that higher Barometric Pressure (Environment) generally predicts higher Reference And Learning Hours (p = 0).  Reference And Learning Hours is, on average, 0.84%  higher after around 101187.2 Barometric Pressure.  After an onset delay of 168 hours, Reference And Learning Hours is, on average, 82.6%  lower than its average over the 168 hours following around 97597.75 Barometric Pressure.  297 data points were used in this analysis.  The value for Barometric Pressure changed 287 times, effectively running 144 separate natural experiments.  The top quartile outcome values are preceded by an average 101187.2 Pa of Barometric Pressure.  The bottom quartile outcome values are preceded by an average 97597.75 Pa of Barometric Pressure.  Forward Pearson Correlation Coefficient was 0.147 (p=0, 95% CI -1.28 to 1.574 onset delay = 0 hours, duration of action = 168 hours) .  The Reverse Pearson Correlation Coefficient was 0 (P=0, 95% CI -1.427 to 1.427, onset delay = -0 hours, duration of action = -168 hours). When the Barometric Pressure value is closer to 101187.2 Pa than 97597.75 Pa, the Reference And Learning Hours value which follows is, on average, 0.84%  percent higher than its typical value.  When the Barometric Pressure value is closer to 97597.75 Pa than 101187.2 Pa, the Reference And Learning Hours value which follows is 0% lower than its typical value.  Reference And Learning Hours is 8.5h (1% higher) on average after days with around 101627.85 Pa Barometric Pressure  Reference And Learning Hours is 1.47h (83% lower) on average after days with around 21023.36 Pa Barometric Pressure
   * @param dataAnalysis {String} Example: It was assumed that 0 hours would pass before a change in Barometric Pressure would produce an observable change in Reference And Learning Hours.  It was assumed that Barometric Pressure could produce an observable change in Reference And Learning Hours for as much as 7 days after the stimulus event.  
   * @param outcomeMaximumAllowedValue {String} Example: 
   * @param predictorMaximumAllowedValue {String} Example: 
   * @param studyLimitations {String} Example: As with any human experiment, it was impossible to control for all potentially confounding variables.                           Correlation does not necessarily imply correlation.  We can never know for sure if one factor is definitely the cause of an outcome.               However, lack of correlation definitely implies the lack of a causal relationship.  Hence, we can with great              confidence rule out non-existent relationships. For instance, if we discover no relationship between mood             and an antidepressant this information is just as or even more valuable than the discovery that there is a relationship.              <br>             <br>                         We can also take advantage of several characteristics of time series data from many subjects  to infer the likelihood of a causal relationship if we do find a correlational relationship.              The criteria for causation are a group of minimal conditions necessary to provide adequate evidence of a causal relationship between an incidence and a possible consequence.             The list of the criteria is as follows:             <br>             1. Strength (effect size): A small association does not mean that there is not a causal effect, though the larger the association, the more likely that it is causal.             <br>             2. Consistency (reproducibility): Consistent findings observed by different persons in different places with different samples strengthens the likelihood of an effect.             <br>             3. Specificity: Causation is likely if a very specific population at a specific site and disease with no other likely explanation. The more specific an association between a factor and an effect is, the bigger the probability of a causal relationship.             <br>             4. Temporality: The effect has to occur after the cause (and if there is an expected delay between the cause and expected effect, then the effect must occur after that delay).             <br>             5. Biological gradient: Greater exposure should generally lead to greater incidence of the effect. However, in some cases, the mere presence of the factor can trigger the effect. In other cases, an inverse proportion is observed: greater exposure leads to lower incidence.             <br>             6. Plausibility: A plausible mechanism between cause and effect is helpful.             <br>             7. Coherence: Coherence between epidemiological and laboratory findings increases the likelihood of an effect.             <br>             8. Experiment: \"Occasionally it is possible to appeal to experimental evidence\".             <br>             9. Analogy: The effect of similar factors may be considered.             <br>             <br>                            The confidence in a causal relationship is bolstered by the fact that time-precedence was taken into account in all calculations. Furthermore, in accordance with the law of large numbers (LLN), the predictive power and accuracy of these results will continually grow over time.  297 paired data points were used in this analysis.   Assuming that the relationship is merely coincidental, as the participant independently modifies their Barometric Pressure values, the observed strength of the relationship will decline until it is below the threshold of significance.  To it another way, in the case that we do find a spurious correlation, suggesting that banana intake improves mood for instance,             one will likely increase their banana intake.  Due to the fact that this correlation is spurious, it is unlikely             that you will see a continued and persistent corresponding increase in mood.  So over time, the spurious correlation will             naturally dissipate.Furthermore, it will be very enlightening to aggregate this data with the data from other participants  with similar genetic, diseasomic, environmentomic, and demographic profiles.
   * @param significantDifference {Boolean} Example: true
   * @param significanceExplanation {String} Example: Using a two-tailed t-test with alpha = 0.05, it was determined that the change in Reference And Learning Hours is statistically significant at 95% confidence interval. 
   * @param strengthLevel {String} Example: very weak
   * @param confidenceLevel {String} Example: high
   * @param studyObjective {String} Example: The objective of this study is to determine the nature of the relationship (if any) between the Barometric Pressure and the Reference And Learning Hours. Additionally, we attempt to determine the Barometric Pressure values most likely to produce optimal Reference And Learning Hours values. 
   * @param studyTitle {String} Example: N1 Study: Barometric Pressure Predicts Higher Reference And Learning Hours
   * @param dataSources {String} Example: Barometric Pressure data was primarily collected using <a href=\"https://quantimo.do\">QuantiModo</a>.  <a href=\"https://quantimo.do\">QuantiModo</a> is a Chrome extension, Android app, iOS app, and web app that allows you to easily track mood, symptoms, or any outcome you want to optimize in a fraction of a second.  You can also import your data from over 30 other apps and devices like Fitbit, Rescuetime, Jawbone Up, Withings, Facebook, Github, Google Calendar, Runkeeper, MoodPanda, Slice, Google Fit, and more.  <a href=\"https://quantimo.do\">QuantiModo</a> then analyzes your data to identify which hidden factors are most likely to be influencing your mood or symptoms and their optimal daily values.<br>Reference And Learning Hours data was primarily collected using <a href=\"https://www.rescuetime.com/rp/quantimodo/plans\">RescueTime</a>.  Detailed reports show which applications and websites you spent time on. Activities are automatically grouped into pre-defined categories with built-in productivity scores covering thousands of websites and applications. You can customize categories and productivity scores to meet your needs.
   * @param studyAbstract {String} Example: Your data suggests with a high degree of confidence (p=0) that Barometric Pressure (Environment) has a weakly positive predictive relationship (R=0.147) with Reference And Learning Hours  (Activity).  The highest quartile of Reference And Learning Hours  measurements were observed following an average 101187.2Pa Barometric Pressure.  The lowest quartile of Reference And Learning Hours  measurements were observed following an average 97597.75Pa Barometric Pressure.
   * @param direction {String} Example: higher
   * @param predictivePearsonCorrelation {String} Example: 
   * @param predictorExplanation {String} Example: Barometric Pressure Predicts Higher Reference And Learning Hours
   * @param studyBackground {String} Example: 
   * @param studyDesign {String} Example: This study is based on data donated by one QuantiModo user. Thus, the study design is consistent with an n=1 observational natural experiment. 
   * @param dataPoints {String} Example: 
   * @param numberOfDays {Number} Example: 425
   * @param reversePairsCount {String} Example: 
   * @param causeChangesStatisticalSignificance {Number} Example: 0.9999299755903
   * @param causeVariableCategoryId {Number} Example: 17
   * @param effectVariableCategoryId {Number} Example: 14
   * @param predictorFillingValue {String} Example: 
   * @param outcomeFillingValue {String} Example: 
   * @param causeNumberOfRawMeasurements {Number} Example: 14764
   * @param effectNumberOfRawMeasurements {Number} Example: 4045
   * @param causeNumberOfProcessedDailyMeasurements {Number} Example: 1364
   * @param effectNumberOfProcessedDailyMeasurements {Number} Example: 145
   * @param causeVariableMostCommonConnectorId {Number} Example: 13
   * @param effectVariableMostCommonConnectorId {Number} Example: 11
   * @param studyLinkFacebook {String} Example: https://www.facebook.com/sharer/sharer.php?u=https%3A%2F%2Flocal.quantimo.do%2Fapi%2Fv2%2Fstudy%3FcauseVariableName%3DBarometric%2520Pressure%26effectVariableName%3DReference%2520And%2520Learning%2520Hours%26userId%3D230
   * @param studyLinkTwitter {String} Example: https://twitter.com/home?status=Barometric%20Pressure%20Predicts%20Higher%20Reference%20And%20Learning%20Hours%20https%3A%2F%2Flocal.quantimo.do%2Fapi%2Fv2%2Fstudy%3FcauseVariableName%3DBarometric%2520Pressure%26effectVariableName%3DReference%2520And%2520Learning%2520Hours%26userId%3D230%20%40quantimodo
   * @param studyLinkGoogle {String} Example: https://plus.google.com/share?url=https%3A%2F%2Flocal.quantimo.do%2Fapi%2Fv2%2Fstudy%3FcauseVariableName%3DBarometric%2520Pressure%26effectVariableName%3DReference%2520And%2520Learning%2520Hours%26userId%3D230
   * @param causeVariableName {String} Example: Barometric Pressure
   * @param effectVariableName {String} Example: Reference And Learning Hours
   * @param averageEffect {Number} Example: 8.4268686868687
   * @param numberOfLowEffectPairs {Number} Example: 57
   * @param numberOfHighEffectPairs {Number} Example: 27
   * @param degreesOfFreedom {Number} Example: 200
   * @param numberOfUniqueCauseValuesForOptimalValues {Number} Example: 201
   * @param numberOfUniqueEffectValuesForOptimalValues {Number} Example: 264
   * @param numberOfCauseChangesForOptimalValues {Number} Example: 287
   * @param medianOfUpperHalfOfEffectMeasurements {String} Example: 
   * @param medianOfLowerHalfOfEffectMeasurements {String} Example: 
   * @param numberOfEffectChangesForOptimalValues {Number} Example: 295
   * @param minimumEffectValue {Number} Example: 0.18
   * @param maximumEffectValue {Number} Example: 20.38
   * @param effectValueSpread {Number} Example: 20.2
   * @param minimumCauseValue {Number} Example: 5267.5521276596
   * @param maximumCauseValue {Number} Example: 104300
   * @param causeValueSpread {Number} Example: 99032.44787234
   * @param averageEffectFollowingHighCause {Number} Example: 8.5
   * @param averageEffectFollowingLowCause {Number} Example: 1.47
   * @param averageDailyLowCause {Number} Example: 21023.36
   * @param averageDailyHighCause {Number} Example: 101627.85
   * @param principalInvestigator {String} Example: 
   * @param causeVariableCombinationOperation {String} Example: 
   * @param valuePredictingHighOutcomeExplanation {String} Example: Reference And Learning Hours, on average, 0.84% higher after around 101187.2 Pa Barometric Pressure 
   * @param averageEffectFollowingHighCauseExplanation {String} Example: Reference And Learning Hours is 8.5h (1% higher) on average after days with around 101627.85 Pa Barometric Pressure
   * @param averageEffectFollowingLowCauseExplanation {String} Example: Reference And Learning Hours is 1.47h (83% lower) on average after days with around 21023.36 Pa Barometric Pressure
   * @param valuePredictingLowOutcomeExplanation {String} Example: Reference And Learning Hours, on average, 82.6% lower after around 97597.75 Pa Barometric Pressure 
   * @param numberOfUsers {String} Example: 
   * @param outcomeDataSources {String} Example: 
   * @param correlationIsContradictoryToOptimalValues {Boolean} Example: false
   * @param forwardSpearmanCorrelationCoefficient {Number} Example: -0.26193208156295
   * @param minimumProbability {Number} Example: 0.05
   * @param strongestPearsonCorrelationCoefficient {String} Example: 
   * @param pairsOverTimeChartConfig {Date} Example: 
   * @param correlationsOverOnsetDelaysChartConfig {String} Example: 
   * @param correlationsOverDurationsOfActionChartConfig {String} Example: 
   * @param onsetDelayWithStrongestPearsonCorrelation {String} Example: 
   * @param averageForwardPearsonCorrelationOverOnsetDelays {String} Example: 
   * @param averageReversePearsonCorrelationOverOnsetDelays {String} Example: 
   * @param pearsonCorrelationWithNoOnsetDelay {String} Example: 
   * @param voteStatisticalSignificance {Number} Example: 1
   * @param calculationStartTime {Date} Example: 
   * @param shareUserMeasurements {Boolean} Example: false
   * @param causeUserVariableShareUserMeasurements {String} Example: 
   * @param effectUserVariableShareUserMeasurements {String} Example: 
   * @param averagePearsonCorrelationCoefficientOverOnsetDelays {String} Example: 
   * @param onsetDelayWithStrongestPearsonCorrelationInHours {String} Example: 
   * @param causeVariableId {Number} Example: 96380
   * @param effectVariableId {Number} Example: 111642
   * @param studyLinkStatic {String} Example: https://local.quantimo.do/api/v2/study?causeVariableName=Barometric%20Pressure&effectVariableName=Reference%20And%20Learning%20Hours&userId=230
   * @param studyLinkDynamic {String} Example: https://local.quantimo.do/ionic/Modo/www/index.html#/app/study?causeVariableName=Barometric%20Pressure&effectVariableName=Reference%20And%20Learning%20Hours&userId=230
   * @param gaugeImage {String} Example: https://s3.amazonaws.com/quantimodo-docs/images/gauge-weakly-positive-relationship.png
   * @param imageUrl {String} Example: https://s3-us-west-1.amazonaws.com/qmimages/variable_categories_gauges_logo_background/gauge-weakly-positive-relationship_environment_activity_logo_background.png
   * @param gaugeImageSquare {String} Example: https://s3.amazonaws.com/quantimodo-docs/images/gauge-weakly-positive-relationship-200-200.png
   * @param onsetDelayInHours {Number} Example: 0
   * @param durationOfActionInHours {Number} Example: 0
   * @param effectVariableDefaultUnitId {Number} Example: 34
   * @param causeVariableDefaultUnitName {String} Example: 
   * @param causeVariableDefaultUnitAbbreviatedName {String} Example: Pa
   * @param effectVariableDefaultUnitName {String} Example: 
   * @param effectVariableDefaultUnitAbbreviatedName {String} Example: h
   * @param rawCauseMeasurementSignificance {Number} Example: 1
   * @param allPairsSignificance {Number} Example: 0.99994982531794
   * @param numberOfDaysSignificance {Number} Example: 0.99999929612614
   * @param rawEffectMeasurementSignificance {Number} Example: 1
   * @param optimalChangeSpread {Number} Example: 83.44
   * @param optimalChangeSpreadSignificance {Number} Example: 0.99999999999917
   * @param correlationsOverDurationsOfAction {String} Example: 
   * @param dataSourcesParagraphForEffect {String} Example: Reference And Learning Hours data was primarily collected using <a href=\"https://www.rescuetime.com/rp/quantimodo/plans\">RescueTime</a>.  Detailed reports show which applications and websites you spent time on. Activities are automatically grouped into pre-defined categories with built-in productivity scores covering thousands of websites and applications. You can customize categories and productivity scores to meet your needs.
   * @param dataSourcesParagraphForCause {String} Example: Barometric Pressure data was primarily collected using <a href=\"https://quantimo.do\">QuantiModo</a>.  <a href=\"https://quantimo.do\">QuantiModo</a> is a Chrome extension, Android app, iOS app, and web app that allows you to easily track mood, symptoms, or any outcome you want to optimize in a fraction of a second.  You can also import your data from over 30 other apps and devices like Fitbit, Rescuetime, Jawbone Up, Withings, Facebook, Github, Google Calendar, Runkeeper, MoodPanda, Slice, Google Fit, and more.  <a href=\"https://quantimo.do\">QuantiModo</a> then analyzes your data to identify which hidden factors are most likely to be influencing your mood or symptoms and their optimal daily values.
   * @param instructionsForEffect {String} Example: <a href=\"https://www.rescuetime.com/rp/quantimodo/plans\">Obtain RescueTime</a> and use it to record your Reference And Learning Hours. Once you have a <a href=\"https://www.rescuetime.com/rp/quantimodo/plans\">RescueTime</a> account, <a href=\"https://app.quantimo.do/ionic/Modo/www/#/app/import\">connect your  RescueTime account at QuantiModo</a> to automatically import and analyze your data.
   * @param instructionsForCause {String} Example: <a href=\"https://quantimo.do\">Obtain QuantiModo</a> and use it to record your Barometric Pressure. Once you have a <a href=\"https://quantimo.do\">QuantiModo</a> account, <a href=\"https://app.quantimo.do/ionic/Modo/www/#/app/import\">connect your  QuantiModo account at QuantiModo</a> to automatically import and analyze your data.
   * @param perDaySentenceFragment {String} Example: 
   * @param predictsLowEffectChangeSentenceFragment {String} Example: , on average, 82.6% 
   * @param predictsHighEffectChangeSentenceFragment {String} Example: , on average, 0.84% 
   * @param studyLinkEmail {String} Example: mailto:?subject=N1%20Study%3A%20Barometric%20Pressure%20Predicts%20Higher%20Reference%20And%20Learning%20Hours&body=Check%20out%20my%20study%20at%20https%3A%2F%2Flocal.quantimo.do%2Fapi%2Fv2%2Fstudy%3FcauseVariableName%3DBarometric%2520Pressure%26effectVariableName%3DReference%2520And%2520Learning%2520Hours%26userId%3D230%0A%0AHave%20a%20great%20day!
   * @param distanceFromMiddleToBeHightLowEffect {Number} Example: 25
   * @param numberOfSamples {Number} Example: 297
   * @param effectUnit {String} Example: h
   * @param causeVariableImageUrl {String} Example: https://maxcdn.icons8.com/Color/PNG/96/Weather/chance_of_storm-96.png
   * @param causeVariableIonIcon {String} Example: ion-ios-partlysunny
   * @param effectVariableImageUrl {String} Example: https://maxcdn.icons8.com/Color/PNG/96/Sports/football-96.png
   * @param effectVariableIonIcon {String} Example: ion-ios-body-outline
   */
  var exports = function(correlationCoefficient, onsetDelay, durationOfAction, numberOfPairs, effectSize, statisticalSignificance, timestamp, reversePearsonCorrelationCoefficient, predictivePearsonCorrelationCoefficient, causalityFactor, causeVariableCategoryName, effectVariableCategoryName, valuePredictingHighOutcome, valuePredictingLowOutcome, optimalPearsonProduct, userVote, averageVote, causeVariableDefaultUnitId, createdAt, updatedAt, causeChanges, effectChanges, qmScore, error, predictsHighEffectChange, predictsLowEffectChange, pValue, tValue, criticalTValue, confidenceInterval, experimentStartTime, experimentEndTime, userId, studyResults, dataAnalysis, outcomeMaximumAllowedValue, predictorMaximumAllowedValue, studyLimitations, significantDifference, significanceExplanation, strengthLevel, confidenceLevel, studyObjective, studyTitle, dataSources, studyAbstract, direction, predictivePearsonCorrelation, predictorExplanation, studyBackground, studyDesign, dataPoints, numberOfDays, reversePairsCount, causeChangesStatisticalSignificance, causeVariableCategoryId, effectVariableCategoryId, predictorFillingValue, outcomeFillingValue, causeNumberOfRawMeasurements, effectNumberOfRawMeasurements, causeNumberOfProcessedDailyMeasurements, effectNumberOfProcessedDailyMeasurements, causeVariableMostCommonConnectorId, effectVariableMostCommonConnectorId, studyLinkFacebook, studyLinkTwitter, studyLinkGoogle, causeVariableName, effectVariableName, averageEffect, numberOfLowEffectPairs, numberOfHighEffectPairs, degreesOfFreedom, numberOfUniqueCauseValuesForOptimalValues, numberOfUniqueEffectValuesForOptimalValues, numberOfCauseChangesForOptimalValues, medianOfUpperHalfOfEffectMeasurements, medianOfLowerHalfOfEffectMeasurements, numberOfEffectChangesForOptimalValues, minimumEffectValue, maximumEffectValue, effectValueSpread, minimumCauseValue, maximumCauseValue, causeValueSpread, averageEffectFollowingHighCause, averageEffectFollowingLowCause, averageDailyLowCause, averageDailyHighCause, principalInvestigator, causeVariableCombinationOperation, valuePredictingHighOutcomeExplanation, averageEffectFollowingHighCauseExplanation, averageEffectFollowingLowCauseExplanation, valuePredictingLowOutcomeExplanation, numberOfUsers, outcomeDataSources, correlationIsContradictoryToOptimalValues, forwardSpearmanCorrelationCoefficient, minimumProbability, strongestPearsonCorrelationCoefficient, pairsOverTimeChartConfig, correlationsOverOnsetDelaysChartConfig, correlationsOverDurationsOfActionChartConfig, onsetDelayWithStrongestPearsonCorrelation, averageForwardPearsonCorrelationOverOnsetDelays, averageReversePearsonCorrelationOverOnsetDelays, pearsonCorrelationWithNoOnsetDelay, voteStatisticalSignificance, calculationStartTime, shareUserMeasurements, causeUserVariableShareUserMeasurements, effectUserVariableShareUserMeasurements, averagePearsonCorrelationCoefficientOverOnsetDelays, onsetDelayWithStrongestPearsonCorrelationInHours, causeVariableId, effectVariableId, studyLinkStatic, studyLinkDynamic, gaugeImage, imageUrl, gaugeImageSquare, onsetDelayInHours, durationOfActionInHours, effectVariableDefaultUnitId, causeVariableDefaultUnitName, causeVariableDefaultUnitAbbreviatedName, effectVariableDefaultUnitName, effectVariableDefaultUnitAbbreviatedName, rawCauseMeasurementSignificance, allPairsSignificance, numberOfDaysSignificance, rawEffectMeasurementSignificance, optimalChangeSpread, optimalChangeSpreadSignificance, correlationsOverDurationsOfAction, dataSourcesParagraphForEffect, dataSourcesParagraphForCause, instructionsForEffect, instructionsForCause, perDaySentenceFragment, predictsLowEffectChangeSentenceFragment, predictsHighEffectChangeSentenceFragment, studyLinkEmail, distanceFromMiddleToBeHightLowEffect, numberOfSamples, effectUnit, causeVariableImageUrl, causeVariableIonIcon, effectVariableImageUrl, effectVariableIonIcon) {
    var _this = this;

    _this['correlationCoefficient'] = correlationCoefficient;
    _this['onsetDelay'] = onsetDelay;
    _this['durationOfAction'] = durationOfAction;
    _this['numberOfPairs'] = numberOfPairs;
    _this['effectSize'] = effectSize;
    _this['statisticalSignificance'] = statisticalSignificance;
    _this['timestamp'] = timestamp;
    _this['reversePearsonCorrelationCoefficient'] = reversePearsonCorrelationCoefficient;
    _this['predictivePearsonCorrelationCoefficient'] = predictivePearsonCorrelationCoefficient;
    _this['causalityFactor'] = causalityFactor;
    _this['causeVariableCategoryName'] = causeVariableCategoryName;
    _this['effectVariableCategoryName'] = effectVariableCategoryName;
    _this['valuePredictingHighOutcome'] = valuePredictingHighOutcome;
    _this['valuePredictingLowOutcome'] = valuePredictingLowOutcome;
    _this['optimalPearsonProduct'] = optimalPearsonProduct;
    _this['userVote'] = userVote;
    _this['averageVote'] = averageVote;
    _this['causeVariableDefaultUnitId'] = causeVariableDefaultUnitId;
    _this['createdAt'] = createdAt;
    _this['updatedAt'] = updatedAt;
    _this['causeChanges'] = causeChanges;
    _this['effectChanges'] = effectChanges;
    _this['qmScore'] = qmScore;
    _this['error'] = error;
    _this['predictsHighEffectChange'] = predictsHighEffectChange;
    _this['predictsLowEffectChange'] = predictsLowEffectChange;
    _this['pValue'] = pValue;
    _this['tValue'] = tValue;
    _this['criticalTValue'] = criticalTValue;
    _this['confidenceInterval'] = confidenceInterval;
    _this['experimentStartTime'] = experimentStartTime;
    _this['experimentEndTime'] = experimentEndTime;
    _this['userId'] = userId;
    _this['studyResults'] = studyResults;
    _this['dataAnalysis'] = dataAnalysis;
    _this['outcomeMaximumAllowedValue'] = outcomeMaximumAllowedValue;
    _this['predictorMaximumAllowedValue'] = predictorMaximumAllowedValue;
    _this['studyLimitations'] = studyLimitations;
    _this['significantDifference'] = significantDifference;
    _this['significanceExplanation'] = significanceExplanation;
    _this['strengthLevel'] = strengthLevel;
    _this['confidenceLevel'] = confidenceLevel;
    _this['studyObjective'] = studyObjective;
    _this['studyTitle'] = studyTitle;
    _this['dataSources'] = dataSources;
    _this['studyAbstract'] = studyAbstract;
    _this['direction'] = direction;
    _this['predictivePearsonCorrelation'] = predictivePearsonCorrelation;
    _this['predictorExplanation'] = predictorExplanation;
    _this['studyBackground'] = studyBackground;
    _this['studyDesign'] = studyDesign;
    _this['dataPoints'] = dataPoints;
    _this['numberOfDays'] = numberOfDays;
    _this['reversePairsCount'] = reversePairsCount;
    _this['causeChangesStatisticalSignificance'] = causeChangesStatisticalSignificance;
    _this['causeVariableCategoryId'] = causeVariableCategoryId;
    _this['effectVariableCategoryId'] = effectVariableCategoryId;
    _this['predictorFillingValue'] = predictorFillingValue;
    _this['outcomeFillingValue'] = outcomeFillingValue;
    _this['causeNumberOfRawMeasurements'] = causeNumberOfRawMeasurements;
    _this['effectNumberOfRawMeasurements'] = effectNumberOfRawMeasurements;
    _this['causeNumberOfProcessedDailyMeasurements'] = causeNumberOfProcessedDailyMeasurements;
    _this['effectNumberOfProcessedDailyMeasurements'] = effectNumberOfProcessedDailyMeasurements;
    _this['causeVariableMostCommonConnectorId'] = causeVariableMostCommonConnectorId;
    _this['effectVariableMostCommonConnectorId'] = effectVariableMostCommonConnectorId;
    _this['studyLinkFacebook'] = studyLinkFacebook;
    _this['studyLinkTwitter'] = studyLinkTwitter;
    _this['studyLinkGoogle'] = studyLinkGoogle;
    _this['causeVariableName'] = causeVariableName;
    _this['effectVariableName'] = effectVariableName;
    _this['averageEffect'] = averageEffect;
    _this['numberOfLowEffectPairs'] = numberOfLowEffectPairs;
    _this['numberOfHighEffectPairs'] = numberOfHighEffectPairs;
    _this['degreesOfFreedom'] = degreesOfFreedom;
    _this['numberOfUniqueCauseValuesForOptimalValues'] = numberOfUniqueCauseValuesForOptimalValues;
    _this['numberOfUniqueEffectValuesForOptimalValues'] = numberOfUniqueEffectValuesForOptimalValues;
    _this['numberOfCauseChangesForOptimalValues'] = numberOfCauseChangesForOptimalValues;
    _this['medianOfUpperHalfOfEffectMeasurements'] = medianOfUpperHalfOfEffectMeasurements;
    _this['medianOfLowerHalfOfEffectMeasurements'] = medianOfLowerHalfOfEffectMeasurements;
    _this['numberOfEffectChangesForOptimalValues'] = numberOfEffectChangesForOptimalValues;
    _this['minimumEffectValue'] = minimumEffectValue;
    _this['maximumEffectValue'] = maximumEffectValue;
    _this['effectValueSpread'] = effectValueSpread;
    _this['minimumCauseValue'] = minimumCauseValue;
    _this['maximumCauseValue'] = maximumCauseValue;
    _this['causeValueSpread'] = causeValueSpread;
    _this['averageEffectFollowingHighCause'] = averageEffectFollowingHighCause;
    _this['averageEffectFollowingLowCause'] = averageEffectFollowingLowCause;
    _this['averageDailyLowCause'] = averageDailyLowCause;
    _this['averageDailyHighCause'] = averageDailyHighCause;
    _this['principalInvestigator'] = principalInvestigator;
    _this['causeVariableCombinationOperation'] = causeVariableCombinationOperation;
    _this['valuePredictingHighOutcomeExplanation'] = valuePredictingHighOutcomeExplanation;
    _this['averageEffectFollowingHighCauseExplanation'] = averageEffectFollowingHighCauseExplanation;
    _this['averageEffectFollowingLowCauseExplanation'] = averageEffectFollowingLowCauseExplanation;
    _this['valuePredictingLowOutcomeExplanation'] = valuePredictingLowOutcomeExplanation;
    _this['numberOfUsers'] = numberOfUsers;
    _this['outcomeDataSources'] = outcomeDataSources;
    _this['correlationIsContradictoryToOptimalValues'] = correlationIsContradictoryToOptimalValues;
    _this['forwardSpearmanCorrelationCoefficient'] = forwardSpearmanCorrelationCoefficient;
    _this['minimumProbability'] = minimumProbability;
    _this['strongestPearsonCorrelationCoefficient'] = strongestPearsonCorrelationCoefficient;
    _this['pairsOverTimeChartConfig'] = pairsOverTimeChartConfig;
    _this['correlationsOverOnsetDelaysChartConfig'] = correlationsOverOnsetDelaysChartConfig;
    _this['correlationsOverDurationsOfActionChartConfig'] = correlationsOverDurationsOfActionChartConfig;
    _this['onsetDelayWithStrongestPearsonCorrelation'] = onsetDelayWithStrongestPearsonCorrelation;
    _this['averageForwardPearsonCorrelationOverOnsetDelays'] = averageForwardPearsonCorrelationOverOnsetDelays;
    _this['averageReversePearsonCorrelationOverOnsetDelays'] = averageReversePearsonCorrelationOverOnsetDelays;
    _this['pearsonCorrelationWithNoOnsetDelay'] = pearsonCorrelationWithNoOnsetDelay;
    _this['voteStatisticalSignificance'] = voteStatisticalSignificance;
    _this['calculationStartTime'] = calculationStartTime;
    _this['shareUserMeasurements'] = shareUserMeasurements;
    _this['causeUserVariableShareUserMeasurements'] = causeUserVariableShareUserMeasurements;
    _this['effectUserVariableShareUserMeasurements'] = effectUserVariableShareUserMeasurements;
    _this['averagePearsonCorrelationCoefficientOverOnsetDelays'] = averagePearsonCorrelationCoefficientOverOnsetDelays;
    _this['onsetDelayWithStrongestPearsonCorrelationInHours'] = onsetDelayWithStrongestPearsonCorrelationInHours;
    _this['causeVariableId'] = causeVariableId;
    _this['effectVariableId'] = effectVariableId;
    _this['studyLinkStatic'] = studyLinkStatic;
    _this['studyLinkDynamic'] = studyLinkDynamic;
    _this['gaugeImage'] = gaugeImage;
    _this['imageUrl'] = imageUrl;
    _this['gaugeImageSquare'] = gaugeImageSquare;
    _this['onsetDelayInHours'] = onsetDelayInHours;
    _this['durationOfActionInHours'] = durationOfActionInHours;
    _this['effectVariableDefaultUnitId'] = effectVariableDefaultUnitId;
    _this['causeVariableDefaultUnitName'] = causeVariableDefaultUnitName;
    _this['causeVariableDefaultUnitAbbreviatedName'] = causeVariableDefaultUnitAbbreviatedName;
    _this['effectVariableDefaultUnitName'] = effectVariableDefaultUnitName;
    _this['effectVariableDefaultUnitAbbreviatedName'] = effectVariableDefaultUnitAbbreviatedName;
    _this['rawCauseMeasurementSignificance'] = rawCauseMeasurementSignificance;
    _this['allPairsSignificance'] = allPairsSignificance;
    _this['numberOfDaysSignificance'] = numberOfDaysSignificance;
    _this['rawEffectMeasurementSignificance'] = rawEffectMeasurementSignificance;
    _this['optimalChangeSpread'] = optimalChangeSpread;
    _this['optimalChangeSpreadSignificance'] = optimalChangeSpreadSignificance;
    _this['correlationsOverDurationsOfAction'] = correlationsOverDurationsOfAction;
    _this['dataSourcesParagraphForEffect'] = dataSourcesParagraphForEffect;
    _this['dataSourcesParagraphForCause'] = dataSourcesParagraphForCause;
    _this['instructionsForEffect'] = instructionsForEffect;
    _this['instructionsForCause'] = instructionsForCause;
    _this['perDaySentenceFragment'] = perDaySentenceFragment;
    _this['predictsLowEffectChangeSentenceFragment'] = predictsLowEffectChangeSentenceFragment;
    _this['predictsHighEffectChangeSentenceFragment'] = predictsHighEffectChangeSentenceFragment;
    _this['studyLinkEmail'] = studyLinkEmail;
    _this['distanceFromMiddleToBeHightLowEffect'] = distanceFromMiddleToBeHightLowEffect;
    _this['numberOfSamples'] = numberOfSamples;
    _this['effectUnit'] = effectUnit;
    _this['causeVariableImageUrl'] = causeVariableImageUrl;
    _this['causeVariableIonIcon'] = causeVariableIonIcon;
    _this['effectVariableImageUrl'] = effectVariableImageUrl;
    _this['effectVariableIonIcon'] = effectVariableIonIcon;
  };

  /**
   * Constructs a <code>Statistic</code> from a plain JavaScript object, optionally creating a new instance.
   * Copies all relevant properties from <code>data</code> to <code>obj</code> if supplied or a new instance if not.
   * @param {Object} data The plain JavaScript object bearing properties of interest.
   * @param {module:model/Statistic} obj Optional instance to populate.
   * @return {module:model/Statistic} The populated <code>Statistic</code> instance.
   */
  exports.constructFromObject = function(data, obj) {
    if (data) {
      obj = obj || new exports();

      if (data.hasOwnProperty('correlationCoefficient')) {
        obj['correlationCoefficient'] = ApiClient.convertToType(data['correlationCoefficient'], 'Number');
      }
      if (data.hasOwnProperty('onsetDelay')) {
        obj['onsetDelay'] = ApiClient.convertToType(data['onsetDelay'], 'Number');
      }
      if (data.hasOwnProperty('durationOfAction')) {
        obj['durationOfAction'] = ApiClient.convertToType(data['durationOfAction'], 'Number');
      }
      if (data.hasOwnProperty('numberOfPairs')) {
        obj['numberOfPairs'] = ApiClient.convertToType(data['numberOfPairs'], 'Number');
      }
      if (data.hasOwnProperty('effectSize')) {
        obj['effectSize'] = ApiClient.convertToType(data['effectSize'], 'String');
      }
      if (data.hasOwnProperty('statisticalSignificance')) {
        obj['statisticalSignificance'] = ApiClient.convertToType(data['statisticalSignificance'], 'Number');
      }
      if (data.hasOwnProperty('timestamp')) {
        obj['timestamp'] = ApiClient.convertToType(data['timestamp'], 'Number');
      }
      if (data.hasOwnProperty('reversePearsonCorrelationCoefficient')) {
        obj['reversePearsonCorrelationCoefficient'] = ApiClient.convertToType(data['reversePearsonCorrelationCoefficient'], 'String');
      }
      if (data.hasOwnProperty('predictivePearsonCorrelationCoefficient')) {
        obj['predictivePearsonCorrelationCoefficient'] = ApiClient.convertToType(data['predictivePearsonCorrelationCoefficient'], 'Number');
      }
      if (data.hasOwnProperty('causalityFactor')) {
        obj['causalityFactor'] = ApiClient.convertToType(data['causalityFactor'], 'Number');
      }
      if (data.hasOwnProperty('causeVariableCategoryName')) {
        obj['causeVariableCategoryName'] = ApiClient.convertToType(data['causeVariableCategoryName'], 'String');
      }
      if (data.hasOwnProperty('effectVariableCategoryName')) {
        obj['effectVariableCategoryName'] = ApiClient.convertToType(data['effectVariableCategoryName'], 'String');
      }
      if (data.hasOwnProperty('valuePredictingHighOutcome')) {
        obj['valuePredictingHighOutcome'] = ApiClient.convertToType(data['valuePredictingHighOutcome'], 'Number');
      }
      if (data.hasOwnProperty('valuePredictingLowOutcome')) {
        obj['valuePredictingLowOutcome'] = ApiClient.convertToType(data['valuePredictingLowOutcome'], 'Number');
      }
      if (data.hasOwnProperty('optimalPearsonProduct')) {
        obj['optimalPearsonProduct'] = ApiClient.convertToType(data['optimalPearsonProduct'], 'Number');
      }
      if (data.hasOwnProperty('userVote')) {
        obj['userVote'] = ApiClient.convertToType(data['userVote'], 'String');
      }
      if (data.hasOwnProperty('averageVote')) {
        obj['averageVote'] = ApiClient.convertToType(data['averageVote'], 'String');
      }
      if (data.hasOwnProperty('causeVariableDefaultUnitId')) {
        obj['causeVariableDefaultUnitId'] = ApiClient.convertToType(data['causeVariableDefaultUnitId'], 'Number');
      }
      if (data.hasOwnProperty('createdAt')) {
        obj['createdAt'] = ApiClient.convertToType(data['createdAt'], 'Date');
      }
      if (data.hasOwnProperty('updatedAt')) {
        obj['updatedAt'] = ApiClient.convertToType(data['updatedAt'], 'Date');
      }
      if (data.hasOwnProperty('causeChanges')) {
        obj['causeChanges'] = ApiClient.convertToType(data['causeChanges'], 'Number');
      }
      if (data.hasOwnProperty('effectChanges')) {
        obj['effectChanges'] = ApiClient.convertToType(data['effectChanges'], 'Number');
      }
      if (data.hasOwnProperty('qmScore')) {
        obj['qmScore'] = ApiClient.convertToType(data['qmScore'], 'String');
      }
      if (data.hasOwnProperty('error')) {
        obj['error'] = ApiClient.convertToType(data['error'], 'String');
      }
      if (data.hasOwnProperty('predictsHighEffectChange')) {
        obj['predictsHighEffectChange'] = ApiClient.convertToType(data['predictsHighEffectChange'], 'Number');
      }
      if (data.hasOwnProperty('predictsLowEffectChange')) {
        obj['predictsLowEffectChange'] = ApiClient.convertToType(data['predictsLowEffectChange'], 'Number');
      }
      if (data.hasOwnProperty('pValue')) {
        obj['pValue'] = ApiClient.convertToType(data['pValue'], 'Number');
      }
      if (data.hasOwnProperty('tValue')) {
        obj['tValue'] = ApiClient.convertToType(data['tValue'], 'Number');
      }
      if (data.hasOwnProperty('criticalTValue')) {
        obj['criticalTValue'] = ApiClient.convertToType(data['criticalTValue'], 'Number');
      }
      if (data.hasOwnProperty('confidenceInterval')) {
        obj['confidenceInterval'] = ApiClient.convertToType(data['confidenceInterval'], 'Number');
      }
      if (data.hasOwnProperty('experimentStartTime')) {
        obj['experimentStartTime'] = ApiClient.convertToType(data['experimentStartTime'], 'Number');
      }
      if (data.hasOwnProperty('experimentEndTime')) {
        obj['experimentEndTime'] = ApiClient.convertToType(data['experimentEndTime'], 'Number');
      }
      if (data.hasOwnProperty('userId')) {
        obj['userId'] = ApiClient.convertToType(data['userId'], 'Number');
      }
      if (data.hasOwnProperty('studyResults')) {
        obj['studyResults'] = ApiClient.convertToType(data['studyResults'], 'String');
      }
      if (data.hasOwnProperty('dataAnalysis')) {
        obj['dataAnalysis'] = ApiClient.convertToType(data['dataAnalysis'], 'String');
      }
      if (data.hasOwnProperty('outcomeMaximumAllowedValue')) {
        obj['outcomeMaximumAllowedValue'] = ApiClient.convertToType(data['outcomeMaximumAllowedValue'], 'String');
      }
      if (data.hasOwnProperty('predictorMaximumAllowedValue')) {
        obj['predictorMaximumAllowedValue'] = ApiClient.convertToType(data['predictorMaximumAllowedValue'], 'String');
      }
      if (data.hasOwnProperty('studyLimitations')) {
        obj['studyLimitations'] = ApiClient.convertToType(data['studyLimitations'], 'String');
      }
      if (data.hasOwnProperty('significantDifference')) {
        obj['significantDifference'] = ApiClient.convertToType(data['significantDifference'], 'Boolean');
      }
      if (data.hasOwnProperty('significanceExplanation')) {
        obj['significanceExplanation'] = ApiClient.convertToType(data['significanceExplanation'], 'String');
      }
      if (data.hasOwnProperty('strengthLevel')) {
        obj['strengthLevel'] = ApiClient.convertToType(data['strengthLevel'], 'String');
      }
      if (data.hasOwnProperty('confidenceLevel')) {
        obj['confidenceLevel'] = ApiClient.convertToType(data['confidenceLevel'], 'String');
      }
      if (data.hasOwnProperty('studyObjective')) {
        obj['studyObjective'] = ApiClient.convertToType(data['studyObjective'], 'String');
      }
      if (data.hasOwnProperty('studyTitle')) {
        obj['studyTitle'] = ApiClient.convertToType(data['studyTitle'], 'String');
      }
      if (data.hasOwnProperty('dataSources')) {
        obj['dataSources'] = ApiClient.convertToType(data['dataSources'], 'String');
      }
      if (data.hasOwnProperty('studyAbstract')) {
        obj['studyAbstract'] = ApiClient.convertToType(data['studyAbstract'], 'String');
      }
      if (data.hasOwnProperty('direction')) {
        obj['direction'] = ApiClient.convertToType(data['direction'], 'String');
      }
      if (data.hasOwnProperty('predictivePearsonCorrelation')) {
        obj['predictivePearsonCorrelation'] = ApiClient.convertToType(data['predictivePearsonCorrelation'], 'String');
      }
      if (data.hasOwnProperty('predictorExplanation')) {
        obj['predictorExplanation'] = ApiClient.convertToType(data['predictorExplanation'], 'String');
      }
      if (data.hasOwnProperty('studyBackground')) {
        obj['studyBackground'] = ApiClient.convertToType(data['studyBackground'], 'String');
      }
      if (data.hasOwnProperty('studyDesign')) {
        obj['studyDesign'] = ApiClient.convertToType(data['studyDesign'], 'String');
      }
      if (data.hasOwnProperty('dataPoints')) {
        obj['dataPoints'] = ApiClient.convertToType(data['dataPoints'], 'String');
      }
      if (data.hasOwnProperty('numberOfDays')) {
        obj['numberOfDays'] = ApiClient.convertToType(data['numberOfDays'], 'Number');
      }
      if (data.hasOwnProperty('reversePairsCount')) {
        obj['reversePairsCount'] = ApiClient.convertToType(data['reversePairsCount'], 'String');
      }
      if (data.hasOwnProperty('causeChangesStatisticalSignificance')) {
        obj['causeChangesStatisticalSignificance'] = ApiClient.convertToType(data['causeChangesStatisticalSignificance'], 'Number');
      }
      if (data.hasOwnProperty('causeVariableCategoryId')) {
        obj['causeVariableCategoryId'] = ApiClient.convertToType(data['causeVariableCategoryId'], 'Number');
      }
      if (data.hasOwnProperty('effectVariableCategoryId')) {
        obj['effectVariableCategoryId'] = ApiClient.convertToType(data['effectVariableCategoryId'], 'Number');
      }
      if (data.hasOwnProperty('predictorFillingValue')) {
        obj['predictorFillingValue'] = ApiClient.convertToType(data['predictorFillingValue'], 'String');
      }
      if (data.hasOwnProperty('outcomeFillingValue')) {
        obj['outcomeFillingValue'] = ApiClient.convertToType(data['outcomeFillingValue'], 'String');
      }
      if (data.hasOwnProperty('causeNumberOfRawMeasurements')) {
        obj['causeNumberOfRawMeasurements'] = ApiClient.convertToType(data['causeNumberOfRawMeasurements'], 'Number');
      }
      if (data.hasOwnProperty('effectNumberOfRawMeasurements')) {
        obj['effectNumberOfRawMeasurements'] = ApiClient.convertToType(data['effectNumberOfRawMeasurements'], 'Number');
      }
      if (data.hasOwnProperty('causeNumberOfProcessedDailyMeasurements')) {
        obj['causeNumberOfProcessedDailyMeasurements'] = ApiClient.convertToType(data['causeNumberOfProcessedDailyMeasurements'], 'Number');
      }
      if (data.hasOwnProperty('effectNumberOfProcessedDailyMeasurements')) {
        obj['effectNumberOfProcessedDailyMeasurements'] = ApiClient.convertToType(data['effectNumberOfProcessedDailyMeasurements'], 'Number');
      }
      if (data.hasOwnProperty('causeVariableMostCommonConnectorId')) {
        obj['causeVariableMostCommonConnectorId'] = ApiClient.convertToType(data['causeVariableMostCommonConnectorId'], 'Number');
      }
      if (data.hasOwnProperty('effectVariableMostCommonConnectorId')) {
        obj['effectVariableMostCommonConnectorId'] = ApiClient.convertToType(data['effectVariableMostCommonConnectorId'], 'Number');
      }
      if (data.hasOwnProperty('studyLinkFacebook')) {
        obj['studyLinkFacebook'] = ApiClient.convertToType(data['studyLinkFacebook'], 'String');
      }
      if (data.hasOwnProperty('studyLinkTwitter')) {
        obj['studyLinkTwitter'] = ApiClient.convertToType(data['studyLinkTwitter'], 'String');
      }
      if (data.hasOwnProperty('studyLinkGoogle')) {
        obj['studyLinkGoogle'] = ApiClient.convertToType(data['studyLinkGoogle'], 'String');
      }
      if (data.hasOwnProperty('causeVariableName')) {
        obj['causeVariableName'] = ApiClient.convertToType(data['causeVariableName'], 'String');
      }
      if (data.hasOwnProperty('effectVariableName')) {
        obj['effectVariableName'] = ApiClient.convertToType(data['effectVariableName'], 'String');
      }
      if (data.hasOwnProperty('averageEffect')) {
        obj['averageEffect'] = ApiClient.convertToType(data['averageEffect'], 'Number');
      }
      if (data.hasOwnProperty('numberOfLowEffectPairs')) {
        obj['numberOfLowEffectPairs'] = ApiClient.convertToType(data['numberOfLowEffectPairs'], 'Number');
      }
      if (data.hasOwnProperty('numberOfHighEffectPairs')) {
        obj['numberOfHighEffectPairs'] = ApiClient.convertToType(data['numberOfHighEffectPairs'], 'Number');
      }
      if (data.hasOwnProperty('degreesOfFreedom')) {
        obj['degreesOfFreedom'] = ApiClient.convertToType(data['degreesOfFreedom'], 'Number');
      }
      if (data.hasOwnProperty('numberOfUniqueCauseValuesForOptimalValues')) {
        obj['numberOfUniqueCauseValuesForOptimalValues'] = ApiClient.convertToType(data['numberOfUniqueCauseValuesForOptimalValues'], 'Number');
      }
      if (data.hasOwnProperty('numberOfUniqueEffectValuesForOptimalValues')) {
        obj['numberOfUniqueEffectValuesForOptimalValues'] = ApiClient.convertToType(data['numberOfUniqueEffectValuesForOptimalValues'], 'Number');
      }
      if (data.hasOwnProperty('numberOfCauseChangesForOptimalValues')) {
        obj['numberOfCauseChangesForOptimalValues'] = ApiClient.convertToType(data['numberOfCauseChangesForOptimalValues'], 'Number');
      }
      if (data.hasOwnProperty('medianOfUpperHalfOfEffectMeasurements')) {
        obj['medianOfUpperHalfOfEffectMeasurements'] = ApiClient.convertToType(data['medianOfUpperHalfOfEffectMeasurements'], 'String');
      }
      if (data.hasOwnProperty('medianOfLowerHalfOfEffectMeasurements')) {
        obj['medianOfLowerHalfOfEffectMeasurements'] = ApiClient.convertToType(data['medianOfLowerHalfOfEffectMeasurements'], 'String');
      }
      if (data.hasOwnProperty('numberOfEffectChangesForOptimalValues')) {
        obj['numberOfEffectChangesForOptimalValues'] = ApiClient.convertToType(data['numberOfEffectChangesForOptimalValues'], 'Number');
      }
      if (data.hasOwnProperty('minimumEffectValue')) {
        obj['minimumEffectValue'] = ApiClient.convertToType(data['minimumEffectValue'], 'Number');
      }
      if (data.hasOwnProperty('maximumEffectValue')) {
        obj['maximumEffectValue'] = ApiClient.convertToType(data['maximumEffectValue'], 'Number');
      }
      if (data.hasOwnProperty('effectValueSpread')) {
        obj['effectValueSpread'] = ApiClient.convertToType(data['effectValueSpread'], 'Number');
      }
      if (data.hasOwnProperty('minimumCauseValue')) {
        obj['minimumCauseValue'] = ApiClient.convertToType(data['minimumCauseValue'], 'Number');
      }
      if (data.hasOwnProperty('maximumCauseValue')) {
        obj['maximumCauseValue'] = ApiClient.convertToType(data['maximumCauseValue'], 'Number');
      }
      if (data.hasOwnProperty('causeValueSpread')) {
        obj['causeValueSpread'] = ApiClient.convertToType(data['causeValueSpread'], 'Number');
      }
      if (data.hasOwnProperty('averageEffectFollowingHighCause')) {
        obj['averageEffectFollowingHighCause'] = ApiClient.convertToType(data['averageEffectFollowingHighCause'], 'Number');
      }
      if (data.hasOwnProperty('averageEffectFollowingLowCause')) {
        obj['averageEffectFollowingLowCause'] = ApiClient.convertToType(data['averageEffectFollowingLowCause'], 'Number');
      }
      if (data.hasOwnProperty('averageDailyLowCause')) {
        obj['averageDailyLowCause'] = ApiClient.convertToType(data['averageDailyLowCause'], 'Number');
      }
      if (data.hasOwnProperty('averageDailyHighCause')) {
        obj['averageDailyHighCause'] = ApiClient.convertToType(data['averageDailyHighCause'], 'Number');
      }
      if (data.hasOwnProperty('principalInvestigator')) {
        obj['principalInvestigator'] = ApiClient.convertToType(data['principalInvestigator'], 'String');
      }
      if (data.hasOwnProperty('causeVariableCombinationOperation')) {
        obj['causeVariableCombinationOperation'] = ApiClient.convertToType(data['causeVariableCombinationOperation'], 'String');
      }
      if (data.hasOwnProperty('valuePredictingHighOutcomeExplanation')) {
        obj['valuePredictingHighOutcomeExplanation'] = ApiClient.convertToType(data['valuePredictingHighOutcomeExplanation'], 'String');
      }
      if (data.hasOwnProperty('averageEffectFollowingHighCauseExplanation')) {
        obj['averageEffectFollowingHighCauseExplanation'] = ApiClient.convertToType(data['averageEffectFollowingHighCauseExplanation'], 'String');
      }
      if (data.hasOwnProperty('averageEffectFollowingLowCauseExplanation')) {
        obj['averageEffectFollowingLowCauseExplanation'] = ApiClient.convertToType(data['averageEffectFollowingLowCauseExplanation'], 'String');
      }
      if (data.hasOwnProperty('valuePredictingLowOutcomeExplanation')) {
        obj['valuePredictingLowOutcomeExplanation'] = ApiClient.convertToType(data['valuePredictingLowOutcomeExplanation'], 'String');
      }
      if (data.hasOwnProperty('numberOfUsers')) {
        obj['numberOfUsers'] = ApiClient.convertToType(data['numberOfUsers'], 'String');
      }
      if (data.hasOwnProperty('outcomeDataSources')) {
        obj['outcomeDataSources'] = ApiClient.convertToType(data['outcomeDataSources'], 'String');
      }
      if (data.hasOwnProperty('correlationIsContradictoryToOptimalValues')) {
        obj['correlationIsContradictoryToOptimalValues'] = ApiClient.convertToType(data['correlationIsContradictoryToOptimalValues'], 'Boolean');
      }
      if (data.hasOwnProperty('forwardSpearmanCorrelationCoefficient')) {
        obj['forwardSpearmanCorrelationCoefficient'] = ApiClient.convertToType(data['forwardSpearmanCorrelationCoefficient'], 'Number');
      }
      if (data.hasOwnProperty('minimumProbability')) {
        obj['minimumProbability'] = ApiClient.convertToType(data['minimumProbability'], 'Number');
      }
      if (data.hasOwnProperty('strongestPearsonCorrelationCoefficient')) {
        obj['strongestPearsonCorrelationCoefficient'] = ApiClient.convertToType(data['strongestPearsonCorrelationCoefficient'], 'String');
      }
      if (data.hasOwnProperty('pairsOverTimeChartConfig')) {
        obj['pairsOverTimeChartConfig'] = ApiClient.convertToType(data['pairsOverTimeChartConfig'], 'Date');
      }
      if (data.hasOwnProperty('correlationsOverOnsetDelaysChartConfig')) {
        obj['correlationsOverOnsetDelaysChartConfig'] = ApiClient.convertToType(data['correlationsOverOnsetDelaysChartConfig'], 'String');
      }
      if (data.hasOwnProperty('correlationsOverDurationsOfActionChartConfig')) {
        obj['correlationsOverDurationsOfActionChartConfig'] = ApiClient.convertToType(data['correlationsOverDurationsOfActionChartConfig'], 'String');
      }
      if (data.hasOwnProperty('onsetDelayWithStrongestPearsonCorrelation')) {
        obj['onsetDelayWithStrongestPearsonCorrelation'] = ApiClient.convertToType(data['onsetDelayWithStrongestPearsonCorrelation'], 'String');
      }
      if (data.hasOwnProperty('averageForwardPearsonCorrelationOverOnsetDelays')) {
        obj['averageForwardPearsonCorrelationOverOnsetDelays'] = ApiClient.convertToType(data['averageForwardPearsonCorrelationOverOnsetDelays'], 'String');
      }
      if (data.hasOwnProperty('averageReversePearsonCorrelationOverOnsetDelays')) {
        obj['averageReversePearsonCorrelationOverOnsetDelays'] = ApiClient.convertToType(data['averageReversePearsonCorrelationOverOnsetDelays'], 'String');
      }
      if (data.hasOwnProperty('pearsonCorrelationWithNoOnsetDelay')) {
        obj['pearsonCorrelationWithNoOnsetDelay'] = ApiClient.convertToType(data['pearsonCorrelationWithNoOnsetDelay'], 'String');
      }
      if (data.hasOwnProperty('voteStatisticalSignificance')) {
        obj['voteStatisticalSignificance'] = ApiClient.convertToType(data['voteStatisticalSignificance'], 'Number');
      }
      if (data.hasOwnProperty('calculationStartTime')) {
        obj['calculationStartTime'] = ApiClient.convertToType(data['calculationStartTime'], 'Date');
      }
      if (data.hasOwnProperty('shareUserMeasurements')) {
        obj['shareUserMeasurements'] = ApiClient.convertToType(data['shareUserMeasurements'], 'Boolean');
      }
      if (data.hasOwnProperty('causeUserVariableShareUserMeasurements')) {
        obj['causeUserVariableShareUserMeasurements'] = ApiClient.convertToType(data['causeUserVariableShareUserMeasurements'], 'String');
      }
      if (data.hasOwnProperty('effectUserVariableShareUserMeasurements')) {
        obj['effectUserVariableShareUserMeasurements'] = ApiClient.convertToType(data['effectUserVariableShareUserMeasurements'], 'String');
      }
      if (data.hasOwnProperty('averagePearsonCorrelationCoefficientOverOnsetDelays')) {
        obj['averagePearsonCorrelationCoefficientOverOnsetDelays'] = ApiClient.convertToType(data['averagePearsonCorrelationCoefficientOverOnsetDelays'], 'String');
      }
      if (data.hasOwnProperty('onsetDelayWithStrongestPearsonCorrelationInHours')) {
        obj['onsetDelayWithStrongestPearsonCorrelationInHours'] = ApiClient.convertToType(data['onsetDelayWithStrongestPearsonCorrelationInHours'], 'String');
      }
      if (data.hasOwnProperty('causeVariableId')) {
        obj['causeVariableId'] = ApiClient.convertToType(data['causeVariableId'], 'Number');
      }
      if (data.hasOwnProperty('effectVariableId')) {
        obj['effectVariableId'] = ApiClient.convertToType(data['effectVariableId'], 'Number');
      }
      if (data.hasOwnProperty('studyLinkStatic')) {
        obj['studyLinkStatic'] = ApiClient.convertToType(data['studyLinkStatic'], 'String');
      }
      if (data.hasOwnProperty('studyLinkDynamic')) {
        obj['studyLinkDynamic'] = ApiClient.convertToType(data['studyLinkDynamic'], 'String');
      }
      if (data.hasOwnProperty('gaugeImage')) {
        obj['gaugeImage'] = ApiClient.convertToType(data['gaugeImage'], 'String');
      }
      if (data.hasOwnProperty('imageUrl')) {
        obj['imageUrl'] = ApiClient.convertToType(data['imageUrl'], 'String');
      }
      if (data.hasOwnProperty('gaugeImageSquare')) {
        obj['gaugeImageSquare'] = ApiClient.convertToType(data['gaugeImageSquare'], 'String');
      }
      if (data.hasOwnProperty('onsetDelayInHours')) {
        obj['onsetDelayInHours'] = ApiClient.convertToType(data['onsetDelayInHours'], 'Number');
      }
      if (data.hasOwnProperty('durationOfActionInHours')) {
        obj['durationOfActionInHours'] = ApiClient.convertToType(data['durationOfActionInHours'], 'Number');
      }
      if (data.hasOwnProperty('effectVariableDefaultUnitId')) {
        obj['effectVariableDefaultUnitId'] = ApiClient.convertToType(data['effectVariableDefaultUnitId'], 'Number');
      }
      if (data.hasOwnProperty('causeVariableDefaultUnitName')) {
        obj['causeVariableDefaultUnitName'] = ApiClient.convertToType(data['causeVariableDefaultUnitName'], 'String');
      }
      if (data.hasOwnProperty('causeVariableDefaultUnitAbbreviatedName')) {
        obj['causeVariableDefaultUnitAbbreviatedName'] = ApiClient.convertToType(data['causeVariableDefaultUnitAbbreviatedName'], 'String');
      }
      if (data.hasOwnProperty('effectVariableDefaultUnitName')) {
        obj['effectVariableDefaultUnitName'] = ApiClient.convertToType(data['effectVariableDefaultUnitName'], 'String');
      }
      if (data.hasOwnProperty('effectVariableDefaultUnitAbbreviatedName')) {
        obj['effectVariableDefaultUnitAbbreviatedName'] = ApiClient.convertToType(data['effectVariableDefaultUnitAbbreviatedName'], 'String');
      }
      if (data.hasOwnProperty('rawCauseMeasurementSignificance')) {
        obj['rawCauseMeasurementSignificance'] = ApiClient.convertToType(data['rawCauseMeasurementSignificance'], 'Number');
      }
      if (data.hasOwnProperty('allPairsSignificance')) {
        obj['allPairsSignificance'] = ApiClient.convertToType(data['allPairsSignificance'], 'Number');
      }
      if (data.hasOwnProperty('numberOfDaysSignificance')) {
        obj['numberOfDaysSignificance'] = ApiClient.convertToType(data['numberOfDaysSignificance'], 'Number');
      }
      if (data.hasOwnProperty('rawEffectMeasurementSignificance')) {
        obj['rawEffectMeasurementSignificance'] = ApiClient.convertToType(data['rawEffectMeasurementSignificance'], 'Number');
      }
      if (data.hasOwnProperty('optimalChangeSpread')) {
        obj['optimalChangeSpread'] = ApiClient.convertToType(data['optimalChangeSpread'], 'Number');
      }
      if (data.hasOwnProperty('optimalChangeSpreadSignificance')) {
        obj['optimalChangeSpreadSignificance'] = ApiClient.convertToType(data['optimalChangeSpreadSignificance'], 'Number');
      }
      if (data.hasOwnProperty('correlationsOverDurationsOfAction')) {
        obj['correlationsOverDurationsOfAction'] = ApiClient.convertToType(data['correlationsOverDurationsOfAction'], 'String');
      }
      if (data.hasOwnProperty('dataSourcesParagraphForEffect')) {
        obj['dataSourcesParagraphForEffect'] = ApiClient.convertToType(data['dataSourcesParagraphForEffect'], 'String');
      }
      if (data.hasOwnProperty('dataSourcesParagraphForCause')) {
        obj['dataSourcesParagraphForCause'] = ApiClient.convertToType(data['dataSourcesParagraphForCause'], 'String');
      }
      if (data.hasOwnProperty('instructionsForEffect')) {
        obj['instructionsForEffect'] = ApiClient.convertToType(data['instructionsForEffect'], 'String');
      }
      if (data.hasOwnProperty('instructionsForCause')) {
        obj['instructionsForCause'] = ApiClient.convertToType(data['instructionsForCause'], 'String');
      }
      if (data.hasOwnProperty('perDaySentenceFragment')) {
        obj['perDaySentenceFragment'] = ApiClient.convertToType(data['perDaySentenceFragment'], 'String');
      }
      if (data.hasOwnProperty('predictsLowEffectChangeSentenceFragment')) {
        obj['predictsLowEffectChangeSentenceFragment'] = ApiClient.convertToType(data['predictsLowEffectChangeSentenceFragment'], 'String');
      }
      if (data.hasOwnProperty('predictsHighEffectChangeSentenceFragment')) {
        obj['predictsHighEffectChangeSentenceFragment'] = ApiClient.convertToType(data['predictsHighEffectChangeSentenceFragment'], 'String');
      }
      if (data.hasOwnProperty('studyLinkEmail')) {
        obj['studyLinkEmail'] = ApiClient.convertToType(data['studyLinkEmail'], 'String');
      }
      if (data.hasOwnProperty('distanceFromMiddleToBeHightLowEffect')) {
        obj['distanceFromMiddleToBeHightLowEffect'] = ApiClient.convertToType(data['distanceFromMiddleToBeHightLowEffect'], 'Number');
      }
      if (data.hasOwnProperty('numberOfSamples')) {
        obj['numberOfSamples'] = ApiClient.convertToType(data['numberOfSamples'], 'Number');
      }
      if (data.hasOwnProperty('effectUnit')) {
        obj['effectUnit'] = ApiClient.convertToType(data['effectUnit'], 'String');
      }
      if (data.hasOwnProperty('causeVariableImageUrl')) {
        obj['causeVariableImageUrl'] = ApiClient.convertToType(data['causeVariableImageUrl'], 'String');
      }
      if (data.hasOwnProperty('causeVariableIonIcon')) {
        obj['causeVariableIonIcon'] = ApiClient.convertToType(data['causeVariableIonIcon'], 'String');
      }
      if (data.hasOwnProperty('effectVariableImageUrl')) {
        obj['effectVariableImageUrl'] = ApiClient.convertToType(data['effectVariableImageUrl'], 'String');
      }
      if (data.hasOwnProperty('effectVariableIonIcon')) {
        obj['effectVariableIonIcon'] = ApiClient.convertToType(data['effectVariableIonIcon'], 'String');
      }
    }
    return obj;
  }

  /**
   * Example: 0.147
   * @member {Number} correlationCoefficient
   */
  exports.prototype['correlationCoefficient'] = undefined;
  /**
   * Example: 0
   * @member {Number} onsetDelay
   */
  exports.prototype['onsetDelay'] = undefined;
  /**
   * Example: 604800
   * @member {Number} durationOfAction
   */
  exports.prototype['durationOfAction'] = undefined;
  /**
   * Example: 297
   * @member {Number} numberOfPairs
   */
  exports.prototype['numberOfPairs'] = undefined;
  /**
   * Example: weakly positive
   * @member {String} effectSize
   */
  exports.prototype['effectSize'] = undefined;
  /**
   * Example: 0.99987910063243
   * @member {Number} statisticalSignificance
   */
  exports.prototype['statisticalSignificance'] = undefined;
  /**
   * Example: 1502080560
   * @member {Number} timestamp
   */
  exports.prototype['timestamp'] = undefined;
  /**
   * Example: 
   * @member {String} reversePearsonCorrelationCoefficient
   */
  exports.prototype['reversePearsonCorrelationCoefficient'] = undefined;
  /**
   * Example: 0.147
   * @member {Number} predictivePearsonCorrelationCoefficient
   */
  exports.prototype['predictivePearsonCorrelationCoefficient'] = undefined;
  /**
   * Example: 0.147
   * @member {Number} causalityFactor
   */
  exports.prototype['causalityFactor'] = undefined;
  /**
   * Example: Environment
   * @member {String} causeVariableCategoryName
   */
  exports.prototype['causeVariableCategoryName'] = undefined;
  /**
   * Example: Activity
   * @member {String} effectVariableCategoryName
   */
  exports.prototype['effectVariableCategoryName'] = undefined;
  /**
   * Example: 101187.2
   * @member {Number} valuePredictingHighOutcome
   */
  exports.prototype['valuePredictingHighOutcome'] = undefined;
  /**
   * Example: 97597.75
   * @member {Number} valuePredictingLowOutcome
   */
  exports.prototype['valuePredictingLowOutcome'] = undefined;
  /**
   * Example: 0.063550992332336
   * @member {Number} optimalPearsonProduct
   */
  exports.prototype['optimalPearsonProduct'] = undefined;
  /**
   * Example: 
   * @member {String} userVote
   */
  exports.prototype['userVote'] = undefined;
  /**
   * Example: 
   * @member {String} averageVote
   */
  exports.prototype['averageVote'] = undefined;
  /**
   * Example: 47
   * @member {Number} causeVariableDefaultUnitId
   */
  exports.prototype['causeVariableDefaultUnitId'] = undefined;
  /**
   * Example: 
   * @member {Date} createdAt
   */
  exports.prototype['createdAt'] = undefined;
  /**
   * Example: 
   * @member {Date} updatedAt
   */
  exports.prototype['updatedAt'] = undefined;
  /**
   * Example: 287
   * @member {Number} causeChanges
   */
  exports.prototype['causeChanges'] = undefined;
  /**
   * Example: 295
   * @member {Number} effectChanges
   */
  exports.prototype['effectChanges'] = undefined;
  /**
   * Example: 
   * @member {String} qmScore
   */
  exports.prototype['qmScore'] = undefined;
  /**
   * Example: optimalPearsonProduct is not defined
   * @member {String} error
   */
  exports.prototype['error'] = undefined;
  /**
   * Example: 0.84
   * @member {Number} predictsHighEffectChange
   */
  exports.prototype['predictsHighEffectChange'] = undefined;
  /**
   * Example: -82.6
   * @member {Number} predictsLowEffectChange
   */
  exports.prototype['predictsLowEffectChange'] = undefined;
  /**
   * Example: 0
   * @member {Number} pValue
   */
  exports.prototype['pValue'] = undefined;
  /**
   * Example: 8.1106621038493
   * @member {Number} tValue
   */
  exports.prototype['tValue'] = undefined;
  /**
   * Example: 1.646
   * @member {Number} criticalTValue
   */
  exports.prototype['criticalTValue'] = undefined;
  /**
   * Example: 1.4269359716898
   * @member {Number} confidenceInterval
   */
  exports.prototype['confidenceInterval'] = undefined;
  /**
   * Example: 1464937200
   * @member {Number} experimentStartTime
   */
  exports.prototype['experimentStartTime'] = undefined;
  /**
   * Example: 1501722000
   * @member {Number} experimentEndTime
   */
  exports.prototype['experimentEndTime'] = undefined;
  /**
   * Example: 230
   * @member {Number} userId
   */
  exports.prototype['userId'] = undefined;
  /**
   * Example: This analysis suggests that higher Barometric Pressure (Environment) generally predicts higher Reference And Learning Hours (p = 0).  Reference And Learning Hours is, on average, 0.84%  higher after around 101187.2 Barometric Pressure.  After an onset delay of 168 hours, Reference And Learning Hours is, on average, 82.6%  lower than its average over the 168 hours following around 97597.75 Barometric Pressure.  297 data points were used in this analysis.  The value for Barometric Pressure changed 287 times, effectively running 144 separate natural experiments.  The top quartile outcome values are preceded by an average 101187.2 Pa of Barometric Pressure.  The bottom quartile outcome values are preceded by an average 97597.75 Pa of Barometric Pressure.  Forward Pearson Correlation Coefficient was 0.147 (p=0, 95% CI -1.28 to 1.574 onset delay = 0 hours, duration of action = 168 hours) .  The Reverse Pearson Correlation Coefficient was 0 (P=0, 95% CI -1.427 to 1.427, onset delay = -0 hours, duration of action = -168 hours). When the Barometric Pressure value is closer to 101187.2 Pa than 97597.75 Pa, the Reference And Learning Hours value which follows is, on average, 0.84%  percent higher than its typical value.  When the Barometric Pressure value is closer to 97597.75 Pa than 101187.2 Pa, the Reference And Learning Hours value which follows is 0% lower than its typical value.  Reference And Learning Hours is 8.5h (1% higher) on average after days with around 101627.85 Pa Barometric Pressure  Reference And Learning Hours is 1.47h (83% lower) on average after days with around 21023.36 Pa Barometric Pressure
   * @member {String} studyResults
   */
  exports.prototype['studyResults'] = undefined;
  /**
   * Example: It was assumed that 0 hours would pass before a change in Barometric Pressure would produce an observable change in Reference And Learning Hours.  It was assumed that Barometric Pressure could produce an observable change in Reference And Learning Hours for as much as 7 days after the stimulus event.  
   * @member {String} dataAnalysis
   */
  exports.prototype['dataAnalysis'] = undefined;
  /**
   * Example: 
   * @member {String} outcomeMaximumAllowedValue
   */
  exports.prototype['outcomeMaximumAllowedValue'] = undefined;
  /**
   * Example: 
   * @member {String} predictorMaximumAllowedValue
   */
  exports.prototype['predictorMaximumAllowedValue'] = undefined;
  /**
   * Example: As with any human experiment, it was impossible to control for all potentially confounding variables.                           Correlation does not necessarily imply correlation.  We can never know for sure if one factor is definitely the cause of an outcome.               However, lack of correlation definitely implies the lack of a causal relationship.  Hence, we can with great              confidence rule out non-existent relationships. For instance, if we discover no relationship between mood             and an antidepressant this information is just as or even more valuable than the discovery that there is a relationship.              <br>             <br>                         We can also take advantage of several characteristics of time series data from many subjects  to infer the likelihood of a causal relationship if we do find a correlational relationship.              The criteria for causation are a group of minimal conditions necessary to provide adequate evidence of a causal relationship between an incidence and a possible consequence.             The list of the criteria is as follows:             <br>             1. Strength (effect size): A small association does not mean that there is not a causal effect, though the larger the association, the more likely that it is causal.             <br>             2. Consistency (reproducibility): Consistent findings observed by different persons in different places with different samples strengthens the likelihood of an effect.             <br>             3. Specificity: Causation is likely if a very specific population at a specific site and disease with no other likely explanation. The more specific an association between a factor and an effect is, the bigger the probability of a causal relationship.             <br>             4. Temporality: The effect has to occur after the cause (and if there is an expected delay between the cause and expected effect, then the effect must occur after that delay).             <br>             5. Biological gradient: Greater exposure should generally lead to greater incidence of the effect. However, in some cases, the mere presence of the factor can trigger the effect. In other cases, an inverse proportion is observed: greater exposure leads to lower incidence.             <br>             6. Plausibility: A plausible mechanism between cause and effect is helpful.             <br>             7. Coherence: Coherence between epidemiological and laboratory findings increases the likelihood of an effect.             <br>             8. Experiment: \"Occasionally it is possible to appeal to experimental evidence\".             <br>             9. Analogy: The effect of similar factors may be considered.             <br>             <br>                            The confidence in a causal relationship is bolstered by the fact that time-precedence was taken into account in all calculations. Furthermore, in accordance with the law of large numbers (LLN), the predictive power and accuracy of these results will continually grow over time.  297 paired data points were used in this analysis.   Assuming that the relationship is merely coincidental, as the participant independently modifies their Barometric Pressure values, the observed strength of the relationship will decline until it is below the threshold of significance.  To it another way, in the case that we do find a spurious correlation, suggesting that banana intake improves mood for instance,             one will likely increase their banana intake.  Due to the fact that this correlation is spurious, it is unlikely             that you will see a continued and persistent corresponding increase in mood.  So over time, the spurious correlation will             naturally dissipate.Furthermore, it will be very enlightening to aggregate this data with the data from other participants  with similar genetic, diseasomic, environmentomic, and demographic profiles.
   * @member {String} studyLimitations
   */
  exports.prototype['studyLimitations'] = undefined;
  /**
   * Example: true
   * @member {Boolean} significantDifference
   */
  exports.prototype['significantDifference'] = undefined;
  /**
   * Example: Using a two-tailed t-test with alpha = 0.05, it was determined that the change in Reference And Learning Hours is statistically significant at 95% confidence interval. 
   * @member {String} significanceExplanation
   */
  exports.prototype['significanceExplanation'] = undefined;
  /**
   * Example: very weak
   * @member {String} strengthLevel
   */
  exports.prototype['strengthLevel'] = undefined;
  /**
   * Example: high
   * @member {String} confidenceLevel
   */
  exports.prototype['confidenceLevel'] = undefined;
  /**
   * Example: The objective of this study is to determine the nature of the relationship (if any) between the Barometric Pressure and the Reference And Learning Hours. Additionally, we attempt to determine the Barometric Pressure values most likely to produce optimal Reference And Learning Hours values. 
   * @member {String} studyObjective
   */
  exports.prototype['studyObjective'] = undefined;
  /**
   * Example: N1 Study: Barometric Pressure Predicts Higher Reference And Learning Hours
   * @member {String} studyTitle
   */
  exports.prototype['studyTitle'] = undefined;
  /**
   * Example: Barometric Pressure data was primarily collected using <a href=\"https://quantimo.do\">QuantiModo</a>.  <a href=\"https://quantimo.do\">QuantiModo</a> is a Chrome extension, Android app, iOS app, and web app that allows you to easily track mood, symptoms, or any outcome you want to optimize in a fraction of a second.  You can also import your data from over 30 other apps and devices like Fitbit, Rescuetime, Jawbone Up, Withings, Facebook, Github, Google Calendar, Runkeeper, MoodPanda, Slice, Google Fit, and more.  <a href=\"https://quantimo.do\">QuantiModo</a> then analyzes your data to identify which hidden factors are most likely to be influencing your mood or symptoms and their optimal daily values.<br>Reference And Learning Hours data was primarily collected using <a href=\"https://www.rescuetime.com/rp/quantimodo/plans\">RescueTime</a>.  Detailed reports show which applications and websites you spent time on. Activities are automatically grouped into pre-defined categories with built-in productivity scores covering thousands of websites and applications. You can customize categories and productivity scores to meet your needs.
   * @member {String} dataSources
   */
  exports.prototype['dataSources'] = undefined;
  /**
   * Example: Your data suggests with a high degree of confidence (p=0) that Barometric Pressure (Environment) has a weakly positive predictive relationship (R=0.147) with Reference And Learning Hours  (Activity).  The highest quartile of Reference And Learning Hours  measurements were observed following an average 101187.2Pa Barometric Pressure.  The lowest quartile of Reference And Learning Hours  measurements were observed following an average 97597.75Pa Barometric Pressure.
   * @member {String} studyAbstract
   */
  exports.prototype['studyAbstract'] = undefined;
  /**
   * Example: higher
   * @member {String} direction
   */
  exports.prototype['direction'] = undefined;
  /**
   * Example: 
   * @member {String} predictivePearsonCorrelation
   */
  exports.prototype['predictivePearsonCorrelation'] = undefined;
  /**
   * Example: Barometric Pressure Predicts Higher Reference And Learning Hours
   * @member {String} predictorExplanation
   */
  exports.prototype['predictorExplanation'] = undefined;
  /**
   * Example: 
   * @member {String} studyBackground
   */
  exports.prototype['studyBackground'] = undefined;
  /**
   * Example: This study is based on data donated by one QuantiModo user. Thus, the study design is consistent with an n=1 observational natural experiment. 
   * @member {String} studyDesign
   */
  exports.prototype['studyDesign'] = undefined;
  /**
   * Example: 
   * @member {String} dataPoints
   */
  exports.prototype['dataPoints'] = undefined;
  /**
   * Example: 425
   * @member {Number} numberOfDays
   */
  exports.prototype['numberOfDays'] = undefined;
  /**
   * Example: 
   * @member {String} reversePairsCount
   */
  exports.prototype['reversePairsCount'] = undefined;
  /**
   * Example: 0.9999299755903
   * @member {Number} causeChangesStatisticalSignificance
   */
  exports.prototype['causeChangesStatisticalSignificance'] = undefined;
  /**
   * Example: 17
   * @member {Number} causeVariableCategoryId
   */
  exports.prototype['causeVariableCategoryId'] = undefined;
  /**
   * Example: 14
   * @member {Number} effectVariableCategoryId
   */
  exports.prototype['effectVariableCategoryId'] = undefined;
  /**
   * Example: 
   * @member {String} predictorFillingValue
   */
  exports.prototype['predictorFillingValue'] = undefined;
  /**
   * Example: 
   * @member {String} outcomeFillingValue
   */
  exports.prototype['outcomeFillingValue'] = undefined;
  /**
   * Example: 14764
   * @member {Number} causeNumberOfRawMeasurements
   */
  exports.prototype['causeNumberOfRawMeasurements'] = undefined;
  /**
   * Example: 4045
   * @member {Number} effectNumberOfRawMeasurements
   */
  exports.prototype['effectNumberOfRawMeasurements'] = undefined;
  /**
   * Example: 1364
   * @member {Number} causeNumberOfProcessedDailyMeasurements
   */
  exports.prototype['causeNumberOfProcessedDailyMeasurements'] = undefined;
  /**
   * Example: 145
   * @member {Number} effectNumberOfProcessedDailyMeasurements
   */
  exports.prototype['effectNumberOfProcessedDailyMeasurements'] = undefined;
  /**
   * Example: 13
   * @member {Number} causeVariableMostCommonConnectorId
   */
  exports.prototype['causeVariableMostCommonConnectorId'] = undefined;
  /**
   * Example: 11
   * @member {Number} effectVariableMostCommonConnectorId
   */
  exports.prototype['effectVariableMostCommonConnectorId'] = undefined;
  /**
   * Example: https://www.facebook.com/sharer/sharer.php?u=https%3A%2F%2Flocal.quantimo.do%2Fapi%2Fv2%2Fstudy%3FcauseVariableName%3DBarometric%2520Pressure%26effectVariableName%3DReference%2520And%2520Learning%2520Hours%26userId%3D230
   * @member {String} studyLinkFacebook
   */
  exports.prototype['studyLinkFacebook'] = undefined;
  /**
   * Example: https://twitter.com/home?status=Barometric%20Pressure%20Predicts%20Higher%20Reference%20And%20Learning%20Hours%20https%3A%2F%2Flocal.quantimo.do%2Fapi%2Fv2%2Fstudy%3FcauseVariableName%3DBarometric%2520Pressure%26effectVariableName%3DReference%2520And%2520Learning%2520Hours%26userId%3D230%20%40quantimodo
   * @member {String} studyLinkTwitter
   */
  exports.prototype['studyLinkTwitter'] = undefined;
  /**
   * Example: https://plus.google.com/share?url=https%3A%2F%2Flocal.quantimo.do%2Fapi%2Fv2%2Fstudy%3FcauseVariableName%3DBarometric%2520Pressure%26effectVariableName%3DReference%2520And%2520Learning%2520Hours%26userId%3D230
   * @member {String} studyLinkGoogle
   */
  exports.prototype['studyLinkGoogle'] = undefined;
  /**
   * Example: Barometric Pressure
   * @member {String} causeVariableName
   */
  exports.prototype['causeVariableName'] = undefined;
  /**
   * Example: Reference And Learning Hours
   * @member {String} effectVariableName
   */
  exports.prototype['effectVariableName'] = undefined;
  /**
   * Example: 8.4268686868687
   * @member {Number} averageEffect
   */
  exports.prototype['averageEffect'] = undefined;
  /**
   * Example: 57
   * @member {Number} numberOfLowEffectPairs
   */
  exports.prototype['numberOfLowEffectPairs'] = undefined;
  /**
   * Example: 27
   * @member {Number} numberOfHighEffectPairs
   */
  exports.prototype['numberOfHighEffectPairs'] = undefined;
  /**
   * Example: 200
   * @member {Number} degreesOfFreedom
   */
  exports.prototype['degreesOfFreedom'] = undefined;
  /**
   * Example: 201
   * @member {Number} numberOfUniqueCauseValuesForOptimalValues
   */
  exports.prototype['numberOfUniqueCauseValuesForOptimalValues'] = undefined;
  /**
   * Example: 264
   * @member {Number} numberOfUniqueEffectValuesForOptimalValues
   */
  exports.prototype['numberOfUniqueEffectValuesForOptimalValues'] = undefined;
  /**
   * Example: 287
   * @member {Number} numberOfCauseChangesForOptimalValues
   */
  exports.prototype['numberOfCauseChangesForOptimalValues'] = undefined;
  /**
   * Example: 
   * @member {String} medianOfUpperHalfOfEffectMeasurements
   */
  exports.prototype['medianOfUpperHalfOfEffectMeasurements'] = undefined;
  /**
   * Example: 
   * @member {String} medianOfLowerHalfOfEffectMeasurements
   */
  exports.prototype['medianOfLowerHalfOfEffectMeasurements'] = undefined;
  /**
   * Example: 295
   * @member {Number} numberOfEffectChangesForOptimalValues
   */
  exports.prototype['numberOfEffectChangesForOptimalValues'] = undefined;
  /**
   * Example: 0.18
   * @member {Number} minimumEffectValue
   */
  exports.prototype['minimumEffectValue'] = undefined;
  /**
   * Example: 20.38
   * @member {Number} maximumEffectValue
   */
  exports.prototype['maximumEffectValue'] = undefined;
  /**
   * Example: 20.2
   * @member {Number} effectValueSpread
   */
  exports.prototype['effectValueSpread'] = undefined;
  /**
   * Example: 5267.5521276596
   * @member {Number} minimumCauseValue
   */
  exports.prototype['minimumCauseValue'] = undefined;
  /**
   * Example: 104300
   * @member {Number} maximumCauseValue
   */
  exports.prototype['maximumCauseValue'] = undefined;
  /**
   * Example: 99032.44787234
   * @member {Number} causeValueSpread
   */
  exports.prototype['causeValueSpread'] = undefined;
  /**
   * Example: 8.5
   * @member {Number} averageEffectFollowingHighCause
   */
  exports.prototype['averageEffectFollowingHighCause'] = undefined;
  /**
   * Example: 1.47
   * @member {Number} averageEffectFollowingLowCause
   */
  exports.prototype['averageEffectFollowingLowCause'] = undefined;
  /**
   * Example: 21023.36
   * @member {Number} averageDailyLowCause
   */
  exports.prototype['averageDailyLowCause'] = undefined;
  /**
   * Example: 101627.85
   * @member {Number} averageDailyHighCause
   */
  exports.prototype['averageDailyHighCause'] = undefined;
  /**
   * Example: 
   * @member {String} principalInvestigator
   */
  exports.prototype['principalInvestigator'] = undefined;
  /**
   * Example: 
   * @member {String} causeVariableCombinationOperation
   */
  exports.prototype['causeVariableCombinationOperation'] = undefined;
  /**
   * Example: Reference And Learning Hours, on average, 0.84% higher after around 101187.2 Pa Barometric Pressure 
   * @member {String} valuePredictingHighOutcomeExplanation
   */
  exports.prototype['valuePredictingHighOutcomeExplanation'] = undefined;
  /**
   * Example: Reference And Learning Hours is 8.5h (1% higher) on average after days with around 101627.85 Pa Barometric Pressure
   * @member {String} averageEffectFollowingHighCauseExplanation
   */
  exports.prototype['averageEffectFollowingHighCauseExplanation'] = undefined;
  /**
   * Example: Reference And Learning Hours is 1.47h (83% lower) on average after days with around 21023.36 Pa Barometric Pressure
   * @member {String} averageEffectFollowingLowCauseExplanation
   */
  exports.prototype['averageEffectFollowingLowCauseExplanation'] = undefined;
  /**
   * Example: Reference And Learning Hours, on average, 82.6% lower after around 97597.75 Pa Barometric Pressure 
   * @member {String} valuePredictingLowOutcomeExplanation
   */
  exports.prototype['valuePredictingLowOutcomeExplanation'] = undefined;
  /**
   * Example: 
   * @member {String} numberOfUsers
   */
  exports.prototype['numberOfUsers'] = undefined;
  /**
   * Example: 
   * @member {String} outcomeDataSources
   */
  exports.prototype['outcomeDataSources'] = undefined;
  /**
   * Example: false
   * @member {Boolean} correlationIsContradictoryToOptimalValues
   */
  exports.prototype['correlationIsContradictoryToOptimalValues'] = undefined;
  /**
   * Example: -0.26193208156295
   * @member {Number} forwardSpearmanCorrelationCoefficient
   */
  exports.prototype['forwardSpearmanCorrelationCoefficient'] = undefined;
  /**
   * Example: 0.05
   * @member {Number} minimumProbability
   */
  exports.prototype['minimumProbability'] = undefined;
  /**
   * Example: 
   * @member {String} strongestPearsonCorrelationCoefficient
   */
  exports.prototype['strongestPearsonCorrelationCoefficient'] = undefined;
  /**
   * Example: 
   * @member {Date} pairsOverTimeChartConfig
   */
  exports.prototype['pairsOverTimeChartConfig'] = undefined;
  /**
   * Example: 
   * @member {String} correlationsOverOnsetDelaysChartConfig
   */
  exports.prototype['correlationsOverOnsetDelaysChartConfig'] = undefined;
  /**
   * Example: 
   * @member {String} correlationsOverDurationsOfActionChartConfig
   */
  exports.prototype['correlationsOverDurationsOfActionChartConfig'] = undefined;
  /**
   * Example: 
   * @member {String} onsetDelayWithStrongestPearsonCorrelation
   */
  exports.prototype['onsetDelayWithStrongestPearsonCorrelation'] = undefined;
  /**
   * Example: 
   * @member {String} averageForwardPearsonCorrelationOverOnsetDelays
   */
  exports.prototype['averageForwardPearsonCorrelationOverOnsetDelays'] = undefined;
  /**
   * Example: 
   * @member {String} averageReversePearsonCorrelationOverOnsetDelays
   */
  exports.prototype['averageReversePearsonCorrelationOverOnsetDelays'] = undefined;
  /**
   * Example: 
   * @member {String} pearsonCorrelationWithNoOnsetDelay
   */
  exports.prototype['pearsonCorrelationWithNoOnsetDelay'] = undefined;
  /**
   * Example: 1
   * @member {Number} voteStatisticalSignificance
   */
  exports.prototype['voteStatisticalSignificance'] = undefined;
  /**
   * Example: 
   * @member {Date} calculationStartTime
   */
  exports.prototype['calculationStartTime'] = undefined;
  /**
   * Example: false
   * @member {Boolean} shareUserMeasurements
   */
  exports.prototype['shareUserMeasurements'] = undefined;
  /**
   * Example: 
   * @member {String} causeUserVariableShareUserMeasurements
   */
  exports.prototype['causeUserVariableShareUserMeasurements'] = undefined;
  /**
   * Example: 
   * @member {String} effectUserVariableShareUserMeasurements
   */
  exports.prototype['effectUserVariableShareUserMeasurements'] = undefined;
  /**
   * Example: 
   * @member {String} averagePearsonCorrelationCoefficientOverOnsetDelays
   */
  exports.prototype['averagePearsonCorrelationCoefficientOverOnsetDelays'] = undefined;
  /**
   * Example: 
   * @member {String} onsetDelayWithStrongestPearsonCorrelationInHours
   */
  exports.prototype['onsetDelayWithStrongestPearsonCorrelationInHours'] = undefined;
  /**
   * Example: 96380
   * @member {Number} causeVariableId
   */
  exports.prototype['causeVariableId'] = undefined;
  /**
   * Example: 111642
   * @member {Number} effectVariableId
   */
  exports.prototype['effectVariableId'] = undefined;
  /**
   * Example: https://local.quantimo.do/api/v2/study?causeVariableName=Barometric%20Pressure&effectVariableName=Reference%20And%20Learning%20Hours&userId=230
   * @member {String} studyLinkStatic
   */
  exports.prototype['studyLinkStatic'] = undefined;
  /**
   * Example: https://local.quantimo.do/ionic/Modo/www/index.html#/app/study?causeVariableName=Barometric%20Pressure&effectVariableName=Reference%20And%20Learning%20Hours&userId=230
   * @member {String} studyLinkDynamic
   */
  exports.prototype['studyLinkDynamic'] = undefined;
  /**
   * Example: https://s3.amazonaws.com/quantimodo-docs/images/gauge-weakly-positive-relationship.png
   * @member {String} gaugeImage
   */
  exports.prototype['gaugeImage'] = undefined;
  /**
   * Example: https://s3-us-west-1.amazonaws.com/qmimages/variable_categories_gauges_logo_background/gauge-weakly-positive-relationship_environment_activity_logo_background.png
   * @member {String} imageUrl
   */
  exports.prototype['imageUrl'] = undefined;
  /**
   * Example: https://s3.amazonaws.com/quantimodo-docs/images/gauge-weakly-positive-relationship-200-200.png
   * @member {String} gaugeImageSquare
   */
  exports.prototype['gaugeImageSquare'] = undefined;
  /**
   * Example: 0
   * @member {Number} onsetDelayInHours
   */
  exports.prototype['onsetDelayInHours'] = undefined;
  /**
   * Example: 0
   * @member {Number} durationOfActionInHours
   */
  exports.prototype['durationOfActionInHours'] = undefined;
  /**
   * Example: 34
   * @member {Number} effectVariableDefaultUnitId
   */
  exports.prototype['effectVariableDefaultUnitId'] = undefined;
  /**
   * Example: 
   * @member {String} causeVariableDefaultUnitName
   */
  exports.prototype['causeVariableDefaultUnitName'] = undefined;
  /**
   * Example: Pa
   * @member {String} causeVariableDefaultUnitAbbreviatedName
   */
  exports.prototype['causeVariableDefaultUnitAbbreviatedName'] = undefined;
  /**
   * Example: 
   * @member {String} effectVariableDefaultUnitName
   */
  exports.prototype['effectVariableDefaultUnitName'] = undefined;
  /**
   * Example: h
   * @member {String} effectVariableDefaultUnitAbbreviatedName
   */
  exports.prototype['effectVariableDefaultUnitAbbreviatedName'] = undefined;
  /**
   * Example: 1
   * @member {Number} rawCauseMeasurementSignificance
   */
  exports.prototype['rawCauseMeasurementSignificance'] = undefined;
  /**
   * Example: 0.99994982531794
   * @member {Number} allPairsSignificance
   */
  exports.prototype['allPairsSignificance'] = undefined;
  /**
   * Example: 0.99999929612614
   * @member {Number} numberOfDaysSignificance
   */
  exports.prototype['numberOfDaysSignificance'] = undefined;
  /**
   * Example: 1
   * @member {Number} rawEffectMeasurementSignificance
   */
  exports.prototype['rawEffectMeasurementSignificance'] = undefined;
  /**
   * Example: 83.44
   * @member {Number} optimalChangeSpread
   */
  exports.prototype['optimalChangeSpread'] = undefined;
  /**
   * Example: 0.99999999999917
   * @member {Number} optimalChangeSpreadSignificance
   */
  exports.prototype['optimalChangeSpreadSignificance'] = undefined;
  /**
   * Example: 
   * @member {String} correlationsOverDurationsOfAction
   */
  exports.prototype['correlationsOverDurationsOfAction'] = undefined;
  /**
   * Example: Reference And Learning Hours data was primarily collected using <a href=\"https://www.rescuetime.com/rp/quantimodo/plans\">RescueTime</a>.  Detailed reports show which applications and websites you spent time on. Activities are automatically grouped into pre-defined categories with built-in productivity scores covering thousands of websites and applications. You can customize categories and productivity scores to meet your needs.
   * @member {String} dataSourcesParagraphForEffect
   */
  exports.prototype['dataSourcesParagraphForEffect'] = undefined;
  /**
   * Example: Barometric Pressure data was primarily collected using <a href=\"https://quantimo.do\">QuantiModo</a>.  <a href=\"https://quantimo.do\">QuantiModo</a> is a Chrome extension, Android app, iOS app, and web app that allows you to easily track mood, symptoms, or any outcome you want to optimize in a fraction of a second.  You can also import your data from over 30 other apps and devices like Fitbit, Rescuetime, Jawbone Up, Withings, Facebook, Github, Google Calendar, Runkeeper, MoodPanda, Slice, Google Fit, and more.  <a href=\"https://quantimo.do\">QuantiModo</a> then analyzes your data to identify which hidden factors are most likely to be influencing your mood or symptoms and their optimal daily values.
   * @member {String} dataSourcesParagraphForCause
   */
  exports.prototype['dataSourcesParagraphForCause'] = undefined;
  /**
   * Example: <a href=\"https://www.rescuetime.com/rp/quantimodo/plans\">Obtain RescueTime</a> and use it to record your Reference And Learning Hours. Once you have a <a href=\"https://www.rescuetime.com/rp/quantimodo/plans\">RescueTime</a> account, <a href=\"https://app.quantimo.do/ionic/Modo/www/#/app/import\">connect your  RescueTime account at QuantiModo</a> to automatically import and analyze your data.
   * @member {String} instructionsForEffect
   */
  exports.prototype['instructionsForEffect'] = undefined;
  /**
   * Example: <a href=\"https://quantimo.do\">Obtain QuantiModo</a> and use it to record your Barometric Pressure. Once you have a <a href=\"https://quantimo.do\">QuantiModo</a> account, <a href=\"https://app.quantimo.do/ionic/Modo/www/#/app/import\">connect your  QuantiModo account at QuantiModo</a> to automatically import and analyze your data.
   * @member {String} instructionsForCause
   */
  exports.prototype['instructionsForCause'] = undefined;
  /**
   * Example: 
   * @member {String} perDaySentenceFragment
   */
  exports.prototype['perDaySentenceFragment'] = undefined;
  /**
   * Example: , on average, 82.6% 
   * @member {String} predictsLowEffectChangeSentenceFragment
   */
  exports.prototype['predictsLowEffectChangeSentenceFragment'] = undefined;
  /**
   * Example: , on average, 0.84% 
   * @member {String} predictsHighEffectChangeSentenceFragment
   */
  exports.prototype['predictsHighEffectChangeSentenceFragment'] = undefined;
  /**
   * Example: mailto:?subject=N1%20Study%3A%20Barometric%20Pressure%20Predicts%20Higher%20Reference%20And%20Learning%20Hours&body=Check%20out%20my%20study%20at%20https%3A%2F%2Flocal.quantimo.do%2Fapi%2Fv2%2Fstudy%3FcauseVariableName%3DBarometric%2520Pressure%26effectVariableName%3DReference%2520And%2520Learning%2520Hours%26userId%3D230%0A%0AHave%20a%20great%20day!
   * @member {String} studyLinkEmail
   */
  exports.prototype['studyLinkEmail'] = undefined;
  /**
   * Example: 25
   * @member {Number} distanceFromMiddleToBeHightLowEffect
   */
  exports.prototype['distanceFromMiddleToBeHightLowEffect'] = undefined;
  /**
   * Example: 297
   * @member {Number} numberOfSamples
   */
  exports.prototype['numberOfSamples'] = undefined;
  /**
   * Example: h
   * @member {String} effectUnit
   */
  exports.prototype['effectUnit'] = undefined;
  /**
   * Example: https://maxcdn.icons8.com/Color/PNG/96/Weather/chance_of_storm-96.png
   * @member {String} causeVariableImageUrl
   */
  exports.prototype['causeVariableImageUrl'] = undefined;
  /**
   * Example: ion-ios-partlysunny
   * @member {String} causeVariableIonIcon
   */
  exports.prototype['causeVariableIonIcon'] = undefined;
  /**
   * Example: https://maxcdn.icons8.com/Color/PNG/96/Sports/football-96.png
   * @member {String} effectVariableImageUrl
   */
  exports.prototype['effectVariableImageUrl'] = undefined;
  /**
   * Example: ion-ios-body-outline
   * @member {String} effectVariableIonIcon
   */
  exports.prototype['effectVariableIonIcon'] = undefined;



  return exports;
}));



},{"../ApiClient":16}],72:[function(require,module,exports){
/**
 * quantimodo
 * QuantiModo makes it easy to retrieve normalized user data from a wide array of devices and applications. [Learn about QuantiModo](https://quantimo.do), check out our [docs](https://github.com/QuantiModo/docs) or contact us at [help.quantimo.do](https://help.quantimo.do).
 *
 * OpenAPI spec version: 5.8.728
 *
 * NOTE: This class is auto generated by the swagger code generator program.
 * https://github.com/swagger-api/swagger-codegen.git
 *
 * Swagger Codegen version: 2.2.3
 *
 * Do not edit the class manually.
 *
 */

(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define(['ApiClient', 'model/Chart', 'model/Pair', 'model/ProcessedDailyMeasurement', 'model/Statistic', 'model/Variable'], factory);
  } else if (typeof module === 'object' && module.exports) {
    // CommonJS-like environments that support module.exports, like Node.
    module.exports = factory(require('../ApiClient'), require('./Chart'), require('./Pair'), require('./ProcessedDailyMeasurement'), require('./Statistic'), require('./Variable'));
  } else {
    // Browser globals (root is window)
    if (!root.Quantimodo) {
      root.Quantimodo = {};
    }
    root.Quantimodo.Study = factory(root.Quantimodo.ApiClient, root.Quantimodo.Chart, root.Quantimodo.Pair, root.Quantimodo.ProcessedDailyMeasurement, root.Quantimodo.Statistic, root.Quantimodo.Variable);
  }
}(this, function(ApiClient, Chart, Pair, ProcessedDailyMeasurement, Statistic, Variable) {
  'use strict';




  /**
   * The Study model module.
   * @module model/Study
   * @version 5.8.807
   */

  /**
   * Constructs a new <code>Study</code>.
   * @alias module:model/Study
   * @class
   * @param causeProcessedDailyMeasurements {Array.<module:model/ProcessedDailyMeasurement>} 
   * @param causeVariable {module:model/Variable} 
   * @param effectVariable {module:model/Variable} 
   * @param charts {Array.<module:model/Chart>} 
   * @param effectProcessedDailyMeasurements {Array.<module:model/ProcessedDailyMeasurement>} 
   * @param pairs {Array.<module:model/Pair>} 
   * @param statistics {module:model/Statistic} 
   * @param text {String} Example: 
   * @param user {String} Example: 
   */
  var exports = function(causeProcessedDailyMeasurements, causeVariable, effectVariable, charts, effectProcessedDailyMeasurements, pairs, statistics, text, user) {
    var _this = this;


    _this['causeProcessedDailyMeasurements'] = causeProcessedDailyMeasurements;
    _this['causeVariable'] = causeVariable;
    _this['effectVariable'] = effectVariable;
    _this['charts'] = charts;
    _this['effectProcessedDailyMeasurements'] = effectProcessedDailyMeasurements;
    _this['pairs'] = pairs;
    _this['statistics'] = statistics;
    _this['text'] = text;
    _this['user'] = user;
  };

  /**
   * Constructs a <code>Study</code> from a plain JavaScript object, optionally creating a new instance.
   * Copies all relevant properties from <code>data</code> to <code>obj</code> if supplied or a new instance if not.
   * @param {Object} data The plain JavaScript object bearing properties of interest.
   * @param {module:model/Study} obj Optional instance to populate.
   * @return {module:model/Study} The populated <code>Study</code> instance.
   */
  exports.constructFromObject = function(data, obj) {
    if (data) {
      obj = obj || new exports();

      if (data.hasOwnProperty('userId')) {
        obj['userId'] = ApiClient.convertToType(data['userId'], 'Number');
      }
      if (data.hasOwnProperty('causeProcessedDailyMeasurements')) {
        obj['causeProcessedDailyMeasurements'] = ApiClient.convertToType(data['causeProcessedDailyMeasurements'], [ProcessedDailyMeasurement]);
      }
      if (data.hasOwnProperty('causeVariable')) {
        obj['causeVariable'] = Variable.constructFromObject(data['causeVariable']);
      }
      if (data.hasOwnProperty('effectVariable')) {
        obj['effectVariable'] = Variable.constructFromObject(data['effectVariable']);
      }
      if (data.hasOwnProperty('charts')) {
        obj['charts'] = ApiClient.convertToType(data['charts'], [Chart]);
      }
      if (data.hasOwnProperty('effectProcessedDailyMeasurements')) {
        obj['effectProcessedDailyMeasurements'] = ApiClient.convertToType(data['effectProcessedDailyMeasurements'], [ProcessedDailyMeasurement]);
      }
      if (data.hasOwnProperty('pairs')) {
        obj['pairs'] = ApiClient.convertToType(data['pairs'], [Pair]);
      }
      if (data.hasOwnProperty('statistics')) {
        obj['statistics'] = Statistic.constructFromObject(data['statistics']);
      }
      if (data.hasOwnProperty('text')) {
        obj['text'] = ApiClient.convertToType(data['text'], 'String');
      }
      if (data.hasOwnProperty('user')) {
        obj['user'] = ApiClient.convertToType(data['user'], 'String');
      }
    }
    return obj;
  }

  /**
   * Example: 230
   * @member {Number} userId
   */
  exports.prototype['userId'] = undefined;
  /**
   * @member {Array.<module:model/ProcessedDailyMeasurement>} causeProcessedDailyMeasurements
   */
  exports.prototype['causeProcessedDailyMeasurements'] = undefined;
  /**
   * @member {module:model/Variable} causeVariable
   */
  exports.prototype['causeVariable'] = undefined;
  /**
   * @member {module:model/Variable} effectVariable
   */
  exports.prototype['effectVariable'] = undefined;
  /**
   * @member {Array.<module:model/Chart>} charts
   */
  exports.prototype['charts'] = undefined;
  /**
   * @member {Array.<module:model/ProcessedDailyMeasurement>} effectProcessedDailyMeasurements
   */
  exports.prototype['effectProcessedDailyMeasurements'] = undefined;
  /**
   * @member {Array.<module:model/Pair>} pairs
   */
  exports.prototype['pairs'] = undefined;
  /**
   * @member {module:model/Statistic} statistics
   */
  exports.prototype['statistics'] = undefined;
  /**
   * Example: 
   * @member {String} text
   */
  exports.prototype['text'] = undefined;
  /**
   * Example: 
   * @member {String} user
   */
  exports.prototype['user'] = undefined;



  return exports;
}));



},{"../ApiClient":16,"./Chart":30,"./Pair":63,"./ProcessedDailyMeasurement":67,"./Statistic":71,"./Variable":90}],73:[function(require,module,exports){
/**
 * quantimodo
 * QuantiModo makes it easy to retrieve normalized user data from a wide array of devices and applications. [Learn about QuantiModo](https://quantimo.do), check out our [docs](https://github.com/QuantiModo/docs) or contact us at [help.quantimo.do](https://help.quantimo.do).
 *
 * OpenAPI spec version: 5.8.728
 *
 * NOTE: This class is auto generated by the swagger code generator program.
 * https://github.com/swagger-api/swagger-codegen.git
 *
 * Swagger Codegen version: 2.2.3
 *
 * Do not edit the class manually.
 *
 */

(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define(['ApiClient'], factory);
  } else if (typeof module === 'object' && module.exports) {
    // CommonJS-like environments that support module.exports, like Node.
    module.exports = factory(require('../ApiClient'));
  } else {
    // Browser globals (root is window)
    if (!root.Quantimodo) {
      root.Quantimodo = {};
    }
    root.Quantimodo.Subtitle = factory(root.Quantimodo.ApiClient);
  }
}(this, function(ApiClient) {
  'use strict';




  /**
   * The Subtitle model module.
   * @module model/Subtitle
   * @version 5.8.807
   */

  /**
   * Constructs a new <code>Subtitle</code>.
   * @alias module:model/Subtitle
   * @class
   * @param text {String} Example: 
   */
  var exports = function(text) {
    var _this = this;

    _this['text'] = text;
  };

  /**
   * Constructs a <code>Subtitle</code> from a plain JavaScript object, optionally creating a new instance.
   * Copies all relevant properties from <code>data</code> to <code>obj</code> if supplied or a new instance if not.
   * @param {Object} data The plain JavaScript object bearing properties of interest.
   * @param {module:model/Subtitle} obj Optional instance to populate.
   * @return {module:model/Subtitle} The populated <code>Subtitle</code> instance.
   */
  exports.constructFromObject = function(data, obj) {
    if (data) {
      obj = obj || new exports();

      if (data.hasOwnProperty('text')) {
        obj['text'] = ApiClient.convertToType(data['text'], 'String');
      }
    }
    return obj;
  }

  /**
   * Example: 
   * @member {String} text
   */
  exports.prototype['text'] = undefined;



  return exports;
}));



},{"../ApiClient":16}],74:[function(require,module,exports){
/**
 * quantimodo
 * QuantiModo makes it easy to retrieve normalized user data from a wide array of devices and applications. [Learn about QuantiModo](https://quantimo.do), check out our [docs](https://github.com/QuantiModo/docs) or contact us at [help.quantimo.do](https://help.quantimo.do).
 *
 * OpenAPI spec version: 5.8.728
 *
 * NOTE: This class is auto generated by the swagger code generator program.
 * https://github.com/swagger-api/swagger-codegen.git
 *
 * Swagger Codegen version: 2.2.3
 *
 * Do not edit the class manually.
 *
 */

(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define(['ApiClient'], factory);
  } else if (typeof module === 'object' && module.exports) {
    // CommonJS-like environments that support module.exports, like Node.
    module.exports = factory(require('../ApiClient'));
  } else {
    // Browser globals (root is window)
    if (!root.Quantimodo) {
      root.Quantimodo = {};
    }
    root.Quantimodo.Title = factory(root.Quantimodo.ApiClient);
  }
}(this, function(ApiClient) {
  'use strict';




  /**
   * The Title model module.
   * @module model/Title
   * @version 5.8.807
   */

  /**
   * Constructs a new <code>Title</code>.
   * @alias module:model/Title
   * @class
   * @param enabled {Boolean} Example: true
   * @param text {String} Example: Barometric Pressure (Pa)
   */
  var exports = function(enabled, text) {
    var _this = this;

    _this['enabled'] = enabled;
    _this['text'] = text;
  };

  /**
   * Constructs a <code>Title</code> from a plain JavaScript object, optionally creating a new instance.
   * Copies all relevant properties from <code>data</code> to <code>obj</code> if supplied or a new instance if not.
   * @param {Object} data The plain JavaScript object bearing properties of interest.
   * @param {module:model/Title} obj Optional instance to populate.
   * @return {module:model/Title} The populated <code>Title</code> instance.
   */
  exports.constructFromObject = function(data, obj) {
    if (data) {
      obj = obj || new exports();

      if (data.hasOwnProperty('enabled')) {
        obj['enabled'] = ApiClient.convertToType(data['enabled'], 'Boolean');
      }
      if (data.hasOwnProperty('text')) {
        obj['text'] = ApiClient.convertToType(data['text'], 'String');
      }
    }
    return obj;
  }

  /**
   * Example: true
   * @member {Boolean} enabled
   */
  exports.prototype['enabled'] = undefined;
  /**
   * Example: Barometric Pressure (Pa)
   * @member {String} text
   */
  exports.prototype['text'] = undefined;



  return exports;
}));



},{"../ApiClient":16}],75:[function(require,module,exports){
/**
 * quantimodo
 * QuantiModo makes it easy to retrieve normalized user data from a wide array of devices and applications. [Learn about QuantiModo](https://quantimo.do), check out our [docs](https://github.com/QuantiModo/docs) or contact us at [help.quantimo.do](https://help.quantimo.do).
 *
 * OpenAPI spec version: 5.8.728
 *
 * NOTE: This class is auto generated by the swagger code generator program.
 * https://github.com/swagger-api/swagger-codegen.git
 *
 * Swagger Codegen version: 2.2.3
 *
 * Do not edit the class manually.
 *
 */

(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define(['ApiClient'], factory);
  } else if (typeof module === 'object' && module.exports) {
    // CommonJS-like environments that support module.exports, like Node.
    module.exports = factory(require('../ApiClient'));
  } else {
    // Browser globals (root is window)
    if (!root.Quantimodo) {
      root.Quantimodo = {};
    }
    root.Quantimodo.Tooltip = factory(root.Quantimodo.ApiClient);
  }
}(this, function(ApiClient) {
  'use strict';




  /**
   * The Tooltip model module.
   * @module model/Tooltip
   * @version 5.8.807
   */

  /**
   * Constructs a new <code>Tooltip</code>.
   * @alias module:model/Tooltip
   * @class
   * @param pointFormat {String} Example: {point.x}Pa, {point.y}h
   * @param valueSuffix {String} Example: Pa
   */
  var exports = function(pointFormat, valueSuffix) {
    var _this = this;

    _this['pointFormat'] = pointFormat;
    _this['valueSuffix'] = valueSuffix;
  };

  /**
   * Constructs a <code>Tooltip</code> from a plain JavaScript object, optionally creating a new instance.
   * Copies all relevant properties from <code>data</code> to <code>obj</code> if supplied or a new instance if not.
   * @param {Object} data The plain JavaScript object bearing properties of interest.
   * @param {module:model/Tooltip} obj Optional instance to populate.
   * @return {module:model/Tooltip} The populated <code>Tooltip</code> instance.
   */
  exports.constructFromObject = function(data, obj) {
    if (data) {
      obj = obj || new exports();

      if (data.hasOwnProperty('pointFormat')) {
        obj['pointFormat'] = ApiClient.convertToType(data['pointFormat'], 'String');
      }
      if (data.hasOwnProperty('valueSuffix')) {
        obj['valueSuffix'] = ApiClient.convertToType(data['valueSuffix'], 'String');
      }
    }
    return obj;
  }

  /**
   * Example: {point.x}Pa, {point.y}h
   * @member {String} pointFormat
   */
  exports.prototype['pointFormat'] = undefined;
  /**
   * Example: Pa
   * @member {String} valueSuffix
   */
  exports.prototype['valueSuffix'] = undefined;



  return exports;
}));



},{"../ApiClient":16}],76:[function(require,module,exports){
/**
 * quantimodo
 * QuantiModo makes it easy to retrieve normalized user data from a wide array of devices and applications. [Learn about QuantiModo](https://quantimo.do), check out our [docs](https://github.com/QuantiModo/docs) or contact us at [help.quantimo.do](https://help.quantimo.do).
 *
 * OpenAPI spec version: 5.8.728
 *
 * NOTE: This class is auto generated by the swagger code generator program.
 * https://github.com/swagger-api/swagger-codegen.git
 *
 * Swagger Codegen version: 2.2.3
 *
 * Do not edit the class manually.
 *
 */

(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define(['ApiClient'], factory);
  } else if (typeof module === 'object' && module.exports) {
    // CommonJS-like environments that support module.exports, like Node.
    module.exports = factory(require('../ApiClient'));
  } else {
    // Browser globals (root is window)
    if (!root.Quantimodo) {
      root.Quantimodo = {};
    }
    root.Quantimodo.TrackingReminder = factory(root.Quantimodo.ApiClient);
  }
}(this, function(ApiClient) {
  'use strict';




  /**
   * The TrackingReminder model module.
   * @module model/TrackingReminder
   * @version 5.8.807
   */

  /**
   * Constructs a new <code>TrackingReminder</code>.
   * @alias module:model/TrackingReminder
   * @class
   * @param variableId {Number} Id for the variable to be tracked
   * @param defaultValue {Number} Default value to use for the measurement when tracking
   * @param reminderFrequency {Number} Number of seconds between one reminder and the next
   */
  var exports = function(variableId, defaultValue, reminderFrequency) {
    var _this = this;




    _this['variableId'] = variableId;
    _this['defaultValue'] = defaultValue;



    _this['reminderFrequency'] = reminderFrequency;



























































  };

  /**
   * Constructs a <code>TrackingReminder</code> from a plain JavaScript object, optionally creating a new instance.
   * Copies all relevant properties from <code>data</code> to <code>obj</code> if supplied or a new instance if not.
   * @param {Object} data The plain JavaScript object bearing properties of interest.
   * @param {module:model/TrackingReminder} obj Optional instance to populate.
   * @return {module:model/TrackingReminder} The populated <code>TrackingReminder</code> instance.
   */
  exports.constructFromObject = function(data, obj) {
    if (data) {
      obj = obj || new exports();

      if (data.hasOwnProperty('id')) {
        obj['id'] = ApiClient.convertToType(data['id'], 'Number');
      }
      if (data.hasOwnProperty('clientId')) {
        obj['clientId'] = ApiClient.convertToType(data['clientId'], 'String');
      }
      if (data.hasOwnProperty('userId')) {
        obj['userId'] = ApiClient.convertToType(data['userId'], 'Number');
      }
      if (data.hasOwnProperty('variableId')) {
        obj['variableId'] = ApiClient.convertToType(data['variableId'], 'Number');
      }
      if (data.hasOwnProperty('defaultValue')) {
        obj['defaultValue'] = ApiClient.convertToType(data['defaultValue'], 'Number');
      }
      if (data.hasOwnProperty('reminderStartTime')) {
        obj['reminderStartTime'] = ApiClient.convertToType(data['reminderStartTime'], 'String');
      }
      if (data.hasOwnProperty('reminderEndTime')) {
        obj['reminderEndTime'] = ApiClient.convertToType(data['reminderEndTime'], 'String');
      }
      if (data.hasOwnProperty('reminderSound')) {
        obj['reminderSound'] = ApiClient.convertToType(data['reminderSound'], 'String');
      }
      if (data.hasOwnProperty('reminderFrequency')) {
        obj['reminderFrequency'] = ApiClient.convertToType(data['reminderFrequency'], 'Number');
      }
      if (data.hasOwnProperty('popUp')) {
        obj['popUp'] = ApiClient.convertToType(data['popUp'], 'Boolean');
      }
      if (data.hasOwnProperty('sms')) {
        obj['sms'] = ApiClient.convertToType(data['sms'], 'Boolean');
      }
      if (data.hasOwnProperty('email')) {
        obj['email'] = ApiClient.convertToType(data['email'], 'Boolean');
      }
      if (data.hasOwnProperty('notificationBar')) {
        obj['notificationBar'] = ApiClient.convertToType(data['notificationBar'], 'Boolean');
      }
      if (data.hasOwnProperty('latestTrackingReminderNotificationReminderTime')) {
        obj['latestTrackingReminderNotificationReminderTime'] = ApiClient.convertToType(data['latestTrackingReminderNotificationReminderTime'], 'Date');
      }
      if (data.hasOwnProperty('lastTracked')) {
        obj['lastTracked'] = ApiClient.convertToType(data['lastTracked'], 'Date');
      }
      if (data.hasOwnProperty('startTrackingDate')) {
        obj['startTrackingDate'] = ApiClient.convertToType(data['startTrackingDate'], 'String');
      }
      if (data.hasOwnProperty('stopTrackingDate')) {
        obj['stopTrackingDate'] = ApiClient.convertToType(data['stopTrackingDate'], 'String');
      }
      if (data.hasOwnProperty('updatedAt')) {
        obj['updatedAt'] = ApiClient.convertToType(data['updatedAt'], 'Date');
      }
      if (data.hasOwnProperty('variableName')) {
        obj['variableName'] = ApiClient.convertToType(data['variableName'], 'String');
      }
      if (data.hasOwnProperty('variableCategoryName')) {
        obj['variableCategoryName'] = ApiClient.convertToType(data['variableCategoryName'], 'String');
      }
      if (data.hasOwnProperty('unitAbbreviatedName')) {
        obj['unitAbbreviatedName'] = ApiClient.convertToType(data['unitAbbreviatedName'], 'String');
      }
      if (data.hasOwnProperty('combinationOperation')) {
        obj['combinationOperation'] = ApiClient.convertToType(data['combinationOperation'], 'String');
      }
      if (data.hasOwnProperty('createdAt')) {
        obj['createdAt'] = ApiClient.convertToType(data['createdAt'], 'Date');
      }
      if (data.hasOwnProperty('trackingReminderId')) {
        obj['trackingReminderId'] = ApiClient.convertToType(data['trackingReminderId'], 'Number');
      }
      if (data.hasOwnProperty('defaultUnitId')) {
        obj['defaultUnitId'] = ApiClient.convertToType(data['defaultUnitId'], 'Number');
      }
      if (data.hasOwnProperty('variableDescription')) {
        obj['variableDescription'] = ApiClient.convertToType(data['variableDescription'], 'String');
      }
      if (data.hasOwnProperty('valence')) {
        obj['valence'] = ApiClient.convertToType(data['valence'], 'String');
      }
      if (data.hasOwnProperty('ionIcon')) {
        obj['ionIcon'] = ApiClient.convertToType(data['ionIcon'], 'String');
      }
      if (data.hasOwnProperty('variableCategoryId')) {
        obj['variableCategoryId'] = ApiClient.convertToType(data['variableCategoryId'], 'Number');
      }
      if (data.hasOwnProperty('lastValue')) {
        obj['lastValue'] = ApiClient.convertToType(data['lastValue'], 'Number');
      }
      if (data.hasOwnProperty('secondToLastValue')) {
        obj['secondToLastValue'] = ApiClient.convertToType(data['secondToLastValue'], 'Number');
      }
      if (data.hasOwnProperty('thirdToLastValue')) {
        obj['thirdToLastValue'] = ApiClient.convertToType(data['thirdToLastValue'], 'Number');
      }
      if (data.hasOwnProperty('userVariableDefaultUnitId')) {
        obj['userVariableDefaultUnitId'] = ApiClient.convertToType(data['userVariableDefaultUnitId'], 'Number');
      }
      if (data.hasOwnProperty('userVariableVariableCategoryId')) {
        obj['userVariableVariableCategoryId'] = ApiClient.convertToType(data['userVariableVariableCategoryId'], 'Number');
      }
      if (data.hasOwnProperty('numberOfRawMeasurements')) {
        obj['numberOfRawMeasurements'] = ApiClient.convertToType(data['numberOfRawMeasurements'], 'Number');
      }
      if (data.hasOwnProperty('svgUrl')) {
        obj['svgUrl'] = ApiClient.convertToType(data['svgUrl'], 'String');
      }
      if (data.hasOwnProperty('pngUrl')) {
        obj['pngUrl'] = ApiClient.convertToType(data['pngUrl'], 'String');
      }
      if (data.hasOwnProperty('pngPath')) {
        obj['pngPath'] = ApiClient.convertToType(data['pngPath'], 'String');
      }
      if (data.hasOwnProperty('variableCategoryImageUrl')) {
        obj['variableCategoryImageUrl'] = ApiClient.convertToType(data['variableCategoryImageUrl'], 'String');
      }
      if (data.hasOwnProperty('manualTracking')) {
        obj['manualTracking'] = ApiClient.convertToType(data['manualTracking'], 'Boolean');
      }
      if (data.hasOwnProperty('userVariableVariableCategoryName')) {
        obj['userVariableVariableCategoryName'] = ApiClient.convertToType(data['userVariableVariableCategoryName'], 'String');
      }
      if (data.hasOwnProperty('reminderStartTimeLocal')) {
        obj['reminderStartTimeLocal'] = ApiClient.convertToType(data['reminderStartTimeLocal'], 'Date');
      }
      if (data.hasOwnProperty('reminderStartTimeLocalHumanFormatted')) {
        obj['reminderStartTimeLocalHumanFormatted'] = ApiClient.convertToType(data['reminderStartTimeLocalHumanFormatted'], 'Date');
      }
      if (data.hasOwnProperty('lastValueInUserVariableDefaultUnit')) {
        obj['lastValueInUserVariableDefaultUnit'] = ApiClient.convertToType(data['lastValueInUserVariableDefaultUnit'], 'Number');
      }
      if (data.hasOwnProperty('secondToLastValueInUserVariableDefaultUnit')) {
        obj['secondToLastValueInUserVariableDefaultUnit'] = ApiClient.convertToType(data['secondToLastValueInUserVariableDefaultUnit'], 'Number');
      }
      if (data.hasOwnProperty('thirdToLastValueInUserVariableDefaultUnit')) {
        obj['thirdToLastValueInUserVariableDefaultUnit'] = ApiClient.convertToType(data['thirdToLastValueInUserVariableDefaultUnit'], 'Number');
      }
      if (data.hasOwnProperty('unitId')) {
        obj['unitId'] = ApiClient.convertToType(data['unitId'], 'Number');
      }
      if (data.hasOwnProperty('unitName')) {
        obj['unitName'] = ApiClient.convertToType(data['unitName'], 'String');
      }
      if (data.hasOwnProperty('unitCategoryId')) {
        obj['unitCategoryId'] = ApiClient.convertToType(data['unitCategoryId'], 'Number');
      }
      if (data.hasOwnProperty('unitCategoryName')) {
        obj['unitCategoryName'] = ApiClient.convertToType(data['unitCategoryName'], 'String');
      }
      if (data.hasOwnProperty('defaultUnitName')) {
        obj['defaultUnitName'] = ApiClient.convertToType(data['defaultUnitName'], 'String');
      }
      if (data.hasOwnProperty('defaultUnitAbbreviatedName')) {
        obj['defaultUnitAbbreviatedName'] = ApiClient.convertToType(data['defaultUnitAbbreviatedName'], 'String');
      }
      if (data.hasOwnProperty('defaultUnitCategoryId')) {
        obj['defaultUnitCategoryId'] = ApiClient.convertToType(data['defaultUnitCategoryId'], 'Number');
      }
      if (data.hasOwnProperty('defaultUnitCategoryName')) {
        obj['defaultUnitCategoryName'] = ApiClient.convertToType(data['defaultUnitCategoryName'], 'String');
      }
      if (data.hasOwnProperty('userVariableDefaultUnitName')) {
        obj['userVariableDefaultUnitName'] = ApiClient.convertToType(data['userVariableDefaultUnitName'], 'String');
      }
      if (data.hasOwnProperty('userVariableDefaultUnitAbbreviatedName')) {
        obj['userVariableDefaultUnitAbbreviatedName'] = ApiClient.convertToType(data['userVariableDefaultUnitAbbreviatedName'], 'String');
      }
      if (data.hasOwnProperty('userVariableDefaultUnitCategoryId')) {
        obj['userVariableDefaultUnitCategoryId'] = ApiClient.convertToType(data['userVariableDefaultUnitCategoryId'], 'Number');
      }
      if (data.hasOwnProperty('userVariableDefaultUnitCategoryName')) {
        obj['userVariableDefaultUnitCategoryName'] = ApiClient.convertToType(data['userVariableDefaultUnitCategoryName'], 'String');
      }
      if (data.hasOwnProperty('minimumAllowedValue')) {
        obj['minimumAllowedValue'] = ApiClient.convertToType(data['minimumAllowedValue'], 'Number');
      }
      if (data.hasOwnProperty('maximumAllowedValue')) {
        obj['maximumAllowedValue'] = ApiClient.convertToType(data['maximumAllowedValue'], 'Number');
      }
      if (data.hasOwnProperty('inputType')) {
        obj['inputType'] = ApiClient.convertToType(data['inputType'], 'String');
      }
      if (data.hasOwnProperty('reminderStartEpochSeconds')) {
        obj['reminderStartEpochSeconds'] = ApiClient.convertToType(data['reminderStartEpochSeconds'], 'Number');
      }
      if (data.hasOwnProperty('nextReminderTimeEpochSeconds')) {
        obj['nextReminderTimeEpochSeconds'] = ApiClient.convertToType(data['nextReminderTimeEpochSeconds'], 'Number');
      }
      if (data.hasOwnProperty('firstDailyReminderTime')) {
        obj['firstDailyReminderTime'] = ApiClient.convertToType(data['firstDailyReminderTime'], 'Date');
      }
      if (data.hasOwnProperty('frequencyTextDescription')) {
        obj['frequencyTextDescription'] = ApiClient.convertToType(data['frequencyTextDescription'], 'String');
      }
      if (data.hasOwnProperty('frequencyTextDescriptionWithTime')) {
        obj['frequencyTextDescriptionWithTime'] = ApiClient.convertToType(data['frequencyTextDescriptionWithTime'], 'String');
      }
      if (data.hasOwnProperty('valueAndFrequencyTextDescription')) {
        obj['valueAndFrequencyTextDescription'] = ApiClient.convertToType(data['valueAndFrequencyTextDescription'], 'String');
      }
      if (data.hasOwnProperty('valueAndFrequencyTextDescriptionWithTime')) {
        obj['valueAndFrequencyTextDescriptionWithTime'] = ApiClient.convertToType(data['valueAndFrequencyTextDescriptionWithTime'], 'String');
      }
    }
    return obj;
  }

  /**
   * id
   * @member {Number} id
   */
  exports.prototype['id'] = undefined;
  /**
   * clientId
   * @member {String} clientId
   */
  exports.prototype['clientId'] = undefined;
  /**
   * ID of User
   * @member {Number} userId
   */
  exports.prototype['userId'] = undefined;
  /**
   * Id for the variable to be tracked
   * @member {Number} variableId
   */
  exports.prototype['variableId'] = undefined;
  /**
   * Default value to use for the measurement when tracking
   * @member {Number} defaultValue
   */
  exports.prototype['defaultValue'] = undefined;
  /**
   * Earliest time of day at which reminders should appear in UTC HH:MM:SS format
   * @member {String} reminderStartTime
   */
  exports.prototype['reminderStartTime'] = undefined;
  /**
   * Latest time of day at which reminders should appear in UTC HH:MM:SS format
   * @member {String} reminderEndTime
   */
  exports.prototype['reminderEndTime'] = undefined;
  /**
   * String identifier for the sound to accompany the reminder
   * @member {String} reminderSound
   */
  exports.prototype['reminderSound'] = undefined;
  /**
   * Number of seconds between one reminder and the next
   * @member {Number} reminderFrequency
   */
  exports.prototype['reminderFrequency'] = undefined;
  /**
   * True if the reminders should appear as a popup notification
   * @member {Boolean} popUp
   */
  exports.prototype['popUp'] = undefined;
  /**
   * True if the reminders should be delivered via SMS
   * @member {Boolean} sms
   */
  exports.prototype['sms'] = undefined;
  /**
   * True if the reminders should be delivered via email
   * @member {Boolean} email
   */
  exports.prototype['email'] = undefined;
  /**
   * True if the reminders should appear in the notification bar
   * @member {Boolean} notificationBar
   */
  exports.prototype['notificationBar'] = undefined;
  /**
   * UTC ISO 8601 `YYYY-MM-DDThh:mm:ss`  timestamp for the reminder time of the latest tracking reminder notification that has been pre-emptively generated in the database
   * @member {Date} latestTrackingReminderNotificationReminderTime
   */
  exports.prototype['latestTrackingReminderNotificationReminderTime'] = undefined;
  /**
   * UTC ISO 8601 `YYYY-MM-DDThh:mm:ss`  timestamp for the last time a measurement was received for this user and variable
   * @member {Date} lastTracked
   */
  exports.prototype['lastTracked'] = undefined;
  /**
   * Earliest date on which the user should be reminded to track in YYYY-MM-DD format
   * @member {String} startTrackingDate
   */
  exports.prototype['startTrackingDate'] = undefined;
  /**
   * Latest date on which the user should be reminded to track in YYYY-MM-DD format
   * @member {String} stopTrackingDate
   */
  exports.prototype['stopTrackingDate'] = undefined;
  /**
   * When the record in the database was last updated. Use UTC ISO 8601 `YYYY-MM-DDThh:mm:ss`  datetime format. Time zone should be UTC and not local.
   * @member {Date} updatedAt
   */
  exports.prototype['updatedAt'] = undefined;
  /**
   * Name of the variable to be used when sending measurements
   * @member {String} variableName
   */
  exports.prototype['variableName'] = undefined;
  /**
   * Name of the variable category to be used when sending measurements
   * @member {String} variableCategoryName
   */
  exports.prototype['variableCategoryName'] = undefined;
  /**
   * Abbreviated name of the unit to be used when sending measurements
   * @member {String} unitAbbreviatedName
   */
  exports.prototype['unitAbbreviatedName'] = undefined;
  /**
   * The way multiple measurements are aggregated over time
   * @member {module:model/TrackingReminder.CombinationOperationEnum} combinationOperation
   */
  exports.prototype['combinationOperation'] = undefined;
  /**
   * Example: 2016-05-18 02:24:08
   * @member {Date} createdAt
   */
  exports.prototype['createdAt'] = undefined;
  /**
   * Example: 11841
   * @member {Number} trackingReminderId
   */
  exports.prototype['trackingReminderId'] = undefined;
  /**
   * Example: 10
   * @member {Number} defaultUnitId
   */
  exports.prototype['defaultUnitId'] = undefined;
  /**
   * Example: negative
   * @member {String} variableDescription
   */
  exports.prototype['variableDescription'] = undefined;
  /**
   * Example: negative
   * @member {String} valence
   */
  exports.prototype['valence'] = undefined;
  /**
   * Example: ion-sad-outline
   * @member {String} ionIcon
   */
  exports.prototype['ionIcon'] = undefined;
  /**
   * Example: 10
   * @member {Number} variableCategoryId
   */
  exports.prototype['variableCategoryId'] = undefined;
  /**
   * Example: 2
   * @member {Number} lastValue
   */
  exports.prototype['lastValue'] = undefined;
  /**
   * Example: 1
   * @member {Number} secondToLastValue
   */
  exports.prototype['secondToLastValue'] = undefined;
  /**
   * Example: 3
   * @member {Number} thirdToLastValue
   */
  exports.prototype['thirdToLastValue'] = undefined;
  /**
   * Example: 10
   * @member {Number} userVariableDefaultUnitId
   */
  exports.prototype['userVariableDefaultUnitId'] = undefined;
  /**
   * Example: 10
   * @member {Number} userVariableVariableCategoryId
   */
  exports.prototype['userVariableVariableCategoryId'] = undefined;
  /**
   * Example: 445
   * @member {Number} numberOfRawMeasurements
   */
  exports.prototype['numberOfRawMeasurements'] = undefined;
  /**
   * Example: https://app.quantimo.do/ionic/Modo/www/img/variable_categories/symptoms.svg
   * @member {String} svgUrl
   */
  exports.prototype['svgUrl'] = undefined;
  /**
   * Example: https://app.quantimo.do/ionic/Modo/www/img/variable_categories/symptoms.png
   * @member {String} pngUrl
   */
  exports.prototype['pngUrl'] = undefined;
  /**
   * Example: img/variable_categories/symptoms.png
   * @member {String} pngPath
   */
  exports.prototype['pngPath'] = undefined;
  /**
   * Example: https://maxcdn.icons8.com/Color/PNG/96/Messaging/sad-96.png
   * @member {String} variableCategoryImageUrl
   */
  exports.prototype['variableCategoryImageUrl'] = undefined;
  /**
   * Example: 1
   * @member {Boolean} manualTracking
   */
  exports.prototype['manualTracking'] = undefined;
  /**
   * Example: Symptoms
   * @member {String} userVariableVariableCategoryName
   */
  exports.prototype['userVariableVariableCategoryName'] = undefined;
  /**
   * Example: 21:45:20
   * @member {Date} reminderStartTimeLocal
   */
  exports.prototype['reminderStartTimeLocal'] = undefined;
  /**
   * Example: 09:45 PM
   * @member {Date} reminderStartTimeLocalHumanFormatted
   */
  exports.prototype['reminderStartTimeLocalHumanFormatted'] = undefined;
  /**
   * Example: 2
   * @member {Number} lastValueInUserVariableDefaultUnit
   */
  exports.prototype['lastValueInUserVariableDefaultUnit'] = undefined;
  /**
   * Example: 1
   * @member {Number} secondToLastValueInUserVariableDefaultUnit
   */
  exports.prototype['secondToLastValueInUserVariableDefaultUnit'] = undefined;
  /**
   * Example: 3
   * @member {Number} thirdToLastValueInUserVariableDefaultUnit
   */
  exports.prototype['thirdToLastValueInUserVariableDefaultUnit'] = undefined;
  /**
   * Example: 10
   * @member {Number} unitId
   */
  exports.prototype['unitId'] = undefined;
  /**
   * Example: 1 to 5 Rating
   * @member {String} unitName
   */
  exports.prototype['unitName'] = undefined;
  /**
   * Example: 5
   * @member {Number} unitCategoryId
   */
  exports.prototype['unitCategoryId'] = undefined;
  /**
   * Example: Rating
   * @member {String} unitCategoryName
   */
  exports.prototype['unitCategoryName'] = undefined;
  /**
   * Example: 1 to 5 Rating
   * @member {String} defaultUnitName
   */
  exports.prototype['defaultUnitName'] = undefined;
  /**
   * Example: /5
   * @member {String} defaultUnitAbbreviatedName
   */
  exports.prototype['defaultUnitAbbreviatedName'] = undefined;
  /**
   * Example: 5
   * @member {Number} defaultUnitCategoryId
   */
  exports.prototype['defaultUnitCategoryId'] = undefined;
  /**
   * Example: Rating
   * @member {String} defaultUnitCategoryName
   */
  exports.prototype['defaultUnitCategoryName'] = undefined;
  /**
   * Example: 1 to 5 Rating
   * @member {String} userVariableDefaultUnitName
   */
  exports.prototype['userVariableDefaultUnitName'] = undefined;
  /**
   * Example: /5
   * @member {String} userVariableDefaultUnitAbbreviatedName
   */
  exports.prototype['userVariableDefaultUnitAbbreviatedName'] = undefined;
  /**
   * Example: 5
   * @member {Number} userVariableDefaultUnitCategoryId
   */
  exports.prototype['userVariableDefaultUnitCategoryId'] = undefined;
  /**
   * Example: Rating
   * @member {String} userVariableDefaultUnitCategoryName
   */
  exports.prototype['userVariableDefaultUnitCategoryName'] = undefined;
  /**
   * Example: 1
   * @member {Number} minimumAllowedValue
   */
  exports.prototype['minimumAllowedValue'] = undefined;
  /**
   * Example: 5
   * @member {Number} maximumAllowedValue
   */
  exports.prototype['maximumAllowedValue'] = undefined;
  /**
   * Example: saddestFaceIsFive
   * @member {String} inputType
   */
  exports.prototype['inputType'] = undefined;
  /**
   * Example: 1469760320
   * @member {Number} reminderStartEpochSeconds
   */
  exports.prototype['reminderStartEpochSeconds'] = undefined;
  /**
   * Example: 1501555520
   * @member {Number} nextReminderTimeEpochSeconds
   */
  exports.prototype['nextReminderTimeEpochSeconds'] = undefined;
  /**
   * Example: 02:45:20
   * @member {Date} firstDailyReminderTime
   */
  exports.prototype['firstDailyReminderTime'] = undefined;
  /**
   * Example: Daily
   * @member {String} frequencyTextDescription
   */
  exports.prototype['frequencyTextDescription'] = undefined;
  /**
   * Example: Daily at 09:45 PM
   * @member {String} frequencyTextDescriptionWithTime
   */
  exports.prototype['frequencyTextDescriptionWithTime'] = undefined;
  /**
   * Example: Rate daily
   * @member {String} valueAndFrequencyTextDescription
   */
  exports.prototype['valueAndFrequencyTextDescription'] = undefined;
  /**
   * Example: Rate daily at 09:45 PM
   * @member {String} valueAndFrequencyTextDescriptionWithTime
   */
  exports.prototype['valueAndFrequencyTextDescriptionWithTime'] = undefined;


  /**
   * Allowed values for the <code>combinationOperation</code> property.
   * @enum {String}
   * @readonly
   */
  exports.CombinationOperationEnum = {
    /**
     * value: "MEAN"
     * @const
     */
    "MEAN": "MEAN",
    /**
     * value: "SUM"
     * @const
     */
    "SUM": "SUM"  };


  return exports;
}));



},{"../ApiClient":16}],77:[function(require,module,exports){
/**
 * quantimodo
 * QuantiModo makes it easy to retrieve normalized user data from a wide array of devices and applications. [Learn about QuantiModo](https://quantimo.do), check out our [docs](https://github.com/QuantiModo/docs) or contact us at [help.quantimo.do](https://help.quantimo.do).
 *
 * OpenAPI spec version: 5.8.728
 *
 * NOTE: This class is auto generated by the swagger code generator program.
 * https://github.com/swagger-api/swagger-codegen.git
 *
 * Swagger Codegen version: 2.2.3
 *
 * Do not edit the class manually.
 *
 */

(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define(['ApiClient'], factory);
  } else if (typeof module === 'object' && module.exports) {
    // CommonJS-like environments that support module.exports, like Node.
    module.exports = factory(require('../ApiClient'));
  } else {
    // Browser globals (root is window)
    if (!root.Quantimodo) {
      root.Quantimodo = {};
    }
    root.Quantimodo.TrackingReminderDelete = factory(root.Quantimodo.ApiClient);
  }
}(this, function(ApiClient) {
  'use strict';




  /**
   * The TrackingReminderDelete model module.
   * @module model/TrackingReminderDelete
   * @version 5.8.807
   */

  /**
   * Constructs a new <code>TrackingReminderDelete</code>.
   * @alias module:model/TrackingReminderDelete
   * @class
   * @param id {Number} Id of the TrackingReminder to be deleted
   */
  var exports = function(id) {
    var _this = this;

    _this['id'] = id;
  };

  /**
   * Constructs a <code>TrackingReminderDelete</code> from a plain JavaScript object, optionally creating a new instance.
   * Copies all relevant properties from <code>data</code> to <code>obj</code> if supplied or a new instance if not.
   * @param {Object} data The plain JavaScript object bearing properties of interest.
   * @param {module:model/TrackingReminderDelete} obj Optional instance to populate.
   * @return {module:model/TrackingReminderDelete} The populated <code>TrackingReminderDelete</code> instance.
   */
  exports.constructFromObject = function(data, obj) {
    if (data) {
      obj = obj || new exports();

      if (data.hasOwnProperty('id')) {
        obj['id'] = ApiClient.convertToType(data['id'], 'Number');
      }
    }
    return obj;
  }

  /**
   * Id of the TrackingReminder to be deleted
   * @member {Number} id
   */
  exports.prototype['id'] = undefined;



  return exports;
}));



},{"../ApiClient":16}],78:[function(require,module,exports){
/**
 * quantimodo
 * QuantiModo makes it easy to retrieve normalized user data from a wide array of devices and applications. [Learn about QuantiModo](https://quantimo.do), check out our [docs](https://github.com/QuantiModo/docs) or contact us at [help.quantimo.do](https://help.quantimo.do).
 *
 * OpenAPI spec version: 5.8.728
 *
 * NOTE: This class is auto generated by the swagger code generator program.
 * https://github.com/swagger-api/swagger-codegen.git
 *
 * Swagger Codegen version: 2.2.3
 *
 * Do not edit the class manually.
 *
 */

(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define(['ApiClient', 'model/TrackingReminderNotificationActionArray', 'model/TrackingReminderNotificationTrackAllAction', 'model/Unit'], factory);
  } else if (typeof module === 'object' && module.exports) {
    // CommonJS-like environments that support module.exports, like Node.
    module.exports = factory(require('../ApiClient'), require('./TrackingReminderNotificationActionArray'), require('./TrackingReminderNotificationTrackAllAction'), require('./Unit'));
  } else {
    // Browser globals (root is window)
    if (!root.Quantimodo) {
      root.Quantimodo = {};
    }
    root.Quantimodo.TrackingReminderNotification = factory(root.Quantimodo.ApiClient, root.Quantimodo.TrackingReminderNotificationActionArray, root.Quantimodo.TrackingReminderNotificationTrackAllAction, root.Quantimodo.Unit);
  }
}(this, function(ApiClient, TrackingReminderNotificationActionArray, TrackingReminderNotificationTrackAllAction, Unit) {
  'use strict';




  /**
   * The TrackingReminderNotification model module.
   * @module model/TrackingReminderNotification
   * @version 5.8.807
   */

  /**
   * Constructs a new <code>TrackingReminderNotification</code>.
   * @alias module:model/TrackingReminderNotification
   * @class
   * @param id {Number} id for the specific PENDING tracking remidner
   * @param availableDefaultUnits {Array.<module:model/Unit>} 
   * @param actionArray {Array.<module:model/TrackingReminderNotificationActionArray>} 
   * @param trackAllActions {Array.<module:model/TrackingReminderNotificationTrackAllAction>} 
   * @param fillingValue {Number} Example: 0
   */
  var exports = function(id, availableDefaultUnits, actionArray, trackAllActions, fillingValue) {
    var _this = this;

    _this['id'] = id;





































































    _this['availableDefaultUnits'] = availableDefaultUnits;
    _this['actionArray'] = actionArray;
    _this['trackAllActions'] = trackAllActions;
    _this['fillingValue'] = fillingValue;



  };

  /**
   * Constructs a <code>TrackingReminderNotification</code> from a plain JavaScript object, optionally creating a new instance.
   * Copies all relevant properties from <code>data</code> to <code>obj</code> if supplied or a new instance if not.
   * @param {Object} data The plain JavaScript object bearing properties of interest.
   * @param {module:model/TrackingReminderNotification} obj Optional instance to populate.
   * @return {module:model/TrackingReminderNotification} The populated <code>TrackingReminderNotification</code> instance.
   */
  exports.constructFromObject = function(data, obj) {
    if (data) {
      obj = obj || new exports();

      if (data.hasOwnProperty('id')) {
        obj['id'] = ApiClient.convertToType(data['id'], 'Number');
      }
      if (data.hasOwnProperty('trackingReminderId')) {
        obj['trackingReminderId'] = ApiClient.convertToType(data['trackingReminderId'], 'Number');
      }
      if (data.hasOwnProperty('clientId')) {
        obj['clientId'] = ApiClient.convertToType(data['clientId'], 'String');
      }
      if (data.hasOwnProperty('userId')) {
        obj['userId'] = ApiClient.convertToType(data['userId'], 'Number');
      }
      if (data.hasOwnProperty('variableId')) {
        obj['variableId'] = ApiClient.convertToType(data['variableId'], 'Number');
      }
      if (data.hasOwnProperty('defaultValue')) {
        obj['defaultValue'] = ApiClient.convertToType(data['defaultValue'], 'Number');
      }
      if (data.hasOwnProperty('reminderSound')) {
        obj['reminderSound'] = ApiClient.convertToType(data['reminderSound'], 'String');
      }
      if (data.hasOwnProperty('popUp')) {
        obj['popUp'] = ApiClient.convertToType(data['popUp'], 'Boolean');
      }
      if (data.hasOwnProperty('sms')) {
        obj['sms'] = ApiClient.convertToType(data['sms'], 'Boolean');
      }
      if (data.hasOwnProperty('email')) {
        obj['email'] = ApiClient.convertToType(data['email'], 'Boolean');
      }
      if (data.hasOwnProperty('notificationBar')) {
        obj['notificationBar'] = ApiClient.convertToType(data['notificationBar'], 'Boolean');
      }
      if (data.hasOwnProperty('updatedAt')) {
        obj['updatedAt'] = ApiClient.convertToType(data['updatedAt'], 'Date');
      }
      if (data.hasOwnProperty('variableName')) {
        obj['variableName'] = ApiClient.convertToType(data['variableName'], 'String');
      }
      if (data.hasOwnProperty('variableCategoryName')) {
        obj['variableCategoryName'] = ApiClient.convertToType(data['variableCategoryName'], 'String');
      }
      if (data.hasOwnProperty('unitAbbreviatedName')) {
        obj['unitAbbreviatedName'] = ApiClient.convertToType(data['unitAbbreviatedName'], 'String');
      }
      if (data.hasOwnProperty('combinationOperation')) {
        obj['combinationOperation'] = ApiClient.convertToType(data['combinationOperation'], 'String');
      }
      if (data.hasOwnProperty('reminderFrequency')) {
        obj['reminderFrequency'] = ApiClient.convertToType(data['reminderFrequency'], 'Number');
      }
      if (data.hasOwnProperty('reminderStartTime')) {
        obj['reminderStartTime'] = ApiClient.convertToType(data['reminderStartTime'], 'String');
      }
      if (data.hasOwnProperty('createdAt')) {
        obj['createdAt'] = ApiClient.convertToType(data['createdAt'], 'Date');
      }
      if (data.hasOwnProperty('trackingReminderNotificationId')) {
        obj['trackingReminderNotificationId'] = ApiClient.convertToType(data['trackingReminderNotificationId'], 'Number');
      }
      if (data.hasOwnProperty('reminderTime')) {
        obj['reminderTime'] = ApiClient.convertToType(data['reminderTime'], 'Date');
      }
      if (data.hasOwnProperty('trackingReminderNotificationTime')) {
        obj['trackingReminderNotificationTime'] = ApiClient.convertToType(data['trackingReminderNotificationTime'], 'Date');
      }
      if (data.hasOwnProperty('defaultUnitId')) {
        obj['defaultUnitId'] = ApiClient.convertToType(data['defaultUnitId'], 'Number');
      }
      if (data.hasOwnProperty('description')) {
        obj['description'] = ApiClient.convertToType(data['description'], 'String');
      }
      if (data.hasOwnProperty('variableCategoryId')) {
        obj['variableCategoryId'] = ApiClient.convertToType(data['variableCategoryId'], 'Number');
      }
      if (data.hasOwnProperty('valence')) {
        obj['valence'] = ApiClient.convertToType(data['valence'], 'String');
      }
      if (data.hasOwnProperty('mostCommonValue')) {
        obj['mostCommonValue'] = ApiClient.convertToType(data['mostCommonValue'], 'Number');
      }
      if (data.hasOwnProperty('secondMostCommonValue')) {
        obj['secondMostCommonValue'] = ApiClient.convertToType(data['secondMostCommonValue'], 'Number');
      }
      if (data.hasOwnProperty('thirdMostCommonValue')) {
        obj['thirdMostCommonValue'] = ApiClient.convertToType(data['thirdMostCommonValue'], 'Number');
      }
      if (data.hasOwnProperty('lastValue')) {
        obj['lastValue'] = ApiClient.convertToType(data['lastValue'], 'Number');
      }
      if (data.hasOwnProperty('secondToLastValue')) {
        obj['secondToLastValue'] = ApiClient.convertToType(data['secondToLastValue'], 'Number');
      }
      if (data.hasOwnProperty('thirdToLastValue')) {
        obj['thirdToLastValue'] = ApiClient.convertToType(data['thirdToLastValue'], 'Number');
      }
      if (data.hasOwnProperty('userVariableDefaultUnitId')) {
        obj['userVariableDefaultUnitId'] = ApiClient.convertToType(data['userVariableDefaultUnitId'], 'Number');
      }
      if (data.hasOwnProperty('userVariableVariableCategoryId')) {
        obj['userVariableVariableCategoryId'] = ApiClient.convertToType(data['userVariableVariableCategoryId'], 'Number');
      }
      if (data.hasOwnProperty('numberOfUniqueValues')) {
        obj['numberOfUniqueValues'] = ApiClient.convertToType(data['numberOfUniqueValues'], 'Number');
      }
      if (data.hasOwnProperty('ionIcon')) {
        obj['ionIcon'] = ApiClient.convertToType(data['ionIcon'], 'String');
      }
      if (data.hasOwnProperty('svgUrl')) {
        obj['svgUrl'] = ApiClient.convertToType(data['svgUrl'], 'String');
      }
      if (data.hasOwnProperty('pngUrl')) {
        obj['pngUrl'] = ApiClient.convertToType(data['pngUrl'], 'String');
      }
      if (data.hasOwnProperty('pngPath')) {
        obj['pngPath'] = ApiClient.convertToType(data['pngPath'], 'String');
      }
      if (data.hasOwnProperty('variableCategoryImageUrl')) {
        obj['variableCategoryImageUrl'] = ApiClient.convertToType(data['variableCategoryImageUrl'], 'String');
      }
      if (data.hasOwnProperty('manualTracking')) {
        obj['manualTracking'] = ApiClient.convertToType(data['manualTracking'], 'Boolean');
      }
      if (data.hasOwnProperty('userVariableVariableCategoryName')) {
        obj['userVariableVariableCategoryName'] = ApiClient.convertToType(data['userVariableVariableCategoryName'], 'String');
      }
      if (data.hasOwnProperty('trackingReminderNotificationTimeEpoch')) {
        obj['trackingReminderNotificationTimeEpoch'] = ApiClient.convertToType(data['trackingReminderNotificationTimeEpoch'], 'Number');
      }
      if (data.hasOwnProperty('trackingReminderNotificationTimeLocal')) {
        obj['trackingReminderNotificationTimeLocal'] = ApiClient.convertToType(data['trackingReminderNotificationTimeLocal'], 'String');
      }
      if (data.hasOwnProperty('lastValueInUserVariableDefaultUnit')) {
        obj['lastValueInUserVariableDefaultUnit'] = ApiClient.convertToType(data['lastValueInUserVariableDefaultUnit'], 'Number');
      }
      if (data.hasOwnProperty('secondToLastValueInUserVariableDefaultUnit')) {
        obj['secondToLastValueInUserVariableDefaultUnit'] = ApiClient.convertToType(data['secondToLastValueInUserVariableDefaultUnit'], 'Number');
      }
      if (data.hasOwnProperty('thirdToLastValueInUserVariableDefaultUnit')) {
        obj['thirdToLastValueInUserVariableDefaultUnit'] = ApiClient.convertToType(data['thirdToLastValueInUserVariableDefaultUnit'], 'Number');
      }
      if (data.hasOwnProperty('mostCommonValueInUserVariableDefaultUnit')) {
        obj['mostCommonValueInUserVariableDefaultUnit'] = ApiClient.convertToType(data['mostCommonValueInUserVariableDefaultUnit'], 'Number');
      }
      if (data.hasOwnProperty('secondMostCommonValueInUserVariableDefaultUnit')) {
        obj['secondMostCommonValueInUserVariableDefaultUnit'] = ApiClient.convertToType(data['secondMostCommonValueInUserVariableDefaultUnit'], 'Number');
      }
      if (data.hasOwnProperty('thirdMostCommonValueInUserVariableDefaultUnit')) {
        obj['thirdMostCommonValueInUserVariableDefaultUnit'] = ApiClient.convertToType(data['thirdMostCommonValueInUserVariableDefaultUnit'], 'Number');
      }
      if (data.hasOwnProperty('unitId')) {
        obj['unitId'] = ApiClient.convertToType(data['unitId'], 'Number');
      }
      if (data.hasOwnProperty('unitName')) {
        obj['unitName'] = ApiClient.convertToType(data['unitName'], 'String');
      }
      if (data.hasOwnProperty('unitCategoryId')) {
        obj['unitCategoryId'] = ApiClient.convertToType(data['unitCategoryId'], 'Number');
      }
      if (data.hasOwnProperty('unitCategoryName')) {
        obj['unitCategoryName'] = ApiClient.convertToType(data['unitCategoryName'], 'String');
      }
      if (data.hasOwnProperty('defaultUnitName')) {
        obj['defaultUnitName'] = ApiClient.convertToType(data['defaultUnitName'], 'String');
      }
      if (data.hasOwnProperty('defaultUnitAbbreviatedName')) {
        obj['defaultUnitAbbreviatedName'] = ApiClient.convertToType(data['defaultUnitAbbreviatedName'], 'String');
      }
      if (data.hasOwnProperty('defaultUnitCategoryId')) {
        obj['defaultUnitCategoryId'] = ApiClient.convertToType(data['defaultUnitCategoryId'], 'Number');
      }
      if (data.hasOwnProperty('defaultUnitCategoryName')) {
        obj['defaultUnitCategoryName'] = ApiClient.convertToType(data['defaultUnitCategoryName'], 'String');
      }
      if (data.hasOwnProperty('userVariableDefaultUnitName')) {
        obj['userVariableDefaultUnitName'] = ApiClient.convertToType(data['userVariableDefaultUnitName'], 'String');
      }
      if (data.hasOwnProperty('userVariableDefaultUnitAbbreviatedName')) {
        obj['userVariableDefaultUnitAbbreviatedName'] = ApiClient.convertToType(data['userVariableDefaultUnitAbbreviatedName'], 'String');
      }
      if (data.hasOwnProperty('userVariableDefaultUnitCategoryId')) {
        obj['userVariableDefaultUnitCategoryId'] = ApiClient.convertToType(data['userVariableDefaultUnitCategoryId'], 'Number');
      }
      if (data.hasOwnProperty('userVariableDefaultUnitCategoryName')) {
        obj['userVariableDefaultUnitCategoryName'] = ApiClient.convertToType(data['userVariableDefaultUnitCategoryName'], 'String');
      }
      if (data.hasOwnProperty('minimumAllowedValue')) {
        obj['minimumAllowedValue'] = ApiClient.convertToType(data['minimumAllowedValue'], 'Number');
      }
      if (data.hasOwnProperty('maximumAllowedValue')) {
        obj['maximumAllowedValue'] = ApiClient.convertToType(data['maximumAllowedValue'], 'Number');
      }
      if (data.hasOwnProperty('inputType')) {
        obj['inputType'] = ApiClient.convertToType(data['inputType'], 'String');
      }
      if (data.hasOwnProperty('total')) {
        obj['total'] = ApiClient.convertToType(data['total'], 'Number');
      }
      if (data.hasOwnProperty('title')) {
        obj['title'] = ApiClient.convertToType(data['title'], 'String');
      }
      if (data.hasOwnProperty('trackingReminderImageUrl')) {
        obj['trackingReminderImageUrl'] = ApiClient.convertToType(data['trackingReminderImageUrl'], 'String');
      }
      if (data.hasOwnProperty('imageUrl')) {
        obj['imageUrl'] = ApiClient.convertToType(data['imageUrl'], 'String');
      }
      if (data.hasOwnProperty('iconIcon')) {
        obj['iconIcon'] = ApiClient.convertToType(data['iconIcon'], 'String');
      }
      if (data.hasOwnProperty('availableDefaultUnits')) {
        obj['availableDefaultUnits'] = ApiClient.convertToType(data['availableDefaultUnits'], [Unit]);
      }
      if (data.hasOwnProperty('actionArray')) {
        obj['actionArray'] = ApiClient.convertToType(data['actionArray'], [TrackingReminderNotificationActionArray]);
      }
      if (data.hasOwnProperty('trackAllActions')) {
        obj['trackAllActions'] = ApiClient.convertToType(data['trackAllActions'], [TrackingReminderNotificationTrackAllAction]);
      }
      if (data.hasOwnProperty('fillingValue')) {
        obj['fillingValue'] = ApiClient.convertToType(data['fillingValue'], 'Number');
      }
      if (data.hasOwnProperty('reminderEndTime')) {
        obj['reminderEndTime'] = ApiClient.convertToType(data['reminderEndTime'], 'Date');
      }
      if (data.hasOwnProperty('notifiedAt')) {
        obj['notifiedAt'] = ApiClient.convertToType(data['notifiedAt'], 'Date');
      }
      if (data.hasOwnProperty('variableImageUrl')) {
        obj['variableImageUrl'] = ApiClient.convertToType(data['variableImageUrl'], 'String');
      }
    }
    return obj;
  }

  /**
   * id for the specific PENDING tracking remidner
   * @member {Number} id
   */
  exports.prototype['id'] = undefined;
  /**
   * id for the repeating tracking remidner
   * @member {Number} trackingReminderId
   */
  exports.prototype['trackingReminderId'] = undefined;
  /**
   * clientId
   * @member {String} clientId
   */
  exports.prototype['clientId'] = undefined;
  /**
   * ID of User
   * @member {Number} userId
   */
  exports.prototype['userId'] = undefined;
  /**
   * Id for the variable to be tracked
   * @member {Number} variableId
   */
  exports.prototype['variableId'] = undefined;
  /**
   * Default value to use for the measurement when tracking
   * @member {Number} defaultValue
   */
  exports.prototype['defaultValue'] = undefined;
  /**
   * String identifier for the sound to accompany the reminder
   * @member {String} reminderSound
   */
  exports.prototype['reminderSound'] = undefined;
  /**
   * True if the reminders should appear as a popup notification
   * @member {Boolean} popUp
   */
  exports.prototype['popUp'] = undefined;
  /**
   * True if the reminders should be delivered via SMS
   * @member {Boolean} sms
   */
  exports.prototype['sms'] = undefined;
  /**
   * True if the reminders should be delivered via email
   * @member {Boolean} email
   */
  exports.prototype['email'] = undefined;
  /**
   * True if the reminders should appear in the notification bar
   * @member {Boolean} notificationBar
   */
  exports.prototype['notificationBar'] = undefined;
  /**
   * When the record in the database was last updated. Use UTC ISO 8601 `YYYY-MM-DDThh:mm:ss`  datetime format. Time zone should be UTC and not local.
   * @member {Date} updatedAt
   */
  exports.prototype['updatedAt'] = undefined;
  /**
   * Name of the variable to be used when sending measurements
   * @member {String} variableName
   */
  exports.prototype['variableName'] = undefined;
  /**
   * Name of the variable category to be used when sending measurements
   * @member {String} variableCategoryName
   */
  exports.prototype['variableCategoryName'] = undefined;
  /**
   * Abbreviated name of the unit to be used when sending measurements
   * @member {String} unitAbbreviatedName
   */
  exports.prototype['unitAbbreviatedName'] = undefined;
  /**
   * The way multiple measurements are aggregated over time
   * @member {module:model/TrackingReminderNotification.CombinationOperationEnum} combinationOperation
   */
  exports.prototype['combinationOperation'] = undefined;
  /**
   * How often user should be reminded in seconds. Example: 86400
   * @member {Number} reminderFrequency
   */
  exports.prototype['reminderFrequency'] = undefined;
  /**
   * Earliest time of day at which reminders should appear in UTC HH:MM:SS format
   * @member {String} reminderStartTime
   */
  exports.prototype['reminderStartTime'] = undefined;
  /**
   * Example: 2017-07-29 20:49:54
   * @member {Date} createdAt
   */
  exports.prototype['createdAt'] = undefined;
  /**
   * Example: 5072482
   * @member {Number} trackingReminderNotificationId
   */
  exports.prototype['trackingReminderNotificationId'] = undefined;
  /**
   * UTC ISO 8601 `YYYY-MM-DDThh:mm:ss` timestamp for the specific time the variable should be tracked in UTC.  This will be used for the measurement startTime if the track endpoint is used.
   * @member {Date} reminderTime
   */
  exports.prototype['reminderTime'] = undefined;
  /**
   * UTC ISO 8601 `YYYY-MM-DDThh:mm:ss` timestamp for the specific time the variable should be tracked in UTC.  This will be used for the measurement startTime if the track endpoint is used.
   * @member {Date} trackingReminderNotificationTime
   */
  exports.prototype['trackingReminderNotificationTime'] = undefined;
  /**
   * Example: 10
   * @member {Number} defaultUnitId
   */
  exports.prototype['defaultUnitId'] = undefined;
  /**
   * Example: positive
   * @member {String} description
   */
  exports.prototype['description'] = undefined;
  /**
   * Example: 1
   * @member {Number} variableCategoryId
   */
  exports.prototype['variableCategoryId'] = undefined;
  /**
   * Example: positive
   * @member {String} valence
   */
  exports.prototype['valence'] = undefined;
  /**
   * Example: 3
   * @member {Number} mostCommonValue
   */
  exports.prototype['mostCommonValue'] = undefined;
  /**
   * Example: 4
   * @member {Number} secondMostCommonValue
   */
  exports.prototype['secondMostCommonValue'] = undefined;
  /**
   * Example: 2
   * @member {Number} thirdMostCommonValue
   */
  exports.prototype['thirdMostCommonValue'] = undefined;
  /**
   * Example: 3
   * @member {Number} lastValue
   */
  exports.prototype['lastValue'] = undefined;
  /**
   * Example: 1
   * @member {Number} secondToLastValue
   */
  exports.prototype['secondToLastValue'] = undefined;
  /**
   * Example: 2
   * @member {Number} thirdToLastValue
   */
  exports.prototype['thirdToLastValue'] = undefined;
  /**
   * Example: 10
   * @member {Number} userVariableDefaultUnitId
   */
  exports.prototype['userVariableDefaultUnitId'] = undefined;
  /**
   * Example: 1
   * @member {Number} userVariableVariableCategoryId
   */
  exports.prototype['userVariableVariableCategoryId'] = undefined;
  /**
   * Example: 5
   * @member {Number} numberOfUniqueValues
   */
  exports.prototype['numberOfUniqueValues'] = undefined;
  /**
   * Example: ion-happy-outline
   * @member {String} ionIcon
   */
  exports.prototype['ionIcon'] = undefined;
  /**
   * Example: https://app.quantimo.do/ionic/Modo/www/img/variable_categories/emotions.svg
   * @member {String} svgUrl
   */
  exports.prototype['svgUrl'] = undefined;
  /**
   * Example: https://app.quantimo.do/ionic/Modo/www/img/variable_categories/emotions.png
   * @member {String} pngUrl
   */
  exports.prototype['pngUrl'] = undefined;
  /**
   * Example: img/variable_categories/emotions.png
   * @member {String} pngPath
   */
  exports.prototype['pngPath'] = undefined;
  /**
   * Example: https://maxcdn.icons8.com/Color/PNG/96/Cinema/theatre_mask-96.png
   * @member {String} variableCategoryImageUrl
   */
  exports.prototype['variableCategoryImageUrl'] = undefined;
  /**
   * Example: 1
   * @member {Boolean} manualTracking
   */
  exports.prototype['manualTracking'] = undefined;
  /**
   * Example: Emotions
   * @member {String} userVariableVariableCategoryName
   */
  exports.prototype['userVariableVariableCategoryName'] = undefined;
  /**
   * Example: 1501534124
   * @member {Number} trackingReminderNotificationTimeEpoch
   */
  exports.prototype['trackingReminderNotificationTimeEpoch'] = undefined;
  /**
   * Example: 15:48:44
   * @member {String} trackingReminderNotificationTimeLocal
   */
  exports.prototype['trackingReminderNotificationTimeLocal'] = undefined;
  /**
   * Example: 3
   * @member {Number} lastValueInUserVariableDefaultUnit
   */
  exports.prototype['lastValueInUserVariableDefaultUnit'] = undefined;
  /**
   * Example: 1
   * @member {Number} secondToLastValueInUserVariableDefaultUnit
   */
  exports.prototype['secondToLastValueInUserVariableDefaultUnit'] = undefined;
  /**
   * Example: 2
   * @member {Number} thirdToLastValueInUserVariableDefaultUnit
   */
  exports.prototype['thirdToLastValueInUserVariableDefaultUnit'] = undefined;
  /**
   * Example: 3
   * @member {Number} mostCommonValueInUserVariableDefaultUnit
   */
  exports.prototype['mostCommonValueInUserVariableDefaultUnit'] = undefined;
  /**
   * Example: 4
   * @member {Number} secondMostCommonValueInUserVariableDefaultUnit
   */
  exports.prototype['secondMostCommonValueInUserVariableDefaultUnit'] = undefined;
  /**
   * Example: 2
   * @member {Number} thirdMostCommonValueInUserVariableDefaultUnit
   */
  exports.prototype['thirdMostCommonValueInUserVariableDefaultUnit'] = undefined;
  /**
   * Example: 10
   * @member {Number} unitId
   */
  exports.prototype['unitId'] = undefined;
  /**
   * Example: 1 to 5 Rating
   * @member {String} unitName
   */
  exports.prototype['unitName'] = undefined;
  /**
   * Example: 5
   * @member {Number} unitCategoryId
   */
  exports.prototype['unitCategoryId'] = undefined;
  /**
   * Example: Rating
   * @member {String} unitCategoryName
   */
  exports.prototype['unitCategoryName'] = undefined;
  /**
   * Example: 1 to 5 Rating
   * @member {String} defaultUnitName
   */
  exports.prototype['defaultUnitName'] = undefined;
  /**
   * Example: /5
   * @member {String} defaultUnitAbbreviatedName
   */
  exports.prototype['defaultUnitAbbreviatedName'] = undefined;
  /**
   * Example: 5
   * @member {Number} defaultUnitCategoryId
   */
  exports.prototype['defaultUnitCategoryId'] = undefined;
  /**
   * Example: Rating
   * @member {String} defaultUnitCategoryName
   */
  exports.prototype['defaultUnitCategoryName'] = undefined;
  /**
   * Example: 1 to 5 Rating
   * @member {String} userVariableDefaultUnitName
   */
  exports.prototype['userVariableDefaultUnitName'] = undefined;
  /**
   * Example: /5
   * @member {String} userVariableDefaultUnitAbbreviatedName
   */
  exports.prototype['userVariableDefaultUnitAbbreviatedName'] = undefined;
  /**
   * Example: 5
   * @member {Number} userVariableDefaultUnitCategoryId
   */
  exports.prototype['userVariableDefaultUnitCategoryId'] = undefined;
  /**
   * Example: Rating
   * @member {String} userVariableDefaultUnitCategoryName
   */
  exports.prototype['userVariableDefaultUnitCategoryName'] = undefined;
  /**
   * Example: 1
   * @member {Number} minimumAllowedValue
   */
  exports.prototype['minimumAllowedValue'] = undefined;
  /**
   * Example: 5
   * @member {Number} maximumAllowedValue
   */
  exports.prototype['maximumAllowedValue'] = undefined;
  /**
   * Example: happiestFaceIsFive
   * @member {String} inputType
   */
  exports.prototype['inputType'] = undefined;
  /**
   * Example: 3
   * @member {Number} total
   */
  exports.prototype['total'] = undefined;
  /**
   * Example: Rate Overall Mood
   * @member {String} title
   */
  exports.prototype['title'] = undefined;
  /**
   * Example: https://rximage.nlm.nih.gov/image/images/gallery/original/55111-0129-60_RXNAVIMAGE10_B051D81E.jpg
   * @member {String} trackingReminderImageUrl
   */
  exports.prototype['trackingReminderImageUrl'] = undefined;
  /**
   * Example: https://rximage.nlm.nih.gov/image/images/gallery/original/55111-0129-60_RXNAVIMAGE10_B051D81E.jpg
   * @member {String} imageUrl
   */
  exports.prototype['imageUrl'] = undefined;
  /**
   * Example: ion-sad-outline
   * @member {String} iconIcon
   */
  exports.prototype['iconIcon'] = undefined;
  /**
   * @member {Array.<module:model/Unit>} availableDefaultUnits
   */
  exports.prototype['availableDefaultUnits'] = undefined;
  /**
   * @member {Array.<module:model/TrackingReminderNotificationActionArray>} actionArray
   */
  exports.prototype['actionArray'] = undefined;
  /**
   * @member {Array.<module:model/TrackingReminderNotificationTrackAllAction>} trackAllActions
   */
  exports.prototype['trackAllActions'] = undefined;
  /**
   * Example: 0
   * @member {Number} fillingValue
   */
  exports.prototype['fillingValue'] = undefined;
  /**
   * Example: 
   * @member {Date} reminderEndTime
   */
  exports.prototype['reminderEndTime'] = undefined;
  /**
   * Example: 
   * @member {Date} notifiedAt
   */
  exports.prototype['notifiedAt'] = undefined;
  /**
   * Example: 
   * @member {String} variableImageUrl
   */
  exports.prototype['variableImageUrl'] = undefined;


  /**
   * Allowed values for the <code>combinationOperation</code> property.
   * @enum {String}
   * @readonly
   */
  exports.CombinationOperationEnum = {
    /**
     * value: "MEAN"
     * @const
     */
    "MEAN": "MEAN",
    /**
     * value: "SUM"
     * @const
     */
    "SUM": "SUM"  };


  return exports;
}));



},{"../ApiClient":16,"./TrackingReminderNotificationActionArray":79,"./TrackingReminderNotificationTrackAllAction":81,"./Unit":83}],79:[function(require,module,exports){
/**
 * quantimodo
 * QuantiModo makes it easy to retrieve normalized user data from a wide array of devices and applications. [Learn about QuantiModo](https://quantimo.do), check out our [docs](https://github.com/QuantiModo/docs) or contact us at [help.quantimo.do](https://help.quantimo.do).
 *
 * OpenAPI spec version: 5.8.728
 *
 * NOTE: This class is auto generated by the swagger code generator program.
 * https://github.com/swagger-api/swagger-codegen.git
 *
 * Swagger Codegen version: 2.2.3
 *
 * Do not edit the class manually.
 *
 */

(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define(['ApiClient'], factory);
  } else if (typeof module === 'object' && module.exports) {
    // CommonJS-like environments that support module.exports, like Node.
    module.exports = factory(require('../ApiClient'));
  } else {
    // Browser globals (root is window)
    if (!root.Quantimodo) {
      root.Quantimodo = {};
    }
    root.Quantimodo.TrackingReminderNotificationActionArray = factory(root.Quantimodo.ApiClient);
  }
}(this, function(ApiClient) {
  'use strict';




  /**
   * The TrackingReminderNotificationActionArray model module.
   * @module model/TrackingReminderNotificationActionArray
   * @version 5.8.807
   */

  /**
   * Constructs a new <code>TrackingReminderNotificationActionArray</code>.
   * @alias module:model/TrackingReminderNotificationActionArray
   * @class
   * @param title {String} Example: Rate 3/5
   * @param callback {String} Example: trackThreeRatingAction
   * @param modifiedValue {Number} Example: 3
   * @param action {String} Example: track
   */
  var exports = function(title, callback, modifiedValue, action) {
    var _this = this;

    _this['title'] = title;
    _this['callback'] = callback;
    _this['modifiedValue'] = modifiedValue;
    _this['action'] = action;
  };

  /**
   * Constructs a <code>TrackingReminderNotificationActionArray</code> from a plain JavaScript object, optionally creating a new instance.
   * Copies all relevant properties from <code>data</code> to <code>obj</code> if supplied or a new instance if not.
   * @param {Object} data The plain JavaScript object bearing properties of interest.
   * @param {module:model/TrackingReminderNotificationActionArray} obj Optional instance to populate.
   * @return {module:model/TrackingReminderNotificationActionArray} The populated <code>TrackingReminderNotificationActionArray</code> instance.
   */
  exports.constructFromObject = function(data, obj) {
    if (data) {
      obj = obj || new exports();

      if (data.hasOwnProperty('title')) {
        obj['title'] = ApiClient.convertToType(data['title'], 'String');
      }
      if (data.hasOwnProperty('callback')) {
        obj['callback'] = ApiClient.convertToType(data['callback'], 'String');
      }
      if (data.hasOwnProperty('modifiedValue')) {
        obj['modifiedValue'] = ApiClient.convertToType(data['modifiedValue'], 'Number');
      }
      if (data.hasOwnProperty('action')) {
        obj['action'] = ApiClient.convertToType(data['action'], 'String');
      }
    }
    return obj;
  }

  /**
   * Example: Rate 3/5
   * @member {String} title
   */
  exports.prototype['title'] = undefined;
  /**
   * Example: trackThreeRatingAction
   * @member {String} callback
   */
  exports.prototype['callback'] = undefined;
  /**
   * Example: 3
   * @member {Number} modifiedValue
   */
  exports.prototype['modifiedValue'] = undefined;
  /**
   * Example: track
   * @member {String} action
   */
  exports.prototype['action'] = undefined;



  return exports;
}));



},{"../ApiClient":16}],80:[function(require,module,exports){
/**
 * quantimodo
 * QuantiModo makes it easy to retrieve normalized user data from a wide array of devices and applications. [Learn about QuantiModo](https://quantimo.do), check out our [docs](https://github.com/QuantiModo/docs) or contact us at [help.quantimo.do](https://help.quantimo.do).
 *
 * OpenAPI spec version: 5.8.728
 *
 * NOTE: This class is auto generated by the swagger code generator program.
 * https://github.com/swagger-api/swagger-codegen.git
 *
 * Swagger Codegen version: 2.2.3
 *
 * Do not edit the class manually.
 *
 */

(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define(['ApiClient'], factory);
  } else if (typeof module === 'object' && module.exports) {
    // CommonJS-like environments that support module.exports, like Node.
    module.exports = factory(require('../ApiClient'));
  } else {
    // Browser globals (root is window)
    if (!root.Quantimodo) {
      root.Quantimodo = {};
    }
    root.Quantimodo.TrackingReminderNotificationPost = factory(root.Quantimodo.ApiClient);
  }
}(this, function(ApiClient) {
  'use strict';




  /**
   * The TrackingReminderNotificationPost model module.
   * @module model/TrackingReminderNotificationPost
   * @version 5.8.807
   */

  /**
   * Constructs a new <code>TrackingReminderNotificationPost</code>.
   * @alias module:model/TrackingReminderNotificationPost
   * @class
   * @param id {Number} Id of the TrackingReminderNotification
   * @param action {module:model/TrackingReminderNotificationPost.ActionEnum} track records a measurement for the notification.  snooze changes the notification to 1 hour from now. skip deletes the notification.
   */
  var exports = function(id, action) {
    var _this = this;

    _this['id'] = id;

    _this['action'] = action;
  };

  /**
   * Constructs a <code>TrackingReminderNotificationPost</code> from a plain JavaScript object, optionally creating a new instance.
   * Copies all relevant properties from <code>data</code> to <code>obj</code> if supplied or a new instance if not.
   * @param {Object} data The plain JavaScript object bearing properties of interest.
   * @param {module:model/TrackingReminderNotificationPost} obj Optional instance to populate.
   * @return {module:model/TrackingReminderNotificationPost} The populated <code>TrackingReminderNotificationPost</code> instance.
   */
  exports.constructFromObject = function(data, obj) {
    if (data) {
      obj = obj || new exports();

      if (data.hasOwnProperty('id')) {
        obj['id'] = ApiClient.convertToType(data['id'], 'Number');
      }
      if (data.hasOwnProperty('modifiedValue')) {
        obj['modifiedValue'] = ApiClient.convertToType(data['modifiedValue'], 'Number');
      }
      if (data.hasOwnProperty('action')) {
        obj['action'] = ApiClient.convertToType(data['action'], 'String');
      }
    }
    return obj;
  }

  /**
   * Id of the TrackingReminderNotification
   * @member {Number} id
   */
  exports.prototype['id'] = undefined;
  /**
   * Optional value to be recorded instead of the tracking reminder default value
   * @member {Number} modifiedValue
   */
  exports.prototype['modifiedValue'] = undefined;
  /**
   * track records a measurement for the notification.  snooze changes the notification to 1 hour from now. skip deletes the notification.
   * @member {module:model/TrackingReminderNotificationPost.ActionEnum} action
   */
  exports.prototype['action'] = undefined;


  /**
   * Allowed values for the <code>action</code> property.
   * @enum {String}
   * @readonly
   */
  exports.ActionEnum = {
    /**
     * value: "track"
     * @const
     */
    "track": "track",
    /**
     * value: "snooze"
     * @const
     */
    "snooze": "snooze",
    /**
     * value: "skip"
     * @const
     */
    "skip": "skip"  };


  return exports;
}));



},{"../ApiClient":16}],81:[function(require,module,exports){
/**
 * quantimodo
 * QuantiModo makes it easy to retrieve normalized user data from a wide array of devices and applications. [Learn about QuantiModo](https://quantimo.do), check out our [docs](https://github.com/QuantiModo/docs) or contact us at [help.quantimo.do](https://help.quantimo.do).
 *
 * OpenAPI spec version: 5.8.728
 *
 * NOTE: This class is auto generated by the swagger code generator program.
 * https://github.com/swagger-api/swagger-codegen.git
 *
 * Swagger Codegen version: 2.2.3
 *
 * Do not edit the class manually.
 *
 */

(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define(['ApiClient'], factory);
  } else if (typeof module === 'object' && module.exports) {
    // CommonJS-like environments that support module.exports, like Node.
    module.exports = factory(require('../ApiClient'));
  } else {
    // Browser globals (root is window)
    if (!root.Quantimodo) {
      root.Quantimodo = {};
    }
    root.Quantimodo.TrackingReminderNotificationTrackAllAction = factory(root.Quantimodo.ApiClient);
  }
}(this, function(ApiClient) {
  'use strict';




  /**
   * The TrackingReminderNotificationTrackAllAction model module.
   * @module model/TrackingReminderNotificationTrackAllAction
   * @version 5.8.807
   */

  /**
   * Constructs a new <code>TrackingReminderNotificationTrackAllAction</code>.
   * @alias module:model/TrackingReminderNotificationTrackAllAction
   * @class
   * @param title {String} Example: Rate 3/5 for all
   * @param callback {String} Example: trackThreeRatingAction
   * @param modifiedValue {Number} Example: 3
   * @param action {String} Example: trackAll
   */
  var exports = function(title, callback, modifiedValue, action) {
    var _this = this;

    _this['title'] = title;
    _this['callback'] = callback;
    _this['modifiedValue'] = modifiedValue;
    _this['action'] = action;
  };

  /**
   * Constructs a <code>TrackingReminderNotificationTrackAllAction</code> from a plain JavaScript object, optionally creating a new instance.
   * Copies all relevant properties from <code>data</code> to <code>obj</code> if supplied or a new instance if not.
   * @param {Object} data The plain JavaScript object bearing properties of interest.
   * @param {module:model/TrackingReminderNotificationTrackAllAction} obj Optional instance to populate.
   * @return {module:model/TrackingReminderNotificationTrackAllAction} The populated <code>TrackingReminderNotificationTrackAllAction</code> instance.
   */
  exports.constructFromObject = function(data, obj) {
    if (data) {
      obj = obj || new exports();

      if (data.hasOwnProperty('title')) {
        obj['title'] = ApiClient.convertToType(data['title'], 'String');
      }
      if (data.hasOwnProperty('callback')) {
        obj['callback'] = ApiClient.convertToType(data['callback'], 'String');
      }
      if (data.hasOwnProperty('modifiedValue')) {
        obj['modifiedValue'] = ApiClient.convertToType(data['modifiedValue'], 'Number');
      }
      if (data.hasOwnProperty('action')) {
        obj['action'] = ApiClient.convertToType(data['action'], 'String');
      }
    }
    return obj;
  }

  /**
   * Example: Rate 3/5 for all
   * @member {String} title
   */
  exports.prototype['title'] = undefined;
  /**
   * Example: trackThreeRatingAction
   * @member {String} callback
   */
  exports.prototype['callback'] = undefined;
  /**
   * Example: 3
   * @member {Number} modifiedValue
   */
  exports.prototype['modifiedValue'] = undefined;
  /**
   * Example: trackAll
   * @member {String} action
   */
  exports.prototype['action'] = undefined;



  return exports;
}));



},{"../ApiClient":16}],82:[function(require,module,exports){
/**
 * quantimodo
 * QuantiModo makes it easy to retrieve normalized user data from a wide array of devices and applications. [Learn about QuantiModo](https://quantimo.do), check out our [docs](https://github.com/QuantiModo/docs) or contact us at [help.quantimo.do](https://help.quantimo.do).
 *
 * OpenAPI spec version: 5.8.728
 *
 * NOTE: This class is auto generated by the swagger code generator program.
 * https://github.com/swagger-api/swagger-codegen.git
 *
 * Swagger Codegen version: 2.2.3
 *
 * Do not edit the class manually.
 *
 */

(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define(['ApiClient', 'model/TrackingReminderNotification'], factory);
  } else if (typeof module === 'object' && module.exports) {
    // CommonJS-like environments that support module.exports, like Node.
    module.exports = factory(require('../ApiClient'), require('./TrackingReminderNotification'));
  } else {
    // Browser globals (root is window)
    if (!root.Quantimodo) {
      root.Quantimodo = {};
    }
    root.Quantimodo.TrackingReminderNotificationsArray = factory(root.Quantimodo.ApiClient, root.Quantimodo.TrackingReminderNotification);
  }
}(this, function(ApiClient, TrackingReminderNotification) {
  'use strict';




  /**
   * The TrackingReminderNotificationsArray model module.
   * @module model/TrackingReminderNotificationsArray
   * @version 5.8.807
   */

  /**
   * Constructs a new <code>TrackingReminderNotificationsArray</code>.
   * @alias module:model/TrackingReminderNotificationsArray
   * @class
   * @extends Array
   */
  var exports = function() {
    var _this = this;
    _this = new Array();
    Object.setPrototypeOf(_this, exports);

    return _this;
  };

  /**
   * Constructs a <code>TrackingReminderNotificationsArray</code> from a plain JavaScript object, optionally creating a new instance.
   * Copies all relevant properties from <code>data</code> to <code>obj</code> if supplied or a new instance if not.
   * @param {Object} data The plain JavaScript object bearing properties of interest.
   * @param {module:model/TrackingReminderNotificationsArray} obj Optional instance to populate.
   * @return {module:model/TrackingReminderNotificationsArray} The populated <code>TrackingReminderNotificationsArray</code> instance.
   */
  exports.constructFromObject = function(data, obj) {
    if (data) {
      obj = obj || new exports();
      ApiClient.constructFromObject(data, obj, 'TrackingReminderNotification');

    }
    return obj;
  }




  return exports;
}));



},{"../ApiClient":16,"./TrackingReminderNotification":78}],83:[function(require,module,exports){
/**
 * quantimodo
 * QuantiModo makes it easy to retrieve normalized user data from a wide array of devices and applications. [Learn about QuantiModo](https://quantimo.do), check out our [docs](https://github.com/QuantiModo/docs) or contact us at [help.quantimo.do](https://help.quantimo.do).
 *
 * OpenAPI spec version: 5.8.728
 *
 * NOTE: This class is auto generated by the swagger code generator program.
 * https://github.com/swagger-api/swagger-codegen.git
 *
 * Swagger Codegen version: 2.2.3
 *
 * Do not edit the class manually.
 *
 */

(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define(['ApiClient', 'model/ConversionStep', 'model/UnitCategory'], factory);
  } else if (typeof module === 'object' && module.exports) {
    // CommonJS-like environments that support module.exports, like Node.
    module.exports = factory(require('../ApiClient'), require('./ConversionStep'), require('./UnitCategory'));
  } else {
    // Browser globals (root is window)
    if (!root.Quantimodo) {
      root.Quantimodo = {};
    }
    root.Quantimodo.Unit = factory(root.Quantimodo.ApiClient, root.Quantimodo.ConversionStep, root.Quantimodo.UnitCategory);
  }
}(this, function(ApiClient, ConversionStep, UnitCategory) {
  'use strict';




  /**
   * The Unit model module.
   * @module model/Unit
   * @version 5.8.807
   */

  /**
   * Constructs a new <code>Unit</code>.
   * @alias module:model/Unit
   * @class
   * @param name {String} Unit name
   * @param abbreviatedName {String} Unit abbreviation
   * @param category {module:model/Unit.CategoryEnum} Unit category
   * @param conversionSteps {Array.<module:model/ConversionStep>} Conversion steps list
   * @param unitCategory {module:model/UnitCategory} 
   * @param maximumValue {Number} Example: 4
   */
  var exports = function(name, abbreviatedName, category, conversionSteps, unitCategory, maximumValue) {
    var _this = this;

    _this['name'] = name;
    _this['abbreviatedName'] = abbreviatedName;
    _this['category'] = category;


    _this['conversionSteps'] = conversionSteps;






    _this['unitCategory'] = unitCategory;
    _this['maximumValue'] = maximumValue;
  };

  /**
   * Constructs a <code>Unit</code> from a plain JavaScript object, optionally creating a new instance.
   * Copies all relevant properties from <code>data</code> to <code>obj</code> if supplied or a new instance if not.
   * @param {Object} data The plain JavaScript object bearing properties of interest.
   * @param {module:model/Unit} obj Optional instance to populate.
   * @return {module:model/Unit} The populated <code>Unit</code> instance.
   */
  exports.constructFromObject = function(data, obj) {
    if (data) {
      obj = obj || new exports();

      if (data.hasOwnProperty('name')) {
        obj['name'] = ApiClient.convertToType(data['name'], 'String');
      }
      if (data.hasOwnProperty('abbreviatedName')) {
        obj['abbreviatedName'] = ApiClient.convertToType(data['abbreviatedName'], 'String');
      }
      if (data.hasOwnProperty('category')) {
        obj['category'] = ApiClient.convertToType(data['category'], 'String');
      }
      if (data.hasOwnProperty('minimumAllowedValue')) {
        obj['minimumAllowedValue'] = ApiClient.convertToType(data['minimumAllowedValue'], 'Number');
      }
      if (data.hasOwnProperty('maximumAllowedValue')) {
        obj['maximumAllowedValue'] = ApiClient.convertToType(data['maximumAllowedValue'], 'Number');
      }
      if (data.hasOwnProperty('conversionSteps')) {
        obj['conversionSteps'] = ApiClient.convertToType(data['conversionSteps'], [ConversionStep]);
      }
      if (data.hasOwnProperty('id')) {
        obj['id'] = ApiClient.convertToType(data['id'], 'Number');
      }
      if (data.hasOwnProperty('categoryName')) {
        obj['categoryName'] = ApiClient.convertToType(data['categoryName'], 'String');
      }
      if (data.hasOwnProperty('categoryId')) {
        obj['categoryId'] = ApiClient.convertToType(data['categoryId'], 'Number');
      }
      if (data.hasOwnProperty('advanced')) {
        obj['advanced'] = ApiClient.convertToType(data['advanced'], 'Number');
      }
      if (data.hasOwnProperty('minimumValue')) {
        obj['minimumValue'] = ApiClient.convertToType(data['minimumValue'], 'Number');
      }
      if (data.hasOwnProperty('manualTracking')) {
        obj['manualTracking'] = ApiClient.convertToType(data['manualTracking'], 'Number');
      }
      if (data.hasOwnProperty('unitCategory')) {
        obj['unitCategory'] = UnitCategory.constructFromObject(data['unitCategory']);
      }
      if (data.hasOwnProperty('maximumValue')) {
        obj['maximumValue'] = ApiClient.convertToType(data['maximumValue'], 'Number');
      }
    }
    return obj;
  }

  /**
   * Unit name
   * @member {String} name
   */
  exports.prototype['name'] = undefined;
  /**
   * Unit abbreviation
   * @member {String} abbreviatedName
   */
  exports.prototype['abbreviatedName'] = undefined;
  /**
   * Unit category
   * @member {module:model/Unit.CategoryEnum} category
   */
  exports.prototype['category'] = undefined;
  /**
   * The minimum allowed value for measurements. While you can record a value below this minimum, it will be excluded from the correlation analysis.
   * @member {Number} minimumAllowedValue
   */
  exports.prototype['minimumAllowedValue'] = undefined;
  /**
   * The maximum allowed value for measurements. While you can record a value above this maximum, it will be excluded from the correlation analysis.
   * @member {Number} maximumAllowedValue
   */
  exports.prototype['maximumAllowedValue'] = undefined;
  /**
   * Conversion steps list
   * @member {Array.<module:model/ConversionStep>} conversionSteps
   */
  exports.prototype['conversionSteps'] = undefined;
  /**
   * Example: 29
   * @member {Number} id
   */
  exports.prototype['id'] = undefined;
  /**
   * Example: Miscellany
   * @member {String} categoryName
   */
  exports.prototype['categoryName'] = undefined;
  /**
   * Example: 6
   * @member {Number} categoryId
   */
  exports.prototype['categoryId'] = undefined;
  /**
   * Example: 1
   * @member {Number} advanced
   */
  exports.prototype['advanced'] = undefined;
  /**
   * Example: 0
   * @member {Number} minimumValue
   */
  exports.prototype['minimumValue'] = undefined;
  /**
   * Example: 0
   * @member {Number} manualTracking
   */
  exports.prototype['manualTracking'] = undefined;
  /**
   * @member {module:model/UnitCategory} unitCategory
   */
  exports.prototype['unitCategory'] = undefined;
  /**
   * Example: 4
   * @member {Number} maximumValue
   */
  exports.prototype['maximumValue'] = undefined;


  /**
   * Allowed values for the <code>category</code> property.
   * @enum {String}
   * @readonly
   */
  exports.CategoryEnum = {
    /**
     * value: "Distance"
     * @const
     */
    "Distance": "Distance",
    /**
     * value: "Duration"
     * @const
     */
    "Duration": "Duration",
    /**
     * value: "Energy"
     * @const
     */
    "Energy": "Energy",
    /**
     * value: "Frequency"
     * @const
     */
    "Frequency": "Frequency",
    /**
     * value: "Miscellany"
     * @const
     */
    "Miscellany": "Miscellany",
    /**
     * value: "Pressure"
     * @const
     */
    "Pressure": "Pressure",
    /**
     * value: "Proportion"
     * @const
     */
    "Proportion": "Proportion",
    /**
     * value: "Rating"
     * @const
     */
    "Rating": "Rating",
    /**
     * value: "Temperature"
     * @const
     */
    "Temperature": "Temperature",
    /**
     * value: "Volume"
     * @const
     */
    "Volume": "Volume",
    /**
     * value: "Weight"
     * @const
     */
    "Weight": "Weight"  };


  return exports;
}));



},{"../ApiClient":16,"./ConversionStep":38,"./UnitCategory":84}],84:[function(require,module,exports){
/**
 * quantimodo
 * QuantiModo makes it easy to retrieve normalized user data from a wide array of devices and applications. [Learn about QuantiModo](https://quantimo.do), check out our [docs](https://github.com/QuantiModo/docs) or contact us at [help.quantimo.do](https://help.quantimo.do).
 *
 * OpenAPI spec version: 5.8.728
 *
 * NOTE: This class is auto generated by the swagger code generator program.
 * https://github.com/swagger-api/swagger-codegen.git
 *
 * Swagger Codegen version: 2.2.3
 *
 * Do not edit the class manually.
 *
 */

(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define(['ApiClient'], factory);
  } else if (typeof module === 'object' && module.exports) {
    // CommonJS-like environments that support module.exports, like Node.
    module.exports = factory(require('../ApiClient'));
  } else {
    // Browser globals (root is window)
    if (!root.Quantimodo) {
      root.Quantimodo = {};
    }
    root.Quantimodo.UnitCategory = factory(root.Quantimodo.ApiClient);
  }
}(this, function(ApiClient) {
  'use strict';




  /**
   * The UnitCategory model module.
   * @module model/UnitCategory
   * @version 5.8.807
   */

  /**
   * Constructs a new <code>UnitCategory</code>.
   * @alias module:model/UnitCategory
   * @class
   * @param name {String} Category name
   */
  var exports = function(name) {
    var _this = this;


    _this['name'] = name;

  };

  /**
   * Constructs a <code>UnitCategory</code> from a plain JavaScript object, optionally creating a new instance.
   * Copies all relevant properties from <code>data</code> to <code>obj</code> if supplied or a new instance if not.
   * @param {Object} data The plain JavaScript object bearing properties of interest.
   * @param {module:model/UnitCategory} obj Optional instance to populate.
   * @return {module:model/UnitCategory} The populated <code>UnitCategory</code> instance.
   */
  exports.constructFromObject = function(data, obj) {
    if (data) {
      obj = obj || new exports();

      if (data.hasOwnProperty('id')) {
        obj['id'] = ApiClient.convertToType(data['id'], 'Number');
      }
      if (data.hasOwnProperty('name')) {
        obj['name'] = ApiClient.convertToType(data['name'], 'String');
      }
      if (data.hasOwnProperty('standardUnitAbbreviatedName')) {
        obj['standardUnitAbbreviatedName'] = ApiClient.convertToType(data['standardUnitAbbreviatedName'], 'String');
      }
    }
    return obj;
  }

  /**
   * id
   * @member {Number} id
   */
  exports.prototype['id'] = undefined;
  /**
   * Category name
   * @member {String} name
   */
  exports.prototype['name'] = undefined;
  /**
   * Base unit for in which measurements are to be converted to and stored
   * @member {String} standardUnitAbbreviatedName
   */
  exports.prototype['standardUnitAbbreviatedName'] = undefined;



  return exports;
}));



},{"../ApiClient":16}],85:[function(require,module,exports){
/**
 * quantimodo
 * QuantiModo makes it easy to retrieve normalized user data from a wide array of devices and applications. [Learn about QuantiModo](https://quantimo.do), check out our [docs](https://github.com/QuantiModo/docs) or contact us at [help.quantimo.do](https://help.quantimo.do).
 *
 * OpenAPI spec version: 5.8.728
 *
 * NOTE: This class is auto generated by the swagger code generator program.
 * https://github.com/swagger-api/swagger-codegen.git
 *
 * Swagger Codegen version: 2.2.3
 *
 * Do not edit the class manually.
 *
 */

(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define(['ApiClient'], factory);
  } else if (typeof module === 'object' && module.exports) {
    // CommonJS-like environments that support module.exports, like Node.
    module.exports = factory(require('../ApiClient'));
  } else {
    // Browser globals (root is window)
    if (!root.Quantimodo) {
      root.Quantimodo = {};
    }
    root.Quantimodo.User = factory(root.Quantimodo.ApiClient);
  }
}(this, function(ApiClient) {
  'use strict';




  /**
   * The User model module.
   * @module model/User
   * @version 5.8.807
   */

  /**
   * Constructs a new <code>User</code>.
   * @alias module:model/User
   * @class
   * @param id {Number} User id
   * @param displayName {String} User display name
   * @param loginName {String} User login name
   * @param email {String} User email
   * @param accessToken {String} User access token
   * @param administrator {Boolean} Is user administrator
   */
  var exports = function(id, displayName, loginName, email, accessToken, administrator) {
    var _this = this;

    _this['id'] = id;
    _this['displayName'] = displayName;
    _this['loginName'] = loginName;
    _this['email'] = email;
    _this['accessToken'] = accessToken;
    _this['administrator'] = administrator;

























  };

  /**
   * Constructs a <code>User</code> from a plain JavaScript object, optionally creating a new instance.
   * Copies all relevant properties from <code>data</code> to <code>obj</code> if supplied or a new instance if not.
   * @param {Object} data The plain JavaScript object bearing properties of interest.
   * @param {module:model/User} obj Optional instance to populate.
   * @return {module:model/User} The populated <code>User</code> instance.
   */
  exports.constructFromObject = function(data, obj) {
    if (data) {
      obj = obj || new exports();

      if (data.hasOwnProperty('id')) {
        obj['id'] = ApiClient.convertToType(data['id'], 'Number');
      }
      if (data.hasOwnProperty('displayName')) {
        obj['displayName'] = ApiClient.convertToType(data['displayName'], 'String');
      }
      if (data.hasOwnProperty('loginName')) {
        obj['loginName'] = ApiClient.convertToType(data['loginName'], 'String');
      }
      if (data.hasOwnProperty('email')) {
        obj['email'] = ApiClient.convertToType(data['email'], 'String');
      }
      if (data.hasOwnProperty('accessToken')) {
        obj['accessToken'] = ApiClient.convertToType(data['accessToken'], 'String');
      }
      if (data.hasOwnProperty('administrator')) {
        obj['administrator'] = ApiClient.convertToType(data['administrator'], 'Boolean');
      }
      if (data.hasOwnProperty('clientId')) {
        obj['clientId'] = ApiClient.convertToType(data['clientId'], 'String');
      }
      if (data.hasOwnProperty('earliestReminderTime')) {
        obj['earliestReminderTime'] = ApiClient.convertToType(data['earliestReminderTime'], 'Date');
      }
      if (data.hasOwnProperty('lastFour')) {
        obj['lastFour'] = ApiClient.convertToType(data['lastFour'], 'String');
      }
      if (data.hasOwnProperty('latestReminderTime')) {
        obj['latestReminderTime'] = ApiClient.convertToType(data['latestReminderTime'], 'String');
      }
      if (data.hasOwnProperty('clientUserId')) {
        obj['clientUserId'] = ApiClient.convertToType(data['clientUserId'], 'String');
      }
      if (data.hasOwnProperty('pushNotificationsEnabled')) {
        obj['pushNotificationsEnabled'] = ApiClient.convertToType(data['pushNotificationsEnabled'], 'Boolean');
      }
      if (data.hasOwnProperty('roles')) {
        obj['roles'] = ApiClient.convertToType(data['roles'], 'String');
      }
      if (data.hasOwnProperty('sendPredictorEmails')) {
        obj['sendPredictorEmails'] = ApiClient.convertToType(data['sendPredictorEmails'], 'Boolean');
      }
      if (data.hasOwnProperty('sendReminderNotificationEmails')) {
        obj['sendReminderNotificationEmails'] = ApiClient.convertToType(data['sendReminderNotificationEmails'], 'Boolean');
      }
      if (data.hasOwnProperty('stripeId')) {
        obj['stripeId'] = ApiClient.convertToType(data['stripeId'], 'String');
      }
      if (data.hasOwnProperty('stripePlan')) {
        obj['stripePlan'] = ApiClient.convertToType(data['stripePlan'], 'String');
      }
      if (data.hasOwnProperty('stripeSubscription')) {
        obj['stripeSubscription'] = ApiClient.convertToType(data['stripeSubscription'], 'String');
      }
      if (data.hasOwnProperty('subscriptionProvider')) {
        obj['subscriptionProvider'] = ApiClient.convertToType(data['subscriptionProvider'], 'String');
      }
      if (data.hasOwnProperty('timeZoneOffset')) {
        obj['timeZoneOffset'] = ApiClient.convertToType(data['timeZoneOffset'], 'Number');
      }
      if (data.hasOwnProperty('password')) {
        obj['password'] = ApiClient.convertToType(data['password'], 'String');
      }
      if (data.hasOwnProperty('avatar')) {
        obj['avatar'] = ApiClient.convertToType(data['avatar'], 'String');
      }
      if (data.hasOwnProperty('userRegistered')) {
        obj['userRegistered'] = ApiClient.convertToType(data['userRegistered'], 'Date');
      }
      if (data.hasOwnProperty('userUrl')) {
        obj['userUrl'] = ApiClient.convertToType(data['userUrl'], 'String');
      }
      if (data.hasOwnProperty('capabilities')) {
        obj['capabilities'] = ApiClient.convertToType(data['capabilities'], 'String');
      }
      if (data.hasOwnProperty('firstName')) {
        obj['firstName'] = ApiClient.convertToType(data['firstName'], 'String');
      }
      if (data.hasOwnProperty('lastName')) {
        obj['lastName'] = ApiClient.convertToType(data['lastName'], 'String');
      }
      if (data.hasOwnProperty('trackLocation')) {
        obj['trackLocation'] = ApiClient.convertToType(data['trackLocation'], 'Boolean');
      }
      if (data.hasOwnProperty('combineNotifications')) {
        obj['combineNotifications'] = ApiClient.convertToType(data['combineNotifications'], 'Boolean');
      }
      if (data.hasOwnProperty('avatarImage')) {
        obj['avatarImage'] = ApiClient.convertToType(data['avatarImage'], 'String');
      }
      if (data.hasOwnProperty('stripeActive')) {
        obj['stripeActive'] = ApiClient.convertToType(data['stripeActive'], 'Boolean');
      }
    }
    return obj;
  }

  /**
   * User id
   * @member {Number} id
   */
  exports.prototype['id'] = undefined;
  /**
   * User display name
   * @member {String} displayName
   */
  exports.prototype['displayName'] = undefined;
  /**
   * User login name
   * @member {String} loginName
   */
  exports.prototype['loginName'] = undefined;
  /**
   * User email
   * @member {String} email
   */
  exports.prototype['email'] = undefined;
  /**
   * User access token
   * @member {String} accessToken
   */
  exports.prototype['accessToken'] = undefined;
  /**
   * Is user administrator
   * @member {Boolean} administrator
   */
  exports.prototype['administrator'] = undefined;
  /**
   * Example: quantimodo
   * @member {String} clientId
   */
  exports.prototype['clientId'] = undefined;
  /**
   * Earliest time user should get notifications. Example: 05:00:00
   * @member {Date} earliestReminderTime
   */
  exports.prototype['earliestReminderTime'] = undefined;
  /**
   * Example: 2009
   * @member {String} lastFour
   */
  exports.prototype['lastFour'] = undefined;
  /**
   * Latest time user should get notifications. Example: 23:00:00
   * @member {String} latestReminderTime
   */
  exports.prototype['latestReminderTime'] = undefined;
  /**
   * Example: 118444693184829555362
   * @member {String} clientUserId
   */
  exports.prototype['clientUserId'] = undefined;
  /**
   * Example: 1
   * @member {Boolean} pushNotificationsEnabled
   */
  exports.prototype['pushNotificationsEnabled'] = undefined;
  /**
   * Example: [\"admin\"]
   * @member {String} roles
   */
  exports.prototype['roles'] = undefined;
  /**
   * Example: 1
   * @member {Boolean} sendPredictorEmails
   */
  exports.prototype['sendPredictorEmails'] = undefined;
  /**
   * Example: 1
   * @member {Boolean} sendReminderNotificationEmails
   */
  exports.prototype['sendReminderNotificationEmails'] = undefined;
  /**
   * Example: cus_A8CEmcvl8jwLhV
   * @member {String} stripeId
   */
  exports.prototype['stripeId'] = undefined;
  /**
   * Example: monthly7
   * @member {String} stripePlan
   */
  exports.prototype['stripePlan'] = undefined;
  /**
   * Example: sub_ANTx3nOE7nzjQf
   * @member {String} stripeSubscription
   */
  exports.prototype['stripeSubscription'] = undefined;
  /**
   * Example: google
   * @member {String} subscriptionProvider
   */
  exports.prototype['subscriptionProvider'] = undefined;
  /**
   * Example: 300
   * @member {Number} timeZoneOffset
   */
  exports.prototype['timeZoneOffset'] = undefined;
  /**
   * Example: PASSWORD
   * @member {String} password
   */
  exports.prototype['password'] = undefined;
  /**
   * Example: https://lh6.googleusercontent.com/-BHr4hyUWqZU/AAAAAAAAAAI/AAAAAAAIG28/2Lv0en738II/photo.jpg?sz=50
   * @member {String} avatar
   */
  exports.prototype['avatar'] = undefined;
  /**
   * Example: 2013-12-03 15:25:13
   * @member {Date} userRegistered
   */
  exports.prototype['userRegistered'] = undefined;
  /**
   * Example: https://plus.google.com/+MikeSinn
   * @member {String} userUrl
   */
  exports.prototype['userUrl'] = undefined;
  /**
   * Example: a:1:{s:13:\"administrator\";b:1;}
   * @member {String} capabilities
   */
  exports.prototype['capabilities'] = undefined;
  /**
   * Example: Mike
   * @member {String} firstName
   */
  exports.prototype['firstName'] = undefined;
  /**
   * Example: Sinn
   * @member {String} lastName
   */
  exports.prototype['lastName'] = undefined;
  /**
   * Example: 1
   * @member {Boolean} trackLocation
   */
  exports.prototype['trackLocation'] = undefined;
  /**
   * Example: 1
   * @member {Boolean} combineNotifications
   */
  exports.prototype['combineNotifications'] = undefined;
  /**
   * Example: https://lh6.googleusercontent.com/-BHr4hyUWqZU/AAAAAAAAAAI/AAAAAAAIG28/2Lv0en738II/photo.jpg?sz=50
   * @member {String} avatarImage
   */
  exports.prototype['avatarImage'] = undefined;
  /**
   * Example: 1
   * @member {Boolean} stripeActive
   */
  exports.prototype['stripeActive'] = undefined;



  return exports;
}));



},{"../ApiClient":16}],86:[function(require,module,exports){
/**
 * quantimodo
 * QuantiModo makes it easy to retrieve normalized user data from a wide array of devices and applications. [Learn about QuantiModo](https://quantimo.do), check out our [docs](https://github.com/QuantiModo/docs) or contact us at [help.quantimo.do](https://help.quantimo.do).
 *
 * OpenAPI spec version: 5.8.728
 *
 * NOTE: This class is auto generated by the swagger code generator program.
 * https://github.com/swagger-api/swagger-codegen.git
 *
 * Swagger Codegen version: 2.2.3
 *
 * Do not edit the class manually.
 *
 */

(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define(['ApiClient'], factory);
  } else if (typeof module === 'object' && module.exports) {
    // CommonJS-like environments that support module.exports, like Node.
    module.exports = factory(require('../ApiClient'));
  } else {
    // Browser globals (root is window)
    if (!root.Quantimodo) {
      root.Quantimodo = {};
    }
    root.Quantimodo.UserCorrelation = factory(root.Quantimodo.ApiClient);
  }
}(this, function(ApiClient) {
  'use strict';




  /**
   * The UserCorrelation model module.
   * @module model/UserCorrelation
   * @version 5.8.807
   */

  /**
   * Constructs a new <code>UserCorrelation</code>.
   * @alias module:model/UserCorrelation
   * @class
   * @param cause {String} Variable name of the cause variable for which the user desires correlations.
   * @param correlationCoefficient {Number} Pearson correlation coefficient between cause and effect measurements
   * @param durationOfAction {Number} The amount of time over which a predictor/stimulus event can exert an observable influence on an outcome variable value. For instance, aspirin (stimulus/predictor) typically decreases headache severity for approximately four hours (duration of action) following the onset delay.
   * @param effect {String} Variable name of the effect variable for which the user desires correlations.
   * @param numberOfPairs {Number} Number of points that went into the correlation calculation
   * @param onsetDelay {Number} The amount of time in seconds that elapses after the predictor/stimulus event before the outcome as perceived by a self-tracker is known as the onset delay. For example, the onset delay between the time a person takes an aspirin (predictor/stimulus event) and the time a person perceives a change in their headache severity (outcome) is approximately 30 minutes.
   * @param timestamp {Number} Time at which correlation was calculated
   */
  var exports = function(cause, correlationCoefficient, durationOfAction, effect, numberOfPairs, onsetDelay, timestamp) {
    var _this = this;










    _this['cause'] = cause;









    _this['correlationCoefficient'] = correlationCoefficient;



    _this['durationOfAction'] = durationOfAction;
    _this['effect'] = effect;








    _this['numberOfPairs'] = numberOfPairs;
    _this['onsetDelay'] = onsetDelay;





















    _this['timestamp'] = timestamp;




























































  };

  /**
   * Constructs a <code>UserCorrelation</code> from a plain JavaScript object, optionally creating a new instance.
   * Copies all relevant properties from <code>data</code> to <code>obj</code> if supplied or a new instance if not.
   * @param {Object} data The plain JavaScript object bearing properties of interest.
   * @param {module:model/UserCorrelation} obj Optional instance to populate.
   * @return {module:model/UserCorrelation} The populated <code>UserCorrelation</code> instance.
   */
  exports.constructFromObject = function(data, obj) {
    if (data) {
      obj = obj || new exports();

      if (data.hasOwnProperty('averageDailyLowCause')) {
        obj['averageDailyLowCause'] = ApiClient.convertToType(data['averageDailyLowCause'], 'Number');
      }
      if (data.hasOwnProperty('averageDailyHighCause')) {
        obj['averageDailyHighCause'] = ApiClient.convertToType(data['averageDailyHighCause'], 'Number');
      }
      if (data.hasOwnProperty('averageEffect')) {
        obj['averageEffect'] = ApiClient.convertToType(data['averageEffect'], 'Number');
      }
      if (data.hasOwnProperty('averageEffectFollowingHighCause')) {
        obj['averageEffectFollowingHighCause'] = ApiClient.convertToType(data['averageEffectFollowingHighCause'], 'Number');
      }
      if (data.hasOwnProperty('averageEffectFollowingLowCause')) {
        obj['averageEffectFollowingLowCause'] = ApiClient.convertToType(data['averageEffectFollowingLowCause'], 'Number');
      }
      if (data.hasOwnProperty('averageEffectFollowingHighCauseExplanation')) {
        obj['averageEffectFollowingHighCauseExplanation'] = ApiClient.convertToType(data['averageEffectFollowingHighCauseExplanation'], 'String');
      }
      if (data.hasOwnProperty('averageEffectFollowingLowCauseExplanation')) {
        obj['averageEffectFollowingLowCauseExplanation'] = ApiClient.convertToType(data['averageEffectFollowingLowCauseExplanation'], 'String');
      }
      if (data.hasOwnProperty('averageVote')) {
        obj['averageVote'] = ApiClient.convertToType(data['averageVote'], 'Number');
      }
      if (data.hasOwnProperty('causalityFactor')) {
        obj['causalityFactor'] = ApiClient.convertToType(data['causalityFactor'], 'Number');
      }
      if (data.hasOwnProperty('cause')) {
        obj['cause'] = ApiClient.convertToType(data['cause'], 'String');
      }
      if (data.hasOwnProperty('causeVariableCategoryName')) {
        obj['causeVariableCategoryName'] = ApiClient.convertToType(data['causeVariableCategoryName'], 'String');
      }
      if (data.hasOwnProperty('causeChanges')) {
        obj['causeChanges'] = ApiClient.convertToType(data['causeChanges'], 'Number');
      }
      if (data.hasOwnProperty('causeVariableCombinationOperation')) {
        obj['causeVariableCombinationOperation'] = ApiClient.convertToType(data['causeVariableCombinationOperation'], 'String');
      }
      if (data.hasOwnProperty('causeVariableImageUrl')) {
        obj['causeVariableImageUrl'] = ApiClient.convertToType(data['causeVariableImageUrl'], 'String');
      }
      if (data.hasOwnProperty('causeVariableIonIcon')) {
        obj['causeVariableIonIcon'] = ApiClient.convertToType(data['causeVariableIonIcon'], 'String');
      }
      if (data.hasOwnProperty('causeUnit')) {
        obj['causeUnit'] = ApiClient.convertToType(data['causeUnit'], 'String');
      }
      if (data.hasOwnProperty('causeVariableDefaultUnitId')) {
        obj['causeVariableDefaultUnitId'] = ApiClient.convertToType(data['causeVariableDefaultUnitId'], 'Number');
      }
      if (data.hasOwnProperty('causeVariableId')) {
        obj['causeVariableId'] = ApiClient.convertToType(data['causeVariableId'], 'Number');
      }
      if (data.hasOwnProperty('causeVariableName')) {
        obj['causeVariableName'] = ApiClient.convertToType(data['causeVariableName'], 'String');
      }
      if (data.hasOwnProperty('correlationCoefficient')) {
        obj['correlationCoefficient'] = ApiClient.convertToType(data['correlationCoefficient'], 'Number');
      }
      if (data.hasOwnProperty('createdAt')) {
        obj['createdAt'] = ApiClient.convertToType(data['createdAt'], 'Date');
      }
      if (data.hasOwnProperty('dataAnalysis')) {
        obj['dataAnalysis'] = ApiClient.convertToType(data['dataAnalysis'], 'String');
      }
      if (data.hasOwnProperty('dataSources')) {
        obj['dataSources'] = ApiClient.convertToType(data['dataSources'], 'String');
      }
      if (data.hasOwnProperty('durationOfAction')) {
        obj['durationOfAction'] = ApiClient.convertToType(data['durationOfAction'], 'Number');
      }
      if (data.hasOwnProperty('effect')) {
        obj['effect'] = ApiClient.convertToType(data['effect'], 'String');
      }
      if (data.hasOwnProperty('effectVariableCategoryName')) {
        obj['effectVariableCategoryName'] = ApiClient.convertToType(data['effectVariableCategoryName'], 'String');
      }
      if (data.hasOwnProperty('effectVariableImageUrl')) {
        obj['effectVariableImageUrl'] = ApiClient.convertToType(data['effectVariableImageUrl'], 'String');
      }
      if (data.hasOwnProperty('effectVariableIonIcon')) {
        obj['effectVariableIonIcon'] = ApiClient.convertToType(data['effectVariableIonIcon'], 'String');
      }
      if (data.hasOwnProperty('effectSize')) {
        obj['effectSize'] = ApiClient.convertToType(data['effectSize'], 'String');
      }
      if (data.hasOwnProperty('effectVariableId')) {
        obj['effectVariableId'] = ApiClient.convertToType(data['effectVariableId'], 'String');
      }
      if (data.hasOwnProperty('effectVariableName')) {
        obj['effectVariableName'] = ApiClient.convertToType(data['effectVariableName'], 'String');
      }
      if (data.hasOwnProperty('gaugeImage')) {
        obj['gaugeImage'] = ApiClient.convertToType(data['gaugeImage'], 'String');
      }
      if (data.hasOwnProperty('imageUrl')) {
        obj['imageUrl'] = ApiClient.convertToType(data['imageUrl'], 'String');
      }
      if (data.hasOwnProperty('numberOfPairs')) {
        obj['numberOfPairs'] = ApiClient.convertToType(data['numberOfPairs'], 'Number');
      }
      if (data.hasOwnProperty('onsetDelay')) {
        obj['onsetDelay'] = ApiClient.convertToType(data['onsetDelay'], 'Number');
      }
      if (data.hasOwnProperty('optimalPearsonProduct')) {
        obj['optimalPearsonProduct'] = ApiClient.convertToType(data['optimalPearsonProduct'], 'Number');
      }
      if (data.hasOwnProperty('outcomeDataSources')) {
        obj['outcomeDataSources'] = ApiClient.convertToType(data['outcomeDataSources'], 'String');
      }
      if (data.hasOwnProperty('predictorExplanation')) {
        obj['predictorExplanation'] = ApiClient.convertToType(data['predictorExplanation'], 'String');
      }
      if (data.hasOwnProperty('principalInvestigator')) {
        obj['principalInvestigator'] = ApiClient.convertToType(data['principalInvestigator'], 'String');
      }
      if (data.hasOwnProperty('qmScore')) {
        obj['qmScore'] = ApiClient.convertToType(data['qmScore'], 'Number');
      }
      if (data.hasOwnProperty('reverseCorrelation')) {
        obj['reverseCorrelation'] = ApiClient.convertToType(data['reverseCorrelation'], 'Number');
      }
      if (data.hasOwnProperty('significanceExplanation')) {
        obj['significanceExplanation'] = ApiClient.convertToType(data['significanceExplanation'], 'String');
      }
      if (data.hasOwnProperty('statisticalSignificance')) {
        obj['statisticalSignificance'] = ApiClient.convertToType(data['statisticalSignificance'], 'String');
      }
      if (data.hasOwnProperty('strengthLevel')) {
        obj['strengthLevel'] = ApiClient.convertToType(data['strengthLevel'], 'String');
      }
      if (data.hasOwnProperty('studyAbstract')) {
        obj['studyAbstract'] = ApiClient.convertToType(data['studyAbstract'], 'String');
      }
      if (data.hasOwnProperty('studyBackground')) {
        obj['studyBackground'] = ApiClient.convertToType(data['studyBackground'], 'String');
      }
      if (data.hasOwnProperty('studyDesign')) {
        obj['studyDesign'] = ApiClient.convertToType(data['studyDesign'], 'String');
      }
      if (data.hasOwnProperty('studyLimitations')) {
        obj['studyLimitations'] = ApiClient.convertToType(data['studyLimitations'], 'String');
      }
      if (data.hasOwnProperty('studyLinkDynamic')) {
        obj['studyLinkDynamic'] = ApiClient.convertToType(data['studyLinkDynamic'], 'String');
      }
      if (data.hasOwnProperty('studyLinkFacebook')) {
        obj['studyLinkFacebook'] = ApiClient.convertToType(data['studyLinkFacebook'], 'String');
      }
      if (data.hasOwnProperty('studyLinkGoogle')) {
        obj['studyLinkGoogle'] = ApiClient.convertToType(data['studyLinkGoogle'], 'String');
      }
      if (data.hasOwnProperty('studyLinkTwitter')) {
        obj['studyLinkTwitter'] = ApiClient.convertToType(data['studyLinkTwitter'], 'String');
      }
      if (data.hasOwnProperty('studyLinkStatic')) {
        obj['studyLinkStatic'] = ApiClient.convertToType(data['studyLinkStatic'], 'String');
      }
      if (data.hasOwnProperty('studyObjective')) {
        obj['studyObjective'] = ApiClient.convertToType(data['studyObjective'], 'String');
      }
      if (data.hasOwnProperty('studyResults')) {
        obj['studyResults'] = ApiClient.convertToType(data['studyResults'], 'String');
      }
      if (data.hasOwnProperty('studyTitle')) {
        obj['studyTitle'] = ApiClient.convertToType(data['studyTitle'], 'String');
      }
      if (data.hasOwnProperty('timestamp')) {
        obj['timestamp'] = ApiClient.convertToType(data['timestamp'], 'Number');
      }
      if (data.hasOwnProperty('updatedAt')) {
        obj['updatedAt'] = ApiClient.convertToType(data['updatedAt'], 'Date');
      }
      if (data.hasOwnProperty('userVote')) {
        obj['userVote'] = ApiClient.convertToType(data['userVote'], 'Number');
      }
      if (data.hasOwnProperty('valuePredictingHighOutcome')) {
        obj['valuePredictingHighOutcome'] = ApiClient.convertToType(data['valuePredictingHighOutcome'], 'Number');
      }
      if (data.hasOwnProperty('valuePredictingHighOutcomeExplanation')) {
        obj['valuePredictingHighOutcomeExplanation'] = ApiClient.convertToType(data['valuePredictingHighOutcomeExplanation'], 'String');
      }
      if (data.hasOwnProperty('valuePredictingLowOutcome')) {
        obj['valuePredictingLowOutcome'] = ApiClient.convertToType(data['valuePredictingLowOutcome'], 'Number');
      }
      if (data.hasOwnProperty('valuePredictingLowOutcomeExplanation')) {
        obj['valuePredictingLowOutcomeExplanation'] = ApiClient.convertToType(data['valuePredictingLowOutcomeExplanation'], 'String');
      }
      if (data.hasOwnProperty('averageForwardPearsonCorrelationOverOnsetDelays')) {
        obj['averageForwardPearsonCorrelationOverOnsetDelays'] = ApiClient.convertToType(data['averageForwardPearsonCorrelationOverOnsetDelays'], 'Number');
      }
      if (data.hasOwnProperty('averageReversePearsonCorrelationOverOnsetDelays')) {
        obj['averageReversePearsonCorrelationOverOnsetDelays'] = ApiClient.convertToType(data['averageReversePearsonCorrelationOverOnsetDelays'], 'Number');
      }
      if (data.hasOwnProperty('confidenceInterval')) {
        obj['confidenceInterval'] = ApiClient.convertToType(data['confidenceInterval'], 'Number');
      }
      if (data.hasOwnProperty('criticalTValue')) {
        obj['criticalTValue'] = ApiClient.convertToType(data['criticalTValue'], 'Number');
      }
      if (data.hasOwnProperty('effectChanges')) {
        obj['effectChanges'] = ApiClient.convertToType(data['effectChanges'], 'Number');
      }
      if (data.hasOwnProperty('experimentEndTime')) {
        obj['experimentEndTime'] = ApiClient.convertToType(data['experimentEndTime'], 'Date');
      }
      if (data.hasOwnProperty('experimentStartTime')) {
        obj['experimentStartTime'] = ApiClient.convertToType(data['experimentStartTime'], 'Date');
      }
      if (data.hasOwnProperty('forwardSpearmanCorrelationCoefficient')) {
        obj['forwardSpearmanCorrelationCoefficient'] = ApiClient.convertToType(data['forwardSpearmanCorrelationCoefficient'], 'Number');
      }
      if (data.hasOwnProperty('onsetDelayWithStrongestPearsonCorrelation')) {
        obj['onsetDelayWithStrongestPearsonCorrelation'] = ApiClient.convertToType(data['onsetDelayWithStrongestPearsonCorrelation'], 'Number');
      }
      if (data.hasOwnProperty('pearsonCorrelationWithNoOnsetDelay')) {
        obj['pearsonCorrelationWithNoOnsetDelay'] = ApiClient.convertToType(data['pearsonCorrelationWithNoOnsetDelay'], 'Number');
      }
      if (data.hasOwnProperty('predictivePearsonCorrelation')) {
        obj['predictivePearsonCorrelation'] = ApiClient.convertToType(data['predictivePearsonCorrelation'], 'Number');
      }
      if (data.hasOwnProperty('predictsHighEffectChange')) {
        obj['predictsHighEffectChange'] = ApiClient.convertToType(data['predictsHighEffectChange'], 'Number');
      }
      if (data.hasOwnProperty('predictsLowEffectChange')) {
        obj['predictsLowEffectChange'] = ApiClient.convertToType(data['predictsLowEffectChange'], 'Number');
      }
      if (data.hasOwnProperty('strongestPearsonCorrelationCoefficient')) {
        obj['strongestPearsonCorrelationCoefficient'] = ApiClient.convertToType(data['strongestPearsonCorrelationCoefficient'], 'Number');
      }
      if (data.hasOwnProperty('tValue')) {
        obj['tValue'] = ApiClient.convertToType(data['tValue'], 'Number');
      }
      if (data.hasOwnProperty('userId')) {
        obj['userId'] = ApiClient.convertToType(data['userId'], 'Number');
      }
      if (data.hasOwnProperty('causeVariableMostCommonConnectorId')) {
        obj['causeVariableMostCommonConnectorId'] = ApiClient.convertToType(data['causeVariableMostCommonConnectorId'], 'Number');
      }
      if (data.hasOwnProperty('causeVariableCategoryId')) {
        obj['causeVariableCategoryId'] = ApiClient.convertToType(data['causeVariableCategoryId'], 'Number');
      }
      if (data.hasOwnProperty('effectVariableCombinationOperation')) {
        obj['effectVariableCombinationOperation'] = ApiClient.convertToType(data['effectVariableCombinationOperation'], 'String');
      }
      if (data.hasOwnProperty('effectVariableCommonAlias')) {
        obj['effectVariableCommonAlias'] = ApiClient.convertToType(data['effectVariableCommonAlias'], 'String');
      }
      if (data.hasOwnProperty('effectVariableDefaultUnitId')) {
        obj['effectVariableDefaultUnitId'] = ApiClient.convertToType(data['effectVariableDefaultUnitId'], 'Number');
      }
      if (data.hasOwnProperty('effectVariableMostCommonConnectorId')) {
        obj['effectVariableMostCommonConnectorId'] = ApiClient.convertToType(data['effectVariableMostCommonConnectorId'], 'Number');
      }
      if (data.hasOwnProperty('effectVariableCategoryId')) {
        obj['effectVariableCategoryId'] = ApiClient.convertToType(data['effectVariableCategoryId'], 'Number');
      }
      if (data.hasOwnProperty('causeUserVariableShareUserMeasurements')) {
        obj['causeUserVariableShareUserMeasurements'] = ApiClient.convertToType(data['causeUserVariableShareUserMeasurements'], 'Number');
      }
      if (data.hasOwnProperty('effectUserVariableShareUserMeasurements')) {
        obj['effectUserVariableShareUserMeasurements'] = ApiClient.convertToType(data['effectUserVariableShareUserMeasurements'], 'Number');
      }
      if (data.hasOwnProperty('predictorFillingValue')) {
        obj['predictorFillingValue'] = ApiClient.convertToType(data['predictorFillingValue'], 'Number');
      }
      if (data.hasOwnProperty('outcomeFillingValue')) {
        obj['outcomeFillingValue'] = ApiClient.convertToType(data['outcomeFillingValue'], 'Number');
      }
      if (data.hasOwnProperty('createdTime')) {
        obj['createdTime'] = ApiClient.convertToType(data['createdTime'], 'Date');
      }
      if (data.hasOwnProperty('updatedTime')) {
        obj['updatedTime'] = ApiClient.convertToType(data['updatedTime'], 'Date');
      }
      if (data.hasOwnProperty('durationOfActionInHours')) {
        obj['durationOfActionInHours'] = ApiClient.convertToType(data['durationOfActionInHours'], 'Number');
      }
      if (data.hasOwnProperty('onsetDelayWithStrongestPearsonCorrelationInHours')) {
        obj['onsetDelayWithStrongestPearsonCorrelationInHours'] = ApiClient.convertToType(data['onsetDelayWithStrongestPearsonCorrelationInHours'], 'Number');
      }
      if (data.hasOwnProperty('direction')) {
        obj['direction'] = ApiClient.convertToType(data['direction'], 'String');
      }
      if (data.hasOwnProperty('causeVariableDefaultUnitAbbreviatedName')) {
        obj['causeVariableDefaultUnitAbbreviatedName'] = ApiClient.convertToType(data['causeVariableDefaultUnitAbbreviatedName'], 'String');
      }
      if (data.hasOwnProperty('effectVariableDefaultUnitAbbreviatedName')) {
        obj['effectVariableDefaultUnitAbbreviatedName'] = ApiClient.convertToType(data['effectVariableDefaultUnitAbbreviatedName'], 'String');
      }
      if (data.hasOwnProperty('causeVariableDefaultUnitName')) {
        obj['causeVariableDefaultUnitName'] = ApiClient.convertToType(data['causeVariableDefaultUnitName'], 'String');
      }
      if (data.hasOwnProperty('effectVariableDefaultUnitName')) {
        obj['effectVariableDefaultUnitName'] = ApiClient.convertToType(data['effectVariableDefaultUnitName'], 'String');
      }
      if (data.hasOwnProperty('shareUserMeasurements')) {
        obj['shareUserMeasurements'] = ApiClient.convertToType(data['shareUserMeasurements'], 'Boolean');
      }
      if (data.hasOwnProperty('effectUnit')) {
        obj['effectUnit'] = ApiClient.convertToType(data['effectUnit'], 'String');
      }
      if (data.hasOwnProperty('significantDifference')) {
        obj['significantDifference'] = ApiClient.convertToType(data['significantDifference'], 'Boolean');
      }
      if (data.hasOwnProperty('predictsHighEffectChangeSentenceFragment')) {
        obj['predictsHighEffectChangeSentenceFragment'] = ApiClient.convertToType(data['predictsHighEffectChangeSentenceFragment'], 'String');
      }
      if (data.hasOwnProperty('predictsLowEffectChangeSentenceFragment')) {
        obj['predictsLowEffectChangeSentenceFragment'] = ApiClient.convertToType(data['predictsLowEffectChangeSentenceFragment'], 'String');
      }
      if (data.hasOwnProperty('confidenceLevel')) {
        obj['confidenceLevel'] = ApiClient.convertToType(data['confidenceLevel'], 'String');
      }
      if (data.hasOwnProperty('predictivePearsonCorrelationCoefficient')) {
        obj['predictivePearsonCorrelationCoefficient'] = ApiClient.convertToType(data['predictivePearsonCorrelationCoefficient'], 'Number');
      }
      if (data.hasOwnProperty('studyLinkEmail')) {
        obj['studyLinkEmail'] = ApiClient.convertToType(data['studyLinkEmail'], 'String');
      }
      if (data.hasOwnProperty('gaugeImageSquare')) {
        obj['gaugeImageSquare'] = ApiClient.convertToType(data['gaugeImageSquare'], 'String');
      }
      if (data.hasOwnProperty('dataSourcesParagraphForCause')) {
        obj['dataSourcesParagraphForCause'] = ApiClient.convertToType(data['dataSourcesParagraphForCause'], 'String');
      }
      if (data.hasOwnProperty('instructionsForCause')) {
        obj['instructionsForCause'] = ApiClient.convertToType(data['instructionsForCause'], 'String');
      }
      if (data.hasOwnProperty('dataSourcesParagraphForEffect')) {
        obj['dataSourcesParagraphForEffect'] = ApiClient.convertToType(data['dataSourcesParagraphForEffect'], 'String');
      }
      if (data.hasOwnProperty('instructionsForEffect')) {
        obj['instructionsForEffect'] = ApiClient.convertToType(data['instructionsForEffect'], 'String');
      }
      if (data.hasOwnProperty('pValue')) {
        obj['pValue'] = ApiClient.convertToType(data['pValue'], 'Number');
      }
      if (data.hasOwnProperty('reversePearsonCorrelationCoefficient')) {
        obj['reversePearsonCorrelationCoefficient'] = ApiClient.convertToType(data['reversePearsonCorrelationCoefficient'], 'Number');
      }
      if (data.hasOwnProperty('predictorMinimumAllowedValue')) {
        obj['predictorMinimumAllowedValue'] = ApiClient.convertToType(data['predictorMinimumAllowedValue'], 'Number');
      }
      if (data.hasOwnProperty('predictorMaximumAllowedValue')) {
        obj['predictorMaximumAllowedValue'] = ApiClient.convertToType(data['predictorMaximumAllowedValue'], 'Number');
      }
      if (data.hasOwnProperty('predictorDataSources')) {
        obj['predictorDataSources'] = ApiClient.convertToType(data['predictorDataSources'], 'String');
      }
    }
    return obj;
  }

  /**
   * 
   * @member {Number} averageDailyLowCause
   */
  exports.prototype['averageDailyLowCause'] = undefined;
  /**
   * 
   * @member {Number} averageDailyHighCause
   */
  exports.prototype['averageDailyHighCause'] = undefined;
  /**
   * 
   * @member {Number} averageEffect
   */
  exports.prototype['averageEffect'] = undefined;
  /**
   * 
   * @member {Number} averageEffectFollowingHighCause
   */
  exports.prototype['averageEffectFollowingHighCause'] = undefined;
  /**
   * 
   * @member {Number} averageEffectFollowingLowCause
   */
  exports.prototype['averageEffectFollowingLowCause'] = undefined;
  /**
   * 
   * @member {String} averageEffectFollowingHighCauseExplanation
   */
  exports.prototype['averageEffectFollowingHighCauseExplanation'] = undefined;
  /**
   * 
   * @member {String} averageEffectFollowingLowCauseExplanation
   */
  exports.prototype['averageEffectFollowingLowCauseExplanation'] = undefined;
  /**
   * Average Vote
   * @member {Number} averageVote
   */
  exports.prototype['averageVote'] = undefined;
  /**
   * 
   * @member {Number} causalityFactor
   */
  exports.prototype['causalityFactor'] = undefined;
  /**
   * Variable name of the cause variable for which the user desires correlations.
   * @member {String} cause
   */
  exports.prototype['cause'] = undefined;
  /**
   * Variable category of the cause variable.
   * @member {String} causeVariableCategoryName
   */
  exports.prototype['causeVariableCategoryName'] = undefined;
  /**
   * Number of changes in the predictor variable (a.k.a the number of experiments)
   * @member {Number} causeChanges
   */
  exports.prototype['causeChanges'] = undefined;
  /**
   * The way cause measurements are aggregated
   * @member {String} causeVariableCombinationOperation
   */
  exports.prototype['causeVariableCombinationOperation'] = undefined;
  /**
   * 
   * @member {String} causeVariableImageUrl
   */
  exports.prototype['causeVariableImageUrl'] = undefined;
  /**
   * For use in Ionic apps
   * @member {String} causeVariableIonIcon
   */
  exports.prototype['causeVariableIonIcon'] = undefined;
  /**
   * Unit of the predictor variable
   * @member {String} causeUnit
   */
  exports.prototype['causeUnit'] = undefined;
  /**
   * Unit Id of the predictor variable
   * @member {Number} causeVariableDefaultUnitId
   */
  exports.prototype['causeVariableDefaultUnitId'] = undefined;
  /**
   * 
   * @member {Number} causeVariableId
   */
  exports.prototype['causeVariableId'] = undefined;
  /**
   * Variable name of the cause variable for which the user desires correlations.
   * @member {String} causeVariableName
   */
  exports.prototype['causeVariableName'] = undefined;
  /**
   * Pearson correlation coefficient between cause and effect measurements
   * @member {Number} correlationCoefficient
   */
  exports.prototype['correlationCoefficient'] = undefined;
  /**
   * When the record was first created. Use UTC ISO 8601 `YYYY-MM-DDThh:mm:ss`  datetime format
   * @member {Date} createdAt
   */
  exports.prototype['createdAt'] = undefined;
  /**
   * How the data was analyzed
   * @member {String} dataAnalysis
   */
  exports.prototype['dataAnalysis'] = undefined;
  /**
   * How the data was obtained
   * @member {String} dataSources
   */
  exports.prototype['dataSources'] = undefined;
  /**
   * The amount of time over which a predictor/stimulus event can exert an observable influence on an outcome variable value. For instance, aspirin (stimulus/predictor) typically decreases headache severity for approximately four hours (duration of action) following the onset delay.
   * @member {Number} durationOfAction
   */
  exports.prototype['durationOfAction'] = undefined;
  /**
   * Variable name of the effect variable for which the user desires correlations.
   * @member {String} effect
   */
  exports.prototype['effect'] = undefined;
  /**
   * Variable category of the effect variable.
   * @member {String} effectVariableCategoryName
   */
  exports.prototype['effectVariableCategoryName'] = undefined;
  /**
   * 
   * @member {String} effectVariableImageUrl
   */
  exports.prototype['effectVariableImageUrl'] = undefined;
  /**
   * For use in Ionic apps
   * @member {String} effectVariableIonIcon
   */
  exports.prototype['effectVariableIonIcon'] = undefined;
  /**
   * Magnitude of the effects of a cause indicating whether it's practically meaningful.
   * @member {String} effectSize
   */
  exports.prototype['effectSize'] = undefined;
  /**
   * Magnitude of the effects of a cause indicating whether it's practically meaningful.
   * @member {String} effectVariableId
   */
  exports.prototype['effectVariableId'] = undefined;
  /**
   * Variable name of the effect variable for which the user desires correlations.
   * @member {String} effectVariableName
   */
  exports.prototype['effectVariableName'] = undefined;
  /**
   * Illustrates the strength of the relationship
   * @member {String} gaugeImage
   */
  exports.prototype['gaugeImage'] = undefined;
  /**
   * Large image for Facebook
   * @member {String} imageUrl
   */
  exports.prototype['imageUrl'] = undefined;
  /**
   * Number of points that went into the correlation calculation
   * @member {Number} numberOfPairs
   */
  exports.prototype['numberOfPairs'] = undefined;
  /**
   * The amount of time in seconds that elapses after the predictor/stimulus event before the outcome as perceived by a self-tracker is known as the onset delay. For example, the onset delay between the time a person takes an aspirin (predictor/stimulus event) and the time a person perceives a change in their headache severity (outcome) is approximately 30 minutes.
   * @member {Number} onsetDelay
   */
  exports.prototype['onsetDelay'] = undefined;
  /**
   * Optimal Pearson Product
   * @member {Number} optimalPearsonProduct
   */
  exports.prototype['optimalPearsonProduct'] = undefined;
  /**
   * original name of the cause.
   * @member {String} outcomeDataSources
   */
  exports.prototype['outcomeDataSources'] = undefined;
  /**
   * HIGHER Remeron predicts HIGHER Overall Mood
   * @member {String} predictorExplanation
   */
  exports.prototype['predictorExplanation'] = undefined;
  /**
   * Mike Sinn
   * @member {String} principalInvestigator
   */
  exports.prototype['principalInvestigator'] = undefined;
  /**
   * Value representing the significance of the relationship as a function of crowdsourced insights, predictive strength, data quantity, and data quality
   * @member {Number} qmScore
   */
  exports.prototype['qmScore'] = undefined;
  /**
   * Correlation when cause and effect are reversed. For any causal relationship, the forward correlation should exceed the reverse correlation.
   * @member {Number} reverseCorrelation
   */
  exports.prototype['reverseCorrelation'] = undefined;
  /**
   * Using a two-tailed t-test with alpha = 0.05, it was determined that the change...
   * @member {String} significanceExplanation
   */
  exports.prototype['significanceExplanation'] = undefined;
  /**
   * A function of the effect size and sample size
   * @member {String} statisticalSignificance
   */
  exports.prototype['statisticalSignificance'] = undefined;
  /**
   * weak, moderate, strong
   * @member {String} strengthLevel
   */
  exports.prototype['strengthLevel'] = undefined;
  /**
   * These data suggest with a high degree of confidence...
   * @member {String} studyAbstract
   */
  exports.prototype['studyAbstract'] = undefined;
  /**
   * In order to reduce suffering through the advancement of human knowledge...
   * @member {String} studyBackground
   */
  exports.prototype['studyBackground'] = undefined;
  /**
   * This study is based on data donated by one QuantiModo user...
   * @member {String} studyDesign
   */
  exports.prototype['studyDesign'] = undefined;
  /**
   * As with any human experiment, it was impossible to control for all potentially confounding variables...
   * @member {String} studyLimitations
   */
  exports.prototype['studyLimitations'] = undefined;
  /**
   * Url for the interactive study within the web app
   * @member {String} studyLinkDynamic
   */
  exports.prototype['studyLinkDynamic'] = undefined;
  /**
   * Url for sharing the study on Facebook
   * @member {String} studyLinkFacebook
   */
  exports.prototype['studyLinkFacebook'] = undefined;
  /**
   * Url for sharing the study on Google+
   * @member {String} studyLinkGoogle
   */
  exports.prototype['studyLinkGoogle'] = undefined;
  /**
   * Url for sharing the study on Twitter
   * @member {String} studyLinkTwitter
   */
  exports.prototype['studyLinkTwitter'] = undefined;
  /**
   * Url for sharing the statically rendered study on social media
   * @member {String} studyLinkStatic
   */
  exports.prototype['studyLinkStatic'] = undefined;
  /**
   * The objective of this study is to determine...
   * @member {String} studyObjective
   */
  exports.prototype['studyObjective'] = undefined;
  /**
   * This analysis suggests that...
   * @member {String} studyResults
   */
  exports.prototype['studyResults'] = undefined;
  /**
   * N1 Study HIGHER Remeron predicts HIGHER Overall Mood
   * @member {String} studyTitle
   */
  exports.prototype['studyTitle'] = undefined;
  /**
   * Time at which correlation was calculated
   * @member {Number} timestamp
   */
  exports.prototype['timestamp'] = undefined;
  /**
   * When the record in the database was last updated. Use UTC ISO 8601 `YYYY-MM-DDThh:mm:ss`  datetime format. Time zone should be UTC and not local.
   * @member {Date} updatedAt
   */
  exports.prototype['updatedAt'] = undefined;
  /**
   * User Vote
   * @member {Number} userVote
   */
  exports.prototype['userVote'] = undefined;
  /**
   * cause value that predicts an above average effect value (in default unit for cause variable)
   * @member {Number} valuePredictingHighOutcome
   */
  exports.prototype['valuePredictingHighOutcome'] = undefined;
  /**
   * Overall Mood, on average, 34% HIGHER after around 3.98mg Remeron
   * @member {String} valuePredictingHighOutcomeExplanation
   */
  exports.prototype['valuePredictingHighOutcomeExplanation'] = undefined;
  /**
   * cause value that predicts a below average effect value (in default unit for cause variable)
   * @member {Number} valuePredictingLowOutcome
   */
  exports.prototype['valuePredictingLowOutcome'] = undefined;
  /**
   * Overall Mood, on average, 4% LOWER after around 0mg Remeron
   * @member {String} valuePredictingLowOutcomeExplanation
   */
  exports.prototype['valuePredictingLowOutcomeExplanation'] = undefined;
  /**
   * Example: 0.396
   * @member {Number} averageForwardPearsonCorrelationOverOnsetDelays
   */
  exports.prototype['averageForwardPearsonCorrelationOverOnsetDelays'] = undefined;
  /**
   * Example: 0.453667
   * @member {Number} averageReversePearsonCorrelationOverOnsetDelays
   */
  exports.prototype['averageReversePearsonCorrelationOverOnsetDelays'] = undefined;
  /**
   * Example: 0.14344467795996
   * @member {Number} confidenceInterval
   */
  exports.prototype['confidenceInterval'] = undefined;
  /**
   * Example: 1.646
   * @member {Number} criticalTValue
   */
  exports.prototype['criticalTValue'] = undefined;
  /**
   * Example: 193
   * @member {Number} effectChanges
   */
  exports.prototype['effectChanges'] = undefined;
  /**
   * Example: 2014-07-30 12:50:00
   * @member {Date} experimentEndTime
   */
  exports.prototype['experimentEndTime'] = undefined;
  /**
   * Example: 2012-05-06 21:15:00
   * @member {Date} experimentStartTime
   */
  exports.prototype['experimentStartTime'] = undefined;
  /**
   * Example: 0.528359
   * @member {Number} forwardSpearmanCorrelationCoefficient
   */
  exports.prototype['forwardSpearmanCorrelationCoefficient'] = undefined;
  /**
   * Example: -86400
   * @member {Number} onsetDelayWithStrongestPearsonCorrelation
   */
  exports.prototype['onsetDelayWithStrongestPearsonCorrelation'] = undefined;
  /**
   * Example: 0.477
   * @member {Number} pearsonCorrelationWithNoOnsetDelay
   */
  exports.prototype['pearsonCorrelationWithNoOnsetDelay'] = undefined;
  /**
   * Example: 0.538
   * @member {Number} predictivePearsonCorrelation
   */
  exports.prototype['predictivePearsonCorrelation'] = undefined;
  /**
   * Example: 17
   * @member {Number} predictsHighEffectChange
   */
  exports.prototype['predictsHighEffectChange'] = undefined;
  /**
   * Example: -11
   * @member {Number} predictsLowEffectChange
   */
  exports.prototype['predictsLowEffectChange'] = undefined;
  /**
   * Example: 0.613
   * @member {Number} strongestPearsonCorrelationCoefficient
   */
  exports.prototype['strongestPearsonCorrelationCoefficient'] = undefined;
  /**
   * Example: 9.6986079652717
   * @member {Number} tValue
   */
  exports.prototype['tValue'] = undefined;
  /**
   * Example: 230
   * @member {Number} userId
   */
  exports.prototype['userId'] = undefined;
  /**
   * Example: 6
   * @member {Number} causeVariableMostCommonConnectorId
   */
  exports.prototype['causeVariableMostCommonConnectorId'] = undefined;
  /**
   * Example: 6
   * @member {Number} causeVariableCategoryId
   */
  exports.prototype['causeVariableCategoryId'] = undefined;
  /**
   * Example: MEAN
   * @member {String} effectVariableCombinationOperation
   */
  exports.prototype['effectVariableCombinationOperation'] = undefined;
  /**
   * Example: Mood_(psychology)
   * @member {String} effectVariableCommonAlias
   */
  exports.prototype['effectVariableCommonAlias'] = undefined;
  /**
   * Example: 10
   * @member {Number} effectVariableDefaultUnitId
   */
  exports.prototype['effectVariableDefaultUnitId'] = undefined;
  /**
   * Example: 10
   * @member {Number} effectVariableMostCommonConnectorId
   */
  exports.prototype['effectVariableMostCommonConnectorId'] = undefined;
  /**
   * Example: 1
   * @member {Number} effectVariableCategoryId
   */
  exports.prototype['effectVariableCategoryId'] = undefined;
  /**
   * Example: 1
   * @member {Number} causeUserVariableShareUserMeasurements
   */
  exports.prototype['causeUserVariableShareUserMeasurements'] = undefined;
  /**
   * Example: 1
   * @member {Number} effectUserVariableShareUserMeasurements
   */
  exports.prototype['effectUserVariableShareUserMeasurements'] = undefined;
  /**
   * Example: -1
   * @member {Number} predictorFillingValue
   */
  exports.prototype['predictorFillingValue'] = undefined;
  /**
   * Example: -1
   * @member {Number} outcomeFillingValue
   */
  exports.prototype['outcomeFillingValue'] = undefined;
  /**
   * Example: 2016-12-28 20:47:30
   * @member {Date} createdTime
   */
  exports.prototype['createdTime'] = undefined;
  /**
   * Example: 2017-05-06 15:40:38
   * @member {Date} updatedTime
   */
  exports.prototype['updatedTime'] = undefined;
  /**
   * Example: 168
   * @member {Number} durationOfActionInHours
   */
  exports.prototype['durationOfActionInHours'] = undefined;
  /**
   * Example: -24
   * @member {Number} onsetDelayWithStrongestPearsonCorrelationInHours
   */
  exports.prototype['onsetDelayWithStrongestPearsonCorrelationInHours'] = undefined;
  /**
   * Example: higher
   * @member {String} direction
   */
  exports.prototype['direction'] = undefined;
  /**
   * Example: /5
   * @member {String} causeVariableDefaultUnitAbbreviatedName
   */
  exports.prototype['causeVariableDefaultUnitAbbreviatedName'] = undefined;
  /**
   * Example: /5
   * @member {String} effectVariableDefaultUnitAbbreviatedName
   */
  exports.prototype['effectVariableDefaultUnitAbbreviatedName'] = undefined;
  /**
   * Example: 1 to 5 Rating
   * @member {String} causeVariableDefaultUnitName
   */
  exports.prototype['causeVariableDefaultUnitName'] = undefined;
  /**
   * Example: 1 to 5 Rating
   * @member {String} effectVariableDefaultUnitName
   */
  exports.prototype['effectVariableDefaultUnitName'] = undefined;
  /**
   * Example: 1
   * @member {Boolean} shareUserMeasurements
   */
  exports.prototype['shareUserMeasurements'] = undefined;
  /**
   * Example: /5
   * @member {String} effectUnit
   */
  exports.prototype['effectUnit'] = undefined;
  /**
   * Example: 1
   * @member {Boolean} significantDifference
   */
  exports.prototype['significantDifference'] = undefined;
  /**
   * Example: , on average, 17% 
   * @member {String} predictsHighEffectChangeSentenceFragment
   */
  exports.prototype['predictsHighEffectChangeSentenceFragment'] = undefined;
  /**
   * Example: , on average, 11% 
   * @member {String} predictsLowEffectChangeSentenceFragment
   */
  exports.prototype['predictsLowEffectChangeSentenceFragment'] = undefined;
  /**
   * Example: high
   * @member {String} confidenceLevel
   */
  exports.prototype['confidenceLevel'] = undefined;
  /**
   * Example: 0.538
   * @member {Number} predictivePearsonCorrelationCoefficient
   */
  exports.prototype['predictivePearsonCorrelationCoefficient'] = undefined;
  /**
   * Example: mailto:?subject=N1%20Study%3A%20Sleep%20Quality%20Predicts%20Higher%20Overall%20Mood&body=Check%20out%20my%20study%20at%20https%3A%2F%2Flocal.quantimo.do%2Fapi%2Fv2%2Fstudy%3FcauseVariableName%3DSleep%2520Quality%26effectVariableName%3DOverall%2520Mood%26userId%3D230%0A%0AHave%20a%20great%20day!
   * @member {String} studyLinkEmail
   */
  exports.prototype['studyLinkEmail'] = undefined;
  /**
   * Example: https://s3.amazonaws.com/quantimodo-docs/images/gauge-moderately-positive-relationship-200-200.png
   * @member {String} gaugeImageSquare
   */
  exports.prototype['gaugeImageSquare'] = undefined;
  /**
   * Example: Sleep Quality data was primarily collected using <a href=\"http://www.amazon.com/gp/product/B00A17IAO0/ref=as_li_qf_sp_asin_tl?ie=UTF8&camp=1789&creative=9325&creativeASIN=B00A17IAO0&linkCode=as2&tag=quant08-20\">Up by Jawbone</a>.  UP by Jawbone is a wristband and app that tracks how you sleep, move and eat and then helps you use that information to feel your best.
   * @member {String} dataSourcesParagraphForCause
   */
  exports.prototype['dataSourcesParagraphForCause'] = undefined;
  /**
   * Example: <a href=\"http://www.amazon.com/gp/product/B00A17IAO0/ref=as_li_qf_sp_asin_tl?ie=UTF8&camp=1789&creative=9325&creativeASIN=B00A17IAO0&linkCode=as2&tag=quant08-20\">Obtain Up by Jawbone</a> and use it to record your Sleep Quality. Once you have a <a href=\"http://www.amazon.com/gp/product/B00A17IAO0/ref=as_li_qf_sp_asin_tl?ie=UTF8&camp=1789&creative=9325&creativeASIN=B00A17IAO0&linkCode=as2&tag=quant08-20\">Up by Jawbone</a> account, <a href=\"https://app.quantimo.do/ionic/Modo/www/#/app/import\">connect your  Up by Jawbone account at QuantiModo</a> to automatically import and analyze your data.
   * @member {String} instructionsForCause
   */
  exports.prototype['instructionsForCause'] = undefined;
  /**
   * Example: Overall Mood data was primarily collected using <a href=\"https://quantimo.do\">QuantiModo</a>.  <a href=\"https://quantimo.do\">QuantiModo</a> is a Chrome extension, Android app, iOS app, and web app that allows you to easily track mood, symptoms, or any outcome you want to optimize in a fraction of a second.  You can also import your data from over 30 other apps and devices like Fitbit, Rescuetime, Jawbone Up, Withings, Facebook, Github, Google Calendar, Runkeeper, MoodPanda, Slice, Google Fit, and more.  <a href=\"https://quantimo.do\">QuantiModo</a> then analyzes your data to identify which hidden factors are most likely to be influencing your mood or symptoms and their optimal daily values.
   * @member {String} dataSourcesParagraphForEffect
   */
  exports.prototype['dataSourcesParagraphForEffect'] = undefined;
  /**
   * Example: <a href=\"https://quantimo.do\">Obtain QuantiModo</a> and use it to record your Overall Mood. Once you have a <a href=\"https://quantimo.do\">QuantiModo</a> account, <a href=\"https://app.quantimo.do/ionic/Modo/www/#/app/import\">connect your  QuantiModo account at QuantiModo</a> to automatically import and analyze your data.
   * @member {String} instructionsForEffect
   */
  exports.prototype['instructionsForEffect'] = undefined;
  /**
   * Example: 3.5306635529222E-5
   * @member {Number} pValue
   */
  exports.prototype['pValue'] = undefined;
  /**
   * Example: 0.63628232030415
   * @member {Number} reversePearsonCorrelationCoefficient
   */
  exports.prototype['reversePearsonCorrelationCoefficient'] = undefined;
  /**
   * Example: 10
   * @member {Number} predictorMinimumAllowedValue
   */
  exports.prototype['predictorMinimumAllowedValue'] = undefined;
  /**
   * Example: 160934
   * @member {Number} predictorMaximumAllowedValue
   */
  exports.prototype['predictorMaximumAllowedValue'] = undefined;
  /**
   * Example: RescueTime
   * @member {String} predictorDataSources
   */
  exports.prototype['predictorDataSources'] = undefined;



  return exports;
}));



},{"../ApiClient":16}],87:[function(require,module,exports){
/**
 * quantimodo
 * QuantiModo makes it easy to retrieve normalized user data from a wide array of devices and applications. [Learn about QuantiModo](https://quantimo.do), check out our [docs](https://github.com/QuantiModo/docs) or contact us at [help.quantimo.do](https://help.quantimo.do).
 *
 * OpenAPI spec version: 5.8.728
 *
 * NOTE: This class is auto generated by the swagger code generator program.
 * https://github.com/swagger-api/swagger-codegen.git
 *
 * Swagger Codegen version: 2.2.3
 *
 * Do not edit the class manually.
 *
 */

(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define(['ApiClient'], factory);
  } else if (typeof module === 'object' && module.exports) {
    // CommonJS-like environments that support module.exports, like Node.
    module.exports = factory(require('../ApiClient'));
  } else {
    // Browser globals (root is window)
    if (!root.Quantimodo) {
      root.Quantimodo = {};
    }
    root.Quantimodo.UserTag = factory(root.Quantimodo.ApiClient);
  }
}(this, function(ApiClient) {
  'use strict';




  /**
   * The UserTag model module.
   * @module model/UserTag
   * @version 5.8.807
   */

  /**
   * Constructs a new <code>UserTag</code>.
   * @alias module:model/UserTag
   * @class
   * @param taggedVariableId {Number} This is the id of the variable being tagged with an ingredient or something.
   * @param tagVariableId {Number} This is the id of the ingredient variable whose value is determined based on the value of the tagged variable.
   * @param conversionFactor {Number} Number by which we multiply the tagged variable value to obtain the tag variable (ingredient) value
   */
  var exports = function(taggedVariableId, tagVariableId, conversionFactor) {
    var _this = this;

    _this['taggedVariableId'] = taggedVariableId;
    _this['tagVariableId'] = tagVariableId;
    _this['conversionFactor'] = conversionFactor;
  };

  /**
   * Constructs a <code>UserTag</code> from a plain JavaScript object, optionally creating a new instance.
   * Copies all relevant properties from <code>data</code> to <code>obj</code> if supplied or a new instance if not.
   * @param {Object} data The plain JavaScript object bearing properties of interest.
   * @param {module:model/UserTag} obj Optional instance to populate.
   * @return {module:model/UserTag} The populated <code>UserTag</code> instance.
   */
  exports.constructFromObject = function(data, obj) {
    if (data) {
      obj = obj || new exports();

      if (data.hasOwnProperty('taggedVariableId')) {
        obj['taggedVariableId'] = ApiClient.convertToType(data['taggedVariableId'], 'Number');
      }
      if (data.hasOwnProperty('tagVariableId')) {
        obj['tagVariableId'] = ApiClient.convertToType(data['tagVariableId'], 'Number');
      }
      if (data.hasOwnProperty('conversionFactor')) {
        obj['conversionFactor'] = ApiClient.convertToType(data['conversionFactor'], 'Number');
      }
    }
    return obj;
  }

  /**
   * This is the id of the variable being tagged with an ingredient or something.
   * @member {Number} taggedVariableId
   */
  exports.prototype['taggedVariableId'] = undefined;
  /**
   * This is the id of the ingredient variable whose value is determined based on the value of the tagged variable.
   * @member {Number} tagVariableId
   */
  exports.prototype['tagVariableId'] = undefined;
  /**
   * Number by which we multiply the tagged variable value to obtain the tag variable (ingredient) value
   * @member {Number} conversionFactor
   */
  exports.prototype['conversionFactor'] = undefined;



  return exports;
}));



},{"../ApiClient":16}],88:[function(require,module,exports){
/**
 * quantimodo
 * QuantiModo makes it easy to retrieve normalized user data from a wide array of devices and applications. [Learn about QuantiModo](https://quantimo.do), check out our [docs](https://github.com/QuantiModo/docs) or contact us at [help.quantimo.do](https://help.quantimo.do).
 *
 * OpenAPI spec version: 5.8.728
 *
 * NOTE: This class is auto generated by the swagger code generator program.
 * https://github.com/swagger-api/swagger-codegen.git
 *
 * Swagger Codegen version: 2.2.3
 *
 * Do not edit the class manually.
 *
 */

(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define(['ApiClient', 'model/Unit', 'model/UserVariable', 'model/Variable'], factory);
  } else if (typeof module === 'object' && module.exports) {
    // CommonJS-like environments that support module.exports, like Node.
    module.exports = factory(require('../ApiClient'), require('./Unit'), require('./UserVariable'), require('./Variable'));
  } else {
    // Browser globals (root is window)
    if (!root.Quantimodo) {
      root.Quantimodo = {};
    }
    root.Quantimodo.UserVariable = factory(root.Quantimodo.ApiClient, root.Quantimodo.Unit, root.Quantimodo.UserVariable, root.Quantimodo.Variable);
  }
}(this, function(ApiClient, Unit, UserVariable, Variable) {
  'use strict';




  /**
   * The UserVariable model module.
   * @module model/UserVariable
   * @version 5.8.807
   */

  /**
   * Constructs a new <code>UserVariable</code>.
   * @alias module:model/UserVariable
   * @class
   * @param variableId {Number} ID of variable
   * @param availableDefaultUnits {Array.<module:model/Unit>} 
   * @param price {Number} Example: 95.4
   * @param alias {String} Example: 
   * @param userVariableValence {String} Example: 
   * @param userVariableWikipediaTitle {String} Example: 
   * @param informationalUrl {String} Example: 
   * @param parent {String} Example: 
   * @param productUrl {String} Example: 
   * @param wikipediaTitle {String} Example: 
   * @param userTagVariables {module:model/UserVariable} 
   * @param userTaggedVariables {module:model/UserVariable} 
   * @param joinedUserTagVariables {module:model/UserVariable} 
   * @param ingredientUserTagVariables {module:model/UserVariable} 
   * @param ingredientOfUserTagVariables {module:model/UserVariable} 
   * @param childUserTagVariables {module:model/UserVariable} 
   * @param parentUserTagVariables {module:model/UserVariable} 
   * @param commonTagVariables {module:model/Variable} 
   * @param commonTaggedVariables {module:model/Variable} 
   */
  var exports = function(variableId, availableDefaultUnits, price, alias, userVariableValence, userVariableWikipediaTitle, informationalUrl, parent, productUrl, wikipediaTitle, userTagVariables, userTaggedVariables, joinedUserTagVariables, ingredientUserTagVariables, ingredientOfUserTagVariables, childUserTagVariables, parentUserTagVariables, commonTagVariables, commonTaggedVariables) {
    var _this = this;




    _this['variableId'] = variableId;



































































































































    _this['availableDefaultUnits'] = availableDefaultUnits;
    _this['price'] = price;
    _this['alias'] = alias;
    _this['userVariableValence'] = userVariableValence;
    _this['userVariableWikipediaTitle'] = userVariableWikipediaTitle;
    _this['informationalUrl'] = informationalUrl;
    _this['parent'] = parent;
    _this['productUrl'] = productUrl;
    _this['wikipediaTitle'] = wikipediaTitle;
    _this['userTagVariables'] = userTagVariables;
    _this['userTaggedVariables'] = userTaggedVariables;
    _this['joinedUserTagVariables'] = joinedUserTagVariables;
    _this['ingredientUserTagVariables'] = ingredientUserTagVariables;
    _this['ingredientOfUserTagVariables'] = ingredientOfUserTagVariables;
    _this['childUserTagVariables'] = childUserTagVariables;
    _this['parentUserTagVariables'] = parentUserTagVariables;
    _this['commonTagVariables'] = commonTagVariables;
    _this['commonTaggedVariables'] = commonTaggedVariables;
  };

  /**
   * Constructs a <code>UserVariable</code> from a plain JavaScript object, optionally creating a new instance.
   * Copies all relevant properties from <code>data</code> to <code>obj</code> if supplied or a new instance if not.
   * @param {Object} data The plain JavaScript object bearing properties of interest.
   * @param {module:model/UserVariable} obj Optional instance to populate.
   * @return {module:model/UserVariable} The populated <code>UserVariable</code> instance.
   */
  exports.constructFromObject = function(data, obj) {
    if (data) {
      obj = obj || new exports();

      if (data.hasOwnProperty('parentId')) {
        obj['parentId'] = ApiClient.convertToType(data['parentId'], 'Number');
      }
      if (data.hasOwnProperty('userId')) {
        obj['userId'] = ApiClient.convertToType(data['userId'], 'Number');
      }
      if (data.hasOwnProperty('clientId')) {
        obj['clientId'] = ApiClient.convertToType(data['clientId'], 'String');
      }
      if (data.hasOwnProperty('variableId')) {
        obj['variableId'] = ApiClient.convertToType(data['variableId'], 'Number');
      }
      if (data.hasOwnProperty('defaultUnitId')) {
        obj['defaultUnitId'] = ApiClient.convertToType(data['defaultUnitId'], 'Number');
      }
      if (data.hasOwnProperty('minimumAllowedValue')) {
        obj['minimumAllowedValue'] = ApiClient.convertToType(data['minimumAllowedValue'], 'Number');
      }
      if (data.hasOwnProperty('maximumAllowedValue')) {
        obj['maximumAllowedValue'] = ApiClient.convertToType(data['maximumAllowedValue'], 'Number');
      }
      if (data.hasOwnProperty('fillingValue')) {
        obj['fillingValue'] = ApiClient.convertToType(data['fillingValue'], 'Number');
      }
      if (data.hasOwnProperty('joinWith')) {
        obj['joinWith'] = ApiClient.convertToType(data['joinWith'], 'Number');
      }
      if (data.hasOwnProperty('onsetDelay')) {
        obj['onsetDelay'] = ApiClient.convertToType(data['onsetDelay'], 'Number');
      }
      if (data.hasOwnProperty('durationOfAction')) {
        obj['durationOfAction'] = ApiClient.convertToType(data['durationOfAction'], 'Number');
      }
      if (data.hasOwnProperty('variableCategoryId')) {
        obj['variableCategoryId'] = ApiClient.convertToType(data['variableCategoryId'], 'Number');
      }
      if (data.hasOwnProperty('updated')) {
        obj['updated'] = ApiClient.convertToType(data['updated'], 'Number');
      }
      if (data.hasOwnProperty('public')) {
        obj['public'] = ApiClient.convertToType(data['public'], 'Number');
      }
      if (data.hasOwnProperty('causeOnly')) {
        obj['causeOnly'] = ApiClient.convertToType(data['causeOnly'], 'Boolean');
      }
      if (data.hasOwnProperty('fillingType')) {
        obj['fillingType'] = ApiClient.convertToType(data['fillingType'], 'String');
      }
      if (data.hasOwnProperty('numberOfMeasurements')) {
        obj['numberOfMeasurements'] = ApiClient.convertToType(data['numberOfMeasurements'], 'Number');
      }
      if (data.hasOwnProperty('numberOfProcessedDailyMeasurements')) {
        obj['numberOfProcessedDailyMeasurements'] = ApiClient.convertToType(data['numberOfProcessedDailyMeasurements'], 'Number');
      }
      if (data.hasOwnProperty('measurementsAtLastAnalysis')) {
        obj['measurementsAtLastAnalysis'] = ApiClient.convertToType(data['measurementsAtLastAnalysis'], 'Number');
      }
      if (data.hasOwnProperty('lastUnitId')) {
        obj['lastUnitId'] = ApiClient.convertToType(data['lastUnitId'], 'Number');
      }
      if (data.hasOwnProperty('lastOriginalUnitId')) {
        obj['lastOriginalUnitId'] = ApiClient.convertToType(data['lastOriginalUnitId'], 'Number');
      }
      if (data.hasOwnProperty('lastValue')) {
        obj['lastValue'] = ApiClient.convertToType(data['lastValue'], 'Number');
      }
      if (data.hasOwnProperty('lastOriginalValue')) {
        obj['lastOriginalValue'] = ApiClient.convertToType(data['lastOriginalValue'], 'Number');
      }
      if (data.hasOwnProperty('numberOfCorrelations')) {
        obj['numberOfCorrelations'] = ApiClient.convertToType(data['numberOfCorrelations'], 'Number');
      }
      if (data.hasOwnProperty('status')) {
        obj['status'] = ApiClient.convertToType(data['status'], 'String');
      }
      if (data.hasOwnProperty('errorMessage')) {
        obj['errorMessage'] = ApiClient.convertToType(data['errorMessage'], 'String');
      }
      if (data.hasOwnProperty('lastSuccessfulUpdateTime')) {
        obj['lastSuccessfulUpdateTime'] = ApiClient.convertToType(data['lastSuccessfulUpdateTime'], 'Date');
      }
      if (data.hasOwnProperty('standard_deviation')) {
        obj['standard_deviation'] = ApiClient.convertToType(data['standard_deviation'], 'Number');
      }
      if (data.hasOwnProperty('variance')) {
        obj['variance'] = ApiClient.convertToType(data['variance'], 'Number');
      }
      if (data.hasOwnProperty('minimumRecordedValue')) {
        obj['minimumRecordedValue'] = ApiClient.convertToType(data['minimumRecordedValue'], 'Number');
      }
      if (data.hasOwnProperty('maximumRecordedDailyValue')) {
        obj['maximumRecordedDailyValue'] = ApiClient.convertToType(data['maximumRecordedDailyValue'], 'Number');
      }
      if (data.hasOwnProperty('mean')) {
        obj['mean'] = ApiClient.convertToType(data['mean'], 'Number');
      }
      if (data.hasOwnProperty('median')) {
        obj['median'] = ApiClient.convertToType(data['median'], 'Number');
      }
      if (data.hasOwnProperty('mostCommonUnitId')) {
        obj['mostCommonUnitId'] = ApiClient.convertToType(data['mostCommonUnitId'], 'Number');
      }
      if (data.hasOwnProperty('mostCommonValue')) {
        obj['mostCommonValue'] = ApiClient.convertToType(data['mostCommonValue'], 'Number');
      }
      if (data.hasOwnProperty('numberOfUniqueDailyValues')) {
        obj['numberOfUniqueDailyValues'] = ApiClient.convertToType(data['numberOfUniqueDailyValues'], 'Number');
      }
      if (data.hasOwnProperty('numberOfChanges')) {
        obj['numberOfChanges'] = ApiClient.convertToType(data['numberOfChanges'], 'Number');
      }
      if (data.hasOwnProperty('skewness')) {
        obj['skewness'] = ApiClient.convertToType(data['skewness'], 'Number');
      }
      if (data.hasOwnProperty('kurtosis')) {
        obj['kurtosis'] = ApiClient.convertToType(data['kurtosis'], 'Number');
      }
      if (data.hasOwnProperty('latitude')) {
        obj['latitude'] = ApiClient.convertToType(data['latitude'], 'Number');
      }
      if (data.hasOwnProperty('longitude')) {
        obj['longitude'] = ApiClient.convertToType(data['longitude'], 'Number');
      }
      if (data.hasOwnProperty('location')) {
        obj['location'] = ApiClient.convertToType(data['location'], 'String');
      }
      if (data.hasOwnProperty('experimentStartTime')) {
        obj['experimentStartTime'] = ApiClient.convertToType(data['experimentStartTime'], 'Date');
      }
      if (data.hasOwnProperty('experimentEndTime')) {
        obj['experimentEndTime'] = ApiClient.convertToType(data['experimentEndTime'], 'Date');
      }
      if (data.hasOwnProperty('createdAt')) {
        obj['createdAt'] = ApiClient.convertToType(data['createdAt'], 'Date');
      }
      if (data.hasOwnProperty('updatedAt')) {
        obj['updatedAt'] = ApiClient.convertToType(data['updatedAt'], 'Date');
      }
      if (data.hasOwnProperty('outcome')) {
        obj['outcome'] = ApiClient.convertToType(data['outcome'], 'Boolean');
      }
      if (data.hasOwnProperty('sources')) {
        obj['sources'] = ApiClient.convertToType(data['sources'], 'String');
      }
      if (data.hasOwnProperty('earliestSourceTime')) {
        obj['earliestSourceTime'] = ApiClient.convertToType(data['earliestSourceTime'], 'Number');
      }
      if (data.hasOwnProperty('latestSourceTime')) {
        obj['latestSourceTime'] = ApiClient.convertToType(data['latestSourceTime'], 'Number');
      }
      if (data.hasOwnProperty('earliestMeasurementTime')) {
        obj['earliestMeasurementTime'] = ApiClient.convertToType(data['earliestMeasurementTime'], 'Number');
      }
      if (data.hasOwnProperty('latestMeasurementTime')) {
        obj['latestMeasurementTime'] = ApiClient.convertToType(data['latestMeasurementTime'], 'Number');
      }
      if (data.hasOwnProperty('earliestFillingTime')) {
        obj['earliestFillingTime'] = ApiClient.convertToType(data['earliestFillingTime'], 'Number');
      }
      if (data.hasOwnProperty('latestFillingTime')) {
        obj['latestFillingTime'] = ApiClient.convertToType(data['latestFillingTime'], 'Number');
      }
      if (data.hasOwnProperty('imageUrl')) {
        obj['imageUrl'] = ApiClient.convertToType(data['imageUrl'], 'String');
      }
      if (data.hasOwnProperty('ionIcon')) {
        obj['ionIcon'] = ApiClient.convertToType(data['ionIcon'], 'String');
      }
      if (data.hasOwnProperty('id')) {
        obj['id'] = ApiClient.convertToType(data['id'], 'Number');
      }
      if (data.hasOwnProperty('name')) {
        obj['name'] = ApiClient.convertToType(data['name'], 'String');
      }
      if (data.hasOwnProperty('userVariableDefaultUnitId')) {
        obj['userVariableDefaultUnitId'] = ApiClient.convertToType(data['userVariableDefaultUnitId'], 'Number');
      }
      if (data.hasOwnProperty('userVariableFillingValue')) {
        obj['userVariableFillingValue'] = ApiClient.convertToType(data['userVariableFillingValue'], 'Number');
      }
      if (data.hasOwnProperty('latestUserMeasurementTime')) {
        obj['latestUserMeasurementTime'] = ApiClient.convertToType(data['latestUserMeasurementTime'], 'Number');
      }
      if (data.hasOwnProperty('maximumRecordedValue')) {
        obj['maximumRecordedValue'] = ApiClient.convertToType(data['maximumRecordedValue'], 'Number');
      }
      if (data.hasOwnProperty('rawMeasurementsAtLastAnalysis')) {
        obj['rawMeasurementsAtLastAnalysis'] = ApiClient.convertToType(data['rawMeasurementsAtLastAnalysis'], 'Number');
      }
      if (data.hasOwnProperty('numberOfRawMeasurements')) {
        obj['numberOfRawMeasurements'] = ApiClient.convertToType(data['numberOfRawMeasurements'], 'Number');
      }
      if (data.hasOwnProperty('numberOfUserCorrelationsAsCause')) {
        obj['numberOfUserCorrelationsAsCause'] = ApiClient.convertToType(data['numberOfUserCorrelationsAsCause'], 'Number');
      }
      if (data.hasOwnProperty('standardDeviation')) {
        obj['standardDeviation'] = ApiClient.convertToType(data['standardDeviation'], 'Number');
      }
      if (data.hasOwnProperty('userVariableVariableCategoryId')) {
        obj['userVariableVariableCategoryId'] = ApiClient.convertToType(data['userVariableVariableCategoryId'], 'Number');
      }
      if (data.hasOwnProperty('variableFillingValue')) {
        obj['variableFillingValue'] = ApiClient.convertToType(data['variableFillingValue'], 'Number');
      }
      if (data.hasOwnProperty('mostCommonOriginalUnitId')) {
        obj['mostCommonOriginalUnitId'] = ApiClient.convertToType(data['mostCommonOriginalUnitId'], 'Number');
      }
      if (data.hasOwnProperty('numberOfAggregateCorrelationsAsCause')) {
        obj['numberOfAggregateCorrelationsAsCause'] = ApiClient.convertToType(data['numberOfAggregateCorrelationsAsCause'], 'Number');
      }
      if (data.hasOwnProperty('numberOfUserVariables')) {
        obj['numberOfUserVariables'] = ApiClient.convertToType(data['numberOfUserVariables'], 'Number');
      }
      if (data.hasOwnProperty('secondMostCommonValue')) {
        obj['secondMostCommonValue'] = ApiClient.convertToType(data['secondMostCommonValue'], 'Number');
      }
      if (data.hasOwnProperty('updatedTime')) {
        obj['updatedTime'] = ApiClient.convertToType(data['updatedTime'], 'Date');
      }
      if (data.hasOwnProperty('commonVariableUpdatedAt')) {
        obj['commonVariableUpdatedAt'] = ApiClient.convertToType(data['commonVariableUpdatedAt'], 'Date');
      }
      if (data.hasOwnProperty('userVariableUpdatedAt')) {
        obj['userVariableUpdatedAt'] = ApiClient.convertToType(data['userVariableUpdatedAt'], 'Date');
      }
      if (data.hasOwnProperty('combinationOperation')) {
        obj['combinationOperation'] = ApiClient.convertToType(data['combinationOperation'], 'String');
      }
      if (data.hasOwnProperty('variableCategoryName')) {
        obj['variableCategoryName'] = ApiClient.convertToType(data['variableCategoryName'], 'String');
      }
      if (data.hasOwnProperty('svgUrl')) {
        obj['svgUrl'] = ApiClient.convertToType(data['svgUrl'], 'String');
      }
      if (data.hasOwnProperty('pngUrl')) {
        obj['pngUrl'] = ApiClient.convertToType(data['pngUrl'], 'String');
      }
      if (data.hasOwnProperty('pngPath')) {
        obj['pngPath'] = ApiClient.convertToType(data['pngPath'], 'String');
      }
      if (data.hasOwnProperty('variableCategoryImageUrl')) {
        obj['variableCategoryImageUrl'] = ApiClient.convertToType(data['variableCategoryImageUrl'], 'String');
      }
      if (data.hasOwnProperty('manualTracking')) {
        obj['manualTracking'] = ApiClient.convertToType(data['manualTracking'], 'Boolean');
      }
      if (data.hasOwnProperty('userVariableVariableCategoryName')) {
        obj['userVariableVariableCategoryName'] = ApiClient.convertToType(data['userVariableVariableCategoryName'], 'String');
      }
      if (data.hasOwnProperty('meanInUserVariableDefaultUnit')) {
        obj['meanInUserVariableDefaultUnit'] = ApiClient.convertToType(data['meanInUserVariableDefaultUnit'], 'Number');
      }
      if (data.hasOwnProperty('secondMostCommonValueInUserVariableDefaultUnit')) {
        obj['secondMostCommonValueInUserVariableDefaultUnit'] = ApiClient.convertToType(data['secondMostCommonValueInUserVariableDefaultUnit'], 'Number');
      }
      if (data.hasOwnProperty('unitId')) {
        obj['unitId'] = ApiClient.convertToType(data['unitId'], 'Number');
      }
      if (data.hasOwnProperty('unitName')) {
        obj['unitName'] = ApiClient.convertToType(data['unitName'], 'String');
      }
      if (data.hasOwnProperty('unitAbbreviatedName')) {
        obj['unitAbbreviatedName'] = ApiClient.convertToType(data['unitAbbreviatedName'], 'String');
      }
      if (data.hasOwnProperty('unitCategoryId')) {
        obj['unitCategoryId'] = ApiClient.convertToType(data['unitCategoryId'], 'Number');
      }
      if (data.hasOwnProperty('unitCategoryName')) {
        obj['unitCategoryName'] = ApiClient.convertToType(data['unitCategoryName'], 'String');
      }
      if (data.hasOwnProperty('defaultUnitName')) {
        obj['defaultUnitName'] = ApiClient.convertToType(data['defaultUnitName'], 'String');
      }
      if (data.hasOwnProperty('defaultUnitAbbreviatedName')) {
        obj['defaultUnitAbbreviatedName'] = ApiClient.convertToType(data['defaultUnitAbbreviatedName'], 'String');
      }
      if (data.hasOwnProperty('defaultUnitCategoryId')) {
        obj['defaultUnitCategoryId'] = ApiClient.convertToType(data['defaultUnitCategoryId'], 'Number');
      }
      if (data.hasOwnProperty('defaultUnitCategoryName')) {
        obj['defaultUnitCategoryName'] = ApiClient.convertToType(data['defaultUnitCategoryName'], 'String');
      }
      if (data.hasOwnProperty('userVariableDefaultUnitName')) {
        obj['userVariableDefaultUnitName'] = ApiClient.convertToType(data['userVariableDefaultUnitName'], 'String');
      }
      if (data.hasOwnProperty('userVariableDefaultUnitAbbreviatedName')) {
        obj['userVariableDefaultUnitAbbreviatedName'] = ApiClient.convertToType(data['userVariableDefaultUnitAbbreviatedName'], 'String');
      }
      if (data.hasOwnProperty('userVariableDefaultUnitCategoryId')) {
        obj['userVariableDefaultUnitCategoryId'] = ApiClient.convertToType(data['userVariableDefaultUnitCategoryId'], 'Number');
      }
      if (data.hasOwnProperty('userVariableDefaultUnitCategoryName')) {
        obj['userVariableDefaultUnitCategoryName'] = ApiClient.convertToType(data['userVariableDefaultUnitCategoryName'], 'String');
      }
      if (data.hasOwnProperty('variableName')) {
        obj['variableName'] = ApiClient.convertToType(data['variableName'], 'String');
      }
      if (data.hasOwnProperty('inputType')) {
        obj['inputType'] = ApiClient.convertToType(data['inputType'], 'String');
      }
      if (data.hasOwnProperty('durationOfActionInHours')) {
        obj['durationOfActionInHours'] = ApiClient.convertToType(data['durationOfActionInHours'], 'Number');
      }
      if (data.hasOwnProperty('onsetDelayInHours')) {
        obj['onsetDelayInHours'] = ApiClient.convertToType(data['onsetDelayInHours'], 'Number');
      }
      if (data.hasOwnProperty('chartsLinkStatic')) {
        obj['chartsLinkStatic'] = ApiClient.convertToType(data['chartsLinkStatic'], 'String');
      }
      if (data.hasOwnProperty('chartsLinkDynamic')) {
        obj['chartsLinkDynamic'] = ApiClient.convertToType(data['chartsLinkDynamic'], 'String');
      }
      if (data.hasOwnProperty('chartsLinkFacebook')) {
        obj['chartsLinkFacebook'] = ApiClient.convertToType(data['chartsLinkFacebook'], 'String');
      }
      if (data.hasOwnProperty('chartsLinkGoogle')) {
        obj['chartsLinkGoogle'] = ApiClient.convertToType(data['chartsLinkGoogle'], 'String');
      }
      if (data.hasOwnProperty('chartsLinkTwitter')) {
        obj['chartsLinkTwitter'] = ApiClient.convertToType(data['chartsLinkTwitter'], 'String');
      }
      if (data.hasOwnProperty('chartsLinkEmail')) {
        obj['chartsLinkEmail'] = ApiClient.convertToType(data['chartsLinkEmail'], 'String');
      }
      if (data.hasOwnProperty('lastProcessedDailyValue')) {
        obj['lastProcessedDailyValue'] = ApiClient.convertToType(data['lastProcessedDailyValue'], 'Number');
      }
      if (data.hasOwnProperty('userVariableMostCommonConnectorId')) {
        obj['userVariableMostCommonConnectorId'] = ApiClient.convertToType(data['userVariableMostCommonConnectorId'], 'Number');
      }
      if (data.hasOwnProperty('secondToLastValue')) {
        obj['secondToLastValue'] = ApiClient.convertToType(data['secondToLastValue'], 'Number');
      }
      if (data.hasOwnProperty('thirdToLastValue')) {
        obj['thirdToLastValue'] = ApiClient.convertToType(data['thirdToLastValue'], 'Number');
      }
      if (data.hasOwnProperty('commonVariableMostCommonConnectorId')) {
        obj['commonVariableMostCommonConnectorId'] = ApiClient.convertToType(data['commonVariableMostCommonConnectorId'], 'Number');
      }
      if (data.hasOwnProperty('mostCommonConnectorId')) {
        obj['mostCommonConnectorId'] = ApiClient.convertToType(data['mostCommonConnectorId'], 'Number');
      }
      if (data.hasOwnProperty('lastValueInUserVariableDefaultUnit')) {
        obj['lastValueInUserVariableDefaultUnit'] = ApiClient.convertToType(data['lastValueInUserVariableDefaultUnit'], 'Number');
      }
      if (data.hasOwnProperty('secondToLastValueInUserVariableDefaultUnit')) {
        obj['secondToLastValueInUserVariableDefaultUnit'] = ApiClient.convertToType(data['secondToLastValueInUserVariableDefaultUnit'], 'Number');
      }
      if (data.hasOwnProperty('thirdToLastValueInUserVariableDefaultUnit')) {
        obj['thirdToLastValueInUserVariableDefaultUnit'] = ApiClient.convertToType(data['thirdToLastValueInUserVariableDefaultUnit'], 'Number');
      }
      if (data.hasOwnProperty('mostCommonValueInUserVariableDefaultUnit')) {
        obj['mostCommonValueInUserVariableDefaultUnit'] = ApiClient.convertToType(data['mostCommonValueInUserVariableDefaultUnit'], 'Number');
      }
      if (data.hasOwnProperty('numberOfUserCorrelationsAsEffect')) {
        obj['numberOfUserCorrelationsAsEffect'] = ApiClient.convertToType(data['numberOfUserCorrelationsAsEffect'], 'Number');
      }
      if (data.hasOwnProperty('numberOfAggregateCorrelationsAsEffect')) {
        obj['numberOfAggregateCorrelationsAsEffect'] = ApiClient.convertToType(data['numberOfAggregateCorrelationsAsEffect'], 'Number');
      }
      if (data.hasOwnProperty('thirdMostCommonValue')) {
        obj['thirdMostCommonValue'] = ApiClient.convertToType(data['thirdMostCommonValue'], 'Number');
      }
      if (data.hasOwnProperty('thirdMostCommonValueInUserVariableDefaultUnit')) {
        obj['thirdMostCommonValueInUserVariableDefaultUnit'] = ApiClient.convertToType(data['thirdMostCommonValueInUserVariableDefaultUnit'], 'Number');
      }
      if (data.hasOwnProperty('outcomeOfInterest')) {
        obj['outcomeOfInterest'] = ApiClient.convertToType(data['outcomeOfInterest'], 'Number');
      }
      if (data.hasOwnProperty('description')) {
        obj['description'] = ApiClient.convertToType(data['description'], 'String');
      }
      if (data.hasOwnProperty('valence')) {
        obj['valence'] = ApiClient.convertToType(data['valence'], 'String');
      }
      if (data.hasOwnProperty('shareUserMeasurements')) {
        obj['shareUserMeasurements'] = ApiClient.convertToType(data['shareUserMeasurements'], 'Boolean');
      }
      if (data.hasOwnProperty('numberOfUniqueValues')) {
        obj['numberOfUniqueValues'] = ApiClient.convertToType(data['numberOfUniqueValues'], 'Number');
      }
      if (data.hasOwnProperty('numberOfTrackingReminders')) {
        obj['numberOfTrackingReminders'] = ApiClient.convertToType(data['numberOfTrackingReminders'], 'Number');
      }
      if (data.hasOwnProperty('iconIcon')) {
        obj['iconIcon'] = ApiClient.convertToType(data['iconIcon'], 'String');
      }
      if (data.hasOwnProperty('commonAlias')) {
        obj['commonAlias'] = ApiClient.convertToType(data['commonAlias'], 'String');
      }
      if (data.hasOwnProperty('predictorOfInterest')) {
        obj['predictorOfInterest'] = ApiClient.convertToType(data['predictorOfInterest'], 'Number');
      }
      if (data.hasOwnProperty('experimentStartTimeString')) {
        obj['experimentStartTimeString'] = ApiClient.convertToType(data['experimentStartTimeString'], 'Date');
      }
      if (data.hasOwnProperty('experimentStartTimeSeconds')) {
        obj['experimentStartTimeSeconds'] = ApiClient.convertToType(data['experimentStartTimeSeconds'], 'Number');
      }
      if (data.hasOwnProperty('experimentEndTimeString')) {
        obj['experimentEndTimeString'] = ApiClient.convertToType(data['experimentEndTimeString'], 'Date');
      }
      if (data.hasOwnProperty('experimentEndTimeSeconds')) {
        obj['experimentEndTimeSeconds'] = ApiClient.convertToType(data['experimentEndTimeSeconds'], 'Number');
      }
      if (data.hasOwnProperty('availableDefaultUnits')) {
        obj['availableDefaultUnits'] = ApiClient.convertToType(data['availableDefaultUnits'], [Unit]);
      }
      if (data.hasOwnProperty('price')) {
        obj['price'] = ApiClient.convertToType(data['price'], 'Number');
      }
      if (data.hasOwnProperty('alias')) {
        obj['alias'] = ApiClient.convertToType(data['alias'], 'String');
      }
      if (data.hasOwnProperty('userVariableValence')) {
        obj['userVariableValence'] = ApiClient.convertToType(data['userVariableValence'], 'String');
      }
      if (data.hasOwnProperty('userVariableWikipediaTitle')) {
        obj['userVariableWikipediaTitle'] = ApiClient.convertToType(data['userVariableWikipediaTitle'], 'String');
      }
      if (data.hasOwnProperty('informationalUrl')) {
        obj['informationalUrl'] = ApiClient.convertToType(data['informationalUrl'], 'String');
      }
      if (data.hasOwnProperty('parent')) {
        obj['parent'] = ApiClient.convertToType(data['parent'], 'String');
      }
      if (data.hasOwnProperty('productUrl')) {
        obj['productUrl'] = ApiClient.convertToType(data['productUrl'], 'String');
      }
      if (data.hasOwnProperty('wikipediaTitle')) {
        obj['wikipediaTitle'] = ApiClient.convertToType(data['wikipediaTitle'], 'String');
      }
      if (data.hasOwnProperty('userTagVariables')) {
        obj['userTagVariables'] = UserVariable.constructFromObject(data['userTagVariables']);
      }
      if (data.hasOwnProperty('userTaggedVariables')) {
        obj['userTaggedVariables'] = UserVariable.constructFromObject(data['userTaggedVariables']);
      }
      if (data.hasOwnProperty('joinedUserTagVariables')) {
        obj['joinedUserTagVariables'] = UserVariable.constructFromObject(data['joinedUserTagVariables']);
      }
      if (data.hasOwnProperty('ingredientUserTagVariables')) {
        obj['ingredientUserTagVariables'] = UserVariable.constructFromObject(data['ingredientUserTagVariables']);
      }
      if (data.hasOwnProperty('ingredientOfUserTagVariables')) {
        obj['ingredientOfUserTagVariables'] = UserVariable.constructFromObject(data['ingredientOfUserTagVariables']);
      }
      if (data.hasOwnProperty('childUserTagVariables')) {
        obj['childUserTagVariables'] = UserVariable.constructFromObject(data['childUserTagVariables']);
      }
      if (data.hasOwnProperty('parentUserTagVariables')) {
        obj['parentUserTagVariables'] = UserVariable.constructFromObject(data['parentUserTagVariables']);
      }
      if (data.hasOwnProperty('commonTagVariables')) {
        obj['commonTagVariables'] = Variable.constructFromObject(data['commonTagVariables']);
      }
      if (data.hasOwnProperty('commonTaggedVariables')) {
        obj['commonTaggedVariables'] = Variable.constructFromObject(data['commonTaggedVariables']);
      }
    }
    return obj;
  }

  /**
   * ID of the parent variable if this variable has any parent
   * @member {Number} parentId
   */
  exports.prototype['parentId'] = undefined;
  /**
   * User ID
   * @member {Number} userId
   */
  exports.prototype['userId'] = undefined;
  /**
   * clientId
   * @member {String} clientId
   */
  exports.prototype['clientId'] = undefined;
  /**
   * ID of variable
   * @member {Number} variableId
   */
  exports.prototype['variableId'] = undefined;
  /**
   * ID of unit to use for this variable
   * @member {Number} defaultUnitId
   */
  exports.prototype['defaultUnitId'] = undefined;
  /**
   * The minimum allowed value for measurements. While you can record a value below this minimum, it will be excluded from the correlation analysis.
   * @member {Number} minimumAllowedValue
   */
  exports.prototype['minimumAllowedValue'] = undefined;
  /**
   * The maximum allowed value for measurements. While you can record a value above this maximum, it will be excluded from the correlation analysis.
   * @member {Number} maximumAllowedValue
   */
  exports.prototype['maximumAllowedValue'] = undefined;
  /**
   * When it comes to analysis to determine the effects of this variable, knowing when it did not occur is as important as knowing when it did occur. For example, if you are tracking a medication, it is important to know when you did not take it, but you do not have to log zero values for all the days when you haven't taken it. Hence, you can specify a filling value (typically 0) to insert whenever data is missing.
   * @member {Number} fillingValue
   */
  exports.prototype['fillingValue'] = undefined;
  /**
   * The Variable this Variable should be joined with. If the variable is joined with some other variable then it is not shown to user in the list of variables
   * @member {Number} joinWith
   */
  exports.prototype['joinWith'] = undefined;
  /**
   * The amount of time in seconds that elapses after the predictor/stimulus event before the outcome as perceived by a self-tracker is known as the onset delay. For example, the onset delay between the time a person takes an aspirin (predictor/stimulus event) and the time a person perceives a change in their headache severity (outcome) is approximately 30 minutes.
   * @member {Number} onsetDelay
   */
  exports.prototype['onsetDelay'] = undefined;
  /**
   * The amount of time over which a predictor/stimulus event can exert an observable influence on an outcome variable value. For instance, aspirin (stimulus/predictor) typically decreases headache severity for approximately four hours (duration of action) following the onset delay.
   * @member {Number} durationOfAction
   */
  exports.prototype['durationOfAction'] = undefined;
  /**
   * ID of variable category
   * @member {Number} variableCategoryId
   */
  exports.prototype['variableCategoryId'] = undefined;
  /**
   * updated
   * @member {Number} updated
   */
  exports.prototype['updated'] = undefined;
  /**
   * Is variable public
   * @member {Number} public
   */
  exports.prototype['public'] = undefined;
  /**
   * A value of 1 indicates that this variable is generally a cause in a causal relationship.  An example of a causeOnly variable would be a variable such as Cloud Cover which would generally not be influenced by the behaviour of the user
   * @member {Boolean} causeOnly
   */
  exports.prototype['causeOnly'] = undefined;
  /**
   * 0 -> No filling, 1 -> Use filling-value
   * @member {String} fillingType
   */
  exports.prototype['fillingType'] = undefined;
  /**
   * Number of measurements
   * @member {Number} numberOfMeasurements
   */
  exports.prototype['numberOfMeasurements'] = undefined;
  /**
   * Number of processed measurements
   * @member {Number} numberOfProcessedDailyMeasurements
   */
  exports.prototype['numberOfProcessedDailyMeasurements'] = undefined;
  /**
   * Number of measurements at last analysis
   * @member {Number} measurementsAtLastAnalysis
   */
  exports.prototype['measurementsAtLastAnalysis'] = undefined;
  /**
   * ID of last Unit
   * @member {Number} lastUnitId
   */
  exports.prototype['lastUnitId'] = undefined;
  /**
   * ID of last original Unit
   * @member {Number} lastOriginalUnitId
   */
  exports.prototype['lastOriginalUnitId'] = undefined;
  /**
   * Last Value
   * @member {Number} lastValue
   */
  exports.prototype['lastValue'] = undefined;
  /**
   * Last original value which is stored
   * @member {Number} lastOriginalValue
   */
  exports.prototype['lastOriginalValue'] = undefined;
  /**
   * Number of correlations for this variable
   * @member {Number} numberOfCorrelations
   */
  exports.prototype['numberOfCorrelations'] = undefined;
  /**
   * status
   * @member {String} status
   */
  exports.prototype['status'] = undefined;
  /**
   * error_message
   * @member {String} errorMessage
   */
  exports.prototype['errorMessage'] = undefined;
  /**
   * When this variable or its settings were last updated
   * @member {Date} lastSuccessfulUpdateTime
   */
  exports.prototype['lastSuccessfulUpdateTime'] = undefined;
  /**
   * Standard deviation
   * @member {Number} standard_deviation
   */
  exports.prototype['standard_deviation'] = undefined;
  /**
   * Variance
   * @member {Number} variance
   */
  exports.prototype['variance'] = undefined;
  /**
   * Minimum recorded value of this variable
   * @member {Number} minimumRecordedValue
   */
  exports.prototype['minimumRecordedValue'] = undefined;
  /**
   * Maximum recorded daily value of this variable
   * @member {Number} maximumRecordedDailyValue
   */
  exports.prototype['maximumRecordedDailyValue'] = undefined;
  /**
   * Mean
   * @member {Number} mean
   */
  exports.prototype['mean'] = undefined;
  /**
   * Median
   * @member {Number} median
   */
  exports.prototype['median'] = undefined;
  /**
   * Most common Unit ID
   * @member {Number} mostCommonUnitId
   */
  exports.prototype['mostCommonUnitId'] = undefined;
  /**
   * Most common value
   * @member {Number} mostCommonValue
   */
  exports.prototype['mostCommonValue'] = undefined;
  /**
   * Number of unique daily values
   * @member {Number} numberOfUniqueDailyValues
   */
  exports.prototype['numberOfUniqueDailyValues'] = undefined;
  /**
   * Number of changes
   * @member {Number} numberOfChanges
   */
  exports.prototype['numberOfChanges'] = undefined;
  /**
   * Skewness
   * @member {Number} skewness
   */
  exports.prototype['skewness'] = undefined;
  /**
   * Kurtosis
   * @member {Number} kurtosis
   */
  exports.prototype['kurtosis'] = undefined;
  /**
   * Latitude
   * @member {Number} latitude
   */
  exports.prototype['latitude'] = undefined;
  /**
   * Longitude
   * @member {Number} longitude
   */
  exports.prototype['longitude'] = undefined;
  /**
   * Location
   * @member {String} location
   */
  exports.prototype['location'] = undefined;
  /**
   * Earliest measurement start_time to be used in analysis. Use UTC ISO 8601 `YYYY-MM-DDThh:mm:ss`  datetime format
   * @member {Date} experimentStartTime
   */
  exports.prototype['experimentStartTime'] = undefined;
  /**
   * Latest measurement start_time to be used in analysis. Use UTC ISO 8601 `YYYY-MM-DDThh:mm:ss`  datetime format
   * @member {Date} experimentEndTime
   */
  exports.prototype['experimentEndTime'] = undefined;
  /**
   * When the record was first created. Use UTC ISO 8601 `YYYY-MM-DDThh:mm:ss`  datetime format
   * @member {Date} createdAt
   */
  exports.prototype['createdAt'] = undefined;
  /**
   * When the record in the database was last updated. Use UTC ISO 8601 `YYYY-MM-DDThh:mm:ss`  datetime format
   * @member {Date} updatedAt
   */
  exports.prototype['updatedAt'] = undefined;
  /**
   * Outcome variables (those with `outcome` == 1) are variables for which a human would generally want to identify the influencing factors. These include symptoms of illness, physique, mood, cognitive performance, etc.  Generally correlation calculations are only performed on outcome variables
   * @member {Boolean} outcome
   */
  exports.prototype['outcome'] = undefined;
  /**
   * Comma-separated list of source names to limit variables to those sources
   * @member {String} sources
   */
  exports.prototype['sources'] = undefined;
  /**
   * Earliest source time
   * @member {Number} earliestSourceTime
   */
  exports.prototype['earliestSourceTime'] = undefined;
  /**
   * Latest source time
   * @member {Number} latestSourceTime
   */
  exports.prototype['latestSourceTime'] = undefined;
  /**
   * Earliest measurement time
   * @member {Number} earliestMeasurementTime
   */
  exports.prototype['earliestMeasurementTime'] = undefined;
  /**
   * Latest measurement time
   * @member {Number} latestMeasurementTime
   */
  exports.prototype['latestMeasurementTime'] = undefined;
  /**
   * Earliest filling time
   * @member {Number} earliestFillingTime
   */
  exports.prototype['earliestFillingTime'] = undefined;
  /**
   * Latest filling time
   * @member {Number} latestFillingTime
   */
  exports.prototype['latestFillingTime'] = undefined;
  /**
   * 
   * @member {String} imageUrl
   */
  exports.prototype['imageUrl'] = undefined;
  /**
   * 
   * @member {String} ionIcon
   */
  exports.prototype['ionIcon'] = undefined;
  /**
   * Example: 95614
   * @member {Number} id
   */
  exports.prototype['id'] = undefined;
  /**
   * Example: Trader Joes Bedtime Tea / Sleepytime Tea (any Brand)
   * @member {String} name
   */
  exports.prototype['name'] = undefined;
  /**
   * Example: 23
   * @member {Number} userVariableDefaultUnitId
   */
  exports.prototype['userVariableDefaultUnitId'] = undefined;
  /**
   * Example: -1
   * @member {Number} userVariableFillingValue
   */
  exports.prototype['userVariableFillingValue'] = undefined;
  /**
   * Example: 1501383600
   * @member {Number} latestUserMeasurementTime
   */
  exports.prototype['latestUserMeasurementTime'] = undefined;
  /**
   * Example: 1
   * @member {Number} maximumRecordedValue
   */
  exports.prototype['maximumRecordedValue'] = undefined;
  /**
   * Example: 131
   * @member {Number} rawMeasurementsAtLastAnalysis
   */
  exports.prototype['rawMeasurementsAtLastAnalysis'] = undefined;
  /**
   * Example: 295
   * @member {Number} numberOfRawMeasurements
   */
  exports.prototype['numberOfRawMeasurements'] = undefined;
  /**
   * Example: 115
   * @member {Number} numberOfUserCorrelationsAsCause
   */
  exports.prototype['numberOfUserCorrelationsAsCause'] = undefined;
  /**
   * Example: 0.46483219855434
   * @member {Number} standardDeviation
   */
  exports.prototype['standardDeviation'] = undefined;
  /**
   * Example: 13
   * @member {Number} userVariableVariableCategoryId
   */
  exports.prototype['userVariableVariableCategoryId'] = undefined;
  /**
   * Example: -1
   * @member {Number} variableFillingValue
   */
  exports.prototype['variableFillingValue'] = undefined;
  /**
   * Example: 23
   * @member {Number} mostCommonOriginalUnitId
   */
  exports.prototype['mostCommonOriginalUnitId'] = undefined;
  /**
   * Example: 1
   * @member {Number} numberOfAggregateCorrelationsAsCause
   */
  exports.prototype['numberOfAggregateCorrelationsAsCause'] = undefined;
  /**
   * Example: 2
   * @member {Number} numberOfUserVariables
   */
  exports.prototype['numberOfUserVariables'] = undefined;
  /**
   * Example: 1
   * @member {Number} secondMostCommonValue
   */
  exports.prototype['secondMostCommonValue'] = undefined;
  /**
   * Example: 2017-07-30 14:58:26
   * @member {Date} updatedTime
   */
  exports.prototype['updatedTime'] = undefined;
  /**
   * Example: 2017-02-07 23:43:39
   * @member {Date} commonVariableUpdatedAt
   */
  exports.prototype['commonVariableUpdatedAt'] = undefined;
  /**
   * Example: 2017-07-30 14:58:26
   * @member {Date} userVariableUpdatedAt
   */
  exports.prototype['userVariableUpdatedAt'] = undefined;
  /**
   * Example: MEAN
   * @member {String} combinationOperation
   */
  exports.prototype['combinationOperation'] = undefined;
  /**
   * Example: Treatments
   * @member {String} variableCategoryName
   */
  exports.prototype['variableCategoryName'] = undefined;
  /**
   * Example: https://app.quantimo.do/ionic/Modo/www/img/variable_categories/treatments.svg
   * @member {String} svgUrl
   */
  exports.prototype['svgUrl'] = undefined;
  /**
   * Example: https://app.quantimo.do/ionic/Modo/www/img/variable_categories/treatments.png
   * @member {String} pngUrl
   */
  exports.prototype['pngUrl'] = undefined;
  /**
   * Example: img/variable_categories/treatments.png
   * @member {String} pngPath
   */
  exports.prototype['pngPath'] = undefined;
  /**
   * Example: https://maxcdn.icons8.com/Color/PNG/96/Healthcare/pill-96.png
   * @member {String} variableCategoryImageUrl
   */
  exports.prototype['variableCategoryImageUrl'] = undefined;
  /**
   * Example: 1
   * @member {Boolean} manualTracking
   */
  exports.prototype['manualTracking'] = undefined;
  /**
   * Example: Treatments
   * @member {String} userVariableVariableCategoryName
   */
  exports.prototype['userVariableVariableCategoryName'] = undefined;
  /**
   * Example: 0.31159
   * @member {Number} meanInUserVariableDefaultUnit
   */
  exports.prototype['meanInUserVariableDefaultUnit'] = undefined;
  /**
   * Example: 1
   * @member {Number} secondMostCommonValueInUserVariableDefaultUnit
   */
  exports.prototype['secondMostCommonValueInUserVariableDefaultUnit'] = undefined;
  /**
   * Example: 23
   * @member {Number} unitId
   */
  exports.prototype['unitId'] = undefined;
  /**
   * Example: Count
   * @member {String} unitName
   */
  exports.prototype['unitName'] = undefined;
  /**
   * Example: count
   * @member {String} unitAbbreviatedName
   */
  exports.prototype['unitAbbreviatedName'] = undefined;
  /**
   * Example: 6
   * @member {Number} unitCategoryId
   */
  exports.prototype['unitCategoryId'] = undefined;
  /**
   * Example: Miscellany
   * @member {String} unitCategoryName
   */
  exports.prototype['unitCategoryName'] = undefined;
  /**
   * Example: Count
   * @member {String} defaultUnitName
   */
  exports.prototype['defaultUnitName'] = undefined;
  /**
   * Example: count
   * @member {String} defaultUnitAbbreviatedName
   */
  exports.prototype['defaultUnitAbbreviatedName'] = undefined;
  /**
   * Example: 6
   * @member {Number} defaultUnitCategoryId
   */
  exports.prototype['defaultUnitCategoryId'] = undefined;
  /**
   * Example: Miscellany
   * @member {String} defaultUnitCategoryName
   */
  exports.prototype['defaultUnitCategoryName'] = undefined;
  /**
   * Example: Count
   * @member {String} userVariableDefaultUnitName
   */
  exports.prototype['userVariableDefaultUnitName'] = undefined;
  /**
   * Example: count
   * @member {String} userVariableDefaultUnitAbbreviatedName
   */
  exports.prototype['userVariableDefaultUnitAbbreviatedName'] = undefined;
  /**
   * Example: 6
   * @member {Number} userVariableDefaultUnitCategoryId
   */
  exports.prototype['userVariableDefaultUnitCategoryId'] = undefined;
  /**
   * Example: Miscellany
   * @member {String} userVariableDefaultUnitCategoryName
   */
  exports.prototype['userVariableDefaultUnitCategoryName'] = undefined;
  /**
   * Example: Trader Joes Bedtime Tea / Sleepytime Tea (any Brand)
   * @member {String} variableName
   */
  exports.prototype['variableName'] = undefined;
  /**
   * Example: value
   * @member {String} inputType
   */
  exports.prototype['inputType'] = undefined;
  /**
   * Example: 168
   * @member {Number} durationOfActionInHours
   */
  exports.prototype['durationOfActionInHours'] = undefined;
  /**
   * Example: 0.5
   * @member {Number} onsetDelayInHours
   */
  exports.prototype['onsetDelayInHours'] = undefined;
  /**
   * Example: https://local.quantimo.do/api/v2/charts?variableName=Trader%20Joes%20Bedtime%20Tea%20%2F%20Sleepytime%20Tea%20%28any%20Brand%29&userId=230&pngUrl=https%3A%2F%2Fapp.quantimo.do%2Fionic%2FModo%2Fwww%2Fimg%2Fvariable_categories%2Ftreatments.png
   * @member {String} chartsLinkStatic
   */
  exports.prototype['chartsLinkStatic'] = undefined;
  /**
   * Example: https://local.quantimo.do/ionic/Modo/www/#/app/charts/Trader%20Joes%20Bedtime%20Tea%20%2F%20Sleepytime%20Tea%20%28any%20Brand%29?variableName=Trader%20Joes%20Bedtime%20Tea%20%2F%20Sleepytime%20Tea%20%28any%20Brand%29&userId=230&pngUrl=https%3A%2F%2Fapp.quantimo.do%2Fionic%2FModo%2Fwww%2Fimg%2Fvariable_categories%2Ftreatments.png
   * @member {String} chartsLinkDynamic
   */
  exports.prototype['chartsLinkDynamic'] = undefined;
  /**
   * Example: https://www.facebook.com/sharer/sharer.php?u=https%3A%2F%2Flocal.quantimo.do%2Fapi%2Fv2%2Fcharts%3FvariableName%3DTrader%2520Joes%2520Bedtime%2520Tea%2520%252F%2520Sleepytime%2520Tea%2520%2528any%2520Brand%2529%26userId%3D230%26pngUrl%3Dhttps%253A%252F%252Fapp.quantimo.do%252Fionic%252FModo%252Fwww%252Fimg%252Fvariable_categories%252Ftreatments.png
   * @member {String} chartsLinkFacebook
   */
  exports.prototype['chartsLinkFacebook'] = undefined;
  /**
   * Example: https://plus.google.com/share?url=https%3A%2F%2Flocal.quantimo.do%2Fapi%2Fv2%2Fcharts%3FvariableName%3DTrader%2520Joes%2520Bedtime%2520Tea%2520%252F%2520Sleepytime%2520Tea%2520%2528any%2520Brand%2529%26userId%3D230%26pngUrl%3Dhttps%253A%252F%252Fapp.quantimo.do%252Fionic%252FModo%252Fwww%252Fimg%252Fvariable_categories%252Ftreatments.png
   * @member {String} chartsLinkGoogle
   */
  exports.prototype['chartsLinkGoogle'] = undefined;
  /**
   * Example: https://twitter.com/home?status=Check%20out%20my%20Trader%20Joes%20Bedtime%20Tea%20%2F%20Sleepytime%20Tea%20%28any%20Brand%29%20data%21%20https%3A%2F%2Flocal.quantimo.do%2Fapi%2Fv2%2Fcharts%3FvariableName%3DTrader%2520Joes%2520Bedtime%2520Tea%2520%252F%2520Sleepytime%2520Tea%2520%2528any%2520Brand%2529%26userId%3D230%26pngUrl%3Dhttps%253A%252F%252Fapp.quantimo.do%252Fionic%252FModo%252Fwww%252Fimg%252Fvariable_categories%252Ftreatments.png%20%40quantimodo
   * @member {String} chartsLinkTwitter
   */
  exports.prototype['chartsLinkTwitter'] = undefined;
  /**
   * Example: mailto:?subject=Check%20out%20my%20Trader%20Joes%20Bedtime%20Tea%20%2F%20Sleepytime%20Tea%20%28any%20Brand%29%20data%21&body=See%20my%20Trader%20Joes%20Bedtime%20Tea%20%2F%20Sleepytime%20Tea%20%28any%20Brand%29%20history%20at%20https%3A%2F%2Flocal.quantimo.do%2Fapi%2Fv2%2Fcharts%3FvariableName%3DTrader%2520Joes%2520Bedtime%2520Tea%2520%252F%2520Sleepytime%2520Tea%2520%2528any%2520Brand%2529%26userId%3D230%26pngUrl%3Dhttps%253A%252F%252Fapp.quantimo.do%252Fionic%252FModo%252Fwww%252Fimg%252Fvariable_categories%252Ftreatments.png%0A%0AHave%20a%20great%20day!
   * @member {String} chartsLinkEmail
   */
  exports.prototype['chartsLinkEmail'] = undefined;
  /**
   * Example: 500
   * @member {Number} lastProcessedDailyValue
   */
  exports.prototype['lastProcessedDailyValue'] = undefined;
  /**
   * Example: 51
   * @member {Number} userVariableMostCommonConnectorId
   */
  exports.prototype['userVariableMostCommonConnectorId'] = undefined;
  /**
   * Example: 250
   * @member {Number} secondToLastValue
   */
  exports.prototype['secondToLastValue'] = undefined;
  /**
   * Example: 250
   * @member {Number} thirdToLastValue
   */
  exports.prototype['thirdToLastValue'] = undefined;
  /**
   * Example: 51
   * @member {Number} commonVariableMostCommonConnectorId
   */
  exports.prototype['commonVariableMostCommonConnectorId'] = undefined;
  /**
   * Example: 51
   * @member {Number} mostCommonConnectorId
   */
  exports.prototype['mostCommonConnectorId'] = undefined;
  /**
   * Example: 500
   * @member {Number} lastValueInUserVariableDefaultUnit
   */
  exports.prototype['lastValueInUserVariableDefaultUnit'] = undefined;
  /**
   * Example: 250
   * @member {Number} secondToLastValueInUserVariableDefaultUnit
   */
  exports.prototype['secondToLastValueInUserVariableDefaultUnit'] = undefined;
  /**
   * Example: 250
   * @member {Number} thirdToLastValueInUserVariableDefaultUnit
   */
  exports.prototype['thirdToLastValueInUserVariableDefaultUnit'] = undefined;
  /**
   * Example: 250
   * @member {Number} mostCommonValueInUserVariableDefaultUnit
   */
  exports.prototype['mostCommonValueInUserVariableDefaultUnit'] = undefined;
  /**
   * Example: 29014
   * @member {Number} numberOfUserCorrelationsAsEffect
   */
  exports.prototype['numberOfUserCorrelationsAsEffect'] = undefined;
  /**
   * Example: 310
   * @member {Number} numberOfAggregateCorrelationsAsEffect
   */
  exports.prototype['numberOfAggregateCorrelationsAsEffect'] = undefined;
  /**
   * Example: 6
   * @member {Number} thirdMostCommonValue
   */
  exports.prototype['thirdMostCommonValue'] = undefined;
  /**
   * Example: 6
   * @member {Number} thirdMostCommonValueInUserVariableDefaultUnit
   */
  exports.prototype['thirdMostCommonValueInUserVariableDefaultUnit'] = undefined;
  /**
   * Example: 1
   * @member {Number} outcomeOfInterest
   */
  exports.prototype['outcomeOfInterest'] = undefined;
  /**
   * Example: negative
   * @member {String} description
   */
  exports.prototype['description'] = undefined;
  /**
   * Example: negative
   * @member {String} valence
   */
  exports.prototype['valence'] = undefined;
  /**
   * Example: 1
   * @member {Boolean} shareUserMeasurements
   */
  exports.prototype['shareUserMeasurements'] = undefined;
  /**
   * Example: 2
   * @member {Number} numberOfUniqueValues
   */
  exports.prototype['numberOfUniqueValues'] = undefined;
  /**
   * Example: 1
   * @member {Number} numberOfTrackingReminders
   */
  exports.prototype['numberOfTrackingReminders'] = undefined;
  /**
   * Example: ion-sad-outline
   * @member {String} iconIcon
   */
  exports.prototype['iconIcon'] = undefined;
  /**
   * Example: Anxiety / Nervousness
   * @member {String} commonAlias
   */
  exports.prototype['commonAlias'] = undefined;
  /**
   * Example: 0
   * @member {Number} predictorOfInterest
   */
  exports.prototype['predictorOfInterest'] = undefined;
  /**
   * Example: 2010-03-23 01:31:42
   * @member {Date} experimentStartTimeString
   */
  exports.prototype['experimentStartTimeString'] = undefined;
  /**
   * Example: 1269307902
   * @member {Number} experimentStartTimeSeconds
   */
  exports.prototype['experimentStartTimeSeconds'] = undefined;
  /**
   * Example: 2030-01-01 06:00:00
   * @member {Date} experimentEndTimeString
   */
  exports.prototype['experimentEndTimeString'] = undefined;
  /**
   * Example: 1893477600
   * @member {Number} experimentEndTimeSeconds
   */
  exports.prototype['experimentEndTimeSeconds'] = undefined;
  /**
   * @member {Array.<module:model/Unit>} availableDefaultUnits
   */
  exports.prototype['availableDefaultUnits'] = undefined;
  /**
   * Example: 95.4
   * @member {Number} price
   */
  exports.prototype['price'] = undefined;
  /**
   * Example: 
   * @member {String} alias
   */
  exports.prototype['alias'] = undefined;
  /**
   * Example: 
   * @member {String} userVariableValence
   */
  exports.prototype['userVariableValence'] = undefined;
  /**
   * Example: 
   * @member {String} userVariableWikipediaTitle
   */
  exports.prototype['userVariableWikipediaTitle'] = undefined;
  /**
   * Example: 
   * @member {String} informationalUrl
   */
  exports.prototype['informationalUrl'] = undefined;
  /**
   * Example: 
   * @member {String} parent
   */
  exports.prototype['parent'] = undefined;
  /**
   * Example: 
   * @member {String} productUrl
   */
  exports.prototype['productUrl'] = undefined;
  /**
   * Example: 
   * @member {String} wikipediaTitle
   */
  exports.prototype['wikipediaTitle'] = undefined;
  /**
   * @member {module:model/UserVariable} userTagVariables
   */
  exports.prototype['userTagVariables'] = undefined;
  /**
   * @member {module:model/UserVariable} userTaggedVariables
   */
  exports.prototype['userTaggedVariables'] = undefined;
  /**
   * @member {module:model/UserVariable} joinedUserTagVariables
   */
  exports.prototype['joinedUserTagVariables'] = undefined;
  /**
   * @member {module:model/UserVariable} ingredientUserTagVariables
   */
  exports.prototype['ingredientUserTagVariables'] = undefined;
  /**
   * @member {module:model/UserVariable} ingredientOfUserTagVariables
   */
  exports.prototype['ingredientOfUserTagVariables'] = undefined;
  /**
   * @member {module:model/UserVariable} childUserTagVariables
   */
  exports.prototype['childUserTagVariables'] = undefined;
  /**
   * @member {module:model/UserVariable} parentUserTagVariables
   */
  exports.prototype['parentUserTagVariables'] = undefined;
  /**
   * @member {module:model/Variable} commonTagVariables
   */
  exports.prototype['commonTagVariables'] = undefined;
  /**
   * @member {module:model/Variable} commonTaggedVariables
   */
  exports.prototype['commonTaggedVariables'] = undefined;



  return exports;
}));



},{"../ApiClient":16,"./Unit":83,"./UserVariable":88,"./Variable":90}],89:[function(require,module,exports){
/**
 * quantimodo
 * QuantiModo makes it easy to retrieve normalized user data from a wide array of devices and applications. [Learn about QuantiModo](https://quantimo.do), check out our [docs](https://github.com/QuantiModo/docs) or contact us at [help.quantimo.do](https://help.quantimo.do).
 *
 * OpenAPI spec version: 5.8.728
 *
 * NOTE: This class is auto generated by the swagger code generator program.
 * https://github.com/swagger-api/swagger-codegen.git
 *
 * Swagger Codegen version: 2.2.3
 *
 * Do not edit the class manually.
 *
 */

(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define(['ApiClient'], factory);
  } else if (typeof module === 'object' && module.exports) {
    // CommonJS-like environments that support module.exports, like Node.
    module.exports = factory(require('../ApiClient'));
  } else {
    // Browser globals (root is window)
    if (!root.Quantimodo) {
      root.Quantimodo = {};
    }
    root.Quantimodo.UserVariableDelete = factory(root.Quantimodo.ApiClient);
  }
}(this, function(ApiClient) {
  'use strict';




  /**
   * The UserVariableDelete model module.
   * @module model/UserVariableDelete
   * @version 5.8.807
   */

  /**
   * Constructs a new <code>UserVariableDelete</code>.
   * @alias module:model/UserVariableDelete
   * @class
   * @param variableId {Number} Id of the variable whose measurements should be deleted
   */
  var exports = function(variableId) {
    var _this = this;

    _this['variableId'] = variableId;
  };

  /**
   * Constructs a <code>UserVariableDelete</code> from a plain JavaScript object, optionally creating a new instance.
   * Copies all relevant properties from <code>data</code> to <code>obj</code> if supplied or a new instance if not.
   * @param {Object} data The plain JavaScript object bearing properties of interest.
   * @param {module:model/UserVariableDelete} obj Optional instance to populate.
   * @return {module:model/UserVariableDelete} The populated <code>UserVariableDelete</code> instance.
   */
  exports.constructFromObject = function(data, obj) {
    if (data) {
      obj = obj || new exports();

      if (data.hasOwnProperty('variableId')) {
        obj['variableId'] = ApiClient.convertToType(data['variableId'], 'Number');
      }
    }
    return obj;
  }

  /**
   * Id of the variable whose measurements should be deleted
   * @member {Number} variableId
   */
  exports.prototype['variableId'] = undefined;



  return exports;
}));



},{"../ApiClient":16}],90:[function(require,module,exports){
/**
 * quantimodo
 * QuantiModo makes it easy to retrieve normalized user data from a wide array of devices and applications. [Learn about QuantiModo](https://quantimo.do), check out our [docs](https://github.com/QuantiModo/docs) or contact us at [help.quantimo.do](https://help.quantimo.do).
 *
 * OpenAPI spec version: 5.8.728
 *
 * NOTE: This class is auto generated by the swagger code generator program.
 * https://github.com/swagger-api/swagger-codegen.git
 *
 * Swagger Codegen version: 2.2.3
 *
 * Do not edit the class manually.
 *
 */

(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define(['ApiClient', 'model/DataSource', 'model/Unit', 'model/UserVariable', 'model/Variable'], factory);
  } else if (typeof module === 'object' && module.exports) {
    // CommonJS-like environments that support module.exports, like Node.
    module.exports = factory(require('../ApiClient'), require('./DataSource'), require('./Unit'), require('./UserVariable'), require('./Variable'));
  } else {
    // Browser globals (root is window)
    if (!root.Quantimodo) {
      root.Quantimodo = {};
    }
    root.Quantimodo.Variable = factory(root.Quantimodo.ApiClient, root.Quantimodo.DataSource, root.Quantimodo.Unit, root.Quantimodo.UserVariable, root.Quantimodo.Variable);
  }
}(this, function(ApiClient, DataSource, Unit, UserVariable, Variable) {
  'use strict';




  /**
   * The Variable model module.
   * @module model/Variable
   * @version 5.8.807
   */

  /**
   * Constructs a new <code>Variable</code>.
   * @alias module:model/Variable
   * @class
   * @param name {String} User-defined variable display name.
   * @param variableCategoryName {String} Variable category like Mood, Sleep, Physical Activity, Treatment, Symptom, etc.
   * @param defaultUnitAbbreviatedName {String} Abbreviated name of the default unit for the variable
   * @param defaultUnitId {Number} Id of the default unit for the variable
   * @param sources {String} Comma-separated list of source names to limit variables to those sources
   * @param minimumAllowedValue {Number} The minimum allowed value for measurements. While you can record a value below this minimum, it will be excluded from the correlation analysis.
   * @param maximumAllowedValue {Number} The maximum allowed value for measurements. While you can record a value above this maximum, it will be excluded from the correlation analysis.
   * @param combinationOperation {module:model/Variable.CombinationOperationEnum} Way to aggregate measurements over time. Options are \"MEAN\" or \"SUM\". SUM should be used for things like minutes of exercise.  If you use MEAN for exercise, then a person might exercise more minutes in one day but add separate measurements that were smaller.  So when we are doing correlational analysis, we would think that the person exercised less that day even though they exercised more.  Conversely, we must use MEAN for things such as ratings which cannot be SUMMED.
   * @param fillingValue {Number} When it comes to analysis to determine the effects of this variable, knowing when it did not occur is as important as knowing when it did occur. For example, if you are tracking a medication, it is important to know when you did not take it, but you do not have to log zero values for all the days when you haven't taken it. Hence, you can specify a filling value (typically 0) to insert whenever data is missing.
   * @param joinWith {String} The Variable this Variable should be joined with. If the variable is joined with some other variable then it is not shown to user in the list of variables.
   * @param joinedVariables {Array.<module:model/Variable>} Array of Variables that are joined with this Variable
   * @param parent {Number} Id of the parent variable if this variable has any parent
   * @param subVariables {Array.<module:model/Variable>} Array of Variables that are sub variables to this Variable
   * @param onsetDelay {Number} The amount of time in seconds that elapses after the predictor/stimulus event before the outcome as perceived by a self-tracker is known as the onset delay. For example, the onset delay between the time a person takes an aspirin (predictor/stimulus event) and the time a person perceives a change in their headache severity (outcome) is approximately 30 minutes.
   * @param durationOfAction {Number} The amount of time over which a predictor/stimulus event can exert an observable influence on an outcome variable value. For instance, aspirin (stimulus/predictor) typically decreases headache severity for approximately four hours (duration of action) following the onset delay.
   * @param earliestMeasurementTime {Number} Earliest measurement time
   * @param latestMeasurementTime {Number} Latest measurement time
   * @param updated {Number} When this variable or its settings were last updated
   * @param causeOnly {Number} A value of 1 indicates that this variable is generally a cause in a causal relationship.  An example of a causeOnly variable would be a variable such as Cloud Cover which would generally not be influenced by the behaviour of the user.
   * @param numberOfCorrelations {Number} Number of correlations
   * @param outcome {Number} Outcome variables (those with `outcome` == 1) are variables for which a human would generally want to identify the influencing factors. These include symptoms of illness, physique, mood, cognitive performance, etc.  Generally correlation calculations are only performed on outcome variables.
   * @param rawMeasurementsAtLastAnalysis {Number} The number of measurements that a given user had for this variable the last time a correlation calculation was performed. Generally correlation values are only updated once the current number of measurements for a variable is more than 10% greater than the rawMeasurementsAtLastAnalysis.  This avoids a computationally-demanding recalculation when there's not enough new data to make a significant difference in the correlation.
   * @param numberOfRawMeasurements {Number} Number of measurements
   * @param lastUnit {String} Last unit
   * @param lastValue {Number} Last value
   * @param mostCommonValue {Number} Most common value
   * @param mostCommonUnit {String} Most common unit
   * @param lastSource {Number} Last source
   * @param onsetDelayInHours {Number} Example: 0
   * @param availableDefaultUnits {Array.<module:model/Unit>} 
   * @param alias {String} Example: 
   * @param clientId {String} Example: local
   * @param earliestFillingTime {Number} Example: 1362099600
   * @param earliestSourceTime {Number} Example: 1334473200
   * @param experimentEndTime {Date} Example: 
   * @param experimentStartTime {Date} Example: 
   * @param fillingType {String} Example: 
   * @param userVariableFillingValue {Number} Example: -1
   * @param lastOriginalUnitId {Number} Example: 47
   * @param lastOriginalValue {Number} Example: 100900
   * @param lastProcessedDailyValue {Number} Example: 100900
   * @param lastSuccessfulUpdateTime {Date} Example: 2017-02-08 17:43:01
   * @param lastUnitId {Number} Example: 47
   * @param latestFillingTime {Number} Example: 1501722000
   * @param latestUserMeasurementTime {Number} Example: 1501722000
   * @param latestSourceTime {Number} Example: 1501722000
   * @param maximumRecordedValue {Number} Example: 104700
   * @param measurementsAtLastAnalysis {Number} Example: 9795
   * @param minimumRecordedValue {Number} Example: 1008.74
   * @param userVariableMostCommonConnectorId {Number} Example: 13
   * @param numberOfChanges {Number} Example: 1317
   * @param numberOfProcessedDailyMeasurements {Number} Example: 1364
   * @param numberOfUniqueDailyValues {Number} Example: 283
   * @param numberOfUserCorrelationsAsCause {Number} Example: 155
   * @param numberOfUserCorrelationsAsEffect {Number} Example: 0
   * @param outcomeOfInterest {Number} Example: 0
   * @param parentId {String} Example: 
   * @param predictorOfInterest {Number} Example: 0
   * @param secondToLastValue {Number} Example: 101800
   * @param shareUserMeasurements {Boolean} Example: false
   * @param status {String} Example: UPDATED
   * @param thirdToLastValue {Number} Example: 102000
   * @param userId {Number} Example: 230
   * @param userVariableValence {String} Example: 
   * @param variableId {Number} Example: 96380
   * @param userVariableWikipediaTitle {String} Example: 
   * @param variableFillingValue {Number} Example: -1
   * @param informationalUrl {String} Example: 
   * @param commonVariableMostCommonConnectorId {Number} Example: 13
   * @param price {String} Example: 
   * @param productUrl {String} Example: 
   * @param wikipediaTitle {String} Example: 
   * @param commonVariableUpdatedAt {Date} Example: 2017-07-30 20:47:38
   * @param userVariableUpdatedAt {Date} Example: 2017-08-04 11:19:31
   * @param experimentStartTimeString {Date} Example: 
   * @param experimentStartTimeSeconds {Date} Example: 
   * @param experimentEndTimeString {Date} Example: 
   * @param experimentEndTimeSeconds {Date} Example: 
   * @param meanInUserVariableDefaultUnit {Number} Example: 101260
   * @param lastValueInUserVariableDefaultUnit {Number} Example: 101600
   * @param secondToLastValueInUserVariableDefaultUnit {Number} Example: 101800
   * @param thirdToLastValueInUserVariableDefaultUnit {Number} Example: 102000
   * @param mostCommonValueInUserVariableDefaultUnit {Number} Example: 101700
   * @param secondMostCommonValueInUserVariableDefaultUnit {Number} Example: 101500
   * @param thirdMostCommonValueInUserVariableDefaultUnit {Number} Example: 101700
   * @param chartsLinkStatic {String} Example: https://local.quantimo.do/api/v2/charts?variableName=Barometric%20Pressure&userId=230&pngUrl=https%3A%2F%2Fapp.quantimo.do%2Fionic%2FModo%2Fwww%2Fimg%2Fvariable_categories%2Fenvironment.png
   * @param chartsLinkDynamic {String} Example: https://local.quantimo.do/ionic/Modo/www/#/app/charts/Barometric%20Pressure?variableName=Barometric%20Pressure&userId=230&pngUrl=https%3A%2F%2Fapp.quantimo.do%2Fionic%2FModo%2Fwww%2Fimg%2Fvariable_categories%2Fenvironment.png
   * @param chartsLinkFacebook {String} Example: https://www.facebook.com/sharer/sharer.php?u=https%3A%2F%2Flocal.quantimo.do%2Fapi%2Fv2%2Fcharts%3FvariableName%3DBarometric%2520Pressure%26userId%3D230%26pngUrl%3Dhttps%253A%252F%252Fapp.quantimo.do%252Fionic%252FModo%252Fwww%252Fimg%252Fvariable_categories%252Fenvironment.png
   * @param chartsLinkGoogle {String} Example: https://plus.google.com/share?url=https%3A%2F%2Flocal.quantimo.do%2Fapi%2Fv2%2Fcharts%3FvariableName%3DBarometric%2520Pressure%26userId%3D230%26pngUrl%3Dhttps%253A%252F%252Fapp.quantimo.do%252Fionic%252FModo%252Fwww%252Fimg%252Fvariable_categories%252Fenvironment.png
   * @param chartsLinkTwitter {String} Example: https://twitter.com/home?status=Check%20out%20my%20Barometric%20Pressure%20data%21%20https%3A%2F%2Flocal.quantimo.do%2Fapi%2Fv2%2Fcharts%3FvariableName%3DBarometric%2520Pressure%26userId%3D230%26pngUrl%3Dhttps%253A%252F%252Fapp.quantimo.do%252Fionic%252FModo%252Fwww%252Fimg%252Fvariable_categories%252Fenvironment.png%20%40quantimodo
   * @param chartsLinkEmail {String} Example: mailto:?subject=Check%20out%20my%20Barometric%20Pressure%20data%21&body=See%20my%20Barometric%20Pressure%20history%20at%20https%3A%2F%2Flocal.quantimo.do%2Fapi%2Fv2%2Fcharts%3FvariableName%3DBarometric%2520Pressure%26userId%3D230%26pngUrl%3Dhttps%253A%252F%252Fapp.quantimo.do%252Fionic%252FModo%252Fwww%252Fimg%252Fvariable_categories%252Fenvironment.png%0A%0AHave%20a%20great%20day!
   * @param userTagVariables {module:model/UserVariable} 
   * @param userTaggedVariables {module:model/UserVariable} 
   * @param joinedUserTagVariables {module:model/UserVariable} 
   * @param ingredientUserTagVariables {module:model/UserVariable} 
   * @param ingredientOfUserTagVariables {module:model/UserVariable} 
   * @param childUserTagVariables {module:model/UserVariable} 
   * @param parentUserTagVariables {module:model/UserVariable} 
   * @param commonTagVariables {module:model/Variable} 
   * @param commonTaggedVariables {module:model/Variable} 
   * @param dataSource {module:model/DataSource} 
   */
  var exports = function(name, variableCategoryName, defaultUnitAbbreviatedName, defaultUnitId, sources, minimumAllowedValue, maximumAllowedValue, combinationOperation, fillingValue, joinWith, joinedVariables, parent, subVariables, onsetDelay, durationOfAction, earliestMeasurementTime, latestMeasurementTime, updated, causeOnly, numberOfCorrelations, outcome, rawMeasurementsAtLastAnalysis, numberOfRawMeasurements, lastUnit, lastValue, mostCommonValue, mostCommonUnit, lastSource, onsetDelayInHours, availableDefaultUnits, alias, clientId, earliestFillingTime, earliestSourceTime, experimentEndTime, experimentStartTime, fillingType, userVariableFillingValue, lastOriginalUnitId, lastOriginalValue, lastProcessedDailyValue, lastSuccessfulUpdateTime, lastUnitId, latestFillingTime, latestUserMeasurementTime, latestSourceTime, maximumRecordedValue, measurementsAtLastAnalysis, minimumRecordedValue, userVariableMostCommonConnectorId, numberOfChanges, numberOfProcessedDailyMeasurements, numberOfUniqueDailyValues, numberOfUserCorrelationsAsCause, numberOfUserCorrelationsAsEffect, outcomeOfInterest, parentId, predictorOfInterest, secondToLastValue, shareUserMeasurements, status, thirdToLastValue, userId, userVariableValence, variableId, userVariableWikipediaTitle, variableFillingValue, informationalUrl, commonVariableMostCommonConnectorId, price, productUrl, wikipediaTitle, commonVariableUpdatedAt, userVariableUpdatedAt, experimentStartTimeString, experimentStartTimeSeconds, experimentEndTimeString, experimentEndTimeSeconds, meanInUserVariableDefaultUnit, lastValueInUserVariableDefaultUnit, secondToLastValueInUserVariableDefaultUnit, thirdToLastValueInUserVariableDefaultUnit, mostCommonValueInUserVariableDefaultUnit, secondMostCommonValueInUserVariableDefaultUnit, thirdMostCommonValueInUserVariableDefaultUnit, chartsLinkStatic, chartsLinkDynamic, chartsLinkFacebook, chartsLinkGoogle, chartsLinkTwitter, chartsLinkEmail, userTagVariables, userTaggedVariables, joinedUserTagVariables, ingredientUserTagVariables, ingredientOfUserTagVariables, childUserTagVariables, parentUserTagVariables, commonTagVariables, commonTaggedVariables, dataSource) {
    var _this = this;


    _this['name'] = name;
    _this['variableCategoryName'] = variableCategoryName;
    _this['defaultUnitAbbreviatedName'] = defaultUnitAbbreviatedName;
    _this['defaultUnitId'] = defaultUnitId;
    _this['sources'] = sources;
    _this['minimumAllowedValue'] = minimumAllowedValue;
    _this['maximumAllowedValue'] = maximumAllowedValue;
    _this['combinationOperation'] = combinationOperation;
    _this['fillingValue'] = fillingValue;
    _this['joinWith'] = joinWith;
    _this['joinedVariables'] = joinedVariables;
    _this['parent'] = parent;
    _this['subVariables'] = subVariables;
    _this['onsetDelay'] = onsetDelay;
    _this['durationOfAction'] = durationOfAction;
    _this['earliestMeasurementTime'] = earliestMeasurementTime;
    _this['latestMeasurementTime'] = latestMeasurementTime;
    _this['updated'] = updated;
    _this['causeOnly'] = causeOnly;
    _this['numberOfCorrelations'] = numberOfCorrelations;
    _this['outcome'] = outcome;
    _this['rawMeasurementsAtLastAnalysis'] = rawMeasurementsAtLastAnalysis;
    _this['numberOfRawMeasurements'] = numberOfRawMeasurements;
    _this['lastUnit'] = lastUnit;
    _this['lastValue'] = lastValue;
    _this['mostCommonValue'] = mostCommonValue;
    _this['mostCommonUnit'] = mostCommonUnit;
    _this['lastSource'] = lastSource;

















































    _this['onsetDelayInHours'] = onsetDelayInHours;
    _this['availableDefaultUnits'] = availableDefaultUnits;
    _this['alias'] = alias;
    _this['clientId'] = clientId;
    _this['earliestFillingTime'] = earliestFillingTime;
    _this['earliestSourceTime'] = earliestSourceTime;
    _this['experimentEndTime'] = experimentEndTime;
    _this['experimentStartTime'] = experimentStartTime;
    _this['fillingType'] = fillingType;
    _this['userVariableFillingValue'] = userVariableFillingValue;
    _this['lastOriginalUnitId'] = lastOriginalUnitId;
    _this['lastOriginalValue'] = lastOriginalValue;
    _this['lastProcessedDailyValue'] = lastProcessedDailyValue;
    _this['lastSuccessfulUpdateTime'] = lastSuccessfulUpdateTime;
    _this['lastUnitId'] = lastUnitId;
    _this['latestFillingTime'] = latestFillingTime;
    _this['latestUserMeasurementTime'] = latestUserMeasurementTime;
    _this['latestSourceTime'] = latestSourceTime;
    _this['maximumRecordedValue'] = maximumRecordedValue;
    _this['measurementsAtLastAnalysis'] = measurementsAtLastAnalysis;
    _this['minimumRecordedValue'] = minimumRecordedValue;
    _this['userVariableMostCommonConnectorId'] = userVariableMostCommonConnectorId;
    _this['numberOfChanges'] = numberOfChanges;
    _this['numberOfProcessedDailyMeasurements'] = numberOfProcessedDailyMeasurements;
    _this['numberOfUniqueDailyValues'] = numberOfUniqueDailyValues;
    _this['numberOfUserCorrelationsAsCause'] = numberOfUserCorrelationsAsCause;
    _this['numberOfUserCorrelationsAsEffect'] = numberOfUserCorrelationsAsEffect;
    _this['outcomeOfInterest'] = outcomeOfInterest;
    _this['parentId'] = parentId;
    _this['predictorOfInterest'] = predictorOfInterest;
    _this['secondToLastValue'] = secondToLastValue;
    _this['shareUserMeasurements'] = shareUserMeasurements;
    _this['status'] = status;
    _this['thirdToLastValue'] = thirdToLastValue;
    _this['userId'] = userId;
    _this['userVariableValence'] = userVariableValence;
    _this['variableId'] = variableId;
    _this['userVariableWikipediaTitle'] = userVariableWikipediaTitle;
    _this['variableFillingValue'] = variableFillingValue;
    _this['informationalUrl'] = informationalUrl;
    _this['commonVariableMostCommonConnectorId'] = commonVariableMostCommonConnectorId;
    _this['price'] = price;
    _this['productUrl'] = productUrl;
    _this['wikipediaTitle'] = wikipediaTitle;
    _this['commonVariableUpdatedAt'] = commonVariableUpdatedAt;
    _this['userVariableUpdatedAt'] = userVariableUpdatedAt;
    _this['experimentStartTimeString'] = experimentStartTimeString;
    _this['experimentStartTimeSeconds'] = experimentStartTimeSeconds;
    _this['experimentEndTimeString'] = experimentEndTimeString;
    _this['experimentEndTimeSeconds'] = experimentEndTimeSeconds;
    _this['meanInUserVariableDefaultUnit'] = meanInUserVariableDefaultUnit;
    _this['lastValueInUserVariableDefaultUnit'] = lastValueInUserVariableDefaultUnit;
    _this['secondToLastValueInUserVariableDefaultUnit'] = secondToLastValueInUserVariableDefaultUnit;
    _this['thirdToLastValueInUserVariableDefaultUnit'] = thirdToLastValueInUserVariableDefaultUnit;
    _this['mostCommonValueInUserVariableDefaultUnit'] = mostCommonValueInUserVariableDefaultUnit;
    _this['secondMostCommonValueInUserVariableDefaultUnit'] = secondMostCommonValueInUserVariableDefaultUnit;
    _this['thirdMostCommonValueInUserVariableDefaultUnit'] = thirdMostCommonValueInUserVariableDefaultUnit;
    _this['chartsLinkStatic'] = chartsLinkStatic;
    _this['chartsLinkDynamic'] = chartsLinkDynamic;
    _this['chartsLinkFacebook'] = chartsLinkFacebook;
    _this['chartsLinkGoogle'] = chartsLinkGoogle;
    _this['chartsLinkTwitter'] = chartsLinkTwitter;
    _this['chartsLinkEmail'] = chartsLinkEmail;
    _this['userTagVariables'] = userTagVariables;
    _this['userTaggedVariables'] = userTaggedVariables;
    _this['joinedUserTagVariables'] = joinedUserTagVariables;
    _this['ingredientUserTagVariables'] = ingredientUserTagVariables;
    _this['ingredientOfUserTagVariables'] = ingredientOfUserTagVariables;
    _this['childUserTagVariables'] = childUserTagVariables;
    _this['parentUserTagVariables'] = parentUserTagVariables;
    _this['commonTagVariables'] = commonTagVariables;
    _this['commonTaggedVariables'] = commonTaggedVariables;
    _this['dataSource'] = dataSource;
  };

  /**
   * Constructs a <code>Variable</code> from a plain JavaScript object, optionally creating a new instance.
   * Copies all relevant properties from <code>data</code> to <code>obj</code> if supplied or a new instance if not.
   * @param {Object} data The plain JavaScript object bearing properties of interest.
   * @param {module:model/Variable} obj Optional instance to populate.
   * @return {module:model/Variable} The populated <code>Variable</code> instance.
   */
  exports.constructFromObject = function(data, obj) {
    if (data) {
      obj = obj || new exports();

      if (data.hasOwnProperty('id')) {
        obj['id'] = ApiClient.convertToType(data['id'], 'Number');
      }
      if (data.hasOwnProperty('name')) {
        obj['name'] = ApiClient.convertToType(data['name'], 'String');
      }
      if (data.hasOwnProperty('variableCategoryName')) {
        obj['variableCategoryName'] = ApiClient.convertToType(data['variableCategoryName'], 'String');
      }
      if (data.hasOwnProperty('defaultUnitAbbreviatedName')) {
        obj['defaultUnitAbbreviatedName'] = ApiClient.convertToType(data['defaultUnitAbbreviatedName'], 'String');
      }
      if (data.hasOwnProperty('defaultUnitId')) {
        obj['defaultUnitId'] = ApiClient.convertToType(data['defaultUnitId'], 'Number');
      }
      if (data.hasOwnProperty('sources')) {
        obj['sources'] = ApiClient.convertToType(data['sources'], 'String');
      }
      if (data.hasOwnProperty('minimumAllowedValue')) {
        obj['minimumAllowedValue'] = ApiClient.convertToType(data['minimumAllowedValue'], 'Number');
      }
      if (data.hasOwnProperty('maximumAllowedValue')) {
        obj['maximumAllowedValue'] = ApiClient.convertToType(data['maximumAllowedValue'], 'Number');
      }
      if (data.hasOwnProperty('combinationOperation')) {
        obj['combinationOperation'] = ApiClient.convertToType(data['combinationOperation'], 'String');
      }
      if (data.hasOwnProperty('fillingValue')) {
        obj['fillingValue'] = ApiClient.convertToType(data['fillingValue'], 'Number');
      }
      if (data.hasOwnProperty('joinWith')) {
        obj['joinWith'] = ApiClient.convertToType(data['joinWith'], 'String');
      }
      if (data.hasOwnProperty('joinedVariables')) {
        obj['joinedVariables'] = ApiClient.convertToType(data['joinedVariables'], [Variable]);
      }
      if (data.hasOwnProperty('parent')) {
        obj['parent'] = ApiClient.convertToType(data['parent'], 'Number');
      }
      if (data.hasOwnProperty('subVariables')) {
        obj['subVariables'] = ApiClient.convertToType(data['subVariables'], [Variable]);
      }
      if (data.hasOwnProperty('onsetDelay')) {
        obj['onsetDelay'] = ApiClient.convertToType(data['onsetDelay'], 'Number');
      }
      if (data.hasOwnProperty('durationOfAction')) {
        obj['durationOfAction'] = ApiClient.convertToType(data['durationOfAction'], 'Number');
      }
      if (data.hasOwnProperty('earliestMeasurementTime')) {
        obj['earliestMeasurementTime'] = ApiClient.convertToType(data['earliestMeasurementTime'], 'Number');
      }
      if (data.hasOwnProperty('latestMeasurementTime')) {
        obj['latestMeasurementTime'] = ApiClient.convertToType(data['latestMeasurementTime'], 'Number');
      }
      if (data.hasOwnProperty('updated')) {
        obj['updated'] = ApiClient.convertToType(data['updated'], 'Number');
      }
      if (data.hasOwnProperty('causeOnly')) {
        obj['causeOnly'] = ApiClient.convertToType(data['causeOnly'], 'Number');
      }
      if (data.hasOwnProperty('numberOfCorrelations')) {
        obj['numberOfCorrelations'] = ApiClient.convertToType(data['numberOfCorrelations'], 'Number');
      }
      if (data.hasOwnProperty('outcome')) {
        obj['outcome'] = ApiClient.convertToType(data['outcome'], 'Number');
      }
      if (data.hasOwnProperty('rawMeasurementsAtLastAnalysis')) {
        obj['rawMeasurementsAtLastAnalysis'] = ApiClient.convertToType(data['rawMeasurementsAtLastAnalysis'], 'Number');
      }
      if (data.hasOwnProperty('numberOfRawMeasurements')) {
        obj['numberOfRawMeasurements'] = ApiClient.convertToType(data['numberOfRawMeasurements'], 'Number');
      }
      if (data.hasOwnProperty('lastUnit')) {
        obj['lastUnit'] = ApiClient.convertToType(data['lastUnit'], 'String');
      }
      if (data.hasOwnProperty('lastValue')) {
        obj['lastValue'] = ApiClient.convertToType(data['lastValue'], 'Number');
      }
      if (data.hasOwnProperty('mostCommonValue')) {
        obj['mostCommonValue'] = ApiClient.convertToType(data['mostCommonValue'], 'Number');
      }
      if (data.hasOwnProperty('mostCommonUnit')) {
        obj['mostCommonUnit'] = ApiClient.convertToType(data['mostCommonUnit'], 'String');
      }
      if (data.hasOwnProperty('lastSource')) {
        obj['lastSource'] = ApiClient.convertToType(data['lastSource'], 'Number');
      }
      if (data.hasOwnProperty('imageUrl')) {
        obj['imageUrl'] = ApiClient.convertToType(data['imageUrl'], 'String');
      }
      if (data.hasOwnProperty('ionIcon')) {
        obj['ionIcon'] = ApiClient.convertToType(data['ionIcon'], 'String');
      }
      if (data.hasOwnProperty('createdAt')) {
        obj['createdAt'] = ApiClient.convertToType(data['createdAt'], 'Date');
      }
      if (data.hasOwnProperty('unitId')) {
        obj['unitId'] = ApiClient.convertToType(data['unitId'], 'Number');
      }
      if (data.hasOwnProperty('kurtosis')) {
        obj['kurtosis'] = ApiClient.convertToType(data['kurtosis'], 'Number');
      }
      if (data.hasOwnProperty('mean')) {
        obj['mean'] = ApiClient.convertToType(data['mean'], 'Number');
      }
      if (data.hasOwnProperty('median')) {
        obj['median'] = ApiClient.convertToType(data['median'], 'Number');
      }
      if (data.hasOwnProperty('mostCommonConnectorId')) {
        obj['mostCommonConnectorId'] = ApiClient.convertToType(data['mostCommonConnectorId'], 'Number');
      }
      if (data.hasOwnProperty('mostCommonOriginalUnitId')) {
        obj['mostCommonOriginalUnitId'] = ApiClient.convertToType(data['mostCommonOriginalUnitId'], 'Number');
      }
      if (data.hasOwnProperty('numberOfAggregateCorrelationsAsCause')) {
        obj['numberOfAggregateCorrelationsAsCause'] = ApiClient.convertToType(data['numberOfAggregateCorrelationsAsCause'], 'Number');
      }
      if (data.hasOwnProperty('numberOfAggregateCorrelationsAsEffect')) {
        obj['numberOfAggregateCorrelationsAsEffect'] = ApiClient.convertToType(data['numberOfAggregateCorrelationsAsEffect'], 'Number');
      }
      if (data.hasOwnProperty('numberOfTrackingReminders')) {
        obj['numberOfTrackingReminders'] = ApiClient.convertToType(data['numberOfTrackingReminders'], 'Number');
      }
      if (data.hasOwnProperty('numberOfUniqueValues')) {
        obj['numberOfUniqueValues'] = ApiClient.convertToType(data['numberOfUniqueValues'], 'Number');
      }
      if (data.hasOwnProperty('numberOfUserVariables')) {
        obj['numberOfUserVariables'] = ApiClient.convertToType(data['numberOfUserVariables'], 'Number');
      }
      if (data.hasOwnProperty('secondMostCommonValue')) {
        obj['secondMostCommonValue'] = ApiClient.convertToType(data['secondMostCommonValue'], 'Number');
      }
      if (data.hasOwnProperty('skewness')) {
        obj['skewness'] = ApiClient.convertToType(data['skewness'], 'Number');
      }
      if (data.hasOwnProperty('standardDeviation')) {
        obj['standardDeviation'] = ApiClient.convertToType(data['standardDeviation'], 'Number');
      }
      if (data.hasOwnProperty('thirdMostCommonValue')) {
        obj['thirdMostCommonValue'] = ApiClient.convertToType(data['thirdMostCommonValue'], 'Number');
      }
      if (data.hasOwnProperty('updatedAt')) {
        obj['updatedAt'] = ApiClient.convertToType(data['updatedAt'], 'Date');
      }
      if (data.hasOwnProperty('variableCategoryId')) {
        obj['variableCategoryId'] = ApiClient.convertToType(data['variableCategoryId'], 'Number');
      }
      if (data.hasOwnProperty('variance')) {
        obj['variance'] = ApiClient.convertToType(data['variance'], 'Number');
      }
      if (data.hasOwnProperty('public')) {
        obj['public'] = ApiClient.convertToType(data['public'], 'Boolean');
      }
      if (data.hasOwnProperty('userVariableVariableCategoryId')) {
        obj['userVariableVariableCategoryId'] = ApiClient.convertToType(data['userVariableVariableCategoryId'], 'Number');
      }
      if (data.hasOwnProperty('svgUrl')) {
        obj['svgUrl'] = ApiClient.convertToType(data['svgUrl'], 'String');
      }
      if (data.hasOwnProperty('pngUrl')) {
        obj['pngUrl'] = ApiClient.convertToType(data['pngUrl'], 'String');
      }
      if (data.hasOwnProperty('pngPath')) {
        obj['pngPath'] = ApiClient.convertToType(data['pngPath'], 'String');
      }
      if (data.hasOwnProperty('variableCategoryImageUrl')) {
        obj['variableCategoryImageUrl'] = ApiClient.convertToType(data['variableCategoryImageUrl'], 'String');
      }
      if (data.hasOwnProperty('manualTracking')) {
        obj['manualTracking'] = ApiClient.convertToType(data['manualTracking'], 'Boolean');
      }
      if (data.hasOwnProperty('userVariableVariableCategoryName')) {
        obj['userVariableVariableCategoryName'] = ApiClient.convertToType(data['userVariableVariableCategoryName'], 'String');
      }
      if (data.hasOwnProperty('category')) {
        obj['category'] = ApiClient.convertToType(data['category'], 'String');
      }
      if (data.hasOwnProperty('durationOfActionInHours')) {
        obj['durationOfActionInHours'] = ApiClient.convertToType(data['durationOfActionInHours'], 'Number');
      }
      if (data.hasOwnProperty('variableName')) {
        obj['variableName'] = ApiClient.convertToType(data['variableName'], 'String');
      }
      if (data.hasOwnProperty('numberOfMeasurements')) {
        obj['numberOfMeasurements'] = ApiClient.convertToType(data['numberOfMeasurements'], 'Number');
      }
      if (data.hasOwnProperty('unitName')) {
        obj['unitName'] = ApiClient.convertToType(data['unitName'], 'String');
      }
      if (data.hasOwnProperty('unitAbbreviatedName')) {
        obj['unitAbbreviatedName'] = ApiClient.convertToType(data['unitAbbreviatedName'], 'String');
      }
      if (data.hasOwnProperty('unitCategoryId')) {
        obj['unitCategoryId'] = ApiClient.convertToType(data['unitCategoryId'], 'Number');
      }
      if (data.hasOwnProperty('unitCategoryName')) {
        obj['unitCategoryName'] = ApiClient.convertToType(data['unitCategoryName'], 'String');
      }
      if (data.hasOwnProperty('defaultUnitName')) {
        obj['defaultUnitName'] = ApiClient.convertToType(data['defaultUnitName'], 'String');
      }
      if (data.hasOwnProperty('defaultUnitCategoryId')) {
        obj['defaultUnitCategoryId'] = ApiClient.convertToType(data['defaultUnitCategoryId'], 'Number');
      }
      if (data.hasOwnProperty('defaultUnitCategoryName')) {
        obj['defaultUnitCategoryName'] = ApiClient.convertToType(data['defaultUnitCategoryName'], 'String');
      }
      if (data.hasOwnProperty('userVariableDefaultUnitId')) {
        obj['userVariableDefaultUnitId'] = ApiClient.convertToType(data['userVariableDefaultUnitId'], 'Number');
      }
      if (data.hasOwnProperty('userVariableDefaultUnitName')) {
        obj['userVariableDefaultUnitName'] = ApiClient.convertToType(data['userVariableDefaultUnitName'], 'String');
      }
      if (data.hasOwnProperty('userVariableDefaultUnitAbbreviatedName')) {
        obj['userVariableDefaultUnitAbbreviatedName'] = ApiClient.convertToType(data['userVariableDefaultUnitAbbreviatedName'], 'String');
      }
      if (data.hasOwnProperty('userVariableDefaultUnitCategoryId')) {
        obj['userVariableDefaultUnitCategoryId'] = ApiClient.convertToType(data['userVariableDefaultUnitCategoryId'], 'Number');
      }
      if (data.hasOwnProperty('userVariableDefaultUnitCategoryName')) {
        obj['userVariableDefaultUnitCategoryName'] = ApiClient.convertToType(data['userVariableDefaultUnitCategoryName'], 'String');
      }
      if (data.hasOwnProperty('inputType')) {
        obj['inputType'] = ApiClient.convertToType(data['inputType'], 'String');
      }
      if (data.hasOwnProperty('commonAlias')) {
        obj['commonAlias'] = ApiClient.convertToType(data['commonAlias'], 'String');
      }
      if (data.hasOwnProperty('description')) {
        obj['description'] = ApiClient.convertToType(data['description'], 'String');
      }
      if (data.hasOwnProperty('valence')) {
        obj['valence'] = ApiClient.convertToType(data['valence'], 'String');
      }
      if (data.hasOwnProperty('onsetDelayInHours')) {
        obj['onsetDelayInHours'] = ApiClient.convertToType(data['onsetDelayInHours'], 'Number');
      }
      if (data.hasOwnProperty('availableDefaultUnits')) {
        obj['availableDefaultUnits'] = ApiClient.convertToType(data['availableDefaultUnits'], [Unit]);
      }
      if (data.hasOwnProperty('alias')) {
        obj['alias'] = ApiClient.convertToType(data['alias'], 'String');
      }
      if (data.hasOwnProperty('clientId')) {
        obj['clientId'] = ApiClient.convertToType(data['clientId'], 'String');
      }
      if (data.hasOwnProperty('earliestFillingTime')) {
        obj['earliestFillingTime'] = ApiClient.convertToType(data['earliestFillingTime'], 'Number');
      }
      if (data.hasOwnProperty('earliestSourceTime')) {
        obj['earliestSourceTime'] = ApiClient.convertToType(data['earliestSourceTime'], 'Number');
      }
      if (data.hasOwnProperty('experimentEndTime')) {
        obj['experimentEndTime'] = ApiClient.convertToType(data['experimentEndTime'], 'Date');
      }
      if (data.hasOwnProperty('experimentStartTime')) {
        obj['experimentStartTime'] = ApiClient.convertToType(data['experimentStartTime'], 'Date');
      }
      if (data.hasOwnProperty('fillingType')) {
        obj['fillingType'] = ApiClient.convertToType(data['fillingType'], 'String');
      }
      if (data.hasOwnProperty('userVariableFillingValue')) {
        obj['userVariableFillingValue'] = ApiClient.convertToType(data['userVariableFillingValue'], 'Number');
      }
      if (data.hasOwnProperty('lastOriginalUnitId')) {
        obj['lastOriginalUnitId'] = ApiClient.convertToType(data['lastOriginalUnitId'], 'Number');
      }
      if (data.hasOwnProperty('lastOriginalValue')) {
        obj['lastOriginalValue'] = ApiClient.convertToType(data['lastOriginalValue'], 'Number');
      }
      if (data.hasOwnProperty('lastProcessedDailyValue')) {
        obj['lastProcessedDailyValue'] = ApiClient.convertToType(data['lastProcessedDailyValue'], 'Number');
      }
      if (data.hasOwnProperty('lastSuccessfulUpdateTime')) {
        obj['lastSuccessfulUpdateTime'] = ApiClient.convertToType(data['lastSuccessfulUpdateTime'], 'Date');
      }
      if (data.hasOwnProperty('lastUnitId')) {
        obj['lastUnitId'] = ApiClient.convertToType(data['lastUnitId'], 'Number');
      }
      if (data.hasOwnProperty('latestFillingTime')) {
        obj['latestFillingTime'] = ApiClient.convertToType(data['latestFillingTime'], 'Number');
      }
      if (data.hasOwnProperty('latestUserMeasurementTime')) {
        obj['latestUserMeasurementTime'] = ApiClient.convertToType(data['latestUserMeasurementTime'], 'Number');
      }
      if (data.hasOwnProperty('latestSourceTime')) {
        obj['latestSourceTime'] = ApiClient.convertToType(data['latestSourceTime'], 'Number');
      }
      if (data.hasOwnProperty('maximumRecordedValue')) {
        obj['maximumRecordedValue'] = ApiClient.convertToType(data['maximumRecordedValue'], 'Number');
      }
      if (data.hasOwnProperty('measurementsAtLastAnalysis')) {
        obj['measurementsAtLastAnalysis'] = ApiClient.convertToType(data['measurementsAtLastAnalysis'], 'Number');
      }
      if (data.hasOwnProperty('minimumRecordedValue')) {
        obj['minimumRecordedValue'] = ApiClient.convertToType(data['minimumRecordedValue'], 'Number');
      }
      if (data.hasOwnProperty('userVariableMostCommonConnectorId')) {
        obj['userVariableMostCommonConnectorId'] = ApiClient.convertToType(data['userVariableMostCommonConnectorId'], 'Number');
      }
      if (data.hasOwnProperty('numberOfChanges')) {
        obj['numberOfChanges'] = ApiClient.convertToType(data['numberOfChanges'], 'Number');
      }
      if (data.hasOwnProperty('numberOfProcessedDailyMeasurements')) {
        obj['numberOfProcessedDailyMeasurements'] = ApiClient.convertToType(data['numberOfProcessedDailyMeasurements'], 'Number');
      }
      if (data.hasOwnProperty('numberOfUniqueDailyValues')) {
        obj['numberOfUniqueDailyValues'] = ApiClient.convertToType(data['numberOfUniqueDailyValues'], 'Number');
      }
      if (data.hasOwnProperty('numberOfUserCorrelationsAsCause')) {
        obj['numberOfUserCorrelationsAsCause'] = ApiClient.convertToType(data['numberOfUserCorrelationsAsCause'], 'Number');
      }
      if (data.hasOwnProperty('numberOfUserCorrelationsAsEffect')) {
        obj['numberOfUserCorrelationsAsEffect'] = ApiClient.convertToType(data['numberOfUserCorrelationsAsEffect'], 'Number');
      }
      if (data.hasOwnProperty('outcomeOfInterest')) {
        obj['outcomeOfInterest'] = ApiClient.convertToType(data['outcomeOfInterest'], 'Number');
      }
      if (data.hasOwnProperty('parentId')) {
        obj['parentId'] = ApiClient.convertToType(data['parentId'], 'String');
      }
      if (data.hasOwnProperty('predictorOfInterest')) {
        obj['predictorOfInterest'] = ApiClient.convertToType(data['predictorOfInterest'], 'Number');
      }
      if (data.hasOwnProperty('secondToLastValue')) {
        obj['secondToLastValue'] = ApiClient.convertToType(data['secondToLastValue'], 'Number');
      }
      if (data.hasOwnProperty('shareUserMeasurements')) {
        obj['shareUserMeasurements'] = ApiClient.convertToType(data['shareUserMeasurements'], 'Boolean');
      }
      if (data.hasOwnProperty('status')) {
        obj['status'] = ApiClient.convertToType(data['status'], 'String');
      }
      if (data.hasOwnProperty('thirdToLastValue')) {
        obj['thirdToLastValue'] = ApiClient.convertToType(data['thirdToLastValue'], 'Number');
      }
      if (data.hasOwnProperty('userId')) {
        obj['userId'] = ApiClient.convertToType(data['userId'], 'Number');
      }
      if (data.hasOwnProperty('userVariableValence')) {
        obj['userVariableValence'] = ApiClient.convertToType(data['userVariableValence'], 'String');
      }
      if (data.hasOwnProperty('variableId')) {
        obj['variableId'] = ApiClient.convertToType(data['variableId'], 'Number');
      }
      if (data.hasOwnProperty('userVariableWikipediaTitle')) {
        obj['userVariableWikipediaTitle'] = ApiClient.convertToType(data['userVariableWikipediaTitle'], 'String');
      }
      if (data.hasOwnProperty('variableFillingValue')) {
        obj['variableFillingValue'] = ApiClient.convertToType(data['variableFillingValue'], 'Number');
      }
      if (data.hasOwnProperty('informationalUrl')) {
        obj['informationalUrl'] = ApiClient.convertToType(data['informationalUrl'], 'String');
      }
      if (data.hasOwnProperty('commonVariableMostCommonConnectorId')) {
        obj['commonVariableMostCommonConnectorId'] = ApiClient.convertToType(data['commonVariableMostCommonConnectorId'], 'Number');
      }
      if (data.hasOwnProperty('price')) {
        obj['price'] = ApiClient.convertToType(data['price'], 'String');
      }
      if (data.hasOwnProperty('productUrl')) {
        obj['productUrl'] = ApiClient.convertToType(data['productUrl'], 'String');
      }
      if (data.hasOwnProperty('wikipediaTitle')) {
        obj['wikipediaTitle'] = ApiClient.convertToType(data['wikipediaTitle'], 'String');
      }
      if (data.hasOwnProperty('commonVariableUpdatedAt')) {
        obj['commonVariableUpdatedAt'] = ApiClient.convertToType(data['commonVariableUpdatedAt'], 'Date');
      }
      if (data.hasOwnProperty('userVariableUpdatedAt')) {
        obj['userVariableUpdatedAt'] = ApiClient.convertToType(data['userVariableUpdatedAt'], 'Date');
      }
      if (data.hasOwnProperty('experimentStartTimeString')) {
        obj['experimentStartTimeString'] = ApiClient.convertToType(data['experimentStartTimeString'], 'Date');
      }
      if (data.hasOwnProperty('experimentStartTimeSeconds')) {
        obj['experimentStartTimeSeconds'] = ApiClient.convertToType(data['experimentStartTimeSeconds'], 'Date');
      }
      if (data.hasOwnProperty('experimentEndTimeString')) {
        obj['experimentEndTimeString'] = ApiClient.convertToType(data['experimentEndTimeString'], 'Date');
      }
      if (data.hasOwnProperty('experimentEndTimeSeconds')) {
        obj['experimentEndTimeSeconds'] = ApiClient.convertToType(data['experimentEndTimeSeconds'], 'Date');
      }
      if (data.hasOwnProperty('meanInUserVariableDefaultUnit')) {
        obj['meanInUserVariableDefaultUnit'] = ApiClient.convertToType(data['meanInUserVariableDefaultUnit'], 'Number');
      }
      if (data.hasOwnProperty('lastValueInUserVariableDefaultUnit')) {
        obj['lastValueInUserVariableDefaultUnit'] = ApiClient.convertToType(data['lastValueInUserVariableDefaultUnit'], 'Number');
      }
      if (data.hasOwnProperty('secondToLastValueInUserVariableDefaultUnit')) {
        obj['secondToLastValueInUserVariableDefaultUnit'] = ApiClient.convertToType(data['secondToLastValueInUserVariableDefaultUnit'], 'Number');
      }
      if (data.hasOwnProperty('thirdToLastValueInUserVariableDefaultUnit')) {
        obj['thirdToLastValueInUserVariableDefaultUnit'] = ApiClient.convertToType(data['thirdToLastValueInUserVariableDefaultUnit'], 'Number');
      }
      if (data.hasOwnProperty('mostCommonValueInUserVariableDefaultUnit')) {
        obj['mostCommonValueInUserVariableDefaultUnit'] = ApiClient.convertToType(data['mostCommonValueInUserVariableDefaultUnit'], 'Number');
      }
      if (data.hasOwnProperty('secondMostCommonValueInUserVariableDefaultUnit')) {
        obj['secondMostCommonValueInUserVariableDefaultUnit'] = ApiClient.convertToType(data['secondMostCommonValueInUserVariableDefaultUnit'], 'Number');
      }
      if (data.hasOwnProperty('thirdMostCommonValueInUserVariableDefaultUnit')) {
        obj['thirdMostCommonValueInUserVariableDefaultUnit'] = ApiClient.convertToType(data['thirdMostCommonValueInUserVariableDefaultUnit'], 'Number');
      }
      if (data.hasOwnProperty('chartsLinkStatic')) {
        obj['chartsLinkStatic'] = ApiClient.convertToType(data['chartsLinkStatic'], 'String');
      }
      if (data.hasOwnProperty('chartsLinkDynamic')) {
        obj['chartsLinkDynamic'] = ApiClient.convertToType(data['chartsLinkDynamic'], 'String');
      }
      if (data.hasOwnProperty('chartsLinkFacebook')) {
        obj['chartsLinkFacebook'] = ApiClient.convertToType(data['chartsLinkFacebook'], 'String');
      }
      if (data.hasOwnProperty('chartsLinkGoogle')) {
        obj['chartsLinkGoogle'] = ApiClient.convertToType(data['chartsLinkGoogle'], 'String');
      }
      if (data.hasOwnProperty('chartsLinkTwitter')) {
        obj['chartsLinkTwitter'] = ApiClient.convertToType(data['chartsLinkTwitter'], 'String');
      }
      if (data.hasOwnProperty('chartsLinkEmail')) {
        obj['chartsLinkEmail'] = ApiClient.convertToType(data['chartsLinkEmail'], 'String');
      }
      if (data.hasOwnProperty('userTagVariables')) {
        obj['userTagVariables'] = UserVariable.constructFromObject(data['userTagVariables']);
      }
      if (data.hasOwnProperty('userTaggedVariables')) {
        obj['userTaggedVariables'] = UserVariable.constructFromObject(data['userTaggedVariables']);
      }
      if (data.hasOwnProperty('joinedUserTagVariables')) {
        obj['joinedUserTagVariables'] = UserVariable.constructFromObject(data['joinedUserTagVariables']);
      }
      if (data.hasOwnProperty('ingredientUserTagVariables')) {
        obj['ingredientUserTagVariables'] = UserVariable.constructFromObject(data['ingredientUserTagVariables']);
      }
      if (data.hasOwnProperty('ingredientOfUserTagVariables')) {
        obj['ingredientOfUserTagVariables'] = UserVariable.constructFromObject(data['ingredientOfUserTagVariables']);
      }
      if (data.hasOwnProperty('childUserTagVariables')) {
        obj['childUserTagVariables'] = UserVariable.constructFromObject(data['childUserTagVariables']);
      }
      if (data.hasOwnProperty('parentUserTagVariables')) {
        obj['parentUserTagVariables'] = UserVariable.constructFromObject(data['parentUserTagVariables']);
      }
      if (data.hasOwnProperty('commonTagVariables')) {
        obj['commonTagVariables'] = Variable.constructFromObject(data['commonTagVariables']);
      }
      if (data.hasOwnProperty('commonTaggedVariables')) {
        obj['commonTaggedVariables'] = Variable.constructFromObject(data['commonTaggedVariables']);
      }
      if (data.hasOwnProperty('dataSource')) {
        obj['dataSource'] = DataSource.constructFromObject(data['dataSource']);
      }
    }
    return obj;
  }

  /**
   * Variable ID
   * @member {Number} id
   */
  exports.prototype['id'] = undefined;
  /**
   * User-defined variable display name.
   * @member {String} name
   */
  exports.prototype['name'] = undefined;
  /**
   * Variable category like Mood, Sleep, Physical Activity, Treatment, Symptom, etc.
   * @member {String} variableCategoryName
   */
  exports.prototype['variableCategoryName'] = undefined;
  /**
   * Abbreviated name of the default unit for the variable
   * @member {String} defaultUnitAbbreviatedName
   */
  exports.prototype['defaultUnitAbbreviatedName'] = undefined;
  /**
   * Id of the default unit for the variable
   * @member {Number} defaultUnitId
   */
  exports.prototype['defaultUnitId'] = undefined;
  /**
   * Comma-separated list of source names to limit variables to those sources
   * @member {String} sources
   */
  exports.prototype['sources'] = undefined;
  /**
   * The minimum allowed value for measurements. While you can record a value below this minimum, it will be excluded from the correlation analysis.
   * @member {Number} minimumAllowedValue
   */
  exports.prototype['minimumAllowedValue'] = undefined;
  /**
   * The maximum allowed value for measurements. While you can record a value above this maximum, it will be excluded from the correlation analysis.
   * @member {Number} maximumAllowedValue
   */
  exports.prototype['maximumAllowedValue'] = undefined;
  /**
   * Way to aggregate measurements over time. Options are \"MEAN\" or \"SUM\". SUM should be used for things like minutes of exercise.  If you use MEAN for exercise, then a person might exercise more minutes in one day but add separate measurements that were smaller.  So when we are doing correlational analysis, we would think that the person exercised less that day even though they exercised more.  Conversely, we must use MEAN for things such as ratings which cannot be SUMMED.
   * @member {module:model/Variable.CombinationOperationEnum} combinationOperation
   */
  exports.prototype['combinationOperation'] = undefined;
  /**
   * When it comes to analysis to determine the effects of this variable, knowing when it did not occur is as important as knowing when it did occur. For example, if you are tracking a medication, it is important to know when you did not take it, but you do not have to log zero values for all the days when you haven't taken it. Hence, you can specify a filling value (typically 0) to insert whenever data is missing.
   * @member {Number} fillingValue
   */
  exports.prototype['fillingValue'] = undefined;
  /**
   * The Variable this Variable should be joined with. If the variable is joined with some other variable then it is not shown to user in the list of variables.
   * @member {String} joinWith
   */
  exports.prototype['joinWith'] = undefined;
  /**
   * Array of Variables that are joined with this Variable
   * @member {Array.<module:model/Variable>} joinedVariables
   */
  exports.prototype['joinedVariables'] = undefined;
  /**
   * Id of the parent variable if this variable has any parent
   * @member {Number} parent
   */
  exports.prototype['parent'] = undefined;
  /**
   * Array of Variables that are sub variables to this Variable
   * @member {Array.<module:model/Variable>} subVariables
   */
  exports.prototype['subVariables'] = undefined;
  /**
   * The amount of time in seconds that elapses after the predictor/stimulus event before the outcome as perceived by a self-tracker is known as the onset delay. For example, the onset delay between the time a person takes an aspirin (predictor/stimulus event) and the time a person perceives a change in their headache severity (outcome) is approximately 30 minutes.
   * @member {Number} onsetDelay
   */
  exports.prototype['onsetDelay'] = undefined;
  /**
   * The amount of time over which a predictor/stimulus event can exert an observable influence on an outcome variable value. For instance, aspirin (stimulus/predictor) typically decreases headache severity for approximately four hours (duration of action) following the onset delay.
   * @member {Number} durationOfAction
   */
  exports.prototype['durationOfAction'] = undefined;
  /**
   * Earliest measurement time
   * @member {Number} earliestMeasurementTime
   */
  exports.prototype['earliestMeasurementTime'] = undefined;
  /**
   * Latest measurement time
   * @member {Number} latestMeasurementTime
   */
  exports.prototype['latestMeasurementTime'] = undefined;
  /**
   * When this variable or its settings were last updated
   * @member {Number} updated
   */
  exports.prototype['updated'] = undefined;
  /**
   * A value of 1 indicates that this variable is generally a cause in a causal relationship.  An example of a causeOnly variable would be a variable such as Cloud Cover which would generally not be influenced by the behaviour of the user.
   * @member {Number} causeOnly
   */
  exports.prototype['causeOnly'] = undefined;
  /**
   * Number of correlations
   * @member {Number} numberOfCorrelations
   */
  exports.prototype['numberOfCorrelations'] = undefined;
  /**
   * Outcome variables (those with `outcome` == 1) are variables for which a human would generally want to identify the influencing factors. These include symptoms of illness, physique, mood, cognitive performance, etc.  Generally correlation calculations are only performed on outcome variables.
   * @member {Number} outcome
   */
  exports.prototype['outcome'] = undefined;
  /**
   * The number of measurements that a given user had for this variable the last time a correlation calculation was performed. Generally correlation values are only updated once the current number of measurements for a variable is more than 10% greater than the rawMeasurementsAtLastAnalysis.  This avoids a computationally-demanding recalculation when there's not enough new data to make a significant difference in the correlation.
   * @member {Number} rawMeasurementsAtLastAnalysis
   */
  exports.prototype['rawMeasurementsAtLastAnalysis'] = undefined;
  /**
   * Number of measurements
   * @member {Number} numberOfRawMeasurements
   */
  exports.prototype['numberOfRawMeasurements'] = undefined;
  /**
   * Last unit
   * @member {String} lastUnit
   */
  exports.prototype['lastUnit'] = undefined;
  /**
   * Last value
   * @member {Number} lastValue
   */
  exports.prototype['lastValue'] = undefined;
  /**
   * Most common value
   * @member {Number} mostCommonValue
   */
  exports.prototype['mostCommonValue'] = undefined;
  /**
   * Most common unit
   * @member {String} mostCommonUnit
   */
  exports.prototype['mostCommonUnit'] = undefined;
  /**
   * Last source
   * @member {Number} lastSource
   */
  exports.prototype['lastSource'] = undefined;
  /**
   * 
   * @member {String} imageUrl
   */
  exports.prototype['imageUrl'] = undefined;
  /**
   * 
   * @member {String} ionIcon
   */
  exports.prototype['ionIcon'] = undefined;
  /**
   * Example: 2014-10-23 03:41:06
   * @member {Date} createdAt
   */
  exports.prototype['createdAt'] = undefined;
  /**
   * Example: 34
   * @member {Number} unitId
   */
  exports.prototype['unitId'] = undefined;
  /**
   * Example: 10.764488721491
   * @member {Number} kurtosis
   */
  exports.prototype['kurtosis'] = undefined;
  /**
   * Example: 2202.3886251393
   * @member {Number} mean
   */
  exports.prototype['mean'] = undefined;
  /**
   * Example: 2255.9284755781
   * @member {Number} median
   */
  exports.prototype['median'] = undefined;
  /**
   * Example: 7
   * @member {Number} mostCommonConnectorId
   */
  exports.prototype['mostCommonConnectorId'] = undefined;
  /**
   * Example: 2
   * @member {Number} mostCommonOriginalUnitId
   */
  exports.prototype['mostCommonOriginalUnitId'] = undefined;
  /**
   * Example: 386
   * @member {Number} numberOfAggregateCorrelationsAsCause
   */
  exports.prototype['numberOfAggregateCorrelationsAsCause'] = undefined;
  /**
   * Example: 2074
   * @member {Number} numberOfAggregateCorrelationsAsEffect
   */
  exports.prototype['numberOfAggregateCorrelationsAsEffect'] = undefined;
  /**
   * Example: 6
   * @member {Number} numberOfTrackingReminders
   */
  exports.prototype['numberOfTrackingReminders'] = undefined;
  /**
   * Example: 74
   * @member {Number} numberOfUniqueValues
   */
  exports.prototype['numberOfUniqueValues'] = undefined;
  /**
   * Example: 307
   * @member {Number} numberOfUserVariables
   */
  exports.prototype['numberOfUserVariables'] = undefined;
  /**
   * Example: 8
   * @member {Number} secondMostCommonValue
   */
  exports.prototype['secondMostCommonValue'] = undefined;
  /**
   * Example: 0.2461351905455
   * @member {Number} skewness
   */
  exports.prototype['skewness'] = undefined;
  /**
   * Example: 1840.535129803
   * @member {Number} standardDeviation
   */
  exports.prototype['standardDeviation'] = undefined;
  /**
   * Example: 7
   * @member {Number} thirdMostCommonValue
   */
  exports.prototype['thirdMostCommonValue'] = undefined;
  /**
   * Example: 2017-07-31 03:57:06
   * @member {Date} updatedAt
   */
  exports.prototype['updatedAt'] = undefined;
  /**
   * Example: 6
   * @member {Number} variableCategoryId
   */
  exports.prototype['variableCategoryId'] = undefined;
  /**
   * Example: 115947037.40816
   * @member {Number} variance
   */
  exports.prototype['variance'] = undefined;
  /**
   * Example: 1
   * @member {Boolean} public
   */
  exports.prototype['public'] = undefined;
  /**
   * Example: 6
   * @member {Number} userVariableVariableCategoryId
   */
  exports.prototype['userVariableVariableCategoryId'] = undefined;
  /**
   * Example: https://app.quantimo.do/ionic/Modo/www/img/variable_categories/sleep.svg
   * @member {String} svgUrl
   */
  exports.prototype['svgUrl'] = undefined;
  /**
   * Example: https://app.quantimo.do/ionic/Modo/www/img/variable_categories/sleep.png
   * @member {String} pngUrl
   */
  exports.prototype['pngUrl'] = undefined;
  /**
   * Example: img/variable_categories/sleep.png
   * @member {String} pngPath
   */
  exports.prototype['pngPath'] = undefined;
  /**
   * Example: https://maxcdn.icons8.com/Color/PNG/96/Household/sleeping_in_bed-96.png
   * @member {String} variableCategoryImageUrl
   */
  exports.prototype['variableCategoryImageUrl'] = undefined;
  /**
   * Example: 1
   * @member {Boolean} manualTracking
   */
  exports.prototype['manualTracking'] = undefined;
  /**
   * Example: Sleep
   * @member {String} userVariableVariableCategoryName
   */
  exports.prototype['userVariableVariableCategoryName'] = undefined;
  /**
   * Example: Sleep
   * @member {String} category
   */
  exports.prototype['category'] = undefined;
  /**
   * Example: 168
   * @member {Number} durationOfActionInHours
   */
  exports.prototype['durationOfActionInHours'] = undefined;
  /**
   * Example: Sleep Duration
   * @member {String} variableName
   */
  exports.prototype['variableName'] = undefined;
  /**
   * Example: 308554
   * @member {Number} numberOfMeasurements
   */
  exports.prototype['numberOfMeasurements'] = undefined;
  /**
   * Example: Hours
   * @member {String} unitName
   */
  exports.prototype['unitName'] = undefined;
  /**
   * Example: h
   * @member {String} unitAbbreviatedName
   */
  exports.prototype['unitAbbreviatedName'] = undefined;
  /**
   * Example: 1
   * @member {Number} unitCategoryId
   */
  exports.prototype['unitCategoryId'] = undefined;
  /**
   * Example: Duration
   * @member {String} unitCategoryName
   */
  exports.prototype['unitCategoryName'] = undefined;
  /**
   * Example: Hours
   * @member {String} defaultUnitName
   */
  exports.prototype['defaultUnitName'] = undefined;
  /**
   * Example: 1
   * @member {Number} defaultUnitCategoryId
   */
  exports.prototype['defaultUnitCategoryId'] = undefined;
  /**
   * Example: Duration
   * @member {String} defaultUnitCategoryName
   */
  exports.prototype['defaultUnitCategoryName'] = undefined;
  /**
   * Example: 34
   * @member {Number} userVariableDefaultUnitId
   */
  exports.prototype['userVariableDefaultUnitId'] = undefined;
  /**
   * Example: Hours
   * @member {String} userVariableDefaultUnitName
   */
  exports.prototype['userVariableDefaultUnitName'] = undefined;
  /**
   * Example: h
   * @member {String} userVariableDefaultUnitAbbreviatedName
   */
  exports.prototype['userVariableDefaultUnitAbbreviatedName'] = undefined;
  /**
   * Example: 1
   * @member {Number} userVariableDefaultUnitCategoryId
   */
  exports.prototype['userVariableDefaultUnitCategoryId'] = undefined;
  /**
   * Example: Duration
   * @member {String} userVariableDefaultUnitCategoryName
   */
  exports.prototype['userVariableDefaultUnitCategoryName'] = undefined;
  /**
   * Example: slider
   * @member {String} inputType
   */
  exports.prototype['inputType'] = undefined;
  /**
   * Example: Mood_(psychology)
   * @member {String} commonAlias
   */
  exports.prototype['commonAlias'] = undefined;
  /**
   * Example: positive
   * @member {String} description
   */
  exports.prototype['description'] = undefined;
  /**
   * Example: positive
   * @member {String} valence
   */
  exports.prototype['valence'] = undefined;
  /**
   * Example: 0
   * @member {Number} onsetDelayInHours
   */
  exports.prototype['onsetDelayInHours'] = undefined;
  /**
   * @member {Array.<module:model/Unit>} availableDefaultUnits
   */
  exports.prototype['availableDefaultUnits'] = undefined;
  /**
   * Example: 
   * @member {String} alias
   */
  exports.prototype['alias'] = undefined;
  /**
   * Example: local
   * @member {String} clientId
   */
  exports.prototype['clientId'] = undefined;
  /**
   * Example: 1362099600
   * @member {Number} earliestFillingTime
   */
  exports.prototype['earliestFillingTime'] = undefined;
  /**
   * Example: 1334473200
   * @member {Number} earliestSourceTime
   */
  exports.prototype['earliestSourceTime'] = undefined;
  /**
   * Example: 
   * @member {Date} experimentEndTime
   */
  exports.prototype['experimentEndTime'] = undefined;
  /**
   * Example: 
   * @member {Date} experimentStartTime
   */
  exports.prototype['experimentStartTime'] = undefined;
  /**
   * Example: 
   * @member {String} fillingType
   */
  exports.prototype['fillingType'] = undefined;
  /**
   * Example: -1
   * @member {Number} userVariableFillingValue
   */
  exports.prototype['userVariableFillingValue'] = undefined;
  /**
   * Example: 47
   * @member {Number} lastOriginalUnitId
   */
  exports.prototype['lastOriginalUnitId'] = undefined;
  /**
   * Example: 100900
   * @member {Number} lastOriginalValue
   */
  exports.prototype['lastOriginalValue'] = undefined;
  /**
   * Example: 100900
   * @member {Number} lastProcessedDailyValue
   */
  exports.prototype['lastProcessedDailyValue'] = undefined;
  /**
   * Example: 2017-02-08 17:43:01
   * @member {Date} lastSuccessfulUpdateTime
   */
  exports.prototype['lastSuccessfulUpdateTime'] = undefined;
  /**
   * Example: 47
   * @member {Number} lastUnitId
   */
  exports.prototype['lastUnitId'] = undefined;
  /**
   * Example: 1501722000
   * @member {Number} latestFillingTime
   */
  exports.prototype['latestFillingTime'] = undefined;
  /**
   * Example: 1501722000
   * @member {Number} latestUserMeasurementTime
   */
  exports.prototype['latestUserMeasurementTime'] = undefined;
  /**
   * Example: 1501722000
   * @member {Number} latestSourceTime
   */
  exports.prototype['latestSourceTime'] = undefined;
  /**
   * Example: 104700
   * @member {Number} maximumRecordedValue
   */
  exports.prototype['maximumRecordedValue'] = undefined;
  /**
   * Example: 9795
   * @member {Number} measurementsAtLastAnalysis
   */
  exports.prototype['measurementsAtLastAnalysis'] = undefined;
  /**
   * Example: 1008.74
   * @member {Number} minimumRecordedValue
   */
  exports.prototype['minimumRecordedValue'] = undefined;
  /**
   * Example: 13
   * @member {Number} userVariableMostCommonConnectorId
   */
  exports.prototype['userVariableMostCommonConnectorId'] = undefined;
  /**
   * Example: 1317
   * @member {Number} numberOfChanges
   */
  exports.prototype['numberOfChanges'] = undefined;
  /**
   * Example: 1364
   * @member {Number} numberOfProcessedDailyMeasurements
   */
  exports.prototype['numberOfProcessedDailyMeasurements'] = undefined;
  /**
   * Example: 283
   * @member {Number} numberOfUniqueDailyValues
   */
  exports.prototype['numberOfUniqueDailyValues'] = undefined;
  /**
   * Example: 155
   * @member {Number} numberOfUserCorrelationsAsCause
   */
  exports.prototype['numberOfUserCorrelationsAsCause'] = undefined;
  /**
   * Example: 0
   * @member {Number} numberOfUserCorrelationsAsEffect
   */
  exports.prototype['numberOfUserCorrelationsAsEffect'] = undefined;
  /**
   * Example: 0
   * @member {Number} outcomeOfInterest
   */
  exports.prototype['outcomeOfInterest'] = undefined;
  /**
   * Example: 
   * @member {String} parentId
   */
  exports.prototype['parentId'] = undefined;
  /**
   * Example: 0
   * @member {Number} predictorOfInterest
   */
  exports.prototype['predictorOfInterest'] = undefined;
  /**
   * Example: 101800
   * @member {Number} secondToLastValue
   */
  exports.prototype['secondToLastValue'] = undefined;
  /**
   * Example: false
   * @member {Boolean} shareUserMeasurements
   */
  exports.prototype['shareUserMeasurements'] = undefined;
  /**
   * Example: UPDATED
   * @member {String} status
   */
  exports.prototype['status'] = undefined;
  /**
   * Example: 102000
   * @member {Number} thirdToLastValue
   */
  exports.prototype['thirdToLastValue'] = undefined;
  /**
   * Example: 230
   * @member {Number} userId
   */
  exports.prototype['userId'] = undefined;
  /**
   * Example: 
   * @member {String} userVariableValence
   */
  exports.prototype['userVariableValence'] = undefined;
  /**
   * Example: 96380
   * @member {Number} variableId
   */
  exports.prototype['variableId'] = undefined;
  /**
   * Example: 
   * @member {String} userVariableWikipediaTitle
   */
  exports.prototype['userVariableWikipediaTitle'] = undefined;
  /**
   * Example: -1
   * @member {Number} variableFillingValue
   */
  exports.prototype['variableFillingValue'] = undefined;
  /**
   * Example: 
   * @member {String} informationalUrl
   */
  exports.prototype['informationalUrl'] = undefined;
  /**
   * Example: 13
   * @member {Number} commonVariableMostCommonConnectorId
   */
  exports.prototype['commonVariableMostCommonConnectorId'] = undefined;
  /**
   * Example: 
   * @member {String} price
   */
  exports.prototype['price'] = undefined;
  /**
   * Example: 
   * @member {String} productUrl
   */
  exports.prototype['productUrl'] = undefined;
  /**
   * Example: 
   * @member {String} wikipediaTitle
   */
  exports.prototype['wikipediaTitle'] = undefined;
  /**
   * Example: 2017-07-30 20:47:38
   * @member {Date} commonVariableUpdatedAt
   */
  exports.prototype['commonVariableUpdatedAt'] = undefined;
  /**
   * Example: 2017-08-04 11:19:31
   * @member {Date} userVariableUpdatedAt
   */
  exports.prototype['userVariableUpdatedAt'] = undefined;
  /**
   * Example: 
   * @member {Date} experimentStartTimeString
   */
  exports.prototype['experimentStartTimeString'] = undefined;
  /**
   * Example: 
   * @member {Date} experimentStartTimeSeconds
   */
  exports.prototype['experimentStartTimeSeconds'] = undefined;
  /**
   * Example: 
   * @member {Date} experimentEndTimeString
   */
  exports.prototype['experimentEndTimeString'] = undefined;
  /**
   * Example: 
   * @member {Date} experimentEndTimeSeconds
   */
  exports.prototype['experimentEndTimeSeconds'] = undefined;
  /**
   * Example: 101260
   * @member {Number} meanInUserVariableDefaultUnit
   */
  exports.prototype['meanInUserVariableDefaultUnit'] = undefined;
  /**
   * Example: 101600
   * @member {Number} lastValueInUserVariableDefaultUnit
   */
  exports.prototype['lastValueInUserVariableDefaultUnit'] = undefined;
  /**
   * Example: 101800
   * @member {Number} secondToLastValueInUserVariableDefaultUnit
   */
  exports.prototype['secondToLastValueInUserVariableDefaultUnit'] = undefined;
  /**
   * Example: 102000
   * @member {Number} thirdToLastValueInUserVariableDefaultUnit
   */
  exports.prototype['thirdToLastValueInUserVariableDefaultUnit'] = undefined;
  /**
   * Example: 101700
   * @member {Number} mostCommonValueInUserVariableDefaultUnit
   */
  exports.prototype['mostCommonValueInUserVariableDefaultUnit'] = undefined;
  /**
   * Example: 101500
   * @member {Number} secondMostCommonValueInUserVariableDefaultUnit
   */
  exports.prototype['secondMostCommonValueInUserVariableDefaultUnit'] = undefined;
  /**
   * Example: 101700
   * @member {Number} thirdMostCommonValueInUserVariableDefaultUnit
   */
  exports.prototype['thirdMostCommonValueInUserVariableDefaultUnit'] = undefined;
  /**
   * Example: https://local.quantimo.do/api/v2/charts?variableName=Barometric%20Pressure&userId=230&pngUrl=https%3A%2F%2Fapp.quantimo.do%2Fionic%2FModo%2Fwww%2Fimg%2Fvariable_categories%2Fenvironment.png
   * @member {String} chartsLinkStatic
   */
  exports.prototype['chartsLinkStatic'] = undefined;
  /**
   * Example: https://local.quantimo.do/ionic/Modo/www/#/app/charts/Barometric%20Pressure?variableName=Barometric%20Pressure&userId=230&pngUrl=https%3A%2F%2Fapp.quantimo.do%2Fionic%2FModo%2Fwww%2Fimg%2Fvariable_categories%2Fenvironment.png
   * @member {String} chartsLinkDynamic
   */
  exports.prototype['chartsLinkDynamic'] = undefined;
  /**
   * Example: https://www.facebook.com/sharer/sharer.php?u=https%3A%2F%2Flocal.quantimo.do%2Fapi%2Fv2%2Fcharts%3FvariableName%3DBarometric%2520Pressure%26userId%3D230%26pngUrl%3Dhttps%253A%252F%252Fapp.quantimo.do%252Fionic%252FModo%252Fwww%252Fimg%252Fvariable_categories%252Fenvironment.png
   * @member {String} chartsLinkFacebook
   */
  exports.prototype['chartsLinkFacebook'] = undefined;
  /**
   * Example: https://plus.google.com/share?url=https%3A%2F%2Flocal.quantimo.do%2Fapi%2Fv2%2Fcharts%3FvariableName%3DBarometric%2520Pressure%26userId%3D230%26pngUrl%3Dhttps%253A%252F%252Fapp.quantimo.do%252Fionic%252FModo%252Fwww%252Fimg%252Fvariable_categories%252Fenvironment.png
   * @member {String} chartsLinkGoogle
   */
  exports.prototype['chartsLinkGoogle'] = undefined;
  /**
   * Example: https://twitter.com/home?status=Check%20out%20my%20Barometric%20Pressure%20data%21%20https%3A%2F%2Flocal.quantimo.do%2Fapi%2Fv2%2Fcharts%3FvariableName%3DBarometric%2520Pressure%26userId%3D230%26pngUrl%3Dhttps%253A%252F%252Fapp.quantimo.do%252Fionic%252FModo%252Fwww%252Fimg%252Fvariable_categories%252Fenvironment.png%20%40quantimodo
   * @member {String} chartsLinkTwitter
   */
  exports.prototype['chartsLinkTwitter'] = undefined;
  /**
   * Example: mailto:?subject=Check%20out%20my%20Barometric%20Pressure%20data%21&body=See%20my%20Barometric%20Pressure%20history%20at%20https%3A%2F%2Flocal.quantimo.do%2Fapi%2Fv2%2Fcharts%3FvariableName%3DBarometric%2520Pressure%26userId%3D230%26pngUrl%3Dhttps%253A%252F%252Fapp.quantimo.do%252Fionic%252FModo%252Fwww%252Fimg%252Fvariable_categories%252Fenvironment.png%0A%0AHave%20a%20great%20day!
   * @member {String} chartsLinkEmail
   */
  exports.prototype['chartsLinkEmail'] = undefined;
  /**
   * @member {module:model/UserVariable} userTagVariables
   */
  exports.prototype['userTagVariables'] = undefined;
  /**
   * @member {module:model/UserVariable} userTaggedVariables
   */
  exports.prototype['userTaggedVariables'] = undefined;
  /**
   * @member {module:model/UserVariable} joinedUserTagVariables
   */
  exports.prototype['joinedUserTagVariables'] = undefined;
  /**
   * @member {module:model/UserVariable} ingredientUserTagVariables
   */
  exports.prototype['ingredientUserTagVariables'] = undefined;
  /**
   * @member {module:model/UserVariable} ingredientOfUserTagVariables
   */
  exports.prototype['ingredientOfUserTagVariables'] = undefined;
  /**
   * @member {module:model/UserVariable} childUserTagVariables
   */
  exports.prototype['childUserTagVariables'] = undefined;
  /**
   * @member {module:model/UserVariable} parentUserTagVariables
   */
  exports.prototype['parentUserTagVariables'] = undefined;
  /**
   * @member {module:model/Variable} commonTagVariables
   */
  exports.prototype['commonTagVariables'] = undefined;
  /**
   * @member {module:model/Variable} commonTaggedVariables
   */
  exports.prototype['commonTaggedVariables'] = undefined;
  /**
   * @member {module:model/DataSource} dataSource
   */
  exports.prototype['dataSource'] = undefined;


  /**
   * Allowed values for the <code>combinationOperation</code> property.
   * @enum {String}
   * @readonly
   */
  exports.CombinationOperationEnum = {
    /**
     * value: "MEAN"
     * @const
     */
    "MEAN": "MEAN",
    /**
     * value: "SUM"
     * @const
     */
    "SUM": "SUM"  };


  return exports;
}));



},{"../ApiClient":16,"./DataSource":41,"./Unit":83,"./UserVariable":88,"./Variable":90}],91:[function(require,module,exports){
/**
 * quantimodo
 * QuantiModo makes it easy to retrieve normalized user data from a wide array of devices and applications. [Learn about QuantiModo](https://quantimo.do), check out our [docs](https://github.com/QuantiModo/docs) or contact us at [help.quantimo.do](https://help.quantimo.do).
 *
 * OpenAPI spec version: 5.8.728
 *
 * NOTE: This class is auto generated by the swagger code generator program.
 * https://github.com/swagger-api/swagger-codegen.git
 *
 * Swagger Codegen version: 2.2.3
 *
 * Do not edit the class manually.
 *
 */

(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define(['ApiClient'], factory);
  } else if (typeof module === 'object' && module.exports) {
    // CommonJS-like environments that support module.exports, like Node.
    module.exports = factory(require('../ApiClient'));
  } else {
    // Browser globals (root is window)
    if (!root.Quantimodo) {
      root.Quantimodo = {};
    }
    root.Quantimodo.VariableCategory = factory(root.Quantimodo.ApiClient);
  }
}(this, function(ApiClient) {
  'use strict';




  /**
   * The VariableCategory model module.
   * @module model/VariableCategory
   * @version 5.8.807
   */

  /**
   * Constructs a new <code>VariableCategory</code>.
   * @alias module:model/VariableCategory
   * @class
   * @param name {String} Category name
   */
  var exports = function(name) {
    var _this = this;

    _this['name'] = name;
  };

  /**
   * Constructs a <code>VariableCategory</code> from a plain JavaScript object, optionally creating a new instance.
   * Copies all relevant properties from <code>data</code> to <code>obj</code> if supplied or a new instance if not.
   * @param {Object} data The plain JavaScript object bearing properties of interest.
   * @param {module:model/VariableCategory} obj Optional instance to populate.
   * @return {module:model/VariableCategory} The populated <code>VariableCategory</code> instance.
   */
  exports.constructFromObject = function(data, obj) {
    if (data) {
      obj = obj || new exports();

      if (data.hasOwnProperty('name')) {
        obj['name'] = ApiClient.convertToType(data['name'], 'String');
      }
    }
    return obj;
  }

  /**
   * Category name
   * @member {String} name
   */
  exports.prototype['name'] = undefined;



  return exports;
}));



},{"../ApiClient":16}],92:[function(require,module,exports){
/**
 * quantimodo
 * QuantiModo makes it easy to retrieve normalized user data from a wide array of devices and applications. [Learn about QuantiModo](https://quantimo.do), check out our [docs](https://github.com/QuantiModo/docs) or contact us at [help.quantimo.do](https://help.quantimo.do).
 *
 * OpenAPI spec version: 5.8.728
 *
 * NOTE: This class is auto generated by the swagger code generator program.
 * https://github.com/swagger-api/swagger-codegen.git
 *
 * Swagger Codegen version: 2.2.3
 *
 * Do not edit the class manually.
 *
 */

(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define(['ApiClient'], factory);
  } else if (typeof module === 'object' && module.exports) {
    // CommonJS-like environments that support module.exports, like Node.
    module.exports = factory(require('../ApiClient'));
  } else {
    // Browser globals (root is window)
    if (!root.Quantimodo) {
      root.Quantimodo = {};
    }
    root.Quantimodo.Vote = factory(root.Quantimodo.ApiClient);
  }
}(this, function(ApiClient) {
  'use strict';




  /**
   * The Vote model module.
   * @module model/Vote
   * @version 5.8.807
   */

  /**
   * Constructs a new <code>Vote</code>.
   * @alias module:model/Vote
   * @class
   * @param clientId {String} clientId
   * @param userId {Number} ID of User
   * @param causeVariableId {Number} Cause variable id
   * @param effectVariableId {Number} Effect variable id
   * @param value {Boolean} Vote: 0 (for implausible) or 1 (for plausible)
   */
  var exports = function(clientId, userId, causeVariableId, effectVariableId, value) {
    var _this = this;


    _this['clientId'] = clientId;
    _this['userId'] = userId;
    _this['causeVariableId'] = causeVariableId;
    _this['effectVariableId'] = effectVariableId;
    _this['value'] = value;


  };

  /**
   * Constructs a <code>Vote</code> from a plain JavaScript object, optionally creating a new instance.
   * Copies all relevant properties from <code>data</code> to <code>obj</code> if supplied or a new instance if not.
   * @param {Object} data The plain JavaScript object bearing properties of interest.
   * @param {module:model/Vote} obj Optional instance to populate.
   * @return {module:model/Vote} The populated <code>Vote</code> instance.
   */
  exports.constructFromObject = function(data, obj) {
    if (data) {
      obj = obj || new exports();

      if (data.hasOwnProperty('id')) {
        obj['id'] = ApiClient.convertToType(data['id'], 'Number');
      }
      if (data.hasOwnProperty('clientId')) {
        obj['clientId'] = ApiClient.convertToType(data['clientId'], 'String');
      }
      if (data.hasOwnProperty('userId')) {
        obj['userId'] = ApiClient.convertToType(data['userId'], 'Number');
      }
      if (data.hasOwnProperty('causeVariableId')) {
        obj['causeVariableId'] = ApiClient.convertToType(data['causeVariableId'], 'Number');
      }
      if (data.hasOwnProperty('effectVariableId')) {
        obj['effectVariableId'] = ApiClient.convertToType(data['effectVariableId'], 'Number');
      }
      if (data.hasOwnProperty('value')) {
        obj['value'] = ApiClient.convertToType(data['value'], 'Boolean');
      }
      if (data.hasOwnProperty('createdAt')) {
        obj['createdAt'] = ApiClient.convertToType(data['createdAt'], 'Date');
      }
      if (data.hasOwnProperty('updatedAt')) {
        obj['updatedAt'] = ApiClient.convertToType(data['updatedAt'], 'Date');
      }
    }
    return obj;
  }

  /**
   * id
   * @member {Number} id
   */
  exports.prototype['id'] = undefined;
  /**
   * clientId
   * @member {String} clientId
   */
  exports.prototype['clientId'] = undefined;
  /**
   * ID of User
   * @member {Number} userId
   */
  exports.prototype['userId'] = undefined;
  /**
   * Cause variable id
   * @member {Number} causeVariableId
   */
  exports.prototype['causeVariableId'] = undefined;
  /**
   * Effect variable id
   * @member {Number} effectVariableId
   */
  exports.prototype['effectVariableId'] = undefined;
  /**
   * Vote: 0 (for implausible) or 1 (for plausible)
   * @member {Boolean} value
   */
  exports.prototype['value'] = undefined;
  /**
   * When the record was first created. Use UTC ISO 8601 `YYYY-MM-DDThh:mm:ss`  datetime format
   * @member {Date} createdAt
   */
  exports.prototype['createdAt'] = undefined;
  /**
   * When the record in the database was last updated. Use UTC ISO 8601 `YYYY-MM-DDThh:mm:ss`  datetime format
   * @member {Date} updatedAt
   */
  exports.prototype['updatedAt'] = undefined;



  return exports;
}));



},{"../ApiClient":16}],93:[function(require,module,exports){
/**
 * quantimodo
 * QuantiModo makes it easy to retrieve normalized user data from a wide array of devices and applications. [Learn about QuantiModo](https://quantimo.do), check out our [docs](https://github.com/QuantiModo/docs) or contact us at [help.quantimo.do](https://help.quantimo.do).
 *
 * OpenAPI spec version: 5.8.728
 *
 * NOTE: This class is auto generated by the swagger code generator program.
 * https://github.com/swagger-api/swagger-codegen.git
 *
 * Swagger Codegen version: 2.2.3
 *
 * Do not edit the class manually.
 *
 */

(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define(['ApiClient'], factory);
  } else if (typeof module === 'object' && module.exports) {
    // CommonJS-like environments that support module.exports, like Node.
    module.exports = factory(require('../ApiClient'));
  } else {
    // Browser globals (root is window)
    if (!root.Quantimodo) {
      root.Quantimodo = {};
    }
    root.Quantimodo.VoteDelete = factory(root.Quantimodo.ApiClient);
  }
}(this, function(ApiClient) {
  'use strict';




  /**
   * The VoteDelete model module.
   * @module model/VoteDelete
   * @version 5.8.807
   */

  /**
   * Constructs a new <code>VoteDelete</code>.
   * @alias module:model/VoteDelete
   * @class
   * @param cause {String} Cause variable name for the correlation to which the vote pertains
   * @param effect {String} Effect variable name for the correlation to which the vote pertains
   */
  var exports = function(cause, effect) {
    var _this = this;

    _this['cause'] = cause;
    _this['effect'] = effect;
  };

  /**
   * Constructs a <code>VoteDelete</code> from a plain JavaScript object, optionally creating a new instance.
   * Copies all relevant properties from <code>data</code> to <code>obj</code> if supplied or a new instance if not.
   * @param {Object} data The plain JavaScript object bearing properties of interest.
   * @param {module:model/VoteDelete} obj Optional instance to populate.
   * @return {module:model/VoteDelete} The populated <code>VoteDelete</code> instance.
   */
  exports.constructFromObject = function(data, obj) {
    if (data) {
      obj = obj || new exports();

      if (data.hasOwnProperty('cause')) {
        obj['cause'] = ApiClient.convertToType(data['cause'], 'String');
      }
      if (data.hasOwnProperty('effect')) {
        obj['effect'] = ApiClient.convertToType(data['effect'], 'String');
      }
    }
    return obj;
  }

  /**
   * Cause variable name for the correlation to which the vote pertains
   * @member {String} cause
   */
  exports.prototype['cause'] = undefined;
  /**
   * Effect variable name for the correlation to which the vote pertains
   * @member {String} effect
   */
  exports.prototype['effect'] = undefined;



  return exports;
}));



},{"../ApiClient":16}],94:[function(require,module,exports){
/**
 * quantimodo
 * QuantiModo makes it easy to retrieve normalized user data from a wide array of devices and applications. [Learn about QuantiModo](https://quantimo.do), check out our [docs](https://github.com/QuantiModo/docs) or contact us at [help.quantimo.do](https://help.quantimo.do).
 *
 * OpenAPI spec version: 5.8.728
 *
 * NOTE: This class is auto generated by the swagger code generator program.
 * https://github.com/swagger-api/swagger-codegen.git
 *
 * Swagger Codegen version: 2.2.3
 *
 * Do not edit the class manually.
 *
 */

(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define(['ApiClient', 'model/Category', 'model/Title'], factory);
  } else if (typeof module === 'object' && module.exports) {
    // CommonJS-like environments that support module.exports, like Node.
    module.exports = factory(require('../ApiClient'), require('./Category'), require('./Title'));
  } else {
    // Browser globals (root is window)
    if (!root.Quantimodo) {
      root.Quantimodo = {};
    }
    root.Quantimodo.XAxi = factory(root.Quantimodo.ApiClient, root.Quantimodo.Category, root.Quantimodo.Title);
  }
}(this, function(ApiClient, Category, Title) {
  'use strict';




  /**
   * The XAxi model module.
   * @module model/XAxi
   * @version 5.8.807
   */

  /**
   * Constructs a new <code>XAxi</code>.
   * @alias module:model/XAxi
   * @class
   * @param title {module:model/Title} 
   * @param startOnTick {Boolean} Example: true
   * @param endOnTick {Boolean} Example: true
   * @param showLastLabel {Boolean} Example: true
   * @param text {String} Example: Date
   * @param categories {Array.<module:model/Category>} 
   */
  var exports = function(title, startOnTick, endOnTick, showLastLabel, text, categories) {
    var _this = this;

    _this['title'] = title;
    _this['startOnTick'] = startOnTick;
    _this['endOnTick'] = endOnTick;
    _this['showLastLabel'] = showLastLabel;
    _this['text'] = text;
    _this['categories'] = categories;
  };

  /**
   * Constructs a <code>XAxi</code> from a plain JavaScript object, optionally creating a new instance.
   * Copies all relevant properties from <code>data</code> to <code>obj</code> if supplied or a new instance if not.
   * @param {Object} data The plain JavaScript object bearing properties of interest.
   * @param {module:model/XAxi} obj Optional instance to populate.
   * @return {module:model/XAxi} The populated <code>XAxi</code> instance.
   */
  exports.constructFromObject = function(data, obj) {
    if (data) {
      obj = obj || new exports();

      if (data.hasOwnProperty('title')) {
        obj['title'] = Title.constructFromObject(data['title']);
      }
      if (data.hasOwnProperty('startOnTick')) {
        obj['startOnTick'] = ApiClient.convertToType(data['startOnTick'], 'Boolean');
      }
      if (data.hasOwnProperty('endOnTick')) {
        obj['endOnTick'] = ApiClient.convertToType(data['endOnTick'], 'Boolean');
      }
      if (data.hasOwnProperty('showLastLabel')) {
        obj['showLastLabel'] = ApiClient.convertToType(data['showLastLabel'], 'Boolean');
      }
      if (data.hasOwnProperty('text')) {
        obj['text'] = ApiClient.convertToType(data['text'], 'String');
      }
      if (data.hasOwnProperty('categories')) {
        obj['categories'] = ApiClient.convertToType(data['categories'], [Category]);
      }
    }
    return obj;
  }

  /**
   * @member {module:model/Title} title
   */
  exports.prototype['title'] = undefined;
  /**
   * Example: true
   * @member {Boolean} startOnTick
   */
  exports.prototype['startOnTick'] = undefined;
  /**
   * Example: true
   * @member {Boolean} endOnTick
   */
  exports.prototype['endOnTick'] = undefined;
  /**
   * Example: true
   * @member {Boolean} showLastLabel
   */
  exports.prototype['showLastLabel'] = undefined;
  /**
   * Example: Date
   * @member {String} text
   */
  exports.prototype['text'] = undefined;
  /**
   * @member {Array.<module:model/Category>} categories
   */
  exports.prototype['categories'] = undefined;



  return exports;
}));



},{"../ApiClient":16,"./Category":29,"./Title":74}],95:[function(require,module,exports){
/**
 * quantimodo
 * QuantiModo makes it easy to retrieve normalized user data from a wide array of devices and applications. [Learn about QuantiModo](https://quantimo.do), check out our [docs](https://github.com/QuantiModo/docs) or contact us at [help.quantimo.do](https://help.quantimo.do).
 *
 * OpenAPI spec version: 5.8.728
 *
 * NOTE: This class is auto generated by the swagger code generator program.
 * https://github.com/swagger-api/swagger-codegen.git
 *
 * Swagger Codegen version: 2.2.3
 *
 * Do not edit the class manually.
 *
 */

(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define(['ApiClient', 'model/Title'], factory);
  } else if (typeof module === 'object' && module.exports) {
    // CommonJS-like environments that support module.exports, like Node.
    module.exports = factory(require('../ApiClient'), require('./Title'));
  } else {
    // Browser globals (root is window)
    if (!root.Quantimodo) {
      root.Quantimodo = {};
    }
    root.Quantimodo.YAxi = factory(root.Quantimodo.ApiClient, root.Quantimodo.Title);
  }
}(this, function(ApiClient, Title) {
  'use strict';




  /**
   * The YAxi model module.
   * @module model/YAxi
   * @version 5.8.807
   */

  /**
   * Constructs a new <code>YAxi</code>.
   * @alias module:model/YAxi
   * @class
   * @param title {module:model/Title} 
   * @param lineWidth {Number} Example: 1
   * @param opposite {Boolean} Example: true
   * @param min {Number} Example: -2.68
   * @param max {Number} Example: 372.68
   */
  var exports = function(title, lineWidth, opposite, min, max) {
    var _this = this;

    _this['title'] = title;
    _this['lineWidth'] = lineWidth;
    _this['opposite'] = opposite;
    _this['min'] = min;
    _this['max'] = max;
  };

  /**
   * Constructs a <code>YAxi</code> from a plain JavaScript object, optionally creating a new instance.
   * Copies all relevant properties from <code>data</code> to <code>obj</code> if supplied or a new instance if not.
   * @param {Object} data The plain JavaScript object bearing properties of interest.
   * @param {module:model/YAxi} obj Optional instance to populate.
   * @return {module:model/YAxi} The populated <code>YAxi</code> instance.
   */
  exports.constructFromObject = function(data, obj) {
    if (data) {
      obj = obj || new exports();

      if (data.hasOwnProperty('title')) {
        obj['title'] = Title.constructFromObject(data['title']);
      }
      if (data.hasOwnProperty('lineWidth')) {
        obj['lineWidth'] = ApiClient.convertToType(data['lineWidth'], 'Number');
      }
      if (data.hasOwnProperty('opposite')) {
        obj['opposite'] = ApiClient.convertToType(data['opposite'], 'Boolean');
      }
      if (data.hasOwnProperty('min')) {
        obj['min'] = ApiClient.convertToType(data['min'], 'Number');
      }
      if (data.hasOwnProperty('max')) {
        obj['max'] = ApiClient.convertToType(data['max'], 'Number');
      }
    }
    return obj;
  }

  /**
   * @member {module:model/Title} title
   */
  exports.prototype['title'] = undefined;
  /**
   * Example: 1
   * @member {Number} lineWidth
   */
  exports.prototype['lineWidth'] = undefined;
  /**
   * Example: true
   * @member {Boolean} opposite
   */
  exports.prototype['opposite'] = undefined;
  /**
   * Example: -2.68
   * @member {Number} min
   */
  exports.prototype['min'] = undefined;
  /**
   * Example: 372.68
   * @member {Number} max
   */
  exports.prototype['max'] = undefined;



  return exports;
}));



},{"../ApiClient":16,"./Title":74}]},{},[25])(25)
});