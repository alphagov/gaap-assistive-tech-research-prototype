# GOV.UK Prototype Kit

Based on the [GOV.UK Prototype Kit](https://govuk-prototype-kit.herokuapp.com/docs).

## Deploying

This prototype is deployed on the [GOV.UK PaaS](https://docs.cloud.service.gov.uk).

Minimal viable deploy commands (from the root directory of the prototype):

```shell
brew install cloudfoundry/tap/cf-cli
cf login -a api.cloud.service.gov.uk -o gds-design
cf push
```
