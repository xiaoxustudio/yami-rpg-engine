<template>
	<WindowFrame id="changeActorAnimation" @confirm="onConfirm">
		<template #title
			><TitleBar
				>{{ t('components.changeActorAnimation.title') }}
				<div class="close" /></TitleBar
		></template>

		<div class="grid-box">
			<div class="text">Actor</div>
			<CustomBox id="changeActorAnimation-actor"
				v-tip="t('components.changeActorAnimation-actor.tip')" v-focus type="actor" v-model="form.actor" />
			<div class="text">Animation</div>
			<CustomBox
				id="changeActorAnimation-animationId"
				v-tip="t('components.changeActorAnimation-animationId.tip')"
				type="file"
				filter="animation"
				v-model="form.animationId"
			/>
		</div>
	</WindowFrame>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import { useChangeActorAnimationCommandSchema } from '@app/composables/commands/useChangeActorAnimationCommandSchema';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import CustomBox from '@app/components/common/CustomBox.vue';

const { t } = useI18n();

const { form, save } = useChangeActorAnimationCommandSchema();

const onConfirm = () => {
	save();
};
</script>

<style>
/* 窗口样式试点：由 Project/css/command.css 迁入组件（选择器为全局 id，不能用 scoped） */
#changeActorAnimation {
	width: 324px;
	height: 122px;
}

#changeActorAnimation-confirm {
	right: 108px;
	bottom: 10px;
}

#changeActorAnimation-cancel {
	right: 10px;
	bottom: 10px;
}

</style>
