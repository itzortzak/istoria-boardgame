# Istoria Board Game — Validated v14

Η έκδοση v14 δεν μεταβάλλει το card count ούτε το validated περιεχόμενο του `cards.json`. Επικεντρώνεται αποκλειστικά στη σταθεροποίηση της φόρτωσης των εικόνων των κεφαλαίων Δ΄, Ε΄, ΣΤ΄, Ζ΄.

## Τι βελτιώθηκε στη v14

- Οι εικόνες των κεφαλαίων Δ΄, Ε΄, ΣΤ΄, Ζ΄ απέκτησαν ASCII-safe filenames (`chapter_D.jpg`, `chapter_E.jpg`, `chapter_ST.jpg`, `chapter_Z.jpg`).
- Ο μηχανισμός φόρτωσης εικόνας χρησιμοποιεί πλέον fallback σε legacy Greek filenames, ώστε να λειτουργεί και σε μερικά παλαιότερα deployments.
- Το app διατηρεί νέο local-storage key: `historia_board_state_pages_pkg_v13`.
- Ενημερώθηκαν `index.html`, `app.js`, `instructions.html` και `README.md` σε v13.

## Τι δεν άλλαξε

- `cards.json`: αμετάβλητο σε σχέση με τη v11
- πλήθος καρτών: 950
- chapter distribution: αμετάβλητη
- type distribution: αμετάβλητη
- page / answer / prefix metadata: αμετάβλητα

## Περιεχόμενα

- `cards.json` -> validated dataset v14 (bit-identical με το v12 dataset)
- `index.html` -> app bundle v14 με διορθωμένη φόρτωση εικόνων κεφαλαίων
- `app.js` -> ενημερωμένος image-loader/fallback μηχανισμός
- `instructions.html` -> ενημερωμένοι κανόνες χρήσης v13
- `assets/` -> εικόνες κεφαλαίων, μαζί με ASCII-safe aliases για Δ΄, Ε΄, ΣΤ΄, Ζ΄
