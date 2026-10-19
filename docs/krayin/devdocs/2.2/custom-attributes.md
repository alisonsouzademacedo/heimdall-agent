<!-- source: https://devdocs.krayincrm.com/2.2/custom-attributes -->
This is the documentation for the current version 2.2 of Krayin. Stay informed and make the most of Krayin's capabilities.

# [\#](https://devdocs.krayincrm.com/2.2/custom-attributes/\#custom-attributes) Custom Attributes

Krayin is **attribute-driven**. The fields you see on a Lead, Person, Organization, Product, Quote, or Warehouse are not hard-coded — each one is an `Attribute` record an admin can create, edit, or delete without touching code.

This section covers both sides of the system: how admins add new fields, and how package developers register _their own_ entities so the attribute system can attach custom fields to them too.

## [\#](https://devdocs.krayincrm.com/2.2/custom-attributes/\#what-s-in-this-section) What's in this section

- [Create and Use an Attribute](https://devdocs.krayincrm.com/2.2/custom-attributes/custom-attribute.html) — the admin flow. Pick a type (text, textarea, price, boolean, date, datetime, email, phone, select, multiselect, lookup, image, file, address, or **subheading**), wire it to an entity, optionally mark it for the **Quick Add** modal, and arrange it inside an Attribute Group.
- [Make a Model Use Custom Attributes](https://devdocs.krayincrm.com/2.2/custom-attributes/model-custom-attribute.html) — the package-developer flow. Register your entity type via `Config/attribute_entity_types.php`, add the `CustomAttribute` trait, and persist values through `AttributeValueRepository::save($data, $id)`.

## [\#](https://devdocs.krayincrm.com/2.2/custom-attributes/\#quick-links) Quick links

| You want to... | Go to |
| --- | --- |
| Add a new field to Leads / Persons / etc. | [Create and Use an Attribute](https://devdocs.krayincrm.com/2.2/custom-attributes/custom-attribute.html) |
| Make a field appear in the Quick Add modal | [Quick Add](https://devdocs.krayincrm.com/2.2/custom-attributes/custom-attribute.html#quick-add) |
| Group fields visually on a form | [Subheading](https://devdocs.krayincrm.com/2.2/custom-attributes/custom-attribute.html#-subheading) |
| Let your own entity have custom attributes | [Make a Model Use Custom Attributes](https://devdocs.krayincrm.com/2.2/custom-attributes/model-custom-attribute.html) |
| React when admins add a new attribute | [Events Listeners — settings.attribute.create.after](https://devdocs.krayincrm.com/2.2/digging-deeper/events.html#settings-attributes) |

## [\#](https://devdocs.krayincrm.com/2.2/custom-attributes/\#how-it-fits-together) How it fits together

| Piece | Lives in | What it does |
| --- | --- | --- |
| **Attribute** record | `attributes` table | Defines a field — code, type, entity it's attached to, validation flags. |
| **AttributeValue** record | `attribute_values` table | The actual value of one attribute for one entity record. |
| **`CustomAttribute` trait** | `Webkul\Attribute\Traits\CustomAttribute` | Adds attribute-value relationships and accessors to your Eloquent model. |
| **`AttributeValueRepository`** | `Webkul\Attribute\Repositories` | `save($data, $id)` persists every attribute value sent in `$data` for the entity with `$id`. |
| **`attribute_entity_types` config** | Merged from each package | Lists every entity type the admin can attach attributes to. |
| **Attribute Groups** | `attribute_groups` table | Layout: which attributes appear together on the create/edit form, and in what order. |

←
[Quick Add](https://devdocs.krayincrm.com/2.2/digging-deeper/quick-add.html)[How to use custom attribute](https://devdocs.krayincrm.com/2.2/custom-attributes/custom-attribute.html)
→


![](https://fonts.gstatic.com/s/i/productlogos/translate/v14/24px.svg)

Original text

Rate this translation

Your feedback will be used to help improve Google Translate
