package com.br.puc.carona.controller;

import com.br.puc.carona.dto.request.LoginRequest;
import com.br.puc.carona.service.AuthorizationService;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
@Tag(name = "Autorização", description = "Gerenciamento de login e autorizações do sistema de caronas")

public class AuthenticationController {
    private final AuthorizationService authService;

    @PostMapping("/login")
    public ResponseEntity<> login(@RequestBody @Valid LoginRequest loginRequest){

    }
}
