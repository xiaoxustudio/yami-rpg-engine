<template>
	<WindowFrame
		id="setReverb"
		:ref="registryRef(fieldEls, 'setReverb')"
		@confirm="onConfirm"
		@open="onWindowOpen"
	>
		<template #title
			><TitleBar
				>{{ t('components.setReverb.title') }}
				<div class="close" /></TitleBar
		></template>

		<div class="grid-box">
			<div class="text">{{ t('components.setReverb-type.label') }}</div>
			<SelectBox
				:label="t('components.setReverb-type.label')"
				id="setReverb-type"
				v-tip="t('components.setReverb-type.tip')"
				:ref="registryRef(fieldEls, 'setReverb-type')"
				v-focus
				v-model="form.type"
			/>
			<div class="text">{{ t('components.setReverb-dry.label') }}</div>
			<NumberVar
				id="setReverb-dry"
				:ref="registryRef(fieldEls, 'setReverb-dry')"
				v-tip="t('components.setReverb-dry.tip')"
				min="0"
				max="1"
				step="0.1"
				decimals="4"
				v-model="form.dry"
			/>
			<div class="text">{{ t('components.setReverb-wet.label') }}</div>
			<NumberVar
				id="setReverb-wet"
				:ref="registryRef(fieldEls, 'setReverb-wet')"
				v-tip="t('components.setReverb-wet.tip')"
				min="0"
				max="1"
				step="0.1"
				decimals="4"
				v-model="form.wet"
			/>
			<div class="text">{{ t('components.setReverb-easingId.label') }}</div>
			<SelectBox
				:label="t('components.setReverb-easingId.label')"
				id="setReverb-easingId"
				:ref="registryRef(fieldEls, 'setReverb-easingId')"
				name="easing"
				v-model="form.easingId"
			/>
			<div class="text">{{ t('components.setReverb-duration.label') }}</div>
			<NumberBox
				:label="t('components.setReverb-duration.label')"
				id="setReverb-duration"
				:ref="registryRef(fieldEls, 'setReverb-duration')"
				name="duration"
				min="0"
				max="3600000"
				unit="ms"
				v-model="duration"
			/>
			<div class="text">{{ t('components.setReverb-wait.label') }}</div>
			<SelectBox
				:label="t('components.setReverb-wait.label')"
				id="setReverb-wait"
				:ref="registryRef(fieldEls, 'setReverb-wait')"
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
import { useSetReverbCommandSchema } from '@app/composables/commands/useSetReverbCommandSchema';
import { Data } from '@app/data/data-object.ts';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import NumberBox from '@app/components/common/NumberBox.vue';
import NumberVar from '@app/components/common/NumberVar.vue';
import SelectBox from '@app/components/common/SelectBox.vue';

const { t } = useI18n();

const { form, save } = useSetReverbCommandSchema();

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
	fieldEls.get('setReverb-easingId')?.loadItems?.(Data.createEasingItems!());
};

onMounted(() => {
	fieldEls.get('setReverb-type')?.loadItems?.([
		{ name: 'BGM', value: 'bgm' },
		{ name: 'BGS', value: 'bgs' },
		{ name: 'CV', value: 'cv' },
		{ name: 'SE', value: 'se' }
	]);
	useLocalizedOptions('setReverb-wait', [true, false], (items) =>
		fieldEls.get('setReverb-wait')?.loadItems?.(items)
	);
});
</script>

<style>
#setReverb {
	width: 324px;
	height: 218px;
}

#setReverb-confirm {
	right: 108px;
	bottom: 10px;
}

#setReverb-cancel {
	right: 10px;
	bottom: 10px;
}
</style>
