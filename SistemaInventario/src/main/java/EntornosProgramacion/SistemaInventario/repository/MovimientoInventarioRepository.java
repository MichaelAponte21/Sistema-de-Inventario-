package EntornosProgramacion.SistemaInventario.repository;

import EntornosProgramacion.SistemaInventario.model.MovimientoInventario;
import java.time.LocalDateTime;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface MovimientoInventarioRepository extends JpaRepository<MovimientoInventario, Long> {
    List<MovimientoInventario> findByProductoId(Long productoId);

    List<MovimientoInventario> findByUsuarioId(Long usuarioId);

    List<MovimientoInventario> findByFechaBetween(LocalDateTime inicio, LocalDateTime fin);
}
