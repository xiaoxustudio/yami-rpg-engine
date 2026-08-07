import { $, getElementReader, getElementWriter } from '@/util/dom.ts';
import { Window } from '@/tools/window-object.ts';
import { addClass, getFocus, removeClass } from '@/util/element-utils';
import { Animation } from '@/animation/animation-window.ts';
import { Command } from '@/command/command-object.ts';
import { GUID } from '@/file/guid.ts';
import { Inspector } from './inspector.ts';

{
	const FileAnimation = {
		button: null as any,
		owner: null as any,
		target: null as any,
		sprites: null as any,
		initialize: null as any,
		create: null as any,
		open: null as any,
		close: null as any
	};

	FileAnimation.initialize = function (this: any) {
		this.button = $('#animation-switch-settings');
		this.owner = {
			setTarget: (target: any) => {
				if (this.target !== target) {
					Inspector.open!('fileAnimation', target);
				}
			},
			planToSave: () => {
				Animation.planToSave!();
			},
			get history() {
				return Animation.history;
			}
		};

		$('#fileAnimation-sprites')?.bind(this.sprites);

		$('#fileAnimation-sprites')?.on('change', Animation.listChange);
	};

	FileAnimation.create = function (this: any) {
		return {
			sprites: [],
			motions: []
		};
	};

	FileAnimation.open = function (this: any, animation: any) {
		if (this.target !== animation) {
			this.target = animation;

			addClass(this.button, 'selected');

			const write = getElementWriter('fileAnimation', animation);
			write('sprites');
		}
	};

	FileAnimation.close = function (this: any) {
		if (this.target) {
			this.target = null;

			removeClass(this.button, 'selected');
		}
	};

	FileAnimation.sprites = {
		list: null as any,
		spriteId: '',
		initialize: function (this: any, list: any) {
			$('#fileAnimation-sprite-confirm')?.on('click', () => list.save());

			this.list = list;

			this.history = new Inspector.ParamHistory!(FileAnimation, FileAnimation.owner, list);

			// 重载动画纹理 - 改变事件
			list.on('change', (event: any) => {
				if (Animation.sprites) {
					if (Animation.sprites.listItems) {
						Animation.sprites.listItems = undefined;
					}
					Animation.loadTextures!();
				}
			});
		},
		parse: function ({ name, image, hframes, vframes }: any) {
			const fileName = Command.removeTextTags!(Command.parseFileName!(image));
			return [name, `${fileName} [${hframes}x${vframes}]`];
		},
		createExclusionMap: function () {
			const exclusions = {} as Record<string, any>;
			for (const sprite of this.list.data) {
				exclusions[sprite.id] = true;
			}
			return exclusions;
		},
		createSpriteId: function (this: any, exclusions: any = this.createExclusionMap!()) {
			let id;
			do {
				id = GUID.generate64bit();
			} while (exclusions[id]);
			return id;
		},
		open: function (
			this: any,
			{ name = '', id = this.createSpriteId!(), image = '', hframes = 1, vframes = 1 } = {}
		) {
			Window.open!('fileAnimation-sprite');
			const write = getElementWriter('fileAnimation-sprite');
			write('name', name);
			write('image', image);
			write('hframes', hframes);
			write('vframes', vframes);
			(this as any).spriteId = id;
			if (!name) {
				getFocus($('#fileAnimation-sprite-name'));
			} else {
				getFocus($('#fileAnimation-sprite-image'));
			}
		},
		save: function () {
			const read = getElementReader('fileAnimation-sprite');
			const name = read('name').trim();
			if (!name) {
				return getFocus($('#fileAnimation-sprite-name'));
			}
			const image = read('image');
			const hframes = read('hframes');
			const vframes = read('vframes');
			const id = this.spriteId;
			Window.close!('fileAnimation-sprite');
			return { name, id, image, hframes, vframes };
		},
		onPaste: function (this: any, list: any, copies: any) {
			const exclusions = this.createExclusionMap!();
			for (const sprite of copies) {
				if (sprite.id in exclusions) {
					const id = this.createSpriteId!(exclusions);
					sprite.id = id;
				}
				exclusions[sprite.id] = true;
			}
		}
	};

	Inspector.fileAnimation = FileAnimation;
}
