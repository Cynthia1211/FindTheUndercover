import React from 'react';

export default function GameAudio({ audioRef }) {
  return (
    <>
      <audio ref={audioRef} id="Undercoversong" loop>
        <source src={`${process.env.PUBLIC_URL}/audio/Undercoversong.mp3`} type="audio/mpeg" />
      </audio>
      <audio id="CorrectAnswer">
        <source src={`${process.env.PUBLIC_URL}/audio/CorrectAnswer.wav`} type="audio/wav" />
      </audio>
      <audio id="FailedGame">
        <source src={`${process.env.PUBLIC_URL}/audio/FailedGame.mp3`} type="audio/mpeg" />
      </audio>
      <audio id="ClockTicking">
        <source src={`${process.env.PUBLIC_URL}/audio/ClockTicking.mp3`} type="audio/mpeg" />
      </audio>
      <audio id="WrongAnswer">
        <source src={`${process.env.PUBLIC_URL}/audio/WrongAnswer.mp3`} type="audio/mpeg" />
      </audio>
    </>
  );
}
