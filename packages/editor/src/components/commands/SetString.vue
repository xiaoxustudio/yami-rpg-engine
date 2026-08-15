<template>
	<WindowFrame ref="frame" id="setString" @confirm="onConfirm">
		<template #title><TitleBar>Set String<div class="close" /></TitleBar></template>
		
			<div class="grid-box">
				<div class="text">Variable</div
				><CustomBox
					id="setString-variable"
					type="variable"
					filter="writable-string"
					:model-value="form.variable"
				/>
				<div class="text">Operation</div
				><SelectBox id="setString-operation" :model-value="form.operation" />
				<div class="text">Type</div
				><SelectBox
					id="setString-operand-type"
					:model-value="form.operandType"
					@write="onWrite"
				/>
				<div class="text">String</div
				><TextArea
					id="setString-operand-common-value"
					menu="tag-local-var tag-global-var tag-localization"
					:model-value="form.commonValue"
				/>
				<div class="text">String Method</div
				><SelectBox
					id="setString-operand-string-method"
					:model-value="form.stringMethod"
				/>
				<div class="text">Variable</div
				><CustomBox
					id="setString-operand-common-variable"
					type="variable"
					filter="all"
					:model-value="form.commonVariable"
				/>
				<div class="text">Index</div
				><NumberVar
					id="setString-operand-string-char-index"
					min="0"
					max="1000000000"
					:model-value="form.stringCharIndex"
				/>
				<div class="text">Begin Index</div
				><NumberVar
					id="setString-operand-string-slice-begin"
					min="-1000000000"
					max="1000000000"
					:model-value="form.stringSliceBegin"
				/>
				<div class="text">End Index</div
				><NumberVar
					id="setString-operand-string-slice-end"
					min="-1000000000"
					max="1000000000"
					:model-value="form.stringSliceEnd"
				/>
				<div class="text">Target Length</div
				><NumberBox
					id="setString-operand-string-pad-start-length"
					min="2"
					max="10"
					:model-value="form.stringPadStartLength"
				/>
				<div class="text">Pad String</div
				><TextBox
					id="setString-operand-string-pad-start-pad"
					:model-value="form.stringPadStartPad"
				/>
				<div class="text">Substring</div
				><StringVar
					id="setString-operand-string-replace-pattern"
					:model-value="form.stringReplacePattern"
				/>
				<div class="text">Replacement</div
				><StringVar
					id="setString-operand-string-replace-replacement"
					:model-value="form.stringReplaceReplacement"
				/>
				<div class="text">Attribute Key</div
				><CustomBox
					id="setString-operand-attribute-attributeId"
					type="attribute"
					:model-value="form.attributeId"
				/>
				<div class="text">Enum String</div
				><CustomBox
					id="setString-operand-enum-stringId"
					type="enum-string"
					:model-value="form.enumStringId"
				/>
				<div class="text">Property</div
				><SelectBox
					id="setString-operand-object-property"
					:model-value="form.objectProperty"
				/>
				<div class="text">Property</div
				><SelectBox
					id="setString-operand-element-property"
					:model-value="form.elementProperty"
				/>
				<div class="text">Element</div
				><CustomBox
					id="setString-operand-element-element"
					type="element"
					:model-value="form.elementElement"
				/>
				<div class="text">Actor</div
				><CustomBox
					id="setString-operand-common-actor"
					type="actor"
					:model-value="form.commonActor"
				/>
				<div class="text">Skill</div
				><CustomBox
					id="setString-operand-common-skill"
					type="skill"
					:model-value="form.commonSkill"
				/>
				<div class="text">Trigger</div
				><CustomBox
					id="setString-operand-common-trigger"
					type="trigger"
					:model-value="form.commonTrigger"
				/>
				<div class="text">State</div
				><CustomBox
					id="setString-operand-common-state"
					type="state"
					:model-value="form.commonState"
				/>
				<div class="text">Equipment</div
				><CustomBox
					id="setString-operand-common-equipment"
					type="equipment"
					:model-value="form.commonEquipment"
				/>
				<div class="text">Item</div
				><CustomBox
					id="setString-operand-common-item"
					type="item"
					:model-value="form.commonItem"
				/>
				<div class="text">File</div
				><CustomBox
					id="setString-operand-object-fileId"
					type="file"
					:model-value="form.objectFileId"
				/>
				<div class="text">Index</div
				><NumberVar
					id="setString-operand-list-index"
					min="0"
					max="1000000000"
					:model-value="form.listIndex"
				/>
				<div class="text">Param Name</div
				><StringVar
					id="setString-operand-parameter-key"
					:model-value="form.parameterKey"
				/>
				<div class="text">Script</div
				><TextBox id="setString-operand-script" :model-value="form.script" /> <div class="text">Data</div
				><SelectBox
					id="setString-operand-other-data"
					:model-value="form.otherData"
				/> <div class="text">Choice Index</div
				><NumberVar
					id="setString-operand-showChoices-content-choiceIndex"
					min="0"
					max="255"
					:model-value="form.showChoicesIndex"
				/>
				<div class="text">Timestamp</div
				><CustomBox
					id="setString-operand-parse-timestamp-variable"
					type="variable"
					filter="number"
					:model-value="form.parseTimestampVariable"
				/>
				<div class="text">Date Format</div
				><TextBox
					id="setString-operand-parse-timestamp-format"
					:model-value="form.parseTimestampFormat"
				/>
				<div class="text">Image Width</div
				><NumberBox
					id="setString-operand-screenshot-width"
					min="64"
					max="7680"
					unit="px"
					:model-value="form.screenshotWidth"
				/>
				<div class="text">Image Height</div
				><NumberBox
					id="setString-operand-screenshot-height"
					min="64"
					max="7680"
					unit="px"
					:model-value="form.screenshotHeight"
				/>
			</div>
		
	</WindowFrame>
