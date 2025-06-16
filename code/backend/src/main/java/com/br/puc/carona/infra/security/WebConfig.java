package com.br.puc.carona.infra.security;

import com.br.puc.carona.interceptors.UsuarioBanidoInterceptor;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Configuration;
import org.springframework.lang.NonNull;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.EnableWebMvc;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
@EnableWebMvc
@RequiredArgsConstructor
public class WebConfig implements WebMvcConfigurer {

    private final UsuarioBanidoInterceptor usuarioBanidoInterceptor;


    @Override
    public void addCorsMappings(@NonNull CorsRegistry registry) {
        registry.addMapping("/**");
    }


    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        registry.addInterceptor(usuarioBanidoInterceptor)
                .addPathPatterns("/api/**") // Aplica apenas nas suas APIs
                .excludePathPatterns("/api/auth/**"); // Exclui endpoints de autenticação
    }
}