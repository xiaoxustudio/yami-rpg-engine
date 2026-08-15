<template>
	<WindowFrame id="setObject" @confirm="onConfirm">
		<template #title><TitleBar>Set Object<div class="close" /></TitleBar></template>
		
			<div class="grid-box">
				<div class="text">Variable</div
				><CustomBox id="setObject-variable" type="variable" filter="object" />
				<div class="text">Type</div><SelectBox id="setObject-operand-type" /> <div class="text">Actor</div
				><CustomBox id="setObject-operand-actor" type="actor" /> <div class="text">Skill</div
				><CustomBox id="setObject-operand-skill" type="skill" /> <div class="text">State</div
				><CustomBox id="setObject-operand-state" type="state" />
				<div class="text">Equipment</div
				><CustomBox id="setObject-operand-equipment" type="equipment" />
				<div class="text">Item</div><CustomBox id="setObject-operand-item" type="item" />
				<div class="text">Trigger</div
				><CustomBox id="setObject-operand-trigger" type="trigger" />
				<div class="text">Light</div><CustomBox id="setObject-operand-light" type="light" />
				<div class="text">Object</div><CustomBox id="setObject-operand-object" type="object" />
				<div class="text">Element</div
				><CustomBox id="setObject-operand-element" type="element" />
				<div class="text">Variable</div
				><CustomBox
					id="setObject-operand-variable"
					type="variable"
					filter="object"
				/>
				<div class="text">Index</div
				><NumberVar id="setObject-operand-list-index" min="0" max="1000000000" />
			</div>
		
	</WindowFrame>
</template>

<script setup lang="ts">

import { Command } from '@/command/command-object.ts';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import CustomBox from '@app/components/common/CustomBox.vue';
import NumberVar from '@app/components/common/NumberVar.vue';
import SelectBox from '@app/components/common/SelectBox.vue';


const onConfirm = () => {
	Command?.cases?.setObject?.save?.();
};

</script>
