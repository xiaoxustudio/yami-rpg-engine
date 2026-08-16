import { Data } from '@/data/data-object.ts';
import { File } from '@/file/file-system-core.ts';
import { Updater } from './updater.ts';

interface AnimLayer {
	class: string;
	children?: AnimLayer[];
	frames?: Record<string, unknown>[];
	[key: string]: unknown;
}

Updater.updateAnimations = function (verNum: number) {
	if (verNum < Updater.getVersionNumber!('1.0.37')) {
		const keys = Object.keys(Updater.hooks.createInspectorSchema('animSpriteFrame'));
		const update = (layers: AnimLayer[]) => {
			for (const layer of layers) {
				switch (layer.class) {
					case 'joint':
						update(layer.children!);
						continue;
					case 'sprite': {
						const frames = layer.frames!;
						const length = frames.length;
						for (let i = 0; i < length; i++) {
							const sFrame = frames[i];
							const dFrame = Updater.hooks.createInspectorSchema('animSpriteFrame');
							dFrame.anchorX = 0.5;
							dFrame.anchorY = 0.5;
							dFrame.pivotX = 0;
							dFrame.pivotY = 0;
							for (const key of keys) {
								if (key in sFrame) {
									dFrame[key] = sFrame[key];
								}
							}
							frames[i] = dFrame;
						}
						continue;
					}
				}
			}
		};
		for (const [guid, animation] of Object.entries<any>(Data.animations)) {
			const meta = Data.manifest.guidMap[guid];
			if (meta === undefined) {
				throw new Error(`Missing metadata: ${guid}`);
			}
			for (const motion of animation.motions) {
				for (const dirCase of motion.dirCases) {
					update(dirCase.layers);
				}
			}
			File.planToSave!(meta);
		}
	}
	if (verNum < Updater.getVersionNumber!('1.0.139')) {
		const keys = Object.keys(Updater.hooks.createInspectorSchema('animParticleLayer'));
		const update = (layers: AnimLayer[]) => {
			const length = layers.length;
			for (let i = 0; i < length; i++) {
				const sLayer = layers[i];
				switch (sLayer.class) {
					case 'joint':
						update(sLayer.children!);
						continue;
					case 'particle': {
						const dLayer = Updater.hooks.createInspectorSchema('animParticleLayer');
						for (const key of keys) {
							if (key in sLayer) {
								dLayer[key] = sLayer[key];
							}
						}
						layers[i] = dLayer;
						continue;
					}
				}
			}
		};
		for (const [guid, animation] of Object.entries<any>(Data.animations)) {
			const meta = Data.manifest.guidMap[guid];
			if (meta === undefined) {
				throw new Error(`Missing metadata: ${guid}`);
			}
			for (const motion of animation.motions) {
				for (const dirCase of motion.dirCases) {
					update(dirCase.layers);
				}
			}
			File.planToSave!(meta);
		}
	}
};
