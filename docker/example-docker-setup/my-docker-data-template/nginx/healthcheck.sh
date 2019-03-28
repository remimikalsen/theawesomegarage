#!/bin/bash

if service nginx status; then
    exit 0
else
    exit 1
fi
