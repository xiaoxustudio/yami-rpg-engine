import '@app/inspector/element-textbox-page.ts';
import { reactive } from 'vue';
import { Inspector } from '@app/inspector/inspector.ts';

interface TextBoxForm {
	type: string;
	align: string;
	text: string;
	maxLength: number;
	number: number;
	min: string;
	max: string;
	decimals: number;
	padding: number;
	size: number;
	font: string;
	color: string;
	selectionColor: string;
	selectionBgColor: string;
}

const TEXTBOX_KEYS: (keyof TextBoxForm)[] = [
	'type',
	'align',
	'text',
	'maxLength',
	'number',
	'min',
	'max',
	'decimals',
	'padding',
	'size',
	'font',
	'color',
	'selectionColor',
	'selectionBgColor'
];

export function useUITextBoxPage() {
	const form = reactive<TextBoxForm>({
		type: 'text',
		align: 'left',
		text: '',
		maxLength: 16,
		number: 0,
		min: '0',
		max: '0',
		decimals: 0,
		padding: 4,
		size: 16,
		font: '',
		color: 'ffffffff',
		selectionColor: 'ffffffff',
		selectionBgColor: '0090ccff'
	});

	const sync = (): void => {
		const target = Inspector?.uiTextBox?.target as Partial<TextBoxForm> | null | undefined;
		if (!target) return;
		for (const key of TEXTBOX_KEYS) {
			const value = target[key];
			if (value !== undefined) {
				(form as Record<string, unknown>)[key] = value;
			}
		}
	};

	const onParamInput = (event: Event): void => {
		const target = event?.target ?? document.activeElement;
		let element = target;
		while (element instanceof Element) {
			if (new RegExp('^uiTextBox-').test(element.id)) break;
			element = element.parentElement;
		}
		if (element instanceof Element) {
			Inspector.uiTextBox.update(
				Inspector.uiTextBox.target,
				Inspector.getKey(element),
				(form as Record<string, unknown>)[Inspector.getKey(element)]
			);
		}
		sync();
	};

	return { form, sync, onParamInput };
}
