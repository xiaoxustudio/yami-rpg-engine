<template>
	<WindowFrame id="setTriggerDuration" @confirm="onConfirm">
		<template #title
			><TitleBar
				>{{ t('components.setTriggerDuration.title') }}
				<div class="close" /></TitleBar
		></template>

		<div class="grid-box">
			<div class="text">Trigger</div>
			<CustomBox
			id="setTriggerDuration-trigger"
			v-focus
			type="trigger"
			v-model="form.trigger"
		/>
			<div class="text">Operation</div>
			<SelectBox id="setTriggerDuration-operation"
				:ref="registryRef(fieldEls, 'setTriggerDuration-operation')" v-model="form.operation" />
			<div class="text">Duration</div>
			<NumberVar
				id="setTriggerDuration-duration"
				min="0"
				max="3600000"
				unit="ms"
				v-model="form.duration"
			/>
		</div>
	</WindowFrame>
</template>

<script setup lang="ts">
import { createElementRegistry, registryRef } from '@app/utils/element-registry';

// P5b 批次 4：本组件的控件元素注册表（替代按 id 查 DOM）
const fieldEls = createElementRegistry();
import { onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useSetTriggerDurationCommandSchema } from '@app/composables/commands/useSetTriggerDurationCommandSchema';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import CustomBox from '@app/components/common/CustomBox.vue';
import NumberVar from '@app/components/common/NumberVar.vue';
import SelectBox from '@app/components/common/SelectBox.vue';

const { t } = useI18n();

const { form, save } = useSetTriggerDurationCommandSchema();

const onConfirm = () => {
	save();
};

onMounted(() => {
	fieldEls.get('setTriggerDuration-operation')?.loadItems?.([
		{ name: 'Set', value: 'set' },
		{ name: 'Increase', value: 'increase' },
		{ name: 'Decrease', value: 'decrease' }
	]);
});
</script>

<style>
/* 窗口样式试点：由 Project/css/command.css 迁入组件（选择器为全局 id，不能用 scoped） */
#setTriggerDuration {
	width: 324px;
	height: 146px;
}

#setTriggerDuration-confirm {
	right: 108px;
	bottom: 10px;
}

#setTriggerDuration-cancel {
	right: 10px;
	bottom: 10px;
}

</style>
