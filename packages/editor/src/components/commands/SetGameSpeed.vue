<template>
	<WindowFrame
		id="setGameSpeed"
		:ref="registryRef(fieldEls, 'setGameSpeed')"
		@confirm="onConfirm"
	>
		<template #title
			><TitleBar
				>{{ t('components.setGameSpeed.title') }}
				<div class="close" /></TitleBar
		></template>

		<div class="grid-box">
			<div class="text">{{ t('components.setGameSpeed-speed.label') }}</div>
			<NumberVar
				id="setGameSpeed-speed"
				:ref="registryRef(fieldEls, 'setGameSpeed-speed')"
				v-tip="t('components.setGameSpeed-speed.tip')"
				v-focus
				min="0"
				max="10"
				step="0.1"
				decimals="4"
				v-model="form.speed"
			/>
			<div class="text">{{ t('components.setGameSpeed-easingId.label') }}</div>
			<SelectBox
				:label="t('components.setGameSpeed-easingId.label')"
				id="setGameSpeed-easingId"
				:ref="registryRef(fieldEls, 'setGameSpeed-easingId')"
				name="easing"
				v-model="form.easingId"
			/>
			<div class="text">{{ t('components.setGameSpeed-duration.label') }}</div>
			<NumberVar
				id="setGameSpeed-duration"
				:ref="registryRef(fieldEls, 'setGameSpeed-duration')"
				name="duration"
				min="0"
				max="3600000"
				unit="ms"
				v-model="form.duration"
			/>
			<div class="text">{{ t('components.setGameSpeed-wait.label') }}</div>
			<SelectBox
				:label="t('components.setGameSpeed-wait.label')"
				id="setGameSpeed-wait"
				:ref="registryRef(fieldEls, 'setGameSpeed-wait')"
				name="wait"
				v-model="form.wait"
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
import { onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useSetGameSpeedCommandSchema } from '@app/composables/commands/useSetGameSpeedCommandSchema';
import { Data } from '@app/data/data-object.ts';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import NumberVar from '@app/components/common/NumberVar.vue';
import SelectBox from '@app/components/common/SelectBox.vue';

const { t } = useI18n();

const { form, save } = useSetGameSpeedCommandSchema();

const onConfirm = () => {
	save();
};

onMounted(() => {
	useLocalizedOptions('setGameSpeed-wait', [true, false], (items) =>
		fieldEls.get('setGameSpeed-wait')?.loadItems?.(items)
	);
	fieldEls.get('setGameSpeed')?.on?.('open', () => {
		fieldEls.get('setGameSpeed-easingId')?.loadItems?.(Data.createEasingItems!());
	});
});
</script>

<style>
/* 不能用 scoped：-confirm/-cancel 等元素由 WindowFrame 内部生成 */
#setGameSpeed {
	width: 324px;
	height: 170px;
}

#setGameSpeed-confirm {
	right: 108px;
	bottom: 10px;
}

#setGameSpeed-cancel {
	right: 10px;
	bottom: 10px;
}
</style>
