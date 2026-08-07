import { Data } from '@/data/data-object.ts';
import { Window } from '@/tools/window-object.ts';

import { show } from '@/util/element-utils';
import { Inspector } from '@/inspector/inspector.ts';
import { Animation } from '@/animation/animation-window.ts';
import { Particle } from '@/particle/particle-window.ts';
import { Light } from './light.ts';
import { Parallax } from './parallax.ts';
import { Scene } from './scene-window.ts';
Scene.loadObjects = function (this: any) {
	const actors = this.actors;
	const regions = this.regions;
	const lights = this.lights;
	const animations = this.animations;
	const particles = this.particles;
	const parallaxes = this.parallaxes;
	const tilemaps = this.tilemaps;
	const backgrounds = this.backgrounds;
	const foregrounds = this.foregrounds;
	const doodads = this.doodads;
	let tilemapIndex = 0;
	let actorIndex = 0;
	let regionIndex = 0;
	let lightIndex = 0;
	let animationIndex = 0;
	let parallaxIndex = 0;
	let particleIndex = 0;
	let backgroundIndex = 0;
	let foregroundIndex = 0;
	let doodadIndex = 0;
	const layerLoaders = {
		background: (node: any) => {
			backgrounds[backgroundIndex++] = node;
		},
		foreground: (node: any) => {
			foregrounds[foregroundIndex++] = node;
		},
		object: (node: any) => {
			doodads[doodadIndex++] = node;
		}
	};
	const loaders = {
		folder: (node: any) => load(node.children),
		actor: (node: any) => (actors[actorIndex++] = node),
		region: (node: any) => (regions[regionIndex++] = node),
		light: (node: any) => (lights[lightIndex++] = node),
		animation: (node: any) => (animations[animationIndex++] = node),
		particle: (node: any) => (particles[particleIndex++] = node),
		parallax: (node: any) => {
			parallaxes[parallaxIndex++] = node;
			(layerLoaders as Record<string, any>)[node.layer](node);
		},
		tilemap: (node: any) => {
			tilemaps[tilemapIndex++] = node;
			(layerLoaders as Record<string, any>)[node.layer](node);
		}
	};
	const load = (nodes: any) => {
		const length = nodes.length;
		for (let i = 0; i < length; i++) {
			const node = nodes[i];
			(loaders as Record<string, any>)[node.class](node);
		}
	};
	load(this.objects);
	if (tilemaps.length !== tilemapIndex) {
		tilemaps.length = tilemapIndex;
	}
	if (actors.length !== actorIndex) {
		actors.length = actorIndex;
	}
	if (regions.length !== regionIndex) {
		regions.length = regionIndex;
	}
	if (lights.length !== lightIndex) {
		lights.length = lightIndex;
	}
	if (animations.length !== animationIndex) {
		animations.length = animationIndex;
	}
	if (particles.length !== particleIndex) {
		particles.length = particleIndex;
	}
	if (parallaxes.length !== parallaxIndex) {
		parallaxes.length = parallaxIndex;
	}
	if (backgrounds.length !== backgroundIndex) {
		backgrounds.length = backgroundIndex;
	}
	if (foregrounds.length !== foregroundIndex) {
		foregrounds.length = foregroundIndex;
	}
	if (doodads.length !== doodadIndex) {
		doodads.length = doodadIndex;
	}
	this.sortLayers!();
	this.computeActiveTilemapId!();
};

