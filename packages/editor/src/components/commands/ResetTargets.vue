<template>
<WindowFrame id="resetTargets" @confirm="onConfirm">
	<template #title><TitleBar>{{ t('components.resetTargets.title') }}<div class="close" /></TitleBar></template>
	
		<div class="grid-box">
			<div class="text">Actor</div><CustomBox id="resetTargets-actor" type="actor" @input="onActor" /></div>
	
</WindowFrame>
</template>

<script setup lang="ts">

import { useI18n } from 'vue-i18n';
import { useResetTargetsCommandSchema } from '@app/composables/commands/useResetTargetsCommandSchema';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import CustomBox from '@app/components/common/CustomBox.vue';

const { t } = useI18n();

const { form, save } = useResetTargetsCommandSchema();

const onActor = (value: unknown) => {
	form.actor = value;
};

const onConfirm = () => {
	save();
};

</script>
