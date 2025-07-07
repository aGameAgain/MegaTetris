// 导入所有依赖
import ParticleSystem from './particles.js';
import UIManager from './ui.js';
import InputManager from './input.js';
import TetrisGame from './tetris.js';
import GameRenderer from './renderer.js';

// 主游戏控制器
class MegaTetris {
    constructor() {
        this.game = null;
        this.renderer = null;
        this.particles = null;
        this.input = null;
        this.ui = null;

        this.animationId = null;
        this.lastTime = 0;

        this.initialize();
    }

    // 初始化游戏
    initialize() {
        try {
            console.log('🚀 初始化 MegaTetris...');

            // 获取DOM元素
            const gameCanvas = document.getElementById('gameCanvas');
            const particlesCanvas = document.getElementById('particlesCanvas');
            const nextCanvas = document.getElementById('nextCanvas');

            if (!gameCanvas || !particlesCanvas || !nextCanvas) {
                throw new Error('无法找到必要的Canvas元素');
            }

            // 初始化组件
            this.ui = new UIManager();
            this.renderer = new GameRenderer(gameCanvas, nextCanvas);
            this.particles = new ParticleSystem(particlesCanvas);
            this.game = new TetrisGame();
            this.input = new InputManager(this.game);

            // 设置粒子画布尺寸
            this.setupParticlesCanvas(particlesCanvas, gameCanvas);

            // 调整初始尺寸
            this.renderer.resize();
            this.setupParticlesCanvas(particlesCanvas, gameCanvas);

            // 绑定游戏事件
            this.bindGameEvents();

            // 设置窗口事件
            this.setupWindowEvents();

            // 设置测试功能
            this.setupTestFeatures();

            // 开始游戏
            this.startGame();

            console.log('🎮 MegaTetris 已准备就绪！');
            console.log('🎯 操作说明：');
            console.log('   ⬅️➡️ 移动方块');
            console.log('   ⬆️ 旋转方块');
            console.log('   ⬇️ 加速下降');
            console.log('   空格 旋转方块');
            console.log('   回车 硬降落');
            console.log('   P/ESC 暂停');
            console.log('   R 重启（游戏结束时）');

        } catch (error) {
            console.error('❌ 游戏初始化失败:', error);
            this.showError(`游戏初始化失败: ${error.message}`);
        }
    }

    // 设置粒子画布
    setupParticlesCanvas(particlesCanvas, gameCanvas) {
        particlesCanvas.width = gameCanvas.width;
        particlesCanvas.height = gameCanvas.height;
        particlesCanvas.style.width = gameCanvas.style.width;
        particlesCanvas.style.height = gameCanvas.style.height;
    }

    // 绑定游戏事件
    bindGameEvents() {
        // 分数变化事件
        this.game.onScoreChanged = (score, increment) => {
            this.ui.updateScore(score, increment);
        };

        // 行数变化事件
        this.game.onLinesChanged = (lines) => {
            this.ui.updateLines(lines);
        };

        // 连击事件
        this.game.onCombo = (comboCount) => {
            this.ui.showCombo(comboCount);

            // 连击特效
            const centerX = this.renderer.gameCanvas.width / 2;
            const centerY = this.renderer.gameCanvas.height / 2;
            this.particles.createComboEffect(centerX, centerY, comboCount);

            // 屏幕震动
            this.ui.shakeScreen(comboCount * 2, 200);
        };

        // 方块放置事件
        this.game.onPiecePlaced = (blocks, clearResult) => {
            // 方块放置特效
            this.particles.createPlacementEffect(blocks, this.renderer.blockSize);

            // 行消除特效
            if (clearResult.clearedLines.length > 0) {
                this.handleLineClear(clearResult);
            }
        };

        // 游戏结束事件
        this.game.onGameOver = () => {
            this.handleGameOver();
        };

        // 暂停状态变化事件
        this.game.onPauseChanged = (paused) => {
            if (paused) {
                this.stopGameLoop();
            } else {
                this.startGameLoop();
            }
        };

        // 重启事件
        this.game.onRestart = () => {
            this.handleRestart();
        };

        // 动画更新事件
        this.game.onAnimationUpdate = (phase, progress) => {
            // 可以在这里添加动画相关的UI更新
            // console.log(`动画阶段: ${phase}, 进度: ${(progress * 100).toFixed(1)}%`);
        };
    }

    // 设置窗口事件
    setupWindowEvents() {
        // 窗口大小变化
        window.addEventListener('resize', () => {
            this.renderer.resize();
            this.setupParticlesCanvas(
                document.getElementById('particlesCanvas'),
                document.getElementById('gameCanvas')
            );
        });

        // 页面失焦时暂停
        document.addEventListener('visibilitychange', () => {
            if (document.hidden && this.game && !this.game.gameOver && !this.game.paused) {
                this.game.togglePause();
            }
        });

        // 防止页面刷新
        window.addEventListener('beforeunload', (e) => {
            if (this.game && !this.game.gameOver && this.game.score > 0) {
                e.preventDefault();
                e.returnValue = '游戏正在进行中，确定要离开吗？';
                return e.returnValue;
            }
        });
    }

