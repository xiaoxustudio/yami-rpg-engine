<template>
	<WindowFrame id="moveCamera" @confirm="onConfirm">
		<template #title
			><TitleBar
				>{{ t('components.moveCamera.title') }}
				<div class="close" /></TitleBar
		></template>

		<div class="grid-box">
			<div class="text">Mode</div>
			<SelectBox id="moveCamera-mode" v-focus v-model="form.mode" />
			<div class="text">Position</div>
			<CustomBox id="moveCamera-position" type="position" v-model="form.position" />
			<div class="text">Actor</div>
			<CustomBox id="moveCamera-actor" type="actor" v-model="form.actor" />
			<div class="text">Easing</div>
			<SelectBox id="moveCamera-easingId" name="easing" v-model="form.easingId" />
			<div class="text">Duration</div>
			<NumberBox
				id="moveCamera-duration"
				name="duration"
				min="0"
				max="3600000"
				unit="ms"
				v-model="duration"
			/>
			<div class="text">Wait</div>
			<SelectBox id="moveCamera-wait" name="wait" v-model="form.wait" />
		</div>
	</WindowFrame>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useMoveCameraCommandSchema } from '@app/composables/commands/useMoveCameraCommandSchema';
import { $ } from '@app/utils/dom';
import { Data } from '@app/data/data-object.ts';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import CustomBox from '@app/components/common/CustomBox.vue';
import NumberBox from '@app/components/common/NumberBox.vue';
import SelectBox from '@app/components/common/SelectBox.vue';

const { t } = useI18n();

const { form, save } = useMoveCameraCommandSchema();

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
	$('#moveCamera-mode')?.loadItems?.([
		{ name: t('command.moveCamera.position') || 'Move to Position', value: 'position' },
		{ name: t('command.moveCamera.actor') || 'Follow Actor', value: 'actor' }
	]);
	$('#moveCamera-mode')
		?.enableHiddenMode?.()
		?.relate?.([
			{ case: 'position', targets: [$('#moveCamera-position')] },
			{ case: 'actor', targets: [$('#moveCamera-actor')] }
		]);
	$('#moveCamera-wait')?.loadItems?.([
		{ name: 'Yes', value: true },
		{ name: 'No', value: false }
	]);
	$('#moveCamera')?.on?.('open', () => {
		$('#moveCamera-easingId')?.loadItems?.(Data.createEasingItems!());
	});
});
</script>

<style>
/* 窗口样式试点：由 Project/css/command.css 迁入组件（选择器为全局 id，不能用 scoped） */
#moveCamera {
	width: 324px;
	height: 194px;
}

#moveCamera-confirm {
	right: 108px;
	bottom: 10px;
}

#moveCamera-cancel {
	right: 10px;
	bottom: 10px;
}

</style>
