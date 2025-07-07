// 导入依赖
import CONFIG from './config.js';
import TetrisPieces from './pieces.js';

// 俄罗斯方块游戏核心
class TetrisGame {
    constructor() {
        this.board = [];
        this.currentPiece = null;
        this.nextPiece = null;
        this.score = 0;
        this.lines = 0;
        this.level = 1;
        this.gameOver = false;
        this.paused = false;
        this.combo = 0;
        this.lastClearTime = 0;

        this.dropTimer = null;
        this.currentSpeed = CONFIG.INITIAL_SPEED;

        // 动画相关属性
        this.isAnimating = false;
        this.animationPhase = null; // 'clearing' | 'dropping' | null
        this.animationStartTime = 0;
        this.animationDuration = 500;
        this.clearResult = null;
        this.markedForClear = []; // 标记要消除的行

        // 游戏组件
        this.pieces = new TetrisPieces();

        this.initializeBoard();
        this.createInitialFill();
    }

    // 初始化游戏板
    initializeBoard() {
        this.board = Array(CONFIG.BOARD_HEIGHT).fill(null).map(() =>
            Array(CONFIG.BOARD_WIDTH).fill(null)
        );
    }

    // 创建初始堆积
    createInitialFill() {
        const fillHeight = Math.floor(CONFIG.BOARD_HEIGHT * CONFIG.INITIAL_FILL_HEIGHT);
        const centerX = Math.floor(CONFIG.BOARD_WIDTH / 2);
        const gapStart = centerX - Math.floor(CONFIG.GAP_WIDTH / 2);
        const gapEnd = gapStart + CONFIG.GAP_WIDTH;

        // 从底部开始填充
        for (let y = CONFIG.BOARD_HEIGHT - fillHeight; y < CONFIG.BOARD_HEIGHT; y++) {
            for (let x = 0; x < CONFIG.BOARD_WIDTH; x++) {
                // 跳过中间的空隙
                if (x >= gapStart && x < gapEnd) {
                    continue;
                }

                // 创建彩虹渐变效果
                const colorIndex = Math.floor((y - (CONFIG.BOARD_HEIGHT - fillHeight)) / fillHeight * CONFIG.COLORS.length);
                const color = CONFIG.COLORS[Math.min(colorIndex, CONFIG.COLORS.length - 1)];

                this.board[y][x] = {
                    color: color,
                    filled: true
                };
            }
        }
    }

    // 开始游戏
    start() {
        this.spawnNextPiece();
        this.spawnNextPiece(); // 生成当前和下一个方块
        this.startDropTimer();
    }

    // 生成下一个方块
    spawnNextPiece() {
        if (!this.nextPiece) {
            this.nextPiece = this.pieces.createPiece();
        }

        this.currentPiece = this.nextPiece;
        this.currentPiece.x = Math.floor(CONFIG.BOARD_WIDTH / 2) - 1;
        this.currentPiece.y = 0;

        this.nextPiece = this.pieces.createPiece();

        // 检查游戏是否结束
        if (this.isCollision(this.currentPiece)) {
            this.endGame();
            return false;
        }

        return true;
    }

    // 移动方块
    movePiece(dx, dy) {
        if (this.gameOver || this.paused || !this.currentPiece || this.isAnimating) return false;

        const newPiece = {
            ...this.currentPiece,
            x: this.currentPiece.x + dx,
            y: this.currentPiece.y + dy
        };

        if (!this.isCollision(newPiece)) {
            this.currentPiece = newPiece;
            return true;
        }

        // 如果是向下移动失败，则固定方块
        if (dy > 0) {
            this.placePiece();
        }

        return false;
    }

    // 旋转方块
    rotatePiece(direction = 1) {
        if (this.gameOver || this.paused || !this.currentPiece) return false;

        const rotatedPiece = this.pieces.rotatePiece(this.currentPiece, direction);

        // 尝试标准旋转
        if (!this.isCollision(rotatedPiece)) {
            this.currentPiece = rotatedPiece;
            return true;
        }

        // 壁踢检测（Super Rotation System）
        const kickTests = this.getWallKickTests(this.currentPiece.type, this.currentPiece.rotation, rotatedPiece.rotation);

        for (const kick of kickTests) {
            const testPiece = {
                ...rotatedPiece,
                x: rotatedPiece.x + kick.x,
                y: rotatedPiece.y + kick.y
            };

            if (!this.isCollision(testPiece)) {
                this.currentPiece = testPiece;
                return true;
            }
        }

        return false;
    }

    // 获取壁踢测试点
    getWallKickTests(pieceType, fromRotation, toRotation) {
        // 简化的壁踢系统
        const tests = [
            { x: 0, y: 0 },   // 无偏移
            { x: -1, y: 0 },  // 左移
            { x: 1, y: 0 },   // 右移
            { x: 0, y: -1 },  // 上移
            { x: -1, y: -1 }, // 左上
            { x: 1, y: -1 }   // 右上
        ];

        return tests;
    }

