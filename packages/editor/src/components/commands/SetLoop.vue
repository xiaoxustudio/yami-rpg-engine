<template>
	<WindowFrame id="setLoop" @confirm="onConfirm">
		<template #title
			><TitleBar
				>{{ t('components.setLoop.title') }}
				<div class="close" /></TitleBar
		></template>

		<div class="grid-box">
			<div class="text">Type</div>
			<SelectBox id="setLoop-type" v-focus v-model="form.type" />
			<div class="text">Loop</div>
			<SelectBox id="setLoop-loop" v-model="form.loop" />
		</div>
	</WindowFrame>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useSetLoopCommandSchema } from '@app/composables/commands/useSetLoopCommandSchema';
import { $ } from '@app/utils/dom';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import SelectBox from '@app/components/common/SelectBox.vue';

const { t } = useI18n();

const { form, save } = useSetLoopCommandSchema();

const onConfirm = () => {
	save();
};

onMounted(() => {
	$('#setLoop-type')?.loadItems?.([
		{ name: 'BGM', value: 'bgm' },
		{ name: 'BGS', value: 'bgs' },
		{ name: 'CV', value: 'cv' }
	]);
	$('#setLoop-loop')?.loadItems?.([
		{ name: t('command.setLoop.once') || 'Once', value: false },
		{ name: t('command.setLoop.loop') || 'Loop', value: true }
	]);
});
</script>

<style>
/* 窗口样式试点：由 Project/css/command.css 迁入组件（选择器为全局 id，不能用 scoped） */
#setLoop {
	width: 324px;
	height: 122px;
}

#setLoop-confirm {
	right: 108px;
	bottom: 10px;
}

#setLoop-cancel {
	right: 10px;
	bottom: 10px;
}

</style>
