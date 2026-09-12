<template>
	<WindowFrame id="changeActorMotion" @confirm="onConfirm">
		<template #title
			><TitleBar
				>{{ t('components.changeActorMotion.title') }}
				<div class="close" /></TitleBar
		></template>

		<div class="grid-box">
			<div class="text">Actor</div>
			<CustomBox id="changeActorMotion-actor"
				v-tip="t('components.changeActorMotion-actor.tip')" v-focus type="actor" v-model="form.actor" />
			<div class="text">Type</div>
			<SelectBox id="changeActorMotion-type"
				v-tip="t('components.changeActorMotion-type.tip')"
				:ref="registryRef(fieldEls, 'changeActorMotion-type')" v-model="form.type" />
			<div class="text">Motion</div>
			<CustomBox id="changeActorMotion-motion"
				v-tip="t('components.changeActorMotion-motion.tip')" type="enum-string" v-model="form.motion" />
		</div>
	</WindowFrame>
</template>

<script setup lang="ts">
import { createElementRegistry, registryRef } from '@app/utils/element-registry';

// P5b 批次 4：本组件的控件元素注册表（替代按 id 查 DOM）
const fieldEls = createElementRegistry();
import { onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useChangeActorMotionCommandSchema } from '@app/composables/commands/useChangeActorMotionCommandSchema';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import CustomBox from '@app/components/common/CustomBox.vue';
import SelectBox from '@app/components/common/SelectBox.vue';

const { t } = useI18n();

const { form, save } = useChangeActorMotionCommandSchema();

const onConfirm = () => {
	save();
};

onMounted(() => {
	fieldEls.get('changeActorMotion-type')?.loadItems?.([
		{ name: t('command.changeActorMotion.type.idle') || 'Idle', value: 'idle' },
		{ name: t('command.changeActorMotion.type.move') || 'Move', value: 'move' }
	]);
});
</script>

<style>
/* 窗口样式试点：由 Project/css/command.css 迁入组件（选择器为全局 id，不能用 scoped） */
#changeActorMotion {
	width: 324px;
	height: 146px;
}

#changeActorMotion-confirm {
	right: 108px;
	bottom: 10px;
}

#changeActorMotion-cancel {
	right: 10px;
	bottom: 10px;
}

</style>
