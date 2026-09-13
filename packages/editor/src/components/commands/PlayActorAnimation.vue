<template>
	<WindowFrame id="playActorAnimation"
				:ref="registryRef(fieldEls, 'playActorAnimation')" @confirm="onConfirm">
		<template #title
			><TitleBar
				>{{ t('components.playActorAnimation.title') }}
				<div class="close" /></TitleBar
		></template>

		<div class="grid-box">
			<div class="text">{{ t('components.playActorAnimation-actor.label') }}</div>
			<CustomBox id="playActorAnimation-actor"
				:ref="registryRef(fieldEls, 'playActorAnimation-actor')"
				v-tip="t('components.playActorAnimation-actor.tip')" v-focus type="actor" v-model="form.actor" />
			<div class="text">{{ t('components.playActorAnimation-motion.label') }}</div>
			<CustomBox id="playActorAnimation-motion"
				:ref="registryRef(fieldEls, 'playActorAnimation-motion')"
				v-tip="t('components.playActorAnimation-motion.tip')" type="enum-string" v-model="form.motion" />
			<div class="text">{{ t('components.playActorAnimation-speed.label') }}</div>
			<NumberVar
				id="playActorAnimation-speed"
				:ref="registryRef(fieldEls, 'playActorAnimation-speed')"
				v-tip="t('components.playActorAnimation-speed.tip')"
				min="0.1"
				max="10"
				step="0.1"
				decimals="4"
				v-model="form.speed"
			/>
			<div class="text">{{ t('components.playActorAnimation-wait.label') }}</div>
			<SelectBox id="playActorAnimation-wait"
				:ref="registryRef(fieldEls, 'playActorAnimation-wait')" name="wait" v-model="form.wait" />
		</div>
	</WindowFrame>
</template>

<script setup lang="ts">
import { useLocalizedOptions } from '@app/composables/useLocalizedOptions';
import { createElementRegistry, registryRef } from '@app/utils/element-registry';
import { composableEls } from '@app/composables/element-registry';

// P5b 批次 4：本组件的控件元素注册表（替代按 id 查 DOM）
const fieldEls = createElementRegistry(composableEls);
import { onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { usePlayActorAnimationCommandSchema } from '@app/composables/commands/usePlayActorAnimationCommandSchema';
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
	useLocalizedOptions('playActorAnimation-wait', [true, false], (items) =>
		fieldEls.get('playActorAnimation-wait')?.loadItems?.(items)
	);
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
