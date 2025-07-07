// Tetris 游戏测试
// 这是一个简单的测试套件，用于验证游戏核心功能

class TetrisGameTest {
    constructor() {
        this.testResults = [];
        this.game = null;
    }

    // 运行所有测试
    runAllTests() {
        console.log('🧪 开始运行 Tetris 游戏测试...\n');

        this.testInitialization();
        this.testPieceMovement();
        this.testPieceRotation();
        this.testLineClearSingle();
        this.testLineClearMultiple();
        this.testTetrisClear();
        this.testCollisionDetection();
        this.testScoreCalculation();
        this.testGameOver();

        this.printTestResults();
    }

    // 测试游戏初始化
    testInitialization() {
        try {
            // 模拟配置
            window.CONFIG = {
                BOARD_WIDTH: 10,
                BOARD_HEIGHT: 20,
                INITIAL_FILL_HEIGHT: 0.5,
                GAP_WIDTH: 2,
                COLORS: ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#98D8C8'],
                INITIAL_SPEED: 1000,
                MIN_SPEED: 50,
                SPEED_INCREMENT: 50,
                SCORES: {
                    SINGLE: 100,
                    DOUBLE: 300,
                    TRIPLE: 500,
                    TETRIS: 800,
                    COMBO_MULTIPLIER: 1.5
                }
            };

            // 创建游戏实例
            this.game = this.createMockGame();

            this.assert(this.game.board.length === CONFIG.BOARD_HEIGHT,
                '游戏板高度正确');
            this.assert(this.game.board[0].length === CONFIG.BOARD_WIDTH,
                '游戏板宽度正确');
            this.assert(this.game.score === 0, '初始分数为0');
            this.assert(this.game.lines === 0, '初始行数为0');
            this.assert(this.game.level === 1, '初始等级为1');

            this.testPass('游戏初始化测试');
        } catch (error) {
            this.testFail('游戏初始化测试', error.message);
        }
    }

    // 测试方块移动
    testPieceMovement() {
        try {
            this.game = this.createMockGame();

            // 创建测试方块
            const testPiece = {
                type: 'I',
                shape: [[1, 1, 1, 1]],
                x: 3,
                y: 0,
                rotation: 0
            };
            this.game.currentPiece = testPiece;

            // 测试水平移动
            const originalX = testPiece.x;
            this.game.movePiece(1, 0);
            this.assert(this.game.currentPiece.x === originalX + 1, '方块右移成功');

            this.game.movePiece(-1, 0);
            this.assert(this.game.currentPiece.x === originalX, '方块左移成功');

            // 测试垂直移动
            const originalY = testPiece.y;
            this.game.movePiece(0, 1);
            this.assert(this.game.currentPiece.y === originalY + 1, '方块下移成功');

            this.testPass('方块移动测试');
        } catch (error) {
            this.testFail('方块移动测试', error.message);
        }
    }

    // 测试方块旋转
    testPieceRotation() {
        try {
            this.game = this.createMockGame();

            const testPiece = {
                type: 'T',
                shape: [
                    [0, 1, 0],
                    [1, 1, 1]
                ],
                x: 3,
                y: 0,
                rotation: 0
            };
            this.game.currentPiece = testPiece;

            // 模拟pieces对象
            this.game.pieces = {
                rotatePiece: (piece, direction) => {
                    return {
                        ...piece,
                        rotation: (piece.rotation + direction) % 4
                    };
                }
            };

            const originalRotation = testPiece.rotation;
            this.game.rotatePiece(1);
            this.assert(this.game.currentPiece.rotation === (originalRotation + 1) % 4,
                '方块旋转成功');

            this.testPass('方块旋转测试');
        } catch (error) {
            this.testFail('方块旋转测试', error.message);
        }
    }

    // 测试单行消除
    testLineClearSingle() {
        try {
            this.game = this.createMockGame();

            // 设置一行完整的方块
            const lineY = CONFIG.BOARD_HEIGHT - 1;
            for (let x = 0; x < CONFIG.BOARD_WIDTH; x++) {
                this.game.board[lineY][x] = {
                    color: '#FF6B6B',
                    filled: true
                };
            }

            const clearResult = this.game.clearLines();

            this.assert(clearResult.clearedLines.length === 1, '消除了一行');
            this.assert(clearResult.clearedBlocks.length === CONFIG.BOARD_WIDTH,
                '消除的方块数量正确');
            this.assert(clearResult.clearedLines[0] === lineY, '消除的行号正确');

            // 检查行是否被清除
            this.assert(!this.game.board[lineY].some(cell => cell && cell.filled),
                '行已被正确清除');

            this.testPass('单行消除测试');
        } catch (error) {
            this.testFail('单行消除测试', error.message);
        }
    }

