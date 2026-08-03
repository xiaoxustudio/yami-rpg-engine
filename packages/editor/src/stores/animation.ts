import { defineStore } from 'pinia';
import { shallowRef } from 'vue';

export const useAnimationStore = defineStore('animation', () => {
	const state = shallowRef<string>('closed');
	const target = shallowRef<any>(null);
	const motion = shallowRef<any>(null);
	const direction = shallowRef<any>(null);

	function syncState() {
		const Animation = (window as any).Animation;
		state.value = Animation?.state ?? 'closed';
		target.value = Animation?.target ?? null;
		motion.value = Animation?.motion ?? null;
		direction.value = Animation?.direction ?? null;
	}

	function open(context: any) {
		(window as any).Animation?.open?.(context);
	}

	function load(context: any) {
		(window as any).Animation?.load?.(context);
	}

	function save() {
		(window as any).Animation?.save?.();
	}

	function close() {
		(window as any).Animation?.close?.();
	}

	function destroy(context: any) {
		(window as any).Animation?.destroy?.(context);
	}

	function play() {
		(window as any).Animation?.play?.();
	}

	function stop() {
		(window as any).Animation?.stop?.();
	}

	function copy() {
		(window as any).Animation?.copy?.();
	}

	function paste() {
		(window as any).Animation?.paste?.();
	}

	function delete_() {
		(window as any).Animation?.delete?.();
	}

	function undo() {
		(window as any).Animation?.undo?.();
	}

	function redo() {
		(window as any).Animation?.redo?.();
	}

	function previousFrame() {
		(window as any).Animation?.previousFrame?.();
	}

	function nextFrame() {
		(window as any).Animation?.nextFrame?.();
	}

	function previousKeyFrame() {
		(window as any).Animation?.previousKeyFrame?.();
	}

	function nextKeyFrame() {
		(window as any).Animation?.nextKeyFrame?.();
	}

	function setSpeed(speed: any) {
		(window as any).Animation?.setSpeed?.(speed);
	}

	function setZoom(zoom: any) {
		(window as any).Animation?.setZoom?.(zoom);
	}

	function setMotion(motion: any) {
		(window as any).Animation?.setMotion?.(motion);
	}

	function setDirection(direction: any) {
		(window as any).Animation?.setDirection?.(direction);
	}

	function planToSave() {
		(window as any).Animation?.planToSave?.();
	}

	function requestRendering() {
		(window as any).Animation?.requestRendering?.();
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
