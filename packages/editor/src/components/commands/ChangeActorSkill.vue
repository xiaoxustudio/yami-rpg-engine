<template>
	<WindowFrame id="changeActorSkill" :ref="controlRef('changeActorSkill')" @confirm="onConfirm">
		<template #title
			><TitleBar
				>{{ t('components.changeActorSkill.title') }}
				<div class="close" /></TitleBar
		></template>

		<div class="grid-box">
			<div class="text">{{ t('components.changeActorSkill-actor.label') }}</div>
			<CustomBox
				id="changeActorSkill-actor"
				:ref="controlRef('changeActorSkill-actor')"
				v-focus
				type="actor"
				v-model="form.actor"
			/>
			<div class="text">{{ t('components.changeActorSkill-operation.label') }}</div>
			<SelectBox
				:label="t('components.changeActorSkill-operation.label')"
				id="changeActorSkill-operation"
				:ref="controlRef('changeActorSkill-operation')"
				v-model="form.operation"
			/>
			<div class="text">{{ t('components.changeActorSkill-skillId.label') }}</div>
			<FileVar
				id="changeActorSkill-skillId"
				:ref="controlRef('changeActorSkill-skillId')"
				v-focus
				type="file"
				filter="skill"
				v-model="form.skillId"
			/>
			<div class="text">{{ t('components.changeActorSkill-skill.label') }}</div>
			<CustomBox
				id="changeActorSkill-skill"
				:ref="controlRef('changeActorSkill-skill')"
				type="skill"
				v-model="form.skill"
			/>
		</div>
	</WindowFrame>
</template>

<script setup lang="ts">
import { useLocalizedOptions } from '@app/composables/useLocalizedOptions';

import { onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useChangeActorSkillCommandSchema } from '@app/composables/commands/useChangeActorSkillCommandSchema';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import CustomBox from '@app/components/common/CustomBox.vue';
import FileVar from '@app/components/common/FileVar.vue';
import SelectBox from '@app/components/common/SelectBox.vue';
import { controlRoot, useControlRefs } from '@app/composables/control-refs';

/** 控件 id 联合：模板与脚本共用，拼错在 tsc / vue-tsc 就红。 */
type Id =
	| 'changeActorSkill'
	| 'changeActorSkill-actor'
	| 'changeActorSkill-operation'
	| 'changeActorSkill-skill'
	| 'changeActorSkill-skillId';

const { controls, controlRef } = useControlRefs<Id>();

const { t } = useI18n();

const { form, save } = useChangeActorSkillCommandSchema();

const onConfirm = () => {
	save();
};

onMounted(() => {
	useLocalizedOptions(
		'changeActorSkill-operation',
		['add', 'remove', 'remove-instance', 'sort-by-order'],
		(items) => controls['changeActorSkill-operation']?.loadItems?.(items),
		{
			add: 'command.changeActorSkill.add',
			remove: 'command.changeActorSkill.remove',
			'remove-instance': 'command.changeActorSkill.remove-instance',
			'sort-by-order': 'command.changeActorSkill.sort-by-order'
		}
	);
	controls['changeActorSkill-operation']?.enableHiddenMode?.();
	controls['changeActorSkill-operation']?.relate?.([
		{
			case: ['add', 'remove'],
			targets: [controlRoot(controls['changeActorSkill-skillId'])]
		},
		{
			case: 'remove-instance',
			targets: [controlRoot(controls['changeActorSkill-skill'])]
		}
	]);
});
</script>

<style>
#changeActorSkill {
	width: 324px;
	height: 146px;
}

#changeActorSkill-confirm {
	right: 108px;
	bottom: 10px;
}

#changeActorSkill-cancel {
	right: 10px;
	bottom: 10px;
}
</style>
