<template>
	<WindowFrame
		id="changeActorPortrait"
		:ref="controlRef('changeActorPortrait')"
		@confirm="onConfirm"
	>
		<template #title
			><TitleBar
				>{{ t('components.changeActorPortrait.title') }}
				<div class="close" /></TitleBar
		></template>

		<div class="grid-box">
			<div class="text">{{ t('components.changeActorPortrait-actor.label') }}</div>
			<CustomBox
				id="changeActorPortrait-actor"
				:ref="controlRef('changeActorPortrait-actor')"
				v-tip="t('components.changeActorPortrait-actor.tip')"
				v-focus
				type="actor"
				v-model="form.actor"
			/>
			<div class="text">{{ t('components.changeActorPortrait-mode.label') }}</div>
			<SelectBox
				:label="t('components.changeActorPortrait-mode.label')"
				id="changeActorPortrait-mode"
				v-tip="t('components.changeActorPortrait-mode.tip')"
				:ref="controlRef('changeActorPortrait-mode')"
				v-model="form.mode"
			/>
			<div class="text">{{ t('components.changeActorPortrait-portrait.label') }}</div>
			<CustomBox
				id="changeActorPortrait-portrait"
				v-tip="t('components.changeActorPortrait-portrait.tip')"
				:ref="controlRef('changeActorPortrait-portrait')"
				type="file"
				filter="image"
				v-model="form.portrait"
			/>
			<div class="text">{{ t('components.changeActorPortrait-clip.label') }}</div>
			<CustomBox
				id="changeActorPortrait-clip"
				v-tip="t('components.changeActorPortrait-clip.tip')"
				:ref="controlRef('changeActorPortrait-clip')"
				type="clip"
				image="changeActorPortrait-portrait"
				v-model="form.clip"
			/>
		</div>
	</WindowFrame>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useChangeActorPortraitCommandSchema } from '@app/composables/commands/useChangeActorPortraitCommandSchema';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import CustomBox from '@app/components/common/CustomBox.vue';
import SelectBox from '@app/components/common/SelectBox.vue';
import { controlRoot, useControlRefs } from '@app/composables/control-refs';

/** 控件 id 联合：模板与脚本共用，拼错在 tsc / vue-tsc 就红。 */
type Id =
	| 'changeActorPortrait'
	| 'changeActorPortrait-actor'
	| 'changeActorPortrait-clip'
	| 'changeActorPortrait-mode'
	| 'changeActorPortrait-portrait';

const { controls, controlRef } = useControlRefs<Id>();

const { t } = useI18n();

const { form, save } = useChangeActorPortraitCommandSchema();

const onConfirm = () => {
	save();
};

onMounted(() => {
	controls['changeActorPortrait-mode']?.loadItems?.([
		{ name: 'Full Mode', value: 'full' },
		{ name: 'Image Mode', value: 'portrait' },
		{ name: t('command.changeActorPortrait.clip') || 'Clip Mode', value: 'clip' }
	]);
	controls['changeActorPortrait-mode']?.enableHiddenMode?.();
	controls['changeActorPortrait-mode']?.relate?.([
		{
			case: 'full',
			targets: [
				controlRoot(controls['changeActorPortrait-portrait']),
				controlRoot(controls['changeActorPortrait-clip'])
			]
		},
		{
			case: 'portrait',
			targets: [controlRoot(controls['changeActorPortrait-portrait'])]
		},
		{ case: 'clip', targets: [controlRoot(controls['changeActorPortrait-clip'])] }
	]);
});
</script>

<style>
#changeActorPortrait {
	width: 324px;
	height: 170px;
}

#changeActorPortrait-confirm {
	right: 108px;
	bottom: 10px;
}

#changeActorPortrait-cancel {
	right: 10px;
	bottom: 10px;
}
</style>
