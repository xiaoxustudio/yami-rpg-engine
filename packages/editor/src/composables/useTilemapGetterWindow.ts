import { reactive } from 'vue';
import { Window } from '@app/legacy/tools/window-object.ts';
import { getFocus } from '@app/utils/element-utils';

export interface TilemapGetterForm {
	type: string;
	presetId: string;
	variable: { type: string; key: string };
}

interface TilemapGetterTarget {
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

type TilemapGetterFrame = HTMLElement & {
	setForm?: (data: Partial<TilemapGetterForm>) => void;
	getForm?: () => TilemapGetterForm;
};

const form = reactive<TilemapGetterForm>({
	type: 'trigger',
	presetId: '',
	variable: { type: 'local', key: '' }
});
let callback: ((getter: Record<string, unknown>) => void) | null = null;

const getFrame = (): TilemapGetterFrame | null =>
	document.getElementById('tilemapGetter') as TilemapGetterFrame | null;

const open = (target: TilemapGetterTarget, defaults?: Partial<TilemapGetterForm>): void => {
	callback = (getter: Record<string, unknown>) => target.input(getter);
	Window.open!('tilemapGetter');

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
	getFrame()?.setForm?.(form);
	getFocus(document.getElementById('tilemapGetter-type'));
};

const confirm = (): void => {
	const data = getFrame()?.getForm?.() ?? form;
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
	Window.close!('tilemapGetter');
};

const onWindowClosed = (): void => {
	callback = null;
};

export function useTilemapGetterWindow(): TilemapGetterWindow {
	return { form, open, confirm, onWindowClosed };
}
