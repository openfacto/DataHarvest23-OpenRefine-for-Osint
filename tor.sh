#!/bin/bash                                                              
service tor start &

/app/refine -i 0.0.0.0 -d /data -m 4G
