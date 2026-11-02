<template>
	<WindowFrame id="setList" :ref="controlRef('setList')" @confirm="onConfirm">
		<template #title
			><TitleBar
				>{{ t('components.setList.title') }}
				<div class="close" /></TitleBar
		></template>

		<div class="grid-box">
			<div class="text">{{ t('components.setList-variable.label') }}</div>
			<CustomBox
				id="setList-variable"
				:ref="controlRef('setList-variable')"
				v-tip="t('components.setList-variable.tip')"
				v-focus
				type="variable"
				filter="object"
				v-model="form.variable"
			/>
			<div class="text">{{ t('components.setList-operation.label') }}</div>
			<SelectBox
				:label="t('components.setList-operation.label')"
				id="setList-operation"
				v-tip="t('components.setList-operation.tip')"
				:ref="controlRef('setList-operation')"
				v-model="form.operation"
			/>
			<div class="text">{{ t('components.setList-numbers.label') }}</div>
			<CustomBox
				id="setList-numbers"
				v-tip="t('components.setList-numbers.tip')"
				:ref="controlRef('setList-numbers')"
				v-focus
				type="array"
				filter="number"
				v-model="form.numbers"
			/>
			<div class="text">{{ t('components.setList-strings.label') }}</div>
			<CustomBox
				id="setList-strings"
				v-tip="t('components.setList-strings.tip')"
				:ref="controlRef('setList-strings')"
				v-focus
				type="array"
				filter="string"
				v-model="form.strings"
			/>
			<div class="text">{{ t('components.setList-index.label') }}</div>
			<NumberVar
				id="setList-index"
				v-tip="t('components.setList-index.tip')"
				:ref="controlRef('setList-index')"
				min="0"
				max="1000000000"
				v-model="form.index"
			/>
			<div class="text">{{ t('components.setList-boolean.label') }}</div>
			<SelectBox
				:label="t('components.setList-boolean.label')"
				id="setList-boolean"
				v-tip="t('components.setList-boolean.tip')"
				:ref="controlRef('setList-boolean')"
				v-model="form.boolean"
			/>
			<div class="text">{{ t('components.setList-number.label') }}</div>
			<NumberBox
				:label="t('components.setList-number.label')"
				id="setList-number"
				v-tip="t('components.setList-number.tip')"
				:ref="controlRef('setList-number')"
				min="-1000000000"
				max="1000000000"
				decimals="10"
				v-model="number"
			/>
			<div class="text">{{ t('components.setList-string.label') }}</div>
			<TextArea
				:label="t('components.setList-string.label')"
				id="setList-string"
				v-tip="t('components.setList-string.tip')"
				:ref="controlRef('setList-string')"
				v-model="string"
			/>
			<div class="text">{{ t('components.setList-operand.label') }}</div>
			<CustomBox
				id="setList-operand"
				v-tip="t('components.setList-operand.tip')"
				:ref="controlRef('setList-operand')"
				v-focus
				type="variable"
				filter="all"
				v-model="form.operand"
			/>
			<div class="text">{{ t('components.setList-separator.label') }}</div>
			<TextAreaVar
				id="setList-separator"
				v-tip="t('components.setList-separator.tip')"
				:ref="controlRef('setList-separator')"
				v-model="form.separator"
			/>
			<div class="text">{{ t('components.setList-attribute-groupId.label') }}</div>
			<CustomBox
				id="setList-attribute-groupId"
				v-tip="t('components.setList-attribute-groupId.tip')"
				:ref="controlRef('setList-attribute-groupId')"
				v-focus
				type="attribute-group"
				v-model="form.attributeGroupId"
			/>
			<div class="text">{{ t('components.setList-enum-groupId.label') }}</div>
			<CustomBox
				id="setList-enum-groupId"
				v-tip="t('components.setList-enum-groupId.tip')"
				:ref="controlRef('setList-enum-groupId')"
				v-focus
				type="enum-group"
				v-model="form.enumGroupId"
			/>
			<div class="text">{{ t('components.setList-actor.label') }}</div>
			<CustomBox
				id="setList-actor"
				v-tip="t('components.setList-actor.tip')"
				:ref="controlRef('setList-actor')"
				type="actor"
				v-model="form.actor"
			/>
			<div class="text">{{ t('components.setList-index-skip-check.label') }}</div>
			<CheckBox
				id="setList-index-skip-check"
				v-tip="t('components.setList-index-skip-check.tip')"
				:ref="controlRef('setList-index-skip-check')"
				class="standard"
				v-model="indexSkipCheck"
			/>
		</div>
	</WindowFrame>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useSetListCommandSchema } from '@app/composables/commands/useSetListCommandSchema';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import CheckBox from '@app/components/common/CheckBox.vue';
