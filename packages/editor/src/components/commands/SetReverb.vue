<template>
	<WindowFrame id="setReverb" @confirm="onConfirm">
		<template #title
			><TitleBar
				>{{ t('components.setReverb.title') }}
				<div class="close" /></TitleBar
		></template>

		<div class="grid-box">
			<div class="text">Type</div>
			<SelectBox id="setReverb-type" v-focus v-model="form.type" />
			<div class="text">Dry</div>
			<NumberVar
				id="setReverb-dry"
				min="0"
				max="1"
				step="0.1"
				decimals="4"
				v-model="form.dry"
			/>
			<div class="text">Wet</div>
			<NumberVar
				id="setReverb-wet"
				min="0"
				max="1"
				step="0.1"
				decimals="4"
				v-model="form.wet"
			/>
			<div class="text">Easing</div>
			<SelectBox id="setReverb-easingId" name="easing" v-model="form.easingId" />
			<div class="text">Duration</div>
			<NumberBox
				id="setReverb-duration"
				name="duration"
				min="0"
				max="3600000"
				unit="ms"
				v-model="duration"
			/>
			<div class="text">Wait</div>
			<SelectBox id="setReverb-wait" name="wait" v-model="form.wait" />
		</div>
	</WindowFrame>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useSetReverbCommandSchema } from '@app/composables/commands/useSetReverbCommandSchema';
import { $ } from '@app/utils/dom';
import { clear } from '@app/utils/element-utils';
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
	$('#setReverb-type')?.loadItems?.([
		{ name: 'BGM', value: 'bgm' },
		{ name: 'BGS', value: 'bgs' },
		{ name: 'CV', value: 'cv' },
		{ name: 'SE', value: 'se' }
	]);
	$('#setReverb-wait')?.loadItems?.([
		{ name: 'Yes', value: true },
		{ name: 'No', value: false }
	]);
	$('#setReverb')?.on?.('open', () => {
		$('#setReverb-easingId')?.loadItems?.(Data.createEasingItems!());
	});
	$('#setReverb')?.on?.('closed', () => {
		clear($('#setReverb-easingId'));
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
