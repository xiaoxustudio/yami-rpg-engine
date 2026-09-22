<script setup lang="ts">
import { nextTick, onBeforeUnmount, onMounted, ref } from 'vue';
import { YMScrollBar, YMButton } from '@ui-kit';
const hBarRef = ref<InstanceType<typeof YMScrollBar> | null>(null);
const vBarRef = ref<InstanceType<typeof YMScrollBar> | null>(null);
const targetRef = ref<HTMLElement | null>(null);

const update = (): void => {
	hBarRef.value?.updateHorizontalBar();
	vBarRef.value?.updateVerticalBar();
};

onMounted(() => {
	const target = targetRef.value;
	if (!target) return;
	hBarRef.value?.bind(target, 'horizontal');
	vBarRef.value?.bind(target, 'vertical');
	target.addEventListener('scroll', update);
	nextTick(update);
});

onBeforeUnmount(() => {
	targetRef.value?.removeEventListener('scroll', update);
});

const scrollToTop = (): void => {
	targetRef.value?.scrollTo({ top: 0 });
	update();
};

const scrollToBottom = (): void => {
	const target = targetRef.value;
	if (!target) return;
	target.scrollTop = target.scrollHeight;
	update();
};

const scrollToLeft = (): void => {
	targetRef.value?.scrollTo({ left: 0 });
	update();
};

const scrollToRight = (): void => {
	const target = targetRef.value;
	if (!target) return;
	target.scrollLeft = target.scrollWidth;
	update();
};
</script>

<template>
	<section>
		<h2>YMScrollBar</h2>
		<p class="desc">自定义滚动条；绑定目标元素后替代原生滚动条，可拖动滑块或点击轨道翻页。</p>
		<div class="row">
			<YMButton size="sm" @click="scrollToTop">Top</YMButton>
			<YMButton size="sm" @click="scrollToBottom">Bottom</YMButton>
			<YMButton size="sm" @click="scrollToLeft">Left</YMButton>
			<YMButton size="sm" @click="scrollToRight">Right</YMButton>
		</div>
		<div class="stage">
			<div ref="targetRef" class="viewport">
				<div class="content">
					<div v-for="i in 40" :key="i" class="line">
						{{ i }}. The quick brown fox jumps over the lazy dog.
					</div>
				</div>
			</div>
			<YMScrollBar ref="hBarRef" />
			<YMScrollBar ref="vBarRef" />
		</div>
	</section>
</template>

<style scoped>
.stage {
	position: relative;
	margin-top: var(--ym-space-3);
	width: 360px;
	height: 200px;
	background-color: var(--ym-color-input-bg);
	border: 1px solid var(--ym-color-border);
}

.viewport {
	position: absolute;
	inset: 0;
	overflow: hidden;
}

.content {
	width: 720px;
}

.line {
	height: 20px;
	line-height: 20px;
	padding: 0 var(--ym-space-2);
	font-size: var(--ym-font-size-sm);
	white-space: nowrap;
}
</style>
