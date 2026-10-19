<!-- source: https://devdocs.krayincrm.com/2.2/api -->
This is the documentation for the current version 2.2 of Krayin. Stay informed and make the most of Krayin's capabilities.

# [\#](https://devdocs.krayincrm.com/2.2/api/\#krayin-apis) Krayin APIs

Krayin exposes its core entities through a first-party **REST API** — install one Composer package, run an artisan command, and every Lead / Person / Organization / Quote / Product action available in the admin is reachable over HTTP.

The REST API is the integration surface for:

- **Progressive Web Apps** — build a custom CRM front-end against Krayin as the back-end.
- **Mobile apps** — iOS / Android clients that read and write CRM records.
- **External systems** — sync leads from a marketing tool, push quotes to an ERP, mirror contacts into a marketing-automation platform.
- **Internal automations** — one-off scripts that bulk-process records without needing a session in the admin.

## [\#](https://devdocs.krayincrm.com/2.2/api/\#what-s-in-this-section) What's in this section

- [Explore the REST API](https://devdocs.krayincrm.com/2.2/api/getting-started-with-the-api.html) — install `krayin/rest-api`, configure Sanctum, open the Swagger UI, and make your first authenticated request.

## [\#](https://devdocs.krayincrm.com/2.2/api/\#at-a-glance) At a glance

| Capability | Detail |
| --- | --- |
| **Auth** | Laravel Sanctum — bearer tokens for API clients, cookie sessions for SPAs. |
| **Docs UI** | L5-Swagger UI mounted at `/api/admin/documentation` — live, interactive, generated from PHP annotations. |
| **CRUD** | `POST/GET/PUT/DELETE` for every core entity. |
| **Pagination** | `page`, `per_page`, and standard Laravel paginator metadata on list endpoints. |
| **Events** | API writes fire the same listener events as admin writes — see [Events Listeners](https://devdocs.krayincrm.com/2.2/digging-deeper/events.html). |

←
[Make Model With Custom Attribute](https://devdocs.krayincrm.com/2.2/custom-attributes/model-custom-attribute.html)[Explore REST API](https://devdocs.krayincrm.com/2.2/api/getting-started-with-the-api.html)
→


![](https://fonts.gstatic.com/s/i/productlogos/translate/v14/24px.svg)

Original text

Rate this translation

Your feedback will be used to help improve Google Translate
