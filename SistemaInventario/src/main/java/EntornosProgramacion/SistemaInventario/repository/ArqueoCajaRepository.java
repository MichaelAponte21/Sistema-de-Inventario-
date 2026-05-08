package EntornosProgramacion.SistemaInventario.repository;

import EntornosProgramacion.SistemaInventario.model.ArqueoCaja;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface ArqueoCajaRepository extends JpaRepository<ArqueoCaja, Long> {

    Optional<ArqueoCaja> findByUsuarioIdAndAbiertoTrue(Long usuarioId);

    List<ArqueoCaja> findAllByOrderByFechaAperturaDesc();
}
