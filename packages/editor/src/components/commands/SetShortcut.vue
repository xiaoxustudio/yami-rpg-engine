<template>
<WindowFrame id="setShortcut" @confirm="onConfirm">
	<template #title><TitleBar>Set Shortcut<div class="close" /></TitleBar></template>
	
		<div class="grid-box">
			<div class="text">Actor</div><CustomBox id="setShortcut-actor" type="actor" />
			<div class="text">Operation</div><SelectBox id="setShortcut-operation" />
			<div class="text">Shortcut Key</div><SelectVar id="setShortcut-key" />
			<div class="text">Shortcut Key 2</div><SelectVar id="setShortcut-key2" />
			<div class="text">Item</div><FileVar id="setShortcut-itemId" type="file" filter="item" />
			<div class="text">Skill</div
			><FileVar id="setShortcut-skillId" type="file" filter="skill" />
		</div>
	
</WindowFrame>
</template>

<script setup lang="ts">

import { Command } from '@/command/command-object.ts';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import CustomBox from '@app/components/common/CustomBox.vue';
import FileVar from '@app/components/common/FileVar.vue';
import SelectVar from '@app/components/common/SelectVar.vue';
import SelectBox from '@app/components/common/SelectBox.vue';


const onConfirm = () => {
	Command?.cases?.setShortcut?.save?.();
};

</script>
