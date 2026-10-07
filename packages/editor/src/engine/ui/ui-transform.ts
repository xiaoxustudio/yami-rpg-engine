import { UI } from './ui-singleton.ts';
import { uiElClasses } from '@app/engine/ui/element-classes.ts';
import type { UIElementInstance } from '@app/engine/ui/element-classes.ts';
import type { UIShape, UINodeShape } from './ui-singleton.ts';
import type { HoverNode } from './ui-facade.ts';
import { UIEngine } from './ui-engine.ts';
import { Easing } from '@app/data/transition-window.ts';
import { getUIStore } from '@app/stores/ui';
import { Inspector } from '@app/inspector/inspector.ts';
import { read, rect } from '@app/utils/element-utils.ts';
import { Timer } from '@app/utils/timer';
import { Title } from '@app/title/title-bar.ts';
import { headNavOf, lastNavItemOf } from '@app/engine/layout/layout.ts';
import { GL } from '@app/engine/webgl/webgl-init.ts';
import { getDevicePixelContentBoxSize } from '@app/utils/css';
import type { YamiElement } from '@app/types/element-api';

interface UIListApi {
	selectWithNoEvent(item: unknown): void;
}

const setSize = function (this: UIShape, width: number, height: number) {
	const currentWidth = getUIStore().width;
	if (currentWidth !== width) {
		this.centerX = (this.centerX * width) / currentWidth!;
		getUIStore().width = width;
	}
	const currentHeight = getUIStore().height;
	if (currentHeight !== height) {
		this.centerY = (this.centerY * height) / currentHeight!;
		getUIStore().height = height;
	}
	this.resize!();
	UIEngine.requestRendering!.call(this);
};

const setHover = function (this: UIShape, hover: UINodeShape | null) {
	if (this.hover !== hover) {
		this.hover = hover as HoverNode | null;
		UIEngine.requestRendering!.call(this);
	}
};

const setTarget = function (this: UIShape, target: UINodeShape | null) {
	if (getUIStore().target !== target) {
		getUIStore().target = target;
		this.updateTargetItem!();
		UIEngine.requestRendering!.call(this);
		if (target) {
			const map = this.inspectorTypeMap;
			const key = map[target.class];
			Inspector.open!(key, target);
		} else {
			Inspector.close!();
		}
	}
};

const revealTarget = (function IIFE() {
	const timer = new Timer({
		duration: 200,
		update: (timer: Timer) => {
			const { target } = timer;
			if (target === getUIStore().target) {
				const easing = Easing.EasingMap.easeInOut;
				const time = easing.ease(timer.elapsed / timer.duration);
				const x = timer.startX * (1 - time) + timer.endX * time;
				const y = timer.startY * (1 - time) + timer.endY * time;
				const screen = UI.screen;
				const sl = screen.scrollLeft;
				const st = screen.scrollTop;
				UIEngine.updateCamera!.call(UI, x, y);
				UIEngine.updateTransform!.call(UI);
				if (screen.scrollLeft !== sl || screen.scrollTop !== st) {
					UIEngine.requestRendering!.call(UI);
					UI.marquee.resize();
					UI.screen.updateScrollbars();
				}
			} else {
				timer.target = null;
				return false;
			}
		},
		callback: (timer: Timer) => {
			timer.target = null;
		}
	});
	return function (this: UIShape) {
		const target = getUIStore().target;
		if (target && !timer.target) {
			const instance = target.instance!;
			const matrix = instance.matrix;
			const L = instance.x;
			const T = instance.y;
			const R = L + instance.width;
			const B = T + instance.height;
			const a = matrix[0];
			const b = matrix[1];
			const c = matrix[3];
			const d = matrix[4];
			const e = matrix[6];
			const f = matrix[7];
			const x1 = a * L + c * T + e;
			const y1 = b * L + d * T + f;
			const x2 = a * L + c * B + e;
			const y2 = b * L + d * B + f;
			const x3 = a * R + c * B + e;
			const y3 = b * R + d * B + f;
			const x4 = a * R + c * T + e;
			const y4 = b * R + d * T + f;
			const x = (x1 + x2 + x3 + x4) / 4;
			const y = (y1 + y2 + y3 + y4) / 4;
			const toleranceX = 0.5 / this.scaleX;
			const toleranceY = 0.5 / this.scaleY;
			const { centerX, centerY } = this;
			if (Math.abs(x - centerX) > toleranceX || Math.abs(y - centerY) > toleranceY) {
				timer.target = target;
				timer.startX = centerX;
				timer.startY = centerY;
				timer.endX = x;
				timer.endY = y;
				timer.elapsed = 0;
				timer.add();
			}
		}
	};
})();

