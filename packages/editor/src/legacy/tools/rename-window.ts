import { useRenameWindow, type RenameForm } from '@app/composables/useRenameWindow';

export type { RenameForm };

export const Rename = {
	callback: null as ((value: string) => void) | null,
	initialize: (): void => undefined,
	open: (name: string, callback: (value: string) => void): void => {
		useRenameWindow().open(name, callback);
	},
	windowClosed: (): void => {
		useRenameWindow().onWindowClosed();
	},
	confirm: (): void => {
		useRenameWindow().confirm();
	}
};
