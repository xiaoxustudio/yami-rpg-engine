<template>
	<WindowFrame
		id="playActorAnimation"
		:ref="controlRef('playActorAnimation')"
		@confirm="onConfirm"
	>
		<template #title
			><TitleBar
				>{{ t('components.playActorAnimation.title') }}
				<div class="close" /></TitleBar
		></template>

		<div class="grid-box">
			<div class="text">{{ t('components.playActorAnimation-actor.label') }}</div>
			<CustomBox
				id="playActorAnimation-actor"
				:ref="controlRef('playActorAnimation-actor')"
				v-tip="t('components.playActorAnimation-actor.tip')"
				v-focus
				type="actor"
				v-model="form.actor"
			/>
			<div class="text">{{ t('components.playActorAnimation-motion.label') }}</div>
			<CustomBox
				id="playActorAnimation-motion"
				:ref="controlRef('playActorAnimation-motion')"
				v-tip="t('components.playActorAnimation-motion.tip')"
				type="enum-string"
				v-model="form.motion"
			/>
			<div class="text">{{ t('components.playActorAnimation-speed.label') }}</div>
			<NumberVar
				id="playActorAnimation-speed"
				:ref="controlRef('playActorAnimation-speed')"
				v-tip="t('components.playActorAnimation-speed.tip')"
				min="0.1"
				max="10"
				step="0.1"
				decimals="4"
				v-model="form.speed"
			/>
			<div class="text">{{ t('components.playActorAnimation-wait.label') }}</div>
			<SelectBox
				:label="t('components.playActorAnimation-wait.label')"
				id="playActorAnimation-wait"
				:ref="controlRef('playActorAnimation-wait')"
				name="wait"
				v-model="form.wait"
			/>
		</div>
	</WindowFrame>
</template>

<script setup lang="ts">
import { useLocalizedOptions } from '@app/composables/useLocalizedOptions';
import { onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { usePlayActorAnimationCommandSchema } from '@app/composables/commands/usePlayActorAnimationCommandSchema';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import CustomBox from '@app/components/common/CustomBox.vue';
import NumberVar from '@app/components/common/NumberVar.vue';
import SelectBox from '@app/components/common/SelectBox.vue';
import { useControlRefs } from '@app/composables/control-refs';

/** 控件 id 联合：模板与脚本共用，拼错在 tsc / vue-tsc 就红。 */
type Id =
	| 'playActorAnimation'
	| 'playActorAnimation-actor'
	| 'playActorAnimation-motion'
	| 'playActorAnimation-speed'
	| 'playActorAnimation-wait';

const { controls, controlRef } = useControlRefs<Id>();

const { t } = useI18n();

const { form, save } = usePlayActorAnimationCommandSchema();

const onConfirm = () => {
	save();
};

onMounted(() => {
	useLocalizedOptions('playActorAnimation-wait', [true, false], (items) =>
		controls['playActorAnimation-wait']?.loadItems?.(items)
	);
});
</script>

<style>
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
