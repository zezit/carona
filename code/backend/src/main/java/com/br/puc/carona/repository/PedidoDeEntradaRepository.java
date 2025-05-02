package com.br.puc.carona.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.br.puc.carona.model.PedidoDeEntrada;

@Repository
public interface PedidoDeEntradaRepository extends JpaRepository<PedidoDeEntrada, Long> {}
