// 导入配置
import CONFIG from './config.js';

// 游戏渲染器
class GameRenderer {
    constructor(gameCanvas, nextCanvas) {
        this.gameCanvas = gameCanvas;
        this.nextCanvas = nextCanvas;
        this.gameCtx = gameCanvas.getContext('2d');
        this.nextCtx = nextCanvas.getContext('2d');

        this.blockSize = CONFIG.BLOCK_SIZE;
        this.boardWidth = CONFIG.BOARD_WIDTH;
        this.boardHeight = CONFIG.BOARD_HEIGHT;

        this.setupCanvas();
    }

    // 设置canvas尺寸
    setupCanvas() {
        // 主游戏区域
        this.gameCanvas.width = this.boardWidth * this.blockSize;
        this.gameCanvas.height = this.boardHeight * this.blockSize;

        // 下一个方块预览区域
        this.nextCanvas.width = 120;
        this.nextCanvas.height = 120;

        // 设置高DPI支持
        this.setupHighDPI(this.gameCanvas, this.gameCtx);
        this.setupHighDPI(this.nextCanvas, this.nextCtx);
    }

    // 高DPI支持
    setupHighDPI(canvas, ctx) {
        const devicePixelRatio = window.devicePixelRatio || 1;
        const backingStoreRatio = ctx.webkitBackingStorePixelRatio ||
            ctx.mozBackingStorePixelRatio ||
            ctx.msBackingStorePixelRatio ||
            ctx.oBackingStorePixelRatio ||
            ctx.backingStorePixelRatio || 1;

        const ratio = devicePixelRatio / backingStoreRatio;

        // 记录原始尺寸
        const oldWidth = canvas.width;
        const oldHeight = canvas.height;

        if (devicePixelRatio !== backingStoreRatio) {
            canvas.width = oldWidth * ratio;
            canvas.height = oldHeight * ratio;

            ctx.scale(ratio, ratio);
        }

        // 始终设置样式尺寸，确保正确显示
        canvas.style.width = oldWidth + 'px';
        canvas.style.height = oldHeight + 'px';
    }

    // 绘制游戏主画面
    render(game) {
        this.clearCanvas(this.gameCtx, this.gameCanvas);

        // 绘制游戏板
        this.drawBoard(game.board);

        // 绘制幽灵方块
        if (game.currentPiece && !game.gameOver) {
            this.drawGhostPiece(game.getGhostPiece());
        }

        // 绘制当前方块
        if (game.currentPiece && !game.gameOver) {
            this.drawPiece(game.currentPiece);
        }

        // 绘制网格
        this.drawGrid();

        // 绘制下一个方块
        this.renderNextPiece(game.nextPiece);

        // 绘制暂停遮罩
        if (game.paused) {
            this.drawPauseOverlay();
        }
    }

