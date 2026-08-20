import { getDataStore } from '@app/stores/data';
import type { FileMetaShape } from '@app/stores/data';
import { append } from '@app/utils/array';
import { Updater } from './updater.ts';

interface SceneObject {
	class: string;
	children?: SceneObject[];
	[key: string]: unknown;
}

function updateScenes(verNum: number) {
	const replaceSceneObject = (replacer: (object: SceneObject) => SceneObject | undefined) => {
		const { manifest, scenes } = getDataStore().data;
		const forEachObject = (
			objects: SceneObject[],
			replacer: (object: SceneObject) => SceneObject | undefined,
			meta: FileMetaShape
		) => {
			const length = objects.length;
			for (let i = 0; i < length; i++) {
				const object = objects[i];
				const replacement = replacer(object);
				if (replacement instanceof Object) {
					objects[i] = replacement;
					append(getDataStore().data.manifest!.changes as unknown[], meta);
				}
				if (object.children instanceof Array) {
					forEachObject(object.children, replacer, meta);
				}
			}
		};
		for (const [guid, scene] of Object.entries<any>(scenes!)) {
			const meta = manifest!.guidMap[guid];
			if (meta === undefined) {
				throw new Error(`Missing metadata: ${guid}`);
			}
			forEachObject(scene.objects, replacer, meta);
		}
	};
	if (verNum < Updater.getVersionNumber!('1.0.116')) {
		const { manifest, scenes } = getDataStore().data;
		for (const [guid, scene] of Object.entries<any>(scenes!)) {
			const meta = manifest!.guidMap[guid];
			if (meta === undefined) {
				throw new Error(`Missing metadata: ${guid}`);
			}
			delete scene.contrast;
			scene.ambient.direct = 0;
			append(getDataStore().data.manifest!.changes as unknown[], meta);
		}
	}
	if (verNum < Updater.getVersionNumber!('1.0.116')) {
		const keys = Object.keys(Updater.hooks.createInspectorSchema('sceneLight'));
		replaceSceneObject((object: SceneObject) => {
			if (object.class === 'light') {
				const sLight = object;
				const dLight = Updater.hooks.createInspectorSchema('sceneLight');
				for (const key of keys) {
					if (key in sLight) {
						dLight[key] = sLight[key];
					}
				}
				return dLight;
			}
		});
	}
	if (verNum < Updater.getVersionNumber!('1.0.122')) {
		const keys = Object.keys(Updater.hooks.createInspectorSchema('sceneActor'));
		replaceSceneObject((object: SceneObject) => {
			if (object.class === 'actor') {
				const sActor = object;
				const dActor = Updater.hooks.createInspectorSchema('sceneActor');
				for (const key of keys) {
					if (key in sActor) {
						dActor[key] = sActor[key];
					}
				}
				return dActor;
			}
		});
	}
}

export function initUpdaterScenes(): void {
	Updater.updateScenes = updateScenes;
}
