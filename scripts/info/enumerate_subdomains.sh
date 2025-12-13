#!/bin/bash

DOMAIN="$1"
OUTPUT="enumerate_subdomains.csv"

subfinder -silent -d "$DOMAIN" \
    | sed 's/^www\.//' \
    | sort -u \
    > "$OUTPUT"
