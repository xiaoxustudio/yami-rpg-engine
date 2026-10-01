<template>
	<WindowFrame id="setVolume" :ref="registryRef(fieldEls, 'setVolume')" @confirm="onConfirm">
		<template #title
			><TitleBar
				>{{ t('components.setVolume.title') }}
				<div class="close" /></TitleBar
		></template>

		<div class="grid-box">
			<div class="text">{{ t('components.setVolume-type.label') }}</div>
			<SelectBox
				:label="t('components.setVolume-type.label')"
				id="setVolume-type"
				v-tip="t('components.setVolume-type.tip')"
				:ref="registryRef(fieldEls, 'setVolume-type')"
				v-focus
				v-model="form.type"
			/>
			<div class="text">{{ t('components.setVolume-volume.label') }}</div>
			<NumberVar
				id="setVolume-volume"
				:ref="registryRef(fieldEls, 'setVolume-volume')"
				v-tip="t('components.setVolume-volume.tip')"
				min="0"
				max="1"
				step="0.1"
				decimals="4"
				v-model="form.volume"
			/>
			<div class="text">{{ t('components.setVolume-easingId.label') }}</div>
			<SelectBox
				:label="t('components.setVolume-easingId.label')"
				id="setVolume-easingId"
				:ref="registryRef(fieldEls, 'setVolume-easingId')"
				name="easing"
				v-model="form.easingId"
			/>
			<div class="text">{{ t('components.setVolume-duration.label') }}</div>
			<NumberBox
				:label="t('components.setVolume-duration.label')"
				id="setVolume-duration"
				:ref="registryRef(fieldEls, 'setVolume-duration')"
				name="duration"
				min="0"
				max="3600000"
				unit="ms"
				v-model="duration"
			/>
			<div class="text">{{ t('components.setVolume-wait.label') }}</div>
			<SelectBox
				:label="t('components.setVolume-wait.label')"
				id="setVolume-wait"
				:ref="registryRef(fieldEls, 'setVolume-wait')"
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
import { useSetVolumeCommandSchema } from '@app/composables/useSetVolumeCommandSchema';
import { Data } from '@app/data/data-object.ts';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import NumberBox from '@app/components/common/NumberBox.vue';
import NumberVar from '@app/components/common/NumberVar.vue';
import SelectBox from '@app/components/common/SelectBox.vue';

const { t } = useI18n();

const { form, save } = useSetVolumeCommandSchema();

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
	fieldEls.get('setVolume-type')?.loadItems?.([
		{ name: 'BGM', value: 'bgm' },
		{ name: 'BGS', value: 'bgs' },
		{ name: 'CV', value: 'cv' },
		{ name: 'SE', value: 'se' }
	]);
	useLocalizedOptions('setVolume-wait', [true, false], (items) =>
		fieldEls.get('setVolume-wait')?.loadItems?.(items)
	);
	fieldEls.get('setVolume')?.on?.('open', () => {
		fieldEls.get('setVolume-easingId')?.loadItems?.(Data.createEasingItems!());
	});
});
</script>

<style>
/* 不能用 scoped：-confirm/-cancel 等元素由 WindowFrame 内部生成 */
#setVolume {
	width: 324px;
	height: 194px;
}

#setVolume-confirm {
	right: 108px;
	bottom: 10px;
}

#setVolume-cancel {
	right: 10px;
	bottom: 10px;
}
</style>
