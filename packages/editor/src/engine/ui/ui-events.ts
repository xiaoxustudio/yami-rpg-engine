import { screenScrollData } from '@app/engine/screen-scroll-data';
import { UI } from './ui-singleton.ts';
import type { UIShape } from './ui-singleton.ts';
import { UIEngine } from './ui-engine.ts';
import { File } from '@app/file/file-system-core.ts';
import { Inspector } from '@app/inspector/inspector.ts';
import { registerWindowKeydown } from '@app/tools/window-keydown-registry';
import { hasClass, read } from '@app/utils/element-utils.ts';
import { StageColor, safeHex } from '@app/utils/stage-color';
import { getUIStore } from '@app/stores/ui';
import { roundTo } from '@app/utils/math';

const switchSettings = function (this: UIShape) {
	if (!hasClass(Inspector.fileUI.button, 'selected')) {
		Inspector.open!('fileUI', UI);
	} else {
		Inspector.close!();
	}
};

const planToSave = function (this: UIShape) {
	File.planToSave!(this.meta);
};

/**
 *
 * 依据是**调用方今天就在传什么**：唯一调用方是 `stores/ui.ts`（它自己声明 `Record<string, unknown>`），
 * 而那份 config 来自 `config.json` 的解析结果（`EditorConfigShape.colors`）——**不可信的 JSON**，
 * 任何值类型都可能出现。契约写 `string` 只是让 `services/project/config.ts` 的
 * `as { colors: Record<string, string> }` 顶住，而实现**本来就必须自己判类型**
 * （`safeHex` 的第一句就是 `typeof value !== 'string' ⇒ fallback`）。
 * ⇒ 写成 `unknown` 不是放松，而是把"值未经校验"这件事如实写下来，并把归一化的责任放回实现里。
 */
const saveToConfig = function (this: UIShape, config: { colors: Record<string, unknown> }) {
	// 真源是 store 的 `background` / `foreground`（`ui-engine.ts` 的 `drawBackground` 也读它，
	// 菜单栏改色走的也是 `getUIStore().background`）。`this.background` 是遗留单例上的**影子副本**，
	// 只在 `UI.loadFromConfig` 里建一次，所以它既可能**根本不存在**，也可能停在**开机时的旧值**：
	//
	//   `primeWindows` 不再预热 `'ui'` 槽位，`main/initialize.ts` 的 `loadConfig()` 执行时
	//   `UI.loadFromConfig` 取到 undefined，`stores/ui.ts` 那句 `UI?.loadFromConfig?.(…)`
	//   **不报错地什么也没做**（代理不为 null，`?.` 挡不住），于是这里读 `this.background.hex`
	//   抛 `Cannot read properties of undefined (reading 'hex')`，并连带让
	//   `services/project/config.ts` 的整条 `saveConfig` 中断（后续配色保存与 config.json 落盘都不执行）；
	// - 旧值：改色只写 store，影子副本不跟随 ⇒ 采信它会把本次会话的配色改动写回开机时的值。
	//
	// 故一律以 store 为准，遗留字段仅作 store 取不到时的兜底；两者都没有时保持 config 原值不动。
	const store = getUIStore();
	const background = store.background ?? this.background;
	const foreground = store.foreground ?? this.foreground;
	if (background) config.colors.uiBackground = background.hex;
	if (foreground) config.colors.uiForeground = foreground.hex;
};

const loadFromConfig = function (this: UIShape, config: { colors: Record<string, unknown> }) {
	// `background` / `foreground` 的真源是 store 的 `loadFromConfig`（见 `stores/ui.ts`），
	// 这里只维护遗留单例上的那一份，给仍读 `this.background` 的遗留/插件路径用
	// （`saveToConfig` 已改为读 store，不再依赖它是否被调用到——见上面的说明）。
	//
	// 这条规则此前只有 store 侧有（`safeHex`），于是同一个 config 在这里会造出一份 alpha 为 NaN
	// 的影子副本 —— 索引签名与 `Record<string, string>` 一起把这件事挡了几十轮。
	// 契约改成 `unknown` 之后，这一处**不再是可选的**：类型说"值未校验"，实现就得校验。
	this.background = new StageColor(safeHex(config.colors.uiBackground, '00000000'), () =>
		UIEngine.requestRendering!.call(this)
	);
	this.foreground = new StageColor(safeHex(config.colors.uiForeground, '000000ff'), () => {
		if (getUIStore().state === 'open') {
			// `root` 已迁到 store；`this.root` 是 `undefined`（2026-09-18）。
			getUIStore().root?.resize();
			UIEngine.requestRendering!.call(this);
		}
	});
};

