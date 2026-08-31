import { Animation } from './animation-window.ts';
import type { AnimationLayer, AnimationMotion } from './animation-window.ts';
import { getListConfig } from '@ui-kit';
import { relate } from '@app/utils/element-utils';
import {
	addClass,
	hasClass,
	hide,
	read,
	rect,
	removeClass,
	show
} from '@app/utils/element-utils.ts';
import { ctrl } from '@app/utils/event-accessors';
import { Command } from '@app/commands/command-object.ts';
import { Cursor } from '@app/composables/usePointerObjectWindow';
import { Menu } from '@app/components/menu-list.ts';
import { TreeList } from '@app/components/tree-list.ts';
import { Enum } from '@app/enum/enum-window.ts';
import { Inspector } from '@app/inspector/inspector.ts';
import { Layout } from '@app/engine/layout/layout.ts';
import { GameLocal } from '@app/local/local-object.ts';
import { SceneShift } from '@app/scene/move-scene.ts';
import { getYamiI18n } from '@app/i18n';

const t = (key: string, named?: Record<string, unknown>) =>
	getYamiI18n().global.t(key, named ?? {});
import { getAnimationStore } from '@app/stores/animation';
import { GlobalClipboard } from '@app/utils/clipboard';

const Clipboard = GlobalClipboard;

Animation.searcherInput = function (this: typeof Animation, event: Event & { inputType?: string }) {
	if (event.inputType !== 'insertCompositionText') {
		const text = this.input!.value;
		Animation.list.searchNodesDebounced(text);
	}
};

Animation.listKeydown = function (this: typeof Animation, event: KeyboardEvent) {
	if (!this.data) {
		return;
	}
	const item = read(this);
	if (event.ctrlKey || event.metaKey) {
		switch (event.code) {
			case 'KeyX':
				if (item) {
					this.copy!(item);
					this.delete!(item);
				}
				break;
			case 'KeyC':
				this.copy!(item);
				break;
			case 'KeyV':
				this.paste!(null);
				break;
		}
	} else {
		switch (event.code) {
			case 'Delete':
				this.delete!(item);
				break;
			case 'Backspace':
				this.cancelSearch!();
				break;
			// case 'Escape': Animation.setMotion!(null) break
		}
	}
};

Animation.listPointerdown = function (this: typeof Animation, event: PointerEvent) {
	switch (event.button) {
		case 0: {
			const element = event.target as HTMLElement & { item?: AnimationMotion };
			if (hasClass(element, 'node-item') && hasClass(element, 'selected')) {
				Inspector.open!('animMotion', element.item);
			}
			break;
		}
		case 3:
			this.cancelSearch!();
			break;
	}
};

Animation.listSelect = function (
	this: typeof Animation,
	event: Event & { value?: AnimationMotion | null }
) {
	Animation.setMotion!(event.value!);
};

Animation.listRecord = function (
	this: typeof Animation,
	event: Event & { value: { type: string } }
) {
	const response = event.value;
	const { type } = response;
	switch (type) {
		case 'create':
		case 'delete':
		case 'remove':
			Animation.history.save({
				type: `animation-object-${type}`,
				response: response
			});
			break;
	}
};

Animation.listOpen = function (this: typeof Animation, event: Event & { value?: AnimationMotion }) {
	Animation.editMotion!(event.value!);
};

