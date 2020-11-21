#! /bin/sh

clear

host="47.92.151.165:8080"
auth="wecise.admin:admin"
className="/matrix/devops/alert"
target="/opt/odb.mql"



curl -u "${auth}" -X GET "http://$host/mxobject/export?recursive=true&limit=-1&class=${className}" > ${target};
