<template>
	<WindowFrame id="jumpTo" @confirm="onConfirm">
		<template #title
			><TitleBar
				>{{ t('components.jumpTo.title') }}
				<div class="close" /></TitleBar
		></template>

		<div class="grid-box">
			<div class="text">{{ t('components.jumpTo-operation.label') }}</div>
			<SelectBox id="jumpTo-operation"
				v-tip="t('components.jumpTo-operation.tip')"
				:ref="registryRef(fieldEls, 'jumpTo-operation')" v-focus v-model="form.operation" />
			<div class="text">{{ t('components.jumpTo-label.label') }}</div>
			<TextBox id="jumpTo-label"
				v-tip="t('components.jumpTo-label.tip')"
				:ref="registryRef(fieldEls, 'jumpTo-label')" v-focus v-model="label" />
		</div>
	</WindowFrame>
</template>

<script setup lang="ts">
import { createElementRegistry, registryRef } from '@app/utils/element-registry';

// P5b 批次 4：本组件的控件元素注册表（替代按 id 查 DOM）
const fieldEls = createElementRegistry();
import { computed, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { TextSuggestion, type TextSuggestionTarget } from '@app/commands/text-tip.ts';
import { useJumpToCommandSchema } from '@app/composables/commands/useJumpToCommandSchema';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import TextBox from '@app/components/common/TextBox.vue';
import SelectBox from '@app/components/common/SelectBox.vue';

const { t } = useI18n();

const { form, save, loadLabels } = useJumpToCommandSchema();

const label = computed({
	get: () => form.label as string,
	set: (value) => {
		form.label = value;
	}
});

const onConfirm = () => {
	save();
};

onMounted(() => {
	TextSuggestion.listen!(fieldEls.get('jumpTo-label') as unknown as TextSuggestionTarget, loadLabels);
	fieldEls.get('jumpTo-operation')?.loadItems?.([
		{ name: 'Jump to Label', value: 'jump' },
		{ name: 'Save and Jump to Label', value: 'save-jump' },
		{ name: 'Jump to the Saved Location', value: 'return' }
	]);
	fieldEls.get('jumpTo-operation')
		?.enableHiddenMode?.()
		?.relate?.([{ case: ['jump', 'save-jump'], targets: [fieldEls.get('jumpTo-label')] }]);
});
</script>

<style>
/* 窗口样式试点：由 Project/css/command.css 迁入组件（选择器为全局 id，不能用 scoped） */
#jumpTo {
	width: 324px;
	height: 122px;
}

#jumpTo-confirm {
	right: 108px;
	bottom: 10px;
}

#jumpTo-cancel {
	right: 10px;
	bottom: 10px;
}

</style>
