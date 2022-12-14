// import ConnectLive from "@connectlive/connectlive-web-sdk";

const roomId = 'oilpal-kakao-sample';
let room = null;
let remoteParticipants = [];
let localMedia = null;
let videoStream = null;

const logConsole = $('#logconsole');

const addLog = (text) => {
    const logNode = document.createElement('li');
    logNode.innerHTML = text;
    logConsole.appendChild(logNode);
}

// 카카오 라이브에 로그인
await ConnectLive.signIn({
    serviceId: 'TW4C6ELG30HZ',
    serviceSecret: 'TW4C6ELG30HZCXIH:H8dkwfHVVnbLLsos'
});

// LocalMedia (로컬미디어) 권한 획득하기
localMedia = await ConnectLive.createLocalMedia({video: true, audio: true});

// VideoStream
videoStream = localMedia.video;

// create <video> tag
const videoTag = videoStream?.attach();
console.log(videoTag);

// Create 'room
room = ConnectLive.createRoom();

// create Conference
room.on('participantEntered', (evt) => {
    addLog(`${evt.remoteParticipant.id} joined`);
});
room.on('participantLeft', (evt) => {
    addLog(`${evt.remoteParticipantId} left`);
});

// connect to room
await room.connect(roomId);

// Publish stream
await room.publish([localMedia]);

// add Local Video Node (render HTML)

const remoteContainer = $('#remote-container');

console.log(remoteContainer);

// // 채팅방 접속/이벤트 처리하기
// const room = await ConnectLive.createRoom();
// if (!room) {
//     // connectButton.innerHTML = 'failed to create room'
//     throw new Error('Failed to create room');
// }
//
// room.on('connected', (evt) => {
//    // connectButton.innerHTML = 'connected'
//     evt.remoteParticipants.forEach((member) => {
//        console.log('user: ' + member.id + ' is entered');
//     });
// });
//
// room.on('participantEntered', (evt) => {
//     console.log('user: ' + evt.remoteParticipant.id + ' is entered.');
// });
//
// room.on('participantLeft', (evt) => {
//     console.log('user: ' + evt.remoteParticipantId + ' is left.');
// })
// await room.connect(roomId);
//
// const myevent = {
//     target: 'host'
// };
//
// const {
//     dataset: {id},
// } = myevent.target;
//
// console.log(id);