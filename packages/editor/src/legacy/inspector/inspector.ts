import { $ } from '@/util/dom.ts';
import { Window } from '@/tools/window-object.ts';
import { hasScrollBar, listenDraggingScrollbarEvent, read, write } from '@/util/element-utils';

import { Animation } from '@/animation/animation-window.ts';
import { Log } from '@/log/log-window.ts';
import { History } from '@/tools/history.ts';
import { Cursor } from '@/tools/pointer-object.ts';
import { ParamListHistory } from '@/components/param-history.ts';

interface InspectorShape {
	[k: string]: any;
}

export const Inspector: InspectorShape = {
	manager: null as any,
	type: null as any,
	meta: null as any,
	fileScene: null as any,
	fileUI: null as any,
	fileAnimation: null as any,
	fileParticle: null as any,
	fileTileset: null as any,
	fileActor: null as any,
	fileSkill: null as any,
	fileTrigger: null as any,
	fileItem: null as any,
	fileEquipment: null as any,
	fileState: null as any,
	fileEvent: null as any,
	fileImage: null as any,
	fileAudio: null as any,
	fileVideo: null as any,
	fileFont: null as any,
	fileScript: null as any,
	sceneActor: null as any,
	sceneRegion: null as any,
	sceneLight: null as any,
	sceneAnimation: null as any,
	sceneParticle: null as any,
	sceneParallax: null as any,
	sceneTilemap: null as any,
	uiElement: null as any,
	uiImage: null as any,
	uiText: null as any,
	uiTextBox: null as any,
	uiDialogBox: null as any,
	uiProgressBar: null as any,
	uiButton: null as any,
	uiAnimation: null as any,
	uiVideo: null as any,
	uiWindow: null as any,
	uiContainer: null as any,
	uiReference: null as any,
	animMotion: null as any,
	animJointLayer: null as any,
	animJointFrame: null as any,
	animSpriteLayer: null as any,
	animSpriteFrame: null as any,
	animParticleLayer: null as any,
	animParticleFrame: null as any,
	animSoundLayer: null as any,
	animSoundFrame: null as any,
	particleLayer: null as any,
	initialize: null as any,
	open: null as any,
	close: null as any,
	getKey: null as any,
	inspectorResize: null as any,
	managerKeydown: null as any,
	scrollPointerdown: null as any,
	inputFocus: null as any,
	inputBlur: null as any,
	sliderFocus: null as any,
	sliderBlur: null as any,
	ParamHistory: null as any
};

Inspector.initialize = function (this: any) {
	this.manager = $('#inspector-page-manager');
	this.manager.focusing = null;
	this.manager.oldValue = null;
	listenDraggingScrollbarEvent(this.manager, this.scrollPointerdown, {
		capture: true
	});

	// this.manager.switch('fileTrigger')

	const processors = History.processors as Record<string, (operation: string, data: any) => void>;
	processors['inspector-change'] = (operation: any, data: any) => {
		const { editor, target, changes } = data;
		for (const change of changes) {
			const input = change.input;
			const value = operation === 'undo' ? change.oldValue : change.newValue;
			if (editor.target === target) {
				write(input, value);
				input.dispatchEvent(new Event('input'));
			} else {
				const key = Inspector.getKey!(input);
				editor.update(target, key, value);
			}
		}
		editor.owner?.setTarget(target);
	};
	processors['inspector-layer-change'] = (operation: any, data: any) => {
		const { target, motion, direction } = data;
		processors['inspector-change'](operation, data);
		Animation.setMotion(motion);
		Animation.setDirection(direction);
		Animation.openLayer(target);
	};
	processors['inspector-frame-change'] = (operation: any, data: any) => {
		const { target, motion, direction } = data;
		processors['inspector-change'](operation, data);
		Animation.setMotion(motion);
		Animation.setDirection(direction);
		Animation.selectFrame(target);
	};
	processors['inspector-param-insert'] = (operation: any, data: any) => {
		const { history, target } = data;
		const { owner, list } = history;
		ParamListHistory.restore(list, data, 'insert', operation);
		owner.setTarget(target);
		owner.planToSave();
	};
	processors['inspector-param-replace'] = (operation: any, data: any) => {
		const { history, target } = data;
		const { owner, list } = history;
		ParamListHistory.restore(list, data, 'replace', operation);
		owner.setTarget(target);
		owner.planToSave();
	};
	processors['inspector-param-delete'] = (operation: any, data: any) => {
		const { history, target } = data;
		const { owner, list } = history;
		ParamListHistory.restore(list, data, 'delete', operation);
		owner.setTarget(target);
		owner.planToSave();
	};
	processors['inspector-param-toggle'] = (operation: any, data: any) => {
		const { history, target } = data;
		const { owner, list } = history;
		ParamListHistory.restore(list, data, 'toggle', operation);
		owner.setTarget(target);
		owner.planToSave();
	};
	processors['script-parameter-change'] = (operation: any, data: any) => {
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
		const sub = (this as any)[name];
		if (sub && typeof sub.initialize === 'function') {
			try {
				sub.initialize();
			} catch (e: any) {
				console.warn(`[Inspector] ${name}.initialize failed:`, e?.message);
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
		} catch (e: any) {
			console.warn('[Inspector] Window.initialize failed:', e?.message);
		}
	}
};

Inspector.open = function (this: any, type: string, target: any, meta?: any) {
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
		} catch (e: any) {
			console.error('[Inspector.open] sub.open failed:', type, e?.message, e?.stack);
		}
	} else {
		this.close();
	}
};

