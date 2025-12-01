import React, { useEffect } from "react";

function LoadOS(){
    useEffect(() =>{
      document.body.style.backgroundColor = "black";
      document.body.style.margin = "0";
    })
    return (
        <>
          <div id="os-loader">
            <p>OnerOS</p>
          </div>
        </>
    );
}

export default LoadOS;