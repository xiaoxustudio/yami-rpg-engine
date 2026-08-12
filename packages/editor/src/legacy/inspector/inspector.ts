import { $ } from '@/util/dom.ts';
import { Window } from '@/tools/window-object.ts';
import { hasScrollBar, listenDraggingScrollbarEvent, read, write } from '@/util/element-utils';

import { Animation } from '@/animation/animation-window.ts';
import { Log } from '@/log/log-window.ts';
import { History } from '@/tools/history.ts';
import { Cursor } from '@/tools/pointer-object.ts';
import { ParamListHistory } from '@/components/param-history.ts';
import { DynamicShape } from '@/types/legacy-shapes.ts';

interface InspectorChange {
	input: HTMLElement;
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

interface InspectorParamData {
	type: string;
	array: unknown[];
	history: {
		owner: { setTarget(target: unknown): void; planToSave(): void };
		list: unknown;
	};
	target: unknown;
	[k: string]: unknown;
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
	ParamHistory: null
};

Inspector.initialize = function (this: typeof Inspector) {
	this.manager = $('#inspector-page-manager');
	this.manager.focusing = null;
	this.manager.oldValue = null;
	listenDraggingScrollbarEvent(this.manager, this.scrollPointerdown, {
		capture: true
	});

	// this.manager.switch('fileTrigger')

	const processors = History.processors as Record<string, (operation: string, data: any) => void>;
	processors['inspector-change'] = (operation: string, data: InspectorChangeData) => {
		const { editor, target, changes } = data;
		for (const change of changes) {
			const input = change.input;
			const value = operation === 'undo' ? change.oldValue : change.newValue;
			if (editor.target === target) {
				write(input, value);
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
		Animation.setMotion(motion);
		Animation.setDirection(direction);
		Animation.openLayer(target);
	};
	processors['inspector-frame-change'] = (operation: string, data: InspectorLayerChangeData) => {
		const { target, motion, direction } = data;
		processors['inspector-change'](operation, data);
		Animation.setMotion(motion);
		Animation.setDirection(direction);
		Animation.selectFrame(target);
	};
	processors['inspector-param-insert'] = (operation: string, data: InspectorParamData) => {
		const { history, target } = data;
		const { owner, list } = history;
		ParamListHistory.restore(
			list as Parameters<typeof ParamListHistory.restore>[0],
			data,
			'insert',
			operation as 'undo' | 'redo'
		);
		owner.setTarget(target);
		owner.planToSave();
	};
	processors['inspector-param-replace'] = (operation: string, data: InspectorParamData) => {
		const { history, target } = data;
		const { owner, list } = history;
		ParamListHistory.restore(
			list as Parameters<typeof ParamListHistory.restore>[0],
			data,
			'replace',
			operation as 'undo' | 'redo'
		);
		owner.setTarget(target);
		owner.planToSave();
	};
	processors['inspector-param-delete'] = (operation: string, data: InspectorParamData) => {
		const { history, target } = data;
		const { owner, list } = history;
		ParamListHistory.restore(
			list as Parameters<typeof ParamListHistory.restore>[0],
			data,
			'delete',
			operation as 'undo' | 'redo'
		);
		owner.setTarget(target);
		owner.planToSave();
	};
	processors['inspector-param-toggle'] = (operation: string, data: InspectorParamData) => {
		const { history, target } = data;
		const { owner, list } = history;
		ParamListHistory.restore(
			list as Parameters<typeof ParamListHistory.restore>[0],
			data,
			'toggle',
			operation as 'undo' | 'redo'
		);
		owner.setTarget(target);
		owner.planToSave();
	};
	processors['script-parameter-change'] = (
		operation: string,
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

	$('#inspector').addEventListener('resize', this.inspectorResize);
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
};

Inspector.open = function (this: typeof Inspector, type: string, target: unknown, meta?: unknown) {
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
	let key = element.key;
	if (key === undefined) {
		const id = element.id;
		const index = id.indexOf('-') + 1;
		key = element.key = id.slice(index);
	}
	return key as string;
};

Inspector.inspectorResize = (function IIFE() {
	const resize = new Event('resize');
	return function (this: typeof Inspector, event: Event) {
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
			// 濡傛灉鏄粦鍔ㄦ绫诲瀷鍒欒烦鍒癲efault
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
						if (Inspector.manager.focusing) {
							(document.activeElement as HTMLElement).blur();
						}
						break;
				}
			}
	}
};

Inspector.scrollPointerdown = function (this: HTMLElement, event: PointerEvent) {
	if (this.dragging) {
		return;
	}
	switch (event.button) {
		case 0:
			if (event.altKey && !(event.target as HTMLElement).closest('.marquee-area')) {
				let element: HTMLElement = event.target as HTMLElement;
				while (element !== this) {
					if (typeof element.scrollPointerup === 'function' && hasScrollBar(element)) {
						return;
					}
					element = element.parentNode as HTMLElement;
				}
				event.preventDefault();
				event.stopImmediatePropagation();
				this.dragging = event;
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

Inspector.inputFocus = function (this: HTMLElement, event: Event) {
	if (Window.activeElement === null) {
		const { manager } = Inspector;
		if (manager.focusing !== null) {
			const id1 = manager.focusing.id;
			const id2 = this.id;
			return Log.throw!(new Error(`Inspector focus error: ${id1} -> ${id2}`));
		}
		manager.focusing = this;
		manager.oldValue = read(this);
	}
};

Inspector.inputBlur = function (
	editor: { target: unknown },
	owner: { history: History | null },
	callback: ((data: InspectorChangeData) => void) | null = null
) {
	return function (this: HTMLElement & { changes?: InspectorChange[] }, event: Event) {
		if (Window.activeElement === null) {
			// 鍥犳闇€瑕佸垽鏂璵anager.focusing
			const { manager } = Inspector;
			if (manager.focusing === null) {
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
			manager.focusing = null;
			manager.oldValue = null;
		}
	};
};

Inspector.sliderFocus = (function IIFE() {
	const focus = new FocusEvent('focus');
	return function (this: HTMLElement & { synchronizer: HTMLElement }, event: Event) {
		this.synchronizer.dispatchEvent(focus);
	};
})();

Inspector.sliderBlur = (function IIFE() {
	const blur = new FocusEvent('blur');
	return function (this: HTMLElement & { synchronizer: HTMLElement }, event: Event) {
		this.synchronizer.dispatchEvent(blur);
	};
})();

Inspector.ParamHistory = class ParamHistory {
	editor: { target: unknown };
	owner: {
		history: History;
		setTarget(target: unknown): void;
		planToSave(): void;
	};
	list: unknown;

	constructor(
		editor: { target: unknown },
		owner: {
			history: History;
			setTarget(target: unknown): void;
			planToSave(): void;
		},
		list: unknown
	) {
		this.editor = editor;
		this.owner = owner;
		this.list = list;
	}

	reset() {}

	save(data: { type: string } & InspectorParamData) {
		const { target } = this.editor;
		if (target !== null) {
			switch (data.type) {
				case 'insert':
					data.type = 'inspector-param-insert';
					break;
				case 'replace':
					data.type = 'inspector-param-replace';
					break;
				case 'delete':
					data.type = 'inspector-param-delete';
					break;
				case 'toggle':
					data.type = 'inspector-param-toggle';
					break;
			}
			data.history = this;
			data.target = target;
			this.owner.history.save(data);
		}
	}

	restore(operation: string) {
		this.owner.history.restore(operation);
	}

	canUndo() {
		const history = this.owner.history;
		const data = history[history.index];
		return data?.type.indexOf('inspector-param') === 0;
	}

	canRedo() {
		const history = this.owner.history;
		const data = history[history.index + 1];
		return data?.type.indexOf('inspector-param') === 0;
	}
};
