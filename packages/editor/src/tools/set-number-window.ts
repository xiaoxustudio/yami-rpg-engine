import { useSetQuantityWindow, type SetQuantityForm } from '@app/composables/useSetQuantityWindow';

export type { SetQuantityForm };

export const SetQuantity = {
	callback: null as ((value: number) => void) | null,
	initialize: (): void => undefined,
	open: (quantity: number, maximum: number, callback: (value: number) => void): void => {
		useSetQuantityWindow().open(quantity, maximum, callback);
	},
	windowClosed: (): void => {
		useSetQuantityWindow().onWindowClosed();
	},
	confirm: (): void => {
		useSetQuantityWindow().confirm();
	}
};
