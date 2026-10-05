"""
ScamShield AI - Model Training & Evaluation Engine
Trains the NLP Text Classifier and Random Forest URL Classifier,
evaluates on test splits (Accuracy, Precision, Recall, F1, ROC-AUC, Confusion Matrix),
and exports serialized model pipelines and metrics.
"""
import os
import re
import math
import json
import pickle
from urllib.parse import urlparse
import numpy as np
import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import RandomForestClassifier
from sklearn.pipeline import Pipeline
from sklearn.metrics import (
    accuracy_score, precision_score, recall_score, f1_score,
    roc_auc_score, confusion_matrix
)

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATASETS_DIR = os.path.join(BASE_DIR, "datasets")
MODELS_DIR = os.path.join(BASE_DIR, "backend", "models")
os.makedirs(MODELS_DIR, exist_ok=True)

# URL Feature Extraction Helper
SUSPICIOUS_TLDS = {
    ".xyz", ".top", ".club", ".icu", ".biz", ".online", ".site", ".ru",
    ".cc", ".work", ".info", ".buzz", ".fit", ".rest", ".link", ".click"
}
SUSPICIOUS_KEYWORDS = [
    "verify", "secure", "login", "signin", "account", "update", "bank", "free",
    "bonus", "claim", "reward", "wallet", "kyc", "upi", "card", "refund",
    "blocked", "alert", "password", "support", "gift", "prize", "winner"
]

def calculate_entropy(text: str) -> float:
    if not text:
        return 0.0
    prob = [float(text.count(c)) / len(text) for c in dict.fromkeys(list(text))]
    return -sum([p * math.log(p) / math.log(2.0) for p in prob])

def extract_url_features(url_str: str) -> np.ndarray:
    if not isinstance(url_str, str):
        url_str = str(url_str)
    try:
        parsed = urlparse(url_str if "://" in url_str else f"http://{url_str}")
        netloc = parsed.netloc.lower()
        path = parsed.path.lower()
    except Exception:
        netloc = url_str.lower()
        path = ""

    url_len = len(url_str)
    domain_len = len(netloc)
    num_dots = url_str.count(".")
    num_hyphens = url_str.count("-")
    num_digits = sum(c.isdigit() for c in url_str)
    
    # Check IP address usage
    ip_pattern = r"^(?:[0-9]{1,3}\.){3}[0-9]{1,3}(?::[0-9]+)?$"
    has_ip = 1.0 if re.match(ip_pattern, netloc) else 0.0
    has_https = 1.0 if url_str.lower().startswith("https://") else 0.0
    
    # Subdomains
    parts = netloc.split(":")
    clean_host = parts[0]
    domain_parts = clean_host.split(".")
    subdomains = max(0, len(domain_parts) - 2)
    
    # Suspicious keywords count
    kw_count = sum(1 for kw in SUSPICIOUS_KEYWORDS if kw in url_str.lower())
    
    # Suspicious TLD
    has_sus_tld = 1.0 if any(clean_host.endswith(tld) for tld in SUSPICIOUS_TLDS) else 0.0
    
    # Shannon Entropy of domain & full URL
    entropy_val = calculate_entropy(url_str)
    
    return np.array([
        url_len, domain_len, num_dots, num_hyphens, num_digits,
        has_ip, has_https, subdomains, kw_count, has_sus_tld, entropy_val
    ], dtype=np.float32)

