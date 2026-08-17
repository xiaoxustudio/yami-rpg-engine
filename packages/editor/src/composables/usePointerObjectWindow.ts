import { $ } from '@app/legacy/util/dom.ts';
import { addClass, removeClass } from '@app/legacy/util/element-utils';

interface PointerObjectWindow {
	readonly region: HTMLElement;
	open: (className: string) => void;
	close: (className: string) => void;
}

const open = (className: string): void => {
	addClass($('#cursor-region'), className);
};

const close = (className: string): void => {
	removeClass($('#cursor-region'), className);
};

export function usePointerObjectWindow(): PointerObjectWindow {
	return {
		get region() {
			return $('#cursor-region');
		},
		open,
		close
	};
}
