interface Shape2 {
	initialize: () => void;
	bind: (searcher: HTMLElement) => void;
}
declare const BSH: Shape2;
interface FB {
	initialize?(): void;
	searcher?: HTMLElement & { addKeydownFilter?(): void };
}
declare const browser: FB;
browser.initialize = function () {
	browser.initialize?.call(this);
	BSH.bind(this.searcher!);
};
export {};
