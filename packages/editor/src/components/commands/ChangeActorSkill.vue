<template>
	<WindowFrame id="changeActorSkill" @confirm="onConfirm">
		<template #title
			><TitleBar
				>{{ t('components.changeActorSkill.title') }}
				<div class="close" /></TitleBar
		></template>

		<div class="grid-box">
			<div class="text">Actor</div>
			<CustomBox id="changeActorSkill-actor" type="actor" @input="onActor" />
			<div class="text">Operation</div>
			<SelectBox id="changeActorSkill-operation" v-model="form.operation" />
			<div class="text">Skill</div>
			<FileVar
				id="changeActorSkill-skillId"
				type="file"
				filter="skill"
				v-model="form.skillId"
			/>
			<div class="text">Skill</div>
			<CustomBox id="changeActorSkill-skill" type="skill" @input="onSkill" />
		</div>
	</WindowFrame>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useChangeActorSkillCommandSchema } from '@app/composables/commands/useChangeActorSkillCommandSchema';
import { $ } from '@app/utils/dom';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import CustomBox from '@app/components/common/CustomBox.vue';
import FileVar from '@app/components/common/FileVar.vue';
import SelectBox from '@app/components/common/SelectBox.vue';

const { t } = useI18n();

const { form, save } = useChangeActorSkillCommandSchema();

const onActor = (value: unknown) => {
	form.actor = value;
};

const onSkill = (value: unknown) => {
	form.skill = value;
};

const onConfirm = () => {
	save();
};

onMounted(() => {
	$('#changeActorSkill-operation')?.loadItems?.([
		{ name: t('command.changeActorSkill.add') || 'Add', value: 'add' },
		{ name: t('command.changeActorSkill.remove') || 'Remove', value: 'remove' },
		{
			name: t('command.changeActorSkill.remove-instance') || 'Remove Instance',
			value: 'remove-instance'
		},
		{ name: t('command.changeActorSkill.sort-by-order') || 'Sort by Filename', value: 'sort-by-order' }
	]);
	$('#changeActorSkill-operation')
		?.enableHiddenMode?.()
		?.relate?.([
			{
				case: ['add', 'remove'],
				targets: [$('#changeActorSkill-skillId')]
			},
			{
				case: 'remove-instance',
				targets: [$('#changeActorSkill-skill')]
			}
		]);
});
</script>
