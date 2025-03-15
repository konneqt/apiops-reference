docker build -t edgars/krakend-gw-sample .
docker push edgars/krakend-gw-sample
# docker run -p 3980:3980 edgars/krakend-gw-sample

#docker build --platform linux/amd64 -t edgars/krakend-gw-sample .