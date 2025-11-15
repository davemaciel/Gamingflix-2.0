const WHATSAPP_NUMBER = '558896208459';

export const getWhatsAppLink = (message: string) => {
  const encodedMessage = encodeURIComponent(message);
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodedMessage}`;
};

export const openWhatsApp = (message: string) => {
  const url = getWhatsAppLink(message);
  window.open(url, '_blank');
};

export const getWhatsAppNumber = () => WHATSAPP_NUMBER;
