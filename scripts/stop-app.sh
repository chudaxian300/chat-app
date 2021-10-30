#!/bin/bash
set -x
PID=$(lsof -t -i:5000)
if [ -z "${PID}" ]; then
    echo 'NO node app running'
  else
    echo "Stop app running on port 5000 with PID ${PID}"
    kill -9 ${PID}
fi
set +x     