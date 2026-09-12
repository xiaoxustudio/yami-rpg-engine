<template>
	<WindowFrame id="stopAudio" @confirm="onConfirm">
		<template #title
			><TitleBar
				>{{ t('components.stopAudio.title') }}
				<div class="close" /></TitleBar
		></template>

		<div class="grid-box">
			<div class="text">Type</div>
			<SelectBox id="stopAudio-type"
				:ref="registryRef(fieldEls, 'stopAudio-type')" v-focus v-model="form.type" />
		</div>
	</WindowFrame>
</template>

<script setup lang="ts">
import { createElementRegistry, registryRef } from '@app/utils/element-registry';

// P5b 批次 4：本组件的控件元素注册表（替代按 id 查 DOM）
const fieldEls = createElementRegistry();
import { onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useStopAudioCommandSchema } from '@app/composables/commands/useStopAudioCommandSchema';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import SelectBox from '@app/components/common/SelectBox.vue';

const { t } = useI18n();

const { form, save } = useStopAudioCommandSchema();

const onConfirm = () => {
	save();
};

onMounted(() => {
	fieldEls.get('stopAudio-type')?.loadItems?.([
		{ name: 'BGM', value: 'bgm' },
		{ name: 'BGS', value: 'bgs' },
		{ name: 'CV', value: 'cv' },
		{ name: 'SE', value: 'se' },
		{ name: 'ALL', value: 'all' }
	]);
});
</script>

<style>
/* 窗口样式试点：由 Project/css/command.css 迁入组件（选择器为全局 id，不能用 scoped） */
#stopAudio {
	width: 324px;
	height: 98px;
}

#stopAudio-confirm {
	right: 108px;
	bottom: 10px;
}

#stopAudio-cancel {
	right: 10px;
	bottom: 10px;
}

</style>
