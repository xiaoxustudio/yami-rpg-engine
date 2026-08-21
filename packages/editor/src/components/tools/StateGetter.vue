<template>
	<!-- 状态访问器窗口 -->
	<WindowFrame ref="frame" id="stateGetter">
		<template #title><TitleBar>{{ t('components.stateGetter.title') }}<div class="close" /></TitleBar></template>
		
			<div class="grid-box">
				<div class="text">{{ t('components.stateGetter-type.label') }}</div><SelectBox id="stateGetter-type" v-model="form.type" /> <div class="text">{{ t('components.stateGetter-actor.label') }}</div
				><CustomBox id="stateGetter-actor" type="actor" v-model="form.actor" /> <div class="text">{{ t('components.stateGetter-stateId.label') }}</div
				><CustomBox id="stateGetter-stateId" type="file" filter="state" v-model="form.stateId" />
				<div class="text">{{ t('components.stateGetter-variable.label') }}</div
				><CustomBox id="stateGetter-variable" type="variable" filter="object" v-model="form.variable" />
			</div>
		
	</WindowFrame>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useStateGetterWindow } from '@app/composables/useStateGetterWindow';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import { useInspectorStore } from '@app/stores/inspector';
import { useLocalStore } from '@app/stores/local';
import CustomBox from '@app/components/common/CustomBox.vue';
import SelectBox from '@app/components/common/SelectBox.vue';

const { t } = useI18n();

const stateGetter = useStateGetterWindow();
const form = stateGetter.form;

const frame = ref<InstanceType<typeof WindowFrame> | null>(null);

const inspector = useInspectorStore();
const local = useLocalStore();

onMounted(() => {
	const el = frame.value?.root;
	if (el) {
		el.on('closed', () => stateGetter.onWindowClosed());
	}


});
</script>