Animation.listPopup = function (
	this: typeof Animation,
	event: MouseEvent & { value?: AnimationMotion | null }
) {
	const list = Animation.list;
	const item = event.value;
	const get = (key: string) => t('menuAnimationList.' + key);
	let copyable;
	let pastable;
	let deletable;
	if (item) {
		copyable = true;
		pastable = Clipboard.has('yami.animation.object');
		deletable = true;
	} else {
		copyable = false;
		pastable = Clipboard.has('yami.animation.object');
		deletable = false;
	}
	let headItems = Array.empty;
	if (item) {
		headItems = [
			{
				label: get('edit'),
				accelerator: 'Enter',
				click: () => {
					Animation.editMotion!(item);
				}
			}
		];
	}
	Menu.popup!(
		{
			x: event.clientX,
			y: event.clientY
		},
		[
			...headItems,
			{
				label: get('insert'),
				click: () => {
					Animation.getNewMotionId!((motionId: string) => {
						const motion = Inspector.animMotion.create(motionId);
						list.addNodeTo(motion, item);
						Inspector.open!('animMotion', motion);
					});
				}
			},
			{
				type: 'separator'
			},
			{
				label: get('cut'),
				accelerator: ctrl('X'),
				enabled: copyable,
				click: () => {
					list.copy(item);
					list.delete(item);
				}
			},
			{
				label: get('copy'),
				accelerator: ctrl('C'),
				enabled: copyable,
				click: () => {
					list.copy(item);
				}
			},
			{
				label: get('paste'),
				accelerator: ctrl('V'),
				enabled: pastable,
				click: () => {
					list.paste(item);
				}
			},
			{
				label: get('delete'),
				accelerator: 'Delete',
				enabled: deletable,
				click: () => {
					list.delete(item);
				}
			}
		]
	);
};

Animation.listChange = function (this: typeof Animation, _event: Event) {
	Animation.planToSave!();
};

Animation.listPageResize = function (this: typeof Animation, _event: Event) {
	Animation.list.updateHead();
	Animation.list.resize();
};

Animation.timelinePageResize = function (this: typeof Animation, _event: Event) {
	Animation.updatePointerArea!();
	Animation.timeline.updateHead();
	Animation.layerList.resize();
};

Animation.timelineToolbarPointerdown = function (this: typeof Animation, event: PointerEvent) {
	switch (event.button) {
		case 0: {
			const element = event.target as HTMLElement;
			if (hasClass(element, 'item')) {
				switch (element.getAttribute('value')) {
					case 'previousKey':
						return Animation.previousKeyFrame!();
					case 'previous':
						return Animation.previousFrame!();
					case 'play':
						return Animation.play!();
					case 'next':
						return Animation.nextFrame!();
					case 'nextKey':
						return Animation.nextKeyFrame!();
					case 'loop':
						return Animation.switchLoop!();
				}
			}
			break;
		}
	}
};

Animation.layerListScroll = function (this: typeof Animation, _event: Event) {
	const { outerTimelineList } = Animation;
	const { scrollTop } = this;
	this.lastScrollTop = scrollTop;
	if (outerTimelineList.lastScrollTop !== scrollTop) {
		outerTimelineList.scrollTop = scrollTop;
	}
};

Animation.layerListKeydown = function (this: typeof Animation, event: KeyboardEvent) {
	// 避免重命名输入框键盘按下事件
	if ((event.target as EventTarget | null) !== (this as unknown as EventTarget) || !this.data) {
		return;
	}
	const item = read(this);
	if (event.ctrlKey || event.metaKey) {
		switch (event.code) {
			case 'KeyX':
				if (item) {
					this.copy!(item);
					this.delete!(item);
				}
				break;
			case 'KeyC':
				this.copy!(item);
				break;
			case 'KeyV':
				this.paste!(null);
				break;
		}
	} else if (event.shiftKey) {
		return;
	} else {
		switch (event.code) {
			case 'Delete':
				this.delete!(item);
				break;
		}
	}
};

Animation.layerListPointerdown = function (this: typeof Animation, event: PointerEvent) {
	switch (event.button) {
		case 0: {
			const element = event.target as HTMLElement & { item?: AnimationLayer };
			if (hasClass(element, 'node-item')) {
				if (hasClass(element, 'selected')) {
					Animation.openLayer!(element.item);
				}
			}
			break;
		}
	}
};

Animation.layerListSelect = function (
	this: typeof Animation,
	event: Event & { value?: AnimationLayer | null }
) {
	Animation.openLayer!(event.value!);
};

