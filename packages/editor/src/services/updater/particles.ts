import { getDataStore } from '@app/stores/data';
import { append } from '@app/utils/array';
import { Updater } from './updater.ts';

interface ParticleLayerShape {
	anchor: Record<string, number[]>;
	movement: Record<string, number[]>;
	rotation: Record<string, number[]>;
	hRotation: Record<string, number[]>;
	scale: Record<string, number[]>;
	[key: string]: unknown;
}

interface ParticleShape {
	layers: ParticleLayerShape[];
	[key: string]: unknown;
}

function updateParticles(verNum: number) {
	if (verNum < Updater.getVersionNumber!('1.0.95')) {
		const convert = (array: number[]) => {
			const min = array[0];
			const max = array[1];
			const std = Math.roundTo((min + max) / 2, 4);
			const dev = Math.roundTo(Math.abs(std - min), 4);
			array[0] = std;
			array[1] = dev;
		};
		const { manifest, particles } = getDataStore().data;
		for (const [guid, particle] of Object.entries(
			particles! as Record<string, ParticleShape>
		)) {
			const meta = manifest!.guidMap[guid];
			if (meta === undefined) {
				throw new Error(`Missing metadata: ${guid}`);
			}
			for (const layer of particle.layers) {
				convert(layer.anchor.x);
				convert(layer.anchor.y);
				convert(layer.anchor.speedX);
				convert(layer.anchor.speedY);
				convert(layer.movement.angle);
				convert(layer.movement.speed);
				convert(layer.movement.accelAngle);
				convert(layer.movement.accel);
				convert(layer.rotation.angle);
				convert(layer.rotation.speed);
				convert(layer.rotation.accel);
				convert(layer.hRotation.radius);
				convert(layer.hRotation.expansionSpeed);
				convert(layer.hRotation.expansionAccel);
				convert(layer.hRotation.angle);
				convert(layer.hRotation.angularSpeed);
				convert(layer.hRotation.angularAccel);
				convert(layer.scale.factor);
				convert(layer.scale.speed);
				convert(layer.scale.accel);
			}
			append(getDataStore().data.manifest!.changes as unknown[], meta);
		}
	}
	if (verNum < Updater.getVersionNumber!('1.0.122')) {
		const keys = Object.keys(Updater.hooks.createInspectorSchema('particleLayer'));
		const { manifest, particles } = getDataStore().data;
		for (const [guid, particle] of Object.entries(
			particles! as Record<string, ParticleShape>
		)) {
			const meta = manifest!.guidMap[guid];
			if (meta === undefined) {
				throw new Error(`Missing metadata: ${guid}`);
			}
			const layers = particle.layers;
			for (let i = 0; i < layers.length; i++) {
				const sLayer = layers[i];
				const dLayer = Updater.hooks.createInspectorSchema('particleLayer');
				for (const key of keys) {
					if (key in sLayer) {
						dLayer[key] = sLayer[key];
						continue;
					}
					switch (key) {
						case 'sprite':
							if (typeof sLayer.hframes === 'number') {
								(dLayer[key] as { hframes?: unknown }).hframes = sLayer.hframes;
							}
							if (typeof sLayer.vframes === 'number') {
								(dLayer[key] as { vframes?: unknown }).vframes = sLayer.vframes;
							}
							continue;
					}
				}
				layers[i] = dLayer as ParticleLayerShape;
			}
			append(getDataStore().data.manifest!.changes as unknown[], meta);
		}
	}
}

export function initUpdaterParticles(): void {
	Updater.updateParticles = updateParticles;
}
