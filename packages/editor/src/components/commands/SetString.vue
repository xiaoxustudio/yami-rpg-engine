<template>
	<WindowFrame id="setString" @confirm="onConfirm">
		<template #title><TitleBar>Set String<div class="close" /></TitleBar></template>
		
			<div class="grid-box">
				<div class="text">Variable</div
				><CustomBox
					id="setString-variable"
					type="variable"
					filter="writable-string"
					@input="onVariable"
				/>
				<div class="text">Operation</div
				><SelectBox id="setString-operation" v-model="form.operation" />
				<div class="text">Type</div
				><SelectBox
					id="setString-operand-type"
					v-model="form.operandType"
					@write="onWrite"
				/>
				<div class="text">String</div
				><TextArea
					id="setString-operand-common-value"
					menu="tag-local-var tag-global-var tag-localization"
					v-model="form.commonValue"
				/>
				<div class="text">String Method</div
				><SelectBox
					id="setString-operand-string-method"
					v-model="form.stringMethod"
				/>
				<div class="text">Variable</div
				><CustomBox
					id="setString-operand-common-variable"
					type="variable"
					filter="all"
					@input="onCommonVariable"
				/>
				<div class="text">Index</div
				><NumberVar
					id="setString-operand-string-char-index"
					min="0"
					max="1000000000"
					v-model="form.stringCharIndex"
				/>
				<div class="text">Begin Index</div
				><NumberVar
					id="setString-operand-string-slice-begin"
					min="-1000000000"
					max="1000000000"
					v-model="form.stringSliceBegin"
				/>
				<div class="text">End Index</div
				><NumberVar
					id="setString-operand-string-slice-end"
					min="-1000000000"
					max="1000000000"
					v-model="form.stringSliceEnd"
				/>
				<div class="text">Target Length</div
				><NumberBox
					id="setString-operand-string-pad-start-length"
					min="2"
					max="10"
					v-model="form.stringPadStartLength"
				/>
				<div class="text">Pad String</div
				><TextBox
					id="setString-operand-string-pad-start-pad"
					v-model="form.stringPadStartPad"
				/>
				<div class="text">Substring</div
				><StringVar
					id="setString-operand-string-replace-pattern"
					v-model="form.stringReplacePattern"
				/>
				<div class="text">Replacement</div
				><StringVar
					id="setString-operand-string-replace-replacement"
					v-model="form.stringReplaceReplacement"
				/>
				<div class="text">Attribute Key</div
				><CustomBox
					id="setString-operand-attribute-attributeId"
					type="attribute"
					@input="onAttributeId"
				/>
				<div class="text">Enum String</div
				><CustomBox
					id="setString-operand-enum-stringId"
					type="enum-string"
					@input="onEnumStringId"
				/>
				<div class="text">Property</div
				><SelectBox
					id="setString-operand-object-property"
					v-model="form.objectProperty"
				/>
				<div class="text">Property</div
				><SelectBox
					id="setString-operand-element-property"
					v-model="form.elementProperty"
				/>
				<div class="text">Element</div
				><CustomBox
					id="setString-operand-element-element"
					type="element"
					@input="onElementElement"
				/>
				<div class="text">Actor</div
				><CustomBox
					id="setString-operand-common-actor"
					type="actor"
					@input="onCommonActor"
				/>
				<div class="text">Skill</div
				><CustomBox
					id="setString-operand-common-skill"
					type="skill"
					@input="onCommonSkill"
				/>
				<div class="text">Trigger</div
				><CustomBox
					id="setString-operand-common-trigger"
					type="trigger"
					@input="onCommonTrigger"
				/>
				<div class="text">State</div
				><CustomBox
					id="setString-operand-common-state"
					type="state"
					@input="onCommonState"
				/>
				<div class="text">Equipment</div
				><CustomBox
					id="setString-operand-common-equipment"
					type="equipment"
					@input="onCommonEquipment"
				/>
				<div class="text">Item</div
				><CustomBox
					id="setString-operand-common-item"
					type="item"
					@input="onCommonItem"
				/>
				<div class="text">File</div
				><CustomBox
					id="setString-operand-object-fileId"
					type="file"
					@input="onObjectFileId"
				/>
				<div class="text">Index</div
				><NumberVar
					id="setString-operand-list-index"
					min="0"
					max="1000000000"
					v-model="form.listIndex"
				/>
				<div class="text">Param Name</div
				><StringVar
					id="setString-operand-parameter-key"
					v-model="form.parameterKey"
				/>
				<div class="text">Script</div
				><TextBox id="setString-operand-script" v-model="form.script" /> <div class="text">Data</div
				><SelectBox
					id="setString-operand-other-data"
					v-model="form.otherData"
				/> <div class="text">Choice Index</div
				><NumberVar
					id="setString-operand-showChoices-content-choiceIndex"
					min="0"
					max="255"
					v-model="form.showChoicesIndex"
				/>
				<div class="text">Timestamp</div
				><CustomBox
					id="setString-operand-parse-timestamp-variable"
					type="variable"
					filter="number"
					@input="onParseTimestampVariable"
				/>
				<div class="text">Date Format</div
				><TextBox
					id="setString-operand-parse-timestamp-format"
					v-model="form.parseTimestampFormat"
				/>
				<div class="text">Image Width</div
				><NumberBox
					id="setString-operand-screenshot-width"
					min="64"
					max="7680"
					unit="px"
					v-model="form.screenshotWidth"
				/>
				<div class="text">Image Height</div
				><NumberBox
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
import { useSetStringCommandSchema } from '@app/composables/commands/useSetStringCommandSchema';
import { $ } from '@app/legacy/util/dom.ts';
import { createGetter } from '@app/i18n';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import CustomBox from '@app/components/common/CustomBox.vue';
import NumberBox from '@app/components/common/NumberBox.vue';
import NumberVar from '@app/components/common/NumberVar.vue';
import StringVar from '@app/components/common/StringVar.vue';
import TextArea from '@app/components/common/TextArea.vue';
import TextBox from '@app/components/common/TextBox.vue';
import SelectBox from '@app/components/common/SelectBox.vue';

