export declare const measureText: (
	text: string,
	font?: string
) => {
	width: number;
	lines: number;
};
export declare const request: (callback: () => void) => void;
export declare const $: (selector: string) => any;
export declare const getElementReader: (prefix: string) => (suffix: string) => any;
export declare const getElementWriter: (
	prefix: string,
	bindingObject?: Record<string, any>
) => (suffix: string | number, value?: any) => void;
