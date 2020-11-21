#! /bin/sh

clear

host="47.92.151.165:8080"
auth="wecise.admin:admin"
key="/"
target="/opt/config.json"

curl --location -u "${auth}" -X POST "http://$host/config/import" --form "uploadfile=@${target}";
