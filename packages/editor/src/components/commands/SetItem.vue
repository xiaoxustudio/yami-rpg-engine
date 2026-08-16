<template>
<WindowFrame id="setItem" @confirm="onConfirm">
	<template #title><TitleBar>Set Item<div class="close" /></TitleBar></template>
	
		<div class="grid-box">
			<div class="text">Item</div><CustomBox id="setItem-item" type="item" @input="onItem" />
			<div class="text">Operation</div><SelectBox id="setItem-operation" v-model="form.operation" />
			<div class="text">Quantity</div><NumberVar id="setItem-quantity" min="1" max="10000" v-model="form.quantity" />
		</div>
	
</WindowFrame>
</template>

<script setup lang="ts">

import { onMounted } from 'vue';
import { useSetItemCommandSchema } from '@app/composables/commands/useSetItemCommandSchema';
import { $ } from '@/util/dom.ts';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import CustomBox from '@app/components/common/CustomBox.vue';
import NumberVar from '@app/components/common/NumberVar.vue';
import SelectBox from '@app/components/common/SelectBox.vue';

const { form, save } = useSetItemCommandSchema();

const onItem = (value: unknown) => {
	form.item = value;
};

const onConfirm = () => {
	save();
};

onMounted(() => {
	$('#setItem-operation')?.loadItems?.([
		{ name: 'Increase', value: 'increase' },
		{ name: 'Decrease', value: 'decrease' }
	]);
});

</script>
