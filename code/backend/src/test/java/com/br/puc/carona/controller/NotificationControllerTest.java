package com.br.puc.carona.controller;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.ArgumentMatchers.isNull;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.time.LocalDateTime;
import java.util.List;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import com.br.puc.carona.config.MockMvcSecurityConfig;
import com.br.puc.carona.dto.notification.NotificationDTO;
import com.br.puc.carona.enums.NotificationStatus;
import com.br.puc.carona.enums.NotificationType;
import com.br.puc.carona.exception.custom.ErroDePermissao;
import com.br.puc.carona.service.NotificationService;

@WebMvcTest(NotificationController.class)
@AutoConfigureMockMvc(addFilters = false) // Disable security for testing
@Import(MockMvcSecurityConfig.class)
@ActiveProfiles("test")
@DisplayName("Teste Controller: NotificationController")
class NotificationControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private NotificationService notificationService;

    @Test
    @DisplayName("Deve retornar quantidade de notificações não lidas com sucesso")
    void deveRetornarQuantidadeDeNotificacoesNaoLidasComSucesso() throws Exception {
        // Given
        Long userId = 1L;
        Integer unreadCount = 5;
        
        Mockito.when(notificationService.getUnreadCount(userId)).thenReturn(unreadCount);

        // When & Then
        mockMvc.perform(get("/notificacoes/unread-count")
                        .param("userId", userId.toString())
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(content().string("5"));

        Mockito.verify(notificationService).getUnreadCount(userId);
    }

    @Test
    @DisplayName("Deve retornar zero quando não há notificações não lidas")
    void deveRetornarZeroQuandoNaoHaNotificacoesNaoLidas() throws Exception {
        // Given
        Long userId = 1L;
        Integer unreadCount = 0;
        
        Mockito.when(notificationService.getUnreadCount(userId)).thenReturn(unreadCount);

        // When & Then
        mockMvc.perform(get("/notificacoes/unread-count")
                        .param("userId", userId.toString())
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(content().string("0"));

        Mockito.verify(notificationService).getUnreadCount(userId);
    }

    @Test
    @DisplayName("Deve retornar notificações do usuário com parâmetros padrão")
    void deveRetornarNotificacoesDoUsuarioComParametrosPadrao() throws Exception {
        // Given
        Long userId = 1L;
        NotificationDTO notification1 = NotificationDTO.builder()
                .id(1L)
                .recipientId(userId)
                .type(NotificationType.RIDE_MATCH_REQUEST)
                .status(NotificationStatus.PENDENTE)
                .payload("Você recebeu uma nova solicitação de carona")
                .createdAt(LocalDateTime.now().toString())
                .build();

        NotificationDTO notification2 = NotificationDTO.builder()
                .id(2L)
                .recipientId(userId)
                .type(NotificationType.RIDE_REQUEST_ACCEPTED)
                .status(NotificationStatus.ENVIADO)
                .payload("Sua carona foi confirmada")
                .createdAt(LocalDateTime.now().minusHours(1).toString())
                .build();

        List<NotificationDTO> notifications = List.of(notification1, notification2);
        Page<NotificationDTO> page = new PageImpl<>(
            notifications, 
            PageRequest.of(0, 20), 
            notifications.size()
        );
        
        Mockito.when(notificationService.getNotifications(eq(userId), eq(0), eq(20), isNull(), isNull()))
                .thenReturn(page);

        // When & Then
        mockMvc.perform(get("/notificacoes")
                        .param("userId", userId.toString())
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.content").isArray())
                .andExpect(jsonPath("$.content.length()").value(2))
                .andExpect(jsonPath("$.content[0].id").value(1))
                .andExpect(jsonPath("$.content[0].payload").value("Você recebeu uma nova solicitação de carona"))
                .andExpect(jsonPath("$.content[1].id").value(2))
                .andExpect(jsonPath("$.content[1].payload").value("Sua carona foi confirmada"));

        Mockito.verify(notificationService).getNotifications(userId, 0, 20, null, null);
    }

    @Test
    @DisplayName("Deve retornar notificações com parâmetros personalizados")
    void deveRetornarNotificacoesComParametrosPersonalizados() throws Exception {
        // Given
        Long userId = 1L;
        int page = 1;
        int size = 10;
        List<NotificationType> types = List.of(NotificationType.RIDE_MATCH_REQUEST);
        List<NotificationStatus> statuses = List.of(NotificationStatus.PENDENTE);

        Page<NotificationDTO> emptyPage = new PageImpl<>(
            List.of(), 
            PageRequest.of(page, size), 
            0
        );
        
        Mockito.when(notificationService.getNotifications(userId, page, size, types, statuses))
                .thenReturn(emptyPage);

        // When & Then
        mockMvc.perform(get("/notificacoes")
                        .param("userId", userId.toString())
                        .param("page", String.valueOf(page))
                        .param("size", String.valueOf(size))
                        .param("types", "RIDE_MATCH_REQUEST")
                        .param("statuses", "PENDENTE")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.content").isArray())
                .andExpect(jsonPath("$.content.length()").value(0));

        Mockito.verify(notificationService).getNotifications(userId, page, size, types, statuses);
    }

    @Test
    @DisplayName("Deve marcar notificação como lida com sucesso")
    void deveMarcarcNotificacaoComoLidaComSucesso() throws Exception {
        // Given
        Long notificationId = 1L;
        Long userId = 1L;

        Mockito.doNothing().when(notificationService).markAsRead(notificationId, userId);

        // When & Then
        mockMvc.perform(put("/notificacoes/{id}/read", notificationId)
                        .param("userId", userId.toString())
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk());

        Mockito.verify(notificationService).markAsRead(notificationId, userId);
    }

    @Test
    @DisplayName("Deve repassar exceção quando notificação não existe")
    void deveRepassarExcecaoQuandoNotificacaoNaoExiste() throws Exception {
        // Given
        Long notificationId = 999L;
        Long userId = 1L;

        Mockito.doThrow(new IllegalArgumentException("Notificação não encontrada"))
                .when(notificationService).markAsRead(notificationId, userId);

        // When & Then
        mockMvc.perform(put("/notificacoes/{id}/read", notificationId)
                        .param("userId", userId.toString())
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isBadRequest());

        Mockito.verify(notificationService).markAsRead(notificationId, userId);
    }

    @Test
    @DisplayName("Deve repassar exceção quando usuário não tem permissão")
    void deveRepassarExcecaoQuandoUsuarioNaoTemPermissao() throws Exception {
        // Given
        Long notificationId = 1L;
        Long userId = 999L;

        Mockito.doThrow(new ErroDePermissao("Usuário não tem permissão"))
                .when(notificationService).markAsRead(notificationId, userId);

        // When & Then
        mockMvc.perform(put("/notificacoes/{id}/read", notificationId)
                        .param("userId", userId.toString())
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isForbidden());

        Mockito.verify(notificationService).markAsRead(notificationId, userId);
    }

    @Test
    @DisplayName("Deve retornar bad request quando userId não é fornecido para unread-count")
    void deveRetornarBadRequestQuandoUserIdNaoEhFornecidoParaUnreadCount() throws Exception {
        // When & Then
        mockMvc.perform(get("/notificacoes/unread-count")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isBadRequest());

        Mockito.verify(notificationService, Mockito.never()).getUnreadCount(anyLong());
    }

    @Test
    @DisplayName("Deve retornar bad request quando userId não é fornecido para listar notificações")
    void deveRetornarBadRequestQuandoUserIdNaoEhFornecidoParaListarNotificacoes() throws Exception {
        // When & Then
        mockMvc.perform(get("/notificacoes")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isBadRequest());

        Mockito.verify(notificationService, Mockito.never()).getNotifications(anyLong(), anyInt(), anyInt(), any(), any());
    }

    @Test
    @DisplayName("Deve retornar bad request quando userId não é fornecido para marcar como lida")
    void deveRetornarBadRequestQuandoUserIdNaoEhFornecidoParaMarcarComoLida() throws Exception {
        // Given
        Long notificationId = 1L;

        // When & Then
        mockMvc.perform(put("/notificacoes/{id}/read", notificationId)
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isBadRequest());

        Mockito.verify(notificationService, Mockito.never()).markAsRead(anyLong(), anyLong());
    }
}
