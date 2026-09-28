import type { AnimationMotionData } from '@app/animation/animation-window.ts';
import { Window } from '@app/tools/window-object.ts';
import { elementDataOf } from '@ui-kit';
import { inspectorEls } from './element-registry.ts';
import { hasScrollBar, listenDraggingScrollbarEvent, read, write } from '@app/utils/element-utils';
import { ParamHistory, registerParamHistoryProcessors } from '@app/composables/useParamHistory';

import { Animation } from '@app/animation/animation-window.ts';
import { Log } from '@app/log/log-window.ts';
import { History } from '@app/tools/history.ts';
import { Cursor } from '@app/composables/usePointerObjectWindow';
import { DynamicShape } from '@app/types/shapes.ts';
import type { YamiElement } from '@app/types/element-api';
import type { YamiMouseEvent } from '@app/types/editor-event';

/**
 * 一次「输入 → 历史」的变更记录（`input` 是触发变更的元素）。
 *
 * `changes`（原先那里只有 `as unknown as HTMLElement` 一句断言，形状根本没写出来）。
 */
export interface InspectorChange {
	input: YamiElement;
	oldValue: unknown;
	newValue: unknown;
}

interface InspectorEditorShape {
	target: unknown;
	update?: (target: unknown, key: string, value: unknown) => void;
	owner?: { setTarget: (target: unknown, meta?: unknown) => void };
}

interface InspectorChangeData {
	editor: InspectorEditorShape;
	target: unknown;
	changes: InspectorChange[];
	[k: string]: unknown;
}

interface InspectorLayerChangeData extends InspectorChangeData {
	motion: unknown;
	direction: unknown;
}

interface InspectorScriptParameterData {
	editor: {
		target: unknown;
		owner: { setTarget: (target: unknown, meta?: unknown) => void };
	};
	target: unknown;
	meta: unknown;
	list: { rewrite: (parameters: Record<string, unknown>, key: string) => void };
	parameters: Record<string, unknown>;
	key: string;
	value: unknown;
}

const getFormBridge = (input: HTMLElement): Record<string, unknown> | null => {
	const mount = input.closest('[id$="-vue-mount"]') as (HTMLElement & { form?: unknown }) | null;
	const form = mount?.form;
	return form !== null && typeof form === 'object' ? (form as Record<string, unknown>) : null;
};

const writeFormValue = (form: Record<string, unknown>, key: string, value: unknown): boolean => {
	if (key in form) {
		form[key] = value;
		return true;
	}
	const camelKey = key.replace(/-([a-z])/g, (_match: string, char: string) => char.toUpperCase());
	if (camelKey !== key && camelKey in form) {
		form[camelKey] = value;
		return true;
	}
	const nodes = key.split('-');
	let node: Record<string, unknown> = form;
	for (let i = 0; i < nodes.length - 1; i++) {
		const next = node[nodes[i]];
		if (next === null || typeof next !== 'object') return false;
		node = next as Record<string, unknown>;
	}
	const last = nodes[nodes.length - 1];
	if (!(last in node)) return false;
	node[last] = value;
	return true;
};

/**
 * inspector 页管理器元素上的元素数据（`focusing` 原先靠原型访问器透明落到 WeakMap）。
 * 注意 manager 上的 `active` **不走元素数据**：Vue 版 YMPageManager 在元素上
 * `Object.defineProperty(el, 'active', …)` 自建访问器（遮蔽原型），故保持原样。
 */
interface InspectorManagerData {
	focusing: YamiElement | null;
}
const managerData = (el: unknown): InspectorManagerData => elementDataOf<InspectorManagerData>(el);

/** 滚动拖拽状态（`dragging`）走显式元素数据 */
interface InspectorScrollData {
	dragging: PointerEvent | null;
}
const scrollData = (el: unknown): InspectorScrollData => elementDataOf<InspectorScrollData>(el);

