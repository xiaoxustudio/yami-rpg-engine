<template>
	<WindowFrame ref="frame" id="ancestorGetter">
		<template #title
			><TitleBar
				>{{ t('components.ancestorGetter.title') }}
				<div class="close" /></TitleBar
		></template>

		<div class="grid-box">
			<div class="text">{{ t('components.ancestorGetter-type.label') }}</div>
			<SelectBox id="ancestorGetter-type" v-focus v-model="form.type" />
			<div class="text">{{ t('components.ancestorGetter-presetId.label') }}</div>
			<CustomBox
				id="ancestorGetter-presetId"
				v-focus
				type="preset-element"
				v-model="form.presetId"
			/>
			<div class="text">{{ t('components.ancestorGetter-variable.label') }}</div>
			<CustomBox
				id="ancestorGetter-variable"
				v-focus
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
import { useAncestorGetterWindow } from '@app/composables/useAncestorGetterWindow';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import { on } from '@app/utils/element-utils';
import CustomBox from '@app/components/common/CustomBox.vue';
import SelectBox from '@app/components/common/SelectBox.vue';

const { t } = useI18n();

const ancestorGetter = useAncestorGetterWindow();
const form = ancestorGetter.form;

const frame = ref<InstanceType<typeof WindowFrame> | null>(null);

onMounted(() => {
	const el = frame.value?.root;
	if (el) {
		on(el, 'closed', () => ancestorGetter.onWindowClosed());
	}
});
</script>
