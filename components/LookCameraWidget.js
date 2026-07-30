'use client';

import { useEffect, useRef } from 'react';
import { h, render } from 'preact';
import CameraModule from '@3dlook/camera-widget-react';
import '@3dlook/camera-widget-react/dist/style.css';

const Camera = CameraModule?.default || CameraModule;
const DEFAULT_HARD_VALIDATION = { front: null, side: null };

/**
 * The 3DLOOK widget calls AudioContext.createMediaStreamSource with an <audio>
 * ref when camera access fails. Guard that so it cannot throw/spam the console.
 */
function patchCreateMediaStreamSource() {
  if (typeof window === 'undefined') return () => {};

  const Ctx = window.AudioContext || window.webkitAudioContext;
  if (!Ctx?.prototype?.createMediaStreamSource) return () => {};

  const original = Ctx.prototype.createMediaStreamSource;
  if (original.__lookCameraPatched) return () => {};

  function safeCreateMediaStreamSource(stream) {
    if (!(stream instanceof MediaStream)) {
      return original.call(this, new MediaStream());
    }
    return original.call(this, stream);
  }
  safeCreateMediaStreamSource.__lookCameraPatched = true;
  Ctx.prototype.createMediaStreamSource = safeCreateMediaStreamSource;

  return () => {
    Ctx.prototype.createMediaStreamSource = original;
  };
}

/**
 * Widget hard-requires width.min:1920, which fails on most laptop webcams.
 * Retry once with relaxed constraints so desktop browsers can still open the camera.
 */
function patchGetUserMedia() {
  if (typeof navigator === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
    return () => {};
  }

  const devices = navigator.mediaDevices;
  const original = devices.getUserMedia.bind(devices);
  if (devices.getUserMedia.__lookCameraPatched) return () => {};

  async function relaxedGetUserMedia(constraints) {
    try {
      return await original(constraints);
    } catch (err) {
      const video = constraints?.video;
      const needsRelax =
        video &&
        typeof video === 'object' &&
        video.width?.min >= 1920 &&
        (err?.name === 'OverconstrainedError' ||
          err?.name === 'ConstraintNotSatisfiedError' ||
          err?.name === 'NotFoundError' ||
          err?.name === 'NotReadableError');

      if (!needsRelax) throw err;

      const { width: _w, height: _h, ...restVideo } = video;
      const fallback = {
        ...constraints,
        video: {
          ...restVideo,
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
      };
      return original(fallback);
    }
  }
  relaxedGetUserMedia.__lookCameraPatched = true;
  devices.getUserMedia = relaxedGetUserMedia;

  return () => {
    devices.getUserMedia = original;
  };
}

/**
 * Mounts the Preact-based 3DLOOK AI camera widget into a React page.
 * @see https://github.com/3dlook-me/camera-widget-react
 *
 * saveFront / saveSide receive JPEG data URLs from the widget.
 */
export default function LookCameraWidget({
  type,
  isTableFlow = true,
  hardValidation = DEFAULT_HARD_VALIDATION,
  onSaveFront,
  onSaveSide,
  onTurnOff,
  onDisableTableFlow,
}) {
  const hostRef = useRef(null);
  const callbacksRef = useRef({
    onSaveFront,
    onSaveSide,
    onTurnOff,
    onDisableTableFlow,
  });

  useEffect(() => {
    callbacksRef.current = {
      onSaveFront,
      onSaveSide,
      onTurnOff,
      onDisableTableFlow,
    };
  }, [onSaveFront, onSaveSide, onTurnOff, onDisableTableFlow]);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return undefined;

    if (!type) {
      render(null, host);
      return undefined;
    }

    const unpatchAudio = patchCreateMediaStreamSource();
    const unpatchMedia = patchGetUserMedia();

    render(
      h(Camera, {
        type,
        isTableFlow,
        hardValidation,
        saveFront: (image) => callbacksRef.current.onSaveFront?.(image),
        saveSide: (image) => callbacksRef.current.onSaveSide?.(image),
        turnOffCamera: () => callbacksRef.current.onTurnOff?.(),
        disableTableFlow: () => callbacksRef.current.onDisableTableFlow?.(),
        setDeviceCoordinates: () => {},
        onClickDone: () => {},
      }),
      host,
    );

    return () => {
      render(null, host);
      unpatchAudio();
      unpatchMedia();
    };
  }, [type, isTableFlow, hardValidation]);

  if (!type) return null;

  return (
    <div
      ref={hostRef}
      className="look-camera-host"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 2000,
        backgroundColor: '#000',
      }}
    />
  );
}
