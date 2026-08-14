<template>
	<WindowFrame ref="frame" id="if-condition" @confirm="onConfirm">
		<template #title><TitleBar>Condition<div class="close"></div></TitleBar></template>
		
			<div class="grid-box">
				<div class="text">Condition Type</div
				><SelectBox id="if-condition-type" :model-value="form.type" :ref="fieldRef('if-condition-type')" @write="onWrite" />
				<div class="text">Variable</div
				><CustomBox
					id="if-condition-common-variable"
					:ref="fieldRef('if-condition-common-variable')"
					type="variable"
					filter="all"
					:model-value="form.commonVariable"
				/>
				<div class="text">Operation</div
				><SelectBox
					id="if-condition-boolean-operation"
					:ref="fieldRef('if-condition-boolean-operation')"
					:model-value="form.booleanOperation"
				/>
				<div class="text">Operand Type</div
				><SelectBox
					id="if-condition-boolean-operand-type"
					:ref="fieldRef('if-condition-boolean-operand-type')"
					:model-value="form.booleanOperandType"
				/> <div class="text">Constant</div
				><SelectBox
					id="if-condition-boolean-constant-value"
					:ref="fieldRef('if-condition-boolean-constant-value')"
					:model-value="form.booleanConstantValue"
				/>
				<div class="text">Operation</div
				><SelectBox
					id="if-condition-number-operation"
					:ref="fieldRef('if-condition-number-operation')"
					:model-value="form.numberOperation"
				/>
				<div class="text">Operand Type</div
				><SelectBox
					id="if-condition-number-operand-type"
					:ref="fieldRef('if-condition-number-operand-type')"
					:model-value="form.numberOperandType"
				/>
				<div class="text">Constant</div
				><NumberBox
					id="if-condition-number-constant-value"
					:ref="fieldRef('if-condition-number-constant-value')"
					min="-1000000000"
					max="1000000000"
					decimals="10"
					:model-value="form.numberConstantValue"
				/>
				<div class="text">Operation</div
				><SelectBox
					id="if-condition-string-operation"
					:ref="fieldRef('if-condition-string-operation')"
					:model-value="form.stringOperation"
				/>
				<div class="text">Operand Type</div
				><SelectBox
					id="if-condition-string-operand-type"
					:ref="fieldRef('if-condition-string-operand-type')"
					:model-value="form.stringOperandType"
				/>
				<div class="text">Constant</div
				><TextArea
					id="if-condition-string-constant-value"
					:ref="fieldRef('if-condition-string-constant-value')"
					:model-value="form.stringConstantValue"
				/>
				<div class="text">Enum String</div
				><CustomBox
					id="if-condition-string-enum-stringId"
					:ref="fieldRef('if-condition-string-enum-stringId')"
					type="enum-string"
					:model-value="form.stringEnumStringId"
				/>
				<div class="text">Operation</div
				><SelectBox
					id="if-condition-object-operation"
					:ref="fieldRef('if-condition-object-operation')"
					:model-value="form.objectOperation"
				/>
				<div class="text">Operand Type</div
				><SelectBox
					id="if-condition-object-operand-type"
					:ref="fieldRef('if-condition-object-operand-type')"
					:model-value="form.objectOperandType"
				/>
				<div class="text">Operation</div
				><SelectBox
					id="if-condition-list-operation"
					:ref="fieldRef('if-condition-list-operation')"
					:model-value="form.listOperation"
				/>
				<div class="text">Variable</div
				><CustomBox
					id="if-condition-operand-variable"
					:ref="fieldRef('if-condition-operand-variable')"
					type="variable"
					filter="all"
					:model-value="form.operandVariable"
				/>
				<div class="text">Operation</div
				><SelectBox
					id="if-condition-actor-operation"
					:ref="fieldRef('if-condition-actor-operation')"
					:model-value="form.actorOperation"
				/>
				<div class="text">Actor</div
				><CustomBox
					id="if-condition-common-actor"
					:ref="fieldRef('if-condition-common-actor')"
					type="actor"
					:model-value="form.commonActor"
				/>
				<div class="text">Skill</div
				><CustomBox
					id="if-condition-common-skill"
					:ref="fieldRef('if-condition-common-skill')"
					type="skill"
					:model-value="form.commonSkill"
				/>
				<div class="text">State</div
				><CustomBox
					id="if-condition-common-state"
					:ref="fieldRef('if-condition-common-state')"
					type="state"
					:model-value="form.commonState"
				/>
				<div class="text">Equipment</div
				><CustomBox
					id="if-condition-common-equipment"
					:ref="fieldRef('if-condition-common-equipment')"
					type="equipment"
					:model-value="form.commonEquipment"
				/>
				<div class="text">Item</div
				><CustomBox
					id="if-condition-common-item"
					:ref="fieldRef('if-condition-common-item')"
					type="item"
					:model-value="form.commonItem"
				/>
				<div class="text">Trigger</div
				><CustomBox
					id="if-condition-common-trigger"
					:ref="fieldRef('if-condition-common-trigger')"
					type="trigger"
					:model-value="form.commonTrigger"
				/>
				<div class="text">Light</div
				><CustomBox
					id="if-condition-common-light"
					:ref="fieldRef('if-condition-common-light')"
					type="light"
					:model-value="form.commonLight"
				/>
				<div class="text">Element</div
				><CustomBox
					id="if-condition-common-element"
					:ref="fieldRef('if-condition-common-element')"
					type="element"
					:model-value="form.commonElement"
				/>
				<div class="text">Skill</div
				><CustomBox
					id="if-condition-actor-skillId"
					:ref="fieldRef('if-condition-actor-skillId')"
					type="file"
					filter="skill"
					:model-value="form.actorSkillId"
				/>
				<div class="text">State</div
				><CustomBox
					id="if-condition-actor-stateId"
					:ref="fieldRef('if-condition-actor-stateId')"
					type="file"
					filter="state"
					:model-value="form.actorStateId"
				/>
				<div class="text">Item</div
				><CustomBox
					id="if-condition-actor-itemId"
					:ref="fieldRef('if-condition-actor-itemId')"
					type="file"
					filter="item"
					:model-value="form.actorItemId"
				/>
				<div class="text">Equipment</div
				><CustomBox
					id="if-condition-actor-equipmentId"
					:ref="fieldRef('if-condition-actor-equipmentId')"
					type="file"
					filter="equipment"
					:model-value="form.actorEquipmentId"
				/>
				<div class="text">Quantity</div
				><NumberBox
					id="if-condition-actor-quantity"
					:ref="fieldRef('if-condition-actor-quantity')"
					min="1"
					max="10000"
					:model-value="form.actorQuantity"
				/>
				<div class="text">Shortcut Key</div
				><SelectVar
					id="if-condition-actor-shortcutKey"
					:ref="fieldRef('if-condition-actor-shortcutKey')"
					:model-value="form.actorShortcutKey"
				/>
				<div class="text">Target</div
				><CustomBox
					id="if-condition-actor-target"
					:ref="fieldRef('if-condition-actor-target')"
					type="actor"
					:model-value="form.actorTarget"
				/>
				<div class="text">Team</div
				><SelectBox id="if-condition-actor-teamId" :ref="fieldRef('if-condition-actor-teamId')" :model-value="form.actorTeamId" />
				<div class="text">Operation</div
				><SelectBox
					id="if-condition-element-operation"
					:ref="fieldRef('if-condition-element-operation')"
					:model-value="form.elementOperation"
				/>
				<div class="text">Key Code</div><KeyboardBox id="if-condition-keyboard-keycode" :ref="fieldRef('if-condition-keyboard-keycode')" />
				<div class="text">State</div
				><SelectBox id="if-condition-keyboard-state" :ref="fieldRef('if-condition-keyboard-state')" :model-value="form.keyboardState" />
				<div class="text">Button</div><GamepadBox id="if-condition-gamepad-button" :ref="fieldRef('if-condition-gamepad-button')" />
				<div class="text">State</div
				><SelectBox id="if-condition-gamepad-state" :ref="fieldRef('if-condition-gamepad-state')" :model-value="form.gamepadState" />
				<div class="text">Button</div
				><SelectBox id="if-condition-mouse-button" :ref="fieldRef('if-condition-mouse-button')" :model-value="form.mouseButton" />
				<div class="text">State</div
				><SelectBox id="if-condition-mouse-state" :ref="fieldRef('if-condition-mouse-state')" :model-value="form.mouseState" />
				<div class="text">Other</div
				><SelectBox id="if-condition-other-key" :ref="fieldRef('if-condition-other-key')" :model-value="form.otherKey" />
			</div>
		
	</WindowFrame>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue';
