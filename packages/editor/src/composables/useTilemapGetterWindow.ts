/* oxlint-disable eslint/no-restricted-properties */
import { reactive } from 'vue';
import { getWindowStore } from '@app/stores/window';
import { getFocus } from '@app/utils/element-utils';

export interface TilemapGetterForm {
	type: string;
	presetId: string;
	variable: { type: string; key: string };
}

interface TilemapGetterTarget {
	// oxlint-disable-next-line no-explicit-any
	read?: () => any;
	input: (getter: Record<string, unknown>) => void;
	isPluginInput?: boolean;
}

interface TilemapGetterWindow {
	form: TilemapGetterForm;
	open: (target: TilemapGetterTarget, defaults?: Partial<TilemapGetterForm>) => void;
	confirm: () => void;
	onWindowClosed: () => void;
}

const form = reactive<TilemapGetterForm>({
	type: 'trigger',
	presetId: '',
	variable: { type: 'local', key: '' }
});
let callback: ((getter: Record<string, unknown>) => void) | null = null;

const open = (target: TilemapGetterTarget, defaults?: Partial<TilemapGetterForm>): void => {
	callback = (getter: Record<string, unknown>) => target.input(getter);
	getWindowStore().open('tilemapGetter');

	let presetId = defaults?.presetId ?? '';
	let variable = { type: 'local', key: '' };
	const tilemap = target.read?.() ?? {};
	switch (tilemap.type) {
		case 'trigger':
			break;
		case 'by-id':
			presetId = tilemap.presetId;
			break;
		case 'variable':
			variable = tilemap.variable;
			break;
	}
	Object.assign(form, { type: tilemap.type, presetId, variable });
	getFocus(document.getElementById('tilemapGetter-type'));
};

const confirm = (): void => {
	const data = form;
	let getter: Record<string, unknown> | undefined;
	switch (data.type) {
		case 'trigger':
			getter = { type: data.type };
			break;
		case 'by-id':
			if (data.presetId === '') {
				getFocus(document.getElementById('tilemapGetter-presetId'));
				return;
			}
			getter = { type: data.type, presetId: data.presetId };
			break;
		case 'variable':
			if (data.variable.key === '') {
				getFocus(document.getElementById('tilemapGetter-variable'));
				return;
			}
			getter = { type: data.type, variable: data.variable };
			break;
	}
	callback?.(getter!);
	getWindowStore().close('tilemapGetter');
};

const onWindowClosed = (): void => {
	callback = null;
};

export function useTilemapGetterWindow(): TilemapGetterWindow {
	return { form, open, confirm, onWindowClosed };
}
