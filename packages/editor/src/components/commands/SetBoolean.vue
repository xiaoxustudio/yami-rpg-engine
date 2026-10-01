<template>
	<WindowFrame id="setBoolean" :ref="registryRef(fieldEls, 'setBoolean')" @confirm="onConfirm">
		<template #title
			><TitleBar
				>{{ t('components.setBoolean.title') }}
				<div class="close" /></TitleBar
		></template>

		<div class="grid-box">
			<div class="text">{{ t('components.setBoolean-variable.label') }}</div>
			<CustomBox
				id="setBoolean-variable"
				:ref="registryRef(fieldEls, 'setBoolean-variable')"
				v-tip="t('components.setBoolean-variable.tip')"
				v-focus
				type="variable"
				filter="writable-boolean"
				v-model="form.variable"
			/>
			<div class="text">{{ t('components.setBoolean-operation.label') }}</div>
			<SelectBox
				id="setBoolean-operation"
				:ref="registryRef(fieldEls, 'setBoolean-operation')"
				v-model="form.operation"
			/>
			<div class="text">{{ t('components.setBoolean-operand-type.label') }}</div>
			<SelectBox
				id="setBoolean-operand-type"
				v-tip="t('components.setBoolean-operand-type.tip')"
				:ref="registryRef(fieldEls, 'setBoolean-operand-type')"
				v-model="form['operand-type']"
				@write="onWrite"
			/>
			<div class="text">{{ t('components.setBoolean-constant-value.label') }}</div>
			<SelectBox
				id="setBoolean-constant-value"
				v-tip="t('components.setBoolean-constant-value.tip')"
				:ref="registryRef(fieldEls, 'setBoolean-constant-value')"
				v-model="form['constant-value']"
			/>
			<div class="text">{{ t('components.setBoolean-common-variable.label') }}</div>
			<CustomBox
				id="setBoolean-common-variable"
				v-tip="t('components.setBoolean-common-variable.tip')"
				:ref="registryRef(fieldEls, 'setBoolean-common-variable')"
				v-focus
				type="variable"
				filter="all"
				v-model="form['common-variable']"
			/>
			<div class="text">{{ t('components.setBoolean-list-index.label') }}</div>
			<NumberVar
				id="setBoolean-list-index"
				v-tip="t('components.setBoolean-list-index.tip')"
				:ref="registryRef(fieldEls, 'setBoolean-list-index')"
				min="0"
				max="1000000000"
				v-model="form['list-index']"
			/>
			<div class="text">{{ t('components.setBoolean-parameter-key.label') }}</div>
			<StringVar
				id="setBoolean-parameter-key"
				v-tip="t('components.setBoolean-parameter-key.tip')"
				:ref="registryRef(fieldEls, 'setBoolean-parameter-key')"
				v-focus
				v-model="form['parameter-key']"
			/>
			<div class="text">{{ t('components.setBoolean-script.label') }}</div>
			<TextBox
				:label="t('components.setBoolean-script.label')"
				id="setBoolean-script"
				v-tip="t('components.setBoolean-script.tip')"
				:ref="registryRef(fieldEls, 'setBoolean-script')"
				v-focus
				v-model="script"
			/>
		</div>
	</WindowFrame>
</template>

<script setup lang="ts">
import { useLocalizedOptions } from '@app/composables/useLocalizedOptions';
import { createElementRegistry, registryRef } from '@app/utils/element-registry';
import { composableEls } from '@app/composables/element-registry';

// 本组件的控件元素注册表（替代按 id 查 DOM）
const fieldEls = createElementRegistry(composableEls);
import { computed, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useSetBooleanCommandSchema } from '@app/composables/commands/useSetBooleanCommandSchema';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import CustomBox from '@app/components/common/CustomBox.vue';
import NumberVar from '@app/components/common/NumberVar.vue';
import StringVar from '@app/components/common/StringVar.vue';
import TextBox from '@app/components/common/TextBox.vue';
import SelectBox from '@app/components/common/SelectBox.vue';

const { t } = useI18n();

const { form, save, writeHandler } = useSetBooleanCommandSchema();

const script = computed({
	get: () => form.script as string,
	set: (value) => {
		form.script = value;
	}
});

const onWrite = (value: unknown) => {
	writeHandler?.({ value: value as string });
};

const onConfirm = () => {
	save();
};

onMounted(() => {
	useLocalizedOptions('setBoolean-operation', ['set', 'not', 'and', 'or', 'xor'], (items) =>
		fieldEls.get('setBoolean-operation')?.loadItems?.(items)
	);
	useLocalizedOptions(
		'setBoolean-operand-type',
		['constant', 'variable', 'list', 'parameter', 'script'],
		(items) => fieldEls.get('setBoolean-operand-type')?.loadItems?.(items)
	);
	fieldEls
		.get('setBoolean-operand-type')
		?.enableHiddenMode?.()
		?.relate?.([
			{
				case: 'constant',
				targets: [fieldEls.get('setBoolean-constant-value')]
			},
			{
				case: 'variable',
				targets: [fieldEls.get('setBoolean-common-variable')]
			},
			{
				case: 'list',
				targets: [
					fieldEls.get('setBoolean-common-variable'),
					fieldEls.get('setBoolean-list-index')
				]
			},
			{
				case: 'parameter',
				targets: [fieldEls.get('setBoolean-parameter-key')]
			},
			{ case: 'script', targets: [fieldEls.get('setBoolean-script')] }
		]);
	fieldEls.get('setBoolean-constant-value')?.loadItems?.([
		{ name: 'False', value: false },
		{ name: 'True', value: true }
	]);
});
</script>

<style>
/* 不能用 scoped：-confirm/-cancel 等元素由 WindowFrame 内部生成 */
#setBoolean {
	width: 324px;
	height: 194px;
}

#setBoolean-confirm {
	right: 108px;
	bottom: 10px;
}

#setBoolean-cancel {
	right: 10px;
	bottom: 10px;
}
</style>
