<template>
	<WindowFrame id="transition"
				:ref="registryRef(fieldEls, 'transition')" @confirm="onConfirm">
		<template #title
			><TitleBar
				>{{ t('components.transition.title') }}
				<div class="close" /></TitleBar
		></template>

		<div class="grid-box">
			<div class="text">Write to Variable</div>
			<CustomBox
				id="transition-variable"
				v-focus
				type="variable"
				filter="number"
				v-model="form.variable"
			/>
			<div class="text">Start Value</div>
			<NumberVar
				id="transition-start"
				min="-1000000000"
				max="1000000000"
				decimals="10"
				v-model="form.start"
			/>
			<div class="text">End Value</div>
			<NumberVar
				id="transition-end"
				min="-1000000000"
				max="1000000000"
				decimals="10"
				v-model="form.end"
			/>
			<div class="text">Easing</div>
			<SelectBox id="transition-easingId" name="easing" v-model="form.easingId" />
			<div class="text">Duration</div>
			<NumberVar
				id="transition-duration"
				v-focus
				name="duration"
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
import { on } from '@app/utils/element-utils';
import { useTransitionCommandSchema } from '@app/composables/commands/useTransitionCommandSchema';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import CustomBox from '@app/components/common/CustomBox.vue';
import NumberVar from '@app/components/common/NumberVar.vue';
import SelectBox from '@app/components/common/SelectBox.vue';

const { t } = useI18n();

const { form, save, open, windowClosed } = useTransitionCommandSchema();

const onConfirm = () => {
	save();
};

onMounted(() => {
	on(fieldEls.get('transition'), 'open', () => open());
	on(fieldEls.get('transition'), 'closed', () => windowClosed(new Event('closed')));
});
</script>

<style>
/* 窗口样式试点：由 Project/css/command.css 迁入组件（选择器为全局 id，不能用 scoped） */
#transition {
	width: 324px;
	height: 194px;
}

#transition-confirm {
	right: 108px;
	bottom: 10px;
}

#transition-cancel {
	right: 10px;
	bottom: 10px;
}

</style>
