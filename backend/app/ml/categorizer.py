import re
from typing import Tuple
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.ensemble import RandomForestClassifier

# Built-in Categories
CATEGORIES = [
    "Food", "Shopping", "Travel", "Bills", "Healthcare", 
    "Entertainment", "Education", "Salary", "Investment", 
    "Rent", "Fuel", "Insurance", "Miscellaneous"
]

# Rule-based Keyword Mapping
RULE_MAP = {
    "Food": ["zomato", "swiggy", "starbucks", "mcdonalds", "kfc", "dominos", "subway", "restaurant", "cafe", "diner", "supermarket", "groceries", "blinkit", "zepto", "instamart"],
    "Shopping": ["amazon", "flipkart", "myntra", "zara", "h&m", "uniqlo", "nike", "adidas", "apple store", "electronics", "mall", "shoppers stop"],
    "Travel": ["uber", "ola", "rapido", "makemytrip", "goibibo", "irctc", "flight", "indigo", "air india", "taxi", "toll", "metro"],
    "Bills": ["electricity", "water bill", "broadband", "jio", "airtel", "vi", "recharge", "utility", "gas bill"],
    "Healthcare": ["pharmacy", "apollo", "netmeds", "1mg", "hospital", "clinic", "doctor", "pathology", "lab"],
    "Entertainment": ["netflix", "spotify", "prime video", "bookmyshow", "hotstar", "cinema", "gaming", "steam", "playstation"],
    "Education": ["udemy", "coursera", "books", "tuition", "school", "college", "edx", "coaching"],
    "Salary": ["salary", "payroll", "stipend", "bonus", "dividend", "freelance income", "employer"],
    "Investment": ["zerodha", "groww", "kuvera", "sip", "mutual fund", "stocks", "etf", "indmoney", "fd", "fixed deposit"],
    "Rent": ["rent", "landlord", "housing society", "brokerage", "nobroker"],
    "Fuel": ["hpcl", "bpcl", "iocl", "petrol", "diesel", "fuel", "shell"],
    "Insurance": ["lic", "star health", "policybazaar", "acko", "hdfc ergo", "insurance premium"],
}

# Train a small lightweight ML model in memory for merchant pattern recognition
_vectorizer = TfidfVectorizer(ngram_range=(1, 2))
_rf_model = RandomForestClassifier(n_estimators=30, random_state=42)

# Training Corpus
_train_texts = []
_train_labels = []
for cat, keywords in RULE_MAP.items():
    for kw in keywords:
        _train_texts.append(kw)
        _train_labels.append(cat)

# Add generic patterns
_train_texts.extend(["grocery store", "movie theater ticket", "flight booking", "car petrol", "wifi connection"])
_train_labels.extend(["Food", "Entertainment", "Travel", "Fuel", "Bills"])

_X_train = _vectorizer.fit_transform(_train_texts)
_rf_model.fit(_X_train, _train_labels)

def auto_categorize_transaction(merchant: str, amount: float = 0, notes: str = "") -> Tuple[str, float, str]:
    """
    Returns: (category, confidence_score, method_used)
    """
    text = f"{merchant} {notes}".lower().strip()
    
    # 1. Rule Engine Check
    for category, keywords in RULE_MAP.items():
        for kw in keywords:
            if re.search(r'\b' + re.escape(kw) + r'\b', text):
                return category, 0.98, "Rule Engine"
            
    # 2. Machine Learning Model Check (Scikit-Learn Random Forest)
    try:
        vec = _vectorizer.transform([text])
        probs = _rf_model.predict_proba(vec)[0]
        max_prob_idx = probs.argmax()
        confidence = float(probs[max_prob_idx])
        predicted_cat = _rf_model.classes_[max_prob_idx]
        
        if confidence >= 0.40:
            return predicted_cat, round(confidence, 2), "Random Forest ML"
    except Exception:
        pass
        
    # 3. Fallback Heuristics
    if amount < 0 or "salary" in text or "credit" in text:
        return "Salary", 0.70, "Heuristic Fallback"
        
    return "Miscellaneous", 0.50, "Default Fallback"