const updateHover = function (this: UIShape) {
	if (this.hover && !this.hover.instance) {
		this.setHover!(null);
	}
};

const updateTarget = function (this: UIShape) {
	const item = read(getUIStore().elements.list) ?? null;
	if (item !== getUIStore().target) {
		this.setTarget!(item);
	}
};

const updateTargetItem = function (this: UIShape) {
	const target = getUIStore().elements.target;
	if (target !== null) {
		const list = getUIStore().elements.list as (YamiElement & UIListApi) | null;
		if (list && read(list) !== target) {
			list.selectWithNoEvent(target);
			list.expandToSelection();
			list.scrollToSelection();
		}
	}
};

const updateElementFont = function (this: UIShape) {
	if (getUIStore().state === 'open') {
		if (this.context!.fontChanged) {
			delete this.context!.fontChanged;
		}
		const update = (element: UIElementInstance) => {
			if (
				element instanceof uiElClasses.Text! ||
				element instanceof uiElClasses.TextBox! ||
				element instanceof uiElClasses.DialogBox! ||
				element instanceof uiElClasses.Button!
			) {
				let el = element;
				if (el instanceof uiElClasses.Button!) {
					el = el.shadowText!;
				}
				if (el.printer !== null) {
					el.printer!.reset();
					if (el._font === '') {
						el._font = undefined;
						el.font = '';
					}
					UIEngine.requestRendering!.call(this);
				}
			}
			const children = element.children;
			const length = children.length;
			for (let i = 0; i < length; i++) {
				update(children[i]);
			}
		};
		const root = getUIStore().root;
		if (root) update(root);
	}
};

const updateElementLanguage = function (this: UIShape) {
	if (getUIStore().state === 'open') {
		if (this.context!.languageChanged) {
			delete this.context!.languageChanged;
		}
		const update = (elements: UIElementInstance[]) => {
			for (const element of elements) {
				element.updateTextContent?.();
				update(element.children);
			}
		};
		update(getUIStore().root?.children ?? []);
		UIEngine.requestRendering!.call(this);
	}
};

const updateElementTextScaling = function (this: UIShape) {
	if (getUIStore().state === 'open') {
		if (this.context!.scalingChanged) {
			delete this.context!.scalingChanged;
		}
		const update = (elements: UIElementInstance[]): void => {
			for (const element of elements) {
				element.updatePrinter?.();
				update(element.children);
			}
		};
		update(getUIStore().root?.children ?? []);
		UIEngine.requestRendering!.call(this);
	}
};

const updateIndexedColor = function (this: UIShape, index: number) {
	if (getUIStore().state === 'open') {
		const TextElement = uiElClasses.Text!;
		const regexp = new RegExp(`<color:${index}>`, 'i');
		const update = (element: UIElementInstance): void => {
			if (element instanceof TextElement && regexp.test(element.content ?? '')) {
				element.printer!.reset();
				UIEngine.requestRendering!.call(this);
			}
			const children = element.children;
			const length = children.length;
			for (let i = 0; i < length; i++) {
				update(children[i]);
			}
		};
		const root = getUIStore().root;
		if (root) update(root);
	}
};

const updateAllTexts = function (this: UIShape) {
	if (!Title.tabBar?.data) return;
	for (const context of Title.tabBar.data) {
		if (context.type === 'ui') {
			context.languageChanged = true;
		}
	}
	this.updateElementLanguage!();
};

const updateAllPrinters = function (this: UIShape) {
	if (!Title.tabBar?.data) return;
	for (const context of Title.tabBar.data) {
		if (context.type === 'ui') {
			context.scalingChanged = true;
		}
	}
	this.updateElementTextScaling!();
};

