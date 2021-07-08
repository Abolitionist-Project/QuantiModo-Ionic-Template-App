#!/bin/bash
set +x
if [[ $EUID -eq 0 ]]; then
    echo
    echo "================ Error ================="
    echo "Do not run this as the root user"
    echo "========================================"
    echo
    exit 1
fi
