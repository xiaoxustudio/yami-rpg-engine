<template>
	<WindowFrame id="setString" @confirm="onConfirm">
		<template #title
			><TitleBar
				>{{ t('components.setString.title') }}
				<div class="close" /></TitleBar
		></template>

		<div class="grid-box">
		<div class="text">Variable</div>
		<CustomBox
			id="setString-variable"
			v-focus
			type="variable"
			filter="writable-string"
			v-model="form.variable"
		/>
		<div class="text">Operation</div>
			<SelectBox id="setString-operation" v-model="form.operation" />
			<div class="text">Type</div>
			<SelectBox id="setString-operand-type" v-model="form.operandType" @write="onWrite" />
			<div class="text">String</div>
			<TextArea
				id="setString-operand-common-value"
				menu="tag-local-var tag-global-var tag-localization"
				v-model="form.commonValue"
			/>
			<div class="text">String Method</div>
			<SelectBox id="setString-operand-string-method" v-model="form.stringMethod" />
			<div class="text">Variable</div>
		<CustomBox
			id="setString-operand-common-variable"
			v-focus
			type="variable"
			filter="all"
			v-model="form.commonVariable"
		/>
			<div class="text">Index</div>
			<NumberVar
				id="setString-operand-string-char-index"
				min="0"
				max="1000000000"
				v-model="form.stringCharIndex"
			/>
			<div class="text">Begin Index</div>
			<NumberVar
				id="setString-operand-string-slice-begin"
				min="-1000000000"
				max="1000000000"
				v-model="form.stringSliceBegin"
			/>
			<div class="text">End Index</div>
			<NumberVar
				id="setString-operand-string-slice-end"
				min="-1000000000"
				max="1000000000"
				v-model="form.stringSliceEnd"
			/>
			<div class="text">Target Length</div>
			<NumberBox
				id="setString-operand-string-pad-start-length"
				min="2"
				max="10"
				v-model="form.stringPadStartLength"
			/>
			<div class="text">Pad String</div>
			<TextBox id="setString-operand-string-pad-start-pad" v-model="form.stringPadStartPad" />
			<div class="text">Substring</div>
			<StringVar
				id="setString-operand-string-replace-pattern"
				v-focus
				v-model="form.stringReplacePattern"
			/>
			<div class="text">Replacement</div>
			<StringVar
				id="setString-operand-string-replace-replacement"
				v-model="form.stringReplaceReplacement"
			/>
			<div class="text">Attribute Key</div>
		<CustomBox
			id="setString-operand-attribute-attributeId"
			v-focus
			type="attribute"
			v-model="form.attributeId"
		/>
			<div class="text">Enum String</div>
		<CustomBox
			id="setString-operand-enum-stringId"
			v-focus
			type="enum-string"
			v-model="form.enumStringId"
		/>
			<div class="text">Property</div>
			<SelectBox id="setString-operand-object-property" v-model="form.objectProperty" />
			<div class="text">Property</div>
			<SelectBox id="setString-operand-element-property" v-model="form.elementProperty" />
			<div class="text">Element</div>
		<CustomBox
			id="setString-operand-element-element"
			type="element"
			v-model="form.elementElement"
		/>
		<div class="text">Actor</div>
		<CustomBox id="setString-operand-common-actor" type="actor" v-model="form.commonActor" />
		<div class="text">Skill</div>
		<CustomBox id="setString-operand-common-skill" type="skill" v-model="form.commonSkill" />
		<div class="text">Trigger</div>
		<CustomBox
			id="setString-operand-common-trigger"
			type="trigger"
			v-model="form.commonTrigger"
		/>
		<div class="text">State</div>
		<CustomBox id="setString-operand-common-state" type="state" v-model="form.commonState" />
		<div class="text">Equipment</div>
		<CustomBox
			id="setString-operand-common-equipment"
			type="equipment"
			v-model="form.commonEquipment"
		/>
		<div class="text">Item</div>
		<CustomBox id="setString-operand-common-item" type="item" v-model="form.commonItem" />
		<div class="text">File</div>
		<CustomBox
			id="setString-operand-object-fileId"
			v-focus
			type="file"
			v-model="form.objectFileId"
		/>
			<div class="text">Index</div>
			<NumberVar
				id="setString-operand-list-index"
				min="0"
				max="1000000000"
				v-model="form.listIndex"
			/>
			<div class="text">Param Name</div>
			<StringVar id="setString-operand-parameter-key" v-focus v-model="form.parameterKey" />
			<div class="text">Script</div>
			<TextBox id="setString-operand-script" v-focus v-model="form.script" />
			<div class="text">Data</div>
			<SelectBox id="setString-operand-other-data" v-model="form.otherData" />
			<div class="text">Choice Index</div>
			<NumberVar
				id="setString-operand-showChoices-content-choiceIndex"
				min="0"
				max="255"
				v-model="form.showChoicesIndex"
			/>
			<div class="text">Timestamp</div>
		<CustomBox
			id="setString-operand-parse-timestamp-variable"
			v-focus
			type="variable"
			filter="number"
			v-model="form.parseTimestampVariable"
		/>
			<div class="text">Date Format</div>
			<TextBox
				id="setString-operand-parse-timestamp-format"
				v-model="form.parseTimestampFormat"
			/>
			<div class="text">Image Width</div>
			<NumberBox
				id="setString-operand-screenshot-width"
				min="64"
				max="7680"
				unit="px"
				v-model="form.screenshotWidth"
			/>
			<div class="text">Image Height</div>
			<NumberBox
				id="setString-operand-screenshot-height"
				min="64"
				max="7680"
				unit="px"
				v-model="form.screenshotHeight"
			/>
		</div>
	</WindowFrame>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useSetStringCommandSchema } from '@app/composables/commands/useSetStringCommandSchema';
