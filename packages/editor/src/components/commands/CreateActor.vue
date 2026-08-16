<template>
<WindowFrame id="createActor" @confirm="onConfirm">
	<template #title><TitleBar>Create Actor<div class="close" /></TitleBar></template>
	
		<div class="grid-box">
			<div class="text">Actor</div
			><CustomBox id="createActor-actorId" type="file" filter="actor" @input="onActorId" /><div class="text">Team</div><SelectBox id="createActor-teamId" v-model="form.teamId" /><div class="text">Position</div
			><CustomBox id="createActor-position" type="position" @input="onPosition" /><div class="text">Angle</div
			><NumberVar
				id="createActor-angle"
				min="-360"
				max="360"
				decimals="4"
				unit="deg"
				v-model="form.angle"
			 /></div>

</WindowFrame>
</template>

<script setup lang="ts">

import { onMounted } from 'vue';
import { useCreateActorCommandSchema } from '@app/composables/commands/useCreateActorCommandSchema';
import { $ } from '@/util/dom.ts';
import { clear } from '@/util/element-utils';
import { Data } from '@/data/data-object.ts';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import CustomBox from '@app/components/common/CustomBox.vue';
import NumberVar from '@app/components/common/NumberVar.vue';
import SelectBox from '@app/components/common/SelectBox.vue';

const { form, save } = useCreateActorCommandSchema();

const onActorId = (value: unknown) => {
	form.actorId = value;
};

const onPosition = (value: unknown) => {
	form.position = value;
};

const onConfirm = () => {
	save();
};

onMounted(() => {
	$('#createActor')?.on?.('open', () => {
		$('#createActor-teamId')?.loadItems?.(Data.createTeamItems!());
	});
	$('#createActor')?.on?.('closed', () => {
		clear($('#createActor-teamId'));
	});
});

</script>
