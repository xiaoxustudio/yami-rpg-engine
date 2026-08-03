import { defineStore } from 'pinia';
import { shallowRef } from 'vue';

export const useParticleStore = defineStore('particle', () => {
	const state = shallowRef<string>('closed');
	const target = shallowRef<any>(null);

	function syncState() {
		const Particle = (window as any).Particle;
		state.value = Particle?.state ?? 'closed';
		target.value = Particle?.target ?? null;
	}

	function open(context: any) {
		(window as any).Particle?.open?.(context);
	}

	function close() {
		(window as any).Particle?.close?.();
	}

	function planToSave() {
		(window as any).Particle?.planToSave?.();
	}

	function requestRendering() {
		(window as any).Particle?.requestRendering?.();
	}

	function load(context: any) {
		(window as any).Particle?.load?.(context);
	}

	function save() {
		(window as any).Particle?.save?.();
	}

	function destroy(context: any) {
		(window as any).Particle?.destroy?.(context);
	}

	function restart() {
		(window as any).Particle?.restart?.();
	}

	function undo() {
		(window as any).Particle?.undo?.();
	}

	function redo() {
		(window as any).Particle?.redo?.();
	}

	function setTarget(targetValue: any) {
		(window as any).Particle?.setTarget?.(targetValue);
	}

	function updateTarget() {
		(window as any).Particle?.updateTarget?.();
	}

	function updateParticleInfo() {
		(window as any).Particle?.updateParticleInfo?.();
	}

	function selectEmitter(x: number, y: number) {
		return (window as any).Particle?.selectEmitter?.(x, y);
	}

	function requestAnimation() {
		(window as any).Particle?.requestAnimation?.();
	}

	function stopAnimation() {
		(window as any).Particle?.stopAnimation?.();
	}

	function saveToConfig(config: any) {
		(window as any).Particle?.saveToConfig?.(config);
	}

	function loadFromConfig(config: any) {
		(window as any).Particle?.loadFromConfig?.(config);
	}

	function saveToProject(project: any) {
		(window as any).Particle?.saveToProject?.(project);
	}

	function loadFromProject(project: any) {
		(window as any).Particle?.loadFromProject?.(project);
	}

	return {
		state,
		target,
		syncState,
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
