#!/usr/bin/env bash
set -euo pipefail

# Serves the dev site to a phone or tablet on the same network, and prints a
# code to scan rather than an address to type.
#
# It exists because a touch defect cannot be judged in a desktop browser's
# device emulation. That emulation fakes the events but not the finger,
# the display density, or the engine, and the interaction bugs this project
# ships are in exactly that gap.
#
# The routing needs explaining, because nothing about it is guessable. This dev
# server runs inside WSL, which is a separate virtual machine holding its own
# address. Windows reaches it through a special case for `localhost` that no
# other device on the network gets, so a tablet asking for the Windows address
# arrives at a host with nothing listening on this port. A forward from Windows
# into WSL is the missing link, and it is the one step here that needs an
# administrator, so this script detects its absence and prints the command
# rather than trying to run it.
#
# The forward names the WSL address, which is assigned fresh on every boot, so a
# forward set up yesterday points into nothing today. That staleness is silent:
# the port answers on Windows and the connection is refused behind it. Reading
# the current address and comparing it to what the forward holds is most of what
# this script is for.

# One port for every worktree, rather than the per-worktree offset the other
# three servers derive. A forward covers one port, so a derived port would mean
# an administrator prompt for each new worktree, which is the recurring cost
# this whole script exists to remove. What it gives up is two worktrees serving
# to a device at once, which needs two devices to be worth anything.
port="${DEVICE_PORT:-4400}"

# The address of the interface holding the default route, rather than the first
# of however many `hostname -I` prints. A machine running containers or a VPN
# answers that with an address the forward must not name.
wsl_address=$(ip route get 1.1.1.1 2>/dev/null | awk '{ print $7; exit }')

if [[ -z "$wsl_address" ]]; then
  echo "No default route, so this machine has no address to forward to." >&2
  exit 1
fi

# Only an interface holding a lease is a real network. Windows keeps several
# adapters answering with link-local addresses that route nowhere, and picking
# one of those produces a code that scans and then times out.
windows_address=$(
  powershell.exe -NoProfile -Command \
    "(Get-NetIPAddress -AddressFamily IPv4 |
      Where-Object { \$_.PrefixOrigin -eq 'Dhcp' } |
      Select-Object -First 1 -ExpandProperty IPAddress)" 2>/dev/null |
    tr -d '\r' | tr -d '[:space:]'
)

forwarded_to=$(
  powershell.exe -NoProfile -Command \
    "netsh interface portproxy show v4tov4" 2>/dev/null |
    tr -d '\r' | awk -v port="$port" '$2 == port { print $3; exit }'
)

echo
if [[ -z "$windows_address" ]]; then
  echo "  This host holds no leased address, so nothing on the network can reach it."
  echo "  Connect to Wi-Fi and run this again."
  echo
elif [[ "$forwarded_to" == "$wsl_address" ]]; then
  echo "  Reachable at  http://$windows_address:$port/"
  echo
  # The renderer draws nothing when stdout is not a terminal, which is correct
  # for a code made of block characters and unexplained in a captured log.
  if [[ -t 1 ]]; then
    "$(dirname "$0")/../node_modules/.bin/qrcode-terminal" "http://$windows_address:$port/"
  else
    echo "  Run this in a terminal for a code to scan."
  fi
  echo
else
  if [[ -n "$forwarded_to" ]]; then
    echo "  The forward on port $port points at $forwarded_to, and this machine is now"
    echo "  at $wsl_address. It went stale on the last reboot."
  else
    echo "  No forward on port $port, so nothing outside this machine can reach the server."
  fi
  echo
  echo "  Paste this into an Administrator PowerShell, then run this script again:"
  echo
  echo "    netsh interface portproxy set v4tov4 listenport=$port listenaddress=0.0.0.0 connectport=$port connectaddress=$wsl_address"
  echo
  if [[ -z "$forwarded_to" ]]; then
    echo "  The first time only, the firewall has to let the port in as well:"
    echo
    echo "    netsh advfirewall firewall add rule name=\"WSL dev $port\" dir=in action=allow protocol=TCP localport=$port"
    echo
  fi
fi

echo "  Serving on localhost:$port as well. Stop with ctrl-c."
echo

# Bound to every interface rather than to localhost, which is what lets the
# forward above have something to forward to. The server starts whether or not
# the forward exists, since the local address is useful on its own.
#
# The port is passed rather than left to the config, which derives a different
# one per worktree. Astro refuses a port already held instead of moving to the
# next free one, so a second worktree serving here fails loudly.
exec bun run dev --host --port "$port"
