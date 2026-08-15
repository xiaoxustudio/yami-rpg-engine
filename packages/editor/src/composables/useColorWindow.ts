import { reactive } from 'vue';
import { Window } from '@/tools/window-object.ts';
import { getFocus } from '@/util/element-utils';

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

const form = reactive<ColorForm>({ hex: '00000000', r: 0, g: 0, b: 0, a: 0, index: null });
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
	Window.open!('color');
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
	const setForm = (
		document.getElementById('color') as
			| (HTMLElement & { setForm?: (data: Partial<ColorForm>) => void })
			| null
	)?.setForm;
	setForm?.(
		index !== null ? data : { hex: data.hex, r: data.r, g: data.g, b: data.b, a: data.a }
	);
	getFocus(document.getElementById('color-hex'), 'all');
};

const confirm = (): void => {
	const getForm = (
		document.getElementById('color') as (HTMLElement & { getForm?: () => ColorForm }) | null
	)?.getForm;
	const data = getForm?.() ?? { ...form };
	if (indexEnabled && data.index !== null) {
		callback?.(data.index);
	} else {
		callback?.(getHexFromRGBA([data.r, data.g, data.b, data.a]));
	}
	Window.close!('color');
};

const onWindowClosed = (): void => {
	callback = null;
};

export function useColorWindow(): ColorWindow {
	return { form, open, confirm, onWindowClosed };
}
