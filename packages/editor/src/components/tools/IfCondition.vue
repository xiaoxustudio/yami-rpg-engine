<template>
	<WindowFrame ref="frame" id="if-condition" @confirm="onConfirm">
		<template #title
			><TitleBar
				>{{ t('components.if-condition.title') }}
				<div class="close"></div></TitleBar
		></template>

		<div class="grid-box">
			<div class="text">{{ t('components.if-condition-type.label') }}</div>
			<SelectBox
				id="if-condition-type"
				v-focus
				:model-value="form.type"
				:ref="fieldRef('if-condition-type')"
				@write="onWrite"
			/>
			<div class="text">{{ t('components.if-condition-common-variable.label') }}</div>
			<CustomBox
				id="if-condition-common-variable"
				v-focus
				:ref="fieldRef('if-condition-common-variable')"
				type="variable"
				filter="all"
				:model-value="form.commonVariable"
			/>
			<div class="text">{{ t('components.if-condition-boolean-operation.label') }}</div>
			<SelectBox
				id="if-condition-boolean-operation"
				:ref="fieldRef('if-condition-boolean-operation')"
				:model-value="form.booleanOperation"
			/>
			<div class="text">{{ t('components.if-condition-boolean-operand-type.label') }}</div>
			<SelectBox
				id="if-condition-boolean-operand-type"
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
				:ref="fieldRef('if-condition-number-operation')"
				:model-value="form.numberOperation"
			/>
			<div class="text">{{ t('components.if-condition-number-operand-type.label') }}</div>
			<SelectBox
				id="if-condition-number-operand-type"
				:ref="fieldRef('if-condition-number-operand-type')"
				:model-value="form.numberOperandType"
			/>
			<div class="text">{{ t('components.if-condition-number-constant-value.label') }}</div>
			<NumberBox
				id="if-condition-number-constant-value"
				:ref="fieldRef('if-condition-number-constant-value')"
				min="-1000000000"
				max="1000000000"
				decimals="10"
				:model-value="form.numberConstantValue"
			/>
			<div class="text">{{ t('components.if-condition-string-operation.label') }}</div>
			<SelectBox
				id="if-condition-string-operation"
				:ref="fieldRef('if-condition-string-operation')"
				:model-value="form.stringOperation"
			/>
			<div class="text">{{ t('components.if-condition-string-operand-type.label') }}</div>
			<SelectBox
				id="if-condition-string-operand-type"
				:ref="fieldRef('if-condition-string-operand-type')"
				:model-value="form.stringOperandType"
			/>
			<div class="text">{{ t('components.if-condition-string-constant-value.label') }}</div>
			<TextArea
				id="if-condition-string-constant-value"
				:ref="fieldRef('if-condition-string-constant-value')"
				:model-value="form.stringConstantValue"
			/>
			<div class="text">{{ t('components.if-condition-string-enum-stringId.label') }}</div>
			<CustomBox
				id="if-condition-string-enum-stringId"
				v-focus
				:ref="fieldRef('if-condition-string-enum-stringId')"
				type="enum-string"
				:model-value="form.stringEnumStringId"
			/>
			<div class="text">{{ t('components.if-condition-object-operation.label') }}</div>
			<SelectBox
				id="if-condition-object-operation"
				:ref="fieldRef('if-condition-object-operation')"
				:model-value="form.objectOperation"
			/>
			<div class="text">{{ t('components.if-condition-object-operand-type.label') }}</div>
			<SelectBox
				id="if-condition-object-operand-type"
				:ref="fieldRef('if-condition-object-operand-type')"
				:model-value="form.objectOperandType"
			/>
			<div class="text">{{ t('components.if-condition-list-operation.label') }}</div>
			<SelectBox
				id="if-condition-list-operation"
				:ref="fieldRef('if-condition-list-operation')"
				:model-value="form.listOperation"
			/>
			<div class="text">{{ t('components.if-condition-operand-variable.label') }}</div>
			<CustomBox
				id="if-condition-operand-variable"
				v-focus
				:ref="fieldRef('if-condition-operand-variable')"
				type="variable"
				filter="all"
				:model-value="form.operandVariable"
			/>
			<div class="text">{{ t('components.if-condition-actor-operation.label') }}</div>
			<SelectBox
				id="if-condition-actor-operation"
				:ref="fieldRef('if-condition-actor-operation')"
				:model-value="form.actorOperation"
			/>
			<div class="text">{{ t('components.if-condition-common-actor.label') }}</div>
			<CustomBox
				id="if-condition-common-actor"
				:ref="fieldRef('if-condition-common-actor')"
				type="actor"
				:model-value="form.commonActor"
			/>
			<div class="text">{{ t('components.if-condition-common-skill.label') }}</div>
			<CustomBox
				id="if-condition-common-skill"
				:ref="fieldRef('if-condition-common-skill')"
				type="skill"
				:model-value="form.commonSkill"
			/>
			<div class="text">{{ t('components.if-condition-common-state.label') }}</div>
			<CustomBox
				id="if-condition-common-state"
				:ref="fieldRef('if-condition-common-state')"
				type="state"
				:model-value="form.commonState"
			/>
			<div class="text">{{ t('components.if-condition-common-equipment.label') }}</div>
			<CustomBox
				id="if-condition-common-equipment"
				:ref="fieldRef('if-condition-common-equipment')"
				type="equipment"
				:model-value="form.commonEquipment"
			/>
			<div class="text">{{ t('components.if-condition-common-item.label') }}</div>
			<CustomBox
				id="if-condition-common-item"
				:ref="fieldRef('if-condition-common-item')"
				type="item"
				:model-value="form.commonItem"
			/>
			<div class="text">{{ t('components.if-condition-common-trigger.label') }}</div>
			<CustomBox
				id="if-condition-common-trigger"
				:ref="fieldRef('if-condition-common-trigger')"
				type="trigger"
				:model-value="form.commonTrigger"
			/>
			<div class="text">{{ t('components.if-condition-common-light.label') }}</div>
			<CustomBox
				id="if-condition-common-light"
				:ref="fieldRef('if-condition-common-light')"
				type="light"
				:model-value="form.commonLight"
			/>
			<div class="text">{{ t('components.if-condition-common-element.label') }}</div>
			<CustomBox
				id="if-condition-common-element"
				:ref="fieldRef('if-condition-common-element')"
				type="element"
				:model-value="form.commonElement"
			/>
			<div class="text">{{ t('components.if-condition-actor-skillId.label') }}</div>
			<CustomBox
				id="if-condition-actor-skillId"
				v-focus
				:ref="fieldRef('if-condition-actor-skillId')"
				type="file"
				filter="skill"
				:model-value="form.actorSkillId"
			/>
			<div class="text">{{ t('components.if-condition-actor-stateId.label') }}</div>
			<CustomBox
				id="if-condition-actor-stateId"
				v-focus
				:ref="fieldRef('if-condition-actor-stateId')"
				type="file"
				filter="state"
				:model-value="form.actorStateId"
			/>
			<div class="text">{{ t('components.if-condition-actor-itemId.label') }}</div>
			<CustomBox
				id="if-condition-actor-itemId"
				v-focus
				:ref="fieldRef('if-condition-actor-itemId')"
				type="file"
				filter="item"
				:model-value="form.actorItemId"
			/>
			<div class="text">{{ t('components.if-condition-actor-equipmentId.label') }}</div>
			<CustomBox
				id="if-condition-actor-equipmentId"
				v-focus
				:ref="fieldRef('if-condition-actor-equipmentId')"
				type="file"
				filter="equipment"
				:model-value="form.actorEquipmentId"
			/>
			<div class="text">{{ t('components.if-condition-actor-quantity.label') }}</div>
			<NumberBox
				id="if-condition-actor-quantity"
				:ref="fieldRef('if-condition-actor-quantity')"
				min="1"
				max="10000"
				:model-value="form.actorQuantity"
			/>
			<div class="text">{{ t('components.if-condition-actor-shortcutKey.label') }}</div>
			<SelectVar
				id="if-condition-actor-shortcutKey"
				v-focus
				:ref="fieldRef('if-condition-actor-shortcutKey')"
				:model-value="form.actorShortcutKey"
			/>
			<div class="text">{{ t('components.if-condition-actor-target.label') }}</div>
			<CustomBox
				id="if-condition-actor-target"
				:ref="fieldRef('if-condition-actor-target')"
				type="actor"
				:model-value="form.actorTarget"
			/>
			<div class="text">{{ t('components.if-condition-actor-teamId.label') }}</div>
			<SelectBox
				id="if-condition-actor-teamId"
				:ref="fieldRef('if-condition-actor-teamId')"
				:model-value="form.actorTeamId"
			/>
			<div class="text">{{ t('components.if-condition-element-operation.label') }}</div>
			<SelectBox
				id="if-condition-element-operation"
				:ref="fieldRef('if-condition-element-operation')"
				:model-value="form.elementOperation"
			/>
			<div class="text">{{ t('components.if-condition-keyboard-keycode.label') }}</div>
			<KeyboardBox
				id="if-condition-keyboard-keycode"
				v-focus
				:ref="fieldRef('if-condition-keyboard-keycode')"
			/>
			<div class="text">{{ t('components.if-condition-keyboard-state.label') }}</div>
			<SelectBox
				id="if-condition-keyboard-state"
				:ref="fieldRef('if-condition-keyboard-state')"
				:model-value="form.keyboardState"
			/>
			<div class="text">{{ t('components.if-condition-gamepad-button.label') }}</div>
			<GamepadBox
				id="if-condition-gamepad-button"
				v-focus
				:ref="fieldRef('if-condition-gamepad-button')"
			/>
			<div class="text">{{ t('components.if-condition-gamepad-state.label') }}</div>
			<SelectBox
				id="if-condition-gamepad-state"
				:ref="fieldRef('if-condition-gamepad-state')"
				:model-value="form.gamepadState"
			/>
			<div class="text">{{ t('components.if-condition-mouse-button.label') }}</div>
			<SelectBox
				id="if-condition-mouse-button"
				:ref="fieldRef('if-condition-mouse-button')"
				:model-value="form.mouseButton"
			/>
			<div class="text">{{ t('components.if-condition-mouse-state.label') }}</div>
			<SelectBox
				id="if-condition-mouse-state"
				:ref="fieldRef('if-condition-mouse-state')"
				:model-value="form.mouseState"
			/>
			<div class="text">{{ t('components.if-condition-other-key.label') }}</div>
			<SelectBox
				id="if-condition-other-key"
				:ref="fieldRef('if-condition-other-key')"
				:model-value="form.otherKey"
			/>
		</div>
	</WindowFrame>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { Data } from '@app/data/data-object.ts';
