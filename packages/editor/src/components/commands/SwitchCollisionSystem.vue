<template>
	<WindowFrame
		id="switchCollisionSystem"
		:ref="registryRef(fieldEls, 'switchCollisionSystem')"
		@confirm="onConfirm"
	>
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
				:ref="registryRef(fieldEls, 'switchCollisionSystem-operation')"
				v-focus
				v-model="form.operation"
			/>
		</div>
	</WindowFrame>
</template>

<script setup lang="ts">
import { useLocalizedOptions } from '@app/composables/useLocalizedOptions';
import { createElementRegistry, registryRef } from '@app/utils/element-registry';
import { composableEls } from '@app/composables/element-registry';

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
	useLocalizedOptions(
		'switchCollisionSystem-operation',
		[
			'enable-actor-collision',
			'disable-actor-collision',
			'enable-scene-collision',
			'disable-scene-collision'
		],
		(items) => fieldEls.get('switchCollisionSystem-operation')?.loadItems?.(items)
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
