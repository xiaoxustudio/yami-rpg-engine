import { getGetterWindowsStore } from '@app/stores/getter-windows';
import { getWindowStore } from '@app/stores/window';
import { requestFocus } from '@app/directives/focus';

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

// 表单真源在 `stores/getter-windows.ts`（原先是本文件的模块级 `reactive`）。
// 逐字段访问器 ⇒ `Object.assign(form, …)`、`const data = form` 与模板 v-model 都不用改。
const form: TilemapGetterForm = {
	get type(): TilemapGetterForm['type'] {
		return getGetterWindowsStore().tilemapGetterForm.type;
	},
	set type(value: TilemapGetterForm['type']) {
		getGetterWindowsStore().tilemapGetterForm.type = value;
	},
	get presetId(): TilemapGetterForm['presetId'] {
		return getGetterWindowsStore().tilemapGetterForm.presetId;
	},
	set presetId(value: TilemapGetterForm['presetId']) {
		getGetterWindowsStore().tilemapGetterForm.presetId = value;
	},
	get variable(): TilemapGetterForm['variable'] {
		return getGetterWindowsStore().tilemapGetterForm.variable;
	},
	set variable(value: TilemapGetterForm['variable']) {
		getGetterWindowsStore().tilemapGetterForm.variable = value;
	}
};
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
	requestFocus('tilemapGetter-type');
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
				requestFocus('tilemapGetter-presetId');
				return;
			}
			getter = { type: data.type, presetId: data.presetId };
			break;
		case 'variable':
			if (data.variable.key === '') {
				requestFocus('tilemapGetter-variable');
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
