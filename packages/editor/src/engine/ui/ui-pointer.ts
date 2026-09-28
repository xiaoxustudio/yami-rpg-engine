import { UI } from './ui-singleton.ts';
import type { UIElementInstance } from '@app/engine/ui/element-classes.ts';
import type { UIShape, UINodeShape, UIPointerEvent, UIDragEvent } from './ui-singleton.ts';
// ④-2b（第 112 轮）：本文件里「以 UI 为接收者」的引擎调用改为直连 UIEngine（接收者仍显式传）。
import { UIEngine } from './ui-engine.ts';
import type { GlobalClipboardHost } from '@app/utils/clipboard';
import { GlobalClipboard } from '@app/utils/clipboard';
import { getRelativeCoords, relate } from '@app/utils/element-utils.ts';
import { Cursor } from '@app/composables/usePointerObjectWindow';
import { ctrl, isDragKey } from '@app/utils/event-accessors';
import { getYamiI18n } from '@app/i18n';

const t = (key: string, named?: Record<string, unknown>) =>
	getYamiI18n().global.t(key, named ?? {});
import { Menu } from '@app/components/menu-list.ts';
import { Reference } from '@app/log/related-references.ts';
import { GL } from '@app/engine/webgl/webgl-init.ts';
import { Matrix } from '@app/engine/webgl/matrix2.ts';
import { getUIStore } from '@app/stores/ui';
import { radians, degrees, modRadians } from '@app/utils/math';

const selectObject = (function IIFE() {
	/**
	 * 在**实例树**里由外向内命中测试，命中就返回该实例对应的**节点数据**（调用方要的是 `target` 节点）。
	 *
	 * 形参是实例数组、不是节点数组：`element.visible` / `element.node` / `element.isPointIn`
	 * 三样都长在**实例**上（`element-base.ts`），第二句 `element.node.instance === element`
	 * 正是「这个实例是它节点的主实例」的自证。此前写 `UINodeShape[]` 是靠索引签名成立的。
	 */
	const find = (elements: UIElementInstance[], x: number, y: number): UINodeShape | null => {
		const length = elements.length;
		for (let i = length - 1; i >= 0; i--) {
			const element = elements[i];
			const target = find(element.children, x, y);
			if (target) return target;
			if (
				element.visible &&
				element.node?.instance === element &&
				!element.node.locked &&
				element.isPointIn(x, y)
			) {
				// `element.node` 必存在：上面那句 `element.node?.instance === element` 已经把它证明出来了
				// （实例的 `node` 由 `ui-prefab.ts:94` 的 `instance.node = node` 挂上，只有 `node` 存在
				// 才谈得上相等），这里改用 `!` 而不是 `?.`，避免把「命中却返回 null」这种静默失效写进类型。
				return element.node!;
			}
		}
		return null;
	};
	return function (this: UIShape, x: number, y: number) {
		// ⚠️ `root` 已迁到 store（`ui-file.ts` 的 `getUIStore().root = this.root`），
		// 遗留的 `this.root` 是 `undefined` —— 读 `.children` 直接抛
		// `Cannot read properties of undefined (reading 'children')`，
		// 表现就是「**在画布上点选毫无反应**，但从左侧列表点选正常」
		// （列表走 `UI.listSelect`，不经过这里）（2026-09-18 实测定位）。
		// `root` 的类型本来就是 `UIElementInstance | null`（`stores/ui.ts` 的 `root`），
		// 原先那处 `as { children: UINodeShape[] }` 是索引签名时代的断言，本轮去掉。
		const root = getUIStore().root;
		if (root === null) return null;
		return find(root.children, x, y);
	};
})();

