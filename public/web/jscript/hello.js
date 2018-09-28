import (
    _ "/web/"
    )

var ret = odb.mql("select * from /matrix/devops/event/ limit 5");
OUTPUT = JSON.stringify(ret) + INPUT;