Animation.layerListRecord = function (
	this: typeof Animation,
	event: Event & { value: { type: string } }
) {
	const response = event.value;
	const { type } = response;
	switch (type) {
		case 'rename':
		case 'create':
		case 'delete':
		case 'remove':
			Animation.contextLoaded = false;
			Animation.history.save({
				type: `animation-layer-${type}`,
				motion: getAnimationStore().motion,
				direction: getAnimationStore().direction,
				response: response
			});
			break;
	}
};

Animation.layerListPopup = function (
	this: typeof Animation,
	event: MouseEvent & { value?: AnimationLayer | null }
) {
	const list = Animation.layerList;
	const item = event.value;
	const get = (key: string) => t('menuAnimationLayerList.' + key);
	let copyable;
	let pastable;
	let deletable;
	let renamable;
	if (item) {
		copyable = true;
		pastable = Clipboard.has('yami.animation.layer');
		deletable = true;
		renamable = true;
	} else {
		copyable = false;
		pastable = Clipboard.has('yami.animation.layer');
		deletable = false;
		renamable = false;
	}
	Menu.popup!(
		{
			x: event.clientX,
			y: event.clientY
		},
		[
			{
				label: get('create'),
				submenu: [
					{
						label: get('create.joint'),
						click: () => {
							list.create(item, 'joint');
						}
					},
					{
						label: get('create.sprite'),
						click: () => {
							list.create(item, 'sprite');
						}
					},
					{
						label: get('create.particle'),
						click: () => {
							list.create(item, 'particle');
						}
					},
					{
						label: get('create.sound'),
						click: () => {
							list.create(item, 'sound');
						}
					}
				]
			},
			{
				type: 'separator'
			},
			{
				label: get('cut'),
				accelerator: ctrl('X'),
				enabled: copyable,
				click: () => {
					list.copy(item);
					list.delete(item);
				}
			},
			{
				label: get('copy'),
				accelerator: ctrl('C'),
				enabled: copyable,
				click: () => {
					list.copy(item);
				}
			},
			{
				label: get('paste'),
				accelerator: ctrl('V'),
				enabled: pastable,
				click: () => {
					list.paste(item);
				}
			},
			{
				label: get('delete'),
				accelerator: 'Delete',
				enabled: deletable,
				click: () => {
					list.delete(item);
				}
			},
			{
				label: get('rename'),
				accelerator: 'F2',
				enabled: renamable,
				click: () => {
					list.rename(item);
				}
			},
			{
				label: get('shift'),
				enabled: 0 < item?.frames.length,
				click: () => {
					SceneShift.open!((x: number, y: number) => {
						Animation.history.save({
							type: 'animation-layer-shift',
							motion: getAnimationStore().motion,
							direction: getAnimationStore().direction,
							layer: item,
							shiftX: x,
							shiftY: y
						});
						Animation.shiftLayerPosition!(item, x, y);
						Animation.planToSave!();
					});
				}
			}
		]
	);
};

Animation.layerListChange = function (this: typeof Animation, _event: Event) {
	Animation.planToSave!();
};

