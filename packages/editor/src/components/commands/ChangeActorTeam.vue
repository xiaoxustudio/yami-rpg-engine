<template>
	<WindowFrame id="changeActorTeam" @confirm="onConfirm">
		<template #title
			><TitleBar
				>{{ t('components.changeActorTeam.title') }}
				<div class="close" /></TitleBar
		></template>

		<div class="grid-box">
			<div class="text">Actor</div>
			<CustomBox id="changeActorTeam-actor" v-focus type="actor" v-model="form.actor" />
			<div class="text">Team</div>
			<SelectBox id="changeActorTeam-teamId" v-model="form.teamId" />
		</div>
	</WindowFrame>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useChangeActorTeamCommandSchema } from '@app/composables/commands/useChangeActorTeamCommandSchema';
import { $ } from '@app/utils/dom';
import { clear } from '@app/utils/element-utils';
import { Data } from '@app/data/data-object.ts';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import CustomBox from '@app/components/common/CustomBox.vue';
import SelectBox from '@app/components/common/SelectBox.vue';

const { t } = useI18n();

const { form, save } = useChangeActorTeamCommandSchema();

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