Inspector.close = function (this: any, type?: string) {
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

Inspector.getKey = function (this: any, element: any) {
	let key = element.key;
	if (key === undefined) {
		const id = element.id;
		const index = id.indexOf('-') + 1;
		key = element.key = id.slice(index);
	}
	return key;
};

Inspector.inspectorResize = (function IIFE() {
	const resize = new Event('resize');
	return function (this: any, event: any) {
		const page = Inspector.manager.active;
		if (page instanceof HTMLElement) {
			page.dispatchEvent(resize);
		}
	};
})();

Inspector.managerKeydown = function (this: any, event: any) {
	const element = event.target;
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
						if (Inspector.manager.focusing) {
							(document.activeElement as HTMLElement).blur();
						}
						break;
				}
			}
	}
};

Inspector.scrollPointerdown = function (this: any, event: any) {
	if (this.dragging) {
		return;
	}
	switch (event.button) {
		case 0:
			if (event.altKey && !(event.target as HTMLElement).closest('.marquee-area')) {
				let element = event.target;
				while (element !== this) {
					if (element.scrollPointerup && hasScrollBar(element as HTMLElement)) {
						return;
					}
					element = element.parentNode;
				}
				event.preventDefault();
				event.stopImmediatePropagation();
				this.dragging = event;
				event.mode = 'scroll';
				event.scrollLeft = this.scrollLeft;
				event.scrollTop = this.scrollTop;
				(Cursor as any).open('cursor-grab');
				window.addEventListener('pointerup', this.scrollPointerup);
				window.addEventListener('pointermove', this.scrollPointermove);
			}
			break;
	}
};

Inspector.inputFocus = function (this: any, event: any) {
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
	this: any,
	editor: any,
	owner: any,
	callback: ((data: any) => void) | null = null
) {
	return function (this: any, event: any) {
		if (Window.activeElement === null) {
			// 因此需要判断manager.focusing
			const { manager } = Inspector;
			if (manager.focusing === null) {
				return;
			}
			const target = editor.target;
			const oldValue = manager.oldValue;
			const newValue = read(this);
			if (target !== null) {
				const changes = [] as any[];
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
					owner.history.save(data);
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
	return function (this: any, event: any) {
		this.synchronizer.dispatchEvent(focus);
	};
})();

Inspector.sliderBlur = (function IIFE() {
	const blur = new FocusEvent('blur');
	return function (this: any, event: any) {
		this.synchronizer.dispatchEvent(blur);
	};
})();

Inspector.ParamHistory = class ParamHistory {
	editor: any;
	owner: any;
	list: any;

	constructor(editor: any, owner: any, list: any) {
		this.editor = editor;
		this.owner = owner;
		this.list = list;
	}

	reset() {}

	save(data: any) {
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

	restore(operation: any) {
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
