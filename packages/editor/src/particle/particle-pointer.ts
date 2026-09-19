import { Particle } from './particle-window.ts';
import type { ParticleShape } from './particle-window.ts';
import { Cursor } from '@app/composables/usePointerObjectWindow';
import { getParticleStore } from '@app/stores/particle';
import { relate } from '@app/utils/element-utils';
import { isDragKey } from '@app/utils/event-accessors';
import type { DragEventItem } from '@app/scene/scene-events.ts';

Particle.marqueePointerdown = function (
	this: ParticleShape,
	event: DragEventItem & { startX?: number; startY?: number; enabled?: boolean }
) {
	if (this.dragging) {
		return;
	}
	switch (event.button) {
		case 0:
			if (!isDragKey(event)) {
				const emitter = this.emitter!;
				if (emitter.active) {
					emitter.selected = true;
					if (getParticleStore().paused) break;
					this.dragging = event;
					event.mode = 'object-move';
					event.enabled = false;
					event.startX = emitter.startX;
					event.startY = emitter.startY;
					window.addEventListener('pointerup', this.pointerup!);
					window.addEventListener('pointermove', this.pointermove!);
				} else {
					emitter.selected = false;
				}
				this.requestRendering!();
				break;
			}
		case 2:
			this.dragging = event;
			event.mode = 'scroll';
			event.scrollLeft = this.screen.scrollLeft;
			event.scrollTop = this.screen.scrollTop;
			Cursor.open('cursor-grab');
			window.addEventListener('pointerup', this.pointerup!);
			window.addEventListener('pointermove', this.pointermove!);
			break;
	}
}.bind(Particle);

Particle.marqueePointermove = function (this: ParticleShape, event: PointerEvent) {
	if (!this.dragging) {
		this.marquee.pointerevent = event;
		const { x, y } = this.getPointerCoords!(event);
		const active = this.selectEmitter!(x, y);
		if (this.emitter!.active !== active) {
			this.emitter!.active = active;
			this.requestRendering!();
		}
	}
}.bind(Particle);

Particle.marqueePointerleave = function (this: ParticleShape, _event: PointerEvent) {
	if (this.marquee.pointerevent) {
		this.marquee.pointerevent = null;
		if (this.emitter?.active) {
			this.emitter.active = false;
			this.requestRendering!();
		}
	}
}.bind(Particle);

Particle.pointerup = function (event: PointerEvent | undefined) {
	const { dragging } = Particle;
	if (dragging === null) {
		return;
	}
	if (event === undefined) {
		event = dragging;
	}
	if (dragging && relate(dragging, event)) {
		switch (dragging.mode) {
			case 'object-move':
				break;
			case 'scroll':
				Cursor.close('cursor-grab');
				break;
		}
		Particle.dragging = null;
		window.removeEventListener('pointerup', Particle.pointerup!);
		window.removeEventListener('pointermove', Particle.pointermove!);
	}
};

Particle.pointermove = function (event: PointerEvent) {
	const { dragging } = Particle;
	if (dragging && relate(dragging, event)) {
		switch (dragging.mode) {
			case 'object-move': {
				if (!dragging.enabled) {
					const distX = event.clientX - dragging.clientX;
					const distY = event.clientY - dragging.clientY;
					if (
						Math.sqrt(distX ** 2 + distY ** 2) > 4 ||
						event.timeStamp - dragging.timeStamp >= 500
					) {
						dragging.enabled = true;
					} else {
						break;
					}
				}
				const emitter = Particle.emitter!;
				const dpr = window.devicePixelRatio;
				const distX =
					((event.clientX - dragging.clientX) * dpr) / getParticleStore().scaleX!;
				const distY =
					((event.clientY - dragging.clientY) * dpr) / getParticleStore().scaleY!;
				const x = Math.round(dragging.startX! + distX);
				const y = Math.round(dragging.startY! + distY);
				if (emitter.startX !== x || emitter.startY !== y) {
					emitter.startX = x;
					emitter.startY = y;
					Particle.computeOuterRect!();
				}
				break;
			}
			case 'scroll': {
				const distX = event.clientX - dragging.clientX;
				const distY = event.clientY - dragging.clientY;
				Particle.screen.setScroll(
					(dragging.scrollLeft ?? 0) - distX,
					(dragging.scrollTop ?? 0) - distY
				);
				break;
			}
		}
	}
};
