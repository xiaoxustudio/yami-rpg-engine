<template>
	<WindowFrame id="script" :ref="registryRef(composableEls, 'script')" @confirm="onConfirm">
		<template #title
			><TitleBar
				>{{ t('components.script.title') }}
				<div
					class="text hidden"
					id="script-mark"
					:ref="registryRef(composableEls, 'script-mark')"
				>
					✱
				</div>
				<button
					id="script-change"
					:ref="registryRef(composableEls, 'script-change')"
					name="script-change-ts"
				>
					切换为TS
				</button>
				<div class="maximize" id="script-maximize" />
				<div class="close" /> </TitleBar
		></template>

		<div
			class="box"
			id="script-script"
			:ref="registryRef(composableEls, 'script-script')"
		></div>

		<div class="hidden">
			<div
				class="text"
				id="script-text-template"
				:ref="registryRef(composableEls, 'script-text-template')"
			></div>
		</div>
	</WindowFrame>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { composableEls } from '@app/composables/element-registry';
import { registryRef } from '@app/utils/element-registry';
import { useScriptCommandSchema } from '@app/composables/commands/useScriptCommandSchema';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';

const { t } = useI18n();
const { save, initialize } = useScriptCommandSchema();

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