Animation.outerTimelineListKeydown = function (this: typeof Animation, event: KeyboardEvent) {
	if (this.dragging !== null) return;
	if (event.ctrlKey || event.metaKey) {
		switch (event.code) {
			case 'KeyA':
				Animation.selectAllFrames!();
				break;
			case 'KeyX':
				Animation.copyFrame!();
				Animation.deleteFrame!();
				break;
			case 'KeyC':
				Animation.copyFrame!();
				break;
			case 'KeyV':
				Animation.pasteFrame!();
				break;
			case 'ArrowUp':
			case 'ArrowDown':
			case 'ArrowLeft':
			case 'ArrowRight':
				Animation.shiftSelectedFrames!(event.code.slice(5).toLowerCase());
				break;
		}
	} else if (event.shiftKey) {
		switch (event.code) {
			case 'Delete':
				Animation.deleteFrame!(true);
				break;
			case 'ArrowUp':
			case 'ArrowDown':
				Animation.selectAllFramesOfKey!();
				break;
			case 'ArrowLeft':
			case 'ArrowRight':
				Animation.multiSelectFramesRelative!(event.code.slice(5).toLowerCase());
				break;
			case 'Home':
			case 'End':
				Animation.multiSelectFramesToHomeEnd!(event.code.toLowerCase());
				break;
		}
	} else {
		switch (event.code) {
			case 'Space':
				event.preventDefault();
				Animation.play!();
				break;
			case 'Escape':
				Animation.unselectMarquee!();
				break;
			case 'KeyF':
				Animation.insertFrame!();
				break;
			case 'KeyG':
				Animation.extendFrame!();
				break;
			case 'Delete':
				Animation.deleteFrame!();
				break;
			case 'ArrowLeft':
			case 'ArrowUp':
			case 'ArrowRight':
			case 'ArrowDown':
				event.preventDefault();
				Animation.selectFrameRelative!(event.code.slice(5).toLowerCase());
				break;
			case 'Home':
			case 'End':
				event.preventDefault();
				Animation.selectFrameAtHomeEnd!(event.code.toLowerCase());
				break;
			case 'PageUp':
				event.preventDefault();
				break;
			case 'PageDown':
				event.preventDefault();
				break;
		}
	}
};

Animation.outerTimelineListScroll = function (this: typeof Animation, _event: Event) {
	const { scrollLeft, scrollTop } = this;
	if (this.lastScrollLeft !== scrollLeft) {
		this.lastScrollLeft = scrollLeft;
		const { outerRuler, innerRuler, outerPointerArea } = Animation;
		const start = Math.floor(scrollLeft / 80);
		if (innerRuler.start !== start) {
			innerRuler.start = start;
			let number = start * 5;
			for (const node of innerRuler.childNodes) {
				node.textContent = number.toString();
				number += 5;
			}
		}
		// 通过容差来消除非1:1时的抖动
		const tolerance = 0.0001;
		outerRuler.scrollLeft = (scrollLeft + tolerance) % 80;
		outerPointerArea.scrollLeft = scrollLeft;
	}
	if (this.lastScrollTop !== scrollTop) {
		this.lastScrollTop = scrollTop;
		const { layerList } = Animation;
		if (layerList.lastScrollTop !== scrollTop) {
			layerList.scrollTop = scrollTop;
		}
	}
	const { pointerevent } = Animation.timelineCursor;
	if (pointerevent !== null) {
		Animation.innerTimelineListPointermove!(pointerevent);
	}
};

Animation.outerTimelineListBlur = function (this: typeof Animation, _event: Event) {
	Animation.outerTimelineListPointerup!();
};

