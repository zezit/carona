import { useState } from 'react';

const useDatePicker = (initialDate = null) => {
  const [day, setDay] = useState(initialDate ? initialDate.getDate().toString().padStart(2, '0') : '');
  const [month, setMonth] = useState(initialDate ? (initialDate.getMonth() + 1).toString().padStart(2, '0') : '');
  const [year, setYear] = useState(initialDate ? initialDate.getFullYear().toString() : '');
  const [showDateModal, setShowDateModal] = useState(false);

  const months = [
    { value: '01', label: 'Janeiro' },
    { value: '02', label: 'Fevereiro' },
    { value: '03', label: 'Março' },
    { value: '04', label: 'Abril' },
    { value: '05', label: 'Maio' },
    { value: '06', label: 'Junho' },
    { value: '07', label: 'Julho' },
    { value: '08', label: 'Agosto' },
    { value: '09', label: 'Setembro' },
    { value: '10', label: 'Outubro' },
    { value: '11', label: 'Novembro' },
    { value: '12', label: 'Dezembro' }
  ];

  const formatDateToDisplay = () => {
    if (!day || !month || !year) return '';
    const monthName = months.find(m => m.value === month)?.label || month;
    return `${day} de ${monthName} de ${year}`;
  };

  const formatDateToAPI = () => {
    if (!day || !month || !year) return '';
    return `${year}-${month}-${day}`;
  };

  const validateDate = (minAge = null) => {
    if (!day || !month || !year) {
      throw new Error('Selecione uma data completa');
    }

    // Check if it's a valid date
    const dateObj = new Date(`${year}-${month}-${day}`);
    if (dateObj.toString() === 'Invalid Date') {
      throw new Error('Data inválida');
    }

    // Check minimum age if specified
    if (minAge !== null) {
      const today = new Date();
      const birthDate = new Date(`${year}-${month}-${day}`);
      const age = today.getFullYear() - birthDate.getFullYear();
      const m = today.getMonth() - birthDate.getMonth();
      
      if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        if (age - 1 < minAge) {
          throw new Error(`Você deve ter pelo menos ${minAge} anos`);
        }
      } else if (age < minAge) {
        throw new Error(`Você deve ter pelo menos ${minAge} anos`);
      }
    }

    return true;
  };

  const reset = () => {
    setDay('');
    setMonth('');
    setYear('');
  };

  return {
    day,
    month,
    year,
    setDay,
    setMonth,
    setYear,
    showDateModal,
    setShowDateModal,
    formatDateToDisplay,
    formatDateToAPI,
    validateDate,
    reset
  };
};