export const getStatusOnProgess = (progress: number) => {
  return progress === 100
    ? 'Complete'
    : progress < 100 && progress > 0
    ? 'In Progress'
    : 'Assigned';
};
