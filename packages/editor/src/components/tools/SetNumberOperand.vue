<template>
	<WindowFrame ref="frame" id="setNumber-operand" @confirm="onConfirm">
		<template #title
			><TitleBar
				>{{ t('components.setNumber-operand.title') }}
				<div class="close"></div></TitleBar
		></template>

		<div class="grid-box">
			<div class="text">{{ t('components.setNumber-operation.label') }}</div>
			<SelectBox id="setNumber-operation" v-focus />
			<SelectBox id="setNumber-operand-operation" v-focus :model-value="form.operation" />
			<div class="text">{{ t('components.setNumber-operand-type.label') }}</div>
			<SelectBox
				id="setNumber-operand-type"
				:model-value="form.operandType"
				@write="onWrite"
			/>
			<div class="text">{{ t('components.setNumber-operand-constant-value.label') }}</div>
			<NumberBox
				id="setNumber-operand-constant-value"
				min="-1000000000"
				max="1000000000"
				decimals="10"
				:model-value="form.constantValue"
			/>
			<div class="text">{{ t('components.setNumber-operand-math-method.label') }}</div>
			<SelectBox id="setNumber-operand-math-method" :model-value="form.mathMethod" />
			<div class="text">{{ t('components.setNumber-operand-string-method.label') }}</div>
			<SelectBox id="setNumber-operand-string-method" :model-value="form.stringMethod" />
			<div class="text">{{ t('components.setNumber-operand-object-property.label') }}</div>
			<SelectBox id="setNumber-operand-object-property" :model-value="form.objectProperty" />
			<div class="text">{{ t('components.setNumber-operand-element-property.label') }}</div>
			<SelectBox
				id="setNumber-operand-element-property"
				:model-value="form.elementProperty"
			/>
			<div class="text">{{ t('components.setNumber-operand-element-element.label') }}</div>
			<CustomBox
				id="setNumber-operand-element-element"
				type="element"
				:model-value="form.elementElement"
			/>
			<div class="text">{{ t('components.setNumber-operand-common-variable.label') }}</div>
			<CustomBox
				id="setNumber-operand-common-variable"
				v-focus
				type="variable"
				filter="all"
				:model-value="form.commonVariable"
			/>
			<div class="text">{{ t('components.setNumber-operand-common-actor.label') }}</div>
			<CustomBox
				id="setNumber-operand-common-actor"
				type="actor"
				:model-value="form.commonActor"
			/>
			<div class="text">{{ t('components.setNumber-operand-common-skill.label') }}</div>
			<CustomBox
				id="setNumber-operand-common-skill"
				type="skill"
				:model-value="form.commonSkill"
			/>
			<div class="text">{{ t('components.setNumber-operand-common-state.label') }}</div>
			<CustomBox
				id="setNumber-operand-common-state"
				type="state"
				:model-value="form.commonState"
			/>
			<div class="text">{{ t('components.setNumber-operand-common-equipment.label') }}</div>
			<CustomBox
				id="setNumber-operand-common-equipment"
				type="equipment"
				:model-value="form.commonEquipment"
			/>
			<div class="text">{{ t('components.setNumber-operand-common-item.label') }}</div>
			<CustomBox
				id="setNumber-operand-common-item"
				type="item"
				:model-value="form.commonItem"
			/>
			<div class="text">{{ t('components.setNumber-operand-common-trigger.label') }}</div>
			<CustomBox
				id="setNumber-operand-common-trigger"
				type="trigger"
				:model-value="form.commonTrigger"
			/>
			<div class="text">{{ t('components.setNumber-operand-common-tilemap.label') }}</div>
			<CustomBox
				id="setNumber-operand-common-tilemap"
				type="tilemap"
				:model-value="form.commonTilemap"
			/>
			<div class="text">{{ t('components.setNumber-operand-tilemapPosition.label') }}</div>
			<CustomBox
				id="setNumber-operand-tilemapPosition"
				type="position"
				:model-value="form.tilemapPosition"
			/>
			<div class="text">{{ t('components.setNumber-operand-object-itemId.label') }}</div>
			<FileVar
				id="setNumber-operand-object-itemId"
				v-focus
				type="file"
				filter="item"
				:model-value="form.objectItemId"
			/>
			<div class="text">{{ t('components.setNumber-operand-object-equipmentId.label') }}</div>
			<FileVar
				id="setNumber-operand-object-equipmentId"
				v-focus
				type="file"
				filter="equipment"
				:model-value="form.objectEquipmentId"
			/>
			<div class="text">{{ t('components.setNumber-operand-string-search.label') }}</div>
			<StringVar
				id="setNumber-operand-string-search"
				v-focus
				:model-value="form.stringSearch"
			/>
			<div class="text">{{ t('components.setNumber-operand-math-decimals.label') }}</div>
			<NumberBox
				id="setNumber-operand-math-decimals"
				min="0"
				max="10"
				:model-value="form.mathDecimals"
			/>
			<div class="text">{{ t('components.setNumber-operand-math-min.label') }}</div>
			<NumberVar
				id="setNumber-operand-math-min"
				min="-1000000000"
				max="1000000000"
				:model-value="form.mathMin"
			/>
			<div class="text">{{ t('components.setNumber-operand-math-max.label') }}</div>
			<NumberVar
				id="setNumber-operand-math-max"
				min="-1000000000"
				max="1000000000"
				:model-value="form.mathMax"
			/>
			<div class="text">{{ t('components.setNumber-operand-math-startPosition.label') }}</div>
			<CustomBox
				id="setNumber-operand-math-startPosition"
				type="position"
				:model-value="form.mathStartPosition"
			/>
			<div class="text">{{ t('components.setNumber-operand-math-endPosition.label') }}</div>
			<CustomBox
				id="setNumber-operand-math-endPosition"
				type="position"
				:model-value="form.mathEndPosition"
			/>
			<div class="text">{{ t('components.setNumber-operand-cooldown-key.label') }}</div>
			<SelectVar
				id="setNumber-operand-cooldown-key"
				v-focus
				:model-value="form.cooldownKey"
			/>
			<div class="text">{{ t('components.setNumber-operand-list-index.label') }}</div>
			<NumberVar
				id="setNumber-operand-list-index"
				min="0"
				max="1000000000"
				:model-value="form.listIndex"
			/>
			<div class="text">{{ t('components.setNumber-operand-parameter-key.label') }}</div>
			<StringVar
				id="setNumber-operand-parameter-key"
				v-focus
				:model-value="form.parameterKey"
			/>
			<div class="text">{{ t('components.setNumber-operand-script.label') }}</div>
			<TextBox id="setNumber-operand-script" v-focus :model-value="form.script" />
			<div class="text">{{ t('components.setNumber-operand-other-data.label') }}</div>
			<SelectBox id="setNumber-operand-other-data" :model-value="form.otherData" />
			<div class="text">{{ t('components.setNumber-operand-other-touchId.label') }}</div>
			<NumberVar
				id="setNumber-operand-other-touchId"
				min="0"
				max="10"
				:model-value="form.otherTouchId"
			/>
			<div class="text">{{ t('components.setNumber-operand-other-teamId.label') }}</div>
			<SelectBox id="setNumber-operand-other-teamId" :model-value="form.otherTeamId" />
		</div>
	</WindowFrame>
