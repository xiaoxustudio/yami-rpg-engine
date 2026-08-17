<template>
<WindowFrame id="changeActorPortrait" @confirm="onConfirm">
	<template #title><TitleBar>Change Actor Portrait<div class="close" /></TitleBar></template>
	
		<div class="grid-box">
			<div class="text">Actor</div><CustomBox id="changeActorPortrait-actor" type="actor" @input="onActor" /><div class="text">Mode</div><SelectBox id="changeActorPortrait-mode" v-model="form.mode" /><div class="text">Portrait</div
			><CustomBox id="changeActorPortrait-portrait" type="file" filter="image" @input="onPortrait" /><div class="text">Clip</div
			><CustomBox
				id="changeActorPortrait-clip"
				type="clip"
				image="changeActorPortrait-portrait"
				@input="onClip"
			 /></div>
	
</WindowFrame>
</template>

<script setup lang="ts">

import { onMounted } from 'vue';
import { useChangeActorPortraitCommandSchema } from '@app/composables/commands/useChangeActorPortraitCommandSchema';
import { $ } from '@app/legacy/util/dom.ts';
import { Local } from '@app/legacy/tools/localization.ts';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import CustomBox from '@app/components/common/CustomBox.vue';
import SelectBox from '@app/components/common/SelectBox.vue';

const { form, save } = useChangeActorPortraitCommandSchema();

const onActor = (value: unknown) => {
	form.actor = value;
};

const onPortrait = (value: unknown) => {
	form.portrait = value;
};

const onClip = (value: unknown) => {
	form.clip = value;
};

const onConfirm = () => {
	save();
};

onMounted(() => {
	const get = Local.createGetter!('command.changeActorPortrait');
	$('#changeActorPortrait-mode')?.loadItems?.([
		{ name: 'Full Mode', value: 'full' },
		{ name: 'Image Mode', value: 'portrait' },
		{ name: get('clip') || 'Clip Mode', value: 'clip' }
	]);
	$('#changeActorPortrait-mode')
		?.enableHiddenMode?.()
		?.relate?.([
			{
				case: 'full',
				targets: [$('#changeActorPortrait-portrait'), $('#changeActorPortrait-clip')]
			},
			{
				case: 'portrait',
				targets: [$('#changeActorPortrait-portrait')]
			},
			{ case: 'clip', targets: [$('#changeActorPortrait-clip')] }
		]);
});

</script>
