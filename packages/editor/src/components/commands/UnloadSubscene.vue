<template>
	<WindowFrame id="unloadSubscene" @confirm="onConfirm">
		<template #title
			><TitleBar
				>{{ t('components.unloadSubscene.title') }}
				<div class="close" /></TitleBar
		></template>

		<div class="grid-box">
			<div class="text">Scene</div>
			<FileVar
				id="unloadSubscene-sceneId"
				v-tip="t('components.unloadSubscene-sceneId.tip')"
				v-focus
				type="file"
				filter="scene"
				v-model="form.sceneId"
			/>
		</div>
	</WindowFrame>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import { useUnloadSubsceneCommandSchema } from '@app/composables/commands/useUnloadSubsceneCommandSchema';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import FileVar from '@app/components/common/FileVar.vue';

const { t } = useI18n();

const { form, save } = useUnloadSubsceneCommandSchema();

const onConfirm = () => {
	save();
};
</script>

<style>
/* 窗口样式试点：由 Project/css/command.css 迁入组件（选择器为全局 id，不能用 scoped） */
#unloadSubscene {
	width: 324px;
	height: 98px;
}

#unloadSubscene-confirm {
	right: 108px;
	bottom: 10px;
}

#unloadSubscene-cancel {
	right: 10px;
	bottom: 10px;
}

</style>
