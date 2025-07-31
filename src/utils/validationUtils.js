import { FILE_VALIDATION, ERROR_MESSAGES } from '@/constants/validation';

// Form validation utility
export const validateForm = (formData, requiredFields = []) => {
  const errors = [];
  
  for (const field of requiredFields) {
    if (!formData[field] || formData[field].toString().trim() === '') {
      errors.push(`${field}은(는) 필수 입력 항목입니다.`);
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors,
  };
};

// File validation utility
export const validateFile = (file) => {
  const errors = [];
  
  if (!file) {
    errors.push('파일을 선택해주세요.');
    return { isValid: false, errors };
  }
  
  // Check file extension
  const fileExtension = file.name.split('.').pop().toLowerCase();
  if (!FILE_VALIDATION.ALLOWED_EXTENSIONS.includes(fileExtension)) {
    errors.push(ERROR_MESSAGES.INVALID_FILE_TYPE);
  }
  
  // Check MIME type
  if (!FILE_VALIDATION.ALLOWED_MIME_TYPES.includes(file.type)) {
    errors.push(ERROR_MESSAGES.INVALID_FILE_TYPE);
  }
  
  // Check file size
  if (file.size > FILE_VALIDATION.MAX_SIZE) {
    errors.push(ERROR_MESSAGES.FILE_TOO_LARGE);
  }
  
  return {
    isValid: errors.length === 0,
    errors,
  };
};

// Generic validation for multiple files
export const validateFiles = (files) => {
  const allErrors = [];
  
  for (let i = 0; i < files.length; i++) {
    const validation = validateFile(files[i]);
    if (!validation.isValid) {
      allErrors.push(`파일 ${i + 1}: ${validation.errors.join(', ')}`);
    }
  }
  
  return {
    isValid: allErrors.length === 0,
    errors: allErrors,
  };
};

// Input sanitization
export const sanitizeInput = (input) => {
  if (typeof input !== 'string') return input;
  return input.trim().replace(/[<>]/g, '');
};

// Check if all required fields are filled
export const areRequiredFieldsFilled = (formData, requiredFields) => {
  return requiredFields.every(field => 
    formData[field] && formData[field].toString().trim() !== ''
  );
};