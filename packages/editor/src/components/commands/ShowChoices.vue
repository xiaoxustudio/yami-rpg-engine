<template>
	<WindowFrame id="showChoices" :ref="registryRef(fieldEls, 'showChoices')" @confirm="onConfirm">
		<template #title
			><TitleBar
				>{{ t('components.showChoices.title') }}
				<div class="close" /></TitleBar
		></template>

		<div class="grid-box">
			<div class="text">{{ t('components.showChoices-choices.label') }}</div>
			<ParamList
				id="showChoices-choices"
				v-tip="t('components.showChoices-choices.tip')"
				:ref="registryRef(fieldEls, 'showChoices-choices')"
				v-focus
				v-model="form.choices"
			/>
			<div class="text">{{ t('components.showChoices-parameters.label') }}</div>
			<TextBox
				:label="t('components.showChoices-parameters.label')"
				id="showChoices-parameters"
				:ref="registryRef(fieldEls, 'showChoices-parameters')"
				v-tip="t('components.showChoices-parameters.tip')"
				v-model="form.parameters"
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
	fieldEls.get('showChoices-choices')?.bind?.(Choices);
	on(fieldEls.get('showChoices'), 'closed', () => windowClosed(new Event('closed')));
});
</script>

<style>
#showChoices {
	width: 400px;
	height: 204px;
}

#showChoices-choices {
	height: 102px;
}

#showChoices-confirm {
	right: 108px;
	bottom: 10px;
}

#showChoices-cancel {
	right: 10px;
	bottom: 10px;
}
</style>
