import { defineStore } from 'pinia';
import { Particle, type ParticleEmitterShape } from '@app/particle/particle-window.ts';
import { shallowRef } from 'vue';
import type { EditorProjectShape } from './editor';
import type { History } from '@app/tools/history.ts';
import { pinia } from './pinia';

export const particleStateKeys = [
	'state',
	'target',
	'paused',
	'showWireframe',
	'showAnchor',
	'speed',
	'zoom',
	'scaleX',
	'scaleY'
] as const;

export type ParticleTargetShape = {
	area: {
		type: 'rectangle' | 'circle';
		x: number;
		y: number;
		width: number;
		height: number;
		radius: number;
	} & Record<string, unknown>;
} | null;

type ParticleContextShape = {
	meta: { guid: string; path: string } & Record<string, unknown>;
	particle?: Record<string, unknown>;
	editor: {
		target: unknown;
		emitter: ParticleEmitterShape;
		history: History;
		centerX: number;
		centerY: number;
		paused: boolean;
	} & Record<string, unknown>;
	[key: string]: unknown;
};

export const useParticleStore = defineStore('particle', () => {
	const state = shallowRef<string>('closed');
	const target = shallowRef<ParticleTargetShape>(null);
	const paused = shallowRef<boolean>(false);
	const showWireframe = shallowRef<boolean>(false);
	const showAnchor = shallowRef<boolean>(false);
	const speed = shallowRef<number | null>(null);
	const zoom = shallowRef<number | null>(null);
	const scaleX = shallowRef<number | null>(null);
	const scaleY = shallowRef<number | null>(null);

	const initialized = shallowRef(false);

	function initialize() {
		if (initialized.value) return;
		Particle?.initialize?.();
		initialized.value = true;
	}

	function open(context: ParticleContextShape) {
		Particle?.open?.(context);
	}

	function close() {
		Particle?.close?.();
	}

	function planToSave() {
		Particle?.planToSave?.();
	}

	function requestRendering() {
		Particle?.requestRendering?.();
	}

	function load(context: ParticleContextShape) {
		Particle?.load?.(context);
	}

	function save() {
		Particle?.save?.();
	}

	function destroy(context: ParticleContextShape) {
		Particle?.destroy?.(context);
	}

	function restart() {
		Particle?.restart?.();
	}

	function undo() {
		Particle?.undo?.();
	}

	function redo() {
		Particle?.redo?.();
	}

	function setTarget(targetValue: ParticleTargetShape) {
		Particle?.setTarget?.(targetValue);
	}

	function updateTarget() {
		Particle?.updateTarget?.();
	}

	function updateParticleInfo() {
		Particle?.updateParticleInfo?.();
	}

	function selectEmitter(x: number, y: number) {
		return Particle?.selectEmitter?.(x, y);
	}

	function requestAnimation() {
		Particle?.requestAnimation?.();
	}

	function stopAnimation() {
		Particle?.stopAnimation?.();
	}

	function saveToConfig(config: { colors: Record<string, unknown> }) {
		Particle?.saveToConfig?.(config);
	}

	function loadFromConfig(config: { colors: Record<string, unknown> }) {
		Particle?.loadFromConfig?.(config);
	}

	function saveToProject(project: EditorProjectShape) {
		Particle?.saveToProject?.(project);
	}

	function loadFromProject(project: EditorProjectShape) {
		Particle?.loadFromProject?.(project);
	}

	return {
		state,
		target,
		paused,
		showWireframe,
		showAnchor,
		speed,
		zoom,
		scaleX,
		scaleY,
		initialized,
		initialize,
		open,
		close,
		planToSave,
		requestRendering,
		load,
		save,
		destroy,
		restart,
		undo,
		redo,
		setTarget,
		updateTarget,
		updateParticleInfo,
		selectEmitter,
		requestAnimation,
		stopAnimation,
		saveToConfig,
		loadFromConfig,
		saveToProject,
		loadFromProject
	};
});

export function getParticleStore() {
	return useParticleStore(pinia);
}
