#!/bin/bash

echo "CACHE MANIFEST" > cache.manifest
echo "# `date`" >> cache.manifest
echo "//netdna.bootstrapcdn.com/bootstrap/3.1.1/css/bootstrap.min.css" >> cache.manifest
find . -type f | grep -v -f nonCachedFiles >> cache.manifest
