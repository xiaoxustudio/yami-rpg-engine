<template>
	<WindowFrame ref="frame" id="setNumber-operand" @confirm="onConfirm">
		<template #title
			><TitleBar
				>{{ t('components.setNumber-operand.title') }}
				<div class="close"></div></TitleBar
		></template>

		<div class="grid-box">
			<div class="text">{{ t('components.setNumber-operation.label') }}</div>
			<SelectBox id="setNumber-operation"
				v-tip="t('components.setNumber-operation.tip')"
				:ref="fieldRef('setNumber-operation')" v-focus />
			<SelectBox id="setNumber-operand-operation"
				v-tip="t('components.setNumber-operand-operation.tip')"
				:ref="fieldRef('setNumber-operand-operation')" v-focus :model-value="form.operation" />
			<div class="text">{{ t('components.setNumber-operand-type.label') }}</div>
			<SelectBox
				id="setNumber-operand-type"
				v-tip="t('components.setNumber-operand-type.tip')"
				:ref="fieldRef('setNumber-operand-type')"
				:model-value="form.operandType"
				@write="onWrite"
			/>
			<div class="text">{{ t('components.setNumber-operand-constant-value.label') }}</div>
			<NumberBox
				id="setNumber-operand-constant-value"
				v-tip="t('components.setNumber-operand-constant-value.tip')"
				:ref="fieldRef('setNumber-operand-constant-value')"
				min="-1000000000"
				max="1000000000"
				decimals="10"
				:model-value="form.constantValue"
			/>
			<div class="text">{{ t('components.setNumber-operand-math-method.label') }}</div>
			<SelectBox id="setNumber-operand-math-method"
				v-tip="t('components.setNumber-operand-math-method.tip')"
				:ref="fieldRef('setNumber-operand-math-method')" :model-value="form.mathMethod" />
			<div class="text">{{ t('components.setNumber-operand-string-method.label') }}</div>
			<SelectBox id="setNumber-operand-string-method"
				v-tip="t('components.setNumber-operand-string-method.tip')"
				:ref="fieldRef('setNumber-operand-string-method')" :model-value="form.stringMethod" />
			<div class="text">{{ t('components.setNumber-operand-object-property.label') }}</div>
			<SelectBox id="setNumber-operand-object-property"
				v-tip="t('components.setNumber-operand-object-property.tip')"
				:ref="fieldRef('setNumber-operand-object-property')" :model-value="form.objectProperty" />
			<div class="text">{{ t('components.setNumber-operand-element-property.label') }}</div>
			<SelectBox
				id="setNumber-operand-element-property"
				v-tip="t('components.setNumber-operand-element-property.tip')"
				:ref="fieldRef('setNumber-operand-element-property')"
				:model-value="form.elementProperty"
			/>
			<div class="text">{{ t('components.setNumber-operand-element-element.label') }}</div>
			<CustomBox
				id="setNumber-operand-element-element"
				v-tip="t('components.setNumber-operand-element-element.tip')"
				:ref="fieldRef('setNumber-operand-element-element')"
				type="element"
				:model-value="form.elementElement"
			/>
			<div class="text">{{ t('components.setNumber-operand-common-variable.label') }}</div>
			<CustomBox
				id="setNumber-operand-common-variable"
				v-tip="t('components.setNumber-operand-common-variable.tip')"
				:ref="fieldRef('setNumber-operand-common-variable')"
				v-focus
				type="variable"
				filter="all"
				:model-value="form.commonVariable"
			/>
			<div class="text">{{ t('components.setNumber-operand-common-actor.label') }}</div>
			<CustomBox
				id="setNumber-operand-common-actor"
				v-tip="t('components.setNumber-operand-common-actor.tip')"
				:ref="fieldRef('setNumber-operand-common-actor')"
				type="actor"
				:model-value="form.commonActor"
			/>
			<div class="text">{{ t('components.setNumber-operand-common-skill.label') }}</div>
			<CustomBox
				id="setNumber-operand-common-skill"
				v-tip="t('components.setNumber-operand-common-skill.tip')"
				:ref="fieldRef('setNumber-operand-common-skill')"
				type="skill"
				:model-value="form.commonSkill"
			/>
			<div class="text">{{ t('components.setNumber-operand-common-state.label') }}</div>
			<CustomBox
				id="setNumber-operand-common-state"
				v-tip="t('components.setNumber-operand-common-state.tip')"
				:ref="fieldRef('setNumber-operand-common-state')"
				type="state"
				:model-value="form.commonState"
			/>
			<div class="text">{{ t('components.setNumber-operand-common-equipment.label') }}</div>
			<CustomBox
				id="setNumber-operand-common-equipment"
				v-tip="t('components.setNumber-operand-common-equipment.tip')"
				:ref="fieldRef('setNumber-operand-common-equipment')"
				type="equipment"
				:model-value="form.commonEquipment"
			/>
			<div class="text">{{ t('components.setNumber-operand-common-item.label') }}</div>
			<CustomBox
				id="setNumber-operand-common-item"
				v-tip="t('components.setNumber-operand-common-item.tip')"
				:ref="fieldRef('setNumber-operand-common-item')"
				type="item"
				:model-value="form.commonItem"
			/>
			<div class="text">{{ t('components.setNumber-operand-common-trigger.label') }}</div>
			<CustomBox
				id="setNumber-operand-common-trigger"
				v-tip="t('components.setNumber-operand-common-trigger.tip')"
				:ref="fieldRef('setNumber-operand-common-trigger')"
				type="trigger"
				:model-value="form.commonTrigger"
			/>
			<div class="text">{{ t('components.setNumber-operand-common-tilemap.label') }}</div>
			<CustomBox
				id="setNumber-operand-common-tilemap"
				v-tip="t('components.setNumber-operand-common-tilemap.tip')"
				:ref="fieldRef('setNumber-operand-common-tilemap')"
				type="tilemap"
				:model-value="form.commonTilemap"
			/>
			<div class="text">{{ t('components.setNumber-operand-tilemapPosition.label') }}</div>
			<CustomBox
				id="setNumber-operand-tilemapPosition"
				v-tip="t('components.setNumber-operand-tilemapPosition.tip')"
				:ref="fieldRef('setNumber-operand-tilemapPosition')"
				type="position"
				:model-value="form.tilemapPosition"
			/>
			<div class="text">{{ t('components.setNumber-operand-object-itemId.label') }}</div>
			<FileVar
				id="setNumber-operand-object-itemId"
				v-tip="t('components.setNumber-operand-object-itemId.tip')"
				:ref="fieldRef('setNumber-operand-object-itemId')"
				v-focus
				type="file"
				filter="item"
				:model-value="form.objectItemId"
			/>
			<div class="text">{{ t('components.setNumber-operand-object-equipmentId.label') }}</div>
			<FileVar
				id="setNumber-operand-object-equipmentId"
				v-tip="t('components.setNumber-operand-object-equipmentId.tip')"
				:ref="fieldRef('setNumber-operand-object-equipmentId')"
				v-focus
				type="file"
				filter="equipment"
				:model-value="form.objectEquipmentId"
			/>
			<div class="text">{{ t('components.setNumber-operand-string-search.label') }}</div>
			<StringVar
				id="setNumber-operand-string-search"
				v-tip="t('components.setNumber-operand-string-search.tip')"
				:ref="fieldRef('setNumber-operand-string-search')"
				v-focus
				:model-value="form.stringSearch"
			/>
			<div class="text">{{ t('components.setNumber-operand-math-decimals.label') }}</div>
			<NumberBox
				id="setNumber-operand-math-decimals"
				v-tip="t('components.setNumber-operand-math-decimals.tip')"
				:ref="fieldRef('setNumber-operand-math-decimals')"
				min="0"
				max="10"
				:model-value="form.mathDecimals"
			/>
			<div class="text">{{ t('components.setNumber-operand-math-min.label') }}</div>
			<NumberVar
				id="setNumber-operand-math-min"
				v-tip="t('components.setNumber-operand-math-min.tip')"
				:ref="fieldRef('setNumber-operand-math-min')"
				min="-1000000000"
				max="1000000000"
				:model-value="form.mathMin"
			/>
			<div class="text">{{ t('components.setNumber-operand-math-max.label') }}</div>
			<NumberVar
				id="setNumber-operand-math-max"
				v-tip="t('components.setNumber-operand-math-max.tip')"
				:ref="fieldRef('setNumber-operand-math-max')"
				min="-1000000000"
				max="1000000000"
				:model-value="form.mathMax"
			/>
			<div class="text">{{ t('components.setNumber-operand-math-startPosition.label') }}</div>
			<CustomBox
				id="setNumber-operand-math-startPosition"
				v-tip="t('components.setNumber-operand-math-startPosition.tip')"
				:ref="fieldRef('setNumber-operand-math-startPosition')"
				type="position"
				:model-value="form.mathStartPosition"
			/>
			<div class="text">{{ t('components.setNumber-operand-math-endPosition.label') }}</div>
			<CustomBox
				id="setNumber-operand-math-endPosition"
				v-tip="t('components.setNumber-operand-math-endPosition.tip')"
				:ref="fieldRef('setNumber-operand-math-endPosition')"
				type="position"
				:model-value="form.mathEndPosition"
			/>
			<div class="text">{{ t('components.setNumber-operand-cooldown-key.label') }}</div>
			<SelectVar
				id="setNumber-operand-cooldown-key"
				v-tip="t('components.setNumber-operand-cooldown-key.tip')"
				:ref="fieldRef('setNumber-operand-cooldown-key')"
				v-focus
				:model-value="form.cooldownKey"
			/>
			<div class="text">{{ t('components.setNumber-operand-list-index.label') }}</div>
			<NumberVar
				id="setNumber-operand-list-index"
				v-tip="t('components.setNumber-operand-list-index.tip')"
				:ref="fieldRef('setNumber-operand-list-index')"
				min="0"
				max="1000000000"
				:model-value="form.listIndex"
			/>
			<div class="text">{{ t('components.setNumber-operand-parameter-key.label') }}</div>
			<StringVar
				id="setNumber-operand-parameter-key"
				v-tip="t('components.setNumber-operand-parameter-key.tip')"
				:ref="fieldRef('setNumber-operand-parameter-key')"
				v-focus
				:model-value="form.parameterKey"
			/>
			<div class="text">{{ t('components.setNumber-operand-script.label') }}</div>
			<TextBox id="setNumber-operand-script"
				v-tip="t('components.setNumber-operand-script.tip')"
				:ref="fieldRef('setNumber-operand-script')" v-focus :model-value="form.script" />
			<div class="text">{{ t('components.setNumber-operand-other-data.label') }}</div>
			<SelectBox id="setNumber-operand-other-data"
				v-tip="t('components.setNumber-operand-other-data.tip')"
				:ref="fieldRef('setNumber-operand-other-data')" :model-value="form.otherData" />
			<div class="text">{{ t('components.setNumber-operand-other-touchId.label') }}</div>
			<NumberVar
				id="setNumber-operand-other-touchId"
				v-tip="t('components.setNumber-operand-other-touchId.tip')"
				:ref="fieldRef('setNumber-operand-other-touchId')"
				min="0"
				max="10"
				:model-value="form.otherTouchId"
			/>
			<div class="text">{{ t('components.setNumber-operand-other-teamId.label') }}</div>
			<SelectBox id="setNumber-operand-other-teamId"
				v-tip="t('components.setNumber-operand-other-teamId.tip')"
				:ref="fieldRef('setNumber-operand-other-teamId')" :model-value="form.otherTeamId" />
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
import { on } from '@app/utils/element-utils.ts';
import { Data } from '@app/data/data-object.ts';
import { useNumberOperandSchema } from '@app/composables/useNumberOperandSchema';
import type { NumberOperandForm } from '@app/composables/useNumberOperandSchema';

