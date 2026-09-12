<template>
	<WindowFrame id="setList" @confirm="onConfirm">
		<template #title
			><TitleBar
				>{{ t('components.setList.title') }}
				<div class="close" /></TitleBar
		></template>

		<div class="grid-box">
		<div class="text">Variable</div>
		<CustomBox
			id="setList-variable"
				v-tip="t('components.setList-variable.tip')"
			v-focus
			type="variable"
			filter="object"
			v-model="form.variable"
		/>
		<div class="text">Operation</div>
		<SelectBox id="setList-operation"
				v-tip="t('components.setList-operation.tip')"
				:ref="registryRef(fieldEls, 'setList-operation')" v-model="form.operation" />
		<div class="text">Numbers</div>
		<CustomBox
			id="setList-numbers"
				v-tip="t('components.setList-numbers.tip')"
				:ref="registryRef(fieldEls, 'setList-numbers')"
			v-focus
			type="array"
			filter="number"
			v-model="form.numbers"
		/>
		<div class="text">Strings</div>
		<CustomBox
			id="setList-strings"
				v-tip="t('components.setList-strings.tip')"
				:ref="registryRef(fieldEls, 'setList-strings')"
			v-focus
			type="array"
			filter="string"
			v-model="form.strings"
		/>
			<div class="text">Index</div>
			<NumberVar id="setList-index"
				v-tip="t('components.setList-index.tip')"
				:ref="registryRef(fieldEls, 'setList-index')" min="0" max="1000000000" v-model="form.index" />
			<div class="text">Boolean</div>
			<SelectBox id="setList-boolean"
				v-tip="t('components.setList-boolean.tip')"
				:ref="registryRef(fieldEls, 'setList-boolean')" v-model="form.boolean" />
			<div class="text">Number</div>
			<NumberBox
				id="setList-number"
				v-tip="t('components.setList-number.tip')"
				:ref="registryRef(fieldEls, 'setList-number')"
				min="-1000000000"
				max="1000000000"
				decimals="10"
				v-model="number"
			/>
			<div class="text">String</div>
			<TextArea id="setList-string"
				v-tip="t('components.setList-string.tip')"
				:ref="registryRef(fieldEls, 'setList-string')" v-model="string" />
		<div class="text">Variable</div>
		<CustomBox
			id="setList-operand"
				v-tip="t('components.setList-operand.tip')"
				:ref="registryRef(fieldEls, 'setList-operand')"
			v-focus
			type="variable"
			filter="all"
			v-model="form.operand"
		/>
		<div class="text">Separator</div>
		<TextAreaVar id="setList-separator"
				v-tip="t('components.setList-separator.tip')"
				:ref="registryRef(fieldEls, 'setList-separator')" v-model="form.separator" />
		<div class="text">Attribute Group</div>
		<CustomBox
			id="setList-attribute-groupId"
				v-tip="t('components.setList-attribute-groupId.tip')"
				:ref="registryRef(fieldEls, 'setList-attribute-groupId')"
			v-focus
			type="attribute-group"
			v-model="form.attributeGroupId"
		/>
		<div class="text">Enum Group</div>
		<CustomBox
			id="setList-enum-groupId"
				v-tip="t('components.setList-enum-groupId.tip')"
				:ref="registryRef(fieldEls, 'setList-enum-groupId')"
			v-focus
			type="enum-group"
			v-model="form.enumGroupId"
		/>
		<div class="text">Actor</div>
		<CustomBox id="setList-actor"
				v-tip="t('components.setList-actor.tip')"
				:ref="registryRef(fieldEls, 'setList-actor')" type="actor" v-model="form.actor" />
			<div class="text">Default</div>
			<CheckBox
				id="setList-index-skip-check"
				:ref="registryRef(fieldEls, 'setList-index-skip-check')"
				class="standard"
				v-model="indexSkipCheck"
			/>
		</div>
	</WindowFrame>
</template>

<script setup lang="ts">
import { createElementRegistry, registryRef } from '@app/utils/element-registry';

// P5b 批次 4：本组件的控件元素注册表（替代按 id 查 DOM）
const fieldEls = createElementRegistry();
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
	fieldEls.get('setList-operation')?.loadItems?.([
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
	fieldEls.get('setList-operation')
		?.enableHiddenMode?.()
		?.relate?.([
			{ case: 'set-numbers', targets: [fieldEls.get('setList-numbers')] },
			{ case: 'set-strings', targets: [fieldEls.get('setList-strings')] },
			{
				case: 'set-boolean',
				targets: [
					fieldEls.get('setList-index'),
					fieldEls.get('setList-index-skip-check'),
					fieldEls.get('setList-boolean')
				]
			},
			{
				case: 'set-number',
				targets: [fieldEls.get('setList-index'), fieldEls.get('setList-index-skip-check'), fieldEls.get('setList-number')]
			},
			{
				case: 'set-string',
				targets: [fieldEls.get('setList-index'), fieldEls.get('setList-index-skip-check'), fieldEls.get('setList-string')]
			},
			{
				case: 'set-variable',
				targets: [
					fieldEls.get('setList-index'),
					fieldEls.get('setList-index-skip-check'),
					fieldEls.get('setList-operand')
				]
			},
			{
				case: 'split-string',
				targets: [fieldEls.get('setList-operand'), fieldEls.get('setList-separator')]
			},
			{ case: ['push', 'remove'], targets: [fieldEls.get('setList-operand')] },
			{
				case: ['get-attribute-names', 'get-attribute-keys'],
				targets: [fieldEls.get('setList-attribute-groupId')]
			},
			{
				case: ['get-enum-names', 'get-enum-values'],
				targets: [fieldEls.get('setList-enum-groupId')]
			},
			{ case: 'get-actor-targets', targets: [fieldEls.get('setList-actor')] }
		]);
	fieldEls.get('setList-boolean')?.loadItems?.([
		{ name: 'False', value: false },
		{ name: 'True', value: true }
	]);
});
</script>

<style>
/* 窗口样式试点：由 Project/css/command.css 迁入组件（选择器为全局 id，不能用 scoped） */
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
