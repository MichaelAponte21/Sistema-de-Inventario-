package EntornosProgramacion.SistemaInventario.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.DBRef;
import org.springframework.data.mongodb.core.mapping.Document;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Document(collection = "producto")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Producto {

    @Id
    private String id;

    private String nombre;

    private String descripcion;

    private BigDecimal precio;

    @Builder.Default
    private Integer stock = 0;

    @Builder.Default
    private Integer stockMinimo = 0;

    private LocalDateTime fechaCreacion;

    private LocalDateTime fechaActualizacion;

    @DBRef
    private Categoria categoria;

    @DBRef
    @Builder.Default
    private List<MovimientoInventario> movimientos = new ArrayList<>();

    void prePersist() {
        if (fechaCreacion == null) {
            fechaCreacion = LocalDateTime.now();
        }
        fechaActualizacion = LocalDateTime.now();
    }

    void preUpdate() {
        fechaActualizacion = LocalDateTime.now();
    }

    public boolean isStockBajo() {
        return stock <= stockMinimo;
    }
}