Scene.loadTextures = async function (this: any) {
	if (this.state === 'closed') return;
	const promises = [] as any[];
	const textures = this.textures;
	const tilesets = Data.tilesets;
	const templates = Data.autotiles.map;
	for (const tilemap of this.tilemaps) {
		const { tiles, tilesetMap } = tilemap;
		const length = tiles.length;
		for (let i = 0; i < length; i++) {
			const tile = tiles[i];
			if (tile !== 0) {
				const guid = tilesetMap[tile >> 24];
				const tileset = tilesets[guid];
				if (tileset !== undefined) {
					switch (tileset.type) {
						case 'normal': {
							const guid = tileset.image;
							if (textures[guid] === undefined) {
								promises.push(textures.load(guid));
							}
							break;
						}
						case 'auto': {
							const tx = (tile >> 8) & 0xff;
							const ty = (tile >> 16) & 0xff;
							const id = tx + ty * tileset.width;
							const autoTile = tileset.tiles[id];
							// autoTile的值可能是0|undefined
							if (
								autoTile &&
								textures[autoTile.image] === undefined &&
								templates[autoTile.template] !== undefined
							) {
								promises.push(textures.load(autoTile.image));
							}
							break;
						}
					}
				}
			}
		}
	}
	const symbol = (this.symbol = Symbol());
	if (promises.length > 0) {
		await Promise.all(promises);
	}
	if (this.symbol === symbol) {
		this.symbol = null;
		this.state = 'open';
		show(this.body);
		this.resize!();
		this.requestAnimation!();
		this.requestRendering!();
		if ((Window.frames?.length ?? 0) === 0 && document.activeElement === document.body) {
			this.screen?.focus();
		}
	}
};

Scene.loadAllContexts = function (this: any) {
	for (const actor of this.actors) {
		this.loadActorContext!(actor);
	}
	for (const light of this.lights) {
		this.loadLightContext!(light);
	}
	for (const animation of this.animations) {
		this.loadAnimationContext!(animation);
	}
	for (const particle of this.particles) {
		this.loadParticleContext!(particle);
	}
	for (const parallax of this.parallaxes) {
		this.loadParallaxContext!(parallax);
	}
};

Scene.loadActorContext = function (this: any, actor: any) {
	if (actor.player) {
		actor.player.destroy();
		delete actor.player;
	}
	const actorId = actor.actorId;
	const data = Data.actors[actorId];
	if (data !== undefined) {
		Object.defineProperty(actor, 'data', {
			configurable: true,
			value: data
		});
		const { animationId } = data;
		const animation = Data.animations[animationId];
		if (animation !== undefined) {
			const player = new Animation.Player!(animation);
			const images = {} as Record<string, any>;
			const sprites = data.sprites;
			const length = sprites.length;
			for (let i = 0; i < length; i++) {
				const sprite = sprites[i];
				images[sprite.id] = sprite.image;
			}
			player.scale = actor.scale * data.scale;
			player.rotatable = data.rotatable;
			player.setSpriteImages(images);
			player.setMotion(data.idleMotion);
			player.setAngle(Math.radians(actor.angle));
			Object.defineProperty(actor, 'player', {
				configurable: true,
				value: player
			});
			return;
		}
	}

	Object.defineProperty(actor, 'player', {
		configurable: true,
		value: this.createDefaultAnimation!(actor)
	});
};

Scene.loadLightContext = function (this: any, light: any) {
	Object.defineProperty(light, 'instance', {
		configurable: true,
		value: new Light(light)
	});
};

Scene.loadAnimationContext = function (this: any, animation: any) {
	if (animation.player) {
		animation.player.destroy();
		delete animation.player;
	}
	const animationId = animation.animationId;
	const data = Data.animations[animationId];
	if (data !== undefined) {
		Object.defineProperty(animation, 'data', {
			configurable: true,
			value: data
		});
		const player = new Animation.Player!(data);
		player.scale = animation.scale;
		player.speed = animation.speed;
		player.opacity = animation.opacity;
		player.rotatable = animation.rotatable;
		player.setMotion(animation.motion);
		player.setAngle(Math.radians(animation.angle));
		Object.defineProperty(animation, 'player', {
			configurable: true,
			value: player
		});
		return;
	}

	Object.defineProperty(animation, 'player', {
		configurable: true,
		value: this.createDefaultAnimation!(animation)
	});
};

Scene.loadParallaxContext = function (this: any, parallax: any) {
	if (parallax.player) {
		parallax.player.destroy();
		delete parallax.player;
	}
	Object.defineProperty(parallax, 'player', {
		configurable: true,
		value: new Parallax(parallax)
	});
};

