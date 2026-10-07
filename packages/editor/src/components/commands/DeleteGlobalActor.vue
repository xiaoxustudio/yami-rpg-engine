<template>
	<WindowFrame id="deleteGlobalActor" @confirm="onConfirm">
		<template #title
			><TitleBar
				>{{ t('components.deleteGlobalActor.title') }}
				<div class="close" /></TitleBar
		></template>

		<div class="grid-box">
			<div class="text">{{ t('components.deleteGlobalActor-actorId.label') }}</div>
			<CustomBox
				id="deleteGlobalActor-actorId"
				v-tip="t('components.deleteGlobalActor-actorId.tip')"
				v-focus
				type="file"
				filter="actor"
				v-model="form.actorId"
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

const onConfirm = () => {
	save();
};
</script>

<style>
#deleteGlobalActor {
	width: 324px;
	height: 98px;
}

#deleteGlobalActor-confirm {
	right: 108px;
	bottom: 10px;
}

#deleteGlobalActor-cancel {
	right: 10px;
	bottom: 10px;
}
</style>
