// @ts-check

/**
 * @typedef {object} AnimationControlOptions
 * @property {string} buttonSelector 按钮元素选择起
 * @property {(() => void) | null} onPlay 播放按钮点击回调函数
 * @property {(() => void) | null} onPause 暂停按钮点击回调函数
 * @property {(() => boolean) | null} onIsPaused 检查暂停回调函数
 */

export class AnimationControl {
  /** @type {HTMLButtonElement} @readonly @protected */
  playPauseButton;

  /** @type {(() => void) | null} @readonly @protected */
  onPlay;

  /** @type {(() => void) | null} @readonly @protected */
  onPause;

  /** @type {(() => boolean) | null} @readonly @protected */
  onIsPaused;

  /**
   * 动画控制器
   * @param {AnimationControlOptions} options
   */
  constructor(options) {
    const { buttonSelector = "", onPlay, onPause, onIsPaused } = options || {};
    if (!buttonSelector) {
      console.error(`[${AnimationControl.name}] onPlay 为空`);
      return;
    }
    if (!onPause) {
      console.error(`[${AnimationControl.name}] onPause 为空`);
      return;
    }
    if (!onIsPaused) {
      console.error(`[${AnimationControl.name}] onIsPaused 为空`);
      return;
    }

    /** @type {HTMLButtonElement | null} */
    const playPauseButton = document.querySelector(buttonSelector);
    if (!playPauseButton) {
      console.error(`按钮元素 (${buttonSelector}) 未找到`);
      return;
    }

    this.playPauseButton = playPauseButton;
    this.onPlay = onPlay;
    this.onPause = onPause;
    this.onIsParsed = onIsPaused;
  }

  /**
   * 监听按钮点击事件
   */
  listen() {
    this.playPauseButton?.addEventListener("click", () => {
      if (this.onIsParsed?.()) {
        this.play();
      } else {
        this.pause();
      }
    });
  }

  /**
   * 播放动画
   */
  play() {
    const { playPauseButton } = this;
    if (!playPauseButton) {
      return;
    }
    playPauseButton.textContent = "⏸";
    this.onPlay?.();
    console.debug("播放");
  }

  /**
   * 暂停动画
   */
  pause() {
    const { playPauseButton } = this;
    if (!playPauseButton) {
      return;
    }
    playPauseButton.textContent = "▶";
    this.onPause?.();
    console.debug("暂停");
  }
}
