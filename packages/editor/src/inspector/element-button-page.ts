import { inspectorEls } from './element-registry.ts';
import { radioProxyMap, type RadioProxyElement } from '@ui-kit';
import { write } from '@app/utils/element-utils';
import { Inspector } from '@app/inspector/inspector.ts';
import { getUIStore } from '@app/stores/ui';
import { UIOwner, type UIOwnerShape } from './ui-owner.ts';
import type { ButtonForm } from '@app/composables/useUIButtonPage';
import type { YamiEvent } from '@app/types/editor-event';
import { registryElement } from '@app/utils/element-registry';

{
	interface UIButtonShape {
		owner: UIOwnerShape;
		target: UIButtonData | null;
		initialize: (() => void) | null;
		/** `create()` 返回的是「实例还没挂上」的数据（`instances` 由运行时补），故 Omit 掉它 */
		create: (() => Omit<UIButtonData, 'instances'>) | null;
		open: ((node: UIButtonData) => void) | null;
		close: (() => void) | null;
		update: ((node: UIButtonData, key: string, value: unknown) => void) | null;
	}
	interface UIButtonData {
		textEffect: {
			type?: unknown;
			shadowOffsetX?: unknown;
			shadowOffsetY?: unknown;
			strokeWidth?: unknown;
			color?: unknown;
			[k: string]: unknown;
		};
		instances: { setProperty(key: string, value: unknown): void };
		[k: string]: unknown;
	}
	const UIButton: UIButtonShape = {
		owner: UIOwner,
		target: null,
		initialize: null,
		create: null,
		open: null,
		close: null,
		update: null
	};

	UIButton.initialize = function (this: typeof UIButton) {};

	UIButton.create = function (this: typeof UIButton) {
		const transform = Inspector.uiElement.createTransform();
		transform.width = 100;
		transform.height = 24;
		return {
			class: 'button',
			name: 'Button',
			enabled: true,
			expanded: false,
			hidden: false,
			locked: false,
			presetId: '',
			display: 'stretch',
			normalImage: '',
			normalClip: [0, 0, 32, 32],
			hoverImage: '',
			hoverClip: [0, 0, 32, 32],
			activeImage: '',
			activeClip: [0, 0, 32, 32],
			flip: 'none',
			clip: [0, 0, 32, 32],
			border: 1,
			imagePadding: 0,
			imageOpacity: 1,
			imageEffect: 'none',
			normalTint: [0, 0, 0, 0],
			hoverTint: [0, 0, 0, 0],
			activeTint: [0, 0, 0, 0],
			direction: 'horizontal-tb',
			horizontalAlign: 'center',
			verticalAlign: 'middle',
			content: 'New Button',
			size: 16,
			letterSpacing: 0,
			textPadding: 0,
			font: '',
			typeface: 'regular',
			textEffect: { type: 'none' },
			normalColor: 'ffffffff',
			hoverColor: 'ffffffff',
			activeColor: 'ffffffff',
			hoverSound: '',
			clickSound: '',
			pointerEvents: 'enabled',
			transform: transform,
			events: [],
			scripts: [],
			children: []
		};
	};

	UIButton.open = function (this: typeof UIButton, node: UIButtonData) {
		if (this.target !== node) {
			this.target = node;

			write(
				radioProxyMap['uiButton-horizontalAlign'] as RadioProxyElement | undefined,
				node.horizontalAlign
			);
			write(
				radioProxyMap['uiButton-verticalAlign'] as RadioProxyElement | undefined,
				node.verticalAlign
			);
			Inspector.uiElement.open(node);

			(
				inspectorEls.get('uiButton-vue-mount') as HTMLElement & {
					sync?: () => void;
				}
			)?.sync?.();
		}
	};

	UIButton.close = function (this: typeof UIButton) {
		if (this.target) {
			const uiList = getUIStore().elements.list;
			if (uiList) uiList.unselect(this.target);
			getUIStore().updateTarget();
			Inspector.uiElement.close();
			this.target = null;
		}
	};

	UIButton.update = function (
		this: typeof UIButton,
		node: UIButtonData,
		key: string,
		value: unknown
	) {
		getUIStore().planToSave();
		// const element = node.instance
		switch (key) {
			case 'horizontalAlign':
				if (node.horizontalAlign !== value) {
					const event = window.event as YamiEvent | null;
					if (event && event.type === 'input' && event.value !== undefined) {
						getUIStore().history!.save({
							type: 'inspector-change',
							editor: this,
							target: this.target,
							changes: [
								{
									get input() {
										return radioProxyMap['uiButton-horizontalAlign'] as
											| RadioProxyElement
											| undefined;
									},
									oldValue: node.horizontalAlign,
									newValue: value
								}
							]
						});
					}
					node.horizontalAlign = value;
					// element.horizontalAlign = value
					node.instances.setProperty(key, value);
				}
				break;
			case 'verticalAlign':
				if (node.verticalAlign !== value) {
					const event = window.event as YamiEvent | null;
					if (event && event.type === 'input' && event.value !== undefined) {
						getUIStore().history!.save({
							type: 'inspector-change',
							editor: this,
							target: this.target,
							changes: [
								{
									get input() {
										return radioProxyMap['uiButton-verticalAlign'] as
											| RadioProxyElement
											| undefined;
									},
									oldValue: node.verticalAlign,
									newValue: value
								}
							]
						});
					}
					node.verticalAlign = value;
					// element.verticalAlign = value
					node.instances.setProperty(key, value);
				}
				break;
			case 'normalImage':
			case 'normalClip':
			case 'hoverImage':
			case 'hoverClip':
			case 'activeImage':
			case 'activeClip':
			case 'normalColor':
			case 'hoverColor':
			case 'activeColor':
				if (node[key] !== value) {
					node[key] = value;
					// element[key] = value element.state = 'changed'
					node.instances.setProperty(key, value);
					node.instances.setProperty('state', 'changed');
				}
				break;
			case 'content':
				// 闂佺儵鏅涢悺銊ф暜鐎涙ê绶炵€广儱鎳庨悡鎴︽煥濞戞ɑ婀版繛鎻掓健瀵剟骞忓畝濠傛闁荤喎鐨濋崑鎾绘煕閺嵮勫櫢闁煎灚鍨块幆鍐礋椤愩垺鏆ラ柣?
				node[key] = value;
				// element[key] = value
				node.instances.setProperty(key, value);
				break;
			case 'display':
			case 'flip':
			case 'clip':
			case 'border':
			case 'imagePadding':
			case 'imageOpacity':
			case 'imageEffect':
			case 'direction':
			case 'size':
			case 'letterSpacing':
			case 'textPadding':
			case 'font':
			case 'typeface':
			case 'hoverSound':
			case 'clickSound':
				if (node[key] !== value) {
					node[key] = value;
					// element[key] = value
					node.instances.setProperty(key, value);
				}
				break;
			case 'normalTint-0':
			case 'normalTint-1':
			case 'normalTint-2':
			case 'normalTint-3':
			case 'hoverTint-0':
			case 'hoverTint-1':
			case 'hoverTint-2':
			case 'hoverTint-3':
			case 'activeTint-0':
			case 'activeTint-1':
			case 'activeTint-2':
			case 'activeTint-3': {
				const [property, index] = key.split('-');
				if ((node[property] as unknown[])[Number(index)] !== value) {
					(node[property] as unknown[])[Number(index)] = value;
					// element[property][index] = value element.state = 'changed'
					node.instances.setProperty(key, value);
					node.instances.setProperty('state', 'changed');
				}
				break;
			}
			case 'textEffect-type':
				if (node.textEffect.type !== value) {
					const form = registryElement<HTMLElement & { form?: ButtonForm }>(
						inspectorEls,
						'uiButton-vue-mount'
					)?.form;
					const textEffect: Record<string, unknown> = { type: value };
					switch (value) {
						case 'none':
							break;
						case 'shadow':
							textEffect.shadowOffsetX = form?.textEffect.shadowOffsetX;
							textEffect.shadowOffsetY = form?.textEffect.shadowOffsetY;
							textEffect.color = form?.textEffect.color;
							break;
						case 'stroke':
							textEffect.strokeWidth = form?.textEffect.strokeWidth;
							textEffect.color = form?.textEffect.color;
							break;
						case 'outline':
							textEffect.color = form?.textEffect.color;
							break;
					}
					node.textEffect = textEffect;
					// element.textEffect = textEffect
					node.instances.setProperty('textEffect', textEffect);
				}
				break;
			case 'textEffect-shadowOffsetX':
			case 'textEffect-shadowOffsetY':
			case 'textEffect-strokeWidth':
			case 'textEffect-color': {
				const index = key.indexOf('-') + 1;
				const property = key.slice(index);
				if (node.textEffect[property] !== value) {
					node.textEffect[property] = value;
					// element.textEffect = node.textEffect
					node.instances.setProperty('textEffect', node.textEffect);
				}
				break;
			}
		}
		getUIStore().requestRendering();
	};

	Inspector.uiButton = UIButton;
}
