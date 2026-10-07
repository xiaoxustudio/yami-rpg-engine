import { sceneEls } from '@app/scene/element-registry';
import { addClass, hide, removeClass, setTooltip, show } from '@app/utils/element-utils';
import { Scene } from './scene-window.ts';
import type { YamiElement } from '@app/types/element-api';

interface TilemapData {
	shortcut: number;
	name: string;
	[k: string]: unknown;
}

export class TilemapShortcuts {
	tilemaps: TilemapData[];
	[index: number]: TilemapData | null;

	constructor(tilemaps: TilemapData[]) {
		this.tilemaps = tilemaps;
		this.reset();
	}

	reset(): void {
		this[1] = null;
		this[2] = null;
		this[3] = null;
		this[4] = null;
		this[5] = null;
		this[6] = null;
	}

	update(): void {
		this.reset();
		for (const tilemap of this.tilemaps) {
			const { shortcut } = tilemap;
			if (shortcut !== 0) {
				this[shortcut] = tilemap;
			}
		}
		const { elements } = TilemapShortcuts;
		const opening = Scene.tilemap;
		for (let i = 1; i <= 6; i++) {
			const element = elements[i];
			const tilemap = this[i];
			if (tilemap) {
				if (tilemap === opening) addClass(element, 'selected');
				show(element);
			} else {
				removeClass(element, 'selected');
				hide(element);
			}
		}
		Scene.head.width = 0;
		Scene.updateHead();
	}

	getEmptyIndex(): number {
		for (let i = 1; i <= 6; i++) {
			if (!this[i]) return i;
		}
		return 0;
	}

	static elements: { [index: number]: HTMLElement } = {};

	static initialize(): void {
		this.elements = {
			get 1() {
				return sceneEls.get('scene-layer-tilemap-1') as YamiElement;
			},
			get 2() {
				return sceneEls.get('scene-layer-tilemap-2') as YamiElement;
			},
			get 3() {
				return sceneEls.get('scene-layer-tilemap-3') as YamiElement;
			},
			get 4() {
				return sceneEls.get('scene-layer-tilemap-4') as YamiElement;
			},
			get 5() {
				return sceneEls.get('scene-layer-tilemap-5') as YamiElement;
			},
			get 6() {
				return sceneEls.get('scene-layer-tilemap-6') as YamiElement;
			}
		};
		const { elements } = this;
		for (let i = 1; i <= 6; i++) {
			setTooltip(elements[i], () => {
				const tilemap = Scene.tilemaps?.shortcuts[i];
				return tilemap ? `<b>${tilemap.name}</b>` : '';
			});
		}
	}
}
