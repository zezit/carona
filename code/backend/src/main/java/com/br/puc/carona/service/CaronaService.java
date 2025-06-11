package com.br.puc.carona.service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.br.puc.carona.constants.MensagensResposta;
import com.br.puc.carona.dto.TrajetoDto;
import com.br.puc.carona.dto.request.CaronaRequest;
import com.br.puc.carona.dto.response.CaronaDto;
import com.br.puc.carona.dto.response.CompleteRouteDto;
import com.br.puc.carona.dto.response.PassengerWaypointDto;
import com.br.puc.carona.enums.StatusCarona;
import com.br.puc.carona.enums.Status;
import com.br.puc.carona.enums.NotificationType;
import com.br.puc.carona.exception.custom.CaronaForaDoHorarioPermitido;
import com.br.puc.carona.exception.custom.CaronaStatusInvalido;
import com.br.puc.carona.exception.custom.EntidadeNaoEncontrada;
import com.br.puc.carona.exception.custom.ErroDeCliente;
import com.br.puc.carona.mapper.CaronaMapper;
import com.br.puc.carona.utils.RouteOptimizer;
import com.br.puc.carona.utils.RouteOptimizer.Waypoint;
import com.br.puc.carona.mapper.TrajetoMapper;
import com.br.puc.carona.messaging.MensagemProducer;
import com.br.puc.carona.messaging.contract.RideCancellationMessageDTO;
import com.br.puc.carona.model.Carona;
import com.br.puc.carona.model.Estudante;
import com.br.puc.carona.model.PedidoDeEntrada;
import com.br.puc.carona.model.PerfilMotorista;
import com.br.puc.carona.model.SolicitacaoCarona;
import com.br.puc.carona.model.Trajeto;
import com.br.puc.carona.repository.CaronaRepository;
import com.br.puc.carona.repository.PerfilMotoristaRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class CaronaService {

    private static final int MINIMUM_VAGAS = 1;

    private final CaronaRepository caronaRepository;
    private final PerfilMotoristaRepository perfilMotoristaRepository;

    private final CaronaMapper caronaMapper;
    private final TrajetoMapper trajetoMapper;

    private final CurrentUserService currentUserService;
    private final MapService mapService;

    private final WebsocketService webSocketService;
    private final MensagemProducer mensagemProducer;

    @Transactional
    public CaronaDto criarCarona(final CaronaRequest request) {
        log.info("Criando nova carona");

        // parse date to brazil timezone
        if (request.getDataHoraPartida() != null) {
            request.setDataHoraPartida(request.getDataHoraPartida().withNano(0));
        }

        if (request.getDataHoraChegada() != null) {
            request.setDataHoraChegada(request.getDataHoraChegada().withNano(0));
        }

        // Buscar o perfil do motorista
        final PerfilMotorista perfilMotorista = currentUserService.getCurrentMotorista();

        if (!perfilMotorista.getEstudante().isAccountApproved()) {
            throw new ErroDeCliente(MensagensResposta.CADASTRO_NAO_APROVADO);
        }

        // Validar datas da carona
        validarDatasCarona(request.getDataHoraPartida(), request.getDataHoraChegada());
        validarVagas(request.getVagas(), perfilMotorista.getCarro().getCapacidadePassageiros());

        // Criar a carona
        final Carona carona = caronaMapper.toEntity(request);
        carona.setMotorista(perfilMotorista);
        carona.setStatus(StatusCarona.AGENDADA);

        // Calcular e adicionar trajetos
        calcularTrajeto(carona);

        // Persistir a carona
        caronaRepository.save(carona);
        log.info("Carona criada com sucesso. ID: {}", carona.getId());

        // TODO: Publicar evento de carona criada (para notificações)

        return caronaMapper.toDto(carona);
    }

    @Transactional
    public CaronaDto atualizarCarona(final Long caronaId, final CaronaRequest request) {
        log.info("Atualizando carona ID: {}", caronaId);

        // Buscar o perfil do motorista atual
        final PerfilMotorista motorista = currentUserService.getCurrentMotorista();

        // Buscar a carona
        final Carona carona = caronaRepository.findById(caronaId)
                .orElseThrow(() -> new EntidadeNaoEncontrada(MensagensResposta.CARONA_NAO_ENCONTRADA, caronaId));

        // Validar se o motorista é o dono da carona
        if (!carona.getMotorista().getId().equals(motorista.getId())) {
            throw new ErroDeCliente(MensagensResposta.CARONA_NAO_PERTENCE_AO_MOTORISTA);
        }

        // Validar datas da carona
        validarDatasCarona(request.getDataHoraPartida(), request.getDataHoraChegada());
        validarVagas(request.getVagas(), motorista.getCarro().getCapacidadePassageiros());

        // Atualizar a carona
        caronaMapper.updateEntity(carona, request);

        // Recalcular estimativas de distância e tempo e trajetos se pontos de partida
        // ou destino foram
        // alterados
        if (pontosForamAlterados(carona, request)) {
            // Remover trajetos existentes
            carona.removerTodosTrajetos();

            // Calcular novas trajetos
            calcularTrajeto(carona);
        }

        // Persistir a atualização
        caronaRepository.save(carona);
        log.info("Carona atualizada com sucesso. ID: {}", carona.getId());

        // TODO: Publicar evento de carona atualizada (para notificações)

        return caronaMapper.toDto(carona);
    }

    @Transactional
    public CaronaDto alterarStatusCarona(final Long caronaId, final StatusCarona status) {
        log.info("Alterando status da carona ID: {}", caronaId);

        // Buscar o perfil do motorista
        final PerfilMotorista motorista = currentUserService.getCurrentMotorista();

        // Buscar a carona
        final Carona carona = caronaRepository.findById(caronaId)
                .orElseThrow(() -> new EntidadeNaoEncontrada(MensagensResposta.CARONA_NAO_ENCONTRADA, caronaId));

        // Validar se o motorista é o dono da carona
        if (!carona.getMotorista().getId().equals(motorista.getId())) {
            throw new ErroDeCliente(MensagensResposta.CARONA_NAO_PERTENCE_AO_MOTORISTA);
        }

        validarMudancaStatus(carona, status);

        // Alterar o status da carona
        carona.setStatus(status);
        log.info("Status da carona alterado para: {}", status);

        // Se a carona está sendo cancelada, notificar todos os passageiros confirmados
        if (status == StatusCarona.CANCELADA) {
            log.info("Carona está sendo cancelada, iniciando notificação aos passageiros...");
            notificarPassageirosRideCancelada(carona, motorista.getEstudante().getId());
            log.info("Processo de notificação aos passageiros concluído.");
        }

        // Persistir a atualização
        caronaRepository.save(carona);
        log.info("Status da carona alterado com sucesso. ID: {}", carona.getId());

        return caronaMapper.toDto(carona);
    }

    public CaronaDto buscarCaronaPorId(final Long caronaId) {
        log.info("Buscando carona com ID: {}", caronaId);

        final Carona carona = caronaRepository.findById(caronaId)
                .orElseThrow(() -> new EntidadeNaoEncontrada(MensagensResposta.CARONA_NAO_ENCONTRADA, caronaId));

        return caronaMapper.toDto(carona);
    }

    public Page<CaronaDto> buscarCaronasDoMotorista(final Long motoristaId, final Pageable pageable) {
        log.info("Buscando caronas do motorista ID: {}", motoristaId);

        // Verificar se o motorista existe
        if (!perfilMotoristaRepository.existsById(motoristaId)) {
            throw new EntidadeNaoEncontrada(MensagensResposta.ESTUDANTE_NAO_E_MOTORISTA, motoristaId);
        }

        final Page<Carona> caronas = caronaRepository.findByMotoristaIdOrderByDataHoraPartidaDesc(motoristaId,
                pageable);

        return caronas.map(caronaMapper::toDto);
    }

    // Método para buscar próximas caronas agendadas de um motorista
    public List<CaronaDto> buscarProximasCaronasDoMotorista(final Long motoristaId) {
        log.info("Buscando próximas caronas agendadas do motorista ID: {}", motoristaId);

        // Verificar se o motorista existe
        if (!perfilMotoristaRepository.existsById(motoristaId)) {
            throw new EntidadeNaoEncontrada(MensagensResposta.ESTUDANTE_NAO_E_MOTORISTA, motoristaId);
        }

        // Buscar caronas agendadas com data de partida no futuro
        final List<Carona> caronas = caronaRepository
                .findByMotoristaIdAndStatusAndDataHoraPartidaAfterOrderByDataHoraPartidaAsc(
                        motoristaId,
                        StatusCarona.AGENDADA,
                        LocalDateTime.now());

        return caronas.stream()
                .map(caronaMapper::toDto)
                .toList();
    }

    // Método para buscar histórico de caronas onde um estudante foi passageiro
    public List<CaronaDto> buscarCaronasDoPassageiro(final Long estudanteId) {
        log.info("Buscando histórico de caronas do passageiro ID: {}", estudanteId);

        // Buscar caronas onde o estudante foi passageiro
        final List<Carona> caronas = caronaRepository
                .findByPassageiroIdOrderByDataHoraPartidaDesc(estudanteId);

        log.info("Encontradas {} caronas para o passageiro ID: {}", caronas.size(), estudanteId);
        
        return caronas.stream()
                .map(caronaMapper::toDto)
                .toList();
    }

    /**
     * Valida as datas de partida e chegada da carona
     * 
     * @param dataHoraPartida data e hora de partida
     * @param dataHoraChegada data e hora de chegada
     */
    private void validarDatasCarona(final LocalDateTime dataHoraPartida, final LocalDateTime dataHoraChegada) {
        final LocalDateTime agora = LocalDateTime.now();

        if (dataHoraPartida == null && dataHoraChegada == null) {
            throw new ErroDeCliente(MensagensResposta.NECESSARIO_INFORMAR_DATA_PARTIDA_CHEGADA);
        }

        // Verificar se data de partida é no futuro
        if (dataHoraPartida != null && dataHoraPartida.isBefore(agora)) {
            throw new ErroDeCliente(MensagensResposta.DATA_PARTIDA_INVALIDA);
        }

        // Verificar se data de chegada é no futuro
        if (dataHoraChegada != null && dataHoraChegada.isBefore(agora)) {
            throw new ErroDeCliente(MensagensResposta.DATA_CHEGADA_INVALIDA);
        }

        // Verificar se a data de chegada é posterior à data de partida
        if (dataHoraPartida != null && dataHoraChegada != null &&
                dataHoraChegada.isBefore(dataHoraPartida)) {
            throw new ErroDeCliente(MensagensResposta.DATA_CHEGADA_ANTERIOR_PARTIDA);
        }
    }

    /**
     * Valida a mudança de status da carona
     * 
     * @param carona carona a ser validada
     * @param status novo status da carona
     */
    private void validarMudancaStatus(final Carona carona, final StatusCarona status) {
        if (StatusCarona.AGENDADA.equals(status)) {
            // Não é permitido alterar o status para AGENDADA
            throw new ErroDeCliente(MensagensResposta.ALTERACAO_STATUS_CARONA_INVALIDA);
        }

        if (StatusCarona.CANCELADA.equals(carona.getStatus()) || StatusCarona.FINALIZADA.equals(carona.getStatus())) {
            // Não é permitido alterar o status de uma carona CANCELADA ou FINALIZADA
            throw new ErroDeCliente(MensagensResposta.ALTERACAO_STATUS_CARONA_INVALIDA);
        }

        if (StatusCarona.AGENDADA.equals(carona.getStatus()) && StatusCarona.FINALIZADA.equals(status)) {
            // Não é permitido alterar o status de AGENDADA para FINALIZADA
            throw new ErroDeCliente(MensagensResposta.ALTERACAO_STATUS_CARONA_INVALIDA);
        }
    }

    /**
     * Calcula as trajetos (principal e alternativas) para uma carona
     * 
     * @param carona carona a calcular trajetos
     */
    private void calcularTrajeto(final Carona carona) {
        // Verificar se temos coordenadas necessárias
        if (carona.getLatitudePartida() == null || carona.getLongitudePartida() == null ||
                carona.getLatitudeDestino() == null || carona.getLongitudeDestino() == null) {
            log.warn("Não é possível calcular trajetos sem coordenadas completas");
            return;
        }

        log.info("Calculando trajetos para carona");
        List<TrajetoDto> trajetosDto = mapService.calculateTrajectories(
                carona.getLatitudePartida(), carona.getLongitudePartida(),
                carona.getLatitudeDestino(), carona.getLongitudeDestino());

        if (trajetosDto != null && !trajetosDto.isEmpty()) {
            // Converter DTOs para entidades e associar à carona
            for (TrajetoDto trajetoDto : trajetosDto) {
                final Trajeto trajeto = trajetoMapper.toEntity(trajetoDto);
                carona.adicionarTrajeto(trajeto);
            }

            final Trajeto trajetoPrincipal = carona.getTrajetos().stream()
                    .filter(Trajeto::getPrincipal)
                    .findFirst()
                    .orElseThrow(() -> new RuntimeException(MensagensResposta.ERRO_INTERNO));

            carona.setDistanciaEstimadaMetros(trajetoPrincipal.getDistanciaMetros());
            carona.setTempoEstimadoSegundos(trajetoPrincipal.getTempoSegundos());

            log.info("Trajetos calculadas e adicionadas: {}", trajetosDto.size());
        } else {
            log.warn("Não foi possível calcular trajetos para a carona");
        }
    }

    /**
     * Verifica se os pontos de partida ou destino foram alterados
     * 
     * @param carona  carona atual
     * @param request nova requisição
     * @return true se os pontos foram alterados
     */
    private boolean pontosForamAlterados(final Carona carona, final CaronaRequest request) {
        // Verificar se os endereços foram alterados
        final boolean enderecoAlterado = (carona.getPontoPartida() == null && request.getPontoPartida() != null) ||
                (carona.getPontoPartida() != null && !carona.getPontoPartida().equals(request.getPontoPartida())) ||
                (carona.getPontoDestino() == null && request.getPontoDestino() != null) ||
                (carona.getPontoDestino() != null && !carona.getPontoDestino().equals(request.getPontoDestino()));

        // Verificar se as coordenadas foram alteradas
        boolean coordenadasAlteradas = false;

        if (carona.getLatitudePartida() != null && request.getLatitudePartida() != null) {
            coordenadasAlteradas = !carona.getLatitudePartida().equals(request.getLatitudePartida());
        }

        if (!coordenadasAlteradas && carona.getLongitudePartida() != null && request.getLongitudePartida() != null) {
            coordenadasAlteradas = !carona.getLongitudePartida().equals(request.getLongitudePartida());
        }

        if (!coordenadasAlteradas && carona.getLatitudeDestino() != null && request.getLatitudeDestino() != null) {
            coordenadasAlteradas = !carona.getLatitudeDestino().equals(request.getLatitudeDestino());
        }

        if (!coordenadasAlteradas && carona.getLongitudeDestino() != null && request.getLongitudeDestino() != null) {
            coordenadasAlteradas = !carona.getLongitudeDestino().equals(request.getLongitudeDestino());
        }

        return enderecoAlterado || coordenadasAlteradas;
    }

    @Transactional
    public void adicionarPassageiro(Long idCarona, Estudante estudante) {

        // Buscar a carona
        final Carona carona = caronaRepository.findById(idCarona)
                .orElseThrow(() -> new EntidadeNaoEncontrada(MensagensResposta.CARONA_NAO_ENCONTRADA, idCarona));

        // Adicionar o passageiro à carona

        carona.adicionarPassageiro(estudante);

        // Persistir a atualização
        caronaRepository.save(carona);
        log.info("Passageiro adicionado com sucesso à carona. ID: {}", carona.getId());
    }

    @Transactional
    public CaronaDto iniciarCarona(Long idCarona) {
        log.info("Iniciando carona com ID: {}", idCarona);
        Carona carona = caronaRepository.findById(idCarona)
                .orElseThrow(() -> new EntidadeNaoEncontrada(MensagensResposta.CARONA_NAO_ENCONTRADA, idCarona));

        validarPermissaoMotorista();
        validarStatus(carona, StatusCarona.AGENDADA);
        validarHorarioPermitido(carona.getDataHoraPartida());

        if(carona.getStatus() != StatusCarona.AGENDADA) {
            throw new CaronaStatusInvalido();
        }


        CaronaDto caronaAtualizada = alterarStatusCarona(idCarona, StatusCarona.EM_ANDAMENTO);

        webSocketService.emitirEventoCaronaAtualizada(caronaAtualizada);

        return caronaAtualizada;

    }

    @Transactional
    public CaronaDto finalizarCarona(Long idCarona) {
        log.info("Iniciando carona com ID: {}", idCarona);
        Carona carona = caronaRepository.findById(idCarona)
                .orElseThrow(() -> new EntidadeNaoEncontrada(MensagensResposta.CARONA_NAO_ENCONTRADA, idCarona));

        validarPermissaoMotorista();
        validarStatus(carona, StatusCarona.EM_ANDAMENTO);

        if(carona.getStatus() != StatusCarona.EM_ANDAMENTO) {
            throw new CaronaStatusInvalido();
        }


        CaronaDto caronaAtualizada = alterarStatusCarona(idCarona, StatusCarona.FINALIZADA);

        webSocketService.emitirEventoCaronaAtualizada(caronaAtualizada);

        return caronaAtualizada;

    }

    private void validarStatus(Carona carona, StatusCarona status) {
        if (carona.getStatus() != status) {
            throw new CaronaStatusInvalido();
        }
    }
    private void validarHorarioPermitido(LocalDateTime horarioPartida) {
        LocalDateTime agora = LocalDateTime.now();
        if (agora.isBefore(horarioPartida.minusMinutes(15)) || agora.isAfter(horarioPartida.plusMinutes(15))) {
            throw new CaronaForaDoHorarioPermitido();
        }
    }
    private void validarPermissaoMotorista(){
        // IMPLEMENTAR ISSO
    }

    /**
     * Validates the number of available seats for a ride.
     *
     * @param vagas                 The number of available seats to validate
     * @param capacidadePassageiros The maximum passenger capacity of the vehicle
     * @throws ErroDeCliente if the number of seats is null, less than 1, or exceeds
     *                       vehicle capacity
     */
    private void validarVagas(final Integer vagas, final Integer capacidadePassageiros) {
        if (vagas == null || vagas < MINIMUM_VAGAS) {
            throw new ErroDeCliente(MensagensResposta.VAGAS_INSUFICIENTES);
        }

        if (vagas > capacidadePassageiros) {
            throw new ErroDeCliente(MensagensResposta.QUANTIDADE_VAGAS_INVALIDAS);
        }
    }
   
    public void removerPassageiroDaCarona(Long idCarona, Long idPassageiro) {

        final Carona carona = caronaRepository.findById(idCarona)
                .orElseThrow(() -> new EntidadeNaoEncontrada(MensagensResposta.CARONA_NAO_ENCONTRADA, idCarona));

        carona.removerPassageiro(idPassageiro);

        caronaRepository.save(carona);
    }

    /**
     * Calcula a rota completa da carona incluindo todos os pontos de embarque e desembarque
     * dos passageiros confirmados, ordenados de forma otimizada.
     * 
     * @param caronaId ID da carona
     * @return CompleteRouteDto com a rota completa e pontos dos passageiros
     */
    public CompleteRouteDto calcularRotaCompleta(final Long caronaId) {
        log.info("Calculando rota completa para carona ID: {}", caronaId);
        
        final Carona carona = caronaRepository.findById(caronaId)
                .orElseThrow(() -> new EntidadeNaoEncontrada(MensagensResposta.CARONA_NAO_ENCONTRADA, caronaId));

        // Obter todos os pedidos aprovados da carona
        final List<PedidoDeEntrada> pedidosAprovados = carona.getPedidosEntrada().stream()
                .filter(pedido -> pedido.getStatus() == Status.APROVADO)
                .collect(Collectors.toList());

        if (pedidosAprovados.isEmpty()) {
            log.info("Nenhum passageiro confirmado encontrado para carona ID: {}", caronaId);
            
            // Retornar apenas a rota original sem passageiros
            final Trajeto rotaOriginal = carona.getTrajetos().stream()
                    .filter(Trajeto::getPrincipal)
                    .findFirst()
                    .orElse(carona.getTrajetos().isEmpty() ? null : carona.getTrajetos().get(0));

            if (rotaOriginal != null) {
                return CompleteRouteDto.builder()
                        .caronaId(caronaId)
                        .rotaCompleta(trajetoMapper.toDto(rotaOriginal))
                        .pontosPassageiros(new ArrayList<>())
                        .distanciaTotalMetros(rotaOriginal.getDistanciaMetros())
                        .tempoTotalSegundos(rotaOriginal.getTempoSegundos())
                        .build();
            }
        }

        // Criar lista de waypoints dos passageiros para otimização
        final List<Waypoint> passengerWaypoints = new ArrayList<>();
        
        for (final PedidoDeEntrada pedido : pedidosAprovados) {
            final SolicitacaoCarona solicitacao = pedido.getSolicitacao();
            final Estudante estudante = solicitacao.getEstudante();
            
            // Adicionar ponto de embarque
            if (solicitacao.getOrigemLatitude() != null && solicitacao.getOrigemLongitude() != null) {
                passengerWaypoints.add(new Waypoint(
                    solicitacao.getOrigemLatitude(),
                    solicitacao.getOrigemLongitude(),
                    "pickup",
                    estudante.getId(),
                    estudante.getNome(),
                    solicitacao.getOrigem(),
                    pedido.getId()
                ));
            }
            
            // Adicionar ponto de desembarque
            if (solicitacao.getDestinoLatitude() != null && solicitacao.getDestinoLongitude() != null) {
                passengerWaypoints.add(new Waypoint(
                    solicitacao.getDestinoLatitude(),
                    solicitacao.getDestinoLongitude(),
                    "dropoff",
                    estudante.getId(),
                    estudante.getNome(),
                    solicitacao.getDestino(),
                    pedido.getId()
                ));
            }
        }

        // Otimizar a ordem dos waypoints
        final List<Waypoint> optimizedWaypoints = RouteOptimizer.optimizeRoute(
            carona.getLatitudePartida(), carona.getLongitudePartida(),
            carona.getLatitudeDestino(), carona.getLongitudeDestino(),
            passengerWaypoints
        );

        // Converter waypoints otimizados para coordenadas e DTOs
        final List<Double[]> waypoints = RouteOptimizer.waypointsToCoordinates(optimizedWaypoints);
        final List<PassengerWaypointDto> pontosPassageiros = new ArrayList<>();
        
        int ordem = 1;
        for (final Waypoint waypoint : optimizedWaypoints) {
            pontosPassageiros.add(PassengerWaypointDto.builder()
                    .pedidoId(waypoint.getPedidoId())
                    .passageiroId(waypoint.getPassengerId())
                    .nomePassageiro(waypoint.getPassengerName())
                    .tipo(waypoint.isPickup() ? PassengerWaypointDto.TipoWaypoint.EMBARQUE : PassengerWaypointDto.TipoWaypoint.DESEMBARQUE)
                    .latitude(waypoint.getLatitude())
                    .longitude(waypoint.getLongitude())
                    .endereco(waypoint.getAddress())
                    .ordem(ordem++)
                    .build());
        }

        try {
            // Calcular a rota completa com todos os waypoints
            final List<TrajetoDto> rotasCompletas = mapService.calculateTrajectories(
                    carona.getLatitudePartida(), carona.getLongitudePartida(),
                    carona.getLatitudeDestino(), carona.getLongitudeDestino(),
                    waypoints);

            if (!rotasCompletas.isEmpty()) {
                final TrajetoDto rotaCompleta = rotasCompletas.get(0);
                
                log.info("Rota completa calculada: {}km, {}min para carona ID: {}",
                        rotaCompleta.getDistanciaMetros() / 1000.0,
                        rotaCompleta.getTempoSegundos() / 60.0,
                        caronaId);

                // Debug: Log the rotaCompleta object details
                log.debug("DEBUG: rotaCompleta object: distancia={}, tempo={}, coordenadas size={}, descricao='{}'",
                        rotaCompleta.getDistanciaMetros(),
                        rotaCompleta.getTempoSegundos(),
                        rotaCompleta.getCoordenadas() != null ? rotaCompleta.getCoordenadas().size() : "null",
                        rotaCompleta.getDescricao());

                final CompleteRouteDto result = CompleteRouteDto.builder()
                        .caronaId(caronaId)
                        .rotaCompleta(rotaCompleta)
                        .pontosPassageiros(pontosPassageiros)
                        .distanciaTotalMetros(rotaCompleta.getDistanciaMetros())
                        .tempoTotalSegundos(rotaCompleta.getTempoSegundos())
                        .build();

                // Debug: Log the final result structure
                log.debug("DEBUG: Returning CompleteRouteDto with caronaId={}, rotaCompleta is null={}, pontosPassageiros size={}",
                        result.getCaronaId(),
                        result.getRotaCompleta() == null,
                        result.getPontosPassageiros() != null ? result.getPontosPassageiros().size() : "null");

                return result;
            }
        } catch (final Exception e) {
            log.error("Erro ao calcular rota completa para carona ID: {}", caronaId, e);
            
            // Fallback: retornar rota original se o cálculo falhar
            final Trajeto rotaOriginal = carona.getTrajetos().stream()
                    .filter(Trajeto::getPrincipal)
                    .findFirst()
                    .orElse(carona.getTrajetos().isEmpty() ? null : carona.getTrajetos().get(0));

            if (rotaOriginal != null) {
                return CompleteRouteDto.builder()
                        .caronaId(caronaId)
                        .rotaCompleta(trajetoMapper.toDto(rotaOriginal))
                        .pontosPassageiros(pontosPassageiros)
                        .distanciaTotalMetros(rotaOriginal.getDistanciaMetros())
                        .tempoTotalSegundos(rotaOriginal.getTempoSegundos())
                        .build();
            }
        }

        throw new ErroDeCliente("Não foi possível calcular a rota completa da carona");
    }

    /**
     * Notifica todos os passageiros confirmados sobre o cancelamento completo da carona
     * 
     * @param carona A carona que foi cancelada
     * @param driverId ID do motorista que cancelou a carona
     */
    private void notificarPassageirosRideCancelada(final Carona carona, final Long driverId) {
        log.info("Notificando passageiros sobre cancelamento da carona ID: {}", carona.getId());
        log.debug("Total de pedidos de entrada na carona: {}", carona.getPedidosEntrada().size());
        
        // Obter todos os passageiros confirmados
        final List<PedidoDeEntrada> passageirosConfirmados = carona.getPedidosEntrada().stream()
                .filter(pedido -> {
                    log.debug("Pedido ID: {}, Status: {}", pedido.getId(), pedido.getStatus());
                    return pedido.getStatus() == Status.APROVADO;
                })
                .collect(Collectors.toList());
        
        log.info("Encontrados {} passageiros confirmados para notificar", passageirosConfirmados.size());
        
        if (passageirosConfirmados.isEmpty()) {
            log.info("Nenhum passageiro confirmado encontrado para carona ID: {}", carona.getId());
            return;
        }
        
        log.info("Enviando notificações de cancelamento para {} passageiros confirmados", passageirosConfirmados.size());
        
        // Enviar notificação para cada passageiro confirmado
        for (final PedidoDeEntrada pedido : passageirosConfirmados) {
            final Long passageiroId = pedido.getSolicitacao().getEstudante().getId();
            
            log.info("Enviando notificação de cancelamento para passageiro ID: {}", passageiroId);
            
            final RideCancellationMessageDTO cancellationMessage = RideCancellationMessageDTO.builder()
                    .pedidoId(pedido.getId())
                    .caronaId(carona.getId())
                    .cancelledByUserId(driverId)
                    .affectedUserId(passageiroId)
                    .cancellationType(RideCancellationMessageDTO.RideCancellationTypeEnum.DRIVER_CANCELLED)
                    .notificationType(NotificationType.RIDE_CANCELLED)
                    .message("A carona foi cancelada pelo motorista")
                    .build();
            
            try {
                mensagemProducer.enviarMensagemCancelamentoCarona(cancellationMessage);
                log.info("Notificação de cancelamento enviada com sucesso para passageiro ID: {}", passageiroId);
            } catch (Exception e) {
                log.error("Erro ao enviar notificação de cancelamento para passageiro ID: {}", passageiroId, e);
            }
        }
    }
}