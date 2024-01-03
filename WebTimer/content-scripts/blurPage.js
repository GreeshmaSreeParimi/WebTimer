
document.body.style.filter = "blur(10px)";

setTimeout(()=>{
    var removeBlur = confirm("you have been on this page for some time");

    if(removeBlur){
     document.body.style.filter = "blur(0px)";
    }
},1000);






