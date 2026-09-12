<template>
	<WindowFrame id="changeActorSkill"
				:ref="registryRef(fieldEls, 'changeActorSkill')" @confirm="onConfirm">
		<template #title
			><TitleBar
				>{{ t('components.changeActorSkill.title') }}
				<div class="close" /></TitleBar
		></template>

		<div class="grid-box">
			<div class="text">{{ t('components.changeActorSkill-actor.label') }}</div>
			<CustomBox id="changeActorSkill-actor"
				:ref="registryRef(fieldEls, 'changeActorSkill-actor')" v-focus type="actor" v-model="form.actor" />
			<div class="text">{{ t('components.changeActorSkill-operation.label') }}</div>
			<SelectBox id="changeActorSkill-operation"
				:ref="registryRef(fieldEls, 'changeActorSkill-operation')" v-model="form.operation" />
			<div class="text">{{ t('components.changeActorSkill-skillId.label') }}</div>
			<FileVar
				id="changeActorSkill-skillId"
				:ref="registryRef(fieldEls, 'changeActorSkill-skillId')"
				v-focus
				type="file"
				filter="skill"
				v-model="form.skillId"
			/>
			<div class="text">{{ t('components.changeActorSkill-skill.label') }}</div>
			<CustomBox id="changeActorSkill-skill"
				:ref="registryRef(fieldEls, 'changeActorSkill-skill')" type="skill" v-model="form.skill" />
		</div>
	</WindowFrame>
</template>

<script setup lang="ts">
import { createElementRegistry, registryRef } from '@app/utils/element-registry';
import { composableEls } from '@app/composables/element-registry';

// P5b 批次 4：本组件的控件元素注册表（替代按 id 查 DOM）
const fieldEls = createElementRegistry(composableEls);
import { onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useChangeActorSkillCommandSchema } from '@app/composables/commands/useChangeActorSkillCommandSchema';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import CustomBox from '@app/components/common/CustomBox.vue';
import FileVar from '@app/components/common/FileVar.vue';
import SelectBox from '@app/components/common/SelectBox.vue';

const { t } = useI18n();

const { form, save } = useChangeActorSkillCommandSchema();

const onConfirm = () => {
	save();
};

onMounted(() => {
	fieldEls.get('changeActorSkill-operation')?.loadItems?.([
		{ name: t('command.changeActorSkill.add') || 'Add', value: 'add' },
		{ name: t('command.changeActorSkill.remove') || 'Remove', value: 'remove' },
		{
			name: t('command.changeActorSkill.remove-instance') || 'Remove Instance',
			value: 'remove-instance'
		},
		{ name: t('command.changeActorSkill.sort-by-order') || 'Sort by Filename', value: 'sort-by-order' }
	]);
	fieldEls.get('changeActorSkill-operation')
		?.enableHiddenMode?.()
		?.relate?.([
			{
				case: ['add', 'remove'],
				targets: [fieldEls.get('changeActorSkill-skillId')]
			},
			{
				case: 'remove-instance',
				targets: [fieldEls.get('changeActorSkill-skill')]
			}
		]);
});
</script>

<style>
/* 窗口样式试点：由 Project/css/command.css 迁入组件（选择器为全局 id，不能用 scoped） */
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
