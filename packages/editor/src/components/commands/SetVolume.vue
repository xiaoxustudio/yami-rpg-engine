<template>
	<WindowFrame
		id="setVolume"
		:ref="controlRef('setVolume')"
		@confirm="onConfirm"
		@open="onWindowOpen"
	>
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
				:ref="controlRef('setVolume-type')"
				v-focus
				v-model="form.type"
			/>
			<div class="text">{{ t('components.setVolume-volume.label') }}</div>
			<NumberVar
				id="setVolume-volume"
				:ref="controlRef('setVolume-volume')"
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
				:ref="controlRef('setVolume-easingId')"
				name="easing"
				v-model="form.easingId"
			/>
			<div class="text">{{ t('components.setVolume-duration.label') }}</div>
			<NumberBox
				:label="t('components.setVolume-duration.label')"
				id="setVolume-duration"
				:ref="controlRef('setVolume-duration')"
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
				:ref="controlRef('setVolume-wait')"
				name="wait"
				v-model="form.wait"
			/>
		</div>
	</WindowFrame>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useControlRefs } from '@app/composables/control-refs';
import { useLocalizedOptions } from '@app/composables/useLocalizedOptions';
import { useSetVolumeCommandSchema } from '@app/composables/useSetVolumeCommandSchema';
import { Data } from '@app/data/data-object.ts';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import NumberBox from '@app/components/common/NumberBox.vue';
import NumberVar from '@app/components/common/NumberVar.vue';
import SelectBox from '@app/components/common/SelectBox.vue';

/** 控件 id 联合：模板与脚本共用，拼错在 tsc / vue-tsc 就红。 */
type Id =
	| 'setVolume'
	| 'setVolume-duration'
	| 'setVolume-easingId'
	| 'setVolume-type'
	| 'setVolume-volume'
	| 'setVolume-wait';

const { controls, controlRef } = useControlRefs<Id>();

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

/** 窗口打开时刷新候选项。 */
const onWindowOpen = () => {
	controls['setVolume-easingId']?.loadItems?.(Data.createEasingItems!());
};

onMounted(() => {
	controls['setVolume-type']?.loadItems?.([
		{ name: 'BGM', value: 'bgm' },
		{ name: 'BGS', value: 'bgs' },
		{ name: 'CV', value: 'cv' },
		{ name: 'SE', value: 'se' }
	]);
	useLocalizedOptions('setVolume-wait', [true, false], (items) =>
		controls['setVolume-wait']?.loadItems?.(items)
	);
});
</script>

<style>
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
