package com.br.puc.carona.service;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.Set;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.context.ActiveProfiles;

import com.br.puc.carona.dto.response.CaronaDto;
import com.br.puc.carona.enums.StatusCarona;
import com.br.puc.carona.mapper.CaronaMapper;
import com.br.puc.carona.mapper.TrajetoMapper;
import com.br.puc.carona.messaging.MensagemProducer;
import com.br.puc.carona.messaging.contract.RideFinishedMessageDTO;
import com.br.puc.carona.model.Carona;
import com.br.puc.carona.model.Estudante;
import com.br.puc.carona.model.PerfilMotorista;
import com.br.puc.carona.repository.CaronaRepository;
import com.br.puc.carona.repository.PerfilMotoristaRepository;

@ExtendWith(MockitoExtension.class)
@ActiveProfiles("test")
@DisplayName("Teste Service: Carona - Finalização com Notificações")
class CaronaFinalizationTest {

    @Mock
    private CaronaRepository caronaRepository;

    @Mock
    private PerfilMotoristaRepository perfilMotoristaRepository;

    @Mock
    private CaronaMapper caronaMapper;

    @Mock
    private TrajetoMapper trajetoMapper;

    @Mock
    private CurrentUserService currentUserService;

    @Mock
    private MapService mapService;

    @Mock
    private WebsocketService webSocketService;

    @Mock
    private MensagemProducer mensagemProducer;

    @InjectMocks
    private CaronaService caronaService;

    @Test
    @DisplayName("Deve finalizar carona e notificar passageiros")
    void devefinalizarCaronaENotificarPassageiros() {
        // Arrange
        Long caronaId = 1L;
        Long driverId = 2L;
        Long passageiroId1 = 3L;
        Long passageiroId2 = 4L;

        // Create mock carona
        Carona carona = new Carona();
        carona.setId(caronaId);
        carona.setStatus(StatusCarona.EM_ANDAMENTO);
        carona.setDataHoraPartida(LocalDateTime.now().minusHours(1));

        // Create mock passengers
        Estudante passageiro1 = new Estudante();
        passageiro1.setId(passageiroId1);
        passageiro1.setNome("Passageiro 1");

        Estudante passageiro2 = new Estudante();
        passageiro2.setId(passageiroId2);
        passageiro2.setNome("Passageiro 2");

        carona.setPassageiros(Set.of(passageiro1, passageiro2));

        // Create mock driver
        Estudante driver = new Estudante();
        driver.setId(driverId);
        driver.setNome("Motorista");

        PerfilMotorista motorista = new PerfilMotorista();
        motorista.setEstudante(driver);
        carona.setMotorista(motorista);

        // Create mock updated carona DTO
        CaronaDto caronaDto = new CaronaDto();
        caronaDto.setId(caronaId);
        caronaDto.setStatus(StatusCarona.FINALIZADA);

        // Setup mocks
        when(caronaRepository.findById(caronaId)).thenReturn(Optional.of(carona));
        when(currentUserService.getCurrentEstudante()).thenReturn(driver);
        when(caronaMapper.toDto(any(Carona.class))).thenReturn(caronaDto);
        when(caronaRepository.save(any(Carona.class))).thenReturn(carona);

        // Act
        CaronaDto result = caronaService.finalizarCarona(caronaId);

        // Assert
        assertNotNull(result);
        assertEquals(StatusCarona.FINALIZADA, result.getStatus());

        // Verify notification messages were sent to both passengers
        ArgumentCaptor<RideFinishedMessageDTO> messageCaptor = ArgumentCaptor.forClass(RideFinishedMessageDTO.class);
        verify(mensagemProducer, times(2)).enviarMensagemCaronaFinalizada(messageCaptor.capture());

        var sentMessages = messageCaptor.getAllValues();
        assertEquals(2, sentMessages.size());

        // Verify first passenger notification
        RideFinishedMessageDTO message1 = sentMessages.get(0);
        assertEquals(caronaId, message1.getCaronaId());
        assertEquals(driverId, message1.getDriverId());
        assertEquals(passageiroId1, message1.getAffectedUserId());

        // Verify second passenger notification
        RideFinishedMessageDTO message2 = sentMessages.get(1);
        assertEquals(caronaId, message2.getCaronaId());
        assertEquals(driverId, message2.getDriverId());
        assertEquals(passageiroId2, message2.getAffectedUserId());

        // Verify WebSocket events were emitted
        verify(webSocketService, times(1)).emitirEventoCaronaAtualizada(caronaDto);
        verify(webSocketService, times(1)).emitirEventoCaronaFinalizada(carona);
    }
}
