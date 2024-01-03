export const validTime = (time: Date) => {
  const now = new Date();
  return now.getTime() >= time.getTime();
};
