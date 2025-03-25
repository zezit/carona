package com.br.puc.carona.controller;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.time.LocalDate;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import com.br.puc.carona.constants.MensagensErro;
import com.br.puc.carona.dto.request.CadastroEstudanteRequest;
import com.br.puc.carona.dto.request.CarroRequest;
import com.br.puc.carona.dto.response.MessageResponse;
import com.br.puc.carona.enums.TipoEstudante;
import com.br.puc.carona.service.EstudanteService;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;

@WebMvcTest(controllers = EstudanteController.class)
@AutoConfigureMockMvc(addFilters = false) // Disable security for testing
class EstudanteControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private EstudanteService estudanteService;

    private ObjectMapper objectMapper;
    private CadastroEstudanteRequest estudanteRequest;
    private CadastroEstudanteRequest motoristaRequest;

    @BeforeEach
    void setup() {
        objectMapper = new ObjectMapper();
        objectMapper.registerModule(new JavaTimeModule());

        // Configurando dados do estudante passageiro
        estudanteRequest = new CadastroEstudanteRequest();
        estudanteRequest.setNome("João Silva");
        estudanteRequest.setEmail("joao@email.com");
        estudanteRequest.setPassword("5d41402abc4b2a76b9719d911017c592");
        estudanteRequest.setDataDeNascimento(LocalDate.of(2000, 1, 1));
        estudanteRequest.setMatricula("2023001");
        estudanteRequest.setTipoEstudante(TipoEstudante.PASSAGEIRO);

        // Configurando dados do estudante motorista
        motoristaRequest = new CadastroEstudanteRequest();
        motoristaRequest.setNome("Maria Oliveira");
        motoristaRequest.setEmail("maria@email.com");
        motoristaRequest.setPassword("5d41402abc4b2a76b9719d911017c592");
        motoristaRequest.setDataDeNascimento(LocalDate.of(1998, 5, 15));
        motoristaRequest.setMatricula("2023002");
        motoristaRequest.setTipoEstudante(TipoEstudante.AMBOS);
        motoristaRequest.setCnh("12345678901");
        motoristaRequest.setWhatsapp("11987654321");
        motoristaRequest.setMostrarWhatsapp(true);

        CarroRequest carroRequest = new CarroRequest();
        carroRequest.setModelo("Fiat Uno");
        carroRequest.setPlaca("ABC1234");
        carroRequest.setCor("Branco");
        carroRequest.setCapacidadePassageiros(4);
        motoristaRequest.setVeiculo(carroRequest);
    }

    @Test
    @DisplayName("Deve cadastrar estudante com sucesso")
    void shouldRegisterEstudanteSuccessfully() throws Exception {
        when(estudanteService.register(Mockito.any(CadastroEstudanteRequest.class)))
            .thenReturn(new MessageResponse(MensagensErro.CADASTRO_SUCESSO));

        mockMvc.perform(post("/estudante/")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(estudanteRequest)))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.codigo").value(MensagensErro.CADASTRO_SUCESSO));

        Mockito.verify(estudanteService).register(Mockito.any(CadastroEstudanteRequest.class));
    }

    @Test
    @DisplayName("Deve cadastrar motorista com sucesso")
    void shouldRegisterMotoristaSuccessfully() throws Exception {
        when(estudanteService.register(Mockito.any(CadastroEstudanteRequest.class)))
            .thenReturn(new MessageResponse(MensagensErro.CADASTRO_SUCESSO));

        mockMvc.perform(post("/estudante/")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(motoristaRequest)))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.codigo").value(MensagensErro.CADASTRO_SUCESSO));

        Mockito.verify(estudanteService).register(Mockito.any(CadastroEstudanteRequest.class));
    }

    @Test
    @DisplayName("Deve retornar erro quando email já está cadastrado")
    void shouldReturnErrorWhenEmailAlreadyExists() throws Exception {
        when(estudanteService.register(Mockito.any(CadastroEstudanteRequest.class)))
            .thenReturn(new MessageResponse(MensagensErro.EMAIL_JA_CADASTRADO));

        mockMvc.perform(post("/estudante/")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(estudanteRequest)))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.codigo").value(MensagensErro.EMAIL_JA_CADASTRADO));

        Mockito.verify(estudanteService).register(Mockito.any(CadastroEstudanteRequest.class));
    }

    @Test
    @DisplayName("Deve retornar erro com dados inválidos")
    void shouldReturnErrorWithInvalidData() throws Exception {
        // Criando um objeto inválido para teste
        CadastroEstudanteRequest invalidRequest = new CadastroEstudanteRequest();
        invalidRequest.setPassword("5d41402abc4b2a76b9719d911017c592");
        
        // Note: Aqui não estamos configurando mock porque a validação deve ocorrer antes de chamar o serviço

        mockMvc.perform(post("/estudante/")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(invalidRequest)))
                .andExpect(status().isBadRequest());

        // O serviço não deve ser chamado com dados inválidos
        Mockito.verifyNoInteractions(estudanteService);
    }
}
