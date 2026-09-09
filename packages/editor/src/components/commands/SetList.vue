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
			v-focus
			type="variable"
			filter="object"
			v-model="form.variable"
		/>
		<div class="text">Operation</div>
		<SelectBox id="setList-operation" v-model="form.operation" />
		<div class="text">Numbers</div>
		<CustomBox
			id="setList-numbers"
			v-focus
			type="array"
			filter="number"
			v-model="form.numbers"
		/>
		<div class="text">Strings</div>
		<CustomBox
			id="setList-strings"
			v-focus
			type="array"
			filter="string"
			v-model="form.strings"
		/>
			<div class="text">Index</div>
			<NumberVar id="setList-index" min="0" max="1000000000" v-model="form.index" />
			<div class="text">Boolean</div>
			<SelectBox id="setList-boolean" v-model="form.boolean" />
			<div class="text">Number</div>
			<NumberBox
				id="setList-number"
				min="-1000000000"
				max="1000000000"
				decimals="10"
				v-model="number"
			/>
			<div class="text">String</div>
			<TextArea id="setList-string" v-model="string" />
		<div class="text">Variable</div>
		<CustomBox
			id="setList-operand"
			v-focus
			type="variable"
			filter="all"
			v-model="form.operand"
		/>
		<div class="text">Separator</div>
		<TextAreaVar id="setList-separator" v-model="form.separator" />
		<div class="text">Attribute Group</div>
		<CustomBox
			id="setList-attribute-groupId"
			v-focus
			type="attribute-group"
			v-model="form.attributeGroupId"
		/>
		<div class="text">Enum Group</div>
		<CustomBox
			id="setList-enum-groupId"
			v-focus
			type="enum-group"
			v-model="form.enumGroupId"
		/>
		<div class="text">Actor</div>
		<CustomBox id="setList-actor" type="actor" v-model="form.actor" />
			<div class="text">Default</div>
			<CheckBox
				id="setList-index-skip-check"
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
import { $ } from '@app/utils/dom';
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
	$('#setList-operation')?.loadItems?.([
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
	$('#setList-operation')
		?.enableHiddenMode?.()
		?.relate?.([
			{ case: 'set-numbers', targets: [$('#setList-numbers')] },
			{ case: 'set-strings', targets: [$('#setList-strings')] },
			{
				case: 'set-boolean',
				targets: [
					$('#setList-index'),
					$('#setList-index-skip-check'),
					$('#setList-boolean')
				]
			},
			{
				case: 'set-number',
				targets: [$('#setList-index'), $('#setList-index-skip-check'), $('#setList-number')]
			},
			{
				case: 'set-string',
				targets: [$('#setList-index'), $('#setList-index-skip-check'), $('#setList-string')]
			},
			{
				case: 'set-variable',
				targets: [
					$('#setList-index'),
					$('#setList-index-skip-check'),
					$('#setList-operand')
				]
			},
			{
				case: 'split-string',
				targets: [$('#setList-operand'), $('#setList-separator')]
			},
			{ case: ['push', 'remove'], targets: [$('#setList-operand')] },
			{
				case: ['get-attribute-names', 'get-attribute-keys'],
				targets: [$('#setList-attribute-groupId')]
			},
			{
				case: ['get-enum-names', 'get-enum-values'],
				targets: [$('#setList-enum-groupId')]
			},
			{ case: 'get-actor-targets', targets: [$('#setList-actor')] }
		]);
	$('#setList-boolean')?.loadItems?.([
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
