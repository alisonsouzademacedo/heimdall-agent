<!-- source: https://devdocs.krayincrm.com/2.2/packages/views.html -->
This is the documentation for the current version 2.2 of Krayin. Stay informed and make the most of Krayin's capabilities.

# [\#](https://devdocs.krayincrm.com/2.2/packages/views.html\#views) Views

Views are the Blade templates your [controller](https://devdocs.krayincrm.com/2.2/packages/controllers.html) returns. Each Krayin package owns its own view folder and registers a **view namespace** so callers can reference them with `package::path.to.view`.

For Blade-specific syntax, see the [Laravel views(opens new window)](https://laravel.com/docs/11.x/views) and [Blade docs(opens new window)](https://laravel.com/docs/11.x/blade).

## [\#](https://devdocs.krayincrm.com/2.2/packages/views.html\#create-the-views-folder) 📁 Create the views folder

By convention each package's templates live under `src/Resources/views/`, with one folder per Blade group:

```text
packages
└── Webkul
    └── Example
        └── src
            ├── ...
            └── Resources
                └── views
                    └── admin
                        ├── index.blade.php
                        ├── create.blade.php
                        └── edit.blade.php
```

### [\#](https://devdocs.krayincrm.com/2.2/packages/views.html\#standard-blade-files) Standard Blade files

Krayin uses a consistent naming convention for CRUD pages:

| File | Used for | Controller action |
| --- | --- | --- |
| `index.blade.php` | List view (with [DataGrid](https://devdocs.krayincrm.com/2.2/packages/datagrid.html)) | `index()` |
| `create.blade.php` | Create form | `create()` |
| `edit.blade.php` | Edit form | `edit()` |
| `show.blade.php` | Detail view (optional) | `show()` |

## [\#](https://devdocs.krayincrm.com/2.2/packages/views.html\#write-a-basic-template) 🧱 Write a basic template

Wrap your content in the shared admin [layout component](https://devdocs.krayincrm.com/2.2/packages/layouts.html) so it picks up the sidebar, header, and theming for free:

```text
<x-admin::layouts>
    <x-slot:title>
        @lang('example::app.examples.index.title')
    </x-slot>

    <div class="flex justify-between items-center max-sm:flex-wrap gap-4">
        <p class="text-xl font-bold dark:text-white">
            @lang('example::app.examples.index.title')
        </p>
    </div>

    {{-- Page content goes here --}}
</x-admin::layouts>
```

Common pieces — `<x-admin::layouts>`, breadcrumbs, datagrid, buttons — are documented in the [Blade Components guide](https://devdocs.krayincrm.com/2.2/packages/blade-components.html).

## [\#](https://devdocs.krayincrm.com/2.2/packages/views.html\#register-the-views-with-the-service-provider) ⚙️ Register the views with the service provider

The view namespace is what lets you write `view('example::admin.index')`. Register it in `boot()`:

```php
<?php

namespace Webkul\Example\Providers;

use Illuminate\Support\ServiceProvider;

class ExampleServiceProvider extends ServiceProvider
{
    public function boot(): void
    {
        $this->loadViewsFrom(__DIR__ . '/../Resources/views', 'example');
    }
}
```

`loadViewsFrom()` takes the absolute path to the views folder and a short namespace (`'example'`). After this, anywhere in the app can render your templates with the `example::` prefix.

## [\#](https://devdocs.krayincrm.com/2.2/packages/views.html\#render-a-view-from-a-controller) 🔌 Render a view from a controller

The `view()` helper takes the namespaced view name and an optional data array:

```php
public function index()
{
    $examples = $this->exampleRepository->with('children')->all();

    return view('example::admin.index', compact('examples'));
}
```

The variables passed in via `compact()` (or as a plain array) become available inside the Blade template as `$examples`, etc.

## [\#](https://devdocs.krayincrm.com/2.2/packages/views.html\#verify) 🧪 Verify

Visit the route from your browser:

```text
http://your-krayin.local/admin/examples
```

You should see the rendered template. If you get a `View [example::admin.index] not found.` error, check:

1. The view file actually exists at the path Laravel is looking at.
2. `loadViewsFrom()` is in the service provider's `boot()` method, not `register()`.
3. Run `php artisan view:clear` to drop any cached compiled views.

## [\#](https://devdocs.krayincrm.com/2.2/packages/views.html\#next-steps) 📝 Next steps

- [Layouts](https://devdocs.krayincrm.com/2.2/packages/layouts.html) — the shared `<x-admin::layouts>` wrapper used above.
- [Blade Components](https://devdocs.krayincrm.com/2.2/packages/blade-components.html) — full list of reusable admin UI primitives (breadcrumbs, datagrid, modals, etc.).
- [Localization](https://devdocs.krayincrm.com/2.2/packages/localization.html) — replace hard-coded strings with `@lang('example::app.…')` keys.

←
[Validation](https://devdocs.krayincrm.com/2.2/packages/validation.html)[Digging Deeper](https://devdocs.krayincrm.com/2.2/digging-deeper)
→
