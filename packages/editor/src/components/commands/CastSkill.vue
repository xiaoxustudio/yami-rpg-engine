<template>
	<WindowFrame id="castSkill" @confirm="onConfirm">
		<template #title><TitleBar>Cast Skill<div class="close" /></TitleBar></template>
		
			<div class="grid-box">
				<div class="text">Actor</div><CustomBox id="castSkill-actor" type="actor" />
				<div class="text">Mode</div><SelectBox id="castSkill-mode" /> <div class="text">Shortcut Key</div
				><SelectBox id="castSkill-key" /> <div class="text">Shortcut Key</div
				><StringVar id="castSkill-keyVar" /> <div class="text">Skill</div
				><CustomBox id="castSkill-skillId" type="file" filter="skill" />
				<div class="text">Skill</div><CustomBox id="castSkill-skill" type="skill" />
				<div class="text">Wait</div><SelectBox id="castSkill-wait" name="wait" />
			</div>
		
	</WindowFrame>
	
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { Command } from '@/command/command-object.ts';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import { useInspectorStore } from '@app/stores/inspector';
import { useLocalStore } from '@app/stores/local';
import CustomBox from '@app/components/common/CustomBox.vue';
import StringVar from '@app/components/common/StringVar.vue';
import SelectBox from '@app/components/common/SelectBox.vue';

const inspector = useInspectorStore();
const local = useLocalStore();

const onConfirm = () => {
	Command?.cases?.castSkill?.save?.();
};

onMounted(() => {
	inspector.syncState();
	local.syncState();
});
</script>
