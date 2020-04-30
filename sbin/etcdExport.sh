#! /bin/sh

clear

host="47.92.151.165:8080"
auth="wecise.admin:admin"
key="/"
target="/opt/config.json"

curl -u "${auth}" -X GET "http://$host/config/export?key=${key}" > ${target};
