// @ts-check

export const fps = new class {
  /**
   * 帧率数据显示元素
   * @type {HTMLElement | null}
   * @protected
   */
  element = null;

  /**
   * 保存多个帧率值
   * @type {number[]}
   * @protected
   */
  frames = [];

  /**
   * 最近的一帧的时间戳
   * @type {number}
   * @protected
   */
  lastFrameTimeStamp = 0;

  /**
   * 帧率显示器
   * @param {string} elementId 页面元素 id
   */
  constructor(elementId = 'fps') {
    this.element = document.getElementById(elementId);
    this.lastFrameTimeStamp = performance.now();

    if (!this.element) {
      console.error(`未找到帧率显示器元素: ${elementId}`);
    }
  }

  /**
   * 渲染帧率数据
   */
  render() {
    // 计算帧率
    const now = performance.now();
    const delta = now - this.lastFrameTimeStamp;
    this.lastFrameTimeStamp = now;
    const fps = 1 / delta * 1000;
    
    // 保存最近 100 次帧率
    this.frames.push(fps);
    if (this.frames.length > 100) {
      this.frames.shift();
    }

    // 计算平均值、最大值、最小值
    let sum = 0;
    let max = -Infinity;
    let min = Infinity;
    for (let i = 0; i < this.frames.length; ++i) {
      const value = this.frames[i];
      sum += value;
      max = Math.min(value, min);
      min = Math.max(value, max);
    }
    const mean = sum / this.frames.length;

    if (!this.element) {
      return;
    }

    this.element.textContent = `
=【每秒帧数】=
最新帧率 = ${Math.round(fps)}
百次均值 = ${Math.round(mean)}
百次最小 = ${Math.round(min)}
百次最大 = ${Math.round(max)}
    `.trim();
  }
}