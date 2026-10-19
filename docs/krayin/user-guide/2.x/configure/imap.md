<!-- source: https://docs.krayincrm.com/2.x/configure/imap.html -->
# [\#](https://docs.krayincrm.com/2.x/configure/imap.html\#imap-settings) IMAP Settings

The **IMAP Settings** section in Krayin CRM allows you to connect your email account to the CRM. Once configured, incoming emails will be accessible directly within the CRM interface for better communication and lead tracking.

* * *

### [\#](https://docs.krayincrm.com/2.x/configure/imap.html\#configure-imap-settings) Configure IMAP Settings

**Step-1** Go to the admin panel of Krayin and click on

**Settings >> Configuration >> IMAP Settings**.

**Step-2** In the **IMAP Account** section, enter the required server details:

- **Host** – Enter your mail server host.

_Example: `imap.gmail.com`_

- **Port** – Enter the secure port for IMAP.

_Recommended: `993`_

- **Encryption Type** – Select the encryption protocol.

_Common: `ssl`_

- **Validate SSL Certificate** – Check this box to validate the server's SSL certificate.


![Server details](https://docs.krayincrm.com/assets/img/imap-server.387b584f.png)

* * *

### [\#](https://docs.krayincrm.com/2.x/configure/imap.html\#add-your-email-credentials) Add Your Email Credentials

**Step-3** Fill in your email login details:

- **IMAP Username** – Your email address

_Example: `youremail@example.com`_

- **IMAP Password** – Your email account password (input is masked)


![Email password](<Base64-Image-Removed>)

* * *

### [\#](https://docs.krayincrm.com/2.x/configure/imap.html\#save-configuration) Save Configuration

**Step-4** Click on the **Save Configuration** button to store the settings.

![IMAP Save button](https://docs.krayincrm.com/assets/img/imap-save-button.b13e1d3e.png)

* * *

### [\#](https://docs.krayincrm.com/2.x/configure/imap.html\#edit-the-env-file) Edit the .env File

**Step-5** To activate the email fetching process, open your `.env` file located at the root of your Krayin installation. Add the following line:

MAIL\_RECEIVER\_DRIVER=webklex-imap

This tells Krayin to use the **Webklex IMAP driver** for processing inbound emails.

* * *

### [\#](https://docs.krayincrm.com/2.x/configure/imap.html\#run-email-processing-command) Run Email Processing Command

**Step-6** Now run the following artisan command to start fetching emails into your CRM:

**php artisan inbound-email:process**

This command processes new inbound emails and creates records in Krayin.

- On a **local environment**, you’ll need to run this command manually each time.
- On a **live server**, this command is automatically executed every 5 minutes via a cron job, so incoming emails are fetched regularly without manual effort.


* * *

### [\#](https://docs.krayincrm.com/2.x/configure/imap.html\#check-emails-in-inbox-section) Check Emails in Inbox Section

**Step-7** Once your email configuration is complete and the command is executed, go to the **Inbox** section in Krayin CRM. Here you can view and manage all incoming emails associated with your leads or contacts.

![IMAP Save button](https://docs.krayincrm.com/assets/img/imap-inbox.b4f404aa.png)

←
[Magic AI](https://docs.krayincrm.com/2.x/configure/magic.html)
