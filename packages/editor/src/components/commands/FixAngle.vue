<template>
<WindowFrame id="fixAngle" @confirm="onConfirm">
	<template #title><TitleBar>Fix Angle<div class="close" /></TitleBar></template>
	
		<div class="grid-box">
			<div class="text">Actor</div><CustomBox id="fixAngle-actor" type="actor" @input="onActor" /><div class="text">State</div><SelectBox id="fixAngle-fixed" v-model="form.fixed" /></div>
	
</WindowFrame>
</template>

<script setup lang="ts">

import { onMounted } from 'vue';
import { useFixAngleCommandSchema } from '@app/composables/commands/useFixAngleCommandSchema';
import { $ } from '@/util/dom.ts';
import { Local } from '@/tools/localization.ts';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import CustomBox from '@app/components/common/CustomBox.vue';
import SelectBox from '@app/components/common/SelectBox.vue';

const { form, save } = useFixAngleCommandSchema();

const onActor = (value: unknown) => {
	form.actor = value;
};

const onConfirm = () => {
	save();
};

onMounted(() => {
	const get = Local.createGetter!('command.fixAngle');
	$('#fixAngle-fixed')?.loadItems?.([
		{ name: get('fixed.true') || 'Fixed', value: true },
		{ name: get('fixed.false') || 'Unfixed', value: false }
	]);
});

</script>
