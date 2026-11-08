<template>
	<WindowFrame id="script" :ref="controlRef('script')" @confirm="onConfirm">
		<template #title
			><TitleBar
				>{{ t('components.script.title') }}
				<div class="text hidden" id="script-mark" :ref="controlRef('script-mark')">✱</div>
				<button
					id="script-change"
					:ref="controlRef('script-change')"
					name="script-change-ts"
				>
					切换为TS
				</button>
				<div class="maximize" id="script-maximize" />
				<div class="close" /> </TitleBar
		></template>

		<div class="box" id="script-script" :ref="controlRef('script-script')"></div>

		<div class="hidden">
			<div
				class="text"
				id="script-text-template"
				:ref="controlRef('script-text-template')"
			></div>
		</div>
	</WindowFrame>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useScriptCommandSchema } from '@app/composables/commands/useScriptCommandSchema';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import { useControlRefs } from '@app/composables/control-refs';

/** 控件 id 联合：模板与脚本共用，拼错在 tsc / vue-tsc 就红。 */
type Id = 'script' | 'script-change' | 'script-mark' | 'script-script' | 'script-text-template';

const { controls, controlRef } = useControlRefs<Id>();

const { t } = useI18n();
const { save, initialize } = useScriptCommandSchema({ controls: () => controls });

const onConfirm = () => {
	save();
};

onMounted(() => {
	initialize();
});
</script>

<style>
#script {
	width: 720px;
	height: calc(238px * 1.5);

	overflow: visible;
}

#script-script {
	position: absolute;
	left: 10px;
	top: 10px;
	width: 700px;
	height: calc(238px * 1.15);

	background-color: var(--input-background);
	border: var(--fieldset-border);
	border-radius: 2px;
}

#script-change {
	margin-left: 20px;
	margin-top: 5px;
}

#script-confirm {
	right: 108px;
	bottom: 10px;
}

#script-cancel {
	right: 10px;
	bottom: 10px;
}
</style>
