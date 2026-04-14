# Istoria Board Game — Validated v12

Η έκδοση v12 δεν μεταβάλλει το card count ούτε το validated περιεχόμενο του `cards.json`. Επικεντρώνεται αποκλειστικά στο τελευταίο residual app-level ζήτημα αξιοπιστίας: την παράκαμψη της κάρτας μέσα στον ίδιο γύρο.

## Τι βελτιώθηκε στη v12

- Το `Τέλος σειράς` παραμένει απενεργοποιημένο μέχρι να ολοκληρωθεί η ροή της κάρτας.
- Η κάρτα δεν μπορεί πλέον να κλείσει πριν εμφανιστεί η απάντηση και καταχωριστεί `Σωστό` ή `Λάθος`.
- Το πλήκτρο `Esc` δεν μπορεί να κλείσει εκκρεμή κάρτα.
- Αν γίνει ανανέωση της σελίδας ενώ υπάρχει εκκρεμής κάρτα, η ίδια κάρτα ανοίγει ξανά αυτόματα.
- Το app διατηρεί νέο local-storage key: `historia_board_state_pages_pkg_v12`.
- Ενημερώθηκαν `index.html`, `instructions.html` και `README.md` σε v12.

## Τι δεν άλλαξε

- `cards.json`: αμετάβλητο σε σχέση με τη v11
- πλήθος καρτών: 950
- chapter distribution: αμετάβλητη
- type distribution: αμετάβλητη
- page / answer / prefix metadata: αμετάβλητα

## Περιεχόμενα

- `cards.json` -> validated dataset v12 (bit-identical με το v11 dataset)
- `index.html` -> app bundle v12 με strict turn lock και restore εκκρεμούς κάρτας
- `instructions.html` -> ενημερωμένοι κανόνες χρήσης v12
- `assets/` -> εικόνες κεφαλαίων
