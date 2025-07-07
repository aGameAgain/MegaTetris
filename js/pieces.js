// 导入配置
import CONFIG from './config.js';

// 俄罗斯方块形状定义
class TetrisPieces {
    constructor() {
        this.pieces = {
            I: [
                [
                    [0, 0, 0, 0],
                    [1, 1, 1, 1],
                    [0, 0, 0, 0],
                    [0, 0, 0, 0]
                ],
                [
                    [0, 0, 1, 0],
                    [0, 0, 1, 0],
                    [0, 0, 1, 0],
                    [0, 0, 1, 0]
                ]
            ],
            O: [
                [
                    [1, 1],
                    [1, 1]
                ]
            ],
            T: [
                [
                    [0, 1, 0],
                    [1, 1, 1],
                    [0, 0, 0]
                ],
                [
                    [0, 1, 0],
                    [0, 1, 1],
                    [0, 1, 0]
                ],
                [
                    [0, 0, 0],
                    [1, 1, 1],
                    [0, 1, 0]
                ],
                [
                    [0, 1, 0],
                    [1, 1, 0],
                    [0, 1, 0]
                ]
            ],
            S: [
                [
                    [0, 1, 1],
                    [1, 1, 0],
                    [0, 0, 0]
                ],
                [
                    [0, 1, 0],
                    [0, 1, 1],
                    [0, 0, 1]
                ]
            ],
            Z: [
                [
                    [1, 1, 0],
                    [0, 1, 1],
                    [0, 0, 0]
                ],
                [
                    [0, 0, 1],
                    [0, 1, 1],
                    [0, 1, 0]
                ]
            ],
            J: [
                [
                    [1, 0, 0],
                    [1, 1, 1],
                    [0, 0, 0]
                ],
                [
                    [0, 1, 1],
                    [0, 1, 0],
                    [0, 1, 0]
                ],
                [
                    [0, 0, 0],
                    [1, 1, 1],
                    [0, 0, 1]
                ],
                [
                    [0, 1, 0],
                    [0, 1, 0],
                    [1, 1, 0]
                ]
            ],
            L: [
                [
                    [0, 0, 1],
                    [1, 1, 1],
                    [0, 0, 0]
                ],
                [
                    [0, 1, 0],
                    [0, 1, 0],
                    [0, 1, 1]
                ],
                [
                    [0, 0, 0],
                    [1, 1, 1],
                    [1, 0, 0]
                ],
                [
                    [1, 1, 0],
                    [0, 1, 0],
                    [0, 1, 0]
                ]
            ]
        };

        this.pieceTypes = Object.keys(this.pieces);
    }

    // 获取随机方块类型
    getRandomPieceType() {
        return this.pieceTypes[Math.floor(Math.random() * this.pieceTypes.length)];
    }

    // 获取方块的形状数据
    getPieceData(type, rotation = 0) {
        if (!this.pieces[type]) return null;

        const rotations = this.pieces[type];
        const rotationIndex = rotation % rotations.length;
        return rotations[rotationIndex];
    }

    // 获取方块的颜色
    getPieceColor(type) {
        return CONFIG.PIECE_COLORS[type] || '#FFFFFF';
    }

    // 创建新的方块实例
    createPiece(type = null, x = 0, y = 0) {
        if (!type) {
            type = this.getRandomPieceType();
        }

        return {
            type: type,
            x: x,
            y: y,
            rotation: 0,
            shape: this.getPieceData(type, 0),
            color: this.getPieceColor(type)
        };
    }

    // 旋转方块
    rotatePiece(piece, direction = 1) {
        const newRotation = (piece.rotation + direction) % this.pieces[piece.type].length;
        if (newRotation < 0) {
            newRotation = this.pieces[piece.type].length - 1;
        }

        return {
            ...piece,
            rotation: newRotation,
            shape: this.getPieceData(piece.type, newRotation)
        };
    }

    // 获取方块的所有占用位置
    getPieceBlocks(piece) {
        const blocks = [];
        if (!piece.shape) return blocks;

        for (let y = 0; y < piece.shape.length; y++) {
            for (let x = 0; x < piece.shape[y].length; x++) {
                if (piece.shape[y][x]) {
                    blocks.push({
                        x: piece.x + x,
                        y: piece.y + y,
                        color: piece.color
                    });
                }
            }
        }

        return blocks;
    }

    // 获取方块的边界框
    getPieceBounds(piece) {
        const blocks = this.getPieceBlocks(piece);
        if (blocks.length === 0) return null;

        const minX = Math.min(...blocks.map(b => b.x));
        const maxX = Math.max(...blocks.map(b => b.x));
        const minY = Math.min(...blocks.map(b => b.y));
        const maxY = Math.max(...blocks.map(b => b.y));

        return {
            left: minX,
            right: maxX,
            top: minY,
            bottom: maxY,
            width: maxX - minX + 1,
            height: maxY - minY + 1
        };
    }
}

// 导出
export default TetrisPieces;