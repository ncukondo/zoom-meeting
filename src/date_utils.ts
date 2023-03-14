/**
 * @param {Date} date
 * @return {string}
 */
const formatDate = (date:Date) => {
  const year = date.getFullYear().toString().padStart(4, "0");
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const day = date.getDate().toString().padStart(2, "0");
  const hour = date.getHours().toString().padStart(2, "0");
  const minute = date.getMinutes().toString().padStart(2, "0");
  return `${year}-${month}-${day}T${hour}:${minute}:00`;
};
/**
 * @param {Date} start
 * @param {Date} end
 * @return number
 */
const deltaMinute = (start:Date, end:Date) =>
  Math.ceil((end.getTime() - start.getTime()) / (1000 * 60));

export { formatDate, deltaMinute };
