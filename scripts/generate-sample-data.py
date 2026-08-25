#!/usr/bin/env python3
"""
Generate a synthetic but internally consistent public/data.json.

Everything here is invented. The point is a dataset with the same *shape* and
the same internal arithmetic as a real export, so the dashboard renders
correctly and you can see what your own data needs to look like.

Consistency guarantees (asserted at the end):
  - monthly totals sum to yearly totals
  - subcategories sum to their parent category
  - transactions sum to the monthly figures they belong to
  - sankey income - expenses == net_savings

    python3 scripts/generate-sample-data.py
"""
import json, random, datetime as dt, collections, os

random.seed(20260825)  # deterministic — regenerating gives the same file

YEARS = [2023, 2024, 2025, 2026]
LAST_MONTH = {2023: 12, 2024: 12, 2025: 12, 2026: 4}

CATS = {
    "Household":          (["Rent/Mortgage", "Home Improvement", "Furnishings", "Home Supplies"], 2150, "#7ecfb2"),
    "Food & Drink":       (["Groceries", "Restaurants", "Coffee Shops", "Fast Food"],             1180, "#f0c96e"),
    "Bills & Utilities":  (["Electricity", "Internet", "Water", "Mobile Phone", "Subscriptions"],  430, "#c8a0f0"),
    "Car & Transport":    (["Auto Insurance", "Gas", "Auto Service", "Transit"],                   390, "#70c8d0"),
    "Health & Fitness":   (["Insurance Premium", "Doctor", "Pharmacy", "Gym"],                     520, "#f07878"),
    "Shopping":           (["Clothing", "Household Goods", "Personal Care", "Electronics"],        460, "#6eb8f0"),
    "Travel":             (["Flights", "Lodging", "Travel Food"],                                  300, "#b0a0f0"),
    "Gifts & Giving":     (["Donations", "Gifts"],                                                 240, "#f0c0d0"),
    "Pets":               (["Pet Food", "Veterinarian"],                                            85, "#a8d870"),
    "Uncategorized":      (["Other", "Cash/ATM"],                                                   110, "#909090"),
}

MERCHANTS = {
    "Household":         ["Northgate Mortgage", "Warrick Hardware", "Delding Home", "Ostrey Supply"],
    "Food & Drink":      ["Marketvale Grocery", "Corner & Vine", "Halden Coffee", "Pressbox Deli"],
    "Bills & Utilities": ["Cardinal Power", "Rivernet Broadband", "City Water Dept", "Talkline Mobile"],
    "Car & Transport":   ["Sable Mutual Auto", "Fuelstop 12", "Ridgeway Motors", "Metro Transit"],
    "Health & Fitness":  ["Bay State Health Plan", "Ashfield Clinic", "Corner Pharmacy", "Ironworks Gym"],
    "Shopping":          ["Kesner & Co", "Homeline", "Verity Goods", "Circuit Row"],
    "Travel":            ["Continental Air", "Harborview Inn", "Wayfarer Rentals"],
    "Gifts & Giving":    ["Ashfield Food Bank", "Paper Lantern Gifts"],
    "Pets":              ["Barkwell Pet Supply", "Ashfield Veterinary"],
    "Uncategorized":     ["Misc Purchase", "ATM Withdrawal"],
}

GROWTH = {2023: 1.00, 2024: 1.06, 2025: 1.11, 2026: 1.14}

