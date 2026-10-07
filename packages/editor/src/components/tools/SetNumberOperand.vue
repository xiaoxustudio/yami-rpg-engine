<template>
	<WindowFrame ref="frame" id="setNumber-operand" @confirm="onConfirm">
		<template #title
			><TitleBar
				>{{ t('components.setNumber-operand.title') }}
				<div class="close"></div></TitleBar
		></template>

		<div class="grid-box">
			<div class="text">{{ t('components.setNumber-operation.label') }}</div>
			<SelectBox
				:label="t('components.setNumber-operation.label')"
				id="setNumber-operation"
				v-tip="t('components.setNumber-operation.tip')"
				:ref="fieldRef('setNumber-operation')"
				v-focus
			/>
			<SelectBox
				id="setNumber-operand-operation"
				v-tip="t('components.setNumber-operand-operation.tip')"
				:ref="fieldRef('setNumber-operand-operation')"
				v-focus
				:model-value="form.operation"
			/>
			<div class="text">{{ t('components.setNumber-operand-type.label') }}</div>
			<SelectBox
				:label="t('components.setNumber-operand-type.label')"
				id="setNumber-operand-type"
				v-tip="t('components.setNumber-operand-type.tip')"
				:ref="fieldRef('setNumber-operand-type')"
				:model-value="form.operandType"
				@write="onWrite"
			/>
			<div class="text">{{ t('components.setNumber-operand-constant-value.label') }}</div>
			<NumberBox
				:label="t('components.setNumber-operand-constant-value.label')"
				id="setNumber-operand-constant-value"
				v-tip="t('components.setNumber-operand-constant-value.tip')"
				:ref="fieldRef('setNumber-operand-constant-value')"
				min="-1000000000"
				max="1000000000"
				decimals="10"
				:model-value="form.constantValue"
			/>
			<div class="text">{{ t('components.setNumber-operand-math-method.label') }}</div>
			<SelectBox
				:label="t('components.setNumber-operand-math-method.label')"
				id="setNumber-operand-math-method"
				v-tip="t('components.setNumber-operand-math-method.tip')"
				:ref="fieldRef('setNumber-operand-math-method')"
				:model-value="form.mathMethod"
			/>
			<div class="text">{{ t('components.setNumber-operand-string-method.label') }}</div>
			<SelectBox
				:label="t('components.setNumber-operand-string-method.label')"
				id="setNumber-operand-string-method"
				v-tip="t('components.setNumber-operand-string-method.tip')"
				:ref="fieldRef('setNumber-operand-string-method')"
				:model-value="form.stringMethod"
			/>
			<div class="text">{{ t('components.setNumber-operand-object-property.label') }}</div>
			<SelectBox
				:label="t('components.setNumber-operand-object-property.label')"
				id="setNumber-operand-object-property"
				v-tip="t('components.setNumber-operand-object-property.tip')"
				:ref="fieldRef('setNumber-operand-object-property')"
				:model-value="form.objectProperty"
			/>
			<div class="text">{{ t('components.setNumber-operand-element-property.label') }}</div>
			<SelectBox
				:label="t('components.setNumber-operand-element-property.label')"
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
				:label="t('components.setNumber-operand-math-decimals.label')"
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
			<TextBox
				:label="t('components.setNumber-operand-script.label')"
				id="setNumber-operand-script"
				v-tip="t('components.setNumber-operand-script.tip')"
				:ref="fieldRef('setNumber-operand-script')"
				v-focus
				:model-value="form.script"
			/>
			<div class="text">{{ t('components.setNumber-operand-other-data.label') }}</div>
			<SelectBox
				:label="t('components.setNumber-operand-other-data.label')"
				id="setNumber-operand-other-data"
				v-tip="t('components.setNumber-operand-other-data.tip')"
				:ref="fieldRef('setNumber-operand-other-data')"
				:model-value="form.otherData"
			/>
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
			<SelectBox
				:label="t('components.setNumber-operand-other-teamId.label')"
				id="setNumber-operand-other-teamId"
				v-tip="t('components.setNumber-operand-other-teamId.tip')"
				:ref="fieldRef('setNumber-operand-other-teamId')"
				:model-value="form.otherTeamId"
			/>
		</div>
	</WindowFrame>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { composableEls } from '@app/composables/element-registry';
import { getFormFields, setFormFields } from '@app/composables/form-fields';
import { registerElement } from '@app/utils/element-registry';
import { useNumberOperandSchema } from '@app/composables/useNumberOperandSchema';
import type { NumberOperandForm } from '@app/composables/useNumberOperandSchema';
import {
	setupSetNumberOperandFields,
	type FieldControl
} from '@app/composables/useSetNumberOperandFields';

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

const setForm = (data: Partial<NumberOperandForm>): void =>
	setFormFields<NumberOperandForm>(form, data, FIELD_BY_ID);

const getForm = (): NumberOperandForm => getFormFields<NumberOperandForm>(form, FIELD_BY_ID);

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
		registerElement(composableEls, 'setNumber-operand', el);
	}
	setupSetNumberOperandFields(fieldEls, el);
});
</script>

<style>
/* 不能用 scoped：-confirm/-cancel 等元素由 WindowFrame 内部生成 */
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
