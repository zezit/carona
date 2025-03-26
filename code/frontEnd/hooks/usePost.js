import { useState } from 'react';
import axios from 'axios';

const usePost = (url) => {
  const [postResponse, setResponse] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const postData = async (data, config = {}) => {
    setLoading(true);
    try {
        console.log('entrou função post')
        const res = await axios.post(url, data, {
            headers: { "Content-Type": "application/json" },
            withCredentials: true, // Permite cookies/sessões entre domínios
          });
      setResponse(res.data);
      console.log(postResponse)
      setError(null); // Resetando erro caso a requisição tenha sucesso
    } catch (err) {
      setError(err.response?.data || "Erro ao enviar os dados");
      setResponse(null); // Resetando a resposta caso ocorra erro
    } finally {
      setLoading(false);
    }
  };

  return { postResponse, error, loading, postData };
};

export default usePost;
