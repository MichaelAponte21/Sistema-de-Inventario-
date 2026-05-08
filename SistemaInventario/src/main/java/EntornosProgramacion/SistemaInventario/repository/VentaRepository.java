package EntornosProgramacion.SistemaInventario.repository;

import EntornosProgramacion.SistemaInventario.model.Venta;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.time.OffsetDateTime;
import java.util.List;

public interface VentaRepository extends JpaRepository<Venta, Long> {

    List<Venta> findByArqueoId(Long arqueoId);

    List<Venta> findByFechaBetweenOrderByFechaDesc(OffsetDateTime desde, OffsetDateTime hasta);

    @Query("SELECT v FROM Venta v WHERE v.fecha BETWEEN :desde AND :hasta ORDER BY v.fecha DESC")
    List<Venta> findEnPeriodo(@Param("desde") OffsetDateTime desde, @Param("hasta") OffsetDateTime hasta);
}
