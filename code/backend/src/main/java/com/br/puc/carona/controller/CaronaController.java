package com.br.puc.carona.controller;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.br.puc.carona.dto.request.CaronaRequest;
import com.br.puc.carona.dto.response.CaronaDto;
import com.br.puc.carona.enums.StatusCarona;
import com.br.puc.carona.service.CaronaService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.ExampleObject;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import java.util.List;

@RestController
@RequestMapping("/carona")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Carona", description = "API para gerenciamento de caronas")
public class CaronaController {
    private final CaronaService caronaService;

    @PostMapping
    @Operation(summary = "Criar carona", description = "Cria uma nova carona para um motorista. A carona é criada com status AGENDADA por padrão.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "201", description = "Carona criada com sucesso", content = {
                    @Content(mediaType = "application/json", schema = @Schema(implementation = CaronaDto.class), examples = {
                            @ExampleObject(name = "Carona criada com sucesso", description = "Exemplo de resposta de carona criada", value = """
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
                                    """)
                    }) }),
            @ApiResponse(responseCode = "400", description = "Dados inválidos fornecidos ou o cadastro do motorista não foi aprovado"),
            @ApiResponse(responseCode = "401", description = "Usuário não autenticado"),
            @ApiResponse(responseCode = "403", description = "Usuário não tem permissão para criar caronas"),
            @ApiResponse(responseCode = "404", description = "Motorista não encontrado"),
            @ApiResponse(responseCode = "500", description = "Erro interno do servidor")
    })
    public ResponseEntity<CaronaDto> criarCarona(
            @Valid @io.swagger.v3.oas.annotations.parameters.RequestBody(content = @Content(mediaType = "application/json", schema = @Schema(implementation = CaronaRequest.class), examples = {
                    @ExampleObject(name = "Requisição de Carona", description = "Modelo de requisição para criar uma nova carona", value = """
                            {
                                "pontoPartida": "Rua A, 123",
                                "latitudePartida": -23.5505,
                                "longitudePartida": -46.6333,
                                "pontoDestino": "Avenida B, 456",
                                "latitudeDestino": -23.5505,
                                "longitudeDestino": -46.6333,
                                "dataHoraPartida": "2023-10-01T10:00:00",
                                "dataHoraChegada": "2023-10-01T12:00:00",
                                "vagas": 3,
                                "observacoes": "Carona para São Paulo"
                            }
                            """)
            })) @RequestBody final CaronaRequest request) {
        log.info("Criando carona");
        final CaronaDto caronaDto = caronaService.criarCarona(request);
        log.info("Carona criada com sucesso. ID: {}", caronaDto.getId());
        return ResponseEntity.status(HttpStatus.CREATED).body(caronaDto);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Buscar carona", description = "Busca uma carona pelo ID, retornando todos os detalhes incluindo motorista, trajetos e status atual")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Carona encontrada", content = {
                    @Content(mediaType = "application/json", schema = @Schema(implementation = CaronaDto.class), examples = {
                            @ExampleObject(name = "Carona encontrada", description = "Exemplo de resposta de busca de carona", value = """
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
                                        ],
                                        "trajetoriaPrincipal": {
                                            "coordenadas": [
                                                [-23.5505, -46.6333],
                                                [-23.5550, -46.6400],
                                                [-23.5605, -46.6450]
                                            ],
                                            "distanciaKm": 15.5,
                                            "tempoSegundos": 1200,
                                            "descricao": "Principal"
                                        }
                                    }
                                    """)
                    }) }),
            @ApiResponse(responseCode = "401", description = "Usuário não autenticado"),
            @ApiResponse(responseCode = "404", description = "Carona não encontrada"),
            @ApiResponse(responseCode = "500", description = "Erro interno do servidor")
    })
    public ResponseEntity<CaronaDto> buscarCarona(@PathVariable final Long id) {
        log.info("Buscando carona com ID: {}", id);
        final CaronaDto caronaDto = caronaService.buscarCaronaPorId(id);
        log.info("Carona encontrada: {}", caronaDto.toStringBaseInfo());
        return ResponseEntity.ok(caronaDto);
    }

    @GetMapping("/motorista/{motoristaId}")
    @Operation(summary = "Listar caronas de motorista", description = "Lista todas as caronas de um motorista, ordenadas por data/hora de partida decrescente. Suporta paginação via parâmetros 'page', 'size' e 'sort'.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Lista de caronas obtida com sucesso", content = {
                    @Content(mediaType = "application/json", schema = @Schema(implementation = Page.class), examples = {
                            @ExampleObject(name = "Lista de caronas do motorista", description = "Exemplo de resposta com lista paginada de caronas", value = """
                                    {
                                        "content": [
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
                                                "pontoDestino": "Avenida B, 456",
                                                "dataHoraPartida": "01-10-2025T10:00:00",
                                                "dataHoraChegada": "01-10-2025T12:00:00",
                                                "vagas": 3,
                                                "status": "AGENDADA",
                                                "vagasDisponiveis": 2,
                                                "distanciaEstimadaKm": 15.5
                                            },
                                            {
                                                "id": 2,
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
                                                "pontoPartida": "Rua C, 789",
                                                "pontoDestino": "Avenida D, 1010",
                                                "dataHoraPartida": "02-10-2025T08:00:00",
                                                "dataHoraChegada": "02-10-2025T09:30:00",
                                                "vagas": 3,
                                                "status": "AGENDADA",
                                                "vagasDisponiveis": 3,
                                                "distanciaEstimadaKm": 16.8
                                            }
                                        ],
                                        "pageable": {
                                            "sort": {
                                                "empty": false,
                                                "sorted": true,
                                                "unsorted": false
                                            },
                                            "offset": 0,
                                            "pageNumber": 0,
                                            "pageSize": 10,
                                            "paged": true,
                                            "unpaged": false
                                        },
                                        "last": true,
                                        "totalPages": 1,
                                        "totalElements": 2,
                                        "size": 10,
                                        "number": 0,
                                        "sort": {
                                            "empty": false,
                                            "sorted": true,
                                            "unsorted": false
                                        },
                                        "first": true,
                                        "numberOfElements": 2,
                                        "empty": false
                                    }
                                    """)
                    }) }),
            @ApiResponse(responseCode = "401", description = "Usuário não autenticado"),
            @ApiResponse(responseCode = "404", description = "Motorista não encontrado"),
            @ApiResponse(responseCode = "500", description = "Erro interno do servidor")
    })
    public ResponseEntity<Page<CaronaDto>> listarCaronasMotorista(@PathVariable final Long motoristaId,
            final Pageable pageable) {
        log.info("Listando caronas do motorista ID: {}", motoristaId);
        final Page<CaronaDto> caronas = caronaService.buscarCaronasDoMotorista(motoristaId, pageable);
        log.info("Total de caronas encontradas: {}", caronas.getTotalElements());
        return ResponseEntity.ok(caronas);
    }

    @GetMapping("/motorista/{motoristaId}/proximas")
    @Operation(summary = "Listar próximas caronas de motorista", description = "Lista as próximas caronas agendadas de um motorista, ordenadas por data/hora de partida crescente.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Lista de próximas caronas obtida com sucesso", content = {
                    @Content(mediaType = "application/json", schema = @Schema(implementation = List.class), examples = {
                            @ExampleObject(name = "Lista de próximas caronas do motorista", description = "Exemplo de resposta com lista de próximas caronas", value = """
                                    [
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
                                            "pontoDestino": "Avenida B, 456",
                                            "dataHoraPartida": "01-10-2025T10:00:00",
                                            "dataHoraChegada": "01-10-2025T12:00:00",
                                            "vagas": 3,
                                            "status": "AGENDADA",
                                            "vagasDisponiveis": 2,
                                            "distanciaEstimadaKm": 15.5
                                        },
                                        {
                                            "id": 2,
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
                                            "pontoPartida": "Rua C, 789",
                                            "pontoDestino": "Avenida D, 1010",
                                            "dataHoraPartida": "02-10-2025T08:00:00",
                                            "dataHoraChegada": "02-10-2025T09:30:00",
                                            "vagas": 3,
                                            "status": "AGENDADA",
                                            "vagasDisponiveis": 3,
                                            "distanciaEstimadaKm": 16.8
                                        }
                                    ]
                                    """)
                    }) }),
            @ApiResponse(responseCode = "401", description = "Usuário não autenticado"),
            @ApiResponse(responseCode = "404", description = "Motorista não encontrado"),
            @ApiResponse(responseCode = "500", description = "Erro interno do servidor")
    })
    public ResponseEntity<List<CaronaDto>> listarProximasCaronasMotorista(@PathVariable final Long motoristaId) {
        log.info("Listando próximas caronas agendadas do motorista ID: {}", motoristaId);
        final List<CaronaDto> caronas = caronaService.buscarProximasCaronasDoMotorista(motoristaId);
        log.info("Total de próximas caronas encontradas: {}", caronas.size());
        return ResponseEntity.ok(caronas);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Atualizar carona", description = "Atualiza os dados de uma carona existente. Apenas o motorista que criou a carona pode atualizá-la.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Carona atualizada com sucesso", content = {
                    @Content(mediaType = "application/json", schema = @Schema(implementation = CaronaDto.class), examples = {
                            @ExampleObject(name = "Carona atualizada com sucesso", description = "Exemplo de resposta após atualização de uma carona", value = """
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
                                        "pontoPartida": "Rua C, 789",
                                        "latitudePartida": -23.5550,
                                        "longitudePartida": -46.6400,
                                        "pontoDestino": "Avenida D, 1010",
                                        "latitudeDestino": -23.5605,
                                        "longitudeDestino": -46.6450,
                                        "dataHoraPartida": "01-10-2025T08:30:00",
                                        "dataHoraChegada": "01-10-2025T10:30:00",
                                        "vagas": 4,
                                        "status": "AGENDADA",
                                        "observacoes": "Carona para São Paulo - Atualizada",
                                        "passageiros": [],
                                        "vagasDisponiveis": 4,
                                        "distanciaEstimadaKm": 16.8,
                                        "tempoEstimadoSegundos": 1320,
                                        "trajetorias": [
                                            {
                                                "coordenadas": [
                                                    [-23.5550, -46.6400],
                                                    [-23.5580, -46.6420],
                                                    [-23.5605, -46.6450]
                                                ],
                                                "distanciaKm": 16.8,
                                                "tempoSegundos": 1320,
                                                "descricao": "Principal"
                                            }
                                        ],
                                        "trajetoriaPrincipal": {
                                            "coordenadas": [
                                                [-23.5550, -46.6400],
                                                [-23.5580, -46.6420],
                                                [-23.5605, -46.6450]
                                            ],
                                            "distanciaKm": 16.8,
                                            "tempoSegundos": 1320,
                                            "descricao": "Principal"
                                        }
                                    }
                                    """)
                    }) }),
            @ApiResponse(responseCode = "400", description = "Dados inválidos fornecidos ou datas inválidas"),
            @ApiResponse(responseCode = "401", description = "Usuário não autenticado"),
            @ApiResponse(responseCode = "403", description = "Usuário não tem permissão para atualizar esta carona"),
            @ApiResponse(responseCode = "404", description = "Carona não encontrada"),
            @ApiResponse(responseCode = "500", description = "Erro interno do servidor")
    })
    public ResponseEntity<CaronaDto> atualizarCarona(@PathVariable Long id,
            @Valid @io.swagger.v3.oas.annotations.parameters.RequestBody(content = @Content(mediaType = "application/json", schema = @Schema(implementation = CaronaRequest.class), examples = {
                    @ExampleObject(name = "Requisição de Atualização de Carona", description = "Modelo de requisição para atualizar uma carona existente", value = """
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
                            """)
            })) @RequestBody CaronaRequest request) {
        log.info("Atualizando carona com ID: {}", id);
        final CaronaDto caronaAtualizada = caronaService.atualizarCarona(id, request);
        log.info("Carona atualizada com sucesso. ID: {}", caronaAtualizada.getId());
        return ResponseEntity.ok(caronaAtualizada);
    }

    @PatchMapping("/{id}/status/{status}")
    @Operation(summary = "Alterar status da carona", description = "Altera o status de uma carona. As possíveis transições de status são: AGENDADA → EM_ANDAMENTO → FINALIZADA ou AGENDADA → CANCELADA. Apenas o motorista da carona pode alterar seu status.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Status da carona alterado com sucesso", content = {
                    @Content(mediaType = "application/json", schema = @Schema(implementation = CaronaDto.class), examples = {
                            @ExampleObject(name = "Status alterado para EM_ANDAMENTO", description = "Exemplo de resposta após alteração do status para EM_ANDAMENTO", value = """
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
                                        "observacoes": "Carona para São Paulo",
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
                                        ],
                                        "trajetoriaPrincipal": {
                                            "coordenadas": [
                                                [-23.5505, -46.6333],
                                                [-23.5550, -46.6400],
                                                [-23.5605, -46.6450]
                                            ],
                                            "distanciaKm": 15.5,
                                            "tempoSegundos": 1200,
                                            "descricao": "Principal"
                                        }
                                    }
                                    """)
                    }) }),
            @ApiResponse(responseCode = "400", description = "Status inválido ou alteração de status não permitida"),
            @ApiResponse(responseCode = "401", description = "Usuário não autenticado"),
            @ApiResponse(responseCode = "403", description = "Usuário não tem permissão para alterar esta carona"),
            @ApiResponse(responseCode = "404", description = "Carona não encontrada"),
            @ApiResponse(responseCode = "500", description = "Erro interno do servidor")
    })
    public ResponseEntity<CaronaDto> alterarStatusCarona(@PathVariable Long id,
            @PathVariable StatusCarona status) {
        log.info("Alterando status da carona ID: {} para {}", id, status);
        CaronaDto caronaAtualizada = caronaService.alterarStatusCarona(id, status);
        return ResponseEntity.ok(caronaAtualizada);
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Cancelar carona", description = "Cancela uma carona, alterando seu status para CANCELADA. Apenas o motorista que criou a carona pode cancelá-la. Não é possível cancelar uma carona que já esteja com status FINALIZADA ou CANCELADA.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "204", description = "Carona cancelada com sucesso"),
            @ApiResponse(responseCode = "400", description = "Não foi possível cancelar a carona (já finalizada ou já cancelada)"),
            @ApiResponse(responseCode = "401", description = "Usuário não autenticado"),
            @ApiResponse(responseCode = "403", description = "Usuário não tem permissão para cancelar esta carona"),
            @ApiResponse(responseCode = "404", description = "Carona não encontrada"),
            @ApiResponse(responseCode = "500", description = "Erro interno do servidor")
    })
    public ResponseEntity<Void> cancelarCarona(@PathVariable Long id) {
        log.info("Cancelando carona com ID: {}", id);
        caronaService.alterarStatusCarona(id, StatusCarona.CANCELADA);
        log.info("Carona cancelada com sucesso. ID: {}", id);
        return ResponseEntity.noContent().build();
    }
}