Scene.loadParticleContext = function (this: any, particle: any) {
	if (particle.emitter) {
		particle.emitter.destroy();
		delete particle.emitter;
	}
	const data = Data.particles[particle.particleId];
	if (data !== undefined) {
		const emitter = new Particle.Emitter!(data);
		emitter.bounding = emitter.calculateOuterRect();
		emitter.angle = Math.radians(particle.angle);
		emitter.scale = particle.scale;
		emitter.speed = particle.speed;
		emitter.opacity = particle.opacity;
		Object.defineProperty(particle, 'emitter', {
			configurable: true,
			value: emitter
		});
	}
};

Scene.loadObjectContext = function (this: any, object: any) {
	switch (object.class) {
		case 'actor':
			this.loadActorContext!(object);
			break;
		case 'light':
			this.loadLightContext!(object);
			break;
		case 'animation':
			this.loadAnimationContext!(object);
			break;
		case 'particle':
			this.loadParticleContext!(object);
			break;
		case 'parallax':
			this.loadParallaxContext!(object);
			break;
		case 'tilemap':
			if (object.shortcut !== 0) {
				this.tilemaps.shortcuts.update();
			}
			break;
	}
};

Scene.reloadObjectContext = function (this: any, object: any) {
	switch (object.class) {
		case 'folder':
			for (const child of object.children) {
				this.reloadObjectContext!(child);
			}
			break;
		case 'actor':
			this.loadActorContext!(object);
			break;
		case 'animation':
			this.loadAnimationContext!(object);
			break;
		case 'particle':
			this.loadParticleContext!(object);
			break;
		case 'parallax':
			this.loadParallaxContext!(object);
			break;
		case 'tilemap':
			if (object.shortcut !== 0) {
				this.tilemaps.shortcuts.update();
			}
			break;
	}
};

Scene.destroyObjectContext = function (this: any, object: any) {
	switch (object.class) {
		case 'folder':
			for (const child of object.children) {
				this.destroyObjectContext!(child);
			}
			break;
		case 'actor':
			object.player.destroy();
			delete object.player;
			break;
		case 'animation':
			object.player.destroy();
			delete object.player;
			break;
		case 'particle':
			object.emitter?.destroy();
			delete object.emitter;
			break;
		case 'parallax':
			object.player.destroy();
			delete object.player;
			break;
		case 'tilemap':
			if (this.tilemap === object) {
				this.closeTilemap!();
			}
			if (object.shortcut !== 0) {
				this.tilemaps.shortcuts.update();
			}
			break;
	}
};

Scene.createPreviewObject = function (this: any, file: any) {
	if (!this.previewObject) {
		const name = file.basename;
		const guid = file.meta.guid;
		switch (file.type) {
			case 'actor': {
				const actor = Inspector.sceneActor.create();
				actor.name = name;
				actor.actorId = guid;
				this.loadActorContext!(actor);
				this.actors.push(actor);
				this.previewObject = actor;
				break;
			}
			case 'animation': {
				const animation = Inspector.sceneAnimation.create!();
				const motionId = Data.animations[guid]?.motions[0]?.id ?? '';
				animation.name = name;
				animation.animationId = guid;
				animation.motion = motionId;
				this.loadAnimationContext!(animation);
				this.animations.push(animation);
				this.previewObject = animation;
				break;
			}
			case 'particle': {
				const particle = Inspector.sceneParticle.create!();
				particle.name = name;
				particle.particleId = guid;
				this.loadParticleContext!(particle);
				this.particles.push(particle);
				this.previewObject = particle;
				break;
			}
		}
	}
};

Scene.deletePreviewObject = function (this: any) {
	const object = this.previewObject;
	if (object) {
		switch (object.class) {
			case 'actor':
				this.actors.remove(object);
				object.player?.destroy();
				break;
			case 'animation':
				this.animations.remove(object);
				object.player?.destroy();
				break;
			case 'particle':
				this.particles.remove(object);
				object.emitter?.destroy();
				break;
		}
		this.previewObject = null;
		this.requestRendering!();
	}
};

Scene.updateParallaxes = function (this: any, deltaTime: any) {
	for (const parallax of this.parallaxes) {
		if (parallax.hidden) continue;
		parallax.player.update(deltaTime);
	}
};
