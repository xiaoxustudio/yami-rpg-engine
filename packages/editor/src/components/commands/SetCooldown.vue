<template>
<WindowFrame id="setCooldown" @confirm="onConfirm">
	<template #title><TitleBar>{{ t('components.setCooldown.title') }}<div class="close" /></TitleBar></template>
	
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
import { useI18n } from 'vue-i18n';
import { useSetCooldownCommandSchema } from '@app/composables/commands/useSetCooldownCommandSchema';
import { $ } from '@app/legacy/util/dom.ts';
import { createGetter } from '@app/i18n';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import CustomBox from '@app/components/common/CustomBox.vue';
import NumberVar from '@app/components/common/NumberVar.vue';
import SelectVar from '@app/components/common/SelectVar.vue';
import SelectBox from '@app/components/common/SelectBox.vue';

const { t } = useI18n();

const { form, save } = useSetCooldownCommandSchema();

const onActor = (value: unknown) => {
	form.actor = value;
};

const onConfirm = () => {
	save();
};

onMounted(() => {
	const get = createGetter('command.setCooldown');
	$('#setCooldown-operation')?.loadItems?.([
		{ name: get('set') || 'Set', value: 'set' },
		{ name: get('increase') || 'Increase', value: 'increase' },
		{ name: get('decrease') || 'Decrease', value: 'decrease' }
	]);
});

</script>