Animation.outerTimelineListPointerdown = function (
	this: typeof Animation,
	event: PointerEvent & {
		dragKey?: boolean;
		mode?: string;
		scrollLeft?: number;
		scrollTop?: number;
		layer?: unknown;
		pointerdownX?: number;
		pointerdownY?: number;
		enableDblclickEvent?: boolean;
		latest?: unknown;
	}
) {
	if (Animation.dragging) {
		return;
	}
	switch (event.button) {
		case 0: {
			if (event.dragKey) {
				this.dragging = event;
				event.mode = 'scroll';
				event.scrollLeft = this.scrollLeft;
				event.scrollTop = this.scrollTop;
				Cursor.open('cursor-grab');
				window.addEventListener('pointerup', Animation.outerTimelineListPointerup);
				window.addEventListener('pointermove', Animation.outerTimelineListPointermove);
				return;
			}
			if (event.target === Animation.innerTimelineList) {
				const marquee = Animation.timelineMarquee;
				let { x, y } = Animation.getFrameCoords!(event);
				let length = 1;
				let origin = x;
				if (event.shiftKey) {
					const { y: my, origin: mo } = marquee;
					if (y === my) {
						length = Math.abs(x - mo) + 1;
						x = Math.min(x, mo);
						origin = mo;
					}
				} else {
					const frame = Animation.getKeyFrame!(x, y);
					if (frame !== null) {
						Animation.adjustMarquee!();
						const { layer, length } = marquee;
						Animation.updateMarqueeShift!(x, y, length);
						show(Animation.timelineMarqueeShift);
						Animation.loadFrames!(x);
						this.dragging = event;
						event.mode = 'shift';
						event.layer = layer;
						event.pointerdownX = x;
						event.pointerdownY = y;
						event.enableDblclickEvent = true;
						window.addEventListener('pointerup', Animation.outerTimelineListPointerup);
						window.addEventListener(
							'pointermove',
							Animation.outerTimelineListPointermove
						);
						this.addScrollListener!('both', 1, true, () => {
							Animation.outerTimelineListPointermove!(event.latest);
						});
						return;
					}
				}
				Animation.selectMarquee!(x, y, length, origin);
				Animation.scrollToMarquee!(false);
				Animation.loadFrames!(x);
				this.dragging = event;
				event.mode = 'select';
				event.pointerdownX = origin;
				event.pointerdownY = y;
				event.enableDblclickEvent = true;
				window.addEventListener('pointerup', Animation.outerTimelineListPointerup);
				window.addEventListener('pointermove', Animation.outerTimelineListPointermove);
				this.addScrollListener!('horizontal', 1, true, () => {
					Animation.outerTimelineListPointermove!(event.latest);
				});
			}
			break;
		}
		case 2:
			this.dragging = event;
			event.mode = 'ready-to-scroll';
			event.scrollLeft = this.scrollLeft;
			event.scrollTop = this.scrollTop;
			window.addEventListener('pointerup', Animation.outerTimelineListPointerup);
			window.addEventListener('pointermove', Animation.outerTimelineListPointermove);
			break;
	}
};

Animation.outerTimelineListPointerup = function (
	this: typeof Animation,
	event: PointerEvent | undefined
) {
	const { dragging } = Animation.outerTimelineList;
	if (!dragging) {
		return;
	}
	if (event === undefined) {
		event = dragging as PointerEvent;
	}
	if (dragging && relate(dragging, event)) {
		switch (dragging.mode) {
			case 'select':
				Animation.outerTimelineList.removeScrollListener();
				break;
			case 'shift': {
				const marquee = Animation.timelineMarqueeShift;
				if (!hasClass(marquee, 'disabled')) {
					Animation.dragAndDropFrame!();
				}
				hide(marquee);
				marquee.layer = null;
				removeClass(marquee, 'disabled');
				Animation.outerTimelineList.removeScrollListener();
				break;
			}
			case 'ready-to-scroll':
				if (event.target === Animation.innerTimelineList) {
					const { x, y } = Animation.getFrameCoords!(event);
					const marquee = Animation.timelineMarquee;
					if (!marquee.isPointIn(x, y)) {
						Animation.selectMarquee!(x, y, 1, x);
						Animation.scrollToMarquee!(false);
						Animation.loadFrames!(x);
					}
					if (marquee.isPointIn(x, y)) {
						const key = marquee.layer.class;
						const selected = marquee.isSelected();
						const pastable = Clipboard.has(`yami.animFrame.${key}`);
						const extendable = selected || marquee.isExtendable();
						const shrinkable = selected || marquee.isShrinkable();
						const get = (key: string) => t('menuAnimationTimeline.' + key);
						Menu.popup!(
							{
								x: event.clientX,
								y: event.clientY
							},
							[
								{
									label: get('insert'),
									accelerator: 'F',
									click: () => {
										Animation.insertFrame!();
									}
								},
								{
									label: get('extend'),
									accelerator: 'G',
									enabled: extendable,
									click: () => {
										Animation.extendFrame!();
									}
								},
								{
									label: get('cut'),
									accelerator: ctrl('X'),
									enabled: selected,
									click: () => {
										Animation.copyFrame!();
										Animation.deleteFrame!();
									}
								},
								{
									label: get('copy'),
									accelerator: ctrl('C'),
									enabled: selected,
									click: () => {
										Animation.copyFrame!();
									}
								},
								{
									label: get('paste'),
									enabled: pastable,
									accelerator: ctrl('V'),
									click: () => {
										Animation.pasteFrame!();
									}
								},
								{
									label: get('delete'),
									accelerator: 'Delete',
									enabled: selected,
									click: () => {
										Animation.deleteFrame!();
									}
								},
								{
									label: get('deleteAndShift'),
									accelerator: 'Shift+Del',
									enabled: shrinkable,
									click: () => {
										Animation.deleteFrame!(true);
									}
								},
								{
									label: get('selectAll'),
									accelerator: ctrl('A'),
									enabled: marquee.layer.frames.length !== 0,
									click: () => {
										Animation.selectAllFrames!();
									}
								}
							]
						);
					}
				}
				break;
			case 'scroll':
				Cursor.close('cursor-grab');
				break;
		}
		Animation.innerTimelineList.pointerevent = dragging;
		Animation.outerTimelineList.dragging = null;
		window.removeEventListener('pointerup', Animation.outerTimelineListPointerup);
		window.removeEventListener('pointermove', Animation.outerTimelineListPointermove);
	}
};

