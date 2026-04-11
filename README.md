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


## Έκδοση full dataset
Το `cards.json` της παρούσας έκδοσης περιλαμβάνει και τις 1107 εγγραφές του πλήρους συνόλου ερωτήσεων.


## Binder2 correction update
Το `cards.json` ελέγχθηκε και αναδομήθηκε με βάση το συνημμένο Binder2.pdf, με χρήση μόνο ερωτήσεων του Θέματος 1 και κλειστού τύπου σύμφωνα με τις προδιαγραφές της εφαρμογής. Διορθώθηκαν λανθασμένες ταξινομήσεις Σωστό/Λάθος και προστέθηκαν ελλείπουσες κάρτες όπου ήταν απαραίτητο.
