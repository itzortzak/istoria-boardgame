# Istoria — Web Board Game (GitHub Pages)

## Περιεχόμενα
- `index.html` — η κύρια σελίδα του παιχνιδιού
- `cards.json` — 350 κάρτες (ερώτηση/απάντηση/σελίδα)
- `assets/` — εικόνες ανά κεφάλαιο
- `.nojekyll` — απενεργοποιεί Jekyll processing

## GitHub Pages
Repo → Settings → Pages:
- Source: Deploy from a branch
- Branch: main
- Folder: / (root)

URL: `https://USERNAME.github.io/REPO/`

## WordPress (blogs.sch.gr) embed
Custom HTML block:

```html
<iframe
  src="https://USERNAME.github.io/REPO/"
  style="width:100%; height:950px; border:0; border-radius:14px;"
  loading="lazy"
></iframe>
```


## v2.0.x (ZIP cards)
Το `cards.json` ενημερώθηκε με ερωτήσεις από τα ZIP (01–04). Όλες οι κάρτες είναι μονοθεματικές (1 Ορισμός ή 1 Σ/Λ ή 1 MCQ). Σε όλες τις απαντήσεις προστέθηκε αριθμός **έντυπης σελίδας** του σχολικού βιβλίου (σελ. Χ), όπως εξάγεται από το επίσημο PDF.