Animation.outerTimelineListPointermove = function (this: typeof Animation, event: PointerEvent) {
	const { dragging } = Animation.outerTimelineList;
	if (dragging && relate(dragging, event)) {
		switch (dragging.mode) {
			case 'select': {
				dragging.latest = event;
				if (dragging.enableDblclickEvent) {
					const distX = event.clientX - dragging.clientX;
					const distY = event.clientY - dragging.clientY;
					if (Math.sqrt(distX ** 2 + distY ** 2) > 4) {
						dragging.enableDblclickEvent = false;
					}
				}
				const coords = Animation.getFrameCoords!(event, true);
				const x = Math.clamp(coords.x, 0, Animation.frameMax - 1);
				const mx = Math.min(x, dragging.pointerdownX);
				const mw = Math.abs(x - dragging.pointerdownX) + 1;
				Animation.selectMarquee!(mx, dragging.pointerdownY, mw);
				Animation.loadFrames!(x);
				break;
			}
			case 'shift': {
				dragging.latest = event;
				if (dragging.enableDblclickEvent) {
					const distX = event.clientX - dragging.clientX;
					const distY = event.clientY - dragging.clientY;
					if (Math.sqrt(distX ** 2 + distY ** 2) > 4) {
						dragging.enableDblclickEvent = false;
					}
				}
				const coords = Animation.getFrameCoords!(event, true);
				const marquee = Animation.timelineMarqueeShift;
				const right = Animation.frameMax - marquee.length;
				const bottom = Animation.innerTimelineList.childNodes.length - 1;
				const x = Math.clamp(coords.x, 0, right);
				const y = Math.clamp(coords.y, 0, bottom);
				Animation.updateMarqueeShift!(x, y);
				if (dragging.layer.class === marquee.layer?.class) removeClass(marquee, 'disabled');
				else addClass(marquee, 'disabled');
				break;
			}
			case 'ready-to-scroll': {
				const distX = event.clientX - dragging.clientX;
				const distY = event.clientY - dragging.clientY;
				Animation.outerTimelineList.scroll(
					dragging.scrollLeft - distX,
					dragging.scrollTop - distY
				);
				if (Math.sqrt(distX ** 2 + distY ** 2) > 4) {
					dragging.mode = 'scroll';
					Cursor.open('cursor-grab');
				}
				break;
			}
			case 'scroll': {
				const distX = event.clientX - dragging.clientX;
				const distY = event.clientY - dragging.clientY;
				Animation.outerTimelineList.scroll(
					dragging.scrollLeft - distX,
					dragging.scrollTop - distY
				);
				break;
			}
		}
	}
};

