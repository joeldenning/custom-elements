import CustomElementInternals from './CustomElementInternals.js';
import DocumentConstructionObserver from './DocumentConstructionObserver.js';
import Deferred from './Deferred.js';
import * as Utilities from './Utilities.js';

/**
 * @unrestricted
 */
export default class CustomElementRegistry {

  /**
   * @param {!CustomElementInternals} internals
   */
  constructor(internals) {
    /**
     * @private
     * @type {boolean}
     */
    this._elementDefinitionIsRunning = false;

    /**
     * @private
     * @type {!CustomElementInternals}
     */
    this._internals = internals;

    /**
     * @private
     * @type {!Map<string, !Deferred<undefined>>}
     */
    this._whenDefinedDeferred = new Map();

    /**
     * The default flush callback triggers the document walk synchronously.
     * @private
     * @type {!Function}
     */
    this._flushCallback = fn => fn();

    /**
     * @private
     * @type {boolean}
     */
    this._flushPending = false;

    /**
     * @private
     * @type {!Array<string>}
     */
    this._unflushedNames = [];

    /**
     * @private
     * @type {!DocumentConstructionObserver}
     */
    this._documentConstructionObserver = new DocumentConstructionObserver(internals, document);
  }

  /**
   * @param {string} name
   * @param {!Function} constructor
   */
  define(name, constructor, options) {
    if (!(constructor instanceof Function)) {
      throw new TypeError('Custom element constructors must be functions.');
    }

    if (!Utilities.isValidCustomElementName(name)) {
      throw new SyntaxError(`The element name '${name}' is not valid.`);
    }

    if (this._internals.nameToDefinition(name)) {
      throw new Error(`A custom element with name '${name}' has already been defined.`);
    }

    let localName = name;

    if (options && options.extends) {
      if (!this['enableCustomizedBuiltins']) {
        throw new Error(`Customized builtin elements are disabled by default. Set customElements.enableCustomizedBuiltins = true.`);
      }

      if (Utilities.isValidCustomElementName(options.extends)) {
        throw new Error(`A customized builtin element may not extend a custom element.`);
      }

      const el = document.createElement(options.extends);
      if (el instanceof window['HTMLUnknownElement']) {
        throw new Error(`Cannot extend '${options.extends}': is not a real HTML element`);
      }

      localName = options.extends;
    }

    if (this._elementDefinitionIsRunning) {
      throw new Error('A custom element is already being defined.');
    }
    this._elementDefinitionIsRunning = true;

    let connectedCallback;
    let disconnectedCallback;
    let adoptedCallback;
    let attributeChangedCallback;
    let observedAttributes;
    try {
      /** @type {!Object} */
      const prototype = constructor.prototype;
      if (!(prototype instanceof Object)) {
        throw new TypeError('The custom element constructor\'s prototype is not an object.');
      }

      function getCallback(name) {
        const callbackValue = prototype[name];
        if (callbackValue !== undefined && !(callbackValue instanceof Function)) {
          throw new Error(`The '${name}' callback must be a function.`);
        }
        return callbackValue;
      }

      connectedCallback = getCallback('connectedCallback');
      disconnectedCallback = getCallback('disconnectedCallback');
      adoptedCallback = getCallback('adoptedCallback');
      attributeChangedCallback = getCallback('attributeChangedCallback');
      observedAttributes = constructor['observedAttributes'] || [];
    } catch (e) {
      return;
    } finally {
      this._elementDefinitionIsRunning = false;
    }

    const definition = {
      name,
      localName,
      constructor,
      connectedCallback,
      disconnectedCallback,
      adoptedCallback,
      attributeChangedCallback,
      observedAttributes,
      constructionStack: [],
    };

    this._internals.setDefinition(name, definition);

    this._unflushedNames.push(name);

    // If we've already called the flush callback and it hasn't called back yet,
    // don't call it again.
    if (!this._flushPending) {
      this._flushPending = true;
      this._flushCallback(() => this._flush());
    }
  }

  _flush() {
    // If no new definitions were defined, don't attempt to flush. This could
    // happen if a flush callback keeps the function it is given and calls it
    // multiple times.
    if (this._flushPending === false) return;

    this._flushPending = false;
    this._internals.patchAndUpgradeTree(document);

    while (this._unflushedNames.length > 0) {
      const name = this._unflushedNames.shift();
      const deferred = this._whenDefinedDeferred.get(name);
      if (deferred) {
        deferred.resolve(undefined);
      }
    }
  }

  /**
   * @param {string} name
   * @return {Function|undefined}
   */
  get(name) {
    const definition = this._internals.nameToDefinition(name);
    if (definition) {
      return definition.constructor;
    }

    return undefined;
  }

  /**
   * @param {string} name
   * @return {!Promise<undefined>}
   */
  whenDefined(name) {
    if (!Utilities.isValidCustomElementName(name)) {
      return Promise.reject(new SyntaxError(`'${name}' is not a valid custom element name.`));
    }

    const prior = this._whenDefinedDeferred.get(name);
    if (prior) {
      return prior.toPromise();
    }

    const deferred = new Deferred();
    this._whenDefinedDeferred.set(name, deferred);

    const definition = this._internals.nameToDefinition(name);
    // Resolve immediately only if the given local name has a definition *and*
    // the full document walk to upgrade elements with that local name has
    // already happened.
    if (definition && this._unflushedNames.indexOf(name) === -1) {
      deferred.resolve(undefined);
    }

    return deferred.toPromise();
  }

  polyfillWrapFlushCallback(outer) {
    this._documentConstructionObserver.disconnect();
    const inner = this._flushCallback;
    this._flushCallback = flush => outer(() => inner(flush));
  }
}

// Closure compiler exports.
window['CustomElementRegistry'] = CustomElementRegistry;
CustomElementRegistry.prototype['define'] = CustomElementRegistry.prototype.define;
CustomElementRegistry.prototype['get'] = CustomElementRegistry.prototype.get;
CustomElementRegistry.prototype['whenDefined'] = CustomElementRegistry.prototype.whenDefined;
CustomElementRegistry.prototype['polyfillWrapFlushCallback'] = CustomElementRegistry.prototype.polyfillWrapFlushCallback;
