package com.br.puc.carona.controller;

import com.br.puc.carona.dto.request.LoginRequest;
import com.br.puc.carona.dto.response.LoginResponseDTO;
import com.br.puc.carona.dto.response.TokenValidationResponse;
import com.br.puc.carona.infra.security.TokenService;
import com.br.puc.carona.model.Usuario;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Autorização", description = "Gerenciamento de login e autorizações do sistema de caronas")
public class AuthenticationController {

    private final AuthenticationManager authenticationManager;
    private final TokenService tokenService;

    @Operation(summary = "Realiza login de usuário", description = "Realiza login e retorna token JWT")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Login realizado com sucesso"),
            @ApiResponse(responseCode = "403", description = "Login ou senha invalidos"),
            @ApiResponse(responseCode = "500", description = "Erro interno de autenticação")
    })
    @PostMapping("/login")
    public ResponseEntity<LoginResponseDTO> login(@RequestBody @Valid LoginRequest loginRequest){
        var usernamePassword = new UsernamePasswordAuthenticationToken(loginRequest.getEmail(), loginRequest.getPassword());
        var auth = this.authenticationManager.authenticate(usernamePassword);

        var token = tokenService.generateToken((Usuario) auth.getPrincipal());

        return ResponseEntity.ok(new LoginResponseDTO(token));
    }

    @Operation(summary = "Valida token JWT", description = "Verifica se o token JWT fornecido é válido")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Token válido"),
            @ApiResponse(responseCode = "401", description = "Token inválido ou expirado")
    })
    @GetMapping("/validate")
    public ResponseEntity<TokenValidationResponse> validateToken(@AuthenticationPrincipal Usuario usuario) {
        // Se o método for acessado com sucesso, o token é válido
        // O Spring Security já faz a validação do token antes de chegar aqui
        log.info("Token validado com sucesso para o usuário: {}", usuario.getEmail());
        return ResponseEntity.ok(new TokenValidationResponse(true, usuario.getEmail(), usuario.getId(), usuario.getNome(), usuario.getImgUrl()));
    }
}
