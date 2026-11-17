#!/bin/sh
# uso: cap.sh arquivo.html largura altura saida.png [tema]
F="$1"; W="$2"; H="$3"; O="$4"; T="${5:-}"
Q=""; [ -n "$T" ] && Q="?tema=$T"
timeout 120 /usr/bin/google-chrome --headless=new --disable-gpu --no-sandbox --hide-scrollbars --force-device-scale-factor=1 --virtual-time-budget=2000 --window-size=$W,$H --screenshot="$O" "file://$F$Q" >/dev/null 2>&1
