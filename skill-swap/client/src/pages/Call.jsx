import { useEffect, useRef, useState } from "react";
import socket from "../services/socket";

const Call = ({ selectedUser }) => {
  const localVideo = useRef();
  const remoteVideo = useRef();
  const peerConnection = useRef();

  const [callAccepted, setCallAccepted] = useState(false);
  const [stream, setStream] = useState(null);

  const user = JSON.parse(localStorage.getItem("user"));

  const ICE_SERVERS = {
    iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
  };

  // 🎥 START LOCAL MEDIA
  const startMedia = async () => {
    const mediaStream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true,
    });

    setStream(mediaStream);
    localVideo.current.srcObject = mediaStream;
  };

  // 📞 CALL USER
  const callUser = async () => {
    await startMedia();

    peerConnection.current = new RTCPeerConnection(ICE_SERVERS);

    stream.getTracks().forEach((track) => {
      peerConnection.current.addTrack(track, stream);
    });

    peerConnection.current.ontrack = (event) => {
      remoteVideo.current.srcObject = event.streams[0];
    };

    const offer = await peerConnection.current.createOffer();
    await peerConnection.current.setLocalDescription(offer);

    socket.emit("callUser", {
      to: selectedUser._id,
      from: user._id,
      offer,
    });

    socket.on("callAccepted", async ({ answer }) => {
      setCallAccepted(true);
      await peerConnection.current.setRemoteDescription(answer);
    });

    peerConnection.current.onicecandidate = (event) => {
      if (event.candidate) {
        socket.emit("iceCandidate", {
          to: selectedUser._id,
          candidate: event.candidate,
        });
      }
    };
  };

  // 📞 RECEIVE CALL
  useEffect(() => {
    socket.on("incomingCall", async ({ from, offer }) => {
      await startMedia();

      peerConnection.current = new RTCPeerConnection(ICE_SERVERS);

      stream.getTracks().forEach((track) => {
        peerConnection.current.addTrack(track, stream);
      });

      peerConnection.current.ontrack = (event) => {
        remoteVideo.current.srcObject = event.streams[0];
      };

      await peerConnection.current.setRemoteDescription(offer);

      const answer = await peerConnection.current.createAnswer();
      await peerConnection.current.setLocalDescription(answer);

      socket.emit("acceptCall", {
        to: from,
        answer,
      });

      setCallAccepted(true);
    });

    socket.on("iceCandidate", async (candidate) => {
      if (peerConnection.current) {
        await peerConnection.current.addIceCandidate(candidate);
      }
    });

    socket.on("callEnded", () => endCall());

    return () => socket.off();
  }, [stream]);

  // ❌ END CALL
  const endCall = () => {
    peerConnection.current?.close();
    stream?.getTracks().forEach((track) => track.stop());
    setCallAccepted(false);

    socket.emit("endCall", { to: selectedUser._id });
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <video ref={localVideo} autoPlay muted className="w-1/3" />
      <video ref={remoteVideo} autoPlay className="w-1/2 mt-4" />

      <div className="mt-4 flex gap-4">
        <button onClick={callUser}>📞 Call</button>
        <button onClick={endCall}>❌ End</button>
      </div>
    </div>
  );
};

export default Call;