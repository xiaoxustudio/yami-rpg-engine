import { useLocalizedOptions } from '@app/composables/useLocalizedOptions';
import { Data } from '@app/data/data-object.ts';
import { on } from '@app/utils/element-utils.ts';
import type { YamiElement } from '@app/types/element-api';

export interface FieldControl {
	read?: () => unknown;
	write?: (value: unknown) => void;
	loadItems?: (items: unknown[]) => unknown;
	enableHiddenMode?: () => { relate?: (entries: unknown) => unknown } | undefined;
	restore?: () => unknown;
	root?: HTMLElement | null;
}

/**
 * set-number-operand 窗口的字段选项 / 联动配置（原 `SetNumberOperand.vue` 的 `onMounted` 大块）。
 * 由组件在 `onMounted` 内以**共享的 `fieldEls`** 与窗口根元素调用；
 * `useLocalizedOptions` 走全局 Composer，在此上下文中可安全调用。
 * 缺 `setNumber-operation` 控件时整体跳过（与原逻辑一致）。
 */
export function setupSetNumberOperandFields(
	fieldEls: Map<string, FieldControl | null>,
	frameEl: HTMLElement | null | undefined
): void {
	const opEl = fieldEls.get('setNumber-operation');
	if (!opEl) return;
	opEl.loadItems?.([
		{ name: 'Set', value: 'set' },
		{ name: 'Add', value: 'add' },
		{ name: 'Sub', value: 'sub' },
		{ name: 'Mul', value: 'mul' },
		{ name: 'Div', value: 'div' },
		{ name: 'Mod', value: 'mod' }
	]);

	useLocalizedOptions(
		'setNumber-operand-operation',
		['add', 'sub', 'mul', 'div', 'mod', 'add()', 'sub()', 'mul()', 'div()', 'mod()'],
		(items) => fieldEls.get('setNumber-operand-operation')?.loadItems?.(items)
	);

	useLocalizedOptions(
		'setNumber-operand-type',
		[
			'constant',
			'variable',
			'math',
			'string',
			'object',
			'element',
			'list',
			'parameter',
			'script',
			'other'
		],
		(items) => fieldEls.get('setNumber-operand-type')?.loadItems?.(items)
	);

	fieldEls
		.get('setNumber-operand-type')
		?.enableHiddenMode?.()
		?.relate?.([
			{
				case: 'constant',
				targets: [fieldEls.get('setNumber-operand-constant-value')?.root]
			},
			{
				case: 'variable',
				targets: [fieldEls.get('setNumber-operand-common-variable')?.root]
			},
			{ case: 'math', targets: [fieldEls.get('setNumber-operand-math-method')?.root] },
			{
				case: 'string',
				targets: [
					fieldEls.get('setNumber-operand-string-method')?.root,
					fieldEls.get('setNumber-operand-common-variable')?.root
				]
			},
			{
				case: 'object',
				targets: [fieldEls.get('setNumber-operand-object-property')?.root]
			},
			{
				case: 'element',
				targets: [
					fieldEls.get('setNumber-operand-element-property')?.root,
					fieldEls.get('setNumber-operand-element-element')?.root
				]
			},
			{
				case: 'list',
				targets: [
					fieldEls.get('setNumber-operand-common-variable')?.root,
					fieldEls.get('setNumber-operand-list-index')?.root
				]
			},
			{
				case: 'parameter',
				targets: [fieldEls.get('setNumber-operand-parameter-key')?.root]
			},
			{ case: 'script', targets: [fieldEls.get('setNumber-operand-script')?.root] },
			{ case: 'other', targets: [fieldEls.get('setNumber-operand-other-data')?.root] }
		]);

	useLocalizedOptions(
		'setNumber-operand-math-method',
		[
			'round',
			'floor',
			'ceil',
			'sqrt',
			'abs',
			'cos',
			'sin',
			'tan',
			'random',
			'random-int',
			'distance',
			'distance-x',
			'distance-y',
			'relative-angle'
		],
		(items) => fieldEls.get('setNumber-operand-math-method')?.loadItems?.(items)
	);

	fieldEls
		.get('setNumber-operand-math-method')
		?.enableHiddenMode?.()
		?.relate?.([
			{
				case: 'round',
				targets: [
					fieldEls.get('setNumber-operand-common-variable')?.root,
					fieldEls.get('setNumber-operand-math-decimals')?.root
				]
			},
			{
				case: ['floor', 'ceil', 'sqrt', 'abs', 'cos', 'sin', 'tan'],
				targets: [fieldEls.get('setNumber-operand-common-variable')?.root]
			},
			{
				case: 'random-int',
				targets: [
					fieldEls.get('setNumber-operand-math-min')?.root,
					fieldEls.get('setNumber-operand-math-max')?.root
				]
			},
			{
				case: ['distance', 'distance-x', 'distance-y', 'relative-angle'],
				targets: [
					fieldEls.get('setNumber-operand-math-startPosition')?.root,
					fieldEls.get('setNumber-operand-math-endPosition')?.root
				]
			}
		]);

	useLocalizedOptions('setNumber-operand-string-method', ['length', 'parse', 'search'], (items) =>
		fieldEls.get('setNumber-operand-string-method')?.loadItems?.(items)
	);

	fieldEls
		.get('setNumber-operand-string-method')
		?.enableHiddenMode?.()
		?.relate?.([
			{
				case: ['length', 'parse'],
				targets: [fieldEls.get('setNumber-operand-common-variable')?.root]
			},
			{
				case: 'search',
				targets: [
					fieldEls.get('setNumber-operand-common-variable')?.root,
					fieldEls.get('setNumber-operand-string-search')?.root
				]
			}
		]);

	useLocalizedOptions(
		'setNumber-operand-object-property',
		[
			'actor-x',
			'actor-y',
			'actor-ui-x',
			'actor-ui-y',
			'actor-screen-x',
			'actor-screen-y',
			'actor-angle',
			'actor-direction',
			'actor-movement-speed',
			'actor-collision-size',
			'actor-collision-weight',
			'actor-scaling-factor',
			'actor-inventory-item-quantity',
			'actor-inventory-equipment-quantity',
			'actor-inventory-money',
			'actor-inventory-used-space',
			'actor-inventory-version',
			'actor-skill-version',
			'actor-state-version',
			'actor-equipment-version',
			'actor-shortcut-version',
			'actor-animation-current-time',
			'actor-animation-duration',
			'actor-animation-progress',
			'actor-cooldown-time',
			'actor-cooldown-duration',
			'actor-cooldown-progress',
			'skill-cooldown-time',
			'skill-cooldown-duration',
			'skill-cooldown-progress',
			'state-current-time',
			'state-duration',
			'state-progress',
			'equipment-order',
			'item-order',
			'item-quantity',
			'trigger-speed',
			'trigger-angle',
			'tilemap-width',
			'tilemap-height',
			'tilemap-tag',
			'list-length'
		],
		(items) => fieldEls.get('setNumber-operand-object-property')?.loadItems?.(items)
	);

	fieldEls
		.get('setNumber-operand-object-property')
		?.enableHiddenMode?.()
		?.relate?.([
			{
				case: [
					'actor-x',
					'actor-y',
					'actor-ui-x',
					'actor-ui-y',
					'actor-screen-x',
					'actor-screen-y',
					'actor-angle',
					'actor-direction',
					'actor-movement-speed',
					'actor-collision-size',
					'actor-collision-weight',
					'actor-scaling-factor',
					'actor-inventory-money',
					'actor-inventory-used-space',
					'actor-inventory-version',
					'actor-skill-version',
					'actor-state-version',
					'actor-equipment-version',
					'actor-shortcut-version',
					'actor-animation-current-time',
					'actor-animation-duration',
					'actor-animation-progress'
				],
				targets: [fieldEls.get('setNumber-operand-common-actor')?.root]
			},
			{
				case: 'actor-inventory-item-quantity',
				targets: [
					fieldEls.get('setNumber-operand-common-actor')?.root,
					fieldEls.get('setNumber-operand-object-itemId')?.root
				]
			},
			{
				case: 'actor-inventory-equipment-quantity',
				targets: [
					fieldEls.get('setNumber-operand-common-actor')?.root,
					fieldEls.get('setNumber-operand-object-equipmentId')?.root
				]
			},
			{
				case: ['actor-cooldown-time', 'actor-cooldown-duration', 'actor-cooldown-progress'],
				targets: [
					fieldEls.get('setNumber-operand-common-actor')?.root,
					fieldEls.get('setNumber-operand-cooldown-key')?.root
				]
			},
			{
				case: ['skill-cooldown-time', 'skill-cooldown-duration', 'skill-cooldown-progress'],
				targets: [fieldEls.get('setNumber-operand-common-skill')?.root]
			},
			{
				case: ['state-current-time', 'state-duration', 'state-progress'],
				targets: [fieldEls.get('setNumber-operand-common-state')?.root]
			},
			{
				case: 'equipment-order',
				targets: [fieldEls.get('setNumber-operand-common-equipment')?.root]
			},
			{
				case: ['item-order', 'item-quantity'],
				targets: [fieldEls.get('setNumber-operand-common-item')?.root]
			},
			{
				case: ['trigger-speed', 'trigger-angle'],
				targets: [fieldEls.get('setNumber-operand-common-trigger')?.root]
			},
			{
				case: ['tilemap-width', 'tilemap-height'],
				targets: [fieldEls.get('setNumber-operand-common-tilemap')?.root]
			},
			{
				case: 'tilemap-tag',
				targets: [
					fieldEls.get('setNumber-operand-common-tilemap')?.root,
					fieldEls.get('setNumber-operand-tilemapPosition')?.root
				]
			},
			{
				case: 'list-length',
				targets: [fieldEls.get('setNumber-operand-common-variable')?.root]
			}
		]);

	useLocalizedOptions(
		'setNumber-operand-element-property',
		[
			'element-x',
			'element-y',
			'element-width',
			'element-height',
			'element-children-count',
			'element-index-of-selected-button',
			'transform-anchorX',
			'transform-anchorY',
			'transform-x',
			'transform-y',
			'transform-width',
			'transform-height',
			'transform-x2',
			'transform-y2',
			'transform-width2',
			'transform-height2',
			'transform-rotation',
			'transform-scaleX',
			'transform-scaleY',
			'transform-skewX',
			'transform-skewY',
			'transform-opacity',
			'window-visibleGridColumns',
			'window-visibleGridRows',
			'text-textWidth',
			'text-textHeight',
			'textBox-number',
			'dialogBox-printEndX',
			'dialogBox-printEndY'
		],
		(items) => fieldEls.get('setNumber-operand-element-property')?.loadItems?.(items)
	);

	useLocalizedOptions(
		'setNumber-operand-other-data',
		[
			'trigger-button',
			'trigger-wheel-y',
			'trigger-gamepad-button',
			'gamepad-left-stick-angle',
			'gamepad-right-stick-angle',
			'mouse-screen-x',
			'mouse-screen-y',
			'mouse-ui-x',
			'mouse-ui-y',
			'mouse-scene-x',
			'mouse-scene-y',
			'touch-screen-x',
			'touch-screen-y',
			'touch-ui-x',
			'touch-ui-y',
			'touch-scene-x',
			'touch-scene-y',
			'virtual-axis-x',
			'virtual-axis-y',
			'virtual-axis-angle',
			'start-position-x',
			'start-position-y',
			'camera-x',
			'camera-y',
			'camera-zoom',
			'raw-camera-zoom',
			'screen-width',
			'screen-height',
			'scene-width',
			'scene-height',
			'scene-scale',
			'ui-scale',
			'play-time',
			'elapsed-time',
			'delta-time',
			'raw-delta-time',
			'timestamp',
			'party-version',
			'party-member-count',
			'actor-count',
			'latest-item-increment',
			'latest-money-increment',
			'loader-loaded-bytes',
			'loader-total-bytes',
			'loader-completion-progress'
		],
		(items) => fieldEls.get('setNumber-operand-other-data')?.loadItems?.(items)
	);

	fieldEls
		.get('setNumber-operand-other-data')
		?.enableHiddenMode?.()
		?.relate?.([
			{
				case: [
					'touch-screen-x',
					'touch-screen-y',
					'touch-ui-x',
					'touch-ui-y',
					'touch-scene-x',
					'touch-scene-y'
				],
				targets: [fieldEls.get('setNumber-operand-other-touchId')?.root]
			},
			{
				case: 'actor-count',
				targets: [fieldEls.get('setNumber-operand-other-teamId')?.root]
			}
		]);

	on(frameEl, 'open', () => {
		fieldEls.get('setNumber-operand-other-teamId')?.loadItems?.(Data.createTeamItems!());
	});

	on(frameEl, 'closed', () => {
		(fieldEls.get('setNumber-operation') as { root?: YamiElement } | null)?.root?.restore();
	});
}
