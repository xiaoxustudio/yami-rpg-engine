import { addClass, removeClass } from '@app/utils/element-utils';

interface PointerObjectWindow {
	readonly region: HTMLElement;
	open: (className: string) => void;
	close: (className: string) => void;
}

const open = (className: string): void => {
	addClass(document.getElementById('cursor-region'), className);
};

const close = (className: string): void => {
	removeClass(document.getElementById('cursor-region'), className);
};

export function usePointerObjectWindow(): PointerObjectWindow {
	return {
		get region() {
			return document.getElementById('cursor-region')!;
		},
		open,
		close
	};
}

export const Cursor: {
	readonly region: HTMLElement;
	open: (className: string) => void;
	close: (className: string) => void;
} = {
	get region() {
		return document.getElementById('cursor-region')!;
	},
	open,
	close
};
