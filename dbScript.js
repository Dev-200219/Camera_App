let req = indexedDB.open("Gallery",1);
let database;
let mediaCount = 0;

req.addEventListener("success", function(){
    database = req.result;
})

req.addEventListener("upgradeneeded", function(){
    let db = req.result;
    db.createObjectStore("Media",{keyPath:"mId"});
})

req.addEventListener("error", function(){

})

function saveMedia(media)
{
    if(!database)
    return;

    let data = {
        mId: Date.now(),
        mediaData: media
    }

    let tx = database.transaction("Media","readwrite");
    let mediaObjectStore = tx.objectStore("Media");
    mediaObjectStore.add(data);
}

function loadMedia(){
    if(!database)
    return;

    let tx = database.transaction("Media","readonly");
    let mediaObjectStore = tx.objectStore("Media");
    let mediaContainer = document.querySelector(".media-container");

    let req = mediaObjectStore.openCursor();

    req.addEventListener("success", function(){
        let cursor = req.result;
        if(cursor)
        {
            mediaCount++;
            let mediaCardDiv = document.createElement("div");
            mediaCardDiv.classList.add("media-card");
            mediaCardDiv.innerHTML = `<div class="actual-media"></div>
            <div class="media-buttons">
                <button id="download">Download</button>
                <button data-mid = ${cursor.value.mId} id="delete">Delete</button>
            </div>`

            let actualMediaDiv = mediaCardDiv.querySelector(".actual-media");
            let data = cursor.value.mediaData;
            let downloadBtn = mediaCardDiv.querySelector("#download");
            let deleteBtn = mediaCardDiv.querySelector("#delete");

            deleteBtn.addEventListener("click", function(e){
                let mId = Number(deleteBtn.getAttribute("data-mid"));
                deleteMedia(mId); 
                e.currentTarget.parentElement.parentElement.remove();
            })

            if((typeof data) == "string")
            {
                let imageTag = document.createElement("img");
                imageTag.src = data;
                downloadBtn.addEventListener("click", function(){
                    downloadMedia(data, "image");
                })

                actualMediaDiv.append(imageTag);
            }
            else if((typeof data) == "object")
            {
                let videoURL = URL.createObjectURL(data);
                let videoTag = document.createElement("video");
                videoTag.src = videoURL;
                downloadBtn.addEventListener("click", function(){
                downloadMedia(videoURL, "video");
                });
                videoTag.autoplay = true;
                videoTag.muted = true;
                videoTag.loop = true;
                actualMediaDiv.append(videoTag);
            }

            mediaContainer.append(mediaCardDiv);
            cursor.continue();
        }
        else
        {
            if(mediaCount == 0)
            {
                let imageTag = document.createElement("img");
                imageTag.src = "./no_img.jpg";
                mediaContainer.append(imageTag);
            }
        }
    })
}

function downloadMedia(url, type)
{
    let a = document.createElement("a");
    a.href = url;
    if(type == "image")
    a.download = "image.jpeg";
    else
    a.download = "video.mp4";
    
    a.click();
    a.remove();
}

function deleteMedia(mId)
{
    let tx = database.transaction("Media","readwrite");
    let mediaObjectStore = tx.objectStore("Media");

    mediaObjectStore.delete(mId);
}