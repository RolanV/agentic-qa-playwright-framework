# coverage-fidelity — lessons learned
Read at the start of every run; append at most 1 lesson per run.

- Data-driven tracker tests (with `dataset`) may expand to one Playwright test per row; that still counts as "one test() per ID".
- An assertion on the page `title` only proves navigation; it does not prove an "expected" about content — look for both.
- Specs in `tests/.temp/` are eslint-ignored, so "lint clean" can't be verified there; for sort tests, reason through a text-sort mutation (e.g. "$15.99" before "$9.99") to confirm the assertions would fail.