Animation.innerTimelineListPointermove = function (this: typeof Animation, event: PointerEvent) {
	// 本事件可能被直接调用 因此不使用this来获取元素
	const { x, y } = Animation.getFrameCoords!(event);
	const list = Animation.innerTimelineList;
	const ex = Animation.frameMax;
	const ey = list.childNodes.length;
	if (x >= 0 && x < ex && y >= 0 && y < ey) Animation.updateCursor!(x, y);
	else Animation.updateCursor!(-1, -1);
	Animation.timelineCursor.pointerevent = event;
};

Animation.innerTimelineListPointerleave = function (this: typeof Animation, _event: Event) {
	Animation.timelineCursor.pointerevent = null;
	Animation.updateCursor!(-1, -1);
};

Animation.innerTimelineListDblclick = function (this: typeof Animation, event: PointerEvent) {
	if (this.pointerevent.enableDblclickEvent) {
		const { x, y } = Animation.getFrameCoords!(event);
		const timelines = Animation.innerTimelineList.childNodes;
		const layer = (timelines[y] as HTMLElement & { layer?: AnimationLayer })?.layer;
		if (layer !== undefined) {
			for (const frame of layer.frames) {
				const start = frame.start;
				const end = frame.end;
				if (x >= end) continue;
				if (x < start) break;
				Animation.selectMarquee!(start, y, end - start, x);
				Animation.scrollToMarquee!(false);
				return;
			}
		}
	}
};

// 选框 - 调整目标
Animation.marquee.resize = function (this: typeof Animation) {
	if (this.pointerevent) {
		Animation.marqueePointermove!(this.pointerevent);
	}
};

// 列表 - 复制
Animation.list.copy = function (this: typeof Animation, item: AnimationMotion) {
	if (item) {
		Clipboard.write('yami.animation.object', item);
	}
};

// 列表 - 粘贴
Animation.list.paste = function (this: typeof Animation, dItem: AnimationMotion | null) {
	const copy = Clipboard.read('yami.animation.object');
	if (copy && this.data) {
		this.addNodeTo!(copy, dItem);
	}
};

// 列表 - 删除
Animation.list.delete = function (this: typeof Animation, item: AnimationMotion) {
	if (item) {
		this.deleteNode!(item);
	}
};

// 列表 - 取消搜索
Animation.list.cancelSearch = function (this: typeof Animation) {
	if (this.display === 'search') {
		const active = document.activeElement;
		Animation.searcher.deleteInputContent();
		this.expandToSelection!();
		this.scrollToSelection!();
		active!.focus();
	}
};

// 列表 - 更新头部位置
Animation.list.updateHead = function (this: typeof Animation) {
	const { page, head } = this;
	if (page.clientWidth !== 0) {
		const { nav } = Layout.getGroupOfElement(head);
		const nRect = rect(nav);
		const iRect = rect(nav.lastChild as HTMLElement);
		const left = iRect.right - nRect.left;
		head.style.left = `${left}px`;
	}
};

// 列表 - 重写解析名称方法
Animation.list.parseName = function (this: typeof Animation, item: unknown) {
	const animationItem = item as AnimationMotion;
	const enumString = Enum.getString!(animationItem.id);
	return enumString
		? GameLocal.replace!(enumString.name)
		: Command.parseUnlinkedId!(animationItem.id);
};

// 列表 - 在删除数据时回调
getListConfig(Animation.list).onDelete = function (this: typeof Animation) {
	Animation.updateMotion!();
};

// 图层列表 - 重写更新方法
Animation.layerList.update = function (this: typeof Animation) {
	TreeList.prototype.update.call(this);
	if (!Animation.contextLoaded) {
		Animation.contextLoaded = true;
		const { player } = Animation;
		const { contexts } = player;
		player.destroyContextEmitters();
		player.loadContexts(contexts);
		if (getAnimationStore().showOnionskin) {
			const { prev, next } = player.onionskin;
			player.loadContexts(prev);
			player.loadContexts(next);
		}
	}
	Animation.updateTarget!();
	Animation.updateTimeline!();
};

