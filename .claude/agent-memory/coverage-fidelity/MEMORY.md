# coverage-fidelity — lessons learned
Read at the start of every run; append at most 1 lesson per run.

- Data-driven tracker tests (with `dataset`) may expand to one Playwright test per row; that still counts as "one test() per ID".
- An assertion on the page `title` only proves navigation; it does not prove an "expected" about content — look for both.
- Specs in `tests/.temp/` are eslint-ignored, so "lint clean" can't be verified there; for sort tests, reason through a text-sort mutation (e.g. "$15.99" before "$9.99") to confirm the assertions would fail.
- Default-state tests (no action under test): saved storageState + fresh context is an honest "no option chosen" precondition if the control isn't persisted; check the setup lines sit outside test.step and note it as minor.
- Descending-sort tests: the "text-sort" mutation breaks both the price-literal and the index/last assertions; price-by-name checks alone are data checks and do not guard order, so confirm index comparisons exist. Tie order can be avoided with per-item indexOf comparisons.
- Option-list tests (native select): prove "would it fail" cases with a scratch spec in the scratchpad using setContent + NODE_PATH=repo node_modules + `use.testIdAttribute: "data-test"` in the scratch config (without it every case falsely fails). A disabled select is caught only by toBeEnabled; labels/swap only by toHaveText array.