const updateAllReferences = function (this: UIShape) {
	if (getUIStore().state === 'open') {
		const update = (elements: UIElementInstance[]): void => {
			for (const element of elements) {
				if (element instanceof uiElClasses.Reference!) {
					element.update!();
				} else {
					update(element.children);
				}
			}
		};
		update(getUIStore().root?.children ?? []);
	}
};

const updateElement = function (this: UIShape, target: UINodeShape) {
	let nodes: UINodeShape[] = [];
	let instance;
	const rootNodes = getUIStore().nodes as UINodeShape[] | null;
	const root = getUIStore().root;
	if (rootNodes?.includes(target)) {
		nodes = rootNodes;
		instance = root;
	} else {
		type FindNode = { children: UINodeShape[]; instance?: UIElementInstance | null };
		const find = (node: FindNode): FindNode | null => {
			const children = node.children;
			if (children.includes(target)) {
				return node;
			}
			for (const child of children) {
				const result = find(child);
				if (result) {
					return result;
				}
			}
			return null;
		};
		const node = find({ instance: root, children: rootNodes ?? [] });
		if (node) {
			nodes = node.children;
			instance = node.instance;
		}
	}
	if (instance) {
		instance.appendChildTo(target.instance ?? null, nodes.indexOf(target));
	}
	UIEngine.requestRendering!.call(this);
};

const deleteElement = function (this: UIShape, target: UINodeShape) {
	const instance = target.instance!;
	instance.remove();
	instance.destroy();
};

const updateHead = function (this: UIShape) {
	const { page, head } = this;
	if (page.clientWidth !== 0) {
		const nav = headNavOf(head);
		const item = lastNavItemOf(nav);
		if (!nav || !item) return;
		const nRect = rect(nav);
		const iRect = rect(item);
		const left = iRect.right - nRect.left;
		head.style.left = `${left}px`;
	}
};

const resize = function (this: UIShape) {
	if (getUIStore().state === 'open' && this.screen.clientWidth !== 0) {
		const scale = this.scale;
		const width = getUIStore().width!;
		const height = getUIStore().height!;
		const scaledPadding = Math.round(this.padding * scale);
		const innerWidth = Math.round((width * scale) / 2) * 2;
		const innerHeight = Math.round((height * scale) / 2) * 2;
		const screenBox = getDevicePixelContentBoxSize(this.screen);
		const screenWidth = screenBox.width;
		const screenHeight = screenBox.height;
		const paddingLeft = Math.max((screenWidth - innerWidth) >> 1, scaledPadding);
		const paddingTop = Math.max((screenHeight - innerHeight) >> 1, scaledPadding);
		const paddingRight = Math.max(screenWidth - innerWidth - paddingLeft, scaledPadding);
		const paddingBottom = Math.max(screenHeight - innerHeight - paddingTop, scaledPadding);
		const outerWidth = innerWidth + paddingLeft + paddingRight;
		const outerHeight = innerHeight + paddingTop + paddingBottom;
		const dpr = window.devicePixelRatio;
		this.scaleX = innerWidth / width;
		this.scaleY = innerHeight / height;
		this.outerWidth = outerWidth;
		this.outerHeight = outerHeight;
		this.centerOffsetX =
			outerWidth > screenWidth ? screenWidth / 2 : paddingLeft + innerWidth / 2;
		this.centerOffsetY =
			outerHeight > screenHeight ? screenHeight / 2 : paddingTop + innerHeight / 2;
		this.paddingLeft = paddingLeft;
		this.paddingTop = paddingTop;
		this.marquee.style.width = `${outerWidth / dpr}px`;
		this.marquee.style.height = `${outerHeight / dpr}px`;
		GL.resize!(screenWidth, screenHeight);
		UIEngine.updateCamera!.call(this);
		UIEngine.updateTransform!.call(this);
		getUIStore().root?.resize();
		this.marquee.resize();
		this.screen.updateScrollbars();
	}
};

export const uiTransformMembers = {
	setSize,
	setHover,
	setTarget,
	revealTarget,
	updateHover,
	updateTarget,
	updateTargetItem,
	updateElementFont,
	updateElementLanguage,
	updateElementTextScaling,
	updateIndexedColor,
	updateAllTexts,
	updateAllPrinters,
	updateAllReferences,
	updateElement,
	deleteElement,
	updateHead,
	resize
};
