#!/bin/bash

SRC_CSV="$1"
OUT_CSV="$2"

echo "domain, subdomain, ip, port, finding" > "$OUT_CSV"
while IFS=',' read -r domain subdomain ip port; do

    if [[ $port == 22 ]]; then

        ssh_out=$( ssh -vvv -o BatchMode=yes -o PreferredAuthentications=none "root@$ip" </dev/null 2>&1 )

        auth_methods=$( echo "$ssh_out" | grep 'Authentications that can continue:' | sed 's/.*Authentications that can continue: //' )
        [[ -z $auth_methods ]] && continue
        echo "$domain,$subdomain,$ip,$port,SSH Authentication Methods: $auth_methods" >> "$OUT_CSV"

        weak_ciphers=$(echo "$ssh_out" | grep -oE 'diffie-hellman-group1-sha1|diffie-hellman-group14-sha1|ssh-rsa|cbc|3des|arcfour|hmac-md5|hmac-sha1([^a-z-]|$)' | sort -u | tr '\n' ' ')
        [[ -z $weak_ciphers ]] && continue
        echo "$domain,$subdomain,$ip,$port,SSH Weak Ciphers: $weak_ciphers" >> "$OUT_CSV"
    fi

    if false && [[ $port == 80 ]]; then
        server=$(curl -sI "$ip" | grep -i '^server:' | grep -oiP '(?<=server:\s).*')
        [[ -z $server ]] && continue
        echo "$domain,$subdomain,$ip,$port,Webserver: $server" >> "$OUT_CSV"
    fi

    if false && [[ $port == 443 ]]; then
        server=$(curl -sI "$ip" | grep -i '^server:' | grep -oiP '(?<=server:\s).*')
        [[ -z $server ]] && continue
        echo "$domain,$subdomain,$ip,$port,Webserver: $server" >> "$OUT_CSV"        
    fi
done < "$SRC_CSV"
