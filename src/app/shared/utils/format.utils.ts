export const getStatusOnProgess = (progress: number) => {
  return progress === 100
    ? 'Завершено'
    : progress < 100 && progress > 0
    ? 'У процесі'
    : 'Призначено';
};
