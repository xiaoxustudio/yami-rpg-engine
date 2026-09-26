<template>
	<Teleport to="body">
		<div class="layout-palette-holder" :style="{ display: 'none' }">
			<slot />
		</div>
	</Teleport>
</template>

<script setup lang="ts">
// 整壳 Teleport 是唯一形态——palette 支架
// （#layout-content 内 NavBar/PageManager 及 12 页壳）常驻 body 隐藏容器，
// 工作区宿主页保持为空，供引擎把 Vue 组树挂进宿主页（几何与命令式一致）。无 DOM API。
</script>
