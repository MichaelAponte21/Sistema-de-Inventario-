package EntornosProgramacion.SistemaInventario.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.DBRef;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Document(collection = "movimiento_inventario")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MovimientoInventario {

    @Id
    private String id;

    private TipoMovimiento tipo;

    private Integer cantidad;

    private LocalDateTime fecha;

    private String observacion;

    @DBRef
    private Producto producto;

    @DBRef
    private Usuario usuario;

    void prePersist() {
        if (fecha == null) {
            fecha = LocalDateTime.now();
        }
    }
}
