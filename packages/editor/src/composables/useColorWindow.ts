import { getWindowFormsStore } from '@app/stores/window-forms';
import { getWindowStore } from '@app/stores/window';
import { requestFocus } from '@app/directives/focus';

export interface ColorForm {
	hex: string;
	r: number;
	g: number;
	b: number;
	a: number;
	index: number | null;
}

interface ColorWindow {
	form: ColorForm;
	open: (
		color: string,
		index: number | null,
		indexEnabled: boolean,
		callback: (value: number | string) => void
	) => void;
	confirm: () => void;
	onWindowClosed: () => void;
}

const getRGBAFromHex = (hex: string): [number, number, number, number] => {
	const r = parseInt(hex.slice(0, 2) || '00', 16);
	const g = parseInt(hex.slice(2, 4) || '00', 16);
	const b = parseInt(hex.slice(4, 6) || '00', 16);
	const a = parseInt(hex.slice(6, 8) || 'ff', 16);
	return [r, g, b, a];
};

const getHexFromRGBA = ([r, g, b, a]: [number, number, number, number]): string =>
	`${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b
		.toString(16)
		.padStart(2, '0')}${a.toString(16).padStart(2, '0')}`;

const simplifyHex = (hex: string): string => hex.replace(/^([0-9a-f]{6})ff$/i, '$1');

// 表单真源在 `stores/window-forms.ts`（原先是本文件的模块级 `reactive`）。
// 逐字段访问器 ⇒ `Object.assign(form, …)`、`const data = form` 与模板 v-model 都不用改。
const form: ColorForm = {
	get hex(): ColorForm['hex'] {
		return getWindowFormsStore().colorForm.hex;
	},
	set hex(value: ColorForm['hex']) {
		getWindowFormsStore().colorForm.hex = value;
	},
	get r(): ColorForm['r'] {
		return getWindowFormsStore().colorForm.r;
	},
	set r(value: ColorForm['r']) {
		getWindowFormsStore().colorForm.r = value;
	},
	get g(): ColorForm['g'] {
		return getWindowFormsStore().colorForm.g;
	},
	set g(value: ColorForm['g']) {
		getWindowFormsStore().colorForm.g = value;
	},
	get b(): ColorForm['b'] {
		return getWindowFormsStore().colorForm.b;
	},
	set b(value: ColorForm['b']) {
		getWindowFormsStore().colorForm.b = value;
	},
	get a(): ColorForm['a'] {
		return getWindowFormsStore().colorForm.a;
	},
	set a(value: ColorForm['a']) {
		getWindowFormsStore().colorForm.a = value;
	},
	get index(): ColorForm['index'] {
		return getWindowFormsStore().colorForm.index;
	},
	set index(value: ColorForm['index']) {
		getWindowFormsStore().colorForm.index = value;
	}
};
let callback: ((value: number | string) => void) | null = null;
let indexEnabled = false;

const open = (
	color: string,
	index: number | null,
	enabled: boolean,
	cb: (value: number | string) => void
): void => {
	callback = cb;
	indexEnabled = enabled;
	getWindowStore().open('color');
	const rgba = getRGBAFromHex(color);
	const data: ColorForm = {
		hex: simplifyHex(color),
		r: rgba[0],
		g: rgba[1],
		b: rgba[2],
		a: rgba[3],
		index
	};
	Object.assign(form, data);
	requestFocus('color-hex', 'all');
};

const confirm = (): void => {
	const data = form;
	if (indexEnabled && data.index !== null) {
		callback?.(data.index);
	} else {
		callback?.(getHexFromRGBA([data.r, data.g, data.b, data.a]));
	}
	getWindowStore().close('color');
};

const onWindowClosed = (): void => {
	callback = null;
};

export function useColorWindow(): ColorWindow {
	return { form, open, confirm, onWindowClosed };
}
