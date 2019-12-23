#! /bin/sh

clear

PS3="Please select a option to upgrade the M³ System："
options=("Upgrade web" "Upgrade web lib" "Upgrade web server" "Download FileSystem" "Upgrade Mql")
user="matrix"
host="47.92.151.165"
auth="wecise.admin:admin"
header="-H 'Accept: */*' -H 'Accept-Encoding: gzip, deflate' -H 'cache-control: no-cache'"
files=("app" "assets" "etc" "home" "opt" "script")
filesTarget="/opt/matrix/web/templates"
mql= ""

select choice in "${options[@]}" "Exit"; do

	case $REPLY in

		1) 	echo "$choice";
			time scp -r "${user}@${host}":/opt/matrix/web/templates /opt/matrix/web/;;
		
		2) echo "$choice";
			time scp -r "${user}@${host}":/opt/matrix/web/public/web /opt/matrix/web/public/;;
		
		3) echo "$choice";
			mv /opt/matrix/web/web /opt/matrix/web/web.bak.$(date +"%Y_%m_%d");
			time scp "${user}@${host}":/opt/matrix/web/web /opt/matrix/web;
			echo "*************************************************************";
			echo "";
			echo "Need to restart the web server to take effect";
			echo "";
			echo "*************************************************************";;
		
		4) echo "$choice";

			for i in "${files[@]}"
			do
				curl -u "${auth}" -X POST "http://$host/fs/export?issys=true&srcpath=/${i}"  ${header} -F srcpath=${i} > ${filesTarget}/${i}.zip;
			done
			
			echo "*************************************************************";
			ls ${filesTarget}/*.zip;
			echo "*************************************************************";
			echo "";
			echo "Open http://${host}";
			echo "Need to import the zip into the M³ System to take effect";
			echo "";
			echo "*************************************************************";;

		5) echo "$choice"

			curl -u "${auth}" "http://$host/mxobject/mql?${mql}";;

		6) echo "Exit";break;;

		*) echo "Wrong choice!";;
	esac

done