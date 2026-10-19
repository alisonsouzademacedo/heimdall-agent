<!-- source: https://devdocs.krayincrm.com/2.2/custom-attributes/custom-attribute.html -->
This is the documentation for the current version 2.2 of Krayin. Stay informed and make the most of Krayin's capabilities.

# [\#](https://devdocs.krayincrm.com/2.2/custom-attributes/custom-attribute.html\#create-and-use-an-attribute) Create and Use an Attribute

Krayin is **attribute-driven** — the fields you see on Leads, Persons, Organizations, Products, Quotes, and Warehouses are all `Attribute` records under the hood. Adding a custom field is a few clicks in the admin; no migrations, no code.

This page covers the admin flow: creating an attribute, picking its type, marking it for the Quick Add modal, and using it inside the matching module.

## [\#](https://devdocs.krayincrm.com/2.2/custom-attributes/custom-attribute.html\#what-you-can-build) 🧩 What you can build

| Capability | Detail |
| --- | --- |
| **Per-entity custom fields** | Leads, Persons, Organizations, Products, Quotes, Warehouses each get their own attribute set. |
| **12+ field types** | Text, textarea, price, boolean, date, datetime, email, phone, select, multi-select, lookup, image, file, address — plus **Subheading** for visual grouping. |
| **Quick Add modal support** | Mark an attribute as _Quick Add_ and it shows up in the modal that opens from the entity's quick-create button. |
| **Validation rules** | Mark fields required, unique, or numeric directly from the form. |
| **Default values** | Pre-fill an attribute so users don't have to type it every time. |

## [\#](https://devdocs.krayincrm.com/2.2/custom-attributes/custom-attribute.html\#open-the-attributes-screen) 🗂️ 1\. Open the Attributes screen

In the admin:

1. Open **Settings** from the sidebar.
2. Click **Attributes**.
3. You land on the list view — every existing attribute, grouped by entity type.

## [\#](https://devdocs.krayincrm.com/2.2/custom-attributes/custom-attribute.html\#create-a-new-attribute) 🪄 2\. Create a new attribute

Click **Create Attribute** in the top-right corner. The create form opens.

Fill these fields:

| Field | Purpose |
| --- | --- |
| **Code** | Machine-readable identifier (e.g. `industry`). Used in code — lowercase, no spaces. |
| **Admin Name** | Label shown to admin users. |
| **Type** | The field type — see the table below. |
| **Entity Type** | Which module this attribute belongs to (Leads, Person, Organization, etc.). |
| **Quick Add** | Whether this field appears in the entity's Quick Add modal. See [Quick Add](https://devdocs.krayincrm.com/2.2/custom-attributes/custom-attribute.html#quick-add). |
| **Is Required** | Force users to fill the field before saving. |
| **Is Unique** | Reject duplicate values across the module. |
| **Default Value** | Pre-fill the field on the create form. |

### [\#](https://devdocs.krayincrm.com/2.2/custom-attributes/custom-attribute.html\#field-types) Field types

