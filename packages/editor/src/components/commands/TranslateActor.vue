<template>
	<WindowFrame
		id="translateActor"
		:ref="registryRef(fieldEls, 'translateActor')"
		@confirm="onConfirm"
		@open="onWindowOpen"
	>
		<template #title
			><TitleBar
				>{{ t('components.translateActor.title') }}
				<div class="close" /></TitleBar
		></template>

		<div class="grid-box">
			<div class="text">{{ t('components.translateActor-actor.label') }}</div>
			<CustomBox
				id="translateActor-actor"
				:ref="registryRef(fieldEls, 'translateActor-actor')"
				v-tip="t('components.translateActor-actor.tip')"
				v-focus
				type="actor"
				v-model="form.actor"
			/>
			<div class="text">{{ t('components.translateActor-angle.label') }}</div>
			<CustomBox
				id="translateActor-angle"
				:ref="registryRef(fieldEls, 'translateActor-angle')"
				v-tip="t('components.translateActor-angle.tip')"
				type="angle"
				v-model="form.angle"
			/>
			<div class="text">{{ t('components.translateActor-distance.label') }}</div>
			<NumberVar
				id="translateActor-distance"
				:ref="registryRef(fieldEls, 'translateActor-distance')"
				v-tip="t('components.translateActor-distance.tip')"
				v-focus
				min="0"
				max="512"
				decimals="4"
				unit="tile"
				v-model="form.distance"
			/>
			<div class="text">{{ t('components.translateActor-easingId.label') }}</div>
			<SelectBox
				:label="t('components.translateActor-easingId.label')"
				id="translateActor-easingId"
				:ref="registryRef(fieldEls, 'translateActor-easingId')"
				name="easing"
				v-model="form.easingId"
			/>
			<div class="text">{{ t('components.translateActor-duration.label') }}</div>
			<NumberVar
				id="translateActor-duration"
				:ref="registryRef(fieldEls, 'translateActor-duration')"
				name="duration"
				min="0"
				max="3600000"
				unit="ms"
				v-model="form.duration"
			/>
			<div class="text">{{ t('components.translateActor-wait.label') }}</div>
			<SelectBox
				:label="t('components.translateActor-wait.label')"
				id="translateActor-wait"
				:ref="registryRef(fieldEls, 'translateActor-wait')"
				name="wait"
				v-model="form.wait"
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
import { useTranslateActorCommandSchema } from '@app/composables/commands/useTranslateActorCommandSchema';
import { Data } from '@app/data/data-object.ts';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import CustomBox from '@app/components/common/CustomBox.vue';
import NumberVar from '@app/components/common/NumberVar.vue';
import SelectBox from '@app/components/common/SelectBox.vue';

const { t } = useI18n();

const { form, save } = useTranslateActorCommandSchema();

const onConfirm = () => {
	save();
};

/** 窗口打开时刷新候选项。 */
const onWindowOpen = () => {
	fieldEls.get('translateActor-easingId')?.loadItems?.(Data.createEasingItems!());
};

onMounted(() => {
	useLocalizedOptions('translateActor-wait', [true, false], (items) =>
		fieldEls.get('translateActor-wait')?.loadItems?.(items)
	);
});
</script>

<style>
#translateActor {
	width: 324px;
	height: 218px;
}

#translateActor-confirm {
	right: 108px;
	bottom: 10px;
}

#translateActor-cancel {
	right: 10px;
	bottom: 10px;
}
</style>
