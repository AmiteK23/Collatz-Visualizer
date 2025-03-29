// Scripts content
export const scriptContent = {
  "binary-analysis": String.raw`import time
import matplotlib.pyplot as plt
from collections import Counter


def collatz_odd_step(n):
    """
    The 'odd step' T(n) = (3n + 1)//2, valid only if n is odd.
    Returns the next integer (not necessarily odd).
    """
    return (3 * n + 1) // 2


def build_R_values(max_k=100):
    """
    Precompute R_k for k up to 'max_k' using the recurrence:
       R_1 = 1
       R_{k} = 3 * R_{k-1} + 2^(k-1).
    """
    R = [0] * (max_k + 1)
    R[1] = 1
    for k in range(2, max_k + 1):
        R[k] = 3 * R[k - 1] + (1 << (k - 1))  # 2^(k-1) = 1 << (k-1)
    return R


def ensure_R_capacity(R, k):
    """
    Extend the list R so that it has at least length (k+1),
    following the same recurrence definition.
    """
    current_max = len(R) - 1
    if k > current_max:
        R.extend([0] * (k - current_max))
        for i in range(current_max + 1, k + 1):
            R[i] = 3 * R[i - 1] + (1 << (i - 1))


def trailing_zeros_of_i(i):
    """
    Count the number of trailing zeros in i (where i is a positive integer).
    There are several ways to do this in Python.
    Here we can do it using a built-in method in Python 3.10+:
        return (i & -i).bit_length() - 1
    or directly with int.bit_count/bit_length if you prefer.
    """
    # If you're on Python 3.10 or later, you can do:
    # return (i & -i).bit_length() - 1
    #
    # Alternatively, for Python 3.10+ there's also int.bit_count() and int.bit_length().
    # We'll use the (i & -i) trick for clarity:
    return (i & -i).bit_length() - 1


def test_multi_step_collatz_no_iteration(limit=1000000):
    """
    For each odd n up to 'limit', determine k via the binary method (no iteration).
    Then confirm that the multi-step formula is consistent.
    We store the frequency of each k in k_counter.
    """
    start_time = time.time()

    # Build an initial R array big enough for smaller k, then expand if needed.
    R = build_R_values(max_k=100)

    mismatches_list = []
    k_counter = Counter()

    for n in range(1, limit + 1, 2):
        # 1) Convert n -> i = (n+1)//2
        i = (n + 1) >> 1

        # 2) Count trailing zeros in i:
        j = trailing_zeros_of_i(i)
        k = j + 1

        k_counter[k] += 1

        # 3) Expand R if we haven't yet computed R_k:
        if k > len(R) - 1:
            ensure_R_capacity(R, k)

        # 4) First even number after k odd steps:
        #    formula_even = (3^k * n + R[k]) >> k
        formula_even = (pow(3, k) * n + R[k]) >> k

        # OPTIONAL: For small k, we can do a direct check by applying k odd-steps:
        # (We do it only if k <= 10 for speed.)
        if k <= 10:
            temp = n
            for _ in range(k):
                temp = collatz_odd_step(temp)
            if temp != formula_even:
                mismatches_list.append((n, k, temp, formula_even))

        # Show progress occasionally
        if limit >= 5 and (n % (limit // 5) == 1):
            print(f"Progress: checked up to n={n}")

    elapsed = time.time() - start_time

    print(f"\n[RESULTS] In total, found {len(mismatches_list)} mismatches. (Should be 0.)")
    if mismatches_list:
        for entry in mismatches_list[:10]:
            print(f"  Mismatch at n={entry[0]}: k={entry[1]}, stepwise={entry[2]}, formula={entry[3]}")

    print(f"Completed in {elapsed:.2f} seconds for limit={limit:,}.")
    return k_counter, limit


def visualize_k_distribution(k_counter, limit):
    """
    Visualize the frequency of consecutive odd-step lengths (k).
    """
    ks, freqs = zip(*sorted(k_counter.items()))
    plt.figure(figsize=(10, 6))
    plt.bar(ks, freqs)
    plt.xlabel("Consecutive Odd Steps (k)")
    plt.ylabel("Frequency")
    plt.title(f"Distribution of Consecutive Odd Steps in Collatz up to {limit:,}")
    plt.grid(True)
    plt.show()


if __name__ == "__main__":
    user_input = input("Enter the range limit (e.g., 1000000): ")
    limit = int(user_input) if user_input else 1000000

    k_counter, limit = test_multi_step_collatz_no_iteration(limit=limit)
    visualize_k_distribution(k_counter, limit)
`,

  "ratio-analysis": String.raw`import time
import matplotlib.pyplot as plt
import numpy as np
from collections import Counter, defaultdict


def collatz_next(n):
    """Standard Collatz function for any integer n."""
    if n % 2 == 0:
        return n // 2
    else:
        return (3 * n + 1)


def collatz_odd_step(n):
    """The 'odd step' T(n) = (3n + 1)//2, valid only if n is odd."""
    return (3 * n + 1) // 2


def trailing_zeros_of_i(i):
    """Count the number of trailing zeros in i."""
    return (i & -i).bit_length() - 1


def analyze_collatz_ratio(limit=1000, full_trajectory=True, use_shortcut=False):
    """
    Analyze the ratio of odd to even steps in Collatz sequences.
    
    Parameters:
    - limit: The upper bound for starting numbers to analyze
    - full_trajectory: If True, follow each number to 1. If False, stop at a previously seen number.
    - use_shortcut: If True, use the (3n+1)/2 shortcut for odd numbers
    
    Returns:
    - A dictionary with analysis results
    """
    start_time = time.time()
    
    # Track various statistics
    total_even_steps = 0
    total_odd_steps = 0
    
    # Store ratios for each starting number
    ratios = {}
    
    # Track statistics about consecutive steps
    consecutive_odd_stats = Counter()
    consecutive_even_stats = Counter()
    
    # Track the maximum ratio observed
    max_ratio = 0
    max_ratio_n = 0
    
    # Track trajectory lengths
    trajectory_lengths = {}
    
    # For optimized processing, track known stopping times
    known_stopping_times = {1: 0}
    
    # Track all sequence pairs (n, next) for analysis
    sequence_pairs = []
    
    # Process each number up to the limit
    for start_n in range(1, limit + 1):
        if start_n % 10000 == 0:
            print(f"Processing {start_n} of {limit}...")
        
        # Skip even numbers (optional optimization)
        if start_n % 2 == 0:
            continue
            
        n = start_n
        path = [n]
        even_steps = 0
        odd_steps = 0
        
        # Track consecutive steps
        current_consecutive_odd = 0
        current_consecutive_even = 0
        
        # Process until reaching 1 or a cycle is detected
        seen = set([n])
        
        while n != 1:
            # Calculate the next number in the sequence
            if n % 2 == 0:  # Even
                next_n = n // 2
                even_steps += 1
                total_even_steps += 1
                
                # Update consecutive even count
                current_consecutive_even += 1
                if current_consecutive_odd > 0:
                    consecutive_odd_stats[current_consecutive_odd] += 1
                    current_consecutive_odd = 0
            else:  # Odd
                if use_shortcut:
                    # Use the (3n+1)/2 shortcut for odd numbers
                    next_n = collatz_odd_step(n)
                else:
                    # Use the standard 3n+1 step
                    next_n = 3 * n + 1
                
                odd_steps += 1
                total_odd_steps += 1
                
                # Update consecutive odd count
                current_consecutive_odd += 1
                if current_consecutive_even > 0:
                    consecutive_even_stats[current_consecutive_even] += 1
                    current_consecutive_even = 0
            
            # Store the pair for pattern analysis
            sequence_pairs.append((n, next_n))
            
            # Move to next number
            n = next_n
            path.append(n)
            
            # Check for previously seen numbers
            if not full_trajectory and n in seen:
                break
                
            seen.add(n)
            
            # Optimization: If we've already computed this number's stopping time, use it
            if n in known_stopping_times:
                remaining_steps = known_stopping_times[n]
                # We'd need to analyze the remaining steps for odd/even distribution
                # For simplicity, we'll just break here and use what we've counted so far
                break
        
        # Clean up any remaining consecutive counts
        if current_consecutive_odd > 0:
            consecutive_odd_stats[current_consecutive_odd] += 1
        if current_consecutive_even > 0:
            consecutive_even_stats[current_consecutive_even] += 1
            
        # Calculate and store the ratio
        total_steps = odd_steps + even_steps
        ratio = odd_steps / total_steps if total_steps > 0 else 0
        ratios[start_n] = ratio
        
        # Update max ratio if needed
        if ratio > max_ratio:
            max_ratio = ratio
            max_ratio_n = start_n
            
        # Store trajectory length
        trajectory_lengths[start_n] = total_steps
        
        # Store the stopping time for future optimizations
        known_stopping_times[start_n] = total_steps
            
    elapsed = time.time() - start_time
    
    # Create detailed statistics
    avg_ratio = sum(ratios.values()) / len(ratios) if ratios else 0
    median_ratio = np.median(list(ratios.values())) if ratios else 0
    
    # Prepare results
    results = {
        "ratios": ratios,
        "total_odd_steps": total_odd_steps,
        "total_even_steps": total_even_steps,
        "overall_ratio": total_odd_steps / (total_odd_steps + total_even_steps) if (total_odd_steps + total_even_steps) > 0 else 0,
        "max_ratio": max_ratio,
        "max_ratio_n": max_ratio_n,
        "avg_ratio": avg_ratio,
        "median_ratio": median_ratio,
        "consecutive_odd_stats": consecutive_odd_stats,
        "consecutive_even_stats": consecutive_even_stats,
        "trajectory_lengths": trajectory_lengths,
        "elapsed_time": elapsed,
        "sequence_pairs": sequence_pairs,
        "used_shortcut": use_shortcut
    }
    
    return results


def analyze_step_patterns(limit=1000):
    """
    Analyze patterns in consecutive odd steps using the binary method.
    This is an optimized approach that doesn't compute the full trajectories.
    """
    start_time = time.time()
    
    # Track statistics
    k_counter = Counter()  # count of consecutive odd steps
    odd_even_ratios = {}   # ratio of odd to even steps by starting number
    
    # For each odd number up to the limit
    for n in range(1, limit + 1, 2):
        # Calculate k (consecutive odd steps) using the binary method
        i = (n + 1) >> 1
        j = trailing_zeros_of_i(i)
        k = j + 1
        
        # Increment counter for this k
        k_counter[k] += 1
        
        # Track the first number with this many consecutive odd steps
        if n % 10000 == 1:
            print(f"Processing up to n={n}, max k so far: {max(k_counter.keys())}")
    
    # Analyze the distribution of k values
    total_ks = sum(k_counter.values())
    k_distribution = {k: count/total_ks for k, count in k_counter.items()}
    
    # Calculate expected ratio based on k distribution
    # For each k consecutive odd steps, we expect roughly 1 even step
    # So the ratio would be k/(k+1) on average
    expected_ratios = {k: k/(k+1) for k in k_counter.keys()}
    
    elapsed = time.time() - start_time
    
    return {
        "k_counter": k_counter,
        "k_distribution": k_distribution,
        "expected_ratios": expected_ratios,
        "elapsed_time": elapsed
    }


def visualize_ratios(results):
    """Visualize the odd/even ratios analysis."""
    ratios = results["ratios"]
    
    plt.figure(figsize=(12, 8))
    
    # Plot 1: Ratio distribution
    plt.subplot(2, 2, 1)
    plt.hist(list(ratios.values()), bins=30)
    plt.xlabel("Odd/Total Steps Ratio")
    plt.ylabel("Frequency")
    title = "Distribution of Odd/Total Ratios"
    if results.get("used_shortcut", False):
        title += " (with (3n+1)/2 shortcut)"
    plt.title(title)
    plt.axvline(results["median_ratio"], color='r', linestyle='--', label=f"Median: {results['median_ratio']:.3f}")
    plt.axvline(results["avg_ratio"], color='g', linestyle='--', label=f"Average: {results['avg_ratio']:.3f}")
    plt.axvline(0.5, color='black', linestyle='--', label="0.5 Reference")
    plt.legend()
    
    # Plot 2: Ratios by starting number
    plt.subplot(2, 2, 2)
    plt.scatter(list(ratios.keys()), list(ratios.values()), s=3, alpha=0.5)
    plt.xlabel("Starting Number")
    plt.ylabel("Odd/Total Steps Ratio")
    title = "Ratio by Starting Number"
    if results.get("used_shortcut", False):
        title += " (with (3n+1)/2 shortcut)"
    plt.title(title)
    plt.axhline(results["median_ratio"], color='r', linestyle='--')
    
    # Plot 3: Consecutive odd steps distribution
    plt.subplot(2, 2, 3)
    k_values = list(results["consecutive_odd_stats"].keys())
    k_counts = list(results["consecutive_odd_stats"].values())
    plt.bar(k_values, k_counts)
    plt.xlabel("Consecutive Odd Steps")
    plt.ylabel("Frequency")
    title = "Distribution of Consecutive Odd Steps"
    if results.get("used_shortcut", False):
        title += " (with (3n+1)/2 shortcut)"
    plt.title(title)
    
    # Plot 4: Ratio vs trajectory length
    plt.subplot(2, 2, 4)
    traj_lengths = list(results["trajectory_lengths"].values())
    ratio_values = list(ratios.values())
    plt.scatter(traj_lengths, ratio_values, s=3, alpha=0.5)
    plt.xlabel("Trajectory Length")
    plt.ylabel("Odd/Total Steps Ratio")
    title = "Ratio vs Trajectory Length"
    if results.get("used_shortcut", False):
        title += " (with (3n+1)/2 shortcut)"
    plt.title(title)
    
    plt.tight_layout()
    plt.show()


def visualize_binary_patterns(results):
    """Visualize the binary pattern analysis."""
    k_counter = results["k_counter"]
    k_distribution = results["k_distribution"]
    
    plt.figure(figsize=(12, 8))
    
    # Plot 1: k distribution
    plt.subplot(2, 1, 1)
    ks, counts = zip(*sorted(k_counter.items()))
    plt.bar(ks, counts)
    plt.xlabel("Consecutive Odd Steps (k)")
    plt.ylabel("Frequency")
    plt.title("Distribution of Consecutive Odd Steps")
    plt.grid(True)
    
    # Plot 2: Cumulative distribution
    plt.subplot(2, 1, 2)
    ks, probs = zip(*sorted(k_distribution.items()))
    cum_probs = np.cumsum(probs)
    plt.plot(ks, cum_probs, marker='o')
    plt.xlabel("Consecutive Odd Steps (k)")
    plt.ylabel("Cumulative Probability")
    plt.title("Cumulative Distribution of k")
    plt.grid(True)
    
    # Calculate and display expected overall ratio
    expected_ratio = sum(k * prob for k, prob in k_distribution.items()) / (
        sum((k + 1) * prob for k, p in k_distribution.items()))
    plt.suptitle(f"Binary Pattern Analysis (Expected Overall Odd/Total Ratio: {expected_ratio:.4f})")
    
    plt.tight_layout()
    plt.show()


def run_ratio_experiment():
    """Run a comprehensive ratio analysis experiment."""
    # Ask user for limit
    limit_str = input("Enter the maximum starting number to analyze (default: 10000): ")
    limit = int(limit_str) if limit_str else 10000
    
    # Ask user for analysis type
    analysis_type = input("Choose analysis type (1 for full trajectories, 2 for binary pattern, 3 for both): ")
    
    # Ask user whether to use the shortcut
    use_shortcut_input = input("Use (3n+1)/2 shortcut for odd numbers? (y/n, default: n): ")
    use_shortcut = use_shortcut_input.lower() == 'y'
    
    if analysis_type == "1" or analysis_type == "3":
        method_str = "with (3n+1)/2 shortcut" if use_shortcut else "with standard method"
        print(f"\nAnalyzing full trajectories up to {limit} {method_str}...")
        results = analyze_collatz_ratio(limit, use_shortcut=use_shortcut)
        
        print("\n----- RESULTS -----")
        print(f"Method: {'Using (3n+1)/2 shortcut' if use_shortcut else 'Standard 3n+1'}")
        print(f"Overall odd/total ratio: {results['overall_ratio']:.6f}")
        print(f"Average odd/total ratio: {results['avg_ratio']:.6f}")
        print(f"Median odd/total ratio: {results['median_ratio']:.6f}")
        print(f"Maximum odd/total ratio: {results['max_ratio']:.6f} (for n={results['max_ratio_n']})")
        print(f"Total odd steps: {results['total_odd_steps']}")
        print(f"Total even steps: {results['total_even_steps']}")
        print(f"Analysis completed in {results['elapsed_time']:.2f} seconds.")
        
        print("\nTop 5 longest consecutive odd step sequences:")
        for k, count in sorted(results['consecutive_odd_stats'].items(), reverse=True)[:5]:
            print(f"{k} consecutive odd steps: {count} occurrences")
            
        visualize_ratios(results)
    
    if analysis_type == "2" or analysis_type == "3":
        print(f"\nAnalyzing binary patterns up to {limit}...")
        binary_results = analyze_step_patterns(limit)
        
        print("\n----- BINARY PATTERN RESULTS -----")
        print(f"Analysis completed in {binary_results['elapsed_time']:.2f} seconds.")
        print("\nTop 5 most common consecutive odd step lengths:")
        for k, count in binary_results['k_counter'].most_common(5):
            print(f"{k} consecutive odd steps: {count} occurrences ({binary_results['k_distribution'][k]*100:.2f}%)")
        
        # Calculate expected overall ratio based on k distribution
        expected_ratio = sum(k * p for k, p in binary_results['k_distribution'].items()) / (
            sum((k + 1) * p for k, p in binary_results['k_distribution'].items()))
        print(f"\nExpected overall odd/total ratio from binary pattern: {expected_ratio:.6f}")
        
        visualize_binary_patterns(binary_results)


def compare_specific_numbers(numbers_to_test):
    """
    Compare the trajectory and ratios of specific numbers using both standard and shortcut methods.
    
    Parameters:
    - numbers_to_test: List of integers to analyze
    """
    results_standard = {}
    results_shortcut = {}
    
    print("Comparing standard vs. shortcut method for specific numbers:")
    print("=" * 80)
    print("{:<12} {:<15} {:<15} {:<15} {:<15}".format(
        "Number", "Standard Ratio", "Shortcut Ratio", "Standard Steps", "Shortcut Steps"))
    print("-" * 80)
    
    for n in numbers_to_test:
        # Standard method
        start_n = n
        standard_odd = 0
        standard_even = 0
        while n != 1:
            if n % 2 == 0:
                n = n // 2
                standard_even += 1
            else:
                n = 3 * n + 1
                standard_odd += 1
        standard_total = standard_odd + standard_even
        standard_ratio = standard_odd / standard_total if standard_total > 0 else 0
        
        # Shortcut method
        n = start_n
        shortcut_odd = 0
        shortcut_even = 0
        while n != 1:
            if n % 2 == 0:
                n = n // 2
                shortcut_even += 1
            else:
                n = (3 * n + 1) // 2  # Shortcut step
                shortcut_odd += 1
        shortcut_total = shortcut_odd + shortcut_even
        shortcut_ratio = shortcut_odd / shortcut_total if shortcut_total > 0 else 0
        
        # Store results
        results_standard[start_n] = {
            "ratio": standard_ratio,
            "odd_steps": standard_odd,
            "even_steps": standard_even,
            "total_steps": standard_total
        }
        
        results_shortcut[start_n] = {
            "ratio": shortcut_ratio,
            "odd_steps": shortcut_odd,
            "even_steps": shortcut_even,
            "total_steps": shortcut_total
        }
        
        # Print comparison
        print("{:<12} {:<15.6f} {:<15.6f} {:<15} {:<15}".format(
            start_n, standard_ratio, shortcut_ratio, standard_total, shortcut_total))
    
    print("=" * 80)
    return results_standard, results_shortcut


if __name__ == "__main__":
    # Choose which experiment to run
    experiment_type = input("Choose experiment (1 for ratio analysis, 2 for comparison of specific numbers): ")
    
    if experiment_type == "1":
        run_ratio_experiment()
    elif experiment_type == "2":
        # Ask for numbers to compare
        nums_input = input("Enter numbers to compare (comma-separated): ")
        nums_to_test = [int(n.strip()) for n in nums_input.split(",")]
        compare_specific_numbers(nums_to_test)
    else:
        print("Invalid choice. Exiting.")`,
};

export type ScriptKey = keyof typeof scriptContent;
