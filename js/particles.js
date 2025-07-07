// 导入配置
import CONFIG from './config.js';

// 粒子系统
class Particle {
    constructor(x, y, color) {
        this.x = x;
        this.y = y;
        this.vx = (Math.random() - 0.5) * CONFIG.PARTICLES.SPEED * 2;
        this.vy = (Math.random() - 0.5) * CONFIG.PARTICLES.SPEED * 2;
        this.life = CONFIG.PARTICLES.LIFE_TIME;
        this.maxLife = CONFIG.PARTICLES.LIFE_TIME;
        this.size = Math.random() * (CONFIG.PARTICLES.SIZE_MAX - CONFIG.PARTICLES.SIZE_MIN) + CONFIG.PARTICLES.SIZE_MIN;
        this.color = color;
        this.alpha = 1;
    }

    update(deltaTime) {
        this.x += this.vx * deltaTime / 16;
        this.y += this.vy * deltaTime / 16;
        this.vy += CONFIG.PARTICLES.GRAVITY * deltaTime / 16;

        this.life -= deltaTime;
        this.alpha = this.life / this.maxLife;

        return this.life > 0;
    }

    draw(ctx) {
        ctx.save();
        ctx.globalAlpha = this.alpha;
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }
}

class ParticleSystem {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.particles = [];
        this.lastTime = 0;
    }

    // 创建爆炸特效
    createExplosion(x, y, color, count = CONFIG.PARTICLES.COUNT) {
        for (let i = 0; i < count; i++) {
            const particle = new Particle(x, y, color);
            // 爆炸效果：粒子向四周飞散
            const angle = (Math.PI * 2 * i) / count + Math.random() * 0.5;
            const speed = Math.random() * 3 + 1;
            particle.vx = Math.cos(angle) * speed;
            particle.vy = Math.sin(angle) * speed;
            this.particles.push(particle);
        }
    }

    // 创建行消除特效
    createLineClearEffect(y, boardWidth, blockSize) {
        const particleCount = boardWidth * 3;
        for (let i = 0; i < particleCount; i++) {
            const x = Math.random() * (boardWidth * blockSize);
            const yPos = y * blockSize + Math.random() * blockSize;

            // 随机彩虹色
            const colorIndex = Math.floor(Math.random() * CONFIG.COLORS.length);
            const color = CONFIG.COLORS[colorIndex];

            const particle = new Particle(x, yPos, color);
            particle.vx = (Math.random() - 0.5) * 8;
            particle.vy = Math.random() * -4 - 2;
            particle.size = Math.random() * 4 + 2;
            particle.life = CONFIG.PARTICLES.LIFE_TIME * 1.5;
            particle.maxLife = particle.life;

            this.particles.push(particle);
        }
    }

    // 为每个被消除的方块创建粒子效果
    createBlockClearEffect(clearedBlocks, blockSize) {
        clearedBlocks.forEach(block => {
            const centerX = block.x * blockSize + blockSize / 2;
            const centerY = block.y * blockSize + blockSize / 2;

            // 为每个方块创建多个粒子
            const particleCount = 8;
            for (let i = 0; i < particleCount; i++) {
                const particle = new Particle(centerX, centerY, block.color);

                // 爆炸效果：粒子向四周飞散
                const angle = (Math.PI * 2 * i) / particleCount + Math.random() * 0.5;
                const speed = Math.random() * 4 + 2;
                particle.vx = Math.cos(angle) * speed;
                particle.vy = Math.sin(angle) * speed;
                particle.size = Math.random() * 3 + 2;
                particle.life = CONFIG.PARTICLES.LIFE_TIME * 1.2;
                particle.maxLife = particle.life;

                this.particles.push(particle);
            }

            // 额外的闪光效果
            for (let i = 0; i < 3; i++) {
                const particle = new Particle(
                    centerX + (Math.random() - 0.5) * blockSize,
                    centerY + (Math.random() - 0.5) * blockSize,
                    '#FFFFFF'
                );
                particle.vx = (Math.random() - 0.5) * 6;
                particle.vy = (Math.random() - 0.5) * 6;
                particle.size = Math.random() * 2 + 1;
                particle.life = CONFIG.PARTICLES.LIFE_TIME * 0.8;
                particle.maxLife = particle.life;
                this.particles.push(particle);
            }
        });
    }

    // 创建彩虹瀑布特效
    createRainbowCascade(clearedLines, boardWidth, blockSize) {
        clearedLines.forEach((lineY, index) => {
            setTimeout(() => {
                this.createLineClearEffect(lineY, boardWidth, blockSize);

                // 额外的星星特效
                for (let i = 0; i < 10; i++) {
                    const x = Math.random() * (boardWidth * blockSize);
                    const y = lineY * blockSize;
                    const particle = new Particle(x, y, '#FFD700');
                    particle.vx = (Math.random() - 0.5) * 6;
                    particle.vy = Math.random() * -6 - 2;
                    particle.size = Math.random() * 3 + 1;
                    this.particles.push(particle);
                }
            }, index * 100);
        });
    }

    // 创建增强的多行消除特效
    createMultiLineClearEffect(clearedBlocks, clearedLines, blockSize) {
        // 为每个被消除的方块创建粒子效果
        this.createBlockClearEffect(clearedBlocks, blockSize);

        // 根据消除行数创建不同强度的额外效果
        if (clearedLines.length >= 2) {
            // 多行消除额外特效
            const centerX = (CONFIG.BOARD_WIDTH * blockSize) / 2;

            clearedLines.forEach((lineY, index) => {
                setTimeout(() => {
                    const y = lineY * blockSize;

                    // 水平扫过效果
                    for (let i = 0; i < 20; i++) {
                        const x = i * (CONFIG.BOARD_WIDTH * blockSize) / 20;
                        const particle = new Particle(x, y, '#FFD700');
                        particle.vx = (Math.random() - 0.5) * 4;
                        particle.vy = Math.random() * -8 - 4;
                        particle.size = Math.random() * 4 + 2;
                        particle.life = CONFIG.PARTICLES.LIFE_TIME * 1.5;
                        particle.maxLife = particle.life;
                        this.particles.push(particle);
                    }
                }, index * 50);
            });
        }

        // 4行消除(Tetris)的特殊效果
        if (clearedLines.length >= 4) {
            setTimeout(() => {
                const centerX = (CONFIG.BOARD_WIDTH * blockSize) / 2;
                const centerY = (clearedLines[0] + clearedLines[clearedLines.length - 1]) * blockSize / 2;

                // 超级爆炸效果
                for (let i = 0; i < 50; i++) {
                    const angle = Math.random() * Math.PI * 2;
                    const radius = Math.random() * 100 + 50;
                    const x = centerX + Math.cos(angle) * radius;
                    const y = centerY + Math.sin(angle) * radius;

                    const particle = new Particle(centerX, centerY, '#FF6B6B');
                    particle.vx = Math.cos(angle) * (Math.random() * 8 + 4);
                    particle.vy = Math.sin(angle) * (Math.random() * 8 + 4);
                    particle.size = Math.random() * 6 + 3;
                    particle.life = CONFIG.PARTICLES.LIFE_TIME * 2;
                    particle.maxLife = particle.life;
                    this.particles.push(particle);
                }
            }, 200);
        }
    }

    // 创建连击特效
    createComboEffect(centerX, centerY, comboCount) {
        const particleCount = Math.min(comboCount * 20, 100);

        for (let i = 0; i < particleCount; i++) {
            const angle = Math.random() * Math.PI * 2;
            const radius = Math.random() * 50 + 20;
            const x = centerX + Math.cos(angle) * radius;
            const y = centerY + Math.sin(angle) * radius;

            const particle = new Particle(x, y, '#FFD700');
            particle.vx = Math.cos(angle) * (Math.random() * 4 + 2);
            particle.vy = Math.sin(angle) * (Math.random() * 4 + 2);
            particle.size = Math.random() * 5 + 2;
            particle.life = CONFIG.PARTICLES.LIFE_TIME * 2;
            particle.maxLife = particle.life;

            this.particles.push(particle);
        }
    }

    // 创建方块放置特效
    createPlacementEffect(blocks, blockSize) {
        blocks.forEach(block => {
            const x = block.x * blockSize + blockSize / 2;
            const y = block.y * blockSize + blockSize / 2;

            for (let i = 0; i < 5; i++) {
                const particle = new Particle(x, y, block.color);
                particle.vx = (Math.random() - 0.5) * 4;
                particle.vy = (Math.random() - 0.5) * 4;
                particle.size = Math.random() * 2 + 1;
                particle.life = CONFIG.PARTICLES.LIFE_TIME * 0.5;
                particle.maxLife = particle.life;
                this.particles.push(particle);
            }
        });
    }

    // 更新粒子系统
    update(currentTime) {
        const deltaTime = currentTime - this.lastTime;
        this.lastTime = currentTime;

        // 更新所有粒子
        this.particles = this.particles.filter(particle => {
            return particle.update(deltaTime);
        });
    }

    // 渲染粒子系统
    render() {
        // 清除画布
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // 绘制所有粒子
        this.particles.forEach(particle => {
            particle.draw(this.ctx);
        });
    }

    // 清除所有粒子
    clear() {
        this.particles = [];
    }

    // 获取粒子数量
    getParticleCount() {
        return this.particles.length;
    }
}

// 导出
export { ParticleSystem };