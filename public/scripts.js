function changeEventFired(){
  let textBox = document.getElementById("messageInput");

  if(textBox.value){
    let xhr = new XMLHttpRequest();
    xhr.open("POST", "/api/typing");
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.send(JSON.stringify({
      data: "idk"
    }));
  }
}
function beginEvent(){
  window.location = "/#anchor"

  setInterval(function(){
    let xhr = new XMLHttpRequest();
    xhr.open("GET", "/api/updates");
    xhr.onreadystatechange = () => {
      if (xhr.readyState === 4) {
        document.getElementById("updateMe").innerHTML = `<div class="messageMainDiv" id="updateMe">
    ${xhr.response}
  </div>`
      }
    };
    xhr.send("");
}, 1500);

}