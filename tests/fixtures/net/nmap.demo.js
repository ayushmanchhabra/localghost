import Nmap from "../../../src/net/nmap.js";

const nmap = new Nmap("nmap");

const scan = nmap.ping("ARP", "192.168.1.0/24");

console.log(scan);
