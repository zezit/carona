package com.br.puc.carona.controller.docs;

import io.swagger.v3.oas.annotations.media.Schema;

public final class CaronaExamples {
    private CaronaExamples() {
        // Utility class
    }

    @Schema(name = "CaronaCriadaExemplo")
    public static final String CARONA_CRIADA = """
            {
                "id": 1,
                "motorista": {
                    "id": 5,
                    "carro": {
                        "id": 3,
                        "modelo": "Onix",
                        "placa": "ABC1234",
                        "cor": "Prata",
                        "capacidadePassageiros": 4
                    },
                    "cnh": "12345678910",
                    "whatsapp": "31998765432",
                    "mostrarWhatsapp": true
                },
                "pontoPartida": "Rua A, 123",
                "latitudePartida": -23.5505,
                "longitudePartida": -46.6333,
                "pontoDestino": "Avenida B, 456",
                "latitudeDestino": -23.5505,
                "longitudeDestino": -46.6333,
                "dataHoraPartida": "01-10-2025T10:00:00",
                "dataHoraChegada": "01-10-2025T12:00:00",
                "vagas": 3,
                "status": "AGENDADA",
                "observacoes": "Carona para São Paulo",
                "passageiros": [],
                "vagasDisponiveis": 3,
                "distanciaEstimadaKm": 15.5,
                "tempoEstimadoSegundos": 1200,
                "trajetorias": [
                    {
                        "coordenadas": [
                            [-23.5505, -46.6333],
                            [-23.5550, -46.6400],
                            [-23.5605, -46.6450]
                        ],
                        "distanciaKm": 15.5,
                        "tempoSegundos": 1200,
                        "descricao": "Principal"
                    }
                ]
            }
            """;

    @Schema(name = "CaronaAtualizadaExemplo")
    public static final String CARONA_ATUALIZADA = """
            {
                "pontoPartida": "Rua C, 789",
                "latitudePartida": -23.5550,
                "longitudePartida": -46.6400,
                "pontoDestino": "Avenida D, 1010",
                "latitudeDestino": -23.5605,
                "longitudeDestino": -46.6450,
                "dataHoraPartida": "2025-10-01T08:30:00",
                "dataHoraChegada": "2025-10-01T10:30:00",
                "vagas": 4,
                "observacoes": "Carona para São Paulo - Atualizada"
            }
            """;

    @Schema(name = "StatusCaronaAlteradoExemplo")
    public static final String STATUS_CARONA_ALTERADO = """
            {
                "id": 1,
                "motorista": {
                    "id": 5,
                    "carro": {
                        "id": 3,
                        "modelo": "Onix",
                        "placa": "ABC1234",
                        "cor": "Prata",
                        "capacidadePassageiros": 4
                    },
                    "cnh": "12345678910",
                    "whatsapp": "31998765432",
                    "mostrarWhatsapp": true
                },
                "pontoPartida": "Rua A, 123",
                "latitudePartida": -23.5505,
                "longitudePartida": -46.6333,
                "pontoDestino": "Avenida B, 456",
                "latitudeDestino": -23.5505,
                "longitudeDestino": -46.6333,
                "dataHoraPartida": "01-10-2025T10:00:00",
                "dataHoraChegada": "01-10-2025T12:00:00",
                "vagas": 3,
                "status": "EM_ANDAMENTO",
                "passageiros": [
                    {
                        "id": 2,
                        "nome": "José Silva",
                        "email": "jose.silva@email.com",
                        "dataDeNascimento": "1995-05-15",
                        "matricula": "20230002",
                        "avaliacaoMedia": 4.7,
                        "curso": "Engenharia de Software"
                    }
                ],
                "vagasDisponiveis": 2,
                "distanciaEstimadaKm": 15.5,
                "tempoEstimadoSegundos": 1200
            }
            """;

    @Schema(name = "CaronaEncontradaExemplo")
    public static final String CARONA_ENCONTRADA = CARONA_CRIADA;

    @Schema(name = "ListaCaronasMotoristaExemplo")
    public static final String LISTA_CARONAS_MOTORISTA = """
            {
                "content": [
                    {
                        "id": 1,
                        "motorista": {
                            "id": 5,
                            "nome": "João Motorista",
                            "email": "joao@email.com"
                        },
                        "pontoPartida": "Rua A, 123",
                        "pontoDestino": "Avenida B, 456",
                        "dataHoraPartida": "01-10-2025T10:00:00",
                        "dataHoraChegada": "01-10-2025T12:00:00",
                        "vagas": 3,
                        "vagasDisponiveis": 2,
                        "status": "AGENDADA"
                    }
                ],
                "pageable": {
                    "pageNumber": 0,
                    "pageSize": 10,
                    "sort": {
                        "sorted": true,
                        "unsorted": false
                    }
                },
                "totalElements": 1,
                "totalPages": 1,
                "last": true,
                "first": true,
                "empty": false
            }
            """;

    @Schema(name = "ListaProximasCaronasMotoristaExemplo")
    public static final String LISTA_PROXIMAS_CARONAS_MOTORISTA = """
            [
                {
                    "id": 1,
                    "motorista": {
                        "id": 5,
                        "nome": "João Motorista",
                        "email": "joao@email.com"
                    },
                    "pontoPartida": "Rua A, 123",
                    "pontoDestino": "Avenida B, 456",
                    "dataHoraPartida": "01-10-2025T10:00:00",
                    "dataHoraChegada": "01-10-2025T12:00:00",
                    "vagas": 3,
                    "vagasDisponiveis": 2,
                    "status": "AGENDADA"
                }
            ]
            """;
}