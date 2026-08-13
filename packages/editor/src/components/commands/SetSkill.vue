<template>
	<WindowFrame id="setSkill" @confirm="onConfirm">
		<template #title><TitleBar>Set Skill<div class="close" /></TitleBar></template>
		
			<div class="grid-box">
				<div class="text">Skill</div><CustomBox id="setSkill-skill" type="skill" />
				<div class="text">Operation</div><SelectBox id="setSkill-operation" />
				<div class="text">Cooldown</div
				><NumberVar id="setSkill-cooldown" min="1" max="3600000" unit="ms" />
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
import NumberVar from '@app/components/common/NumberVar.vue';
import SelectBox from '@app/components/common/SelectBox.vue';

const inspector = useInspectorStore();
const local = useLocalStore();

const onConfirm = () => {
	Command?.cases?.setSkill?.save?.();
};

onMounted(() => {
	inspector.syncState();
	local.syncState();
});
</script>
