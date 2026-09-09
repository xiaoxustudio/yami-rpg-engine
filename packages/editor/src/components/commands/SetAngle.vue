<template>
	<WindowFrame id="setAngle" @confirm="onConfirm">
		<template #title
			><TitleBar
				>{{ t('components.setAngle.title') }}
				<div class="close" /></TitleBar
		></template>

		<div class="grid-box">
			<div class="text">Actor</div>
			<CustomBox id="setAngle-actor" v-focus type="actor" v-model="form.actor" />
			<div class="text">Angle</div>
			<CustomBox id="setAngle-angle" type="angle" v-model="form.angle" />
			<div class="text">Easing</div>
			<SelectBox id="setAngle-easingId" name="easing" v-model="form.easingId" />
			<div class="text">Duration</div>
			<NumberVar
				id="setAngle-duration"
				name="duration"
				min="0"
				max="3600000"
				unit="ms"
				v-model="form.duration"
			/>
			<div class="text">Wait</div>
			<SelectBox id="setAngle-wait" name="wait" v-model="form.wait" />
		</div>
	</WindowFrame>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useSetAngleCommandSchema } from '@app/composables/commands/useSetAngleCommandSchema';
import { $ } from '@app/utils/dom';
import { Data } from '@app/data/data-object.ts';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import CustomBox from '@app/components/common/CustomBox.vue';
import NumberVar from '@app/components/common/NumberVar.vue';
import SelectBox from '@app/components/common/SelectBox.vue';

const { t } = useI18n();

const { form, save } = useSetAngleCommandSchema();

const onConfirm = () => {
	save();
};

onMounted(() => {
	$('#setAngle-wait')?.loadItems?.([
		{ name: 'Yes', value: true },
		{ name: 'No', value: false }
	]);
	$('#setAngle')?.on?.('open', () => {
		$('#setAngle-easingId')?.loadItems?.(Data.createEasingItems!());
	});
});
</script>

<style>
/* 窗口样式试点：由 Project/css/command.css 迁入组件（选择器为全局 id，不能用 scoped） */
#setAngle {
	width: 324px;
	height: 194px;
}

#setAngle-confirm {
	right: 108px;
	bottom: 10px;
}

#setAngle-cancel {
	right: 10px;
	bottom: 10px;
}

</style>
