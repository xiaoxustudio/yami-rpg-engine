import { $ } from '@/util/dom.ts';
import {
	useLightGetterWindow,
	useObjectGetterWindow
} from '@app/composables/usePresetGetterWindow';
import type { AccessorTarget } from '@/types/legacy-shapes.ts';

interface PresetAccessorShape {
	target: AccessorTarget | null;
	initialize: ((this: PresetAccessorShape) => void) | null;
	open: ((this: PresetAccessorShape, target: AccessorTarget) => void) | null;
	confirm: ((this: PresetAccessorShape, event: Event) => void) | null;
}

interface PresetGetterWindowLike {
	initialize: () => void;
	open: (target: AccessorTarget) => void;
	confirm: () => void;
}

function createPresetAccessor(
	domKey: string,
	getWindow: () => PresetGetterWindowLike
): PresetAccessorShape {
	const accessor = {
		target: null,
		initialize: null,
		open: null,
		confirm: null
	} as unknown as PresetAccessorShape;

	accessor.initialize = function (this: PresetAccessorShape) {
		if (!$(`#${domKey}-type`)) return;
		getWindow().initialize();
	};

	accessor.open = function (this: PresetAccessorShape, target: AccessorTarget) {
		this.target = target;
		getWindow().open(target);
	};

	accessor.confirm = function (this: PresetAccessorShape, event: Event) {
		getWindow().confirm();
	};

	return accessor;
}

export const LightGetter = createPresetAccessor('lightGetter', useLightGetterWindow);

export const ObjectGetter = createPresetAccessor('objectGetter', useObjectGetterWindow);
