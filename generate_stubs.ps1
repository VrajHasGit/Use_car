$entities = @(
    "pur_inq", "val", "pfu", "pcl", "ob", 
    "sal_inq", "sfu", "scl", "sob", 
    "stk", "ws", "pay", "del", "doc", "cust", 
    "dn", "gp", "sp"
)

$features = @(
    "dashboard", "pur_dashboard", "sal_dashboard", 
    "pur_inq", "valuation", "pur_follow", "pur_closer", "pur_booking", 
    "sal_inq", "sal_follow", "sal_closer", "sal_booking", 
    "stock", "workshop", "payment", "delivery", "delivery_note", "gate_pass", 
    "documents", "reports", "sale_process", "customers", "test_drive", "emp_perf", "user_mgmt"
)

$dl_dir = "d:\Project\Carecay Used Car\.knowledge_base\data_layer"
$ft_dir = "d:\Project\Carecay Used Car\.knowledge_base\features"

foreach ($e in $entities) {
    $path = "$dl_dir\$e.md"
    $content = @"
**Navigation:** [← Index](../index.md) | [Schema Overview](./schema-overview.md)

### Query Objective: Manage $e records

- **Query Objective:** Core data store logic for managing $e
- **Schema Link:** `DB.$e` -> in-memory localStorage
- **Execution Path:** `index.html` -> `saveRec('$e')`
- **Dialect:** JSON

**Query Syntax:**

````javascript
// Simulated Query Syntax for $e
let record = DB.$e.find(r => r.id === targetId);
if(!record) {
    record = { id: genId('$e', ++DB.cnt.$e) };
    DB.$e.push(record);
}
// update fields...
saveDB();
````

**Business Rules Embedded in This Query:**
- [Rule 1: Auto-generates ID utilizing DB.cnt.$e counter]
- [Rule 2: Automatically triggers local storage persist via saveDB()]
"@
    Set-Content -Path $path -Value $content -Encoding UTF8
}

foreach ($f in $features) {
    $path = "$ft_dir\feature-$f.md"
    $content = @"
**Navigation:** [← Index](../index.md) | [Data Layer](../data_layer/schema-overview.md) | [Component](../components/index.md)

# Feature: $f

**Source Path:** `index.html`
**Dependencies:** None external
**Related Data Layer:** [View Entities](../data_layer/schema-overview.md)
**Related Component:** N/A (Monolithic HTML)

---

## Business Logic Intent

This module handles the application flow and user interface interactions exclusively for the $f workflow. 
- It satisfies the requirement of giving the user a dedicated context/dashboard for this pipeline stage.
- It enables the local data manipulation directly interacting with the global DB variable.

---

## Functional Breakdown

1. `nav('$f')` in `index.html` — Toggles DOM visibility to display the pg_$f section.
2. `render$f()` in `index.html` — Iterates through the DB collection to render table rows or KPI widgets.
3. `saveRec()` in `index.html` — Parses form inputs, validates required fields, updates the DB object, and calls saveDB() to flush to localStorage.

---

## Data Interactions

- **Reads:** DB collections via `render$f()` -> [Link](../data_layer/schema-overview.md)
- **Writes:** Mutates DB collections via `saveRec()` -> [Link](../data_layer/schema-overview.md)
- **Side Effects:** Triggers `autoCascade()` for downstream pipeline creation if applicable.

---

## Sequence Diagram

````mermaid
sequenceDiagram
    participant Client
    participant API
    participant Service
    participant DB
    Client->>API: Click on $f menu
    API->>Service: nav('$f')
    Service->>DB: DB lookup
    DB-->>Service: Return JSON records
    Service-->>API: DOM Update via render$f()
    API-->>Client: Updated screen displayed
````
"@
    Set-Content -Path $path -Value $content -Encoding UTF8
}
