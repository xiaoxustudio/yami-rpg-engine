<template>
<WindowFrame id="return" @confirm="onConfirm">
	<template #title><TitleBar>Return<div class="close" /></TitleBar></template>
	
		<div class="grid-box">
			<div class="text">Type</div><SelectBox id="return-type" /> <div class="text">Boolean</div
			><SelectBox id="return-boolean" /> <div class="text">Number</div
			><NumberVar
				id="return-number"
				min="-1000000000"
				max="1000000000"
				decimals="10"
			 />
			<div class="text">String</div><StringVar id="return-string" /> <div class="text">Object</div
			><CustomBox id="return-object" type="variable" filter="object" />
			<div class="text">Actor</div><CustomBox id="return-actor" type="actor" />
			<div class="text">Skill</div><CustomBox id="return-skill" type="skill" />
			<div class="text">State</div><CustomBox id="return-state" type="state" />
			<div class="text">Equipment</div><CustomBox id="return-equipment" type="equipment" />
			<div class="text">Item</div><CustomBox id="return-item" type="item" />
			<div class="text">Trigger</div><CustomBox id="return-trigger" type="trigger" />
			<div class="text">Light</div><CustomBox id="return-light" type="light" />
			<div class="text">Element</div><CustomBox id="return-element" type="element" />
		</div>
	
</WindowFrame>
</template>

<script setup lang="ts">

import { Command } from '@/command/command-object.ts';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import CustomBox from '@app/components/common/CustomBox.vue';
import NumberVar from '@app/components/common/NumberVar.vue';
import StringVar from '@app/components/common/StringVar.vue';
import SelectBox from '@app/components/common/SelectBox.vue';


const onConfirm = () => {
	Command?.cases?.return?.save?.();
};

</script>
