<template>
	<WindowFrame id="loadSubscene" @confirm="onConfirm">
		<template #title
			><TitleBar
				>{{ t('components.loadSubscene.title') }}
				<div class="close" /></TitleBar
		></template>

		<div class="grid-box">
			<div class="text">Scene</div>
			<FileVar id="loadSubscene-sceneId" v-focus type="file" filter="scene" v-model="form.sceneId" />
			<div class="text">Shift X</div>
			<NumberVar id="loadSubscene-shiftX" min="0" max="512" v-model="form.shiftX" />
			<div class="text">Shift Y</div>
			<NumberVar id="loadSubscene-shiftY" min="0" max="512" v-model="form.shiftY" />
		</div>
	</WindowFrame>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import { useLoadSubsceneCommandSchema } from '@app/composables/commands/useLoadSubsceneCommandSchema';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import FileVar from '@app/components/common/FileVar.vue';
import NumberVar from '@app/components/common/NumberVar.vue';

const { t } = useI18n();

const { form, save } = useLoadSubsceneCommandSchema();

const onConfirm = () => {
	save();
};
</script>

<style>
/* 窗口样式试点：由 Project/css/command.css 迁入组件（选择器为全局 id，不能用 scoped） */
#loadSubscene {
	width: 324px;
	height: 146px;
}

#loadSubscene-confirm {
	right: 108px;
	bottom: 10px;
}

#loadSubscene-cancel {
	right: 10px;
	bottom: 10px;
}

</style>
