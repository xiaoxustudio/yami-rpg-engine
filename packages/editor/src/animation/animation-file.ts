import { Animation } from './animation-window.ts';
import type { AnimationFileContext } from './animation-window.ts';
import { Window } from '@app/tools/window-object.ts';
import { clear, hide, show, write } from '@app/utils/element-utils.ts';
import { TreeList } from '@app/components/tree-list.ts';
import { Data } from '@app/data/data-object.ts';
import { Inspector } from '@app/inspector/inspector.ts';
import { Layout } from '@app/engine/layout/layout.ts';
import { Particle } from '@app/particle/particle-window.ts';
import { History } from '@app/tools/history.ts';
import { UndoManager } from '@app/tools/undo-manager.ts';
import { getAnimationStore } from '@app/stores/animation';

Animation.open = function (this: typeof Animation, context: AnimationFileContext) {
	if (this.context === context) {
		return;
	}
	this.save!();
	this.close!();

	Particle.Element.stage = this;

	const { meta } = context;
	if (!context.animation) {
		context.animation = Data.animations[meta.guid];
	}
	if (context.animation) {
		getAnimationStore().state = 'open';
		this.context = context;
		this.meta = meta;
		show(this.body);
		this.load!(context);
		this.resize!();
		this.requestRendering!();
	} else {
		Layout.manager.switch('directory');
		Window.confirm!(
			{
				message: `Failed to read file: ${meta.path}`
			},
			[
				{
					label: 'Confirm'
				}
			]
		);
	}
};

Animation.load = function (this: typeof Animation, context: AnimationFileContext) {
	const firstLoad = !context.editor;
	if (firstLoad) {
		const data = { mode: '1-dir', sprites: [], motions: [] };
		const player = new Animation.Player!(data);
		player.onionskin = { prev: [], next: [] };
		context.editor = {
			motion: null,
			target: null,
			player: player,
			history: new History(100),
			centerX: 0,
			centerY: 0,
			selectionX: 0,
			selectionLength: 0,
			listScrollTop: 0
		};
	}
	const editor = context.editor!;
	const { animation } = context;

	getAnimationStore().mode = animation.mode;
	this.sprites = animation.sprites;
	this.motions = animation.motions;

	this.player = editor.player;
	this.history = editor.history;
	this.centerX = editor.centerX;
	this.centerY = editor.centerY;

	Animation.Player.matrix.reset();

	if (firstLoad) {
		this.loadTextures!();
	}

	this.list.update();

	this.setMotion!(editor.motion);

	if (editor.target) {
		this.selectFrame!(editor.target, editor.selectionX, editor.selectionLength);
	}

	UndoManager.setActive!(Animation as never);
};

Animation.save = function (this: typeof Animation) {
	if (getAnimationStore().state === 'open') {
		const { animation, editor } = this.context;

		animation.mode = getAnimationStore().mode!;
		animation.sprites = this.sprites;
		animation.motions = this.motions;

		editor.motion = getAnimationStore().motion;
		editor.target = getAnimationStore().target;
		editor.player = this.player;
		editor.history = this.history;
		editor.centerX = this.centerX;
		editor.centerY = this.centerY;
		editor.selectionX = this.timelineMarquee.x;
		editor.selectionLength = this.timelineMarquee.length;
	}
};

Animation.close = function (this: typeof Animation) {
	if (getAnimationStore().state !== 'closed') {
		this.screen.blur();
		this.setMotion!(null);
		if (Inspector.type === 'fileAnimation') {
			Inspector.close!();
		}
		getAnimationStore().state = 'closed';
		this.context = null;
		this.meta = null;
		this.player = null!;
		getAnimationStore().mode = null;
		this.sprites = null!;
		this.motions = null;
		this.history = null!;
		write(this.searcher, '');
		clear(this.list);
		clear(this.layerList);
		clear(this.innerTimelineList);
		hide(this.body);
		this.stop!();
		this.stopAnimation!();
		this.stopRendering!();
		this.stopPlayingSound!();
		UndoManager.setActive!(null);
	}
};

Animation.destroy = function (this: typeof Animation, context: AnimationFileContext) {
	if (!context.editor) return;
	if (this.context === context) {
		this.save!();
		this.close!();
	}
	context.editor.player.destroy();
	TreeList.deleteCaches!(context.animation.motions);
};
