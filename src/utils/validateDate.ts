export const validateDate = (value: string) => {
  if (value.indexOf("/") < 0) return false;

  const currentDate = new Date();

  const [month, year] = value.split("/");

  if (
    parseInt(year, 10) <
    parseInt(currentDate.getUTCFullYear().toString().substring(2), 10)
  ) {
    return false;
  } else if (
    parseInt(year, 10) ===
      parseInt(currentDate.getUTCFullYear().toString().substring(2), 10) &&
    parseInt(month, 10) < currentDate.getUTCMonth() + 1
  ) {
    return false;
  }

  return true;
};
