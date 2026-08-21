import '@app/inspector/file-scene-page.ts';
import { reactive } from 'vue';
import { Inspector } from '@app/inspector/inspector.ts';
import { Scene } from '@app/scene/scene-window.ts';

interface FileSceneForm {
	width: number;
	height: number;
	tileWidth: number;
	tileHeight: number;
	ambientRed: number;
	ambientGreen: number;
	ambientBlue: number;
	ambientDirect: number;
}

export function useFileScenePage() {
	const form = reactive<Partial<FileSceneForm>>({});

	const sync = (): void => {
		if (!Inspector?.fileScene?.target) return;
		form.width = Scene.width;
		form.height = Scene.height;
		form.tileWidth = Scene.tileWidth;
		form.tileHeight = Scene.tileHeight;
		form.ambientRed = Scene.ambient.red;
		form.ambientGreen = Scene.ambient.green;
		form.ambientBlue = Scene.ambient.blue;
		form.ambientDirect = Scene.ambient.direct;
	};

	const onParamInput = (event?: Event): void => {
		const target = event?.target ?? document.activeElement;
		let element = target;
		while (element instanceof Element) {
			if (new RegExp('^fileScene-').test(element.id)) break;
			element = element.parentElement;
		}
		if (element instanceof Element) {
			Inspector.fileScene.update(
				Inspector.fileScene.target,
				Inspector.getKey(element),
				(form as Record<string, unknown>)[Inspector.getKey(element)]
			);
		}
		sync();
	};

	return { form, sync, onParamInput };
}
