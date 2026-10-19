<!-- source: https://docs.krayincrm.com/2.x/notification/notifications.html -->
# [\#](https://docs.krayincrm.com/2.x/notification/notifications.html\#notifications) Notifications

**Notifications** tell you about records created across the CRM as they happen, without needing to refresh the page. The bell in the header carries a count of everything you have not yet read, and opens a panel listing the most recent items.

Notifications are raised for **Leads**, **Quotes**, **Contacts**, **Products**, **Activities** and **Mails**, including leads that arrive through a web form.

### [\#](https://docs.krayincrm.com/2.x/notification/notifications.html\#who-sees-a-notification) Who sees a notification

Each user is told only about the records their own data scope covers, which follows the view permission on their role.

**1) Global-** The user is notified about every record in the CRM.

**2) Group-** The user is notified about records belonging to the groups they are part of.

**3) Individual-** The user is notified only about their own records.

A user is never notified about something they did themselves, and a record they have no permission to see raises no notification for them.

**Note- Data scope is set per user in Settings >> Users, and the permission for each section is set on the role in Settings >> Roles.**

### [\#](https://docs.krayincrm.com/2.x/notification/notifications.html\#reading-notifications) Reading notifications

**Step-1** Click the bell in the header, beside the dark mode toggle. The panel lists the most recent notifications, and a dot marks each one you have not read.

**Step-2** Click a notification to open the record it refers to. The notification is marked as read and the count goes down.

**Step-3** Use **Mark all as read** to clear the count without opening each item.

When a new notification arrives while you are working, it also appears briefly at the corner of the screen.

### [\#](https://docs.krayincrm.com/2.x/notification/notifications.html\#delivery-options) Delivery options

Notifications reach the browser by one of three means, chosen with the `NOTIFICATION_DRIVER` variable in your `.env` file.

**1) polling-** The default. The browser asks the server for new notifications at a fixed interval. It needs no extra services, so it works on any installation.

**2) reverb-** Laravel's own websocket server, run alongside the CRM. Notifications arrive the moment they are raised.

**3) pusher-** The hosted Pusher service. Notifications arrive immediately, and no websocket server is run by you.

**Note- Anything that is not fully configured falls back to polling, so an incomplete setup keeps working rather than going silent.**

### [\#](https://docs.krayincrm.com/2.x/notification/notifications.html\#configuring-the-driver) Configuring the driver

**Step-1** Set the driver in `.env`.

```text
NOTIFICATION_DRIVER=polling
```

**Step-2** For **polling**, set how often the browser checks, in seconds. The default is 30. A shorter interval feels faster but makes one request per signed-in user per interval, so raise it on a busy installation rather than lowering it.

```text
NOTIFICATION_POLL_INTERVAL=30
```

**Step-3** For **reverb**, fill in the Reverb credentials and run the server.

```text
NOTIFICATION_DRIVER=reverb

REVERB_APP_ID=
REVERB_APP_KEY=
REVERB_APP_SECRET=
REVERB_HOST=localhost
REVERB_PORT=8080
REVERB_SCHEME=http
```

```text
php artisan reverb:start
```

**Step-4** For **pusher**, fill in the credentials from your Pusher dashboard.

```text
NOTIFICATION_DRIVER=pusher

PUSHER_APP_ID=
PUSHER_APP_KEY=
PUSHER_APP_SECRET=
PUSHER_APP_CLUSTER=mt1
```

**Step-5** Clear the configuration cache so the change is picked up.

```text
php artisan config:clear
```

**Note- Reverb and Pusher deliver notifications over a queue, so a queue worker has to be running for them.**

```text
php artisan queue:work
```

←
[Products](https://docs.krayincrm.com/2.x/product/products.html)[Quick Add](https://docs.krayincrm.com/2.x/header/quickadd.html)
→
