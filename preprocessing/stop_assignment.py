"""
Stop assignment augmentation - Steps B1-B3 from Chapter 3.

Each box is assigned a delivery stop label in {1, ..., S}. The thesis
specifies S = 3 as a fixed controlled variable. Assignment is random
under a recorded seed, and balanced so that each stop receives
approximately the same number of boxes.

Balance is guaranteed by construction (shuffle then slice) rather than
by re-rolling the seed until a balance check happens to pass, which
would be both slow and non-deterministic in runtime.
"""

import numpy as np
from typing import List, Dict, Any


def assign_stops(
    boxes: List[Dict[str, Any]],
    num_stops: int = 3,
    seed: int = 42,
) -> Dict[str, Any]:
    """
    Assign each box a delivery stop in {1, ..., num_stops}.

    Step B1: fixed num_stops.
    Step B2: shuffle indices under the recorded seed.
    Step B3: split into nearly equal groups (guarantees balance).
    """
    n = len(boxes)
    if n == 0:
        raise ValueError("Empty box list")
    if num_stops < 2:
        raise ValueError(f"num_stops must be >= 2, got {num_stops}")
    if n < num_stops:
        raise ValueError(f"Cannot assign {num_stops} stops to only {n} boxes")

    # Step B2: shuffle under the recorded seed
    rng = np.random.default_rng(seed)
    shuffled = rng.permutation(n)

    # Step B3: split into nearly-equal-sized groups
    sizes = [n // num_stops] * num_stops
    for i in range(n % num_stops):
        sizes[i] += 1

    # Assign each group a stop id (1-indexed)
    start = 0
    for stop_id, size in enumerate(sizes, start=1):
        for idx in shuffled[start:start + size]:
            boxes[idx]['stop'] = stop_id
        start += size

    return _validate_balance(boxes, num_stops, seed)


def _validate_balance(
    boxes: List[Dict[str, Any]],
    num_stops: int,
    seed: int,
) -> Dict[str, Any]:
    """Step B3: verify each stop's proportion is within +/-10 pp of 1/S."""
    n = len(boxes)
    counts: Dict[int, int] = {}
    for box in boxes:
        s = box['stop']
        counts[s] = counts.get(s, 0) + 1

    ideal = 1.0 / num_stops
    proportions = {s: counts.get(s, 0) / n for s in range(1, num_stops + 1)}

    for s, p in proportions.items():
        if abs(p - ideal) > 0.10:
            raise ValueError(
                f"Stop {s} proportion {p:.4f} outside +/-10 pp of {ideal:.4f}"
            )

    return {
        'n_boxes':     n,
        'num_stops':   num_stops,
        'seed':        seed,
        'counts':      counts,
        'proportions': proportions,
    }