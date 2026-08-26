import { defineStore } from 'pinia';
import { Animation } from '@app/animation/animation-window.ts';
import { shallowRef } from 'vue';
import { pinia } from './pinia';
import type { EditorProjectShape } from './editor';

export const animationStateKeys = [
	'state',
	'target',
	'motion',
	'direction',
	'mode',
	'speed',
	'zoom'
] as const;

type AnimationFrameShape = {
	start: number;
	end: number;
	x?: number;
	y?: number;
	rotation?: number;
	scaleX?: number;
	scaleY?: number;
	[key: string]: unknown;
};

type AnimationMotionShape = {
	id: string;
	mode: string;
	dirCases?: Record<string, unknown>[];
	[key: string]: unknown;
};

type AnimationContextShape = {
	meta: { guid: string; path: string } & Record<string, unknown>;
	animation: { mode: string; motions: AnimationMotionShape[] } & Record<string, unknown>;
	[key: string]: unknown;
};

export const useAnimationStore = defineStore('animation', () => {
	const state = shallowRef<string>('closed');
	const target = shallowRef<AnimationFrameShape | null>(null);
	const motion = shallowRef<AnimationMotionShape | null>(null);
	const direction = shallowRef<number | null>(null);
	const mode = shallowRef<string | null>(null);
	const speed = shallowRef<number | null>(null);
	const zoom = shallowRef<number | null>(null);
	const showMark = shallowRef<boolean>(false);
	const showOnionskin = shallowRef<boolean>(false);
	const mirror = shallowRef<boolean>(false);
	const loop = shallowRef<boolean>(false);
	const playing = shallowRef<boolean>(false);

	const initialized = shallowRef(false);

	function initialize() {
		if (initialized.value) return;
		Animation?.initialize?.();
		initialized.value = true;
	}

	function open(context: AnimationContextShape) {
		Animation?.open?.(context);
	}

	function load(context: AnimationContextShape) {
		Animation?.load?.(context);
	}

	function save() {
		Animation?.save?.();
	}

	function close() {
		Animation?.close?.();
	}

	function destroy(context: AnimationContextShape) {
		Animation?.destroy?.(context);
	}

	function play() {
		Animation?.play?.();
	}

	function stop() {
		Animation?.stop?.();
	}

	function copy() {
		Animation?.copy?.();
	}

	function paste() {
		Animation?.paste?.();
	}

	function delete_() {
		Animation?.delete?.();
	}

	function undo() {
		Animation?.undo?.();
	}

	function redo() {
		Animation?.redo?.();
	}

	function previousFrame() {
		Animation?.previousFrame?.();
	}

	function nextFrame() {
		Animation?.nextFrame?.();
	}

	function previousKeyFrame() {
		Animation?.previousKeyFrame?.();
	}

	function nextKeyFrame() {
		Animation?.nextKeyFrame?.();
	}

	function setSpeed(speed: number) {
		Animation?.setSpeed?.(speed);
	}

	function setZoom(zoom: number) {
		Animation?.setZoom?.(zoom);
	}

	function setMotion(motion: AnimationMotionShape | null) {
		Animation?.setMotion?.(motion);
	}

	function setDirection(direction: number) {
		Animation?.setDirection?.(direction);
	}

	function planToSave() {
		Animation?.planToSave?.();
	}

	function requestRendering() {
		Animation?.requestRendering?.();
	}

	function saveToConfig(config: { colors?: Record<string, unknown> }) {
		Animation?.saveToConfig?.(config);
	}

	function loadFromConfig(config: { colors?: Record<string, unknown> }) {
		Animation?.loadFromConfig?.(config);
	}

	function saveToProject(project: EditorProjectShape) {
		Animation?.saveToProject?.(project);
	}

	function loadFromProject(project: EditorProjectShape) {
		Animation?.loadFromProject?.(project);
	}

	return {
		state,
		target,
		motion,
		direction,
		mode,
		speed,
		zoom,
		showMark,
		showOnionskin,
		mirror,
		loop,
		playing,
		initialized,
		initialize,
		open,
		load,
		save,
		close,
		destroy,
		play,
		stop,
		copy,
		paste,
		delete: delete_,
		undo,
		redo,
		previousFrame,
		nextFrame,
		previousKeyFrame,
		nextKeyFrame,
		setSpeed,
		setZoom,
		setMotion,
		setDirection,
		planToSave,
		requestRendering,
		saveToConfig,
		loadFromConfig,
		saveToProject,
		loadFromProject
	};
});

export function getAnimationStore() {
	return useAnimationStore(pinia);
}
