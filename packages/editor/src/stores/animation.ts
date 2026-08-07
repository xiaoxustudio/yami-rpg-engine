import { defineStore } from 'pinia';
import { Animation } from '@/animation/animation-window.ts';
import { shallowRef } from 'vue';

export const useAnimationStore = defineStore('animation', () => {
	const state = shallowRef<string>('closed');
	const target = shallowRef<any>(null);
	const motion = shallowRef<any>(null);
	const direction = shallowRef<any>(null);

	function syncState() {
		state.value = Animation?.state ?? 'closed';
		target.value = Animation?.target ?? null;
		motion.value = Animation?.motion ?? null;
		direction.value = Animation?.direction ?? null;
	}

	function open(context: any) {
		Animation?.open?.(context);
	}

	function load(context: any) {
		Animation?.load?.(context);
	}

	function save() {
		Animation?.save?.();
	}

	function close() {
		Animation?.close?.();
	}

	function destroy(context: any) {
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

	function setSpeed(speed: any) {
		Animation?.setSpeed?.(speed);
	}

	function setZoom(zoom: any) {
		Animation?.setZoom?.(zoom);
	}

	function setMotion(motion: any) {
		Animation?.setMotion?.(motion);
	}

	function setDirection(direction: any) {
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
