<template>
<WindowFrame id="switch" @confirm="onConfirm">
	<template #title><TitleBar>Switch<div class="close" /></TitleBar></template>
	
		<div class="grid-box">
			<div class="text">Variable</div
			><CustomBox id="switch-variable" type="variable" filter="all" v-model="form.variable" />
			<div class="text">Branches</div><ParamList id="switch-branches" />
		</div>
		<CheckBox id="switch-default" v-model="form.default" class="standard"
			><div class="text" id="switch-default-label">Default</div></CheckBox
		>
	
</WindowFrame>
</template>

<script setup lang="ts">

import { onMounted, reactive } from 'vue';
import { $ } from '@/util/dom.ts';
import { on } from '@/util/element-utils.ts';
import { SwitchBranch } from '@/command/match-branch-window.ts';
import { SwitchCondition } from '@/command/match-condition-window.ts';
import { useSwitchCommandSchema } from '@app/composables/commands/useSwitchCommandSchema';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import CheckBox from '@app/components/common/CheckBox.vue';
import CustomBox from '@app/components/common/CustomBox.vue';
import ParamList from '@app/components/common/ParamList.vue';

const { save, windowClosed } = useSwitchCommandSchema();

const form = reactive({
	variable: { type: 'local', key: '' },
	default: false
});

const onConfirm = () => {
	save();
};

onMounted(() => {
	$('#switch-branches')?.bind?.(SwitchBranch);
	$('#switch-branch-conditions')?.bind?.(SwitchCondition);
	on($('#switch'), 'closed', () => windowClosed(new Event('closed')));
});

</script>