import { useIfConditionSchema } from '@app/composables/useIfConditionSchema';
import type { IfConditionForm } from '@app/composables/useIfConditionSchema';

const IfCondition = useIfConditionSchema();
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import GamepadBox from '@app/components/common/GamepadBox.vue';
import KeyboardBox from '@app/components/common/KeyboardBox.vue';
import { attachElementApi } from '@app/utils/attach-element-api';
import CustomBox from '@app/components/common/CustomBox.vue';
import NumberBox from '@app/components/common/NumberBox.vue';
import SelectVar from '@app/components/common/SelectVar.vue';
import TextArea from '@app/components/common/TextArea.vue';
import SelectBox from '@app/components/common/SelectBox.vue';

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

/**
 * 控件实例的最小接口（模板里用 `:ref="fieldRef(id)"` 登记）。
 * P5b 批次 1：不再按 id 查 DOM，改为从注册表取组件实例直调其 expose 方法；
 * `root` 供仍需元素的地方使用（如 relate 的 targets）。
 */
interface FieldControl {
	read?: () => unknown;
	write?: (value: unknown) => void;
	loadItems?: (items: unknown[]) => unknown;
	enableHiddenMode?: () => { relate?: (entries: unknown) => unknown } | undefined;
	root?: HTMLElement | null;
}

