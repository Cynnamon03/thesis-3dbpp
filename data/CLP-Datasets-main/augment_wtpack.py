import os
import json
import numpy as np

RAW_DIR = '../raw'
OUT_DIR = 'wtpack'

def load_wtpack(filepath):
    with open(filepath, 'r') as f:
        lines = [line.strip() for line in f.readlines() if line.strip()]
    
    instances = []
    idx = 0
    instance_num = 1
    
    while idx < len(lines):
        container_parts = lines[idx].split()
        if len(container_parts) != 3:
            print(f"Warning: unexpected container line {lines[idx]}")
            break
        L_c, H_c, D_c = map(float, container_parts)
        idx += 1
        
        meta_parts = lines[idx].split()
        num_types = int(meta_parts[0])
        idx += 1
        
        items = []
        for _ in range(num_types):
            parts = lines[idx].split()
            l_i = float(parts[0])
            c1 = int(parts[1])
            d_i = float(parts[2])
            c2 = int(parts[3])
            h_i = float(parts[4])
            c3 = int(parts[5])
            demand = int(parts[6])
            weight = float(parts[7])
            
            lbs_candidates = [float(p) for p in parts[8:]]
            lbs_i = max(lbs_candidates) if lbs_candidates else 0.0
            
            items.append({
                'Length': l_i,
                'C1_Length': c1,
                'Depth': d_i,
                'C1_Depth': c2,
                'Height': h_i,
                'C1_Height': c3,
                'Demand': demand,
                'DemandMax': None,
                'Weight': weight,
                'LBS': lbs_i
            })
            idx += 1
        
        expanded_lbs = []
        for item in items:
            expanded_lbs.extend([item['LBS']] * item['Demand'])
            
        q1 = np.percentile(expanded_lbs, 25)
        
        fragile_count = sum(1 for v in expanded_lbs if v <= q1)
        frag_rate = fragile_count / len(expanded_lbs) if expanded_lbs else 0
        
        min_lbs = min(expanded_lbs) if expanded_lbs else 0
        max_lbs = max(expanded_lbs) if expanded_lbs else 0
        
        if min_lbs == 0:
            instance_num += 1
            continue
            
        if max_lbs / min_lbs <= 2.0:
            instance_num += 1
            continue
        
        for item in items:
            item['Type'] = 'Fragile' if item['LBS'] <= q1 else 'Standard'
            item['fragile'] = 1 if item['LBS'] <= q1 else 0

        individual_items = []
        box_id_counter = 1
        for item in items:
            for _ in range(item['Demand']):
                new_item = item.copy()
                new_item['Demand'] = 1
                new_item['id'] = f"BOX-{str(box_id_counter).zfill(3)}"
                individual_items.append(new_item)
                box_id_counter += 1
        
        if not (30 <= len(individual_items) <= 100):
            instance_num += 1
            continue
            
        seed = instance_num * 1000
        rng = np.random.default_rng(seed)
        
        while True:
            stops = rng.integers(1, 4, size=len(individual_items))
            counts = [np.sum(stops == s) for s in [1, 2, 3]]
            props = [c / len(individual_items) for c in counts]
            if all(abs(p - 1/3) <= 0.10 for p in props):
                break
            seed += 1
            rng = np.random.default_rng(seed)
            
        for i, item in enumerate(individual_items):
            item['Stop'] = int(stops[i])
            item['stop'] = int(stops[i])
            
        json_data = {
            "Name": str(instance_num),
            "Seed": seed,
            "Objects": [{
                "Length": L_c,
                "Height": H_c,
                "Depth": D_c,
                "Stock": None,
                "Cost": L_c * H_c * D_c
            }],
            "Items": individual_items
        }
        
        instances.append((instance_num, json_data))
        instance_num += 1
        
    return instances

def main():
    if not os.path.exists(OUT_DIR):
        os.makedirs(OUT_DIR)
        
    total_valid = 0
    for i in range(1, 8):
        filename = f"wtpack{i}.txt"
        filepath = os.path.join(RAW_DIR, filename)
        if not os.path.exists(filepath):
            continue
            
        out_folder = os.path.join(OUT_DIR, f"BR{i}")
        if not os.path.exists(out_folder):
            os.makedirs(out_folder)
            
        print(f"Processing {filename}...")
        instances = load_wtpack(filepath)
        
        for inst_num, data in instances:
            out_file = os.path.join(out_folder, f"{inst_num}.json")
            with open(out_file, 'w') as f:
                json.dump(data, f)
            total_valid += 1
            
    print(f"Total valid augmented instances generated: {total_valid}")

if __name__ == "__main__":
    main()
