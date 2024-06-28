export default Cylinder;
declare class Cylinder extends HTMLElement {
  static observedAttributes: string[];
  static sheet: CSSStyleSheet;
  connectedCallback(): void;
  perspectiveContainer: Element | HTMLDivElement;
  itemsContainer: Element | HTMLElement;
  overlay: Element | HTMLDivElement;
  items: NodeList;
  ignoredElems: NodeList;
  styleElems: NodeListOf<HTMLStyleElement>;
  numSides: number;
  rotDeg: number;
  renderOut: () => void;
  resizeObserver: ResizeObserver;
  attributeChangedCallback(name: any, oldVal: any, newVal: any): void;
  disconnectedCallback(): void;
}
