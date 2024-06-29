const attrs = {
  overlay: "with-overlay",
  vertical: "vertical",
  itemsContainerElem: "items-container-element",
  rotateNegative: "rotate-negative",
  rawMode: "raw",
  debounce: "debounce-rerender",
  noResize: "no-resize",
};

// changing those attrs triggers a re-render
const rerenderingAttrs = [attrs.vertical, attrs.rotateNegative];

const debounce = (func, timeout) => {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      func.apply(this, args);
    }, timeout);
  };
};

class Cylinder extends HTMLElement {
  static observedAttributes = [
    attrs.overlay,
    attrs.vertical,
    attrs.rotateNegative,
    attrs.debounce,
  ];
  static sheet = new CSSStyleSheet();

  constructor() {
    super();
  }

  renderOverlay = () => {
    let leftMost = window.innerWidth;
    let rightMost = 0;
    let topMost = window.innerHeight;
    let bottomMost = 0;

    this.items.forEach((item) => {
      const rect = item.getBoundingClientRect();
      if (rect.left < leftMost) leftMost = rect.left;
      if (rect.right > rightMost) rightMost = rect.right;
      if (rect.bottom > bottomMost) bottomMost = rect.bottom;
      if (rect.top < topMost) topMost = rect.top;
    });

    this.overlay.style.width = rightMost - leftMost + "px";
    this.overlay.style.height = bottomMost - topMost + "px";
  };

  renderOut = () => {
    const itemStyle = getComputedStyle(this.itemsContainer.children[0]);
    // The width or height of each item, which will be used depends on orientation
    const itemDim = parseInt(
      itemStyle[this[attrs.vertical] ? "height" : "width"].replace(
        /[^0-9\.]+/g,
        ""
      )
    );
    /* Calculate how far the new Z axis should be based off the radius of the largest circle inscribed within a regular shape of this number of sides */
    this.rad =
      Math.tan(
        (((180 * (this.numSides - 2)) / (2 * this.numSides)) * Math.PI) / 180
      ) *
      (itemDim / 2);

    // The perspective, by default it's the: cylinder radius + 4*item dimension (dimension is width or height depending on orientation)
    this.perspectiveContainer.style.perspective = this.rad + itemDim * 4 + "px";
    this.itemsContainer.style.transformOrigin = `center center -${this.rad}px`;

    for (let i = 0; i < this.numSides; i++) {
      const elem = this.items[i];
      elem.style.transformOrigin = `center center -${this.rad}px`;
      elem.style.transform = `rotate${this[attrs.vertical] ? "X" : "Y"}(${
        this.rotateMultiplier * i * this.rotDeg
      }deg)`;
    }

    if (this.anchorElem) {
      this.anchorElem.style.translate = `0px 0px -${this.rad}px`;
    }

    if (this[attrs.overlay]) {
      this.renderOverlay();
    }
  };

  connectedCallback() {
    const shadow = this.attachShadow({ mode: "open" });
    shadow.adoptedStyleSheets = [Cylinder.sheet];

    if (this.hasAttribute(attrs.rawMode)) {
      this.perspectiveContainer = this.querySelector("#perspective-container");
      this.itemsContainer = this.querySelector("#items-container");
      this.overlay = this.querySelector("#overlay");
      this.items = this.itemsContainer.querySelectorAll(
        ":scope > :not(.ignore)"
      );
      this.ignoredElems =
        this.itemsContainer.querySelectorAll(":scope > .ignore");
      this.styleElems = this.querySelectorAll("style");
      this.anchorElem = this.querySelector(".anchor");
      shadow.append(...this.querySelectorAll(":scope > *"));
    } else {
      this.items = this.querySelectorAll(":scope > :not(style, link, .ignore)");
      this.ignoredElems = this.querySelectorAll(".ignore");
      this.styleElems = this.querySelectorAll("style");
      this.anchorElem = this.querySelector(".anchor");
      this.perspectiveContainer = document.createElement("div");
      this.perspectiveContainer.id = "perspective-container";
      this.itemsContainer = document.createElement(
        this.getAttribute(attrs.itemsContainerElem) || "div"
      );
      this.itemsContainer.id = "items-container";
      this.itemsContainer.append(...this.items, ...this.ignoredElems);
      this.overlay = document.createElement("div");
      this.overlay.id = "overlay";
      this.replaceChildren();
      this.perspectiveContainer.appendChild(this.itemsContainer);
      shadow.append(
        ...this.styleElems,
        this.overlay,
        this.perspectiveContainer
      );
    }

    this.numSides = this.items.length;
    this.rotDeg = 360 / this.numSides;
    this.firstRender = true;
    if (!this.rotateMultiplier) this.rotateMultiplier = 1;
    if (!this.renderOutDebounced) this.renderOutDebounced = this.renderOut;

    if (!this.hasAttribute(attrs.noResize)) {
      this.resizeObserver = new ResizeObserver((entries) => {
        if (this.firstRender) {
          this.renderOut();
          this.firstRender = false;
          return;
        }
        this.renderOutDebounced();
      });

      this.mutationObserver = new MutationObserver((entries) => {
        for (const mutation of entries) {
          if (mutation.type === "childList") {
            this.resizeObserver.disconnect();
            this.items = this.itemsContainer.querySelectorAll(
              ":scope > :not(.ignore, style, link)"
            );
            this.ignoredElems = this.itemsContainer.querySelectorAll(".ignore");
            this.numSides = this.items.length;
            this.rotDeg = 360 / this.numSides;
            this.resizeObserver.observe(...this.items);
          }
        }
      });
      this.mutationObserver.observe(this.itemsContainer, { childList: true });
      this.resizeObserver.observe(...this.items);
    } else {
      this.renderOut();
    }
  }

  attributeChangedCallback(name, oldVal, newVal) {
    switch (name) {
      case attrs.overlay: {
        // if the newVal is not equal to null, the attribute is present
        if (newVal !== null) {
          this[attrs.overlay] = true;
          this.overlay.style.display = "block";
          this.renderOverlay();
        } else {
          this[attrs.overlay] = false;
          this.overlay.style.display = "none";
        }
        break;
      }
      case attrs.rotateNegative: {
        this.rotateMultiplier = newVal !== null ? -1 : 1;
        break;
      }
      case attrs.debounce: {
        if (newVal === "-1") {
          this.renderOutDebounced = () => {};
        } else if (newVal !== null) {
          this.renderOutDebounced = debounce(this.renderOut, parseInt(newVal));
        } else {
          this.renderOutDebounced = this.renderOut;
        }
        break;
      }
      default: {
        this[name] = newVal !== null ? newVal || true : false;
      }
    }

    if (rerenderingAttrs.includes(name)) {
      this.itemsContainer && this.renderOut();
    }
  }

  disconnectedCallback() {
    this.resizeObserver?.disconnect();
    this.mutationObserver?.disconnect();
  }
}

Cylinder.sheet.replaceSync(`
    @layer cylinder-sheet {
      * {
        box-sizing: border-box;
      }
  
      :host, #perspective-container, #items-container {
          height: 100%;
        width: 100%;
        display: flex;
        justify-content: center;
        align-items: center;
      }
  
      :host {
        position: relative;
      }
  
      #perspective-container {
           overflow: hidden;
      }
  
      #items-container {
        position: relative;
        transform-style: preserve-3d;
      }
  
      #items-container > * {
        position: absolute;
      }
  
      #overlay {
        position: absolute;
        z-index: 1;
        max-height: 100%;
        max-width: 100%;
      }
    }
  `);

export default Cylinder;
