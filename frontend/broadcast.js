// MODULEs
import './style.css';

import ConnectLive from '@connectlive/connectlive-web-sdk';

// DATA
let localMedia = null;
let room = null;
let remoteParticipants = [];
let roomId = '';

const buttonGroupHost = document.querySelector('#button-group-host');
const connectButtonHost = document.querySelector('#connect-host');
const disconnectButtonHost = document.querySelector('#disconnect-host');
const buttonGroupGuest = document.querySelector('#button-group-guest');
const connectButtonGuest = document.querySelector('#connect-guest');
const disconnectButtonGuest = document.querySelector('#disconnect-guest');
const hostRoomId = document.querySelector('#host-room-id');
const guestRoomId = document.querySelector('#guest-room-id');
const status = document.querySelector('#status');
const log = document.querySelector('#log');

// METHODs
const createConferenceHostOptions = (room) => {
    room.on('participantEntered', (evt) => {
        addLog(`${evt.remoteParticipant.id} joined`);
    });

    room.on('participantLeft', (evt) => {
        addLog(`${evt.remoteParticipantId} left`);
    });
};

const createConferenceGuestOptions = async (room) => {
    room.on('connected', async (evt) => {
        if (!evt.remoteParticipants.length) {
            disConnect.conference();
            disConnect.user();
            disConnect.buttonStatus();
            alert('No webinar starts yet');
        }

        evt.remoteParticipants.forEach(async (participant) => {
            let videos = [];
            const unsubscribedVideos = participant.getUnsubscribedVideos();

            if (unsubscribedVideos.length) {
                const videoIds = unsubscribedVideos.map((video) => video.getVideoId());
                videos = await room.subscribe(videoIds);
            }

            remoteParticipants.push({ participant, videos });
            remoteParticipants.forEach((remoteParticipant) => {
                const isSameId = remoteParticipant.participant.id === participant.id;
                if (isSameId) addRemoteVideoNode(participant.videos);
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
        }

        addRemoteVideoNode(videos);
    });

    room.on('remoteVideoUnpublished', (evt) => {
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
        changeStatus('Disconnected');
        addLog(`${evt.remoteParticipant.id} Left`);
    });
};

// DOM CONTROLS
const activateButton = () => {
    connectButtonHost.disabled = connectButtonGuest.disabled = false;
    connectButtonHost.className = connectButtonGuest.className = 'cursor-pointer';
};

const disableButton = () => {
    connectButtonHost.disabled = connectButtonGuest.disabled = true;
    connectButtonHost.className = connectButtonGuest.className = 'cursor-wait';
};

const changeStatus = (text) => {
    status.innerHTML = text;
};

const addLocalVideoNode = (localMedia) => {
    const localContainer = document.querySelector('#local-container');

    const videoItem = document.createElement('li');
    videoItem.id = 'local-video-item';

    const videoHeader = document.createElement('h3');
    videoHeader.innerHTML = `Presenter`;

    const localVideo = localMedia.video?.attach();
    localVideo.id = 'local-video';

    videoItem.appendChild(videoHeader);
    videoItem.appendChild(localVideo);
    localContainer.appendChild(videoItem);
};

const addRemoteVideoNode = (videos) => {
    const remoteContainer = document.querySelector('#remote-container');

    videos.forEach((video) => {
        const videoItem = document.createElement('li');
        videoItem.id = video.participantId;

        const videoHeader = document.createElement('h3');
        videoHeader.innerHTML = `Presenter`;
        addLog(`Join the webinar`);

        const remoteVideo = video.attach();
        remoteVideo.id = 'remote-video';

        videoItem.appendChild(videoHeader);
        videoItem.appendChild(remoteVideo);
        remoteContainer.appendChild(videoItem);
    });
};

const removeLocalVideoNode = () => {
    const videoItem = document.querySelector('#local-video-item');
    videoItem?.remove();
};

const removeRemoteVideoAll = () => {
    const remoteContainer = document.querySelector('#remote-container');
    remoteContainer.innerHTML = '';
};

const addLog = (text) => {
    const logNode = document.createElement('li');
    logNode.innerHTML = text;
    log.appendChild(logNode);
};

const resetLog = () => {
    log.innerHTML = '';
};

// EVENTs
const inputRoomId = (event) => {
    const {
        value,
        dataset: { id },
    } = event.target;
    const isHost = id === 'host';

    roomId = value;

    value.length
        ? isHost
            ? (buttonGroupGuest.className = 'invisible')
            : (buttonGroupHost.className = 'invisible')
        : (buttonGroupHost.className = buttonGroupGuest.className = 'visible');
};

const connectConference = async (event) => {
    try {
        const {
            dataset: { id },
        } = event.target;
        const isHost = id === 'host';

        resetLog();
        disableButton();
        changeStatus('Connecting...');

        // Provisioning
        await ConnectLive.signIn({
            serviceId: 'ICLEXMPLPUBL',
            serviceSecret: 'ICLEXMPLPUBL0KEY:YOUR0SRVC0SECRET',
        });
        addLog('User Signed In');

        // Create LocalMedia
        if (isHost) {
            localMedia = await ConnectLive.createLocalMedia({
                audio: true,
                video: true,
            });
            addLog('Local Host Media Created');
        }

        // Create Conference
        room = ConnectLive.createRoom();
        isHost
            ? createConferenceHostOptions(room)
            : createConferenceGuestOptions(room);
        addLog(`Conference ${isHost ? 'Host' : 'Guest'} Created`);

        if (!roomId) throw new Error('No Conference to Connect');

        await room.connect(roomId);
        if (isHost && localMedia) {
            await room.publish([localMedia]);
            addLog('Video Connected');

            addLocalVideoNode(localMedia);
            addLog('Participant Showed');
        }

        changeStatus('Connected');
    } catch (error) {
        console.error(error);
        disConnect.conference();
        disConnect.localMedia();
        disConnect.remoteParticipants();
        disConnect.user();
        disConnect.buttonStatus();
        changeStatus('Failed to Connect');
        alert('Failed to Start Service');
    }
};

const disConnectConference = (event) => {
    try {
        changeStatus('Disconnecting...');

        const {
            dataset: { id },
        } = event.target;
        const isHost = id === 'host';

        if (!room || !roomId) throw new Error('No Conference to Stop');

        disConnect.conference();

        if (isHost && localMedia) disConnect.localMedia();

        disConnect.remoteParticipants();
        disConnect.user();
        disConnect.buttonStatus();
    } catch (error) {
        console.error(error);
        changeStatus('Failed to Disconnect');
    }
};

const disConnect = {
    conference() {
        room?.disconnect();
        addLog('Conference Disconnected');
    },
    localMedia() {
        localMedia?.stop();
        localMedia = null;
        removeLocalVideoNode();
        addLog('Video Disconnected');
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

connectButtonHost.onclick = connectButtonGuest.onclick = connectConference;
disconnectButtonHost.onclick = disconnectButtonGuest.onclick =
    disConnectConference;
guestRoomId.onkeyup = hostRoomId.onkeyup = inputRoomId;
