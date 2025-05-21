package com.br.puc.carona.controller;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.br.puc.carona.dto.response.PedidoDeEntradaCompletoDto;
import com.br.puc.carona.dto.response.PedidoDeEntradaDto;
import com.br.puc.carona.enums.StatusAprovarPedidoCarona;
import com.br.puc.carona.model.PedidoDeEntrada;
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

    @PostMapping("/aprovarCarona/{idPedido}/{status}")
    @Operation(summary = "Aprovar pedido de entrada", description = "Aprova um pedido de entrada específico")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Pedido de entrada aprovado com sucesso"),
            @ApiResponse(responseCode = "404", description = "Pedido de entrada não encontrado")
    })
    public ResponseEntity<Void> aprovarPedidoDeEntrada(@PathVariable Long idPedido, @PathVariable final StatusAprovarPedidoCarona status) {
        log.info("Aprovando pedido de entrada com ID de solicitação: {} e status: {}", idPedido, status);
        pedidoDeEntradaService.aprovarPedidoDeEntrada(idPedido, status);
        return ResponseEntity.ok().build();

    }

    
    @GetMapping("/motorista/{motoristaId}")
    @Operation(summary = "Buscar pedidos de entrada por motorista", description = "Recupera todos os pedidos de entrada pendentes de um motorista específico")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Lista de pedidos de entrada encontrados"),
            @ApiResponse(responseCode = "404", description = "Nenhum pedido de entrada encontrado")
    })
    public ResponseEntity<List<PedidoDeEntradaCompletoDto>> buscarPedidosPorMotorista(@PathVariable Long motoristaId ) {
        log.info("Buscando pedidos de entrada pendentes do motorista com ID: {}", motoristaId);
        List<PedidoDeEntradaCompletoDto> pedidos = pedidoDeEntradaService.getPedidoDeEntradasPorMotoristaId(motoristaId);
        return ResponseEntity.ok(pedidos);
    }


}
