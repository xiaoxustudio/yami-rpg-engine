import { defineStore } from 'pinia';
import { Particle } from '@/particle/particle-window.ts';
import { shallowRef } from 'vue';

export const useParticleStore = defineStore('particle', () => {
	const state = shallowRef<string>('closed');
	const target = shallowRef<any>(null);

	function syncState() {
		state.value = Particle?.state ?? 'closed';
		target.value = Particle?.target ?? null;
	}

	function open(context: any) {
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

	function load(context: any) {
		Particle?.load?.(context);
	}

	function save() {
		Particle?.save?.();
	}

	function destroy(context: any) {
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

	function setTarget(targetValue: any) {
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

	function saveToConfig(config: any) {
		Particle?.saveToConfig?.(config);
	}

	function loadFromConfig(config: any) {
		Particle?.loadFromConfig?.(config);
	}

	function saveToProject(project: any) {
		Particle?.saveToProject?.(project);
	}

	function loadFromProject(project: any) {
		Particle?.loadFromProject?.(project);
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
