import {KakaoConfig, KakaoUrl} from './kakaocfg.js';

let room = null;
const roomId = KakaoConfig.roomId;
let localMedia = null;

// const logConsole = $('#logconsole');
const buttonConnect = document.querySelector('#connect-host');
const buttonDisconnect = document.querySelector('#disconnect-host');

const addLog = (text) => {
    const newLI = document.createElement('li');
    newLI.innerHTML = text;
    // logConsole.appendChild(logNode);

    let ol = document.getElementById('logconsole');
    ol.appendChild(newLI);
}

const resetLog = () => {
    let ol = document.getElementById('logconsole');
    while(ol.firstChild) {
        ol.removeChild(ol.lastChild);
    }
}

const activateButton = () => {
    buttonConnect.disabled = false;
    buttonDisconnect.disabled = true;
}

const disableButton = () => {
    buttonConnect.disabled = true;
    buttonDisconnect.disabled = false;
}

const createConferenceHost = (room) => {

    room.on('connected', (evt) => {
        // connectButton.innerHTML = 'connected'
         evt.remoteParticipants.forEach((member) => {
             addLog('user: ' + member.id + ' is entered');
         });
     });
     
     room.on('participantEntered', (evt) => {
         addLog('user: ' + evt.remoteParticipant.id + ' is entered.');
     });
     
     room.on('participantLeft', (evt) => {
         addLog('user: ' + evt.remoteParticipantId + ' is left.');
     });
     
     room.on('localVideoPublished', (evt) => {
         const localVideo = evt.localVideo;
         addLog('localVideo.streamId = ' + localVideo.streamId);
     });
}

const addLocalVideoNode = (localMedia) => {
    // add Local Video Node (render HTML)
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
}

const removeLocalVideoNode = () => {
    const videoItem = document.querySelector('#local-video-item');
    videoItem?.remove();
}

const connectConference = async (event) => {

    resetLog();
    disableButton();

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

        // 채팅방 접속/이벤트 처리하기
        room = await ConnectLive.createRoom();
        if (!room) {
            // connectButton.innerHTML = 'failed to create room'
            throw new Error('Failed to create room');
        }

        createConferenceHost(room);
        addLog('Conference Host Created');

        // Connect to room ( conference )
        await room.connect(roomId);

        if (localMedia) {
            // Publish stream
            await room.publish([localMedia]);

            addLog('Video published');
        }
        
        addLocalVideoNode(localMedia);
        addLog('Participant Showed');
    }
    catch(err) {

        console.error(err);

        disConnect.conference();
        disConnect.localMedia();
        disConnect.user();
        disConnect.buttonStatus();
        addLog('Failed to Start Servicee.' + err);
    }
}

const disconnectConference = (event) => {
    try {

        if(!room) {
            throw new Error('No Conference to Stop');
        }

        disConnect.conference();

        if (localMedia) {
            disConnect.localMedia();
        }

        disConnect.user();
        disConnect.buttonStatus();
        
    }
    catch(err) {
        addLog('disconnectConference() error. ' + err);
    }
}

const disConnect = {
    conference() {
        try {
            room?.disconnect();
        }
        catch(err) {
            console.log(err);
            throw new Error('room.disconnect() error');
        }
        
        addLog('Conference Disconnected');
    },

    localMedia() {
        localMedia?.stop();
        localMedia = null;

        removeLocalVideoNode();
        addLog('Video Disconnected');
    },

    user() {
        ConnectLive.signOut();
        addLog('User Signed Out');
    },

    buttonStatus() {
        activateButton();
        addLog('button activated');
    }
}

// const btnConnectNode = $('#connectButton');
buttonConnect.onclick = connectConference;
buttonDisconnect.onclick = disconnectConference;
