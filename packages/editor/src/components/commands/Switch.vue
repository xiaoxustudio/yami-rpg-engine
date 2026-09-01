<template>
	<WindowFrame id="switch" @confirm="onConfirm">
		<template #title
			><TitleBar
				>{{ t('components.switch.title') }}
				<div class="close" /></TitleBar
		></template>

		<div class="grid-box">
			<div class="text">Variable</div>
			<CustomBox id="switch-variable" v-focus type="variable" filter="all" v-model="form.variable" />
			<div class="text">Branches</div>
			<ParamList id="switch-branches" v-focus v-model="form.branches" />
		</div>
		<CheckBox id="switch-default" v-model="form.default" class="standard"
			><div class="text" id="switch-default-label">Default</div></CheckBox
		>
	</WindowFrame>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { $ } from '@app/utils/dom';
import { on } from '@app/utils/element-utils.ts';
import { useSwitchBranchSchema } from '@app/composables/useSwitchBranchSchema';
import { useSwitchConditionSchema } from '@app/composables/useSwitchConditionSchema';

const SwitchBranch = useSwitchBranchSchema();
const SwitchCondition = useSwitchConditionSchema();
import { useSwitchCommandSchema } from '@app/composables/commands/useSwitchCommandSchema';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import CheckBox from '@app/components/common/CheckBox.vue';
import CustomBox from '@app/components/common/CustomBox.vue';
import ParamList from '@app/components/common/ParamList.vue';

const { t } = useI18n();

const { form, save, windowClosed } = useSwitchCommandSchema();

const onConfirm = () => {
	save();
};

onMounted(() => {
	$('#switch-branches')?.bind?.(SwitchBranch);
	$('#switch-branch-conditions')?.bind?.(SwitchCondition);
	on($('#switch'), 'closed', () => windowClosed(new Event('closed')));
});
</script>
