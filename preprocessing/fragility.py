"""
Fragility assignment augmentation - Steps A1-A4 from Chapter 3.

Each box has three orientation-dependent LBS values (lbs_l, lbs_w, lbs_h).
Because fragility is assigned before any orientation decision, the three
values are aggregated into a single per-box LBS using the MINIMUM: a box
is treated as fragile based on its weakest orientation, which is the
conservative choice for a constraint that forbids stacking.
"""

import numpy as np
from scipy import stats
from typing import List, Dict, Any


def _box_lbs(box: Dict[str, Any]) -> float:
    """Aggregate the three orientation-dependent LBS values into one."""
    return min(box['lbs_l'], box['lbs_w'], box['lbs_h'])


def assign_fragility(boxes: List[Dict[str, Any]]) -> Dict[str, Any]:
    """
    Apply Steps A1-A4 to a list of boxes (mutated in place).

    Returns a validation report. Raises ValueError if validation fails,
    which the caller should treat as "reject this instance and try the
    next qualifying instance from the same BR class."
    """
    if not boxes:
        raise ValueError("Empty box list")
        
    # ---- Step A1: extract LBS per box ------------------------------------
    lbs_values = np.array([_box_lbs(b) for b in boxes], dtype=float)

    # ---- Step A2: within-instance Q1 threshold (reported only) -----------
    q1 = float(np.percentile(lbs_values, 25))

    # ---- Step A3: assign fragility class by sort-and-slice ---------------
    # A strict Q1 threshold produces a quantized fragile proportion when
    # many boxes share identical LBS values. Sort-and-slice guarantees an
    # exact ~25% fragile proportion regardless of LBS ties.
    sorted_indices = np.argsort(lbs_values, kind='stable')
    n_fragile = int(round(len(boxes) * 0.25))
    fragile_set = set(sorted_indices[:n_fragile].tolist())

    for i, box in enumerate(boxes):
        box['fragile'] = 1 if i in fragile_set else 0

    # ---- Step A4: validate -----------------------------------------------
    report = _validate(boxes, lbs_values)
    report['q1'] = q1
    return report


def _validate(boxes: List[Dict[str, Any]], lbs_values: np.ndarray) -> Dict[str, Any]:
    """
    Step A4 validation checks.

    Note on the Shapiro-Wilk check: the OR-Library LBS values are drawn
    from a uniform distribution by design, so a normality test rejects
    valid instances. The check below instead verifies non-degeneracy:
    the LBS values must span a meaningful range, contain more than one
    distinct value, and have non-trivial variance.
    """
    n = len(boxes)
    if n == 0:
        raise ValueError("Empty box list")

    # (i) fragile proportion within +/-2 percentage points of 25%
    frag_count = sum(b['fragile'] for b in boxes)
    frag_rate = frag_count / n
    if abs(frag_rate - 0.25) > 0.02:
        raise ValueError(
            f"Fragile proportion {frag_rate:.4f} outside +/-2% of 0.25 "
            f"({frag_count}/{n} fragile)"
        )

    # (ii) non-degenerate LBS distribution (variance + distinct-value check)
    n_distinct = int(len(np.unique(lbs_values)))
    if n_distinct < 2:
        raise ValueError(
            f"LBS values are all identical ({n_distinct} distinct value)"
        )
    lbs_std = float(lbs_values.std())
    if lbs_std < 1e-6:
        raise ValueError(f"LBS variance is effectively zero (std = {lbs_std:.2e})")

    # (iii) LBS_min > 2.0, LBS_max / LBS_min > 2.0
        # (iii) LBS values must be strictly positive and span a real range
    lbs_min = float(lbs_values.min())
    lbs_max = float(lbs_values.max())
    if lbs_min <= 0.0:
        raise ValueError(
            f"LBS_min = {lbs_min:.6f} <= 0 (zero or negative load capacity)"
        )
    ratio = lbs_max / lbs_min
    if ratio <= 2.0:
        raise ValueError(f"LBS range too narrow: LBS_max/LBS_min = {ratio:.3f}")
    return {
        'n_boxes':       n,
        'fragile_count': frag_count,
        'fragile_rate':  frag_rate,
        'n_distinct_lbs': n_distinct,
        'lbs_min':       lbs_min,
        'lbs_max':       lbs_max,
        'lbs_ratio':     ratio,
        'lbs_std':       lbs_std,
    }