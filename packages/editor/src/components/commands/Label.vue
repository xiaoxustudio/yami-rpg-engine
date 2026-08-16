<template>
<WindowFrame id="label" @confirm="onConfirm">
	<template #title><TitleBar>Label<div class="close" /></TitleBar></template>
	
		<div class="grid-box"> <div class="text">Label Name</div><TextBox id="label-name" v-model="form.name" /> </div>
	
</WindowFrame>
</template>

<script setup lang="ts">

import { useLabelCommandSchema } from '@app/composables/commands/useLabelCommandSchema';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import TextBox from '@app/components/common/TextBox.vue';

const { form, save } = useLabelCommandSchema();

const onConfirm = () => {
	save();
};

</script>
