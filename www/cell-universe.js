// @ts-check
import { Universe } from "wasm-game-of-life";
import { memory } from './memory';

export class CellUniverse {
  /** @type {Universe | null} @readonly @protected */
  universe = null;

  /** @type {number} @readonly @protected */
  width = 0;

  /** @type {number} @readonly @protected */
  height = 0;

  constructor() {
    this.universe = Universe.new();
    this.width = this.universe.width();
    this.height = this.universe.height();
  }

  /**
   * 获取宇宙的宽度
   * @returns {number}
   */
  getWidth() {
    return this.width;
  }

  /**
   * 获取宇宙的高度
   * @returns {number}
   */
  getHeight() {
    return this.height;
  }

  /**
   * 判断指定位置的比特位是否为 1
   * @param {number} row 单元格行号
   * @param {number} col 单元格列号
   * @returns {boolean}
   */
  bitIsSet(row, col) {
    const n = this.getIndex(row, col);
    const cells = this.getCells();
    const idx = Math.floor(n / 8); // u8 数组索引
    const mask = 1 << n % 8; // 掩码，偏移到指定比特位
    return (cells[idx] & mask) === mask; // 与运算去除其余干扰比特，比较结果
  }

  /**
   * 反转单元格状态，死的变活的，活的变死的
   * @param {number} row 单元格行号
   * @param {number} col 单元格列号 
   */
  toggleCell(row, col) {
    this.universe?.toggle_cell(row, col);
  }

  /**
   * 宇宙前进一步
   */
  tick() {
    this.universe?.tick();
  }

  /**
   * 获取细胞在数组中的索引
   * @protected
   * @param {number} row 表格行号
   * @param {number} col 表格列号
   * @returns {number}
   */
  getIndex(row, col) {
    return row * this.width + col;
  }

  /**
   * 获取内存中的宇宙细胞数组
   * @protected
   * @returns {Uint8Array}
   */
  getCells() {
    const { width, height, universe } = this;
    if (!universe) {
      return Uint8Array.from([]);
    }
    const cellsPtr = universe.cells();
    const size = Math.ceil((width * height) / 8);
    const cells = new Uint8Array(memory.buffer, cellsPtr, size);
    return cells;
  }
}