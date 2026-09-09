<template>
	<WindowFrame id="choice" @confirm="onConfirm">
		<template #title
			><TitleBar
				>{{ t('components.choice.title') }}
				<div class="close" /></TitleBar
		></template>

		<div class="grid-box">
			<div class="text">{{ t('components.choice-content.label') }}</div>
			<TextBox
				id="choice-content"
				v-focus
				v-model="form.content"
				menu="tag-local-var tag-global-var tag-localization"
			/>
		</div>
	</WindowFrame>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { $ } from '@app/utils/dom';
import { on } from '@app/utils/element-utils.ts';
import { useChoicesSchema } from '@app/composables/useChoicesSchema';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import TextBox from '@app/components/common/TextBox.vue';

const Choices = useChoicesSchema();

const { t } = useI18n();

const form = Choices.form;

const onConfirm = () => {
	Choices?.confirm?.(new Event('click'));
};

onMounted(() => {
	on($('#choice'), 'closed', () => Choices.windowClosed?.(new Event('closed')));
	on($('#choice-confirm'), 'click', () => Choices.confirm?.(new Event('click')));
});
</script>

<style>
/* 窗口样式迁移：由 Project/css/dialogs.css 迁入组件（选择器为全局 id，不能用 scoped） */
#choice {
	width: 400px;
	height: 98px;
}

#choice-confirm {
	right: 108px;
	bottom: 10px;
}

#choice-cancel {
	right: 10px;
	bottom: 10px;
}
</style>

