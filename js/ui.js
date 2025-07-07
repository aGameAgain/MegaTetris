// 导入配置
import CONFIG from './config.js';

// UI管理器
class UIManager {
    constructor() {
        this.scoreElement = document.getElementById('scoreValue');
        this.linesElement = document.getElementById('linesValue');
        this.comboIndicator = document.getElementById('comboIndicator');
        this.comboCount = document.getElementById('comboCount');
        this.gameOverPanel = document.getElementById('gameOver');
        this.finalScore = document.getElementById('finalScore');
        this.finalLines = document.getElementById('finalLines');

        this.currentScore = 0;
        this.currentLines = 0;
        this.comboTimer = null;
        this.scoreAnimationQueue = [];
        this.isAnimatingScore = false;
    }

    // 更新分数（带动画效果）
    updateScore(newScore, increment = 0) {
        this.scoreAnimationQueue.push({
            from: this.currentScore,
            to: newScore,
            increment: increment
        });

        this.currentScore = newScore;
        this.processScoreAnimation();
    }

    // 处理分数动画队列
    processScoreAnimation() {
        if (this.isAnimatingScore || this.scoreAnimationQueue.length === 0) {
            return;
        }

        this.isAnimatingScore = true;
        const animation = this.scoreAnimationQueue.shift();

        this.animateScoreChange(animation.from, animation.to, animation.increment);
    }

    // 分数变化动画
    animateScoreChange(fromScore, toScore, increment) {
        const duration = 500;
        const steps = 20;
        const stepDuration = duration / steps;
        const scoreStep = (toScore - fromScore) / steps;

        let currentStep = 0;
        let currentScore = fromScore;

        const animateStep = () => {
            currentStep++;
            currentScore += scoreStep;

            // 分数跳动效果
            this.scoreElement.style.transform = `scale(${1 + Math.sin(currentStep * 0.5) * 0.1})`;
            this.scoreElement.style.color = this.getScoreColor(currentStep / steps);
            this.scoreElement.textContent = Math.round(currentScore).toLocaleString();

            if (currentStep < steps) {
                setTimeout(animateStep, stepDuration);
            } else {
                this.scoreElement.style.transform = 'scale(1)';
                this.scoreElement.style.color = '#fff';
                this.scoreElement.textContent = toScore.toLocaleString();
                this.isAnimatingScore = false;

                // 显示分数增加提示
                if (increment > 0) {
                    this.showScorePopup(increment);
                }

                // 处理下一个动画
                setTimeout(() => this.processScoreAnimation(), 100);
            }
        };

        animateStep();
    }

    // 获取分数颜色（根据动画进度）
    getScoreColor(progress) {
        const colors = ['#fff', '#ffeb3b', '#ff9800', '#f44336', '#e91e63', '#9c27b0'];
        const colorIndex = Math.floor(progress * (colors.length - 1));
        return colors[colorIndex] || '#fff';
    }

    // 显示分数增加弹窗
    showScorePopup(increment) {
        const popup = document.createElement('div');
        popup.className = 'score-popup';
        popup.textContent = `+${increment.toLocaleString()}`;

        // 随机位置
        const rect = this.scoreElement.getBoundingClientRect();
        popup.style.left = `${rect.left + Math.random() * 50 - 25}px`;
        popup.style.top = `${rect.top - 10}px`;

        document.body.appendChild(popup);

        // 自动移除
        setTimeout(() => {
            if (popup.parentNode) {
                popup.parentNode.removeChild(popup);
            }
        }, CONFIG.ANIMATION.SCORE_POPUP_DURATION);
    }

    // 更新消除行数
    updateLines(newLines) {
        this.currentLines = newLines;
        this.linesElement.textContent = newLines.toLocaleString();

        // 行数增加动画
        this.linesElement.style.transform = 'scale(1.2)';
        this.linesElement.style.color = '#4ecdc4';

        setTimeout(() => {
            this.linesElement.style.transform = 'scale(1)';
            this.linesElement.style.color = '#fff';
        }, 200);
    }

    // 显示连击指示器
    showCombo(comboCount) {
        this.comboCount.textContent = comboCount;
        this.comboIndicator.style.opacity = '1';
        this.comboIndicator.style.transform = 'scale(1.2)';

        // 连击颜色变化
        const colors = ['#ff6b6b', '#ff9800', '#ffeb3b', '#4caf50', '#2196f3', '#9c27b0'];
        const colorIndex = Math.min(comboCount - 1, colors.length - 1);
        this.comboIndicator.style.backgroundColor = colors[colorIndex] + '40'; // 40 为透明度
        this.comboIndicator.style.color = colors[colorIndex];

        // 重置定时器
        if (this.comboTimer) {
            clearTimeout(this.comboTimer);
        }

        this.comboTimer = setTimeout(() => {
            this.hideCombo();
        }, CONFIG.ANIMATION.COMBO_SHOW_DURATION);

        setTimeout(() => {
            this.comboIndicator.style.transform = 'scale(1)';
        }, 200);
    }

