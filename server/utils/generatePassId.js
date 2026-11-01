import { v4 as uuidv4 } from 'uuid';

const generatePassId = () => {
  const prefix = 'VP';
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = uuidv4().split('-')[0].toUpperCase();
  return `${prefix}-${timestamp}-${random}`;
};

export default generatePassId;
