# Constrained 3D Container Loading via GWO Hybridization

**Thesis Project**: Polytechnic University of the Philippines  
**Group 12**: Astejada, Bhasa, Gaa, Leñar

---

## Overview

This tool implements and compares four algorithm configurations for solving the constrained multi-stop Three-Dimensional Bin Packing Problem (3D-BPP):

1. **DGWO** — Discrete Grey Wolf Optimizer (standalone)
2. **MOGWO** — Multi-Objective Grey Wolf Optimizer (standalone)
3. **Sequential Hybrid** — DGWO → MOGWO (relay architecture)
4. **Repair-Based Hybrid** — DGWO → Repair → MOGWO (pipeline architecture)

The system evaluates solutions against six constraint families:
- C1: Container boundary
- C2: Non-overlap
- C3: Weight capacity
- C4: Fragility
- C5: Static stability (≥80% base support)
- C6: Stop-order accessibility (LIFO)

---

## Project Structure
thesis-3dbpp-tool/
├── config/
│ └── config.yaml # All algorithm parameters
├── data/
│ ├── raw/ # OR-Library wtpack files
│ └── processed/ # Augmented records
├── src/
│ ├── algorithms/
│ │ ├── base.py # Abstract base class
│ │ ├── dgwo.py # Standalone DGWO
│ │ ├── mogwo.py # Standalone MOGWO
│ │ ├── sequential.py # Sequential Hybrid
│ │ └── repair_based.py # Repair-Based Hybrid
│ ├── constraints/
│ │ ├── evaluator.py # C1–C6 constraint checks
│ │ └── repair.py # R1–R5 repair operators
│ ├── fitness/
│ │ └── evaluator.py # OF-1, OF-2, PEN-1
│ ├── metrics/
│ │ └── collector.py # SU, CSR, ET, PM
│ ├── preprocessing/
│ │ ├── loader.py # OR-Library parser
│ │ ├── fragility.py # Steps A1–A4
│ │ └── stop_assignment.py # Steps B1–B3
│ ├── statistics/
│ │ └── analysis.py # Statistical tests
│ ├── utils/
│ │ ├── config.py # YAML loader
│ │ └── logger.py # CSV logger
│ └── visualization/
│ ├── plot_3d.py # Plotly 3D diagrams
│ └── convergence.py # Matplotlib curves
├── experiments/
│ └── runner.py # Main entry point
├── notebooks/
│ └── main.ipynb # Colab notebook
├── results/
│ └── logs/ # CSV output
├── tests/
│ └── test_loader.py # Unit tests
├── requirements.txt
├── LICENSE
└── README.md


---

## Installation

### Local Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/thesis-3dbpp-tool.git
cd thesis-3dbpp-tool

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

Google Colab

Open notebooks/main.ipynb in Colab and run the cells.
Quick Start
python

from src.utils.config import load_config
from experiments.runner import run_experiment

# Load configuration
config = load_config("config/config.yaml")

# Run experiment (all 4 configs)
log_path = run_experiment("config/config.yaml")
print(f"Results saved to: {log_path}")

Configuration

All parameters are centralized in config/config.yaml:
yaml

algorithm:
  population_size: 30
  max_iterations: 500
  archive_capacity: 100
  sequential_split: [250, 250]

penalty:
  lambda_weight: 0.10
  lambda_fragility: 0.10
  lambda_balance: 0.10
  lambda_access: 0.10

experiment:
  runs_per_config: 30
  num_instances: 30
  random_seed_base: 42