# Bug Bounty Scripts

## Getting Started

1. `git clone https://github.com/ayushmanchhabra/bugbounty`
2. `cd bugbounty`
3. `chmod +x ./**.*`

## Documentation

Enumerate subdomains and services:

```shell
chmod +x ./enumerate.sh
./enumerate.sh domain.com ./subdomains.csv
```

Identify common vulnerabilities:

```shell
chmod +x ./identify.sh
./enumerate.sh ./subdomains.csv ./vulns.csv
```
