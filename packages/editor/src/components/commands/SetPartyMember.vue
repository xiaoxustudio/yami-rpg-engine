<template>
<WindowFrame id="setPartyMember" @confirm="onConfirm">
	<template #title><TitleBar>Set Party Member<div class="close" /></TitleBar></template>
	
		<div class="grid-box">
			<div class="text">Operation</div><SelectBox id="setPartyMember-operation" v-model="form.operation" /><div class="text">Global Actor</div
			><CustomBox id="setPartyMember-actor" type="actor" @input="onActor" /></div>
	
</WindowFrame>
</template>

<script setup lang="ts">

import { onMounted } from 'vue';
import { useSetPartyMemberCommandSchema } from '@app/composables/commands/useSetPartyMemberCommandSchema';
import { $ } from '@/util/dom.ts';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import CustomBox from '@app/components/common/CustomBox.vue';
import SelectBox from '@app/components/common/SelectBox.vue';

const { form, save } = useSetPartyMemberCommandSchema();

const onActor = (value: unknown) => {
	form.actor = value;
};

const onConfirm = () => {
	save();
};

onMounted(() => {
	$('#setPartyMember-operation')?.loadItems?.([
		{ name: 'Add', value: 'add' },
		{ name: 'Remove', value: 'remove' }
	]);
});

</script>
