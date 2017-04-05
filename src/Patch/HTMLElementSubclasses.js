import Native from './Native.js';
import CustomElementInternals from '../CustomElementInternals.js';
import CEState from '../CustomElementState.js';
import AlreadyConstructedMarker from '../AlreadyConstructedMarker.js';

/**
 * @param {!CustomElementInternals} internals
 */
export default function(internals) {
  for (let subclass in Native.HTMLElement_subclasses) {
    patchElement(`HTML${subclass}Element`, Native.HTMLElement_subclasses[subclass]);
  }

  function patchElement(constructorName, NativeElement) {
    if (!NativeElement) {
      return;
    }

    window[constructorName] = (function() {
      /**
       * @type {function(new: HTMLElement): !HTMLElement}
       */
      function PatchedElement() {
        // This should really be `new.target` but `new.target` can't be emulated
        // in ES5. Assuming the user keeps the default value of the constructor's
        // prototype's `constructor` property, this is equivalent.
        const constructor = /** @type {!Function} */ (this.constructor);

        const definition = internals.constructorToDefinition(constructor);
        if (!definition) {
          throw new Error('The custom element being constructed was not registered with `customElements`.');
        }

        const constructionStack = definition.constructionStack;

        if (constructionStack.length === 0) {
          let element = Native.Document_createElement.call(document, definition.localName);
          element.setAttribute('is', definition.name);
          Object.setPrototypeOf(element, constructor.prototype);
          element.__CE_state = CEState.custom;
          element.__CE_definition = definition;
          internals.patch(element);
          return /** @type {!HTMLElement} */ (element);
        }

        const lastIndex = constructionStack.length - 1;
        const element = constructionStack[lastIndex];
        if (element === AlreadyConstructedMarker) {
          throw new Error(`The ${constructorName} constructor was either called reentrantly for this constructor or called multiple times.`);
        }
        constructionStack[lastIndex] = AlreadyConstructedMarker;

        Object.setPrototypeOf(element, constructor.prototype);
        internals.patch(/** @type {!HTMLElement} */ (element));

        return /** @type {!HTMLElement} */ (element);
      }

      PatchedElement.prototype = NativeElement.prototype;

      return PatchedElement;
    })();
  }
};
