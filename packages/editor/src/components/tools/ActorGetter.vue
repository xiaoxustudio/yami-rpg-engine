<template>
	<WindowFrame ref="frame" id="actorGetter" @confirm="onConfirm">
		<template #title><TitleBar>{{ t('components.actorGetter.title') }}<div class="close" /></TitleBar></template>
		
			<div class="grid-box">
				<div class="text">{{ t('components.actorGetter-type.label') }}</div><SelectBox id="actorGetter-type" v-model="form.type" /> <div class="text">{{ t('components.actorGetter-memberId.label') }}</div
				><NumberVar id="actorGetter-memberId" min="0" max="10000" v-model="form.memberId" />
				<div class="text">{{ t('components.actorGetter-actorId.label') }}</div
				><CustomBox id="actorGetter-actorId" type="file" filter="actor" v-model="form.actorId" />
				<div class="text">{{ t('components.actorGetter-presetId.label') }}</div
				><CustomBox id="actorGetter-presetId" type="preset-object" filter="actor" v-model="form.presetId" />
				<div class="text">{{ t('components.actorGetter-variable.label') }}</div
				><CustomBox id="actorGetter-variable" type="variable" filter="object" v-model="form.variable" />
			</div>
		
	</WindowFrame>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { ActorGetter } from '@app/commands/accessors/actor-accessor-window.ts';
import { useActorGetterWindow } from '@app/composables/useActorGetterWindow';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import { useInspectorStore } from '@app/stores/inspector';
import { useLocalStore } from '@app/stores/local';
import CustomBox from '@app/components/common/CustomBox.vue';
import NumberVar from '@app/components/common/NumberVar.vue';
import SelectBox from '@app/components/common/SelectBox.vue';

const { t } = useI18n();

const actorGetter = useActorGetterWindow();
const form = actorGetter.form;

const frame = ref<InstanceType<typeof WindowFrame> | null>(null);

const inspector = useInspectorStore();
const local = useLocalStore();

const onConfirm = () => {
	ActorGetter?.confirm?.();
};

onMounted(() => {
	const el = frame.value?.root;
	if (el) {
		el.on('closed', () => actorGetter.onWindowClosed());
	}
});
</script>
