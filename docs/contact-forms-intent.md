# Private contact forms: settled local-review decisions

The local implementation provides [/contact](https://kenshi.wiki/contact) and [/contact/copyright](https://kenshi.wiki/contact/copyright) in the wiki frame. Publication and live intake are not enabled by this review. See [configuration and local review](contact-forms.md).

- General messages cover questions, corrections and proposed contributions. The second form covers informal copyright, permission and removal concerns. Both represent Kenshi Wiki.
- Required fields are reply email, topic and explanation; copyright concerns also require an affected URL/file. Name or preferred credit is optional. Text and links only, with no postal address, phone number, signature, legal declaration or publication consent requirement.
- Delivery is private to the fixed verified address `admin@kenshi.wiki`. Email Routing receives/forwards email; the browser form uses a server-side Email Service binding. The private forwarding destination is not application configuration.
- Retention is inbox-only: no database, application submission archive, browser draft storage or automatic GitHub issue. Delivered correspondence remains subject to the maintainer's mailbox retention.
- Same-origin validation, request/field limits, a honeypot and server-side Turnstile verification precede delivery. The sender is fixed; the submitter's validated address is Reply-To only.
- A reference and on-page result distinguish service acceptance from inbox arrival, review, removal, publication or a guaranteed response. Ambiguous failures are reported honestly, without automatic retries.
- Original contributions remain subject to review, attribution and the existing licensing guidance. Existing GitHub correction paths and direct email remain available.
- Acknowledgment emails to submitters are deferred until a separately reviewed outbound-sending setup. No paid plan is enabled here.
- RuneScape Wiki's contact forms informed the user journey. Its company wording and formal declarations were not adopted.

This pass uses a loopback-only harness with fake verification and delivery. **No email is sent.** Before live activation, verify the recipient restriction, sender-domain eligibility, real arrival through the admin forwarding rule, and Turnstile hostname/action enforcement. No account provisioning, publication or deployment is included.
