<template>
	<WindowFrame id="showChoices" :ref="controlRef('showChoices')" @confirm="onConfirm">
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
				:ref="controlRef('showChoices-choices')"
				v-focus
				v-model="form.choices"
			/>
			<div class="text">{{ t('components.showChoices-parameters.label') }}</div>
			<TextBox
				:label="t('components.showChoices-parameters.label')"
				id="showChoices-parameters"
				:ref="controlRef('showChoices-parameters')"
				v-tip="t('components.showChoices-parameters.tip')"
				v-model="form.parameters"
			/>
		</div>
	</WindowFrame>
</template>

<script setup lang="ts">
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
import { useControlRefs } from '@app/composables/control-refs';

/** 控件 id 联合：模板与脚本共用，拼错在 tsc / vue-tsc 就红。 */
type Id = 'showChoices' | 'showChoices-choices' | 'showChoices-parameters';

const { controls, controlRef } = useControlRefs<Id>();

const { t } = useI18n();

const { form, save, windowClosed } = useShowChoicesCommandSchema();

const onConfirm = () => {
	save();
};

onMounted(() => {
	controls['showChoices-choices']?.bind?.(Choices);
	on(controls['showChoices'], 'closed', () => windowClosed(new Event('closed')));
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
