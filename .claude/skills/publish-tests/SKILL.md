---
name: publish-tests
description: Step 3. Lets the human pick which drafted test cases from an artifacts/test-cases file get published into the tracker (status "Test Writing In Progress"), then submits them for review. Use for "publish test cases for <STORY>" or "/publish-tests <file>".
argument-hint: <artifacts/test-cases/test-cases-STORY.md>
disable-model-invocation: true
---

# Publish drafted test cases: $ARGUMENTS

1. Read the file and show a table: draftId · title · priority · AC covered.
2. Ask the human which draftIds to publish (default: none — they must choose). Do not guess.
3. 🚦 Run `npm run tracker -- publish $ARGUMENTS --select <chosen ids>` (approval prompt).
   The CLI validates every draft against the schema and assigns ids (e.g. `SD-T-401`).
4. 🚦 For each new id, submit for review:
   `npm run tracker -- move <ID> "Review Needed for Manual Test"` (approval prompt each).
5. Report the new ids and the next step: Step 4 review (`test-case-reviewer`) and human sign-offs.
