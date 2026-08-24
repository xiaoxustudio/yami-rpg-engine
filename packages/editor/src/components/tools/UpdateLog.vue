<template>
	<!-- 公告窗口 -->
	<WindowFrame id="update-log" no-buttons>
		<template #title><TitleBar>{{ t('components.update-log.title') }}<div class="close" /></TitleBar></template>
		
			<div class="box" id="update-log-tabs" @click="onTabsClick">
				<button id="update-log-tab-internal" class="update-log-tab" :class="{ active: mode === 'internal' }">{{ tabInternal }}</button>
				<button id="update-log-tab-community" class="update-log-tab" :class="{ active: mode === 'community' }">{{ tabCommunity }}</button>
				<button id="update-log-tab-donation" class="update-log-tab" :class="{ active: mode === 'donation' }">{{ tabDonation }}</button>
			</div>
			<div class="box" id="update-log-container">
				<div class="box" id="update-log-content">
					<template v-if="mode === 'donation'">
						<div class="update-log-title text"><b>感谢以下捐赠者对项目的支持！</b></div>
						<div class="box donation-list">
							<div v-for="donor in donors" :key="donor.name" class="text donation-item">
								<a href="#" @click.prevent="onDonorClick(donor)">{{ donor.name }}</a>: ￥{{ donor.amount.toFixed(2) }}
							</div>
						</div>
					</template>
					<template v-else>
					<template v-for="(item, index) in items" :key="index">
						<div v-if="item.title" class="update-log-title text" v-html="item.titleHtml"></div>
						<div v-if="item.major" class="update-log-major text" v-html="item.majorHtml"></div>
						<div v-if="item.minor" class="update-log-minor text" v-html="item.minorHtml"></div>
					</template>
					</template>
				</div>
			</div>
		
	</WindowFrame>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { UpdateLog, type UpdateLogItem } from '@app/log/update-log-window.ts';
import { markndownToHtml } from '@app/module/global.ts';
import { File } from '@app/file/file-system-core.ts';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import { useInspectorStore } from '@app/stores/inspector';
import { useLocalStore } from '@app/stores/local';

const { t } = useI18n();

interface Donor {
	name: string;
	amount: number;
	link: string;
}

const donors: Donor[] = [
	{
		name: '刀里个刀(420488038)',
		amount: 200,
		link: 'tencent://message/?uin=420488038&Site=qq&Menu=yes'
	},
	{
		name: 'ya(332685057)',
		amount: 100,
		link: 'tencent://message/?uin=332685057&Site=qq&Menu=yes'
	}
];

const inspector = useInspectorStore();
const local = useLocalStore();

const mode = ref<string>('internal');
const items = ref<Array<UpdateLogItem & { titleHtml?: string; majorHtml?: string; minorHtml?: string }>>([]);

const md = (text: string): string => markndownToHtml(text);

const refresh = () => {
	mode.value = UpdateLog.currentMode ?? 'internal';
	const raw =
		mode.value === 'internal' ? UpdateLog.internalItems : UpdateLog.communityItems;
	items.value = (raw ?? []).map((item) => ({
		...item,
		titleHtml: item.title ? md(item.title) : '',
		majorHtml: item.major ? md(item.major) : '',
		minorHtml: item.minor ? md(item.minor) : ''
	}));
};

const tabInternal = computed(() => local.get('menuOpenYami.update-log-tab-internal'));
const tabCommunity = computed(() => local.get('menuOpenYami.update-log-tab-community'));
const tabDonation = computed(() => local.get('menuOpenYami.update-log-tab-donation'));

const onTabsClick = (event: MouseEvent) => {
	UpdateLog?.tabsClick?.(event);
};

const onDonorClick = (donor: Donor) => {
	File.openURL?.(donor.link);
};

onMounted(() => {


	refresh();
	window.addEventListener('update-log-update', refresh);
});

onBeforeUnmount(() => {
	window.removeEventListener('update-log-update', refresh);
});
</script>
