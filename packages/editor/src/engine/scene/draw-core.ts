import { Data } from '@app/data/data-object.ts';
import { Scene } from '@app/scene/scene-window.ts';
import { GL } from '@app/engine/webgl/webgl-init.ts';

export const drawScene = function (this: typeof Scene) {
	if (GL.width * GL.height === 0) {
		return;
	}
	switch (this.layer) {
		case 'object':
			this.drawLightTextures!();
			this.drawBackgrounds!();
			this.drawRegionLayer!();
			this.drawStartPosition!();
			this.drawGridLayer!();
			this.drawAnimationWireframe!();
			this.drawObjectLayer!();
			this.drawDirectLightLayer!();
			this.drawForegrounds!();
			this.drawRegionBorders!();
			this.drawRegionWireframe!();
			this.drawLightWireframe!();
			this.drawAnimationAnchor!();
			this.drawParticleEmitterWireframe!();
			this.drawTilemapWireframe!();
			this.drawParallaxWireframe!();
			this.drawNameLayer!();
			break;
		case 'tilemap':
			this.drawLightTextures!();
			this.drawBackgrounds!();
			this.drawObjectLayer!();
			this.drawDirectLightLayer!();
			this.drawForegrounds!();
			GL.alpha = 0.25;
			this.drawTilePreview!();
			GL.alpha = 1;
			this.drawGridLayer!();
			this.drawTileMarquee!();
			break;
		case 'terrain':
			this.drawLightTextures!();
			this.drawBackgrounds!();
			this.drawObjectLayer!();
			this.drawDirectLightLayer!();
			this.drawForegrounds!();
			this.drawGridLayer!();
			this.drawTerrainLayer!();
			this.drawTerrainMarquee!();
			break;
	}
};

export const drawBackgrounds = function (this: typeof Scene) {
	GL.clearColor!(...this.background.getGLRGBA());
	GL.clear!(GL.COLOR_BUFFER_BIT);
	const activeId = this.activeTilemapId;
	const backgrounds = this.backgrounds;
	const length = backgrounds.length;
	for (let i = 0; i < length; i++) {
		const object = backgrounds[i];
		if (object.hidden && i !== activeId) {
			continue;
		}
		switch (object.class) {
			case 'parallax':
				object.player.draw(i);
				continue;
			case 'tilemap':
				this.drawTilemap!(object, i);
				continue;
		}
	}
	GL.alpha = 1;
};

export const drawForegrounds = function (this: typeof Scene) {
	const activeId = this.activeTilemapId;
	const foregrounds = this.foregrounds;
	const length = foregrounds.length;
	for (let i = 0; i < length; i++) {
		const object = foregrounds[i];
		const id = i | 0x20000;
		if (object.hidden && id !== activeId) {
			continue;
		}
		switch (object.class) {
			case 'parallax':
				object.player.draw(id);
				continue;
			case 'tilemap':
				this.drawTilemap!(object, id);
				continue;
		}
	}
	GL.alpha = 1;
};

export const updateAnimations = function (this: typeof Scene, deltaTime: number) {
	const lightmap = GL.reflectedLightMap;
	const area = Data.config.animationArea;
	const th = this.tileHeight;
	const sl = this.scrollLeft - area.expansionLeft;
	const st = this.scrollTop - area.expansionTop;
	const sr = this.scrollRight + area.expansionRight;
	const sb = this.scrollBottom + area.expansionBottom;
	const ll = this.scrollLeft - lightmap.maxExpansionLeft;
	const lt = this.scrollTop - lightmap.maxExpansionTop;
	const lr = this.scrollRight + lightmap.maxExpansionRight;
	const lb = this.scrollBottom + lightmap.maxExpansionBottom;
	const lw = lr - ll;
	const lh = lb - lt;
	const pFactor = th / lh;
	const { showAnimation } = this;
	const { actors, animations } = this;
	for (let i = 0; i < 2; i++) {
		const list = i === 0 ? actors : animations;
		const length = list.length;
		for (let i = 0; i < length; i++) {
			const object = list[i];
			if (object.hidden) continue;
			const player = object.player;
			if (player.motion !== null) {
				player.update(deltaTime);
				const { x, y } = this.getConvertedCoords!(object);
				if (x >= sl && x < sr && y >= st && y < sb) {
					const priority = (object.priority ?? object.data?.priority ?? 0) * pFactor;
					player.setPosition(x, y);
					player.updateFrameParameters(player.contexts, player.index);
					player.anchorX = (x - ll) / lw;
					player.anchorY = (y - lt) / lh + priority;
					player.visible = true;
					if (showAnimation) {
						player.emitParticles(deltaTime);
						player.updateParticles(deltaTime);
					}
				} else {
					player.visible = false;
					if (
						showAnimation &&
						player.emitters.length !== 0 &&
						player.updateParticles(deltaTime) !== 0
					) {
						player.visible = true;
					}
				}
			}
		}
	}
};

export const updateParticles = function (this: typeof Scene, deltaTime: number) {
	if (this.showAnimation) {
		const lightmap = GL.reflectedLightMap;
		const area = Data.config.animationArea;
		const th = this.tileHeight;
		const al = this.scrollLeft - area.expansionLeft;
		const at = this.scrollTop - area.expansionTop;
		const ar = this.scrollRight + area.expansionRight;
		const ab = this.scrollBottom + area.expansionBottom;
		const lt = this.scrollTop - lightmap.maxExpansionTop;
		const lh = this.scrollBottom + lightmap.maxExpansionBottom - lt;
		const pFactor = th / lh;
		const particles = this.particles;
		const length = particles.length;
		for (let i = 0; i < length; i++) {
			const particle = particles[i];
			if (particle.hidden) continue;
			const emitter = particle.emitter;
			if (emitter === undefined) continue;
			const { x, y } = this.getConvertedCoords!(particle);
			if ((x >= al && x < ar && y >= at && y < ab) || emitter.alwaysEmit) {
				const priority = particle.priority * pFactor;
				emitter.anchorY = (y - lt) / lh + priority;
				emitter.startX = x;
				emitter.startY = y;
				emitter.emitParticles(deltaTime);
				emitter.updateParticles(deltaTime);
				emitter.visible = true;
			} else {
				emitter.updateParticles(deltaTime);
				emitter.visible = false;
			}
		}
	}
};
