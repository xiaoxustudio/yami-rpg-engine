<template>
	<WindowFrame id="setReverb"
				:ref="registryRef(fieldEls, 'setReverb')" @confirm="onConfirm">
		<template #title
			><TitleBar
				>{{ t('components.setReverb.title') }}
				<div class="close" /></TitleBar
		></template>

		<div class="grid-box">
			<div class="text">{{ t('components.setReverb-type.label') }}</div>
			<SelectBox id="setReverb-type"
				v-tip="t('components.setReverb-type.tip')"
				:ref="registryRef(fieldEls, 'setReverb-type')" v-focus v-model="form.type" />
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
			<SelectBox id="setReverb-easingId"
				:ref="registryRef(fieldEls, 'setReverb-easingId')" name="easing" v-model="form.easingId" />
			<div class="text">{{ t('components.setReverb-duration.label') }}</div>
			<NumberBox
				id="setReverb-duration"
				:ref="registryRef(fieldEls, 'setReverb-duration')"
				name="duration"
				min="0"
				max="3600000"
				unit="ms"
				v-model="duration"
			/>
			<div class="text">{{ t('components.setReverb-wait.label') }}</div>
			<SelectBox id="setReverb-wait"
				:ref="registryRef(fieldEls, 'setReverb-wait')" name="wait" v-model="form.wait" />
		</div>
	</WindowFrame>
</template>

<script setup lang="ts">
import { createElementRegistry, registryRef } from '@app/utils/element-registry';
import { composableEls } from '@app/composables/element-registry';

// P5b 批次 4：本组件的控件元素注册表（替代按 id 查 DOM）
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

onMounted(() => {
	fieldEls.get('setReverb-type')?.loadItems?.([
		{ name: 'BGM', value: 'bgm' },
		{ name: 'BGS', value: 'bgs' },
		{ name: 'CV', value: 'cv' },
		{ name: 'SE', value: 'se' }
	]);
	fieldEls.get('setReverb-wait')?.loadItems?.([
		{ name: 'Yes', value: true },
		{ name: 'No', value: false }
	]);
	fieldEls.get('setReverb')?.on?.('open', () => {
		fieldEls.get('setReverb-easingId')?.loadItems?.(Data.createEasingItems!());
	});
});
</script>

<style>
/* 窗口样式试点：由 Project/css/command.css 迁入组件（选择器为全局 id，不能用 scoped） */
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
