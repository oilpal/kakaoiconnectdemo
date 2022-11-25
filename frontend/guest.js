import {KakaoConfig, KakaoUrl} from './kakaocfg.js';

let room = null;
const roomId = KakaoConfig.roomId;
let remoteParticipants = []; // guest 쪽에서 필요함.

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

const addRemoteVideoNode = (videos) => {
    const remoteContainer =document.querySelector('.remote-container');

    videos.forEach((video) => {
        const videoItem = document.createElement('li');
        videoItem.id = video.participantId;

        const videoHeader = document.createElement('h3');
        videoHeader.innerHTML = 'Presenter';
        addLog('Join the webinar');

        const remoteVideo = video.attach();
        remoteVideo.id = 'remote-video';

        videoItem.appendChild(videoHeader);
        videoItem.appendChild(remoteVideo);
        remoteContainer.appendChild(videoItem);
    });
}

const disConnect = {
    conference() {
        room?.disconnect();
        addLog('Conference Disconnected');
    },
    remoteParticipants() {
        remoteParticipants = [];
        removeRemoteVideoAll();
        addLog('Participants Cleared');
    },
    user() {
        ConnectLive.signOut();
        addLog('User Signed Out');
    },
    buttonStatus() {
        activateButton();
        changeStatus('Disconnected');
    },
};

const createConferenceGuest = (room) => {
    room.on('connected', async (evt) => {
        // connectButton.innerHTML = 'connected'
        if (!evt.remoteParticipants.length) {

            disConnect.conference();
            disConnect.user();
            
            addLog('No webinar starts yet');
        }
    
        evt.remoteParticipants.forEach(async (participant) => {
            let videos = [];
            const unsubscribedVideos = participant.getUnsubscribedVideos();
    
            if (unsubscribedVideos.length) {
                const videoIds = unsubscribedVideos.map((video) => video.getVideoId());
                videos = await room.subscribe(videoIds);
            }
    
            remoteParticipants.push({participant, videos});
            remoteParticipants.forEach((remoteParticipant) => {
                const isSameId = remoteParticipant.participant.id === participant.id;
                if (isSameId) {
                    addRemoteVideoNode(participant.videos);
                }
            });
        });
    });
    
    room.on('remoteVideoPublished', async (evt) => {
        const videos = await room.subscribe([evt.remoteVideo.videoId]);
    
        if (video.length) {
            const preJoinedParticipant = remoteParticipants.find(
                (item) => item.participant.id === evt.remoteParticipant.id
            );
    
            if (preJoinedParticipant) {
                preJoinedParticipant.videos = 
                    preJoinedParticipant.videos.concat(videos);
            }
        }
    
        addRemoteVideoNode(videos);
    });
    
    room.on('remoteVideoUnpublished', async (evt) => {
    
        const participantToRemove = remoteParticipants.find(
            (item) => item.participant.id === evt.remoteParticipant.id
        );
    
        if (participantToRemove) {
            participantToRemove.videos = participantToRemove.videos.filter(
                (video) => video.videoId !== evt.remoteVideo.videoId
            );
    
            disConnect.conference();
            disConnect.remoteParticipants();
            disConnect.user();
            activateButton();
    
            addLog(`${evt.remoteParticipant.id} Left`);
        }
    });
    
};

const connectConference = async (event) => {

    try {

        resetLog();
        disableButton();

        // Provisioning (카카오 라이브에 로그인)
        const ret = await ConnectLive.signIn({
            serviceId: KakaoConfig.serviceId,
            serviceSecret: KakaoConfig.serviceSecret
        });

        addLog('signIn . ret=' + ret);

        // 채팅방 접속/이벤트 처리하기
        room = await ConnectLive.createRoom();
        if (!room) {
            // connectButton.innerHTML = 'failed to create room'
            throw new Error('Failed to create room');
        }

        //
        createConferenceGuest(room);

        addLog('Conference Guest Created');

        // Connect to room ( conference )
        await room.connect(roomId);
    }
    catch(err) {
        addLog('connectConference error=' + err);


    }
}

const disconnectConference = () => {

};



// add Local Video Node (render HTML)
// const localContainer = $('#local-container');
// const localContainer = document.querySelector('.local-container');

// const videoItem = document.createElement('li');
// videoItem.id = 'local-video-item';

// const videoHeader = document.createElement('h3');
// videoHeader.innerHTML = `Presenter`;

// const localVideo = localMedia.video?.attach();
// localVideo.id = 'local-video';

// videoItem.appendChild(videoHeader);
// videoItem.appendChild(localVideo);
// localContainer.appendChild(videoItem);

// addLog(localContainer);

buttonConnect.onclick = connectConference;
buttonDisconnect.onclick = disconnectConference;