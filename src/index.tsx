import React, { forwardRef, type ForwardedRef, useMemo } from 'react';
import {
  Camera as VisionCamera,
  useFrameProcessor,
} from 'react-native-vision-camera';
import { createTextRecognitionPlugin } from './scanText';
import { useRunInJS } from 'react-native-worklets-core';
import type {
  CameraTypes,
  Frame,
  FrameProcessor,
  TextRecognitionOptions,
  TextRecognitionPlugin,
  Text,
} from './types';

export const Camera = forwardRef(function Camera(
  props: CameraTypes,
  ref: ForwardedRef<any>
) {
  const { device, callback, options = {}, ...p } = props;
  // @ts-ignore
  const { scanText } = useTextRecognition(options);
  const useWorklets = useRunInJS(
    (data: Text): void => {
      callback(data);
    },
    [options]
  );
  const frameProcessor: FrameProcessor = useFrameProcessor((frame: Frame) => {
    'worklet';
    const data: Text = scanText(frame);
    // @ts-ignore
    // eslint-disable-next-line react-hooks/rules-of-hooks
    useWorklets(data);
  }, []);
  return (
    <>
      {!!device && (
        <VisionCamera
          pixelFormat="yuv"
          ref={ref}
          frameProcessor={frameProcessor}
          device={device}
          {...p}
        />
      )}
    </>
  );
});

export function useTextRecognition(
  options?: TextRecognitionOptions
): TextRecognitionPlugin {
  return useMemo(
    () => createTextRecognitionPlugin(options || { language: 'latin' }),
    [options]
  );
}
