import { Data } from '@/data/data-object.ts';
import { File } from '@/file/file-system-core.ts';
import { Inspector } from '@/inspector/inspector.ts';
import { Updater } from './updater.ts';

Updater.updateScenes = function (verNum: any) {
	const replaceSceneObject = (replacer: any) => {
		const forEachObject = (objects: any, replacer: any, meta: any) => {
			const length = objects.length;
			for (let i = 0; i < length; i++) {
				const object = objects[i];
				const replacement = replacer(object);
				if (replacement instanceof Object) {
					objects[i] = replacement;
					(File.planToSave as any)(meta);
				}
				if (object.children instanceof Array) {
					forEachObject(object.children, replacer, meta);
				}
			}
		};
		for (const [guid, scene] of Object.entries(Data.scenes)) {
			const meta = Data.manifest.guidMap[guid];
			if (meta === undefined) {
				throw new Error(`Missing metadata: ${guid}`);
			}
			forEachObject((scene as any).objects, replacer, meta);
		}
	};
	if (verNum < Updater.getVersionNumber('1.0.116')) {
		for (const [guid, scene] of Object.entries(Data.scenes)) {
			const meta = Data.manifest.guidMap[guid];
			if (meta === undefined) {
				throw new Error(`Missing metadata: ${guid}`);
			}
			delete (scene as any).contrast;
			(scene as any).ambient.direct = 0;
			(File.planToSave as any)(meta);
		}
	}
	if (verNum < Updater.getVersionNumber('1.0.116')) {
		const keys = Object.keys((Inspector.sceneLight as any).create());
		replaceSceneObject((object: any) => {
			if (object.class === 'light') {
				const sLight = object;
				const dLight = (Inspector.sceneLight as any).create();
				for (const key of keys) {
					if (key in sLight) {
						dLight[key] = sLight[key];
					}
				}
				return dLight;
			}
		});
	}
	if (verNum < Updater.getVersionNumber('1.0.122')) {
		const keys = Object.keys((Inspector.sceneActor as any).create());
		replaceSceneObject((object: any) => {
			if (object.class === 'actor') {
				const sActor = object;
				const dActor = (Inspector.sceneActor as any).create();
				for (const key of keys) {
					if (key in sActor) {
						dActor[key] = sActor[key];
					}
				}
				return dActor;
			}
		});
	}
};
