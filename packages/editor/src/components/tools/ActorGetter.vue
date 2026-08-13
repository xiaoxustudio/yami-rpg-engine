<template>
	<WindowFrame id="actorGetter" @confirm="onConfirm">
		<template #title><TitleBar>Actor<div class="close" /></TitleBar></template>
		
			<div class="grid-box">
				<div class="text">Type</div><SelectBox id="actorGetter-type" /> <div class="text">Member ID</div
				><NumberVar id="actorGetter-memberId" min="0" max="10000" />
				<div class="text">Actor</div
				><CustomBox id="actorGetter-actorId" type="file" filter="actor" />
				<div class="text">Data ID</div
				><CustomBox id="actorGetter-presetId" type="preset-object" filter="actor" />
				<div class="text">Variable</div
				><CustomBox id="actorGetter-variable" type="variable" filter="object" />
			</div>
		
	</WindowFrame>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { ActorGetter } from '@/command/actor-accessor-window.ts';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import { useInspectorStore } from '@app/stores/inspector';
import { useLocalStore } from '@app/stores/local';
import CustomBox from '@app/components/common/CustomBox.vue';
import NumberVar from '@app/components/common/NumberVar.vue';
import SelectBox from '@app/components/common/SelectBox.vue';

const inspector = useInspectorStore();
const local = useLocalStore();

const onConfirm = () => {
	ActorGetter?.confirm?.();
};

onMounted(() => {
	inspector.syncState();
	local.syncState();
});
</script>
