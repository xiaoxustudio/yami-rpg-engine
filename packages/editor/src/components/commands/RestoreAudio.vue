<template>
<WindowFrame id="restoreAudio" @confirm="onConfirm">
	<template #title><TitleBar>Restore Audio<div class="close" /></TitleBar></template>
	
		<div class="grid-box"> <div class="text">Type</div><SelectBox id="restoreAudio-type" v-model="form.type" /> </div>
	
</WindowFrame>
</template>

<script setup lang="ts">

import { onMounted } from 'vue';
import { useRestoreAudioCommandSchema } from '@app/composables/commands/useRestoreAudioCommandSchema';
import { $ } from '@app/legacy/util/dom.ts';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import SelectBox from '@app/components/common/SelectBox.vue';

const { form, save } = useRestoreAudioCommandSchema();

const onConfirm = () => {
	save();
};

onMounted(() => {
	$('#restoreAudio-type')?.loadItems?.([
		{ name: 'BGM', value: 'bgm' },
		{ name: 'BGS', value: 'bgs' },
		{ name: 'CV', value: 'cv' }
	]);
});

</script>
