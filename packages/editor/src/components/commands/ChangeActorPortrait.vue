<template>
	<WindowFrame
		id="changeActorPortrait"
		:ref="registryRef(fieldEls, 'changeActorPortrait')"
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
				:ref="registryRef(fieldEls, 'changeActorPortrait-actor')"
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
				:ref="registryRef(fieldEls, 'changeActorPortrait-mode')"
				v-model="form.mode"
			/>
			<div class="text">{{ t('components.changeActorPortrait-portrait.label') }}</div>
			<CustomBox
				id="changeActorPortrait-portrait"
				v-tip="t('components.changeActorPortrait-portrait.tip')"
				:ref="registryRef(fieldEls, 'changeActorPortrait-portrait')"
				type="file"
				filter="image"
				v-model="form.portrait"
			/>
			<div class="text">{{ t('components.changeActorPortrait-clip.label') }}</div>
			<CustomBox
				id="changeActorPortrait-clip"
				v-tip="t('components.changeActorPortrait-clip.tip')"
				:ref="registryRef(fieldEls, 'changeActorPortrait-clip')"
				type="clip"
				image="changeActorPortrait-portrait"
				v-model="form.clip"
			/>
		</div>
	</WindowFrame>
</template>

<script setup lang="ts">
import { createElementRegistry, registryRef } from '@app/utils/element-registry';
import { composableEls } from '@app/composables/element-registry';

const fieldEls = createElementRegistry(composableEls);
import { onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useChangeActorPortraitCommandSchema } from '@app/composables/commands/useChangeActorPortraitCommandSchema';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import CustomBox from '@app/components/common/CustomBox.vue';
import SelectBox from '@app/components/common/SelectBox.vue';

const { t } = useI18n();

const { form, save } = useChangeActorPortraitCommandSchema();

const onConfirm = () => {
	save();
};

onMounted(() => {
	fieldEls.get('changeActorPortrait-mode')?.loadItems?.([
		{ name: 'Full Mode', value: 'full' },
		{ name: 'Image Mode', value: 'portrait' },
		{ name: t('command.changeActorPortrait.clip') || 'Clip Mode', value: 'clip' }
	]);
	fieldEls
		.get('changeActorPortrait-mode')
		?.enableHiddenMode?.()
		?.relate?.([
			{
				case: 'full',
				targets: [
					fieldEls.get('changeActorPortrait-portrait'),
					fieldEls.get('changeActorPortrait-clip')
				]
			},
			{
				case: 'portrait',
				targets: [fieldEls.get('changeActorPortrait-portrait')]
			},
			{ case: 'clip', targets: [fieldEls.get('changeActorPortrait-clip')] }
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
