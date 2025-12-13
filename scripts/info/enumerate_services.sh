#!/bin/bash

SUB_DOMAINS_CSV="$1"
OUTPUT="enumerate_services.csv"

echo "subdomain,ip,port,state,service,version" > "$OUTPUT"

while IFS=',' read -r subdomain _; do
    [[ -z "$subdomain" ]] && continue

    # Resolve IPs
    IPS=$(dig +short "$subdomain")

    if [[ -z "$IPS" ]]; then
        echo "$subdomain,NA,NA,NA,NA,NA" >> "$OUTPUT"
        continue
    fi

    while IFS= read -r ip; do

        echo "Scanning $subdomain ($ip)..."
        
        MAP=$(nmap -p 80,443 -sV "$ip")

        # Extract only port lines
        PORT_LINES=$(echo "$MAP" | grep -E '^[0-9]+/')

        # If no open ports
        if [[ -z "$PORT_LINES" ]]; then
            echo "$subdomain,$ip,NA,NA,NA" >> "$OUTPUT"
            continue
        fi

        # Write each port line
        while IFS= read -r line; do
            port=$(echo "$line" | awk '{print $1}')
            state=$(echo "$line" | awk '{print $2}')
            service=$(echo "$line" | awk '{print $3}')
            version=$(echo "$line" | awk '{print $4,$5,$6,$7,$8,$9,$10}' | xargs)
            echo "$subdomain,$ip,$port,$state,$service,$version" >> "$OUTPUT"
        done <<< "$PORT_LINES"

    done <<< "$IPS"

done < "$SUB_DOMAINS_CSV"
