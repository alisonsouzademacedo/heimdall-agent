<!-- source: https://devdocs.krayincrm.com/2.2/introduction/installation.html -->
This is the documentation for the current version 2.2 of Krayin. Stay informed and make the most of Krayin's capabilities.

# [\#](https://devdocs.krayincrm.com/2.2/introduction/installation.html\#installation) Installation

Krayin supports **four installation methods**. Pick the one that fits your environment — you only need to follow **one**.

Choose ONE installation method — not all

| Method | Best for |
| --- | --- |
| **Method 1 — Getting Started Using AI** _(fastest with an AI assistant)_ | Hand the install to Claude Code, Cursor, Codex, or any AI assistant. |
| **Method 2 — GUI Installer** | Beginners who prefer a browser-based setup wizard. |
| **Method 3 — Composer CLI** _(recommended for devs)_ | Developers comfortable with the command line — the standard Laravel workflow. |
| **Method 4 — Docker** | Quickest start with zero local PHP / MySQL setup. |

You only need **one** of these methods to get Krayin running.

## [\#](https://devdocs.krayincrm.com/2.2/introduction/installation.html\#where-to-install-krayin-method) 📁 Where to install Krayin _(Method 2 & 3)_

Krayin lives inside your web server's **document root**.

What is a "document root"?

It's the folder your web server treats as its public website. When someone visits `http://yoursite.com/`, the web server looks **inside this folder** and sends back whatever it finds.

Think of it like a public shelf: **only files placed on the shelf are visible to the outside world.** If you put `index.html` inside the document root, visitors can open it at `http://yoursite.com/index.html`. Files outside the document root stay private.

Krayin needs to sit _inside_ this folder so your browser can reach it.

Three things to know before you start:

1. **Open a command line inside the document root.** Use `cd` to move into the folder you picked from the table above — every install command runs from there. (Use Terminal on macOS / Linux, or PowerShell on Windows.)
2. **Install Krayin into that folder.** Running `composer create-project krayin/laravel-crm` downloads Krayin into a new sub-folder called `laravel-crm/`. So your full install path becomes something like `/var/www/laravel-crm/`.
3. **Point the web server at `laravel-crm/public/` — not `laravel-crm/`.** Krayin's entry file lives inside `public/`, so the web server needs to serve that sub-folder specifically. See [Configure your web server to serve `public/`](https://devdocs.krayincrm.com/2.2/introduction/installation.html#configure-your-web-server-to-serve-public) below for the NGINX / Apache snippet.

### [\#](https://devdocs.krayincrm.com/2.2/introduction/installation.html\#default-document-root-paths) Default document-root paths

Pick the tab for your OS — it shows the default for both NGINX (recommended) and Apache:

