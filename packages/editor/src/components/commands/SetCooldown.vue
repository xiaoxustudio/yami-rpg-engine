<template>
<WindowFrame id="setCooldown" @confirm="onConfirm">
	<template #title><TitleBar>Set Cooldown<div class="close" /></TitleBar></template>
	
		<div class="grid-box">
			<div class="text">Actor</div><CustomBox id="setCooldown-actor" type="actor" @input="onActor" />
			<div class="text">Operation</div><SelectBox id="setCooldown-operation" v-model="form.operation" />
			<div class="text">Cooldown Key</div><SelectVar id="setCooldown-key" />
			<div class="text">Cooldown Time</div
			><NumberVar id="setCooldown-cooldown" min="1" max="3600000" unit="ms" v-model="form.cooldown" />
		</div>
	
</WindowFrame>
</template>

<script setup lang="ts">

import { onMounted } from 'vue';
import { useSetCooldownCommandSchema } from '@app/composables/commands/useSetCooldownCommandSchema';
import { $ } from '@/util/dom.ts';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import CustomBox from '@app/components/common/CustomBox.vue';
import NumberVar from '@app/components/common/NumberVar.vue';
import SelectVar from '@app/components/common/SelectVar.vue';
import SelectBox from '@app/components/common/SelectBox.vue';

const { form, save } = useSetCooldownCommandSchema();

const onActor = (value: unknown) => {
	form.actor = value;
};

const onConfirm = () => {
	save();
};

onMounted(() => {
	$('#setCooldown-operation')?.loadItems?.([
		{ name: 'Set', value: 'set' },
		{ name: 'Increase', value: 'increase' },
		{ name: 'Decrease', value: 'decrease' }
	]);
});

</script>
