<template>
	<WindowFrame id="setNumber"
				:ref="registryRef(fieldEls, 'setNumber')" @confirm="onConfirm">
		<template #title
			><TitleBar
				>{{ t('components.setNumber.title') }}
				<div class="close" /></TitleBar
		></template>

		<div class="grid-box">
			<div class="text">{{ t('components.setNumber-variable.label') }}</div>
			<CustomBox
				id="setNumber-variable"
				:ref="registryRef(fieldEls, 'setNumber-variable')"
				v-tip="t('components.setNumber-variable.tip')"
				v-focus
				type="variable"
				filter="writable-number"
				v-model="form.variable"
			/>
			<div class="text">{{ t('components.setNumber-operands.label') }}</div>
			<ParamList id="setNumber-operands"
				:ref="registryRef(fieldEls, 'setNumber-operands')" v-focus v-model="form.operands" />
		</div>
	</WindowFrame>
</template>

<script setup lang="ts">
import { createElementRegistry, registryRef } from '@app/utils/element-registry';
import { composableEls } from '@app/composables/element-registry';

// P5b 批次 4：本组件的控件元素注册表（替代按 id 查 DOM）
const fieldEls = createElementRegistry(composableEls);
import { onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useSetNumberCommandSchema } from '@app/composables/commands/useSetNumberCommandSchema';
import { clear } from '@app/utils/element-utils';
import { useNumberOperandSchema } from '@app/composables/useNumberOperandSchema';

const NumberOperand = useNumberOperandSchema();
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import CustomBox from '@app/components/common/CustomBox.vue';
import ParamList from '@app/components/common/ParamList.vue';

const { t } = useI18n();

const { form, save } = useSetNumberCommandSchema();

const onConfirm = () => {
	save();
};

onMounted(() => {
	fieldEls.get('setNumber-operands')?.bind?.(NumberOperand);
	fieldEls.get('setNumber')?.on?.('closed', (_event: Event) => {
		clear(fieldEls.get('setNumber-operands'));
	});
});
</script>

<style>
/* 窗口样式试点：由 Project/css/command.css 迁入组件（选择器为全局 id，不能用 scoped） */
#setNumber {
	width: 324px;
	height: 204px;
}

#setNumber-operands {
	height: 102px;
}

#setNumber-confirm {
	right: 108px;
	bottom: 10px;
}

#setNumber-cancel {
	right: 10px;
	bottom: 10px;
}

</style>
