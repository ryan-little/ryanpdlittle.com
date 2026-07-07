"""Generate cumulative-points charts for the league through R03.

Produces two variants: light and dark, swapped by site theme.
"""
from pathlib import Path
import matplotlib.pyplot as plt

HERE = Path(__file__).parent

rounds = [1, 2, 3]
per_round = {
    "M":    [177, 506, 202],
    "A":    [213, 481, 140],
    "Ryan": [177, 263, 219],
    "S":    [145, 252, 132],
    "D":    [110, 253,  82],
}

def cum(xs):
    out, running = [], 0
    for x in xs:
        running += x
        out.append(running)
    return out

cumulative = {name: cum(scores) for name, scores in per_round.items()}


def render(mode: str, out: Path) -> None:
    if mode == "dark":
        palette = dict(
            bg="#0a0a0a",
            text="#e0e0e0",
            text_muted="#9ca3af",
            grid="#27272a",
            band="#3d2e00",
            ryan="#e8a849",
            m="#ef4444",
            a="#94a3b8",
            bg_line="#3f3f46",
        )
    else:
        palette = dict(
            bg="#f5f5f5",
            text="#1a1a1a",
            text_muted="#6b7280",
            grid="#e5e7eb",
            band="#fef3c7",
            ryan="#c2410c",
            m="#dc2626",
            a="#64748b",
            bg_line="#d4d4d8",
        )

    style = {
        "M":    dict(color=palette["m"],    lw=2.6, alpha=1.0, zorder=4),
        "Ryan": dict(color=palette["ryan"], lw=3.2, alpha=1.0, zorder=5),
        "A":    dict(color=palette["a"],    lw=2.0, alpha=0.95, zorder=3),
        "S":    dict(color=palette["bg_line"], lw=1.4, alpha=0.85, zorder=2),
        "D":    dict(color=palette["bg_line"], lw=1.4, alpha=0.85, zorder=2),
    }

    fig, ax = plt.subplots(figsize=(8.5, 4.8), dpi=160)
    fig.patch.set_facecolor(palette["bg"])
    ax.set_facecolor(palette["bg"])

    ax.axvspan(1.88, 2.12, color=palette["band"], alpha=0.45, zorder=0)

    for name, scores in cumulative.items():
        ax.plot(rounds, scores, marker="o", markersize=6, **style[name])

    label_offsets = {"M": 12, "A": -12, "Ryan": 0, "S": -8, "D": 8}
    for name, scores in cumulative.items():
        s = style[name]
        ax.text(
            3.06, scores[-1] + label_offsets[name], name,
            color=s["color"], va="center", ha="left",
            fontsize=11, fontweight="bold" if name in ("M", "Ryan") else "normal",
        )

    # R02 cliff annotations, both above their respective points, offset
    # horizontally so they don't overlap lines converging on R02.
    ax.annotate(
        "M plays 3x Boost on LEC\n+506 pts",
        xy=(2, cumulative["M"][1]),
        xytext=(2.35, 810),
        ha="center", fontsize=9.5, color=palette["m"],
        arrowprops=dict(arrowstyle="-", color=palette["m"], lw=0.9,
                        shrinkA=0, shrinkB=5),
    )
    ax.annotate(
        "Me: Limitless\n+263 pts",
        xy=(2, cumulative["Ryan"][1]),
        xytext=(1.62, 560),
        ha="center", fontsize=9.5, color=palette["ryan"],
        arrowprops=dict(arrowstyle="-", color=palette["ryan"], lw=0.9,
                        shrinkA=0, shrinkB=5),
    )

    ax.set_xticks(rounds)
    ax.set_xticklabels(["R01 Australia", "R02 China", "R03 Suzuka"],
                       fontsize=10, color=palette["text"])
    ax.set_ylabel("cumulative points", fontsize=10, color=palette["text_muted"])
    ax.set_xlim(0.82, 3.28)
    ax.set_ylim(0, 970)
    ax.tick_params(axis="y", colors=palette["text_muted"], labelsize=9)
    ax.tick_params(axis="x", colors=palette["text"])
    ax.grid(True, axis="y", linestyle=":", color=palette["grid"],
            alpha=0.7, zorder=1)
    for side in ("top", "right"):
        ax.spines[side].set_visible(False)
    for side in ("left", "bottom"):
        ax.spines[side].set_color(palette["text_muted"])
        ax.spines[side].set_linewidth(0.8)

    plt.tight_layout()
    plt.savefig(out, bbox_inches="tight", facecolor=palette["bg"])
    plt.close(fig)
    print(f"wrote {out}")


render("light", HERE / "league-cumulative-light.png")
render("dark",  HERE / "league-cumulative-dark.png")
