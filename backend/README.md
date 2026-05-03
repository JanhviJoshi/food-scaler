# Backend Architecture Reference
 
## Structure
 
```
backend/
├── app.py          ← Flask app creation + routes only
├── constants.py    ← CHEAT_SHEET (hardcoded data, replaced by DB later)
├── services.py     ← all business/calculation logic
├── utils.py        ← generic helper functions
└── requirements.txt
```