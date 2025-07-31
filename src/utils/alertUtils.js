import Swal from 'sweetalert2';

// Centralized SweetAlert2 configuration
const defaultConfig = {
  customClass: {
    popup: 'swal-font-family',
    title: 'swal-font-family',
    content: 'swal-font-family',
    confirmButton: 'swal-font-family',
    cancelButton: 'swal-font-family',
  },
  confirmButtonColor: '#007bff',
  cancelButtonColor: '#6c757d',
};

export const showSuccessAlert = (message, title = '성공') => {
  return Swal.fire({
    ...defaultConfig,
    icon: 'success',
    title,
    text: message,
    confirmButtonText: '확인',
  });
};

export const showErrorAlert = (message, title = '오류') => {
  return Swal.fire({
    ...defaultConfig,
    icon: 'error',
    title,
    text: message,
    confirmButtonText: '확인',
  });
};

export const showWarningAlert = (message, title = '경고') => {
  return Swal.fire({
    ...defaultConfig,
    icon: 'warning',
    title,
    text: message,
    confirmButtonText: '확인',
  });
};

export const showConfirmAlert = (message, title = '확인') => {
  return Swal.fire({
    ...defaultConfig,
    icon: 'question',
    title,
    text: message,
    showCancelButton: true,
    confirmButtonText: '확인',
    cancelButtonText: '취소',
  });
};

export const showInfoAlert = (message, title = '정보') => {
  return Swal.fire({
    ...defaultConfig,
    icon: 'info',
    title,
    text: message,
    confirmButtonText: '확인',
  });
};

// Special alert for quiz/radio selection
export const showRadioAlert = (title, options) => {
  const inputOptions = {};
  options.forEach((option, index) => {
    inputOptions[index] = option;
  });

  return Swal.fire({
    ...defaultConfig,
    title,
    input: 'radio',
    inputOptions,
    inputValidator: (value) => {
      if (!value) {
        return '옵션을 선택해주세요!';
      }
    },
    confirmButtonText: '확인',
    cancelButtonText: '취소',
    showCancelButton: true,
  });
};