import { IfCondition, type IfConditionForm } from '@/command/conditional-condition-window.ts';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import GamepadBox from '@app/components/common/GamepadBox.vue';
import KeyboardBox from '@app/components/common/KeyboardBox.vue';
import { useInspectorStore } from '@app/stores/inspector';
import { useLocalStore } from '@app/stores/local';
import { attachElementApi } from '@/utils/attach-element-api';
import CustomBox from '@app/components/common/CustomBox.vue';
import NumberBox from '@app/components/common/NumberBox.vue';
import SelectVar from '@app/components/common/SelectVar.vue';
import TextArea from '@app/components/common/TextArea.vue';
import SelectBox from '@app/components/common/SelectBox.vue';

const form = reactive<IfConditionForm>({
	type: 'number',
	commonVariable: { type: 'local', key: '' },
	booleanOperation: 'equal',
	booleanOperandType: 'constant',
	booleanConstantValue: true,
	numberOperation: 'equal',
	numberOperandType: 'constant',
	numberConstantValue: 0,
	stringOperation: 'equal',
	stringOperandType: 'constant',
	stringConstantValue: '',
	stringEnumStringId: '',
	objectOperation: 'equal',
	objectOperandType: 'none',
	listOperation: 'include',
	operandVariable: { type: 'local', key: '' },
	actorOperation: 'present-active',
	commonActor: { type: 'trigger' },
	commonSkill: { type: 'trigger' },
	commonState: { type: 'trigger' },
	commonEquipment: { type: 'trigger' },
	commonItem: { type: 'trigger' },
	commonTrigger: { type: 'trigger' },
	commonLight: { type: 'trigger' },
	commonElement: { type: 'trigger' },
	actorSkillId: '',
	actorStateId: '',
	actorItemId: '',
	actorEquipmentId: '',
	actorQuantity: 1,
	actorShortcutKey: '',
	actorTarget: { type: 'trigger' },
	actorTeamId: '',
	elementOperation: 'present',
	keyboardKeycode: '',
	keyboardState: 'just-pressed',
	gamepadButton: -1,
	gamepadState: 'just-pressed',
	mouseButton: 0,
	mouseState: 'just-pressed',
	otherKey: 'mouse-entered'
});

