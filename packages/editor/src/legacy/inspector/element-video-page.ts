import { $, getElementWriter } from '@/util/dom.ts';
import { read } from '@/util/element-utils';
import { Inspector } from './inspector.ts';
import { UI } from '@/ui/ui-window.ts';

{
	const UIVideo = {
		owner: UI,
		target: null as any,
		initialize: null as any,
		create: null as any,
		open: null as any,
		close: null as any,
		update: null as any,
		paramInput: null as any
	};

	UIVideo.initialize = function (this: any) {
		if (!$('#uiVideo-loop')) return;
		$('#uiVideo-loop').loadItems([
			{ name: 'Once', value: false },
			{ name: 'Loop', value: true }
		]);

		$('#uiVideo-flip').loadItems([
			{ name: 'None', value: 'none' },
			{ name: 'Horizontal', value: 'horizontal' },
			{ name: 'Vertical', value: 'vertical' },
			{ name: 'Both', value: 'both' }
		]);

		$('#uiVideo-blend').loadItems([
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

	UIVideo.create = function (this: any) {
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

	UIVideo.open = function (this: any, node: any) {
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

	UIVideo.close = function (this: any) {
		if (this.target) {
			UI.list.unselect(this.target);
			UI.updateTarget!();
			Inspector.uiElement.close();
			this.target = null;
		}
	};

	UIVideo.update = function (this: any, node: any, key: any, value: any) {
		UI.planToSave!();
		switch (key) {
			case 'video':
			case 'playbackRate':
			case 'loop':
			case 'flip':
			case 'blend':
				if (node[key] !== value) {
					node[key] = value;
				}
				break;
		}
		UI.requestRendering!();
	};

	UIVideo.paramInput = function (this: any, event: any) {
		UIVideo.update(UIVideo.target, Inspector.getKey!(this), read(this));
	};

	Inspector.uiVideo = UIVideo;
}
