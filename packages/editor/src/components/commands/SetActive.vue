<template>
<WindowFrame id="setActive" @confirm="onConfirm">
	<template #title><TitleBar>Set Active<div class="close" /></TitleBar></template>
	
		<div class="grid-box">
			<div class="text">Actor</div><CustomBox id="setActive-actor" type="actor" @input="onActor" /><div class="text">State</div><SelectBox id="setActive-active" v-model="form.active" /></div>
	
</WindowFrame>
</template>

<script setup lang="ts">

import { onMounted } from 'vue';
import { useSetActiveCommandSchema } from '@app/composables/commands/useSetActiveCommandSchema';
import { $ } from '@app/legacy/util/dom.ts';
import { createGetter } from '@app/i18n';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import CustomBox from '@app/components/common/CustomBox.vue';
import SelectBox from '@app/components/common/SelectBox.vue';

const { form, save } = useSetActiveCommandSchema();

const onActor = (value: unknown) => {
	form.actor = value;
};

const onConfirm = () => {
	save();
};

onMounted(() => {
	const get = createGetter('command.setActive');
	$('#setActive-active')?.loadItems?.([
		{ name: get('active.true') || 'Active', value: true },
		{ name: get('active.false') || 'Inactive', value: false }
	]);
});

</script>
