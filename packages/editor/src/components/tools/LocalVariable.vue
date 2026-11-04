<template>
	<WindowFrame id="localVariable" @confirm="onConfirm">
		<template #title
			><TitleBar
				>{{ t('components.localVariable.title') }}
				<div class="close"></div></TitleBar
		></template>

		<div class="grid-box">
			<div class="text">{{ t('components.localVariable-key.label') }}</div>
			<TextBox
				:label="t('components.localVariable-key.label')"
				id="localVariable-key"
				v-tip="t('components.localVariable-key.tip')"
				:ref="controlRef('localVariable-key')"
				v-model="form.key"
			/>
		</div>
	</WindowFrame>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { Selection } from '@app/tools/text-capture.ts';
import { useTextCaptureWindow } from '@app/composables/useTextCaptureWindow';
import { TextSuggestion, type TextSuggestionTarget } from '@app/commands/text-tip.ts';
import { VariableGetter } from '@app/commands/accessors/variable-accessor-window.ts';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import TextBox from '@app/components/common/TextBox.vue';
import { controlRoot, useControlRefs } from '@app/composables/control-refs';

/** 控件 id 联合：模板与脚本共用，拼错在 tsc / vue-tsc 就红。 */
type Id = 'localVariable-key';

const { controls, controlRef } = useControlRefs<Id>();

const { t } = useI18n();

const form = useTextCaptureWindow().localVariable.form;

const onConfirm = () => {
	Selection?.localVariable?.confirm?.(new Event('click'));
};

/** 变量名输入框的候选来源是窗口自己的配置（原在 `Selection.localVariable.initialize` 里按 id 取元素）。 */
onMounted(() => {
	TextSuggestion.listen!(
		controlRoot(controls['localVariable-key']) as TextSuggestionTarget,
		VariableGetter.createVarListGenerator!({ filter: 'all' } as never)
	);
});
</script>

<style>
#localVariable {
	width: 324px;
	height: 98px;
}

#localVariable-confirm {
	right: 108px;
	bottom: 10px;
}

#localVariable-cancel {
	right: 10px;
	bottom: 10px;
}
</style>
