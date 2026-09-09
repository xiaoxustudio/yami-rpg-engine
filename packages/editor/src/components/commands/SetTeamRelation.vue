<template>
	<WindowFrame id="setTeamRelation" @confirm="onConfirm">
		<template #title
			><TitleBar
				>{{ t('components.setTeamRelation.title') }}
				<div class="close" /></TitleBar
		></template>

		<div class="grid-box">
			<div class="text">Team A</div>
			<SelectBox id="setTeamRelation-teamId1" v-focus v-model="form.teamId1" />
			<div class="text">Team B</div>
			<SelectBox id="setTeamRelation-teamId2" v-model="form.teamId2" />
			<div class="text">Relation</div>
			<SelectBox id="setTeamRelation-relation" v-model="form.relation" />
		</div>
	</WindowFrame>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useSetTeamRelationCommandSchema } from '@app/composables/commands/useSetTeamRelationCommandSchema';
import { $ } from '@app/utils/dom';
import { Data } from '@app/data/data-object.ts';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import SelectBox from '@app/components/common/SelectBox.vue';

const { t } = useI18n();

const { form, save } = useSetTeamRelationCommandSchema();

const onConfirm = () => {
	save();
};

onMounted(() => {
	$('#setTeamRelation-relation')?.loadItems?.([
		{ name: 'Enemy', value: 0 },
		{ name: 'Friend', value: 1 }
	]);
	$('#setTeamRelation')?.on?.('open', () => {
		const items = Data.createTeamItems!();
		$('#setTeamRelation-teamId1')?.loadItems?.(items);
		$('#setTeamRelation-teamId2')?.loadItems?.(items);
	});
});
</script>

<style>
/* 窗口样式试点：由 Project/css/command.css 迁入组件（选择器为全局 id，不能用 scoped） */
#setTeamRelation {
	width: 324px;
	height: 146px;
}

#setTeamRelation-confirm {
	right: 108px;
	bottom: 10px;
}

#setTeamRelation-cancel {
	right: 10px;
	bottom: 10px;
}

</style>
