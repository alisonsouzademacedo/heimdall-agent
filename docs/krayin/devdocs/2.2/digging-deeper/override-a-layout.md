<!-- source: https://devdocs.krayincrm.com/2.2/digging-deeper/override-a-layout.html -->
This is the documentation for the current version 2.2 of Krayin. Stay informed and make the most of Krayin's capabilities.

# [\#](https://devdocs.krayincrm.com/2.2/digging-deeper/override-a-layout.html\#override-a-layout) Override a Layout

Krayin's modular architecture lets your package replace core controllers, models, and Blade views without modifying core code. For smaller changes — injecting a snippet into an existing page — use the _view render event_ system instead of a full override.

This page covers all four mechanisms:

| Mechanism | When to use |
| --- | --- |
| **Override a controller** | You need to change how an existing route handles a request. |
| **Override a model** | You're adding fields, relationships, or business logic to a core model. |
| **Override a Blade view** | You're restyling or restructuring a whole page. |
| **View render events** | You only need to inject a small snippet into a page. |

Before any of these, make sure your package is set up — see [Create a Package](https://devdocs.krayincrm.com/2.2/packages/create-package.html).

## [\#](https://devdocs.krayincrm.com/2.2/digging-deeper/override-a-layout.html\#override-a-controller) 🛠️ Override a controller

Use this when a core controller method's logic needs to change — e.g. you want to add a validation rule, fire an extra event, or change the redirect target.

### [\#](https://devdocs.krayincrm.com/2.2/digging-deeper/override-a-layout.html\#create-the-custom-controller) 1\. Create the custom controller

Extend the core controller and override just the method you care about. Everything else stays inherited.

```text
packages/Webkul/Example/src/Http/Controllers/Product/ProductController.php
```

```php
<?php

namespace Webkul\Example\Http\Controllers\Product;

use Illuminate\Support\Facades\Event;
use Webkul\Admin\Http\Controllers\Products\ProductController as BaseProductController;
use Webkul\Product\Http\Requests\AttributeForm;

class ProductController extends BaseProductController
{
    public function store(AttributeForm $request)
    {
        Event::dispatch('product.create.before');

        $product = $this->productRepository->create($request->all());

        Event::dispatch('product.create.after', $product);

        session()->flash('success', trans('admin::app.products.index.create-success'));

        return redirect()->route('admin.products.index');
    }
}
```

### [\#](https://devdocs.krayincrm.com/2.2/digging-deeper/override-a-layout.html\#bind-it-in-the-service-provider) 2\. Bind it in the service provider

In your package's main service provider, bind the base controller to your custom one. Laravel's container will then resolve your version everywhere the base is requested.

```php
<?php

namespace Webkul\Example\Providers;

use Illuminate\Support\ServiceProvider;
use Webkul\Admin\Http\Controllers\Products\ProductController as BaseProductController;
use Webkul\Example\Http\Controllers\Product\ProductController;

class ExampleServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        $this->app->bind(
            BaseProductController::class,
            ProductController::class,
        );
    }
}
```

That's it — the existing route definitions still point at `BaseProductController`, but the container resolves _your_ class.

## [\#](https://devdocs.krayincrm.com/2.2/digging-deeper/override-a-layout.html\#override-a-model) 🧱 Override a model

Use this when you need to:

- Add or modify database columns (paired with a migration).
- Add custom relationships, accessors, or mutators.
- Change `$fillable`, `$casts`, or other Eloquent properties.
- Add business logic that the rest of Krayin will inherit automatically.

Krayin uses **Concord** to register models against **Contracts** (interfaces). Bind a different class against the contract and every `app(Contract::class)` resolution — including inside core repositories — returns your class.

### [\#](https://devdocs.krayincrm.com/2.2/digging-deeper/override-a-layout.html\#create-your-model) 1\. Create your model

Extend the core model so you inherit its table, relationships, and behavior, then layer on what's new.

```php
<?php

namespace Webkul\Example\Models;

use Webkul\Lead\Models\Product as BaseProduct;

class Product extends BaseProduct
{
    protected $fillable = [\
        'name',\
        'description',\
        'type',\
        'status',\
        'custom_field',\
    ];
}
```

### [\#](https://devdocs.krayincrm.com/2.2/digging-deeper/override-a-layout.html\#register-it-against-the-contract) 2\. Register it against the contract

In your service provider's `boot()`, swap the contract binding:

```php
<?php

namespace Webkul\Example\Providers;

use Illuminate\Support\ServiceProvider;
use Webkul\Example\Models\Product;
use Webkul\Lead\Contracts\Product as ProductContract;

class ExampleServiceProvider extends ServiceProvider
{
    public function boot(): void
    {
        $this->app->concord->registerModel(ProductContract::class, Product::class);
    }
}
```

ModuleServiceProvider works too

You can also register the override in your package's `ModuleServiceProvider` — whichever provider you prefer to keep model wiring in. Just make sure the provider itself is registered in `bootstrap/providers.php`.

After this, every `app(ProductContract::class)` (and every core repository that resolves the contract) returns _your_`Product` class — without you touching any core file.

## [\#](https://devdocs.krayincrm.com/2.2/digging-deeper/override-a-layout.html\#override-a-blade-view) 🎨 Override a Blade view

Use this when you want to restyle or restructure a whole page — not just inject a snippet.

The mechanism is Laravel's standard view publishing — your package ships an alternate copy of a core blade file, and once published, Laravel resolves your copy instead of the core one.

### [\#](https://devdocs.krayincrm.com/2.2/digging-deeper/override-a-layout.html\#example-override-quotes-create-blade-php) Example: override `quotes/create.blade.php`

Suppose you want to override:

```text
packages/Webkul/Admin/src/Resources/views/quotes/create.blade.php
```

### [\#](https://devdocs.krayincrm.com/2.2/digging-deeper/override-a-layout.html\#create-your-replacement-view) 1\. Create your replacement view

Keep the same path under `views/` so the publish mapping is one-to-one.

```text
packages/Webkul/Example/src/Resources/views/quotes/create.blade.php
```

Put whatever Blade you want in there — it can copy and tweak the original, or be a complete rewrite.

### [\#](https://devdocs.krayincrm.com/2.2/digging-deeper/override-a-layout.html\#register-a-publish-path) 2\. Register a publish path

In your service provider, map your file to Laravel's vendor-override location (`resources/views/vendor/admin/...`):

```php
<?php

namespace Webkul\Example\Providers;

use Illuminate\Support\ServiceProvider;

class ExampleServiceProvider extends ServiceProvider
{
    public function boot(): void
    {
        $this->publishes([\
            __DIR__ . '/../Resources/views/quotes/create.blade.php' =>\
                resource_path('views/vendor/admin/quotes/create.blade.php'),\
        ]);
    }
}
```

### [\#](https://devdocs.krayincrm.com/2.2/digging-deeper/override-a-layout.html\#publish) 3\. Publish

Run the vendor publisher and pick your package's provider when prompted:

```bash
php artisan vendor:publish
```

Select `Webkul\Example\Providers\ExampleServiceProvider`. Laravel copies the file into `resources/views/vendor/admin/quotes/create.blade.php` — and from now on, that's the file rendered for the Quotes create page.

Edit the published file, not the package file

After publishing, _the file in `resources/views/vendor/admin/...` is the one Laravel actually loads_. Edit it directly. The package copy is just the source for the initial publish.

## [\#](https://devdocs.krayincrm.com/2.2/digging-deeper/override-a-layout.html\#use-view-render-events) 🪄 Use view render events

Use this when you only need to inject a small snippet — a button, a badge, an extra field — instead of forking the whole view.

Krayin sprinkles `view_render_event(...)` calls throughout core blades. Listen for one of those events, push a Blade template into it, and your snippet renders inline.

### [\#](https://devdocs.krayincrm.com/2.2/digging-deeper/override-a-layout.html\#how-a-render-event-looks-in-core-blade) How a render event looks in core blade

```text
<div class="flex items-center gap-x-2.5">
    {!! view_render_event('admin.contacts.quotes.create.save_button.before') !!}

    <button type="submit" class="primary-button">
        @lang('admin::app.quotes.create.save-btn')
    </button>

    {!! view_render_event('admin.contacts.quotes.create.save_button.after') !!}
</div>
```

The helper fires the event `admin.contacts.quotes.create.save_button.before` (and `.after`) and renders any templates listeners push into it.

### [\#](https://devdocs.krayincrm.com/2.2/digging-deeper/override-a-layout.html\#add-an-eventserviceprovider) 1\. Add an `EventServiceProvider`

```text
packages/Webkul/Example/src/Providers/EventServiceProvider.php
```

```php
<?php

namespace Webkul\Example\Providers;

use Illuminate\Support\Facades\Event;
use Illuminate\Support\ServiceProvider;

class EventServiceProvider extends ServiceProvider
{
    public function boot(): void
    {
        Event::listen('admin.contacts.quotes.create.save_button.before', function ($viewRenderEventManager) {
            $viewRenderEventManager->addTemplate('example::quotes.extra-button');
        });
    }
}
```

`addTemplate(...)` takes a Blade view path — the contents are rendered exactly where the event fired in the parent view.

### [\#](https://devdocs.krayincrm.com/2.2/digging-deeper/override-a-layout.html\#register-the-event-provider) 2\. Register the event provider

In your main service provider, register the event provider so it boots:

```php
<?php

namespace Webkul\Example\Providers;

use Illuminate\Support\ServiceProvider;

class ExampleServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        $this->app->register(EventServiceProvider::class);
    }
}
```

Now every time the core Quotes create page renders, your snippet appears next to the Save button — without you owning the whole blade file.

## [\#](https://devdocs.krayincrm.com/2.2/digging-deeper/override-a-layout.html\#verify) 🧪 Verify

| Override type | How to verify |
| --- | --- |
| **Controller** | Trigger the route in the admin and confirm your overridden logic ran (a log line, a flash message, a new redirect target). |
| **Model** | `dd(get_class(app(\Webkul\Lead\Contracts\Product::class)))` — should print your custom class. |
| **Blade view** | Edit the published file in `resources/views/vendor/...` and refresh — your change should appear instantly. |
| **Render event** | Add the listener, refresh the page, and look for your snippet inline. If nothing renders, double-check the event name spelling. |

If a customisation doesn't take effect, clear caches first:

```bash
php artisan optimize:clear
```

## [\#](https://devdocs.krayincrm.com/2.2/digging-deeper/override-a-layout.html\#next-steps) 📝 Next steps

- [Events Listeners](https://devdocs.krayincrm.com/2.2/digging-deeper/events.html) — the same listener mechanism, used for business events instead of view render events.
- [Helpers](https://devdocs.krayincrm.com/2.2/digging-deeper/helpers.html) — helper functions you'll often call from inside overridden controllers and views.

←
[Notifications](https://devdocs.krayincrm.com/2.2/digging-deeper/notifications.html)[Quick Add](https://devdocs.krayincrm.com/2.2/digging-deeper/quick-add.html)
→


![](https://fonts.gstatic.com/s/i/productlogos/translate/v14/24px.svg)

Original text

Rate this translation

Your feedback will be used to help improve Google Translate
