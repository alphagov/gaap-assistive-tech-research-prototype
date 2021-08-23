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

## Preventing accidently committing secrets / passwords to the Git repo

This repo uses the recommended tools from Cyber to prevent accidently committing secrets / passwords.

It is recommended to install these tools when working on this repository.
More information is available here:
- https://github.com/alphagov/gds-pre-commit

Once setup, you need to run the following command to set up the git commit hooks:
```shell
pre-commit install
```