import CustomBox from '@app/components/common/CustomBox.vue';
import NumberBox from '@app/components/common/NumberBox.vue';
import NumberVar from '@app/components/common/NumberVar.vue';
import TextArea from '@app/components/common/TextArea.vue';
import TextAreaVar from '@app/components/common/TextAreaVar.vue';
import SelectBox from '@app/components/common/SelectBox.vue';
import { controlRoot, useControlRefs } from '@app/composables/control-refs';

/** 控件 id 联合：模板与脚本共用，拼错在 tsc / vue-tsc 就红。 */
type Id =
	| 'setList'
	| 'setList-actor'
	| 'setList-attribute-groupId'
	| 'setList-boolean'
	| 'setList-enum-groupId'
	| 'setList-index'
	| 'setList-index-skip-check'
	| 'setList-number'
	| 'setList-numbers'
	| 'setList-operand'
	| 'setList-operation'
	| 'setList-separator'
	| 'setList-string'
	| 'setList-strings'
	| 'setList-variable';

const { controls, controlRef } = useControlRefs<Id>();

const { t } = useI18n();

const { form, save } = useSetListCommandSchema();

const number = computed({
	get: () => form.number as number | string,
	set: (value) => {
		form.number = value;
	}
});

const string = computed({
	get: () => form.string as string,
	set: (value) => {
		form.string = value;
	}
});

const indexSkipCheck = computed({
	get: () => form.indexSkipCheck as boolean,
	set: (value) => {
		form.indexSkipCheck = value;
	}
});

const onConfirm = () => {
	save();
};

onMounted(() => {
	controls['setList-operation']?.loadItems?.([
		{ name: 'Set to Empty', value: 'set-empty' },
		{ name: 'Set Numbers', value: 'set-numbers' },
		{ name: 'Set Strings', value: 'set-strings' },
		{ name: 'Set Boolean', value: 'set-boolean' },
		{ name: 'Set Number', value: 'set-number' },
		{ name: 'Set String', value: 'set-string' },
		{ name: 'Set Variable', value: 'set-variable' },
		{
			name: t('command.setList.split-string') || 'Split String',
			value: 'split-string'
		},
		{ name: 'Push', value: 'push' },
		{ name: 'Remove', value: 'remove' },
		{
			name: t('command.setList.get-attribute-names') || 'Get Attribute Names',
			value: 'get-attribute-names'
		},
		{
			name: t('command.setList.get-attribute-keys') || 'Get Attribute Keys',
			value: 'get-attribute-keys'
		},
		{
			name: t('command.setList.get-enum-names') || 'Get Enumeration Names',
			value: 'get-enum-names'
		},
		{
			name: t('command.setList.get-enum-values') || 'Get Enumeration Values',
			value: 'get-enum-values'
		},
		{
			name: t('command.setList.get-actor-targets') || 'Get Actor Targets',
			value: 'get-actor-targets'
		}
	]);
	controls['setList-operation']?.enableHiddenMode?.();
	controls['setList-operation']?.relate?.([
		{ case: 'set-numbers', targets: [controlRoot(controls['setList-numbers'])] },
		{ case: 'set-strings', targets: [controlRoot(controls['setList-strings'])] },
		{
			case: 'set-boolean',
			targets: [
				controlRoot(controls['setList-index']),
				controlRoot(controls['setList-index-skip-check']),
				controlRoot(controls['setList-boolean'])
			]
		},
		{
			case: 'set-number',
			targets: [
				controlRoot(controls['setList-index']),
				controlRoot(controls['setList-index-skip-check']),
				controlRoot(controls['setList-number'])
			]
		},
		{
			case: 'set-string',
			targets: [
				controlRoot(controls['setList-index']),
				controlRoot(controls['setList-index-skip-check']),
				controlRoot(controls['setList-string'])
			]
		},
		{
			case: 'set-variable',
			targets: [
				controlRoot(controls['setList-index']),
				controlRoot(controls['setList-index-skip-check']),
				controlRoot(controls['setList-operand'])
			]
		},
		{
			case: 'split-string',
			targets: [
				controlRoot(controls['setList-operand']),
				controlRoot(controls['setList-separator'])
			]
		},
		{ case: ['push', 'remove'], targets: [controlRoot(controls['setList-operand'])] },
		{
			case: ['get-attribute-names', 'get-attribute-keys'],
			targets: [controlRoot(controls['setList-attribute-groupId'])]
		},
		{
			case: ['get-enum-names', 'get-enum-values'],
			targets: [controlRoot(controls['setList-enum-groupId'])]
		},
		{ case: 'get-actor-targets', targets: [controlRoot(controls['setList-actor'])] }
	]);
	controls['setList-boolean']?.loadItems?.([
		{ name: 'False', value: false },
		{ name: 'True', value: true }
	]);
});
</script>

<style>
#setList {
	width: 324px;
	height: calc(194px + 24px);
}

#setList-string,
#setList-separator {
	height: 44px;
}

#setList-confirm {
	right: 108px;
	bottom: 10px;
}

#setList-cancel {
	right: 10px;
	bottom: 10px;
}
</style>
