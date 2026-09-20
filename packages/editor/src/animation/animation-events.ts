import { screenScrollData } from '@app/engine/screen-scroll-data';
import { Animation } from './animation-window.ts';
import { hasClass, read } from '@app/utils/element-utils.ts';
import { File } from '@app/file/file-system-core.ts';
import { Inspector } from '@app/inspector/inspector.ts';
import { registerWindowKeydown } from '@app/tools/window-keydown-registry';
import { StageColor } from '@app/utils/stage-color';
import { getAnimationStore } from '@app/stores/animation';
import { getElementData } from '@app/utils/element-data';
import { roundTo } from '@app/utils/math';

Animation.requestRefreshingList = function (this: typeof Animation) {
	if (getAnimationStore().state === 'open') {
		const list = this.list;
		// P4b：改用显式元素数据（`getElementData`）而不是原型访问器 `list.refreshing`
		const data = getElementData(list as HTMLElement);
		if (!data.refreshing) {
			data.refreshing = true;
			void Promise.resolve().then(() => {
				data.refreshing = false;
				list.refresh();
			});
		}
	}
};

Animation.switchMark = (function IIFE() {
	return function (this: typeof Animation, enabled = !getAnimationStore().showMark) {
		getAnimationStore().showMark = enabled;
		this.requestRendering!();
	};
})();

Animation.switchOnionskin = (function IIFE() {
	return function (this: typeof Animation, enabled = !getAnimationStore().showOnionskin) {
		getAnimationStore().showOnionskin = enabled;
		this.requestRendering!();
		if (enabled) {
			if (getAnimationStore().motion) {
				const player = this.player;
				const { prev, next } = player.onionskin;
				player.loadContexts(prev);
				player.loadContexts(next);
				this.updateFrameContexts!();
			}
		}
	};
})();

Animation.switchMirror = (function IIFE() {
	return function (this: typeof Animation, enabled = !getAnimationStore().mirror) {
		getAnimationStore().mirror = enabled;
		this.requestRendering!();
		if (getAnimationStore().state === 'open') {
			this.updateMatrix!();
		}
	};
})();

Animation.switchSettings = function (this: typeof Animation) {
	if (!hasClass(Inspector.fileAnimation.button, 'selected')) {
		Inspector.open!('fileAnimation', Animation);
	} else {
		Inspector.close!();
	}
};

Animation.switchLoop = (function IIFE() {
	return function (this: typeof Animation, enabled = !getAnimationStore().loop) {
		getAnimationStore().loop = enabled;
		// 在开启残影的情况下应该刷新
		if (getAnimationStore().showOnionskin && getAnimationStore().state === 'open') {
			this.updateFrameContexts!();
			this.requestRendering!();
		}
	};
})();

Animation.planToSave = function (this: typeof Animation) {
	File.planToSave!(this.meta);
};

Animation.saveToConfig = function (
	this: typeof Animation,
	config: { colors: { animationBackground: string } }
) {
	config.colors.animationBackground = this.background.hex;
};

Animation.loadFromConfig = function (
	this: typeof Animation,
	config: { colors: { animationBackground: string } }
) {
	this.background = new StageColor(config.colors.animationBackground, () =>
		this.requestRendering!()
	);
};

Animation.saveToProject = function (
	this: typeof Animation,
	project: {
		animation: {
			mark: boolean;
			onionskin: boolean;
			mirror: boolean;
			loop: boolean;
			speed: number;
			zoom: number;
		};
	}
) {
	const { animation } = project;
	animation.mark = getAnimationStore().showMark ?? animation.mark;
	animation.onionskin = getAnimationStore().showOnionskin ?? animation.onionskin;
	animation.mirror = getAnimationStore().mirror ?? animation.mirror;
	animation.loop = getAnimationStore().loop ?? animation.loop;
	animation.speed = getAnimationStore().speed ?? animation.speed;
	animation.zoom = getAnimationStore().zoom ?? animation.zoom;
};

Animation.loadFromProject = function (
	this: typeof Animation,
	project: {
		animation: {
			mark: boolean;
			onionskin: boolean;
			mirror: boolean;
			loop: boolean;
			speed: number;
			zoom: number;
		};
	}
) {
	const { animation } = project;
	this.switchMark!(animation.mark);
	this.switchOnionskin!(animation.onionskin);
	this.switchMirror!(animation.mirror);
	this.switchLoop!(animation.loop);
	this.setSpeed!(animation.speed);
	this.setZoom!(animation.zoom);
};

Animation.webglRestored = function (this: typeof Animation, _event: Event) {
	if (getAnimationStore().state === 'open') {
		Animation.requestRendering!();
	}
};

Animation.windowResize = function (this: typeof Animation, _event: Event) {
	this.updateHead!();
	if (getAnimationStore().state === 'open') {
		this.resize!();
		this.updateCamera!();
		this.requestRendering!();
	}
}.bind(Animation);

Animation.themechange = function (this: typeof Animation, _event: Event) {
	this.requestRendering!();
}.bind(Animation);

Animation.datachange = function (this: typeof Animation, event: Event & { key: string }) {
	switch (event.key) {
		case 'config':
			this.Player.updateStep();
			break;
	}
}.bind(Animation);

Animation.enumchange = function (this: typeof Animation, _event: Event) {
	this.requestRefreshingList!();
}.bind(Animation);

