import { macRedoKey } from '@app/utils/event-accessors';

/**
 * 快捷键**注册表**（`ShortcutRegistry` / `bindShortcutStore`）已于 2026-09-21 移除。
 *
 * 原来的形状是「`stores/tool.ts` 用 `bindShortcutStore()` 把 store 的方法绑进来，
 * `ShortcutRegistry.register/get` 转发过去」。实测全仓：
 *
 *   - `stores/tool.ts` 的**唯一** import 者是它自己的 spec（`stores/__tests__/tool-state.spec.ts`）
 *     ⇒ 生产代码里 `bindShortcutStore` 从未被调用 ⇒ `shortcutStore` 恒为 `null`
 *     ⇒ `register()` 是 **no-op**、`get()` 恒为 `undefined`；
 *   - `ShortcutRegistry.register/get` 的调用者也只有那个 spec。
 *
 * 也就是说这个「注册表」在生产里从来没有任何一次读写 —— 而它的 spec 之所以是绿的，
 * 正是因为**它 import 了 `stores/tool.ts`、自己触发了那次绑定**（自证循环）。
 * 属本仓「不要留成死状态」的典型：删掉比留着更诚实。需要时从 git 历史取回。
 *
 * 下面这些 `createXxx` 工厂**不是**注册表的一部分，它们被 `keyboard-events.ts` /
 * `attribute-window.ts` / `enum-window.ts` / `local-window.ts` 直接使用 —— 保留。
 */

export const Shortcuts = {
	createClipboard(target: {
		copy?: () => void;
		paste?: () => void;
		cut?: () => void;
		duplicate?: () => void;
		selectAll?: () => void;
	}) {
		return function (event: Event) {
			if ((event as KeyboardEvent).ctrlKey || (event as KeyboardEvent).metaKey) {
				switch ((event as KeyboardEvent).code) {
					case 'KeyC':
						if (target.copy) {
							target?.copy?.();
						}
						return true;
					case 'KeyV':
						if (target.paste) {
							target?.paste?.();
						}
						return true;
					case 'KeyX':
						if (target.cut) {
							target?.cut?.();
						}
						return true;
					case 'KeyD':
						if (target.duplicate) {
							target?.duplicate?.();
						}
						return true;
					case 'KeyA':
						if (target.selectAll) {
							target?.selectAll?.();
						}
						return true;
				}
			}
			return false;
		};
	},

	createUndoRedo(target: { undo?: () => void; redo?: () => void }) {
		return function (event: Event) {
			if ((event as KeyboardEvent).ctrlKey || (event as KeyboardEvent).metaKey) {
				switch ((event as KeyboardEvent).code) {
					case 'KeyZ':
						if (!macRedoKey(event as KeyboardEvent) && target.undo) {
							target?.undo?.();
						}
						return true;
					case 'KeyY':
						if (target.redo) {
							target?.redo?.();
						}
						return true;
				}
			}
			return false;
		};
	},

	createListOps(target: {
		copy?: () => void;
		paste?: () => void;
		cut?: () => void;
		duplicate?: () => void;
		selectAll?: () => void;
		undo?: () => void;
		redo?: () => void;
		insert?: () => void;
		cancelSearch?: () => void;
		delete?: () => void;
	}) {
		return function (event: Event) {
			if ((event as KeyboardEvent).ctrlKey || (event as KeyboardEvent).metaKey) {
				switch ((event as KeyboardEvent).code) {
					case 'KeyC':
						if (target.copy) {
							target?.copy?.();
						}
						return true;
					case 'KeyV':
						if (target.paste) {
							target?.paste?.();
						}
						return true;
					case 'KeyX':
						if (target.cut) {
							target?.cut?.();
						}
						return true;
					case 'KeyD':
						if (target.duplicate) {
							target?.duplicate?.();
						}
						return true;
					case 'KeyA':
						if (target.selectAll) {
							target?.selectAll?.();
						}
						return true;
					case 'KeyZ':
						if (!macRedoKey(event as KeyboardEvent) && target.undo) {
							target?.undo?.();
						}
						return true;
					case 'KeyY':
						if (target.redo) {
							target?.redo?.();
						}
						return true;
				}
			}
			if ((event as KeyboardEvent).code === 'Insert') {
				if (target.insert) {
					target?.insert?.();
				}
				return true;
			}
			if (
				(event as KeyboardEvent).code === 'Delete' ||
				(event as KeyboardEvent).code === 'Backspace'
			) {
				if ((event as KeyboardEvent).ctrlKey || (event as KeyboardEvent).metaKey) {
					if (target.cancelSearch) {
						target?.cancelSearch?.();
					}
				} else if (target.delete) {
					target?.delete?.();
				}
				return true;
			}
			return false;
		};
	},

	createScroll(target: HTMLElement) {
		let scrollKeys = 0;
		let scrollTimer: number | null = null;

		function updateScroll() {
			if (scrollKeys === 0) {
				cancelAnimationFrame(scrollTimer!);
				scrollTimer = null;
				return;
			}
			let dx = 0;
			let dy = 0;
			if (scrollKeys & 1) dy -= 4;
			if (scrollKeys & 2) dx -= 4;
			if (scrollKeys & 4) dy += 4;
			if (scrollKeys & 8) dx += 4;
			target?.scrollBy?.(dx, dy);
			scrollTimer = requestAnimationFrame(updateScroll);
		}

		return function (event: Event) {
			if (
				(event.target as HTMLElement).tagName === 'INPUT' ||
				(event.target as HTMLElement).tagName === 'TEXTAREA'
			) {
				return false;
			}
			const key = (event as KeyboardEvent).code;
			const down = event.type === 'keydown';
			let bit = 0;
			switch (key) {
				case 'KeyW':
					bit = 1;
					break;
				case 'KeyA':
					bit = 2;
					break;
				case 'KeyS':
					bit = 4;
					break;
				case 'KeyD':
					bit = 8;
					break;
			}
			if (bit === 0) return false;
			if (down) {
				if (!(scrollKeys & bit)) {
					scrollKeys |= bit;
					if (!scrollTimer) {
						scrollTimer = requestAnimationFrame(updateScroll);
					}
				}
			} else {
				scrollKeys &= ~bit;
			}
			return true;
		};
	}
};
