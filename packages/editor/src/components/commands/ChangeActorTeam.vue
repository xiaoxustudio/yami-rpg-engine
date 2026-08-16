<template>
<WindowFrame id="changeActorTeam" @confirm="onConfirm">
	<template #title><TitleBar>Change Actor Team<div class="close" /></TitleBar></template>
	
		<div class="grid-box">
			<div class="text">Actor</div><CustomBox id="changeActorTeam-actor" type="actor" @input="onActor" /><div class="text">Team</div><SelectBox id="changeActorTeam-teamId" v-model="form.teamId" /></div>
	
</WindowFrame>
</template>

<script setup lang="ts">

import { onMounted } from 'vue';
import { useChangeActorTeamCommandSchema } from '@app/composables/commands/useChangeActorTeamCommandSchema';
import { $ } from '@/util/dom.ts';
import { clear } from '@/util/element-utils';
import { Data } from '@/data/data-object.ts';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import CustomBox from '@app/components/common/CustomBox.vue';
import SelectBox from '@app/components/common/SelectBox.vue';

const { form, save } = useChangeActorTeamCommandSchema();

const onActor = (value: unknown) => {
	form.actor = value;
};

const onConfirm = () => {
	save();
};

onMounted(() => {
	$('#changeActorTeam')?.on?.('open', () => {
		$('#changeActorTeam-teamId')?.loadItems?.(Data.createTeamItems!());
	});
	$('#changeActorTeam')?.on?.('closed', () => {
		clear($('#changeActorTeam-teamId'));
	});
});

</script>
