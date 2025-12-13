# Bug Bounty Scripts

## Getting Started

1. `git clone https://github.com/ayushmanchhabra/bugbounty`
2. `cd bugbounty`
3. `chmod +x ./**.*`

## Documentation

Enumerate subdomains:

```shell
bash ./info/enumerate_subdomains.sh
cat ./info/enumerate_subdomains.cat
```

Enumerate services:

```shell
bash ./info/enumerate_services.sh
cat ./info/enumerate_services.cat
```

Check sub resource integrity:

```shell
bash ./va/sub_resource_integrity.sh https://example.com
```
