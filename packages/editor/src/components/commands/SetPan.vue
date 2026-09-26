<template>
	<WindowFrame id="setPan" :ref="registryRef(fieldEls, 'setPan')" @confirm="onConfirm">
		<template #title
			><TitleBar
				>{{ t('components.setPan.title') }}
				<div class="close" /></TitleBar
		></template>

		<div class="grid-box">
			<div class="text">{{ t('components.setPan-type.label') }}</div>
			<SelectBox
				id="setPan-type"
				v-tip="t('components.setPan-type.tip')"
				:ref="registryRef(fieldEls, 'setPan-type')"
				v-focus
				v-model="form.type"
			/>
			<div class="text">{{ t('components.setPan-pan.label') }}</div>
			<NumberVar
				id="setPan-pan"
				:ref="registryRef(fieldEls, 'setPan-pan')"
				v-tip="t('components.setPan-pan.tip')"
				min="-1"
				max="1"
				step="0.1"
				decimals="4"
				v-model="form.pan"
			/>
			<div class="text">{{ t('components.setPan-easingId.label') }}</div>
			<SelectBox
				id="setPan-easingId"
				:ref="registryRef(fieldEls, 'setPan-easingId')"
				name="easing"
				v-model="form.easingId"
			/>
			<div class="text">{{ t('components.setPan-duration.label') }}</div>
			<NumberBox
				id="setPan-duration"
				:ref="registryRef(fieldEls, 'setPan-duration')"
				name="duration"
				min="0"
				max="3600000"
				unit="ms"
				v-model="duration"
			/>
			<div class="text">{{ t('components.setPan-wait.label') }}</div>
			<SelectBox
				id="setPan-wait"
				:ref="registryRef(fieldEls, 'setPan-wait')"
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
import { computed, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useSetPanCommandSchema } from '@app/composables/commands/useSetPanCommandSchema';
import { Data } from '@app/data/data-object.ts';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import NumberBox from '@app/components/common/NumberBox.vue';
import NumberVar from '@app/components/common/NumberVar.vue';
import SelectBox from '@app/components/common/SelectBox.vue';

const { t } = useI18n();

const { form, save } = useSetPanCommandSchema();

const duration = computed({
	get: () => form.duration as number | string,
	set: (value) => {
		form.duration = value;
	}
});

const onConfirm = () => {
	save();
};

onMounted(() => {
	fieldEls.get('setPan-type')?.loadItems?.([
		{ name: 'BGM', value: 'bgm' },
		{ name: 'BGS', value: 'bgs' },
		{ name: 'CV', value: 'cv' },
		{ name: 'SE', value: 'se' }
	]);
	useLocalizedOptions('setPan-wait', [true, false], (items) =>
		fieldEls.get('setPan-wait')?.loadItems?.(items)
	);
	fieldEls.get('setPan')?.on?.('open', () => {
		fieldEls.get('setPan-easingId')?.loadItems?.(Data.createEasingItems!());
	});
});
</script>

<style>
/* 不能用 scoped：-confirm/-cancel 等元素由 WindowFrame 内部生成 */
#setPan {
	width: 324px;
	height: 194px;
}

#setPan-confirm {
	right: 108px;
	bottom: 10px;
}

#setPan-cancel {
	right: 10px;
	bottom: 10px;
}
</style>
