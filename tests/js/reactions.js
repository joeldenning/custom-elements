/**
 * @license
 * Copyright (c) 2016 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
 * The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
 * The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
 * Code distributed by Google as part of the polymer project is also
 * subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
 */

suite('Custom Element Reactions', function() {
  var work;
  var assert = chai.assert;
  var HTMLNS = 'http://www.w3.org/1999/xhtml';

  customElements.enableFlush = true;

  setup(function() {
    work = document.createElement('div');
    document.body.appendChild(work);
  });

  teardown(function() {
    document.body.removeChild(work);
  });

  suite('constructor', function() {

    test('new E() instantiates a new customized element', function() {
      class XNew extends HTMLElement {}
      customElements.define('x-new', XNew);
      var xnew = new XNew();

      assert.equal(xnew.localName, 'x-new');
      assert.instanceOf(xnew, XNew);
    });

    test('new E() instantiates subclasses', function() {
      class XSuper extends HTMLElement {}
      class XSub extends XSuper {}
      customElements.define('x-super', XSuper);
      customElements.define('x-sub', XSub);

      var xsuper = new XSuper();
      assert.equal(xsuper.localName, 'x-super');
      assert.instanceOf(xsuper, XSuper);

      var xsub = new XSub();
      assert.equal(xsub.localName, 'x-sub');
      assert.instanceOf(xsub, XSub);
    });

    test('new E() works with ES5-style classes', function() {
      // To work with ES5-style classes we require a complete definition:
      function XES5() {
        // 1) constructors must return the result of the super call
        return HTMLElement.call(this);
      }
      // 2) HTMLElement.prototype must be on the prototype chain
      XES5.prototype = Object.create(HTMLElement.prototype);
      // 3) The `constructor` property must point to the classes constructor
      Object.defineProperty(XES5.prototype, 'constructor', {value: XES5, configurable: true, writable: true,});

      customElements.define('x-es5', XES5);

      var es5 = new XES5();
      assert.equal(es5.localName, 'x-es5');
      assert.instanceOf(es5, XES5);
    });

    test('new E() works with ES5-style classes that extend other built-in elements', function() {
      // To work with ES5-style classes we require a complete definition:
      function XES5Builtin() {
        // 1) constructors must return the result of the super call
        return HTMLButtonElement.call(this);
      }
      // 2) HTMLElement.prototype must be on the prototype chain
      XES5Builtin.prototype = Object.create(HTMLButtonElement.prototype);
      // 3) The `constructor` property must point to the classes constructor
      Object.defineProperty(XES5Builtin.prototype, 'constructor', {value: XES5Builtin, configurable: true, writable: true,});

      customElements.define('x-es5-builtin', XES5Builtin);

      var es5 = new XES5Builtin();
      assert.equal(es5.localName, 'x-es5-builtin');
      assert.instanceOf(es5, XES5Builtin);
    });

    test('constructor is called when instantiated via createElement', function() {
      var pass = false;
      class XFoo2 extends HTMLElement {
        constructor() {
          super();
          pass = true;
        }
      }
      var XFoo = customElements.define('x-foo2', XFoo2);
      var xfoo = document.createElement('x-foo2');
      assert.isNotOk(xfoo.is);
      assert.isNotOk(xfoo.getAttribute('is'));
      assert.equal(xfoo.localName, 'x-foo2');
      assert.instanceOf(xfoo, XFoo2);
      assert.isTrue(pass);
    });

    test('constructor is called on customized built-in elements when created via createElement', function() {
      var pass = false;
      class CustomizedBuiltin1 extends HTMLInputElement {
        constructor() {
          super();
          pass = true;
        }
      }
      customElements.define('customized-builtin-1', CustomizedBuiltin1);
      var customizedBuiltin = document.createElement('input', {is: 'customized-builtin-1'});
      assert.equal(customizedBuiltin.localName, 'input');
      // assert.instanceOf(customizedBuiltin, CustomizedBuiltin1);
      assert.isTrue(pass);
    });

    // https://html.spec.whatwg.org/multipage/scripting.html#custom-elements-core-concepts
    test('setting the is attribute after creating customized built-in element doesn\'t upgrade the element', function() {
      var upgraded = false;
      class CustomizedBuiltin2 extends HTMLButtonElement {
        constructor() {
          super();
          upgraded = true;
        }
      }
      customElements.define('customized-builtin-2', CustomizedBuiltin2);
      var button = document.createElement('button');
      button.setAttribute('is', 'customized-builtin-2');
      customElements.flush();
      assert.notInstanceOf(button, CustomizedBuiltin2);
      assert.isFalse(upgraded);
    });

    test('setting the is attribute via HTML string upgrades the element to a customized built-in element', function() {
      var upgraded = false;
      class CustomizedBuiltin3 extends HTMLButtonElement {
        constructor() {
          super();
          upgraded = true;
        }
      }
      customElements.define('customized-builtin-3', CustomizedBuiltin3);
      var div = document.createElement('div');
      div.innerHTML = '<button is="customized-builtin-3"></button>';
      customElements.flush();
      assert.isTrue(upgraded);
    })

    test('subclass constructor is called when instantiated via createElement', function() {
      class XSuper2 extends HTMLElement {}
      var pass = false;
      class XSub2 extends XSuper2 {
        constructor() {
          super();
          pass = true;
        }
      }
      customElements.define('x-super-2', XSuper2);
      customElements.define('x-sub-2', XSub2);

      var xsuper = document.createElement('x-super-2');
      assert.equal(xsuper.localName, 'x-super-2');
      assert.instanceOf(xsuper, XSuper2);

      var xsub = document.createElement('x-sub-2');
      assert.equal(xsub.localName, 'x-sub-2');
      assert.instanceOf(xsub, XSub2);
      assert.isTrue(pass);
    });

    test('ES5 constructor is called when instantiated via createElement', function() {
      var pass = false;
      function XBarES5() {
        pass = true;
        return HTMLElement.call(this);
      }
      XBarES5.prototype = Object.create(HTMLElement.prototype);
      Object.defineProperty(XBarES5.prototype, 'constructor', {value: XBarES5, configurable: true, writable: true});
      customElements.define('x-bar-es5', XBarES5);
      var xbar = document.createElement('x-bar-es5');
      assert.equal(xbar.localName, 'x-bar-es5');
      assert.instanceOf(xbar, XBarES5);
      assert.isTrue(pass);
    });

    test('constructor is called when instantiated via createElementNS', function() {
      var pass = false;
      class XFoo3 extends HTMLElement {
        constructor() {
          super();
          pass = true;
        }
      }
      customElements.define('x-foo3', XFoo3);
      var xfoo = document.createElementNS(HTMLNS, 'x-foo3');
      assert.instanceOf(xfoo, XFoo3);
      assert.equal(xfoo.localName, 'x-foo3');
      assert.isTrue(pass);
    });

    test('constructor is called for each instance', function() {
      var count = 0;
      class XFoo4 extends HTMLElement {
        constructor() {
          super();
          count++;
        }
      }
      customElements.define('x-foo4', XFoo4);
      var e1 = document.createElement('x-foo4');
      var e2 = document.createElement('x-foo4');

      assert.notStrictEqual(e1, e2);
      assert.equal(count, 2);
    });

    test('calls constructor only once', function() {
      var count = 0;
      class XConstructor extends HTMLElement {
        constructor() {
          super();
          count++;
        }
      }
      customElements.define('x-constructor', XConstructor);
      var xconstructor = new XConstructor();
      assert.equal(count, 1);
    });

    test('innerHTML on disconnected elements customizes contents', function() {
      var passed = false;
      class XInner extends HTMLElement {
        constructor() {
          super();
          passed = true;
        }
      }
      customElements.define('x-inner', XInner);
      var div = document.createElement('div');
      div.innerHTML = '<x-inner></x-inner>';
      customElements.flush();
      assert.isTrue(passed);
    });

  });

  suite('customized built-in elements', function() {
    test('inherits native behavior such as a button\'s disabled property', function(done) {
      var numClickCalls = 0;
      var isDisabled;

      class CustomizedBuiltin7 extends HTMLButtonElement {
        constructor() {
          super();
          this.disabled = true;
          isDisabled = true;
        }
      }

      customElements.define('customized-builtin-7', CustomizedBuiltin7, {extends: 'button'});
      var button = document.createElement('button', {is: 'customized-builtin-7'});
      var shouldBeDisabled = true;

      button.addEventListener('click', function() {
        if (isDisabled) {
          assert.fail();
          done();
        } else {
          done();
        }
      });
      button.click();

      setTimeout(function() {
        isDisabled = false;
        button.disabled = false;
        button.click();
      });
    });

    test('does not upgrade elements that don\'t match what extends was at definition', function() {
      var wasInitialized = false;

      class CustomizedBuiltin8 extends HTMLHeadingElement {
        constructor() {
          super();
          wasInitialized = true;
        }
      }
      customElements.define('customized-builtin-8', CustomizedBuiltin8, {extends: 'h1'});
      var h2 = document.createElement('h2', {is: 'customized-builtin-8'});
      customElements.flush();
      assert.isFalse(wasInitialized, 'CustomizedBuiltin8 shouldn\'t be constructed');
    });

    // https://html.spec.whatwg.org/multipage/scripting.html#custom-elements-customized-builtin-example
    test('can be created with the new operator', function() {
      class CustomizedBuiltin9 extends HTMLDivElement {
      }
      customElements.define('customized-builtin-9', CustomizedBuiltin9, {extends: 'div'});
      var customizedBuiltin9 = new CustomizedBuiltin9();
      customElements.flush();
      assert.equal(customizedBuiltin9.tagName.toLowerCase(), 'div');
      assert.equal(customizedBuiltin9.localName, 'div');

      work.appendChild(customizedBuiltin9);
      customElements.flush();
      assert.equal(work.querySelector('div').is, 'customized-builtin-9');
      assert.equal(work.querySelector('div').getAttribute('is'), 'customized-builtin-9');
    });
  });

  suite('attributeChangedCallback', function() {

    // TODO(justinfagnani): test for observedAttributes

    test('if not defined, observedAttributes is not read', function() {
      customElements.define('x-no-attr-callback', class extends HTMLElement {
        static get observedAttributes() {
          assert.fail();
        }
      });
    });

    test('called when setting observed attribute via setAttribute', function(done) {
      class XBoo extends HTMLElement {
        static get observedAttributes() {
          return ['foo'];
        }

        attributeChangedCallback(inName, inOldValue) {
          if (inName == 'foo' && inOldValue == 'bar'
              && this.attributes.foo.value == 'zot') {
            done();
          }
        }
      }
      customElements.define('x-boo-acp', XBoo);
      var xboo = new XBoo();
      xboo.setAttribute('foo', 'bar');
      xboo.setAttribute('foo', 'zot');
    });

    test('called for existing observed attributes', function () {
      var changed = [];
      class XBoo extends HTMLElement {
        static get observedAttributes () {
          return ['test1'];
        }
        attributeChangedCallback(name, oldValue, newValue) {
          changed.push({
            name: name,
            oldValue: oldValue,
            newValue: newValue
          });
        }
        connectedCallback() {
          this.innerHTML = 'testing';
        }
      }

      var element = document.createElement('x-boo-at1');
      element.setAttribute('test1', 'test1');
      element.setAttribute('test2', 'test2');
      work.appendChild(element);

      customElements.define('x-boo-at1', XBoo);
      customElements.flush();

      assert.equal(changed.length, 1, 'should only trigger for observed attributes');
      assert.equal(changed[0].name, 'test1', 'name');
      assert.equal(changed[0].oldValue, null, 'oldValue');
      assert.equal(changed[0].newValue, 'test1', 'newValue');
    });

    test('called for customized built-in elements', function () {
      var changes = [];
      class CustomizedBuiltin4 extends HTMLSpanElement {
        constructor() {
          super();
        }
        static get observedAttributes() {
          return ['attr1', 'attr2'];
        }
        attributeChangedCallback(name, oldValue, newValue) {
          changes.push({
            name: name,
            oldValue: oldValue,
            newValue: newValue
          });
        }
      }

      customElements.define('customized-builtin-4', CustomizedBuiltin4, {extends: 'span'});
      var element = document.createElement('span', {is: 'customized-builtin-4'});
      customElements.flush();

      element.setAttribute('attr1', 'val1');
      element.setAttribute('attr2', 'val2');
      element.setAttribute('attr3', 'val3');

      assert.equal(changes.length, 2, 'should only trigger for observed attributes');
      assert.equal(changes[0].name, 'attr1', 'name1');
      assert.equal(changes[0].oldValue, null, 'oldValue1');
      assert.equal(changes[0].newValue, 'val1', 'newValue1');
      assert.equal(changes[1].name, 'attr2', 'name2');
      assert.equal(changes[1].oldValue, null, 'oldValue2');
      assert.equal(changes[1].newValue, 'val2', 'newValue2');
    });

  });

  suite('connectedCallback', function() {
    var connectedCount;
    class XConnected extends HTMLElement {
      connectedCallback() {
        connectedCount++;
      }
    }
    customElements.define('x-connected', XConnected);

    setup(function() {
      connectedCount = 0;
    });

    test('is not called for disconnected custom elements', function() {
      new XConnected();
      assert.equal(connectedCount, 0);
    });

    test('is not called for deeply disconnected custom elements', function() {
      var parent = new XConnected();
      var child = new XConnected();
      parent.appendChild(child);
      customElements.flush();
      assert.equal(connectedCount, 0);
    });

    test('called when appended to main document', function() {
      work.appendChild(new XConnected());
      customElements.flush();
      assert.equal(connectedCount, 1);
    });

    test('called when re-appended to main document', function() {
      var el = new XConnected();
      work.appendChild(el);
      work.removeChild(el);
      work.appendChild(el);
      customElements.flush();
      assert.equal(connectedCount, 2);
    });

    test('called in tree order', function() {
      var log = [];

      class XOrdering extends HTMLElement {
        connectedCallback() {
          log.push(this.id);
        }
      }

      class XOrderingCustomized extends HTMLButtonElement {
        connectedCallback() {
          log.push(this.id);
        }
      }

      customElements.define('x-ordering', XOrdering);
      customElements.define('x-ordering-customized', XOrderingCustomized, {extends: 'button'});

      work.innerHTML =
          '<x-ordering id=a>' +
            '<x-ordering id=b></x-ordering>' +
            '<x-ordering id=c>' +
              '<x-ordering id=d></x-ordering>' +
              '<x-ordering id=e></x-ordering>' +
              '<button id="f" is="x-ordering-customized"></button>' +
            '</x-ordering>' +
          '</x-ordering>';

      customElements.flush();
      assert.deepEqual(log, ['a', 'b', 'c', 'd', 'e', 'f']);
    });

    test('called on customized built-in elements when appended to the document', function() {
      var count = 0;

      class CustomizedBuiltin5 extends HTMLDivElement {
        connectedCallback() {
          count++;
        }
      }

      customElements.define('customized-builtin-5', CustomizedBuiltin5, {extends: 'div'});
      var div = document.createElement('div', {is: 'customized-builtin-5'});
      work.appendChild(div);
      customElements.flush();
      assert.equal(count, 1, 'num times connectedCallback was called');
    });

  });

  suite('disconnectedCallback', function() {

    test('called when disconnected from main document', function() {
      var ready, inserted, removed;
      class XBoo extends HTMLElement {
        disconnectedCallback() {
          removed = true;
        }
      }
      customElements.define('x-boo-ir2', XBoo);
      var xboo = new XBoo();
      assert(!removed, 'removed must be false [XBoo]');
      work.appendChild(xboo);
      customElements.flush();
      work.removeChild(xboo);
      customElements.flush();
      assert(removed, 'removed must be true [XBoo]');

      ready = inserted = removed = false;
      class XBooBoo extends HTMLElement {
        disconnectedCallback() {
          removed = true;
        }
      }
      customElements.define('x-booboo-ir2', XBooBoo);
      var xbooboo = new XBooBoo();
      assert(!removed, 'removed must be false [XBooBoo]');
      work.appendChild(xbooboo);
      customElements.flush();
      work.removeChild(xbooboo);
      customElements.flush();
      assert(removed, 'removed must be true [XBooBoo]');
    });

    test('called when disconnected from main document', function() {
      var disconnected = false;
      class CustomizedBuiltin6 extends HTMLQuoteElement {
        disconnectedCallback() {
          disconnected = true;
        }
      }

      customElements.define('customized-builtin-6', CustomizedBuiltin6, {extends: 'b'});
      var b = document.createElement('b', {is: 'customized-builtin-6'});
      work.appendChild(b);
      customElements.flush();
      work.removeChild(b);
      customElements.flush();
      assert(disconnected, 'disconnected should be called [CustomizedBuiltin6]');
    });

    test('called in tree order', function() {
      var log = [];
      class XOrdering2 extends HTMLElement {
        disconnectedCallback() {
          log.push(this.id);
        }
      }
      class XOrderingCustomized2 extends HTMLHeadingElement {
        disconnectedCallback() {
          log.push(this.id);
        }
      }
      customElements.define('x-ordering2', XOrdering2);
      customElements.define('x-ordering-customized2', XOrderingCustomized2, {extends: 'h1'});

      work.innerHTML =
          '<x-ordering2 id=a>' +
            '<x-ordering2 id=b></x-ordering2>' +
            '<x-ordering2 id=c>' +
              '<x-ordering2 id=d></x-ordering2>' +
              '<x-ordering2 id=e></x-ordering2>' +
              '<h1 id=f is="x-ordering-customized2"></h1>' +
            '</x-ordering2>' +
          '</x-ordering2>';

        customElements.flush();
        work.removeChild(work.firstElementChild);
        customElements.flush();
        assert.deepEqual(['a', 'b', 'c', 'd', 'e', 'f'], log);
    });

  });

  suite('clone/import/adopt', function() {

    test('imported custom elements are customized', function() {
      class XImported extends HTMLElement {}
      customElements.define('x-imported', XImported);

      // most imports happen on nodes in a different document, but elements
      // in another document woudn't be customized in the first place
      var original = document.createElement('x-imported');
      customElements.flush();
      assert.instanceOf(original, XImported);

      var imported = document.importNode(original, true);
      customElements.flush();
      assert.instanceOf(imported, XImported);
    });

    test.skip('cloned custom elements are customized', function() {
      class XCloned extends HTMLElement {}
      customElements.define('x-cloned', XCloned);

      var original = document.createElement('x-cloned');
      customElements.flush();
      assert.instanceOf(original, XCloned);

      var imported = original.cloneNode(true);
      customElements.flush();
      assert.instanceOf(imported, XCloned);
    });

    test.skip('adopted custom elements are customized', function() {
      class XAdopted extends HTMLElement {}
      customElements.define('x-adopted', XAdopted);

      var otherDoc = document.implementation.createHTMLDocument('adopt');
      var original = otherDoc.createElement('x-adopted');
      customElements.flush();
      // x-adopted is not defined in its document
      assert.notInstanceOf(original, XAdopted);

      var imported = document.adoptNode(original);
      customElements.flush();
      assert.notInstanceOf(imported, XAdopted);
    });

  });

  suite('moving and reconnecting', function() {

    test('connected then disconnected', function() {
      class XCallbacks extends HTMLElement {
        constructor() {
          super();
          this.connected = false;
          this.disconnected = false;
        }

        connectedCallback() {
          this.connected = true;
        }

        disconnectedCallback() {
          this.disconnected = true;
        }
      }
      customElements.define('x-callbacks', XCallbacks);
      var e = new XCallbacks();
      assert.isFalse(e.connected);
      assert.isFalse(e.disconnected);

      work.appendChild(e);
      customElements.flush();
      assert.isTrue(e.connected);
      assert.isFalse(e.disconnected);

      work.removeChild(e);
      customElements.flush();
      assert.isTrue(e.connected);
      assert.isTrue(e.disconnected);
    });

    // TODO(justinfagnani): old, ported test. Rendundant?
    test('entered left apply to view', function() {
      var invocations = [];
      var tagName = 'x-entered-left';
      class XEnteredLeft extends HTMLElement {
        constructor() {
          super();
          invocations.push('constructor');
        }
        connectedCallback() {
          invocations.push('entered');
        }
        disconnectedCallback() {
          invocations.push('left');
        }
      }
      customElements.define(tagName, XEnteredLeft);

      var element = document.createElement(tagName);
      customElements.flush();
      assert.deepEqual(invocations, ['constructor'], 'created but not entered view');

      // // note, cannot use instanceof due to IE
      assert.equal(element.__proto__, XEnteredLeft.prototype, 'element is correct type');

      work.appendChild(element)
      customElements.flush();
      assert.deepEqual(invocations, ['constructor', 'entered'],
          'created and entered view');

      element.parentNode.removeChild(element);
      customElements.flush();
      assert.deepEqual(invocations, ['constructor', 'entered', 'left'],
          'created, entered then left view');
    });

    test('connected then disconnected in same task', function() {
      var log = [];
      class XAD extends HTMLElement {
        connectedCallback() {
          log.push('connected');
        }
        disconnectedCallback() {
          log.push('disconnected');
        }
      }

      customElements.define('x-ad', XAD);
      var el = document.createElement('x-ad');
      work.appendChild(el);
      customElements.flush();
      work.removeChild(el);
      customElements.flush();
      assert.deepEqual(log, ['connected', 'disconnected']);
    });

    test('disconnected then re-connected in same task', function() {
      var log = [];
      class XDA extends HTMLElement {
        connectedCallback() {
          log.push('connected');
        }
        disconnectedCallback() {
          log.push('disconnected');
        }
      }
      customElements.define('x-da', XDA);
      var el = document.createElement('x-da');
      work.appendChild(el);
      customElements.flush();
      log = [];
      work.removeChild(el);
      work.appendChild(el);
      customElements.flush();
      assert.deepEqual(log, ['disconnected', 'connected']);
    });

  });

});
