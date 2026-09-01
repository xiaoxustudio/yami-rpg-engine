<template>
	<WindowFrame id="setPlayerActor" @confirm="onConfirm">
		<template #title
			><TitleBar
				>{{ t('components.setPlayerActor.title') }}
				<div class="close" /></TitleBar
		></template>

		<div class="grid-box">
			<div class="text">Global Actor</div>
			<CustomBox id="setPlayerActor-actor" v-focus type="actor" v-model="form.actor" />
		</div>
	</WindowFrame>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import { useSetPlayerActorCommandSchema } from '@app/composables/commands/useSetPlayerActorCommandSchema';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import CustomBox from '@app/components/common/CustomBox.vue';

const { t } = useI18n();

const { form, save } = useSetPlayerActorCommandSchema();

const onConfirm = () => {
	save();
};
</script>