const setForm = (data: Partial<IfConditionForm>): void => {
	Object.assign(form, data);
	for (const [id, field] of Object.entries(FIELD_BY_ID)) {
		if (!(field in data)) continue;
		const control = fieldEls.get(id);
		if (control && typeof control.write === 'function') {
			control.write(data[field] as never);
		}
	}
};

const getForm = (): IfConditionForm => {
	const data = { ...form } as IfConditionForm;
	for (const [id, field] of Object.entries(FIELD_BY_ID)) {
		const control = fieldEls.get(id);
		if (control && typeof control.read === 'function') {
			data[field] = control.read() as never;
		}
	}
	return data;
};

const FIELD_BY_ID: Record<string, keyof IfConditionForm> = {
	'if-condition-type': 'type',
	'if-condition-common-variable': 'commonVariable',
	'if-condition-boolean-operation': 'booleanOperation',
	'if-condition-boolean-operand-type': 'booleanOperandType',
	'if-condition-boolean-constant-value': 'booleanConstantValue',
	'if-condition-number-operation': 'numberOperation',
	'if-condition-number-operand-type': 'numberOperandType',
	'if-condition-number-constant-value': 'numberConstantValue',
	'if-condition-string-operation': 'stringOperation',
	'if-condition-string-operand-type': 'stringOperandType',
	'if-condition-string-constant-value': 'stringConstantValue',
	'if-condition-string-enum-stringId': 'stringEnumStringId',
	'if-condition-object-operation': 'objectOperation',
	'if-condition-object-operand-type': 'objectOperandType',
	'if-condition-list-operation': 'listOperation',
	'if-condition-operand-variable': 'operandVariable',
	'if-condition-actor-operation': 'actorOperation',
	'if-condition-common-actor': 'commonActor',
	'if-condition-common-skill': 'commonSkill',
	'if-condition-common-state': 'commonState',
	'if-condition-common-equipment': 'commonEquipment',
	'if-condition-common-item': 'commonItem',
	'if-condition-common-trigger': 'commonTrigger',
	'if-condition-common-light': 'commonLight',
	'if-condition-common-element': 'commonElement',
	'if-condition-actor-skillId': 'actorSkillId',
	'if-condition-actor-stateId': 'actorStateId',
	'if-condition-actor-itemId': 'actorItemId',
	'if-condition-actor-equipmentId': 'actorEquipmentId',
	'if-condition-actor-quantity': 'actorQuantity',
	'if-condition-actor-shortcutKey': 'actorShortcutKey',
	'if-condition-actor-target': 'actorTarget',
	'if-condition-actor-teamId': 'actorTeamId',
	'if-condition-element-operation': 'elementOperation',
	'if-condition-keyboard-keycode': 'keyboardKeycode',
	'if-condition-keyboard-state': 'keyboardState',
	'if-condition-gamepad-button': 'gamepadButton',
	'if-condition-gamepad-state': 'gamepadState',
	'if-condition-mouse-button': 'mouseButton',
	'if-condition-mouse-state': 'mouseState',
	'if-condition-other-key': 'otherKey'
};

interface FieldControl {
	read?: () => unknown;
	write?: (value: unknown) => void;
}

const fieldEls = new Map<string, FieldControl | null>();

const fieldRef = (id: string) => (el: unknown) => {
	fieldEls.set(id, el as FieldControl | null);
};

const frame = ref<InstanceType<typeof WindowFrame> | null>(null);

const onWrite = (value: unknown) => {
	IfCondition?.writeHandler?.({ value });
};

const inspector = useInspectorStore();
const local = useLocalStore();

const onConfirm = () => {
	IfCondition?.confirm?.();
};

onMounted(() => {
	const el = frame.value?.root;
	if (el) {
		attachElementApi(el, { setForm, getForm });
	}
	inspector.syncState();
	local.syncState();
});
</script>
