export function createInvoiceNumber() {
  const now = new Date;
  const date = `${now.getFullYear()}${String(now.getMonth() +1).padStart(2, "0")}${String(now.getDate()).padStart(2, "0")}`;
  const suffix = `${String(now.getHours()).padStart(2, "0")}${String(now.getMinutes()).padStart(2, "0")}${String(now.getSeconds()).padStart(2, "0")}${String(now.getMilliseconds()).padStart(3, "0")}`;
  return `TRX-${date}-${suffix}`;
}