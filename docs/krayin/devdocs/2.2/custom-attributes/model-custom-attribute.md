<!-- source: https://devdocs.krayincrm.com/2.2/custom-attributes/model-custom-attribute.html -->
This is the documentation for the current version 2.2 of Krayin. Stay informed and make the most of Krayin's capabilities.

# [\#](https://devdocs.krayincrm.com/2.2/custom-attributes/model-custom-attribute.html\#make-a-model-use-custom-attributes) Make a Model Use Custom Attributes

The admin-defined attributes covered in [Create and Use an Attribute](https://devdocs.krayincrm.com/2.2/custom-attributes/custom-attribute.html) only work against entities Krayin knows about — Leads, Persons, Organizations, Products, Quotes, Warehouses. If your package introduces a new entity (say, `Example`) and you want admins to attach custom attributes to _it_, you need to wire that entity into the attribute system.

This page walks through that wiring: register the entity, use the `CustomAttribute` trait on the model, and persist attribute values from the repository.

For background on packages, see [Create a Package](https://devdocs.krayincrm.com/2.2/packages/create-package.html). For the admin flow that creates the attributes themselves, see [Create and Use an Attribute](https://devdocs.krayincrm.com/2.2/custom-attributes/custom-attribute.html).

## [\#](https://devdocs.krayincrm.com/2.2/custom-attributes/model-custom-attribute.html\#what-you-ll-set-up) 🧩 What you'll set up

| Piece | Purpose |
| --- | --- |
| **`attribute_entity_types.php` config** | Tells Krayin "here's a new entity type that can have attributes". |
| **`CustomAttribute` trait on the model** | Adds the attribute-value relationships and helpers to the Eloquent model. |
| **Repository hook into `AttributeValueRepository`** | Saves attribute values whenever the entity is created or updated. |

Once these three are in place, your entity shows up as an option in the _Entity Type_ dropdown on the attribute create form, and any attribute admins add against it is persisted automatically.

## [\#](https://devdocs.krayincrm.com/2.2/custom-attributes/model-custom-attribute.html\#register-the-entity-type) 🗂️ 1\. Register the entity type

Create a config file in your package telling Krayin about the new entity.

```text
packages/Webkul/Example/src/Config/attribute_entity_types.php
```

```php
<?php

return [\
    'examples' => [\
        'name' => 'Examples',\
        'repository' => 'Webkul\Example\Repositories\ExampleRepository',\
    ],\
];
```

| Key | Purpose |
| --- | --- |
| Outer key (`examples`) | Internal identifier for the entity type. |
| `name` | Label shown in the admin's _Entity Type_ dropdown. |
| `repository` | Fully-qualified repository class — Krayin uses it to look up records by ID. |

## [\#](https://devdocs.krayincrm.com/2.2/custom-attributes/model-custom-attribute.html\#merge-the-config-in-your-service-provider) ⚙️ 2\. Merge the config in your service provider

In your package's main service provider, merge this file into Krayin's `attribute_entity_types` config bag.

```php
public function register(): void
{
    $this->mergeConfigFrom(
        dirname(__DIR__) . '/Config/attribute_entity_types.php',
        'attribute_entity_types',
    );
}
```

After this fires, `config('attribute_entity_types')` includes your `examples` entry alongside Krayin's built-in entries.

## [\#](https://devdocs.krayincrm.com/2.2/custom-attributes/model-custom-attribute.html\#add-the-customattribute-trait-to-your-model) 🧱 3\. Add the `CustomAttribute` trait to your model

The trait gives your model the relationships and helpers (`attribute_values`, accessor magic, etc.) that the rest of the attribute system depends on.

```php
<?php

namespace Webkul\Example\Models;

use Illuminate\Database\Eloquent\Model;
use Webkul\Attribute\Traits\CustomAttribute;
use Webkul\Example\Contracts\Example as ExampleContract;

class Example extends Model implements ExampleContract
{
    use CustomAttribute;

    protected $fillable = [\
        'name',\
        'slug',\
        'description',\
    ];
}
```

The `$fillable` list only covers the model's _native_ columns — custom-attribute values live in a separate table and are written through the repository (next step).

## [\#](https://devdocs.krayincrm.com/2.2/custom-attributes/model-custom-attribute.html\#persist-attribute-values-from-the-repository) 🔌 4\. Persist attribute values from the repository

Krayin ships an `AttributeValueRepository` whose `save($data, $entityId)` method writes attribute values for an entity. Call it from your repository's `create()` and `update()` so admin-defined attributes are saved alongside the entity itself.

```php
<?php

namespace Webkul\Example\Repositories;

use Webkul\Attribute\Repositories\AttributeValueRepository;
use Webkul\Core\Eloquent\Repository;

class ExampleRepository extends Repository
{
    public function __construct(
        protected AttributeValueRepository $attributeValueRepository,
        \Illuminate\Container\Container $app,
    ) {
        parent::__construct($app);
    }

    public function model(): string
    {
        return 'Webkul\Example\Contracts\Example';
    }

    public function create(array $data)
    {
        $example = parent::create($data);

        $this->attributeValueRepository->save($data, $example->id);

        return $example;
    }

    public function update(array $data, $id, $attribute = 'id')
    {
        $example = parent::update($data, $id);

        $this->attributeValueRepository->save($data, $id);

        return $example;
    }
}
```

The exact same call — `$this->attributeValueRepository->save($data, $id)` — covers both new records and updates; the repository figures out which attribute values to insert vs. update internally.

## [\#](https://devdocs.krayincrm.com/2.2/custom-attributes/model-custom-attribute.html\#verify) 🧪 5\. Verify

1. Run `php artisan optimize:clear` to flush the config cache.
2. Open the admin, go to **Settings → Attributes → Create Attribute**.
3. Open the **Entity Type** dropdown — _Examples_ should now be one of the options.
4. Create a text attribute against _Examples_ (e.g. `industry`).
5. Open your entity's create form, fill the new field, save.
6. Re-open the record — the value should persist.

If _Examples_ doesn't appear in the dropdown, the most likely cause is the config not being merged. Confirm:

```bash
php artisan tinker
>>> config('attribute_entity_types')
```

You should see your `examples` key alongside Krayin's built-in entries.

## [\#](https://devdocs.krayincrm.com/2.2/custom-attributes/model-custom-attribute.html\#next-steps) 📝 Next steps

- [Create and Use an Attribute](https://devdocs.krayincrm.com/2.2/custom-attributes/custom-attribute.html) — the admin flow for creating the attributes that this wiring enables.
- [Repository](https://devdocs.krayincrm.com/2.2/packages/store-data-through-repositories.html) — deeper coverage of Krayin's repository pattern, useful when extending `ExampleRepository` further.
- [Events Listeners](https://devdocs.krayincrm.com/2.2/digging-deeper/events.html) — hook `settings.attribute.create.after` to react when admins add new attributes for your entity.

←
[How to use custom attribute](https://devdocs.krayincrm.com/2.2/custom-attributes/custom-attribute.html)[Krayin APIs](https://devdocs.krayincrm.com/2.2/api)
→


![](https://fonts.gstatic.com/s/i/productlogos/translate/v14/24px.svg)

Original text

Rate this translation

Your feedback will be used to help improve Google Translate
