// I choose the Nike Exercise and Wellness Robot. The input is what the user says. The out put is the speaking of the robot to illustrate the exercise. The image visual processing is the face detection. When the user is detected, the robot will moves onto the next movements/action upon verbal confirmation from the user saying "next move". When the user is not detected, the robot will stop inputspeech recognition and the screen will show "End. Nobody is here "
var grammar =
  "#JSGF V1.0; grammar emar; public <greeting> = hello | hi; <person> = Wesley | Beck;";
var recognition = new window.webkitSpeechRecognition();
var speechRecognitionList = new window.webkitSpeechGrammarList();
speechRecognitionList.addFromString(grammar, 1);
recognition.grammars = speechRecognitionList;
recognition.continuous = true;
recognition.lang = "en-US";
recognition.interimResults = false;
recognition.maxAlternatives = 1;

let num = 0
let answer = ["Do Jumping jacks 10 times",
"Do high kness 10 times","strech your arm"];
let srclist=["https://i.postimg.cc/9QL8fxGv/1-0-GIF-2.gif","https://i.postimg.cc/k5wjBTK0/1-0-GIF-1.gif","https://i.postimg.cc/fbxM7dKf/Screen-Shot-2021-12-14-at-8-53-51-PM.png"]


 
    

/* This function checks and sets up the camera */
function startVideo() {
  if (navigator.mediaDevices && 
      navigator.mediaDevices.getUserMedia) {
    navigator.mediaDevices.getUserMedia({video: true})
      .then(handleUserMediaSuccess)
      .catch(handleUserMediaError);
  }
}

function handleUserMediaError(error){
  console.log(error);
}

function handleUserMediaSuccess(stream){
  var video = document.getElementById("myVideo");
  video.srcObject = stream;
  // video.play();
  console.log("success");
  window.setInterval(captureImageFromVideo, 200);
}

// The variable that holds the detected face information, which will be updated through Firebase callbacks
var detection = null;
var isRecognizing = false;

function captureImageFromVideo() {
  const canvas = document.getElementById("mainCanvas");
  const context = canvas.getContext("2d");
  
  const video = document.getElementById("myVideo");
  canvas.setAttribute("width", video.width);
  canvas.setAttribute("height", video.height);  
  // Draw video image onto Canvas
  context.drawImage(video, 0, 0, video.width, video.height);

  sendSnapshot();
  
  //var dataObj = context.getImageData(0, 0, canvas.width, canvas.height);

  // If a face detection has been received from the database, draw a rectangle around it on Canvas
  
  if (detection) {
    const face = detection[0];
    context.beginPath();
    context.moveTo(face.x, face.y);
    context.lineTo(face.x + face.w, face.y);
    context.lineTo(face.x + face.w, face.y + face.h);
    context.lineTo(face.x, face.y + face.h);
    context.lineTo(face.x, face.y);
    context.lineWidth = 5;
    context.strokeStyle = "#0F0";
    context.fillStyle = "#0F0";
    context.stroke();
    
     let innerElement = document.getElementById("innerElement");
  innerElement.innerHTML = 'Hello. Say "next move" to go to the next movement';
    let userDetect = document.getElementById("userDetect");
  userDetect.innerHTML = "Somebody is here"
    if (!isRecognizing) {
       startRecognition();
    }
    recognition.onresult = processSpeech;
  }
  else{
    let userDetect = document.getElementById("userDetect");
  userDetect.innerHTML = "Nobody is here";
    let innerElement = document.getElementById("innerElement");
  innerElement.innerHTML = 'End';  document.getElementById("img").src="https://i.postimg.cc/dVxLrsv9/swoosh-logo-black.jpg"
  }
}
  
function sendSnapshot() {
  const canvas = document.getElementById("mainCanvas");
  // Convert the image into a a URL string with built0-in canvas function 
  const data = canvas.toDataURL();
  
  const commaIndex = data.indexOf(",");
  
  const imgString = data.substring(commaIndex+1,data.length);
  storeImage(imgString);
}

// Initialize Firebase
var config = {
    apiKey: "AIzaSyBlPE-JtgUx4eepKwxFAtwR5pwZbFxnQ_U",
    authDomain: "rhealab9.firebaseapp.com",
    databaseURL: "https://rhealab9-default-rtdb.firebaseio.com/",
    projectId: "rhealab9",
    storageBucket: "rhealab9.appspot.com",
    messagingSenderId: "554451740455",
    appId: "1:554451740455:web:a3758e7c8e68b180f7eb02",
    measurementId: "G-2BCW6J2E7L"
  };
firebase.initializeApp(config);

function storeImage(imgContent)
{
    // store this at a particular place in our database
    var dbRef = firebase.database().ref('/');
    dbRef.update({"image":imgContent});
}

// Register a callback for when a detection is updated in the database
var dbRef = firebase.database().ref('/detection/');
dbRef.on("value", newFaceDetected);

function newFaceDetected(snapshot) {
  detection = snapshot.val();
}

function startRecognition() {
  if (isRecognizing) return;
  if (num < answer.length) {
    console.log("start")
    isRecognizing = true;
    recognition.start();
  } 
}



function processSpeech(event) {
  
  var inputSpeech = event.results[0][0].transcript;
 
 
  
  if(inputSpeech=="next move"){
    
  speak(answer[num],'en-US');
      document.getElementById("img").src=srclist[num]
  num++
  }
 ;  
  console.log("stop")
  recognition.stop();
  isRecognizing = false;
}




function speak(text, lang) {
  /*Check that your browser supports text to speech*/
  if ('speechSynthesis' in window) {
    const msg = new SpeechSynthesisUtterance();
    const voices = window.speechSynthesis.getVoices();
    if (voices.length > 0) {
      console.log("Your browser supports " + voices.length + " voices");
      console.log(voices);
      msg.voice = voices.filter(function(voice) { return voice.lang == lang; })[1];
    }
    msg.voiceURI = 'native';
    msg.volume = 0.8; // 0 to 1
    msg.rate = 0.6; // 0.1 to 10
    msg.pitch = 0.6; //0 to 2
    msg.text = text;
    msg.lang = lang;
    msg.onend = function(e) {
      console.log('Finished in ' + e.elapsedTime + ' milliseconds.');
    };
    speechSynthesis.speak(msg);
  }
}