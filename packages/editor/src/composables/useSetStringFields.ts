import { useLocalizedOptions } from '@app/composables/useLocalizedOptions';
import type { ElementRegistry } from '@app/utils/element-registry';

/**
 * setString 命令表单的字段选项 / 联动配置（原 `SetString.vue` 的 `onMounted` 大块）。
 * 由组件在 `onMounted` 内以共享的 `fieldEls` 调用；`useLocalizedOptions` 走全局 Composer。
 */
export function setupSetStringFields(fieldEls: ElementRegistry): void {
	useLocalizedOptions('setString-operation', ['set', 'add'], (items) =>
		fieldEls.get('setString-operation')?.loadItems?.(items)
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
		(items) => fieldEls.get('setString-operand-type')?.loadItems?.(items)
	);
	fieldEls
		.get('setString-operand-type')
		?.enableHiddenMode?.()
		?.relate?.([
			{
				case: 'constant',
				targets: [fieldEls.get('setString-operand-common-value')]
			},
			{
				case: 'variable',
				targets: [fieldEls.get('setString-operand-common-variable')]
			},
			{
				case: 'template',
				targets: [fieldEls.get('setString-operand-common-value')]
			},
			{
				case: 'string',
				targets: [
					fieldEls.get('setString-operand-string-method'),
					fieldEls.get('setString-operand-common-variable')
				]
			},
			{
				case: 'attribute',
				targets: [fieldEls.get('setString-operand-attribute-attributeId')]
			},
			{
				case: 'enum',
				targets: [fieldEls.get('setString-operand-enum-stringId')]
			},
			{
				case: 'object',
				targets: [fieldEls.get('setString-operand-object-property')]
			},
			{
				case: 'element',
				targets: [
					fieldEls.get('setString-operand-element-property'),
					fieldEls.get('setString-operand-element-element')
				]
			},
			{
				case: 'list',
				targets: [
					fieldEls.get('setString-operand-common-variable'),
					fieldEls.get('setString-operand-list-index')
				]
			},
			{
				case: 'parameter',
				targets: [fieldEls.get('setString-operand-parameter-key')]
			},
			{ case: 'script', targets: [fieldEls.get('setString-operand-script')] },
			{ case: 'other', targets: [fieldEls.get('setString-operand-other-data')] }
		]);
	useLocalizedOptions(
		'setString-operand-string-method',
		['char', 'slice', 'pad-start', 'replace', 'replace-all'],
		(items) => fieldEls.get('setString-operand-string-method')?.loadItems?.(items),
		{
			char: 'command.setString.string.char',
			slice: 'command.setString.string.slice',
			'pad-start': 'command.setString.string.pad-start',
			replace: 'command.setString.string.replace',
			'replace-all': 'command.setString.string.replace-all'
		}
	);
	fieldEls
		.get('setString-operand-string-method')
		?.enableHiddenMode?.()
		?.relate?.([
			{
				case: 'char',
				targets: [fieldEls.get('setString-operand-string-char-index')]
			},
			{
				case: 'slice',
				targets: [
					fieldEls.get('setString-operand-string-slice-begin'),
					fieldEls.get('setString-operand-string-slice-end')
				]
			},
			{
				case: 'pad-start',
				targets: [
					fieldEls.get('setString-operand-string-pad-start-length'),
					fieldEls.get('setString-operand-string-pad-start-pad')
				]
			},
			{
				case: ['replace', 'replace-all'],
				targets: [
					fieldEls.get('setString-operand-string-replace-pattern'),
					fieldEls.get('setString-operand-string-replace-replacement')
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
		(items) => fieldEls.get('setString-operand-object-property')?.loadItems?.(items),
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
	fieldEls
		.get('setString-operand-object-property')
		?.enableHiddenMode?.()
		?.relate?.([
			{
				case: ['actor-team-id', 'actor-file-id', 'actor-animation-motion-name'],
				targets: [fieldEls.get('setString-operand-common-actor')]
			},
			{
				case: 'skill-file-id',
				targets: [fieldEls.get('setString-operand-common-skill')]
			},
			{
				case: 'trigger-file-id',
				targets: [fieldEls.get('setString-operand-common-trigger')]
			},
			{
				case: 'state-file-id',
				targets: [fieldEls.get('setString-operand-common-state')]
			},
			{
				case: ['equipment-file-id', 'equipment-slot'],
				targets: [fieldEls.get('setString-operand-common-equipment')]
			},
			{
				case: 'item-file-id',
				targets: [fieldEls.get('setString-operand-common-item')]
			},
			{
				case: 'file-id',
				targets: [fieldEls.get('setString-operand-object-fileId')]
			}
		]);
	useLocalizedOptions(
		'setString-operand-element-property',
		['text-content', 'textBox-text', 'dialogBox-content'],
		(items) => fieldEls.get('setString-operand-element-property')?.loadItems?.(items),
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
		(items) => fieldEls.get('setString-operand-other-data')?.loadItems?.(items),
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
	fieldEls
		.get('setString-operand-other-data')
		?.enableHiddenMode?.()
		?.relate?.([
			{
				case: 'showChoices-content',
				targets: [fieldEls.get('setString-operand-showChoices-content-choiceIndex')]
			},
			{
				case: 'parse-timestamp',
				targets: [
					fieldEls.get('setString-operand-parse-timestamp-variable'),
					fieldEls.get('setString-operand-parse-timestamp-format')
				]
			},
			{
				case: 'screenshot',
				targets: [
					fieldEls.get('setString-operand-screenshot-width'),
					fieldEls.get('setString-operand-screenshot-height')
				]
			}
		]);
}
