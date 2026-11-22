# Accepted text after the frozen conversion

The frozen source and family fixtures remain historical evidence. An approved post-conversion edit is recorded separately in [accepted-text.json](accepted-text.json), with its author, exact source and merge commits, PR, before/after paragraph text, section, and fingerprints.

For PR #57, teppuM's approved hunger-floor paragraph remains unchanged in Guide to Health. The audit requires that exact rendered paragraph once, in the Hunger section, with no added markup. It then substitutes the earlier paragraph **only in memory** and runs the existing complete frozen comparison. The rest of the article's wording, tables, links, IDs, citations and facts still have to match. Reverting the approved paragraph also fails.

This reconciles preservation evidence with an accepted editorial change. It does not independently verify the gameplay claims, change article attribution or licenses, close gap findings, or grant broader editorial sign-off. The report lists the applied acceptance record.

When a later approved change affects this evidence, review it explicitly and add/update its acceptance record with pinned source history. Do not regenerate the original fixture to make a failure disappear. `tests/accepted-text.test.mjs` covers changed/reverted/duplicated text, section placement, markup, and unrelated alterations.
