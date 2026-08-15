<template>
<WindowFrame id="setItem" @confirm="onConfirm">
	<template #title><TitleBar>Set Item<div class="close" /></TitleBar></template>
	
		<div class="grid-box">
			<div class="text">Item</div><CustomBox id="setItem-item" type="item" />
			<div class="text">Operation</div><SelectBox id="setItem-operation" />
			<div class="text">Quantity</div><NumberVar id="setItem-quantity" min="1" max="10000" />
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
	Command?.cases?.setItem?.save?.();
};

</script>
