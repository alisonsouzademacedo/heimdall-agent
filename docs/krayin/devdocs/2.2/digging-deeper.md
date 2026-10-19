<!-- source: https://devdocs.krayincrm.com/2.2/digging-deeper -->
This is the documentation for the current version 2.2 of Krayin. Stay informed and make the most of Krayin's capabilities.

# [\#](https://devdocs.krayincrm.com/2.2/digging-deeper/\#digging-deeper) Digging Deeper

Welcome to **Digging Deeper** — the advanced topics for customising and extending Krayin once you've built your own package.

This section assumes you're comfortable with Krayin package development. If you haven't built a package yet, start with [Package Development — Getting Started](https://devdocs.krayincrm.com/2.2/packages/create-package.html) first.

## [\#](https://devdocs.krayincrm.com/2.2/digging-deeper/\#what-s-in-this-section) What's in this section

- [AI-Powered Lead Generation](https://devdocs.krayincrm.com/2.2/digging-deeper/ai-powered-lead-generation.html) — turn uploaded documents into leads via OpenRouter.
- [Best Security Practices](https://devdocs.krayincrm.com/2.2/digging-deeper/security-practice.html) — harden a production Krayin server.
- [Data Transfer](https://devdocs.krayincrm.com/2.2/digging-deeper/data-transfer.html) — bulk-import leads, persons, and products from CSV or XLSX.
- [Email Inbound Parse](https://devdocs.krayincrm.com/2.2/digging-deeper/email-inbound-parse.html) — turn inbound emails into CRM entries via SendGrid Inbound Parse or Webklex IMAP.
- [Events Listeners](https://devdocs.krayincrm.com/2.2/digging-deeper/events.html) — hook into the lifecycle events Krayin fires on every write.
- [Events and Campaigns](https://devdocs.krayincrm.com/2.2/digging-deeper/events-and-campaigns.html) — schedule recurring email campaigns from CRM events.
- [Helpers](https://devdocs.krayincrm.com/2.2/digging-deeper/helpers.html) — the global `core()` helper functions Krayin ships.
- [Override a Layout](https://devdocs.krayincrm.com/2.2/digging-deeper/override-a-layout.html) — swap or extend a core controller, model, blade view, or inject snippets via `view_render_event`.

## [\#](https://devdocs.krayincrm.com/2.2/digging-deeper/\#quick-links) Quick links

| You want to... | Go to |
| --- | --- |
| Hook custom logic into a CRM write | [Events Listeners](https://devdocs.krayincrm.com/2.2/digging-deeper/events.html) |
| Send drip emails from CRM events | [Events and Campaigns](https://devdocs.krayincrm.com/2.2/digging-deeper/events-and-campaigns.html) |
| Customise a core admin screen | [Override a Layout](https://devdocs.krayincrm.com/2.2/digging-deeper/override-a-layout.html) |
| Ship a feature that imports CSVs | [Data Transfer](https://devdocs.krayincrm.com/2.2/digging-deeper/data-transfer.html) |
| Receive inbound emails into the CRM | [Email Inbound Parse](https://devdocs.krayincrm.com/2.2/digging-deeper/email-inbound-parse.html) |
| Harden production before launch | [Best Security Practices](https://devdocs.krayincrm.com/2.2/digging-deeper/security-practice.html) |
| Use AI to extract leads from documents | [AI-Powered Lead Generation](https://devdocs.krayincrm.com/2.2/digging-deeper/ai-powered-lead-generation.html) |
| Use `core()->formatDate(...)` and friends | [Helpers](https://devdocs.krayincrm.com/2.2/digging-deeper/helpers.html) |

## [\#](https://devdocs.krayincrm.com/2.2/digging-deeper/\#when-to-dig-deeper) When to dig deeper

Most package work doesn't need anything from this section — [Package Development](https://devdocs.krayincrm.com/2.2/packages/create-package.html) covers the day-to-day surface. Reach for these pages when:

- You need to **react to** something happening elsewhere in the CRM → [Events Listeners](https://devdocs.krayincrm.com/2.2/digging-deeper/events.html).
- You want to **change** an existing core screen instead of building a new one → [Override a Layout](https://devdocs.krayincrm.com/2.2/digging-deeper/override-a-layout.html).
- Your package has a **bulk operation** users will run on tens of thousands of rows → [Data Transfer](https://devdocs.krayincrm.com/2.2/digging-deeper/data-transfer.html).
- You're putting Krayin into **production** → [Best Security Practices](https://devdocs.krayincrm.com/2.2/digging-deeper/security-practice.html).

←
[Views](https://devdocs.krayincrm.com/2.2/packages/views.html)[AI-Powered Lead Generation](https://devdocs.krayincrm.com/2.2/digging-deeper/ai-powered-lead-generation.html)
→


![](https://fonts.gstatic.com/s/i/productlogos/translate/v14/24px.svg)

Original text

Rate this translation

Your feedback will be used to help improve Google Translate
