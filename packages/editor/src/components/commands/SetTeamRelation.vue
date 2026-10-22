<template>
	<WindowFrame
		id="setTeamRelation"
		:ref="registryRef(fieldEls, 'setTeamRelation')"
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
				:ref="registryRef(fieldEls, 'setTeamRelation-teamId1')"
				v-focus
				v-model="form.teamId1"
			/>
			<div class="text">{{ t('components.setTeamRelation-teamId2.label') }}</div>
			<SelectBox
				:label="t('components.setTeamRelation-teamId2.label')"
				id="setTeamRelation-teamId2"
				v-tip="t('components.setTeamRelation-teamId2.tip')"
				:ref="registryRef(fieldEls, 'setTeamRelation-teamId2')"
				v-model="form.teamId2"
			/>
			<div class="text">{{ t('components.setTeamRelation-relation.label') }}</div>
			<SelectBox
				:label="t('components.setTeamRelation-relation.label')"
				id="setTeamRelation-relation"
				v-tip="t('components.setTeamRelation-relation.tip')"
				:ref="registryRef(fieldEls, 'setTeamRelation-relation')"
				v-model="form.relation"
			/>
		</div>
	</WindowFrame>
</template>

<script setup lang="ts">
import { useLocalizedOptions } from '@app/composables/useLocalizedOptions';
import { createElementRegistry, registryRef } from '@app/utils/element-registry';
import { composableEls } from '@app/composables/element-registry';

const fieldEls = createElementRegistry(composableEls);
import { onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useSetTeamRelationCommandSchema } from '@app/composables/commands/useSetTeamRelationCommandSchema';
import { Data } from '@app/data/data-object.ts';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import SelectBox from '@app/components/common/SelectBox.vue';

const { t } = useI18n();

const { form, save } = useSetTeamRelationCommandSchema();

const onConfirm = () => {
	save();
};

/** 窗口打开时刷新候选项。 */
const onWindowOpen = () => {
	const items = Data.createTeamItems!();
	fieldEls.get('setTeamRelation-teamId1')?.loadItems?.(items);
	fieldEls.get('setTeamRelation-teamId2')?.loadItems?.(items);
};

onMounted(() => {
	useLocalizedOptions('setTeamRelation-relation', [0, 1], (items) =>
		fieldEls.get('setTeamRelation-relation')?.loadItems?.(items)
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
