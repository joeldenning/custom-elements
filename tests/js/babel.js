/**
 * @license
 * Copyright (c) 2014 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
 * The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
 * The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
 * Code distributed by Google as part of the polymer project is also
 * subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
 */

suite('Babel ES5 Output', function() {

  customElements.enableFlush = true;

  test('Babel generated ES5 works via new()', function() {
    'use strict';

    function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

    function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

    function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

    var XBabel = function (_HTMLElement) {
      _inherits(XBabel, _HTMLElement);

      function XBabel() {
        _classCallCheck(this, XBabel);

        return _possibleConstructorReturn(this, Object.getPrototypeOf(XBabel).call(this));
      }

      return XBabel;
    }(HTMLElement);

    // register x-foo
    customElements.define('x-babel', XBabel);
    // create an instance via new
    var e = new XBabel();
    // test localName
    assert.equal(e.localName, 'x-babel');
    // test instanceof
    assert.instanceOf(e, XBabel);
  });

	test('Babel generated ES5 works via new() when extending builtin HTML Elements', function() {
		"use strict";

		function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

		function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

		function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

		var XBabelBuiltin = function (_HTMLButtonElement) {
			_inherits(XBabelBuiltin, _HTMLButtonElement);

			function XBabelBuiltin() {
				_classCallCheck(this, XBabelBuiltin);

				return _possibleConstructorReturn(this, (XBabelBuiltin.__proto__ || Object.getPrototypeOf(XBabelBuiltin)).call(this));
			}

			return XBabelBuiltin;
		}(HTMLButtonElement);

		// register x-foo
		customElements.define('x-babel-builtin', XBabelBuiltin, {extends: 'button'});
		// create an instance via new
		var e = new XBabelBuiltin();
		// test localName
		assert.equal(e.localName, 'button');
		// test instanceof
		assert.instanceOf(e, XBabelBuiltin);
		assert.instanceOf(e, HTMLButtonElement);
	});

  test('Babel generated ES5 works via createElement', function() {
    'use strict';

    function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

    function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

    function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

    var XBabel2 = function (_HTMLElement) {
      _inherits(XBabel2, _HTMLElement);

      function XBabel2() {
        _classCallCheck(this, XBabel2);

        return _possibleConstructorReturn(this, Object.getPrototypeOf(XBabel2).call(this));
      }

      return XBabel2;
    }(HTMLElement);

    // register x-foo
    customElements.define('x-babel2', XBabel2);
    // create an instance via new
    var e = document.createElement('x-babel2');
    // test localName
    assert.equal(e.localName, 'x-babel2');
    // test instanceof
    assert.instanceOf(e, XBabel2);
  });

	test('Babel generated ES5 works via createElement for customized builtins', function() {
		"use strict";

		function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

		function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

		function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

		var XBabel2Builtin = function (_HTMLButtonElement) {
			_inherits(XBabel2Builtin, _HTMLButtonElement);

			function XBabel2Builtin() {
				_classCallCheck(this, XBabel2Builtin);

				return _possibleConstructorReturn(this, (XBabel2Builtin.__proto__ || Object.getPrototypeOf(XBabel2Builtin)).call(this));
			}

			return XBabel2Builtin;
		}(HTMLButtonElement);

		customElements.define('x-babel2-builtin', XBabel2Builtin, {extends: 'button'});
		var e = document.createElement('button', {is: 'x-babel2-builtin'});
		assert.equal(e.localName, 'button');
		assert.instanceOf(e, XBabel2Builtin);
		assert.instanceOf(e, HTMLButtonElement);
	});

});
