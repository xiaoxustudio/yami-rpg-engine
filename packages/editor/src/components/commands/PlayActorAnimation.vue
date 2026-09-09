<template>
	<WindowFrame id="playActorAnimation" @confirm="onConfirm">
		<template #title
			><TitleBar
				>{{ t('components.playActorAnimation.title') }}
				<div class="close" /></TitleBar
		></template>

		<div class="grid-box">
			<div class="text">Actor</div>
			<CustomBox id="playActorAnimation-actor" v-focus type="actor" v-model="form.actor" />
			<div class="text">Motion</div>
			<CustomBox id="playActorAnimation-motion" type="enum-string" v-model="form.motion" />
			<div class="text">Speed</div>
			<NumberVar
				id="playActorAnimation-speed"
				min="0.1"
				max="10"
				step="0.1"
				decimals="4"
				v-model="form.speed"
			/>
			<div class="text">Wait</div>
			<SelectBox id="playActorAnimation-wait" name="wait" v-model="form.wait" />
		</div>
	</WindowFrame>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { usePlayActorAnimationCommandSchema } from '@app/composables/commands/usePlayActorAnimationCommandSchema';
import { $ } from '@app/utils/dom';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import CustomBox from '@app/components/common/CustomBox.vue';
import NumberVar from '@app/components/common/NumberVar.vue';
import SelectBox from '@app/components/common/SelectBox.vue';

const { t } = useI18n();

const { form, save } = usePlayActorAnimationCommandSchema();

const onConfirm = () => {
	save();
};

onMounted(() => {
	$('#playActorAnimation-wait')?.loadItems?.([
		{ name: 'Yes', value: true },
		{ name: 'No', value: false }
	]);
});
</script>

<style>
/* 窗口样式试点：由 Project/css/command.css 迁入组件（选择器为全局 id，不能用 scoped） */
#playActorAnimation {
	width: 324px;
	height: 170px;
}

#playActorAnimation-confirm {
	right: 108px;
	bottom: 10px;
}

#playActorAnimation-cancel {
	right: 10px;
	bottom: 10px;
}

</style>
