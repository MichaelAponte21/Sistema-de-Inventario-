package EntornosProgramacion.SistemaInventario.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "permiso")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Permiso {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, unique = true, length = 80)
    private NombrePermiso nombre;

    @Column(length = 200)
    private String descripcion;
}
