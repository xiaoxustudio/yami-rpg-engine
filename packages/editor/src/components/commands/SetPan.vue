<template>
	<WindowFrame
		id="setPan"
		:ref="registryRef(fieldEls, 'setPan')"
		@confirm="onConfirm"
		@open="onWindowOpen"
	>
		<template #title
			><TitleBar
				>{{ t('components.setPan.title') }}
				<div class="close" /></TitleBar
		></template>

		<div class="grid-box">
			<div class="text">{{ t('components.setPan-type.label') }}</div>
			<SelectBox
				:label="t('components.setPan-type.label')"
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
				:label="t('components.setPan-easingId.label')"
				id="setPan-easingId"
				:ref="registryRef(fieldEls, 'setPan-easingId')"
				name="easing"
				v-model="form.easingId"
			/>
			<div class="text">{{ t('components.setPan-duration.label') }}</div>
			<NumberBox
				:label="t('components.setPan-duration.label')"
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
				:label="t('components.setPan-wait.label')"
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

/** 窗口打开时刷新候选项。原先是元素优先 API（经 fieldEls 取到元素后订阅 open）。 */
const onWindowOpen = () => {
	fieldEls.get('setPan-easingId')?.loadItems?.(Data.createEasingItems!());
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
});
</script>

<style>
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
