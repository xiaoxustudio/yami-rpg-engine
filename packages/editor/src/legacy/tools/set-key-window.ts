import { useSetKeyWindow, type SetKeyForm } from '@app/composables/useSetKeyWindow';

export type { SetKeyForm };

export const SetKey = {
	callback: null as ((key: string) => void) | null,
	initialize: (): void => undefined,
	open: (key: string, callback: (key: string) => void): void => {
		useSetKeyWindow().open(key, callback);
	},
	windowClosed: (): void => {
		useSetKeyWindow().onWindowClosed();
	},
	confirm: (): void => {
		useSetKeyWindow().confirm();
	}
};
