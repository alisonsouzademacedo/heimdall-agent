<!-- source: https://devdocs.krayincrm.com/2.2/packages/create-acl.html -->
This is the documentation for the current version 2.2 of Krayin. Stay informed and make the most of Krayin's capabilities.

# [\#](https://devdocs.krayincrm.com/2.2/packages/create-acl.html\#access-control-list) Access Control List

ACL is how Krayin gates admin features by role. Each permission node is declared in a small PHP config file inside your package and merged into the core `acl` config from your service provider — from then on, Krayin shows the matching checkboxes on the role-edit screen and your code can ask `bouncer()->hasPermission('your.key')` to gate UI or routes.

This page picks up from [Admin Menu](https://devdocs.krayincrm.com/2.2/packages/add-menu-in-admin.html) — you'll usually add an ACL entry for every menu entry, so admins can hide things from users who shouldn't see them.

## [\#](https://devdocs.krayincrm.com/2.2/packages/create-acl.html\#create-the-acl-config-file) 📁 Create the ACL config file

Inside your package's `Config/` folder (the same one that holds [`menu.php`](https://devdocs.krayincrm.com/2.2/packages/add-menu-in-admin.html)), add `acl.php`:

```text
packages
└── Webkul
    └── Example
        └── src
            ├── ...
            └── Config
                ├── acl.php
                └── menu.php
```

### [\#](https://devdocs.krayincrm.com/2.2/packages/create-acl.html\#permission-entry-schema) Permission entry schema

Each array element describes a single permission:

| Key | Required | Purpose |
| --- | --- | --- |
| `key` | yes | Unique identifier. Use dot-notation to nest (`examples.create`, `examples.delete`). |
| `name` | yes | Translation key for the label shown on the role-edit screen. |
| `route` | yes | The named route this permission protects. |
| `sort` | no | Display order on the role-edit screen. |

### [\#](https://devdocs.krayincrm.com/2.2/packages/create-acl.html\#example) Example

```php
<?php

return [\
    [\
        'key' => 'examples',\
        'name' => 'example::app.acl.examples',\
        'route' => 'admin.examples.index',\
        'sort' => 2,\
    ],\
    [\
        'key' => 'examples.create',\
        'name' => 'example::app.acl.create',\
        'route' => 'admin.examples.create',\
        'sort' => 1,\
    ],\
    [\
        'key' => 'examples.delete',\
        'name' => 'example::app.acl.delete',\
        'route' => 'admin.examples.destroy',\
        'sort' => 3,\
    ],\
];
```

A top-level entry (`examples`) acts as the group; the dotted child entries (`examples.create`, `examples.delete`) become sub-permissions under it.

## [\#](https://devdocs.krayincrm.com/2.2/packages/create-acl.html\#merge-the-config-into-the-service-provider) ⚙️ Merge the config into the service provider

Add a `mergeConfigFrom()` call inside `register()`:

```php
<?php

namespace Webkul\Example\Providers;

use Illuminate\Support\ServiceProvider;

class ExampleServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        $this->mergeConfigFrom(
            dirname(__DIR__) . '/Config/acl.php',
            'acl',
        );
    }
}
```

Same rule as the [menu config](https://devdocs.krayincrm.com/2.2/packages/add-menu-in-admin.html#merge-the-config-into-the-service-provider) — `mergeConfigFrom()` belongs in `register()`, not `boot()`.

## [\#](https://devdocs.krayincrm.com/2.2/packages/create-acl.html\#clear-cached-config) ⌨️ Clear cached config

```bash
php artisan optimize:clear
```

## [\#](https://devdocs.krayincrm.com/2.2/packages/create-acl.html\#gate-code-with-bouncer) 🛡️ Gate code with `bouncer()`

Once your permissions are registered, use the `bouncer()` helper anywhere in your package to check them:

### [\#](https://devdocs.krayincrm.com/2.2/packages/create-acl.html\#in-a-controller) In a controller

```php
public function destroy(int $id)
{
    if (! bouncer()->hasPermission('examples.delete')) {
        abort(401, trans('admin::app.unauthorized'));
    }

    $this->exampleRepository->delete($id);

    return response()->json([\
        'message' => trans('example::app.examples.delete-success'),\
    ]);
}
```

### [\#](https://devdocs.krayincrm.com/2.2/packages/create-acl.html\#in-a-blade-view) In a Blade view

Wrap UI in a permission check so unauthorised users don't see (or click) actions they can't perform:

```text
@if (bouncer()->hasPermission('examples.create'))
    <a href="{{ route('admin.examples.create') }}" class="primary-button">
        @lang('example::app.examples.create-btn')
    </a>
@endif
```

## [\#](https://devdocs.krayincrm.com/2.2/packages/create-acl.html\#verify) 🧪 Verify

1. Open **Settings → Roles** in the admin and edit any role — the new permissions should be listed under your group.
2. Sign in as a user assigned to a role _without_`examples.delete`. The Delete action should be hidden in the UI; if they try to call the route directly, they should get a 401.

If permissions don't appear on the role-edit screen, re-run `php artisan optimize:clear` and confirm `mergeConfigFrom()` is in `register()`.

## [\#](https://devdocs.krayincrm.com/2.2/packages/create-acl.html\#next-steps) 📝 Next steps

- [Localization](https://devdocs.krayincrm.com/2.2/packages/localization.html) — add the translation keys referenced by `name` in your `acl.php` entries.
- [Blade Components](https://devdocs.krayincrm.com/2.2/packages/blade-components.html) — reusable UI primitives that already respect permission checks where relevant.

←
[Blade Components](https://devdocs.krayincrm.com/2.2/packages/blade-components.html)[Models](https://devdocs.krayincrm.com/2.2/packages/create-models.html)
→
