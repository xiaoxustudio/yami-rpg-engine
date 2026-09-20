import { reactive } from 'vue';
import { composableEls } from '@app/composables/element-registry';
import { Animation } from '@app/animation/animation-window.ts';
import { Inspector } from '@app/inspector/inspector.ts';

interface AnimSoundLayerShape {
	[k: string]: unknown;
}

interface AnimSoundLayerData {
	class: string;
	name: string;
	hidden: boolean;
	locked: boolean;
	playbackRate: string;
	frames: unknown[];
	[k: string]: unknown;
}

const AnimSoundLayer: AnimSoundLayerShape = {
	motion: null,
	target: null,
	initialize: null,
	create: null,
	open: null,
	close: null,
	update: null
};

AnimSoundLayer.initialize = function (this: typeof AnimSoundLayer) {};

AnimSoundLayer.create = function (this: typeof AnimSoundLayer) {
	return {
		class: 'sound',
		name: 'Sound',
		hidden: false,
		locked: false,
		playbackRate: 'default',
		frames: [Inspector.animSoundFrame.create()]
	};
};

AnimSoundLayer.open = function (this: typeof AnimSoundLayer, layer: AnimSoundLayerData) {
	if (this.target !== layer) {
		this.target = layer;
		this.motion = Animation.motion;

		(
			composableEls.get('animSoundLayer-vue-mount') as HTMLElement & {
				sync?: () => void;
			}
		)?.sync?.();
	}
};

AnimSoundLayer.close = function (this: typeof AnimSoundLayer) {
	if (this.target) {
		this.target = null;
		this.motion = null;
	}
};

AnimSoundLayer.update = function (
	this: typeof AnimSoundLayer,
	layer: AnimSoundLayerData,
	key: string,
	value: unknown
) {
	Animation.planToSave!();
	switch (key) {
		case 'playbackRate':
			if (layer[key] !== value) {
				(layer as Record<string, unknown>)[key] = value;
			}
			break;
	}
};

Inspector.animSoundLayer ??= AnimSoundLayer;

interface AnimSoundLayerForm {
	playbackRate: string;
}

const ANIM_SOUND_LAYER_KEYS: (keyof AnimSoundLayerForm)[] = ['playbackRate'];

export function useAnimSoundLayerPage() {
	const form = reactive<Partial<AnimSoundLayerForm>>({});

	const sync = (): void => {
		const target = Inspector?.animSoundLayer?.target as
			| Partial<AnimSoundLayerForm>
			| null
			| undefined;
		if (!target) return;
		for (const key of ANIM_SOUND_LAYER_KEYS) {
			(form as Record<string, unknown>)[key] = target[key];
		}
	};

	const onParamInput = (event: Event): void => {
		const target = event?.target ?? document.activeElement;
		let element = target;
		while (element instanceof Element) {
			if (new RegExp('^animSoundLayer-').test(element.id)) break;
			element = element.parentElement;
		}
		if (element instanceof Element) {
			Inspector.animSoundLayer.update(
				Inspector.animSoundLayer.target,
				Inspector.getKey(element),
				(form as Record<string, unknown>)[Inspector.getKey(element)]
			);
		}
		sync();
	};

	return { form, sync, onParamInput };
}