export const Inspector: DynamicShape = {
	manager: null,
	type: null,
	meta: null,
	fileScene: null,
	fileUI: null,
	fileAnimation: null,
	fileParticle: null,
	fileTileset: null,
	fileActor: null,
	fileSkill: null,
	fileTrigger: null,
	fileItem: null,
	fileEquipment: null,
	fileState: null,
	fileEvent: null,
	fileImage: null,
	fileAudio: null,
	fileVideo: null,
	fileFont: null,
	fileScript: null,
	sceneActor: null,
	sceneRegion: null,
	sceneLight: null,
	sceneAnimation: null,
	sceneParticle: null,
	sceneParallax: null,
	sceneTilemap: null,
	uiElement: null,
	uiImage: null,
	uiText: null,
	uiTextBox: null,
	uiDialogBox: null,
	uiProgressBar: null,
	uiButton: null,
	uiAnimation: null,
	uiVideo: null,
	uiWindow: null,
	uiContainer: null,
	uiReference: null,
	animMotion: null,
	animJointLayer: null,
	animJointFrame: null,
	animSpriteLayer: null,
	animSpriteFrame: null,
	animParticleLayer: null,
	animParticleFrame: null,
	animSoundLayer: null,
	animSoundFrame: null,
	particleLayer: null,
	initialize: null,
	open: null,
	close: null,
	getKey: null,
	inspectorResize: null,
	managerKeydown: null,
	scrollPointerdown: null,
	inputFocus: null,
	inputBlur: null,
	sliderFocus: null,
	sliderBlur: null,
	ParamHistory: null,
	_initialized: false
};

Inspector.initialize = function (this: typeof Inspector) {
	if (this._initialized) {
		return;
	}
	this.manager = inspectorEls.get('inspector-page-manager') as YamiElement;
	if (!this.manager) return;
	managerData(this.manager).focusing = null;
	this.manager.oldValue = null;
	listenDraggingScrollbarEvent(this.manager, this.scrollPointerdown, {
		capture: true
	});

	registerParamHistoryProcessors();

	// this.manager.switch('fileTrigger')

	// oxlint-disable-next-line no-explicit-any
	const processors = History.processors as Record<string, (operation: string, data: any) => void>;
	processors['inspector-change'] = (operation: string, data: InspectorChangeData) => {
		const { editor, target, changes } = data;
		for (const change of changes) {
			const input = change.input;
			const value = operation === 'undo' ? change.oldValue : change.newValue;
			if (editor.target === target) {
				write(input, value);
				const form = getFormBridge(input);
				if (form) {
					writeFormValue(form, Inspector.getKey!(input), value);
				}
				input.dispatchEvent(new Event('input'));
			} else {
				const key = Inspector.getKey!(input);
				editor.update!(target, key, value);
			}
		}
		editor.owner?.setTarget(target);
	};
	processors['inspector-layer-change'] = (operation: string, data: InspectorLayerChangeData) => {
		const { target, motion, direction } = data;
		processors['inspector-change'](operation, data);
		Animation.setMotion(motion as AnimationMotionData | null); // 面板载荷是动态类型：这里按运行期形状收窄一次
		Animation.setDirection(direction as number);
		Animation.openLayer(target);
	};
	processors['inspector-frame-change'] = (operation: string, data: InspectorLayerChangeData) => {
		const { target, motion, direction } = data;
		processors['inspector-change'](operation, data);
		Animation.setMotion(motion as AnimationMotionData | null); // 面板载荷是动态类型：这里按运行期形状收窄一次
		Animation.setDirection(direction as number);
		Animation.selectFrame(target);
	};
	processors['script-parameter-change'] = (
		_operation: string,
		data: InspectorScriptParameterData
	) => {
		const { editor, target, meta, list, parameters, key, value } = data;
		data.value = parameters[key];
		parameters[key] = value;
		if (editor.target === target) {
			list.rewrite(parameters, key);
		}
		editor.owner.setTarget(target, meta);
	};

	inspectorEls.get('inspector')?.addEventListener?.('resize', this.inspectorResize);
	this.manager.addEventListener('keydown', this.managerKeydown);

	const initSub = (name: string) => {
		const sub = this[name];
		if (sub && typeof sub.initialize === 'function') {
			try {
				sub.initialize();
			} catch (e: unknown) {
				console.warn(`[Inspector] ${name}.initialize failed:`, (e as Error)?.message);
			}
		} else {
			console.warn(`[Inspector] ${name} is null or has no initialize`);
		}
	};
	const subNames = [
		'fileScene',
		'fileUI',
		'fileAnimation',
		'fileTileset',
		'fileActor',
		'fileSkill',
		'fileTrigger',
		'fileItem',
		'fileEquipment',
		'fileState',
		'fileEvent',
		'fileImage',
		'fileAudio',
		'fileVideo',
		'fileFont',
		'fileScript',
		'sceneActor',
		'sceneRegion',
		'sceneLight',
		'sceneAnimation',
		'sceneParticle',
		'sceneParallax',
		'sceneTilemap',
		'uiElement',
		'uiImage',
		'uiText',
		'uiTextBox',
		'uiDialogBox',
		'uiProgressBar',
		'uiButton',
		'uiAnimation',
		'uiVideo',
		'uiWindow',
		'uiContainer',
		'uiReference',
		'animMotion',
		'animJointFrame',
		'animSpriteLayer',
		'animSpriteFrame',
		'animParticleLayer',
		'animParticleFrame',
		'animSoundLayer',
		'animSoundFrame',
		'particleLayer'
	];
	for (const name of subNames) {
		initSub(name);
	}
	const win = Window;
	if (win && typeof win.initialize === 'function') {
		try {
			win.initialize();
		} catch (e: unknown) {
			console.warn('[Inspector] Window.initialize failed:', (e as Error)?.message);
		}
	}
	this._initialized = true;
};