// 图层列表 - 创建图层
Animation.layerList.create = function (
	this: typeof Animation,
	dItem: AnimationLayer | null,
	type: string
) {
	let data;
	switch (type) {
		case 'joint':
			data = Inspector.animJointLayer.create();
			break;
		case 'sprite':
			data = Inspector.animSpriteLayer.create();
			break;
		case 'particle':
			data = Inspector.animParticleLayer.create();
			break;
		case 'sound':
			data = Inspector.animSoundLayer.create();
			break;
	}
	this.addNodeTo!(data, dItem);
};

// 图层列表 - 复制
Animation.layerList.copy = function (this: typeof Animation, item: AnimationLayer) {
	if (item) {
		Clipboard.write('yami.animation.layer', item);
	}
};

// 图层列表 - 粘贴
Animation.layerList.paste = function (this: typeof Animation, dItem: AnimationLayer | null) {
	const copy = Clipboard.read('yami.animation.layer');
	if (copy && this.data) {
		this.addNodeTo!(copy, dItem);
	}
};

// 图层列表 - 删除
Animation.layerList.delete = function (this: typeof Animation, item: AnimationLayer) {
	if (item) {
		this.deleteNode!(item);
	}
};

// 图层列表 - 在删除数据时回调
getListConfig(Animation.layerList).onDelete = function (
	this: typeof Animation,
	item: AnimationLayer
) {
	const editor = Inspector[Inspector.type];
	if (editor?.target === item) {
		Inspector.close!();
	}
} as (item: unknown) => void;

// 时间轴 - 更新头部位置
Animation.timeline.updateHead = function (this: typeof Animation) {
	const { head } = this;
	if (this.clientWidth !== 0) {
		const { nav } = Layout.getGroupOfElement(head);
		const nRect = rect(nav);
		const iRect = rect(nav.lastChild as HTMLElement);
		const left = iRect.right - nRect.left;
		head.style.left = `${left}px`;
		const bRect = rect(Animation.outerTimelineList);
		const padding = Math.max(bRect.left - iRect.right, 0);
		if (head.padding !== padding) {
			head.padding = padding;
			Animation.toolbar.style.width = `${padding}px`;
			Animation.outerRuler.style.left = `${padding}px`;
		}
		Animation.updateRuler!();
	}
};

// 时间轴列表 - 恢复动作和图层对象
Animation.outerTimelineList.restoreMotionAndLayer = function (
	this: typeof Animation,
	motion: AnimationMotion | null,
	direction: number,
	layer: AnimationLayer
) {
	const { updateTimeline } = Animation;
	Animation.updateTimeline = Function.empty;
	Animation.setMotion!(motion);
	Animation.setDirection!(direction);
	Animation.layerList.expandToItem(layer);
	Animation.updateTimeline = updateTimeline;
};

// 时间轴选框 - 判断点是否在选框区域内
Animation.timelineMarquee.isPointIn = function (this: typeof Animation, x: number, y: number) {
	return x >= this.x && x < this.x + this.length && y === this.y;
};

// 时间轴选框 - 判断帧是否已选中
Animation.timelineMarquee.isSelected = function (this: typeof Animation) {
	const { layer, x, length } = this;
	const ex = x + length;
	const frames = layer.frames;
	const fLength = frames.length;
	for (let i = 0; i < fLength; i++) {
		const frame = frames[i];
		const start = frame.start;
		const end = frame.end;
		if (x >= end) continue;
		if (ex <= start) break;
		return true;
	}
	return false;
};

// 时间轴选框 - 判断是否可延长
Animation.timelineMarquee.isExtendable = function (this: typeof Animation) {
	const frames = this.layer.frames;
	const frame = frames[0];
	return frame ? this.x >= frame.start : false;
};

// 时间轴选框 - 判断是否可收缩
Animation.timelineMarquee.isShrinkable = function (this: typeof Animation) {
	const frames = this.layer.frames;
	const frame = frames[frames.length - 1];
	return frame ? this.x < frame.end : false;
};
