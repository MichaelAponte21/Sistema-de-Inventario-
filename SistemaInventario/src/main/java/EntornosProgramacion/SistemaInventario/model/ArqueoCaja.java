package EntornosProgramacion.SistemaInventario.model;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "arqueo_caja")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class ArqueoCaja {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "fecha_apertura", columnDefinition = "timestamp with time zone DEFAULT CURRENT_TIMESTAMP")
    private OffsetDateTime fechaApertura;

    @Column(name = "fecha_cierre")
    private OffsetDateTime fechaCierre;

    @Column(name = "monto_inicial", nullable = false, precision = 12, scale = 2)
    @Builder.Default
    private BigDecimal montoInicial = BigDecimal.ZERO;

    @Column(name = "monto_ventas_efectivo", precision = 12, scale = 2)
    @Builder.Default
    private BigDecimal montoVentasEfectivo = BigDecimal.ZERO;

    @Column(name = "monto_final_esperado", precision = 12, scale = 2)
    @Builder.Default
    private BigDecimal montoFinalEsperado = BigDecimal.ZERO;

    @Column(name = "monto_final_real", precision = 12, scale = 2)
    private BigDecimal montoFinalReal;

    @Column(precision = 12, scale = 2)
    private BigDecimal diferencia;

    @Column(columnDefinition = "text")
    private String observaciones;

    @Column(nullable = false)
    @Builder.Default
    private Boolean abierto = true;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "usuario_id", nullable = false)
    private Usuario usuario;

    @OneToMany(mappedBy = "arqueo")
    @Builder.Default
    private List<Venta> ventas = new ArrayList<>();

    @PrePersist
    void prePersist() {
        if (fechaApertura == null) fechaApertura = OffsetDateTime.now();
    }
}
