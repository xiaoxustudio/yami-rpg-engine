import { reactive } from 'vue';
import { Window } from '@/tools/window-object.ts';
import { getFocus } from '@/util/element-utils';

export interface AncestorGetterForm {
	type: string;
	presetId: string;
	variable: { type: string; key: string };
}

interface AncestorGetterTarget {
	read?: () => any;
	input: (getter: Record<string, unknown>) => void;
	isPluginInput?: boolean;
}

interface AncestorGetterWindow {
	form: AncestorGetterForm;
	open: (target: AncestorGetterTarget, defaults?: Partial<AncestorGetterForm>) => void;
	confirm: () => void;
	onWindowClosed: () => void;
}

type AncestorGetterFrame = HTMLElement & {
	setForm?: (data: Partial<AncestorGetterForm>) => void;
	getForm?: () => AncestorGetterForm;
};

const form = reactive<AncestorGetterForm>({
	type: 'trigger',
	presetId: '',
	variable: { type: 'local', key: '' }
});
let callback: ((getter: Record<string, unknown>) => void) | null = null;

const getFrame = (): AncestorGetterFrame | null =>
	document.getElementById('ancestorGetter') as AncestorGetterFrame | null;

const open = (target: AncestorGetterTarget, defaults?: Partial<AncestorGetterForm>): void => {
	callback = (getter: Record<string, unknown>) => target.input(getter);
	Window.open!('ancestorGetter');

	let presetId = defaults?.presetId ?? '';
	let variable = { type: 'local', key: '' };
	const element = target.read?.() ?? {};
	switch (element.type) {
		case 'trigger':
		case 'latest':
			break;
		case 'by-id':
			presetId = element.presetId;
			break;
		case 'variable':
			variable = element.variable;
			break;
	}
	Object.assign(form, { type: element.type, presetId, variable });
	getFrame()?.setForm?.(form);
	getFocus(document.getElementById('ancestorGetter-type'));
};

const confirm = (): void => {
	const data = getFrame()?.getForm?.() ?? form;
	let getter: Record<string, unknown> | undefined;
	switch (data.type) {
		case 'trigger':
		case 'latest':
			getter = { type: data.type };
			break;
		case 'by-id':
			if (data.presetId === '') {
				getFocus(document.getElementById('ancestorGetter-presetId'));
				return;
			}
			getter = { type: data.type, presetId: data.presetId };
			break;
		case 'variable':
			if (data.variable.key === '') {
				getFocus(document.getElementById('ancestorGetter-variable'));
				return;
			}
			getter = { type: data.type, variable: data.variable };
			break;
	}
	callback?.(getter!);
	Window.close!('ancestorGetter');
};

const onWindowClosed = (): void => {
	callback = null;
};

export function useAncestorGetterWindow(): AncestorGetterWindow {
	return { form, open, confirm, onWindowClosed };
}
