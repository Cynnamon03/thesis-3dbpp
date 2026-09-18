import sys
import json
import time
import argparse
import tracemalloc
from concurrent.futures import ProcessPoolExecutor, as_completed

from instance_reader import load_instance
from thesis_algorithms import StandaloneDGWO, StandaloneMOGWO, SequentialHybrid, RepairBasedHybrid
from thesis_metrics import evaluate_constraints
from webapp_metrics import compute_weight_capacity, space_utilization

def run_strategy(strategy, instance_path, max_time):
    # Load instance inside the child process
    container, items = load_instance(instance_path)
    n = len(items)

    weight_cap = compute_weight_capacity(items, container)
    
    # Thesis configurations:
    pop_size = 30
    max_iter = 500
    lambda_penalty = 0.10
    
    opt_class = {
        "DGWO": StandaloneDGWO,
        "MOGWO": StandaloneMOGWO,
        "SEQ": SequentialHybrid,
        "REP": RepairBasedHybrid
    }[strategy]
    
    optimizer = opt_class(
        items=items,
        container=container,
        pop_size=pop_size,
        max_iter=max_iter,
        max_time=max_time,
        lambda_penalty=lambda_penalty,
        stream_cb=None,
    )
    
    tracemalloc.start()
    _start_time = time.perf_counter()
    
    best = optimizer.run()
    
    exec_time_ms = (time.perf_counter() - _start_time) * 1000.0
    _, peak_bytes = tracemalloc.get_traced_memory()
    tracemalloc.stop()
    peak_mem_mb = peak_bytes / (1024 * 1024)
    
    su_pct = space_utilization(best.placements, container, best.n_bins)
    csr_pct, _ = evaluate_constraints(best.placements, items)
    
    return {
        "strategy": strategy,
        "bins_used": best.n_bins,
        "su_pct": round(su_pct, 2),
        "csr_pct": round(csr_pct, 2),
        "runtime_s": round(exec_time_ms / 1000.0, 2),
        "peak_mem_mb": round(peak_mem_mb, 2)
    }

def main():
    parser = argparse.ArgumentParser(description="Batch Benchmark for Thesis Algorithms")
    parser.add_argument("instance_path", help="Path to BR dataset JSON file")
    parser.add_argument("--max-time", type=int, default=90, help="Wall-clock time limit in seconds")
    args = parser.parse_args()

    strategies = ["DGWO", "MOGWO", "SEQ", "REP"]
    results = []

    print(json.dumps({"type": "benchmark_start"}), flush=True)

    with ProcessPoolExecutor(max_workers=4) as executor:
        futures = {executor.submit(run_strategy, s, args.instance_path, args.max_time): s for s in strategies}
        
        for future in as_completed(futures):
            try:
                res = future.result()
                results.append(res)
            except Exception as e:
                s = futures[future]
                results.append({
                    "strategy": s,
                    "error": str(e)
                })

    # Sort results to match original list order
    order = {s: i for i, s in enumerate(strategies)}
    results.sort(key=lambda x: order[x["strategy"]])

    print(json.dumps({
        "type": "benchmark_complete",
        "results": results
    }), flush=True)

if __name__ == "__main__":
    main()
