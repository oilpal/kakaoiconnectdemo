import {KakaoConfig, KakaoUrl} from './kakaocfg.js';

let room = null;
const roomId = KakaoConfig.roomId;
let remoteParticipants = []; // guest 쪽에서 필요함.

// const logConsole = $('#logconsole');
const buttonConnect = document.querySelector('#connect-host');
const buttonDisconnect = document.querySelector('#disconnect-host');

const createConferenceGuest = (room) => {
    room.on('connected', async (evt) => {
        // connectButton.innerHTML = 'connected'
        if (!evt.remoteParticipants.length) {

            disConnect.conference();
            disConnect.user();
            disConnect.buttonStatus();
            addLog('No webinar starts yet');
        }
    
        evt.remoteParticipants.forEach(async (participant) => {
            let videos = [];
            const unsubscribedVideos = participant.getUnsubscribedVideos();
    
            if (unsubscribedVideos.length) {
                const videoIds = unsubscribedVideos.map((video) => video.getVideoId());
                videos = await room.subscribe(videoIds);

                videoIds.forEach( (videoID) => {
                    addLog(`[connected] remoteParticipant ${participant.id}. videoid ${videoID} try subscribing`);
                });
                videos.forEach( (video) => {
                    addLog(`[connected] remoteParticipant ${participant.id}. video.id ${video.videoId} subscribed o.k`);
                });
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
    
        if (videos.length) {
            const preJoinedParticipant = remoteParticipants.find(
                (item) => item.participant.id === evt.remoteParticipant.id
            );
    
            if (preJoinedParticipant) {
                preJoinedParticipant.videos =
                    preJoinedParticipant.videos.concat(videos);
            }

            addLog(`[remoteVideoPublished] user ${evt.remoteParticipant.id} remoteVideoPublished`);
            videos.forEach((video) => {
                addLog(`[remoteVideoPublished] video.participantId ${video.participantId} video ${video.videoId} published`);
            });
        }
    
        addRemoteVideoNode(videos);
    });
    
    room.on('remoteVideoUnpublished',  (evt) => {
        const participantToRemove = remoteParticipants.find(
            (item) => item.participant.id === evt.remoteParticipant.id
        );

        if (participantToRemove) {
            participantToRemove.videos = participantToRemove.videos.filter(
                (video) => video.videoId !== evt.remoteVideo.videoId
            );
        }

        disConnect.conference();
        disConnect.remoteParticipants();
        disConnect.user();
        activateButton();
            // changeStatus('Disconnected');
        addLog(`${evt.remoteParticipant.id} Left`);
    });

    room.on('remoteVideoStateChanged', (evt)=>{
        //param.remoteParticipant
        //param.remoteVideo
        addLog('remoteVideoStateChanged entered');
    });
};

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

        addLog(`[addRemoteVideoNode] participant ${video.participantId} video ${video.videoId}`);
    });
};

const removeRemoteVideoAll = () => {
  const remoteContainer = document.querySelector('.remote-container');
  remoteContainer.innerHTML = '';
};

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

        createConferenceGuest(room);

        addLog('Conference Guest Created');

        // Connect to room ( conference )
        await room.connect(roomId);

        if (room.localParticipant) {
            addLog(`me ${room.localParticipant.id} entered`);
        }
        
    }
    catch(err) {
        addLog('connectConference error=' + err);

        console.log(error);
        disConnect.conference();
        disConnect.localMedia();
        disConnect.remoteParticipants();
        disConnect.user();
        disConnect.buttonStatus();
        // changeStatus('Failed to Connect');
        alert('Failed to Start Service');

    }
}

const disconnectConference = () => {
  try {
    // changeStatus('Disconnecting...');

    if (!room || !roomId) throw new Error('No Conference to Stop');

    disConnect.conference();

    disConnect.remoteParticipants();
    disConnect.user();
    disConnect.buttonStatus();
  } catch (error) {
    console.error(error);
    // changeStatus('Failed to Disconnect');
  }
};

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
        // changeStatus('Disconnected');
    },
};

buttonConnect.onclick = connectConference;
buttonDisconnect.onclick = disconnectConference;