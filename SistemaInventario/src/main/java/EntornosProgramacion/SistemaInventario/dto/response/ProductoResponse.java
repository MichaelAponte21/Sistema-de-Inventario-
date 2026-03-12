package EntornosProgramacion.SistemaInventario.dto.response;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record ProductoResponse(
    Long id,
    String nombre,
    String descripcion,
    BigDecimal precio,
    Integer stock,
    Integer stockMinimo,
    Long categoriaId,
    String categoriaNombre,
    LocalDateTime fechaCreacion,
    LocalDateTime fechaActualizacion,
    Boolean stockBajo
) {
}