def train_and_evaluate():
    print("=== Training ScamShield AI Detection Models ===")

    # 1. TEXT DETECTION MODEL
    train_msg_path = os.path.join(DATASETS_DIR, "train", "messages_train.csv")
    test_msg_path = os.path.join(DATASETS_DIR, "test", "messages_test.csv")

    df_train_msg = pd.read_csv(train_msg_path)
    df_test_msg = pd.read_csv(test_msg_path)

    print(f"Loaded {len(df_train_msg)} training messages and {len(df_test_msg)} test messages.")

    text_pipeline = Pipeline([
        ('tfidf', TfidfVectorizer(
            ngram_range=(1, 2),
            max_features=5000,
            sublinear_tf=True,
            stop_words='english'
        )),
        ('clf', LogisticRegression(
            C=2.5,
            class_weight='balanced',
            max_iter=1000,
            random_state=42
        ))
    ])

    text_pipeline.fit(df_train_msg['text'].astype(str), df_train_msg['label'])

    # Evaluate Text Classifier
    y_test_text = df_test_msg['label'].values
    y_pred_text = text_pipeline.predict(df_test_msg['text'].astype(str))
    y_prob_text = text_pipeline.predict_proba(df_test_msg['text'].astype(str))[:, 1]

    text_metrics = {
        "accuracy": round(float(accuracy_score(y_test_text, y_pred_text)), 4),
        "precision": round(float(precision_score(y_test_text, y_pred_text, zero_division=0)), 4),
        "recall": round(float(recall_score(y_test_text, y_pred_text, zero_division=0)), 4),
        "f1_score": round(float(f1_score(y_test_text, y_pred_text, zero_division=0)), 4),
        "roc_auc": round(float(roc_auc_score(y_test_text, y_prob_text)), 4),
        "confusion_matrix": confusion_matrix(y_test_text, y_pred_text).tolist(),
        "total_test_samples": int(len(y_test_text))
    }

    # Save Text Model
    text_model_file = os.path.join(MODELS_DIR, "text_model.pkl")
    with open(text_model_file, "wb") as f:
        pickle.dump(text_pipeline, f)
    print(f"[OK] Saved text model to {text_model_file}")

    # 2. URL DETECTION MODEL
    train_url_path = os.path.join(DATASETS_DIR, "train", "urls_train.csv")
    test_url_path = os.path.join(DATASETS_DIR, "test", "urls_test.csv")

    df_train_url = pd.read_csv(train_url_path)
    df_test_url = pd.read_csv(test_url_path)

    print(f"Loaded {len(df_train_url)} training URLs and {len(df_test_url)} test URLs.")

    X_train_url = np.array([extract_url_features(u) for u in df_train_url['url']])
    y_train_url = df_train_url['label'].values

    X_test_url = np.array([extract_url_features(u) for u in df_test_url['url']])
    y_test_url = df_test_url['label'].values

    url_clf = RandomForestClassifier(
        n_estimators=120,
        max_depth=12,
        class_weight='balanced_subsample',
        random_state=42
    )
    url_clf.fit(X_train_url, y_train_url)

    y_pred_url = url_clf.predict(X_test_url)
    y_prob_url = url_clf.predict_proba(X_test_url)[:, 1]

    url_metrics = {
        "accuracy": round(float(accuracy_score(y_test_url, y_pred_url)), 4),
        "precision": round(float(precision_score(y_test_url, y_pred_url, zero_division=0)), 4),
        "recall": round(float(recall_score(y_test_url, y_pred_url, zero_division=0)), 4),
        "f1_score": round(float(f1_score(y_test_url, y_pred_url, zero_division=0)), 4),
        "roc_auc": round(float(roc_auc_score(y_test_url, y_prob_url)), 4),
        "confusion_matrix": confusion_matrix(y_test_url, y_pred_url).tolist(),
        "total_test_samples": int(len(y_test_url))
    }

    # Save URL Model & Feature Schema
    url_bundle = {
        "model": url_clf,
        "feature_names": [
            "url_length", "domain_length", "number_of_dots", "number_of_hyphens",
            "number_of_digits", "has_ip_address", "has_https", "number_of_subdomains",
            "suspicious_keywords_count", "has_suspicious_tld", "entropy"
        ],
        "suspicious_tlds": list(SUSPICIOUS_TLDS),
        "suspicious_keywords": SUSPICIOUS_KEYWORDS
    }

    url_model_file = os.path.join(MODELS_DIR, "url_model.pkl")
    with open(url_model_file, "wb") as f:
        pickle.dump(url_bundle, f)
    print(f"[OK] Saved URL model bundle to {url_model_file}")

    # 3. EXPORT COMBINED METRICS
    all_metrics = {
        "text_model": text_metrics,
        "url_model": url_metrics,
        "timestamp": "2026-10-02T19:35:00Z",
        "description": "ScamShield AI Production Model Evaluation Suite"
    }

    metrics_file = os.path.join(MODELS_DIR, "model_metrics.json")
    with open(metrics_file, "w") as f:
        json.dump(all_metrics, f, indent=2)
    print(f"[OK] Saved model evaluation metrics to {metrics_file}")
    print(json.dumps(all_metrics, indent=2))

if __name__ == "__main__":
    train_and_evaluate()
