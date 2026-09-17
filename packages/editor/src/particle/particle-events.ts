import { screenScrollData } from '@app/engine/screen-scroll-data';
import { Particle } from './particle-window.ts';
import { particleEls } from '@app/particle/element-registry';
import type { ParticleConfigShape, ParticleShape } from './particle-window.ts';
import { File } from '@app/file/file-system-core.ts';
import type { EditorProjectShape } from '@app/stores/editor';
import { getParticleStore } from '@app/stores/particle';
import { registerWindowKeydown } from '@app/tools/window-keydown-registry';
import { addClass, hasClass, read, removeClass } from '@app/utils/element-utils.ts';
import { StageColor } from '@app/utils/stage-color';
import type { YamiElement } from '@app/types/element-api';
import type { YamiEvent } from '@app/types/editor-event';

Particle.planToSave = function () {
	File.planToSave!(this.meta);
};

Particle.saveToConfig = function (config: ParticleConfigShape) {
	config.colors.particleBackground = this.background.hex;
};

Particle.loadFromConfig = function (config: ParticleConfigShape) {
	this.background = new StageColor(config.colors.particleBackground!, () =>
		this.requestRendering!()
	);
};

Particle.saveToProject = function (project: EditorProjectShape) {
	const { particle } = project;
	particle!.wireframe = getParticleStore().showWireframe ?? particle!.wireframe;
	particle!.anchor = getParticleStore().showAnchor ?? particle!.anchor;
	particle!.speed = getParticleStore().speed ?? particle!.speed;
	particle!.zoom = getParticleStore().zoom ?? particle!.zoom;
};

Particle.loadFromProject = function (project: EditorProjectShape) {
	const { particle } = project;
	this.switchWireframe!(particle!.wireframe!);
	this.switchAnchor!(particle!.anchor!);
	this.setSpeed!(particle!.speed!);
	this.setZoom!(particle!.zoom!);
};

Particle.webglRestored = function (_event: YamiEvent) {
	if (getParticleStore().state === 'open') {
		Particle.requestRendering!();
	}
};

Particle.windowResize = function (this: ParticleShape, _event: YamiEvent) {
	this.updateHead!();
	if (getParticleStore().state === 'open') {
		this.resize!();
		this.updateCamera!();
		this.requestRendering!();
	}
}.bind(Particle);

Particle.themechange = function (this: ParticleShape, _event: YamiEvent) {
	this.requestRendering!();
}.bind(Particle);

Particle.datachange = function (event: YamiEvent) {
	if (getParticleStore().state === 'open' && event.key === 'easings') {
		Particle.emitter.updateEasing();
	}
};

Particle.keydown = function (event: KeyboardEvent) {
	if (getParticleStore().state === 'open' && Particle.dragging === null) {
		if (event.ctrlKey || event.metaKey) {
			return;
		} else if (event.altKey) {
			return;
		} else {
			switch (event.code) {
				case 'KeyR':
					if (!Particle.restartKey) {
						Particle.restartKey = true;
						Particle.restart!();
						addClass(
							particleEls.get('particle-control-restart') as YamiElement,
							'selected'
						);
						window.addEventListener('keyup', Particle.restartKeyup!);
						window.addEventListener('blur', Particle.restartKeyup!);
					}
					break;
				case 'KeyP':
					Particle.switchPause!();
					break;
			}
		}
	}
};

registerWindowKeydown('particle', Particle.keydown);

Particle.restartKeyup = function (event: KeyboardEvent) {
	if (!Particle.restartKey) {
		return;
	}
	switch (event.code) {
		case 'KeyR':
		case undefined:
			if (Particle.restartKey) {
				Particle.restartKey = false;
				removeClass(particleEls.get('particle-control-restart') as YamiElement, 'selected');
				window.removeEventListener('keyup', Particle.restartKeyup!);
				window.removeEventListener('blur', Particle.restartKeyup!);
			}
			break;
	}
};

Particle.headPointerdown = function (event: PointerEvent) {
	if (!(event.target instanceof HTMLInputElement)) {
		event.preventDefault();
		if (document.activeElement !== Particle.screen) {
			Particle.screen.focus();
		}
	}
};

Particle.viewPointerdown = function (event: PointerEvent) {
	switch (event.button) {
		case 0: {
			const element = event.target as HTMLElement;
			if (hasClass(element, 'item')) {
				switch (element.getAttribute('value')) {
					case 'wireframe':
						return Particle.switchWireframe!();
					case 'anchor':
						return Particle.switchAnchor!();
				}
			}
			break;
		}
	}
};

Particle.controlPointerdown = function (event: PointerEvent) {
	switch (event.button) {
		case 0: {
			const element = event.target as HTMLElement;
			if (hasClass(element, 'item')) {
				switch (element.getAttribute('value')) {
					case 'restart':
						return Particle.restart!();
					case 'pause':
						return Particle.switchPause!();
				}
			}
			break;
		}
	}
};

Particle.speedInput = function (this: HTMLElement, _event: YamiEvent) {
	getParticleStore().speed = read(this);
};

Particle.zoomFocus = function (_event: YamiEvent) {
	Particle.screen.focus();
};

Particle.zoomInput = function (this: HTMLElement, _event: YamiEvent) {
	Particle.setZoom!(read(this));
};

Particle.screenKeydown = function (this: ParticleShape, event: KeyboardEvent) {
	if (getParticleStore().state === 'open' && this.dragging === null) {
		if (event.ctrlKey || event.metaKey) {
			return;
		}
		if (event.altKey) {
			return;
		}
		switch (event.code) {
			case 'Minus':
			case 'NumpadSubtract':
				this.setZoom!(getParticleStore().zoom! - 1);
				break;
			case 'Equal':
			case 'NumpadAdd':
				this.setZoom!(getParticleStore().zoom! + 1);
				break;
			case 'Digit0':
			case 'Numpad0':
				this.setZoom!(2);
				break;
		}
	}
}.bind(Particle);

Particle.screenWheel = function (this: ParticleShape, event: WheelEvent) {
	if (getParticleStore().state === 'open' && this.dragging === null) {
		event.preventDefault();
		if (event.deltaY !== 0) {
			const step = event.deltaY > 0 ? -1 : 1;
			this.setZoom!(getParticleStore().zoom! + step);
		}
	}
}.bind(Particle);

Particle.screenUserscroll = function (this: ParticleShape, _event: YamiEvent) {
	if (getParticleStore().state === 'open') {
		screenScrollData(this.screen).rawScrollLeft = this.screen.scrollLeft;
		screenScrollData(this.screen).rawScrollTop = this.screen.scrollTop;
		this.updateTransform!();
		this.requestRendering!();
	}
}.bind(Particle);

Particle.screenBlur = function (this: ParticleShape, _event: YamiEvent) {
	// this.translationKeyup() this.pointerup()
	this.marqueePointerleave!();
}.bind(Particle);
