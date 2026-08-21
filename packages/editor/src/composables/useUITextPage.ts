import '@app/inspector/element-text-page.ts';
import { reactive } from 'vue';
import { Inspector } from '@app/inspector/inspector.ts';
import { read } from '@app/utils/element-utils';

interface TextForm {
	direction: string;
	horizontalAlign: string;
	verticalAlign: string;
	content: string;
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
	overflow: string;
	blend: string;
}

const TEXT_KEYS: (keyof TextForm)[] = [
	'direction',
	'horizontalAlign',
	'verticalAlign',
	'content',
	'size',
	'lineSpacing',
	'letterSpacing',
	'color',
	'font',
	'typeface',
	'overflow',
	'blend'
];

export function useUITextPage() {
	const form = reactive<TextForm>({
		direction: 'horizontal-tb',
		horizontalAlign: 'left',
		verticalAlign: 'middle',
		content: '',
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
		overflow: 'visible',
		blend: 'normal'
	});

	const sync = (): void => {
		const target = Inspector?.uiText?.target as Partial<TextForm> | null | undefined;
		if (!target) return;
		for (const key of TEXT_KEYS) {
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
			if (new RegExp('^uiText-').test(element.id)) break;
			element = element.parentElement;
		}
		if (element instanceof Element) {
			Inspector.uiText.update(
				Inspector.uiText.target,
				Inspector.getKey(element),
				read(element)
			);
		}
		sync();
	};

	return { form, sync, onParamInput };
}
