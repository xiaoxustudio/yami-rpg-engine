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
	</WindowFrame>
</template>

<script setup lang="ts">
import { useLocalizedOptions } from '@app/composables/useLocalizedOptions';
import type { YamiElement } from '@app/types/element-api';
import { onMounted, reactive, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { composableEls } from '@app/composables/element-registry';
import { registerElement } from '@app/utils/element-registry';
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

/**
 * 控件实例 → 元素：普通元素直接用；组件实例优先 `$el`（**ref 回调时即已就绪**），
 * 回退到批 1 约定的 `root`（部分组件要到挂载后才赋值）。
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
	// P1b：同时把控件元素镜像进 composableEls（模块侧改读注册表，不再按 id 查 DOM）。
	// 必须在 **ref 回调**里镜像而不是只靠 onMounted：子组件 onMounted 早于父组件，命令控件会在自己的
	// onMounted 里 emit write/input 触发模块侧代码，那时注册表必须已经有值。
	registerElement(composableEls, id, elementOf(control));
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
		// P1b：窗口元素 `:ref` 槽位被具名 ref 占用 → 在这里命令式登记（模块侧读它取 setForm/getForm）
		registerElement(composableEls, 'if-condition', el);
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

	useLocalizedOptions('if-condition-boolean-operation', ['equal', 'unequal'], (items) =>
		fieldEls.get('if-condition-boolean-operation')?.loadItems?.(items)
	);

	useLocalizedOptions('if-condition-boolean-operand-type', ['none', 'constant', 'variable'], (items) =>
		fieldEls.get('if-condition-boolean-operand-type')?.loadItems?.(items)
	);

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

	useLocalizedOptions('if-condition-number-operation', ['equal', 'unequal', 'greater-or-equal', 'less-or-equal', 'greater', 'less'], (items) =>
		fieldEls.get('if-condition-number-operation')?.loadItems?.(items)
	);

	useLocalizedOptions('if-condition-number-operand-type', ['none', 'constant', 'variable'], (items) =>
		fieldEls.get('if-condition-number-operand-type')?.loadItems?.(items)
	);

	fieldEls.get('if-condition-number-operand-type')
		?.enableHiddenMode?.()
		?.relate?.([
			{
				case: 'constant',
				targets: [fieldEls.get('if-condition-number-constant-value')?.root]
			},
			{ case: 'variable', targets: [fieldEls.get('if-condition-operand-variable')?.root] }
		]);

	useLocalizedOptions('if-condition-string-operation', ['equal', 'unequal', 'include', 'exclude'], (items) =>
		fieldEls.get('if-condition-string-operation')?.loadItems?.(items)
	);

	useLocalizedOptions('if-condition-string-operand-type', ['none', 'constant', 'variable', 'enum'], (items) =>
		fieldEls.get('if-condition-string-operand-type')?.loadItems?.(items)
	);

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

	useLocalizedOptions('if-condition-object-operand-type', ['none', 'actor', 'skill', 'state', 'equipment', 'item', 'trigger', 'light', 'element', 'variable'], (items) =>
		fieldEls.get('if-condition-object-operand-type')?.loadItems?.(items)
	);

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

	useLocalizedOptions('if-condition-actor-operation', ['present-active', 'present', 'absent', 'active', 'inactive', 'has-targets', 'has-no-targets', 'in-screen', 'is-player', 'is-member', 'has-skill', 'has-state', 'has-items', 'has-equipments', 'has-skill-shortcut', 'has-item-shortcut', 'equipped', 'is-teammate', 'is-friend', 'is-enemy', 'is-team-member', 'is-team-friend', 'is-team-enemy'], (items) =>
		fieldEls.get('if-condition-actor-operation')?.loadItems?.(items)
	);

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

	useLocalizedOptions('if-condition-element-operation', ['present', 'absent', 'visible', 'invisible', 'is-focus', 'dialogbox-is-paused', 'dialogbox-is-updating', 'dialogbox-is-waiting', 'dialogbox-is-complete'], (items) =>
		fieldEls.get('if-condition-element-operation')?.loadItems?.(items)
	);

	useLocalizedOptions('if-condition-keyboard-state', ['just-pressed', 'just-released', 'pressed', 'released'], (items) =>
		fieldEls.get('if-condition-keyboard-state')?.loadItems?.(items)
	);

	useLocalizedOptions('if-condition-gamepad-state', ['just-pressed', 'just-released', 'pressed', 'released'], (items) =>
		fieldEls.get('if-condition-gamepad-state')?.loadItems?.(items)
	);

	useLocalizedOptions('if-condition-mouse-button', [0, 1, 2, 3, 4], (items) =>
		fieldEls.get('if-condition-mouse-button')?.loadItems?.(items)
	);

	useLocalizedOptions('if-condition-mouse-state', ['just-pressed', 'just-released', 'pressed', 'released'], (items) =>
		fieldEls.get('if-condition-mouse-state')?.loadItems?.(items)
	);

	useLocalizedOptions('if-condition-list-operation', ['include', 'exclude'], (items) =>
		fieldEls.get('if-condition-list-operation')?.loadItems?.(items)
	);

	useLocalizedOptions('if-condition-other-key', ['mouse-entered', 'mouse-left', 'game-is-paused', 'game-is-not-paused', 'scene-input-is-prevented', 'scene-input-is-not-prevented', 'status-debugging', 'status-deployed', 'platform-windows', 'platform-macos', 'platform-mobile'], (items) =>
		fieldEls.get('if-condition-other-key')?.loadItems?.(items)
	);

	(fieldEls.get('if-condition') as unknown as { root?: YamiElement } | null)?.root?.on?.('open', () => {
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
