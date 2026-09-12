<template>
	<WindowFrame id="changeActorPortrait" @confirm="onConfirm">
		<template #title
			><TitleBar
				>{{ t('components.changeActorPortrait.title') }}
				<div class="close" /></TitleBar
		></template>

		<div class="grid-box">
			<div class="text">Actor</div>
			<CustomBox id="changeActorPortrait-actor" v-focus type="actor" v-model="form.actor" />
			<div class="text">Mode</div>
			<SelectBox id="changeActorPortrait-mode"
				:ref="registryRef(fieldEls, 'changeActorPortrait-mode')" v-model="form.mode" />
			<div class="text">Portrait</div>
			<CustomBox
				id="changeActorPortrait-portrait"
				:ref="registryRef(fieldEls, 'changeActorPortrait-portrait')"
				type="file"
				filter="image"
				v-model="form.portrait"
			/>
			<div class="text">Clip</div>
			<CustomBox
				id="changeActorPortrait-clip"
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

// P5b 批次 4：本组件的控件元素注册表（替代按 id 查 DOM）
const fieldEls = createElementRegistry();
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
	fieldEls.get('changeActorPortrait-mode')
		?.enableHiddenMode?.()
		?.relate?.([
			{
				case: 'full',
				targets: [fieldEls.get('changeActorPortrait-portrait'), fieldEls.get('changeActorPortrait-clip')]
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
/* 窗口样式试点：由 Project/css/command.css 迁入组件（选择器为全局 id，不能用 scoped） */
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
