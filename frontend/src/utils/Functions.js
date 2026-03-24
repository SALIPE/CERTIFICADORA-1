
import { MySwal } from "../App";

export function isEquals(compare, compared) {
  return JSON.stringify(compare) === JSON.stringify(compared)
}

export function utf8ToB64(str) {
  return window.btoa(str);
}

export function toBase64(file) {
  return new Promise(resolve => {
    let reader = new FileReader();
    reader.readAsDataURL(file);

    reader.onload = () => {
      let baseURL = reader.result;
      resolve(baseURL);
    };
  });
};

export function successAlert(message, hideAlert) {
  MySwal.fire({
    title: "Sucesso!",
    html: message,
    icon: 'success',
    allowOutsideClick: false,
    customClass: {
      confirmButton: "btn-primary "
    }
  }).then(hideAlert);

};

export function infoAlert(message, hideAlert) {
  MySwal.fire({
    title: "Solicitação recebida com sucesso!",
    html: message,
    icon: 'info',
    allowOutsideClick: false,
    customClass: {
      confirmButton: "btn-info"
    }
  }).then(hideAlert);
};

export function infoAviso(message, hideAlert) {
  MySwal.fire({
    title: "Alerta",
    html: message,
    icon: 'info',
    allowOutsideClick: false,
    customClass: {
      confirmButton: "btn-info"
    }
  }).then(hideAlert);
};

export function errorAlert(message, hideAlert) {
  MySwal.fire({
    title: "Erro!",
    html: message,
    icon: 'error',
    allowOutsideClick: false,
    customClass: {
      confirmButton: "btn-danger "
    }
  }).then(hideAlert);
};


export function verifyVariable(variable) {
  return variable !== null && variable !== 'null' && variable !== 'undefined' && variable !== undefined && variable !== '';
}
