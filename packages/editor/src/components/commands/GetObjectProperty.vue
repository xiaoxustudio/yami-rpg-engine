<template>
	<WindowFrame id="getObjectProperty" @confirm="onConfirm">
		<template #title><TitleBar>getObjectProperty<div class="close" /></TitleBar></template>
		
			<div class="grid-box">
				<div class="text">Variable</div
				><CustomBox
					id="getObjectProperty-variable"
					type="variable"
					filter="object"
				/>
				<div class="text">getObjectProperty</div><ParamList id="getObjectProperty-list" />
				<div class="text">saveVariable</div
				><CustomBox
					id="getObjectProperty-save-variable"
					type="variable"
					filter="object"
				/>
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
	Command?.cases?.getObjectProperty?.save?.();
};

</script>
