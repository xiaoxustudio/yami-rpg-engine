<template>
		<WindowFrame ref="frame" id="setNumber-operand" @confirm="onConfirm">
		<template #title><TitleBar>Number Operand<div class="close"></div></TitleBar></template>
		
			<div class="grid-box">
				<div class="text">Operation</div><SelectBox id="setNumber-operation" />
				<SelectBox id="setNumber-operand-operation" :model-value="form.operation" /> <div class="text">Type</div
				><SelectBox
					id="setNumber-operand-type"
					:model-value="form.operandType"
					@write="onWrite"
				/> <div class="text">Constant</div
				><NumberBox
					id="setNumber-operand-constant-value"
					min="-1000000000"
					max="1000000000"
					decimals="10"
					:model-value="form.constantValue"
				/>
				<div class="text">Math Method</div
				><SelectBox id="setNumber-operand-math-method" :model-value="form.mathMethod" />
				<div class="text">String Method</div
				><SelectBox id="setNumber-operand-string-method" :model-value="form.stringMethod" />
				<div class="text">Property</div
				><SelectBox id="setNumber-operand-object-property" :model-value="form.objectProperty" />
				<div class="text">Property</div
				><SelectBox
					id="setNumber-operand-element-property"
					:model-value="form.elementProperty"
				/>
				<div class="text">Element</div
				><CustomBox
					id="setNumber-operand-element-element"
					type="element"
					:model-value="form.elementElement"
				/>
				<div class="text">Variable</div
				><CustomBox
					id="setNumber-operand-common-variable"
					type="variable"
					filter="all"
					:model-value="form.commonVariable"
				/>
				<div class="text">Actor</div
				><CustomBox
					id="setNumber-operand-common-actor"
					type="actor"
					:model-value="form.commonActor"
				/>
				<div class="text">Skill</div
				><CustomBox
					id="setNumber-operand-common-skill"
					type="skill"
					:model-value="form.commonSkill"
				/>
				<div class="text">State</div
				><CustomBox
					id="setNumber-operand-common-state"
					type="state"
					:model-value="form.commonState"
				/>
				<div class="text">Equipment</div
				><CustomBox
					id="setNumber-operand-common-equipment"
					type="equipment"
					:model-value="form.commonEquipment"
				/>
				<div class="text">Item</div
				><CustomBox
					id="setNumber-operand-common-item"
					type="item"
					:model-value="form.commonItem"
				/>
				<div class="text">Trigger</div
				><CustomBox
					id="setNumber-operand-common-trigger"
					type="trigger"
					:model-value="form.commonTrigger"
				/>
				<div class="text">Tilemap</div
				><CustomBox
					id="setNumber-operand-common-tilemap"
					type="tilemap"
					:model-value="form.commonTilemap"
				/>
				<div class="text">Tilemap Position</div
				><CustomBox
					id="setNumber-operand-tilemapPosition"
					type="position"
					:model-value="form.tilemapPosition"
				/>
				<div class="text">Item</div
				><FileVar
					id="setNumber-operand-object-itemId"
					type="file"
					filter="item"
					:model-value="form.objectItemId"
				/>
				<div class="text">Equipment</div
				><FileVar
					id="setNumber-operand-object-equipmentId"
					type="file"
					filter="equipment"
					:model-value="form.objectEquipmentId"
				/>
				<div class="text">Search String</div
				><StringVar id="setNumber-operand-string-search" :model-value="form.stringSearch" />
				<div class="text">Decimal Places</div
				><NumberBox
					id="setNumber-operand-math-decimals"
					min="0"
					max="10"
					:model-value="form.mathDecimals"
				/>
				<div class="text">Min</div
				><NumberVar
					id="setNumber-operand-math-min"
					min="-1000000000"
					max="1000000000"
					:model-value="form.mathMin"
				/>
				<div class="text">Max</div
				><NumberVar
					id="setNumber-operand-math-max"
					min="-1000000000"
					max="1000000000"
					:model-value="form.mathMax"
				/>
				<div class="text">Start Position</div
				><CustomBox
					id="setNumber-operand-math-startPosition"
					type="position"
					:model-value="form.mathStartPosition"
				/>
				<div class="text">End Position</div
				><CustomBox
					id="setNumber-operand-math-endPosition"
					type="position"
					:model-value="form.mathEndPosition"
				/>
				<div class="text">Cooldown Key</div
				><SelectVar id="setNumber-operand-cooldown-key" :model-value="form.cooldownKey" />
				<div class="text">Index</div
				><NumberVar
					id="setNumber-operand-list-index"
					min="0"
					max="1000000000"
					:model-value="form.listIndex"
				/>
				<div class="text">Param Name</div
				><StringVar
					id="setNumber-operand-parameter-key"
					:model-value="form.parameterKey"
				/>
				<div class="text">Script</div
				><TextBox id="setNumber-operand-script" :model-value="form.script" /> <div class="text">Data</div
				><SelectBox id="setNumber-operand-other-data" :model-value="form.otherData" /> <div class="text">Touch Id</div
				><NumberVar
					id="setNumber-operand-other-touchId"
					min="0"
					max="10"
					:model-value="form.otherTouchId"
				/>
				<div class="text">Team</div
				><SelectBox id="setNumber-operand-other-teamId" :model-value="form.otherTeamId" />
			</div>
		
	</WindowFrame>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue';
