<template>
<WindowFrame id="createGlobalActor" @confirm="onConfirm">
	<template #title><TitleBar>{{ t('components.createGlobalActor.title') }}<div class="close" /></TitleBar></template>
	
		<div class="grid-box">
			<div class="text">Actor</div
			><CustomBox id="createGlobalActor-actorId" type="file" filter="actor" @input="onActorId" /><div class="text">Team</div><SelectBox id="createGlobalActor-teamId" v-model="form.teamId" /></div>
	
</WindowFrame>
</template>

<script setup lang="ts">

import { onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useCreateGlobalActorCommandSchema } from '@app/composables/commands/useCreateGlobalActorCommandSchema';
import { $ } from '@app/utils/dom';
import { clear } from '@app/utils/element-utils';
import { Data } from '@app/data/data-object.ts';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import CustomBox from '@app/components/common/CustomBox.vue';
import SelectBox from '@app/components/common/SelectBox.vue';

const { t } = useI18n();

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
