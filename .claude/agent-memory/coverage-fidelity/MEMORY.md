# coverage-fidelity — lessons learned
Read at the start of every run; append at most 1 lesson per run.

- Data-driven tracker tests (with `dataset`) may expand to one Playwright test per row; that still counts as "one test() per ID".
- An assertion on the page `title` only proves navigation; it does not prove an "expected" about content — look for both.
