<template>
	<WindowFrame id="ObjectProperty-index" @confirm="onConfirm">
		<template #title
			><TitleBar
				>{{ t('components.ObjectProperty-index.title') }}
				<div class="close" /></TitleBar
		></template>

		<div class="grid-box">
			<div class="text">{{ t('components.ObjectProperty-index-name.label') }}</div>
			<TextBox
				id="ObjectProperty-index-name"
				v-tip="t('components.ObjectProperty-index-name.tip')"
				v-focus
				v-model="indexForm.name"
			/>
		</div>
	</WindowFrame>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { IndexBind, indexForm } from '@app/composables/commands/useGetObjectPropertyCommandSchema';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import TextBox from '@app/components/common/TextBox.vue';

const { t } = useI18n();

const onConfirm = () => {
	IndexBind?.confirm?.();
};

onMounted(() => {});
</script>

<style>
/* 窗口样式试点：由 Project/css/command.css 迁入组件（选择器为全局 id，不能用 scoped） */
#ObjectProperty-index {
	width: 324px;
	height: 98px;
}

#ObjectProperty-index-confirm {
	right: 108px;
	bottom: 10px;
}

#ObjectProperty-index-cancel {
	right: 10px;
	bottom: 10px;
}
</style>
