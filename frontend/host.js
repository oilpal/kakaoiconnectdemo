import {KakaoConfig, KakaoUrl} from './kakaocfg.js';
// import ConnectLive from './connectlive-web-sdk/connectlive-web-sdk.js'

let room = null;
let localMedia = null;

const logConsole = $('#logconsole');

const addLog = (text) => {
    const newLI = document.createElement('li');
    newLI.innerHTML = text;
    // logConsole.appendChild(logNode);

    let ol = document.getElementById('logconsole');
    ol.appendChild(newLI);
}

const roomId = KakaoConfig.roomId;
try {

    // 카카오 라이브에 로그인
    const ret = await ConnectLive.signIn({
        serviceId: KakaoConfig.serviceId,
        serviceSecret: KakaoConfig.serviceSecret
    });
    
    addLog('signIn . ret=' + ret);

    // LocalMedia (로컬미디어) 권한 획득하기
    localMedia = await ConnectLive.createLocalMedia({video: true, audio: true});
    addLog('createLocalMedia()' + localMedia);
}
catch(err) {
    addLog(err);
}


// VideoStream
// videoStream = localMedia.video;

// // create <video> tag
// const videoTag = videoStream?.attach();
// console.log(videoTag);

// 채팅방 접속/이벤트 처리하기
room = await ConnectLive.createRoom();
if (!room) {
    // connectButton.innerHTML = 'failed to create room'
    throw new Error('Failed to create room');
}


room.on('connected', (evt) => {
   // connectButton.innerHTML = 'connected'
    evt.remoteParticipants.forEach((member) => {
        addLog('user: ' + member.id + ' is entered');
       addLog
    });
});

room.on('participantEntered', (evt) => {
    addLog('user: ' + evt.remoteParticipant.id + ' is entered.');
});

room.on('participantLeft', (evt) => {
    addLog('user: ' + evt.remoteParticipantId + ' is left.');
})

// Connect to room ( conference )
await room.connect(roomId);

// Publish stream
await room.publish([localMedia]);

// add Local Video Node (render HTML)
// const localContainer = $('#local-container');
const localContainer = document.querySelector('.local-container');

const videoItem = document.createElement('li');
videoItem.id = 'local-video-item';

const videoHeader = document.createElement('h3');
videoHeader.innerHTML = `Presenter`;

const localVideo = localMedia.video?.attach();
localVideo.id = 'local-video';

videoItem.appendChild(videoHeader);
videoItem.appendChild(localVideo);
localContainer.appendChild(videoItem);

addLog(localContainer);