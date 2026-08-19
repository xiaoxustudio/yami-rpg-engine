<template>
<WindowFrame id="setPartyMember" @confirm="onConfirm">
	<template #title><TitleBar>{{ t('components.setPartyMember.title') }}<div class="close" /></TitleBar></template>
	
		<div class="grid-box">
			<div class="text">Operation</div><SelectBox id="setPartyMember-operation" v-model="form.operation" /><div class="text">Global Actor</div
			><CustomBox id="setPartyMember-actor" type="actor" @input="onActor" /></div>
	
</WindowFrame>
</template>

<script setup lang="ts">

import { onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useSetPartyMemberCommandSchema } from '@app/composables/commands/useSetPartyMemberCommandSchema';
import { $ } from '@app/legacy/util/dom.ts';
import { createGetter } from '@app/i18n';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import CustomBox from '@app/components/common/CustomBox.vue';
import SelectBox from '@app/components/common/SelectBox.vue';

const { t } = useI18n();

const { form, save } = useSetPartyMemberCommandSchema();

const onActor = (value: unknown) => {
	form.actor = value;
};

const onConfirm = () => {
	save();
};

onMounted(() => {
	const get = createGetter('command.setPartyMember');
	$('#setPartyMember-operation')?.loadItems?.([
		{ name: get('add') || 'Add', value: 'add' },
		{ name: get('remove') || 'Remove', value: 'remove' }
	]);
});

</script>
