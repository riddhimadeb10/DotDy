import tkinter as tk
from tkinter import font as tkfont

# ── Colors ────────────────────────────────────────────────────────────────────
BG          = "#FFF8F0"       # warm cream background
CANVAS_BG   = "#FFFFFF"
TEN_COLORS  = ["#4A90D9", "#5BA3E8"]   # blue rod stripes
ONE_COLOR   = "#FF7043"                # orange-red unit
ONE_SHINE   = "#FF8A65"
RESULT_TEN  = ["#7B5EA7", "#9B7BC7"]  # purple for result
RESULT_ONE  = "#E91E8C"
RESULT_SHINE= "#F06FAF"
LABEL_TEN   = "#2E6DA4"
LABEL_ONE   = "#BF360C"
LABEL_RES   = "#4A148C"
PLUS_COL    = "#F9A825"
EQ_COL      = "#43A047"
ERR_COL     = "#E53935"
BORDER_COL  = "#FFE0B2"

# ── Block dimensions ──────────────────────────────────────────────────────────
CW   = 34    # cell width
CH   = 26    # cell height
GAP  = 3     # gap between cells in a rod
RGAP = 10    # gap between rods
TOP_Y = 44   # top of blocks area
ROWS  = 10   # cells per rod


def round_rect(canvas, x1, y1, x2, y2, r, **kw):
    """Draw a rounded rectangle on a tkinter canvas."""
    pts = [
        x1+r, y1,  x2-r, y1,
        x2, y1,    x2, y1+r,
        x2, y2-r,  x2, y2,
        x2-r, y2,  x1+r, y2,
        x1, y2,    x1, y2-r,
        x1, y1+r,  x1, y1,
        x1+r, y1,
    ]
    return canvas.create_polygon(pts, smooth=True, **kw)


def draw_ten_rod(canvas, x, colors, shine=True):
    """Draw one ten-rod (10 stacked rounded cells) at x. Returns right edge x."""
    for row in range(ROWS):
        y1 = TOP_Y + row * (CH + GAP)
        y2 = y1 + CH
        fill = colors[row % 2]
        round_rect(canvas, x, y1, x + CW, y2, r=5, fill=fill, outline="white", width=2)
        # subtle shine line
        if shine:
            canvas.create_line(x+4, y1+4, x+4, y2-4, fill="white", width=2)
    return x + CW + RGAP


def draw_one_unit(canvas, x, color, shine_color):
    """Draw one unit block aligned to bottom of rod. Returns right edge x."""
    y1 = TOP_Y + (ROWS - 1) * (CH + GAP)
    y2 = y1 + CH
    round_rect(canvas, x, y1, x + CW, y2, r=6, fill=color, outline="white", width=2)
    canvas.create_line(x+5, y1+5, x+5, y2-5, fill=shine_color, width=2)
    return x + CW + RGAP


def draw_number(canvas, n, x_start, ten_colors, one_color, one_shine, label_color, label):
    """Draw all blocks for n. Returns the x after all blocks."""
    tens = n // 10
    ones = n % 10
    x = x_start

    # Section label at top
    canvas.create_text(x_start, 14, text=label, anchor="nw",
                       font=big_font, fill=label_color)

    for _ in range(tens):
        x = draw_ten_rod(canvas, x, ten_colors)

    if tens > 0 and ones > 0:
        x += 8  # small spacer

    for _ in range(ones):
        x = draw_one_unit(canvas, x, one_color, one_shine)

    if tens == 0 and ones == 0:
        # Show a dotted zero placeholder
        round_rect(canvas, x, TOP_Y + (ROWS-1)*(CH+GAP), x+CW,
                   TOP_Y + ROWS*(CH+GAP)-GAP, r=6,
                   fill="#EEEEEE", outline="#CCCCCC", width=2, dash=(4,4))
        canvas.create_text(x + CW//2, TOP_Y + (ROWS-1)*(CH+GAP) + CH//2,
                           text="0", font=big_font, fill="#AAAAAA")
        x += CW + RGAP

    # Sub-label
    bot_y = TOP_Y + ROWS * (CH + GAP) + 6
    desc = describe(n)
    canvas.create_text(x_start, bot_y, text=f"{n}  •  {desc}",
                       anchor="nw", font=small_font, fill=label_color)

    return x + 10


def describe(n):
    tens, ones = n // 10, n % 10
    parts = []
    if tens:
        parts.append(f"{tens} ten{'s' if tens != 1 else ''}")
    if ones:
        parts.append(f"{ones} one{'s' if ones != 1 else ''}")
    return " + ".join(parts) if parts else "zero"


def draw_operator(canvas, x, symbol, color):
    mid_y = TOP_Y + ROWS * (CH + GAP) // 2
    canvas.create_text(x + 22, mid_y, text=symbol,
                       font=op_font, fill=color, anchor="center")
    return x + 50


