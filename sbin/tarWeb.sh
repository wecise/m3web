tar zcvf web-$(date +"%Y_%m_%d").tar.gz /opt/matrix/web/public/ /opt/matrix/web/templates/  --exclude=/opt/matrix/web/public/web/vendor-20200726 --exclude=.DS_Store
