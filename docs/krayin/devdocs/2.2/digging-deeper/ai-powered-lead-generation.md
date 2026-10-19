<!-- source: https://devdocs.krayincrm.com/2.2/digging-deeper/ai-powered-lead-generation.html -->
This is the documentation for the current version 2.2 of Krayin. Stay informed and make the most of Krayin's capabilities.

# [\#](https://devdocs.krayincrm.com/2.2/digging-deeper/ai-powered-lead-generation.html\#ai-powered-lead-generation) AI-Powered Lead Generation

Krayin's **Magic AI** feature turns uploaded documents — invoices, business cards, contracts — into ready-to-edit leads in one click. The integration sends the parsed file to an [OpenRouter(opens new window)](https://openrouter.ai/) model, which returns a structured JSON of person, contact details, and lead value that Krayin then persists.

This page documents both how to enable the feature for end users and how the developer-facing `MagicAIService` works under the hood.

## [\#](https://devdocs.krayincrm.com/2.2/digging-deeper/ai-powered-lead-generation.html\#what-you-get) 🪄 What you get

- **PDF parsing** — text and embedded images, powered by [smalot/pdfparser(opens new window)](https://github.com/smalot/pdfparser).
- **Image OCR** (planned for future versions).
- **Auto-mapping** — AI output is mapped straight into Krayin's lead + person + email + phone schema.
- **Localised errors** — failure modes (bad upload, empty file, API failure) return translated user messages.

## [\#](https://devdocs.krayincrm.com/2.2/digging-deeper/ai-powered-lead-generation.html\#enable-magic-ai) ⚙️ Enable Magic AI

### [\#](https://devdocs.krayincrm.com/2.2/digging-deeper/ai-powered-lead-generation.html\#get-an-openrouter-api-key) 1\. Get an OpenRouter API key

Sign up at [OpenRouter.ai(opens new window)](https://openrouter.ai/) and create an API key from your dashboard.

### [\#](https://devdocs.krayincrm.com/2.2/digging-deeper/ai-powered-lead-generation.html\#configure-in-the-admin) 2\. Configure in the admin

1. Open the admin panel.
2. Go to **Settings → Configuration → General → Magic AI**.
3. Toggle **Magic AI** on.
4. Paste your **API Key**.
5. Pick an **AI model** from the dropdown. Browse the full list at [OpenRouter Models(opens new window)](https://openrouter.ai/models) — you can paste additional model IDs into the field if the one you want isn't pre-listed.
6. Enable **DOC Generation**.
7. Save.

Once saved, the Upload File control becomes available on the Leads index.

## [\#](https://devdocs.krayincrm.com/2.2/digging-deeper/ai-powered-lead-generation.html\#create-a-lead-from-a-document) 📁 Create a lead from a document

1. Open **Leads** in the admin sidebar.
2. Click **Upload File**.
3. Pick a PDF or image (invoice, business card, …).
4. Magic AI parses the file, extracts the structured fields, and creates a draft lead pre-filled with what it found.

The flow is especially useful for capturing offline leads — trade-show business cards, scanned contracts, emailed invoices.

## [\#](https://devdocs.krayincrm.com/2.2/digging-deeper/ai-powered-lead-generation.html\#expected-ai-output) 🔌 Expected AI output

The AI is instructed to return a strict JSON shape. If a field can't be extracted, it falls back to a default value:

```json
{
    "status": 1,
    "title": "Untitled Lead",
    "lead_value": 0,
    "person": {
        "name": "Unknown",
        "emails": {
            "value": null,
            "label": null
        },
        "contact_numbers": {
            "value": null,
            "label": null
        }
    }
}
```

| Field | What's extracted |
| --- | --- |
| `title` | Title of the lead — usually the invoice subject or project name |
| `lead_value` | Monetary value of the lead (numeric) |
| `person.name` | Name of the individual or contact person |
| `person.emails.value` | Email address |
| `person.emails.label` | Optional email label (`work`, `personal`, …) |
| `person.contact_numbers.value` | Phone number |
| `person.contact_numbers.label` | Optional phone label |

## [\#](https://devdocs.krayincrm.com/2.2/digging-deeper/ai-powered-lead-generation.html\#developer-details-%E2%80%94-magicaiservice) 🛠️ Developer details — `MagicAIService`

All of the above is orchestrated by:

```text
Webkul\Lead\Services\MagicAIService
```

Responsibilities:

- **Validating + decoding** Base64-encoded uploads.
- **Extracting content** — text and embedded images — from supported file types via `smalot/pdfparser`.
- **Calling OpenRouter** using Laravel's HTTP client with the configured API key + model.
- **Mapping the response** into a valid Krayin lead payload (person, emails, phone numbers, value).

### [\#](https://devdocs.krayincrm.com/2.2/digging-deeper/ai-powered-lead-generation.html\#implementation-notes) Implementation notes

- **Concurrency protection** — the service holds a re-entrancy flag so the same upload can't be processed twice in parallel.
- **Temporary files** — uploads are written to a temp path, parsed, then deleted whether the call succeeds or fails.
- **Token-limit handling** — oversized documents are truncated intelligently before the prompt is built, so the request stays inside the model's context window.
- **Error path** — bad Base64, empty files, and AI response issues are caught and surfaced via `trans()` so the UI gets a localised message rather than a stack trace.

## [\#](https://devdocs.krayincrm.com/2.2/digging-deeper/ai-powered-lead-generation.html\#verify) 🧪 Verify

After saving the config:

1. Tail the Laravel log: `tail -f storage/logs/laravel.log`.
2. Upload a small test PDF from the Leads page.
3. You should see the OpenRouter request in the log, followed by a new lead in the list.

If the upload silently does nothing, check the Magic AI section in **Settings → Configuration → General → Magic AI** — an invalid or expired API key is the most common cause.

←
[Digging Deeper](https://devdocs.krayincrm.com/2.2/digging-deeper)[Best Security Practices](https://devdocs.krayincrm.com/2.2/digging-deeper/security-practice.html)
→


![](https://fonts.gstatic.com/s/i/productlogos/translate/v14/24px.svg)

Original text

Rate this translation

Your feedback will be used to help improve Google Translate