    // 清除画布
    clearCanvas(ctx, canvas) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    }

    // 绘制游戏板
    drawBoard(board) {
        for (let y = 0; y < board.length; y++) {
            for (let x = 0; x < board[y].length; x++) {
                const block = board[y][x];
                if (block && block.filled) {
                    this.drawBlock(x, y, block.color, 1.0);
                }
            }
        }
    }

    // 绘制方块
    drawPiece(piece) {
        if (!piece || !piece.shape) return;

        const blocks = piece.shape;
        for (let y = 0; y < blocks.length; y++) {
            for (let x = 0; x < blocks[y].length; x++) {
                if (blocks[y][x]) {
                    this.drawBlock(
                        piece.x + x,
                        piece.y + y,
                        piece.color,
                        1.0
                    );
                }
            }
        }
    }

    // 绘制幽灵方块
    drawGhostPiece(ghostPiece) {
        if (!ghostPiece || !ghostPiece.shape) return;

        const blocks = ghostPiece.shape;
        for (let y = 0; y < blocks.length; y++) {
            for (let x = 0; x < blocks[y].length; x++) {
                if (blocks[y][x]) {
                    this.drawBlock(
                        ghostPiece.x + x,
                        ghostPiece.y + y,
                        ghostPiece.color,
                        0.3,
                        true
                    );
                }
            }
        }
    }

    // 绘制单个方块
    drawBlock(x, y, color, alpha = 1.0, isGhost = false) {
        const pixelX = x * this.blockSize;
        const pixelY = y * this.blockSize;

        this.gameCtx.save();
        this.gameCtx.globalAlpha = alpha;

        if (isGhost) {
            // 幽灵方块样式
            this.gameCtx.strokeStyle = color;
            this.gameCtx.lineWidth = 2;
            this.gameCtx.setLineDash([5, 5]);
            this.gameCtx.strokeRect(pixelX + 1, pixelY + 1, this.blockSize - 2, this.blockSize - 2);
        } else {
            // 普通方块样式
            // 主体颜色
            this.gameCtx.fillStyle = color;
            this.gameCtx.fillRect(pixelX, pixelY, this.blockSize, this.blockSize);

            // 高光效果
            const gradient = this.gameCtx.createLinearGradient(
                pixelX, pixelY,
                pixelX + this.blockSize, pixelY + this.blockSize
            );
            gradient.addColorStop(0, 'rgba(255, 255, 255, 0.3)');
            gradient.addColorStop(1, 'rgba(0, 0, 0, 0.3)');

            this.gameCtx.fillStyle = gradient;
            this.gameCtx.fillRect(pixelX, pixelY, this.blockSize, this.blockSize);

            // 边框
            this.gameCtx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
            this.gameCtx.lineWidth = 1;
            this.gameCtx.strokeRect(pixelX + 0.5, pixelY + 0.5, this.blockSize - 1, this.blockSize - 1);
        }

        this.gameCtx.restore();
    }

    // 绘制网格
    drawGrid() {
        this.gameCtx.save();
        this.gameCtx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
        this.gameCtx.lineWidth = 1;

        // 垂直线
        for (let x = 0; x <= this.boardWidth; x++) {
            const pixelX = x * this.blockSize;
            this.gameCtx.beginPath();
            this.gameCtx.moveTo(pixelX + 0.5, 0);
            this.gameCtx.lineTo(pixelX + 0.5, this.boardHeight * this.blockSize);
            this.gameCtx.stroke();
        }

        // 水平线
        for (let y = 0; y <= this.boardHeight; y++) {
            const pixelY = y * this.blockSize;
            this.gameCtx.beginPath();
            this.gameCtx.moveTo(0, pixelY + 0.5);
            this.gameCtx.lineTo(this.boardWidth * this.blockSize, pixelY + 0.5);
            this.gameCtx.stroke();
        }

        this.gameCtx.restore();
    }

    // 绘制下一个方块
    renderNextPiece(nextPiece) {
        this.clearCanvas(this.nextCtx, this.nextCanvas);

        if (!nextPiece || !nextPiece.shape) return;

        const canvasSize = 120;
        const padding = 10; // 内边距
        const availableSize = canvasSize - padding * 2;

        const shape = nextPiece.shape;

        // 找到方块的实际边界（忽略空白行列）
        let minX = Infinity, maxX = -Infinity;
        let minY = Infinity, maxY = -Infinity;
        let blockCount = 0;

        for (let y = 0; y < shape.length; y++) {
            for (let x = 0; x < shape[y].length; x++) {
                if (shape[y][x]) {
                    minX = Math.min(minX, x);
                    maxX = Math.max(maxX, x);
                    minY = Math.min(minY, y);
                    maxY = Math.max(maxY, y);
                    blockCount++;
                }
            }
        }

        // 如果没有方块，直接返回
        if (blockCount === 0) return;

        // 计算方块的实际尺寸（以方块数为单位）
        const blockWidth = maxX - minX + 1;
        const blockHeight = maxY - minY + 1;

        // 根据方块尺寸计算最佳的方块大小
        const maxBlockSize = Math.min(
            availableSize / blockWidth,
            availableSize / blockHeight
        );

        // 使用较小的方块大小以确保美观，但至少16px
        const blockSize = Math.max(16, Math.min(24, Math.floor(maxBlockSize)));

        // 计算实际使用的区域尺寸
        const usedWidth = blockWidth * blockSize;
        const usedHeight = blockHeight * blockSize;

        // 计算居中偏移
        const offsetX = (canvasSize - usedWidth) / 2;
        const offsetY = (canvasSize - usedHeight) / 2;

        this.nextCtx.save();

        // 绘制方块
        for (let y = minY; y <= maxY; y++) {
            for (let x = minX; x <= maxX; x++) {
                if (shape[y][x]) {
                    const pixelX = offsetX + (x - minX) * blockSize;
                    const pixelY = offsetY + (y - minY) * blockSize;

                    // 绘制方块主体
                    this.drawNextPieceBlock(pixelX, pixelY, blockSize, nextPiece.color);
                }
            }
        }

        this.nextCtx.restore();
    }

    // 绘制下一个方块的单个方块
    drawNextPieceBlock(x, y, size, color) {
        // 主体颜色
        this.nextCtx.fillStyle = color;
        this.nextCtx.fillRect(x, y, size, size);

        // 创建渐变高光效果
        const gradient = this.nextCtx.createLinearGradient(x, y, x + size, y + size);
        gradient.addColorStop(0, 'rgba(255, 255, 255, 0.5)');
        gradient.addColorStop(0.3, 'rgba(255, 255, 255, 0.2)');
        gradient.addColorStop(0.7, 'rgba(0, 0, 0, 0.1)');
        gradient.addColorStop(1, 'rgba(0, 0, 0, 0.3)');

        this.nextCtx.fillStyle = gradient;
        this.nextCtx.fillRect(x, y, size, size);

        // 内边框高光
        this.nextCtx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
        this.nextCtx.lineWidth = 1;
        this.nextCtx.strokeRect(x + 1, y + 1, size - 2, size - 2);

        // 外边框
        this.nextCtx.strokeStyle = 'rgba(0, 0, 0, 0.4)';
        this.nextCtx.lineWidth = 1;
        this.nextCtx.strokeRect(x, y, size, size);

        // 小的内部高光点
        this.nextCtx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        this.nextCtx.fillRect(x + 2, y + 2, Math.max(1, size / 8), Math.max(1, size / 8));
    }

    // 绘制暂停遮罩
    drawPauseOverlay() {
        this.gameCtx.save();

        // 半透明遮罩
        this.gameCtx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        this.gameCtx.fillRect(0, 0, this.gameCanvas.width, this.gameCanvas.height);

        // 暂停文字
        this.gameCtx.fillStyle = '#fff';
        this.gameCtx.font = 'bold 24px Arial, sans-serif';
        this.gameCtx.textAlign = 'center';
        this.gameCtx.textBaseline = 'middle';

        const centerX = this.gameCanvas.width / 2;
        const centerY = this.gameCanvas.height / 2;

        this.gameCtx.fillText('暂停', centerX, centerY - 10);

        this.gameCtx.font = '14px Arial, sans-serif';
        this.gameCtx.fillText('按P或ESC继续', centerX, centerY + 20);

        this.gameCtx.restore();
    }

    // 创建行清除动画
    animateLineClear(lineNumbers, onComplete) {
        let animationFrame = 0;
        const maxFrames = 20;

        const animate = () => {
            animationFrame++;

            // 绘制闪烁效果
            lineNumbers.forEach(lineY => {
                const alpha = Math.sin(animationFrame * 0.5) * 0.5 + 0.5;

                this.gameCtx.save();
                this.gameCtx.globalCompositeOperation = 'lighter';
                this.gameCtx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
                this.gameCtx.fillRect(0, lineY * this.blockSize, this.gameCanvas.width, this.blockSize);
                this.gameCtx.restore();
            });

            if (animationFrame < maxFrames) {
                requestAnimationFrame(animate);
            } else {
                if (onComplete) onComplete();
            }
        };

        animate();
    }

    // 调整Canvas尺寸以适应屏幕
    resize() {
        const container = this.gameCanvas.parentElement;
        const containerRect = container.getBoundingClientRect();

        // 计算可用空间（考虑顶部分数区域和底部控制区域）
        const headerHeight = 80; // 估计的header高度
        const controlsHeight = 120; // 估计的controls高度
        const padding = 40; // 边距

        const maxWidth = Math.min(containerRect.width - padding, window.innerWidth - padding);
        const maxHeight = Math.min(window.innerHeight - headerHeight - controlsHeight - padding, window.innerHeight * 0.65);

        const aspectRatio = this.boardWidth / this.boardHeight;

        let newWidth, newHeight;

        if (maxWidth / aspectRatio <= maxHeight) {
            newWidth = maxWidth;
            newHeight = newWidth / aspectRatio;
        } else {
            newHeight = maxHeight;
            newWidth = newHeight * aspectRatio;
        }

        // 计算新的方块大小
        const newBlockSize = Math.floor(newWidth / this.boardWidth);

        // 确保方块大小在合理范围内
        const minBlockSize = window.innerWidth < 480 ? 12 : 15;
        const maxBlockSize = 25;
        const finalBlockSize = Math.max(minBlockSize, Math.min(maxBlockSize, newBlockSize));

        if (finalBlockSize !== this.blockSize) {
            this.blockSize = finalBlockSize;
            this.setupCanvas();

            // 重新设置粒子画布尺寸
            const particlesCanvas = document.getElementById('particlesCanvas');
            if (particlesCanvas) {
                particlesCanvas.width = this.gameCanvas.width;
                particlesCanvas.height = this.gameCanvas.height;
                particlesCanvas.style.width = this.gameCanvas.style.width;
                particlesCanvas.style.height = this.gameCanvas.style.height;
            }
        }
    }
}

// 导出
export default GameRenderer;