    // 硬降落
    hardDrop() {
        if (this.gameOver || this.paused || !this.currentPiece) return;

        let dropDistance = 0;

        while (this.movePiece(0, 1)) {
            dropDistance++;
        }

        // 硬降落奖励分数
        if (dropDistance > 0) {
            this.addScore(dropDistance * 2);
        }
    }

    // 检测碰撞
    isCollision(piece) {
        if (!piece || !piece.shape) return true;

        const blocks = this.pieces.getPieceBlocks(piece);

        for (const block of blocks) {
            // 边界检测
            if (block.x < 0 || block.x >= CONFIG.BOARD_WIDTH ||
                block.y < 0 || block.y >= CONFIG.BOARD_HEIGHT) {
                return true;
            }

            // 与已有方块碰撞检测
            if (this.board[block.y][block.x] && this.board[block.y][block.x].filled) {
                return true;
            }
        }

        return false;
    }

    // 放置方块
    placePiece() {
        if (!this.currentPiece) return;

        const blocks = this.pieces.getPieceBlocks(this.currentPiece);

        // 将方块放置到游戏板上
        blocks.forEach(block => {
            if (block.y >= 0 && block.y < CONFIG.BOARD_HEIGHT &&
                block.x >= 0 && block.x < CONFIG.BOARD_WIDTH) {
                this.board[block.y][block.x] = {
                    color: block.color,
                    filled: true
                };
            }
        });

        // 检测需要消除的行
        const clearResult = this.detectLinesToClear();
        const { clearedLines, clearedBlocks } = clearResult;

        if (clearedLines.length > 0) {
            // 有行需要消除，开始动画化消除过程
            this.startLineClearAnimation(clearResult);
        } else {
            // 没有行需要消除，直接生成下一个方块
            this.spawnNextPiece();
        }

        // 触发方块放置事件
        this.onPiecePlaced(blocks, clearResult);
    }

    // 检测需要消除的行（不实际删除）
    detectLinesToClear() {
        const clearedLines = [];
        const clearedBlocks = [];

        // 从下往上检查每一行
        for (let y = CONFIG.BOARD_HEIGHT - 1; y >= 0; y--) {
            if (this.isLineFull(y)) {
                clearedLines.push(y);

                // 收集这一行中所有有方块的位置信息
                for (let x = 0; x < CONFIG.BOARD_WIDTH; x++) {
                    if (this.board[y][x] && this.board[y][x].filled) {
                        clearedBlocks.push({
                            x: x,
                            y: y,
                            color: this.board[y][x].color
                        });
                    }
                }
            }
        }

        return { clearedLines, clearedBlocks };
    }

    // 开始行消除动画
    startLineClearAnimation(clearResult) {
        const { clearedLines, clearedBlocks } = clearResult;

        // 设置动画状态
        this.isAnimating = true;
        this.animationPhase = 'clearing'; // clearing -> dropping -> complete
        this.animationStartTime = null; // 将在第一次updateAnimation调用时设置
        this.animationDuration = 500; // 动画总时长
        this.clearResult = clearResult;

        // 标记要消除的行（用于渲染）
        this.markedForClear = clearedLines;

        // 计算分数（在动画开始时就计算）
        this.calculateScore(clearedLines.length);

        // 停止自动下降，等动画完成
        this.stopDropTimer();

        console.log(`🎬 开始行消除动画，消除 ${clearedLines.length} 行`);
    }

    // 更新动画状态
    updateAnimation(currentTime) {
        if (!this.isAnimating) return;

        // 第一次调用时设置动画开始时间
        if (this.animationStartTime === null) {
            this.animationStartTime = currentTime;
        }

        const elapsed = currentTime - this.animationStartTime;
        const progress = Math.min(elapsed / this.animationDuration, 1);

        switch (this.animationPhase) {
            case 'clearing':
                if (progress >= 0.3) {
                    // 消除动画完成30%后，实际删除行
                    this.executeLineClear();
                    this.animationPhase = 'dropping';
                    this.animationStartTime = currentTime; // 重置动画开始时间
                }
                break;

            case 'dropping':
                if (progress >= 1) {
                    // 下降动画完成
                    this.completeLineClearAnimation();
                }
                break;
        }

        // 触发动画更新事件
        this.onAnimationUpdate(this.animationPhase, progress);
    }

    // 实际执行行消除
    executeLineClear() {
        const { clearedLines } = this.clearResult;

        // 从上到下排序，确保正确删除
        clearedLines.sort((a, b) => a - b);

        // 从上往下删除行（避免索引问题）
        for (let i = clearedLines.length - 1; i >= 0; i--) {
            this.board.splice(clearedLines[i], 1);
            this.board.unshift(Array(CONFIG.BOARD_WIDTH).fill(null));
        }

        this.lines += clearedLines.length;
        this.updateLevel();
        this.onLinesChanged(this.lines);
        this.markedForClear = [];

        console.log(`🗑️ 实际删除了 ${clearedLines.length} 行`);
    }

