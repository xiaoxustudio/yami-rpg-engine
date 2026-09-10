import { UI } from './ui-window.ts';
import type { UIShape, UINodeShape } from './ui-window.ts';
import { Easing } from '@app/data/transition-window.ts';
import { getUIStore } from '@app/stores/ui';
import { Inspector } from '@app/inspector/inspector.ts';
import { read, rect } from '@app/utils/element-utils.ts';
import { Timer } from '@app/utils/timer';
import { Title } from '@app/title/title-bar.ts';
import { headNavOf, lastNavItemOf } from '@app/engine/layout/layout.ts';
import { GL } from '@app/engine/webgl/webgl-init.ts';

UI.setSize = function (this: UIShape, width: number, height: number) {
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
	this.requestRendering!();
};

UI.setHover = function (this: UIShape, hover: UINodeShape | null) {
	if (this.hover !== hover) {
		this.hover = hover;
		this.requestRendering!();
	}
};

UI.setTarget = function (this: UIShape, target: UINodeShape | null) {
	if (getUIStore().target !== target) {
		getUIStore().target = target;
		this.updateTargetItem!();
		this.requestRendering!();
		if (target) {
			const map = this.inspectorTypeMap;
			const key = map[target.class];
			Inspector.open!(key, target);
		} else {
			Inspector.close!();
		}
	}
};

UI.revealTarget = (function IIFE() {
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
				UI.updateCamera!(x, y);
				UI.updateTransform!();
				if (screen.scrollLeft !== sl || screen.scrollTop !== st) {
					UI.requestRendering!();
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
			const instance = target.instance;
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
			// 目标和摄像机的位置不一定相等
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

UI.updateHover = function (this: UIShape) {
	if (this.hover && !this.hover.instance) {
		this.setHover!(null);
	}
};

UI.updateTarget = function (this: UIShape) {
	const item = read(this.list);
	if (item !== getUIStore().target) {
		this.setTarget!(item);
	}
};

UI.updateTargetItem = function (this: UIShape) {
	const { target } = this;
	if (target !== null) {
		const { list } = this;
		if (read(list) !== target) {
			list.selectWithNoEvent(target);
			if (target) {
				list.expandToSelection();
				list.scrollToSelection();
			}
		}
	}
};

UI.updateElementFont = function (this: UIShape) {
	if (getUIStore().state === 'open') {
		if (this.context.fontChanged) {
			delete this.context.fontChanged;
		}
		const update = (element: UINodeShape) => {
			if (
				element instanceof UI.Text ||
				element instanceof UI.TextBox ||
				element instanceof UI.DialogBox ||
				element instanceof UI.Button
			) {
				let el = element;
				if (el instanceof UI.Button) {
					el = el.shadowText;
				}
				if (el.printer !== null) {
					el.printer.reset();
					if (el._font === '') {
						el._font = undefined;
						el.font = '';
					}
					this.requestRendering!();
				}
			}
			const children = element.children;
			const length = children.length;
			for (let i = 0; i < length; i++) {
				update(children[i]);
			}
		};
		update(this.root);
	}
};

UI.updateElementLanguage = function (this: UIShape) {
	if (getUIStore().state === 'open') {
		if (this.context.languageChanged) {
			delete this.context.languageChanged;
		}
		const update = (elements: UINodeShape[]) => {
			for (const element of elements) {
				element.updateTextContent?.();
				update(element.children);
			}
		};
		update(this.root.children);
		this.requestRendering!();
	}
};

UI.updateElementTextScaling = function (this: UIShape) {
	if (getUIStore().state === 'open') {
		if (this.context.scalingChanged) {
			delete this.context.scalingChanged;
		}
		const update = (elements: UINodeShape[]): void => {
			for (const element of elements) {
				element.updatePrinter?.();
				update(element.children);
			}
		};
		update(this.root.children);
		this.requestRendering!();
	}
};

UI.updateIndexedColor = function (this: UIShape, index: number) {
	if (getUIStore().state === 'open') {
		const TextElement = UI.Text;
		const regexp = new RegExp(`<color:${index}>`, 'i');
		const update = (element: UINodeShape): void => {
			if (element instanceof TextElement && regexp.test(element.content)) {
				element.printer.reset();
				this.requestRendering!();
			}
			const children = element.children;
			const length = children.length;
			for (let i = 0; i < length; i++) {
				update(children[i]);
			}
		};
		update(this.root);
	}
};

UI.updateAllTexts = function (this: UIShape) {
	if (!Title.tabBar?.data) return;
	for (const context of Title.tabBar.data) {
		if (context.type === 'ui') {
			context.languageChanged = true;
		}
	}
	this.updateElementLanguage!();
};

UI.updateAllPrinters = function (this: UIShape) {
	if (!Title.tabBar?.data) return;
	for (const context of Title.tabBar.data) {
		if (context.type === 'ui') {
			context.scalingChanged = true;
		}
	}
	this.updateElementTextScaling!();
};

UI.updateAllReferences = function (this: UIShape) {
	if (getUIStore().state === 'open') {
		const update = (elements: UINodeShape[]): void => {
			for (const element of elements) {
				if (element instanceof UI.Reference) {
					element.update();
				} else {
					update(element.children);
				}
			}
		};
		update(this.root.children);
	}
};

UI.updateElement = function (this: UIShape, target: UINodeShape) {
	let nodes;
	let instance;
	if (this.nodes.includes(target)) {
		nodes = this.nodes;
		instance = this.root;
	} else {
		const find = (node: UINodeShape): UINodeShape | null => {
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
		const node = find({
			instance: this.root,
			children: this.nodes
		} as unknown as UINodeShape);
		if (node) {
			nodes = node.children;
			instance = node.instance;
		}
	}
	if (instance) {
		instance.appendChildTo(target.instance, nodes.indexOf(target));
	}
	this.requestRendering!();
};

UI.deleteElement = function (this: UIShape, target: UINodeShape) {
	target.instance.remove();
	target.instance.destroy();
};

UI.updateHead = function (this: UIShape) {
	const { page, head } = this;
	if (page.clientWidth !== 0) {
		const nav = headNavOf(head);
		const item = lastNavItemOf(nav);
		if (!nav || !item) return;
		const nRect = rect(nav);
		const iRect = rect(item);
		const left = iRect.right - nRect.left;
		head.style.left = `${left}px`;
		// 调整居中组件的位置 const width = nRect.right - iRect.right if (head.width !== width) { head.width = width const [start, center, end] = head.children end.style.marginLeft = '0' const sRect = start.rect() const cRect = center.rect() const eRect = end.rect() const spacing = eRect.left - sRect.right - cRect.width const difference = sRect.right - nRect.left - eRect.width const margin = Math.min(spacing, difference) end.style.marginLeft = `${margin}px` }
	}
};

UI.resize = function (this: UIShape) {
	if (getUIStore().state === 'open' && this.screen.clientWidth !== 0) {
		const scale = this.scale;
		const width = getUIStore().width!;
		const height = getUIStore().height!;
		const scaledPadding = Math.round(this.padding * scale);
		const innerWidth = Math.round((width * scale) / 2) * 2;
		const innerHeight = Math.round((height * scale) / 2) * 2;
		const screenBox = CSS.getDevicePixelContentBoxSize(this.screen);
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
		this.updateCamera!();
		this.updateTransform!();
		this.root.resize();
		this.marquee.resize();
		this.screen.updateScrollbars();
	}
};
