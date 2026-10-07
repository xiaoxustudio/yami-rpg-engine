import { macRedoKey } from '@app/utils/event-accessors';

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