const marqueePointerdown = function (this: UIShape, event: UIPointerEvent) {
	if (this.dragging) {
		return;
	}
	switch (event.button) {
		case 0: {
			if (isDragKey(event)) {
				this.dragging = event as UIDragEvent;
				event.mode = 'scroll';
				event.scrollLeft = this.screen.scrollLeft;
				event.scrollTop = this.screen.scrollTop;
				Cursor.open!('cursor-grab');
				window.addEventListener('pointerup', this.pointerup!);
				window.addEventListener('pointermove', this.pointermove!);
				return;
			}
			const target = getUIStore().target;
			if (this.controlPointActive && target) {
				const { transform } = target;
				const points = this.controlPoints!;
				this.dragging = event as UIDragEvent;
				switch (this.controlPointActive) {
					case points.rotate.TL:
					case points.rotate.TR:
					case points.rotate.BL:
					case points.rotate.BR: {
						// 当前选中的节点必已装配（同 `element-classes.ts` 顶部那条不变式）⇒ `instance` 存在。
						const instance = target.instance!;
						const matrix = Matrix.instance.set(UI.matrix).multiply(instance.matrix);
						const X = instance.x + instance.width * transform.anchorX;
						const Y = instance.y + instance.height * transform.anchorY;
						const a = matrix[0];
						const b = matrix[1];
						const c = matrix[3];
						const d = matrix[4];
						const e = matrix[6];
						const f = matrix[7];
						const ax = a * X + c * Y + e;
						const ay = b * X + d * Y + f;
						const { x, y } = getRelativeCoords(event, GL.canvas);
						const dpr = window.devicePixelRatio;
						event.mode = 'object-rotate';
						event.absoluteAnchorX = ax;
						event.absoluteAnchorY = ay;
						event.lastAngle = Math.atan2(y * dpr - ay, x * dpr - ax);
						event.rotationRadians = 0;
						event.startRotation = transform.rotation;
						break;
					}
					case points.resize.T:
					case points.resize.L:
					case points.resize.R:
					case points.resize.B:
					case points.resize.TL:
					case points.resize.TR:
					case points.resize.BL:
					case points.resize.BR:
						event.mode = 'object-resize';
						event.startWidth = transform.width;
						event.startHeight = transform.height;
						break;
				}
				window.addEventListener('pointerup', this.pointerup!);
				window.addEventListener('pointermove', this.pointermove!);
				return;
			}
			const { x, y } = UIEngine.getPointerCoords!.call(this, event);
			let object;
			if ((event.ctrlKey || event.metaKey) && getUIStore().target) {
				object = getUIStore().target;
			}
			if (object === undefined) {
				object = this.selectObject!(x, y);
			}
			if (object) {
				this.dragging = event as UIDragEvent;
				event.mode = 'object-move';
				event.node = object;
				event.enabled = false;
				event.startX = object.transform.x;
				event.startY = object.transform.y;
				window.addEventListener('pointerup', this.pointerup!);
				window.addEventListener('pointermove', this.pointermove!);
				UIEngine.requestRendering!.call(this);
			}
			this.setTarget!(object);
			break;
		}
		case 2:
			this.dragging = event as UIDragEvent;
			event.mode = 'ready-to-scroll';
			event.scrollLeft = this.screen.scrollLeft;
			event.scrollTop = this.screen.scrollTop;
			window.addEventListener('pointerup', this.pointerup!);
			window.addEventListener('pointermove', this.pointermove!);
			break;
	}
}.bind(UI);

const marqueePointermove = function (this: UIShape, event: UIPointerEvent) {
	if (!this.dragging) {
		this.marquee.pointerevent = event;
		const { x, y } = UIEngine.getPointerCoords!.call(this, event);
		if (getUIStore().target) {
			const point = UIEngine.selectControlPoint!.call(this, x, y);
			if (point) {
				this.setHover!(null);
				UIEngine.setControlPoint!.call(this, point);
				return;
			}
		}
		if (this.controlPointActive) {
			UIEngine.setControlPoint!.call(this, null);
		}
		const object = this.selectObject!(x, y);
		this.setHover!(object);
	}
}.bind(UI);

const marqueePointerleave = function (this: UIShape, _event: UIPointerEvent) {
	if (this.marquee.pointerevent) {
		this.marquee.pointerevent = null;
		this.setHover!(null);
	}
}.bind(UI);

const marqueeDoubleclick = function (this: UIShape, _event: UIPointerEvent) {
	if (getUIStore().target) {
		this.screenBlur!();
		this.revealTarget!();
	}
}.bind(UI);