import { $ } from '@app/utils/dom';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import CustomBox from '@app/components/common/CustomBox.vue';
import NumberBox from '@app/components/common/NumberBox.vue';
import NumberVar from '@app/components/common/NumberVar.vue';
import StringVar from '@app/components/common/StringVar.vue';
import TextArea from '@app/components/common/TextArea.vue';
import TextBox from '@app/components/common/TextBox.vue';
import SelectBox from '@app/components/common/SelectBox.vue';

const { t } = useI18n();

const { form, save, writeHandler } = useSetStringCommandSchema();

const onWrite = (value: unknown) => {
	writeHandler({ value: value as string });
};

const onConfirm = () => {
	save();
};

onMounted(() => {
	$('#setString-operation')?.loadItems?.([
		{ name: 'Set', value: 'set' },
		{ name: 'Add', value: 'add' }
	]);
	$('#setString-operand-type')?.loadItems?.([
		{ name: 'Constant', value: 'constant' },
		{ name: 'Variable', value: 'variable' },
		{ name: 'Template String', value: 'template' },
		{ name: 'String Method', value: 'string' },
		{ name: 'Attribute Key', value: 'attribute' },
		{ name: 'Enumeration', value: 'enum' },
		{ name: 'Object', value: 'object' },
		{ name: 'Element', value: 'element' },
		{ name: 'List', value: 'list' },
		{ name: 'Parameter', value: 'parameter' },
		{ name: 'Script', value: 'script' },
		{ name: 'Other', value: 'other' }
	]);
	$('#setString-operand-type')
		?.enableHiddenMode?.()
		?.relate?.([
			{
				case: 'constant',
				targets: [$('#setString-operand-common-value')]
			},
			{
				case: 'variable',
				targets: [$('#setString-operand-common-variable')]
			},
			{
				case: 'template',
				targets: [$('#setString-operand-common-value')]
			},
			{
				case: 'string',
				targets: [
					$('#setString-operand-string-method'),
					$('#setString-operand-common-variable')
				]
			},
			{
				case: 'attribute',
				targets: [$('#setString-operand-attribute-attributeId')]
			},
			{
				case: 'enum',
				targets: [$('#setString-operand-enum-stringId')]
			},
			{
				case: 'object',
				targets: [$('#setString-operand-object-property')]
			},
			{
				case: 'element',
				targets: [
					$('#setString-operand-element-property'),
					$('#setString-operand-element-element')
				]
			},
			{
				case: 'list',
				targets: [
					$('#setString-operand-common-variable'),
					$('#setString-operand-list-index')
				]
			},
			{
				case: 'parameter',
				targets: [$('#setString-operand-parameter-key')]
			},
			{ case: 'script', targets: [$('#setString-operand-script')] },
			{ case: 'other', targets: [$('#setString-operand-other-data')] }
		]);
	$('#setString-operand-string-method')?.loadItems?.([
		{ name: t('command.setString.string.char') || 'Char', value: 'char' },
		{ name: t('command.setString.string.slice') || 'Slice', value: 'slice' },
		{ name: t('command.setString.string.pad-start') || 'Pad Start', value: 'pad-start' },
		{ name: t('command.setString.string.replace') || 'Replace', value: 'replace' },
		{
			name: t('command.setString.string.replace-all') || 'Replace All',
			value: 'replace-all'
		}
	]);
	$('#setString-operand-string-method')
		?.enableHiddenMode?.()
		?.relate?.([
			{
				case: 'char',
				targets: [$('#setString-operand-string-char-index')]
			},
			{
				case: 'slice',
				targets: [
					$('#setString-operand-string-slice-begin'),
					$('#setString-operand-string-slice-end')
				]
			},
			{
				case: 'pad-start',
				targets: [
					$('#setString-operand-string-pad-start-length'),
					$('#setString-operand-string-pad-start-pad')
				]
			},
			{
				case: ['replace', 'replace-all'],
				targets: [
					$('#setString-operand-string-replace-pattern'),
					$('#setString-operand-string-replace-replacement')
				]
			}
		]);
	$('#setString-operand-object-property')?.loadItems?.([
		{
			name: t('command.setString.object.actor-team-id') || 'Actor - Team ID',
			value: 'actor-team-id'
		},
		{
			name: t('command.setString.object.actor-file-id') || 'Actor - File ID',
			value: 'actor-file-id'
		},
		{
			name: t('command.setString.object.actor-animation-motion-name') || 'Actor - Anim Motion Name',
			value: 'actor-animation-motion-name'
		},
		{
			name: t('command.setString.object.skill-file-id') || 'Skill - File ID',
			value: 'skill-file-id'
		},
		{
			name: t('command.setString.object.trigger-file-id') || 'Trigger - File ID',
			value: 'trigger-file-id'
		},
		{
			name: t('command.setString.object.state-file-id') || 'State - File ID',
			value: 'state-file-id'
		},
		{
			name: t('command.setString.object.equipment-file-id') || 'Equipment - File ID',
			value: 'equipment-file-id'
		},
		{
			name: t('command.setString.object.equipment-slot') || 'Equipment - Slot',
			value: 'equipment-slot'
		},
		{ name: t('command.setString.object.item-file-id') || 'Item - File ID', value: 'item-file-id' },
		{ name: t('command.setString.object.file-id') || 'File - ID', value: 'file-id' }
	]);
	$('#setString-operand-object-property')
		?.enableHiddenMode?.()
		?.relate?.([
			{
				case: ['actor-team-id', 'actor-file-id', 'actor-animation-motion-name'],
				targets: [$('#setString-operand-common-actor')]
			},
			{
				case: 'skill-file-id',
				targets: [$('#setString-operand-common-skill')]
			},
			{
				case: 'trigger-file-id',
				targets: [$('#setString-operand-common-trigger')]
			},
			{
				case: 'state-file-id',
				targets: [$('#setString-operand-common-state')]
			},
			{
				case: ['equipment-file-id', 'equipment-slot'],
				targets: [$('#setString-operand-common-equipment')]
			},
			{
				case: 'item-file-id',
				targets: [$('#setString-operand-common-item')]
			},
			{
				case: 'file-id',
				targets: [$('#setString-operand-object-fileId')]
			}
		]);
	$('#setString-operand-element-property')?.loadItems?.([
		{
			name: t('command.setString.element.text-content') || 'Text - Content',
			value: 'text-content'
		},
		{
			name: t('command.setString.element.textBox-text') || 'Text Box - Text',
			value: 'textBox-text'
		},
		{
			name: t('command.setString.element.dialogBox-content') || 'Dialog Box - Content',
			value: 'dialogBox-content'
		}
	]);
	$('#setString-operand-other-data')?.loadItems?.([
		{
			name: t('command.setString.other.trigger-key') || 'Event Trigger Key',
			value: 'trigger-key'
		},
		{
			name: t('command.setString.other.start-position-scene-id') || 'Start Position - Scene ID',
			value: 'start-position-scene-id'
		},
		{
			name: t('command.setString.other.showText-content') || 'Show Text - Content',
			value: 'showText-content'
		},
		{
			name: t('command.setString.other.showChoices-content') || 'Show Choices - Content',
			value: 'showChoices-content'
		},
		{
			name: t('command.setString.other.parse-timestamp') || 'Parse Timestamp',
			value: 'parse-timestamp'
		},
		{
			name: t('command.setString.other.screenshot') || 'Screenshot(Base64)',
			value: 'screenshot'
		},
		{
			name: t('command.setString.other.game-language') || 'Game Language',
			value: 'game-language'
		}
	]);
	$('#setString-operand-other-data')
		?.enableHiddenMode?.()
		?.relate?.([
			{
				case: 'showChoices-content',
				targets: [$('#setString-operand-showChoices-content-choiceIndex')]
			},
			{
				case: 'parse-timestamp',
				targets: [
					$('#setString-operand-parse-timestamp-variable'),
					$('#setString-operand-parse-timestamp-format')
				]
			},
			{
				case: 'screenshot',
				targets: [
					$('#setString-operand-screenshot-width'),
					$('#setString-operand-screenshot-height')
				]
			}
		]);
});
</script>
