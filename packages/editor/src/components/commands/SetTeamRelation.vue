<template>
	<WindowFrame
		id="setTeamRelation"
		:ref="controlRef('setTeamRelation')"
		@confirm="onConfirm"
		@open="onWindowOpen"
	>
		<template #title
			><TitleBar
				>{{ t('components.setTeamRelation.title') }}
				<div class="close" /></TitleBar
		></template>

		<div class="grid-box">
			<div class="text">{{ t('components.setTeamRelation-teamId1.label') }}</div>
			<SelectBox
				:label="t('components.setTeamRelation-teamId1.label')"
				id="setTeamRelation-teamId1"
				v-tip="t('components.setTeamRelation-teamId1.tip')"
				:ref="controlRef('setTeamRelation-teamId1')"
				v-focus
				v-model="form.teamId1"
			/>
			<div class="text">{{ t('components.setTeamRelation-teamId2.label') }}</div>
			<SelectBox
				:label="t('components.setTeamRelation-teamId2.label')"
				id="setTeamRelation-teamId2"
				v-tip="t('components.setTeamRelation-teamId2.tip')"
				:ref="controlRef('setTeamRelation-teamId2')"
				v-model="form.teamId2"
			/>
			<div class="text">{{ t('components.setTeamRelation-relation.label') }}</div>
			<SelectBox
				:label="t('components.setTeamRelation-relation.label')"
				id="setTeamRelation-relation"
				v-tip="t('components.setTeamRelation-relation.tip')"
				:ref="controlRef('setTeamRelation-relation')"
				v-model="form.relation"
			/>
		</div>
	</WindowFrame>
</template>

<script setup lang="ts">
import { useLocalizedOptions } from '@app/composables/useLocalizedOptions';
import { onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useSetTeamRelationCommandSchema } from '@app/composables/commands/useSetTeamRelationCommandSchema';
import { Data } from '@app/data/data-object.ts';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import SelectBox from '@app/components/common/SelectBox.vue';
import { useControlRefs } from '@app/composables/control-refs';

/** 控件 id 联合：模板与脚本共用，拼错在 tsc / vue-tsc 就红。 */
type Id =
	| 'setTeamRelation'
	| 'setTeamRelation-relation'
	| 'setTeamRelation-teamId1'
	| 'setTeamRelation-teamId2';

const { controls, controlRef } = useControlRefs<Id>();

const { t } = useI18n();

const { form, save } = useSetTeamRelationCommandSchema();

const onConfirm = () => {
	save();
};

/** 窗口打开时刷新候选项。 */
const onWindowOpen = () => {
	const items = Data.createTeamItems!();
	controls['setTeamRelation-teamId1']?.loadItems?.(items);
	controls['setTeamRelation-teamId2']?.loadItems?.(items);
};

onMounted(() => {
	useLocalizedOptions('setTeamRelation-relation', [0, 1], (items) =>
		controls['setTeamRelation-relation']?.loadItems?.(items)
	);
});
</script>

<style>
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
