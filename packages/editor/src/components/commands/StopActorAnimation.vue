<template>
	<WindowFrame id="stopActorAnimation" @confirm="onConfirm">
		<template #title
			><TitleBar
				>{{ t('components.stopActorAnimation.title') }}
				<div class="close" /></TitleBar
		></template>

		<div class="grid-box">
			<div class="text">Actor</div>
			<CustomBox id="stopActorAnimation-actor" v-focus type="actor" v-model="form.actor" />
		</div>
	</WindowFrame>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import { useStopActorAnimationCommandSchema } from '@app/composables/commands/useStopActorAnimationCommandSchema';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import CustomBox from '@app/components/common/CustomBox.vue';

const { t } = useI18n();

const { form, save } = useStopActorAnimationCommandSchema();

const onConfirm = () => {
	save();
};
</script>

<style>
/* 窗口样式试点：由 Project/css/command.css 迁入组件（选择器为全局 id，不能用 scoped） */
#stopActorAnimation {
	width: 324px;
	height: 98px;
}

#stopActorAnimation-confirm {
	right: 108px;
	bottom: 10px;
}

#stopActorAnimation-cancel {
	right: 10px;
	bottom: 10px;
}

</style>
