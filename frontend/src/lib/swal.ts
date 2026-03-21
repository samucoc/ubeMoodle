import Swal from 'sweetalert2';

// SweetAlert2 Toast Configuration
const Toast = Swal.mixin({
  toast: true,
  position: 'top-end',
  showConfirmButton: false,
  timer: 3000,
  timerProgressBar: true,
  didOpen: (toast) => {
    toast.onmouseenter = Swal.stopTimer;
    toast.onmouseleave = Swal.resumeTimer;
  },
});

export const showToast = {
  success: (message: string) =>
    Toast.fire({
      icon: 'success',
      title: message,
      background: '#f0fdf4',
      color: '#166534',
    }),

  error: (message: string) =>
    Toast.fire({
      icon: 'error',
      title: message,
      background: '#fef2f2',
      color: '#991b1b',
    }),

  warning: (message: string) =>
    Toast.fire({
      icon: 'warning',
      title: message,
      background: '#fffbeb',
      color: '#92400e',
    }),

  info: (message: string) =>
    Toast.fire({
      icon: 'info',
      title: message,
      background: '#eff6ff',
      color: '#1e40af',
    }),
};

export const showConfirm = async (
  title: string,
  text: string,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
) => {
  const result = await Swal.fire({
    title,
    text,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#2563eb',
    cancelButtonColor: '#dc2626',
    confirmButtonText: confirmText,
    cancelButtonText: cancelText,
    reverseButtons: true,
    customClass: {
      popup: 'rounded-xl',
      title: 'text-gray-900',
      htmlContainer: 'text-gray-600',
    },
  });
  return result.isConfirmed;
};

export const showSuccess = (title: string, text?: string) =>
  Swal.fire({
    title,
    text,
    icon: 'success',
    confirmButtonColor: '#2563eb',
    customClass: { popup: 'rounded-xl' },
  });

export const showError = (title: string, text?: string) =>
  Swal.fire({
    title,
    text,
    icon: 'error',
    confirmButtonColor: '#2563eb',
    customClass: { popup: 'rounded-xl' },
  });

export const showLoading = (title = 'Cargando...') => {
  Swal.fire({
    title,
    allowOutsideClick: false,
    allowEscapeKey: false,
    didOpen: () => {
      Swal.showLoading();
    },
    customClass: { popup: 'rounded-xl' },
  });
};

export const closeLoading = () => Swal.close();

export { Swal };
