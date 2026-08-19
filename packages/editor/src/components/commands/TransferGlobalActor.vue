<template>
<WindowFrame id="transferGlobalActor" @confirm="onConfirm">
	<template #title><TitleBar>{{ t('components.transferGlobalActor.title') }}<div class="close" /></TitleBar></template>
	
		<div class="grid-box">
			<div class="text">Actor</div><CustomBox id="transferGlobalActor-actor" type="actor" @input="onActor" />
			<div class="text">Position</div
			><CustomBox id="transferGlobalActor-position" type="position" @input="onPosition" />
		</div>
	
</WindowFrame>
</template>

<script setup lang="ts">

import { useI18n } from 'vue-i18n';
import { useTransferGlobalActorCommandSchema } from '@app/composables/commands/useTransferGlobalActorCommandSchema';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import CustomBox from '@app/components/common/CustomBox.vue';

const { t } = useI18n();

const { form, save } = useTransferGlobalActorCommandSchema();

const onActor = (value: unknown) => {
	form.actor = value;
};

const onPosition = (value: unknown) => {
	form.position = value;
};

const onConfirm = () => {
	save();
};

</script>
