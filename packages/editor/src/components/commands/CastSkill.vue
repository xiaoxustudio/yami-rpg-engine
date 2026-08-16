<template>
	<WindowFrame id="castSkill" @confirm="onConfirm">
		<template #title><TitleBar>Cast Skill<div class="close" /></TitleBar></template>
		
			<div class="grid-box">
				<div class="text">Actor</div><CustomBox id="castSkill-actor" type="actor" @input="onActor" />
				<div class="text">Mode</div><SelectBox id="castSkill-mode" v-model="form.mode" /> <div class="text">Shortcut Key</div
				><SelectBox id="castSkill-key" v-model="form.key" /> <div class="text">Shortcut Key</div
				><StringVar id="castSkill-keyVar" v-model="form.keyVar" /> <div class="text">Skill</div
				><CustomBox id="castSkill-skillId" type="file" filter="skill" @input="onSkillId" />
				<div class="text">Skill</div><CustomBox id="castSkill-skill" type="skill" @input="onSkill" />
				<div class="text">Wait</div><SelectBox id="castSkill-wait" name="wait" v-model="form.wait" />
			</div>
		
	</WindowFrame>
	
</template>

<script setup lang="ts">

import { onMounted } from 'vue';
import { useCastSkillCommandSchema } from '@app/composables/commands/useCastSkillCommandSchema';
import { $ } from '@/util/dom.ts';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import CustomBox from '@app/components/common/CustomBox.vue';
import StringVar from '@app/components/common/StringVar.vue';
import SelectBox from '@app/components/common/SelectBox.vue';

const { form, save } = useCastSkillCommandSchema();

const onActor = (value: unknown) => {
	form.actor = value;
};

const onSkillId = (value: unknown) => {
	form.skillId = value;
};

const onSkill = (value: unknown) => {
	form.skill = value;
};

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