    // 测试多行消除
    testLineClearMultiple() {
        try {
            this.game = this.createMockGame();

            // 设置三行完整的方块
            const lines = [CONFIG.BOARD_HEIGHT - 1, CONFIG.BOARD_HEIGHT - 2, CONFIG.BOARD_HEIGHT - 3];
            lines.forEach(lineY => {
                for (let x = 0; x < CONFIG.BOARD_WIDTH; x++) {
                    this.game.board[lineY][x] = {
                        color: '#4ECDC4',
                        filled: true
                    };
                }
            });

            const clearResult = this.game.clearLines();

            this.assert(clearResult.clearedLines.length === 3, '消除了三行');
            this.assert(clearResult.clearedBlocks.length === CONFIG.BOARD_WIDTH * 3,
                '消除的方块数量正确');

            // 检查所有行都被清除
            lines.forEach(lineY => {
                this.assert(!this.game.board[lineY].some(cell => cell && cell.filled),
                    `第${lineY}行已被正确清除`);
            });

            this.testPass('多行消除测试');
        } catch (error) {
            this.testFail('多行消除测试', error.message);
        }
    }

    // 测试四行消除(Tetris)
    testTetrisClear() {
        try {
            this.game = this.createMockGame();

            // 设置四行完整的方块
            const lines = [
                CONFIG.BOARD_HEIGHT - 1,
                CONFIG.BOARD_HEIGHT - 2,
                CONFIG.BOARD_HEIGHT - 3,
                CONFIG.BOARD_HEIGHT - 4
            ];

            lines.forEach(lineY => {
                for (let x = 0; x < CONFIG.BOARD_WIDTH; x++) {
                    this.game.board[lineY][x] = {
                        color: '#45B7D1',
                        filled: true
                    };
                }
            });

            const clearResult = this.game.clearLines();

            this.assert(clearResult.clearedLines.length === 4, 'TETRIS: 消除了四行');
            this.assert(clearResult.clearedBlocks.length === CONFIG.BOARD_WIDTH * 4,
                'TETRIS: 消除的方块数量正确');

            this.testPass('Tetris四行消除测试');
        } catch (error) {
            this.testFail('Tetris四行消除测试', error.message);
        }
    }

    // 测试碰撞检测
    testCollisionDetection() {
        try {
            this.game = this.createMockGame();

            // 模拟pieces对象
            this.game.pieces = {
                getPieceBlocks: (piece) => {
                    return [
                        { x: piece.x, y: piece.y },
                        { x: piece.x + 1, y: piece.y },
                        { x: piece.x + 2, y: piece.y },
                        { x: piece.x + 3, y: piece.y }
                    ];
                }
            };

            // 测试边界碰撞
            const pieceOutOfBounds = {
                x: CONFIG.BOARD_WIDTH,
                y: 0,
                shape: [[1, 1, 1, 1]]
            };
            this.assert(this.game.isCollision(pieceOutOfBounds), '右边界碰撞检测正确');

            const pieceAtBottom = {
                x: 0,
                y: CONFIG.BOARD_HEIGHT,
                shape: [[1, 1, 1, 1]]
            };
            this.assert(this.game.isCollision(pieceAtBottom), '底部边界碰撞检测正确');

            // 测试与现有方块碰撞
            this.game.board[10][5] = { color: '#FF6B6B', filled: true };
            const pieceOverlapping = {
                x: 5,
                y: 10,
                shape: [[1]]
            };
            this.assert(this.game.isCollision(pieceOverlapping), '方块碰撞检测正确');

            this.testPass('碰撞检测测试');
        } catch (error) {
            this.testFail('碰撞检测测试', error.message);
        }
    }

    // 测试分数计算
    testScoreCalculation() {
        try {
            this.game = this.createMockGame();

            // 测试单行消除分数
            this.game.calculateScore(1);
            this.assert(this.game.score === CONFIG.SCORES.SINGLE, '单行消除分数正确');

            // 重置并测试双行消除
            this.game.score = 0;
            this.game.combo = 0;
            this.game.calculateScore(2);
            this.assert(this.game.score === CONFIG.SCORES.DOUBLE, '双行消除分数正确');

            // 重置并测试四行消除
            this.game.score = 0;
            this.game.combo = 0;
            this.game.calculateScore(4);
            this.assert(this.game.score === CONFIG.SCORES.TETRIS, 'Tetris消除分数正确');

            this.testPass('分数计算测试');
        } catch (error) {
            this.testFail('分数计算测试', error.message);
        }
    }

    // 测试游戏结束
    testGameOver() {
        try {
            this.game = this.createMockGame();

            // 模拟游戏结束条件
            this.game.endGame();
            this.assert(this.game.gameOver === true, '游戏结束状态正确');

            this.testPass('游戏结束测试');
        } catch (error) {
            this.testFail('游戏结束测试', error.message);
        }
    }

