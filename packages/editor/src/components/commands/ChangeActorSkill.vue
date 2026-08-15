<template>
<WindowFrame id="changeActorSkill" @confirm="onConfirm">
	<template #title><TitleBar>Change Actor Skill<div class="close" /></TitleBar></template>
	
		<div class="grid-box">
			<div class="text">Actor</div><CustomBox id="changeActorSkill-actor" type="actor" /><div class="text">Operation</div><SelectBox id="changeActorSkill-operation" /><div class="text">Skill</div
			><FileVar id="changeActorSkill-skillId" type="file" filter="skill" /><div class="text">Skill</div><CustomBox id="changeActorSkill-skill" type="skill" /></div>
	
</WindowFrame>
</template>

<script setup lang="ts">

import { Command } from '@/command/command-object.ts';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import CustomBox from '@app/components/common/CustomBox.vue';
import FileVar from '@app/components/common/FileVar.vue';
import SelectBox from '@app/components/common/SelectBox.vue';


const onConfirm = () => {
	Command?.cases?.changeActorSkill?.save?.();
};

</script>