const pointerup = function (this: UIShape, event?: UIPointerEvent) {
	const { dragging } = this;
	if (dragging === null) {
		return;
	}
	if (event === undefined) {
		event = dragging;
	}
	if (dragging && relate(dragging, event)) {
		switch (dragging.mode) {
			case 'object-rotate':
			case 'object-resize':
				break;
			case 'object-move':
				UIEngine.requestRendering!.call(this);
				break;
			case 'ready-to-scroll':
				if (event!.target === this.marquee) {
					const { x, y } = UIEngine.getPointerCoords!.call(this, event!);
					const object = this.selectObject!(x, y);
					this.setTarget!(object);
					this.menuPopup!(event!);
				}
				break;
			case 'scroll':
				this.screen.endScrolling();
				Cursor.close!('cursor-grab');
				break;
		}
		this.dragging = null;
		window.removeEventListener('pointerup', this.pointerup!);
		window.removeEventListener('pointermove', this.pointermove!);
	}
}.bind(UI);

const pointermove = function (this: UIShape, event: UIPointerEvent) {
	const { dragging } = this;
	if (dragging && relate(dragging, event)) {
		const dpr = window.devicePixelRatio;
		switch (dragging.mode) {
			case 'object-rotate': {
				const target = getUIStore().target;
				if (target) {
					const { x, y } = getRelativeCoords(event, GL.canvas);
					const distX = x * dpr - dragging.absoluteAnchorX;
					const distY = y * dpr - dragging.absoluteAnchorY;
					const currentAngle = Math.atan2(distY, distX);
					const angle = modRadians(currentAngle - dragging.lastAngle);
					dragging.rotationRadians += angle < Math.PI ? angle : angle - Math.PI * 2;
					let rotation = Math.round(
						dragging.startRotation + degrees(dragging.rotationRadians)
					);
					if (event.shiftKey) {
						rotation = Math.round(rotation / 15) * 15;
					}
					const transform = target.transform;
					if (transform.rotation !== rotation) {
						UIEngine.rotateTarget!.call(this, rotation);
					}
					dragging.lastAngle = currentAngle;
				}
				break;
			}
			case 'object-resize': {
				const target = getUIStore().target;
				if (target) {
					// 同上面 rotate 分支：选中的节点必已装配。
					const instance = target.instance!;
					// 父元素非空也是不变式：能选中就说明它在画布树里，而树里除根实例外都有父元素
					// （根实例本身不可选）—— 缩放要用父元素的宽高做百分比换算。
					const parent = instance.parent!;
					const { transform } = instance;
					const points = this.controlPoints!;
					const point = this.controlPointActive!;
					const angle = radians(point.angle + this.controlPointRotation);
					const distX = ((event.clientX - dragging.clientX) * dpr) / this.scaleX;
					const distY = ((event.clientY - dragging.clientY) * dpr) / this.scaleY;
					const dist = Math.sqrt(distX ** 2 + distY ** 2);
					const distAngle = Math.atan2(distY, distX);
					const scaleX = Math.abs(transform.scaleX) || 1;
					const scaleY = Math.abs(transform.scaleY) || 1;
					let width = undefined;
					let height = undefined;
					switch (point) {
						case points.resize.T:
						case points.resize.L:
						case points.resize.R:
						case points.resize.B: {
							const offset = dist * Math.cos(distAngle - angle);
							switch (point) {
								case points.resize.T:
								case points.resize.B:
									height = offset / scaleY;
									break;
								case points.resize.L:
								case points.resize.R:
									width = offset / scaleX;
									break;
							}
							break;
						}
						case points.resize.TL:
						case points.resize.TR:
						case points.resize.BL:
						case points.resize.BR:
							if (event.shiftKey) {
								const rectWidth =
									dragging.startWidth + parent.width * transform.width2;
								const rectHeight =
									dragging.startHeight + parent.height * transform.height2;
								const aspectAngle = Math.atan2(rectHeight, rectWidth);
								let startAngle!: number;
								switch (point) {
									case points.resize.TL:
									case points.resize.BR:
										startAngle = angle - Math.PI / 4 + aspectAngle;
										break;
									case points.resize.TR:
									case points.resize.BL:
										startAngle = angle + Math.PI / 4 - aspectAngle;
										break;
								}
								const includedAngle = distAngle - startAngle;
								const offset = dist * Math.cos(includedAngle);
								const offsetX = offset * Math.cos(aspectAngle);
								const offsetY = offset * Math.sin(aspectAngle);
								width = offsetX / scaleX;
								height = offsetY / scaleY;
							} else {
								const startAngle = angle - Math.PI / 4;
								const includedAngle = distAngle - startAngle;
								const offsetX = dist * Math.cos(includedAngle);
								const offsetY = dist * Math.sin(includedAngle);
								switch (point) {
									case points.resize.TL:
									case points.resize.BR:
										width = offsetX / scaleX;
										height = offsetY / scaleY;
										break;
									case points.resize.TR:
									case points.resize.BL:
										width = offsetY / scaleY;
										height = offsetX / scaleX;
										break;
								}
							}
							break;
					}
					if (width !== undefined) {
						const minWidth = -Math.ceil(parent.width * transform.width2);
						width = Math.max(Math.round(dragging.startWidth + width), minWidth);
					}
					if (height !== undefined) {
						const minHeight = -Math.ceil(parent.height * transform.height2);
						height = Math.max(Math.round(dragging.startHeight + height), minHeight);
					}
					if (
						(width !== undefined && transform.width !== width) ||
						(height !== undefined && transform.height !== height)
					) {
						UIEngine.resizeTarget!.call(this, width, height);
					}
				}
				break;
			}
			case 'object-move': {
				const target = getUIStore().target;
				if (!dragging.enabled) {
					const distX = event.clientX - dragging.clientX;
					const distY = event.clientY - dragging.clientY;
					if (
						Math.sqrt(distX ** 2 + distY ** 2) > 4 ||
						event.timeStamp - dragging.timeStamp >= 500
					) {
						dragging.enabled = true;
					} else {
						break;
					}
				}
				if (target) {
					const transform = target.transform;
					const distX = ((event.clientX - dragging.clientX) * dpr) / this.scaleX;
					const distY = ((event.clientY - dragging.clientY) * dpr) / this.scaleY;
					let x;
					let y;
					if (event.shiftKey) {
						const angle = Math.atan2(distY, distX);
						const directions = 4;
						const proportion = modRadians(angle) / (Math.PI * 2);
						const section = (proportion * directions + 0.5) % directions;
						switch (Math.floor(section)) {
							case 0:
							case 2:
								x = Math.round(dragging.startX + distX);
								y = dragging.startY;
								break;
							case 1:
							case 3:
								x = dragging.startX;
								y = Math.round(dragging.startY + distY);
								break;
						}
					} else {
						x = Math.round(dragging.startX + distX);
						y = Math.round(dragging.startY + distY);
					}
					if (transform.x !== x || transform.y !== y) {
						// `!` 的理由：`x` / `y` 在两个分支里**都必然被赋值** ——
						// `section = (proportion * 4 + 0.5) % 4 ∈ [0, 4)` ⇒ `Math.floor(section)` 只可能是
						// 0/1/2/3，而上面那四个 `case` 全覆盖（0/2 写一组、1/3 写另一组）。
						// `tsc` 看不到 `%` 的值域，所以这里用可见的 `!` 写下这条前提（运行期一行未改）。
						UIEngine.shiftTarget!.call(this, x!, y!);
					}
				}
				break;
			}
			case 'ready-to-scroll': {
				const distX = event.clientX - dragging.clientX;
				const distY = event.clientY - dragging.clientY;
				this.screen.setScroll(dragging.scrollLeft - distX, dragging.scrollTop - distY);
				if (Math.sqrt(distX ** 2 + distY ** 2) > 4) {
					dragging.mode = 'scroll';
					Cursor.open!('cursor-grab');
				}
				break;
			}
			case 'scroll': {
				const distX = event.clientX - dragging.clientX;
				const distY = event.clientY - dragging.clientY;
				this.screen.beginScrolling();
				this.screen.setScroll(dragging.scrollLeft - distX, dragging.scrollTop - distY);
				break;
			}
		}
	}
}.bind(UI);