    // 完成行消除动画
    completeLineClearAnimation() {
        this.isAnimating = false;
        this.animationPhase = null;
        this.clearResult = null;
        this.markedForClear = [];

        // 生成下一个方块
        this.spawnNextPiece();

        // 恢复自动下降
        this.startDropTimer();

        console.log('✅ 行消除动画完成');
    }

    // 检查行是否已满
    isLineFull(y) {
        for (let x = 0; x < CONFIG.BOARD_WIDTH; x++) {
            if (!this.board[y][x] || !this.board[y][x].filled) {
                return false;
            }
        }
        return true;
    }

    // 计算分数
    calculateScore(linesCleared) {
        if (linesCleared === 0) {
            this.combo = 0;
            return;
        }

        let baseScore = 0;
        switch (linesCleared) {
            case 1:
                baseScore = CONFIG.SCORES.SINGLE;
                break;
            case 2:
                baseScore = CONFIG.SCORES.DOUBLE;
                break;
            case 3:
                baseScore = CONFIG.SCORES.TRIPLE;
                break;
            case 4:
                baseScore = CONFIG.SCORES.TETRIS;
                break;
            default:
                baseScore = CONFIG.SCORES.TETRIS * linesCleared;
        }

        // 连击奖励
        this.combo++;
        const comboMultiplier = 1 + (this.combo - 1) * (CONFIG.SCORES.COMBO_MULTIPLIER - 1);

        // 等级奖励
        const levelMultiplier = this.level;

        const finalScore = Math.floor(baseScore * comboMultiplier * levelMultiplier);
        this.addScore(finalScore);

        // 触发连击事件
        if (this.combo > 1) {
            this.onCombo(this.combo);
        }
    }

    // 添加分数
    addScore(points) {
        this.score += points;
        this.onScoreChanged(this.score, points);
    }

    // 更新等级
    updateLevel() {
        const newLevel = Math.floor(this.lines / 10) + 1;

        if (newLevel > this.level) {
            this.level = newLevel;
            this.updateSpeed();
        }
    }

    // 更新速度
    updateSpeed() {
        this.currentSpeed = Math.max(
            CONFIG.MIN_SPEED,
            CONFIG.INITIAL_SPEED - (this.level - 1) * CONFIG.SPEED_INCREMENT
        );

        if (this.dropTimer) {
            this.stopDropTimer();
            this.startDropTimer();
        }
    }

    // 开始下降计时器
    startDropTimer() {
        if (this.dropTimer) {
            clearInterval(this.dropTimer);
        }

        this.dropTimer = setInterval(() => {
            if (!this.paused && !this.gameOver) {
                this.movePiece(0, 1);
            }
        }, this.currentSpeed);
    }

    // 停止下降计时器
    stopDropTimer() {
        if (this.dropTimer) {
            clearInterval(this.dropTimer);
            this.dropTimer = null;
        }
    }

    // 暂停/恢复游戏
    togglePause() {
        this.paused = !this.paused;
        this.onPauseChanged(this.paused);
    }

    // 结束游戏
    endGame() {
        this.gameOver = true;
        this.stopDropTimer();
        this.onGameOver();
    }

    // 重启游戏
    restart() {
        this.board = [];
        this.currentPiece = null;
        this.nextPiece = null;
        this.score = 0;
        this.lines = 0;
        this.level = 1;
        this.gameOver = false;
        this.paused = false;
        this.combo = 0;
        this.currentSpeed = CONFIG.INITIAL_SPEED;

        // 重置动画状态
        this.isAnimating = false;
        this.animationPhase = null;
        this.animationStartTime = 0;
        this.clearResult = null;
        this.markedForClear = [];

        this.initializeBoard();
        this.createInitialFill();
        this.start();

        this.onRestart();
    }

    // 获取幽灵方块位置
    getGhostPiece() {
        if (!this.currentPiece) return null;

        const ghostPiece = { ...this.currentPiece };

        while (!this.isCollision({ ...ghostPiece, y: ghostPiece.y + 1 })) {
            ghostPiece.y++;
        }

        return ghostPiece;
    }

    // 事件回调（需要在外部设置）
    onScoreChanged(score, increment) { }
    onLinesChanged(lines) { }
    onCombo(comboCount) { }
    onPiecePlaced(blocks, clearedLines) { }
    onGameOver() { }
    onPauseChanged(paused) { }
    onRestart() { }
    onAnimationUpdate(phase, progress) { } // 动画更新回调
}

// 导出
export default TetrisGame;