const { form, save, writeHandler } = useSetStringCommandSchema();

const onVariable = (value: unknown) => {
	form.variable = value;
};

const onCommonVariable = (value: unknown) => {
	form.commonVariable = value;
};

const onAttributeId = (value: unknown) => {
	form.attributeId = value;
};

const onEnumStringId = (value: unknown) => {
	form.enumStringId = value;
};

const onElementElement = (value: unknown) => {
	form.elementElement = value;
};

const onCommonActor = (value: unknown) => {
	form.commonActor = value;
};

const onCommonSkill = (value: unknown) => {
	form.commonSkill = value;
};

const onCommonTrigger = (value: unknown) => {
	form.commonTrigger = value;
};

const onCommonState = (value: unknown) => {
	form.commonState = value;
};

const onCommonEquipment = (value: unknown) => {
	form.commonEquipment = value;
};

const onCommonItem = (value: unknown) => {
	form.commonItem = value;
};

const onObjectFileId = (value: unknown) => {
	form.objectFileId = value;
};

const onParseTimestampVariable = (value: unknown) => {
	form.parseTimestampVariable = value;
};

const onWrite = (value: unknown) => {
	writeHandler({ value: value as string });
};

const onConfirm = () => {
	save();
};

onMounted(() => {
	const get = createGetter('command.setString');
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
		{ name: get('string.char') || 'Char', value: 'char' },
		{ name: get('string.slice') || 'Slice', value: 'slice' },
		{ name: get('string.pad-start') || 'Pad Start', value: 'pad-start' },
		{ name: get('string.replace') || 'Replace', value: 'replace' },
		{ name: get('string.replace-all') || 'Replace All', value: 'replace-all' }
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
		{ name: get('object.actor-team-id') || 'Actor - Team ID', value: 'actor-team-id' },
		{ name: get('object.actor-file-id') || 'Actor - File ID', value: 'actor-file-id' },
		{
			name: get('object.actor-animation-motion-name') || 'Actor - Anim Motion Name',
			value: 'actor-animation-motion-name'
		},
		{ name: get('object.skill-file-id') || 'Skill - File ID', value: 'skill-file-id' },
		{ name: get('object.trigger-file-id') || 'Trigger - File ID', value: 'trigger-file-id' },
		{ name: get('object.state-file-id') || 'State - File ID', value: 'state-file-id' },
		{ name: get('object.equipment-file-id') || 'Equipment - File ID', value: 'equipment-file-id' },
		{ name: get('object.equipment-slot') || 'Equipment - Slot', value: 'equipment-slot' },
		{ name: get('object.item-file-id') || 'Item - File ID', value: 'item-file-id' },
		{ name: get('object.file-id') || 'File - ID', value: 'file-id' }
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
		{ name: get('element.text-content') || 'Text - Content', value: 'text-content' },
		{ name: get('element.textBox-text') || 'Text Box - Text', value: 'textBox-text' },
		{ name: get('element.dialogBox-content') || 'Dialog Box - Content', value: 'dialogBox-content' }
	]);
	$('#setString-operand-other-data')?.loadItems?.([
		{ name: get('other.trigger-key') || 'Event Trigger Key', value: 'trigger-key' },
		{
			name: get('other.start-position-scene-id') || 'Start Position - Scene ID',
			value: 'start-position-scene-id'
		},
		{ name: get('other.showText-content') || 'Show Text - Content', value: 'showText-content' },
		{ name: get('other.showChoices-content') || 'Show Choices - Content', value: 'showChoices-content' },
		{ name: get('other.parse-timestamp') || 'Parse Timestamp', value: 'parse-timestamp' },
		{ name: get('other.screenshot') || 'Screenshot(Base64)', value: 'screenshot' },
		{ name: get('other.game-language') || 'Game Language', value: 'game-language' }
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
