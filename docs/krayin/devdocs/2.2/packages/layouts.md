<!-- source: https://devdocs.krayincrm.com/2.2/packages/layouts.html -->
This is the documentation for the current version 2.2 of Krayin. Stay informed and make the most of Krayin's capabilities.

# [\#](https://devdocs.krayincrm.com/2.2/packages/layouts.html\#layouts) Layouts

The admin layout (`<x-admin::layouts>`) is the shared shell that wraps every page in the Krayin admin — sidebar, header, theming, dark-mode toggle, and the slots you use to plug in page-specific bits. This page shows how to wrap your package's [views](https://devdocs.krayincrm.com/2.2/packages/views.html) in it.

For Blade-specific syntax, see the [Laravel Blade docs(opens new window)](https://laravel.com/docs/11.x/blade).

## [\#](https://devdocs.krayincrm.com/2.2/packages/layouts.html\#wrap-a-view-in-the-admin-layout) 🧱 Wrap a view in the admin layout

Every admin Blade template should open with `<x-admin::layouts>` and close with `</x-admin::layouts>`. Anything between the tags becomes the page body:

```text
<x-admin::layouts>
    <x-slot:title>
        @lang('example::app.examples.index.title')
    </x-slot>

    @pushOnce('styles')
        <style>
            /* page-specific CSS */
        </style>
    @endPushOnce

    <div class="container">
        {{-- page content --}}
    </div>

    @pushOnce('scripts')
        <script>
            // page-specific JS
        </script>
    @endPushOnce
</x-admin::layouts>
```

### [\#](https://devdocs.krayincrm.com/2.2/packages/layouts.html\#what-each-piece-does) What each piece does

| Piece | Purpose |
| --- | --- |
| `<x-admin::layouts>` | The shared admin shell — sidebar, header, theme, slots. Wrap every admin page in this. |
| `<x-slot:title>` | Sets the `<title>` of the page and the in-page heading area. |
| `@pushOnce('styles')` | Inject a `<style>` block into the layout's `<head>`. The _Once_ variant ensures it's emitted only once even if the partial is included multiple times. |
| `@pushOnce('scripts')` | Inject a `<script>` block before `</body>`. Same dedup behaviour as `styles`. |

Always use translation keys

The example above pulls the title from `example::app.examples.index.title`. Hard-coded strings break multi-language sites. Add the matching key to your package's [language files](https://devdocs.krayincrm.com/2.2/packages/localization.html).

## [\#](https://devdocs.krayincrm.com/2.2/packages/layouts.html\#build-your-own-master-layout) 🛠️ Build your own master layout

If you need a layout that doesn't inherit from the admin shell — a print view, an embeddable iframe, a public webform — create one inside your package's `views/layouts/` folder:

```text
packages
└── Webkul
    └── Example
        └── src
            └── Resources
                └── views
                    └── layouts
                        └── master.blade.php
```

Then extend it from any view with `@extends('example::layouts.master')`. Make sure your service provider has called `loadViewsFrom(__DIR__ . '/../Resources/views', 'example')` — that's what registers the `example::` namespace ( [Views](https://devdocs.krayincrm.com/2.2/packages/views.html#wire-the-views-into-the-service-provider)).

## [\#](https://devdocs.krayincrm.com/2.2/packages/layouts.html\#verify) 🧪 Verify

Open any page in your package — the sidebar, header, and dark-mode toggle should render. If you see a bare page or a `Component [x-admin::layouts] not found` error, double-check that:

1. The Admin package is loaded (it's bundled with Krayin by default).
2. You ran `php artisan view:clear` after your last change.

## [\#](https://devdocs.krayincrm.com/2.2/packages/layouts.html\#next-steps) 📝 Next steps

- [Blade Components](https://devdocs.krayincrm.com/2.2/packages/blade-components.html) — the full library of reusable admin pieces (`<x-admin::breadcrumbs>`, `<x-admin::datagrid>`, `<x-admin::modal>`, …).
- [Assets](https://devdocs.krayincrm.com/2.2/packages/assets.html) — bundle your package's JS / CSS the right way instead of inlining `@pushOnce`.

←
[DataGrid](https://devdocs.krayincrm.com/2.2/packages/datagrid.html)[Localization](https://devdocs.krayincrm.com/2.2/packages/localization.html)
→


![](https://fonts.gstatic.com/s/i/productlogos/translate/v14/24px.svg)

Original text

Rate this translation

Your feedback will be used to help improve Google Translate