transactions, monthly_subcat = [], collections.defaultdict(lambda: collections.defaultdict(dict))
tx_id = 0
for y in YEARS:
    for mo in range(1, LAST_MONTH[y] + 1):
        key = f"{y}-{mo:02d}"
        for cat, (subs, base, _c) in CATS.items():
            seasonal = 1.25 if (cat == "Travel" and mo in (6, 7, 12)) else 1.0
            seasonal = 1.30 if (cat == "Gifts & Giving" and mo == 12) else seasonal
            target = base * GROWTH[y] * seasonal * random.uniform(0.86, 1.14)
            weights = [random.uniform(0.7, 1.3) for _ in subs]
            tot_w = sum(weights)
            for sub, w in zip(subs, weights):
                amt = round(target * w / tot_w, 2)
                monthly_subcat[key][cat][sub] = amt
                n = max(1, int(amt // 220))
                remaining = amt
                for i in range(n):
                    part = round(remaining if i == n - 1 else remaining * random.uniform(0.3, 0.6), 2)
                    remaining = round(remaining - part, 2)
                    if part <= 0:
                        continue
                    tx_id += 1
                    day = random.randint(1, 28)
                    transactions.append({
                        "date": f"{mo:02d}/{day:02d}/{y}", "year": y, "month": mo,
                        "name": random.choice(MERCHANTS[cat]), "amount": part,
                        "category": sub, "parent": cat,
                        "recurring": 1 if sub in ("Rent/Mortgage", "Internet", "Insurance Premium", "Auto Insurance") else 0,
                    })

monthly_by_cat = {k: {c: round(sum(s.values()), 2) for c, s in v.items()} for k, v in monthly_subcat.items()}
monthly_total  = {k: round(sum(v.values()), 2) for k, v in monthly_by_cat.items()}

by_year_cat = collections.defaultdict(lambda: collections.defaultdict(float))
subcat_by_year = collections.defaultdict(lambda: collections.defaultdict(dict))
for k, cats in monthly_subcat.items():
    y = k[:4]
    for c, subs in cats.items():
        for s, a in subs.items():
            by_year_cat[y][c] += a
            subcat_by_year[y][c][s] = round(subcat_by_year[y][c].get(s, 0) + a, 2)
by_year_cat = {y: {c: round(v, 2) for c, v in cs.items()} for y, cs in by_year_cat.items()}
by_year_total = {y: round(sum(cs.values()), 2) for y, cs in by_year_cat.items()}

subcat_all = collections.defaultdict(lambda: collections.defaultdict(float))
for y, cs in subcat_by_year.items():
    for c, subs in cs.items():
        for s, a in subs.items():
            subcat_all[c][s] += a
subcat_all = {c: dict(sorted(((s, round(a, 2)) for s, a in subs.items()), key=lambda x: -x[1]))
              for c, subs in subcat_all.items()}

cat_colors = {c: v[2] for c, v in CATS.items()}
def shade(hexc, i, n):
    r, g, b = int(hexc[1:3], 16), int(hexc[3:5], 16), int(hexc[5:7], 16)
    a = 0.35 + (0.55 * (i / max(1, n - 1)))
    return f"rgba({r},{g},{b},{a:.2f})"
shade_map = {c: {s: shade(CATS[c][2], i, len(subs))
                 for i, s in enumerate(subs)} for c, (subs, _b, _col) in
             ((c, CATS[c]) for c in CATS) for subs in [list(subcat_all[c].keys())]}

INCOME = {2023: {"Salary — Primary": 74000, "Salary — Partner": 21000, "Interest": 640},
          2024: {"Salary — Primary": 79000, "Salary — Partner": 23500, "Interest": 810, "Tax Refund": 2100},
          2025: {"Salary — Primary": 86000, "Salary — Partner": 25000, "Interest": 1150, "Tax Refund": 1750},
          2026: {"Salary — Primary": 31000, "Salary — Partner": 9000,  "Interest": 420}}
sankey = {}
for y in YEARS:
    ys = str(y)
    ti = round(sum(INCOME[y].values()), 2)
    te = by_year_total[ys]
    sankey[ys] = {"income_sources": INCOME[y], "total_income": ti, "total_expenses": te,
                  "net_savings": round(ti - te, 2),
                  "expense_categories": by_year_cat[ys],
                  "expense_subcategories": subcat_by_year[ys]}

top_merchants = {}
for y in YEARS:
    agg = collections.Counter()
    for t in transactions:
        if t["year"] == y:
            agg[t["name"]] += t["amount"]
    top_merchants[str(y)] = {m: round(v, 2) for m, v in agg.most_common(25)}

you_2025 = sankey["2025"]["total_income"]
you_2026_ann = round(sankey["2026"]["total_income"] * 12 / LAST_MONTH[2026], 2)
taxes_2025 = round(you_2025 * 0.19, 2)
benchmarks = {
    "income": {
        "us_median_all": 80610, "us_median_married_couple": 119440,
        "us_median_bachelors_plus": 128300,
        "you_2025": you_2025,
        "you_2026_annualized": you_2026_ann,
        "taxes_2025": taxes_2025,
        # Drives the horizontal benchmark bar chart. Order and length are free —
        # the chart maps over this array, so add or remove rows as you like.
        "comparison": [
            {"label": "US national median",            "value": 80610},
            {"label": "State median",                  "value": 64200},
            {"label": "Married couple, 2 kids",        "value": 119440},
            {"label": "Bachelor+ households",          "value": 128300},
            {"label": "Master's, ages 30-34",          "value": 86500},
            {"label": "You \u2014 2025 gross",             "value": you_2025},
        ],
    },
    "spending_annual": {"bls_avg_total": 77280, "bls_top_quintile_total": 148900,
                        "you_2025": by_year_total["2025"],
                        "categories": {c: {"you": round(by_year_cat["2025"][c], 2),
                                           "bls_avg": round(by_year_cat["2025"][c] * random.uniform(0.75, 1.3), 2)}
                                       for c in CATS}},
    "savings_wealth": {"retirement_you": 96500, "retirement_median_35_44": 45000,
                       "retirement_avg_35_44": 141520, "liquid_savings_you": 41200,
                       "liquid_savings_median_all": 8000, "net_worth_median_35_44": 135300,
                       "home_value_you": 312000, "mortgage_you": 244000, "home_equity_you": 68000},
    # `you` is net (income - expenses); `peer_est` is the comparison line.
    "net_income_by_year": {
        str(y): {"income": sankey[str(y)]["total_income"],
                 "expenses": sankey[str(y)]["total_expenses"],
                 "you": sankey[str(y)]["net_savings"],
                 "peer_est": round(sankey[str(y)]["total_income"] * 0.06, 2)}
        for y in YEARS},
    "childcare": {"national_avg_per_child": 13128, "national_avg_2_children": 26256,
                  "nanny_annual": 45240,
                  "your_actual": round(by_year_cat["2025"].get("Household", 0) * 0.06, 2),
                  "your_savings_vs_avg": 21100.0, "your_savings_vs_nanny": 40080.0,
                  "foregone_salary": 68000},
    "spending_pct_income": {"categories": {c: round(by_year_cat["2025"][c] / you_2025 * 100, 1) for c in CATS}},
}

data = {"cat_colors": cat_colors, "shade_map": shade_map,
        "monthly_total": monthly_total, "monthly_by_cat": monthly_by_cat,
        "monthly_subcat": {k: dict(v) for k, v in monthly_subcat.items()},
        "by_year_cat": by_year_cat, "by_year_total": by_year_total,
        "subcat_all": subcat_all,
        "subcat_by_year": {y: dict(v) for y, v in subcat_by_year.items()},
        "transactions": transactions, "sankey": sankey,
        "top_merchants": top_merchants, "benchmarks": benchmarks}

# ── consistency checks ──────────────────────────────────────────────
for y in YEARS:
    ys = str(y)
    m = round(sum(v for k, v in monthly_total.items() if k.startswith(ys)), 2)
    assert abs(m - by_year_total[ys]) < 1.0, f"{ys}: monthly {m} != yearly {by_year_total[ys]}"
    assert abs(sankey[ys]["total_income"] - sankey[ys]["total_expenses"] - sankey[ys]["net_savings"]) < 0.01
for k, cats in monthly_subcat.items():
    for c, subs in cats.items():
        assert abs(sum(subs.values()) - monthly_by_cat[k][c]) < 0.01, f"{k}/{c} subcats != cat"
tx_by_year = collections.Counter()
for t in transactions:
    tx_by_year[str(t["year"])] += t["amount"]
for ys, v in tx_by_year.items():
    assert abs(v - by_year_total[ys]) < 5.0, f"{ys}: transactions {v:.2f} != total {by_year_total[ys]}"

os.makedirs("public", exist_ok=True)
with open("public/data.json", "w") as f:
    json.dump(data, f)
print(f"public/data.json written — {len(transactions):,} transactions, "
      f"{len(monthly_total)} months, {len(YEARS)} years, "
      f"{os.path.getsize('public/data.json')//1024} KB")
print("all consistency checks passed")
