from flask import Flask, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

def collatz_sequence(n):
    """Generates the Collatz sequence using (3n + 1)/2 logic with binary and closure point."""
    sequence = [n]
    binary_sequence = [bin(n)[2:]]
    iterations = 0
    max_value = n
    shortcut_count = 0
    sum_values = 0
    largest_grow_seq = 0
    current_grow_seq = 0
    closure_point = None

    while n > 1:
        sum_values += 1 / n
        prev_n = n
        if n % 2 == 0:
            n = n // 2
            current_grow_seq = 0
        else:
            n = (3 * n + 1) // 2
            shortcut_count += 1
            if n > prev_n:
                current_grow_seq += 1
            else:
                current_grow_seq = 0
        largest_grow_seq = max(largest_grow_seq, current_grow_seq)
        sequence.append(n)
        binary_sequence.append(bin(n)[2:])
        iterations += 1
        max_value = max(max_value, n)
        # Set closure_point if not set
        if closure_point is None:
            if n == 5:
                closure_point = 5
            elif n > 0 and (n & (n - 1)) == 0:  # power of 2
                closure_point = n
            # elif n in [25, 41, 85]:
            #     closure_point = n

    if closure_point is None:
        closure_point = sequence[-1]  # For n=1, this becomes 1.
    return {
        "sequence": sequence,
        "binary_sequence": binary_sequence,
        "iterations": iterations,
        "max_value": max_value,
        "shortcut_count": shortcut_count,
        "sum_values": sum_values,
        "largest_grow_seq": largest_grow_seq,
        "closure_point": closure_point
    }

def analyze_number(n):
    result = collatz_sequence(n)
    return {
        "number": n,
        "iterations": result["iterations"],
        "max_value": result["max_value"],
        "shortcut_count": result["shortcut_count"],
        "sum_values": result["sum_values"],
        "largest_grow_seq": result["largest_grow_seq"],
        "sequence": result["sequence"],
        "binary_sequence": result["binary_sequence"],
        "closure_point": result["closure_point"]
    }

def analyze_range(start, end):
    results = []
    max_iterations = 0; max_iterations_num = 0
    max_value = 0; max_value_num = 0
    max_shortcut = 0; max_shortcut_num = 0
    max_sum_values = 0; max_sum_num = 0
    max_grow_seq = 0; max_grow_seq_num = 0

    for i in range(start, end + 1):
        res = analyze_number(i)
        results.append(res)
        if res["iterations"] > max_iterations:
            max_iterations = res["iterations"]
            max_iterations_num = i
        if res["max_value"] > max_value:
            max_value = res["max_value"]
            max_value_num = i
        if res["shortcut_count"] > max_shortcut:
            max_shortcut = res["shortcut_count"]
            max_shortcut_num = i
        if res["sum_values"] > max_sum_values:
            max_sum_values = res["sum_values"]
            max_sum_num = i
        if res["largest_grow_seq"] > max_grow_seq:
            max_grow_seq = res["largest_grow_seq"]
            max_grow_seq_num = i

    return {
        "range": [start, end],
        "max_iterations": {"number": max_iterations_num, "iterations": max_iterations},
        "max_value": {"number": max_value_num, "value": max_value},
        "max_shortcut": {"number": max_shortcut_num, "count": max_shortcut},
        "max_sum_values": {"number": max_sum_num, "sum": max_sum_values},
        "max_grow_seq": {"number": max_grow_seq_num, "value": max_grow_seq},
        "details": results
    }

@app.route("/collatz/<int:number>", methods=["GET"])
def get_collatz_number(number):
    return jsonify(analyze_number(number))

@app.route("/collatz/range/<int:start>/<int:end>", methods=["GET"])
def get_collatz_range(start, end):
    return jsonify(analyze_range(start, end))

@app.route("/collatz/sixn/<int:start>/<int:end>", methods=["GET"])
def get_sixn_analysis(start, end):
    sixn_numbers = [n for n in range(start, end + 1) if n % 6 == 1 or n % 6 == 5]
    results = []
    max_iterations = 0; max_iterations_num = 0
    max_value = 0; max_value_num = 0
    max_shortcut = 0; max_shortcut_num = 0
    max_sum_values = 0; max_sum_num = 0
    max_grow_seq = 0; max_grow_seq_num = 0
    closure_distribution = {}

    for n in sixn_numbers:
        res = analyze_number(n)
        results.append({
            "number": n,
            "type": "6n±1",
            "iterations": res["iterations"],
            "max_value": res["max_value"],
            "closure_point": res["closure_point"],
        })
        # Track distribution
        closure_distribution[res["closure_point"]] = closure_distribution.get(res["closure_point"], 0) + 1

        # Max calculations
        if res["iterations"] > max_iterations:
            max_iterations = res["iterations"]
            max_iterations_num = n
        if res["max_value"] > max_value:
            max_value = res["max_value"]
            max_value_num = n
        if res["shortcut_count"] > max_shortcut:
            max_shortcut = res["shortcut_count"]
            max_shortcut_num = n
        if res["sum_values"] > max_sum_values:
            max_sum_values = res["sum_values"]
            max_sum_num = n
        if res["largest_grow_seq"] > max_grow_seq:
            max_grow_seq = res["largest_grow_seq"]
            max_grow_seq_num = n

    avg_iterations = round(sum(d["iterations"] for d in results) / len(results), 2) if results else 0

    return jsonify({
        "range": [start, end],
        "numbers": results,
        "stats": {
            "total_numbers": len(results),
            "avg_iterations": avg_iterations,
            "max_iterations": max_iterations,
            "max_iterations_number": max_iterations_num,
            "max_value": max_value,
            "max_value_number": max_value_num,
            "max_shortcut": max_shortcut,
            "max_shortcut_number": max_shortcut_num,
            "max_sum": max_sum_values,
            "max_sum_number": max_sum_num,
            "max_grow_seq": max_grow_seq,
            "max_grow_seq_number": max_grow_seq_num,
            "closure_distribution": closure_distribution
        }
    })

# NEW ENDPOINT for visualization data
@app.route("/collatz/visualization/<int:start>/<int:end>", methods=["GET"])
def get_visualization_data(start, end):
    """
    Endpoint specifically for the 3D visualization component.
    Returns formatted data with the structure needed by the visualization.
    """
    print(f"Visualization requested for range: {start} to {end}")
    range_data = analyze_range(start, end)
    details = range_data["details"]
    
    # Filter for odd numbers
    odd_numbers = [detail for detail in details if detail["number"] % 2 == 1]
    print(f"Found {len(odd_numbers)} odd numbers in range")
    
    visualization_data = []
    
    for data in odd_numbers:
        number = data["number"]
        sequence = data["sequence"]
        
        # Find index where sequence becomes even
        odd_chain = []
        index = 0
        while index < len(sequence) and sequence[index] % 2 == 1:
            odd_chain.append(sequence[index])
            index += 1
        
        # If we found an even number
        if index < len(sequence):
            final_even = sequence[index]
            
            # Count how many divisions by 2 can be performed
            div_count = 0
            temp = final_even
            
            while temp % 2 == 0 and temp > 0:
                temp = temp // 2
                div_count += 1
            
            visualization_data.append({
                "n": number,
                "multiplyChain": odd_chain,
                "finalEven": final_even,
                "divCount": div_count,
                "timesStayedOdd": len(odd_chain) - 1  # Excluding the starting number
            })
    
    print(f"Returning {len(visualization_data)} visualization data items")
    
    result = {
        "range": [start, end],
        "visualizationData": visualization_data
    }
    
    return jsonify(result)

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8000, debug=True)