- [macOS](https://devdocs.krayincrm.com/2.2/introduction/installation.html#macos-11)
- [Windows PowerShell](https://devdocs.krayincrm.com/2.2/introduction/installation.html#windows-powershell-11)
- [Linux](https://devdocs.krayincrm.com/2.2/introduction/installation.html#linux-11)

**NGINX** _(recommended)_

- Homebrew, Apple Silicon — `/opt/homebrew/var/www/`
- Homebrew, Intel — `/usr/local/var/www/`

**Apache**

- Homebrew, Apple Silicon — `/opt/homebrew/var/www/`
- Homebrew, Intel — `/usr/local/var/www/`

**NGINX** _(recommended)_ — `C:\nginx\html\`

**Apache** — `C:\Apache24\htdocs\`

**NGINX** _(recommended)_ — `/var/www/`

**Apache** — `/var/www/html/`

Example — jumping into the document root before installing:

```bash
# Linux (Ubuntu) with NGINX
cd /var/www/
```

Permissions

On Linux / macOS the document root is usually owned by `root`. Either run install commands with `sudo`, or take ownership once so your user can write into it:

```bash
sudo chown -R $USER:$USER /var/www
```

### [\#](https://devdocs.krayincrm.com/2.2/introduction/installation.html\#configure-your-web-server-to-serve-public) Configure your web server to serve `public/`

Methods 2 and 3 require pointing your web server at Krayin's **`public/`** folder. Pick the config that matches the web server you installed on the [Requirements page](https://devdocs.krayincrm.com/2.2/introduction/requirements.html).

#### [\#](https://devdocs.krayincrm.com/2.2/introduction/installation.html\#nginx-php-fpm-recommended) NGINX + PHP-FPM _(recommended)_

Create a new server block at `/etc/nginx/sites-available/krayin`:

```nginx
server {
    listen 80;
    server_name krayin.local;

    root /var/www/laravel-crm/public;
    index index.php index.html;

    location / {
        try_files $uri $uri/ /index.php?$query_string;
    }

    location ~ \.php$ {
        include snippets/fastcgi-php.conf;
        fastcgi_pass unix:/run/php/php8.3-fpm.sock;
    }

    location ~ /\.ht {
        deny all;
    }
}
```

Enable the site and reload NGINX:

- [macOS](https://devdocs.krayincrm.com/2.2/introduction/installation.html#macos-12)
- [Windows PowerShell](https://devdocs.krayincrm.com/2.2/introduction/installation.html#windows-powershell-12)
- [Linux](https://devdocs.krayincrm.com/2.2/introduction/installation.html#linux-12)

```bash
brew services reload nginx
```

Restart the NGINX service after editing `nginx.conf`:

```powershell
nginx -s reload
```

```bash
sudo ln -s /etc/nginx/sites-available/krayin /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
```

#### [\#](https://devdocs.krayincrm.com/2.2/introduction/installation.html\#apache-mod-php) Apache + mod\_php

Create a VirtualHost at `/etc/apache2/sites-available/krayin.conf`:

```text
<VirtualHost *:80>
    ServerName krayin.local
    DocumentRoot /var/www/html/laravel-crm/public

    <Directory /var/www/html/laravel-crm/public>
        AllowOverride All
        Require all granted
    </Directory>

    ErrorLog ${APACHE_LOG_DIR}/krayin-error.log
    CustomLog ${APACHE_LOG_DIR}/krayin-access.log combined
</VirtualHost>
```

Enable `mod_rewrite` and the site, then reload Apache:

- [macOS](https://devdocs.krayincrm.com/2.2/introduction/installation.html#macos-13)
- [Windows PowerShell](https://devdocs.krayincrm.com/2.2/introduction/installation.html#windows-powershell-13)
- [Linux](https://devdocs.krayincrm.com/2.2/introduction/installation.html#linux-13)

```bash
sudo apachectl -k restart
```

Restart the Apache service:

```powershell
Restart-Service -Name Apache2.4
```

```bash
sudo a2enmod rewrite
sudo a2ensite krayin.conf
sudo systemctl reload apache2
```

#### [\#](https://devdocs.krayincrm.com/2.2/introduction/installation.html\#resolve-krayin-local-locally) Resolve `krayin.local` locally

Add this line to your hosts file so the domain works on your machine:

```text
127.0.0.1   krayin.local
```

Edit your hosts file as Administrator (Windows) or with `sudo` (macOS / Linux):

- [macOS](https://devdocs.krayincrm.com/2.2/introduction/installation.html#macos-14)
- [Windows PowerShell](https://devdocs.krayincrm.com/2.2/introduction/installation.html#windows-powershell-14)
- [Linux](https://devdocs.krayincrm.com/2.2/introduction/installation.html#linux-14)

```bash
sudo nano /etc/hosts
```

Edit `C:\Windows\System32\drivers\etc\hosts` (run Notepad as Administrator):

```powershell
Start-Process notepad -Verb runAs -ArgumentList 'C:\Windows\System32\drivers\etc\hosts'
```

```bash
sudo nano /etc/hosts
```

* * *

## [\#](https://devdocs.krayincrm.com/2.2/introduction/installation.html\#install-krayin) 🚀 Install Krayin

Krayin ships five install paths. Pick the one that fits your workflow — they all produce the same running CRM, so the choice comes down to _how_ you want to drive the install.

| Method | Best for |
| --- | --- |
| **[Method 1 — Getting Started Using AI](https://devdocs.krayincrm.com/2.2/introduction/installation.html#method-getting-started-using-ai)** | Driving the install from Claude Code, Cursor, Codex, or any AI assistant. |
| **[Method 2 — GUI Installer](https://devdocs.krayincrm.com/2.2/introduction/installation.html#method-gui-installer)** | First-time users who prefer a browser wizard. |
| **[Method 3 — Composer CLI](https://devdocs.krayincrm.com/2.2/introduction/installation.html#method-composer-cli-recommended)** _(recommended)_ | Developers comfortable with the command line. Standard Laravel workflow. |
| **[Method 4 — Docker](https://devdocs.krayincrm.com/2.2/introduction/installation.html#method-docker)** | Anyone who wants a self-contained, throwaway environment with no host setup. |
| **[Method 5 — Shared Hosting](https://devdocs.krayincrm.com/2.2/introduction/installation.html#method-shared-hosting)** | Deploying onto cPanel / shared-hosting accounts (works with Method 2 or 3). |

### [\#](https://devdocs.krayincrm.com/2.2/introduction/installation.html\#method-%E2%80%94-getting-started-using-ai) 🤖 Method 1 — Getting Started Using AI

If you're working inside Claude Code, Cursor, Codex, GitHub Copilot, or any AI assistant, hand off the whole install to the agent. Krayin publishes a machine-readable instructions file at a stable URL — point your assistant at it and ask it to install Krayin in the current directory.

#### [\#](https://devdocs.krayincrm.com/2.2/introduction/installation.html\#available-urls) Available URLs

| URL | Format | Best for |
| --- | --- | --- |
| [`https://devdocs.krayincrm.com/agents.txt`(opens new window)](https://devdocs.krayincrm.com/agents.txt) | Plain text | Agents that fetch URLs via `curl` / web tools. |
| [`https://devdocs.krayincrm.com/for/agents.html`(opens new window)](https://devdocs.krayincrm.com/for/agents.html) | Rendered HTML | Reading it yourself, or for agents that prefer HTML. |

Both contain the same content: prerequisite checks, `php.new` install commands per OS, the `composer create-project krayin/laravel-crm` \+ `php artisan krayin-crm:install` flow, sensible defaults, and post-install verification steps.

#### [\#](https://devdocs.krayincrm.com/2.2/introduction/installation.html\#how-to-use-it) How to use it

Paste a prompt like this into your AI assistant:

```text
Use https://devdocs.krayincrm.com/agents.txt to install Krayin CRM in
this directory. Default to "example-crm" as the project name.
```

The agent will:

1. Check whether the directory already has a Krayin install (and skip the rest if so).
2. Verify `php` / `composer` / `node` / database availability, install anything missing via `php.new`.
3. Run `composer create-project krayin/laravel-crm example-crm`.
4. Run `php artisan krayin-crm:install`, asking you only for database credentials and admin user details.
5. Start `php artisan serve` and tell you where to sign in.

In-repo agent skills load automatically afterwards

Krayin 2.2 ships its agent skills inside the repo (`AGENTS.md` at the root, plus `.claude/skills/`, `.cursor/`, `.codex/`, `.kilocode/`). After install, any follow-up question your AI assistant asks about Krayin is answered against those skills — so the next prompts ("scaffold a Lead package", "write a Pest test") produce Krayin-idiomatic code without extra setup. See [Agent Skills](https://devdocs.krayincrm.com/2.2/introduction/skills.html) for details.

Verify what the agent runs

Agents can misread instructions or pick up stale context. Skim the commands the assistant proposes before approving them — especially anything that touches your database or shell config.

* * *

**— OR —**

* * *

### [\#](https://devdocs.krayincrm.com/2.2/introduction/installation.html\#method-%E2%80%94-gui-installer) 🪄 Method 2 — GUI Installer

To install Krayin using our browser-based GUI installer, follow either of the sub-options below.

##### [\#](https://devdocs.krayincrm.com/2.2/introduction/installation.html\#sub-option-a-%E2%80%94-composer-create-project) Sub-option 1A — Composer create-project

- Open your command line and `cd` into the web-server document root from the [Where to install Krayin](https://devdocs.krayincrm.com/2.2/introduction/installation.html#where-to-install-krayin-method) section above (for example, `cd /var/www/` on Ubuntu with NGINX).

- Run the following command to download and install Krayin into a new `laravel-crm/` folder:



```sh
composer create-project krayin/laravel-crm
```

- If you haven't already, configure your web server to serve **`laravel-crm/public/`** using the NGINX or Apache snippet in [Configure your web server to serve `public/`](https://devdocs.krayincrm.com/2.2/introduction/installation.html#configure-your-web-server-to-serve-public). Reload NGINX or Apache after saving the config.

- Open your browser and visit the URL you configured (for example, `http://krayin.local/`). This will launch the Krayin installer.


##### [\#](https://devdocs.krayincrm.com/2.2/introduction/installation.html\#sub-option-b-%E2%80%94-download-the-zip) Sub-option 1B — Download the ZIP

Otherwise you can download the zip file and install it using the following steps:

- [Download Krayin(opens new window)](https://krayincrm.com/download/) from our website.

- Extract the contents of the downloaded archive into your web-server document root from the [Where to install Krayin](https://devdocs.krayincrm.com/2.2/introduction/installation.html#where-to-install-krayin-method) section — e.g. extract into `/var/www/laravel-crm/` on Ubuntu.

- On the command line, navigate into that extracted project folder:



```sh
cd /var/www/laravel-crm
```

- Run the following command to install dependencies:



```sh
composer create-project
```

- If you haven't already, configure your web server to serve **`laravel-crm/public/`** using the NGINX or Apache snippet in [Configure your web server to serve `public/`](https://devdocs.krayincrm.com/2.2/introduction/installation.html#configure-your-web-server-to-serve-public). Reload NGINX or Apache after saving the config.

- Open your browser and visit the URL you configured (for example, `http://krayin.local/`). This will launch the Krayin installer.


WARNING

Ensure that Composer is installed on your system.

* * *

**— OR —**

* * *

### [\#](https://devdocs.krayincrm.com/2.2/introduction/installation.html\#method-%E2%80%94-composer-cli-recommended) ⌨️ Method 3 — Composer CLI _(Recommended)_

This is the **standard Laravel workflow** and the recommended path for most developers. You install Krayin via Composer and complete setup through interactive command-line prompts — no browser wizard needed.

- Open your command line and `cd` into the web-server document root from the [Where to install Krayin](https://devdocs.krayincrm.com/2.2/introduction/installation.html#where-to-install-krayin-method) section above (for example, `cd /var/www/` on Ubuntu with NGINX).

- Run the following command to download and install Krayin into a new `laravel-crm/` folder:



```bash
composer create-project krayin/laravel-crm
```

- Run the following command:



```bash
php artisan krayin-crm:install
```





WARNING



During the installation process, if the **`.env`** file doesn't exist, the installer will prompt you to provide the necessary information.

- Follow the prompts during the installation process to provide the following details:



```bash
- Please enter the application name :
- Please enter the application URL :
- Please select the default application locale :
- Please select the default currency :
- Please select the database connection :
- Please select the database host :
- Please select the database name :
- Please enter your database username :
- Please enter your database password :
```

Database connection

Select **`mysql`** if you installed MySQL, or **`mariadb`** if you installed MariaDB. See [Supported Database Servers](https://devdocs.krayincrm.com/2.2/introduction/requirements.html#supported-database-servers) for the versions each one needs.

- For Create your admin credentials



```bash
- Enter the name of the admin user :
- Enter the email address of the admin user :
- Configure the password for the admin user :
```

- Start Using Krayin On a Production Server


  - To access Krayin on a production server, open your domain in a web browser. For example:

```text
https://example.com/
```

- Start Using Krayin On a Production Server


  - To access Krayin on your local server, follow these steps:

1. Configure your web server (NGINX or Apache) to point at **`laravel-crm/public/`** using the snippet in [Configure your web server to serve `public/`](https://devdocs.krayincrm.com/2.2/introduction/installation.html#configure-your-web-server-to-serve-public), then reload NGINX / Apache. Or, for a quick local test without configuring a web server, run:



     ```bash
     php artisan serve
     ```

2. Open your browser and visit the URL you configured (or the local URL printed by `php artisan serve`).
- Login as an Admin

To log in as an admin, visit **`https://example.com/admin/`**. If you used the **`php artisan krayin-crm:install`** command, use the following credentials:



```text
Email: admin@example.com
Password: admin123
```


* * *

**— OR —**

* * *

### [\#](https://devdocs.krayincrm.com/2.2/introduction/installation.html\#method-%E2%80%94-docker) 🐳 Method 4 — Docker

[Docker(opens new window)](https://www.docker.com/) is an open platform for developing, shipping, and running applications. Docker enables you to separate your applications from your infrastructure so you can deliver software quickly. With Docker, you can manage your infrastructure in the same ways you manage your applications. Docker can also be used for defining and running multi-container Docker applications using the Docker Compose tool.

With the help of Docker Compose, you can define containers to be built, their configuration, links, volumes, ports, etc., in a single file, and it gets launched by a single command. You can also add multiple servers and services just by adding them to the Docker Compose configuration file. This configuration file is in [YAML(opens new window)](https://en.wikipedia.org/wiki/YAML) format.

##### [\#](https://devdocs.krayincrm.com/2.2/introduction/installation.html\#application-data-and-database-volume-persistence) Application Data and Database Volume Persistence

It is recommended to keep your application files and database data volume on the Docker host and mount them on the running container. This ensures that the application and database data persistence even in the case of containers' failure or termination. In this way, even if you destroy containers, your data won't get lost unless you remove them forcefully.
This compose configuration file mounts the application directory **`app`** and database volume **`dbvolume`** from the host to running Docker containers at the time of containers' launch.

#### [\#](https://devdocs.krayincrm.com/2.2/introduction/installation.html\#docker-setup-for-krayin) Docker Setup for Krayin

You can configure Krayin using Docker in two different ways:

1. [**Docker Image from Docker Hub**(opens new window)](https://hub.docker.com/r/webkul/krayin)
2. **Docker Compose (for Method 2)**

Both approaches allow you to set up the application quickly, managing all system requirements like Nginx, MySQL, and PHPMyAdmin within isolated containers. Below is a detailed guide for each method.

#### [\#](https://devdocs.krayincrm.com/2.2/introduction/installation.html\#docker-image-from-docker-hub) 1\. **Docker Image from Docker Hub**

Follow the steps below to set up Krayin using Docker Hub. This approach provides a pre-configured Docker image of Krayin, allowing for a quick and easy installation.

##### [\#](https://devdocs.krayincrm.com/2.2/introduction/installation.html\#step-pull-krayin-docker-image) Step 1: Pull Krayin Docker Image

To pull the Krayin Docker image from Docker Hub, use the following command:

```bash
docker pull webkul/krayin:latest
```

##### [\#](https://devdocs.krayincrm.com/2.2/introduction/installation.html\#step-run-a-new-container) Step 2: Run a New Container

Once the image is pulled, you can run a new Docker container using the command below. This will bind your local port 80 to the container’s port 80, so Krayin can be accessed via the browser.

```bash
docker run -d -p 80:80 --name krayin-container webkul/krayin:latest
```

> **Note:**
> If port 80 is already in use, you can try using a different port. For example, you can map port 8082 on your local machine to port 80 in the container by running the following command:
>
> ```bash
> docker run -it -d -p 8082:80 webkul/krayin:latest
> ```
>
> After this, you can access the application at `http://localhost:8082/` instead of `http://localhost:80`

##### [\#](https://devdocs.krayincrm.com/2.2/introduction/installation.html\#step-access-krayin-in-your-browser) Step 3: Access Krayin in Your Browser

After the container is up and running, open your browser and navigate to `http://localhost`. This will load the Krayin setup.

##### [\#](https://devdocs.krayincrm.com/2.2/introduction/installation.html\#step-admin-login-credentials) Step 4: Admin Login Credentials

Use the following credentials to log in to the Krayin admin panel:

- **Admin Username**: `admin@example.com`
- **Admin Password**: `admin123`

#### [\#](https://devdocs.krayincrm.com/2.2/introduction/installation.html\#using-krayin-github-docker-repository) 2\. **Using Krayin GitHub Docker Repository**

##### [\#](https://devdocs.krayincrm.com/2.2/introduction/installation.html\#system-requirements) System Requirements

The Krayin GitHub Docker repository automatically handles the system requirements for running Krayin, including the necessary Apache and MySQL configurations. Before proceeding, ensure that you have the latest version of **Docker** and **Docker Compose** installed. You can find installation instructions for your operating system at the following links:

- [Docker Installation Guide(opens new window)](https://docs.docker.com/install/)
- [Docker Compose Installation Guide(opens new window)](https://docs.docker.com/compose/install/)

##### [\#](https://devdocs.krayincrm.com/2.2/introduction/installation.html\#docker-configuration) Docker Configuration

1. **Adjust Ports and Paths**


Open the `docker-compose.yml` file and configure the ports for Apache, MySQL, and PHPMyAdmin. You can also specify the volumes and MySQL credentials. Here's an example configuration:



```yaml
version: '3.1'

    services:
        krayin-php-apache:
            build:
                args:
                    container_project_path: /var/www/html/
                    uid: 1000 # add your uid here
                    user: $USER
                context: .
                dockerfile: ./Dockerfile
            image: krayin-php-apache
            ports:
             - 80:80 # adjust your port here, if you want to change
         volumes:
             - ./workspace/:/var/www/html/

     krayin-mysql:
         image: mysql:8.0
         command: --default-authentication-plugin=mysql_native_password
         restart: always
         environment:
             MYSQL_ROOT_HOST: '%'
             MYSQL_ROOT_PASSWORD: root
         ports:
             - 3306:3306 # adjust your port here, if you want to change
         volumes:
             - ./.configs/mysql-data:/var/lib/mysql/

     krayin-phpmyadmin:
         image: phpmyadmin:latest
         restart: always
         environment:
             PMA_HOST: krayin-mysql
             PMA_USER: root
             PMA_PASSWORD: root
         ports:
             - 8080:80 # adjust your port here, if you want to change

volumes:
     mysql-data:
```

2. **Running the Setup**


After adjusting the configurations, execute the following command to start the Docker containers:



```bash
sh setup.sh
```


##### [\#](https://devdocs.krayincrm.com/2.2/introduction/installation.html\#accessing-krayin) Accessing Krayin

- **Admin Panel**


Access the admin panel at:

`http(s)://your_server_endpoint/admin/login`


Use the default credentials:

  - **Email**: `admin@example.com`
  - **Password**: `admin123`
- **Customer Registration**


Register and log in as a customer at:

`http(s)://your_server_endpoint/customer/register`


* * *

**— OR —**

* * *

### [\#](https://devdocs.krayincrm.com/2.2/introduction/installation.html\#method-%E2%80%94-shared-hosting) ☁️ Method 5 — Shared Hosting

The steps below describe how to deploy Krayin onto a shared-hosting account — this is a **deployment scenario**, not a separate install method. You can pair it with any of the methods above (typically Method 2 or Method 3).

##### [\#](https://devdocs.krayincrm.com/2.2/introduction/installation.html\#download-krayin) 1\. Download Krayin

Go to the [official website(opens new window)](https://krayincrm.com/download/) and download the latest version of Krayin CRM in ZIP format..

##### [\#](https://devdocs.krayincrm.com/2.2/introduction/installation.html\#extract-the-contents) 2\. Extract the Contents

Unzip the downloaded file and extract the contents to your local machine.

##### [\#](https://devdocs.krayincrm.com/2.2/introduction/installation.html\#upload-files-to-your-hosting-account) 3\. Upload Files to Your Hosting Account

Use an FTP client (e.g., FileZilla) or your hosting control panel's File Manager to upload all the extracted files, including hidden files (like .env.example), to the root directory (e.g., public\_html) or a subdirectory of your hosting account (e.g., public\_html/krayin).

##### [\#](https://devdocs.krayincrm.com/2.2/introduction/installation.html\#set-file-permissions) 4\. Set File Permissions

Make the following directories writable by setting appropriate permissions:

```
- storage/
- bootstrap/cache/
```

##### [\#](https://devdocs.krayincrm.com/2.2/introduction/installation.html\#set-up-a-database) 5\. Set Up a Database

Log in to your hosting control panel, create a new database, and assign a user with full privileges to this database. Note the database name, username, and password for later steps.

##### [\#](https://devdocs.krayincrm.com/2.2/introduction/installation.html\#install-dependencies-and-run-installer) 6\. Install Dependencies and Run Installer

- **With SSH Access:**

If your hosting account provides SSH or command-line access, navigate to the project root directory and execute the following commands:

```sh
composer create-project

php artisan krayin-crm:install
```

Provide the required details during the prompts, including application name, URL, locale, currency, database connection, and admin credentials.:

```bash
Please enter the application name :
Please enter the application URL :
Please select the default application locale :
Please select the default currency :
Please select the database connection :
Please select the database host :
Please select the database name :
Please enter your database username :
Please enter your database password :
```

Next, create the admin user credentials:

```bash
Enter the name of the admin user:
Enter the email address of the admin user:
Configure the password for the admin user:
```

- **Without SSH Access:**

1. Run `composer install` locally on your machine.
2. Upload the `vendor` directory to your hosting account via FTP.
3. Update the `.env` file with your database and application details.

##### [\#](https://devdocs.krayincrm.com/2.2/introduction/installation.html\#access-the-application) 7\. Access the Application

Open your browser and visit the application URL (e.g., `http://yourdomain.com/`).

Now your application will be available in your browser.

←
[Requirements](https://devdocs.krayincrm.com/2.2/introduction/requirements.html)[Agent Skills](https://devdocs.krayincrm.com/2.2/introduction/skills.html)
→


![](https://fonts.gstatic.com/s/i/productlogos/translate/v14/24px.svg)

Original text

Rate this translation

Your feedback will be used to help improve Google Translate