const NumberOperand = useNumberOperandSchema();
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import { attachElementApi } from '@app/utils/attach-element-api';
import CustomBox from '@app/components/common/CustomBox.vue';
import FileVar from '@app/components/common/FileVar.vue';
import NumberBox from '@app/components/common/NumberBox.vue';
import NumberVar from '@app/components/common/NumberVar.vue';
import SelectVar from '@app/components/common/SelectVar.vue';
import StringVar from '@app/components/common/StringVar.vue';
import TextBox from '@app/components/common/TextBox.vue';
import SelectBox from '@app/components/common/SelectBox.vue';

const { t } = useI18n();

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
		const control = composableEls.get(id) as
		unknown as 	unknown as | (HTMLElement & { write?: (value: unknown) => void })
			| null;
		if (control && typeof control.write === 'function') {
			control.write(data[field] as never);
		}
	}
};

const getForm = (): NumberOperandForm => {
	const data = { ...form } as NumberOperandForm;
	for (const [id, field] of Object.entries(FIELD_BY_ID)) {
		const control = composableEls.get(id) as
		unknown as 	unknown as | (HTMLElement & { read?: () => unknown })
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
	restore?: () => unknown;
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
	NumberOperand?.writeHandler?.({ value });
};

const onConfirm = () => {
	NumberOperand?.confirm?.(new Event('click'));
};

onMounted(() => {
	const el = frame.value?.root;
	if (el) {
		attachElementApi(el, { setForm, getForm });
		// P1b：窗口元素 `:ref` 槽位被具名 ref 占用 → 在这里命令式登记（模块侧读它取 setForm/getForm）
		registerElement(composableEls, 'setNumber-operand', el);
	}

	const opEl = fieldEls.get('setNumber-operation');
	if (!opEl) return;
	opEl.loadItems?.([
		{ name: 'Set', value: 'set' },
		{ name: 'Add', value: 'add' },
		{ name: 'Sub', value: 'sub' },
		{ name: 'Mul', value: 'mul' },
		{ name: 'Div', value: 'div' },
		{ name: 'Mod', value: 'mod' }
	]);

	useLocalizedOptions('setNumber-operand-operation', ['add', 'sub', 'mul', 'div', 'mod', 'add()', 'sub()', 'mul()', 'div()', 'mod()'], (items) =>
		fieldEls.get('setNumber-operand-operation')?.loadItems?.(items)
	);

	useLocalizedOptions('setNumber-operand-type', ['constant', 'variable', 'math', 'string', 'object', 'element', 'list', 'parameter', 'script', 'other'], (items) =>
		fieldEls.get('setNumber-operand-type')?.loadItems?.(items)
	);

	fieldEls.get('setNumber-operand-type')
		?.enableHiddenMode?.()
		?.relate?.([
			{
				case: 'constant',
				targets: [fieldEls.get('setNumber-operand-constant-value')?.root]
			},
			{
				case: 'variable',
				targets: [fieldEls.get('setNumber-operand-common-variable')?.root]
			},
			{ case: 'math', targets: [fieldEls.get('setNumber-operand-math-method')?.root] },
			{
				case: 'string',
				targets: [
					fieldEls.get('setNumber-operand-string-method')?.root,
					fieldEls.get('setNumber-operand-common-variable')?.root
				]
			},
			{
				case: 'object',
				targets: [fieldEls.get('setNumber-operand-object-property')?.root]
			},
			{
				case: 'element',
				targets: [
					fieldEls.get('setNumber-operand-element-property')?.root,
					fieldEls.get('setNumber-operand-element-element')?.root
				]
			},
			{
				case: 'list',
				targets: [
					fieldEls.get('setNumber-operand-common-variable')?.root,
					fieldEls.get('setNumber-operand-list-index')?.root
				]
			},
			{
				case: 'parameter',
				targets: [fieldEls.get('setNumber-operand-parameter-key')?.root]
			},
			{ case: 'script', targets: [fieldEls.get('setNumber-operand-script')?.root] },
			{ case: 'other', targets: [fieldEls.get('setNumber-operand-other-data')?.root] }
		]);

	useLocalizedOptions('setNumber-operand-math-method', ['round', 'floor', 'ceil', 'sqrt', 'abs', 'cos', 'sin', 'tan', 'random', 'random-int', 'distance', 'distance-x', 'distance-y', 'relative-angle'], (items) =>
		fieldEls.get('setNumber-operand-math-method')?.loadItems?.(items)
	);

	fieldEls.get('setNumber-operand-math-method')
		?.enableHiddenMode?.()
		?.relate?.([
			{
				case: 'round',
				targets: [
					fieldEls.get('setNumber-operand-common-variable')?.root,
					fieldEls.get('setNumber-operand-math-decimals')?.root
				]
			},
			{
				case: ['floor', 'ceil', 'sqrt', 'abs', 'cos', 'sin', 'tan'],
				targets: [fieldEls.get('setNumber-operand-common-variable')?.root]
			},
			{
				case: 'random-int',
				targets: [fieldEls.get('setNumber-operand-math-min')?.root, fieldEls.get('setNumber-operand-math-max')?.root]
			},
			{
				case: ['distance', 'distance-x', 'distance-y', 'relative-angle'],
				targets: [
					fieldEls.get('setNumber-operand-math-startPosition')?.root,
					fieldEls.get('setNumber-operand-math-endPosition')?.root
				]
			}
		]);

	useLocalizedOptions('setNumber-operand-string-method', ['length', 'parse', 'search'], (items) =>
		fieldEls.get('setNumber-operand-string-method')?.loadItems?.(items)
	);

	fieldEls.get('setNumber-operand-string-method')
		?.enableHiddenMode?.()
		?.relate?.([
			{
				case: ['length', 'parse'],
				targets: [fieldEls.get('setNumber-operand-common-variable')?.root]
			},
			{
				case: 'search',
				targets: [
					fieldEls.get('setNumber-operand-common-variable')?.root,
					fieldEls.get('setNumber-operand-string-search')?.root
				]
			}
		]);

	useLocalizedOptions('setNumber-operand-object-property', ['actor-x', 'actor-y', 'actor-ui-x', 'actor-ui-y', 'actor-screen-x', 'actor-screen-y', 'actor-angle', 'actor-direction', 'actor-movement-speed', 'actor-collision-size', 'actor-collision-weight', 'actor-scaling-factor', 'actor-inventory-item-quantity', 'actor-inventory-equipment-quantity', 'actor-inventory-money', 'actor-inventory-used-space', 'actor-inventory-version', 'actor-skill-version', 'actor-state-version', 'actor-equipment-version', 'actor-shortcut-version', 'actor-animation-current-time', 'actor-animation-duration', 'actor-animation-progress', 'actor-cooldown-time', 'actor-cooldown-duration', 'actor-cooldown-progress', 'skill-cooldown-time', 'skill-cooldown-duration', 'skill-cooldown-progress', 'state-current-time', 'state-duration', 'state-progress', 'equipment-order', 'item-order', 'item-quantity', 'trigger-speed', 'trigger-angle', 'tilemap-width', 'tilemap-height', 'tilemap-tag', 'list-length'], (items) =>
		fieldEls.get('setNumber-operand-object-property')?.loadItems?.(items)
	);

	fieldEls.get('setNumber-operand-object-property')
		?.enableHiddenMode?.()
		?.relate?.([
			{
				case: [
					'actor-x',
					'actor-y',
					'actor-ui-x',
					'actor-ui-y',
					'actor-screen-x',
					'actor-screen-y',
					'actor-angle',
					'actor-direction',
					'actor-movement-speed',
					'actor-collision-size',
					'actor-collision-weight',
					'actor-scaling-factor',
					'actor-inventory-money',
					'actor-inventory-used-space',
					'actor-inventory-version',
					'actor-skill-version',
					'actor-state-version',
					'actor-equipment-version',
					'actor-shortcut-version',
					'actor-animation-current-time',
					'actor-animation-duration',
					'actor-animation-progress'
				],
				targets: [fieldEls.get('setNumber-operand-common-actor')?.root]
			},
			{
				case: 'actor-inventory-item-quantity',
				targets: [
					fieldEls.get('setNumber-operand-common-actor')?.root,
					fieldEls.get('setNumber-operand-object-itemId')?.root
				]
			},
			{
				case: 'actor-inventory-equipment-quantity',
				targets: [
					fieldEls.get('setNumber-operand-common-actor')?.root,
					fieldEls.get('setNumber-operand-object-equipmentId')?.root
				]
			},
			{
				case: ['actor-cooldown-time', 'actor-cooldown-duration', 'actor-cooldown-progress'],
				targets: [
					fieldEls.get('setNumber-operand-common-actor')?.root,
					fieldEls.get('setNumber-operand-cooldown-key')?.root
				]
			},
			{
				case: ['skill-cooldown-time', 'skill-cooldown-duration', 'skill-cooldown-progress'],
				targets: [fieldEls.get('setNumber-operand-common-skill')?.root]
			},
			{
				case: ['state-current-time', 'state-duration', 'state-progress'],
				targets: [fieldEls.get('setNumber-operand-common-state')?.root]
			},
			{
				case: 'equipment-order',
				targets: [fieldEls.get('setNumber-operand-common-equipment')?.root]
			},
			{
				case: ['item-order', 'item-quantity'],
				targets: [fieldEls.get('setNumber-operand-common-item')?.root]
			},
			{
				case: ['trigger-speed', 'trigger-angle'],
				targets: [fieldEls.get('setNumber-operand-common-trigger')?.root]
			},
			{
				case: ['tilemap-width', 'tilemap-height'],
				targets: [fieldEls.get('setNumber-operand-common-tilemap')?.root]
			},
			{
				case: 'tilemap-tag',
				targets: [
					fieldEls.get('setNumber-operand-common-tilemap')?.root,
					fieldEls.get('setNumber-operand-tilemapPosition')?.root
				]
			},
			{
				case: 'list-length',
				targets: [fieldEls.get('setNumber-operand-common-variable')?.root]
			}
		]);

	useLocalizedOptions('setNumber-operand-element-property', ['element-x', 'element-y', 'element-width', 'element-height', 'element-children-count', 'element-index-of-selected-button', 'transform-anchorX', 'transform-anchorY', 'transform-x', 'transform-y', 'transform-width', 'transform-height', 'transform-x2', 'transform-y2', 'transform-width2', 'transform-height2', 'transform-rotation', 'transform-scaleX', 'transform-scaleY', 'transform-skewX', 'transform-skewY', 'transform-opacity', 'window-visibleGridColumns', 'window-visibleGridRows', 'text-textWidth', 'text-textHeight', 'textBox-number', 'dialogBox-printEndX', 'dialogBox-printEndY'], (items) =>
		fieldEls.get('setNumber-operand-element-property')?.loadItems?.(items)
	);

	useLocalizedOptions('setNumber-operand-other-data', ['trigger-button', 'trigger-wheel-y', 'trigger-gamepad-button', 'gamepad-left-stick-angle', 'gamepad-right-stick-angle', 'mouse-screen-x', 'mouse-screen-y', 'mouse-ui-x', 'mouse-ui-y', 'mouse-scene-x', 'mouse-scene-y', 'touch-screen-x', 'touch-screen-y', 'touch-ui-x', 'touch-ui-y', 'touch-scene-x', 'touch-scene-y', 'virtual-axis-x', 'virtual-axis-y', 'virtual-axis-angle', 'start-position-x', 'start-position-y', 'camera-x', 'camera-y', 'camera-zoom', 'raw-camera-zoom', 'screen-width', 'screen-height', 'scene-width', 'scene-height', 'scene-scale', 'ui-scale', 'play-time', 'elapsed-time', 'delta-time', 'raw-delta-time', 'timestamp', 'party-version', 'party-member-count', 'actor-count', 'latest-item-increment', 'latest-money-increment', 'loader-loaded-bytes', 'loader-total-bytes', 'loader-completion-progress'], (items) =>
		fieldEls.get('setNumber-operand-other-data')?.loadItems?.(items)
	);

	fieldEls.get('setNumber-operand-other-data')
		?.enableHiddenMode?.()
		?.relate?.([
			{
				case: [
					'touch-screen-x',
					'touch-screen-y',
					'touch-ui-x',
					'touch-ui-y',
					'touch-scene-x',
					'touch-scene-y'
				],
				targets: [fieldEls.get('setNumber-operand-other-touchId')?.root]
			},
			{
				case: 'actor-count',
				targets: [fieldEls.get('setNumber-operand-other-teamId')?.root]
			}
		]);

	on(frame.value?.root, 'open', () => {
		fieldEls.get('setNumber-operand-other-teamId')?.loadItems?.(Data.createTeamItems!());
	});

	on(frame.value?.root, 'closed', () => {
		(fieldEls.get('setNumber-operation') as unknown as { root?: YamiElement } | null)?.root?.restore();
	});
});
</script>

<style>
/* 窗口样式试点：由 Project/css/command.css 迁入组件（选择器为全局 id，不能用 scoped） */
#setNumber-operand {
	width: 324px;
	height: 190px;
}

#setNumber-operand-confirm {
	right: 108px;
	bottom: 10px;
}

#setNumber-operand-cancel {
	right: 10px;
	bottom: 10px;
}

</style>
