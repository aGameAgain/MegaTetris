// 游戏配置
const CONFIG = {
    // 游戏区域设置
    BOARD_WIDTH: 24,
    BOARD_HEIGHT: 42,
    BLOCK_SIZE: 12,

    // 初始堆积高度（占屏幕的比例）
    INITIAL_FILL_HEIGHT: 0.2,

    // 中间空隙宽度（格子数）
    GAP_WIDTH: 2,

    // 游戏速度设置
    INITIAL_SPEED: 800,
    SPEED_INCREMENT: 50,
    MIN_SPEED: 100,

    // 分数设置
    SCORES: {
        SINGLE: 100,
        DOUBLE: 300,
        TRIPLE: 500,
        TETRIS: 800,
        COMBO_MULTIPLIER: 1.5
    },

    // 彩虹色调色板
    COLORS: [
        '#FF6B6B', // 红色
        '#4ECDC4', // 青色
        '#45B7D1', // 蓝色
        '#96CEB4', // 绿色
        '#FFEAA7', // 黄色
        '#DDA0DD', // 紫色
        '#98D8C8', // 薄荷绿
        '#F7DC6F', // 金黄色
        '#BB8FCE', // 淡紫色
        '#85C1E9', // 天蓝色
        '#F8C471', // 橙色
        '#82E0AA'  // 浅绿色
    ],

    // 方块类型颜色
    PIECE_COLORS: {
        I: '#4ECDC4',
        O: '#FFEAA7',
        T: '#BB8FCE',
        S: '#96CEB4',
        Z: '#FF6B6B',
        J: '#45B7D1',
        L: '#F8C471'
    },

    // 粒子特效设置
    PARTICLES: {
        COUNT: 30,
        LIFE_TIME: 1000,
        SPEED: 2,
        GRAVITY: 0.1,
        SIZE_MIN: 2,
        SIZE_MAX: 6
    },

    // 动画设置
    ANIMATION: {
        SCORE_POPUP_DURATION: 1000,
        COMBO_SHOW_DURATION: 2000,
        LINE_CLEAR_DURATION: 300
    }
};

// 导出配置
export default CONFIG;