import { NumberOperand, type NumberOperandForm } from '@/command/set-value-operand-window.ts';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import { useInspectorStore } from '@app/stores/inspector';
import { useLocalStore } from '@app/stores/local';
import { attachElementApi } from '@/utils/attach-element-api';
import CustomBox from '@app/components/common/CustomBox.vue';
import FileVar from '@app/components/common/FileVar.vue';
import NumberBox from '@app/components/common/NumberBox.vue';
import NumberVar from '@app/components/common/NumberVar.vue';
import SelectVar from '@app/components/common/SelectVar.vue';
import StringVar from '@app/components/common/StringVar.vue';
import TextBox from '@app/components/common/TextBox.vue';
import SelectBox from '@app/components/common/SelectBox.vue';

const form = reactive<NumberOperandForm>({
	operation: 'add',
	operandType: 'constant',
	constantValue: 0,
	mathMethod: 'round',
	mathDecimals: 0,
	mathMin: 0,
	mathMax: 1,
	mathStartPosition: { type: 'actor', actor: { type: 'trigger' } },
	mathEndPosition: { type: 'actor', actor: { type: 'trigger' } },
	stringMethod: 'length',
	stringSearch: '',
	commonVariable: { type: 'local', key: '' },
	objectProperty: 'actor-x',
	objectItemId: '',
	objectEquipmentId: '',
	elementProperty: 'element-x',
	elementElement: { type: 'trigger' },
	commonActor: { type: 'trigger' },
	commonSkill: { type: 'trigger' },
	commonState: { type: 'trigger' },
	commonEquipment: { type: 'trigger' },
	commonItem: { type: 'trigger' },
	commonTrigger: { type: 'trigger' },
	commonTilemap: { type: 'trigger' },
	tilemapPosition: { type: 'absolute', x: 0, y: 0 },
	cooldownKey: '',
	listIndex: 0,
	parameterKey: '',
	script: '',
	otherData: 'trigger-button',
	otherTouchId: 0,
	otherTeamId: ''
});

const setForm = (data: Partial<NumberOperandForm>): void => {
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

const getForm = (): NumberOperandForm => {
	const data = { ...form } as NumberOperandForm;
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

const FIELD_BY_ID: Record<string, keyof NumberOperandForm> = {
	'setNumber-operand-operation': 'operation',
	'setNumber-operand-type': 'operandType',
	'setNumber-operand-constant-value': 'constantValue',
	'setNumber-operand-math-method': 'mathMethod',
	'setNumber-operand-string-method': 'stringMethod',
	'setNumber-operand-object-property': 'objectProperty',
	'setNumber-operand-element-property': 'elementProperty',
	'setNumber-operand-element-element': 'elementElement',
	'setNumber-operand-common-variable': 'commonVariable',
	'setNumber-operand-common-actor': 'commonActor',
	'setNumber-operand-common-skill': 'commonSkill',
	'setNumber-operand-common-state': 'commonState',
	'setNumber-operand-common-equipment': 'commonEquipment',
	'setNumber-operand-common-item': 'commonItem',
	'setNumber-operand-common-trigger': 'commonTrigger',
	'setNumber-operand-common-tilemap': 'commonTilemap',
	'setNumber-operand-tilemapPosition': 'tilemapPosition',
	'setNumber-operand-object-itemId': 'objectItemId',
	'setNumber-operand-object-equipmentId': 'objectEquipmentId',
	'setNumber-operand-string-search': 'stringSearch',
	'setNumber-operand-math-decimals': 'mathDecimals',
	'setNumber-operand-math-min': 'mathMin',
	'setNumber-operand-math-max': 'mathMax',
	'setNumber-operand-math-startPosition': 'mathStartPosition',
	'setNumber-operand-math-endPosition': 'mathEndPosition',
	'setNumber-operand-cooldown-key': 'cooldownKey',
	'setNumber-operand-list-index': 'listIndex',
	'setNumber-operand-parameter-key': 'parameterKey',
	'setNumber-operand-script': 'script',
	'setNumber-operand-other-data': 'otherData',
	'setNumber-operand-other-touchId': 'otherTouchId',
	'setNumber-operand-other-teamId': 'otherTeamId'
};

const frame = ref<InstanceType<typeof WindowFrame> | null>(null);

const onWrite = (value: unknown) => {
	NumberOperand?.writeHandler?.({ value });
};

const inspector = useInspectorStore();
const local = useLocalStore();

const onConfirm = () => {
	NumberOperand?.confirm?.();
};

onMounted(() => {
	const el = frame.value?.root;
	if (el) {
		attachElementApi(el, { setForm, getForm });
	}


});
</script>
