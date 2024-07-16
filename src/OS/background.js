import React from "react";
var pjson = require('../../package.json');

function Background(){
    return (
        <>
          <div id="os-background">
            <p>OnerOS Web (Preview) {pjson.version} (Pre-release)</p>
          </div>
        </>
    );
}

export default Background;