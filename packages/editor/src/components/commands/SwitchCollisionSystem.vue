<template>
	<WindowFrame id="switchCollisionSystem" @confirm="onConfirm">
		<template #title
			><TitleBar
				>{{ t('components.switchCollisionSystem.title') }}
				<div class="close" /></TitleBar
		></template>

		<div class="grid-box">
			<div class="text">{{ t('components.switchCollisionSystem-operation.label') }}</div>
			<SelectBox
				:label="t('components.switchCollisionSystem-operation.label')"
				id="switchCollisionSystem-operation"
				v-tip="t('components.switchCollisionSystem-operation.tip')"
				ref="switchCollisionSystemOperationBox"
				v-focus
				v-model="form.operation"
			/>
		</div>
	</WindowFrame>
</template>

<script setup lang="ts">
import { useLocalizedOptions } from '@app/composables/useLocalizedOptions';
import { onMounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useSwitchCollisionSystemCommandSchema } from '@app/composables/commands/useSwitchCollisionSystemCommandSchema';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import SelectBox from '@app/components/common/SelectBox.vue';

// 控件用模板 ref（组件 defineExpose），不再注册进 ElementRegistry。
const switchCollisionSystemOperationBox = ref<InstanceType<typeof SelectBox> | null>(null);

const { t } = useI18n();

const { form, save } = useSwitchCollisionSystemCommandSchema();

const onConfirm = () => {
	save();
};

onMounted(() => {
	useLocalizedOptions(
		'switchCollisionSystem-operation',
		[
			'enable-actor-collision',
			'disable-actor-collision',
			'enable-scene-collision',
			'disable-scene-collision'
		],
		(items) => switchCollisionSystemOperationBox.value?.loadItems?.(items)
	);
});
</script>

<style>
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
