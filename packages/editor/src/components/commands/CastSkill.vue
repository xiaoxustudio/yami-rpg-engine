<template>
	<WindowFrame id="castSkill" @confirm="onConfirm">
		<template #title
			><TitleBar
				>{{ t('components.castSkill.title') }}
				<div class="close" /></TitleBar
		></template>

		<div class="grid-box">
			<div class="text">Actor</div>
			<CustomBox id="castSkill-actor" type="actor" v-model="form.actor" />
			<div class="text">Mode</div>
			<SelectBox id="castSkill-mode" v-model="form.mode" />
			<div class="text">Shortcut Key</div>
			<SelectBox id="castSkill-key" v-model="form.key" />
			<div class="text">Shortcut Key</div>
			<StringVar id="castSkill-keyVar" v-model="form.keyVar" />
			<div class="text">Skill</div>
			<CustomBox id="castSkill-skillId" type="file" filter="skill" v-model="form.skillId" />
			<div class="text">Skill</div>
			<CustomBox id="castSkill-skill" type="skill" v-model="form.skill" />
			<div class="text">Wait</div>
			<SelectBox id="castSkill-wait" name="wait" v-model="form.wait" />
		</div>
	</WindowFrame>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useCastSkillCommandSchema } from '@app/composables/commands/useCastSkillCommandSchema';
import { $ } from '@app/utils/dom';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import CustomBox from '@app/components/common/CustomBox.vue';
import StringVar from '@app/components/common/StringVar.vue';
import SelectBox from '@app/components/common/SelectBox.vue';

const { t } = useI18n();

const { form, save } = useCastSkillCommandSchema();

const onConfirm = () => {
	save();
};

onMounted(() => {
	$('#castSkill-mode')?.loadItems?.([
		{ name: 'By Shortcut Key', value: 'by-key' },
		{ name: 'By Skill ID', value: 'by-id' },
		{ name: 'By Skill Instance', value: 'by-skill' },
		{ name: 'By Variable', value: 'by-variable' }
	]);
	$('#castSkill-mode')
		?.enableHiddenMode?.()
		?.relate?.([
			{ case: 'by-key', targets: [$('#castSkill-key')] },
			{ case: 'by-id', targets: [$('#castSkill-skillId')] },
			{ case: 'by-skill', targets: [$('#castSkill-skill')] },
			{ case: 'by-variable', targets: [$('#castSkill-keyVar')] }
		]);
	$('#castSkill-wait')?.loadItems?.([
		{ name: 'Yes', value: true },
		{ name: 'No', value: false }
	]);
});
</script>
