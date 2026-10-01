<template>
	<div class="grid-box">
		<div class="text">{{ t('components.if-condition-type.label') }}</div>
		<SelectBox
			id="if-condition-type"
			v-tip="t('components.if-condition-type.tip')"
			v-focus
			:model-value="form.type"
			:ref="fieldRef('if-condition-type')"
			@write="onWrite"
		/>
		<div class="text">{{ t('components.if-condition-common-variable.label') }}</div>
		<CustomBox
			id="if-condition-common-variable"
			v-tip="t('components.if-condition-common-variable.tip')"
			v-focus
			:ref="fieldRef('if-condition-common-variable')"
			type="variable"
			filter="all"
			:model-value="form.commonVariable"
		/>
		<div class="text">{{ t('components.if-condition-boolean-operation.label') }}</div>
		<SelectBox
			id="if-condition-boolean-operation"
			v-tip="t('components.if-condition-boolean-operation.tip')"
			:ref="fieldRef('if-condition-boolean-operation')"
			:model-value="form.booleanOperation"
		/>
		<div class="text">{{ t('components.if-condition-boolean-operand-type.label') }}</div>
		<SelectBox
			id="if-condition-boolean-operand-type"
			v-tip="t('components.if-condition-boolean-operand-type.tip')"
			:ref="fieldRef('if-condition-boolean-operand-type')"
			:model-value="form.booleanOperandType"
		/>
		<div class="text">{{ t('components.if-condition-boolean-constant-value.label') }}</div>
		<SelectBox
			id="if-condition-boolean-constant-value"
			:ref="fieldRef('if-condition-boolean-constant-value')"
			:model-value="form.booleanConstantValue"
		/>
		<div class="text">{{ t('components.if-condition-number-operation.label') }}</div>
		<SelectBox
			id="if-condition-number-operation"
			v-tip="t('components.if-condition-number-operation.tip')"
			:ref="fieldRef('if-condition-number-operation')"
			:model-value="form.numberOperation"
		/>
		<div class="text">{{ t('components.if-condition-number-operand-type.label') }}</div>
		<SelectBox
			id="if-condition-number-operand-type"
			v-tip="t('components.if-condition-number-operand-type.tip')"
			:ref="fieldRef('if-condition-number-operand-type')"
			:model-value="form.numberOperandType"
		/>
		<div class="text">{{ t('components.if-condition-number-constant-value.label') }}</div>
		<NumberBox
			:label="t('components.if-condition-number-constant-value.label')"
			id="if-condition-number-constant-value"
			v-tip="t('components.if-condition-number-constant-value.tip')"
			:ref="fieldRef('if-condition-number-constant-value')"
			min="-1000000000"
			max="1000000000"
			decimals="10"
			:model-value="form.numberConstantValue"
		/>
		<div class="text">{{ t('components.if-condition-string-operation.label') }}</div>
		<SelectBox
			id="if-condition-string-operation"
			v-tip="t('components.if-condition-string-operation.tip')"
			:ref="fieldRef('if-condition-string-operation')"
			:model-value="form.stringOperation"
		/>
		<div class="text">{{ t('components.if-condition-string-operand-type.label') }}</div>
		<SelectBox
			id="if-condition-string-operand-type"
			v-tip="t('components.if-condition-string-operand-type.tip')"
			:ref="fieldRef('if-condition-string-operand-type')"
			:model-value="form.stringOperandType"
		/>
		<div class="text">{{ t('components.if-condition-string-constant-value.label') }}</div>
		<TextArea
			:label="t('components.if-condition-string-constant-value.label')"
			id="if-condition-string-constant-value"
			v-tip="t('components.if-condition-string-constant-value.tip')"
			:ref="fieldRef('if-condition-string-constant-value')"
			:model-value="form.stringConstantValue"
		/>
		<div class="text">{{ t('components.if-condition-string-enum-stringId.label') }}</div>
		<CustomBox
			id="if-condition-string-enum-stringId"
			v-tip="t('components.if-condition-string-enum-stringId.tip')"
			v-focus
			:ref="fieldRef('if-condition-string-enum-stringId')"
			type="enum-string"
			:model-value="form.stringEnumStringId"
		/>
		<div class="text">{{ t('components.if-condition-object-operation.label') }}</div>
		<SelectBox
			id="if-condition-object-operation"
			v-tip="t('components.if-condition-object-operation.tip')"
			:ref="fieldRef('if-condition-object-operation')"
			:model-value="form.objectOperation"
		/>
		<div class="text">{{ t('components.if-condition-object-operand-type.label') }}</div>
		<SelectBox
			id="if-condition-object-operand-type"
			v-tip="t('components.if-condition-object-operand-type.tip')"
			:ref="fieldRef('if-condition-object-operand-type')"
			:model-value="form.objectOperandType"
		/>
		<div class="text">{{ t('components.if-condition-list-operation.label') }}</div>
		<SelectBox
			id="if-condition-list-operation"
			v-tip="t('components.if-condition-list-operation.tip')"
			:ref="fieldRef('if-condition-list-operation')"
			:model-value="form.listOperation"
		/>
		<div class="text">{{ t('components.if-condition-operand-variable.label') }}</div>
		<CustomBox
			id="if-condition-operand-variable"
			v-tip="t('components.if-condition-operand-variable.tip')"
			v-focus
			:ref="fieldRef('if-condition-operand-variable')"
			type="variable"
			filter="all"
			:model-value="form.operandVariable"
		/>
		<div class="text">{{ t('components.if-condition-actor-operation.label') }}</div>
		<SelectBox
			id="if-condition-actor-operation"
			v-tip="t('components.if-condition-actor-operation.tip')"
			:ref="fieldRef('if-condition-actor-operation')"
			:model-value="form.actorOperation"
		/>
		<div class="text">{{ t('components.if-condition-common-actor.label') }}</div>
		<CustomBox
			id="if-condition-common-actor"
			v-tip="t('components.if-condition-common-actor.tip')"
			:ref="fieldRef('if-condition-common-actor')"
			type="actor"
			:model-value="form.commonActor"
		/>
		<div class="text">{{ t('components.if-condition-common-skill.label') }}</div>
		<CustomBox
			id="if-condition-common-skill"
			v-tip="t('components.if-condition-common-skill.tip')"
			:ref="fieldRef('if-condition-common-skill')"
			type="skill"
			:model-value="form.commonSkill"
		/>
		<div class="text">{{ t('components.if-condition-common-state.label') }}</div>
		<CustomBox
			id="if-condition-common-state"
			v-tip="t('components.if-condition-common-state.tip')"
			:ref="fieldRef('if-condition-common-state')"
			type="state"
			:model-value="form.commonState"
		/>
		<div class="text">{{ t('components.if-condition-common-equipment.label') }}</div>
		<CustomBox
			id="if-condition-common-equipment"
			v-tip="t('components.if-condition-common-equipment.tip')"
			:ref="fieldRef('if-condition-common-equipment')"
			type="equipment"
			:model-value="form.commonEquipment"
		/>
		<div class="text">{{ t('components.if-condition-common-item.label') }}</div>
		<CustomBox
			id="if-condition-common-item"
			v-tip="t('components.if-condition-common-item.tip')"
			:ref="fieldRef('if-condition-common-item')"
			type="item"
			:model-value="form.commonItem"
		/>
		<div class="text">{{ t('components.if-condition-common-trigger.label') }}</div>
		<CustomBox
			id="if-condition-common-trigger"
			v-tip="t('components.if-condition-common-trigger.tip')"
			:ref="fieldRef('if-condition-common-trigger')"
			type="trigger"
			:model-value="form.commonTrigger"
		/>
		<div class="text">{{ t('components.if-condition-common-light.label') }}</div>
		<CustomBox
			id="if-condition-common-light"
			v-tip="t('components.if-condition-common-light.tip')"
			:ref="fieldRef('if-condition-common-light')"
			type="light"
			:model-value="form.commonLight"
		/>
		<div class="text">{{ t('components.if-condition-common-element.label') }}</div>
		<CustomBox
			id="if-condition-common-element"
			v-tip="t('components.if-condition-common-element.tip')"
			:ref="fieldRef('if-condition-common-element')"
			type="element"
			:model-value="form.commonElement"
		/>
		<div class="text">{{ t('components.if-condition-actor-skillId.label') }}</div>
		<CustomBox
			id="if-condition-actor-skillId"
			v-tip="t('components.if-condition-actor-skillId.tip')"
			v-focus
			:ref="fieldRef('if-condition-actor-skillId')"
			type="file"
			filter="skill"
			:model-value="form.actorSkillId"
		/>
		<div class="text">{{ t('components.if-condition-actor-stateId.label') }}</div>
		<CustomBox
			id="if-condition-actor-stateId"
			v-tip="t('components.if-condition-actor-stateId.tip')"
			v-focus
			:ref="fieldRef('if-condition-actor-stateId')"
			type="file"
			filter="state"
			:model-value="form.actorStateId"
		/>
		<div class="text">{{ t('components.if-condition-actor-itemId.label') }}</div>
		<CustomBox
			id="if-condition-actor-itemId"
			v-tip="t('components.if-condition-actor-itemId.tip')"
			v-focus
			:ref="fieldRef('if-condition-actor-itemId')"
			type="file"
			filter="item"
			:model-value="form.actorItemId"
		/>
		<div class="text">{{ t('components.if-condition-actor-equipmentId.label') }}</div>
		<CustomBox
			id="if-condition-actor-equipmentId"
			v-tip="t('components.if-condition-actor-equipmentId.tip')"
			v-focus
			:ref="fieldRef('if-condition-actor-equipmentId')"
			type="file"
			filter="equipment"
			:model-value="form.actorEquipmentId"
		/>
		<div class="text">{{ t('components.if-condition-actor-quantity.label') }}</div>
		<NumberBox
			:label="t('components.if-condition-actor-quantity.label')"
			id="if-condition-actor-quantity"
			v-tip="t('components.if-condition-actor-quantity.tip')"
			:ref="fieldRef('if-condition-actor-quantity')"
			min="1"
			max="10000"
			:model-value="form.actorQuantity"
		/>
		<div class="text">{{ t('components.if-condition-actor-shortcutKey.label') }}</div>
		<SelectVar
			id="if-condition-actor-shortcutKey"
			v-tip="t('components.if-condition-actor-shortcutKey.tip')"
			v-focus
			:ref="fieldRef('if-condition-actor-shortcutKey')"
			:model-value="form.actorShortcutKey"
		/>
		<div class="text">{{ t('components.if-condition-actor-target.label') }}</div>
		<CustomBox
			id="if-condition-actor-target"
			v-tip="t('components.if-condition-actor-target.tip')"
			:ref="fieldRef('if-condition-actor-target')"
			type="actor"
			:model-value="form.actorTarget"
		/>
		<div class="text">{{ t('components.if-condition-actor-teamId.label') }}</div>
		<SelectBox
			id="if-condition-actor-teamId"
			v-tip="t('components.if-condition-actor-teamId.tip')"
			:ref="fieldRef('if-condition-actor-teamId')"
			:model-value="form.actorTeamId"
		/>
		<div class="text">{{ t('components.if-condition-element-operation.label') }}</div>
		<SelectBox
			id="if-condition-element-operation"
			v-tip="t('components.if-condition-element-operation.tip')"
			:ref="fieldRef('if-condition-element-operation')"
			:model-value="form.elementOperation"
		/>
		<div class="text">{{ t('components.if-condition-keyboard-keycode.label') }}</div>
		<KeyboardBox
			:label="t('components.if-condition-keyboard-keycode.label')"
			id="if-condition-keyboard-keycode"
			v-tip="t('components.if-condition-keyboard-keycode.tip')"
			v-focus
			:ref="fieldRef('if-condition-keyboard-keycode')"
		/>
		<div class="text">{{ t('components.if-condition-keyboard-state.label') }}</div>
		<SelectBox
			id="if-condition-keyboard-state"
			v-tip="t('components.if-condition-keyboard-state.tip')"
			:ref="fieldRef('if-condition-keyboard-state')"
			:model-value="form.keyboardState"
		/>
		<div class="text">{{ t('components.if-condition-gamepad-button.label') }}</div>
		<GamepadBox
			:label="t('components.if-condition-gamepad-button.label')"
			id="if-condition-gamepad-button"
			v-tip="t('components.if-condition-gamepad-button.tip')"
			v-focus
			:ref="fieldRef('if-condition-gamepad-button')"
		/>
		<div class="text">{{ t('components.if-condition-gamepad-state.label') }}</div>
		<SelectBox
			id="if-condition-gamepad-state"
			v-tip="t('components.if-condition-gamepad-state.tip')"
			:ref="fieldRef('if-condition-gamepad-state')"
			:model-value="form.gamepadState"
		/>
		<div class="text">{{ t('components.if-condition-mouse-button.label') }}</div>
		<SelectBox
			id="if-condition-mouse-button"
			v-tip="t('components.if-condition-mouse-button.tip')"
			:ref="fieldRef('if-condition-mouse-button')"
			:model-value="form.mouseButton"
		/>
		<div class="text">{{ t('components.if-condition-mouse-state.label') }}</div>
		<SelectBox
			id="if-condition-mouse-state"
			v-tip="t('components.if-condition-mouse-state.tip')"
			:ref="fieldRef('if-condition-mouse-state')"
			:model-value="form.mouseState"
		/>
		<div class="text">{{ t('components.if-condition-other-key.label') }}</div>
		<SelectBox
			id="if-condition-other-key"
			v-tip="t('components.if-condition-other-key.tip')"
			:ref="fieldRef('if-condition-other-key')"
			:model-value="form.otherKey"
		/>
	</div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import CustomBox from '@app/components/common/CustomBox.vue';
import NumberBox from '@app/components/common/NumberBox.vue';
import SelectVar from '@app/components/common/SelectVar.vue';
import TextArea from '@app/components/common/TextArea.vue';
import SelectBox from '@app/components/common/SelectBox.vue';
import GamepadBox from '@app/components/common/GamepadBox.vue';
import KeyboardBox from '@app/components/common/KeyboardBox.vue';
import { useIfConditionSchema } from '@app/composables/useIfConditionSchema';
import type { IfConditionForm } from '@app/composables/useIfConditionSchema';

const props = defineProps<{
	form: IfConditionForm;
	fieldRef: (id: string) => (el: unknown) => void;
}>();

const IfCondition = useIfConditionSchema();

const { t } = useI18n();
const form = props.form;
const fieldRef = props.fieldRef;

const onWrite = (value: unknown) => {
	IfCondition?.writeHandler?.({ value });
};
</script>
