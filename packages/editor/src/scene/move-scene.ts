import { sceneShiftNodes } from '@app/composables/window-nodes';
import { getSceneShiftBridge } from '@app/composables/scene-shift-bridge';
import { Window } from '@app/tools/window-object.ts';
import { onToolWindowMounted } from '@app/tools/tool-window-host';
import { requestFocus } from '@app/directives/focus';
import type { YamiElement } from '@app/types/element-api';

let boundShiftEl: Element | null = null;

export interface SceneShiftForm {
	x: number;
	y: number;
}

export const SceneShift: {
	callback: ((x: number, y: number) => void) | null;
	initialize: (() => void) | null;
	open: ((callback: ((x: number, y: number) => void) | null) => void) | null;
	windowClosed: ((event: Event) => void) | null;
	confirm: ((event: Event) => void) | null;
} = {
	callback: null,
	initialize: null,
	open: null,
	windowClosed: null,
	confirm: null
};

SceneShift.initialize = function () {
	// 场景平移窗口是懒挂载的：首次注册时窗口可能还没挂载，等挂载后再挂 closed 监听
	onToolWindowMounted('scene-shift', () => {
		const shiftEl = sceneShiftNodes.pick('frame') as YamiElement;
		if (!shiftEl || shiftEl === boundShiftEl) return;
		boundShiftEl = shiftEl;
		shiftEl.addEventListener('closed', this.windowClosed!);
	});
};

SceneShift.open = function (callback: ((x: number, y: number) => void) | null) {
	this.callback = callback;
	// 控件/桥可用后再回填（首次打开时桥还没登记）
	Window.openWith!('scene-shift', () => {
		getSceneShiftBridge()?.setForm({ x: 0, y: 0 });
	});
	requestFocus('scene-shift-x', 'all');
};

SceneShift.windowClosed = function (_event: Event) {
	SceneShift.callback = null;
};

SceneShift.confirm = function (_event: Event) {
	const { x, y } = getSceneShiftBridge()?.getForm() ?? ({} as SceneShiftForm);
	if (x === 0 && y === 0) {
		return requestFocus('scene-shift-x');
	}
	SceneShift.callback!(x, y);
	Window.close!('scene-shift');
};
