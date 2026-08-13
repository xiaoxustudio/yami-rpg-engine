import { $, getElementWriter } from '@/util/dom.ts';
import { read } from '@/util/element-utils';
import { Inspector } from './inspector.ts';
import { UI } from '@/ui/ui-window.ts';

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
		owner: UI,
		target: null,
		initialize: null,
		create: null,
		open: null,
		close: null,
		update: null,
		paramInput: null
	};

	UIVideo.initialize = function (this: typeof UIVideo) {
		if (!$('#uiVideo-loop')) return;
		$('#uiVideo-loop')?.loadItems?.([
			{ name: 'Once', value: false },
			{ name: 'Loop', value: true }
		]);

		$('#uiVideo-flip')?.loadItems?.([
			{ name: 'None', value: 'none' },
			{ name: 'Horizontal', value: 'horizontal' },
			{ name: 'Vertical', value: 'vertical' },
			{ name: 'Both', value: 'both' }
		]);

		$('#uiVideo-blend')?.loadItems?.([
			{ name: 'Normal', value: 'normal' },
			{ name: 'Additive', value: 'additive' },
			{ name: 'Subtract', value: 'subtract' }
		]);

		const elements = $(
			'#uiVideo-video, #uiVideo-playbackRate, #uiVideo-loop, #uiVideo-flip, #uiVideo-blend'
		);
		(elements as unknown as HTMLElement[]).forEach((el) =>
			(el as HTMLElement).on('focus', Inspector.inputFocus)
		);
		(elements as unknown as HTMLElement[]).forEach((el: HTMLElement) =>
			(el as HTMLElement).on('blur', Inspector.inputBlur!(this, UI))
		);
	};

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

			const write = getElementWriter('uiVideo', node);
			write('video');
			write('playbackRate');
			write('loop');
			write('flip');
			write('blend');
			Inspector.uiElement.open(node);
		}
	};

	UIVideo.close = function (this: typeof UIVideo) {
		if (this.target) {
			UI.list.unselect(this.target);
			UI.updateTarget!();
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
		UI.planToSave!();
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
		UI.requestRendering!();
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
