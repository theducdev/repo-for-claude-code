#!/usr/bin/env python3
"""Terminal Snake game using curses."""

import curses
import random
import time

WIDTH = 40
HEIGHT = 20

UP = (-1, 0)
DOWN = (1, 0)
LEFT = (0, -1)
RIGHT = (0, 1)

KEY_MAP = {
    curses.KEY_UP: UP,
    curses.KEY_DOWN: DOWN,
    curses.KEY_LEFT: LEFT,
    curses.KEY_RIGHT: RIGHT,
    ord("w"): UP,
    ord("s"): DOWN,
    ord("a"): LEFT,
    ord("d"): RIGHT,
}

OPPOSITES = {UP: DOWN, DOWN: UP, LEFT: RIGHT, RIGHT: LEFT}


def random_food(snake: list[tuple[int, int]]) -> tuple[int, int]:
    while True:
        pos = (random.randint(1, HEIGHT - 2), random.randint(1, WIDTH - 2))
        if pos not in snake:
            return pos


def draw(win, snake, food, score):
    win.clear()
    win.border()

    fy, fx = food
    win.addch(fy, fx, "@", curses.color_pair(2))

    for i, (y, x) in enumerate(snake):
        ch = "O" if i == 0 else "o"
        win.addch(y, x, ch, curses.color_pair(1))

    win.addstr(0, 2, f" Score: {score} ", curses.A_BOLD)
    win.refresh()


def game_over_screen(win, score):
    win.clear()
    win.border()
    msg = "GAME OVER"
    sub = f"Score: {score}"
    hint = "Press R to restart or Q to quit"
    cy, cx = HEIGHT // 2, WIDTH // 2
    win.addstr(cy - 1, cx - len(msg) // 2, msg, curses.A_BOLD | curses.color_pair(3))
    win.addstr(cy, cx - len(sub) // 2, sub)
    win.addstr(cy + 1, cx - len(hint) // 2, hint)
    win.refresh()


def run(stdscr):
    curses.curs_set(0)
    curses.start_color()
    curses.init_pair(1, curses.COLOR_GREEN, curses.COLOR_BLACK)
    curses.init_pair(2, curses.COLOR_RED, curses.COLOR_BLACK)
    curses.init_pair(3, curses.COLOR_YELLOW, curses.COLOR_BLACK)

    win = curses.newwin(HEIGHT, WIDTH, 0, 0)
    win.keypad(True)
    win.nodelay(True)

    while True:
        snake = [(HEIGHT // 2, WIDTH // 2)]
        direction = RIGHT
        food = random_food(snake)
        score = 0
        speed = 0.15

        while True:
            key = win.getch()
            new_dir = KEY_MAP.get(key)
            if new_dir and new_dir != OPPOSITES.get(direction):
                direction = new_dir
            elif key == ord("q"):
                return

            head = (snake[0][0] + direction[0], snake[0][1] + direction[1])

            if (
                head[0] <= 0
                or head[0] >= HEIGHT - 1
                or head[1] <= 0
                or head[1] >= WIDTH - 1
                or head in snake
            ):
                break

            snake.insert(0, head)

            if head == food:
                score += 10
                food = random_food(snake)
                speed = max(0.05, speed - 0.005)
            else:
                snake.pop()

            draw(win, snake, food, score)
            time.sleep(speed)

        game_over_screen(win, score)
        while True:
            key = win.getch()
            if key == ord("r"):
                break
            if key == ord("q"):
                return


def main():
    try:
        curses.wrapper(run)
    except KeyboardInterrupt:
        pass
    print("Thanks for playing!")


if __name__ == "__main__":
    main()
