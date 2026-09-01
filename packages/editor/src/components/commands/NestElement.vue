<template>
	<WindowFrame id="nestElement" @confirm="onConfirm">
		<template #title
			><TitleBar
				>{{ t('components.nestElement.title') }}
				<div class="close" /></TitleBar
		></template>

		<div class="grid-box">
			<div class="text">Parent Element</div>
			<CustomBox id="nestElement-parent" v-focus type="element" v-model="form.parent" />
			<div class="text">Child Element</div>
			<CustomBox id="nestElement-child" type="element" v-model="form.child" />
		</div>
	</WindowFrame>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import { useNestElementCommandSchema } from '@app/composables/commands/useNestElementCommandSchema';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import CustomBox from '@app/components/common/CustomBox.vue';

const { t } = useI18n();

const { form, save } = useNestElementCommandSchema();

const onConfirm = () => {
	save();
};
</script>
