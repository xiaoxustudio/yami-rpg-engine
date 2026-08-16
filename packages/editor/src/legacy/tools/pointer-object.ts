import { usePointerObjectWindow } from '@app/composables/usePointerObjectWindow';

export const Cursor: {
	readonly region: HTMLElement;
	open: (this: typeof Cursor, className: string) => void;
	close: (this: typeof Cursor, className: string) => void;
} = {
	get region() {
		return usePointerObjectWindow().region;
	},
	open: function (this: typeof Cursor, className: string) {
		usePointerObjectWindow().open(className);
	},
	close: function (this: typeof Cursor, className: string) {
		usePointerObjectWindow().close(className);
	}
};
