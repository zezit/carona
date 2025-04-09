package com.br.puc.carona.controller;

import java.net.URI;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.br.puc.carona.dto.request.SignupEstudanteRequest;
import com.br.puc.carona.dto.request.SignupUsuarioRequest;
import com.br.puc.carona.dto.response.EstudanteDto;
import com.br.puc.carona.dto.response.UsuarioDto;
import com.br.puc.carona.service.UsuarioService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.multipart.MultipartFile;

@AllArgsConstructor
@RestController
@RequestMapping("/usuario")
@Slf4j
@Tag(name = "Usuarios", description = "Gerenciamento de usuários do sistema de caronas")
public class UsuarioController {

    private final UsuarioService usuarioService;

    @Operation(summary = "Registrar um novo usuário administrador", description = "Registra um novo usuário administrador no sistema")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "201", description = "Usuário registrado com sucesso", content = @Content),
            @ApiResponse(responseCode = "400", description = "Dados inválidos fornecidos", content = @Content),
            @ApiResponse(responseCode = "500", description = "Erro interno do servidor", content = @Content)
    })
    @PostMapping("/admin")
    public ResponseEntity<Void> registerAdmin(@Valid @RequestBody final SignupUsuarioRequest request) {
        log.info("Inicio requisicao registrar administrador com e-mail: {}", request.getEmail());
        
        final UsuarioDto registeredAdmin = usuarioService.registerAdmin(request);
        URI location = URI.create("/admin/" + (registeredAdmin.getId()));

        log.info("Fim requisicao registrar administrador com e-mail: {} id: {}", request.getEmail(),
                registeredAdmin.getId());

        return ResponseEntity.created(location).build();
    }

    @Operation(summary = "Registrar um novo usuário estudante", description = "Registra um novo usuário estudante no sistema")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "201", description = "Usuário registrado com sucesso", content = @Content),
            @ApiResponse(responseCode = "400", description = "Dados inválidos fornecidos", content = @Content),
            @ApiResponse(responseCode = "500", description = "Erro interno do servidor", content = @Content)
    })
    @PostMapping("/estudante")
    public ResponseEntity<Void> registerEstudante(@Valid @RequestBody final SignupEstudanteRequest request) {
        log.info("Inicio requisicao registrar estudante com e-mail: {} matricula: {}", request.getEmail(),
                request.getMatricula());

        final EstudanteDto registeredEstudante = usuarioService.registerEstudante(request);
        URI location = URI.create("/estudante/" + (registeredEstudante.getId()));

        log.info("Fim requisicao registrar estudante com e-mail: {} matricula: {} id: {}", request.getEmail(),
                request.getMatricula(), registeredEstudante.getId());

        return ResponseEntity.created(location).build();
    }

    @Operation(summary = "Atualizar imagem de perfil do usuário", description = "Atualiza o campo imgUrl do usuário com uma nova imagem")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Imagem atualizada com sucesso", content = @Content),
            @ApiResponse(responseCode = "400", description = "Requisição inválida", content = @Content),
            @ApiResponse(responseCode = "404", description = "Usuário não encontrado", content = @Content),
            @ApiResponse(responseCode = "500", description = "Erro interno no servidor", content = @Content)
    })
    @PatchMapping(value = "/{id}/imagem", consumes = "multipart/form-data")
    public ResponseEntity<Void> atualizarImagemUsuario(
            @PathVariable Long id,
            @RequestPart("file") MultipartFile file) {

        log.info("Iniciando atualização de imagem para o usuário com id: {}", id);

        usuarioService.atualizarImagemUsuario(id, file);

        log.info("Imagem atualizada com sucesso para o usuário com id: {}", id);
        return ResponseEntity.ok().build();
    }



}
