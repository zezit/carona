package com.br.puc.carona.controller;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.br.puc.carona.dto.response.DetourInfoDto;
import com.br.puc.carona.dto.response.PedidoDeEntradaCompletoDto;
import com.br.puc.carona.dto.response.PedidoDeEntradaDto;
import com.br.puc.carona.enums.Status;
import com.br.puc.carona.service.PedidoDeEntradaService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@RestController
@RequestMapping("/pedidos")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Pedidos de Entrada", description = "Gerenciamento de pedidos de entrada no sistema de caronas")
public class PedidoDeEntradaController {

    private final PedidoDeEntradaService pedidoDeEntradaService;

    @GetMapping("/{id}")
    @Operation(summary = "Buscar pedido de entrada por ID", description = "Recupera os detalhes de um pedido de entrada pelo ID")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Pedido de entrada encontrado"),
            @ApiResponse(responseCode = "404", description = "Pedido de entrada não encontrado")
    })
    public ResponseEntity<PedidoDeEntradaDto> buscarPedidoPorId(@PathVariable Long id) {
        log.info("Buscando pedido de entrada com ID: {}", id);
        PedidoDeEntradaDto pedidoDeEntrada = pedidoDeEntradaService.getPedidoPorId(id);
        return ResponseEntity.ok(pedidoDeEntrada);
    }

    @GetMapping
    @Operation(summary = "Buscar todos os pedidos de entrada", description = "Recupera todos os pedidos de entrada com paginação")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Lista de pedidos de entrada encontrada"),
            @ApiResponse(responseCode = "404", description = "Nenhum pedido de entrada encontrado")
    })
    public ResponseEntity<Page<PedidoDeEntradaDto>> buscarTodosOsPedidos(Pageable pageable) {
        log.info("Buscando todos os pedidos de entrada com paginação");
        Page<PedidoDeEntradaDto> pedidos = pedidoDeEntradaService.getAllPedidos(pageable);
        return ResponseEntity.ok(pedidos);
    }

    @PutMapping("/{idPedido}/status/{status}")
    @Operation(summary = "Atualizar status do pedido de entrada", description = "Aprova ou recusa um pedido de entrada")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Status do pedido de entrada atualizado com sucesso"),
            @ApiResponse(responseCode = "400", description = "Parâmetros de requisição inválidos"),
            @ApiResponse(responseCode = "404", description = "Pedido de entrada não encontrado")
    })
    public ResponseEntity<PedidoDeEntradaDto> atualizarStatusPedidoDeEntrada(
            @PathVariable Long idPedido,
            @PathVariable Status status) {
        log.info("Atualizando status do pedido de entrada com ID: {} para: {}", idPedido, status);
        PedidoDeEntradaDto pedidoAtualizado = pedidoDeEntradaService.atualizarStatusPedidoDeEntrada(idPedido,
                status);
        return ResponseEntity.ok(pedidoAtualizado);
    }

    @PostMapping("/aprovarCarona/{idPedido}/{status}")
    @Operation(summary = "Aprovar pedido de entrada (Legado)", description = "Método legado para aprovar/recusar um pedido de entrada")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Pedido de entrada atualizado com sucesso"),
            @ApiResponse(responseCode = "404", description = "Pedido de entrada não encontrado")
    })
    @Deprecated
    public ResponseEntity<PedidoDeEntradaDto> aprovarPedidoDeEntrada(
            @PathVariable Long idPedido,
            @PathVariable final Status status) {
        log.info("Usando endpoint legado para atualizar pedido com ID: {} para status: {}", idPedido, status);
        PedidoDeEntradaDto pedidoAtualizado = pedidoDeEntradaService.atualizarStatusPedidoDeEntrada(idPedido,
                status);
        return ResponseEntity.ok(pedidoAtualizado);
    }

    @GetMapping("/motorista/{motoristaId}/carona/{caronaId}")
    @Operation(summary = "Buscar pedidos de entrada por motorista e carona", description = "Recupera todos os pedidos de entrada pendentes de um motorista específico para uma carona específica")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Lista de pedidos de entrada encontrados"),
            @ApiResponse(responseCode = "404", description = "Nenhum pedido de entrada encontrado")
    })
    public ResponseEntity<Page<PedidoDeEntradaCompletoDto>> buscarPedidosPorMotoristaECarona(
            @PathVariable Long motoristaId,
            @PathVariable Long caronaId,
            Pageable pageable) {
        log.info("Buscando pedidos de entrada pendentes do motorista com ID: {} para a carona com ID: {}, página: {}",
                motoristaId, caronaId, pageable.getPageNumber());
        Page<PedidoDeEntradaCompletoDto> pedidos = pedidoDeEntradaService
                .getPedidoDeEntradasPorMotoristaECaronaId(motoristaId, caronaId, pageable);
        return ResponseEntity.ok(pedidos);
    }

    @PutMapping("/{idPedido}/cancelar")
    @Operation(summary = "Cancelar pedido de entrada", description = "Cancela um pedido de entrada. Pode ser cancelado pelo passageiro ou pelo motorista. Para pedidos aprovados, remove o passageiro e recalcula a rota.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "204", description = "Pedido cancelado com sucesso"),
            @ApiResponse(responseCode = "400", description = "Pedido não pode ser cancelado (status inválido)"),
            @ApiResponse(responseCode = "403", description = "Usuário não tem permissão para cancelar este pedido"),
            @ApiResponse(responseCode = "404", description = "Pedido de entrada não encontrado"),
            @ApiResponse(responseCode = "500", description = "Erro interno do servidor")
    })
    public ResponseEntity<Void> cancelarPedidoDeEntrada(@PathVariable final Long idPedido) {
        log.info("Iniciando requisição de cancelamento do pedido de entrada com ID: {}", idPedido);
        pedidoDeEntradaService.cancelarPedidoDeEntrada(idPedido);
        log.info("Finalizando requisição de cancelamento do pedido de entrada com ID: {}", idPedido);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{idPedido}/calculate-detour")
    @Operation(summary = "Calcular impacto da rota com desvio", description = "Calcula o impacto adicional na rota original se o pedido for aceito, incluindo tempo e distância adicionais")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Informações de desvio calculadas com sucesso"),
            @ApiResponse(responseCode = "404", description = "Pedido de entrada não encontrado"),
            @ApiResponse(responseCode = "500", description = "Erro interno do servidor")
    })
    public ResponseEntity<DetourInfoDto> calculateDetourInfo(@PathVariable final Long idPedido) {
        log.info("Calculando informações de desvio para o pedido ID: {}", idPedido);
        DetourInfoDto detourInfo = pedidoDeEntradaService.calculateDetourInfo(idPedido);
        log.info("Informações de desvio calculadas com sucesso para o pedido ID: {}", idPedido);
        return ResponseEntity.ok(detourInfo);
    }

}
