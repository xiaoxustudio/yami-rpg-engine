<template>
<WindowFrame id="createGlobalActor" @confirm="onConfirm">
	<template #title><TitleBar>Create Global Actor<div class="close" /></TitleBar></template>
	
		<div class="grid-box">
			<div class="text">Actor</div
			><CustomBox id="createGlobalActor-actorId" type="file" filter="actor" @input="onActorId" /><div class="text">Team</div><SelectBox id="createGlobalActor-teamId" v-model="form.teamId" /></div>
	
</WindowFrame>
</template>

<script setup lang="ts">

import { onMounted } from 'vue';
import { useCreateGlobalActorCommandSchema } from '@app/composables/commands/useCreateGlobalActorCommandSchema';
import { $ } from '@app/legacy/util/dom.ts';
import { clear } from '@app/legacy/util/element-utils';
import { Data } from '@app/legacy/data/data-object.ts';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import CustomBox from '@app/components/common/CustomBox.vue';
import SelectBox from '@app/components/common/SelectBox.vue';

const { form, save } = useCreateGlobalActorCommandSchema();

const onActorId = (value: unknown) => {
	form.actorId = value;
};

const onConfirm = () => {
	save();
};

onMounted(() => {
	$('#createGlobalActor')?.on?.('open', () => {
		$('#createGlobalActor-teamId')?.loadItems?.(Data.createTeamItems!());
	});
	$('#createGlobalActor')?.on?.('closed', () => {
		clear($('#createGlobalActor-teamId'));
	});
});

</script>
