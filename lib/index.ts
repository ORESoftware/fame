

export const r2gSmokeTest = function () {
  return true;
};


export type EVCb<T, E = any> = (err: E, val?: T) => void;
