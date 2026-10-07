import { useLocalizedOptions } from '@app/composables/useLocalizedOptions';
import { Data } from '@app/data/data-object.ts';
import type { YamiElement } from '@app/types/element-api';

export interface FieldControl {
	read?: () => unknown;
	write?: (value: unknown) => void;
	loadItems?: (items: unknown[]) => unknown;
	enableHiddenMode?: () => { relate?: (entries: unknown) => unknown } | undefined;
	root?: HTMLElement | null;
}

/**
 * if-condition 窗口的字段选项 / 联动配置（原 `IfCondition.vue` 的 `onMounted` 大块）。
 * 由组件在 `onMounted` 内以**共享的 `fieldEls`** 调用；`useLocalizedOptions` 走全局 Composer，
 * 在此上下文中可安全调用。缺 `if-condition-type` 控件时整体跳过（与原逻辑一致）。
 */
export function setupIfConditionFields(fieldEls: Map<string, FieldControl | null>): void {
	const typeEl = fieldEls.get('if-condition-type');
	if (!typeEl) return;
	typeEl.loadItems?.([
		{ name: 'Boolean', value: 'boolean' },
		{ name: 'Number', value: 'number' },
		{ name: 'String', value: 'string' },
		{ name: 'Object', value: 'object' },
		{ name: 'Actor', value: 'actor' },
		{ name: 'Element', value: 'element' },
		{ name: 'Keyboard', value: 'keyboard' },
		{ name: 'Gamepad', value: 'gamepad' },
		{ name: 'Mouse', value: 'mouse' },
		{ name: 'List', value: 'list' },
		{ name: 'Other', value: 'other' }
	]);

	typeEl.enableHiddenMode?.()?.relate?.([
		{
			case: 'boolean',
			targets: [
				fieldEls.get('if-condition-common-variable')?.root,
				fieldEls.get('if-condition-boolean-operation')?.root,
				fieldEls.get('if-condition-boolean-operand-type')?.root
			]
		},
		{
			case: 'number',
			targets: [
				fieldEls.get('if-condition-common-variable')?.root,
				fieldEls.get('if-condition-number-operation')?.root,
				fieldEls.get('if-condition-number-operand-type')?.root
			]
		},
		{
			case: 'string',
			targets: [
				fieldEls.get('if-condition-common-variable')?.root,
				fieldEls.get('if-condition-string-operation')?.root,
				fieldEls.get('if-condition-string-operand-type')?.root
			]
		},
		{
			case: 'object',
			targets: [
				fieldEls.get('if-condition-common-variable')?.root,
				fieldEls.get('if-condition-object-operation')?.root
			]
		},
		{
			case: 'actor',
			targets: [
				fieldEls.get('if-condition-common-actor')?.root,
				fieldEls.get('if-condition-actor-operation')?.root
			]
		},
		{
			case: 'element',
			targets: [
				fieldEls.get('if-condition-common-element')?.root,
				fieldEls.get('if-condition-element-operation')?.root
			]
		},
		{
			case: 'keyboard',
			targets: [
				fieldEls.get('if-condition-keyboard-keycode')?.root,
				fieldEls.get('if-condition-keyboard-state')?.root
			]
		},
		{
			case: 'gamepad',
			targets: [
				fieldEls.get('if-condition-gamepad-button')?.root,
				fieldEls.get('if-condition-gamepad-state')?.root
			]
		},
		{
			case: 'mouse',
			targets: [
				fieldEls.get('if-condition-mouse-button')?.root,
				fieldEls.get('if-condition-mouse-state')?.root
			]
		},
		{
			case: 'list',
			targets: [
				fieldEls.get('if-condition-common-variable')?.root,
				fieldEls.get('if-condition-list-operation')?.root,
				fieldEls.get('if-condition-operand-variable')?.root
			]
		},
		{ case: 'other', targets: [fieldEls.get('if-condition-other-key')?.root] }
	]);

	useLocalizedOptions('if-condition-boolean-operation', ['equal', 'unequal'], (items) =>
		fieldEls.get('if-condition-boolean-operation')?.loadItems?.(items)
	);

	useLocalizedOptions(
		'if-condition-boolean-operand-type',
		['none', 'constant', 'variable'],
		(items) => fieldEls.get('if-condition-boolean-operand-type')?.loadItems?.(items)
	);

	fieldEls
		.get('if-condition-boolean-operand-type')
		?.enableHiddenMode?.()
		?.relate?.([
			{
				case: 'constant',
				targets: [fieldEls.get('if-condition-boolean-constant-value')?.root]
			},
			{ case: 'variable', targets: [fieldEls.get('if-condition-operand-variable')?.root] }
		]);

	fieldEls.get('if-condition-boolean-constant-value')?.loadItems?.([
		{ name: 'False', value: false },
		{ name: 'True', value: true }
	]);

	useLocalizedOptions(
		'if-condition-number-operation',
		['equal', 'unequal', 'greater-or-equal', 'less-or-equal', 'greater', 'less'],
		(items) => fieldEls.get('if-condition-number-operation')?.loadItems?.(items)
	);

	useLocalizedOptions(
		'if-condition-number-operand-type',
		['none', 'constant', 'variable'],
		(items) => fieldEls.get('if-condition-number-operand-type')?.loadItems?.(items)
	);

	fieldEls
		.get('if-condition-number-operand-type')
		?.enableHiddenMode?.()
		?.relate?.([
			{
				case: 'constant',
				targets: [fieldEls.get('if-condition-number-constant-value')?.root]
			},
			{ case: 'variable', targets: [fieldEls.get('if-condition-operand-variable')?.root] }
		]);

	useLocalizedOptions(
		'if-condition-string-operation',
		['equal', 'unequal', 'include', 'exclude'],
		(items) => fieldEls.get('if-condition-string-operation')?.loadItems?.(items)
	);

	useLocalizedOptions(
		'if-condition-string-operand-type',
		['none', 'constant', 'variable', 'enum'],
		(items) => fieldEls.get('if-condition-string-operand-type')?.loadItems?.(items)
	);

	fieldEls
		.get('if-condition-string-operand-type')
		?.enableHiddenMode?.()
		?.relate?.([
			{
				case: 'constant',
				targets: [fieldEls.get('if-condition-string-constant-value')?.root]
			},
			{
				case: 'variable',
				targets: [fieldEls.get('if-condition-operand-variable')?.root]
			},
			{ case: 'enum', targets: [fieldEls.get('if-condition-string-enum-stringId')?.root] }
		]);

	fieldEls.get('if-condition-object-operation')?.loadItems?.([
		{ name: '==', value: 'equal' },
		{ name: '!=', value: 'unequal' },
		{ name: 'Is Actor', value: 'is-actor' },
		{ name: 'Is Skill', value: 'is-skill' },
		{ name: 'Is State', value: 'is-state' },
		{ name: 'Is Equipment', value: 'is-equipment' },
		{ name: 'Is Item', value: 'is-item' },
		{ name: 'Is Trigger', value: 'is-trigger' },
		{ name: 'Is Light', value: 'is-light' },
		{ name: 'Is Element', value: 'is-element' }
	]);

	fieldEls
		.get('if-condition-object-operation')
		?.enableHiddenMode?.()
		?.relate?.([
			{
				case: ['equal', 'unequal'],
				targets: [fieldEls.get('if-condition-object-operand-type')?.root]
			}
		]);

	useLocalizedOptions(
		'if-condition-object-operand-type',
		[
			'none',
			'actor',
			'skill',
			'state',
			'equipment',
			'item',
			'trigger',
			'light',
			'element',
			'variable'
		],
		(items) => fieldEls.get('if-condition-object-operand-type')?.loadItems?.(items)
	);

	fieldEls
		.get('if-condition-object-operand-type')
		?.enableHiddenMode?.()
		?.relate?.([
			{ case: 'actor', targets: [fieldEls.get('if-condition-common-actor')?.root] },
			{ case: 'skill', targets: [fieldEls.get('if-condition-common-skill')?.root] },
			{ case: 'state', targets: [fieldEls.get('if-condition-common-state')?.root] },
			{
				case: 'equipment',
				targets: [fieldEls.get('if-condition-common-equipment')?.root]
			},
			{ case: 'item', targets: [fieldEls.get('if-condition-common-item')?.root] },
			{ case: 'trigger', targets: [fieldEls.get('if-condition-common-trigger')?.root] },
			{ case: 'light', targets: [fieldEls.get('if-condition-common-light')?.root] },
			{ case: 'element', targets: [fieldEls.get('if-condition-common-element')?.root] },
			{ case: 'variable', targets: [fieldEls.get('if-condition-operand-variable')?.root] }
		]);

	useLocalizedOptions(
		'if-condition-actor-operation',
		[
			'present-active',
			'present',
			'absent',
			'active',
			'inactive',
			'has-targets',
			'has-no-targets',
			'in-screen',
			'is-player',
			'is-member',
			'has-skill',
			'has-state',
			'has-items',
			'has-equipments',
			'has-skill-shortcut',
			'has-item-shortcut',
			'equipped',
			'is-teammate',
			'is-friend',
			'is-enemy',
			'is-team-member',
			'is-team-friend',
			'is-team-enemy'
		],
		(items) => fieldEls.get('if-condition-actor-operation')?.loadItems?.(items)
	);

	fieldEls
		.get('if-condition-actor-operation')
		?.enableHiddenMode?.()
		?.relate?.([
			{ case: 'has-skill', targets: [fieldEls.get('if-condition-actor-skillId')?.root] },
			{ case: 'has-state', targets: [fieldEls.get('if-condition-actor-stateId')?.root] },
			{
				case: 'has-items',
				targets: [
					fieldEls.get('if-condition-actor-itemId')?.root,
					fieldEls.get('if-condition-actor-quantity')?.root
				]
			},
			{
				case: 'has-equipments',
				targets: [
					fieldEls.get('if-condition-actor-equipmentId')?.root,
					fieldEls.get('if-condition-actor-quantity')?.root
				]
			},
			{
				case: ['has-skill-shortcut', 'has-item-shortcut'],
				targets: [fieldEls.get('if-condition-actor-shortcutKey')?.root]
			},
			{
				case: 'equipped',
				targets: [fieldEls.get('if-condition-actor-equipmentId')?.root]
			},
			{
				case: ['is-teammate', 'is-friend', 'is-enemy'],
				targets: [fieldEls.get('if-condition-actor-target')?.root]
			},
			{
				case: ['is-team-member', 'is-team-friend', 'is-team-enemy'],
				targets: [fieldEls.get('if-condition-actor-teamId')?.root]
			}
		]);

	useLocalizedOptions(
		'if-condition-element-operation',
		[
			'present',
			'absent',
			'visible',
			'invisible',
			'is-focus',
			'dialogbox-is-paused',
			'dialogbox-is-updating',
			'dialogbox-is-waiting',
			'dialogbox-is-complete'
		],
		(items) => fieldEls.get('if-condition-element-operation')?.loadItems?.(items)
	);

	useLocalizedOptions(
		'if-condition-keyboard-state',
		['just-pressed', 'just-released', 'pressed', 'released'],
		(items) => fieldEls.get('if-condition-keyboard-state')?.loadItems?.(items)
	);

	useLocalizedOptions(
		'if-condition-gamepad-state',
		['just-pressed', 'just-released', 'pressed', 'released'],
		(items) => fieldEls.get('if-condition-gamepad-state')?.loadItems?.(items)
	);

	useLocalizedOptions('if-condition-mouse-button', [0, 1, 2, 3, 4], (items) =>
		fieldEls.get('if-condition-mouse-button')?.loadItems?.(items)
	);

	useLocalizedOptions(
		'if-condition-mouse-state',
		['just-pressed', 'just-released', 'pressed', 'released'],
		(items) => fieldEls.get('if-condition-mouse-state')?.loadItems?.(items)
	);

	useLocalizedOptions('if-condition-list-operation', ['include', 'exclude'], (items) =>
		fieldEls.get('if-condition-list-operation')?.loadItems?.(items)
	);

	useLocalizedOptions(
		'if-condition-other-key',
		[
			'mouse-entered',
			'mouse-left',
			'game-is-paused',
			'game-is-not-paused',
			'scene-input-is-prevented',
			'scene-input-is-not-prevented',
			'status-debugging',
			'status-deployed',
			'platform-windows',
			'platform-macos',
			'platform-mobile'
		],
		(items) => fieldEls.get('if-condition-other-key')?.loadItems?.(items)
	);

	(fieldEls.get('if-condition') as { root?: YamiElement } | null)?.root?.on?.('open', () => {
		fieldEls.get('if-condition-actor-teamId')?.loadItems?.(Data.createTeamItems!());
	});
}
