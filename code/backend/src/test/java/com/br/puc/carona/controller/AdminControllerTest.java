package com.br.puc.carona.controller;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.time.LocalDateTime;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import com.br.puc.carona.constants.MensagensErro;
import com.br.puc.carona.dto.request.AdminCadastroRequest;
import com.br.puc.carona.dto.response.MessageResponse;
import com.br.puc.carona.exception.ErrorResponse;
import com.br.puc.carona.service.AdminService;
import com.fasterxml.jackson.databind.ObjectMapper;

@WebMvcTest(controllers = AdminController.class)
@AutoConfigureMockMvc(addFilters = false) // Disable security for testing
class AdminControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private AdminService adminService;

    private ObjectMapper objectMapper;
    private AdminCadastroRequest adminRequest;

    @BeforeEach
    void setup() {
        objectMapper = new ObjectMapper();

        // Configurando dados do administrador
        adminRequest = new AdminCadastroRequest();
        adminRequest.setNome("Admin Teste");
        adminRequest.setEmail("admin@email.com");
        adminRequest.setPassword("21232f297a57a5a743894a0e4a801fc3"); // MD5 para "admin"
    }

    @Test
    @DisplayName("Deve cadastrar administrador com sucesso")
    void shouldRegisterAdminSuccessfully() throws Exception {
        when(adminService.register(Mockito.any(AdminCadastroRequest.class)))
            .thenReturn(new MessageResponse(MensagensErro.ADMIN_CADASTRO_SUCESSO));

        mockMvc.perform(post("/admin/")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(adminRequest)))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.codigo").value(MensagensErro.ADMIN_CADASTRO_SUCESSO));

        Mockito.verify(adminService).register(Mockito.any(AdminCadastroRequest.class));
    }

    @Test
    @DisplayName("Deve retornar erro quando email já está cadastrado")
    void shouldReturnErrorWhenEmailAlreadyExists() throws Exception {
        when(adminService.register(Mockito.any(AdminCadastroRequest.class)))
            .thenReturn(new MessageResponse(MensagensErro.EMAIL_JA_CADASTRADO));

        mockMvc.perform(post("/admin/")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(adminRequest)))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.codigo").value(MensagensErro.EMAIL_JA_CADASTRADO));

        Mockito.verify(adminService).register(Mockito.any(AdminCadastroRequest.class));
    }

    @Test
    @DisplayName("Deve retornar erro quando formato da senha é inválido")
    void shouldReturnErrorWhenPasswordFormatIsInvalid() throws Exception {
        when(adminService.register(Mockito.any(AdminCadastroRequest.class)))
            .thenReturn(new MessageResponse(MensagensErro.FORMATO_SENHA_INVALIDO));

        mockMvc.perform(post("/admin/")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(adminRequest)))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.codigo").value(MensagensErro.FORMATO_SENHA_INVALIDO));

        Mockito.verify(adminService).register(Mockito.any(AdminCadastroRequest.class));
    }

    @Test
    @DisplayName("Deve retornar erro com dados inválidos")
    void shouldReturnErrorWithInvalidData() throws Exception {
        // Criando um objeto inválido para teste
        AdminCadastroRequest invalidRequest = new AdminCadastroRequest();
        invalidRequest.setNome("Admin Test");
        invalidRequest.setPassword("21232f297a57a5a743894a0e4a801fc3");

        mockMvc.perform(post("/admin/")
            .contentType(MediaType.APPLICATION_JSON)
            .content(objectMapper.writeValueAsString(invalidRequest)))
            .andExpect(status().isBadRequest())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON))
            .andExpect(jsonPath("$.statusCode").value(HttpStatus.BAD_REQUEST.value()))
            .andExpect(jsonPath("$.codigo").value(MensagensErro.PARAMETRO_INVALIDO))
            .andExpect(jsonPath("$.descricao").value("{comum.atributos.email.obrigatorio}"))
            .andExpect(jsonPath("$.timestamp").isNotEmpty());

        // O serviço não deve ser chamado com dados inválidos
        Mockito.verifyNoInteractions(adminService);
    }
}
