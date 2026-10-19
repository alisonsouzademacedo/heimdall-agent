<!-- source: https://devdocs.krayincrm.com/2.2/digging-deeper/email-inbound-parse.html -->
This is the documentation for the current version 2.2 of Krayin. Stay informed and make the most of Krayin's capabilities.

# [\#](https://devdocs.krayincrm.com/2.2/digging-deeper/email-inbound-parse.html\#email-inbound-parse) Email Inbound Parse

Krayin can receive emails from outside the CRM and surface them inside **Mail → Inbox**. Two drivers are supported, picked via `MAIL_RECEIVER_DRIVER` in `.env`:

| Driver | Best for | `.env` value |
| --- | --- | --- |
| **SendGrid Inbound Parse** | Push-based: SendGrid receives the email and POSTs it to your Krayin webhook. Best when you already use SendGrid for outbound. | `sendgrid` |
| **Webklex IMAP** | Pull-based: Krayin polls an existing mailbox over IMAP. Best when you want to receive into an existing Gmail / Outlook / hosted mailbox. | `webklex-imap` |

Pick one. The rest of this page walks through configuring each.

## [\#](https://devdocs.krayincrm.com/2.2/digging-deeper/email-inbound-parse.html\#sendgrid-inbound-parse) 📧 SendGrid Inbound Parse

SendGrid's Inbound Parse Webhook converts every email sent to a domain into an HTTP POST and forwards it to a URL you supply. Krayin exposes a matching endpoint that turns the POST into an inbox entry.

### [\#](https://devdocs.krayincrm.com/2.2/digging-deeper/email-inbound-parse.html\#set-the-driver-in-env) 1\. Set the driver in `.env`

```ini
MAIL_RECEIVER_DRIVER=sendgrid
```

### [\#](https://devdocs.krayincrm.com/2.2/digging-deeper/email-inbound-parse.html\#add-a-parse-webhook-in-sendgrid) 2\. Add a Parse Webhook in SendGrid

1. Sign in to [SendGrid(opens new window)](https://app.sendgrid.com/).

2. Go to **Settings → Inbound Parse**.

3. Click **Add Host & URL**.

4. **Receiving domain** — the domain emails will be sent to (e.g. `example.com`).

5. **URL** — your Krayin endpoint:



```text
https://yourdomain.com/admin/mail/inbound-parse
```



Use HTTPS so the email body travels encrypted. Replace `yourdomain.com` with your actual Krayin domain.


### [\#](https://devdocs.krayincrm.com/2.2/digging-deeper/email-inbound-parse.html\#point-your-mx-records-at-sendgrid) 3\. Point your MX records at SendGrid

Update the DNS for the receiving domain so its MX records point at SendGrid's inbound servers (the values are shown on the same setup screen). Without this, emails won't reach SendGrid in the first place.

### [\#](https://devdocs.krayincrm.com/2.2/digging-deeper/email-inbound-parse.html\#what-gets-parsed) What gets parsed

SendGrid forwards each email as a `multipart/form-data` POST containing:

- `from` — sender address
- `to` — recipient (your configured domain)
- `subject` — subject line
- `text` and `html` — plain-text and HTML bodies
- attachments — binary files

Krayin saves the email and any attachments to its database and renders them in **Mail → Inbox**.

### [\#](https://devdocs.krayincrm.com/2.2/digging-deeper/email-inbound-parse.html\#security) 🛡️ Security

- **Always use HTTPS** for the webhook URL.
- **Verify the origin** — either check the request headers SendGrid sends, or configure an API key in SendGrid and validate it on your end before accepting the POST.

### [\#](https://devdocs.krayincrm.com/2.2/digging-deeper/email-inbound-parse.html\#test-it) 🧪 Test it

SendGrid provides a simulator in the Parse setup screen that posts a fake email to your URL. Use it to verify the endpoint works without sending a real email.

Watch the response time

SendGrid expects a response within **20 seconds**. If processing attachments is slow, queue the work in a job and respond immediately — otherwise SendGrid will retry and you'll get duplicates.

## [\#](https://devdocs.krayincrm.com/2.2/digging-deeper/email-inbound-parse.html\#imap-webklex) 📥 IMAP (Webklex)

The IMAP driver polls an existing mailbox and pulls new messages into Krayin. Use this when you already have a Gmail / Outlook / hosted mailbox you want emails delivered to.

IMAP keeps messages on the server — reads, deletes, and other state stay in sync across every client.

### [\#](https://devdocs.krayincrm.com/2.2/digging-deeper/email-inbound-parse.html\#set-the-driver-in-env-2) 1\. Set the driver in `.env`

```ini
MAIL_RECEIVER_DRIVER=webklex-imap
```

### [\#](https://devdocs.krayincrm.com/2.2/digging-deeper/email-inbound-parse.html\#configure-imap-credentials-in-the-admin) 2\. Configure IMAP credentials in the admin

In the admin go to **Configuration → IMAP Settings** and fill in:

| Field | Description | Example |
| --- | --- | --- |
| **Host** | IMAP server hostname | `imap.gmail.com` |
| **Port** | IMAP port | `993` (SSL) |
| **Encryption** | `SSL` / `TLS` / `none` | `SSL` |
| **Validate SSL** | Verify the server's TLS cert | `true` |
| **Username** | Full email address | `you@example.com` |
| **Password** | Mailbox password (or app-specific password) | `your-password` |

Click **Save**.

Use an app-specific password

For Gmail and most modern providers, account passwords don't work with IMAP. Generate an **app-specific password** in your provider's security settings and paste _that_ into the Password field.

### [\#](https://devdocs.krayincrm.com/2.2/digging-deeper/email-inbound-parse.html\#provider-specific-notes) 3\. Provider-specific notes

- **Gmail** — enable IMAP in Gmail's _Settings → Forwarding and POP/IMAP_, then issue an app password.
- **Outlook / Office 365** — modern auth (OAuth) is recommended; check the [Webklex IMAP docs(opens new window)](https://www.webklex.com/php-imap/) for the OAuth flow.
- **Custom hosting** — check your provider's documentation for the correct host, port, and encryption combination.

## [\#](https://devdocs.krayincrm.com/2.2/digging-deeper/email-inbound-parse.html\#verify-either-driver) 🧪 Verify (either driver)

Send a test email to the configured address. Within a minute it should appear under **Mail → Inbox**. If it doesn't:

```bash
tail -f storage/logs/laravel.log
```

Look for parse errors or connection failures. For IMAP, an invalid password is the most common cause; for SendGrid, DNS MX records pointing at the wrong host is the most common cause.

## [\#](https://devdocs.krayincrm.com/2.2/digging-deeper/email-inbound-parse.html\#what-to-do-next) 📝 What to do next

Inbound emails can be tied into automation — see [Events Listeners](https://devdocs.krayincrm.com/2.2/digging-deeper/events.html) for hooking into the events Krayin fires when a new inbound message lands.

←
[Data Transfer](https://devdocs.krayincrm.com/2.2/digging-deeper/data-transfer.html)[Events Listeners](https://devdocs.krayincrm.com/2.2/digging-deeper/events.html)
→


![](https://fonts.gstatic.com/s/i/productlogos/translate/v14/24px.svg)

Original text

Rate this translation

Your feedback will be used to help improve Google Translate
