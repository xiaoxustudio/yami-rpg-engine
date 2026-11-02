<template>
	<WindowFrame id="jumpTo" :ref="controlRef('jumpTo')" @confirm="onConfirm">
		<template #title
			><TitleBar
				>{{ t('components.jumpTo.title') }}
				<div class="close" /></TitleBar
		></template>

		<div class="grid-box">
			<div class="text">{{ t('components.jumpTo-operation.label') }}</div>
			<SelectBox
				:label="t('components.jumpTo-operation.label')"
				id="jumpTo-operation"
				v-tip="t('components.jumpTo-operation.tip')"
				:ref="controlRef('jumpTo-operation')"
				v-focus
				v-model="form.operation"
			/>
			<div class="text">{{ t('components.jumpTo-label.label') }}</div>
			<TextBox
				:label="t('components.jumpTo-label.label')"
				id="jumpTo-label"
				v-tip="t('components.jumpTo-label.tip')"
				:ref="controlRef('jumpTo-label')"
				v-focus
				v-model="label"
			/>
		</div>
	</WindowFrame>
</template>

<script setup lang="ts">
import { useLocalizedOptions } from '@app/composables/useLocalizedOptions';

import { computed, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { TextSuggestion, type TextSuggestionTarget } from '@app/commands/text-tip.ts';
import { useJumpToCommandSchema } from '@app/composables/commands/useJumpToCommandSchema';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import TextBox from '@app/components/common/TextBox.vue';
import SelectBox from '@app/components/common/SelectBox.vue';
import { controlRoot, useControlRefs } from '@app/composables/control-refs';

/** 控件 id 联合：模板与脚本共用，拼错在 tsc / vue-tsc 就红。 */
type Id = 'jumpTo' | 'jumpTo-label' | 'jumpTo-operation';

const { controls, controlRef } = useControlRefs<Id>();

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
	// TextSuggestion 要的是 DOM（监听 focus/blur/keydown + 读 rect），所以这里取根元素而不是控件实例。
	TextSuggestion.listen!(
		controlRoot(controls['jumpTo-label']) as TextSuggestionTarget,
		loadLabels
	);
	useLocalizedOptions('jumpTo-operation', ['jump', 'save-jump', 'return'], (items) =>
		controls['jumpTo-operation']?.loadItems?.(items)
	);
	controls['jumpTo-operation']?.enableHiddenMode?.();
	controls['jumpTo-operation']?.relate?.([
		{ case: ['jump', 'save-jump'], targets: [controlRoot(controls['jumpTo-label'])] }
	]);
});
</script>

<style>
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
