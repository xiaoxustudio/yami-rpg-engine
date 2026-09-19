import { $ } from '@app/utils/dom';
import { write } from '@app/utils/element-utils';
import { Data } from '@app/data/data-object.ts';
import { Inspector } from '@app/inspector/inspector.ts';
import { uiElClasses } from './element-classes.ts';
import { getUIStore } from '@app/stores/ui';

type ReferenceNodeShape = {
	class?: string;
	presetId: string;
	children: ReferenceNodeShape[];
	[k: string]: unknown;
};

uiElClasses.Reference = class ReferenceElement extends uiElClasses.Element! {
	_prefabId: string | undefined = undefined;
	_synchronous: boolean | undefined = undefined;
	historyEnabled = false;
	prefab: ReferenceElement | null = null;
	paths: Record<string, boolean> = {};

	constructor(data: { presetId: string; prefabId: string; synchronous?: boolean }) {
		super(data);
		this.paths[data.presetId] = true;
		this.prefabId = data.prefabId;
		this.synchronous = data.synchronous!;
	}

	get prefabId(): string | undefined {
		return this._prefabId;
	}

	set prefabId(value: string) {
		if (this._prefabId !== value) {
			const firstTime = this._prefabId === undefined;
			this._prefabId = value;
			this.clear();
			const preset = Data.uiPresets[value];
			if (preset && preset.data.class !== 'reference') {
				this.loadElement(preset.data, this);
				if (this.children.length !== 0) {
					this.prefab = this.children[0];
					getUIStore().root!.addReference(this.prefab);
					if (this.synchronous) {
						this.lockTransform();
						this.setToPrefabSize();
					} else {
						this.unlockTransform();
						if (!firstTime) {
							this.setToPrefabSize();
						}
					}
				}
			}
		}
	}

	get synchronous(): boolean | undefined {
		return this._synchronous;
	}

	set synchronous(value: boolean) {
		if (this._synchronous !== value) {
			this._synchronous = value;
			if (value) {
				this.lockTransform();
				this.setToPrefabSize();
			} else {
				this.unlockTransform();
			}
		}
	}

	setToPrefabSize() {
		if (!this.prefab) return;
		const sTransform = this.transform;
		const dTransform = this.prefab.node.transform;
		const changes = [];
		for (const key of Object.keys(dTransform)) {
			switch (key) {
				case 'x':
				case 'x2':
				case 'y':
				case 'y2':
					continue;
			}
			if (sTransform[key] !== dTransform[key]) {
				if (this.historyEnabled) {
					changes.push({
						input: $(`#uiElement-transform-${key}`),
						oldValue: sTransform[key],
						newValue: dTransform[key]
					});
				}
				sTransform[key] = dTransform[key];
			}
		}
		if (changes.length !== 0) {
			getUIStore().history!.save({
				type: 'inspector-change',
				editor: Inspector.uiElement,
				target: this.node,
				changes: changes
			});
		}
		if (Inspector.uiElement.target === this.node) {
			write(Inspector.uiElement, sTransform);
		}
		this.resize();
	}

	loadElement(node: ReferenceNodeShape, parent: ReferenceElement) {
		const { presetId } = node;
		const { paths } = parent;
		if (!(presetId in paths)) {
			const element = uiElClasses.createElement!(node, false);
			element.paths = Object.create(paths);
			element.paths[presetId] = true;
			parent.appendChild(element);
			for (const child of node.children) {
				this.loadElement(child, element);
			}
		}
	}

	update() {
		const prefab = this.prefab!;
		prefab.destroyChildren();
		prefab.children.length = 0;
		for (const node of prefab.node.children) {
			this.loadElement(node, prefab);
		}
	}

	draw() {
		this.drawChildren();
	}

	lockTransform() {
		if (this.prefab) {
			// oxlint-disable-next-line no-this-alias
			const parent = this;
			const transform = this.transform;
			this.prefab.transform = new (class Transform {
				get anchorX() {
					return 0;
				}
				set anchorX(value: number) {
					transform.anchorX = value;
					parent.resize();
				}
				get anchorY() {
					return 0;
				}
				set anchorY(value: number) {
					transform.anchorY = value;
					parent.resize();
				}
				get x() {
					return 0;
				}
				set x(_value: number) {}
				get x2() {
					return 0;
				}
				set x2(_value: number) {}
				get y() {
					return 0;
				}
				set y(_value: number) {}
				get y2() {
					return 0;
				}
				set y2(_value: number) {}
				get width() {
					return 0;
				}
				set width(value: number) {
					transform.width = value;
					parent.resize();
				}
				get width2() {
					return 1;
				}
				set width2(value: number) {
					transform.width2 = value;
					parent.resize();
				}
				get height() {
					return 0;
				}
				set height(value: number) {
					transform.height = value;
					parent.resize();
				}
				get height2() {
					return 1;
				}
				set height2(value: number) {
					transform.height2 = value;
					parent.resize();
				}
				get rotation() {
					return 0;
				}
				set rotation(value: number) {
					transform.rotation = value;
					parent.resize();
				}
				get scaleX() {
					return 1;
				}
				set scaleX(value: number) {
					transform.scaleX = value;
					parent.resize();
				}
				get scaleY() {
					return 1;
				}
				set scaleY(value: number) {
					transform.scaleY = value;
					parent.resize();
				}
				get skewX() {
					return 0;
				}
				set skewX(value: number) {
					transform.skewX = value;
					parent.resize();
				}
				get skewY() {
					return 0;
				}
				set skewY(value: number) {
					transform.skewY = value;
					parent.resize();
				}
				get opacity() {
					return 1;
				}
				set opacity(value: number) {
					transform.opacity = value;
					parent.resize();
				}
			})();
		}
		if (Inspector.uiElement.target === this.node) {
			Inspector.uiElement.lockSizeInputs();
		}
	}

	unlockTransform() {
		if (this.prefab) {
			this.prefab.transform = new (class Transform {
				get anchorX() {
					return 0;
				}
				set anchorX(_value: number) {}
				get anchorY() {
					return 0;
				}
				set anchorY(_value: number) {}
				get x() {
					return 0;
				}
				set x(_value: number) {}
				get x2() {
					return 0;
				}
				set x2(_value: number) {}
				get y() {
					return 0;
				}
				set y(_value: number) {}
				get y2() {
					return 0;
				}
				set y2(_value: number) {}
				get width() {
					return 0;
				}
				set width(_value: number) {}
				get width2() {
					return 1;
				}
				set width2(_value: number) {}
				get height() {
					return 0;
				}
				set height(_value: number) {}
				get height2() {
					return 1;
				}
				set height2(_value: number) {}
				get rotation() {
					return 0;
				}
				set rotation(_value: number) {}
				get scaleX() {
					return 1;
				}
				set scaleX(_value: number) {}
				get scaleY() {
					return 1;
				}
				set scaleY(_value: number) {}
				get skewX() {
					return 0;
				}
				set skewX(_value: number) {}
				get skewY() {
					return 0;
				}
				set skewY(_value: number) {}
				get opacity() {
					return 1;
				}
				set opacity(_value: number) {}
			})();
		}
		if (Inspector.uiElement.target === this.node) {
			Inspector.uiElement.unlockSizeInputs();
		}
	}

	resize() {
		if (this.parent instanceof uiElClasses.Window!) {
			return this.parent.requestResizing();
		}
		this.calculatePosition();
		this.resizeChildren();
	}

	destroy() {
		super.destroy();
		this.clear();
	}

	clear() {
		if (this.prefab) {
			this.getRoot().removeReference(this.prefab);
			this.prefab = null;
			this.destroyChildren();
			this.children.length = 0;
		}
	}

	getRoot() {
		if (getUIStore().root!) return getUIStore().root!;
		let element = this.parent;
		while (!(element instanceof uiElClasses.Root!)) {
			element = element.parent;
		}
		return element;
	}
};
