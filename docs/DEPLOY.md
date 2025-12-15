\# DEPLOY: La Criminalite — Production deployment guide



\## Overview

Этот документ описывает, как собрать и задеплоить проект в Kubernetes, запустить миграции и включить cron/job.



\## Prerequisites

\- Docker registry (credentials)

\- Kubernetes cluster with ingress (nginx) and cert-manager (optional)

\- GitHub repository with Actions enabled (optional)

\- Secrets stored in Kubernetes: `lacriminalite-secrets` with keys:

&nbsp; - DATABASE\_URL

&nbsp; - BOT\_TOKEN

&nbsp; - ADMIN\_API\_SECRET

&nbsp; - S3\_BUCKET (optional)

&nbsp; - S3\_REGION (optional)

&nbsp; - S3\_ACCESS\_KEY\_ID (optional)

&nbsp; - S3\_SECRET\_ACCESS\_KEY (optional)

&nbsp; - YOOKASSA\_SHOP\_ID, YOOKASSA\_SECRET (if used)

&nbsp; - SDEK\_API\_TOKEN (if used)



\## Build \& Push (manual)

```bash

docker build -t registry.example.com/lacriminalite-web:latest -f apps/web/Dockerfile .

docker push registry.example.com/lacriminalite-web:latest

docker build -t registry.example.com/lacriminalite-bot:latest -f apps/bot/Dockerfile .

docker push registry.example.com/lacriminalite-bot:latest