    // 设置测试功能
    setupTestFeatures() {
        // 测试按钮事件
        const testGameOverBtn = document.getElementById('testGameOverBtn');
        const testToggleBtn = document.getElementById('testToggleBtn');

        if (testGameOverBtn) {
            testGameOverBtn.addEventListener('click', () => {
                this.triggerTestGameOver();
            });
        }

        if (testToggleBtn) {
            testToggleBtn.addEventListener('click', () => {
                this.ui.toggleTestMode();
            });
        }

        // 键盘快捷键
        document.addEventListener('keydown', (e) => {
            // 阻止在输入框中触发
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
                return;
            }

            switch (e.key.toLowerCase()) {
                case 't':
                    // T键切换测试模式
                    e.preventDefault();
                    this.ui.toggleTestMode();
                    break;

                case 'g':
                    // G键触发游戏结束（仅在测试模式下）
                    if (document.body.classList.contains('dev-mode')) {
                        e.preventDefault();
                        this.triggerTestGameOver();
                    }
                    break;
            }
        });

        console.log('🧪 测试功能已启用');
        console.log('⌨️ 按 T 键切换测试模式');
        console.log('💀 在测试模式下按 G 键可快速游戏结束');
    }

    // 触发测试游戏结束
    triggerTestGameOver() {
        if (!this.game) return;

        console.log('💀 触发测试游戏结束');

        // 设置一些测试分数和行数
        const testScore = Math.floor(Math.random() * 50000) + 10000;
        const testLines = Math.floor(Math.random() * 50) + 10;

        this.game.score = testScore;
        this.game.lines = testLines;

        // 更新UI显示
        this.ui.updateScore(testScore);
        this.ui.updateLines(testLines);

        // 触发游戏结束
        this.game.endGame();

        // 立即显示游戏结束界面
        this.handleGameOver();
    }

    // 处理行消除
    handleLineClear(clearResult) {
        const { clearedLines, clearedBlocks } = clearResult;

        // 更新行数显示
        this.ui.updateLines(this.game.lines);

        // 使用新的多行消除特效，基于具体方块位置
        this.particles.createMultiLineClearEffect(
            clearedBlocks,
            clearedLines,
            this.renderer.blockSize
        );

        // 行消除视觉效果
        this.ui.createLineClearVisual(clearedLines, this.renderer.gameCanvas);

        // 根据消除行数播放不同强度的震动
        let shakeIntensity = clearedLines.length * 3;
        if (clearedLines.length >= 4) {
            shakeIntensity *= 2; // Tetris额外震动
        }
        this.ui.shakeScreen(shakeIntensity, 300);

        // 输出消除信息到控制台（调试用）
        console.log(`🎆 消除了 ${clearedLines.length} 行，共 ${clearedBlocks.length} 个方块`);
        if (clearedLines.length >= 4) {
            console.log('🔥 TETRIS! 四行消除！');
        } else if (clearedLines.length >= 2) {
            console.log('⚡ 多行消除！');
        }
    }

    // 处理游戏结束
    handleGameOver() {
        this.stopGameLoop();
        this.input.disable();

        // 延迟显示游戏结束界面，让粒子效果播放完
        setTimeout(() => {
            this.ui.showGameOver(this.game.score, this.game.lines);
        }, 500);

        // 最终爆炸特效
        const centerX = this.renderer.gameCanvas.width / 2;
        const centerY = this.renderer.gameCanvas.height / 2;
        this.particles.createExplosion(centerX, centerY, '#FF6B6B', 100);

        // 强烈震动
        this.ui.shakeScreen(10, 1000);
    }

    // 处理重启
    handleRestart() {
        this.stopGameLoop();
        this.particles.clear();
        this.ui.reset();
        this.input.enable();
        this.startGameLoop();
    }

    // 开始游戏
    startGame() {
        this.game.start();
        this.startGameLoop();
    }

    // 开始游戏循环
    startGameLoop() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }

        const gameLoop = (currentTime) => {
            this.update(currentTime);
            this.render(currentTime);

            if (!this.game.gameOver) {
                this.animationId = requestAnimationFrame(gameLoop);
            }
        };

        this.animationId = requestAnimationFrame(gameLoop);
    }

    // 停止游戏循环
    stopGameLoop() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
    }

    // 更新游戏状态
    update(currentTime) {
        // 更新游戏动画状态
        if (this.game && this.game.updateAnimation) {
            this.game.updateAnimation(currentTime);
        }

        // 更新粒子系统
        this.particles.update(currentTime);
    }

    // 渲染游戏
    render(currentTime) {
        // 渲染主游戏画面
        this.renderer.render(this.game);

        // 渲染粒子效果
        this.particles.render();
    }

    // 显示错误信息
    showError(message) {
        const errorDiv = document.createElement('div');
        errorDiv.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: rgba(255, 0, 0, 0.9);
            color: white;
            padding: 20px;
            border-radius: 10px;
            text-align: center;
            z-index: 10000;
            font-family: Arial, sans-serif;
        `;
        errorDiv.innerHTML = `
            <h3>🚫 发生错误</h3>
            <p>${message}</p>
            <button onclick="location.reload()" style="
                background: white;
                color: red;
                border: none;
                padding: 10px 20px;
                border-radius: 5px;
                cursor: pointer;
                margin-top: 10px;
            ">🔄 刷新页面</button>
        `;

        document.body.appendChild(errorDiv);
    }

    // 销毁游戏实例
    destroy() {
        this.stopGameLoop();

        if (this.input) {
            this.input.cleanup();
        }

        if (this.game) {
            this.game.stopDropTimer();
        }

        if (this.particles) {
            this.particles.clear();
        }

        // 移除事件监听器
        window.removeEventListener('resize', this.handleResize);
        document.removeEventListener('visibilitychange', this.handleVisibilityChange);
    }
}

// 全局重启函数（供HTML调用）
function restartGame() {
    if (window.gameInstance && window.gameInstance.game) {
        window.gameInstance.game.restart();
    }
}

// 导出
export default MegaTetris;