# Kenshi Wiki security policy

## Report a security problem privately

If you find an exposed credential, personal information disclosed by the site, or a vulnerability in the wiki or its deployment, [send a private report to the maintainers](https://github.com/mattresspad/kenshi-wiki/security/advisories/new). Sign in to GitHub, identify the affected page, file, or workflow, and describe what you observed. Redact tokens, personal details, and private URLs from examples and screenshots. Keep sensitive details out of public issues and pull requests.

If a credential you control was exposed, revoke or rotate it at the issuing service promptly, even if the original post or commit has been removed.

## When contributing

- Check screenshots, saves, logs, and diffs for account details, private file paths, and credentials before sharing them.
- Check where an external link leads and label it so readers know what they’re opening. For downloads, prefer the creator’s release page.
- When adding code that contacts another service, document the destination and what data it receives. Validate external input, send only what the feature needs, and keep credentials in deployment secrets. Anything bundled into the browser or published in build logs is visible to readers.
