<template>
	<WindowFrame ref="frame" id="elementGetter" @confirm="onConfirm">
		<template #title
			><TitleBar
				>{{ t('components.elementGetter.title') }}
				<div class="close" /></TitleBar
		></template>

		<div class="grid-box">
			<div class="text">{{ t('components.elementGetter-type.label') }}</div>
			<SelectBox id="elementGetter-type" v-model="form.type" />
			<div class="text">{{ t('components.elementGetter-ancestor.label') }}</div>
			<CustomBox
				id="elementGetter-ancestor"
				type="ancestor-element"
				v-model="form.ancestor"
			/>
			<div class="text">{{ t('components.elementGetter-presetId.label') }}</div>
			<CustomBox id="elementGetter-presetId" type="preset-element" v-model="form.presetId" />
			<div class="text">{{ t('components.elementGetter-index.label') }}</div>
			<NumberVar id="elementGetter-index" min="0" max="10000" v-model="form.index" />
			<div class="text">{{ t('components.elementGetter-variable.label') }}</div>
			<CustomBox
				id="elementGetter-variable"
				type="variable"
				filter="object"
				v-model="form.variable"
			/>
		</div>
	</WindowFrame>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { ElementGetter } from '@app/commands/accessors/element-accessor-window.ts';
import { useElementGetterWindow } from '@app/composables/useElementGetterWindow';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import { useInspectorStore } from '@app/stores/inspector';
import { useLocalStore } from '@app/stores/local';
import CustomBox from '@app/components/common/CustomBox.vue';
import NumberVar from '@app/components/common/NumberVar.vue';
import SelectBox from '@app/components/common/SelectBox.vue';

const { t } = useI18n();

const elementGetter = useElementGetterWindow();
const form = elementGetter.form;

const frame = ref<InstanceType<typeof WindowFrame> | null>(null);

const inspector = useInspectorStore();
const local = useLocalStore();

const onConfirm = () => {
	ElementGetter?.confirm?.();
};

onMounted(() => {
	const el = frame.value?.root;
	if (el) {
		el.on('closed', () => elementGetter.onWindowClosed());
	}
});
</script>
