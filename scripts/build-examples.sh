#!/usr/bin/env bash

set -ex

declare -a DIRS=(
    "./examples/crypto"
    "./examples/erc20"
    "./examples/flipper"
    "./examples/incrementer"
    "./examples/inherent-flipper"
    "./examples/lazy"
    "./examples/vector"
)

for dir in ${DIRS[@]}; do
    echo $dir
    yarn example $dir
done