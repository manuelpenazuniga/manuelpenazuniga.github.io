"""Export the evaluation of Clinibrium's confidence layer for the site.

Trains the model exactly as Clinibrium's own `ml_engine.train` does (same
seed, same 60/20/20 split, same synthetic generator) and writes the held-out
predictions the charts are computed from. Nothing here is tuned for the page.

Run inside Clinibrium's ml_engine environment (pinned deps):

    cd Clinibrium/ml_engine && python -m venv .venv && .venv/bin/pip install -e .
    .venv/bin/python <site>/tools/clinibrium-eval.py <site>/src/lib/data/model.json

The data is synthetic, so every number measures recovery of the generator,
not clinical performance. The page says so next to the charts.
"""
from __future__ import annotations

import dataclasses
import json
import sys

import numpy as np
from catboost import Pool

from ml_engine.core.encode import encode
from ml_engine.core.model import _danger_leaves
from ml_engine.core.synth import generate
from ml_engine.domains import vertigo
from ml_engine.train import train_domain

SEED = 20260711
MISSING = (0.0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6)


def predict(model, df, leaves):
    rows = df.to_dict("records")
    raw = model.predict_proba(rows)
    cal = model.calibrator.transform(raw)
    as_matrix = lambda ps: np.array([[p[leaf] for leaf in leaves] for p in ps])  # noqa: E731
    y = np.array([leaves.index(str(r["label"])) for r in rows])
    return rows, as_matrix(raw), as_matrix(cal), y


def main(out_path: str) -> None:
    domain = vertigo.VERTIGO
    model, metrics = train_domain(domain, seed=SEED)
    leaves = tuple(domain.hierarchy.leaves)
    danger = sorted(leaves.index(leaf) for leaf in _danger_leaves(domain.hierarchy))
    spec = domain.synthetic

    # the same frame and the same slices train_domain used
    df = generate(spec, domain.features, seed=SEED)
    n_test, n_cal = int(len(df) * 0.2), int(len(df) * 0.2)
    test_df = df.iloc[:n_test]
    rows, raw, cal, y = predict(model, test_df, leaves)

    cases = {
        "y": y.tolist(),
        "rawPred": raw.argmax(1).tolist(),
        "rawConf": np.round(raw.max(1), 4).tolist(),
        "pred": cal.argmax(1).tolist(),
        "conf": np.round(cal.max(1), 4).tolist(),
        "pDanger": np.round(cal[:, danger].sum(1), 4).tolist(),
    }

    # robustness: the same generator with more and more features withheld
    stress = []
    for rate in MISSING:
        s_spec = dataclasses.replace(spec, n_samples=1500, missing_rate=rate, seed=spec.seed + 1)
        s_df = generate(s_spec, domain.features, seed=spec.seed + 1)
        _, _, s_cal, s_y = predict(model, s_df, leaves)
        hit = s_cal.argmax(1) == s_y
        answered = s_cal.max(1) >= model.abstainer.threshold
        is_danger = np.isin(s_y, danger)
        flagged = s_cal[:, danger].sum(1) > 0.5
        stress.append(
            {
                "missing": rate,
                "n": int(len(s_y)),
                "correct": int(hit.sum()),
                "answered": int(answered.sum()),
                "answeredCorrect": int((hit & answered).sum()),
                "danger": int(is_danger.sum()),
                "dangerCaught": int((is_danger & flagged).sum()),
            }
        )

    # what moves the gate: TreeSHAP on the gate's logit, one row per case
    rng = np.random.RandomState(SEED)
    gate = model._nodes[domain.hierarchy.root].model
    sample = rng.choice(len(rows), size=450, replace=False)
    x, cat = encode([rows[i] for i in sample], domain.features)
    shap = gate.get_feature_importance(Pool(x, cat_features=cat), type="ShapValues")[:, :-1]
    names = list(domain.features.feature_names)
    order = np.argsort(-np.abs(shap).mean(0))[:8]
    attribution = {
        "features": [names[j] for j in order],
        "risk": [names[j] in domain.features.risk_features for j in order],
        "meanAbs": np.round(np.abs(shap).mean(0)[order], 4).tolist(),
        "danger": np.isin(y[sample], danger).astype(int).tolist(),
        "values": np.round(shap[:, order].T, 3).tolist(),
    }

    out = {
        "version": model.model_version,
        "seed": SEED,
        "split": {"train": len(df) - n_test - n_cal, "calibration": n_cal, "test": n_test},
        "leaves": leaves,
        "danger": danger,
        "temperature": round(metrics.temperature, 4),
        "threshold": round(metrics.abstain_threshold, 4),
        "reported": {k: round(v, 4) for k, v in dataclasses.asdict(metrics).items()},
        "cases": cases,
        "stress": stress,
        "attribution": attribution,
    }
    with open(out_path, "w") as fh:
        json.dump(out, fh, separators=(",", ":"))
    print(json.dumps(out["reported"], indent=1))


if __name__ == "__main__":
    main(sys.argv[1])
