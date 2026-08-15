<template>
	<WindowFrame id="setObjectProperty" @confirm="onConfirm">
		<template #title><TitleBar>setObjectProperty<div class="close" /></TitleBar></template>
		
			<div class="grid-box">
				<div class="text">Variable</div
				><CustomBox
					id="setObjectProperty-variable"
					type="variable"
					filter="object"
				/>
				<div class="text">setObjectProperty</div><ParamList id="setObjectProperty-list" />
				<div class="text">valueVariable</div
				><CustomBox
					id="setObjectProperty-value-variable"
					type="variable"
					filter="all"
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
	Command?.cases?.setObjectProperty?.save?.();
};

</script>
