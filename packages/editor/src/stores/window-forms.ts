import { defineStore } from 'pinia';
import { reactive, shallowRef } from 'vue';
import { pinia } from './pinia';
import type { RenameForm } from '@app/composables/useRenameWindow';
import type { SetKeyForm } from '@app/composables/useSetKeyWindow';
import type { ZoomForm } from '@app/composables/useZoomWindow';
import type { ImageClipForm } from '@app/composables/useImageClipWindow';
import type { SetQuantityForm } from '@app/composables/useSetQuantityWindow';
import type { ColorForm } from '@app/composables/useColorWindow';
import type { ArrayForm, ArrayNumberForm, ArrayStringForm } from '@app/composables/useArrayWindow';
import type { ProjectSettingsForm } from '@app/composables/useProjectSettingsWindow';

export const useWindowFormsStore = defineStore('windowForms', () => {
	const renameForm = reactive<RenameForm>({ name: '' });
	const setKeyForm = reactive<SetKeyForm>({ key: '' });
	const zoomForm = reactive<ZoomForm>({ factor: 1 });

	const imageClipForm = reactive<ImageClipForm>({ x: 0, y: 0, width: 0, height: 0 });

	const setQuantityForm = reactive<SetQuantityForm>({ quantity: 1, max: 1 });

	const colorForm = reactive<ColorForm>({ hex: '00000000', r: 0, g: 0, b: 0, a: 0, index: null });

	const arrayForm = reactive<ArrayForm>({ values: [] });
	const arrayNumberForm = reactive<ArrayNumberForm>({ value: 0 });
	const arrayStringForm = reactive<ArrayStringForm>({ value: '' });
	const arrayChanged = shallowRef(false);
	const scriptForm = reactive<{ script: string }>({ script: '' });

	const projectSettingsForm = reactive<ProjectSettingsForm>({
		window: { title: '', width: 0, height: 0, display: '' },
		resolution: { width: 0, height: 0, sceneScale: 1, uiScale: 1 },
		scene: { padding: 0, animationInterval: 100 },
		tileArea: { expansionTop: 0, expansionLeft: 0, expansionRight: 0, expansionBottom: 0 },
		animationArea: { expansionTop: 0, expansionLeft: 0, expansionRight: 0, expansionBottom: 0 },
		lightArea: { expansionTop: 0, expansionLeft: 0, expansionRight: 0, expansionBottom: 0 },
		virtualAxis: { up: 0, down: 0, left: 0, right: 0 },
		collision: {
			actor: { enabled: true },
			scene: { enabled: true, actorSize: 1 },
			trigger: { collideWithActorShape: true }
		},
		text: { importedFonts: [], fontFamily: '', highDefinition: true },
		actor: { tempAttributes: [] },
		animation: { frameRate: 30 },
		soundAttenuation: { distance: 10, easingId: '' },
		webgl: { desynchronized: true, textureMagFilter: 'nearest', textureMinFilter: 'linear' },
		script: { autoCompile: true },
		save: { location: 'app-data', subdir: '' },
		localization: { languages: [], default: '' },
		preload: 'never',
		deadzone: 0
	});

	return {
		renameForm,
		setKeyForm,
		zoomForm,
		imageClipForm,
		setQuantityForm,
		colorForm,
		arrayForm,
		arrayNumberForm,
		arrayStringForm,
		arrayChanged,
		scriptForm,
		projectSettingsForm
	};
});

export function getWindowFormsStore() {
	return useWindowFormsStore(pinia);
}
