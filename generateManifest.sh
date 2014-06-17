#!/bin/bash

echo "CACHE MANIFEST" > cache.manifest
echo "# `date`" >> cache.manifest
find . -type f | grep -v -f nonCachedFiles >> cache.manifest

echo "<span class='small'>Last updated: `date +"%Y %b %d"`</span>" > templates/lastUpdated.html