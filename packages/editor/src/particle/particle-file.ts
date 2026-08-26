import { Particle } from './particle-window.ts';
import type {
	ParticleContextShape,
	ParticleEmitterDataShape,
	ParticleEmitterShape,
	ParticleLayerShape
} from './particle-window.ts';
import { TreeList } from '@app/components/tree-list.ts';
import { Data } from '@app/data/data-object.ts';
import { Layout } from '@app/engine/layout/layout.ts';
import { History } from '@app/tools/history.ts';
import { UndoManager } from '@app/tools/undo-manager.ts';
import { Window } from '@app/tools/window-object.ts';
import { hide, show } from '@app/utils/element-utils.ts';
import { getParticleStore } from '@app/stores/particle';

Particle.open = function (this: typeof Particle, context: ParticleContextShape) {
	if (this.context === context) {
		return;
	}
	this.save!();
	this.close!();

	Particle.Element.stage = this;

	const { meta } = context;
	if (!context.particle) {
		context.particle = Data.particles[meta.guid];
	}
	if (context.particle) {
		getParticleStore().state = 'open';
		this.context = context;
		this.meta = meta;
		show(this.body);
		this.load!(context);
		this.resize!();
		this.requestAnimation!();
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

Particle.load = function (this: typeof Particle, context: ParticleContextShape) {
	if (!context.editor) {
		context.editor = {
			target: null,
			emitter: new Particle.Emitter(context.particle! as unknown as ParticleEmitterDataShape),
			history: new History(100),
			centerX: 0,
			centerY: 0,
			paused: false
		};
	}
	const { particle, editor } = context;

	this.layers = (particle! as { layers: ParticleLayerShape[] }).layers;

	this.emitter = editor.emitter;
	this.history = editor.history;
	this.centerX = editor.centerX;
	this.centerY = editor.centerY;

	this.switchPause!(editor.paused);

	this.list.update();

	this.emitter.updateEasing();

	this.computeOuterRect!();

	this.setTarget!(editor.target);

	UndoManager.setActive(Particle);
};

Particle.save = function () {
	if (getParticleStore().state === 'open') {
		const { editor } = this.context!;

		editor.target = getParticleStore().target;
		editor.emitter = this.emitter;
		editor.history = this.history!;
		editor.centerX = this.centerX!;
		editor.centerY = this.centerY!;
		editor.paused = getParticleStore().paused;
	}
};

Particle.close = function () {
	if (getParticleStore().state !== 'closed') {
		this.screen?.blur();
		this.setTarget!(null);
		getParticleStore().state = 'closed';
		this.context = null;
		this.meta = null;
		this.layers = null;
		this.emitter = null as unknown as ParticleEmitterShape;
		this.history = null;
		hide(this.body);
		this.stopAnimation!();
		this.stopRendering!();
		UndoManager.setActive(null);
	}
};

Particle.destroy = function (this: typeof Particle, context: ParticleContextShape) {
	if (!context.editor) return;
	if (this.context === context) {
		this.save!();
		this.close!();
	}
	context.editor.emitter.destroy();
	TreeList.deleteCaches(
		(context.particle! as { layers: unknown }).layers as Parameters<
			typeof TreeList.deleteCaches
		>[0]
	);
};

Particle.restart = function () {
	this.emitter.clear();
	this.requestRendering!();
};
