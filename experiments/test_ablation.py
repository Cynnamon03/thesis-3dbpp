import sys
import json
import time

sys.path.insert(0, 'c:/Users/USER/Downloads/thesis-3dbpp/optimizer')
from thesis_algorithms import RepairBasedHybrid

def run_ablation():
    # Load sample instance
    instance_file = 'c:/Users/USER/Downloads/thesis-3dbpp/sample_for_validator.json'
    with open(instance_file) as f:
        data = json.load(f)

    # Use first 30 boxes to keep it quick
    items = []
    for i in range(min(30, len(data['boxes']))):
        items.append(data['boxes'][i])

    container = data['container']

    # 1. Standard Repair
    print("Running Standard Repair (use_smart_repair=False)...")
    start = time.perf_counter()
    std_opt = RepairBasedHybrid(items, container, pop_size=10, max_iter=20, use_smart_repair=False, seed=42)
    best_std = std_opt.run()
    std_time = time.perf_counter() - start

    # 2. Smart Repair
    print("Running Smart Repair (use_smart_repair=True)...")
    start = time.perf_counter()
    smart_opt = RepairBasedHybrid(items, container, pop_size=10, max_iter=20, use_smart_repair=True, seed=42)
    best_smart = smart_opt.run()
    smart_time = time.perf_counter() - start

    print("\n=== Ablation Results ===")
    print(f"{'Metric':<20} | {'Standard Repair':<15} | {'Smart Repair':<15}")
    print("-" * 55)
    print(f"{'Space Util (SU %)':<20} | {best_std.su:.2f}%{'':<9} | {best_smart.su:.2f}%")
    print(f"{'Constraint (CSR %)':<20} | {best_std.csr:.2f}%{'':<9} | {best_smart.csr:.2f}%")
    print(f"{'Runtime (s)':<20} | {std_time:.2f}s{'':<9} | {smart_time:.2f}s")
    print("-" * 55)
    print("Repair Stats:")
    keys_to_print = ['passes_used', 'smart_evals', 'smart_rotates', 'smart_swaps', 'deferred_R1', 'deferred_R2', 'rmax_hit']
    for k in keys_to_print:
        v1 = std_opt.repair_stats.get(k, 0)
        v2 = smart_opt.repair_stats.get(k, 0)
        print(f"{k:<20} | {v1:<15} | {v2:<15}")

if __name__ == '__main__':
    run_ablation()
