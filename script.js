let videoPlayer = document.querySelector("video");
let mediaRecorder;
let reocrdButton = document.getElementById("record");
let isRecording = false;
let chunks= [];
let captureBtn = document.getElementById("capture");
let body = document.querySelector("body");
let filters = document.querySelectorAll(".filter");
let filter = "";

for(let i = 0; i < filters.length; i++)
{
    let filterSelected = filters[i];
    filterSelected.addEventListener("click", function(){
        
        if(document.querySelector(".filter-div"))
        document.querySelector(".filter-div").remove();
    
        filter = filterSelected.style.backgroundColor;
        let filterDiv = document.createElement("div");
        filterDiv.classList.add("filter-div");
        filterDiv.style.backgroundColor = filter;
        body.append(filterDiv);
    })
}

reocrdButton.addEventListener("click", function(){
    let innerSpan = reocrdButton.querySelector("span");
    if(isRecording)
    {
        //recording ko stop krna hai
        //already defined function hai on media recorder
        mediaRecorder.stop();
        isRecording = false;   
        innerSpan.classList.remove("record-animation");
     }
    else
    {
        //recording ko start krna hai
        //already defined function hai on media recorder
        mediaRecorder.start();
        isRecording = true;
        innerSpan.classList.add("record-animation");
    }    
})

captureBtn.addEventListener("click",function(){
    let innerSpan = captureBtn.querySelector("span");
    innerSpan.classList.add("capture-animation");
    setTimeout(function(){
        innerSpan.classList.remove("capture-animation");
    },1000)
    let canvas = document.createElement("canvas");
    canvas.height = videoPlayer.videoHeight;
    canvas.width = videoPlayer.videoWidth;
    let tool = canvas.getContext("2d");
    tool.drawImage(videoPlayer, 0, 0);

    if(filter)
    {
        tool.fillStyle = filter;
        tool.fillRect(0,0,canvas.width,canvas.height);
    }

    let imgURL = canvas.toDataURL();
    let a = document.createElement("a");
    a.href = imgURL;
    a.download = "img.jpeg";
    a.click();
    a.remove();
})


//navigator ek object hai Navigator function ka jisme ek object aur hai mediaDevices jiska ek function hai getUserMedia jiske through hum permission lete hai camera aur audio device use krne ki
let promiseToUseCamera = navigator.mediaDevices.getUserMedia({video: true, audio: true});

//yeh getUserMedia function hume ek promise return krta hai aur ek mediaStremObject return krta hai jisko agar hum layman terms mai khe toh usme vo sab kuch aa rha hota hai (Continuous flow of data) jo camera mai dikh rha hota hai ya mic mai bola ja rha hota hai.
promiseToUseCamera.then(function(mediaStreamObj){
    //video tag ko hume ek src dena hota hai lekin humaare pass koi url nhi hai isliye hum usko object dete hai joki mediaStreamObject hota hai jo humko getUserMedia ne return kra hota hai aur uska srcObject ki tarah set krdete hai video tag mai
    videoPlayer.srcObject = mediaStreamObj;
    

    //record krti hai uss stream ki video ko jiska object hum usse paas krte hai
    mediaRecorder = new MediaRecorder(mediaStreamObj);

    //already defined event on mediaRecorder is dataavailabe, jab tak data available hai vo uss chunk ko leta hai aur usse aur usse array mai push krata rehta hai
    mediaRecorder.addEventListener("dataavailable", function(e){
        chunks.push(e.data);
    })

    mediaRecorder.addEventListener("stop", function(){
        //jaise hi stop hota hai, hum uss chunk ka ek blob bnate hai using already defined object Blob
        let blob = new Blob(chunks, {type:"video/mp4"});
        chunks=[];
        
        //agar hume usse blob ko download krna hai toh uska link bnana hoga aur uss link ko bnane ke liye hai already pre-defined function URL.createObjectURL isme vo blob paas kro aur uska link bn jata hai
        let blobLink = URL.createObjectURL(blob);

        //download krne ke liye ek a tag bnaya aur usme yeh link attach krdia, aur usko download property dedi, phir uss or click krdia
        let videoDownloadLink = document.createElement("a");
        videoDownloadLink.href = blobLink;
        videoDownloadLink.download = "video.mp4";
        videoDownloadLink.click();
        videoDownloadLink.remove();
    })
})
.catch(function(){
    alert("Access Denied to Microphone and Camera");
})
