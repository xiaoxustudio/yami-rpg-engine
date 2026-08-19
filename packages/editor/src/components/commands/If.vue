<template>
<WindowFrame id="if" @confirm="onConfirm">
	<template #title><TitleBar>{{ t('components.if.title') }}<div class="close" /></TitleBar></template>
	
		<div class="grid-box"> <div class="text">Branches</div><ParamList id="if-branches" /> </div>
		<CheckBox id="if-else" v-model="form.else" class="standard"><div class="text" id="if-else-label">Else</div></CheckBox>
	
</WindowFrame>
</template>

<script setup lang="ts">

import { onMounted, reactive } from 'vue';
import { useI18n } from 'vue-i18n';
import { $ } from '@app/utils/dom';
import { on } from '@app/utils/element-utils.ts';
import { IfBranch } from '@app/legacy/command/conditional-branch-window.ts';
import { IfCondition } from '@app/legacy/command/conditional-condition-window.ts';
import { useIfCommandSchema } from '@app/composables/commands/useIfCommandSchema';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import CheckBox from '@app/components/common/CheckBox.vue';
import ParamList from '@app/components/common/ParamList.vue';

const { t } = useI18n();

const { save, windowClosed } = useIfCommandSchema();

const form = reactive({ else: false });

const onConfirm = () => {
	save();
};

onMounted(() => {
	$('#if-branches')?.bind?.(IfBranch);
	$('#if-branch-conditions')?.bind?.(IfCondition);
	on($('#if'), 'closed', () => windowClosed(new Event('closed')));
});

</script>
