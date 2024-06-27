const attrs = {
  overlay: "with-overlay",
  vertical: "vertical",
  itemsContainerElem: "items-container-element",
  perspective: "perspective",
  rotateNegative: "rotate-negative",
  rawMode: "raw",
};

class Cylinder extends HTMLElement {
  static observedAttributes = [
    attrs.overlay,
    attrs.vertical,
    attrs.itemsContainerElem,
    attrs.perspective,
    attrs.rotateNegative,
  ];
  static sheet = new CSSStyleSheet();

  constructor() {
    super();
  }

  connectedCallback() {
    const isRaw = this.hasAttribute(attrs.rawMode);
    const withOverlay = this.hasAttribute(attrs.overlay);
    const isVertical = this.hasAttribute(attrs.vertical);
    const containerElemType =
      this.getAttribute(attrs.itemsContainerElem) || "div";
    const rotateMultiplier = this.hasAttribute(attrs.rotateNegative) ? -1 : 1;
    const shadow = this.attachShadow({ mode: "open" });
    shadow.adoptedStyleSheets = [Cylinder.sheet];

    let [
      perspectiveContainer,
      itemsContainer,
      overlay,
      items,
      ignoredElems,
      styleElems,
    ] = [];

    if (isRaw) {
      perspectiveContainer = this.perspectiveContainer = this.querySelector(
        "#perspective-container"
      );
      itemsContainer = this.itemsContainer =
        this.querySelector("#items-container");
      overlay = this.overlay = this.querySelector("#overlay");
      items = this.items = itemsContainer.querySelectorAll(
        ":scope > :not(.ignore)"
      );
      ignoredElems = this.ignoredElems =
        itemsContainer.querySelectorAll(":scope > .ignore");
      styleElems = this.styleElems = this.querySelectorAll("style");
      shadow.append(...this.querySelectorAll(":scope > *"));
    } else {
      items = this.items = this.querySelectorAll(
        ":scope > :not(style, link, .ignore)"
      );
      ignoredElems = this.ignoredElems = this.querySelectorAll(".ignore");
      styleElems = this.styleElems = this.querySelectorAll("style");
      perspectiveContainer = this.perspectiveContainer =
        document.createElement("div");
      perspectiveContainer.id = "perspective-container";
      itemsContainer = this.itemsContainer =
        document.createElement(containerElemType);
      itemsContainer.id = "items-container";
      overlay = this.overlay = document.createElement("div");
      overlay.id = "overlay";

      itemsContainer.append(...items, ...ignoredElems);
      this.replaceChildren();
      perspectiveContainer.appendChild(itemsContainer);
      shadow.append(...styleElems, overlay, perspectiveContainer);
    }

    if (!withOverlay) {
      overlay.style.display = "none";
    }

    const numSides = (this.numSides = items.length);
    const rotDeg = (this.rotDeg = 360 / numSides);
    const renderOut = (this.renderOut = () => {
      const itemStyle = getComputedStyle(itemsContainer.children[0]);
      // The width or height of each item, which will be used depends on orientation
      const itemDim = parseInt(
        itemStyle[isVertical ? "height" : "width"].replace(/[^0-9\.]+/g, "")
      );
      /* Calculate how far the new Z axis should be based off the radius of the largest circle inscribed within a regular shape of this number of sides */
      const rad =
        Math.tan((((180 * (numSides - 2)) / (2 * numSides)) * Math.PI) / 180) *
        (itemDim / 2);

      // The perspective, by default it's the: cylinder radius + 4*item dimension (dimension is width or height depending on orientation)
      perspectiveContainer.style.perspective =
        this.getAttribute(attrs.perspective) || rad + itemDim * 4 + "px";

      itemsContainer.style.transformOrigin = `center center -${rad}px`;

      for (let i = 0; i < numSides; i++) {
        const elem = items[i];
        elem.style.transformOrigin = `center center -${rad}px`;
        elem.style.transform = `rotate${isVertical ? "X" : "Y"}(${
          rotateMultiplier * i * rotDeg
        }deg)`;
      }

      if (withOverlay) {
        let leftMost = window.innerWidth;
        let rightMost = 0;
        let topMost = window.innerHeight;
        let bottomMost = 0;

        items.forEach((item) => {
          const rect = item.getBoundingClientRect();
          if (rect.left < leftMost) leftMost = rect.left;
          if (rect.right > rightMost) rightMost = rect.right;
          if (rect.bottom > bottomMost) bottomMost = rect.bottom;
          if (rect.top < topMost) topMost = rect.top;
        });
        overlay.style.width = rightMost - leftMost + "px";
        overlay.style.height = bottomMost - topMost + "px";
      }
    });

    const resizeObserver = (this.resizeObserver = new ResizeObserver(
      (entries) => {
        renderOut();
      }
    ));
    resizeObserver.observe(...items);
  }

  attributeChangedCallback(name, oldVal, newVal) {
    this.renderOut && this.renderOut();
    if (this.overlay && name === attrs.overlay) {
      this.overlay.style.display =
        this.overlay.style.display === "block" ? "none" : "block";
    }
  }

  disconnectedCallback() {
    this.resizeObserver.disconnect();
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