</template>

<script setup lang="ts">
import { useLocalStore } from '@app/stores/local';
import { useInspectorStore } from '@app/stores/inspector';
import { onMounted, reactive, ref } from 'vue';
import { Command } from '@/command/command-object.ts';
import type { SetStringForm } from '@/module/command/setString.ts';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import { attachElementApi } from '@/utils/attach-element-api';
import CustomBox from '@app/components/common/CustomBox.vue';
import NumberBox from '@app/components/common/NumberBox.vue';
import NumberVar from '@app/components/common/NumberVar.vue';
import StringVar from '@app/components/common/StringVar.vue';
import TextArea from '@app/components/common/TextArea.vue';
import TextBox from '@app/components/common/TextBox.vue';
import SelectBox from '@app/components/common/SelectBox.vue';

const form = reactive<SetStringForm>({
	variable: { type: 'local', key: '' },
	operation: 'set',
	operandType: 'constant',
	commonValue: '',
	stringMethod: 'char',
	commonVariable: { type: 'local', key: '' },
	stringCharIndex: 0,
	stringSliceBegin: 0,
	stringSliceEnd: 0,
	stringPadStartLength: 2,
	stringPadStartPad: '0',
	stringReplacePattern: '',
	stringReplaceReplacement: '',
	attributeId: '',
	enumStringId: '',
	objectProperty: 'actor-team-id',
	elementProperty: 'text-content',
	elementElement: { type: 'trigger' },
	commonActor: { type: 'trigger' },
	commonSkill: { type: 'trigger' },
	commonTrigger: { type: 'trigger' },
	commonState: { type: 'trigger' },
	commonEquipment: { type: 'trigger' },
	commonItem: { type: 'trigger' },
	objectFileId: '',
	listIndex: 0,
	parameterKey: '',
	script: '',
	otherData: 'trigger-key',
	showChoicesIndex: 0,
	parseTimestampVariable: { type: 'local', key: '' },
	parseTimestampFormat: '{Y}-{M}-{D} {h}:{m}:{s}',
	screenshotWidth: 320,
	screenshotHeight: 180
});

const setForm = (data: Partial<SetStringForm>): void => {
	Object.assign(form, data);
	for (const [id, field] of Object.entries(FIELD_BY_ID)) {
		if (!(field in data)) continue;
		const control = document.getElementById(id) as
			| (HTMLElement & { write?: (value: unknown) => void })
			| null;
		if (control && typeof control.write === 'function') {
			control.write(data[field] as never);
		}
	}
};

const getForm = (): SetStringForm => {
	const data = { ...form } as SetStringForm;
	for (const [id, field] of Object.entries(FIELD_BY_ID)) {
		const control = document.getElementById(id) as
			| (HTMLElement & { read?: () => unknown })
			| null;
		if (control && typeof control.read === 'function') {
			data[field] = control.read() as never;
		}
	}
	return data;
};

const FIELD_BY_ID: Record<string, keyof SetStringForm> = {
	'setString-variable': 'variable',
	'setString-operation': 'operation',
	'setString-operand-type': 'operandType',
	'setString-operand-common-value': 'commonValue',
	'setString-operand-string-method': 'stringMethod',
	'setString-operand-common-variable': 'commonVariable',
	'setString-operand-string-char-index': 'stringCharIndex',
	'setString-operand-string-slice-begin': 'stringSliceBegin',
	'setString-operand-string-slice-end': 'stringSliceEnd',
	'setString-operand-string-pad-start-length': 'stringPadStartLength',
	'setString-operand-string-pad-start-pad': 'stringPadStartPad',
	'setString-operand-string-replace-pattern': 'stringReplacePattern',
	'setString-operand-string-replace-replacement': 'stringReplaceReplacement',
	'setString-operand-attribute-attributeId': 'attributeId',
	'setString-operand-enum-stringId': 'enumStringId',
	'setString-operand-object-property': 'objectProperty',
	'setString-operand-element-property': 'elementProperty',
	'setString-operand-element-element': 'elementElement',
	'setString-operand-common-actor': 'commonActor',
	'setString-operand-common-skill': 'commonSkill',
	'setString-operand-common-trigger': 'commonTrigger',
	'setString-operand-common-state': 'commonState',
	'setString-operand-common-equipment': 'commonEquipment',
	'setString-operand-common-item': 'commonItem',
	'setString-operand-object-fileId': 'objectFileId',
	'setString-operand-list-index': 'listIndex',
	'setString-operand-parameter-key': 'parameterKey',
	'setString-operand-script': 'script',
	'setString-operand-other-data': 'otherData',
	'setString-operand-showChoices-content-choiceIndex': 'showChoicesIndex',
	'setString-operand-parse-timestamp-variable': 'parseTimestampVariable',
	'setString-operand-parse-timestamp-format': 'parseTimestampFormat',
	'setString-operand-screenshot-width': 'screenshotWidth',
	'setString-operand-screenshot-height': 'screenshotHeight'
};

const frame = ref<InstanceType<typeof WindowFrame> | null>(null);

const inspector = useInspectorStore();
const onWrite = (value: unknown) => {
	Command?.cases?.setString?.writeHandler?.({ value });
};

const local = useLocalStore();

const onConfirm = () => {
	Command?.cases?.setString?.save?.();
};

onMounted(() => {
	const el = frame.value?.root;
	if (el) {
		attachElementApi(el, { setForm, getForm });
	}
});
</script>
