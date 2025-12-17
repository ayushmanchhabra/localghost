#!/bin/bash

DOMAIN="$1"
OUTPUT="$2"

if [[ -z "$DOMAIN" || -z "$OUTPUT" ]]; then
    echo "Usage: $0 <domain> <output.csv>"
    exit 1
fi

SUB_DOMAINS=$(
  subfinder -silent -d "$DOMAIN" \
    | sed 's/^www\.//' \
    | sort -u
)

echo "subdomain,ip,port,state,service,version" > "$OUTPUT"

while IFS= read -r subdomain; do
    [[ -z "$subdomain" ]] && continue
    echo "[*] Scanning $subdomain..." >&2

    IPS=$(dig +short "$subdomain" | grep -Eo '([0-9]{1,3}\.){3}[0-9]{1,3}')

    if [[ -z "$IPS" ]]; then
        echo "$subdomain,NA,NA,NA,NA,NA" >> "$OUTPUT"
        continue
    fi

    while IFS= read -r ip; do
        MAP=$(nmap -p 80,443 -sV "$ip" 2>/dev/null)
        PORT_LINES=$(echo "$MAP" | grep -E '^[0-9]+/')

        if [[ -z "$PORT_LINES" ]]; then
            echo "$subdomain,$ip,NA,NA,NA,NA" >> "$OUTPUT"
            continue
        fi

        while IFS= read -r line; do
            port=$(awk '{print $1}' <<< "$line")
            state=$(awk '{print $2}' <<< "$line")
            service=$(awk '{print $3}' <<< "$line")
            version=$(awk '{for (i=4;i<=NF;i++) printf "%s ", $i}' <<< "$line" | xargs)

            echo "$subdomain,$ip,$port,$state,$service,$version" >> "$OUTPUT"
        done <<< "$PORT_LINES"

    done <<< "$IPS"

done <<< "$SUB_DOMAINS"
