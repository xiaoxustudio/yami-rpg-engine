import '@app/legacy/inspector/element-dialog-page.ts';
import { reactive } from 'vue';
import { Inspector } from '@app/legacy/inspector/inspector.ts';
import { read } from '@app/legacy/util/element-utils';

interface DialogBoxForm {
	content: string;
	interval: number;
	size: number;
	lineSpacing: number;
	letterSpacing: number;
	color: string;
	font: string;
	typeface: string;
	effect: {
		type: string;
		shadowOffsetX: number;
		shadowOffsetY: number;
		strokeWidth: number;
		color: string;
	};
	blend: string;
}

const DIALOG_BOX_KEYS: (keyof DialogBoxForm)[] = [
	'content',
	'interval',
	'size',
	'lineSpacing',
	'letterSpacing',
	'color',
	'font',
	'typeface',
	'blend'
];

export function useUIDialogBoxPage() {
	const form = reactive<DialogBoxForm>({
		content: '',
		interval: 16.6666,
		size: 16,
		lineSpacing: 0,
		letterSpacing: 0,
		color: 'ffffffff',
		font: '',
		typeface: 'regular',
		effect: {
			type: 'none',
			shadowOffsetX: 1,
			shadowOffsetY: 1,
			strokeWidth: 1,
			color: '000000ff'
		},
		blend: 'normal'
	});

	const sync = (): void => {
		const target = Inspector?.uiDialogBox?.target as Partial<DialogBoxForm> | null | undefined;
		if (!target) return;
		for (const key of DIALOG_BOX_KEYS) {
			const value = target[key];
			if (value !== undefined) {
				(form as Record<string, unknown>)[key] = value;
			}
		}
		form.effect = {
			type: target.effect?.type ?? 'none',
			shadowOffsetX: target.effect?.shadowOffsetX ?? 1,
			shadowOffsetY: target.effect?.shadowOffsetY ?? 1,
			strokeWidth: target.effect?.strokeWidth ?? 1,
			color: target.effect?.color ?? '000000ff'
		};
	};

	const onParamInput = (event: Event): void => {
		const target = event?.target ?? document.activeElement;
		let element = target;
		while (element instanceof Element) {
			if (new RegExp('^uiDialogBox-').test(element.id)) break;
			element = element.parentElement;
		}
		if (element instanceof Element) {
			Inspector.uiDialogBox.update(
				Inspector.uiDialogBox.target,
				Inspector.getKey(element),
				read(element)
			);
		}
		sync();
	};

	return { form, sync, onParamInput };
}
