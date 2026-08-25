# `data.json` schema

The dashboard fetches one file at runtime: `public/data.json`. Match this shape
and it renders your finances. `scripts/generate-sample-data.py` produces a
complete, internally consistent example — read it alongside this document.

Nothing is fetched from anywhere. Your file stays on your machine unless you
deliberately publish it, and `.gitignore` excludes `public/data.json` for exactly
that reason.

---

## Top-level keys

| Key | Shape | Used by |
|---|---|---|
| `cat_colors` | `{ "Category": "#hex" }` | every chart's colour scheme |
| `shade_map` | `{ "Category": { "Subcategory": "rgba(...)" } }` | subcategory shading |
| `monthly_total` | `{ "2025-03": 6420.11 }` | headline stats, trends |
| `monthly_by_cat` | `{ "2025-03": { "Category": 2150.0 } }` | overview |
| `monthly_subcat` | `{ "2025-03": { "Category": { "Sub": 900.0 } } }` | drill-down |
| `by_year_cat` | `{ "2025": { "Category": 25800.0 } }` | year-over-year |
| `by_year_total` | `{ "2025": 79738.12 }` | **also defines which years exist** |
| `subcat_all` | `{ "Category": { "Sub": 41229.03 } }` | all-time subcategory ranking |
| `subcat_by_year` | `{ "2025": { "Category": { "Sub": 9000.0 } } }` | filtered drill-down |
| `transactions` | array, see below | the transaction table |
| `sankey` | `{ "2025": {...} }`, see below | cash-flow diagram |
| `top_merchants` | `{ "2025": { "Merchant": 6701.35 } }` | merchant ranking |
| `benchmarks` | see below | peer comparison, income, wealth |

**`by_year_total` is load-bearing beyond its own chart.** The year selector and
the header date range are derived from its keys, so a dataset spanning 2019–2022
produces those pills automatically. Nothing about the year span is hardcoded.

---

## `transactions`

```jsonc
{
  "date": "03/14/2025",   // MM/DD/YYYY
  "year": 2025,
  "month": 3,
  "name": "Marketvale Grocery",
  "amount": 84.31,        // positive; this dashboard tracks spending
  "category": "Groceries",     // the subcategory
  "parent": "Food & Drink",    // must match a key in cat_colors
  "recurring": 0               // 0 or 1
}
```

## `sankey`

Keyed by year:

```jsonc
"2025": {
  "income_sources":  { "Salary — Primary": 86000, "Interest": 1150 },
  "total_income":    113900,
  "total_expenses":  79738.12,
  "net_savings":     34161.88,     // must equal income - expenses
  "expense_categories":    { "Household": 25800.0 },
  "expense_subcategories": { "Household": { "Rent/Mortgage": 18000.0 } }
}
```

## `benchmarks`

```jsonc
{
  "income": {
    "you_2025": 113900,
    "you_2026_annualized": 120924,
    "taxes_2025": 21641,
    "comparison": [                       // drives the horizontal bar chart;
      { "label": "US national median", "value": 80610 },   // any length, any labels
      { "label": "You — 2025 gross",   "value": 113900 }
    ]
  },
  "spending_annual": {
    "bls_avg_total": 77280,
    "bls_top_quintile_total": 148900,
    "you_2025": 79738.12,
    "categories": { "Household": { "you": 25800.0, "bls_avg": 22100.0 } }
  },
  "savings_wealth": {
    "retirement_you": 96500, "retirement_median_35_44": 45000,
    "liquid_savings_you": 41200, "net_worth_median_35_44": 135300,
    "home_value_you": 312000, "mortgage_you": 244000, "home_equity_you": 68000
  },
  "net_income_by_year": {
    "2025": { "income": 113900, "expenses": 79738.12,
              "you": 34161.88,       // net — drives the bar
              "peer_est": 6834.0 }   // comparison line
  },
  "childcare": {
    "national_avg_2_children": 26256, "nanny_annual": 45240,
    "your_actual": 1779.61, "your_savings_vs_avg": 21100.0,
    "your_savings_vs_nanny": 40080.0, "foregone_salary": 68000
  },
  "spending_pct_income": { "categories": { "Household": 22.7 } }
}
```

**If a benchmark section is irrelevant to you**, the honest move is to remove the
card from `src/templates.js` rather than to invent numbers for it. The childcare
tab in particular assumes a household that has children.

---

## Consistency

The generator asserts these before writing, and you should too:

- monthly totals for a year sum to that year's `by_year_total`
- subcategories sum to their parent category, per month
- transactions for a year sum to that year's total
- `total_income - total_expenses == net_savings`, per year

Charts do not validate their inputs. An inconsistent file renders confidently and
wrongly, which is worse than failing.
