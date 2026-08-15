<template>
<WindowFrame id="changeActorEquipment" @confirm="onConfirm">
	<template #title><TitleBar>Change Actor Equipment<div class="close" /></TitleBar></template>
	
		<div class="grid-box">
			<div class="text">Actor</div><CustomBox id="changeActorEquipment-actor" type="actor" /><div class="text">Operation</div><SelectBox id="changeActorEquipment-operation" /><div class="text">Shortcut Key</div><SelectVar id="changeActorEquipment-slot" /><div class="text">Equipment</div
			><CustomBox
				id="changeActorEquipment-equipmentId"
				type="file"
				filter="equipment"
			 /><div class="text">Equipment</div
			><CustomBox id="changeActorEquipment-equipment" type="equipment" /></div>
	
</WindowFrame>
</template>

<script setup lang="ts">

import { Command } from '@/command/command-object.ts';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import CustomBox from '@app/components/common/CustomBox.vue';
import SelectVar from '@app/components/common/SelectVar.vue';
import SelectBox from '@app/components/common/SelectBox.vue';


const onConfirm = () => {
	Command?.cases?.changeActorEquipment?.save?.();
};

</script>
