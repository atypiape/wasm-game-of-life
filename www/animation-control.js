// @ts-check

/**
 * @typedef {object} AnimationControlOptions
 * @property {string} resetButtonSelector 播放按钮元素选择器
 * @property {string} deadButtonSelector 死亡按钮元素选择器
 * @property {string} playButtonSelector 播放按钮元素选择器
 * @property {string} rangeSelector 滑块元素选择器
 * @property {(() => void) | null} onReset 重置按钮点击回调函数
 * @property {(() => void) | null} onDead 死亡按钮点击回调函数
 * @property {(() => void) | null} onPlay 播放按钮点击回调函数
 * @property {(() => void) | null} onPause 暂停按钮点击回调函数
 * @property {(() => boolean) | null} onIsPaused 检查暂停回调函数
 */

/**
 * @enum {string}
 * @readonly
 */
export const Keyboard = {
  ALT: 'alt',
  CTRL: 'ctrl',
  SHIFT: 'shift',
}

export class AnimationControl {
  /** @type {HTMLButtonElement | null} @readonly @protected */
  playPauseButton;

  /** @type {HTMLButtonElement | null} @readonly @protected */
  resetButton;

  /** @type {HTMLButtonElement | null} @readonly @protected */
  deadButton;

  /** @type {HTMLInputElement | null} @readonly @protected */
  frameTickRange;

  /**
   * 是否只按下 Alt 键
   * @type {boolean} @protected
   */
  onlyAltKey = false;

  /**
   * 是否只按下 Ctrl 键
   * @type {boolean} @protected
   */
  onlyCtrlKey = false;

  /**
   * 是否只按下 Shift 键
   * @type {boolean} @protected
   */
  onlyShiftKey = false;

  /** @type {(() => void) | null} @readonly @protected */
  onReset;

  /** @type {(() => void) | null} @readonly @protected */
  onDead;

  /** @type {(() => void) | null} @readonly @protected */
  onPlay;

  /** @type {(() => void) | null} @readonly @protected */
  onPause;

  /** @type {(() => boolean) | null} @readonly @protected */
  onIsPaused;

  /** @type {number} @protected */
  frameTickCount = 1;

  /**
   * 动画控制器
   * @param {AnimationControlOptions} options
   */
  constructor(options) {
    const {
      resetButtonSelector,
      deadButtonSelector,
      playButtonSelector,
      rangeSelector,
      onReset,
      onDead,
      onPlay,
      onPause,
      onIsPaused,
    } = options || {};
    if (!resetButtonSelector) {
      console.error(`[${AnimationControl.name}] resetButtonSelector 为空`);
      return;
    }
    if (!deadButtonSelector) {
      console.error(`[${AnimationControl.name}] deadButtonSelector 为空`);
      return;
    }
    if (!playButtonSelector) {
      console.error(`[${AnimationControl.name}] playButtonSelector 为空`);
      return;
    }
    if (!onReset) {
      console.error(`[${AnimationControl.name}] onReset 为空`);
      return;
    }
    if (!onDead) {
      console.error(`[${AnimationControl.name}] onDead 为空`);
      return;
    }
    if (!onPlay) {
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
    const resetButton = document.querySelector(resetButtonSelector);
    if (!resetButton) {
      console.error(`重置按钮元素 (${resetButtonSelector}) 未找到`);
      return;
    }

    /** @type {HTMLButtonElement | null} */
    const deadButton = document.querySelector(deadButtonSelector);
    if (!resetButton) {
      console.error(`死亡按钮元素 (${resetButtonSelector}) 未找到`);
      return;
    }

    /** @type {HTMLButtonElement | null} */
    const playPauseButton = document.querySelector(playButtonSelector);
    if (!playPauseButton) {
      console.error(`播放按钮元素 (${playButtonSelector}) 未找到`);
      return;
    }

    /** @type {HTMLInputElement | null} */
    const frameTickRange = document.querySelector(rangeSelector);
    if (!frameTickRange) {
      console.error(`滑块元素 (${frameTickRange}) 未找到`);
      return;
    }

    this.resetButton = resetButton;
    this.deadButton = deadButton;
    this.playPauseButton = playPauseButton;
    this.frameTickRange = frameTickRange;
    this.frameTickCount = Number(frameTickRange.value);
    this.frameTickStep = Number(frameTickRange.step);
    this.onReset = onReset;
    this.onDead = onDead;
    this.onPlay = onPlay;
    this.onPause = onPause;
    this.onIsParsed = onIsPaused;
  }

  /**
   * 监听按钮点击事件
   */
  listen() {
    const { resetButton, deadButton, playPauseButton, frameTickRange } = this;

    resetButton?.addEventListener("click", () => {
      this.onReset?.();
      console.debug("重置");
    });

    deadButton?.addEventListener("click", () => {
      this.onDead?.();
      console.debug("死亡");
    });


    playPauseButton?.addEventListener("click", () => {
      if (this.onIsParsed?.()) {
        this.play();
      } else {
        this.pause();
      }
    });

    frameTickRange?.addEventListener("input", () => {
      this.frameTickCount = Number(frameTickRange.value);
      console.debug(`frameTickCount = ${this.frameTickCount}`);
    });

    document.addEventListener('keydown', (event) => {
      switch (event.key) {
        case 'Alt':
          this.onlyAltKey = true;
          break;
        case 'Control':
          this.onlyCtrlKey = true;
          break;
        case 'Shift':
          this.onlyShiftKey = true;
          break;
        default: return;
      }
      console.debug(`按下 ${event.key} 键`);
    });

    document.addEventListener('keyup', (event) => {
      switch (event.key) {
        case 'Alt':
          this.onlyAltKey = false;
          break;
        case 'Control':
          this.onlyCtrlKey = false;
          break;
        case 'Shift':
          this.onlyShiftKey = false;
          break;
        default: return;
      }
      console.debug(`释放 ${event.key} 键`);
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

  /**
   * 获取每一动画帧的滴答数
   * @returns {number}
   */
  getFrameTickCount() {
    return this.frameTickCount;
  }

  /**
   * 是否只按下键盘某个键
   * @param {Keyboard} key 按下的键
   * @return {boolean}
   */
  isKeyDown(key) {
    switch (key) {
      case Keyboard.ALT:
        return this.onlyAltKey;
      case Keyboard.CTRL:
        return this.onlyCtrlKey;
      case Keyboard.SHIFT:
        return this.onlyShiftKey;
    }
    return false;
  }
}