    // 隐藏连击指示器
    hideCombo() {
        this.comboIndicator.style.opacity = '0';
        this.comboIndicator.style.transform = 'scale(0.8)';

        if (this.comboTimer) {
            clearTimeout(this.comboTimer);
            this.comboTimer = null;
        }
    }

    // 显示游戏结束界面
    showGameOver(score, lines) {
        this.finalScore.textContent = score.toLocaleString();
        this.finalLines.textContent = lines.toLocaleString();
        this.gameOverPanel.classList.add('show');

        // 游戏结束动画
        this.gameOverPanel.style.opacity = '0';

        setTimeout(() => {
            this.gameOverPanel.style.transition = 'all 0.3s ease';
            this.gameOverPanel.style.opacity = '1';
        }, 100);
    }

    // 隐藏游戏结束界面
    hideGameOver() {
        this.gameOverPanel.classList.remove('show');
        this.gameOverPanel.style.transition = 'none';
    }

    // 测试功能：显示测试模式指示器
    showTestModeIndicator() {
        if (!this.testModeIndicator) {
            this.testModeIndicator = document.createElement('div');
            this.testModeIndicator.className = 'test-mode-indicator';
            this.testModeIndicator.textContent = '🧪 测试模式';
            document.body.appendChild(this.testModeIndicator);
        }
        this.testModeIndicator.classList.add('show');
    }

    // 隐藏测试模式指示器
    hideTestModeIndicator() {
        if (this.testModeIndicator) {
            this.testModeIndicator.classList.remove('show');
        }
    }

    // 切换测试模式
    toggleTestMode() {
        const isTestMode = document.body.classList.contains('dev-mode');
        if (isTestMode) {
            document.body.classList.remove('dev-mode');
            this.hideTestModeIndicator();
            console.log('🔒 测试模式已关闭');
        } else {
            document.body.classList.add('dev-mode');
            this.showTestModeIndicator();
            console.log('🧪 测试模式已开启');
            console.log('💀 点击骷髅按钮或按 G 键可快速触发游戏结束');
            console.log('⌨️ 按 T 键可切换测试模式');
        }

        // 切换测试控件显示
        const testControls = document.querySelector('.test-controls');
        if (testControls) {
            testControls.style.display = isTestMode ? 'none' : 'flex';
        }
    }

    // 屏幕震动效果
    shakeScreen(intensity = 5, duration = 300) {
        const gameContainer = document.querySelector('.game-container');
        const startTime = Date.now();

        const shake = () => {
            const elapsed = Date.now() - startTime;
            const progress = elapsed / duration;

            if (progress < 1) {
                const offsetX = (Math.random() - 0.5) * intensity * (1 - progress);
                const offsetY = (Math.random() - 0.5) * intensity * (1 - progress);

                gameContainer.style.transform = `translate(${offsetX}px, ${offsetY}px)`;
                requestAnimationFrame(shake);
            } else {
                gameContainer.style.transform = 'translate(0, 0)';
            }
        };

        shake();
    }

    // 创建行消除视觉效果
    createLineClearVisual(lineNumbers, canvas) {
        lineNumbers.forEach((lineY, index) => {
            setTimeout(() => {
                this.flashLine(lineY, canvas);
            }, index * 50);
        });
    }

    // 闪烁行效果
    flashLine(lineY, canvas) {
        const ctx = canvas.getContext('2d');
        const y = lineY * CONFIG.BLOCK_SIZE;
        const width = canvas.width;
        const height = CONFIG.BLOCK_SIZE;

        let flashCount = 0;
        const maxFlashes = 6;

        const flash = () => {
            if (flashCount < maxFlashes) {
                ctx.save();
                ctx.globalCompositeOperation = 'lighter';
                ctx.fillStyle = flashCount % 2 === 0 ? '#ffffff' : 'transparent';
                ctx.fillRect(0, y, width, height);
                ctx.restore();

                flashCount++;
                setTimeout(flash, 50);
            }
        };

        flash();
    }

    // 重置UI状态
    reset() {
        this.currentScore = 0;
        this.currentLines = 0;
        this.scoreElement.textContent = '0';
        this.linesElement.textContent = '0';
        this.hideCombo();
        this.hideGameOver();
        this.scoreAnimationQueue = [];
        this.isAnimatingScore = false;

        // 重置样式
        this.scoreElement.style.transform = 'scale(1)';
        this.scoreElement.style.color = '#fff';
        this.linesElement.style.transform = 'scale(1)';
        this.linesElement.style.color = '#fff';
    }
}

// 导出
export default UIManager;