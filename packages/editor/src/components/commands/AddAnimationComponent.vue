<template>
	<WindowFrame
		id="addAnimationComponent"
		:ref="registryRef(fieldEls, 'addAnimationComponent')"
		@confirm="onConfirm"
	>
		<template #title
			><TitleBar
				>{{ t('components.addAnimationComponent.title') }}
				<div class="close" /></TitleBar
		></template>

		<div class="grid-box">
			<div class="text">{{ t('components.addAnimationComponent-actor.label') }}</div>
			<CustomBox
				id="addAnimationComponent-actor"
				:ref="registryRef(fieldEls, 'addAnimationComponent-actor')"
				v-tip="t('components.addAnimationComponent-actor.tip')"
				v-focus
				type="actor"
				v-model="form.actor"
			/>
			<div class="text">{{ t('components.addAnimationComponent-animationId.label') }}</div>
			<CustomBox
				id="addAnimationComponent-animationId"
				:ref="registryRef(fieldEls, 'addAnimationComponent-animationId')"
				v-tip="t('components.addAnimationComponent-animationId.tip')"
				type="file"
				filter="animation"
				v-model="form.animationId"
				@write="onWrite"
			/>
			<div class="text">{{ t('components.addAnimationComponent-motion.label') }}</div>
			<SelectBox
				:label="t('components.addAnimationComponent-motion.label')"
				id="addAnimationComponent-motion"
				:ref="registryRef(fieldEls, 'addAnimationComponent-motion')"
				v-tip="t('components.addAnimationComponent-motion.tip')"
				v-model="form.motion"
			/>
			<div class="text">{{ t('components.addAnimationComponent-rotatable.label') }}</div>
			<SelectBox
				:label="t('components.addAnimationComponent-rotatable.label')"
				id="addAnimationComponent-rotatable"
				v-tip="t('components.addAnimationComponent-rotatable.tip')"
				:ref="registryRef(fieldEls, 'addAnimationComponent-rotatable')"
				v-model="form.rotatable"
			/>
			<div class="text">{{ t('components.addAnimationComponent-syncAngle.label') }}</div>
			<SelectBox
				:label="t('components.addAnimationComponent-syncAngle.label')"
				id="addAnimationComponent-syncAngle"
				v-tip="t('components.addAnimationComponent-syncAngle.tip')"
				:ref="registryRef(fieldEls, 'addAnimationComponent-syncAngle')"
				v-model="form.syncAngle"
			/>
			<div class="text">{{ t('components.addAnimationComponent-priority.label') }}</div>
			<NumberBox
				:label="t('components.addAnimationComponent-priority.label')"
				id="addAnimationComponent-priority"
				:ref="registryRef(fieldEls, 'addAnimationComponent-priority')"
				v-tip="t('components.addAnimationComponent-priority.tip')"
				min="-100"
				max="100"
				v-model="priority"
			/>
			<div class="text">{{ t('components.addAnimationComponent-offsetY.label') }}</div>
			<NumberBox
				:label="t('components.addAnimationComponent-offsetY.label')"
				id="addAnimationComponent-offsetY"
				:ref="registryRef(fieldEls, 'addAnimationComponent-offsetY')"
				v-tip="t('components.addAnimationComponent-offsetY.tip')"
				min="-100"
				max="100"
				unit="px"
				v-model="offsetY"
			/>
		</div>
	</WindowFrame>
</template>

<script setup lang="ts">
import { useLocalizedOptions } from '@app/composables/useLocalizedOptions';
import { createElementRegistry, registryRef } from '@app/utils/element-registry';
import { composableEls } from '@app/composables/element-registry';

const fieldEls = createElementRegistry(composableEls);
import { computed, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useAddAnimationComponentCommandSchema } from '@app/composables/commands/useAddAnimationComponentCommandSchema';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import CustomBox from '@app/components/common/CustomBox.vue';
import NumberBox from '@app/components/common/NumberBox.vue';
import SelectBox from '@app/components/common/SelectBox.vue';

const { t } = useI18n();

const { form, save, writeHandler } = useAddAnimationComponentCommandSchema();

const priority = computed({
	get: () => form.priority as number | string,
	set: (value) => {
		form.priority = value;
	}
});
const offsetY = computed({
	get: () => form.offsetY as number | string,
	set: (value) => {
		form.offsetY = value;
	}
});

const onWrite = (value: unknown) => {
	writeHandler({ value: value as string });
};

const onConfirm = () => {
	save();
};

onMounted(() => {
	useLocalizedOptions('addAnimationComponent-rotatable', [true, false], (items) =>
		fieldEls.get('addAnimationComponent-rotatable')?.loadItems?.(items)
	);
	useLocalizedOptions('addAnimationComponent-syncAngle', [true, false], (items) =>
		fieldEls.get('addAnimationComponent-syncAngle')?.loadItems?.(items)
	);
});
</script>

<style>
#addAnimationComponent {
	width: 324px;
	height: 242px;
}

#addAnimationComponent-confirm {
	right: 108px;
	bottom: 10px;
}

#addAnimationComponent-cancel {
	right: 10px;
	bottom: 10px;
}
</style>