const saveToProject = function (
	this: UIShape,
	project: { ui: { zoom?: number } & Record<string, unknown>; uiPrefabs?: string[] }
) {
	const { ui, uiPrefabs } = project;
	ui.zoom = getUIStore().zoom ?? ui.zoom;
	UI.clearInvalidPrefabs!(uiPrefabs ?? []);
};

const loadFromProject = function (this: UIShape, project: { ui: { zoom: number } }) {
	const { ui } = project;
	UIEngine.setZoom!.call(this, ui.zoom);
};

const webglRestored = function (this: UIShape, _event: Event) {
	if (getUIStore().state === 'open') {
		UIEngine.requestRendering!.call(UI);
	}
};

const windowResize = function (this: UIShape, _event: Event) {
	this.updateHead!();
	if (getUIStore().state === 'open') {
		this.resize!();
		UIEngine.updateCamera!.call(this);
		UIEngine.requestRendering!.call(this);
	}
}.bind(UI);

const themechange = function (this: UIShape, _event: Event) {
	UIEngine.requestRendering!.call(this);
}.bind(UI);

const localizationchange = function (this: UIShape, _event: Event) {
	this.updateAllTexts!();
}.bind(UI);

const keydown = function (this: UIShape, event: KeyboardEvent) {
	if (getUIStore().state === 'open' && UI.dragging === null) {
		if (event.ctrlKey || event.metaKey) {
			return;
		} else if (event.altKey) {
			switch (event.code) {
				case 'KeyS':
					UI.switchSettings!();
					break;
			}
		} else {
			return;
		}
	}
};

registerWindowKeydown('ui', UI.keydown!);

const headPointerdown = function (this: UIShape, event: PointerEvent) {
	if (!(event.target instanceof HTMLInputElement)) {
		event.preventDefault();
		if (document.activeElement !== UI.screen) {
			UI.screen.focus();
		}
	}
};

const switchPointerdown = function (this: UIShape, event: PointerEvent) {
	switch (event.button) {
		case 0: {
			const element = event.target as HTMLElement;
			if (hasClass(element, 'item')) {
				switch (element.getAttribute('value')) {
					case 'settings':
						return UI.switchSettings!();
				}
			}
			break;
		}
	}
};

const shortcutPointerdown = function (this: UIShape, event: PointerEvent) {
	switch (event.button) {
		case 0: {
			const element = event.target as HTMLElement;
			if (hasClass(element, 'item')) {
				UI.create!(element.getAttribute('value')!, 0, 0);
			}
			break;
		}
	}
};

const zoomFocus = function (this: UIShape, _event: Event) {
	UI.screen.focus();
};

const zoomInput = function (this: UIShape, _event: Event & { value?: number }) {
	UIEngine.setZoom!.call(UI, read(this));
};

const screenKeydown = function (this: UIShape, event: KeyboardEvent) {
	if (getUIStore().state === 'open' && this.dragging === null) {
		if (event.ctrlKey || event.metaKey) {
			switch (event.code) {
				case 'KeyX':
					this.copy!();
					this.delete!();
					return;
				case 'KeyC':
					this.copy!();
					return;
				case 'KeyV':
					this.paste!();
					return;
				case 'KeyD':
					this.duplicate!();
					return;
				case 'ArrowLeft':
				case 'ArrowUp':
				case 'ArrowRight':
				case 'ArrowDown':
					break;
				default:
					return;
			}
		}
		if (event.altKey) {
			return;
		}
		switch (event.code) {
			case 'Enter':
			case 'NumpadEnter':
				this.revealTarget!();
				break;
			case 'Slash':
				this.toggle!();
				break;
			case 'Delete':
				this.delete!();
				break;
			case 'Escape':
				this.setTarget!(null);
				break;
			case 'KeyA':
				if ((this.translationKey & 0b0001) === 0) {
					this.translationKey |= 0b0001;
					this.translationTimer!.add();
					this.screen.beginScrolling();
					window.addEventListener('keyup', this.translationKeyup!);
				}
				break;
			case 'KeyW':
				if ((this.translationKey & 0b0010) === 0) {
					this.translationKey |= 0b0010;
					this.translationTimer!.add();
					this.screen.beginScrolling();
					window.addEventListener('keyup', this.translationKeyup!);
				}
				break;
			case 'KeyD':
				if ((this.translationKey & 0b0100) === 0) {
					this.translationKey |= 0b0100;
					this.translationTimer!.add();
					this.screen.beginScrolling();
					window.addEventListener('keyup', this.translationKeyup!);
				}
				break;
			case 'KeyS':
				if ((this.translationKey & 0b1000) === 0) {
					this.translationKey |= 0b1000;
					this.translationTimer!.add();
					this.screen.beginScrolling();
					window.addEventListener('keyup', this.translationKeyup!);
				}
				break;
			case 'ArrowLeft':
			case 'ArrowUp':
			case 'ArrowRight':
			case 'ArrowDown':
				if (getUIStore().target !== null) {
					event.preventDefault();
					const transform = getUIStore().target!.transform;
					let offsetX = 0;
					let offsetY = 0;
					switch (event.code) {
						case 'ArrowLeft':
							offsetX = -1;
							break;
						case 'ArrowUp':
							offsetY = -1;
							break;
						case 'ArrowRight':
							offsetX = +1;
							break;
						case 'ArrowDown':
							offsetY = +1;
							break;
					}
					if (event.ctrlKey || event.metaKey) {
						const ax = roundTo(transform.anchorX - offsetX * 0.5, 4);
						const ay = roundTo(transform.anchorY - offsetY * 0.5, 4);
						return UIEngine.shiftAnchor!.call(this, ax, ay);
					}
					if (event.shiftKey) {
						offsetX *= 10;
						offsetY *= 10;
					}
					const x = roundTo(transform.x + offsetX, 4);
					const y = roundTo(transform.y + offsetY, 4);
					UIEngine.shiftTarget!.call(this, x, y);
				}
				break;
			case 'Minus':
			case 'NumpadSubtract':
				UIEngine.setZoom!.call(this, getUIStore().zoom! - 1);
				break;
			case 'Equal':
			case 'NumpadAdd':
				UIEngine.setZoom!.call(this, getUIStore().zoom! + 1);
				break;
			case 'Digit0':
			case 'Numpad0':
				UIEngine.setZoom!.call(this, 2);
				break;
		}
	}
}.bind(UI);

