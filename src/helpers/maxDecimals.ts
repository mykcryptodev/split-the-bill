export const maxDecimals = (str: string, max: number) => {
  const [integer, decimal] = str.split(".");
  if (decimal && decimal.length > max) {
    return `${integer}.${decimal.slice(0, max)}`;
  }
  return str;
}