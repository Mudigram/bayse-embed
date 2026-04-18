declare const OBSERVED_ATTRIBUTES: readonly ["slug", "variant", "currency"];
type ObservedAttribute = typeof OBSERVED_ATTRIBUTES[number];
declare class BayseMarketElement extends HTMLElement {
    private root;
    private mountPoint;
    static get observedAttributes(): string[];
    connectedCallback(): void;
    disconnectedCallback(): void;
    attributeChangedCallback(_name: ObservedAttribute, oldValue: string | null, newValue: string | null): void;
    private getProps;
    private render;
}
export { BayseMarketElement };
//# sourceMappingURL=BayseMarketElement.d.ts.map