const translationKeyup = function (this: UIShape, event?: KeyboardEvent) {
	if (this.translationKey === 0b0000) {
		return;
	}
	if (event === undefined) {
		this.translationKey = 0b0000;
	} else {
		switch (event.code) {
			case 'KeyA':
				this.translationKey &= 0b1110;
				break;
			case 'KeyW':
				this.translationKey &= 0b1101;
				break;
			case 'KeyD':
				this.translationKey &= 0b1011;
				break;
			case 'KeyS':
				this.translationKey &= 0b0111;
				break;
		}
	}
	if (this.translationKey === 0b0000) {
		this.translationTimer!.remove();
		this.screen.endScrolling();
		window.removeEventListener('keyup', this.translationKeyup!);
	}
}.bind(UI);

const screenWheel = function (this: UIShape, event: WheelEvent) {
	if (getUIStore().state === 'open' && this.dragging === null) {
		event.preventDefault();
		if (event.deltaY !== 0) {
			const step = event.deltaY > 0 ? -1 : 1;
			UIEngine.setZoom!.call(this, getUIStore().zoom! + step);
		}
	}
}.bind(UI);

const screenUserscroll = function (this: UIShape, _event: Event) {
	if (getUIStore().state === 'open') {
		screenScrollData(this.screen).rawScrollLeft = this.screen.scrollLeft;
		screenScrollData(this.screen).rawScrollTop = this.screen.scrollTop;
		UIEngine.updateTransform!.call(this);
		UIEngine.requestRendering!.call(this);
		this.marquee.resize();
		this.screen.updateScrollbars();
	}
}.bind(UI);

const screenBlur = function (this: UIShape, _event: FocusEvent) {
	this.translationKeyup!();
	this.pointerup!();
	// this.marqueePointerleave!()
}.bind(UI);

/**
 *
 * 本轮**只搬声明、不动函数体**（同第 173/179/182 轮）：体内 `UI.x` 原地保留 ⇒ 行为逐字不变、
 * 零风险（本域的挂载经 `on()` 注册 ⇒ 运行期 `this` 是**元素**，见 PHASE 手法库 #45，
 * 所以这一步**更不能**顺手把体内 `UI.` 改成 `this.`）。
 */
export const uiEventsMembers = {
	switchSettings: switchSettings,
	planToSave: planToSave,
	saveToConfig: saveToConfig,
	loadFromConfig: loadFromConfig,
	saveToProject: saveToProject,
	loadFromProject: loadFromProject,
	webglRestored: webglRestored,
	windowResize: windowResize,
	themechange: themechange,
	localizationchange: localizationchange,
	keydown: keydown,
	headPointerdown: headPointerdown,
	switchPointerdown: switchPointerdown,
	shortcutPointerdown: shortcutPointerdown,
	zoomFocus: zoomFocus,
	zoomInput: zoomInput,
	screenKeydown: screenKeydown,
	translationKeyup: translationKeyup,
	screenWheel: screenWheel,
	screenUserscroll: screenUserscroll,
	screenBlur: screenBlur
};
