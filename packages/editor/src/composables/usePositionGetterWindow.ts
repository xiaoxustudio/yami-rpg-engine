import { reactive } from 'vue';
import { getWindowStore } from '@app/stores/window';
import { requestFocus } from '@app/directives/focus';

export interface PositionGetterForm {
	type: string;
	x: number;
	y: number;
	actor: { type: string };
	trigger: { type: string };
	light: { type: string };
	region: { type: string };
	mode: string;
	objectId: string;
}

interface PositionGetterTarget {
	// oxlint-disable-next-line no-explicit-any
	read?: () => any;
	input: (getter: Record<string, unknown>) => void;
	isPluginInput?: boolean;
}

interface PositionGetterWindow {
	form: PositionGetterForm;
	open: (target: PositionGetterTarget, defaults?: Partial<PositionGetterForm>) => void;
	confirm: () => void;
	onWindowClosed: () => void;
}

const form = reactive<PositionGetterForm>({
	type: 'absolute',
	x: 0,
	y: 0,
	actor: { type: 'trigger' },
	trigger: { type: 'trigger' },
	light: { type: 'trigger' },
	region: { type: 'trigger' },
	mode: 'center',
	objectId: ''
});
let callback: ((getter: Record<string, unknown>) => void) | null = null;
let pluginInput = false;

const open = (target: PositionGetterTarget, defaults?: Partial<PositionGetterForm>): void => {
	callback = (getter: Record<string, unknown>) => target.input(getter);
	pluginInput = target.isPluginInput === true;
	getWindowStore().open('positionGetter');

	let x = 0;
	let y = 0;
	let actor = { type: 'trigger' };
	let trigger = { type: 'trigger' };
	let light = { type: 'trigger' };
	let region = { type: 'trigger' };
	let mode = defaults?.mode ?? 'center';
	let objectId = defaults?.objectId ?? '';
	const position = target.read?.() ?? {};
	switch (position.type) {
		case 'absolute':
		case 'relative':
			x = position.x;
			y = position.y;
			break;
		case 'actor':
			actor = position.actor;
			break;
		case 'trigger':
			trigger = position.trigger;
			break;
		case 'light':
			light = position.light;
			break;
		case 'region':
			region = position.region;
			mode = position.mode;
			break;
		case 'object':
			objectId = position.objectId;
			break;
	}
	Object.assign(form, {
		type: position.type,
		x,
		y,
		actor,
		trigger,
		light,
		region,
		mode,
		objectId
	});
	requestFocus('positionGetter-type');
};

const confirm = (): void => {
	const data = form;
	let getter: Record<string, unknown> | undefined;
	switch (data.type) {
		case 'absolute':
		case 'relative':
			getter = { type: data.type, x: data.x, y: data.y };
			break;
		case 'actor':
			getter = { type: data.type, actor: data.actor };
			break;
		case 'trigger':
			getter = { type: data.type, trigger: data.trigger };
			break;
		case 'light':
			getter = { type: data.type, light: data.light };
			break;
		case 'region':
			getter = { type: data.type, region: data.region, mode: data.mode };
			break;
		case 'object':
			if (data.objectId === '') {
				requestFocus('positionGetter-objectId');
				return;
			}
			getter = { type: data.type, objectId: data.objectId };
			break;
		case 'mouse':
			getter = { type: data.type };
			break;
	}
	if (pluginInput) {
		getter = { getter: 'position', ...getter };
	}
	callback?.(getter!);
	getWindowStore().close('positionGetter');
};

const onWindowClosed = (): void => {
	callback = null;
};

export function usePositionGetterWindow(): PositionGetterWindow {
	return { form, open, confirm, onWindowClosed };
}
