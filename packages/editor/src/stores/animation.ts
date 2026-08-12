import { defineStore } from 'pinia';
import { Animation } from '@/animation/animation-window.ts';
import { shallowRef } from 'vue';

type AnimationFrameShape = {
	start: number;
	end: number;
	[key: string]: unknown;
};

type AnimationMotionShape = {
	id: string;
	mode: string;
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

	function syncState() {
		state.value = Animation?.state ?? 'closed';
		target.value = Animation?.target ?? null;
		motion.value = Animation?.motion ?? null;
		direction.value = Animation?.direction ?? null;
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

	return {
		state,
		target,
		motion,
		direction,
		syncState,
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
		requestRendering
	};
});
