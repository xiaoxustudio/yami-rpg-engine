import { GL } from '@app/engine/webgl/webgl-init.ts';
import { UI } from '@app/ui/ui-window.ts';
import { append, remove } from '@app/utils/array';

interface PrefabElementShape {
	node: { presetId: unknown; [k: string]: unknown } | null;
	parent: unknown;
	// oxlint-disable-next-line no-explicit-any
	[k: string]: any;
}

UI.Root = class RootElement extends UI.Element {
	background: number | null;
	references: Record<string, Array<PrefabElementShape>> = {};

	constructor() {
		super({
			transform: null,
			hidden: false
		});
		this.connected = true;
		this.background = null;
	}

	draw() {
		GL.matrix.set(UI.matrix);
		GL.alpha = 1;
		GL.blend = 'normal';
		GL.fillRect(this.x, this.y, this.width, this.height, this.background);
		this.drawChildren();
	}

	resize() {
		this.x = 0;
		this.y = 0;
		this.width = UI.width;
		this.height = UI.height;
		this.background = UI.foreground.getINTRGBA();
		this.resizeChildren();
	}

	addReference(prefabElement: PrefabElementShape | null) {
		const map = this.references;
		const id = prefabElement!.node!.presetId as string;
		if (map[id] === undefined) {
			map[id] = [];
		}
		append(map[id], prefabElement!);
	}

	removeReference(prefabElement: PrefabElementShape | null) {
		const map = this.references;
		const id = prefabElement!.node!.presetId as string;
		if (map[id] !== undefined) {
			remove(map[id], prefabElement!);
		}
	}

	tryUpdateReferenceElements(element: PrefabElementShape | this | null) {
		const map = this.references;
		while (element !== this) {
			const id = element!.node!.presetId as string;
			if (id in map) {
				for (const prefab of map[id]) {
					(prefab.parent as { update(): void }).update();
				}
			}
			element = element!.parent as PrefabElementShape | null;
		}
	}

	destroy() {
		this.destroyChildren();
	}
};
