import { inspectorEls } from './element-registry.ts';
import { radioProxyMap, type RadioProxyElement } from '@ui-kit';
import { write } from '@app/utils/element-utils';
import { Inspector } from '@app/inspector/inspector.ts';
import { UI } from '@app/ui/ui-window.ts';
import type { TextForm } from '@app/composables/useUITextPage';
import type { YamiEvent } from '@app/types/editor-event';

{
	interface UITextShape {
		target: UITextData | null;
		update: ((node: UITextData, key: string, value: unknown) => void) | null;
		[k: string]: unknown;
	}
	interface UITextData {
		effect: Record<string, unknown>;
		instances: { setProperty(key: string, value: unknown): void };
		[k: string]: unknown;
	}
	const UIText: UITextShape = {
		owner: UI,
		target: null,
		initialize: null,
		create: null,
		open: null,
		close: null,
		update: null
	};

	UIText.initialize = function (this: typeof UIText) {};

	UIText.create = function (this: typeof UIText) {
		const transform = Inspector.uiElement.createTransform();
		transform.width = 100;
		transform.height = 24;
		return {
			class: 'text',
			name: 'Text',
			enabled: true,
			expanded: false,
			hidden: false,
			locked: false,
			presetId: '',
			direction: 'horizontal-tb',
			horizontalAlign: 'left',
			verticalAlign: 'middle',
			content: 'New Text',
			size: 16,
			lineSpacing: 0,
			letterSpacing: 0,
			color: 'ffffffff',
			font: '',
			typeface: 'regular',
			effect: { type: 'none' },
			overflow: 'visible',
			blend: 'normal',
			pointerEvents: 'enabled',
			transform: transform,
			events: [],
			scripts: [],
			children: []
		};
	};

	UIText.open = function (this: typeof UIText, node: UITextData) {
		if (this.target !== node) {
			this.target = node;

			write(
				radioProxyMap['uiText-horizontalAlign'] as RadioProxyElement | undefined,
				node.horizontalAlign
			);
			write(
				radioProxyMap['uiText-verticalAlign'] as RadioProxyElement | undefined,
				node.verticalAlign
			);
			Inspector.uiElement.open(node);

			(
				inspectorEls.get('uiText-vue-mount') as unknown as HTMLElement & {
					sync?: () => void;
				}
			)?.sync?.();
		}
	};

	UIText.close = function (this: typeof UIText) {
		if (this.target) {
			UI.list.unselect(this.target);
			UI.updateTarget!();
			Inspector.uiElement.close();
			this.target = null;
		}
	};

	UIText.update = function (this: typeof UIText, node: UITextData, key: string, value: unknown) {
		UI.planToSave!();
		// const element = node.instance
		switch (key) {
			case 'horizontalAlign':
				if (node.horizontalAlign !== value) {
					const event = window.event as YamiEvent | null;
					if (event && event.type === 'input' && event.value !== undefined) {
						UI.history.save({
							type: 'inspector-change',
							editor: this,
							target: this.target,
							changes: [
								{
									get input() {
										return radioProxyMap['uiText-horizontalAlign'] as
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
						UI.history.save({
							type: 'inspector-change',
							editor: this,
							target: this.target,
							changes: [
								{
									get input() {
										return radioProxyMap['uiText-verticalAlign'] as
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
			case 'content':
				// 闂佺儵鏅涢悺銊ф暜鐎涙ê绶炵€广儱鎳庨悡鎴︽煥濞戞ɑ婀版繛鎻掓健瀵剟骞忓畝濠傛闁荤喎鐨濋崑鎾绘煕閺嵮勫櫢闁煎灚鍨块幆鍐礋椤愩垺鏆ラ柣?
				node[key] = value;
				// element[key] = value
				node.instances.setProperty(key, value);
				break;
			case 'direction':
			case 'size':
			case 'lineSpacing':
			case 'letterSpacing':
			case 'color':
			case 'typeface':
			case 'overflow':
			case 'blend':
				if (node[key] !== value) {
					node[key] = value;
					// element[key] = value
					node.instances.setProperty(key, value);
				}
				break;
			case 'font': {
				const font = (value as string).trim();
				if (node.font !== font) {
					node.font = font;
					// element.font = font
					node.instances.setProperty(key, font);
				}
				break;
			}
			case 'effect-type':
				if (node.effect.type !== value) {
					const form = (
						inspectorEls.get('uiText-vue-mount') as unknown as unknown as
							| (HTMLElement & { form?: TextForm })
							| null
					)?.form;
					const effect: Record<string, unknown> = { type: value };
					switch (value) {
						case 'none':
							break;
						case 'shadow':
							effect.shadowOffsetX = form?.effect.shadowOffsetX;
							effect.shadowOffsetY = form?.effect.shadowOffsetY;
							effect.color = form?.effect.color;
							break;
						case 'stroke':
							effect.strokeWidth = form?.effect.strokeWidth;
							effect.color = form?.effect.color;
							break;
						case 'outline':
							effect.color = form?.effect.color;
							break;
					}
					node.effect = effect;
					// element.effect = effect
					node.instances.setProperty('effect', effect);
				}
				break;
			case 'effect-shadowOffsetX':
			case 'effect-shadowOffsetY':
			case 'effect-strokeWidth':
			case 'effect-color': {
				const index = key.indexOf('-') + 1;
				const property = key.slice(index);
				if (node.effect[property] !== value) {
					node.effect[property] = value;
					// element.effect = node.effect
					node.instances.setProperty('effect', node.effect);
				}
				break;
			}
		}
		UI.requestRendering!();
	};

	Inspector.uiText = UIText;
}
