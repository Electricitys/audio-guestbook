#!/bin/sh

### BEGIN INIT INFO
# Provides:          audio_guestbook
# Required-Start:    $all
# Required-Stop:     $all
# Default-Start:     2 3 4 5
# Default-Stop:      0 1 6
# Short-Description: Audio guestbook daemon
# Description:       Audio guestbook for events
### END INIT INFO

set -e

. /lib/lsb/init-functions

SERVER_DAEMON_PATH="/home/user/audio-guestbook"
SERVER_DAEMON="$SERVER_DAEMON_PATH/guestbook-linux-aarch64"
WEB_DAEMON_PATH="/home/user/audio-guestbook"
WEB_DAEMON="$WEB_DAEMON_PATH/gb-serve -n console/"
NAME="audio_guestbook"
PIDFILE="/var/run/$NAME.pid"
WEBPIDFILE="/var/run/${NAME}-web.pid"

start() {
    log_daemon_msg "Starting $NAME"

    cd "$SERVER_DAEMON_PATH"

    nohup "$SERVER_DAEMON" >"$SERVER_DAEMON_PATH/server.log" 2>&1 &
    echo $! > "$PIDFILE"
    
    nohup $WEB_DAEMON >"$SERVER_DAEMON_PATH/web-server.log" 2>&1 &
    echo $! > "$WEBPIDFILE"

    log_end_msg $?
}

stop() {
    log_daemon_msg "Stopping $NAME"

    if [ -f "$PIDFILE" ]; then
        kill "$(cat $PIDFILE)" || true
        rm -f "$PIDFILE"
    fi

    if [ -f "$WEBPIDFILE" ]; then
        kill "$(cat $WEBPIDFILE)" || true
        rm -f "$WEBPIDFILE"
    fi

    log_end_msg $?
}

case "$1" in
    start)
        start
        ;;
    stop)
        stop
        ;;
    restart)
        stop
        start
        ;;
    status)
        if [ -f "$PIDFILE" ]; then
            echo "$NAME server is running, pid=$(cat $PIDFILE)"
        else
            echo "$NAME server is not running"
        fi

        if [ -f "$WEBPIDFILE" ]; then
            echo "$NAME web is running, pid=$(cat $WEBPIDFILE)"
        else
            echo "$NAME web is not running"
        fi
        ;;
    *)
        echo "Usage: $0 {start|stop|restart|status}" >&2
        exit 1
        ;;
esac

exit 0
