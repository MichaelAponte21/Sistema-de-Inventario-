package EntornosProgramacion.SistemaInventario.repository;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.mongodb.repository.MongoRepository;

import EntornosProgramacion.SistemaInventario.model.MovimientoInventario;

public interface MovimientoInventarioRepository extends MongoRepository<MovimientoInventario, String> {
    List<MovimientoInventario> findByProductoId(String productoId);

    List<MovimientoInventario> findByUsuarioId(String usuarioId);

    List<MovimientoInventario> findByFechaBetween(LocalDateTime inicio, LocalDateTime fin);
}
