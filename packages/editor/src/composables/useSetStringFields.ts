import { useLocalizedOptions } from '@app/composables/useLocalizedOptions';
import { controlRoot, type ControlApi } from '@app/composables/control-refs';

/** 控件表：id → 控件实例（`defineExpose`）。由窗口用 `useControlRefs` 建表后整表传入。 */
export type SetStringFieldTable = Partial<Record<string, ControlApi | null>>;

/**
 * setString 命令表单的字段选项 / 联动配置（原 `SetString.vue` 的 `onMounted` 大块）。
 *
 * 入参是**控件表**而不是注册表：函数不认识 id 的存放位置，也不再按 id 去全局找元素，
 * 于是它可以脱离窗口单测，`element-registry-lookups` 也不再从这里长出来。
 * `relate()` 的 targets 是 DOM 语义（`select-box-core` 要读写元素样式与兄弟标签），
 * 所以那一处仍用 `controlRoot(...)` 取根元素。
 */
export function setupSetStringFields(fields: SetStringFieldTable): void {
	useLocalizedOptions('setString-operation', ['set', 'add'], (items) =>
		fields['setString-operation']?.loadItems?.(items)
	);
	useLocalizedOptions(
		'setString-operand-type',
		[
			'constant',
			'variable',
			'template',
			'string',
			'attribute',
			'enum',
			'object',
			'element',
			'list',
			'parameter',
			'script',
			'other'
		],
		(items) => fields['setString-operand-type']?.loadItems?.(items)
	);
	fields['setString-operand-type']?.enableHiddenMode?.();
	fields['setString-operand-type']?.relate?.([
		{
			case: 'constant',
			targets: [controlRoot(fields['setString-operand-common-value'])]
		},
		{
			case: 'variable',
			targets: [controlRoot(fields['setString-operand-common-variable'])]
		},
		{
			case: 'template',
			targets: [controlRoot(fields['setString-operand-common-value'])]
		},
		{
			case: 'string',
			targets: [
				controlRoot(fields['setString-operand-string-method']),
				controlRoot(fields['setString-operand-common-variable'])
			]
		},
		{
			case: 'attribute',
			targets: [controlRoot(fields['setString-operand-attribute-attributeId'])]
		},
		{
			case: 'enum',
			targets: [controlRoot(fields['setString-operand-enum-stringId'])]
		},
		{
			case: 'object',
			targets: [controlRoot(fields['setString-operand-object-property'])]
		},
		{
			case: 'element',
			targets: [
				controlRoot(fields['setString-operand-element-property']),
				controlRoot(fields['setString-operand-element-element'])
			]
		},
		{
			case: 'list',
			targets: [
				controlRoot(fields['setString-operand-common-variable']),
				controlRoot(fields['setString-operand-list-index'])
			]
		},
		{
			case: 'parameter',
			targets: [controlRoot(fields['setString-operand-parameter-key'])]
		},
		{ case: 'script', targets: [controlRoot(fields['setString-operand-script'])] },
		{ case: 'other', targets: [controlRoot(fields['setString-operand-other-data'])] }
	]);
	useLocalizedOptions(
		'setString-operand-string-method',
		['char', 'slice', 'pad-start', 'replace', 'replace-all'],
		(items) => fields['setString-operand-string-method']?.loadItems?.(items),
		{
			char: 'command.setString.string.char',
			slice: 'command.setString.string.slice',
			'pad-start': 'command.setString.string.pad-start',
			replace: 'command.setString.string.replace',
			'replace-all': 'command.setString.string.replace-all'
		}
	);
	fields['setString-operand-string-method']?.enableHiddenMode?.();
	fields['setString-operand-string-method']?.relate?.([
		{
			case: 'char',
			targets: [controlRoot(fields['setString-operand-string-char-index'])]
		},
		{
			case: 'slice',
			targets: [
				controlRoot(fields['setString-operand-string-slice-begin']),
				controlRoot(fields['setString-operand-string-slice-end'])
			]
		},
		{
			case: 'pad-start',
			targets: [
				controlRoot(fields['setString-operand-string-pad-start-length']),
				controlRoot(fields['setString-operand-string-pad-start-pad'])
			]
		},
		{
			case: ['replace', 'replace-all'],
			targets: [
				controlRoot(fields['setString-operand-string-replace-pattern']),
				controlRoot(fields['setString-operand-string-replace-replacement'])
			]
		}
	]);
	useLocalizedOptions(
		'setString-operand-object-property',
		[
			'actor-team-id',
			'actor-file-id',
			'actor-animation-motion-name',
			'skill-file-id',
			'trigger-file-id',
			'state-file-id',
			'equipment-file-id',
			'equipment-slot',
			'item-file-id',
			'file-id'
		],
		(items) => fields['setString-operand-object-property']?.loadItems?.(items),
		{
			'actor-team-id': 'command.setString.object.actor-team-id',
			'actor-file-id': 'command.setString.object.actor-file-id',
			'actor-animation-motion-name': 'command.setString.object.actor-animation-motion-name',
			'skill-file-id': 'command.setString.object.skill-file-id',
			'trigger-file-id': 'command.setString.object.trigger-file-id',
			'state-file-id': 'command.setString.object.state-file-id',
			'equipment-file-id': 'command.setString.object.equipment-file-id',
			'equipment-slot': 'command.setString.object.equipment-slot',
			'item-file-id': 'command.setString.object.item-file-id',
			'file-id': 'command.setString.object.file-id'
		}
	);
	fields['setString-operand-object-property']?.enableHiddenMode?.();
	fields['setString-operand-object-property']?.relate?.([
		{
			case: ['actor-team-id', 'actor-file-id', 'actor-animation-motion-name'],
			targets: [controlRoot(fields['setString-operand-common-actor'])]
		},
		{
			case: 'skill-file-id',
			targets: [controlRoot(fields['setString-operand-common-skill'])]
		},
		{
			case: 'trigger-file-id',
			targets: [controlRoot(fields['setString-operand-common-trigger'])]
		},
		{
			case: 'state-file-id',
			targets: [controlRoot(fields['setString-operand-common-state'])]
		},
		{
			case: ['equipment-file-id', 'equipment-slot'],
			targets: [controlRoot(fields['setString-operand-common-equipment'])]
		},
		{
			case: 'item-file-id',
			targets: [controlRoot(fields['setString-operand-common-item'])]
		},
		{
			case: 'file-id',
			targets: [controlRoot(fields['setString-operand-object-fileId'])]
		}
	]);
	useLocalizedOptions(
		'setString-operand-element-property',
		['text-content', 'textBox-text', 'dialogBox-content'],
		(items) => fields['setString-operand-element-property']?.loadItems?.(items),
		{
			'text-content': 'command.setString.element.text-content',
			'textBox-text': 'command.setString.element.textBox-text',
			'dialogBox-content': 'command.setString.element.dialogBox-content'
		}
	);
	useLocalizedOptions(
		'setString-operand-other-data',
		[
			'trigger-key',
			'start-position-scene-id',
			'showText-content',
			'showChoices-content',
			'parse-timestamp',
			'screenshot',
			'game-language'
		],
		(items) => fields['setString-operand-other-data']?.loadItems?.(items),
		{
			'trigger-key': 'command.setString.other.trigger-key',
			'start-position-scene-id': 'command.setString.other.start-position-scene-id',
			'showText-content': 'command.setString.other.showText-content',
			'showChoices-content': 'command.setString.other.showChoices-content',
			'parse-timestamp': 'command.setString.other.parse-timestamp',
			screenshot: 'command.setString.other.screenshot',
			'game-language': 'command.setString.other.game-language'
		}
	);
	fields['setString-operand-other-data']?.enableHiddenMode?.();
	fields['setString-operand-other-data']?.relate?.([
		{
			case: 'showChoices-content',
			targets: [controlRoot(fields['setString-operand-showChoices-content-choiceIndex'])]
		},
		{
			case: 'parse-timestamp',
			targets: [
				controlRoot(fields['setString-operand-parse-timestamp-variable']),
				controlRoot(fields['setString-operand-parse-timestamp-format'])
			]
		},
		{
			case: 'screenshot',
			targets: [
				controlRoot(fields['setString-operand-screenshot-width']),
				controlRoot(fields['setString-operand-screenshot-height'])
			]
		}
	]);
}
