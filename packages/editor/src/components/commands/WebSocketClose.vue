<template>
	<WindowFrame id="webSocketClose" @confirm="onConfirm">
		<template #title><TitleBar>{{ t('components.webSocketClose.title') }}<div class="close" /></TitleBar></template>
		
			<div class="grid-box">
				<div class="text">ID</div><StringVar id="webSocketClose-id" v-model="form.id" /> <div class="text">Code</div
				><NumberBox id="webSocketClose-code" min="1000" max="4999" v-model="form.code" />
				<div class="text">Reason</div><StringVar id="webSocketClose-reason" v-model="form.reason" />
			</div>
		
	</WindowFrame>
	
</template>

<script setup lang="ts">

import { useI18n } from 'vue-i18n';
import { useWebSocketCloseCommandSchema } from '@app/composables/commands/useWebSocketCloseCommandSchema';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import NumberBox from '@app/components/common/NumberBox.vue';
import StringVar from '@app/components/common/StringVar.vue';

const { t } = useI18n();

const { form, save } = useWebSocketCloseCommandSchema();

const onConfirm = () => {
	save();
};

</script>
