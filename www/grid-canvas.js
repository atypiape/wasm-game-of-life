// @ts-check

/**
 * 网格画布构建选项
 * @typedef {object} GridCanvasOptions
 * @property {number} width 网格行宽，列数
 * @property {number} height 网格列高，行数
 * @property {number} cellSize 单元格大小 px
 * @property {string} gridColor 网格线颜色
 * @property {DrawCallback | null} onCellDraw 单元格绘制回调函数
 * @property {ClickCallback | null} onCellClick 单元格点击回调函数
 */

/**
 * 绘制网格回调函数
 * @callback DrawCallback
 * @param {number} row 单元格的行号
 * @param {number} col 单元格的列号
 * @returns {string} 单元格填充的颜色
 */



/**
 * 点击事件回调函数
 * @callback ClickCallback
 * @param {number} row 单元格的行号
 * @param {number} col 单元格的列号
 */

export class GridCanvas {
  /** @type {HTMLCanvasElement | null} @readonly @protected */
  canvas = null;

  /** @type {CanvasRenderingContext2D | null} @readonly @protected */
  ctx = null;

  /** @type {GridCanvasOptions} @readonly @protected */
  options = {
    width: 0,
    height: 0,
    cellSize: 0,
    gridColor: "",
    onCellDraw: null,
    onCellClick: null,
  };

  /**
   * 网格画布构建器
   * @param {string} selector canvas 元素选择器
   * @param {GridCanvasOptions} options 构建选项
   */
  constructor(selector, options) {
    const {
      width = 0,
      height = 0,
      cellSize = 0,
      gridColor = "#CCCCCC",
      onCellDraw,
      onCellClick,
    } = options || {};

    /** @type {HTMLCanvasElement | null} */
    const canvas = document.querySelector(selector);
    if (!canvas) {
      console.error(`未找到 canvas 元素: ${selector}`);
      return;
    }
    canvas.height = (cellSize + 1) * height + 1;
    canvas.width = (cellSize + 1) * width + 1;
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      console.error("获取 2d context 失败.");
      return;
    }

    this.canvas = canvas;
    this.ctx = ctx;
    this.options = {
      width,
      height,
      cellSize,
      gridColor,
      onCellDraw,
      onCellClick,
    };

    // 添加点击事件
    canvas.addEventListener("click", this.handleClick.bind(this));

    console.debug(`canvas(${selector}) 元素已创建: ${canvas.width} x ${canvas.height}`);
  }

  /**
   * 绘制网格线和所有单元格
   */
  draw() {
    this.drawGrid();
    this.drawCells();
  }

  /**
   * 绘制网格线
   * @protected
   */
  drawGrid() {
    const { ctx } = this;
    if (!ctx) {
      return;
    }
    const {width, height, cellSize, gridColor = "" } = this.options;

    ctx.beginPath();
    ctx.strokeStyle = gridColor;

    // 绘制垂直线段
    for (let i = 0; i <= width; ++i) {
      ctx.moveTo(i * (cellSize + 1) + 1, 0);
      ctx.lineTo(i * (cellSize + 1) + 1, (cellSize + 1) * height + 1);
    }

    // 绘制水平线段
    for (let j = 0; j <= height; ++j) {
      ctx.moveTo(0, j * (cellSize + 1) + 1);
      ctx.lineTo((cellSize + 1) * width + 1, j * (cellSize + 1) + 1);
    }

    ctx.stroke();
  }

  /**
   * 根据回调函数返回结果，绘制所有单元格
   * @protected
   */
  drawCells() {
    const { ctx } = this;
    if (!ctx) {
      return;
    }
    const { onCellDraw, width, height, cellSize } = this.options;
    if (!onCellDraw) {
      console.error("未提供绘制回调函数");
      return;
    }

    ctx.beginPath();

    for (let row = 0; row < height; ++row) {
      for (let col = 0; col < width; ++col) {
        ctx.fillStyle = onCellDraw(row, col);
        ctx.fillRect(
          col * (cellSize + 1) + 1,
          row * (cellSize + 1) + 1,
          cellSize,
          cellSize
        );
      }
    }

    ctx.stroke();
  }

  /**
   * 设置点击事件回调函数
   * @param {ClickCallback} callback 点击事件回调函数
   */
  onClick(callback) {
    this.clickCallback = callback;
  }

  /**
   * 处理网格被点击事件
   * @protected
   * @param {MouseEvent} event 点击事件
   */
  handleClick(event) {
    const { canvas } = this;
    if (!canvas) {
      return;
    }
    const { onCellClick, cellSize, height, width } = this.options;
    if (!onCellClick) {
      console.error("未提供点击回调函数");
      return;
    }

    const boundingReact = canvas.getBoundingClientRect();
    const scaleX = canvas.width / boundingReact.width;
    const scaleY = canvas.height / boundingReact.height;

    const canvasLeft = (event.clientX - boundingReact.left) * scaleX;
    const canvasTop = (event.clientY - boundingReact.top) * scaleY;

    const row = Math.min((canvasTop / (cellSize + 1)), height - 1);
    const col = Math.min((canvasLeft / (cellSize + 1)), width - 1);

    onCellClick(row, col);

    this.drawGrid();
    this.drawCells();
  }
}
