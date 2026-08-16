<template>
<WindowFrame id="setPlayerActor" @confirm="onConfirm">
	<template #title><TitleBar>Set Player Actor<div class="close" /></TitleBar></template>
	
		<div class="grid-box">
			<div class="text">Global Actor</div
			><CustomBox id="setPlayerActor-actor" type="actor" @input="onActor" /></div>
	
</WindowFrame>
</template>

<script setup lang="ts">

import { useSetPlayerActorCommandSchema } from '@app/composables/commands/useSetPlayerActorCommandSchema';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import CustomBox from '@app/components/common/CustomBox.vue';

const { form, save } = useSetPlayerActorCommandSchema();

const onActor = (value: unknown) => {
	form.actor = value;
};

const onConfirm = () => {
	save();
};

</script>
