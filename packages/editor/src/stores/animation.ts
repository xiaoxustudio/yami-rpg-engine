import { defineStore } from 'pinia';
import type { AnimationMotionData } from '@app/animation/animation-window.ts';
import { getLazyWindow, loadWindow } from '@app/tools/window-registry';
import { shallowRef } from 'vue';
import { pinia } from './pinia';
import type { EditorProjectShape } from './editor';

const loadAnimation = () =>
	import('@app/tools/window-cluster').then(async (m) => {
		await m.clusterReady;
		return m.Animation;
	});
const Animation = getLazyWindow('animation', loadAnimation);

export const animationStateKeys = [
	'state',
	'target',
	'motion',
	'direction',
	'mode',
	'speed',
	'zoom',
	// 下面 5 个早就被 `animation-window.ts` 的 `animationBridgeKeys` 桥接了，但这份**导出的**
	// 白名单一直少写它们（两份数组漂移，见 pinia-migration-analysis.md 的漂移表）。补齐到与桥一致。
	'showMark',
	'showOnionskin',
	'mirror',
	'loop',
	'playing'
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

// 与动画侧同一份模型：store 存的 motion 就是运行期对象（setMotion 直接存、setDirection 直接读 dirCases）。
type AnimationMotionShape = AnimationMotionData;

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
		void loadWindow('animation', loadAnimation).then((a) => a?.initialize?.());
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
