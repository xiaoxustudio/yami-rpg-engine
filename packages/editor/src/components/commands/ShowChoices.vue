<template>
<WindowFrame id="showChoices" @confirm="onConfirm">
	<template #title><TitleBar>Show Choices<div class="close" /></TitleBar></template>
	
		<div class="grid-box">
			<div class="text">Choices</div><ParamList id="showChoices-choices" />
			<div class="text">Parameters</div><TextBox id="showChoices-parameters" v-model="form.parameters" />
		</div>
	
</WindowFrame>
</template>

<script setup lang="ts">

import { onMounted, reactive } from 'vue';
import { $ } from '@/util/dom.ts';
import { on } from '@/util/element-utils.ts';
import { Choices } from '@/command/show-options-window.ts';
import { useShowChoicesCommandSchema } from '@app/composables/commands/useShowChoicesCommandSchema';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import TextBox from '@app/components/common/TextBox.vue';
import ParamList from '@app/components/common/ParamList.vue';

const { save, windowClosed } = useShowChoicesCommandSchema();

const form = reactive({ parameters: '' });

const onConfirm = () => {
	save();
};

onMounted(() => {
	$('#showChoices-choices')?.bind?.(Choices);
	on($('#showChoices'), 'closed', () => windowClosed(new Event('closed')));
});

</script>
