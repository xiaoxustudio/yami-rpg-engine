<template>
<WindowFrame id="jumpTo" @confirm="onConfirm">
	<template #title><TitleBar>{{ t('components.jumpTo.title') }}<div class="close" /></TitleBar></template>
	
		<div class="grid-box">
			<div class="text">Operation</div><SelectBox id="jumpTo-operation" v-model="form.operation" />
			<div class="text">Label Name</div><TextBox id="jumpTo-label" v-model="form.label" />
		</div>
	
</WindowFrame>
</template>

<script setup lang="ts">

import { onMounted, reactive } from 'vue';
import { useI18n } from 'vue-i18n';
import { $ } from '@app/utils/dom';
import { TextSuggestion, type TextSuggestionTarget } from '@app/commands/text-tip.ts';
import { useJumpToCommandSchema } from '@app/composables/commands/useJumpToCommandSchema';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import TextBox from '@app/components/common/TextBox.vue';
import SelectBox from '@app/components/common/SelectBox.vue';

const { t } = useI18n();

const { save, loadLabels } = useJumpToCommandSchema();

const form = reactive({
	operation: 'jump',
	label: ''
});

const onConfirm = () => {
	save();
};

onMounted(() => {
	TextSuggestion.listen!(
		$('#jumpTo-label') as unknown as TextSuggestionTarget,
		loadLabels
	);
	$('#jumpTo-operation')?.loadItems?.([
		{ name: 'Jump to Label', value: 'jump' },
		{ name: 'Save and Jump to Label', value: 'save-jump' },
		{ name: 'Jump to the Saved Location', value: 'return' }
	]);
	$('#jumpTo-operation')
		?.enableHiddenMode?.()
		?.relate?.([{ case: ['jump', 'save-jump'], targets: [$('#jumpTo-label')] }]);
});

</script>
