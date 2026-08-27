<template>
	<WindowFrame id="deleteGlobalActor" @confirm="onConfirm">
		<template #title
			><TitleBar
				>{{ t('components.deleteGlobalActor.title') }}
				<div class="close" /></TitleBar
		></template>

		<div class="grid-box">
			<div class="text">Actor</div>
			<CustomBox
				id="deleteGlobalActor-actorId"
				type="file"
				filter="actor"
				@input="onActorId"
			/>
		</div>
	</WindowFrame>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import { useDeleteGlobalActorCommandSchema } from '@app/composables/commands/useDeleteGlobalActorCommandSchema';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import CustomBox from '@app/components/common/CustomBox.vue';

const { t } = useI18n();

const { form, save } = useDeleteGlobalActorCommandSchema();

const onActorId = (value: unknown) => {
	form.actorId = value;
};

const onConfirm = () => {
	save();
};
</script>
