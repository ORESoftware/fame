

export const r2gSmokeTest = async () => {
  return true;
};


export type EVCb<T, E = any> = (err: E, val?: T) => void;
