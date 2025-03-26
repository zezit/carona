package com.br.puc.carona.exception;

import java.time.LocalDateTime;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.MissingServletRequestParameterException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.context.request.WebRequest;

import com.br.puc.carona.constants.MensagensResposta;
import com.br.puc.carona.exception.custom.EntidadeNaoEncontrada;
import com.br.puc.carona.exception.custom.ErroDeCliente;

import io.swagger.v3.oas.annotations.Hidden;

@Hidden
@RestControllerAdvice
public class GlobalExceptionHandler {
        @ExceptionHandler(Exception.class)
        @ResponseStatus(HttpStatus.INTERNAL_SERVER_ERROR)
        public ResponseEntity<ErrorResponse> handleGlobalException(Exception ex, WebRequest request) {
                ErrorResponse errorResponse = new ErrorResponse(
                                HttpStatus.INTERNAL_SERVER_ERROR.value(),
                                LocalDateTime.now(),
                                request.getDescription(false),
                                MensagensResposta.ERRO_INTERNO);
                return new ResponseEntity<>(errorResponse, HttpStatus.INTERNAL_SERVER_ERROR);
        }

        @ExceptionHandler(IllegalArgumentException.class)
        @ResponseStatus(HttpStatus.BAD_REQUEST)
        public ResponseEntity<ErrorResponse> handleIllegalArgumentException(IllegalArgumentException ex,
                        WebRequest request) {
                ErrorResponse errorResponse = new ErrorResponse(
                                HttpStatus.BAD_REQUEST.value(),
                                LocalDateTime.now(),
                                ex.getLocalizedMessage() != null ? ex.getLocalizedMessage()
                                                : MensagensResposta.PARAMETRO_INVALIDO,
                                MensagensResposta.PARAMETRO_INVALIDO);
                return new ResponseEntity<>(errorResponse, HttpStatus.BAD_REQUEST);
        }

        @ExceptionHandler(ErroDeCliente.class)
        @ResponseStatus(HttpStatus.BAD_REQUEST)
        public ResponseEntity<ErrorResponse> handleErroDeCliente(ErroDeCliente ex, WebRequest request) {
                ErrorResponse errorResponse = new ErrorResponse(
                                HttpStatus.BAD_REQUEST.value(),
                                LocalDateTime.now(),
                                ex.getLocalizedMessage(),
                                MensagensResposta.REQUISICAO_INVALIDA);
                return new ResponseEntity<>(errorResponse, HttpStatus.BAD_REQUEST);
        }

        @ExceptionHandler(MethodArgumentNotValidException.class)
        @ResponseStatus(HttpStatus.BAD_REQUEST)
        public ResponseEntity<ErrorResponse> handleMethodArgumentNotValidException(MethodArgumentNotValidException ex,
                        WebRequest request) {
                ErrorResponse errorResponse = new ErrorResponse(
                                HttpStatus.BAD_REQUEST.value(),
                                LocalDateTime.now(),
                                ex.getBindingResult().getFieldError().getDefaultMessage(),
                                MensagensResposta.PARAMETRO_INVALIDO);
                return new ResponseEntity<>(errorResponse, HttpStatus.BAD_REQUEST);
        }

        @ExceptionHandler(MissingServletRequestParameterException.class)
        @ResponseStatus(HttpStatus.BAD_REQUEST)
        public ResponseEntity<ErrorResponse> handleMissingServletRequestParameter(
                        MissingServletRequestParameterException ex, WebRequest request) {
                ErrorResponse errorResponse = new ErrorResponse(
                                HttpStatus.BAD_REQUEST.value(),
                                LocalDateTime.now(),
                                ex.getParameterName(),
                                MensagensResposta.PARAMETRO_FALTANTE);
                return new ResponseEntity<>(errorResponse, HttpStatus.BAD_REQUEST);
        }

        @ExceptionHandler(EntidadeNaoEncontrada.class)
        @ResponseStatus(HttpStatus.NOT_FOUND)
        public ResponseEntity<ErrorResponse> handleEntidadeNaoEncontrada(EntidadeNaoEncontrada ex, WebRequest request) {
                ErrorResponse errorResponse = new ErrorResponse(
                                HttpStatus.NOT_FOUND.value(),
                                LocalDateTime.now(),
                                ex.getLocalizedMessage(),
                                MensagensResposta.ENTIDADE_NAO_ENCONTRADA);
                return new ResponseEntity<>(errorResponse, HttpStatus.NOT_FOUND);
        }
}
