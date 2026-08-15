<template>
	<WindowFrame id="setNumber" @confirm="onConfirm">
		<template #title><TitleBar>Set Number<div class="close" /></TitleBar></template>
		
			<div class="grid-box">
				<div class="text">Variable</div
				><CustomBox
					id="setNumber-variable"
					type="variable"
					filter="writable-number"
				/>
				<div class="text">Expression</div><ParamList id="setNumber-operands" />
			</div>
		
	</WindowFrame>
</template>

<script setup lang="ts">

import { Command } from '@/command/command-object.ts';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import CustomBox from '@app/components/common/CustomBox.vue';
import ParamList from '@app/components/common/ParamList.vue';


const onConfirm = () => {
	Command?.cases?.setNumber?.save?.();
};

</script>
