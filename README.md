# Interfacer API

Interfacer API is an integration platform for software teams. Instead of building and maintaining separate connections to hundreds of third-party services, developers call a single unified API. Interfacer handles OAuth and key management, automatic retries, rate-limit backoff, and webhook delivery, so product teams can ship integrations in days rather than quarters.

A demo site: https://interfacerapi.com

## llms.txt

`llms.txt` is generated from `sitemap.xml` by `scripts/generate-llms-txt.mjs`. To have it rebuilt automatically on every commit, run this once in your clone:

    git config core.hooksPath .githooks
