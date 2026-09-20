import { inspectorEls } from './element-registry.ts';
import { read } from '@app/utils/element-utils';
import { Inspector } from '@app/inspector/inspector.ts';
import { getUIStore } from '@app/stores/ui';
import { UIOwner } from './ui-owner.ts';

{
	interface UIVideoShape {
		target: UIVideoData | null;
		update: ((node: UIVideoData, key: string, value: unknown) => void) | null;
		paramInput: ((event: Event) => void) | null;
		[k: string]: unknown;
	}
	interface UIVideoData {
		video: string;
		playbackRate: number;
		loop: boolean;
		flip: string;
		blend: string;
		[k: string]: unknown;
	}
	const UIVideo: UIVideoShape = {
		owner: UIOwner,
		target: null,
		initialize: null,
		create: null,
		open: null,
		close: null,
		update: null,
		paramInput: null
	};

	UIVideo.initialize = function () {};

	UIVideo.create = function (this: typeof UIVideo) {
		const transform = Inspector.uiElement.createTransform();
		transform.width = 100;
		transform.height = 100;
		return {
			class: 'video',
			name: 'Video',
			enabled: true,
			expanded: false,
			hidden: false,
			locked: false,
			presetId: '',
			video: '',
			playbackRate: 1,
			loop: false,
			flip: 'none',
			blend: 'normal',
			pointerEvents: 'enabled',
			transform: transform,
			events: [],
			scripts: [],
			children: []
		};
	};

	UIVideo.open = function (this: typeof UIVideo, node: UIVideoData) {
		if (this.target !== node) {
			this.target = node;

			Inspector.uiElement.open(node);
			(
				inspectorEls.get('uiVideo-vue-mount') as HTMLElement & {
					sync?: () => void;
				}
			)?.sync?.();
		}
	};

	UIVideo.close = function (this: typeof UIVideo) {
		if (this.target) {
			const uiList = getUIStore().elements.list;
			if (uiList) uiList.unselect(this.target);
			getUIStore().updateTarget();
			Inspector.uiElement.close();
			this.target = null;
		}
	};

	UIVideo.update = function (
		this: typeof UIVideo,
		node: UIVideoData,
		key: string,
		value: unknown
	) {
		getUIStore().planToSave();
		switch (key) {
			case 'video':
			case 'playbackRate':
			case 'loop':
			case 'flip':
			case 'blend':
				if (node[key] !== value) {
					(node as Record<string, unknown>)[key] = value;
				}
				break;
		}
		getUIStore().requestRendering();
	};

	UIVideo.paramInput = function (this: typeof UIVideo, event: Event) {
		const target = event?.target ?? document.activeElement;
		let element = target;
		while (element instanceof Element) {
			if (new RegExp('^uiVideo-').test(element.id)) break;
			element = element.parentElement;
		}
		UIVideo.update!(
			UIVideo.target as UIVideoData,
			Inspector.getKey!(element as HTMLElement),
			read(element as HTMLElement)
		);
	};

	Inspector.uiVideo = UIVideo;
}
