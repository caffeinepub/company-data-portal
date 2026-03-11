# Company Data Entry Portal

## Current State
New project. No existing code.

## Requested Changes (Diff)

### Add
- A data entry form where staff can submit company records
- Fields: Record Name, Category (dropdown: Sales, HR, Finance, Operations, Other), Department, Date, Value/Amount, Notes
- A records list/table showing all submitted entries
- Ability to delete a record
- Summary stats: total records, records by category

### Modify
- N/A

### Remove
- N/A

## Implementation Plan
1. Backend: Store records with id, name, category, department, date, value, notes, createdAt
2. Backend: CRUD operations - addRecord, getRecords, deleteRecord
3. Frontend: Data entry form with validation
4. Frontend: Records table with sorting and delete
5. Frontend: Summary stats cards at top