def redraw(*args):
    canvas.delete("all")
    err_var.set("")

    raw1 = entry1.get().strip()
    raw2 = entry2.get().strip()

    try:
        n1 = int(raw1) if raw1 else None
        n2 = int(raw2) if raw2 else None
    except ValueError:
        err_var.set("Please type whole numbers only!")
        return

    if (n1 is not None and (n1 < 0 or n1 > 999)) or \
       (n2 is not None and (n2 < 0 or n2 > 999)):
        err_var.set("Numbers must be between 0 and 999.")
        return

    x = 20
    total_height = TOP_Y + ROWS * (CH + GAP) + 50

    canvas.config(height=total_height)

    if n1 is not None:
        x = draw_number(canvas, n1, x,
                        TEN_COLORS, ONE_COLOR, ONE_SHINE, LABEL_TEN, "First number")

    if n1 is not None and n2 is not None:
        x = draw_operator(canvas, x, "+", PLUS_COL)
        x = draw_number(canvas, n2, x,
                        TEN_COLORS, ONE_COLOR, ONE_SHINE, LABEL_ONE, "Second number")
        x = draw_operator(canvas, x, "=", EQ_COL)
        result = n1 + n2
        draw_number(canvas, result, x,
                    RESULT_TEN, RESULT_ONE, RESULT_SHINE, LABEL_RES,
                    f"Answer: {result}")
        x += (result // 10) * (CW + RGAP) + (result % 10) * (CW + RGAP) + 80

    elif n2 is not None:
        x = draw_number(canvas, n2, x,
                        TEN_COLORS, ONE_COLOR, ONE_SHINE, LABEL_ONE, "Second number")

    canvas.config(scrollregion=(0, 0, x + 40, total_height))


# ── Window setup ──────────────────────────────────────────────────────────────
root = tk.Tk()
root.title("Base-10 Blocks")
root.configure(bg=BG)
root.geometry("860x520")
root.resizable(True, True)

# Fonts
big_font   = tkfont.Font(family="Helvetica Neue", size=12, weight="bold")
small_font = tkfont.Font(family="Helvetica Neue", size=10)
op_font    = tkfont.Font(family="Helvetica Neue", size=32, weight="bold")
title_font = tkfont.Font(family="Helvetica Neue", size=20, weight="bold")
entry_font = tkfont.Font(family="Helvetica Neue", size=22, weight="bold")
lbl_font   = tkfont.Font(family="Helvetica Neue", size=13)
err_font   = tkfont.Font(family="Helvetica Neue", size=11)

err_var = tk.StringVar()

# ── Header ────────────────────────────────────────────────────────────────────
header = tk.Frame(root, bg="#4A90D9", pady=10)
header.pack(fill="x")
tk.Label(header, text="Base-10 Blocks", bg="#4A90D9", fg="white",
         font=title_font).pack()
tk.Label(header, text="Type two numbers and watch the blocks appear!",
         bg="#4A90D9", fg="#D0E8FF", font=small_font).pack()

# ── Input row ─────────────────────────────────────────────────────────────────
input_frame = tk.Frame(root, bg=BG, pady=14, padx=20)
input_frame.pack(fill="x")

def styled_label(parent, text):
    return tk.Label(parent, text=text, bg=BG, fg="#555555", font=lbl_font)

def styled_entry(parent):
    e = tk.Entry(parent, width=5, font=entry_font, justify="center",
                 bd=0, relief="flat", bg="white", fg="#333333",
                 insertbackground="#4A90D9",
                 highlightthickness=2, highlightbackground="#BBDEFB",
                 highlightcolor="#4A90D9")
    return e

styled_label(input_frame, "First number").grid(row=0, column=0, padx=(0,6), sticky="w")
entry1 = styled_entry(input_frame)
entry1.grid(row=0, column=1, padx=(0,12), ipady=6)

tk.Label(input_frame, text="+", bg=BG, fg=PLUS_COL,
         font=tkfont.Font(family="Helvetica Neue", size=22, weight="bold")
         ).grid(row=0, column=2, padx=8)

styled_label(input_frame, "Second number").grid(row=0, column=3, padx=(12,6), sticky="w")
entry2 = styled_entry(input_frame)
entry2.grid(row=0, column=4, padx=(0,0), ipady=6)

tk.Label(input_frame, textvariable=err_var, bg=BG, fg=ERR_COL,
         font=err_font).grid(row=1, column=0, columnspan=5, sticky="w", pady=(6,0))

# ── Legend ────────────────────────────────────────────────────────────────────
legend = tk.Frame(root, bg=BG, padx=20, pady=4)
legend.pack(fill="x")

def legend_block(parent, color, text):
    f = tk.Frame(parent, bg=BG)
    f.pack(side="left", padx=(0, 18))
    c = tk.Canvas(f, width=22, height=22, bg=BG, bd=0, highlightthickness=0)
    c.pack(side="left", padx=(0,5))
    round_rect(c, 2, 2, 20, 20, r=4, fill=color, outline="white", width=0)
    tk.Label(f, text=text, bg=BG, fg="#666", font=small_font).pack(side="left")

legend_block(legend, TEN_COLORS[0], "Ten  (blue rod = 10 cells)")
legend_block(legend, ONE_COLOR,     "One  (orange square)")
legend_block(legend, RESULT_TEN[0], "Ten  in the answer (purple)")
legend_block(legend, RESULT_ONE,    "One  in the answer (pink)")

# ── Canvas ────────────────────────────────────────────────────────────────────
frame = tk.Frame(root, bg=BG, padx=16, pady=6)
frame.pack(fill="both", expand=True)

hbar = tk.Scrollbar(frame, orient="horizontal")
hbar.pack(side="bottom", fill="x")

canvas = tk.Canvas(frame, bg=CANVAS_BG, height=340, bd=0,
                   highlightthickness=2, highlightbackground=BORDER_COL,
                   xscrollcommand=hbar.set)
canvas.pack(fill="both", expand=True)
hbar.config(command=canvas.xview)

entry1.bind("<KeyRelease>", redraw)
entry2.bind("<KeyRelease>", redraw)

entry1.insert(0, "21")
entry2.insert(0, "32")
root.update()
redraw()

root.mainloop()
