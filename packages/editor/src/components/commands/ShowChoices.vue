<template>
	<WindowFrame id="showChoices" @confirm="onConfirm">
		<template #title
			><TitleBar
				>{{ t('components.showChoices.title') }}
				<div class="close" /></TitleBar
		></template>

		<div class="grid-box">
			<div class="text">Choices</div>
			<ParamList id="showChoices-choices" v-model="form.choices" />
			<div class="text">Parameters</div>
			<TextBox id="showChoices-parameters" v-model="form.parameters" />
		</div>
	</WindowFrame>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { $ } from '@app/utils/dom';
import { on } from '@app/utils/element-utils.ts';
import { useChoicesSchema } from '@app/composables/useChoicesSchema';

const Choices = useChoicesSchema();
import { useShowChoicesCommandSchema } from '@app/composables/commands/useShowChoicesCommandSchema';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import TextBox from '@app/components/common/TextBox.vue';
import ParamList from '@app/components/common/ParamList.vue';

const { t } = useI18n();

const { form, save, windowClosed } = useShowChoicesCommandSchema();

const onConfirm = () => {
	save();
};

onMounted(() => {
	$('#showChoices-choices')?.bind?.(Choices);
	on($('#showChoices'), 'closed', () => windowClosed(new Event('closed')));
});
</script>
