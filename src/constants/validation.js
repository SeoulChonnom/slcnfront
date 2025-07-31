// File validation constants
export const FILE_VALIDATION = {
  ALLOWED_EXTENSIONS: ['jpg', 'jpeg', 'png', 'gif', 'svg'],
  ALLOWED_MIME_TYPES: [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/svg+xml',
  ],
  MAX_SIZE: 10 * 1024 * 1024, // 10MB
};

// Error messages
export const ERROR_MESSAGES = {
  UNKNOWN_ERROR: '알 수 없는 오류입니다.',
  INVALID_INPUT: '입력값이 잘못되었습니다.',
  REQUIRED_FIELDS: '빈칸을 채워주세요.',
  INVALID_FILE_TYPE: '허용되지 않은 파일 형식입니다. 이미지 파일만 업로드해주세요.',
  FILE_TOO_LARGE: '파일 크기는 10MB를 초과할 수 없습니다.',
  AUTH_REQUIRED: '인증이 필요합니다.',
  SERVER_ERROR: '서버 오류가 발생했습니다.',
  INVALID_REQUEST: '요청이 잘못되었습니다.',
};

// Success messages
export const SUCCESS_MESSAGES = {
  SAVE_SUCCESS: '저장되었습니다.',
  UPDATE_SUCCESS: '수정되었습니다.',
  DELETE_SUCCESS: '삭제되었습니다.',
  LOGIN_SUCCESS: '로그인되었습니다.',
  UPLOAD_SUCCESS: '업로드되었습니다.',
};

// Form validation rules
export const VALIDATION_RULES = {
  REQUIRED: (value) => !!value || ERROR_MESSAGES.REQUIRED_FIELDS,
  MIN_LENGTH: (min) => (value) => 
    (value && value.length >= min) || `최소 ${min}글자 이상 입력해주세요.`,
  MAX_LENGTH: (max) => (value) => 
    (!value || value.length <= max) || `최대 ${max}글자까지 입력 가능합니다.`,
  EMAIL: (value) => {
    const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return !value || pattern.test(value) || '올바른 이메일 형식이 아닙니다.';
  },
};