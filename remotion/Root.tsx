import React from 'react'
import { Composition, registerRoot } from 'remotion'
import { Intro } from './Intro'
import { IntroReel } from './IntroReel'
import { Outro } from './Outro'
import { FPS, INTRO_FRAMES, OUTRO_FRAMES } from './constants'

function RemotionRoot() {
  return (
    <>
      <Composition
        id="Intro"
        component={Intro}
        durationInFrames={INTRO_FRAMES}
        fps={FPS}
        width={1920}
        height={1080}
      />
      <Composition
        id="IntroReel"
        component={IntroReel}
        durationInFrames={INTRO_FRAMES}
        fps={FPS}
        width={1080}
        height={1920}
      />
      <Composition
        id="Outro"
        component={Outro}
        durationInFrames={OUTRO_FRAMES}
        fps={FPS}
        width={1920}
        height={1080}
      />
    </>
  )
}

registerRoot(RemotionRoot)
