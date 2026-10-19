<!-- source: https://devdocs.krayincrm.com/2.2/packages -->
This is the documentation for the current version 2.2 of Krayin. Stay informed and make the most of Krayin's capabilities.

# [\#](https://devdocs.krayincrm.com/2.2/packages/\#package-development) Package Development

A **package** is a self-contained Laravel module that adds functionality to Krayin without touching the core. Every built-in Krayin feature ships as a package (see [Packages](https://devdocs.krayincrm.com/2.2/architecture/packages.html)), and your own customisations should too — that's what keeps upgrades painless and code shareable across projects.

This section is the build-it-yourself guide — each page covers one slice of a package (routes, controllers, repositories, ...). Follow them in order and you'll have a working CRUD package by the time you reach the end.

## [\#](https://devdocs.krayincrm.com/2.2/packages/\#what-s-in-this-section) What's in this section

- [Getting Started](https://devdocs.krayincrm.com/2.2/packages/create-package.html) — scaffold a package called **Example**, register its service provider, dump the autoloader.
- [Admin Menu](https://devdocs.krayincrm.com/2.2/packages/add-menu-in-admin.html) — add a sidebar entry via `config/admin-menu.php`.
- [Assets](https://devdocs.krayincrm.com/2.2/packages/assets.html) — per-package Vite, Tailwind, PostCSS, HMR + production builds.
- [Blade Components](https://devdocs.krayincrm.com/2.2/packages/blade-components.html) — reusable admin UI primitives (`<x-admin::layouts>`, `<x-admin::datagrid>`, ...).
- [Access Control List](https://devdocs.krayincrm.com/2.2/packages/create-acl.html) — permission entries gated with `bouncer()->can()`.
- [Models](https://devdocs.krayincrm.com/2.2/packages/create-models.html) — the three-part Concord pattern: Contract, Model, Proxy.
- [Migrations](https://devdocs.krayincrm.com/2.2/packages/create-migrations.html) — database schema for your package.
- [Controllers](https://devdocs.krayincrm.com/2.2/packages/controllers.html) — admin / shop split, repository injection, view returns.
- [DataGrid](https://devdocs.krayincrm.com/2.2/packages/datagrid.html) — paginated, filterable, sortable list views.
- [Layouts](https://devdocs.krayincrm.com/2.2/packages/layouts.html) — extending or overriding the admin layout.
- [Localization](https://devdocs.krayincrm.com/2.2/packages/localization.html) — multi-language strings via `Resources/lang/<locale>/app.php`.
- [Routes](https://devdocs.krayincrm.com/2.2/packages/routes.html) — admin route registration with `admin` middleware.
- [Repository](https://devdocs.krayincrm.com/2.2/packages/store-data-through-repositories.html) — Prettus-based data-access layer.
- [Validation](https://devdocs.krayincrm.com/2.2/packages/validation.html) — Form Request classes for input validation.
- [Views](https://devdocs.krayincrm.com/2.2/packages/views.html) — Blade templates under `Resources/views/` with a namespace.

## [\#](https://devdocs.krayincrm.com/2.2/packages/\#quick-links) Quick links

| You want to... | Go to |
| --- | --- |
| Create your first package | [Getting Started](https://devdocs.krayincrm.com/2.2/packages/create-package.html) |
| Add a CRUD list view | [DataGrid](https://devdocs.krayincrm.com/2.2/packages/datagrid.html) |
| Add a sidebar entry | [Admin Menu](https://devdocs.krayincrm.com/2.2/packages/add-menu-in-admin.html) |
| Lock a route behind a permission | [Access Control List](https://devdocs.krayincrm.com/2.2/packages/create-acl.html) |
| Ship CSS / JS with your package | [Assets](https://devdocs.krayincrm.com/2.2/packages/assets.html) |
| Override an existing core file | [Override a Layout](https://devdocs.krayincrm.com/2.2/digging-deeper/override-a-layout.html) |

## [\#](https://devdocs.krayincrm.com/2.2/packages/\#build-from-scratch-order) Build-from-scratch order

Each page assumes the previous one is done. Follow this order for a complete walkthrough:

01. [Getting Started](https://devdocs.krayincrm.com/2.2/packages/create-package.html) — scaffold the package and register its service provider.
02. [Routes](https://devdocs.krayincrm.com/2.2/packages/routes.html) — wire admin URLs.
03. [Migrations](https://devdocs.krayincrm.com/2.2/packages/create-migrations.html) — define the database schema.
04. [Models](https://devdocs.krayincrm.com/2.2/packages/create-models.html) — Eloquent model + contract + Concord proxy.
05. [Repository](https://devdocs.krayincrm.com/2.2/packages/store-data-through-repositories.html) — data-access layer.
06. [Controllers](https://devdocs.krayincrm.com/2.2/packages/controllers.html) — handle requests, talk to repositories.
07. [Views](https://devdocs.krayincrm.com/2.2/packages/views.html) and [Layouts](https://devdocs.krayincrm.com/2.2/packages/layouts.html) — Blade templates wrapped in the admin shell.
08. [Validation](https://devdocs.krayincrm.com/2.2/packages/validation.html) — form-request rules.
09. [Admin Menu](https://devdocs.krayincrm.com/2.2/packages/add-menu-in-admin.html) — surface the package in the sidebar.
10. [Access Control List](https://devdocs.krayincrm.com/2.2/packages/create-acl.html) — gate routes by permission.
11. [Localization](https://devdocs.krayincrm.com/2.2/packages/localization.html) — translation files.
12. [Assets](https://devdocs.krayincrm.com/2.2/packages/assets.html) — JS / CSS bundling with Vite.
13. [DataGrid](https://devdocs.krayincrm.com/2.2/packages/datagrid.html) — sortable / filterable / paginated list views.
14. [Blade Components](https://devdocs.krayincrm.com/2.2/packages/blade-components.html) — reusable admin UI primitives.

## [\#](https://devdocs.krayincrm.com/2.2/packages/\#standard-package-layout) Standard package layout

Every Krayin package follows the same folder structure, so once you know one you know them all. Reference tree for a package called **Example**:

```text
packages
└── Webkul
    └── Example
        └── src
            ├── Config
            │   ├── acl.php
            │   ├── admin-menu.php
            │   └── system.php
            ├── Console
            │   └── Commands
            ├── Contracts
            │   └── Example.php
            ├── Database
            │   ├── Migrations
            │   │   └── 2023_04_21_173057_create_examples_table.php
            │   └── Seeders
            ├── DataGrids
            │   └── Admin
            │       └── ExampleDataGrid.php
            ├── Events
            ├── Http
            │   ├── Controllers
            │   │   └── Admin
            │   │       └── ExampleController.php
            │   ├── Middleware
            │   └── Requests
            │       └── ExampleRequest.php
            ├── Listeners
            ├── Mail
            ├── Models
            │   ├── Example.php
            │   └── ExampleProxy.php
            ├── Providers
            │   ├── ExampleServiceProvider.php
            │   ├── ModuleServiceProvider.php
            │   └── EventServiceProvider.php
            ├── Repositories
            │   └── ExampleRepository.php
            ├── Routes
            │   └── admin-routes.php
            └── Resources
                ├── assets
                │   ├── css/app.css
                │   ├── js/app.js
                │   └── images
                ├── lang
                │   └── en
                │       └── app.php
                └── views
                    ├── admin
                    │   └── examples
                    │       ├── index.blade.php
                    │       ├── create.blade.php
                    │       └── edit.blade.php
                    └── components
```

←
[Packages](https://devdocs.krayincrm.com/2.2/architecture/packages.html)[Getting Started](https://devdocs.krayincrm.com/2.2/packages/create-package.html)
→


![](https://fonts.gstatic.com/s/i/productlogos/translate/v14/24px.svg)

Original text

Rate this translation

Your feedback will be used to help improve Google Translate
