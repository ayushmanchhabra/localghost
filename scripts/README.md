# Bug Bounty Scripts

## Getting Started

1. `git clone https://github.com/ayushmanchhabra/bugbounty`
2. `cd bugbounty`
3. `chmod +x ./**.*`

## Documentation

Enumerate subdomains:

```shell
bash ./info/enumerate_subdomains.sh
cat ./info/enumerate_subdomains.csv
```

Enumerate services:

```shell
bash ./info/enumerate_services.sh ./enumerate_subdomains.csv
cat ./info/enumerate_services.csv
```

Check sub resource integrity:

```shell
bash ./va/sub_resource_integrity.sh ./enumerate_services.csv
```
