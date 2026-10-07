<template>
	<WindowFrame id="choice" :ref="registryRef(fieldEls, 'choice')" @confirm="onConfirm">
		<template #title
			><TitleBar
				>{{ t('components.choice.title') }}
				<div class="close" /></TitleBar
		></template>

		<div class="grid-box">
			<div class="text">{{ t('components.choice-content.label') }}</div>
			<TextBox
				:label="t('components.choice-content.label')"
				id="choice-content"
				:ref="registryRef(fieldEls, 'choice-content')"
				v-tip="t('components.choice-content.tip')"
				v-focus
				v-model="form.content"
				menu="tag-local-var tag-global-var tag-localization"
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
	on(fieldEls.get('choice'), 'closed', () => Choices.windowClosed?.(new Event('closed')));
});
</script>

<style>
/* 不能用 scoped：-confirm/-cancel 等元素由 WindowFrame 内部生成 */
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
