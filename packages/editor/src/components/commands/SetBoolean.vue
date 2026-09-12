<template>
	<WindowFrame id="setBoolean" @confirm="onConfirm">
		<template #title
			><TitleBar
				>{{ t('components.setBoolean.title') }}
				<div class="close" /></TitleBar
		></template>

		<div class="grid-box">
			<div class="text">Variable</div>
			<CustomBox
				id="setBoolean-variable"
				v-tip="t('components.setBoolean-variable.tip')"
				v-focus
				type="variable"
				filter="writable-boolean"
				v-model="form.variable"
			/>
			<div class="text">Operation</div>
			<SelectBox id="setBoolean-operation"
				:ref="registryRef(fieldEls, 'setBoolean-operation')" v-model="form.operation" />
			<div class="text">Type</div>
			<SelectBox
				id="setBoolean-operand-type"
				v-tip="t('components.setBoolean-operand-type.tip')"
				:ref="registryRef(fieldEls, 'setBoolean-operand-type')"
				v-model="form['operand-type']"
				@write="onWrite"
			/>
			<div class="text">Constant</div>
			<SelectBox id="setBoolean-constant-value"
				v-tip="t('components.setBoolean-constant-value.tip')"
				:ref="registryRef(fieldEls, 'setBoolean-constant-value')" v-model="form['constant-value']" />
			<div class="text">Variable</div>
			<CustomBox
				id="setBoolean-common-variable"
				v-tip="t('components.setBoolean-common-variable.tip')"
				:ref="registryRef(fieldEls, 'setBoolean-common-variable')"
				v-focus
				type="variable"
				filter="all"
				v-model="form['common-variable']"
			/>
			<div class="text">Index</div>
			<NumberVar
				id="setBoolean-list-index"
				v-tip="t('components.setBoolean-list-index.tip')"
				:ref="registryRef(fieldEls, 'setBoolean-list-index')"
				min="0"
				max="1000000000"
				v-model="form['list-index']"
			/>
			<div class="text">Param Name</div>
			<StringVar id="setBoolean-parameter-key"
				v-tip="t('components.setBoolean-parameter-key.tip')"
				:ref="registryRef(fieldEls, 'setBoolean-parameter-key')" v-focus v-model="form['parameter-key']" />
			<div class="text">Script</div>
			<TextBox id="setBoolean-script"
				v-tip="t('components.setBoolean-script.tip')"
				:ref="registryRef(fieldEls, 'setBoolean-script')" v-focus v-model="script" />
		</div>
	</WindowFrame>
</template>

<script setup lang="ts">
import { createElementRegistry, registryRef } from '@app/utils/element-registry';

// P5b 批次 4：本组件的控件元素注册表（替代按 id 查 DOM）
const fieldEls = createElementRegistry();
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
	fieldEls.get('setBoolean-operation')?.loadItems?.([
		{ name: 'Set', value: 'set' },
		{ name: 'Not', value: 'not' },
		{ name: 'And', value: 'and' },
		{ name: 'Or', value: 'or' },
		{ name: 'Xor', value: 'xor' }
	]);
	fieldEls.get('setBoolean-operand-type')?.loadItems?.([
		{ name: 'Constant', value: 'constant' },
		{ name: 'Variable', value: 'variable' },
		{ name: 'List', value: 'list' },
		{ name: 'Parameter', value: 'parameter' },
		{ name: 'Script', value: 'script' }
	]);
	fieldEls.get('setBoolean-operand-type')
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
				targets: [fieldEls.get('setBoolean-common-variable'), fieldEls.get('setBoolean-list-index')]
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
/* 窗口样式试点：由 Project/css/command.css 迁入组件（选择器为全局 id，不能用 scoped） */
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
