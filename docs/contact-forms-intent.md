# Deferred contact forms and receipt emails

Future investigation only. The current contact route is `admin@kenshi.wiki`; this note does not add a form, backend, paid service or autoresponder.

- Explore a general contact/correction form and a separate copyright-report route. Informal questions must remain available without legal declarations; assess formal takedown requirements and wording separately.
- Deliver submissions privately to the wiki maintainer and retain direct email as an alternative. This contact represents the wiki, not Meitou or other linked projects.
- Evaluate a small server-side submission handler and its mail delivery path. Email Routing handles incoming email; it is not itself a browser-form endpoint. Recheck current Cloudflare Email Service capabilities, sending-domain setup and plan costs when implementing. Workers Paid is a possible future choice.
- Show a clear on-page result and investigate automatic receipt emails with a reference number. Acknowledge acceptance by the intake system accurately, distinguishing it from completed email delivery. Receipt is not a decision about a claim, a removal promise or a response deadline.
- Example: “We’ve received your message about Kenshi Wiki. Reference: [reference]. This is an automatic receipt confirmation; your message has not yet been assessed.”
- Decide minimum fields, personal-information handling, retention, abuse protection and failure handling before implementation. Keep private submissions out of public Git history and issues. Prevent automatic replies being abused to send mail to other people’s addresses.
- RuneScape Wiki’s Special:Contact and Special:Contact/dmca forms are workflow references. Their company-specific wording, legal declarations and publication consent are not adopted here.

Design, implementation, validation and publication belong to a separate task. This is not a prerequisite for the copyright guidance or a commitment to any particular service plan.
