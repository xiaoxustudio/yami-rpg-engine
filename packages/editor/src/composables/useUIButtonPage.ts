import '@app/inspector/element-button-page.ts';
import { reactive } from 'vue';
import { Inspector } from '@app/inspector/inspector.ts';

export interface ButtonForm {
	display: string;
	normalImage: string;
	normalClip: number[];
	hoverImage: string;
	hoverClip: number[];
	activeImage: string;
	activeClip: number[];
	flip: string;
	border: number;
	imagePadding: number;
	imageOpacity: number;
	imageEffect: string;
	normalTint: number[];
	hoverTint: number[];
	activeTint: number[];
	direction: string;
	horizontalAlign: string;
	verticalAlign: string;
	content: string;
	size: number;
	letterSpacing: number;
	textPadding: number;
	font: string;
	typeface: string;
	textEffect: {
		type: string;
		shadowOffsetX: number;
		shadowOffsetY: number;
		strokeWidth: number;
		color: string;
	};
	normalColor: string;
	hoverColor: string;
	activeColor: string;
	hoverSound: string;
	clickSound: string;
}

const BUTTON_KEYS: (keyof ButtonForm)[] = [
	'display',
	'normalImage',
	'normalClip',
	'hoverImage',
	'hoverClip',
	'activeImage',
	'activeClip',
	'flip',
	'border',
	'imagePadding',
	'imageOpacity',
	'imageEffect',
	'direction',
	'horizontalAlign',
	'verticalAlign',
	'content',
	'size',
	'letterSpacing',
	'textPadding',
	'font',
	'typeface',
	'normalColor',
	'hoverColor',
	'activeColor',
	'hoverSound',
	'clickSound'
];

export function useUIButtonPage() {
	const form = reactive<ButtonForm>({
		display: 'stretch',
		normalImage: '',
		normalClip: [0, 0, 32, 32],
		hoverImage: '',
		hoverClip: [0, 0, 32, 32],
		activeImage: '',
		activeClip: [0, 0, 32, 32],
		flip: 'none',
		border: 1,
		imagePadding: 0,
		imageOpacity: 1,
		imageEffect: 'none',
		normalTint: [0, 0, 0, 0],
		hoverTint: [0, 0, 0, 0],
		activeTint: [0, 0, 0, 0],
		direction: 'horizontal-tb',
		horizontalAlign: 'center',
		verticalAlign: 'middle',
		content: '',
		size: 16,
		letterSpacing: 0,
		textPadding: 0,
		font: '',
		typeface: 'regular',
		textEffect: {
			type: 'none',
			shadowOffsetX: 1,
			shadowOffsetY: 1,
			strokeWidth: 1,
			color: '000000ff'
		},
		normalColor: 'ffffffff',
		hoverColor: 'ffffffff',
		activeColor: 'ffffffff',
		hoverSound: '',
		clickSound: ''
	});

	const sync = (): void => {
		const target = Inspector?.uiButton?.target as Partial<ButtonForm> | null | undefined;
		if (!target) return;
		for (const key of BUTTON_KEYS) {
			const value = target[key];
			if (value !== undefined) {
				(form as Record<string, unknown>)[key] = value;
			}
		}
		form.normalTint = target.normalTint ?? [0, 0, 0, 0];
		form.hoverTint = target.hoverTint ?? [0, 0, 0, 0];
		form.activeTint = target.activeTint ?? [0, 0, 0, 0];
		form.textEffect = {
			type: target.textEffect?.type ?? 'none',
			shadowOffsetX: target.textEffect?.shadowOffsetX ?? 1,
			shadowOffsetY: target.textEffect?.shadowOffsetY ?? 1,
			strokeWidth: target.textEffect?.strokeWidth ?? 1,
			color: target.textEffect?.color ?? '000000ff'
		};
	};

	const onParamInput = (event: Event): void => {
		const target = event?.target ?? document.activeElement;
		let element = target;
		while (element instanceof Element) {
			if (new RegExp('^uiButton-').test(element.id)) break;
			element = element.parentElement;
		}
		if (element instanceof Element) {
			const key = Inspector.getKey(element);
			let value: unknown;
			if (key.startsWith('textEffect-')) {
				value =
					form.textEffect[
						key.slice('textEffect-'.length) as keyof ButtonForm['textEffect']
					];
			} else if (/^(normalTint|hoverTint|activeTint)-\d+$/.test(key)) {
				const [group, index] = key.split('-');
				value = form[group as 'normalTint' | 'hoverTint' | 'activeTint'][Number(index)];
			} else {
				value = (form as Record<string, unknown>)[key];
			}
			Inspector.uiButton.update(Inspector.uiButton.target, key, value);
		}
		sync();
	};

	return { form, sync, onParamInput };
}
