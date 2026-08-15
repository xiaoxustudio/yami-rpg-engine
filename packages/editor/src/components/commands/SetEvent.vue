<template>
<WindowFrame id="setEvent" @confirm="onConfirm">
	<template #title><TitleBar>Set Event<div class="close" /></TitleBar></template>
	
		<div class="grid-box">
			<div class="text">Operation</div><SelectBox id="setEvent-operation" />
			<div class="text">Variable</div
			><CustomBox id="setEvent-variable" type="variable" filter="object" />
			<div class="text">Event</div
			><CustomBox id="setEvent-eventId" type="file" filter="event" />
			<div class="text">Choice Index</div
			><NumberVar id="setEvent-choiceIndex" min="0" max="255" />
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
	Command?.cases?.setEvent?.save?.();
};

</script>