const fieldEls = new Map<string, FieldControl | null>();

const fieldRef = (id: string) => (el: unknown) => {
	fieldEls.set(id, el as FieldControl | null);
};

const frame = ref<InstanceType<typeof WindowFrame> | null>(null);

const onWrite = (value: unknown) => {
	IfCondition?.writeHandler?.({ value });
};

const onConfirm = () => {
	IfCondition?.confirm?.(new Event('click'));
};

onMounted(() => {
	const el = frame.value?.root;
	if (el) {
		attachElementApi(el, { setForm, getForm });
	}

	const typeEl = fieldEls.get('if-condition-type');
	if (!typeEl) return;
	typeEl.loadItems?.([
		{ name: 'Boolean', value: 'boolean' },
		{ name: 'Number', value: 'number' },
		{ name: 'String', value: 'string' },
		{ name: 'Object', value: 'object' },
		{ name: 'Actor', value: 'actor' },
		{ name: 'Element', value: 'element' },
		{ name: 'Keyboard', value: 'keyboard' },
		{ name: 'Gamepad', value: 'gamepad' },
		{ name: 'Mouse', value: 'mouse' },
		{ name: 'List', value: 'list' },
		{ name: 'Other', value: 'other' }
	]);

	typeEl.enableHiddenMode?.()?.relate?.([
		{
			case: 'boolean',
			targets: [
				fieldEls.get('if-condition-common-variable')?.root,
				fieldEls.get('if-condition-boolean-operation')?.root,
				fieldEls.get('if-condition-boolean-operand-type')?.root
			]
		},
		{
			case: 'number',
			targets: [
				fieldEls.get('if-condition-common-variable')?.root,
				fieldEls.get('if-condition-number-operation')?.root,
				fieldEls.get('if-condition-number-operand-type')?.root
			]
		},
		{
			case: 'string',
			targets: [
				fieldEls.get('if-condition-common-variable')?.root,
				fieldEls.get('if-condition-string-operation')?.root,
				fieldEls.get('if-condition-string-operand-type')?.root
			]
		},
		{
			case: 'object',
			targets: [fieldEls.get('if-condition-common-variable')?.root, fieldEls.get('if-condition-object-operation')?.root]
		},
		{
			case: 'actor',
			targets: [fieldEls.get('if-condition-common-actor')?.root, fieldEls.get('if-condition-actor-operation')?.root]
		},
		{
			case: 'element',
			targets: [fieldEls.get('if-condition-common-element')?.root, fieldEls.get('if-condition-element-operation')?.root]
		},
		{
			case: 'keyboard',
			targets: [fieldEls.get('if-condition-keyboard-keycode')?.root, fieldEls.get('if-condition-keyboard-state')?.root]
		},
		{
			case: 'gamepad',
			targets: [fieldEls.get('if-condition-gamepad-button')?.root, fieldEls.get('if-condition-gamepad-state')?.root]
		},
		{
			case: 'mouse',
			targets: [fieldEls.get('if-condition-mouse-button')?.root, fieldEls.get('if-condition-mouse-state')?.root]
		},
		{
			case: 'list',
			targets: [
				fieldEls.get('if-condition-common-variable')?.root,
				fieldEls.get('if-condition-list-operation')?.root,
				fieldEls.get('if-condition-operand-variable')?.root
			]
		},
		{ case: 'other', targets: [fieldEls.get('if-condition-other-key')?.root] }
	]);

	fieldEls.get('if-condition-boolean-operation')?.loadItems?.([
		{ name: '==', value: 'equal' },
		{ name: '!=', value: 'unequal' }
	]);

	fieldEls.get('if-condition-boolean-operand-type')?.loadItems?.([
		{ name: 'None', value: 'none' },
		{ name: 'Constant', value: 'constant' },
		{ name: 'Variable', value: 'variable' }
	]);

	fieldEls.get('if-condition-boolean-operand-type')
		?.enableHiddenMode?.()
		?.relate?.([
			{
				case: 'constant',
				targets: [fieldEls.get('if-condition-boolean-constant-value')?.root]
			},
			{ case: 'variable', targets: [fieldEls.get('if-condition-operand-variable')?.root] }
		]);

	fieldEls.get('if-condition-boolean-constant-value')?.loadItems?.([
		{ name: 'False', value: false },
		{ name: 'True', value: true }
	]);

	fieldEls.get('if-condition-number-operation')?.loadItems?.([
		{ name: '==', value: 'equal' },
		{ name: '!=', value: 'unequal' },
		{ name: '>=', value: 'greater-or-equal' },
		{ name: '<=', value: 'less-or-equal' },
		{ name: '>', value: 'greater' },
		{ name: '<', value: 'less' }
	]);

	fieldEls.get('if-condition-number-operand-type')?.loadItems?.([
		{ name: 'None', value: 'none' },
		{ name: 'Constant', value: 'constant' },
		{ name: 'Variable', value: 'variable' }
	]);

	fieldEls.get('if-condition-number-operand-type')
		?.enableHiddenMode?.()
		?.relate?.([
			{
				case: 'constant',
				targets: [fieldEls.get('if-condition-number-constant-value')?.root]
			},
			{ case: 'variable', targets: [fieldEls.get('if-condition-operand-variable')?.root] }
		]);

	fieldEls.get('if-condition-string-operation')?.loadItems?.([
		{ name: '==', value: 'equal' },
		{ name: '!=', value: 'unequal' },
		{ name: 'Include', value: 'include' },
		{ name: 'Exclude', value: 'exclude' }
	]);

	fieldEls.get('if-condition-string-operand-type')?.loadItems?.([
		{ name: 'None', value: 'none' },
		{ name: 'Constant', value: 'constant' },
		{ name: 'Variable', value: 'variable' },
		{ name: 'Enumeration', value: 'enum' }
	]);

	fieldEls.get('if-condition-string-operand-type')
		?.enableHiddenMode?.()
		?.relate?.([
			{
				case: 'constant',
				targets: [fieldEls.get('if-condition-string-constant-value')?.root]
			},
			{
				case: 'variable',
				targets: [fieldEls.get('if-condition-operand-variable')?.root]
			},
			{ case: 'enum', targets: [fieldEls.get('if-condition-string-enum-stringId')?.root] }
		]);

	fieldEls.get('if-condition-object-operation')?.loadItems?.([
		{ name: '==', value: 'equal' },
		{ name: '!=', value: 'unequal' },
		{ name: 'Is Actor', value: 'is-actor' },
		{ name: 'Is Skill', value: 'is-skill' },
		{ name: 'Is State', value: 'is-state' },
		{ name: 'Is Equipment', value: 'is-equipment' },
		{ name: 'Is Item', value: 'is-item' },
		{ name: 'Is Trigger', value: 'is-trigger' },
		{ name: 'Is Light', value: 'is-light' },
		{ name: 'Is Element', value: 'is-element' }
	]);

	fieldEls.get('if-condition-object-operation')
		?.enableHiddenMode?.()
		?.relate?.([
			{
				case: ['equal', 'unequal'],
				targets: [fieldEls.get('if-condition-object-operand-type')?.root]
			}
		]);

	fieldEls.get('if-condition-object-operand-type')?.loadItems?.([
		{ name: 'None', value: 'none' },
		{ name: 'Actor', value: 'actor' },
		{ name: 'Skill', value: 'skill' },
		{ name: 'State', value: 'state' },
		{ name: 'Equipment', value: 'equipment' },
		{ name: 'Item', value: 'item' },
		{ name: 'Trigger', value: 'trigger' },
		{ name: 'Light', value: 'light' },
		{ name: 'Element', value: 'element' },
		{ name: 'Variable', value: 'variable' }
	]);

	fieldEls.get('if-condition-object-operand-type')
		?.enableHiddenMode?.()
		?.relate?.([
			{ case: 'actor', targets: [fieldEls.get('if-condition-common-actor')?.root] },
			{ case: 'skill', targets: [fieldEls.get('if-condition-common-skill')?.root] },
			{ case: 'state', targets: [fieldEls.get('if-condition-common-state')?.root] },
			{
				case: 'equipment',
				targets: [fieldEls.get('if-condition-common-equipment')?.root]
			},
			{ case: 'item', targets: [fieldEls.get('if-condition-common-item')?.root] },
			{ case: 'trigger', targets: [fieldEls.get('if-condition-common-trigger')?.root] },
			{ case: 'light', targets: [fieldEls.get('if-condition-common-light')?.root] },
			{ case: 'element', targets: [fieldEls.get('if-condition-common-element')?.root] },
			{ case: 'variable', targets: [fieldEls.get('if-condition-operand-variable')?.root] }
		]);

	fieldEls.get('if-condition-actor-operation')?.loadItems?.([
		{ name: 'Present and Active', value: 'present-active' },
		{ name: 'Present', value: 'present' },
		{ name: 'Absent', value: 'absent' },
		{ name: 'active', value: 'active' },
		{ name: 'inactive', value: 'inactive' },
		{ name: 'Has Targets', value: 'has-targets' },
		{ name: 'Has No Targets', value: 'has-no-targets' },
		{ name: 'In Screen', value: 'in-screen' },
		{ name: 'Is Player Actor', value: 'is-player' },
		{ name: 'Is Party Member', value: 'is-member' },
		{ name: 'Has Skill', value: 'has-skill' },
		{ name: 'Has State', value: 'has-state' },
		{ name: 'Has Items', value: 'has-items' },
		{ name: 'Has Equipments', value: 'has-equipments' },
		{ name: 'Has Skill Shortcut', value: 'has-skill-shortcut' },
		{ name: 'Has Item Shortcut', value: 'has-item-shortcut' },
		{ name: 'Equipped', value: 'equipped' },
		{ name: 'Is a Teammate of Actor ...', value: 'is-teammate' },
		{ name: 'Is a Friend of Actor ...', value: 'is-friend' },
		{ name: 'Is an Enemy of Actor ...', value: 'is-enemy' },
		{ name: 'Is a Member of Team ...', value: 'is-team-member' },
		{ name: 'Is a Friend of Team ...', value: 'is-team-friend' },
		{ name: 'Is an Enemy of Team ...', value: 'is-team-enemy' }
	]);

	fieldEls.get('if-condition-actor-operation')
		?.enableHiddenMode?.()
		?.relate?.([
			{ case: 'has-skill', targets: [fieldEls.get('if-condition-actor-skillId')?.root] },
			{ case: 'has-state', targets: [fieldEls.get('if-condition-actor-stateId')?.root] },
			{
				case: 'has-items',
				targets: [fieldEls.get('if-condition-actor-itemId')?.root, fieldEls.get('if-condition-actor-quantity')?.root]
			},
			{
				case: 'has-equipments',
				targets: [fieldEls.get('if-condition-actor-equipmentId')?.root, fieldEls.get('if-condition-actor-quantity')?.root]
			},
			{
				case: ['has-skill-shortcut', 'has-item-shortcut'],
				targets: [fieldEls.get('if-condition-actor-shortcutKey')?.root]
			},
			{
				case: 'equipped',
				targets: [fieldEls.get('if-condition-actor-equipmentId')?.root]
			},
			{
				case: ['is-teammate', 'is-friend', 'is-enemy'],
				targets: [fieldEls.get('if-condition-actor-target')?.root]
			},
			{
				case: ['is-team-member', 'is-team-friend', 'is-team-enemy'],
				targets: [fieldEls.get('if-condition-actor-teamId')?.root]
			}
		]);

	fieldEls.get('if-condition-element-operation')?.loadItems?.([
		{ name: 'Present', value: 'present' },
		{ name: 'Absent', value: 'absent' },
		{ name: 'Visible', value: 'visible' },
		{ name: 'Invisible', value: 'invisible' },
		{ name: 'Is Focus Element', value: 'is-focus' },
		{ name: 'Dialog Box - is Paused', value: 'dialogbox-is-paused' },
		{ name: 'Dialog Box - is Updating', value: 'dialogbox-is-updating' },
		{ name: 'Dialog Box - is Waiting', value: 'dialogbox-is-waiting' },
		{ name: 'Dialog Box - is Complete', value: 'dialogbox-is-complete' }
	]);

	fieldEls.get('if-condition-keyboard-state')?.loadItems?.([
		{ name: 'Just Pressed', value: 'just-pressed' },
		{ name: 'Just Released', value: 'just-released' },
		{ name: 'Pressed', value: 'pressed' },
		{ name: 'Released', value: 'released' }
	]);

	fieldEls.get('if-condition-gamepad-state')?.loadItems?.([
		{ name: 'Just Pressed', value: 'just-pressed' },
		{ name: 'Just Released', value: 'just-released' },
		{ name: 'Pressed', value: 'pressed' },
		{ name: 'Released', value: 'released' }
	]);

	fieldEls.get('if-condition-mouse-button')?.loadItems?.([
		{ name: 'Left Button', value: 0 },
		{ name: 'Middle Button', value: 1 },
		{ name: 'Right Button', value: 2 },
		{ name: 'Back Button', value: 3 },
		{ name: 'Forward Button', value: 4 }
	]);

	fieldEls.get('if-condition-mouse-state')?.loadItems?.([
		{ name: 'Just Pressed', value: 'just-pressed' },
		{ name: 'Just Released', value: 'just-released' },
		{ name: 'Pressed', value: 'pressed' },
		{ name: 'Released', value: 'released' }
	]);

	fieldEls.get('if-condition-list-operation')?.loadItems?.([
		{ name: 'Include', value: 'include' },
		{ name: 'Exclude', value: 'exclude' }
	]);

	fieldEls.get('if-condition-other-key')?.loadItems?.([
		{ name: 'Mouse has entered the window', value: 'mouse-entered' },
		{ name: 'Mouse has left the window', value: 'mouse-left' },
		{ name: 'Game is paused', value: 'game-is-paused' },
		{ name: 'Game is not paused', value: 'game-is-not-paused' },
		{ name: 'Scene input is prevented', value: 'scene-input-is-prevented' },
		{
			name: 'Scene input is not prevented',
			value: 'scene-input-is-not-prevented'
		},
		{ name: 'In debugging mode', value: 'status-debugging' },
		{ name: 'In deployed mode', value: 'status-deployed' },
		{ name: 'Running on Windows platform', value: 'platform-windows' },
		{ name: 'Running on MacOS platform', value: 'platform-macos' },
		{ name: 'Running on a mobile platform', value: 'platform-mobile' }
	]);

	fieldEls.get('if-condition')?.root?.on?.('open', () => {
		fieldEls.get('if-condition-actor-teamId')?.loadItems?.(Data.createTeamItems!());
	});

});
</script>

<style>
/* 窗口样式试点：由 Project/css/command.css 迁入组件（选择器为全局 id，不能用 scoped） */
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