</template>

<script setup lang="ts">
/* oxlint-disable eslint/no-restricted-properties */
import { onMounted, reactive, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { $ } from '@app/utils/dom';
import { on, clear } from '@app/utils/element-utils.ts';
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

const onConfirm = () => {
	NumberOperand?.confirm?.(new Event('click'));
};

onMounted(() => {
	const el = frame.value?.root;
	if (el) {
		attachElementApi(el, { setForm, getForm });
	}

	const opEl = $('#setNumber-operation');
	if (!opEl) return;
	opEl.loadItems([
		{ name: 'Set', value: 'set' },
		{ name: 'Add', value: 'add' },
		{ name: 'Sub', value: 'sub' },
		{ name: 'Mul', value: 'mul' },
		{ name: 'Div', value: 'div' },
		{ name: 'Mod', value: 'mod' }
	]);

	$('#setNumber-operand-operation')?.loadItems([
		{ name: 'Add', value: 'add' },
		{ name: 'Sub', value: 'sub' },
		{ name: 'Mul', value: 'mul' },
		{ name: 'Div', value: 'div' },
		{ name: 'Mod', value: 'mod' },
		{ name: '(Add)', value: 'add()' },
		{ name: '(Sub)', value: 'sub()' },
		{ name: '(Mul)', value: 'mul()' },
		{ name: '(Div)', value: 'div()' },
		{ name: '(Mod)', value: 'mod()' }
	]);

	$('#setNumber-operand-type')?.loadItems([
		{ name: 'Constant', value: 'constant' },
		{ name: 'Variable', value: 'variable' },
		{ name: 'Math', value: 'math' },
		{ name: 'String', value: 'string' },
		{ name: 'Object', value: 'object' },
		{ name: 'Element', value: 'element' },
		{ name: 'List', value: 'list' },
		{ name: 'Parameter', value: 'parameter' },
		{ name: 'Script', value: 'script' },
		{ name: 'Other', value: 'other' }
	]);

	$('#setNumber-operand-type')
		.enableHiddenMode()
		.relate([
			{
				case: 'constant',
				targets: [$('#setNumber-operand-constant-value')]
			},
			{
				case: 'variable',
				targets: [$('#setNumber-operand-common-variable')]
			},
			{ case: 'math', targets: [$('#setNumber-operand-math-method')] },
			{
				case: 'string',
				targets: [
					$('#setNumber-operand-string-method'),
					$('#setNumber-operand-common-variable')
				]
			},
			{
				case: 'object',
				targets: [$('#setNumber-operand-object-property')]
			},
			{
				case: 'element',
				targets: [
					$('#setNumber-operand-element-property'),
					$('#setNumber-operand-element-element')
				]
			},
			{
				case: 'list',
				targets: [
					$('#setNumber-operand-common-variable'),
					$('#setNumber-operand-list-index')
				]
			},
			{
				case: 'parameter',
				targets: [$('#setNumber-operand-parameter-key')]
			},
			{ case: 'script', targets: [$('#setNumber-operand-script')] },
			{ case: 'other', targets: [$('#setNumber-operand-other-data')] }
		]);

	$('#setNumber-operand-math-method')?.loadItems([
		{ name: 'Round', value: 'round' },
		{ name: 'Floor', value: 'floor' },
		{ name: 'Ceil', value: 'ceil' },
		{ name: 'Sqrt', value: 'sqrt' },
		{ name: 'Abs', value: 'abs' },
		{ name: 'Cos(radians)', value: 'cos' },
		{ name: 'Sin(radians)', value: 'sin' },
		{ name: 'Tan(radians)', value: 'tan' },
		{ name: 'Random[0,1)', value: 'random' },
		{ name: 'Random Int', value: 'random-int' },
		{ name: 'Distance', value: 'distance' },
		{ name: 'Horizontal Distance', value: 'distance-x' },
		{ name: 'Vertical Distance', value: 'distance-y' },
		{ name: 'Relative Angle', value: 'relative-angle' }
	]);

	$('#setNumber-operand-math-method')
		.enableHiddenMode()
		.relate([
			{
				case: 'round',
				targets: [
					$('#setNumber-operand-common-variable'),
					$('#setNumber-operand-math-decimals')
				]
			},
			{
				case: ['floor', 'ceil', 'sqrt', 'abs', 'cos', 'sin', 'tan'],
				targets: [$('#setNumber-operand-common-variable')]
			},
			{
				case: 'random-int',
				targets: [$('#setNumber-operand-math-min'), $('#setNumber-operand-math-max')]
			},
			{
				case: ['distance', 'distance-x', 'distance-y', 'relative-angle'],
				targets: [
					$('#setNumber-operand-math-startPosition'),
					$('#setNumber-operand-math-endPosition')
				]
			}
		]);

	$('#setNumber-operand-string-method')?.loadItems([
		{ name: 'Get Length', value: 'length' },
		{ name: 'Parse Number', value: 'parse' },
		{ name: 'Get Index of Substring', value: 'search' }
	]);

	$('#setNumber-operand-string-method')
		.enableHiddenMode()
		.relate([
			{
				case: ['length', 'parse'],
				targets: [$('#setNumber-operand-common-variable')]
			},
			{
				case: 'search',
				targets: [
					$('#setNumber-operand-common-variable'),
					$('#setNumber-operand-string-search')
				]
			}
		]);

	$('#setNumber-operand-object-property')?.loadItems([
		{ name: 'Actor - X', value: 'actor-x' },
		{ name: 'Actor - Y', value: 'actor-y' },
		{ name: 'Actor - UI X', value: 'actor-ui-x' },
		{ name: 'Actor - UI Y', value: 'actor-ui-y' },
		{ name: 'Actor - Screen X', value: 'actor-screen-x' },
		{ name: 'Actor - Screen Y', value: 'actor-screen-y' },
		{ name: 'Actor - Angle', value: 'actor-angle' },
		{ name: 'Actor - Direction Angle', value: 'actor-direction' },
		{ name: 'Actor - Movement Speed', value: 'actor-movement-speed' },
		{ name: 'Actor - Collision Size', value: 'actor-collision-size' },
		{ name: 'Actor - Collision Weight', value: 'actor-collision-weight' },
		{ name: 'Actor - Scaling Factor', value: 'actor-scaling-factor' },
		{
			name: 'Actor - Item Quantity',
			value: 'actor-inventory-item-quantity'
		},
		{
			name: 'Actor - Equipment Quantity',
			value: 'actor-inventory-equipment-quantity'
		},
		{ name: 'Actor - Inventory Money', value: 'actor-inventory-money' },
		{
			name: 'Actor - Inventory Used Space',
			value: 'actor-inventory-used-space'
		},
		{ name: 'Actor - Inventory Version', value: 'actor-inventory-version' },
		{ name: 'Actor - Skill Version', value: 'actor-skill-version' },
		{ name: 'Actor - State Version', value: 'actor-state-version' },
		{ name: 'Actor - Equipment Version', value: 'actor-equipment-version' },
		{ name: 'Actor - Shortcut Version', value: 'actor-shortcut-version' },
		{
			name: 'Actor - Anim Current Time',
			value: 'actor-animation-current-time'
		},
		{ name: 'Actor - Anim Duration', value: 'actor-animation-duration' },
		{ name: 'Actor - Anim Progress', value: 'actor-animation-progress' },
		{ name: 'Actor - Cooldown Time', value: 'actor-cooldown-time' },
		{ name: 'Actor - Cooldown Duration', value: 'actor-cooldown-duration' },
		{ name: 'Actor - Cooldown Progress', value: 'actor-cooldown-progress' },
		{ name: 'Skill - Cooldown Time', value: 'skill-cooldown-time' },
		{ name: 'Skill - Cooldown Duration', value: 'skill-cooldown-duration' },
		{ name: 'Skill - Cooldown Progress', value: 'skill-cooldown-progress' },
		{ name: 'State - Current Time', value: 'state-current-time' },
		{ name: 'State - Duration', value: 'state-duration' },
		{ name: 'State - Progress', value: 'state-progress' },
		{ name: 'Equipment - Order in Inventory', value: 'equipment-order' },
		{ name: 'Item - Order in Inventory', value: 'item-order' },
		{ name: 'Item - Quantity', value: 'item-quantity' },
		{ name: 'Trigger - Speed', value: 'trigger-speed' },
		{ name: 'Trigger - Angle', value: 'trigger-angle' },
		{ name: 'Tilemap - Width', value: 'tilemap-width' },
		{ name: 'Tilemap - Height', value: 'tilemap-height' },
		{ name: 'Tilemap - Tag', value: 'tilemap-tag' },
		{ name: 'List - Length', value: 'list-length' }
	]);

	$('#setNumber-operand-object-property')
		.enableHiddenMode()
		.relate([
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
				targets: [$('#setNumber-operand-common-actor')]
			},
			{
				case: 'actor-inventory-item-quantity',
				targets: [
					$('#setNumber-operand-common-actor'),
					$('#setNumber-operand-object-itemId')
				]
			},
			{
				case: 'actor-inventory-equipment-quantity',
				targets: [
					$('#setNumber-operand-common-actor'),
					$('#setNumber-operand-object-equipmentId')
				]
			},
			{
				case: ['actor-cooldown-time', 'actor-cooldown-duration', 'actor-cooldown-progress'],
				targets: [
					$('#setNumber-operand-common-actor'),
					$('#setNumber-operand-cooldown-key')
				]
			},
			{
				case: ['skill-cooldown-time', 'skill-cooldown-duration', 'skill-cooldown-progress'],
				targets: [$('#setNumber-operand-common-skill')]
			},
			{
				case: ['state-current-time', 'state-duration', 'state-progress'],
				targets: [$('#setNumber-operand-common-state')]
			},
			{
				case: 'equipment-order',
				targets: [$('#setNumber-operand-common-equipment')]
			},
			{
				case: ['item-order', 'item-quantity'],
				targets: [$('#setNumber-operand-common-item')]
			},
			{
				case: ['trigger-speed', 'trigger-angle'],
				targets: [$('#setNumber-operand-common-trigger')]
			},
			{
				case: ['tilemap-width', 'tilemap-height'],
				targets: [$('#setNumber-operand-common-tilemap')]
			},
			{
				case: 'tilemap-tag',
				targets: [
					$('#setNumber-operand-common-tilemap'),
					$('#setNumber-operand-tilemapPosition')
				]
			},
			{
				case: 'list-length',
				targets: [$('#setNumber-operand-common-variable')]
			}
		]);

	$('#setNumber-operand-element-property')?.loadItems([
		{ name: 'Element - X', value: 'element-x' },
		{ name: 'Element - Y', value: 'element-y' },
		{ name: 'Element - Width', value: 'element-width' },
		{ name: 'Element - Height', value: 'element-height' },
		{
			name: 'Element - Number of Children',
			value: 'element-children-count'
		},
		{
			name: 'Element - Index of the Selected Button',
			value: 'element-index-of-selected-button'
		},
		{ name: 'Transform - Anchor X', value: 'transform-anchorX' },
		{ name: 'Transform - Anchor Y', value: 'transform-anchorY' },
		{ name: 'Transform - X', value: 'transform-x' },
		{ name: 'Transform - Y', value: 'transform-y' },
		{ name: 'Transform - Width', value: 'transform-width' },
		{ name: 'Transform - Height', value: 'transform-height' },
		{ name: 'Transform - X2', value: 'transform-x2' },
		{ name: 'Transform - Y2', value: 'transform-y2' },
		{ name: 'Transform - Width2', value: 'transform-width2' },
		{ name: 'Transform - Height2', value: 'transform-height2' },
		{ name: 'Transform - Rotation', value: 'transform-rotation' },
		{ name: 'Transform - Scale X', value: 'transform-scaleX' },
		{ name: 'Transform - Scale Y', value: 'transform-scaleY' },
		{ name: 'Transform - Skew X', value: 'transform-skewX' },
		{ name: 'Transform - Skew Y', value: 'transform-skewY' },
		{ name: 'Transform - Opacity', value: 'transform-opacity' },
		{
			name: 'Window - Visible Grid Columns',
			value: 'window-visibleGridColumns'
		},
		{ name: 'Window - Visible Grid Rows', value: 'window-visibleGridRows' },
		{ name: 'Text - Text Width', value: 'text-textWidth' },
		{ name: 'Text - Text Height', value: 'text-textHeight' },
		{ name: 'Text Box - Number', value: 'textBox-number' },
		{ name: 'Dialog Box - Print End X', value: 'dialogBox-printEndX' },
		{ name: 'Dialog Box - Print End Y', value: 'dialogBox-printEndY' }
	]);

	$('#setNumber-operand-other-data')?.loadItems([
		{ name: 'Event Trigger Mouse Button', value: 'trigger-button' },
		{ name: 'Event Trigger Wheel Delta Y', value: 'trigger-wheel-y' },
		{
			name: 'Event Trigger Gamepad Button',
			value: 'trigger-gamepad-button'
		},
		{ name: 'Gamepad Left Stick Angle', value: 'gamepad-left-stick-angle' },
		{
			name: 'Gamepad Right Stick Angle',
			value: 'gamepad-right-stick-angle'
		},
		{ name: 'Mouse Screen X', value: 'mouse-screen-x' },
		{ name: 'Mouse Screen Y', value: 'mouse-screen-y' },
		{ name: 'Mouse UI X', value: 'mouse-ui-x' },
		{ name: 'Mouse UI Y', value: 'mouse-ui-y' },
		{ name: 'Mouse Scene X', value: 'mouse-scene-x' },
		{ name: 'Mouse Scene Y', value: 'mouse-scene-y' },
		{ name: 'Touch Screen X', value: 'touch-screen-x' },
		{ name: 'Touch Screen Y', value: 'touch-screen-y' },
		{ name: 'Touch UI X', value: 'touch-ui-x' },
		{ name: 'Touch UI Y', value: 'touch-ui-y' },
		{ name: 'Touch Scene X', value: 'touch-scene-x' },
		{ name: 'Touch Scene Y', value: 'touch-scene-y' },
		{ name: 'Virtual Axis X', value: 'virtual-axis-x' },
		{ name: 'Virtual Axis Y', value: 'virtual-axis-y' },
		{ name: 'Virtual Axis Angle', value: 'virtual-axis-angle' },
		{ name: 'Start Position X', value: 'start-position-x' },
		{ name: 'Start Position Y', value: 'start-position-y' },
		{ name: 'Camera X', value: 'camera-x' },
		{ name: 'Camera Y', value: 'camera-y' },
		{ name: 'Camera Zoom', value: 'camera-zoom' },
		{ name: 'Raw Camera Zoom', value: 'raw-camera-zoom' },
		{ name: 'Screen Width', value: 'screen-width' },
		{ name: 'Screen Height', value: 'screen-height' },
		{ name: 'Scene Width', value: 'scene-width' },
		{ name: 'Scene Height', value: 'scene-height' },
		{ name: 'Scene Scale', value: 'scene-scale' },
		{ name: 'UI Scale', value: 'ui-scale' },
		{ name: 'Play Time', value: 'play-time' },
		{ name: 'Elapsed Time', value: 'elapsed-time' },
		{ name: 'Delta Time', value: 'delta-time' },
		{ name: 'Raw Delta Time', value: 'raw-delta-time' },
		{ name: 'Get Timestamp', value: 'timestamp' },
		{ name: 'Party Version', value: 'party-version' },
		{ name: 'Number of Party Members', value: 'party-member-count' },
		{ name: 'Number of Actors in the Scene', value: 'actor-count' },
		{ name: 'Latest Item Increment', value: 'latest-item-increment' },
		{ name: 'Latest Money Increment', value: 'latest-money-increment' },
		{ name: 'Loader - Loaded Bytes', value: 'loader-loaded-bytes' },
		{ name: 'Loader - Total Bytes', value: 'loader-total-bytes' },
		{
			name: 'Loader - Completion Progress',
			value: 'loader-completion-progress'
		}
	]);

	$('#setNumber-operand-other-data')
		.enableHiddenMode()
		.relate([
			{
				case: [
					'touch-screen-x',
					'touch-screen-y',
					'touch-ui-x',
					'touch-ui-y',
					'touch-scene-x',
					'touch-scene-y'
				],
				targets: [$('#setNumber-operand-other-touchId')]
			},
			{
				case: 'actor-count',
				targets: [$('#setNumber-operand-other-teamId')]
			}
		]);

	on($('#setNumber-operand'), 'open', () => {
		$('#setNumber-operand-other-teamId')?.loadItems(Data.createTeamItems!());
	});

	on($('#setNumber-operand'), 'closed', () => {
		clear($('#setNumber-operand-other-teamId'));
		$('#setNumber-operation').restore();
	});
});
</script>
