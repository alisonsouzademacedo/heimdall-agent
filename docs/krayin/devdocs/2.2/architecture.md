<!-- source: https://devdocs.krayincrm.com/2.2/architecture -->
This is the documentation for the current version 2.2 of Krayin. Stay informed and make the most of Krayin's capabilities.

# [\#](https://devdocs.krayincrm.com/2.2/architecture/\#architecture-concepts) Architecture concepts

Krayin is a **modular Laravel application**. Every CRM feature — Leads, Contacts, Activities, Quotes — lives in its own package under `packages/Webkul/`, glued together through a small set of architectural patterns: Concord model proxies, the Prettus Repository, Blade Components, and an event-driven write path.

This section is the map of those patterns — what they are, why they exist, and which package implements what.

## [\#](https://devdocs.krayincrm.com/2.2/architecture/\#what-s-in-this-section) What's in this section

- [Overview](https://devdocs.krayincrm.com/2.2/architecture/overview.html) — the architectural tour: tech stack, modular package structure, component-based admin UI, event-driven design, the Repository Pattern, Concord model registration.
- [Packages](https://devdocs.krayincrm.com/2.2/architecture/packages.html) — reference list of every package shipped with core Krayin, A–Z, with what each one owns.

## [\#](https://devdocs.krayincrm.com/2.2/architecture/\#quick-links) Quick links

| You want to... | Go to |
| --- | --- |
| Understand the big picture | [Overview — Core Architecture Principles](https://devdocs.krayincrm.com/2.2/architecture/overview.html#core-architecture-principles) |
| Know which package owns a feature | [Packages](https://devdocs.krayincrm.com/2.2/architecture/packages.html) |
| See how blade components work | [Overview — Component-Based Admin UI](https://devdocs.krayincrm.com/2.2/architecture/overview.html#component-based-admin-ui) · [Blade Components guide](https://devdocs.krayincrm.com/2.2/packages/blade-components.html) |
| Wire your own package into the same patterns | [Package Development](https://devdocs.krayincrm.com/2.2/packages/create-package.html) |
| Extend or replace something in core | [Override a Layout](https://devdocs.krayincrm.com/2.2/digging-deeper/override-a-layout.html) |

## [\#](https://devdocs.krayincrm.com/2.2/architecture/\#mental-model) Mental model

If you remember nothing else from this section, remember this:

| Layer | Pattern | Where |
| --- | --- | --- |
| **Routing** | Standard Laravel routes, scoped per package, prefixed with `config('app.admin_url')`. | `packages/Webkul/<Name>/src/Routes/admin-routes.php` |
| **Controllers** | Thin — inject a repository, call it, return a view or DataGrid. | `Http/Controllers/Admin/` |
| **Data access** | Prettus Repository (`Webkul\Core\Eloquent\Repository`) — never raw queries in controllers. | `Repositories/` |
| **Models** | Three-part Concord: Contract + Eloquent class + Proxy. | `Contracts/`, `Models/` |
| **UI** | Blade Components from the Admin package (`<x-admin::layouts>`, `<x-admin::datagrid>`, ...). | `Resources/views/` |
| **Side effects** | `Event::dispatch('<entity>.<action>.{before,after}', ...)` around every write. Listeners subscribe in an `EventServiceProvider`. | `Providers/EventServiceProvider.php` |

Build a new feature inside that grid and every other Krayin package will recognise the shape.

←
[AI Context Files](https://devdocs.krayincrm.com/2.2/introduction/ai-context.html)[Overview](https://devdocs.krayincrm.com/2.2/architecture/overview.html)
→


![](https://fonts.gstatic.com/s/i/productlogos/translate/v14/24px.svg)

Original text

Rate this translation

Your feedback will be used to help improve Google Translate