| Type | Use for |
| --- | --- |
| **Text** | Short single-line input (e.g. _Job Title_). |
| **Textarea** | Multi-line input (e.g. _Notes_). |
| **Price** | Money values — respects the configured currency. |
| **Boolean** | Yes/no toggle. |
| **Date** | Calendar picker, date only. |
| **Datetime** | Calendar picker with time. |
| **Email** | Email input with validation. |
| **Phone** | Phone-number input. |
| **Select** | Dropdown — single choice. |
| **Multiselect** | Dropdown — multiple choices. |
| **Lookup** | Reference another entity (e.g. tie an attribute to a Person record). |
| **Image** | Single image upload. |
| **File** | Single file upload. |
| **Address** | Composite address input (street, city, state, country, zip). |
| **Subheading** | Not a real field — a section divider used to group related fields on the form. See [Subheading](https://devdocs.krayincrm.com/2.2/custom-attributes/custom-attribute.html#-subheading). |

### [\#](https://devdocs.krayincrm.com/2.2/custom-attributes/custom-attribute.html\#subheading) 🏷️ Subheading

A **Subheading** is a layout-only attribute. It doesn't store data; it just renders a heading on the create/edit form so you can visually group fields that belong together.

Typical use: on the Lead form, group all _Company_ attributes under a subheading called _Company details_, and all _Contact_ attributes under _Primary contact_.

To add one:

1. Set **Type** to `Subheading`.
2. Give it an **Admin Name** — this is the text the user sees on the form.
3. Save.
4. Drag the subheading into the position you want it in the [Attribute Group](https://devdocs.krayincrm.com/2.2/custom-attributes/custom-attribute.html#arrange-fields-with-attribute-groups) layout.

Subheadings have no value

Because subheadings don't store data, the `Is Required`, `Is Unique`, `Default Value`, and `Quick Add` fields don't apply — the admin form hides them when `Type = Subheading`.

### [\#](https://devdocs.krayincrm.com/2.2/custom-attributes/custom-attribute.html\#quick-add) ⚡ Quick Add

The **Quick Add** modal is the small create dialog you get when you click a quick-create button on a list view (for example, _\+ Add Lead_ on a pipeline column). It's intentionally short — only the highest-value fields appear.

Toggle **Quick Add** to `Yes` on an attribute to make it appear in that modal for the matching entity. Everything else lives only on the full create/edit page.

Good candidates for Quick Add:

- The handful of fields a user _must_ fill to create the record (name, email, stage).
- Fields used for filtering or sorting on the list view.

Skip Quick Add for:

- Long text fields (Notes, Description).
- Optional / rarely-used metadata — keep the modal compact.

You can still edit non-Quick-Add fields later

Disabling Quick Add for a field doesn't hide it — it just keeps it off the modal. The field still appears on the full edit page where users can fill it in afterwards.

## [\#](https://devdocs.krayincrm.com/2.2/custom-attributes/custom-attribute.html\#arrange-fields-with-attribute-groups) 🗃️ 3\. Arrange fields with Attribute Groups

If you've added several attributes to the same entity, group and order them via **Settings → Attribute Groups**:

1. Pick the entity (Leads, Person, etc.).
2. Drag your attributes into the groups where they should appear.
3. Drag groups themselves to reorder the sections on the form.

Subheadings show up here too — drop them between groups of attributes to label the sections.

## [\#](https://devdocs.krayincrm.com/2.2/custom-attributes/custom-attribute.html\#verify) 🧪 4\. Verify

1. Go to the matching module (e.g. **Leads** if you created a Leads attribute).
2. Open the create form — your attribute should appear in its assigned group.
3. If you enabled **Quick Add**, open the Quick Add modal from a pipeline column — the attribute should be there too.
4. Save a record with a value, then re-open it — the value should persist.

If the attribute doesn't show up, clear caches:

```bash
php artisan optimize:clear
```

## [\#](https://devdocs.krayincrm.com/2.2/custom-attributes/custom-attribute.html\#entity-types-at-a-glance) 📋 Entity types at a glance

| Entity type | Module the attribute appears in |
| --- | --- |
| **Leads** | Lead create / edit / detail pages. |
| **Person** | Contact (Person) records. |
| **Organization** | Company / organization records. |
| **Products** | Product catalog entries. |
| **Quotes** | Quote line items and headers. |
| **Warehouses** | Warehouse records. |

## [\#](https://devdocs.krayincrm.com/2.2/custom-attributes/custom-attribute.html\#next-steps) 📝 Next steps

- [Make a Model Use Custom Attributes](https://devdocs.krayincrm.com/2.2/custom-attributes/model-custom-attribute.html) — wire a custom package model into the attribute system so it can have its own attributes.
- [Events Listeners](https://devdocs.krayincrm.com/2.2/digging-deeper/events.html) — hook into `settings.attribute.create.after` to react to new attributes from your package.

←
[Custom Attributes](https://devdocs.krayincrm.com/2.2/custom-attributes)[Make Model With Custom Attribute](https://devdocs.krayincrm.com/2.2/custom-attributes/model-custom-attribute.html)
→


![](https://fonts.gstatic.com/s/i/productlogos/translate/v14/24px.svg)

Original text

Rate this translation

Your feedback will be used to help improve Google Translate