Animation.keydown = function (this: typeof Animation, event: KeyboardEvent) {
	if (getAnimationStore().state === 'open' && Animation.dragging === null) {
		if (event.altKey) {
			switch (event.code) {
				case 'KeyS':
					Animation.switchSettings!();
					break;
			}
		}
		if (!getAnimationStore().motion) return;
		if (event.ctrlKey || event.metaKey) {
			return;
		} else if (event.altKey) {
			return;
		} else {
			switch (event.code) {
				case 'KeyQ':
					Animation.previousFrame!();
					break;
				case 'KeyE':
					Animation.nextFrame!();
					break;
				case 'KeyZ':
					Animation.previousKeyFrame!();
					break;
				case 'KeyX':
					Animation.nextKeyFrame!();
					break;
				case 'KeyO':
					Animation.switchOnionskin!();
					break;
				case 'KeyM':
					Animation.switchMirror!();
					break;
				case 'KeyR':
					Animation.play!();
					break;
			}
		}
	}
};

registerWindowKeydown('animation', Animation.keydown);

Animation.headPointerdown = function (this: typeof Animation, event: Event) {
	if (!(event.target instanceof HTMLInputElement)) {
		event.preventDefault();
		if (document.activeElement !== Animation.screen) {
			Animation.screen.focus();
		}
	}
};

Animation.switchPointerdown = function (this: typeof Animation, event: PointerEvent) {
	switch (event.button) {
		case 0: {
			const element = event.target as HTMLElement;
			if (hasClass(element, 'item')) {
				switch (element.getAttribute('value')) {
					case 'mark':
						return Animation.switchMark!();
					case 'onionskin':
						return Animation.switchOnionskin!();
					case 'mirror':
						return Animation.switchMirror!();
					case 'settings':
						return Animation.switchSettings!();
				}
			}
			break;
		}
	}
};

Animation.zoomFocus = function (this: typeof Animation, _event: Event) {
	Animation.screen.focus();
};

Animation.zoomInput = function (this: typeof Animation, _event: Event) {
	Animation.setZoom!(read(this));
};

Animation.screenKeydown = function (this: typeof Animation, event: KeyboardEvent) {
	if (
		getAnimationStore().state === 'open' &&
		getAnimationStore().motion !== null &&
		this.dragging === null
	) {
		if (event.ctrlKey || event.metaKey) {
			switch (event.code) {
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
			case 'Escape':
				this.unselectMarquee!();
				break;
			case 'KeyA':
				if ((this.translationKey & 0b0001) === 0) {
					this.translationKey |= 0b0001;
					this.translationTimer.add();
					window.addEventListener('keyup', this.translationKeyup);
				}
				break;
			case 'KeyW':
				if ((this.translationKey & 0b0010) === 0) {
					this.translationKey |= 0b0010;
					this.translationTimer.add();
					window.addEventListener('keyup', this.translationKeyup);
				}
				break;
			case 'KeyD':
				if ((this.translationKey & 0b0100) === 0) {
					this.translationKey |= 0b0100;
					this.translationTimer.add();
					window.addEventListener('keyup', this.translationKeyup);
				}
				break;
			case 'KeyS':
				if ((this.translationKey & 0b1000) === 0) {
					this.translationKey |= 0b1000;
					this.translationTimer.add();
					window.addEventListener('keyup', this.translationKeyup);
				}
				break;
			case 'ArrowLeft':
			case 'ArrowUp':
			case 'ArrowRight':
			case 'ArrowDown':
				if (getAnimationStore().target !== null) {
					event.preventDefault();
					const target = getAnimationStore().target!;
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
					if (event.shiftKey) {
						offsetX *= 10;
						offsetY *= 10;
					}
					const x = roundTo(target.x! + offsetX, 4);
					const y = roundTo(target.y! + offsetY, 4);
					this.shiftTarget!(x, y);
				}
				break;
			case 'Minus':
			case 'NumpadSubtract':
				this.setZoom!((getAnimationStore().zoom ?? 0) - 1);
				break;
			case 'Equal':
			case 'NumpadAdd':
				this.setZoom!((getAnimationStore().zoom ?? 0) + 1);
				break;
			case 'Digit0':
			case 'Numpad0':
				this.setZoom!(2);
				break;
		}
	}
}.bind(Animation);

Animation.translationKeyup = function (this: typeof Animation, event: KeyboardEvent | undefined) {
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
		this.translationTimer.remove();
		window.removeEventListener('keyup', this.translationKeyup);
	}
}.bind(Animation);

Animation.screenWheel = function (this: typeof Animation, event: WheelEvent) {
	if (getAnimationStore().state === 'open' && this.dragging === null) {
		event.preventDefault();
		if (event.deltaY !== 0) {
			const step = event.deltaY > 0 ? -1 : 1;
			this.setZoom!((getAnimationStore().zoom ?? 0) + step);
		}
	}
}.bind(Animation);

Animation.screenUserscroll = function (this: typeof Animation, _event: Event) {
	if (getAnimationStore().state === 'open') {
		screenScrollData(this.screen).rawScrollLeft = this.screen.scrollLeft;
		screenScrollData(this.screen).rawScrollTop = this.screen.scrollTop;
		this.updateTransform!();
		this.requestRendering!();
	}
}.bind(Animation);

Animation.screenBlur = function (this: typeof Animation, _event: Event) {
	this.translationKeyup!();
	this.pointerup!();
	// this.marqueePointerleave!()
}.bind(Animation);
