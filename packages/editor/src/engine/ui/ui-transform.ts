import { UI } from './ui-singleton.ts';
import { uiElClasses } from '@app/engine/ui/element-classes.ts';
import type { UIShape, UINodeShape } from './ui-singleton.ts';
import type { HoverNode } from './ui-facade.ts';
// ④-2b（第 112 轮）：本文件里「以 UI 为接收者」的引擎调用改为直连 UIEngine（接收者仍显式传）。
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

/**
 * `updateTargetItem` 用到的 TreeList 专有方法（不在通用 `YamiElementApi` 上）。
 * 只补缺的那一个，避免为一个方法把整个 TreeList 类型搬进来。
 */
interface UIListApi {
	selectWithNoEvent(item: unknown): void;
}

/**
 * 遗留层各处对 UI 根节点实例的用法（`children` / 文本与打印刷新 / `resize`）。
 * `root` 已迁到 store，而 store 的类型把它标成 `UIElementInstance`（成员不够用）。
 * `extends UINodeShape` 是必需的：这些实例本身就要被当作 `UINodeShape` 传给
 * `update()` / `find()` 的递归参数，否则还得再断言一次。
 */
interface UIRootApi extends UINodeShape {
	updateTextContent?: () => void;
	updatePrinter?: () => void;
	resize(): void;
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
		// ⚠️ 第 217 轮：这里是**单次 `as`**（不是 `unknown` 跳板），依据是**引擎的读法** ——
		// `drawHoverWireframe` 不判空就解引用 `hover.instance.visible`（`UIFacadeShape` 把
		// `instance` 声明为**必填**），所以"被 hover 的节点必是已建实例的主节点"是一条
		// **既有不变式**：违反它会在每帧抛错，而不是静默失效。这里只是把这条前提写进类型。
		// 运行期一行未改（`setHover` 的形参口径也没动 ⇒ `ui-pointer` 的调用点不受影响）。
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

const updateHover = function (this: UIShape) {
	if (this.hover && !this.hover.instance) {
		this.setHover!(null);
	}
};

const updateTarget = function (this: UIShape) {
	// 同 `updateTargetItem`：`this.list` 已迁到元素注册表，注册表未登记时是 `{}` 兜底，
	// 而 `read({})` 会抛 `Invalid value used as weak map key`。
	const item = read(getUIStore().elements.list) ?? null;
	if (item !== getUIStore().target) {
		this.setTarget!(item);
	}
};

const updateTargetItem = function (this: UIShape) {
	// ⚠️ `target` 已迁到 store、`list` 已迁到元素注册表，**不能**再读 `this.target` /
	// `this.list`：前者是 `undefined`，后者在注册表未登记时是 `{}` 兜底，而 `read({})`
	// 会抛 `Invalid value used as weak map key` —— 每次点选都在这里抛异常，
	// 表现是「UI 整个像截图一样冻住、连选中框都不出现」（异常被 Vue 事件处理吞掉）。
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
		if (this.context.fontChanged) {
			delete this.context.fontChanged;
		}
		const update = (element: UINodeShape) => {
			if (
				element instanceof uiElClasses.Text! ||
				element instanceof uiElClasses.TextBox! ||
				element instanceof uiElClasses.DialogBox! ||
				element instanceof uiElClasses.Button!
			) {
				let el = element;
				if (el instanceof uiElClasses.Button!) {
					el = el.shadowText;
				}
				if (el.printer !== null) {
					el.printer.reset();
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
		const root = getUIStore().root as UIRootApi | null;
		if (root) update(root);
	}
};

const updateElementLanguage = function (this: UIShape) {
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
		update((getUIStore().root as UIRootApi | null)?.children ?? []);
		UIEngine.requestRendering!.call(this);
	}
};

const updateElementTextScaling = function (this: UIShape) {
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
		update((getUIStore().root as UIRootApi | null)?.children ?? []);
		UIEngine.requestRendering!.call(this);
	}
};

const updateIndexedColor = function (this: UIShape, index: number) {
	if (getUIStore().state === 'open') {
		const TextElement = uiElClasses.Text!;
		const regexp = new RegExp(`<color:${index}>`, 'i');
		const update = (element: UINodeShape): void => {
			if (element instanceof TextElement && regexp.test(element.content)) {
				element.printer.reset();
				UIEngine.requestRendering!.call(this);
			}
			const children = element.children;
			const length = children.length;
			for (let i = 0; i < length; i++) {
				update(children[i]);
			}
		};
		const root = getUIStore().root as UIRootApi | null;
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
		const update = (elements: UINodeShape[]): void => {
			for (const element of elements) {
				if (element instanceof uiElClasses.Reference!) {
					element.update();
				} else {
					update(element.children);
				}
			}
		};
		update((getUIStore().root as UIRootApi | null)?.children ?? []);
	}
};

const updateElement = function (this: UIShape, target: UINodeShape) {
	// `nodes` / `root` 都已迁到 store（`ui-file.ts` 里写入），`this.nodes` 是 `undefined`
	// —— `.includes` 会直接抛（2026-09-18）。
	let nodes: UINodeShape[] = [];
	let instance;
	const rootNodes = getUIStore().nodes as UINodeShape[] | null;
	const root = getUIStore().root as UIRootApi | null;
	if (rootNodes?.includes(target)) {
		nodes = rootNodes;
		instance = root;
	} else {
		/**
		 * 查找时**实际用到**的节点面：`children` 用于递归下钻，`instance` 用于回传。
		 *
		 * 第 145 轮：原先把「合成的根包装对象」`{ instance: root, children: rootNodes ?? [] }`
		 * 断言成 `UINodeShape`（还得走 `unknown`）—— 而它**根本不是**一个节点：没有 `class`、
		 * 也没有序列化成员，只是为了把 store 的 root 与 nodes 凑成一次查找的入口。
		 * 按读点收成这个局部形状之后，包装对象与递归用的真实节点都能传进来（断言消失）——
		 * 与 `SceneAnimateThis` / `SceneSelectionThis` 是同一手法。
		 */
		type FindNode = { children: UINodeShape[]; instance?: UIRootApi | null };
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
		instance.appendChildTo(target.instance, nodes.indexOf(target));
	}
	UIEngine.requestRendering!.call(this);
};

const deleteElement = function (this: UIShape, target: UINodeShape) {
	target.instance.remove();
	target.instance.destroy();
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
		// 调整居中组件的位置 const width = nRect.right - iRect.right if (head.width !== width) { head.width = width const [start, center, end] = head.children end.style.marginLeft = '0' const sRect = start.rect() const cRect = center.rect() const eRect = end.rect() const spacing = eRect.left - sRect.right - cRect.width const difference = sRect.right - nRect.left - eRect.width const margin = Math.min(spacing, difference) end.style.marginLeft = `${margin}px` }
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
		// `root` 已迁到 store（`ui-file.ts` 里写入），`this.root` 是 `undefined`
		// ⇒ `Cannot read properties of undefined (reading 'resize')`（2026-09-18）。
		(getUIStore().root as UIRootApi | null)?.resize();
		this.marquee.resize();
		this.screen.updateScrollbars();
	}
};

/**
 * 本域提供的 18 个成员（第 ④-3 步：域模块只**提供**成员对象，装配见 `ui-members.ts`）。
 *
 * 本轮**只搬声明、不动函数体**（与第 173 轮 `ui-list` 同一策略）：体内 `UI.x` 原地保留 ⇒
 * 行为逐字不变、零风险；`import { UI }` 暂时保留（伴随判据因此仍记 5，如实）。
 * 走完全程（体内改 `this.` / 入口传参 + 删 import）见 PHASE 手法库 #47。
 */
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
