import { reactive } from 'vue';
import { inspectorEls } from './element-registry.ts';
import { getElementWriter } from '@app/utils/dom';
import { Window } from '@app/tools/window-object.ts';
import { addClass, on, removeClass } from '@app/utils/element-utils';
import { Animation } from '@app/animation/animation-window.ts';
import { Command } from '@app/commands/command-object.ts';
import { requestFocus } from '@app/directives/focus';
import { GUID } from '@app/services/file-system/guid.ts';
import { ParamHistory } from '@app/composables/useParamHistory';
import { Inspector } from '@app/inspector/inspector.ts';
import type { YamiElement } from '@app/types/element-api';

{
	interface FileAnimationShape {
		button: HTMLElement | null;
		owner: unknown;
		target: unknown;
		sprites: unknown;
		initialize: ((this: typeof FileAnimation) => void) | null;
		create: ((this: typeof FileAnimation) => unknown) | null;
		open: ((this: typeof FileAnimation, animation: { sprites: unknown }) => void) | null;
		close: ((this: typeof FileAnimation) => void) | null;
		[k: string]: unknown;
	}
	const FileAnimation: FileAnimationShape = {
		button: null,
		owner: null,
		target: null,
		sprites: null,
		initialize: null,
		create: null,
		open: null,
		close: null
	};

	FileAnimation.initialize = function () {};
	FileAnimation.button = inspectorEls.get('animation-switch-settings') as YamiElement;
	FileAnimation.owner = {
		setTarget: (target: unknown) => {
			if (FileAnimation.target !== target) {
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

	FileAnimation.create = function (this: typeof FileAnimation) {
		return {
			sprites: [],
			motions: []
		};
	};

	FileAnimation.open = function (this: typeof FileAnimation, animation: { sprites: unknown }) {
		if (this.target !== animation) {
			this.target = animation;

			addClass(this.button, 'selected');

			const write = getElementWriter('fileAnimation', animation);
			write('sprites');
		}
	};

	FileAnimation.close = function (this: typeof FileAnimation) {
		if (this.target) {
			this.target = null;

			removeClass(this.button, 'selected');
		}
	};

	FileAnimation.sprites = {
		list: null,
		spriteId: '',
		initialize: function (this: typeof FileAnimation, list: HTMLElement) {
			this.list = list;

			this.history = new ParamHistory(FileAnimation, FileAnimation.owner as never, list);

			on(list, 'change', (_event: Event) => {
				if (Animation.sprites) {
					if (Animation.sprites.listItems) {
						Animation.sprites.listItems = undefined;
					}
					Animation.loadTextures!();
				}
			});
		},
		parse: function ({
			name,
			image,
			hframes,
			vframes
		}: {
			name: string;
			image: string;
			hframes: number;
			vframes: number;
		}) {
			const fileName = Command.removeTextTags!(Command.parseFileName!(image));
			return [name, `${fileName} [${hframes}x${vframes}]`];
		},
		createExclusionMap: function (this: { list: { data: { id: string }[] } }) {
			const exclusions = {} as Record<string, boolean>;
			for (const sprite of this.list.data) {
				exclusions[sprite.id] = true;
			}
			return exclusions;
		},
		createSpriteId: function (
			this: typeof FileAnimation,
			exclusions: Record<string, boolean> = (
				FileAnimation.interface as { createExclusionMap: () => Record<string, boolean> }
			).createExclusionMap()
		) {
			let id;
			do {
				id = GUID.generate64bit();
			} while (exclusions[id]);
			return id;
		},
		open: function (
			this: typeof FileAnimation,
			{
				name = '',
				id = (FileAnimation.interface as { createSpriteId: () => string }).createSpriteId(),
				image = '',
				hframes = 1,
				vframes = 1
			} = {}
		) {
			Window.open!('fileAnimation-sprite');
			Object.assign(fileAnimationSpriteForm, { name, image, hframes, vframes });
			this.spriteId = id;
			if (!name) {
				requestFocus('fileAnimation-sprite-name');
			} else {
				requestFocus('fileAnimation-sprite-image');
			}
		},
		save: function (this: { spriteId: string }) {
			const name = fileAnimationSpriteForm.name.trim();
			if (!name) {
				return requestFocus('fileAnimation-sprite-name');
			}
			const image = fileAnimationSpriteForm.image;
			const hframes = fileAnimationSpriteForm.hframes;
			const vframes = fileAnimationSpriteForm.vframes;
			const id = this.spriteId;
			Window.close!('fileAnimation-sprite');
			return { name, id, image, hframes, vframes };
		},
		onPaste: function (this: typeof FileAnimation, _list: HTMLElement, copies: unknown[]) {
			const exclusions = (
				FileAnimation.interface as { createExclusionMap: () => Record<string, boolean> }
			).createExclusionMap();
			for (const sprite of copies as Array<{ id: string }>) {
				if (sprite.id in exclusions) {
					const id = (
						FileAnimation.interface as {
							createSpriteId: (exclusions?: Record<string, boolean>) => string;
						}
					).createSpriteId(exclusions);
					sprite.id = id;
				}
				exclusions[sprite.id] = true;
			}
		}
	};

	Inspector.fileAnimation = FileAnimation;
}

export interface FileAnimationSpriteForm {
	name: string;
	image: string;
	hframes: number;
	vframes: number;
}
export const fileAnimationSpriteForm = reactive<FileAnimationSpriteForm>({
	name: '',
	image: '',
	hframes: 1,
	vframes: 1
});
