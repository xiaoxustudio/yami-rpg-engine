<template>
	<WindowFrame ref="frame" id="if-condition" @confirm="onConfirm">
		<template #title
			><TitleBar
				>{{ t('components.if-condition.title') }}
				<div class="close"></div></TitleBar
		></template>

		<IfConditionFields :form="form" :field-ref="fieldRef" />
	</WindowFrame>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { composableEls } from '@app/composables/element-registry';
import { registerElement } from '@app/utils/element-registry';
import { useIfConditionSchema } from '@app/composables/useIfConditionSchema';
import type { IfConditionForm } from '@app/composables/useIfConditionSchema';
import { setupIfConditionFields, type FieldControl } from '@app/composables/useIfConditionFields';

const IfCondition = useIfConditionSchema();
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import IfConditionFields from '@app/components/tools/if-condition/IfConditionFields.vue';
import { attachElementApi } from '@app/utils/attach-element-api';

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

const fieldEls = new Map<string, FieldControl | null>();

/**
 * 控件实例 → 元素：普通元素直接用；组件实例优先 `$el`（**ref 回调时即已就绪**），
 * 回退到约定的 `root`（部分组件要到挂载后才赋值）。
 */
const elementOf = (control: FieldControl | null): HTMLElement | null => {
	if (control == null) return null;
	if (control instanceof HTMLElement) return control;
	const instance = control as FieldControl & { $el?: unknown };
	return (instance.$el instanceof HTMLElement ? instance.$el : null) ?? instance.root ?? null;
};

const fieldRef = (id: string) => (el: unknown) => {
	const control = el as FieldControl | null;
	fieldEls.set(id, control);
	registerElement(composableEls, id, elementOf(control));
};

const frame = ref<InstanceType<typeof WindowFrame> | null>(null);

const onConfirm = () => {
	IfCondition?.confirm?.(new Event('click'));
};

onMounted(() => {
	const el = frame.value?.root;
	if (el) {
		attachElementApi(el, { setForm, getForm });
		registerElement(composableEls, 'if-condition', el);
	}
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
