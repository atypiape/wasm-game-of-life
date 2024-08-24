// @ts-check
import { GridCanvas } from "./grid-canvas";
import { CellUniverse } from "./cell-universe";
import { AnimationControl } from "./animation-control";

const CELL_SIZE = 10; // px
const GRID_COLOR = "#CCCCCC";
const DEAD_COLOR = "#FFFFFF";
const ALIVE_COLOR = "#000000";

let animationId = null;

// 构建宇宙
const universe = new CellUniverse();

// 构建网格画布
const canvas = new GridCanvas("#game-of-life-canvas", {
  width: universe.getWidth(),
  height: universe.getHeight(),
  cellSize: CELL_SIZE,
  gridColor: GRID_COLOR,
});

// 构建动画控制器
const control = new AnimationControl({
  buttonSelector: "#play-pause",
  onPlay: renderLoop,
  onPause,
  onIsPaused: isPaused,
});

// 监听按钮元素
control.listen();

function onPause() {
  cancelAnimationFrame(animationId);
  animationId = null;
}

function isPaused() {
  return animationId === null;
}

/**
 * 绘制整个宇宙所有细胞
 */
function drawUniverse() {
  canvas.draw((row, col) => {
    const isSet = universe.bitIsSet(row, col);
    return isSet ? ALIVE_COLOR : DEAD_COLOR;
  });
}

function renderLoop() {
  drawUniverse();
  universe.tick();

  animationId = requestAnimationFrame(renderLoop);
};

control.play();
