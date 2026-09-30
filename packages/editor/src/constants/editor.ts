// 编辑器 UI / 引擎共享常量（消除魔法数字）

// 动画时间轴单元格尺寸（px）
export const ANIM_GRID_X = 16;
export const ANIM_GRID_Y = 20;

// 列表类提示（命令/文本）与事件编辑器行高（px，与 CSS 一致）
export const ROW_HEIGHT = 20;

// 提示列表（命令/文本建议）最多可见行数，与"下方空间不足则翻到上方"的行数阈值
export const TIP_MAX_LINES = 30;
export const TIP_MIN_BELOW_LINES = 10;

// 资源节点 ping 阈值（ms）
export const PING_SLOW_MS = 500;
export const PING_WARN_MS = 1000;

// 粒子「未出现」判定超时（ms）
export const PARTICLE_APPEAR_TIMEOUT_MS = 500;

// 透明度 0-1 → 0-255 字节换算
export const OPACITY_BYTE = 255;

// clone 指令编码：每组 bit 数 + 可打印字符偏移
export const CODEC_GROUP_BITS = 5;
export const CODEC_PRINT_OFFSET = 35;
