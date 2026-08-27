<template>
	<WindowFrame id="setWeight" @confirm="onConfirm">
		<template #title
			><TitleBar
				>{{ t('components.setWeight.title') }}
				<div class="close" /></TitleBar
		></template>

		<div class="grid-box">
			<div class="text">Actor</div>
			<CustomBox id="setWeight-actor" type="actor" @input="onActor" />
			<div class="text">Weight</div>
			<NumberVar
				id="setWeight-weight"
				min="0"
				max="8"
				step="0.1"
				decimals="4"
				v-model="form.weight"
			/>
		</div>
	</WindowFrame>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import { useSetWeightCommandSchema } from '@app/composables/commands/useSetWeightCommandSchema';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import CustomBox from '@app/components/common/CustomBox.vue';
import NumberVar from '@app/components/common/NumberVar.vue';

const { t } = useI18n();

const { form, save } = useSetWeightCommandSchema();

const onActor = (value: unknown) => {
	form.actor = value;
};

const onConfirm = () => {
	save();
};
</script>
