<template>
	<WindowFrame id="createTrigger" @confirm="onConfirm">
		<template #title
			><TitleBar
				>{{ t('components.createTrigger.title') }}
				<div class="close" /></TitleBar
		></template>

		<div class="grid-box">
			<div class="text">Trigger</div>
			<FileVar
				id="createTrigger-triggerId"
				type="file"
				filter="trigger"
				v-model="form.triggerId"
			/>
			<div class="text">Caster</div>
			<CustomBox id="createTrigger-caster" type="actor" @input="onCaster" />
			<div class="text">Origin</div>
			<CustomBox id="createTrigger-origin" type="position" @input="onOrigin" />
			<div class="text">Angle</div>
			<CustomBox id="createTrigger-angle" type="angle" @input="onAngle" />
			<div class="text">Distance</div>
			<NumberVar
				id="createTrigger-distance"
				min="-512"
				max="512"
				decimals="4"
				unit="tile"
				v-model="form.distance"
			/>
			<div class="text">Scale</div>
			<NumberVar
				id="createTrigger-scale"
				min="0.1"
				max="10"
				step="0.1"
				decimals="4"
				v-model="form.scale"
			/>
			<div class="text">Global Speed</div>
			<NumberVar
				id="createTrigger-timeScale"
				min="0.1"
				max="10"
				step="0.1"
				decimals="4"
				v-model="form.timeScale"
			/>
		</div>
	</WindowFrame>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import { useCreateTriggerCommandSchema } from '@app/composables/commands/useCreateTriggerCommandSchema';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import CustomBox from '@app/components/common/CustomBox.vue';
import FileVar from '@app/components/common/FileVar.vue';
import NumberVar from '@app/components/common/NumberVar.vue';

const { t } = useI18n();

const { form, save } = useCreateTriggerCommandSchema();

const onCaster = (value: unknown) => {
	form.caster = value;
};

const onOrigin = (value: unknown) => {
	form.origin = value;
};

const onAngle = (value: unknown) => {
	form.angle = value;
};

const onConfirm = () => {
	save();
};
</script>
