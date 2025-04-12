# Guia Rápido de Carpool para Devs Mobile

## Visão Geral

Este guia simplificado apresenta como integrar mobile com a API para criar e gerenciar caronas.

## Autenticação

Todas as requisições exigem um token JWT no cabeçalho:

```
Authorization: Bearer eyJhbGciOiJIUzI1NiJ9...
```

## Fluxo Correto de Criação de Carona

Para criar uma carona, siga este fluxo de 3 passos:

### 1. Geocodificar Endereços

Primeiro, obtenha as coordenadas dos pontos de partida e destino:

```javascript
// Exemplo com Axios:
const geocodificarEnderecos = async (token, pontoPartida, pontoDestino) => {
  // Geocodificar ponto de partida
  const resPartida = await axios.get(`http://localhost:8080/api/maps/geocode`, {
    params: { address: pontoPartida },
    headers: { Authorization: `Bearer ${token}` }
  });
  
  // Geocodificar ponto de destino
  const resDestino = await axios.get(`http://localhost:8080/api/maps/geocode`, {
    params: { address: pontoDestino },
    headers: { Authorization: `Bearer ${token}` }
  });
  
  return {
    partida: resPartida.data[0],
    destino: resDestino.data[0]
  };
};
```

### 2. Calcular Trajetos

Em seguida, calcule as rotas entre os pontos:

```javascript
// Exemplo com Axios:
const calcularTrajetos = async (token, coordenadas) => {
  const response = await axios.get(`http://localhost:8080/api/maps/trajectories`, {
    params: {
      startLat: coordenadas.partida.latitude,
      startLon: coordenadas.partida.longitude,
      endLat: coordenadas.destino.latitude,
      endLon: coordenadas.destino.longitude
    },
    headers: { Authorization: `Bearer ${token}` }
  });
  
  return response.data; // Trajetos principal e alternativos
};
```

### 3. Criar a Carona

Finalmente, crie a carona com as informações obtidas:

```javascript
// Exemplo com Axios:
const criarCarona = async (token, dados) => {
  const response = await axios.post('http://localhost:8080/api/carona', {
    pontoPartida: dados.pontoPartida,
    latitudePartida: dados.coordenadas.partida.latitude,
    longitudePartida: dados.coordenadas.partida.longitude,
    pontoDestino: dados.pontoDestino,
    latitudeDestino: dados.coordenadas.destino.latitude,
    longitudeDestino: dados.coordenadas.destino.longitude,
    dataHoraPartida: dados.dataHoraPartida,
    dataHoraChegada: dados.dataHoraChegada,
    vagas: dados.vagas,
    observacoes: dados.observacoes
  }, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
  
  return response.data;
};
```