Inspector.open = function (this: typeof Inspector, type: string, target: unknown, meta?: unknown) {
	if (!this.manager) {
		this.initialize();
	}
	if (!this.manager) {
		return;
	}
	if (this.manager.contains(document.activeElement)) {
		(document.activeElement as HTMLElement).blur();
	}
	if (this.type !== type) {
		if (this.type !== null) {
			this[this.type].close();
		}
		this.type = type;
		this.manager.switch(type);
	}
	if (target) {
		this.meta = meta || null;
		try {
			this[type].open(target, meta);
		} catch (e: unknown) {
			console.error(
				'[Inspector.open] sub.open failed:',
				type,
				(e as Error)?.message,
				(e as Error)?.stack
			);
		}
	} else {
		this.close();
	}
};

Inspector.close = function (this: typeof Inspector, type?: string) {
	if (!this.manager) {
		this.initialize();
	}
	if (!this.manager) {
		return;
	}
	if (this.manager.contains(document.activeElement)) {
		(document.activeElement as HTMLElement).blur();
	}
	if (type === undefined) {
		type = this.type || undefined;
	}
	if (this.type === type) {
		this[this.type].close();
		this.type = null;
		this.meta = null;
		this.manager.switch(null);
	}
};

Inspector.getKey = function (
	this: typeof Inspector,
	element: { key?: string; id: string }
): string {
	// `key` 是元素数据（原先靠原型访问器透明落到 WeakMap，本函数的 element 实参都是控件元素）
	const data = elementDataOf<{ key?: string }>(element);
	let key = data.key;
	if (key === undefined) {
		const id = element.id;
		const index = id.indexOf('-') + 1;
		key = data.key = id.slice(index);
	}
	return key as string;
};

Inspector.inspectorResize = (function IIFE() {
	const resize = new Event('resize');
	return function (this: typeof Inspector, _event: Event) {
		const page = Inspector.manager.active;
		if (page instanceof HTMLElement) {
			page.dispatchEvent(resize);
		}
	};
})();

