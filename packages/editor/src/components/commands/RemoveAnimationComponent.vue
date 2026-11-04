<template>
	<WindowFrame
		id="removeAnimationComponent"
		:ref="controlRef('removeAnimationComponent')"
		@confirm="onConfirm"
	>
		<template #title
			><TitleBar
				>{{ t('components.removeAnimationComponent.title') }}
				<div class="close" /></TitleBar
		></template>

		<div class="grid-box">
			<div class="text">{{ t('components.removeAnimationComponent-actor.label') }}</div>
			<CustomBox
				id="removeAnimationComponent-actor"
				:ref="controlRef('removeAnimationComponent-actor')"
				v-tip="t('components.removeAnimationComponent-actor.tip')"
				v-focus
				type="actor"
				v-model="form.actor"
			/>
			<div class="text">{{ t('components.removeAnimationComponent-animationId.label') }}</div>
			<CustomBox
				id="removeAnimationComponent-animationId"
				:ref="controlRef('removeAnimationComponent-animationId')"
				v-tip="t('components.removeAnimationComponent-animationId.tip')"
				type="file"
				filter="animation"
				v-model="form.animationId"
				@write="onWrite"
			/>
			<div class="text">{{ t('components.removeAnimationComponent-motion.label') }}</div>
			<SelectBox
				:label="t('components.removeAnimationComponent-motion.label')"
				id="removeAnimationComponent-motion"
				:ref="controlRef('removeAnimationComponent-motion')"
				v-tip="t('components.removeAnimationComponent-motion.tip')"
				v-model="form.motion"
			/>
		</div>
	</WindowFrame>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRemoveAnimationComponentCommandSchema } from '@app/composables/commands/useRemoveAnimationComponentCommandSchema';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import CustomBox from '@app/components/common/CustomBox.vue';
import SelectBox from '@app/components/common/SelectBox.vue';
import { useControlRefs } from '@app/composables/control-refs';
import {
	provideRemoveAnimationComponentBridge,
	resetRemoveAnimationComponentBridge,
	type RemoveAnimationComponentBridge
} from '@app/composables/remove-animation-component-bridge';

/** 控件 id 联合：模板与脚本共用，拼错在 tsc / vue-tsc 就红。 */
type Id =
	| 'removeAnimationComponent-actor'
	| 'removeAnimationComponent-animationId'
	| 'removeAnimationComponent-motion'
	| 'removeAnimationComponent';

const { controls, controlRef } = useControlRefs<Id>();

const { t } = useI18n();

const { form, save, writeHandler } = useRemoveAnimationComponentCommandSchema();

const onWrite = (value: unknown) => {
	writeHandler({ value: value as string });
};

const onConfirm = () => {
	save();
};

/** 控件级能力：schema 换候选项后要回写旧值（`write2` 只改值不派发 input）。 */
const bridgeApi: RemoveAnimationComponentBridge = {
	reloadMotion: (items) => {
		controls['removeAnimationComponent-motion']?.loadItems?.(items);
		controls['removeAnimationComponent-motion']?.write2?.(
			controls['removeAnimationComponent-motion']?.read?.() as string
		);
	}
};

onMounted(() => {
	provideRemoveAnimationComponentBridge(bridgeApi);
	onUnmounted(() => resetRemoveAnimationComponentBridge(bridgeApi));
});
</script>

<style>
#removeAnimationComponent {
	width: 324px;
	height: 146px;
}

#removeAnimationComponent-confirm {
	right: 108px;
	bottom: 10px;
}

#removeAnimationComponent-cancel {
	right: 10px;
	bottom: 10px;
}
</style>
