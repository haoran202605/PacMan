#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""简单吃豆人游戏 - Simple Pac-Man Game"""

import pygame
import sys
import random

# 初始化pygame
pygame.init()

# 屏幕设置
WIDTH, HEIGHT = 600, 600
GRID_SIZE = 20
GRID_WIDTH = WIDTH // GRID_SIZE
GRID_HEIGHT = HEIGHT // GRID_SIZE
FPS = 60

# 游戏速度设置（每次移动需要的帧数，数值越大速度越慢）
PACMAN_MOVE_INTERVAL = 3  # 吃豆人每3帧移动一次
GHOST_MOVE_INTERVAL = 5   # 鬼每5帧移动一次

# 颜色
BLACK = (0, 0, 0)
WHITE = (255, 255, 255)
YELLOW = (255, 255, 0)
BLUE = (0, 0, 255)
RED = (255, 0, 0)
GREEN = (0, 255, 0)

# 创建屏幕
screen = pygame.display.set_mode((WIDTH, HEIGHT))
pygame.display.set_caption("吃豆人 - Pac-Man")
clock = pygame.time.Clock()

# 字体
font = pygame.font.SysFont('SimHei', 24)


class Pacman:
    def __init__(self):
        self.x = GRID_WIDTH // 2
        self.y = GRID_HEIGHT // 2
        self.direction = (1, 0)  # 初始向右
        self.next_direction = (1, 0)
        self.speed = 1
        self.radius = GRID_SIZE // 2 - 2
        self.mouth_angle = 0
        self.mouth_direction = 1
        self.mouth_speed = 5
        self.move_counter = 0

    def get_position(self):
        return (self.x * GRID_SIZE + GRID_SIZE // 2, self.y * GRID_SIZE + GRID_SIZE // 2)

    def update(self):
        # 更新嘴巴动画
        self.mouth_angle += self.mouth_speed * self.mouth_direction
        if self.mouth_angle >= 45 or self.mouth_angle <= 0:
            self.mouth_direction *= -1
        
        # 移动计数器
        self.move_counter += 1
        if self.move_counter < PACMAN_MOVE_INTERVAL:
            return
        self.move_counter = 0
        
        # 尝试改变方向
        if self.next_direction != self.direction:
            new_x = self.x + self.next_direction[0]
            new_y = self.y + self.next_direction[1]
            if 0 <= new_x < GRID_WIDTH and 0 <= new_y < GRID_HEIGHT:
                if not walls[new_y][new_x]:
                    self.direction = self.next_direction
        # 移动
        new_x = self.x + self.direction[0]
        new_y = self.y + self.direction[1]
        if 0 <= new_x < GRID_WIDTH and 0 <= new_y < GRID_HEIGHT:
            if not walls[new_y][new_x]:
                self.x = new_x
                self.y = new_y

    def draw(self, surface):
        angle_start = 0
        angle_end = 360
        # 根据方向调整嘴巴位置
        if self.direction == (1, 0):  # 向右
            angle_start = self.mouth_angle
            angle_end = 360 - self.mouth_angle
        elif self.direction == (-1, 0):  # 向左
            angle_start = 180 + self.mouth_angle
            angle_end = 180 - self.mouth_angle
        elif self.direction == (0, -1):  # 向上
            angle_start = 90 + self.mouth_angle
            angle_end = 90 - self.mouth_angle
        elif self.direction == (0, 1):  # 向下
            angle_start = 270 + self.mouth_angle
            angle_end = 270 - self.mouth_angle
        # 画吃豆人
        center = self.get_position()
        pygame.draw.arc(surface, YELLOW, (center[0] - self.radius, center[1] - self.radius, self.radius * 2, self.radius * 2), angle_start * 3.14159 / 180, angle_end * 3.14159 / 180, self.radius * 2)
        pygame.draw.circle(surface, YELLOW, center, self.radius)


class Ghost:
    def __init__(self, x, y, color, speed=1):
        self.x = x
        self.y = y
        self.color = color
        self.speed = speed
        self.direction = (random.choice([-1, 0, 1]), random.choice([-1, 0, 1]))
        self.radius = GRID_SIZE // 2 - 2
        self.target = None
        self.move_counter = 0

    def get_position(self):
        return (self.x * GRID_SIZE + GRID_SIZE // 2, self.y * GRID_SIZE + GRID_SIZE // 2)

    def update(self, pacman):
        # 移动计数器
        self.move_counter += 1
        if self.move_counter < GHOST_MOVE_INTERVAL:
            return
        self.move_counter = 0
        
        # 简单AI: 追踪吃豆人
        px, py = pacman.x, pacman.y
        # 计算方向
        dx = px - self.x
        dy = py - self.y
        # 优先水平移动
        if abs(dx) > abs(dy):
            new_dir = (1 if dx > 0 else -1, 0)
        else:
            new_dir = (0, 1 if dy > 0 else -1)
        # 尝试移动
        new_x = self.x + new_dir[0]
        new_y = self.y + new_dir[1]
        if 0 <= new_x < GRID_WIDTH and 0 <= new_y < GRID_HEIGHT:
            if not walls[new_y][new_x]:
                self.direction = new_dir
        # 移动
        new_x = self.x + self.direction[0]
        new_y = self.y + self.direction[1]
        if 0 <= new_x < GRID_WIDTH and 0 <= new_y < GRID_HEIGHT:
            if not walls[new_y][new_x]:
                self.x = new_x
                self.y = new_y

    def draw(self, surface):
        center = self.get_position()
        # 画鬼的身体
        pygame.draw.circle(surface, self.color, center, self.radius)
        # 画眼睛
        eye_offset = self.radius // 3
        eye1_pos = (center[0] - eye_offset, center[1] - eye_offset)
        eye2_pos = (center[0] + eye_offset, center[1] - eye_offset)
        pygame.draw.circle(surface, WHITE, eye1_pos, self.radius // 4)
        pygame.draw.circle(surface, WHITE, eye2_pos, self.radius // 4)
        # 画眼珠
        pygame.draw.circle(surface, BLUE, eye1_pos, self.radius // 8)
        pygame.draw.circle(surface, BLUE, eye2_pos, self.radius // 8)


class Button:
    def __init__(self, x, y, width, height, text, color, hover_color):
        self.rect = pygame.Rect(x, y, width, height)
        self.text = text
        self.color = color
        self.hover_color = hover_color
        self.font = pygame.font.SysFont('SimHei', 24)

    def draw(self, surface):
        mouse_pos = pygame.mouse.get_pos()
        current_color = self.hover_color if self.rect.collidepoint(mouse_pos) else self.color
        pygame.draw.rect(surface, current_color, self.rect, border_radius=10)
        pygame.draw.rect(surface, WHITE, self.rect, 2, border_radius=10)

        text_surface = self.font.render(self.text, True, WHITE)
        text_rect = text_surface.get_rect(center=self.rect.center)
        surface.blit(text_surface, text_rect)

    def is_clicked(self, event):
        if event.type == pygame.MOUSEBUTTONDOWN and event.button == 1:
            return self.rect.collidepoint(event.pos)
        return False


class Dot:
    def __init__(self, x, y):
        self.x = x
        self.y = y
        self.radius = GRID_SIZE // 6
        self.collected = False

    def get_position(self):
        return (self.x * GRID_SIZE + GRID_SIZE // 2, self.y * GRID_SIZE + GRID_SIZE // 2)

    def draw(self, surface):
        if not self.collected:
            pygame.draw.circle(surface, WHITE, self.get_position(), self.radius)

    def check_collision(self, pacman):
        if self.collected:
            return False
        px, py = pacman.get_position()
        dx = px - self.get_position()[0]
        dy = py - self.get_position()[1]
        distance = (dx**2 + dy**2)**0.5
        if distance < self.radius + pacman.radius:
            self.collected = True
            return True
        return False


# 创建地图
walls = [[False for _ in range(GRID_WIDTH)] for _ in range(GRID_HEIGHT)]
# 添加一些墙
for i in range(GRID_WIDTH):
    walls[0][i] = True
    walls[GRID_HEIGHT-1][i] = True
for i in range(GRID_HEIGHT):
    walls[i][0] = True
    walls[i][GRID_WIDTH-1] = True
# 添加一些内部墙
for i in range(5, 15):
    walls[5][i] = True
    walls[15][i] = True
for i in range(5, 15):
    walls[i][5] = True
    walls[i][15] = True

# 创建豆子
dots = []
for y in range(GRID_HEIGHT):
    for x in range(GRID_WIDTH):
        if not walls[y][x] and (x != GRID_WIDTH//2 or y != GRID_HEIGHT//2):
            dots.append(Dot(x, y))

# 创建吃豆人
pacman = Pacman()

# 创建鬼
ghosts = [
    Ghost(1, 1, RED, 0.5),
    Ghost(GRID_WIDTH-2, 1, BLUE, 0.5),
    Ghost(1, GRID_HEIGHT-2, GREEN, 0.5),
]

# 创建重新开始按钮
restart_button = Button(WIDTH//2 - 100, HEIGHT//2 + 50, 200, 50, "重新开始", GREEN, (100, 200, 100))

# 游戏状态
score = 0
lives = 3
game_over = False


# 主游戏循环
def main():
    global score, lives, game_over
    running = True
    while running:
        # 处理事件
        for event in pygame.event.get():
            if event.type == pygame.QUIT:
                running = False
            elif event.type == pygame.KEYDOWN:
                if event.key == pygame.K_ESCAPE:
                    running = False
                elif not game_over:
                    if event.key == pygame.K_UP:
                        pacman.next_direction = (0, -1)
                    elif event.key == pygame.K_DOWN:
                        pacman.next_direction = (0, 1)
                    elif event.key == pygame.K_LEFT:
                        pacman.next_direction = (-1, 0)
                    elif event.key == pygame.K_RIGHT:
                        pacman.next_direction = (1, 0)
            
            # 检查按钮点击
            if restart_button.is_clicked(event):
                reset_game()
                game_over = False

        if not game_over:
            # 更新游戏状态
            pacman.update()
            for ghost in ghosts:
                ghost.update(pacman)

            # 检查碰撞
            for ghost in ghosts:
                gx, gy = ghost.get_position()
                px, py = pacman.get_position()
                dx = gx - px
                dy = gy - py
                distance = (dx**2 + dy**2)**0.5
                if distance < pacman.radius + ghost.radius:
                    lives -= 1
                    if lives <= 0:
                        game_over = True
                    else:
                        # 重置位置
                        pacman.x = GRID_WIDTH // 2
                        pacman.y = GRID_HEIGHT // 2
                        pacman.direction = (1, 0)
                        ghost.x = random.randint(1, GRID_WIDTH-2)
                        ghost.y = random.randint(1, GRID_HEIGHT-2)

            # 检查豆子碰撞
            for dot in dots:
                if dot.check_collision(pacman):
                    score += 10

            # 检查胜利
            if all(dot.collected for dot in dots):
                game_over = True

        # 绘制
        screen.fill(BLACK)

        # 画墙
        for y in range(GRID_HEIGHT):
            for x in range(GRID_WIDTH):
                if walls[y][x]:
                    pygame.draw.rect(screen, BLUE, (x * GRID_SIZE, y * GRID_SIZE, GRID_SIZE, GRID_SIZE))

        # 画豆子
        for dot in dots:
            dot.draw(screen)

        # 画吃豆人
        pacman.draw(screen)

        # 画鬼
        for ghost in ghosts:
            ghost.draw(screen)

        # 画按钮（仅在游戏结束时显示）
        if game_over:
            restart_button.draw(screen)

        # 画分数和生命
        score_text = font.render(f"分数: {score}", True, WHITE)
        lives_text = font.render(f"生命: {lives}", True, WHITE)
        screen.blit(score_text, (10, 10))
        screen.blit(lives_text, (10, 40))

        if game_over:
            if all(dot.collected for dot in dots):
                game_over_text = font.render("你赢了! 点击按钮重新开始", True, GREEN)
            else:
                game_over_text = font.render("游戏结束! 点击按钮重新开始", True, RED)
            screen.blit(game_over_text, (WIDTH//2 - 150, HEIGHT//2))

        pygame.display.flip()
        clock.tick(FPS)

    pygame.quit()
    sys.exit()


def reset_game():
    global score, lives, game_over
    score = 0
    lives = 3
    game_over = False
    pacman.x = GRID_WIDTH // 2
    pacman.y = GRID_HEIGHT // 2
    pacman.direction = (1, 0)
    pacman.next_direction = (1, 0)
    for dot in dots:
        dot.collected = False
    for ghost in ghosts:
        ghost.x = random.randint(1, GRID_WIDTH-2)
        ghost.y = random.randint(1, GRID_HEIGHT-2)


if __name__ == "__main__":
    main()