const menuPopup = function (this: UIShape, event: UIPointerEvent) {
	this.translationKeyup!();
	const { x, y } = UIEngine.getPointerCoords!.call(this, event);
	const target = getUIStore().target;
	const selected = !!target;
	const pastable = (GlobalClipboard as GlobalClipboardHost).has('yami.ui.object');
	const get = (key: string) => t('menuUIList.' + key);
	const items = [
		{
			label: get('create'),
			submenu: [
				{
					label: get('create.image'),
					click: () => {
						this.create!('image', x, y);
					}
				},
				{
					label: get('create.text'),
					click: () => {
						this.create!('text', x, y);
					}
				},
				{
					label: get('create.textBox'),
					click: () => {
						this.create!('textbox', x, y);
					}
				},
				{
					label: get('create.dialogBox'),
					click: () => {
						this.create!('dialogbox', x, y);
					}
				},
				{
					label: get('create.progressBar'),
					click: () => {
						this.create!('progressbar', x, y);
					}
				},
				{
					label: get('create.button'),
					click: () => {
						this.create!('button', x, y);
					}
				},
				{
					label: get('create.animation'),
					click: () => {
						this.create!('animation', x, y);
					}
				},
				{
					label: get('create.video'),
					click: () => {
						this.create!('video', x, y);
					}
				},
				{
					label: get('create.window'),
					click: () => {
						this.create!('window', x, y);
					}
				},
				{
					label: get('create.container'),
					click: () => {
						this.create!('container', x, y);
					}
				},
				{
					label: get('create.reference'),
					click: () => {
						this.create!('reference', x, y);
					}
				},
				{
					label: get('create.shortcut'),
					enabled: selected && target.class !== 'reference',
					click: () => {
						this.createShortcut!(target!);
					}
				},
				UI.createPrefabItem!(null, x, y)
			]
		},
		{
			label: get('toggle'),
			accelerator: '/',
			enabled: selected,
			click: () => {
				this.toggle!();
			}
		},
		{
			type: 'separator'
		},
		{
			label: get('cut'),
			accelerator: ctrl('X'),
			enabled: selected,
			click: () => {
				this.copy!();
				this.delete!();
			}
		},
		{
			label: get('copy'),
			accelerator: ctrl('C'),
			enabled: selected,
			click: () => {
				this.copy!();
			}
		},
		{
			label: get('paste'),
			accelerator: ctrl('V'),
			enabled: pastable,
			click: () => {
				this.paste!(x, y);
			}
		},
		{
			label: get('duplicate'),
			accelerator: ctrl('D'),
			enabled: selected,
			click: () => {
				this.duplicate!();
			}
		},
		{
			label: get('delete'),
			accelerator: 'Delete',
			enabled: selected,
			click: () => {
				this.delete!();
			}
		},
		{
			label: get('copy-id'),
			enabled: selected,
			click: () => {
				void navigator.clipboard.writeText(target!.presetId);
			}
		},
		{
			label: get('find-references'),
			enabled: selected,
			click: () => {
				Reference.openRelated!(target!.presetId);
			}
		}
	];
	if (selected) {
		if (!UI.hasPrefab!(target)) {
			items.push({
				label: get('set-as-prefab'),
				enabled: target.class !== 'reference',
				click: () => {
					UI.setAsPrefab!(target);
				}
			});
		} else {
			items.push({
				label: get('unset-as-prefab'),
				enabled: target.class !== 'reference',
				click: () => {
					UI.unsetAsPrefab!(target);
				}
			});
		}
	}
	Menu.popup!(
		{
			x: event.clientX,
			y: event.clientY
		},
		items
	);
};

/**
 * 本域提供的 8 个成员（第 ④-3 步：域模块只**提供**成员对象，装配见 `ui-members.ts`）。
 *
 * 本轮**只搬声明、不动函数体**（同第 173/179/182 轮）：体内 `UI.x` 原地保留 ⇒ 行为逐字不变、
 * 零风险（本域的挂载经 `on()` 注册 ⇒ 运行期 `this` 是**元素**，见 PHASE 手法库 #45，
 * 所以这一步**更不能**顺手把体内 `UI.` 改成 `this.`）。
 */
export const uiPointerMembers = {
	selectObject: selectObject,
	marqueePointerdown: marqueePointerdown,
	marqueePointermove: marqueePointermove,
	marqueePointerleave: marqueePointerleave,
	marqueeDoubleclick: marqueeDoubleclick,
	pointerup: pointerup,
	pointermove: pointermove,
	menuPopup: menuPopup
};
