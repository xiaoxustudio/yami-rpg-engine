<template>
	<WindowFrame id="transition" :ref="registryRef(fieldEls, 'transition')" @confirm="onConfirm">
		<template #title
			><TitleBar
				>{{ t('components.transition.title') }}
				<div class="close" /></TitleBar
		></template>

		<div class="grid-box">
			<div class="text">{{ t('components.transition-variable.label') }}</div>
			<CustomBox
				id="transition-variable"
				:ref="registryRef(fieldEls, 'transition-variable')"
				v-tip="t('components.transition-variable.tip')"
				v-focus
				type="variable"
				filter="number"
				v-model="form.variable"
			/>
			<div class="text">{{ t('components.transition-start.label') }}</div>
			<NumberVar
				id="transition-start"
				:ref="registryRef(fieldEls, 'transition-start')"
				v-tip="t('components.transition-start.tip')"
				min="-1000000000"
				max="1000000000"
				decimals="10"
				v-model="form.start"
			/>
			<div class="text">{{ t('components.transition-end.label') }}</div>
			<NumberVar
				id="transition-end"
				:ref="registryRef(fieldEls, 'transition-end')"
				v-tip="t('components.transition-end.tip')"
				min="-1000000000"
				max="1000000000"
				decimals="10"
				v-model="form.end"
			/>
			<div class="text">{{ t('components.transition-easingId.label') }}</div>
			<SelectBox
				:label="t('components.transition-easingId.label')"
				id="transition-easingId"
				:ref="registryRef(fieldEls, 'transition-easingId')"
				name="easing"
				v-model="form.easingId"
			/>
			<div class="text">{{ t('components.transition-duration.label') }}</div>
			<NumberVar
				id="transition-duration"
				:ref="registryRef(fieldEls, 'transition-duration')"
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
import { composableEls } from '@app/composables/element-registry';

// 本组件的控件元素注册表（替代按 id 查 DOM）
const fieldEls = createElementRegistry(composableEls);
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
/* 不能用 scoped：-confirm/-cancel 等元素由 WindowFrame 内部生成 */
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