Inspector.managerKeydown = function (this: typeof Inspector, event: KeyboardEvent) {
	const element = event.target as HTMLElement & { type?: string };
	switch (element.tagName) {
		case 'INPUT':
		case 'TEXTAREA':
			// 如果是滑动框类型则跳到default
			if (element.type !== 'range') {
				if (event.ctrlKey || event.metaKey) {
					switch (event.code) {
						case 'KeyS':
							break;
						default:
							event.stopPropagation();
							break;
					}
				} else {
					switch (event.code) {
						case 'Escape':
						case 'F1':
						case 'F2':
						case 'F3':
						case 'F4':
							break;
						default:
							event.stopPropagation();
							break;
					}
				}
				break;
			}
		default:
			if (event.ctrlKey || event.metaKey) {
				switch (event.code) {
					case 'KeyZ':
					case 'KeyY':
						if (managerData(Inspector.manager).focusing) {
							(document.activeElement as HTMLElement).blur();
						}
						break;
				}
			}
	}
};

Inspector.scrollPointerdown = function (this: YamiElement, event: YamiMouseEvent) {
	const data = scrollData(this) as { dragging: YamiMouseEvent | null };
	if (data.dragging) {
		return;
	}
	switch (event.button) {
		case 0:
			if (event.altKey && !(event.target as HTMLElement).closest('.marquee-area')) {
				let element = event.target as YamiElement;
				while (element !== this) {
					if (typeof element.scrollPointerup === 'function' && hasScrollBar(element)) {
						return;
					}
					element = element.parentNode as YamiElement;
				}
				event.preventDefault();
				event.stopImmediatePropagation();
				data.dragging = event;
				event.mode = 'scroll';
				event.scrollLeft = this.scrollLeft;
				event.scrollTop = this.scrollTop;
				Cursor.open('cursor-grab');
				window.addEventListener('pointerup', this.scrollPointerup);
				window.addEventListener('pointermove', this.scrollPointermove);
			}
			break;
	}
};

Inspector.inputFocus = function (this: YamiElement, _event: Event) {
	if (Window.activeElement === null) {
		const { manager } = Inspector;
		const managerView = managerData(manager);
		if (managerView.focusing !== null) {
			const id1 = managerView.focusing.id;
			const id2 = this.id;
			return Log.throw!(new Error(`Inspector focus error: ${id1} -> ${id2}`));
		}
		managerView.focusing = this;
		manager.oldValue = read(this);
	}
};

Inspector.inputBlur = function (
	editor: { target: unknown },
	owner: { history: History | null },
	callback: ((data: InspectorChangeData) => void) | null = null
) {
	return function (this: YamiElement & { changes?: InspectorChange[] }, _event: Event) {
		if (Window.activeElement === null) {
			// 因此需要判断manager.focusing
			const { manager } = Inspector;
			const managerView = managerData(manager);
			if (managerView.focusing === null) {
				return;
			}
			const target = editor.target;
			const oldValue = manager.oldValue;
			const newValue = read(this);
			if (target !== null) {
				const changes: InspectorChange[] = [];
				if (oldValue !== newValue) {
					changes.push({
						input: this,
						oldValue: oldValue,
						newValue: newValue
					});
				}
				if (this.changes) {
					changes.push(...this.changes);
				}
				if (changes.length !== 0) {
					const data = {
						type: 'inspector-change',
						editor: editor,
						target: target,
						changes: changes
					};
					owner.history!.save(data);
					callback?.(data);
				}
			}
			if (this.changes) {
				delete this.changes;
			}
			managerView.focusing = null;
			manager.oldValue = null;
		}
	};
};

Inspector.sliderFocus = (function IIFE() {
	const focus = new FocusEvent('focus');
	return function (this: HTMLElement & { synchronizer: HTMLElement }, _event: Event) {
		// `synchronizer` 走显式元素数据（原先靠原型访问器透明落到 WeakMap）
		elementDataOf<{ synchronizer: HTMLElement }>(this).synchronizer.dispatchEvent(focus);
	};
})();

Inspector.sliderBlur = (function IIFE() {
	const blur = new FocusEvent('blur');
	return function (this: HTMLElement & { synchronizer: HTMLElement }, _event: Event) {
		elementDataOf<{ synchronizer: HTMLElement }>(this).synchronizer.dispatchEvent(blur);
	};
})();

Inspector.ParamHistory = ParamHistory;
