// 输入控制管理器
class InputManager {
    constructor(gameInstance) {
        this.game = gameInstance;
        this.keys = {};
        this.lastKeyTime = {};
        this.keyRepeatDelay = 150; // 按键重复延迟
        this.keyRepeatInterval = 50; // 按键重复间隔

        this.touchStartX = 0;
        this.touchStartY = 0;
        this.swipeThreshold = 50;

        this.setupKeyboardControls();
        this.setupTouchControls();
        this.setupButtonControls();
    }

    // 设置键盘控制
    setupKeyboardControls() {
        document.addEventListener('keydown', (e) => {
            this.handleKeyDown(e);
        });

        document.addEventListener('keyup', (e) => {
            this.handleKeyUp(e);
        });

        // 防止页面滚动
        document.addEventListener('keydown', (e) => {
            if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'].includes(e.code)) {
                e.preventDefault();
            }
        });
    }

    // 处理按键按下
    handleKeyDown(e) {
        const now = Date.now();
        const key = e.code;

        // 首次按下或重复按键
        if (!this.keys[key] || (now - this.lastKeyTime[key]) > this.keyRepeatDelay) {
            this.keys[key] = true;
            this.lastKeyTime[key] = now;
            this.processKeyAction(key);

            // 设置重复按键
            if (['ArrowLeft', 'ArrowRight', 'ArrowDown'].includes(key)) {
                this.setupKeyRepeat(key);
            }
        }
    }

    // 处理按键释放
    handleKeyUp(e) {
        const key = e.code;
        this.keys[key] = false;

        // 清除重复按键定时器
        if (this.keyRepeatTimers && this.keyRepeatTimers[key]) {
            clearInterval(this.keyRepeatTimers[key]);
            delete this.keyRepeatTimers[key];
        }
    }

    // 设置按键重复
    setupKeyRepeat(key) {
        if (!this.keyRepeatTimers) {
            this.keyRepeatTimers = {};
        }

        // 清除已存在的定时器
        if (this.keyRepeatTimers[key]) {
            clearInterval(this.keyRepeatTimers[key]);
        }

        // 设置新的重复定时器
        this.keyRepeatTimers[key] = setInterval(() => {
            if (this.keys[key]) {
                this.processKeyAction(key);
            } else {
                clearInterval(this.keyRepeatTimers[key]);
                delete this.keyRepeatTimers[key];
            }
        }, this.keyRepeatInterval);
    }

    // 处理按键动作
    processKeyAction(key) {
        if (!this.game) return;

        switch (key) {
            case 'ArrowLeft':
            case 'KeyA':
                this.game.movePiece(-1, 0);
                break;
            case 'ArrowRight':
            case 'KeyD':
                this.game.movePiece(1, 0);
                break;
            case 'ArrowDown':
            case 'KeyS':
                this.game.movePiece(0, 1);
                break;
            case 'ArrowUp':
            case 'KeyW':
            case 'Space':
                this.game.rotatePiece();
                break;
            case 'KeyQ':
                this.game.rotatePiece(-1); // 反向旋转
                break;
            case 'Enter':
                this.game.hardDrop();
                break;
            case 'KeyP':
            case 'Escape':
                this.game.togglePause();
                break;
            case 'KeyR':
                if (this.game.gameOver) {
                    this.game.restart();
                }
                break;
        }
    }

    // 设置触摸控制
    setupTouchControls() {
        const canvas = document.getElementById('gameCanvas');

        // 触摸开始
        canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            const touch = e.touches[0];
            this.touchStartX = touch.clientX;
            this.touchStartY = touch.clientY;
        }, { passive: false });

        // 触摸移动
        canvas.addEventListener('touchmove', (e) => {
            e.preventDefault();
        }, { passive: false });

        // 触摸结束
        canvas.addEventListener('touchend', (e) => {
            e.preventDefault();
            if (e.changedTouches.length > 0) {
                const touch = e.changedTouches[0];
                this.handleSwipe(touch.clientX, touch.clientY);
            }
        }, { passive: false });

        // 双击旋转
        let lastTap = 0;
        canvas.addEventListener('touchend', (e) => {
            const currentTime = new Date().getTime();
            const tapLength = currentTime - lastTap;

            if (tapLength < 500 && tapLength > 0) {
                this.game.rotatePiece();
            }

            lastTap = currentTime;
        });
    }

    // 处理滑动手势
    handleSwipe(endX, endY) {
        const deltaX = endX - this.touchStartX;
        const deltaY = endY - this.touchStartY;

        const absX = Math.abs(deltaX);
        const absY = Math.abs(deltaY);

        // 判断滑动方向
        if (Math.max(absX, absY) > this.swipeThreshold) {
            if (absX > absY) {
                // 水平滑动
                if (deltaX > 0) {
                    this.game.movePiece(1, 0); // 右
                } else {
                    this.game.movePiece(-1, 0); // 左
                }
            } else {
                // 垂直滑动
                if (deltaY > 0) {
                    this.game.hardDrop(); // 下
                } else {
                    this.game.rotatePiece(); // 上
                }
            }
        }
    }

    // 设置按钮控制
    setupButtonControls() {
        // 左移按钮
        this.setupButton('leftBtn', () => this.game.movePiece(-1, 0));

        // 右移按钮
        this.setupButton('rightBtn', () => this.game.movePiece(1, 0));

        // 旋转按钮
        this.setupButton('rotateBtn', () => this.game.rotatePiece());

        // 下移按钮
        this.setupButton('downBtn', () => this.game.movePiece(0, 1));

        // 暂停按钮
        this.setupButton('pauseBtn', () => this.game.togglePause());

        // 重启按钮（在游戏结束时）
        const restartBtn = document.querySelector('.restart-btn');
        if (restartBtn) {
            restartBtn.addEventListener('click', () => this.game.restart());
        }
    }

    // 设置单个按钮
    setupButton(buttonId, action) {
        const button = document.getElementById(buttonId);
        if (!button) return;

        let isPressed = false;
        let repeatTimer = null;

        // 鼠标事件
        button.addEventListener('mousedown', (e) => {
            e.preventDefault();
            this.startButtonAction(action, buttonId);
        });

        button.addEventListener('mouseup', (e) => {
            e.preventDefault();
            this.stopButtonAction(buttonId);
        });

        button.addEventListener('mouseleave', (e) => {
            this.stopButtonAction(buttonId);
        });

        // 触摸事件
        button.addEventListener('touchstart', (e) => {
            e.preventDefault();
            this.startButtonAction(action, buttonId);
        });

        button.addEventListener('touchend', (e) => {
            e.preventDefault();
            this.stopButtonAction(buttonId);
        });

        button.addEventListener('touchcancel', (e) => {
            e.preventDefault();
            this.stopButtonAction(buttonId);
        });
    }

    // 开始按钮动作
    startButtonAction(action, buttonId) {
        if (this.buttonTimers && this.buttonTimers[buttonId]) {
            return; // 已经在执行
        }

        if (!this.buttonTimers) {
            this.buttonTimers = {};
        }

        // 立即执行一次
        action();

        // 对于移动按钮，设置重复执行
        if (['leftBtn', 'rightBtn', 'downBtn'].includes(buttonId)) {
            this.buttonTimers[buttonId] = setInterval(() => {
                action();
            }, this.keyRepeatInterval);
        }
    }

    // 停止按钮动作
    stopButtonAction(buttonId) {
        if (this.buttonTimers && this.buttonTimers[buttonId]) {
            clearInterval(this.buttonTimers[buttonId]);
            delete this.buttonTimers[buttonId];
        }
    }

    // 清理所有定时器
    cleanup() {
        // 清理按键重复定时器
        if (this.keyRepeatTimers) {
            Object.values(this.keyRepeatTimers).forEach(timer => {
                clearInterval(timer);
            });
            this.keyRepeatTimers = {};
        }

        // 清理按钮定时器
        if (this.buttonTimers) {
            Object.values(this.buttonTimers).forEach(timer => {
                clearInterval(timer);
            });
            this.buttonTimers = {};
        }
    }

    // 禁用输入
    disable() {
        this.cleanup();
        this.keys = {};
    }

    // 启用输入
    enable() {
        this.keys = {};
    }
}

// 导出
export default InputManager;