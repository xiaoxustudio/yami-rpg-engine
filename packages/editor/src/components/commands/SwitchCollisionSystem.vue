<template>
	<WindowFrame id="switchCollisionSystem"
				:ref="registryRef(fieldEls, 'switchCollisionSystem')" @confirm="onConfirm">
		<template #title
			><TitleBar
				>{{ t('components.switchCollisionSystem.title') }}
				<div class="close" /></TitleBar
		></template>

		<div class="grid-box">
			<div class="text">{{ t('components.switchCollisionSystem-operation.label') }}</div>
			<SelectBox id="switchCollisionSystem-operation"
				v-tip="t('components.switchCollisionSystem-operation.tip')"
				:ref="registryRef(fieldEls, 'switchCollisionSystem-operation')" v-focus v-model="form.operation" />
		</div>
	</WindowFrame>
</template>

<script setup lang="ts">
import { createElementRegistry, registryRef } from '@app/utils/element-registry';
import { composableEls } from '@app/composables/element-registry';

// P5b 批次 4：本组件的控件元素注册表（替代按 id 查 DOM）
const fieldEls = createElementRegistry(composableEls);
import { onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useSwitchCollisionSystemCommandSchema } from '@app/composables/commands/useSwitchCollisionSystemCommandSchema';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import SelectBox from '@app/components/common/SelectBox.vue';

const { t } = useI18n();

const { form, save } = useSwitchCollisionSystemCommandSchema();

const onConfirm = () => {
	save();
};

onMounted(() => {
	fieldEls.get('switchCollisionSystem-operation')?.loadItems?.([
		{ name: 'Enable Actor Collision', value: 'enable-actor-collision' },
		{ name: 'Disable Actor Collision', value: 'disable-actor-collision' },
		{ name: 'Enable Scene Collision', value: 'enable-scene-collision' },
		{ name: 'Disable Scene Collision', value: 'disable-scene-collision' }
	]);
});
</script>

<style>
/* 窗口样式试点：由 Project/css/command.css 迁入组件（选择器为全局 id，不能用 scoped） */
#switchCollisionSystem {
	width: 324px;
	height: 98px;
}

#switchCollisionSystem-confirm {
	right: 108px;
	bottom: 10px;
}

#switchCollisionSystem-cancel {
	right: 10px;
	bottom: 10px;
}

</style>
