import { reactive } from 'vue';
import { getWindowStore } from '@app/stores/window';
import { getFocus } from '@app/utils/element-utils';

export interface ElementGetterForm {
	type: string;
	presetId: string;
	ancestor: { type: string };
	index: number;
	variable: { type: string; key: string };
}

interface ElementGetterTarget {
	read?: () => any;
	input: (getter: Record<string, unknown>) => void;
	isPluginInput?: boolean;
}

interface ElementGetterWindow {
	form: ElementGetterForm;
	open: (target: ElementGetterTarget, defaults?: Partial<ElementGetterForm>) => void;
	confirm: () => void;
	onWindowClosed: () => void;
}

type ElementGetterFrame = HTMLElement & {
	setForm?: (data: Partial<ElementGetterForm>) => void;
	getForm?: () => ElementGetterForm;
};

const form = reactive<ElementGetterForm>({
	type: 'trigger',
	presetId: '',
	ancestor: { type: 'trigger' },
	index: 0,
	variable: { type: 'local', key: '' }
});
let callback: ((getter: Record<string, unknown>) => void) | null = null;
let pluginInput = false;

const getFrame = (): ElementGetterFrame | null =>
	document.getElementById('elementGetter') as ElementGetterFrame | null;

const open = (target: ElementGetterTarget, defaults?: Partial<ElementGetterForm>): void => {
	callback = (getter: Record<string, unknown>) => target.input(getter);
	pluginInput = target.isPluginInput === true;
	getWindowStore().open('elementGetter');

	let index = 0;
	let presetId = defaults?.presetId ?? '';
	let ancestor = { type: 'trigger' };
	let variable = { type: 'local', key: '' };
	const element = target.read?.() ?? {};
	switch (element.type) {
		case 'trigger':
		case 'latest':
		case 'focus':
			break;
		case 'by-id':
			presetId = element.presetId;
			break;
		case 'by-ancestor-and-id':
			ancestor = element.ancestor;
			presetId = element.presetId;
			break;
		case 'by-index':
			ancestor = element.parent;
			index = element.index;
			break;
		case 'by-button-index':
			ancestor = element.focus;
			index = element.index;
			break;
		case 'selected-button':
			ancestor = element.focus;
			break;
		case 'parent':
		case 'variable':
			variable = element.variable;
			break;
	}
	Object.assign(form, { type: element.type, presetId, ancestor, index, variable });
	getFrame()?.setForm?.(form);
	getFocus(document.getElementById('elementGetter-type'));
};

const confirm = (): void => {
	const data = getFrame()?.getForm?.() ?? form;
	let getter: Record<string, unknown> | undefined;
	switch (data.type) {
		case 'trigger':
		case 'latest':
		case 'focus':
			getter = { type: data.type };
			break;
		case 'by-id':
			if (data.presetId === '') {
				getFocus(document.getElementById('elementGetter-presetId'));
				return;
			}
			getter = { type: data.type, presetId: data.presetId };
			break;
		case 'by-ancestor-and-id':
			if (data.presetId === '') {
				getFocus(document.getElementById('elementGetter-presetId'));
				return;
			}
			getter = { type: data.type, ancestor: data.ancestor, presetId: data.presetId };
			break;
		case 'by-index':
			getter = { type: data.type, parent: data.ancestor, index: data.index };
			break;
		case 'by-button-index':
			getter = { type: data.type, focus: data.ancestor, index: data.index };
			break;
		case 'selected-button':
			getter = { type: data.type, focus: data.ancestor };
			break;
		case 'parent':
		case 'variable':
			if (data.variable.key === '') {
				getFocus(document.getElementById('elementGetter-variable'));
				return;
			}
			getter = { type: data.type, variable: data.variable };
			break;
	}
	if (pluginInput) {
		getter = { getter: 'element', ...getter };
	}
	callback?.(getter!);
	getWindowStore().close('elementGetter');
};

const onWindowClosed = (): void => {
	callback = null;
};

export function useElementGetterWindow(): ElementGetterWindow {
	return { form, open, confirm, onWindowClosed };
}
