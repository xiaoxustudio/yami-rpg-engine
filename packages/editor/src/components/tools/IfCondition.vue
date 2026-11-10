<template>
	<WindowFrame id="if-condition" @confirm="onConfirm" scrollable>
		<template #title
			><TitleBar
				>{{ t('components.if-condition.title') }}
				<div class="close"></div></TitleBar
		></template>

		<IfConditionFields :form="form" :field-ref="fieldRef" />
	</WindowFrame>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, reactive } from 'vue';
import { useI18n } from 'vue-i18n';
import { useIfConditionSchema } from '@app/composables/useIfConditionSchema';
import { toControl } from '@app/composables/control-refs';
import type { IfConditionForm } from '@app/composables/useIfConditionSchema';
import {
	setupIfConditionFields,
	type FieldControl,
	type IfConditionFieldMap
} from '@app/composables/useIfConditionFields';

const IfCondition = useIfConditionSchema();
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import IfConditionFields from '@app/components/tools/if-condition/IfConditionFields.vue';
import {
	provideIfConditionBridge,
	resetIfConditionBridge
} from '@app/composables/if-condition-bridge';

const { t } = useI18n();

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
		const control = fieldEls[id];
		if (control && typeof control.write === 'function') {
			control.write(data[field] as never);
		}
	}
};

const getForm = (): IfConditionForm => {
	const data = { ...form } as IfConditionForm;
	for (const [id, field] of Object.entries(FIELD_BY_ID)) {
		const control = fieldEls[id];
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

const fieldEls: IfConditionFieldMap = {};

const fieldRef = (id: string) => (el: unknown) => {
	const control = el as FieldControl | null;
	fieldEls[id] = control;
};

const onConfirm = () => {
	IfCondition?.confirm?.(new Event('click'));
};

onMounted(() => {
	// 表单桥走模块而不是元素属性：元素契约收尾后 el 上不该再挂业务方法。
	// 真机 E2E 在 debug 模式下由桥模块另开一条只读通道（utils/debug-bridges.ts）。
	const api = {
		setForm,
		getForm,
		control: (name: 'commonVariable' | 'operandVariable' | 'shortcutKey') => {
			const id =
				name === 'commonVariable'
					? 'if-condition-common-variable'
					: name === 'operandVariable'
						? 'if-condition-operand-variable'
						: 'if-condition-actor-shortcutKey';
			return toControl((fieldEls as Record<string, unknown>)[id] ?? null);
		}
	};
	provideIfConditionBridge(api);
	onUnmounted(() => resetIfConditionBridge(api));
	setupIfConditionFields(fieldEls);
});
</script>

<style>
#if-condition {
	width: 324px;
	height: 218px;
}

#if-condition-string-constant-value {
	height: 44px;
}

#if-condition-confirm {
	right: 108px;
	bottom: 10px;
}

#if-condition-cancel {
	right: 10px;
	bottom: 10px;
}
</style>
