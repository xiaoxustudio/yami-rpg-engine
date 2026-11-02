<template>
	<WindowFrame
		id="setNumber"
		:ref="controlRef('setNumber')"
		@confirm="onConfirm"
		@closed="onClosed"
	>
		<template #title
			><TitleBar
				>{{ t('components.setNumber.title') }}
				<div class="close" /></TitleBar
		></template>

		<div class="grid-box">
			<div class="text">{{ t('components.setNumber-variable.label') }}</div>
			<CustomBox
				id="setNumber-variable"
				:ref="controlRef('setNumber-variable')"
				v-tip="t('components.setNumber-variable.tip')"
				v-focus
				type="variable"
				filter="writable-number"
				v-model="form.variable"
			/>
			<div class="text">{{ t('components.setNumber-operands.label') }}</div>
			<ParamList
				id="setNumber-operands"
				:ref="controlRef('setNumber-operands')"
				v-focus
				v-model="form.operands"
			/>
		</div>
	</WindowFrame>
</template>

<script setup lang="ts">
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
import { controlRoot, useControlRefs } from '@app/composables/control-refs';

/** 控件 id 联合：模板与脚本共用，拼错在 tsc / vue-tsc 就红。 */
type Id = 'setNumber' | 'setNumber-operands' | 'setNumber-variable';

const { controls, controlRef } = useControlRefs<Id>();

const { t } = useI18n();

const { form, save } = useSetNumberCommandSchema();

const onConfirm = () => {
	save();
};

/** 窗口关闭时清理。 */
const onClosed = () => {
	clear(controlRoot(controls['setNumber-operands']));
};

onMounted(() => {
	controls['setNumber-operands']?.bind?.(NumberOperand);
});
</script>

<style>
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
