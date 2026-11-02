<template>
	<WindowFrame id="setPan" :ref="controlRef('setPan')" @confirm="onConfirm" @open="onWindowOpen">
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
				:ref="controlRef('setPan-type')"
				v-focus
				v-model="form.type"
			/>
			<div class="text">{{ t('components.setPan-pan.label') }}</div>
			<NumberVar
				id="setPan-pan"
				:ref="controlRef('setPan-pan')"
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
				:ref="controlRef('setPan-easingId')"
				name="easing"
				v-model="form.easingId"
			/>
			<div class="text">{{ t('components.setPan-duration.label') }}</div>
			<NumberBox
				:label="t('components.setPan-duration.label')"
				id="setPan-duration"
				:ref="controlRef('setPan-duration')"
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
				:ref="controlRef('setPan-wait')"
				name="wait"
				v-model="form.wait"
			/>
		</div>
	</WindowFrame>
</template>

<script setup lang="ts">
import { useLocalizedOptions } from '@app/composables/useLocalizedOptions';
import { computed, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useSetPanCommandSchema } from '@app/composables/commands/useSetPanCommandSchema';
import { Data } from '@app/data/data-object.ts';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import NumberBox from '@app/components/common/NumberBox.vue';
import NumberVar from '@app/components/common/NumberVar.vue';
import SelectBox from '@app/components/common/SelectBox.vue';
import { useControlRefs } from '@app/composables/control-refs';

/** 控件 id 联合：模板与脚本共用，拼错在 tsc / vue-tsc 就红。 */
type Id =
	| 'setPan'
	| 'setPan-duration'
	| 'setPan-easingId'
	| 'setPan-pan'
	| 'setPan-type'
	| 'setPan-wait';

const { controls, controlRef } = useControlRefs<Id>();

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

/** 窗口打开时刷新候选项。 */
const onWindowOpen = () => {
	controls['setPan-easingId']?.loadItems?.(Data.createEasingItems!());
};

onMounted(() => {
	controls['setPan-type']?.loadItems?.([
		{ name: 'BGM', value: 'bgm' },
		{ name: 'BGS', value: 'bgs' },
		{ name: 'CV', value: 'cv' },
		{ name: 'SE', value: 'se' }
	]);
	useLocalizedOptions('setPan-wait', [true, false], (items) =>
		controls['setPan-wait']?.loadItems?.(items)
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