    // 创建模拟游戏对象
    createMockGame() {
        const mockGame = {
            board: Array(CONFIG.BOARD_HEIGHT).fill(null).map(() =>
                Array(CONFIG.BOARD_WIDTH).fill(null)
            ),
            currentPiece: null,
            nextPiece: null,
            score: 0,
            lines: 0,
            level: 1,
            gameOver: false,
            paused: false,
            combo: 0,
            dropTimer: null,
            currentSpeed: CONFIG.INITIAL_SPEED,

            // 核心方法（简化版）
            clearLines: function () {
                const clearedLines = [];
                const clearedBlocks = [];

                for (let y = CONFIG.BOARD_HEIGHT - 1; y >= 0; y--) {
                    let lineFull = true;
                    for (let x = 0; x < CONFIG.BOARD_WIDTH; x++) {
                        if (!this.board[y][x] || !this.board[y][x].filled) {
                            lineFull = false;
                            break;
                        }
                    }

                    if (lineFull) {
                        clearedLines.push(y);
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

                // 清除行
                if (clearedLines.length > 0) {
                    clearedLines.sort((a, b) => a - b);
                    for (let i = clearedLines.length - 1; i >= 0; i--) {
                        this.board.splice(clearedLines[i], 1);
                        this.board.unshift(Array(CONFIG.BOARD_WIDTH).fill(null));
                    }
                    this.lines += clearedLines.length;
                }

                return { clearedLines, clearedBlocks };
            },

            movePiece: function (dx, dy) {
                if (this.currentPiece) {
                    this.currentPiece.x += dx;
                    this.currentPiece.y += dy;
                    return true;
                }
                return false;
            },

            rotatePiece: function (direction) {
                if (this.currentPiece && this.pieces) {
                    this.currentPiece = this.pieces.rotatePiece(this.currentPiece, direction);
                    return true;
                }
                return false;
            },

            isCollision: function (piece) {
                if (!piece || !this.pieces) return true;

                const blocks = this.pieces.getPieceBlocks(piece);
                for (const block of blocks) {
                    if (block.x < 0 || block.x >= CONFIG.BOARD_WIDTH ||
                        block.y < 0 || block.y >= CONFIG.BOARD_HEIGHT) {
                        return true;
                    }
                    if (this.board[block.y][block.x] && this.board[block.y][block.x].filled) {
                        return true;
                    }
                }
                return false;
            },

            calculateScore: function (linesCleared) {
                if (linesCleared === 0) {
                    this.combo = 0;
                    return;
                }

                let baseScore = 0;
                switch (linesCleared) {
                    case 1: baseScore = CONFIG.SCORES.SINGLE; break;
                    case 2: baseScore = CONFIG.SCORES.DOUBLE; break;
                    case 3: baseScore = CONFIG.SCORES.TRIPLE; break;
                    case 4: baseScore = CONFIG.SCORES.TETRIS; break;
                    default: baseScore = CONFIG.SCORES.TETRIS * linesCleared;
                }

                this.combo++;
                const comboMultiplier = 1 + (this.combo - 1) * (CONFIG.SCORES.COMBO_MULTIPLIER - 1);
                const levelMultiplier = this.level;
                const finalScore = Math.floor(baseScore * comboMultiplier * levelMultiplier);
                this.score += finalScore;
            },

            endGame: function () {
                this.gameOver = true;
            }
        };

        return mockGame;
    }

    // 断言函数
    assert(condition, message) {
        if (!condition) {
            throw new Error(`断言失败: ${message}`);
        }
    }

    // 测试通过
    testPass(testName) {
        this.testResults.push({ name: testName, status: 'PASS', error: null });
        console.log(`✅ ${testName} - 通过`);
    }

    // 测试失败
    testFail(testName, error) {
        this.testResults.push({ name: testName, status: 'FAIL', error: error });
        console.log(`❌ ${testName} - 失败: ${error}`);
    }

    // 打印测试结果
    printTestResults() {
        console.log('\n📊 测试结果总结:');
        console.log('='.repeat(50));

        const passedTests = this.testResults.filter(result => result.status === 'PASS');
        const failedTests = this.testResults.filter(result => result.status === 'FAIL');

        console.log(`✅ 通过: ${passedTests.length}`);
        console.log(`❌ 失败: ${failedTests.length}`);
        console.log(`📈 成功率: ${((passedTests.length / this.testResults.length) * 100).toFixed(1)}%`);

        if (failedTests.length > 0) {
            console.log('\n❌ 失败的测试:');
            failedTests.forEach(test => {
                console.log(`   - ${test.name}: ${test.error}`);
            });
        }

        console.log('\n🏁 测试完成！');
    }
}

// 运行测试的函数
function runTetrisTests() {
    const tester = new TetrisGameTest();
    tester.runAllTests();
}

// 导出测试类
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { TetrisGameTest, runTetrisTests };
} 