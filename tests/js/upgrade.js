/**
 * @license
 * Copyright (c) 2014 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
 * The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
 * The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
 * Code distributed by Google as part of the polymer project is also
 * subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
 */

suite('Upgrades', function() {
  var work;
  var assert = chai.assert;

  setup(function() {
    work = document.createElement('div');
    document.body.appendChild(work);
  });

  teardown(function() {
    document.body.removeChild(work);
  });

  test('connected elements upgrade when defined', function() {
    work.innerHTML = '<x-markup-1><x-markup-2><button is="x-markup-builtin-1"></button></x-markup-2></x-markup-1>';
    var e1 = work.firstChild;
    var e2 = e1.firstChild;
    var e3 = e2.firstChild;

    class X1 extends HTMLElement {}
    class X2 extends HTMLElement {}
    class XMarkupBuiltin1 extends HTMLButtonElement {}
    customElements.define('x-markup-1', X1);
    customElements.define('x-markup-2', X2);
    customElements.define('x-markup-builtin-1', XMarkupBuiltin1, {extends: 'button'});

    assert.instanceOf(e1, X1);
    assert.instanceOf(e2, X2);
    assert.instanceOf(e3, XMarkupBuiltin1);
  });

  test('defined disconnected elements upgrade when connected', function() {
    var e1 = document.createElement('x-disconnected-1');
    var e2 = document.createElement('x-disconnected-2');
    var e3 = document.createElement('span', {is: 'x-disconnected-builtin-1'});
    e1.appendChild(e2);
    e2.appendChild(e3);

    class X1 extends HTMLElement {}
    class X2 extends HTMLElement {}
		class XDisconnectedBuiltin1 extends HTMLSpanElement {}
    customElements.define('x-disconnected-1', X1);
    customElements.define('x-disconnected-2', X2);
		customElements.define('x-disconnected-builtin-1', XDisconnectedBuiltin1, {extends: 'span'});

    // disconnected elements should not be upgraded
    assert.notInstanceOf(e1, X1);
    assert.notInstanceOf(e2, X2);
		assert.notInstanceOf(e3, XDisconnectedBuiltin1);

    // they should upgrade when connected
    work.appendChild(e1);
    assert.instanceOf(e1, X1);
    assert.instanceOf(e2, X2);
		assert.instanceOf(e3, XDisconnectedBuiltin1);
  });

});
