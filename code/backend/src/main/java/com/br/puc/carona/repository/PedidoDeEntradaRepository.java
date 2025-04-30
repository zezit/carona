package com.br.puc.carona.repository;

import com.br.puc.carona.enums.Status;
import com.br.puc.carona.model.PedidoDeEntrada;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PedidoDeEntradaRepository extends JpaRepository<PedidoDeEntrada, Long> {

}
